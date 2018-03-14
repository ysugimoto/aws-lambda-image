# aws-lambda-image

[![Build Status](https://travis-ci.org/ysugimoto/aws-lambda-image.svg?branch=master)](https://travis-ci.org/ysugimoto/aws-lambda-image)
[![Code Climate](https://codeclimate.com/github/ysugimoto/aws-lambda-image/badges/gpa.svg)](https://codeclimate.com/github/ysugimoto/aws-lambda-image)
[![Coverage Status](https://coveralls.io/repos/github/ysugimoto/aws-lambda-image/badge.svg?branch=master)](https://coveralls.io/github/ysugimoto/aws-lambda-image?branch=master)
[![npm version](https://badge.fury.io/js/aws-lambda-image.svg)](https://badge.fury.io/js/aws-lambda-image)
[![Join the chat at https://gitter.im/aws-lambda-image](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/aws-lambda-image?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An AWS Lambda Function to resize/reduce images automatically. When an image is
put on AWS S3 bucket, this package will resize/reduce it and put to S3.

## Requirements

- Node.js ( AWS Lambda working version is **6.10** )

## Preparation

Clone this repository and install dependencies:

```bash
git clone git@github.com:ysugimoto/aws-lambda-image.git
cd aws-lambda-image
npm install .
```

When upload to AWS Lambda, the project will bundle only needed files - no dev
dependencies will be included.

## Configuration

Configuration file you will find under the name `config.json` in project root.
It's copy of our example file `config.json.sample`. More or less it looks like:

```json
{
  "bucket": "your-destination-bucket",
  "backup": {
      "directory": "./original"
  },
  "reduce": {
      "directory": "./reduced",
      "prefix": "reduced-",
      "quality": 90,
      "acl": "public-read",
      "cacheControl": "public, max-age=31536000"
  },
  "resizes": [
    {
      "size": 300,
      "directory": "./resized/small",
      "prefix": "resized-",
      "cacheControl": null
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

### Configuration Parameters

| name                  | field                 | type    | description                                                                                                                                      |
|:---------------------:|:---------------------:|:-------:|--------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | -                     | String  | Destination bucket name at S3 to put processed image. If not supplied, it will use same bucket of event source.                                  |
| jpegOptimizer         | -                     | String  | Determine optimiser that should be used `mozjpeg` (default) or `jpegoptim` ( only `JPG` ).                                                       |
| acl                   | -                     | String  | Permission of S3 object. [See AWS ACL documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).         |
| cacheControl          | -                     | String  | Cache-Control of S3 object. If not specified, defaults to original image's Cache-Control.                                                        |
| keepOriginalExtension | -                     | Boolean | Global setting fo keeping original extension. If `true`, program keeps orignal file extension. otherwise use strict extension eg JPG|jpeg -> jpg |
| backup                | -                     | Object  | Backup original file setting.                                                                                                                    |
|                       | bucket                | String  | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                   |
|                       | directory             | String  | Image directory path. Supports relative and absolute paths. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#directory)                          |
|                       | template              | Object  | Map representing pattern substitution pair. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#template)                                           |
|                       | prefix                | String  | Prepend filename prefix if supplied.                                                                                                             |
|                       | suffix                | String  | Append filename suffix if supplied.                                                                                                              |
|                       | acl                   | String  | Permission of S3 object. [See AWS ACL documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).         |
|                       | cacheControl          | String  | Cache-Control of S3 object. If not specified, defaults to original image's Cache-Control.                                                        |
|                       | keepOriginalExtension | Boolean | If `true`, program keeps orignal file extension. otherwise, use strict extension eg JPG -> jpg                                                   |
|                       | move                  | Boolean | If `true`, an original uploaded file will delete from Bucket after completion.                                                                   |
| reduce                | -                     | Object  | Reduce setting following fields.                                                                                                                 |
|                       | quality               | Number  | Determine reduced image quality ( only `JPG` ).                                                                                                  |
|                       | jpegOptimizer         | String  | Determine optimiser that should be used `mozjpeg` (default) or `jpegoptim` ( only `JPG` ).                                                       |
|                       | bucket                | String  | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                   |
|                       | directory             | String  | Image directory path. Supports relative and absolute paths. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#directory)                          |
|                       | template              | Object  | Map representing pattern substitution pair. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#template)                                           |
|                       | prefix                | String  | Prepend filename prefix if supplied.                                                                                                             |
|                       | suffix                | String  | Append filename suffix if supplied.                                                                                                              |
|                       | acl                   | String  | Permission of S3 object. [See AWS ACL documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).         |
|                       | cacheControl          | String  | Cache-Control of S3 object. If not specified, defaults to original image's Cache-Control.                                                        |
|                       | keepOriginalExtension | Boolean | If `true`, program keeps orignal file extension. otherwise, use strict extension eg JPG -> jpg                                                   |
| resize                | -                     | Array   | Resize setting list of following fields.                                                                                                         |
|                       | size                  | String  | Image dimensions. [See ImageMagick geometry documentation](http://imagemagick.org/script/command-line-processing.php#geometry).                  |
|                       | format                | String  | Image format override. If not supplied, it will leave the image in original format.                                                              |
|                       | crop                  | String  | Dimensions to crop the image. [See ImageMagick crop documentation](http://imagemagick.org/script/command-line-options.php#crop).                 |
|                       | gravity               | String  | Changes how `size` and `crop`. [See ImageMagick gravity documentation](http://imagemagick.org/script/command-line-options.php#gravity).          |
|                       | quality               | Number  | Determine reduced image quality ( forces format `JPG` ).                                                                                         |
|                       | jpegOptimizer         | String  | Determine optimiser that should be used `mozjpeg` (default) or `jpegoptim` ( only `JPG` ).                                                       |
|                       | orientation           | Boolean | Auto orientation if value is `true`.                                                                                                             |
|                       | bucket                | String  | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                                   |
|                       | directory             | String  | Image directory path. Supports relative and absolute paths. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#directory)                          |
|                       | template              | Object  | Map representing pattern substitution pair. Mode details in [DIRECTORY.md](doc/DIRECTORY.md/#template)                                           |
|                       | prefix                | String  | Prepend filename prefix if supplied.                                                                                                             |
|                       | suffix                | String  | Append filename suffix if supplied.                                                                                                              |
|                       | acl                   | String  | Permission of S3 object. [See AWS ACL documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).         |
|                       | cacheControl          | String  | Cache-Control of S3 object. If not specified, defaults to original image's Cache-Control.                                                        |
|                       | keepOriginalExtension | Boolean | If `true`, program keeps orignal file extension. otherwise, use strict extension eg JPG -> jpg                                                   |
| optimizers            | -                     | Object  | Definitions for override the each Optimizers command arguments.                                                                                  |
|                       | pngquant              | Array   | `Pngquant` command arguments. Default is `["--speed=1", "256"]`.                                                                                 |
|                       | jpegoptim             | Array   | `Jpegoptim` command arguments. Default is `["-s", "--all-progressive"]`.                                                                         |
|                       | mozjpeg               | Array   | `Mozjpeg` command arguments. Default is `["-optimize", "-progressive"]`.                                                                         |
|                       | gifsicle              | Array   | `Gifsicle` command arguments. Default is `["--optimize"]`.                                                                                       |

Note that the `optmizers` option will **force** override its command arguments, so if you define these configurations, we don't care any more about how optimizer works.

### Testing Configuration

If you want to check how your configuration will work, you can use:

```bash
npm run test-config
```

## Installation

### Setup

To use the automated deployment scripts you will need to have
[aws-cli installed and configured](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).

Deployment scripts are pre-configured to use some default values for the Lambda
configuration. I you want to change any of those just use:

```bash
npm config set aws-lambda-image:profile default
npm config set aws-lambda-image:region eu-west-1
npm config set aws-lambda-image:memory 1280
npm config set aws-lambda-image:timeout 5
```

### Deployment

Command below will deploy the Lambda function on AWS, together with setting up
roles and policies.

```bash
npm run deploy
```

*Notice*: Because there are some limitations in `Claudia.js` support for
policies, which could lead to issues with `Access Denied` when processing
images from one bucket and saving them to another, we have decided to introduce
support for custom policies.

#### Custom policies

Policies which should be installed together with our Lambda function are stored
in `policies/` directory. We keep there policy that grants access to all
buckets, which is preventing possible errors with `Access Denied` described
above. If you have any security-related concerns, feel free to change the:

```json
"Resource": [
    "*"
]
```

in the `policies/s3-bucket-full-access.json` to something more restrictive,
like:

```json
"Resource": [
    "arn:aws:s3:::destination-bucket-name/*"
]
```

Just keep in mind, that you need to make those changes before you do the
deployment.

### Adding S3 event handlers

To complete installation process you will need to take one more action. It will
allow you to install S3 Bucket event handler, which will send information about
all uploaded images directly to your Lambda function.

```bash
npm run add-s3-handler --s3_bucket="your-bucket-name" --s3_prefix="directory/" --s3_suffix=".jpg"
```

You are able to install multiple handlers per Bucket. So, to add handler for PNG
files you just need to re-run above command with different _suffix_, ie:

```bash
npm run add-s3-handler --s3_bucket="your-bucket-name" --s3_prefix="directory/" --s3_suffix=".png"
```

### Adding SNS message handlers

As an addition, you can also setup and SNS message handler in case you would
like to process S3 events over an SNS topic.

```bash
npm run add-sns-handler --sns_topic="arn:of:SNS:topic"
```

### Updating

To update Lambda with you latest code just use command below. Script will build
new package and automatically publish it on AWS.

```bash
npm run update
```

### More

For more scripts look into [package.json](package.json).

## Complete / Failed hooks

You can handle resize/reduce/backup process on success/error result on
`index.js`. `ImageProcessor::run` will return `Promise` object, run your
original code:

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

## Image resize

- `ImageMagick` (installed on AWS Lambda)

## Image reduce

- [cjpeg](https://github.com/mozilla/mozjpeg)
- [jpegoptim](https://github.com/tjko/jpegoptim)
- [pngquant](https://pngquant.org/)
- [gifsicle](https://github.com/kohler/gifsicle)

## License

MIT License.

## Author

Yoshiaki Sugimoto

## Image credits

Thanks for testing fixture images:

- [pngimg](http://pngimg.com/)
- [pakutaso](https://www.pakutaso.com/)
