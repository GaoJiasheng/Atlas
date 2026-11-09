import {readFileSync,mkdirSync} from 'node:fs';
import{execFileSync}from'node:child_process';
import sharp from 'sharp';
const d=import.meta.dirname;mkdirSync(`${d}/previews`,{recursive:true});
for(const id of process.argv.slice(2).length?process.argv.slice(2):['G11']){
 const measured=JSON.parse(readFileSync(`${d}/residual-${id}-banks.json`,'utf8'));
 if(id==='G11')measured.arcs.push(...JSON.parse(readFileSync(`${d}/residual-G11-outer.json`,'utf8')).arcs);
 const spec=JSON.parse(execFileSync('python3',[`${d}/residual-interpolate.py`],{input:JSON.stringify(measured),maxBuffer:10*1024*1024}).toString());
 const vectors=[...spec.arcs,...(spec.islands??[])];
 const points=vectors.flatMap((a:any)=>a.coordinates);
 const left=Math.floor(Math.min(...points.map((p:number[])=>p[0]!)))-20,top=Math.floor(Math.min(...points.map((p:number[])=>p[1]!)))-20;
 const width=Math.ceil(Math.max(...points.map((p:number[])=>p[0]!))-left)+20,height=Math.ceil(Math.max(...points.map((p:number[])=>p[1]!))-top)+20;
 const path=vectors.map((a:any)=>a.coordinates.map((p:number[],i:number)=>`${i?'L':'M'}${(p[0]!-left).toFixed(2)},${(p[1]!-top).toFixed(2)}`).join(' ')).join(' ');
 const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${path}" fill="none" stroke="#d52360" stroke-width="1.1"/></svg>`);
 await sharp(`${d}/raw/${id}.jpg`,{limitInputPixels:false}).extract({left,top,width,height}).composite([{input:svg}]).png().toFile(`${d}/previews/residual-${id}-native-vectors.png`);
 console.log({id,left,top,width,height,arcs:spec.arcs.map((a:any)=>[a.name,a.points.length,a.coordinates.length])});
}
