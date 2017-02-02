/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
"use strict";

const ImageProcessor = require("./libs/ImageProcessor");
const Config         = require("./libs/Config");
const fs             = require("fs");
const path           = require("path");

// Lambda Handler
exports.handler = (event, context) => {

    var eventRecord = event.Records && event.Records[0];
    if (eventRecord) {
        if (eventRecord.eventSource === 'aws:s3' && eventRecord.s3) {
            console.log("Incoming S3 event...");
            process(eventRecord.s3, context);
        } else if (eventRecord.EventSource === 'aws:sns' && eventRecord.Sns) {
            console.log("Incoming SNS message...");
            process(JSON.parse(event.Records[0].Sns.Message).Records[0].s3, context);
        } else {
            console.log(JSON.stringify(eventRecord));
            context.fail('unsupported event source');
        }
    } else {
        console.log(JSON.stringify(event));
        context.fail('no records in the event');
    }
};

function process(s3Object, context) {
    const configPath = path.resolve(__dirname, "config.json");
    const processor  = new ImageProcessor(s3Object);
    const config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );

    processor.run(config)
    .then((processedImages) => {
        const message = "OK, " + processedImages + " images were processed.";
        console.log(message);
        context.succeed(message);
    })
    .catch((messages) => {
        if ( messages === "Object was already processed." ) {
            console.log("Image already processed");
            context.succeed("Image already processed");
        } else {
            context.fail("Error processing " + s3Object.object.key + ": " + messages);
        }
    });
}