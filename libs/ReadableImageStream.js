"use strict";

const stream = require("stream");

class ReadableImageStream extends stream.Readable {

    /**
     * Readable image binary stream implementation
     *
     * @constructor
     * @extends stream.Readable
     * @param Buffer data
     */
    constructor(data) {
        super();

        this._data  = data;
        this._index = 0;
        this._size  = data.length;
    }

    /**
     * stream.Readable interface implement
     *
     * @protected
     * @param Number size
     */
    _read(size) {
        if ( this._index < this._size ) {
            this.push(
                this._data.slice(this._index, (this._index + size))
            );

            this._index += size;
        }

        if ( this._index >= this._size ) {
            this.push(null);
        }
    }
}

module.exports = ReadableImageStream;
