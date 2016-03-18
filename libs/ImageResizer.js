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
function ImageResizer(options) {
    this.options = options;
}

/**
 * Execute resize
 *
 * @public
 * @param ImageData image
 * @return Promise
 */
ImageResizer.prototype.exec = function ImageResizer_exec(image) {
    var imagetype = image.getType();
    var params = {
        srcData:   image.getData().toString("binary"),
        srcFormat: imagetype,
        format:    imagetype
    };

    if(this.options.size){
        params['width'] = this.options.size;
    }
    else {
        if(this.options.width){
            params['width'] = this.options.width;
        }
        if(this.options.height){
            params['height'] = this.options.height;
        }
    }

    return new Promise(function(resolve, reject) {
        ImageMagick.resize(params, function(err, stdout, stderr) {
            if ( err || stderr ) {
                reject("ImageMagick err" + (err || stderr));
            } else {
                resolve(new ImageData(
                    image.fileName,
                    image.bucketName,
                    stdout,
                    image.getHeaders()
                ));
            }
        });
    });
};

module.exports = ImageResizer;
