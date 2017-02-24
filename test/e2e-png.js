"use strict";

const ImageProcessor = require("../lib/ImageProcessor");
const ImageData      = require("../lib/ImageData");
const Config         = require("../lib/Config");
const S3FileSystem   = require("../lib/S3FileSystem");
const test           = require("ava");
const sinon          = require("sinon");
const pify           = require("pify");
const fs             = require("fs");
const fsP            = pify(fs);
const sourceFile     = `${__dirname}/fixture/events/s3_put_file.json`;
const setting        = JSON.parse(fs.readFileSync(sourceFile));

let processor;
let images;
let fileSystem;

test.before(async t => {
    fileSystem = new S3FileSystem();
    sinon.stub(fileSystem, "getObject", () => {
        return fsP.readFile(`${__dirname}/fixture/fixture.png`).then(data => {
            return new ImageData(
                "test.png",
                setting.Records[0].s3.bucket.name,
                data
            );
        });
    });
    sinon.stub(fileSystem, "putObject", (image) => {
        images.push(image);
        return Promise.resolve(image);
    });
});

test.after(async t => {
    fileSystem.getObject.restore();
    fileSystem.putObject.restore();
});

test.beforeEach(async t => {
    processor = new ImageProcessor(fileSystem, setting.Records[0].s3);
    images = [];
});

test("Reduce PNG with no configuration", async t => {
    await processor.run(new Config({}));
    // no working
    t.is(images.length, 0);
});

test("Reduce PNG with basic configuration", async t => {
    await processor.run(new Config({
        reduce: {}
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.png`);
    t.is(image.bucketName, setting.Records[0].s3.bucket.name);
    t.is(image.fileName, "test.png");
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});

test("Reduce PNG with bucket/directory configuration", async t => {
    await processor.run(new Config({
        "bucket": "some",
        "reduce": {
            "directory": "resized"
        }
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.png`);
    t.is(image.bucketName, "some");
    t.is(image.fileName, "resized/test.png");
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});
