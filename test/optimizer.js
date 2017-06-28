"use strict";

const Pngquant  = require("../lib/optimizer/Pngquant");
const Jpegoptim = require("../lib/optimizer/JpegOptim");
const Mozjpeg   = require("../lib/optimizer/Mozjpeg");
const Gifsicle  = require("../lib/optimizer/Gifsicle");
const test      = require("ava");

test("Pngquant accepts override arguments", async t => {
  const pngquant = new Pngquant(["--lorem", "--ipsum"]);

  t.is(pngquant.args[0], "--lorem");
  t.is(pngquant.args[1], "--ipsum");
  // Override, but stdout argument must be exists
  t.is(pngquant.args[2], "-");
});

test("Jpegoptim accepts override arguments", async t => {
  const jpegoptim = new Jpegoptim(90, ["--lorem", "--ipsum"]);

  // Override, but stdin argument must be exists
  t.is(jpegoptim.args[0], "--stdin");
  t.is(jpegoptim.args[1], "-m");
  t.is(jpegoptim.args[2], 90);
  t.is(jpegoptim.args[3], "--lorem");
  t.is(jpegoptim.args[4], "--ipsum");
  t.is(jpegoptim.args[5], "--stdout");
});

test("Mozjpeg accepts override arguments", async t => {
  const mozjpeg = new Mozjpeg(90, ["--lorem", "--ipsum"]);

  // Override, but stdin argument must be exists
  t.is(mozjpeg.args[0], "-quality");
  t.is(mozjpeg.args[1], 90);
  t.is(mozjpeg.args[2], "--lorem");
  t.is(mozjpeg.args[3], "--ipsum");
});

test("Gifsicle accepts override arguments", async t => {
  const gifsicle = new Gifsicle(["--lorem", "--ipsum"]);

  // Override, but stdin argument must be exists
  t.is(gifsicle.args[0], "--lorem");
  t.is(gifsicle.args[1], "--ipsum");
});
