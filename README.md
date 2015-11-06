## aws-lambda-image

Automatic image resize/reduce on AWS Lambda. When new images have put on AWS S3 bucket, this package will resize/reduce that image, and put S3.

### Requirements

- `nodejs` (AWS Lambda uses v0.10.26)
- `make`

### Installation

This package written by node.js, clone this project and install depend packages:

```
$ git clone git@github.com:ysugimoto/aws-lambda-image.git
$ cd aws-lambda-image
$ npm install .
```

### Packaging

AWS Lambda accepts ZIP archived package. To create it, simply `make lambda`.

```
$ make lambda
```

It will create `aws-lambda-image.zip` at project root, and upload it.

### Configuration

This package works follow the configuration that written in `config.json` on project root. Just example is `config.json.sample`, please copy and use it.

```
$ cp config.json.sample config.json
```

Configuration is very simple, see below:

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
