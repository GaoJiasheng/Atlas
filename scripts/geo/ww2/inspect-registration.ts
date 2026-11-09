import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {manifest} from './provenance';
const s=JSON.parse(readFileSync('scripts/geo/ww2/lines.json','utf8'));
for(const [id,m] of Object.entries(s.maps) as [string,any][]){
 const file=`scripts/geo/ww2/raw/${manifest.datasets[m.dataset].file}`; const {width=1400,height=905}=await sharp(file).metadata();
 let svg=`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
 for(const p of m.controlPoints){const [x,y]=p.svg; svg+=`<path d="M${x-6},${y}h12 M${x},${y-6}v12" stroke="#e000b0" stroke-width="2"/><text x="${x+6}" y="${y-8}" font-size="11" font-family="sans-serif" fill="#810063" stroke="white" stroke-width="3" paint-order="stroke">${p.name} ${x},${y}</text>`}
 svg+='</svg>';
 await sharp(file).composite([{input:Buffer.from(svg)}]).png().toFile(`scripts/geo/ww2/work/cp-${id}.png`);
}
