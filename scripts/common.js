const fs = require('fs');
const path = require('path');
const GRAPHICSMAGICK_LAYER = "arn:aws:lambda:<REGION>:175033217214:layer:graphicsmagick:2";

const readPackageConfig = () => {
    const { config } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    return config;
};

const createLambdaLayers = (layer, region) => {
    const customLayers = layer
        .split(',')
        .map(l => l.trim())
        .filter(l => !!l);
    // Add GRAPHICSMAGICK_LAYER
    customLayers.push(
        GRAPHICSMAGICK_LAYER.replace('<REGION>', region),
    );
    return Array.from(new Set(customLayers)).join(',');
};

module.exports = {
    readPackageConfig,
    createLambdaLayers
};
