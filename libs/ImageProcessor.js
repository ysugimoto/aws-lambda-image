"use strict";

const ImageData    = require("./ImageData");
const ImageResizer = require("./ImageResizer");
const ImageReducer = require("./ImageReducer");
const S3           = require("./S3");

class ImageProcessor {

    /**
     * Image processor
     * management resize/reduce image list by configration,
     * and pipe AWS Lambda's event/context
     *
     * @constructor
     * @param Object s3Object
     */
    constructor(s3Object) {
        this.s3Object = s3Object;
    }

    /**
     * Run the process
     *
     * @public
     * @param Config config
     */
    run(config) {
        if ( ! config.get("bucket") ) {
            config.set("bucket", this.s3Object.bucket.name);
        }

        return S3.getObject(
            this.s3Object.bucket.name,
            decodeURIComponent(this.s3Object.object.key.replace(/\+/g, ' '))
        )
        .then((imageData) => this.processImage(imageData, config));
    }

    /**
     * Processing image
     *
     * @public
     * @param ImageData imageData
     * @param Config config
     * @return Promise
     */
    processImage(imageData, config) {
        const jpegOptimizer = config.get("jpegOptimizer", "mozjpeg");
        let promise = new Promise((resolve) => { resolve() });
        let processedImages = 0;

        if ( config.exists("backup") ) {
            const backup = config.get("backup");

            if ( ! backup.bucket ) {
                backup.bucket = config.get("bucket");
            }
            promise = promise.then(() => this.execBackupImage(backup, imageData).then(S3.putObject));
            processedImages++;
        }

        if ( config.exists("reduce") ) {
            const reduce = config.get("reduce");

            if ( ! reduce.bucket ) {
                reduce.bucket = config.get("bucket");
            }
            reduce.jpegOptimizer = reduce.jpegOptimizer || jpegOptimizer;
            promise = promise.then(() => this.execReduceImage(reduce, imageData).then(S3.putObject));
            processedImages++;
        }

        config.get("resizes", []).filter((option) => {
            return option.size &&
                imageData.fileName.indexOf(option.directory) !== 0 // don't process images in the output folder
        }).forEach((option) => {
            if ( ! option.bucket ) {
                option.bucket = config.get("bucket");
            }
            if ( ! option.acl ){
                option.acl = config.get("acl");
            }
            option.jpegOptimizer = option.jpegOptimizer || jpegOptimizer;
            promise = promise.then(() => this.execResizeImage(option, imageData).then(S3.putObject));
            processedImages++;
        });

        return promise.then(() => new Promise((resolve) => resolve(processedImages)));
    }

    /**
     * Execute resize image
     *
     * @public
     * @param Object option
     * @param imageData imageData
     * @return Promise
     */
    execResizeImage(option, imageData) {
        const resizer = new ImageResizer(option);

        return resizer.exec(imageData)
        .then((resizedImage) => {
            const reducer = new ImageReducer(option);

            return reducer.exec(resizedImage);
        });
    }

    /**
     * Execute reduce image
     *
     * @public
     * @param Object option
     * @param ImageData imageData
     * @return Promise
     */
    execReduceImage(option, imageData) {
        const reducer = new ImageReducer(option);

        return reducer.exec(imageData);
    }

    execBackupImage(option, image) {
        return new Promise((resolve, reject) => {
            console.log("Backing up to: " + (option.directory || "in-place"));

            resolve(
                new ImageData(
                    image.combineWithDirectory(option.directory),
                    option.bucket || image.bucketName,
                    image.data,
                    image.headers,
                    image.acl
                )
            );
        });
    }
}

module.exports = ImageProcessor;
