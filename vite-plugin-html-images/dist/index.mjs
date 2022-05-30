var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/index.ts
import {
  basename,
  extname,
  parse,
  resolve
} from "path";
import {
  parse as parse2
} from "url";
import {
  existsSync,
  mkdirSync,
  rmSync,
  statSync
} from "fs";
import chalk from "chalk";
import { normalizePath } from "vite";

// src/defaults.ts
var defaultImageOptions = {
  tempDirname: ".img",
  regexp: /img\/.+\.(jpg|jpeg|png|gif)[^( |"|')]+/g
};

// src/index.ts
import sharp from "sharp";
var src_default = (imgOptions, optOptions = {}) => {
  let isDevServer = false;
  let srcDir;
  let tempPath;
  imgOptions = __spreadValues(__spreadValues({}, defaultImageOptions), imgOptions);
  const { tempDirname, regexp } = imgOptions;
  return {
    name: "vite-plugin-html-images",
    enforce: "pre",
    configResolved: onConfigResolved,
    transformIndexHtml: {
      enforce: "pre",
      transform: handleHtmlTransformation
    }
  };
  function onConfigResolved(resolvedConfig) {
    isDevServer = resolvedConfig.command === "serve";
    srcDir = resolvedConfig.root;
    if (!srcDir.endsWith("src"))
      srcDir += "/src";
    tempPath = resolve(srcDir, tempDirname);
    !existsSync(tempPath) && mkdirSync(tempPath);
    registerShutdownCallback();
  }
  async function handleHtmlTransformation(html) {
    let images;
    images = Array.from(html.matchAll(regexp));
    if (!images.length)
      return;
    for (const match of images) {
      html = await processImage(match[0], tempPath, html);
    }
    return html;
  }
  async function processImage(src, outDir, html) {
    const stripped = src.replace(/"/g, "");
    const imageUrl = parse2(stripped, true);
    if (!imageUrl.pathname)
      return html;
    const decodedPathname = decodeURI(imageUrl.pathname);
    const pathname = decodedPathname.startsWith("/") ? decodedPathname.slice(1, decodedPathname.length) : decodedPathname;
    const basename2 = basename(pathname);
    const filename = resolve(srcDir, pathname);
    const params = imageUrl.query;
    const sharpImage = await sharp(filename);
    let outName = parse(basename2).name;
    let outExt = parse(basename2).ext;
    if (params["width"] || params["height"]) {
      outName += await handleResizeWidth(sharpImage, params["width"], params["height"]);
    }
    if (params["format"]) {
      outExt = await handleFormat(params["format"], sharpImage, params.quality);
    } else if (params["quality"]) {
      outExt = await handleFormat(getExt(basename2), sharpImage, params.quality);
    }
    outName += outExt;
    if (outName === stripped)
      return html;
    const outPath = resolve(outDir, outName);
    if (!existsSync(outPath)) {
      const originalSize = getFileSize(filename);
      const start = new Date();
      await sharpImage.toFile(outPath);
      const end = new Date();
      isDevServer && printStats(outName, originalSize, getFileSize(outPath), start, end);
    }
    return html.replace(src, normalizePath(`${tempDirname}/${outName}`));
  }
  function printStats(outName, originalSize, newSize, start, end) {
    const maxLabelLength = 30;
    const seconds = ((end.getTime() - start.getTime()) / 1e3).toString();
    if (outName.length > maxLabelLength)
      outName = outName.substring(0, maxLabelLength - 1) + "\u2026";
    let cliMsgName = chalk`{grey Generated} {magenta ${outName.padEnd(40)}}`;
    const cliMsgValue = chalk`(${originalSize.toString()} kB → {${originalSize > newSize ? "green" : "red"} ${newSize.toString()} kB})`;
    const cliMsg = cliMsgName + cliMsgValue;
    const cliMsgTime = chalk`{grey in ${seconds}s}`;
    console.info(cliMsg.padEnd(100) + cliMsgTime);
  }
  async function handleResizeWidth(sharpImage, width, height) {
    const _width = width ? parseInt(width) : null;
    const _height = height ? parseInt(height) : null;
    if (_width && isNaN(_width))
      console.error(`Parameter width with value ${width} is not parsable to integer.`);
    if (_height && isNaN(_height))
      console.error(`Parameter width with value ${height} is not parsable to integer.`);
    await sharpImage.resize({
      width: _width,
      height: _height
    });
    return (_width ? `.w${_width}` : "") + (_height ? `.h${_height}` : "");
  }
  async function handleFormat(format, sharpImage, quality) {
    var _a;
    const resolvedFormat = format === "jpg" ? "jpeg" : format;
    const parsedQuality = quality && typeof quality === "string" ? parseInt(quality) : null;
    if (!Object.keys(sharp.format).includes(resolvedFormat))
      console.error(`Image format ${resolvedFormat} is not supported.`);
    if (parsedQuality && isNaN(parsedQuality))
      console.error(`Image quality ${quality} is not valid integer.`);
    const baseOptions = optOptions[resolvedFormat] || {};
    const options = parsedQuality ? __spreadProps(__spreadValues({}, baseOptions), { quality: parsedQuality }) : baseOptions;
    const info = await sharpImage[resolvedFormat](options);
    const outputQuality = ((_a = info == null ? void 0 : info.options) == null ? void 0 : _a[`${resolvedFormat}Quality`]) || null;
    return (outputQuality ? `.q${outputQuality}` : "") + `.${format}`;
  }
  function getExt(filename) {
    const ext = extname(filename || "").split(".");
    return ext[ext.length - 1];
  }
  function getFileSize(filename) {
    return Math.round(statSync(filename).size / 1024);
  }
  function registerShutdownCallback() {
    process.on("SIGINT", function() {
      existsSync(tempPath) && rmSync(tempPath, { recursive: true });
      process.exit();
    });
  }
};
export {
  src_default as default
};
