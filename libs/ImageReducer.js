var ImageData      = require("./ImageData");
var Mozjpeg        = require("./optimizers/Mozjpeg");
var Pngquant       = require("./optimizers/Pngquant");
var Pngout         = require("./optimizers/Pngout");
var ReadableStream = require("./ReadableImageStream");
var WritableStream = require("./WritableImageStream");

var Promise = require("es6-promise").Promise;

/**
 * Image Reducer
 * Accept png/jpeg typed image
 *
 * @constructor
 * @param Object option
 */
function ImageReducer(option) {
    this.option = option || {};
}

/**
 * Execute process
 *
 * @public
 * @param ImageData image
 * @return Promise
 */
ImageReducer.prototype.exec = function ImageReducer_exec(image) {
    switch ( image.getType() ) {
        case "png":
            return this.reducePngImage(image);
        case "jpg":
        case "jpeg":
            return this.reduceJpegImage(image);
        default:
            throw new Error("Unexcepted file type.");
    }
};

/**
 * Reduce image for PNG
 *
 * @protected
 * @param ImageData image
 * @return Promise
 */
ImageReducer.prototype.reducePngImage = function ImageReducer_reducePngImage(image) {
    var option = this.option;

    return new Promise(function(resolve, reject) {
        var pngquant = new Pngquant();
        var pngout   = new Pngout();

        this.streamPipeProcess(
            image.getData(),
            pngquant.spawnProcess(),
            pngout.spawnProcess()
        )
        .then(function(buffer) {
            var dir = option.directory || image.getDirName();

            if ( dir ) {
                dir = dir.replace(/\/$/, "") + "/";
            }

            resolve(new ImageData(
                dir + image.getBaseName(),
                option.bucket || image.bucketName,
                buffer
            ));
        })
        .catch(function(message) {
            reject(message);
        });
    }.bind(this));
};

/**
 * Reduce image for JPEG
 *
 * @protected
 * @param ImageData image
 * @return Promise
 */
ImageReducer.prototype.reduceJpegImage = function ImageReducer_reduceJpegImage(image) {
    var option = this.option;

    return new Promise(function(resolve, reject) {
        var mozJpeg = new Mozjpeg();

        this.streamPipeProcess(
            image.getData(),
            mozJpeg.spawnProcess()
        )
        .then(function(buffer) {
            var dir = option.directory || image.getDirName();

            if ( dir ) {
                dir = dir.replace(/\/$/, "") + "/";
            }

            resolve(new ImageData(
                dir + image.getBaseName(),
                option.bucket || image.bucketName,
                buffer
            ));
        })
        .catch(function(message) {
            reject(message);
        });

    }.bind(this));
};

/**
 * Pipe streams and call calback
 *
 * @private
 * @param Buffer buffer
 * @param ChildProcess first
 * @param ChildProcess|undefined second
 * @return Promise
 */
ImageReducer.prototype.streamPipeProcess = function ImageReducer_streamPipeProcess(buffer, first, second) {
    return new Promise(function(resolve, reject) {
        var input  = new ReadableStream(buffer);
        var output = new WritableStream();
        input.pause();

        input.pipe(first.stdin);
        if ( second ) {
            first.stdout.pipe(second.stdin);
            second.stdout.pipe(output);
        } else {
            first.stdout.pipe(output);
        }

        output.on("finish", function() {
            resolve(output.getBufferStack());
        });

        input.on("error",  reject);
        output.on("error", reject);
        first.stdout.on("error", reject);
        first.stderr.on("error", reject);
        if ( second ) {
            second.stdout.on("error", reject);
            second.stderr.on("error", reject);
        }

        input.resume();
    });
};

module.exports = ImageReducer;
