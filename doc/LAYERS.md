# AWS Lambda Layer Configuration

Since node10.x runtime, no longer `ImageMagick` is bundled on runtime. Therefore we can use it by using Lambda Layer.

To work this project as well, you need to install a couple of Layers:

- `ImageMagick` - https://github.com/serverlesspub/imagemagick-aws-lambda-2
- `GraphicsMagick` - https://github.com/rpidanny/gm-lambda-layer

ImageMagick Layer is purpose for resizing image, and GraphicsMagick is purpose for redusing image because this layer bundles some image related shared library (e.g libpng, libjpeg, ...).

## Installation

You can deploy ImageMagick Lambda Layer via `https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:145266761615:applications~image-magick-lambda-layer` which publicly used.

[image]

Press the `Deploy` button and deploy ImageMagick layer, then **make sure deployment region which you're going to deploy is the same as Lambda function**. For instance, if you're going to deploy function onto `eu-west-1`, then this layer also should be deployed on `eu-west-1`.

After finished to deploy, you can see Layer arn of layer via `Layers` menu:

[image]

Copy the _arn_ and put it to this project `package.json` config:

```json
# package.json
{
    ...
    "config": {
        "layer": "<put arn here>"
    },
    ...
}

Thats' all. When you run `npm run deploy` or other deploy command, the installed layer will be applied. The GraphicsMagick layer has already in some developper's layer so we'll apply automatically correspond to your region.

