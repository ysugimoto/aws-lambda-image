"use strict";

module.exports = function parseEvent(event) {

    const eventRecord = event && event.Records && event.Records[0];
    if ( eventRecord ) {
        if ( eventRecord.eventSource === 'aws:s3' && eventRecord.s3 ) {
            console.log( "Parsing S3 event..." );

            return eventRecord.s3;
        } else if ( eventRecord.EventSource === 'aws:sns' && eventRecord.Sns ) {
            console.log( "Parsing SNS message..." );

            const snsEvent = JSON.parse( eventRecord.Sns.Message );
            const snsEventResord = snsEvent.Records && snsEvent.Records[0];
            if ( snsEventResord.eventSource === 'aws:s3' && snsEventResord.s3 ) {
                return snsEventResord.s3;
            }
        }
    }

    return false;
};