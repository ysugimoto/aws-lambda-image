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

LAYER_JSON=()
for region in $REGIONS; do
    echo "deploying layer image to ${region}"
    version=$(aws lambda publish-layer-version \
        --region $region \
        --layer-name aws-lambda-image-layer \
        --zip-file fileb://aws-lambda-image-layer.zip \
        --description "bundled binaries layer for aws-lambda-image" \
        --query Version \
        --output text)
    [ $? -eq 0 ] || exit 1
    echo "version is ${version}"
    aws lambda add-layer-version-permission \
        --region $region \
        --layer-name aws-lambda-image-layer \
        --statement-id aws-lambda-image-layer-sid \
        --action lambda:GetLayerVersion \
        --principal '*' \
        --version-number ${version}
    [ $? -eq 0 ] || exit 1
    LAYER_JSON+=("  \"${region}\": \"arn:aws:lambda:${region}:251217462751:layer:aws-lambda-image-layer:${version}\"")
done

OUT="{"
for L in "${LAYER_JSON[@]}"; do
    if [ "${L}" = "${LAYER_JSON[${#LAYER_JSON[*]}-1]}" ]; then
        OUT="${OUT}\n${L}"
    else
        OUT="${OUT}\n${L},"
    fi
done
OUT="${OUT}\n}"
echo -e "$OUT" > ../scripts/layers.json
