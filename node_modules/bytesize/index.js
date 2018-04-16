const zlib = require('zlib');
const fs = require('fs');
const prettyBytes = require('pretty-bytes');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const gzipAsync = util.promisify(zlib.gzip);

const prettify = (bytes, pretty) => ((pretty) ? prettyBytes(bytes) : bytes);

const stringSize = (str, pretty) => prettify(Buffer.byteLength(str), pretty);

const gzipStringSize = async(str, pretty) => prettify((await gzipAsync(str)).byteLength, pretty);

const fileSize = async(file, pretty, gzip) => {
  const fileData = await readFileAsync(file, 'utf8');
  if (gzip) {
    const buf = await gzipAsync(fileData);
    return prettify(buf.length, pretty);
  }
  return stringSize(fileData, pretty);
};

const gzipSize = (file, pretty) => fileSize(file, pretty, true);

module.exports.stringSize = stringSize;
module.exports.gzipStringSize = gzipStringSize;
module.exports.fileSize = fileSize;
module.exports.gzipSize = gzipSize;
