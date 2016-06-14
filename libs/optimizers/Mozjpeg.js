"use strict";

import Optimizer from "./Optimizer";

export default class Mozjpeg extends Optimizer {
    /**
     * MozJpeg(cjpeg) optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("cjpeg");
        this.args    = ["-optimize", "-progressive"];
    }
}
