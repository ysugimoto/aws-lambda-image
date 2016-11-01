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
  "backup": {
      "directory": "./original",
  },
  "reduce": {
      "directory": "./reduced",
      "quality": 90
  },
  "resizes": [
    {
      "size": 300,
      "directory": "./resized/small"
    },
    {
      "size": "600x600^",
      "gravity": "Center",
      "crop": "600x600",
      "directory": "./resized/cropped-to-square"
    },
    {
      "size": 600,
      "directory": "./resized/600-jpeg",
      "format": "jpg",
      "background": "white"
    },
    {
      "size": 900,
      "directory": "./resized/large",
      "quality": 90
    }
  ]
}
```

- `bucket`: [String] Destination bucket name at S3 to put processed image. If not supplied, it will use same bucket of event source.
- `backup`: [Object] Backup original file setting.
  - `directory`: [String] Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.
  - `bucket`: [Object] Destination bucket to override. If not supplied, it will use `bucket` setting.
- `reduce`: [Object] Reduce setting.
  - `directory`: [String] Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.
  - `bucket`: [Object] Destination bucket to override. If not supplied, it will use `bucket` setting.
  - `quality`: [Number] Determine reduced image quality ( enables only `JPG` ).
- `resizes`: [Array] Resize setting.
  - `background`: [String] Background color to use for transparent pixels when destination image doesn't support transparency.
  - `bucket`: [Object] Destination bucket to override. If not supplied, it will use `bucket` setting.
  - `crop`: [String] Dimensions to crop the image. [See ImageMagick crop documentation](http://imagemagick.org/script/command-line-options.php#crop).
  - `directory`: [String] Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.
  - `format`: [String] Image format override. If not supplied, it will leave the image in original format.
  - `gravity`: [String] Changes how `size` and `crop`. [See ImageMagick gravity documentation](http://imagemagick.org/script/command-line-options.php#gravity).
  - `quality`: [Number] Determine reduced image quality ( enables only `JPG` ).
  - `size`: [String] Image dimensions. [See ImageMagick geometry documentation](http://imagemagick.org/script/command-line-processing.php#geometry).

If you want to check how this works with your configuration, you can use `configtest`:

```bash
$ make configtest
```

### Complete / Failed hooks

You can handle resize/reduce/backup process on success/error result on `index.js`. `ImageProcessor::run` will return `Promise` object, run your original code:

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
