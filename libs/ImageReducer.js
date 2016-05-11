var ImageData      = require("./ImageData");
var Mozjpeg        = require("./optimizers/Mozjpeg");
var Pngquant       = require("./optimizers/Pngquant");
var Pngout         = require("./optimizers/Pngout");
var JpegOptim      = require("./optimizers/JpegOptim");
var ReadableStream = require("./ReadableImageStream");
var StreamChain    = require("./StreamChain");

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
    var option = this.option;

    return new Promise(function(resolve, reject) {
        var input   = new ReadableStream(image.getData());
        var streams = this.createReduceStreams(image.getType());
        var chain   = new StreamChain(input);
        var acl = image.getACL();

        chain.pipes(streams).run()
        .then(function(buffer) {
            var dir = option.directory || image.getDirName();

            if ( dir ) {
                dir = dir.replace(/\/$/, "") + "/";
            }

            resolve(new ImageData(
                dir + image.getBaseName(),
                option.bucket || image.bucketName,
                buffer,
                image.getHeaders(),
                acl
            ));
        })
        .catch(function(message) {
            reject(message);
        });
    }.bind(this));
};

/**
 * Create reduce image streams
 *
 * @protected
 * @param String type
 * @return Array<ChildProcess>
 * @thorws Error
 */
ImageReducer.prototype.createReduceStreams = function ImageReducer_createReduceStreams(type) {
    var streams = [];

    switch ( type ) {
        case "png":
            streams.push((new Pngquant()).spawnProcess());
            streams.push((new Pngout()).spawnProcess());
            break;
        case "jpg":
        case "jpeg":
            // switch JPEG optimizer
            if ( this.option.jpegOptimizer === "jpegoptim" ) { // using jpegoptim
                streams.push((new JpegOptim()).spawnProcess());
            } else {                                           // using mozjpeg
                streams.push((new Mozjpeg()).spawnProcess());
            }
            break;
        default:
            throw new Error("Unexcepted file type.");
    }

    return streams;
};

module.exports = ImageReducer;
