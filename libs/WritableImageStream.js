var stream = require("stream");
var util   = require("util");

/**
 * Writable image binary stream implementation
 *
 * @constructor
 * @extends stream.Writable
 */
function WritableImageStream() {
    stream.Writable.call(this);

    this._buffers      = [];
    this._bufferLength = 0;
}

util.inherits(WritableImageStream, stream.Writable);

/**
 * stream.Writable interface implement
 *
 * @protected
 * @param Buffer chunk
 * @param String encoding
 * @param Function callback
 */
WritableImageStream.prototype._write = function WritableImageStream__write(chunk, encoding, callback) {
    this._buffers.push(chunk);
    this._bufferLength += chunk.length;

    callback();
};

/**
 * Get all written buffers after finished
 *
 * @public
 * @return Buffer
 */
WritableImageStream.prototype.getBufferStack = function WritableImageStream_getBufferStack() {
    return Buffer.concat(this._buffers, this._bufferLength);
};

module.exports = WritableImageStream;
