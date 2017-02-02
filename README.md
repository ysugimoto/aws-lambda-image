## aws-lambda-image

[![Build Status](https://travis-ci.org/ysugimoto/aws-lambda-image.svg?branch=master)](https://travis-ci.org/ysugimoto/aws-lambda-image)
[![Code Climate](https://codeclimate.com/github/ysugimoto/aws-lambda-image/badges/gpa.svg)](https://codeclimate.com/github/ysugimoto/aws-lambda-image)
[![npm version](https://badge.fury.io/js/aws-lambda-image.svg)](https://badge.fury.io/js/aws-lambda-image)
[![Join the chat at https://gitter.im/aws-lambda-image](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/aws-lambda-image?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


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
      "prefix": "reduced-",
      "quality": 90,
      "acl": "public-read"
  },
  "resizes": [
    {
      "size": 300,
      "directory": "./resized/small",
      "prefix": "resized-",
    },
    {
      "size": 450,
      "directory": "./resized/medium",
      "suffix": "_medium"
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

#### Configuration Parameters

|  name  |    field    |   type  |                                                               description                                                                                                                     |
|:------:|:-----------:|:-------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket |      -      |  String | Destination bucket name at S3 to put processed image. If not supplied, it will use same bucket of event source.                                                                               |
|  acl   |      -      |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property). If not supplied, it will use same one from file operations.     |
| backup |      -      |  Object | Backup original file setting.                                                                                                                                                                 |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                                                                             |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                                                                |
|        |     acl     |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).                                                                 |
| reduce |      -      |  Object | Reduce setting following fields.                                                                                                                                                              |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                                                                             |
|        |    prefix   |  String | Append filename prefix if supplied.                                                                                                                                                           |
|        |    suffix   |  String | Append filename suffix if supplied.                                                                                                                                                           |
|        |   quality   |  Number | Determine reduced image quality ( enables only `JPG` ).                                                                                                                                       |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                                                                |
|        |     acl     |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).                                                                 |
| resize |      -      |  Array  | Resize setting list of following fields.                                                                                                                                                      |
|        |  background |  String | Background color to use for transparent pixels when destination image doesn't support transparency.                                                                                           |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                                                                |
|        |     crop    |  String | Dimensions to crop the image. [See ImageMagick crop documentation](http://imagemagick.org/script/command-line-options.php#crop).                                                              |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                                                                             |
|        |    prefix   |  String | Append filename prefix if supplied.                                                                                                                                                           |
|        |    suffix   |  String | Append filename suffix if supplied.                                                                                                                                                           |
|        |   gravity   |  String | Changes how `size` and `crop`. [See ImageMagick gravity documentation](http://imagemagick.org/script/command-line-options.php#gravity).                                                       |
|        |   quality   |  Number | Determine reduced image quality ( forces format `JPG` ).                                                                                                                                      |
|        |    format   |  String | Image format override. If not supplied, it will leave the image in original format.                                                                                                           |
|        |     size    |  String | Image dimensions. [See ImageMagick geometry documentation](http://imagemagick.org/script/command-line-processing.php#geometry).                                                               |
|        | orientation | Boolean | Auto orientation if value is `true`.                                                                                                                                                          |
|        |     acl     |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).                                                                 |

If you want to check how this works with your configuration, you can use `configtest`:

```bash
$ make configtest
```

### Deployment

To make use of the automated deployment you need to have [aws-cli installed and configured](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).
In addition you will need to setup some environment variables:

- `LAMBDA_FUNCTION_NAME` _(mandatory)_ - represents the name of the Lambda function under which it should be installed or updated.
- `AWS_PROFILE` _(optional)_ - allows you to choose which aws configuration profile should be used to upload your Lambda. If not
provided script will use `default` profile.

#### Installation

Unfortunately automated installation process is not available yet.

#### Updating

To update lambda with you latest code just use the command below. Script will build the `aws-lambda-image.zip` archive and automatically
 publish it on AWS.

```bash
$ make uploadlambda
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
