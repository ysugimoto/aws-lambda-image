"use strict";

const ImageProcessor = require("../lib/ImageProcessor");
const ImageData      = require("../lib/ImageData");
const Config         = require("../lib/Config");
const S3             = require("../lib/S3");
const test           = require("ava");
const sinon          = require("sinon");
const pify           = require("pify");
const fs             = require("fs");
const fsP            = pify(fs);
const sourceFile     = `${__dirname}/fixture/event_source.json`;
const setting        = JSON.parse(fs.readFileSync(sourceFile));

let processor;
let images;

test.before(async t => {
    sinon.stub(S3, "getObject", () => {
        return fsP.readFile(`${__dirname}/fixture/fixture.jpg`).then(data => {
            return new ImageData(
                setting.Records[0].s3.object.key,
                setting.Records[0].s3.bucket.name,
                data
            );
        });
    });
    sinon.stub(S3, "putObject", (image) => {
        images.push(image);
        return Promise.resolve(image);
    });
});

test.after(async t => {
    S3.getObject.restore();
    S3.putObject.restore();
});

test.beforeEach(async t => {
    processor = new ImageProcessor(setting.Records[0].s3, {
        done: () => {},
        fail: () => {}
    });
    images = [];
});

test("Reduce JPEG with no configuration", async t => {
    await processor.run(new Config({}));
    // no working
    t.is(images.length, 0);
});

test("Reduce JPEG with basic configuration", async t => {
    await processor.run(new Config({
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
            "directory": "some"
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

test("Backup JPEG with prefix and suffix", async t => {
    await processor.run(new Config({
        backup: {
            prefix: "a_",
            suffix: "_b"
        }
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    t.is(image.bucketName, "sourcebucket");
    t.is(image.fileName, "a_HappyFace_b.jpg");
    t.true(image.data.length === fixture.length);
});

test("Resize JPEG with quality", async t => {
    await processor.run(new Config({
        "resizes": [
            {
                "size": 100,
                "quality": 90
            }
        ]
    }));
    t.is(images.length, 1);
    const image = images.shift();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    t.is(image.fileName, "HappyFace.jpg");
    t.true(image.data.length > 0);
    t.true(image.data.length < fixture.length);
});

test("Resize JPEG with format", async t => {
    await processor.run(new Config({
        "resizes": [
            {
                "size": 100,
                "format": "png"
            },
            {
                "size": 100,
                "format": "gif"
            }
        ]
    }));
    t.is(images.length, 2);

    const pngImage = images.shift();
    t.is(pngImage.fileName, "HappyFace.png");
    t.true(pngImage.data.length > 0);

    const gifImage = images.shift();
    t.is(gifImage.fileName, "HappyFace.gif");
    t.true(gifImage.data.length > 0);
});