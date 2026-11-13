import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import {PORTFOLIO_COPY} from '../portfolio-copy.js';
import {RANDOMIZER_COPY} from '../randomizer-copy.js';
import {MOVIES,FOODS} from '../randomizer-data.js';
const font=await readFile(new URL('../public/fonts/gnwaa-unifont-jp.woff',import.meta.url));
assert.equal(font.toString('ascii',0,4),'wOFF');assert.ok(font.length<1500000);
let cmap;
for(let i=0;i<font.readUInt16BE(12);i++){
 const p=44+i*20;if(font.toString('ascii',p,p+4)!=='cmap')continue;
 const packed=font.subarray(font.readUInt32BE(p+4),font.readUInt32BE(p+4)+font.readUInt32BE(p+8));
 cmap=packed.length===font.readUInt32BE(p+12)?packed:inflateSync(packed);
}
assert.ok(cmap,'Real font cmap table exists');
const tables=[];for(let i=0;i<cmap.readUInt16BE(2);i++){const offset=cmap.readUInt32BE(4+i*8+4);if(cmap.readUInt16BE(offset)===4)tables.push(cmap.subarray(offset));}
function hasGlyph(code){return tables.some(t=>{const n=t.readUInt16BE(6)/2;for(let i=0;i<n;i++){const end=t.readUInt16BE(14+i*2),start=t.readUInt16BE(16+n*2+i*2);if(code<start||code>end)continue;const delta=t.readInt16BE(16+n*4+i*2),rangePos=16+n*6+i*2,range=t.readUInt16BE(rangePos);if(!range)return ((code+delta)&65535)!==0;const glyph=t.readUInt16BE(rangePos+range+2*(code-start));return glyph!==0;}return false;});}
const text=JSON.stringify([PORTFOLIO_COPY,RANDOMIZER_COPY,MOVIES,FOODS])+'ӨөҮүЁёこんにちは漢字';
const chars=[...new Set([...text].map(c=>c.codePointAt(0)))].filter(code=>code>=32&&code<=65535);
const missing=chars.filter(code=>!hasGlyph(code));
assert.deepEqual(missing,[], 'Visible MN/EN/JA data has actual pixel glyphs');
console.log('Pixel font passed: '+chars.length+' distinct BMP glyphs, including Mongolian Cyrillic and Japanese, verified from the local WOFF cmap.');
