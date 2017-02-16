/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
"use strict";

const ImageProcessor = require("./lib/ImageProcessor");
const Config         = require("./lib/Config");
const fs             = require("fs");
const path           = require("path");

// Lambda Handler
exports.handler = (event, context, callback) => {

    var eventRecord = event.Records && event.Records[0];
    if (eventRecord) {
        if (eventRecord.eventSource === 'aws:s3' && eventRecord.s3) {
            console.log("Incoming S3 event...");
            process(eventRecord.s3, callback);
        } else if (eventRecord.EventSource === 'aws:sns' && eventRecord.Sns) {
            console.log("Incoming SNS message...");
            process(JSON.parse(event.Records[0].Sns.Message).Records[0].s3, callback);
        } else {
            console.log(JSON.stringify(eventRecord));
            callback('unsupported event source');
        }
    } else {
        console.log(JSON.stringify(event));
        callback('no records in the event');
    }
};

function process(s3Object, callback) {
    const configPath = path.resolve(__dirname, "config.json");
    const processor  = new ImageProcessor(s3Object);
    const config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );

    processor.run(config)
    .then((processedImages) => {
        const message = "OK, " + processedImages + " images were processed.";
        console.log(message);
        callback(null, message);
    })
    .catch((messages) => {
        if ( messages === "Object was already processed." ) {
            console.log("Image already processed");
            callback(null, "Image already processed");
        } else {
            callback("Error processing " + s3Object.object.key + ": " + messages);
        }
    });
}
