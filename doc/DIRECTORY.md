# Directory configuration

There are few ways of setting the output directory for processed files. All
of them work in the same way for resized, reduced and archived images.  

## Nothing

You are allowed to choose to do not setup any output directory configuration and 
use only `prefix` and/or `suffix` parameters. Just bare in mind that in such
case all output files will be saved in same directory as input file -  
[S3 event notification limitations](#s3-event-notification-limitations).

## Directory

| Parameter | Type   | Required |
|:---------:|:------:|:--------:|
| directory | String | no       |

`directory` parameter should be a `String` representing output path. It could be
an absolute (ie. `output/`) or relative (ie. `../output/`, `./output`) path. If
you decide to use relative path, bare in mind that this could lead to situation
where all output files will be saved in same directory structure as input file -
[S3 event notification limitations](#s3-event-notification-limitations).

## Template

| Parameter | Type   | Required |
|:---------:|:------:|:--------:|
| template  | Object | no       |

`template` parameter is a `Map` with two keys: `pattern` and `output`, ie.:

```
{
    template: {
        pattern: "*path/c",
        output: "*path/d"
    }
}
```

`pattern` defines a pattern that describe path of input file directory. It's
used for matching and and parsing, which allows you to store parts of parsed
input directory as variables. More details in [Syntax](#template-syntax)
section.

`output` defines a pattern that describe output directory path. It allows you to
reuse variables parsed from input directory, like in example above. More details
in [Syntax](#template-syntax) section.

If you decide to use `template` parameter, bare in mind to avoid situation
where output files will be saved in same directory structure as input file -
[S3 event notification limitations](#s3-event-notification-limitations).

### Template syntax

**Source**: [path-template](https://github.com/matsadler/path-template/blob/master/readme.md#template-syntax)

The characters `:`, `*`, `(`, and `)` have special meanings.

`:` indicates the following segment is the name of a variable
`*` indicates the following segment is the splat/glob
`(` starts an optional segment
`)` ends an optional segment

additionally `/` and `.` will start a new segment.

##### Static Segments

    "/foo/bar.baz"
     ^   ^   ^
     |   |   Starts a segment, matching ".baz"
     |   |
     |   Starts a segment, matching "/bar"
     |
     Starts a segment, matching "/foo"

##### Variables

    "/foo/:bar.baz"
     ^    ^   ^
     |    |   Starts a new segment, that matches ".baz"
     |    |
     |    Matches anything up to the start of the next segment, with the value
     |    being stored in the "bar" parameter of the returned match object
     |
     Starts a segment, matching "/foo"

##### Splat/Glob

    "/foo/*bar"
     ^    ^
     |    Matches any number of segments, the values being stored as an array
     |    in the "bar" parameter of the returned match object
     |
     Starts a segment, matching "/foo"

###### Anonymous Splat/Glob

    "/foo/*"
     ^    ^
     |    Matches any number of segments, the values will not appear in the
     |    returned match object
     |
     Starts a segment, matching "/foo"

##### Optional Segments

    "/foo(/baz)/baz"
     ^   ^    ^^
     |   |    |Starts a new segment, that matches "/baz"
     |   |    |
     |   |    Ends the optional segment
     |   |
     |   Starts an optional segment, this segment need not be in the path being
     |   matched for the match to be successful
     |
     Starts a segment, matching "/foo"

### More examples

Examples of `template` usage cases you can find in our
[test files](../test/image-data.js).

## S3 event notification limitations

S3 event notifications are limited to filter file events only by predefined
`prefix` and `suffix`. This could be problematic in situation where you decide
to store output files in the same directory structure as the input image. This
could cause S3 to fire new event notification for each output image saved in
that path. In extreme case this could lead to situation where Lambda
functions are executed in never ending loop. But, we are prepared to prevent
such incidents, or maybe I should rather say, we are prepared to minimise the
potential damage.

Each processed file is stored with additional 
`Metadata: { img-processed: true }`. Also, each input file that we process is
checked against this `flag`, and if it's present, we will stop the processing
flow with `"Object was already processed."` error message.
