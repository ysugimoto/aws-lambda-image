## aws-lambda-image

[![Build Status](https://travis-ci.org/ysugimoto/aws-lambda-image.svg?branch=master)](https://travis-ci.org/ysugimoto/aws-lambda-image)
[![Code Climate](https://codeclimate.com/github/ysugimoto/aws-lambda-image/badges/gpa.svg)](https://codeclimate.com/github/ysugimoto/aws-lambda-image)
[![npm version](https://badge.fury.io/js/aws-lambda-image.svg)](https://badge.fury.io/js/aws-lambda-image)

An AWS Lambda Function to resize/reduce images automatically. When an image is put on AWS S3 bucket, this package will resize/reduce it and put to S3.

### Requirements

- `node.js` ( AWS Lambda working version is **4.3.2** )
- `make`

### Installation

Clone this repository and install dependencies:

```bash
$ git clone git@github.com:ysugimoto/aws-lambda-image.git
$ cd aws-lambda-image
$ npm install .
```

### Packaging

AWS Lambda accepts zip archived package. To create it, run `make lambda` task simply.

```bash
$ make lambda
```

It will create `aws-lambda-image.zip` at project root. You can upload it.

### Configuration

This works with `config.json` put on project root. There is `config.json.sample` as example. You can copy to use it.

```bash
$ cp config.json.sample config.json
```

Configuration is simple, see below:

```json
{
  "bucket": "your-destination-bucket",
  "reduce": {
      "directory": "reduced",
      "quality": 90
  },
  "resizes": [
    {
      "size": 300,
      "directory": "resized/small"
    },
    {
      "size": 600,
      "directory": "resized/middle"
    },
    {
      "size": 900,
      "directory": "resized/large"
    }
  ]
}
```

- `bucket`: [String] Destination bucket name at S3 to put processed image. If not supplied, it will use same bucket of event source.
- `reduce`: [Object] Reduce setting.
  - `directory`: [String] Image directory path.
  - `bucket`: [Object] Destination bucket to override. If not supplied, it will use `bucket` setting.
  - `quality`: [Number] Determine reduced image quality ( enables only `JPG` ).
- `resizes`: [Array] Resize setting.
  - `size`: [Number] Image width.
  - `directory`: [String] Image directory path.
  - `bucket`: [Object] Destination bucket to override. If not supplied, it will use `bucket` setting.
  - `quality`: [Number] Determine reduced image quality ( enables only `JPG` ).

If you want to check how this works with your configuration, you can use `configtest`:

```bash
$ make configtest
```

### Complete / Failed hooks

You can handle resize/reduce process on success/error result on `index.js`. `ImageProcessor::run` will return `Promise` object, run your original code:

```javascript
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
