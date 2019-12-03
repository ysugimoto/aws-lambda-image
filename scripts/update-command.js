const {
    readPackageConfig,
    dedicatedLayerArn
} = require('./common');

const { runtime, profile } = readPackageConfig();

const claudiaArgs = [
    "claudia",
    "update",
    `--profile ${profile}`
];


// on runtime nodejs10.x, need ImageMagick Layer
if (runtime.indexOf("nodejs10") !== -1) {
    claudiaArgs.push(`--layers ${dedicatedLayerArn}`);
}

process.stdout.write(claudiaArgs.join(" "));
