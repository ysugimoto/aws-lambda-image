# AWS Lambda Layer Configuration

Since node10.x runtime, no longer `ImageMagick` is bundled on runtime. Therefore we need use Lambda Layer to enable it.

We provides dedicated Lambda Layer which is bundled binaries we need to run correctly,
and enables it automatically with corresponds your region to deploy.

Then you need to define region to deploy function in `package.json`:

```json
# package.json
{
    ...
    "config": {
        "region": "<put region here>"
    },
    ...
}
```

When you run `npm run deploy` or other deploy command, pre-deployed layer will be applied automatically with your regions.

## Support regions

Now we're supporting following regions:

- ap-northeast-1
- ap-northeast-2
- ap-south-1
- ap-southeast-1
- ap-southeast-2
- ca-central-1
- eu-north-1
- eu-central-1
- eu-west-1
- eu-west-2
- eu-west-3
- sa-east-1
- us-east-1
- us-east-2
- us-west-1
- us-west-2

If you want to use in other regions, please contact us by creating an issue.
