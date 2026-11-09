/** Original Atlas CC0. Shared geometric micro-pits and their baked ambient
 * occlusion, through the existing atlasSurface base-colour texture route. */
import sharp from 'sharp';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {KHRTextureTransform} from '@gltf-transform/extensions';
const N=64,TILE=.016,field=new Float32Array(N*N),pits=[];let seed=981;
const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<160;i++)pits.push([rand()*N,rand()*N,.65+rand()*1.1,.35+rand()*.4]);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){let value=0;for(const [a,b,r,d]of pits){let dx=Math.abs(x-a),dy=Math.abs(y-b);dx=Math.min(dx,N-dx);dy=Math.min(dy,N-dy);value=Math.max(value,d*Math.exp(-(dx*dx+dy*dy)/(r*r)));}field[y*N+x]=value;}
export const microFieldSha=createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex');
export const microUV=(x,y,z)=>[(x-z)*Math.SQRT1_2/TILE,((x+z)/Math.sqrt(6)-y*Math.sqrt(2/3))/TILE];
export function sampleMicro(x,y,z){const [u,v]=microUV(x,y,z),tx=(u-Math.floor(u))*N-.5,ty=(v-Math.floor(v))*N-.5,xx=Math.floor(tx),yy=Math.floor(ty),fx=tx-xx,fy=ty-yy;let value=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)value+=field[(yy+dy+N)%N*N+(xx+dx+N)%N]*(dx?fx:1-fx)*(dy?fy:1-fy);return value/.75*.00012;}
export async function spongeMicroAO(doc,primitive,buffer){
 const pixels=Buffer.alloc(N*N*3),encode=x=>x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
 for(let i=0;i<field.length;i++)pixels.fill(Math.round(encode(1-field[i])*255),i*3,(i+1)*3);
 const png=await sharp(pixels,{raw:{width:N,height:N,channels:3}}).png({palette:true,colours:16,dither:0}).toBuffer();
 const texture=doc.createTexture('cellulose-micro-cavity-AO').setImage(png).setMimeType('image/png');primitive.getMaterial().setBaseColorTexture(texture);
 const position=primitive.getAttribute('POSITION'),uv=new Float32Array(position.getCount()*2);for(let i=0;i<position.getCount();i++)uv.set(microUV(...position.getElement(i,[0,0,0])),i*2);
 const min=[Infinity,Infinity],max=[-Infinity,-Infinity];for(let i=0;i<uv.length;i++){min[i%2]=Math.min(min[i%2],uv[i]);max[i%2]=Math.max(max[i%2],uv[i]);}const range=max.map((v,j)=>v-min[j]);for(let i=0;i<uv.length;i++)uv[i]=(uv[i]-min[i%2])/range[i%2];
 const transform=doc.createExtension(KHRTextureTransform).createTransform().setOffset(min).setScale(range);primitive.getMaterial().getBaseColorTextureInfo().setExtension('KHR_texture_transform',transform);
 primitive.setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(buffer));console.log(`Sponge micro-cavity AO: ${png.length} byte original tile; continuous isometric UV projection`);
}
