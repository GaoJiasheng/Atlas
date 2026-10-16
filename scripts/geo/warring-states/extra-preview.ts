import sharp from 'sharp';
import {required} from './strict-input';
import {mkdirSync}from'node:fs';
const dir='scripts/geo/warring-states';mkdirSync(`${dir}/check`,{recursive:true});
for(const id of ['G13','G14','G15','G16','G17']){
 const input:Record<string,string>={G13:'extra-G13-input.png',G14:'extra-G14-input.png',G15:'G15.png',G16:'extra-G16-input.gif',G17:'G17.png'};
 const file=`${dir}/raw/${required(input[id], `${id} input`)}`;
 const md=await sharp(file).metadata();const w=required(md.width, `${id} width`),h=required(md.height, `${id} height`);
 const grid=`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${Array.from({length:Math.ceil(w/50)},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="${h}" stroke="#cf227a" opacity=".5"/><text x="${i*50+2}" y="12" font-family="sans-serif" font-size="11" fill="#cf227a">${i*50}</text>`).join('')}${Array.from({length:Math.ceil(h/50)},(_,i)=>`<line x1="0" y1="${i*50}" x2="${w}" y2="${i*50}" stroke="#cf227a" opacity=".5"/><text x="2" y="${i*50-2}" font-family="sans-serif" font-size="11" fill="#cf227a">${i*50}</text>`).join('')}</svg>`;
 const annotated=await sharp(file).flatten({background:'#ffffff'}).composite([{input:Buffer.from(grid),left:0,top:0}]).png().toBuffer();
 await sharp(annotated).resize({width:Math.max(w,1000)}).png().toFile(`${dir}/check/extra-${id}-grid.png`);
}
