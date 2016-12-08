"use strict";

const ImageData = require("./ImageData");
const aws       = require("aws-sdk");

const client  = new aws.S3({apiVersion: "2006-03-01"});

class S3 {
    /**
     * Get object data from S3 bucket
     *
     * @param String bucket
     * @param String key
     * @return Promise
     */
    static getObject(bucket, key, acl) {
        return new Promise((resolve, reject) => {
            console.log("Downloading: " + key);
            client.getObject({ Bucket: bucket, Key: key }, (err, data) => {
                if ( err ) {
                    reject("S3 getObject failed: " + err);
                    return;
                }

                if ( "img-processed" in data.Metadata ) {
                    reject("Object was already processed.");
                    return;
                }

                resolve(new ImageData(
                    key,
                    bucket,
                    data.Body,
                    { ContentType: data.ContentType, CacheControl: data.CacheControl },
                    acl
                ));
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
    static putObject(image) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket:       image.bucketName,
                Key:          image.fileName,
                Body:         image.data,
                Metadata:     { "img-processed": "true" },
                ContentType:  image.headers.ContentType,
                CacheControl: image.headers.CacheControl
            };

            if ( image.acl ) {
                params.ACL = image.acl;
            }
            console.log("Uploading to: " + params.Key + " (" + params.Body.length + " bytes)");
            client.putObject(params, (err) => {
                ( err ) ? reject(err) : resolve("S3 putObject success");
            });
        });
    }

    /**
     * Put objects data to S3 bucket
     *
     * @param Array<ImageData> images
     * @return Promise.all
     */
    static putObjects(images) {
        return Promise.all(images.map((image) => {
            return new Promise((resolve, reject) => {
                S3.putObject(image)
                .then(() => resolve(image))
                .catch((message) => reject(message));
            });
        }));
    }
}

module.exports = S3;
