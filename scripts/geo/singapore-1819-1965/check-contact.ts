/** Review sheets from standalone geo checks; no application build or shoot. */
import sharp from'sharp';import{resolve}from'node:path';import{existsSync}from'node:fs';import{readJson}from'../lib/common';
const dir=resolve(import.meta.dirname),shots=resolve(process.env.SG_REVIEW_DIR??`${dir}/../../../docs/screenshots/singapore-1819-1965`);
const ids=readJson<any>(`${dir}/sources.json`).keyframes.map((k:any)=>k.id).filter((id:string)=>existsSync(`${shots}/geo-${id}.png`));
const thumbs:any[]=[];for(let i=0;i<ids.length;i++){const input=await sharp(`${shots}/geo-${ids[i]}.png`).extract({left:0,top:0,width:1820,height:750}).resize(728,300).png().toBuffer();thumbs.push({input,left:(i%3)*728,top:Math.floor(i/3)*300});}
await sharp({create:{width:2184,height:Math.ceil(ids.length/3)*300,channels:3,background:'#fff'}}).composite(thumbs).png().toFile(`${shots}/geo-contact.png`);
if(['K2','K19'].every(id=>existsSync(`${shots}/geo-${id}.png`))){const input=await Promise.all(['K2','K19'].map(id=>sharp(`${shots}/geo-${id}.png`).resize({width:1000,height:850,fit:'contain',background:'#fff'}).png().toBuffer()));await sharp({create:{width:2000,height:850,channels:3,background:'#fff'}}).composite(input.map((input,i)=>({input,left:i*1000,top:0}))).png().toFile(`${shots}/geo-K2-K19.png`);}
