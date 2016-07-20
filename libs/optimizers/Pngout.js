"use strict";

const Optimizer = require("./Optimizer");

class Pngout extends Optimizer {
    /**
     * pngout optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("pngout");
        this.args    = ["-", "-", "-s0", "-k0", "-f0"];
    }
}

module.exports = Pngout;
