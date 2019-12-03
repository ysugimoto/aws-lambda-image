const fs = require('fs');
const path = require('path');
const DEDICATED_LAYER = "arn:aws:lambda:<REGION>:251217462751:layer:aws-lambda-image-layer:1";

const readPackageConfig = () => {
    const { config } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    return config;
};
module.exports = {
    readPackageConfig,
    dedicatedLayerArn: DEDICATED_LAYER
};
