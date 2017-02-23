"use strict";

const ImageData      = require("./ImageData");
const Mozjpeg        = require("./optimizer/Mozjpeg");
const JpegOptim      = require("./optimizer/JpegOptim");
const Pngquant       = require("./optimizer/Pngquant");
const Gifsicle       = require("./optimizer/Gifsicle");
const ReadableStream = require("./ReadableImageStream");
const StreamChain    = require("./StreamChain");

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

        const input   = new ReadableStream(image.data);
        const streams = this.createReduceProcessList(image.type.ext);
        const chain   = new StreamChain(input);

        return chain.pipes(streams).run()
        .then((buffer) => {
            return new ImageData(
                image.combineWithDirectory(option.directory, option.prefix, option.suffix),
                option.bucket || image.bucketName,
                buffer,
                image.headers,
                option.acl || image.acl
            );
        });
    }

    /**
     * Create reduce image process list
     *
     * @protected
     * @param String type
     * @return Array<Optimizer>
     * @thorws Error
     */
    createReduceProcessList(type) {
        console.log("Reducing to: " + (this.option.directory || "in-place"));

        const streams = [];
        switch ( type ) {
            case "png":
                streams.push(new Pngquant());
                break;
            case "jpg":
            case "jpeg":
                if ( this.option.jpegOptimizer === "jpegoptim" ) { // using jpegoptim
                    streams.push( new JpegOptim( this.option.quality ) );
                } else {                                           // using mozjpeg
                    streams.push( new Mozjpeg( this.option.quality ) );
                }
                break;
            case "gif":
                streams.push(new Gifsicle());
                break;
            default:
                throw new Error("Unexpected output type: " + type);
        }

        return streams;
    }
}

module.exports = ImageReducer;
