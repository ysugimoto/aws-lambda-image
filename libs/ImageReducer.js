"use strict";

import ImageData      from "./ImageData";
import Mozjpeg        from "./optimizers/Mozjpeg";
import Pngquant       from "./optimizers/Pngquant";
import Pngout         from "./optimizers/Pngout";
import ReadableStream from "./ReadableImageStream";
import StreamChain    from "./StreamChain";
//import JpegOptim    from "./optimizers/JpegOptim";

export default class ImageReducer {

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
            const input   = new ReadableStream(image.getData());
            const streams = this.createReduceProcessList(image.getType());
            const chain   = new StreamChain(input);
            const acl     = image.getACL();

            chain.pipes(streams).run()
            .then((buffer) => {
                let dir = option.directory || image.getDirName();

                if ( dir ) {
                    dir = dir.replace(/\/$/, "") + "/";
                }

                resolve(new ImageData(
                    dir + image.getBaseName(),
                    option.bucket || image.bucketName,
                    buffer,
                    image.getHeaders(),
                    acl
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
                streams.push(new Mozjpeg());
                // switch JPEG optimizer
                //if ( this.option.jpegOptimizer === "jpegoptim" ) { // using jpegoptim
                //    streams.push(new JpegOptim());
                //} else {                                           // using mozjpeg
                //}
                break;
            default:
                throw new Error("Unexcepted file type.");
        }

        return streams;
    }
}
