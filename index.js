/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
"use strict";

const ImageProcessor = require("./lib/ImageProcessor");
const parser         = require("./lib/EventParser");
const Config         = require("./lib/Config");
const fs             = require("fs");
const path           = require("path");

// Lambda Handler
exports.handler = (event, context, callback) => {

    var eventRecord = parser(event);
    if (eventRecord) {
        process(eventRecord, callback);
    } else {
        console.log(JSON.stringify(event));
        callback('Unsupported or invalid event');
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
