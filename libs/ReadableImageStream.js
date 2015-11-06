var stream = require("stream");
var util   = require("util");

/**
 * Readable image binary stream implementation
 *
 * @constructor
 * @extends stream.Readable
 * @param Buffer data
 */
function ReadableImageStream(data) {
    stream.Readable.call(this);

    this._data  = data;
    this._index = 0;
    this._size  = data.length;
}

util.inherits(ReadableImageStream, stream.Readable);

/**
 * stream.Readable interface implement
 *
 * @protected
 * @param Number size
 */
ReadableImageStream.prototype._read = function ReadableImageStream__read(size) {
    if ( this._index < this._size ) {
        this.push(
            this._data.slice(this._index, (this._index + size))
        );

        this._index += size;
    }

    if ( this._index >= this._size ) {
        this.push(null);
    }
};

module.exports = ReadableImageStream;
