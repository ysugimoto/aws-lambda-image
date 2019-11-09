FROM node:8.10-alpine

ARG AWS_CLI_VERSION=1.16.86

RUN apk --update add python py-pip bash make imagemagick && \
    pip --no-cache-dir install awscli==$AWS_CLI_VERSION
