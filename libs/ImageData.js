"use strict";

const path = require("path");

class ImageData {
    /**
     * Image data interface
     *
     * @constructor
     * @param String key
     * @param String name
     * @param String|Buffer data
     * @param Object headers
     * @param Object acl
     */
    constructor(key, name, data, headers, acl) {
        this._fileName   = key;
        this._bucketName = name;
        this._data       = ( Buffer.isBuffer(data) ) ? data : new Buffer(data, "binary");
        this._headers    = headers;
        this._acl        = acl;
    }

    /**
     * Bucket name getter
     *
     * @public
     * @return String
     */
    get bucketName() {
        return this._bucketName;
    }

    /**
     * Basename getter
     *
     * @public
     * @return String
     */
    get baseName() {
        return path.basename(this._fileName);
    }

    /**
     * Dirname getter
     *
     * @public
     * @return String
     */
    get dirName() {
        const dir = path.dirname(this._fileName);

        return ( dir === "." ) ? "" : dir;
    }

    /**
     * Filename getter
     *
     * @public
     * @return String
     */
    get fileName() {
        return this._fileName;
    }

    /**
     * Image type getter
     *
     * @public
     * @return String
     */
    get type() {
        return path.extname(this._fileName).slice(1);
    }

    /**
     * Image buffer getter
     *
     * @public
     * @return Buffer
     */
    get data() {
        return this._data;
    }

    /**
     * Image headers getter
     *
     * @public
     * @return Object
     */
    get headers() {
        return this._headers;
    }

    /**
     * Image acl getter
     *
     * @public
     * @return Object
     */
    get acl() {
        return this._acl;
    }

    /**
     * Combines dirName, filename, and directory (from options).
     *
     * @public
     * @param String directory (from options)
     * @param String filePrefix (from options)
     * @param String fileSuffix (from options)
     * @return String
     */
    combineWithDirectory(directory, filePrefix, fileSuffix) {
        const prefix = filePrefix || "";
        const suffix = fileSuffix || "";
        const fileName = this.baseName.substr(0, this.baseName.lastIndexOf('.'));
        const extension = this.baseName.substr(this.baseName.lastIndexOf('.'));
        if ( directory != null ) {
            // ./X , ../X , . , ..
            if ( directory.match(/^\.\.?\//) || directory.match(/^\.\.?$/) ) {
                return path.join(this.dirName, directory, prefix + fileName + suffix + extension);
            } else {
                return path.join(directory, prefix + fileName + suffix + extension);
            }
        } else {
            return path.join(this.dirName, prefix + fileName + suffix + extension);
        }
    }
}

module.exports = ImageData;
