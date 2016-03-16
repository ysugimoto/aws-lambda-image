var ImageResizer = require("./ImageResizer");
var ImageReducer = require("./ImageReducer");
var S3           = require("./S3");
var Promise      = require("es6-promise").Promise;

/**
 * Image processor
 * management resize/reduce image list by configration,
 * and pipe AWS Lambda's event/context
 *
 * @constructor
 * @param Object s3Object
 * @param Object context
 */
function ImageProcessor(s3Object) {
    this.s3Object = s3Object;
}

/**
 * Run the process
 *
 * @public
 * @param Config config
 */
ImageProcessor.prototype.run = function ImageProcessor_run(config) {
    return new Promise(function(resolve, reject) {
        // If object.size equals 0, stop process
        if ( this.s3Object.object.size === 0 ) {
            reject("Object size equal zero. Nothing to process.");
            return;
        }

        if ( ! config.get("bucket") ) {
            config.set("bucket", this.s3Object.bucket.name);
        }

        S3.getObject(
            this.s3Object.bucket.name,
            this.s3Object.object.key
        )
        .then(function(imageData) {
            this.processImage(imageData, config)
            .then(function(results) {
                S3.putObjects(results)
                .then(function(images) {
                    resolve(images);
                })
                .catch(function(messages) {
                    reject(messages);
                });
            })
            .catch(function(messages) {
                reject(messages);
            });
        }.bind(this))
        .catch(function(error) {
            reject(error);
        });
    }.bind(this));
};

ImageProcessor.prototype.processImage = function ImageProcessor_processImage(imageData, config) {
    var reduce      = config.get("reduce", {});
    var promiseList = config.get("resizes", []).filter(function(option) {
            return (option.size && option.size > 0) || (option.width && option.width > 0) || (option.height && option.height > 0);
        }).map(function(option) {
            if ( ! option.bucket ) {
                option.bucket = config.get("bucket");
            }
            return this.execResizeImage(option, imageData);
        }.bind(this));

    if ( ! reduce.bucket ) {
        reduce.bucket = config.get("bucket");
    }
    promiseList.unshift(this.execReduceImage(reduce, imageData));

    return Promise.all(promiseList);
};

/**
 * Execute resize image
 *
 * @public
 * @param Object option
 * @param imageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execResizeImage = function ImageProcessor_execResizeImage(option, imageData) {
    return new Promise(function(resolve, reject) {
        var resizer = new ImageResizer(option);

        resizer.exec(imageData)
        .then(function(resizedImage) {
            var reducer = new ImageReducer(option);

            reducer.exec(resizedImage)
            .then(function(reducedImage) {
                resolve(reducedImage);
            })
            .catch(function(message) {
                reject(message);
            });
        })
        .catch(function(message) {
            reject(message);
        });
    });
};

/**
 * Execute reduce image
 *
 * @public
 * @param Object option
 * @param ImageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execReduceImage = function(option, imageData) {
    return new Promise(function(resolve, reject) {
        var reducer = new ImageReducer(option);

        reducer.exec(imageData)
        .then(function(reducedImage) {
            resolve(reducedImage);
        })
        .catch(function(message) {
            reject(message);
        });
    });
};

module.exports = ImageProcessor;
