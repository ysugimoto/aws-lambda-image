const {
    readPackageConfig,
    getDedicatedLayerArn,
    getRuntimeVersion
} = require('./common');

const { runtime, profile, region } = readPackageConfig();

const claudiaCommand = [
    "claudia",
    "update",
    `--profile ${profile}`
];

// if runtime is upper than nodejs10.x, need Layer
if (getRuntimeVersion(runtime) >= 10) {
    claudiaCommand.push(`--layers ${getDedicatedLayerArn(region)}`);
}

process.stdout.write(claudiaCommand.join(" "));
