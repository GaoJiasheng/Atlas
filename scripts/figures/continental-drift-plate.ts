import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { svg, etched, path, line, ellipse, random, type Point } from './graphite.js';
export { etched, path, line, ellipse, random, type Point };
export const poly=(p:readonly Point[],fill='#dedede',ink='#555555',w=1.5)=>path(`M${p.map(v=>v.join(',')).join('L')}Z`,fill,ink,w);
export const rect=(x:number,y:number,w:number,h:number,fill='#dedede',ink='#555555',sw=1.5,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/>`;
export function texture(d:string,fill='#dedede'){return etched(d,fill,'#555555',1.6)+path(d,'url(#plate-hatch)','none');}
export function stipple(x:number,y:number,w:number,h:number,n=500,seed=1){const r=random(seed);return Array.from({length:n},()=>ellipse(x+r()*w,y+r()*h,.5+r()*.8,.5+r()*.8,'#777777','none')).join('');}
export async function save(id:string,body:string,cover=false,extra=''){
 mkdirSync('art/img4/raw',{recursive:true});
 const text=svg(body,1200,cover?1200:900,`<defs><pattern id="plate-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="#626262" stroke-width=".65" opacity=".22"/></pattern></defs>${extra}`);
 writeFileSync(`art/img4/raw/${id}.svg`,text);
 await sharp(Buffer.from(text)).resize(cover?1024:1536,cover?1024:1152).greyscale().ensureAlpha().png().toFile(`art/img4/raw/${id}.png`);
 console.log(`geometry + source: ${id}`);
}
