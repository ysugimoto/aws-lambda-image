"use strict";

const stream = require("stream");

class WritableImageStream extends stream.Writable {

    /**
     * Writable image binary stream implementation
     *
     * @constructor
     * @extends stream.Writable
     */
    constructor() {
        super();

        this._buffers      = [];
        this._bufferLength = 0;
    }

    /**
     * stream.Writable interface implement
     *
     * @protected
     * @param Buffer chunk
     * @param String encoding
     * @param Function callback
     */
    _write(chunk, encoding, callback) {
        this._buffers.push(chunk);
        this._bufferLength += chunk.length;

        callback();
    }

    /**
     * Get all written buffers after finished
     *
     * @public
     * @return Buffer
     */
    getBufferStack() {
        return Buffer.concat(this._buffers, this._bufferLength);
    }
}

module.exports = WritableImageStream;
