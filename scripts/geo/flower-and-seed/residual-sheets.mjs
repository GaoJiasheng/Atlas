/** Before/after detail strips. Photographs stay in ignored refs; outputs outside git. */
import fs from 'node:fs';
import sharp from 'sharp';
const root=process.argv[2] ?? '/tmp/flower-and-seed-residual';
const W=680,H=560;
for(const id of ['fig-cut','red-flower','nectar-bat','durian-flowers','moss-cushion']) {
 const before=id==='durian-flowers' ? 'before-durian' : 'before-views';
 const old=await sharp(`${root}/${before}/${id}-detail.png`).resize(W,H).toBuffer();
 const current=await sharp(`${root}/final/${id}-detail.png`).resize(W,H).toBuffer();
 const photograph=await sharp(`${root}/final/${id}-detail-comparison.webp`).extract({left:W,top:70,width:W,height:H}).toBuffer();
 const label=Buffer.from(`<svg width="2040" height="55"><rect width="2040" height="55" fill="#e9e4d8"/><g font-size="20" fill="#2a2824"><text x="12" y="34">Accepted baseline / ${id}</text><text x="692" y="34">Residual polish / decoded shipping GLB</text><text x="1372" y="34">Real reference (attribution in four-view plate)</text></g></svg>`);
 await sharp({create:{width:W*3,height:H+55,channels:3,background:'#e9e4d8'}}).composite([{input:old,left:0,top:55},{input:current,left:W,top:55},{input:photograph,left:W*2,top:55},{input:label,left:0,top:0}]).webp({quality:94}).toFile(`${root}/final/${id}-before-after-detail.webp`);
}
const snapshot=JSON.parse(fs.readFileSync(`${root}/final/snapshot.json`));
const audit=JSON.parse(fs.readFileSync(`${root}/regression-audit.json`));
if(snapshot.assetSha256!==audit.assetSha256)throw new Error('Evidence does not match audited shipping GLB');
console.log('Five before/after/reference strips; final sheet asset hash matches decoded regression audit.');
