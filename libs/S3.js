"use strict";

import ImageData from "./ImageData";
import aws       from "aws-sdk";

const client  = new aws.S3({apiVersion: "2006-03-01"});

/**
 * Get object data from S3 bucket
 *
 * @param String bucket
 * @param String key
 * @return Promise
 */
exports.getObject = (bucket, key, acl) => {
    return new Promise((resolve, reject) => {
        client.getObject({ Bucket: bucket, Key: key }, (err, data) => {
            if ( err ) {
                reject("S3 getObject failed: " + err);
            } else {
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
            }
        });
    });
};

/**
 * Put object data to S3 bucket
 *
 * @param String bucket
 * @param String key
 * @param Buffer buffer
 * @return Promise
 */
exports.putObject = (bucket, key, buffer, headers, acl) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket:       bucket,
            Key:          key,
            Body:         buffer,
            Metadata:     { "img-processed": "true" },
            ContentType:  headers.ContentType,
            CacheControl: headers.CacheControl
        };

        if ( acl ) {
            params['ACL'] = acl;
        }
        client.putObject(params, (err) => {
            ( err ) ? reject(err) : resolve("S3 putObject success");
        });
    });
};

/**
 * Put objects data to S3 bucket
 *
 * @param Array<ImageData> images
 * @return Promise.all
 */
exports.putObjects = (images) => {
    return Promise.all(images.map((image) => {
        return new Promise((resolve, reject) => {
            exports.putObject(image.getBucketName(), image.getFileName(), image.getData(), image.getHeaders(), image.getACL())
            .then(() => resolve(image))
            .catch((message) => reject(message));
        });
    }));
};
