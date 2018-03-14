"use strict";

const ImageArchiver = require("./ImageArchiver");
const ImageResizer  = require("./ImageResizer");
const ImageReducer  = require("./ImageReducer");

class ImageProcessor {

    /**
     * Image processor
     * management resize/reduce image list by configration,
     * and pipe AWS Lambda's event/context
     *
     * @constructor
     * @param Object fileSystem
     * @param Object s3Object
     */
    constructor(fileSystem, s3Object) {
        this.fileSystem = fileSystem;
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

        return this.fileSystem.getObject(
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
        const acl = config.get("acl");
        const cacheControl = config.get("cacheControl");
        const bucket = config.get("bucket");
        const jpegOptimizer = config.get("jpegOptimizer", "mozjpeg");
        const optimizerOptions = config.get("optimizers", {});

        let promise = Promise.resolve();
        let processedImages = 0;

        if ( config.exists("backup") ) {
            const backup = config.get("backup");

            backup.acl           = backup.acl || acl;
            backup.cacheControl  = ( backup.cacheControl !== undefined ) ? backup.cacheControl : cacheControl;
            backup.bucket        = backup.bucket || bucket;
            backup.keepExtension = backup.keepExtension || config.get("keepExtension") || false;

            promise = promise
              .then(() => this.execBackupImage(backup, imageData))
              .then((image) => this.fileSystem.putObject(image, backup))
              .then(() => ( backup.move === true ) ? this.fileSystem.deleteObject(imageData) : Promise.resolve())
              .then(() => Promise.resolve(++processedImages));
        }

        if ( config.exists("reduce") ) {
            const reduce = config.get("reduce");

            reduce.acl              = reduce.acl || acl;
            reduce.cacheControl     = ( reduce.cacheControl !== undefined ) ? reduce.cacheControl : cacheControl;
            reduce.bucket           = reduce.bucket || bucket;
            reduce.jpegOptimizer    = reduce.jpegOptimizer || jpegOptimizer;
            reduce.optimizerOptions = optimizerOptions;
            reduce.keepExtension    = reduce.keepExtension || config.get("keepExtension") || false;

            promise = promise
              .then(() => this.execReduceImage(reduce, imageData))
              .then((image) => this.fileSystem.putObject(image, reduce))
              .then(() => Promise.resolve(++processedImages));
        }

        config.get("resizes", []).filter((resize) => {
            return resize.size &&
                imageData.fileName.indexOf(resize.directory) !== 0; // don't process images in the output folder
        }).forEach((resize) => {
            resize.acl              = resize.acl || acl;
            resize.cacheControl     = ( resize.cacheControl !== undefined ) ? resize.cacheControl : cacheControl;
            resize.bucket           = resize.bucket || bucket;
            resize.jpegOptimizer    = resize.jpegOptimizer || jpegOptimizer;
            resize.optimizerOptions = optimizerOptions;
            resize.keepExtension    = resize.keepExtension || config.get("keepExtension") || false;

            promise = promise
              .then(() => this.execResizeImage(resize, imageData))
              .then((image) => this.fileSystem.putObject(image, resize))
              .then(() => Promise.resolve(++processedImages));
        });

        return promise;
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

    /**
     * Execute image backup
     *
     * @public
     * @param Object option
     * @param ImageData imageData
     * @return Promise
     */
    execBackupImage(option, imageData) {
        const archiver = new ImageArchiver(option);

        return archiver.exec(imageData);
    }
}

module.exports = ImageProcessor;
