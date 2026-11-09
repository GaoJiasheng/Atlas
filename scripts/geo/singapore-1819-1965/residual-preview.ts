/** Offline native-source overlays and theme-token rasters of delivered NW banks. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import sharp from 'sharp';
import {feature} from 'topojson-client';
import {tps} from './round2-tps';
import {buildG16Model} from './resume-register-G16-model';
const d=import.meta.dirname;mkdirSync(`${d}/previews`,{recursive:true});
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const reports=read(`${d}/round2-registration.json`).reports;
const top=read(process.argv.includes('--before')?`${d}/work/residual-before-land-sg-history.json`:`${d}/../../../public/geo/land-sg-history.json`);
const tag=process.argv.includes('--before')?'before':'after';
const fc:any=feature(top,top.objects['land-sg-history']);
const polys=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
const box=[103.625,1.355,103.77,1.465];
const specs:any[]=[];
for(const [id,era] of [['G9','L3'],['G11','L4'],['G16','L5']]){
 const r=reports.find((r:any)=>r.id===id),model=id==='G16'?buildG16Model():tps(r.controlPoints,r.smoothing);
 const inverse=(p:number[])=>{let x=4000,y=3000;for(let i=0;i<10;i++){const a=model.toLngLat(x,y),b=model.toLngLat(x+1,y),c=model.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;}return[x,y];};
 const bounds=[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]].map(p=>inverse(p as number[]));
 const left=Math.floor(Math.min(...bounds.map(p=>p[0]!))),top=Math.floor(Math.min(...bounds.map(p=>p[1]!))),width=Math.ceil(Math.max(...bounds.map(p=>p[0]!))-left),height=Math.ceil(Math.max(...bounds.map(p=>p[1]!))-top);
 const w=1800,s=w/width,h=Math.round(height*s);
 const f=fc.features.find((f:any)=>f.properties.id===era);
 const path=polys(f).flatMap(p=>p.map(r=>r.map(inverse).map(([x,y],i)=>`${i?'L':'M'}${((x!-left)*s).toFixed(2)},${((y!-top)*s).toFixed(2)}`).join(' ')+'Z')).join(' ');
 const overlay=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${path}" fill="none" stroke="#d52d57" stroke-width="1.2"/></svg>`);
 await sharp(`${d}/raw/${id}.jpg`,{limitInputPixels:false}).extract({left,top,width,height}).resize({width:w,height:h}).composite([{input:overlay}]).png().toFile(`${d}/previews/residual-${tag}-${id}.png`);
 const close=id==='G11'?[2280,1580,600,1370]:id==='G16'?[8300,3750,1250,1650]:[2900,1400,800,1300];
 const nativePath=polys(f).flatMap(p=>p.map(r=>r.map(inverse).map(([x,y],i)=>`${i?'L':'M'}${(x!-close[0]!).toFixed(2)},${(y!-close[1]!).toFixed(2)}`).join(' ')+'Z')).join(' ');
 const nativeOverlay=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${close[2]}" height="${close[3]}"><path d="${nativePath}" fill="none" stroke="#d52d57" stroke-width="1.1"/></svg>`);
 await sharp(`${d}/raw/${id}.jpg`,{limitInputPixels:false}).extract({left:close[0]!,top:close[1]!,width:close[2]!,height:close[3]!}).composite([{input:nativeOverlay}]).png().toFile(`${d}/previews/residual-${tag}-${id}-close.png`);
 await sharp(`${d}/raw/${id}.jpg`,{limitInputPixels:false}).extract({left,top,width,height}).png().toFile(`${d}/previews/residual-source-${id}.png`);
 specs.push({id,era,left,top,width,height});
}
writeFileSync(`${d}/work/residual-crops.json`,JSON.stringify(specs,null,2));
// Geographic views use the same delivery coordinates and existing theme tokens.
const css=readFileSync(`${d}/../../../src/theme/tokens.css`,'utf8');
for(const theme of ['paper','cinema']){
 const block=css.slice(css.indexOf(`:root[data-theme="${theme}"]`)).split('\n}')[0]!;
 const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2]!.trim()]));
 const tk=(k:string):string=>tokens[k]!.startsWith('var(')?tk(tokens[k]!.slice(6,-1)):tokens[k]!;
 const W=2100,H=700,scale=650/(box[2]!-box[0]!);
 const panes=['L3','L4','L5'].map((era,i)=>{
 const ox=25+i*700,oy=90;
 const path=polys(fc.features.find((f:any)=>f.properties.id===era)).flatMap(p=>p.map(r=>r.map((p,j)=>`${j?'L':'M'}${(ox+(p[0]!-box[0]!)*scale).toFixed(2)},${(oy+(box[3]!-p[1]!)*scale).toFixed(2)}`).join(' ')+'Z')).join(' ');
 return `<defs><clipPath id="p${i}"><rect x="${ox}" y="${oy}" width="650" height="500"/></clipPath></defs><text x="${ox}" y="65" font-size="25">${era} · ${tag}</text><g clip-path="url(#p${i})"><rect x="${ox}" y="${oy}" width="650" height="500" fill="${tk('water')}"/><path d="${path}" fill="${tk('land')}" fill-rule="evenodd" stroke="${tk('ink')}" stroke-width=".8"/></g>`;
 }).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${tk('paper')}"/><g fill="${tk('ink')}" font-family="sans-serif">${panes}<text x="25" y="640" font-size="22">North-west banks · actual delivered geometry · ${theme} · measured positions remain approximate</text></g></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`${d}/previews/residual-${tag}-${theme}.png`);
}
console.log(JSON.stringify(specs));
