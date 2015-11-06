/**
 * Automatic Image resize, reduce with AWS Lambda
 * Lambda main handler
 *
 * @author Yoshiaki Sugimoto
 * @created 2015/10/29
 */
var ImageProcessor = require("./libs/ImageProcessor");
var Config         = require("./libs/Config");

// Lambda Handler
exports.handler = function(event, context) {
    var configPath = require("path").resolve(__dirname, "config.json");
    var processor  = new ImageProcessor(event, context);
    var config     = new Config(
        JSON.parse(require("fs").readFileSync(configPath, { encoding: "utf8" }))
    );

    console.log(event);

    processor.run(config);
};
