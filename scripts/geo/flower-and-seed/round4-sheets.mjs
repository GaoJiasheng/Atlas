/** Beat-framing before/after/photo plates; all pixels stay in an external evidence directory. */
import fs from 'node:fs';
import sharp from 'sharp';
const base=process.argv[2] ?? '/tmp/flower-and-seed-round4';
const manifest=JSON.parse(fs.readFileSync('scripts/geo/flower-and-seed/refs/manifest.json'));
const rows=[{beat:1,id:'red-flower',ref:manifest.costus[0]}, {beat:3,id:'nectar-bat',ref:manifest.bat[0]}, {beat:5,id:'fig-cut',ref:manifest.fig[2]}];
const W=520,H=350;
for(const theme of ['paper','cinema']) {
 const images=[];
 for(const [i,row] of rows.entries()) {
  for(const [j,folder] of ['before-beats','final'].entries()) {
   images.push({input:await sharp(`${base}/${folder}/who-carries-pollen-beat${row.beat}-neutral-${theme}.png`).resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:j*W,top:i*(H+45)+45});
  }
  let reference=sharp(`scripts/geo/flower-and-seed/refs/${row.ref.file}`);
  if(row.ref.crop)reference.extract(row.ref.crop);
  images.push({input:await reference.resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:W*2,top:i*(H+45)+45});
  const label=Buffer.from(`<svg width="1560" height="45"><rect width="1560" height="45" fill="#e9e4d8"/><g font-size="16" fill="#2a2824"><text x="8" y="20">Round 3 / beat ${row.beat} / ${row.id}</text><text x="528" y="20">Round 4 / same authored beat camera / ${theme}</text><text x="1048" y="20">Reference: ${row.ref.license}</text></g><text x="1048" y="39" font-size="12" fill="#555047">${row.id==='nectar-bat'?'Same species; extended specimen pose differs from upstroke.':row.id==='fig-cut'?'F. racemosa hollow-section structural proxy.':'Costus woodsonii, Hans Hillewaert.'}</text></svg>`);
  images.push({input:label,left:0,top:i*(H+45)});
 }
 await sharp({create:{width:W*3,height:(H+45)*rows.length,channels:3,background:'#e9e4d8'}}).composite(images).webp({quality:94}).toFile(`${base}/final/beat-comparison-${theme}.webp`);
}
