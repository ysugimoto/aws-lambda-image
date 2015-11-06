var ImageResizer = require("./ImageResizer");
var ImageReducer = require("./ImageReducer");
var S3           = require("./S3");
var Promise      = require("es6-promise").Promise;

/**
 * Image processor
 * management resize/reduce image list by configration,
 * and pile AWS Lambda's event/context
 *
 * @constructor
 * @param Object event
 * @param Object context
 */
function ImageProcessor(event, context) {
    this.event    = event;
    this.context  = context;
    this.s3Object = this.event.Records[0].s3;
}

/**
 * Run the process
 *
 * @public
 * @param Config config
 */
ImageProcessor.prototype.run = function ImageProcessor_run(config) {
    var that    = this;
    var context = this.context;

    // If object.size equals 0, S3 will update image
    if ( this.s3Object.object.size === 0 ) {
        context.done("Object size equal zero. Nothing to process.");
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
        var promiseList = config.get("resizes", []).filter(function(option) {
            return option.size && option.size > 0;
        }).map(function(option) {
            if ( ! option.bucket ) {
                option.bucket = config.get("bucket");
            }
            return that.execResizeImage(option, imageData);
        });

        var reduce = config.get("reduce", {});
        if ( ! reduce.bucket ) {
            reduce.bucket = config.get("bucket");
        }
        promiseList.push(that.execReduceImage(reduce, imageData));

        Promise.all(promiseList)
        .then(function(result) {
            context.succeed(result);
        })
        .catch(function(messages) {
            context.fail(messages);
        });
    })
    .catch(function(message) {
        context.fail("S3 getObject failed: " + message);
    });
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
        var resizer = new ImageResizer(option.size);

        resizer.exec(imageData)
        .then(function(resizedImage) {
            var reducer = new ImageReducer(option);

            reducer.exec(resizedImage)
            .then(function(reducedImage) {
                S3.putObject(
                    reducedImage.getBucketName(),
                    reducedImage.getFileName(),
                    reducedImage.getData()
                )
                .then(function() {
                    resolve("Resized Image Reduce done.");
                })
                .catch(function(message) {
                    reject("S3 putObject error: " + message);
                });
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
            S3.putObject(
                reducedImage.getBucketName(),
                reducedImage.getFileName(),
                reducedImage.getData()
            )
            .then(function() {
                resolve("Original Image Reduce done.");
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

module.exports = ImageProcessor;
