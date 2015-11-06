var ImageProcessor = require("../libs/ImageProcessor");
var ImageData      = require("../libs/ImageData");
var Config         = require("../libs/Config");
var Promise        = require("es6-promise").Promise;
var S3             = require("../libs/S3");

var sinon      = require("sinon");
var expect     = require("chai").expect;
var fs         = require("fs");
var path       = require("path");
var sourceFile = path.join(__dirname, "/fixture/event_source.json");
var setting    = JSON.parse(fs.readFileSync(sourceFile));

describe("Optimize PNG Test", function() {
    var processor;
    var stub;

    before(function() {
        sinon.stub(S3, "getObject", function() {
            return new Promise(function(resolve, reject) {
                fs.readFile(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"}, function(err, data) {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve(new ImageData("test.png", "test", data));
                    }
                });
            });
        });
    });

    after(function() {
        S3.getObject.restore();
    });

    beforeEach(function() {
        processor = new ImageProcessor(setting, {
            done: function() {},
            fail: function() {}
        });
        if ( stub ) {
            stub.restore();
            stub = null;
        }
    });

    it("Reduce PNG with no configuration", function(done) {
        stub = sinon.stub(S3, "putObject", function(bucket, name, data) {
            return new Promise(function(resolve) {
                var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

                expect(bucket).to.equal("sourcebucket");
                expect(name).to.equal("test.png");
                expect(data.length).to.be.below(buf.length);
                stub.restore();
                stub = null;
                resolve(true);
                done();
            });
        });
        processor.run(new Config());
    });

    it("Reduce PNG with bucket/directory configuration", function(done) {
        var stub = sinon.stub(S3, "putObject", function(bucket, name, data) {
            return new Promise(function(resolve) {
                var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

                expect(bucket).to.equal("some");
                expect(name).to.equal("resized/test.png");
                expect(data.length).to.be.below(buf.length);
                stub.restore();
                stub = null;
                resolve(true);
                done();
            });
        });
        processor.run(new Config({
            "bucket": "some",
            "reduce": {
                "directory": "resized"
            }
        }));
    });
});
