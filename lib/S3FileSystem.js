"use strict";

const ImageData = require("./ImageData");
const aws       = require("aws-sdk");

class S3FileSystem {

    constructor() {
        this.client = new aws.S3({ apiVersion: "2006-03-01" });
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
                    this.client.getObjectTagging({Bucket: bucket, Key: key}).promise().then((taggingData) => {
                        
                        resolve(new ImageData(
                            key,
                            bucket,
                            data.Body,
                            { ContentType: data.ContentType, ContentDisposition: data.ContentDisposition, CacheControl: data.CacheControl, Metadata: data.Metadata, TaggingData: taggingData },
                            acl
                        ));
                    }).catch(function (err) {
                        reject("S3 getObjectTagging failed: " + err);
                    });
                }
            }).catch((err) => {
                reject("S3 getObject failed: " + err);
            });
        });
    }

    /**
     * Put object data to S3 bucket
     *
     * @param ImageData image
     * @return Promise
     */
    putObject(image, options) {
        const params = {
            Bucket:             image.bucketName,
            Key:                image.fileName,
            Body:               image.data,
            Metadata:           Object.assign({}, image.headers.Metadata, { "img-processed": "true" }),
            ContentType:        image.headers.ContentType,
            ContentDisposition: image.headers.ContentDisposition,
            CacheControl:       (options.cacheControl !== undefined) ? options.cacheControl : image.headers.CacheControl,
            ACL:                image.acl || "private"
        };

        console.log("Uploading to: " + params.Key + " (" + params.Body.length + " bytes)");

        return this.client.putObject(params).promise();
    }
    
    /**
     * Put object tags
     * @param image
     * @param options
     * @return Promise
     */
    putTags(image, options){
        console.log("putTags", image.headers);
        if (!image.headers.TaggingData)
        {
            return new Promise(function (resolve, reject) {
                resolve();
            });
        }
        else
        {
    
            const params = {
                Bucket:       image.bucketName,
                Key:          image.fileName,
                Tagging:      {}
            };
            if (options.VersionId) params.VersionId = options.VersionId;
            else if (image.headers.TaggingData.VersionId) params.VersionId = image.headers.TaggingData.VersionId;
            
            if (options.TagSet) params.Tagging.TagSet = options.TagSet;
            else if (image.headers.TaggingData.TagSet) params.Tagging.TagSet = image.headers.TaggingData.TagSet;
            return this.client.putObjectTagging(params).promise()
        }
    }

    /**
     * Delete object data from S3 bucket
     *
     * @param ImageData image
     * @return Promise
     */
    deleteObject(image) {
        const params = {
            Bucket: image.bucketName,
            Key:    image.fileName
        };

        console.log("Delete original object: " + params.Key);

        return this.client.deleteObject(params).promise();
    }
}

module.exports = S3FileSystem;
