var ImageData      = require("./ImageData");
var Mozjpeg        = require("./optimizers/Mozjpeg");
var Pngquant       = require("./optimizers/Pngquant");
var Pngout         = require("./optimizers/Pngout");
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

        chain.pipes(streams).run()
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
 * @param ImageData image
 * @return Promise
ImageReducer.prototype.executeStream = function ImageReducer_executeStream(image) {
    var input = new ReadableStream(image.getData());
    var chain = new StreamChain(input);

    return chain.pipes(this.createReduceStreams(image.getType()).run();


    var processes = this.createReduceStreams(image.getType());

    return new Promise(function(resolve, reject) {
        var input  = new ReadableStream(image.getData());
        var output = new WritableStream();
        var first  = processes[0];
        var second = processes[1] || null;

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
 */

module.exports = ImageReducer;
