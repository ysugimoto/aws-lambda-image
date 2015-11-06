var ImageResizer = require("../libs/ImageResizer");
var ImageData    = require("../libs/ImageData");
var ImageMagick  = require("imagemagick");

var expect     = require("chai").expect;
var fs         = require("fs");
var path       = require("path");
var destPath   = path.join(__dirname, "/fixture/fixture_resized.jpg");

describe("Resize JPEG Test", function() {

    it("Resize JPEG", function(done) {
        var resizer = new ImageResizer(200);
        var buffer  = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});
        var image   = new ImageData("fixture/fixture.jpg", "fixture", buffer);

        resizer.exec(image)
        .then(function(resized) {
            fs.writeFileSync(destPath, resized.getData(), {encoding: "binary"});
            ImageMagick.identify(["-format", "%w", destPath], function(err, out) {
                if ( err ) {
                    expect.fail(err);
                } else {
                    expect(parseInt(out, 10)).to.equal(200);
                }
                fs.unlinkSync(destPath);
                done();
            });
        })
        .catch(function(err) {
            expect.fail(err);
        });

    });
});
