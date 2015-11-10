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
    var option = this.option;

    return new Promise(function(resolve, reject) {
        this.streamPipeProcess.apply(this, this.createReduceStreams(image))
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
 * Create reduce image streams
 *
 * @protected
 * @param ImageData image
 * @return Array<ReadableStream|ChildProcess>
 * @thorws Error
 */
ImageReducer.prototype.createReduceStreams = function ImageReducer_createReduceStreams(image) {
    var streams = [new ReadableStream(image.getData())];

    switch ( image.getType() ) {
        case "png":
            streams.push((new Pngquant()).spawnProcess());
            streams.push((new Pngout()).spawnProcess());
            break;
        case "jpg":
        case "jpeg":
            streams.push((new Mozjpeg()).spawnProcess());
            break;
        default:
            throw new Error("Unexcepted file type.");
    }

    return streams;
};

/**
 * Pipe streams and get result
 *
 * @private
 * @param ReadableStream input
 * @param ChildProcess first
 * @param ChildProcess|undefined second
 * @return Promise
 */
ImageReducer.prototype.streamPipeProcess = function ImageReducer_streamPipeProcess(input, first, second) {
    return new Promise(function(resolve, reject) {
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
