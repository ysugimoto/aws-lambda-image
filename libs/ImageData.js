"use strict";

import path from "path";

export default class ImageData {
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
        this.fileName   = key;
        this.bucketName = name;
        this.data       = ( Buffer.isBuffer(data) ) ? data : new Buffer(data, "binary");
        this.headers    = headers;
        this.acl        = acl;
    }

    /**
     * Bucket name getter
     *
     * @public
     * @return String
     */
    getBucketName() {
        return this.bucketName;
    }

    /**
     * Basename getter
     *
     * @public
     * @return String
     */
    getBaseName() {
        return path.basename(this.fileName);
    }

    /**
     * Dirname getter
     *
     * @public
     * @return String
     */
    getDirName() {
        var dir = path.dirname(this.fileName);

        return ( dir === "." ) ? "" : dir;
    }

    /**
     * Filename getter
     *
     * @public
     * @return String
     */
    getFileName() {
        return this.fileName;
    }

    /**
     * Image type getter
     *
     * @public
     * @return String
     */
    getType() {
        return path.extname(this.fileName).slice(1);
    }

    /**
     * Image buffer getter
     *
     * @public
     * @return Buffer
     */
    getData() {
        return this.data;
    }

    /**
     * Image headers getter
     *
     * @public
     * @return Object
     */
    getHeaders() {
        return this.headers;
    }

    /**
     * Image acl getter
     *
     * @public
     * @return Object
     */
    getACL() {
        return this.acl;
    }
}
