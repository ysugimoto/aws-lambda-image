"use strict";

const ImageData = require("./ImageData");

class ImageArchiver {

    /**
     * Image Archiver
     * Accept file types
     *
     * @constructor
     * @param Object option
     */
    constructor(option) {
        this.option = option || {};
    }

    /**
     * Execute process
     *
     * @public
     * @param ImageData image
     * @return Promise
     */
    exec(image) {
        const option = this.option;

        return new Promise((resolve, reject) => {
            console.log("Backing up to: " + (option.directory || "in-place"));

            resolve(
                new ImageData(
                    image.combineWithDirectory({
                        directory:     option.directory,
                        template:      option.template,
                        prefix:        option.prefix,
                        suffix:        option.suffix,
                        keepExtension: option.keepExtension
                    }),
                    option.bucket || image.bucketName,
                    image.data,
                    image.headers,
                    option.acl || image.acl
                )
            );
        });
    }
}

module.exports = ImageArchiver;
