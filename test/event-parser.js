"use strict";

const eventParser = require( "../lib/EventParser" );
const test        = require( "ava" );
const fs          = require("fs");

test("Parsing S3 PUT file event", t => {
    const eventSource = `${__dirname}/fixture/events/s3_put_file.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record.object.key, "HappyFace.jpg" );
    t.is( record.object.size, 1024 );
    t.is( record.bucket.name, "sourcebucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
});

test("Parsing S3 PUT directory event", t => {
    const eventSource = `${__dirname}/fixture/events/s3_put_directory.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record.object.key, "some/" );
    t.is( record.object.size, 0 );
    t.is( record.bucket.name, "mybucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
});

test("Parsing SNS event carrying S3 PUT file event", t => {
    const eventSource = `${__dirname}/fixture/events/sns_s3_put_file.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record.object.key, "HappyFace.jpg" );
    t.is( record.object.size, 1024 );
    t.is( record.bucket.name, "sourcebucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
});

test("Parsing SNS event carrying S3 PUT directory event", t => {
    const eventSource = `${__dirname}/fixture/events/sns_s3_put_directory.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record.object.key, "some/" );
    t.is( record.object.size, 0 );
    t.is( record.bucket.name, "mybucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
});

test("Parsing S3 test event", t => {
    const eventSource = `${__dirname}/fixture/events/s3_test_event.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record, false );
});

test("Parsing SNS test event", t => {
    const eventSource = `${__dirname}/fixture/events/sns_test_event.json`;
    const event = JSON.parse( fs.readFileSync( eventSource ) );
    const record = eventParser( event );

    t.is( record, false );
});

test("Parsing unsupported event returns false", t => {
    const record = eventParser( { "Records": [ { "dynamodb": { "Keys": "Value" }, "eventSource": "aws:dynamodb" } ] } );

    t.is( record, false );
});

test("Parsing null event returns false", t => {
    const record = eventParser( null );

    t.is( record, false );
});

test("Parsing empty event returns false", t => {
    const record = eventParser( {} );

    t.is( record, false );
});
