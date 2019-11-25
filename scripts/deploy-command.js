const {
    readPackageConfig,
    createLambdaLayers
} = require('./common');

const {
    region = "eu-west-1",
    memory = "1280",
    timeout = "5",
    runtime = "nodejs10.x",
    profile,
    name,
    role,
    layer
} = readPackageConfig();

// on runtime nodejs10.x, need ImageMagick Layer
if (runtime.indexOf("nodejs10") !== -1 && layer === "") {
    console.error(`
[Deploy function failed!]
On nodejs10.x runtime, you need to install ImageMagick with AWS Lambda Layer.
See https://github.com/ysugimoto/aws-lambda-image/blob/master/doc/LAYERS.md of instructions`
    );
    // eslint-disable-next-line no-process-exit
    process.exit(0);
}

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
    `--runtime ${runtime}`,
    `--layers ${createLambdaLayers(layer, region)}`
];
if (role) {
    claudiaArgs.push(`--role ${role}`);
}
if (name) {
    claudiaArgs.push(`--name ${name}`);
}
process.stdout.write(claudiaArgs.join(" "));
