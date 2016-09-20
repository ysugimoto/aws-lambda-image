"use strict";

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
        // If object.size equals 0, stop process
        if ( this.s3Object.object.size === 0 ) {
            return Promise.reject("Object size equal zero. Nothing to process.");
        }

        if ( ! config.get("bucket") ) {
            config.set("bucket", this.s3Object.bucket.name);
        }

        return S3.getObject(
            this.s3Object.bucket.name,
            unescape(this.s3Object.object.key.replace(/\+/g, ' '))
        )
        .then((imageData) => this.processImage(imageData, config))
        .then(S3.putObjects);
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
        const promiseList   = config.get("resizes", []).filter((option) => option.size).map((option) => {
            if ( ! option.bucket ) {
                option.bucket = config.get("bucket");
            }
            if ( ! option.acl ){
                option.acl = config.get("acl");
            }
            option.jpegOptimizer = option.jpegOptimizer || jpegOptimizer;
            return this.execResizeImage(option, imageData);
        });

        if ( config.exists("reduce") ) {
            const reduce = config.get("reduce");

            if ( ! reduce.bucket ) {
                reduce.bucket = config.get("bucket");
            }
            reduce.jpegOptimizer = reduce.jpegOptimizer || jpegOptimizer;
            promiseList.unshift(this.execReduceImage(reduce, imageData));
        }

        return Promise.all(promiseList);
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

        return reducer.exec(imageData)
    }
}

module.exports = ImageProcessor;
