const fs = require('fs');
const path = require('path');

const readPackageConfig = () => {
    const { config } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
    return config;
};

const getDedicatedLayerArn = region => {
    const layerSettingFile = path.join(__dirname, './layers.json');
    if (!fs.existsSync(layerSettingFile)) {
        throw new Error("Layer settings file is not found. Abort");
    }
    const layerSetting = JSON.parse(fs.readFileSync(layerSettingFile));
    if (!(region in layerSetting)) {
        throw new Error(`Layer is not found on region: ${region}`);
    }
    return layerSetting[region];
};

const getRuntimeVersion = runtime => {
    if (!runtime.indexOf('nodejs') === -1) {
        throw new Error('Invalid runtime version');
    }
    const version = runtime.replace(/nodejs([0-9]+)\..*$/, '$1');
    return parseInt(version, 10);
};

module.exports = {
    readPackageConfig,
    getDedicatedLayerArn,
    getRuntimeVersion
};
