var Optimizer = require("./Optimizer");

/**
 * JpegOption optimizer
 *
 * @constructor
 * @extends Optimizer
 */
function Jpegoptim() {
    Optimizer.call(this);

    this.command = this.findBin("jpegoptim");
    this.args    = ["--stdin"];
}

module.exports = Optimizer.extend(Jpegoptim);


