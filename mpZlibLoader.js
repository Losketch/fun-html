const zlib = require('zlib');
const { promisify } = require('util');
const msgpack = require('@msgpack/msgpack');

const unzip = promisify(zlib.unzip);

module.exports = async function(source) {
  try {
    const inputBuffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
    const uncompressed = await unzip(inputBuffer);
    const unpacked = msgpack.decode(uncompressed);
    
    return `module.exports = ${JSON.stringify(unpacked)};`;
  } catch (error) {
    throw new Error(`MP-ZLIB loader failed: ${error.message}.`);
  }
};

module.exports.raw = true;