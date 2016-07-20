"use strict";

const events = require("events");

class Hook extends events.EventEmitter {
    constructor() {
        super();
    }
}

module.exports = new Hook();
