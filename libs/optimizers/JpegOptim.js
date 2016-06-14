"use strict";

import Optimizer from "./Optimizer";

export default class extends Optimizer {
    /**
     * JpegOption optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor Jpegoptim() {
        super();

        this.command = this.findBin("jpegoptim");
        this.args    = ["--stdin", "-s", "--all-progressive", "--stdout"];
    }
}

