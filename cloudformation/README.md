# CloudFormation Template(s) for `AWS-Lambda-Image`

This contains cloudformation template(s) to spin up a working bucket/lambda stack.  Although it only spins up one set of resources, due to limitations in CloudFormation there are 3 templates, to be run sequentally.

There is one parameter in the template, a domain name.  This will be appended onto the name of the s3 bucket in order to create a uniquely named bucket.  As it is currently configured, there is a `images/raw` path that accepts incoming images, and an `images/small` and `images/medium` that get the resized images.  These directories are set to allow public access as a website.  The included copy of `config.json` matches the paths specified in cloudformation as an example.  Please change to fit your needs.

Steps in order to spin the stack up:


1. Spin up stack 1.  This will create 2 buckets in s3, an `image` bucket and an `admin` bucket. 
2. Build the lambda archive as usual with `make`.  Upload the .zip file of code to the `admin` bucket.  If you do not upload it at `lambda/aws-lambda-image.zip`, you will need to change stack 2 and 3 to reflect the path 
3. Update with stack 2.  This will create the lambda and the lambda permission objects 
4. Update with stack 3.  This will setup the trigger between the s3 bucket and the lambda and grant public access to the processed paths in the bucket
