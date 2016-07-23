"use strict";

const ImageData      = require("./ImageData");
const Mozjpeg        = require("./optimizers/Mozjpeg");
const Pngquant       = require("./optimizers/Pngquant");
const Pngout         = require("./optimizers/Pngout");
const Gifsicle       = require("./optimizers/Gifsicle");
const ReadableStream = require("./ReadableImageStream");
const StreamChain    = require("./StreamChain");
//const JpegOptim    = require("./optimizers/JpegOptim");

class ImageReducer {

    /**
     * Image Reducer
     * Accept png/jpeg typed image
     *
     * @constructor
     * @param Object option
     */
    constructor(option) {
        this.option = option || {};
    }

    /**
     * Execute process
     *
     * @public
     * @param ImageData image
     * @return Promise
     */
    exec(image) {
        const option = this.option;

        return new Promise((resolve, reject) => {
            const input   = new ReadableStream(image.data);
            const streams = this.createReduceProcessList(image.type.toLowerCase());
            const chain   = new StreamChain(input);

            chain.pipes(streams).run()
            .then((buffer) => {
                let dir = option.directory || image.dirName;

                if ( dir ) {
                    dir = dir.replace(/\/$/, "") + "/";
                }

                resolve(new ImageData(
                    dir + image.baseName,
                    option.bucket || image.bucketName,
                    buffer,
                    image.headers,
                    image.acl
                ));
            })
            .catch((message) => reject(message));
        });
    };

    /**
     * Create reduce image process list
     *
     * @protected
     * @param String type
     * @return Array<Optimizer>
     * @thorws Error
     */
    createReduceProcessList(type) {
        const streams = [];

        switch ( type ) {
            case "png":
                streams.push(new Pngquant());
                streams.push(new Pngout());
                break;
            case "jpg":
            case "jpeg":
                streams.push(new Mozjpeg(this.option.quality));
                // switch JPEG optimizer
                //if ( this.option.jpegOptimizer === "jpegoptim" ) { // using jpegoptim
                //    streams.push(new JpegOptim());
                //} else {                                           // using mozjpeg
                //}
                break;
            case "gif":
                streams.push(new Gifsicle());
                break;
            default:
                throw new Error("Unexcepted file type.");
        }

        return streams;
    }
}

module.exports = ImageReducer;
