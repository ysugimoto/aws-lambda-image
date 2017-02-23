"use strict";

const eventParser = require( "../lib/EventParser" );
const test        = require( "ava" );
const fs          = require("fs");

test("Parsing S3 event", t => {
    const s3EventSource = `${__dirname}/fixture/event_source.json`;
    const s3Event = JSON.parse( fs.readFileSync( s3EventSource ) );
    const record = eventParser( s3Event );

    t.is( record.object.key, "HappyFace.jpg" );
    t.is( record.object.size, 1024 );
    t.is( record.bucket.name, "sourcebucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
});

test("Parsing SNS event carrying S3 event", t => {
    const snsEventSource = `${__dirname}/fixture/sns_event_source.json`;
    const snsEvent = JSON.parse( fs.readFileSync( snsEventSource ) );
    const record = eventParser( snsEvent );

    t.is( record.object.key, "HappyFace.jpg" );
    t.is( record.object.size, 1024 );
    t.is( record.bucket.name, "sourcebucket" );
    t.is( record.bucket.arn, "arn:aws:s3:::mybucket" );
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
