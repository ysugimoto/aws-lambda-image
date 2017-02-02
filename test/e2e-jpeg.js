"use strict";

const ImageProcessor = require("../libs/ImageProcessor");
const ImageData      = require("../libs/ImageData");
const Config         = require("../libs/Config");
const S3             = require("../libs/S3");
const test           = require("ava");
const sinon          = require("sinon");
const pify           = require("pify");
const fs             = require("fs");
const fsP            = pify(fs);
const sourceFile     = `${__dirname}/fixture/s3_event_source.json`;
const setting        = JSON.parse(fs.readFileSync(sourceFile));

let processor;
let images;

test.before(() => {
    sinon.stub(S3, "getObject", () => {
        return fsP.readFile(`${__dirname}/fixture/fixture.jpg`).then(data => {
            return new ImageData(
                setting.Records[0].s3.object.key,
                setting.Records[0].s3.bucket.name,
                data
            );
        });
    });
    images = [];
    sinon.stub(S3, "putObject", (image) => {
        images.push(image);
        return Promise.resolve(image);
    });
});

test.after(() => {
    S3.getObject.restore();
    S3.putObject.restore();
});

test.beforeEach(() => {
    processor = new ImageProcessor(setting.Records[0].s3, {
        done: () => {},
        fail: () => {}
    });
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
