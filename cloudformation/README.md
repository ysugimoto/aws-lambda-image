h1. CloudFormation Template(s) for `AWS-Lambda-Image`

This contains cloudformation template(s) to spin up a working bucket/lambda stack.  Although it only spins up one set of resources, due to limitations in CloudFormation there are 3 templates, to be run sequentally.

There is one parameter in the template, a domain name.  This will be appended onto the name of the s3 bucket in order to create a uniquely named bucket.  In order to spin the stack up:

# Spin up stack 1.  This will create 2 buckets in s3, an `image` bucket and an `admin` bucket.
# Upload the .zip file of code to the `admin` bucket.  If you do not upload it at `lambda/aws-lambda-image.zip`, you will need to change stack 2 and 3 to reflect the path
# Update with stack 2.  This will create the lambda and the lambda permission objects
# Update with stack 3.  This will setup the trigger between the s3 bucket and the lambda
