"use strict";

const Optimizer = require("./Optimizer");

class Gifsicle extends Optimizer {
    /**
     * Gifsicle optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("gifsicle");
        this.args    = ["--optimize"];
    }
}

module.exports = Gifsicle;
