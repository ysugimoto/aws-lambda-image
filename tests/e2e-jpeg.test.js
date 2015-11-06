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

describe("Optimize JPEG Test", function() {
    var processor;
    var stub;

    before(function() {
        sinon.stub(S3, "getObject", function() {
            return new Promise(function(resolve, reject) {
                fs.readFile(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"}, function(err, data) {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve(new ImageData(
                            setting.Records[0].s3.object.key,
                            setting.Records[0].s3.bucket.name,
                            data
                        ));
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

    it("Reduce JPEG with no configuration", function(done) {
        stub = sinon.stub(S3, "putObject", function(bucket, name, data) {
            return new Promise(function(resolve) {
                var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

                expect(bucket).to.equal("sourcebucket");
                expect(name).to.equal("HappyFace.jpg");
                expect(data.length > 0).to.be.true;
                expect(data.length).to.be.below(buf.length);
                stub.restore();
                stub = null;
                resolve(true);
                done();
            });
        });
        processor.run(new Config());
    });

    it("Reduce JPEG with bucket/directory configuration", function(done) {
        var stub = sinon.stub(S3, "putObject", function(bucket, name, data) {
            return new Promise(function(resolve) {
                var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

                expect(bucket).to.equal("foo");
                expect(name).to.equal("some/HappyFace.jpg");
                expect(data.length > 0).to.be.true;
                expect(data.length).to.be.below(buf.length);
                stub.restore();
                stub = null;
                resolve(true);
                done();
            });
        });
        processor.run(new Config({
            "reduce": {
                "bucket": "foo",
                "directory": "some"
            }
        }));
    });
});
