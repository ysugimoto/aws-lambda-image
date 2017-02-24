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
        return fsP.readFile(`${__dirname}/fixture/fixture.jpg`).then(data => {
            return new ImageData(
                setting.Records[0].s3.object.key,
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

test("Reduce JPEG with no configuration", async t => {
    await processor.run(new Config({jpegOptimizer: "jpegoptim"}));
    // no working
    t.is(images.length, 0);
});

test("Reduce JPEG with basic configuration", async t => {
    await processor.run(new Config({
        jpegOptimizer: "jpegoptim",
        reduce: {}
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    t.is(image.bucketName, "sourcebucket");
    t.is(image.fileName, "HappyFace.jpg");
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});

test("Reduce JPEG with bucket/directory configuration", async t => {
    await processor.run(new Config({
        "reduce": {
            "bucket": "foo",
            "directory": "some",
            "jpegOptimizer": "jpegoptim"
        }
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    t.is(image.bucketName, "foo");
    t.is(image.fileName, "some/HappyFace.jpg");
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});


test("Reduce JPEG with quality", async t => {
    await processor.run(new Config({
        "reduce": {
            "quality": 90,
            "jpegOptimizer": "jpegoptim"
        }
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});
