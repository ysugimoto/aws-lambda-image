const {
    readPackageConfig,
    getDedicatedLayerArn,
    getRuntimeVersion
} = require('./common');

const { runtime, profile, region } = readPackageConfig();

const claudiaArgs = [
    "claudia",
    "update",
    `--profile ${profile}`
];

// if runtime is upper than nodejs10.x, need Layer
if (getRuntimeVersion(runtime) >= 10) {
    claudiaArgs.push(`--layers ${getDedicatedLayerArn(region)}`);
}

process.stdout.write(claudiaArgs.join(" "));
