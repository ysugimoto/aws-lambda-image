"use strict";

const ImageProcessor = require("../libs/ImageProcessor");
const ImageData      = require("../libs/ImageData");
const Config         = require("../libs/Config");
const S3             = require("../libs/S3");

const sinon      = require("sinon");
const expect     = require("chai").expect;
const fs         = require("fs");
const path       = require("path");
const sourceFile = path.join(__dirname, "/fixture/event_source.json");
const setting    = JSON.parse(fs.readFileSync(sourceFile));

describe("Optimize PNG Test", () => {
    let processor;
    let images;

    before(() => {
        sinon.stub(S3, "getObject", () => {
            return new Promise((resolve, reject) => {
                fs.readFile(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"}, (err, data) => {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve(new ImageData(
                            "test.png",
                            setting.Records[0].s3.bucket.name,
                            data
                        ));
                    }
                });
            });
        });
        images = [];
        sinon.stub(S3, "putObject", (image) => {
            images.push(image);
            return new Promise((resolve) => resolve(image));
        });
    });

    after(() => {
        S3.getObject.restore();
        S3.putObject.restore();
    });

    beforeEach(() => {
        processor = new ImageProcessor(setting.Records[0].s3, {
            done: () => {},
            fail: () => {}
        });
    });

    it("Reduce PNG with no configuration", (done) => {
        processor.run(new Config({}))
        .then(() => {
            // no working
            expect(images).to.have.length(0);
            done();
        });
    });

    it("Reduce PNG with basic configuration", (done) => {
        processor.run(new Config({
            reduce: {}
        }))
        .then(() => {
            expect(images).to.have.length(1);
            const image = images.shift();
            const buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

            expect(image.bucketName).to.equal(setting.Records[0].s3.bucket.name);
            expect(image.fileName).to.equal("test.png");
            expect(image.data.length).to.be.above(0)
                                          .and.be.below(buf.length);
            done();
        })
        .catch((messages) => {
            console.log(messages);
            done();
        });
    });

    it("Reduce PNG with bucket/directory configuration", (done) => {
        processor.run(new Config({
            "bucket": "some",
            "reduce": {
                "directory": "resized"
            }
        }))
        .then(() => {
            expect(images).to.have.length(1);
            const image = images.shift();
            const buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

            expect(image.bucketName).to.equal("some");
            expect(image.fileName).to.equal("resized/test.png");
            expect(image.data.length).to.be.above(0)
                                         .and.be.below(buf.length);
            done();
        })
        .catch((messages) => {
            console.log(messages);
            done();
        });
    });
});
