## aws-lambda-image

[![Build Status](https://travis-ci.org/ysugimoto/aws-lambda-image.svg?branch=master)](https://travis-ci.org/ysugimoto/aws-lambda-image)
[![Code Climate](https://codeclimate.com/github/ysugimoto/aws-lambda-image/badges/gpa.svg)](https://codeclimate.com/github/ysugimoto/aws-lambda-image)
[![Coverage Status](https://coveralls.io/repos/github/ysugimoto/aws-lambda-image/badge.svg?branch=master)](https://coveralls.io/github/ysugimoto/aws-lambda-image?branch=master)
[![npm version](https://badge.fury.io/js/aws-lambda-image.svg)](https://badge.fury.io/js/aws-lambda-image)
[![Join the chat at https://gitter.im/aws-lambda-image](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/aws-lambda-image?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


An AWS Lambda Function to resize/reduce images automatically. When an image is put on AWS S3 bucket, this package will resize/reduce it and put to S3.

### Requirements

- `node.js` ( AWS Lambda working version is **4.3.2** )

### Installation

Clone this repository and install dependencies:

```bash
$ git clone git@github.com:ysugimoto/aws-lambda-image.git
$ cd aws-lambda-image
$ npm install .
```

When upload to AWS Lambda, the project will bundle only needed files - no dev dependencies will be included.

### Configuration

Configuration file you will find under the name `config.json` in project root. It's copy of our example file `config.json.sample`.
More or less it looks like:

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
      "acl": "public-read"
  },
  "resizes": [
    {
      "size": 300,
      "directory": "./resized/small",
      "prefix": "resized-"
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

|  name  |    field    |   type  |                                                               description                                                               |
|:------:|:-----------:|:-------:|---------------------------------------------------------------------------------------------------------------------------------------  |
| bucket |      -      |  String | Destination bucket name at S3 to put processed image. If not supplied, it will use same bucket of event source.                         |
| backup |      -      |  Object | Backup original file setting.                                                                                                           |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                       |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                          |
| reduce |      -      |  Object | Reduce setting following fields.                                                                                                        |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                       |
|        |    prefix   |  String | Append filename prefix if supplied.                                                                                                     |
|        |    suffix   |  String | Append filename suffix if supplied.                                                                                                     |
|        |   quality   |  Number | Determine reduced image quality ( enables only `JPG` ).                                                                                 |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                          |
|        |     acl     |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).           |
| resize |      -      |  Array  | Resize setting list of following fields.                                                                                                |
|        |  background |  String | Background color to use for transparent pixels when destination image doesn't support transparency.                                     |
|        |    bucket   |  String | Destination bucket to override. If not supplied, it will use `bucket` setting.                                                          |
|        |     crop    |  String | Dimensions to crop the image. [See ImageMagick crop documentation](http://imagemagick.org/script/command-line-options.php#crop).        |
|        |  directory  |  String | Image directory path. When starts with `./` relative to the source, otherwise creates a new tree.                                       |
|        |    prefix   |  String | Append filename prefix if supplied.                                                                                                     |
|        |    suffix   |  String | Append filename suffix if supplied.                                                                                                     |
|        |   gravity   |  String | Changes how `size` and `crop`. [See ImageMagick gravity documentation](http://imagemagick.org/script/command-line-options.php#gravity). |
|        |   quality   |  Number | Determine reduced image quality ( forces format `JPG` ).                                                                                |
|        |    format   |  String | Image format override. If not supplied, it will leave the image in original format.                                                     |
|        |     size    |  String | Image dimensions. [See ImageMagick geometry documentation](http://imagemagick.org/script/command-line-processing.php#geometry).         |
|        | orientation | Boolean | Auto orientation if value is `true`.                                                                                                    |
|        |     acl     |  String | Permission of S3 object. [See acl values](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property).           |

#### Testing Configuration

If you want to check how your configuration will work, you can use:

```bash
$ npm run test-config
```

### Installation

#### Preparations

To use the automated deployment scripts you will need to have [aws-cli installed and configured](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).

Deployment scripts are pre-configured to use some default values for the Lambda configuration. I you want to change any of those
 just use:

```bash
$ npm config set aws-lambda-image:profile default
$ npm config set aws-lambda-image:region eu-west-1
$ npm config set aws-lambda-image:memory 1280
$ npm config set aws-lambda-image:timeout 5
```

#### Deployment

Command below will deploy the Lambda function on AWS, together with setting up roles and policies.

```bash
$ npm run deploy
```

*Notice*: Because there are some limitations in `Claudia.js` support for policies, which could lead to issues
with `Access Denied` when processing images from one bucket and saving them to another, we have decided to introduce support
for custom policies.

##### Custom policies

Policies which should be installed together with our Lambda function are stored in `policies/` directory. We keep there
policy that grants access to all buckets, which is preventing possible errors with `Access Denied` described above. If you
have any security-related concerns, feel free to change the:

```json
"Resource": [
    "*"
]
```

in the `policies/s3-bucket-full-access.json` to something more restrictive, like:

```json
"Resource": [
    "arn:aws:s3:::destination-bucket-name/*"
]
```

Just keep in mind, that you need to make those changes before you do the deployment.

#### Adding S3 event handlers

To complete installation process you will need to take one more action. It will allow you to install S3 Bucket event handler,
which will send information about all uploaded images directly to your Lambda function.

```bash
$ npm run add-s3-handler --s3_bucket="your-bucket-name" --s3_prefix="directory/" --s3_suffix=".jpg"
```

*Note:* Unfortunately, for now `Clauda.js` is able to install only one such handler per Bucket. This [issue](https://github.com/claudiajs/claudia/issues/101)
has been already raised and hopefully will be fixed soon. 

#### Updating

To update Lambda with you latest code just use command below. Script will build new package and automatically
publish it on AWS.

```bash
$ npm run update
```

#### More

For more scripts look into [package.json](package.json).

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
- `gifsicle`

### License

MIT License.

### Author

Yoshiaki Sugimoto

### Image credits

Thanks for testing fixture images:

- http://pngimg.com/
- https://www.pakutaso.com/
