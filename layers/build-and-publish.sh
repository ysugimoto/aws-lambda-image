#!/bin/bash

docker build -t aws-lambda-image-layer .
docker run --rm aws-lambda-image-layer cat /tmp/aws-lambda-image-layer.zip > ./aws-lambda-image-layer.zip

REGIONS='
ap-northeast-1
ap-northeast-2
ap-south-1
ap-southeast-1
ap-southeast-2
ca-central-1
eu-north-1
eu-central-1
eu-west-1
eu-west-2
eu-west-3
sa-east-1
us-east-1
us-east-2
us-west-1
us-west-2
'

for region in $REGIONS; do
    version=$(aws lambda publish-layer-version \
        --region $region \
        --layer-name aws-lambda-image-layer \
        --zip-file fileb://aws-lambda-image-layer.zip \
        --description "bundled binaries layer for aws-lambda-image" \
        --query Version \
        --output text)

    aws lambda add-layer-version-permission \
        --region $region \
        --layer-name aws-lambda-image-layer \
        --statement-id aws-lambda-image-layer-sid \
        --action lambda:GetLayerVersion \
        --principal '*' \
        --version-number ${version}
done
