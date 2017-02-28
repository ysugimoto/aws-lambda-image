"use strict";

const ImageData = require("../lib/ImageData");
const test      = require("ava");

let image;

test.before(t => {
    image = new ImageData("a/b/c/key.png", "bucket", "data", {});
});

test("Build output path when directory is undefined", t => {
    t.is(image.combineWithDirectory(undefined), "a/b/c/key.png");
});

test("Build output path when directory is empty", t => {
    t.is(image.combineWithDirectory(""), "key.png");
});

test("Build output path when directory is relative deeper", t => {
    t.is(image.combineWithDirectory("./d"), "a/b/c/d/key.png");
});

test("Build output path when directory is relative deeper - 2nd level", t => {
    t.is(image.combineWithDirectory("./d/e"), "a/b/c/d/e/key.png");
});

test("Build output path when directory is relative backward", t => {
    t.is(image.combineWithDirectory(".."), "a/b/key.png");
});

test("Build output path when directory is relative backward with new subdirectory branch", t => {
    t.is(image.combineWithDirectory("../d"), "a/b/d/key.png");
});

test("Build output path when directory is absolute", t => {
    t.is(image.combineWithDirectory("d"), "d/key.png");
});

test("Build output path when directory is absolute - 2nd level", t => {
    t.is(image.combineWithDirectory("d/e"), "d/e/key.png");
});

test("Build output path with prefix", t => {
    t.is(image.combineWithDirectory("d/e", "prefix-"), "d/e/prefix-key.png");
});

test("Build output path with suffix", t => {
    t.is(image.combineWithDirectory("d/e", "", "-suffix"), "d/e/key-suffix.png");
});

test("Build output path with prefix and suffix", t => {
    t.is(image.combineWithDirectory("d/e", "prefix-", "_suffix"), "d/e/prefix-key_suffix.png");
});

test("[RegEx] Build output path when directory is an empty object", t => {
    t.is(image.combineWithDirectory({}), "a/b/c/key.png");
});

test("[RegEx] Build output path when directory is an empty regex map", t => {
    t.is(image.combineWithDirectory({regex: {}}), "a/b/c/key.png");
});

test("[RegEx] Build output path when directory is an regex map with find and replace keys empty", t => {
    t.is(image.combineWithDirectory({regex: {find: "", replace: ""}}), "a/b/c/key.png");
});

test("[RegEx] Build output path when directory is an regex map with replace keys is missing", t => {
    t.is(image.combineWithDirectory({regex: {find: ""}}), "a/b/c/key.png");
});

test("[RegEx] Build output path when regex replace whole directory", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: ""}}), "key.png");
});

test("[RegEx] Build output path when regex adds subdirectory", t => {
    t.is(image.combineWithDirectory({regex: {find: "$", replace: "/d"}}), "a/b/c/d/key.png");
});

test("[RegEx] Build output path when regex adds subdirectory - 2nd level", t => {
    t.is(image.combineWithDirectory({regex: {find: "$", replace: "/d/e"}}), "a/b/c/d/e/key.png");
});

test("[RegEx] Build output path when regex removes top subdirectory", t => {
    t.is(image.combineWithDirectory({regex: {find: "[a-zA-Z]+$", replace: ""}}), "a/b/key.png");
});

test("[RegEx] Build output path when regex replaces top subdirectory with new one", t => {
    t.is(image.combineWithDirectory({regex: {find: "\/c", replace: "/d"}}), "a/b/d/key.png");
});

test("[RegEx] Build output path when regex replaces old path with new absolute one", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: "d"}}), "d/key.png");
});

test("[RegEx] Build output path when regex replaces old path with new absolute one - 2nd level", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: "d/e"}}), "d/e/key.png");
});

test("[RegEx] Build output path with regex and prefix", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: "d/e"}}, "prefix-"), "d/e/prefix-key.png");
});

test("[RegEx] Build output path with regex and suffix", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: "d/e"}}, "", "-suffix"), "d/e/key-suffix.png");
});

test("[RegEx] Build output path with regex, prefix and suffix", t => {
    t.is(image.combineWithDirectory({regex: {find: ".*", replace: "d/e"}}, "prefix-", "_suffix"), "d/e/prefix-key_suffix.png");
});
