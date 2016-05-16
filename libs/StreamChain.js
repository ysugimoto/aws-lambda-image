var WritableStream = require("./WritableImageStream");
var Promise        = require("es6-promise").Promise;

/**
 * Strem Chain
 * Start input, pipes streams, and get output buffer
 *
 * @constructor
 * @param stream.Readable inputStream
 */
function StreamChain(inputStream) {
    this.inputStream = inputStream;
    this.pipeProcesses = [];
}

/**
 * Static instantiate
 *
 * @public
 * @static
 * @param stream.Readable inputStream
 * @return StreamChain
 */
StreamChain.make = function(inputStream) {
    return new StreamChain(inputStream);
};

/**
 * Pipes stream lists
 *
 * @public
 * @param Array<Optimizer> processes
 * @return StreamChain this
 */
StreamChain.prototype.pipes = function(processes) {
    var index = -1;

    while ( processes[++index] ) {
        this.pipeProcesses.push(processes[index]);
    }

    return this;
};

/**
 * Run the streams
 *
 * @public
 * @return Promise
 */
StreamChain.prototype.run = function() {
    this.inputStream.pause();

    return new Promise(function(resolve, reject) {
        var output = new WritableStream();
        var current;

        this.inputStream.on("error", reject);
        current = this.inputStream;

        this.pipeProcesses.forEach(function(optimizer) {
            var proc = optimizer.spawnProcess();
            current.pipe(proc.stdin);
            current = proc.stdout;
        });

        current.pipe(output);
        output.on("error", reject);
        output.on("finish", function() {
            resolve(output.getBufferStack());
        });
        this.inputStream.resume();
    }.bind(this));
};

module.exports = StreamChain;
