"use strict";

const ImageData   = require("./ImageData");
const gm = require("gm").subClass({ imageMagick: true });

const cropSpec = /(\d+)x(\d+)([+-]\d+)?([+-]\d+)?(%)?/;

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

            var img = gm(image.data).geometry(this.options.size.toString());
            if ( "orientation" in this.options ) {
                img = img.autoOrient();
            }
            if ( "gravity" in this.options ) {
                img = img.gravity(this.options.gravity);
            }
            if ( "background" in this.options ) {
              img = img.background(this.options.background).flatten();
            }
            if ( "quality" in this.options ) {
              img = img.quality(this.options.quality);
            }
            if ( "crop" in this.options ) {
                var cropArgs = this.options.crop.match(cropSpec);
                const cropWidth = cropArgs[1];
                const cropHeight = cropArgs[2];
                const cropX = cropArgs[3];
                const cropY = cropArgs[4];
                const cropPercent = cropArgs[5];
                img = img.crop(cropWidth, cropHeight, cropX, cropY, cropPercent === "%");
            }

            img.toBuffer(this.detectFormat(image), (err, buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(new ImageData(
                    image.fileName,
                    image.bucketName,
                    buffer,
                    image.headers,
                    acl
                ));
            });
        });
    }

    /**
     * Format detection
     *
     * @protected
     * @param ImageData image
     * @return string
     * @throws Error
     */
    detectFormat(image) {
        // Does options exists?
        if ( "format" in this.options ) {
            return this.options.format.toUpperCase();
        }

        // Detect from MimeType
        switch (image.type.mime) {
          case "image/gif":  return "GIF";
          case "image/jpeg": return "JPG";
          case "image/png":  return "PNG";
          default:
            throw new Error("Unexpected MimeType: " + image.type.mime);
        }
    }
}

module.exports = ImageResizer;
