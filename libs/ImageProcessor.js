"use strict";

import ImageResizer from "./ImageResizer";
import ImageReducer from "./ImageReducer";
import {getObject, putObjects} from "./S3";

export default class ImageProcessor {

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
        return new Promise((resolve, reject) => {
            // If object.size equals 0, stop process
            if ( this.s3Object.object.size === 0 ) {
                reject("Object size equal zero. Nothing to process.");
                reject();
            }

            if ( ! config.get("bucket") ) {
                config.set("bucket", this.s3Object.bucket.name);
            }

            getObject(
                this.s3Object.bucket.name,
                unescape(this.s3Object.object.key.replace(/\+/g, ' '))
            )
            .then((imageData) => {
                this.processImage(imageData, config)
                .then((results) => {
                    putObjects(results)
                    .then((images) => resolve(images))
                    .catch((messages) => reject(messages));
                })
                .catch((messages) => reject(messages));
            })
            .catch((error) => reject(error));
        });
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
        const promiseList   = config.get("resizes", []).filter((option) => {
            return ( option.size   && option.size   > 0 ) ||
                   ( option.width  && option.width  > 0 ) ||
                   ( option.height && option.height > 0 );
        }).map((option) => {
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
        return new Promise((resolve, reject) => {
            const resizer = new ImageResizer(option);

            resizer.exec(imageData)
            .then((resizedImage) => {
                const reducer = new ImageReducer(option);

                return reducer.exec(resizedImage);
            })
            .then((reducedImage) => resolve(reducedImage))
            .catch((message) => reject(message));
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
        return new Promise((resolve, reject) => {
            const reducer = new ImageReducer(option);

            reducer.exec(imageData)
            .then((reducedImage) => resolve(reducedImage))
            .catch((message) => reject(message));
        });
    }
}
