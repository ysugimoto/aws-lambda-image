/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
var ImageProcessor = require("./libs/ImageProcessor");
var Config         = require("./libs/Config");

var fs   = require("fs");
var path = require("path");

// Lambda Handler
exports.handler = function(event, context) {
    var s3Object   = event.Records[0].s3;
    var configPath = path.resolve(__dirname, "config.json");
    var processor  = new ImageProcessor(s3Object);
    var config     = new Config(
        JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))
    );

    console.log(s3Object);
    processor.run(config)
    .then(function(proceedImages) {
        context.succeed("OK, numbers of " + proceedImages.length + " images has proceeded.");
    })
    .catch(function(messages) {
        context.fail("Woops, image process failed: " + messages);
    });
};
