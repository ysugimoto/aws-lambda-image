var ImageData   = require("./ImageData");

var Promise     = require("es6-promise").Promise;
var ImageMagick = require("imagemagick");

/**
 * Image Resizer
 * resize image with ImageMagick
 *
 * @constructor
 * @param Number width
 */
function ImageResizer(width) {
    this.width = width;
}

/**
 * Execute resize
 *
 * @public
 * @param ImageData image
 * @return Promise
 */
ImageResizer.prototype.exec = function ImageResizer_exec(image) {
    var params = {
        srcData:   image.getData().toString("binary"),
        srcFormat: image.getType(),
        format:    image.getType(),
        width:     this.width
    };

    return new Promise(function(resolve, reject) {
        ImageMagick.resize(params, function(err, stdout, stderr) {
            if ( err || stderr ) {
                reject("ImageMagick err" + (err || stderr));
            } else {
                resolve(new ImageData(
                    image.fileName,
                    image.bucketName,
                    stdout
                ));
            }
        });
    });
};

module.exports = ImageResizer;
