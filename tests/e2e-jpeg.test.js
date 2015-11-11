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
        sinon.stub(S3, "putObjects", function(images) {
            return Promise.all(images.map(function(image) {
                return image;
            }));
        });
    });

    after(function() {
        S3.getObject.restore();
        S3.putObjects.restore();
    });

    beforeEach(function() {
        processor = new ImageProcessor(setting.Records[0].s3, {
            done: function() {},
            fail: function() {}
        });
    });

    it("Reduce JPEG with no configuration", function(done) {
        processor.run(new Config())
        .then(function(images) {
            expect(images).to.have.length(1);
            var image = images.shift();
            var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

            expect(image.getBucketName()).to.equal("sourcebucket");
            expect(image.getFileName()).to.equal("HappyFace.jpg");
            expect(image.getData().length).to.be.above(0)
                                         .and.be.below(buf.length);
            done();
        })
        .catch(function(messages) {
            expect.fail(messages);
            done();
        });
    });

    it("Reduce JPEG with bucket/directory configuration", function(done) {
        processor.run(new Config({
            "reduce": {
                "bucket": "foo",
                "directory": "some"
            }
        }))
        .then(function(images) {
            expect(images).to.have.length(1);
            var image = images.shift();
            var buf = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

            expect(image.getBucketName()).to.equal("foo");
            expect(image.getFileName()).to.equal("some/HappyFace.jpg");
            expect(image.getData().length).to.be.above(0)
                                         .and.be.below(buf.length);
            done();
        })
        .catch(function(messages) {
            expect.fail(messages);
            done();
        });
    });
});
