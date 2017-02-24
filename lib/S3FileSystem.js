"use strict";

const ImageData = require("./ImageData");
const aws       = require("aws-sdk");

class S3FileSystem {

    constructor() {
        this.client = new aws.S3();//{ apiVersion: "2006-03-01" });
    }

    /**
     * Get object data from S3 bucket
     *
     * @param String bucket
     * @param String key
     * @return Promise
     */
    getObject(bucket, key, acl) {
        return new Promise((resolve, reject) => {
            console.log("Downloading: " + key);

            this.client.getObject({ Bucket: bucket, Key: key }).promise().then((data) => {
                if ( "img-processed" in data.Metadata ) {
                    reject("Object was already processed.");
                } else if ( data.ContentLength <= 0 ) {
                    reject("Empty file or directory.");
                } else {
                    resolve(new ImageData(
                        key,
                        bucket,
                        data.Body,
                        { ContentType: data.ContentType, CacheControl: data.CacheControl },
                        acl
                    ));
                }
            }).catch((err) => {
                reject("S3 getObject failed: " + err);
            });
        });
    }

    /**
     * Put object data to S3 bucket
     *
     * @param String bucket
     * @param String key
     * @param Buffer buffer
     * @return Promise
     */
    putObject(image) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket:       image.bucketName,
                Key:          image.fileName,
                Body:         image.data,
                Metadata:     { "img-processed": "true" },
                ContentType:  image.headers.ContentType,
                CacheControl: image.headers.CacheControl,
                ACL:          image.acl || "private"
            };

            console.log("Uploading to: " + params.Key + " (" + params.Body.length + " bytes)");

            this.client.putObject(params).promise().then((data) => {
                resolve("S3 putObject success");
            }).catch((err) => {
                reject(err);
            });
        });
    }
}

module.exports = S3FileSystem;