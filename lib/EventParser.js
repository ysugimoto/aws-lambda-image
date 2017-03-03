"use strict";

module.exports = function parseEvent(event) {

    const eventRecord = event && event.Records && event.Records[0];
    if ( eventRecord ) {
        if ( eventRecord.eventSource === "aws:s3" && eventRecord.s3 ) {
            console.log( "Parsing S3 event..." );

            return eventRecord.s3;
        } else if ( eventRecord.EventSource === "aws:sns" && eventRecord.Sns ) {
            console.log( "Parsing SNS message..." );

            const snsEvent = JSON.parse( eventRecord.Sns.Message );
            const snsEventRecord = snsEvent.Records && snsEvent.Records[0];
            if ( snsEventRecord && snsEventRecord.eventSource === "aws:s3" && snsEventRecord.s3 ) {
                return snsEventRecord.s3;
            }
        }
    }

    return false;
};