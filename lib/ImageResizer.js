"use strict";

const ImageData = require("./ImageData");
const gm = require("gm").subClass({ imageMagick: true, binPath: "/opt/bin" })

const cropSpec = /(\d+)x(\d+)([+-]\d+)?([+-]\d+)?(%)?/;

/**
 * Get enable to use memory size in ImageMagick
 * Typically we determine to us 90% of max memory size
 * @see https://docs.aws.amazon.com/lambda/latest/dg/lambda-environment-variables.html
 */
const getEnableMemory = () => {
    const mem = parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE, 10);
    return Math.floor(mem * 90 / 100);
};

class ImageResizer {

    /**
     * Image Resizer
     * resize image with ImageMagick
     *
     * @constructor
     * @param Object options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Execute resize
     *
     * @public
     * @param ImageData image
     * @return Promise
     */
    exec(image) {
        const acl = this.options.acl;

        return new Promise((resolve, reject) => {
            console.log("Resizing to: " + (this.options.directory || "in-place"));

            let img = gm(image.data)
                .limit("memory", `${getEnableMemory()}MB`)
                .geometry(this.options.size.toString());
            if ( "orientation" in this.options ) {
                img = img.autoOrient();
            }
            if ( "gravity" in this.options ) {
                img = img.gravity(this.options.gravity);
            }
            if ( "background" in this.options ) {
              img = img.background(this.options.background).flatten();
            }
            if ( "crop" in this.options ) {
                const cropArgs = this.options.crop.match(cropSpec);
                const cropWidth = cropArgs[1];
                const cropHeight = cropArgs[2];
                const cropX = cropArgs[3];
                const cropY = cropArgs[4];
                const cropPercent = cropArgs[5];
                img = img.crop(cropWidth, cropHeight, cropX, cropY, cropPercent === "%");
            }
            if( "format" in this.options ) {
                img = img.setFormat(this.options.format);
            }

            img.toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new ImageData(
                        image.fileName,
                        image.bucketName,
                        buffer,
                        image.headers,
                        acl || image.acl
                    ));
                }
            });
        });
    }
}

module.exports = ImageResizer;
