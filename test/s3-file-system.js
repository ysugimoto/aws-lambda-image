"use strict";

const S3FileSystem   = require("../lib/S3FileSystem");
const ImageData      = require("../lib/ImageData");
const test           = require("ava");
const AWS            = require("aws-sdk-mock");
const pify           = require("pify");
const fs             = require("fs");

let fixture;
let fileSystem;

test.before(async t => {
    fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);

    AWS.mock( "S3", "getObject", (params, callback) => {
        switch ( params.Key ) {
            case "processed.jpg":
                callback( null, { Metadata: { "img-processed": "true" }, CacheControl: "cache-control" } );
                break;
            case "empty-file.jpg":
                callback( null, { ContentLength: 0, Metadata: {}, CacheControl: "cache-control" } );
                break;
            case "network-error.jpg":
                callback( "Simulated network error" );
                break;
            default:
                callback( null, { Body: fixture, Metadata: {}, CacheControl: "cache-control" } );
        }
    });
    AWS.mock( "S3", "putObject", (params, callback) => {
        switch ( params.Key ) {
            case "network-error.jpg":
                callback( "Simulated network error" );
                break;
            default:
                callback( null );
        }
    });

    fileSystem = new S3FileSystem();
});

test.after(async t => {
    AWS.restore( "S3" );
});

test("Create ImageData from valid image file", async t => {
    const image = await fileSystem.getObject( "bucket", "regular.jpg", "private" );

    t.is( image.acl, "private" );
    t.is( image.fileName, "regular.jpg" );
    t.is( image.bucketName, "bucket" );
    t.is( image.data, fixture );
    t.is( image.headers.ContentType, "image/jpeg" );
    t.is( image.headers.CacheControl, "cache-control" );
});

test("Fail on creating ImageData from image already processed", async t => {
    fileSystem.getObject("bucket", "processed.jpg", "acl").then((value) => {
        t.fail();
    }, (reason) => {
        t.is(reason, "Object was already processed.")
    });
});

test("Fail on creating ImageData from empty image or directory", async t => {
    fileSystem.getObject("bucket", "empty-file.jpg", "acl").then((value) => {
        t.fail();
    }, (reason) => {
        t.is(reason, "Empty file or directory.")
    });
});

test("Fail on creating ImageData because of network error", async t => {
    fileSystem.getObject("bucket", "network-error.jpg", "acl").then((value) => {
        t.fail();
    }, (reason) => {
        t.is(reason, "S3 getObject failed: Simulated network error")
    })
});

test("Push valid ImageData object to S3", async t => {
    const image = new ImageData("regular.jpg", "fixture", fixture, {}, "private");

    const response = await fileSystem.putObject(image);
    t.is(response, "S3 putObject success")
})

test("Fail on network error while pushing ImageData object to S3", async t => {
    const image = new ImageData("network-error.jpg", "fixture", fixture, {}, "private");

    fileSystem.putObject(image).then((value) => {
        t.fail();
    }, (reason) => {
        t.is(reason, "Simulated network error")
    })
})