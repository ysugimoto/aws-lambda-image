## aws-lambda-image

[![Build Status](https://travis-ci.org/ysugimoto/aws-lambda-image.svg?branch=master)](https://travis-ci.org/ysugimoto/aws-lambda-image)
[![Code Climate](https://codeclimate.com/github/ysugimoto/aws-lambda-image/badges/gpa.svg)](https://codeclimate.com/github/ysugimoto/aws-lambda-image)
[![npm version](https://badge.fury.io/js/aws-lambda-image.svg)](https://badge.fury.io/js/aws-lambda-image)

Automatic image resize/reduce on AWS Lambda. When new images have put on AWS S3 bucket, this package will resize/reduce that image, and put S3.

### Requirements

- `node.js` ( AWS Lambda working version is 0.10.26 )
- `make`

### Installation

This package written by node.js, clone this project and install depend packages:

```
$ git clone git@github.com:ysugimoto/aws-lambda-image.git
$ cd aws-lambda-image
$ npm install .
```

### Packaging

AWS Lambda accepts zip archived package. To create it, run `make lambda` task simply.

```
$ make lambda
```

It will create `aws-lambda-image.zip` at project root, and upload it.

### Configuration

This package works follow the configuration that written in `config.json` on project root. Just example is `config.json.sample`, please copy and use it.

```
$ cp config.json.sample config.json
```

Configuration is simple, see below:

```
{
  "bucket": "your-destination-bucket",
  "reduce": {
      "directory": "reduced"
  },
  "resizes": [
    {
      "size": 300,
      "directory": "resized/small"
    },
    {
      "size": 600,
      "directory": "resized/middle"
    }
    {
      "size": 900,
      "directory": "resized/large"
    }
  ]
}
```

- `bucket`: [String] Global setting, put reduced image destination bucket name at S3. If not suppiled, use same bukcet of event source.
- `reduce`: [Object] Reduce image setting.
  - `directory`: [String] Put image directory path.
  - `bucket`: [Object] Override put destination bucket. if not supplied, use Global `bucket` setting.
- `resizes`: [Array] Resize images setting.
  - `size`: [Number] Resize width.
  - `directory`: [String] Put image directory path.
  - `bucket`: [Object] Override put destination bucket. if not supplied, use Global `bucket` setting.

If you check how package working by your configuration, you can use `configtest`:

```
$ make configtest
```

### Complete / Failed hooks

You can handle resize/reduce process on success/error result on `index.js`. `ImageProcessor::run` will return `Promise` object, run your original code:

```
processor.run(config)
.then(function(proceedImages)) {

    // Success case:
    // proceedImages is list of ImageData instance on you configuration

    /* your code here */

    // notify lambda
    context.succeed("OK, numbers of " + proceedImages.length + " images has proceeded.");
})
.catch(function(messages) {

    // Failed case:
    // messages is list of string on error messages

    /* your code here */

    // notify lambda
    context.fail("Woops, image process failed: " + messages);
});
```

### Image resize

- `ImageMagick` (installed on AWS Lambda)

### Image reduce

- `cjpeg`
- `pngquant`
- `pngout`

### License

MIT License.

### Author

Yoshiaki Sugimoto

### Image credits

Thanks for testing fixture images:

- http://pngimg.com/
- https://www.pakutaso.com/
