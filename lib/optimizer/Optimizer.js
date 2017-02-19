"use strict";

const spawn = require("child_process").spawn;
const path  = require("path");
const fs    = require("fs");

class Optimizer {

    /**
     * Optimizer Base Constructor
     *
     * @constructor
     */
    constructor() {
    }

    /**
     * Create spawn process
     *
     * @public
     * @return ChildProcess
     */
    spawnProcess() {
        var process = spawn(this.command, this.args);
        process.stdout.pipe(this.stdout);
        // process.on('err', (err) => {
        //     console.log(`Child process ended with error code ${err}`);
        // });
        child.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
            //Here is where the output goes
        });
        child.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
            //Here is where the error output goes
        });
        child.on('close', function(code) {
            console.log('closing code: ' + code);
            //Here you can get the exit code of the script
        });
        return process
    }

    /**
     * Find executable binary path
     *
     * @protected
     * @param String binName
     * @return String
     * @throws Error
     */
    findBin(binName) {
        const binPath = path.resolve(__dirname, "../../bin/", process.platform, binName);

        if ( ! fs.existsSync(binPath) ) {
            throw new Error("Undefined binary: " + binPath);
        }
        return binPath;
    }
}

module.exports= Optimizer;
