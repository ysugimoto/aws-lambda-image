const {
    readPackageConfig,
    dedicatedLayerArn
} = require('./common');

const {
    region = "eu-west-1",
    memory = "1280",
    timeout = "5",
    runtime = "nodejs10.x",
    profile,
    name,
    role
} = readPackageConfig();

const claudiaCommand = [
    "claudia",
    "create",
    "--version dev",
    "--handler index.handler",
    "--no-optional-dependencies",
    "--policies policies/*.json",
    `--profile ${profile}`,
    `--region ${region}`,
    `--timeout ${timeout}`,
    `--memory ${memory}`,
    `--runtime ${runtime}`
];
if (role) {
    claudiaArgs.push(`--role ${role}`);
}
if (name) {
    claudiaArgs.push(`--name ${name}`);
}
// on runtime nodejs10.x, need ImageMagick Layer
if (runtime.indexOf("nodejs10") !== -1) {
    claudiaArgs.push(`--layers ${dedicatedLayerArn}`);
}

process.stdout.write(claudiaArgs.join(" "));
