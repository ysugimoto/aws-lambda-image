/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
"use strict";

import ImageProcessor from "./libs/ImageProcessor";
import Config from "./libs/Config";

import fs from "fs";
import path from "path";

// Lambda Handler
exports.handler = (event, context) => {
    const s3Object   = event.Records[0].s3;
    const configPath = path.resolve(__dirname, "config.json");
    const processor  = new ImageProcessor(s3Object);
    const config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );

    processor.run(config)
    .then((proceedImages) => {
        console.log("OK, numbers of " + proceedImages.length + " images has proceeded.");
        context.succeed("OK, numbers of " + proceedImages.length + " images has proceeded.");
    })
    .catch((messages) => {
        if ( messages === "Object was already processed." ) {
            console.log("Image already processed");
            context.succeed("Image already processed");
        } else {
            context.fail("Woops, image process failed: " + messages);
        }
    });
};
