var ImageData = require("./ImageData");

var aws     = require("aws-sdk");
var Promise = require("es6-promise").Promise;
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
                resolve(new ImageData(key, bucket, data.Body));
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
function putObject(bucket, key, buffer) {
    return new Promise(function(resolve, reject) {
        client.putObject({ Bucket: bucket, Key: key, Body: buffer }, function(err) {
            if ( err ) {
                reject(err);
            } else {
                resolve("S3 putObject sucess");
            }
        });
    });
}

module.exports = {
    getObject: getObject,
    putObject: putObject
};



