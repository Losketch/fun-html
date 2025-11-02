import decompress from '@js/mpZlibDecompresser.js';
import _dt from '@data/mp.zlib/handata_uni.dt.mp.zlib';
import _vt from '@data/mp.zlib/handata_uni.vt.mp.zlib';
import _sc from '@data/mp.zlib/handata_uni.sc.mp.zlib';

export const dt = decompress(_dt);
export const vt = decompress(_vt);
export const standardChars = new Set(decompress(_sc));
