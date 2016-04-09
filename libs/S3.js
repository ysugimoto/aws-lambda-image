var ImageData = require("./ImageData");

var aws     = require("aws-sdk");
var client  = new aws.S3({apiVersion: "2006-03-01"});

/**
 * Get object data from S3 bucket
 *
 * @param String bucket
 * @param String key
 * @return Promise
 */
function getObject(bucket, key) {
    return new Promise(function(resolve, reject) {
        client.getObject({ Bucket: bucket, Key: key }, function(err, data) {
            if ( err ) {
                reject("S3 getObject failed: " + err);
            } else {
                if ("img-processed" in data.Metadata) {
                    reject("Object was already processed.");
                    return;
                }

                resolve(new ImageData(key, bucket, data.Body, { ContentType: data.ContentType, CacheControl: data.CacheControl }));
            }
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
function putObject(bucket, key, buffer, headers) {
    return new Promise(function(resolve, reject) {
        client.putObject({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            Metadata: {"img-processed": "true"},
            ContentType: headers.ContentType,
            CacheControl: headers.CacheControl
        }, function(err) {
            if ( err ) {
                reject(err);
            } else {
                resolve("S3 putObject sucess");
            }
        });
    });
}

/**
 * Put objects data to S3 bucket
 *
 * @param Array<ImageData> images
 * @return Promise.all
 */
function putObjects(images) {
    return Promise.all(images.map(function(image) {
        return new Promise(function(resolve, reject) {
            putObject(image.getBucketName(), image.getFileName(), image.getData(), image.getHeaders())
            .then(function() {
                resolve(image);
            })
            .catch(function(message) {
                reject(message);
            });
        });
    }));
}

module.exports = {
    getObject: getObject,
    putObject: putObject,
    putObjects: putObjects
};
