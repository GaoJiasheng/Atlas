/** Local material samples → deterministic quilted PNGs; no network imagery. */
import { deflateSync, inflateSync, crc32 } from 'node:zlib';
import { readFileSync } from 'node:fs';
const chunk=(type:string,bytes:Buffer)=>{
 const t=Buffer.from(type),h=Buffer.alloc(4),tail=Buffer.alloc(4);h.writeUInt32BE(bytes.length);tail.writeUInt32BE(crc32(Buffer.concat([t,bytes])));
 return Buffer.concat([h,t,bytes,tail]);
};
function png(width:number,height:number,pixel:(x:number,y:number)=>number):string {
 const data=Buffer.alloc((width+1)*height);
 for(let y=0;y<height;y++){data[y*(width+1)]=0;for(let x=0;x<width;x++)data[y*(width+1)+x+1]=Math.round(Math.max(0,Math.min(255,pixel(x,y))));}
 const head=Buffer.alloc(13);head.writeUInt32BE(width);head.writeUInt32BE(height,4);head[8]=8;head[9]=0;
 return 'data:image/png;base64,'+Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(data)),chunk('IEND',Buffer.alloc(0))]).toString('base64');
}
let bread:string|undefined;
export function breadTexture():string {
 if(bread)return bread;
 // Six small interior material samples from the repository's original cover.
 // No silhouette, original cuts or slice positions enter this texture atlas.
 const samples=inflateSync(readFileSync(new URL('./materials/roti-surface.gray.deflate',import.meta.url)));
 const hash=(x:number,y:number)=>((Math.imul(x+71,31337)^Math.imul(y+19,7919))>>>0);
 bread=png(1200,1200,(x,y)=>{
  const ix=Math.floor(x/192),iy=Math.floor(y/192);let sum=0,weights=0;
  for(let dy=-1;dy<=0;dy++)for(let dx=-1;dx<=0;dx++){
   const gx=ix+dx,gy=iy+dy,xx=x-gx*192,yy=y-gy*192;
   if(xx>=256||yy>=256)continue;
   const weight=Math.min(1,xx/48,(256-xx)/48)*Math.min(1,yy/48,(256-yy)/48);
   const h=hash(gx,gy),px=(h&1)?255-xx:xx,py=(h&2)?255-yy:yy;
   sum+=samples[(h%6)*65536+py*256+px]!*weight;weights+=weight;
  }
  return weights?sum/weights:235;
 });
 return bread;
}
let wood:string|undefined;
export function woodTexture():string {
 if(wood)return wood;
 const samples=inflateSync(readFileSync(new URL('./materials/wood-surface.gray.deflate',import.meta.url)));
 return wood??=(png(350,64,(x,y)=>samples[y*350+x]!));
}
