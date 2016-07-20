"use strict";

const WritableStream = require("./WritableImageStream");

class StreamChain {

    /**
     * Strem Chain
     * Start input, pipes streams, and get output buffer
     *
     * @constructor
     * @param stream.Readable inputStream
     */
    constructor(inputStream) {
        this.inputStream   = inputStream;
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
    static make(inputStream) {
        return new StreamChain(inputStream);
    }

    /**
     * Pipes stream lists
     *
     * @public
     * @param Array<Optimizer> processes
     * @return StreamChain this
     */
    pipes(processes) {
        let index = -1;
        while ( processes[++index] ) {
            this.pipeProcesses.push(processes[index]);
        }

        return this;
    }

    /**
     * Run the streams
     *
     * @public
     * @return Promise
     */
    run() {
        this.inputStream.pause();

        return new Promise((resolve, reject) => {
            const output = new WritableStream();
            let current;

            this.inputStream.on("error", reject);
            current = this.inputStream;

            this.pipeProcesses.forEach((optimizer) => {
                const proc = optimizer.spawnProcess();
                current.pipe(proc.stdin);
                current = proc.stdout;
            });

            current.pipe(output);
            output.on("error", reject);
            output.on("finish", () => resolve(output.getBufferStack()));
            this.inputStream.resume();
        });
    }
}

module.exports = StreamChain;
