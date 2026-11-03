/** Offline visual QA of the actual baked GLB. No browser, runtime renderer or substitute geometry.
 * Shows exact mesh attributes under a CPU shader reconstruction, with explicit QA
 * recentering/rotation instead of authored scene node transforms. Not WebGL QA.
 * pnpm tsx scripts/geo/solar-system/render-preview.ts [output-directory]
 */
import { mkdirSync } from 'node:fs';
import { NodeIO, type Accessor } from '@gltf-transform/core';
import { EXTTextureWebP, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { Matrix4, Vector3 } from 'three';

type V = [number,number,number];
type TexturePixels={data:Buffer;width:number;height:number;channels:number};
type Body={id:string;p:Float32Array;n:Float32Array;c:Float32Array;e:Float32Array;uv?:Float32Array;texture?:TexturePixels;indices:Uint32Array;closed:boolean};
type Placement={id:string;at?:V;scale?:number;rotation?:V};
type View={name:string;title:string;bodies:Placement[];eye?:V;target?:V;span:number;theme?:'dark'|'paper';size?:number};
const output=process.argv[2]??'/tmp/atlas-solar-system-polish';mkdirSync(output,{recursive:true});
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions([EXTTextureWebP,EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/solar-system.glb');
// Accessor elements include glTF's normalized integer decoding, as GLTFLoader does.
function floats(accessor:Accessor){
 const values=new Float32Array(accessor.getCount()*accessor.getElementSize()),element:number[]=[];
 for(let i=0;i<accessor.getCount();i++)values.set(accessor.getElement(i,element),i*accessor.getElementSize());
 return values;
}
const bodies=new Map<string,Body>();
for(const node of doc.getRoot().listNodes()){
 const mesh=node.getMesh();if(!mesh)continue;
 const primitive=mesh.listPrimitives()[0]!;
 const pos=primitive.getAttribute('POSITION')!,normal=primitive.getAttribute('NORMAL')!,color=primitive.getAttribute('COLOR_0');
 const index=primitive.getIndices()!,emission=primitive.getAttribute('_EMISSION')?.getArray();
 const uv=primitive.getAttribute('TEXCOORD_0')?.getArray(),tex=primitive.getMaterial()?.getBaseColorTexture()?.getImage();
 let texture:TexturePixels|undefined;
 if(tex){const decoded=await sharp(Buffer.from(tex)).ensureAlpha().raw().toBuffer({resolveWithObject:true});texture={data:decoded.data,width:decoded.info.width,height:decoded.info.height,channels:decoded.info.channels}}
 bodies.set(node.getName(),{id:node.getName(),p:floats(pos),n:floats(normal),c:color?floats(color):new Float32Array(pos.getCount()*4).fill(1),e:emission?new Float32Array(emission):new Float32Array(pos.getCount()),uv:uv?new Float32Array(uv):undefined,texture,indices:new Uint32Array(index.getArray()!),closed:node.getExtras().closed!==false});
}
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const normalize=(a:V):V=>{const l=Math.hypot(...a);return[a[0]/l,a[1]/l,a[2]/l]};
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const encode=(v:number)=>{const x=clamp(v);return Math.round(255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055))};
const srgb=(v:number)=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const srgbLUT=Float32Array.from({length:256},(_,i)=>srgb(i/255));
const smooth=(lo:number,hi:number,v:number)=>{const t=clamp((v-lo)/(hi-lo));return t*t*(3-2*t)};
function sampleTexture(texture:TexturePixels,u:number,v:number,out:Float32Array){
 const {width,height,channels,data}=texture;
 // glTF image convention: UV v=0 is the decoded image's top edge.
 const x=((u%1+1)%1)*width-.5,y=clamp(v)*height-.5,x0=Math.floor(x),y0=Math.floor(y),tx=x-x0,ty=y-y0;
 const address=(ix:number,iy:number)=>((Math.max(0,Math.min(height-1,iy))*width+(ix+width)%width)*channels);
 const a=address(x0,y0),b=address(x0+1,y0),c=address(x0,y0+1),d=address(x0+1,y0+1);
 for(let k=0;k<3;k++)out[k]=(srgbLUT[data[a+k]!]!*(1-tx)+srgbLUT[data[b+k]!]!*tx)*(1-ty)+(srgbLUT[data[c+k]!]!*(1-tx)+srgbLUT[data[d+k]!]!*tx)*ty;
 out[3]=1;
}
function raster(view:View){
 const size=view.size??800,eye=view.eye??[0,0,5],target=view.target??[0,0,0];
 const forward=normalize([eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]]),right=normalize(cross([0,1,0],forward)),up=cross(forward,right);
 const bg=view.theme==='paper'?[233/255,228/255,216/255]:[31/255,33/255,36/255];
 const pixels=new Float32Array(size*size*3),depth=new Float32Array(size*size).fill(-Infinity);
 for(let i=0;i<size*size;i++){pixels[i*3]=srgb(bg[0]!);pixels[i*3+1]=srgb(bg[1]!);pixels[i*3+2]=srgb(bg[2]!)}
 type Tri={v:number[]; body:Body; i:number; z:number;transparent:boolean};
 const tris:Tri[]=[];
 for(const place of view.bodies){
  const body=bodies.get(place.id);if(!body)throw new Error(`Missing baked mesh: ${place.id}`);
  const rot=place.rotation??[0,0,0],scale=place.scale??1,at=place.at??[0,0,0];
  const matrix=new Matrix4().makeRotationX(rot[0]);matrix.premultiply(new Matrix4().makeRotationY(rot[1]));matrix.premultiply(new Matrix4().makeRotationZ(rot[2]));
  const v=new Vector3(),n=new Vector3(),pv:number[]=[];
  for(let j=0;j<body.p.length/3;j++){
   v.fromArray(body.p,j*3).applyMatrix4(matrix).multiplyScalar(scale).add(new Vector3(...at)).sub(new Vector3(...target));
   n.fromArray(body.n,j*3).transformDirection(matrix);
   const pt:V=[v.x,v.y,v.z];
   // Stride: screen x/y, view z, smooth world normal xyz.
   pv.push(size*.5+dot(pt,right)*size/view.span,size*.5-dot(pt,up)*size/view.span,dot(pt,forward),n.x,n.y,n.z);
  }
  for(let i=0;i<body.indices.length;i+=3){
   const a=body.indices[i]!,b=body.indices[i+1]!,c=body.indices[i+2]!;
   const alpha=(body.c[a*4+3]!+body.c[b*4+3]!+body.c[c*4+3]!)/3;
   tris.push({v:pv,body,i,z:(pv[a*6+2]!+pv[b*6+2]!+pv[c*6+2]!)/3,transparent:alpha<.995});
  }
 }
 // Opaque faces write depth; transparent faces blend from back to front without depth writes.
 tris.sort((a,b)=>Number(a.transparent)-Number(b.transparent)||(a.transparent?a.z-b.z:0));
 const light=normalize([-3,4,5]),texel=new Float32Array(4);
 for(const tri of tris){
  const {v,body,i}=tri,ia=body.indices[i]!,ib=body.indices[i+1]!,ic=body.indices[i+2]!;
  const a=ia*6,b=ib*6,c=ic*6,ax=v[a]!,ay=v[a+1]!,bx=v[b]!,by=v[b+1]!,cx=v[c]!,cy=v[c+1]!;
  const area=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(area)<1e-8)continue;
  // All closed baked surfaces have outward normals. Skip back surfaces, including translucent shells.
  const nav:V=[(v[a+3]!+v[b+3]!+v[c+3]!)/3,(v[a+4]!+v[b+4]!+v[c+4]!)/3,(v[a+5]!+v[b+5]!+v[c+5]!)/3];
  if((body.closed||body.e[ia]===3)&&dot(nav,forward)<0)continue;
  const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(size-1,Math.ceil(Math.max(ax,bx,cx)));
  const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(size-1,Math.ceil(Math.max(ay,by,cy)));
  if(x0>x1||y0>y1)continue;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const w0=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/area,w1=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/area,w2=1-w0-w1;
   if(w0<-.00001||w1<-.00001||w2<-.00001)continue;
   const z=w0*v[a+2]!+w1*v[b+2]!+w2*v[c+2]!,pixel=y*size+x;
   if(z<depth[pixel]!-1e-5)continue;
   let nx=w0*v[a+3]!+w1*v[b+3]!+w2*v[c+3]!,ny=w0*v[a+4]!+w1*v[b+4]!+w2*v[c+4]!,nz=w0*v[a+5]!+w1*v[b+5]!+w2*v[c+5]!;
   const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
   let mu=nx*forward[0]+ny*forward[1]+nz*forward[2];if(!body.closed&&mu<0){nx=-nx;ny=-ny;nz=-nz;mu=-mu}
   const emission=Math.round(w0*body.e[ia]!+w1*body.e[ib]!+w2*body.e[ic]!);
   let alpha=w0*body.c[ia*4+3]!+w1*body.c[ib*4+3]!+w2*body.c[ic*4+3]!;
   let illumination=.27+.83*Math.max(0,nx*light[0]+ny*light[1]+nz*light[2]);
   if(emission===1)illumination=1.5*(.46+.54*Math.max(0,mu));
   else if(emission===2){illumination=1;alpha*=Math.pow(Math.abs(mu)*(1-Math.abs(mu)),2)*smooth(0,.16,Math.abs(mu))}
   else if(emission===3){illumination=1;alpha*=mu*mu}
   if(body.texture&&body.uv){
    const uv=body.uv;sampleTexture(body.texture,w0*uv[ia*2]!+w1*uv[ib*2]!+w2*uv[ic*2]!,w0*uv[ia*2+1]!+w1*uv[ib*2+1]!+w2*uv[ic*2+1]!,texel);
   }else texel.fill(1);
   alpha=clamp(alpha);
   for(let channel=0;channel<3;channel++){
    const value=(w0*body.c[ia*4+channel]!+w1*body.c[ib*4+channel]!+w2*body.c[ic*4+channel]!)*illumination*texel[channel]!;
    pixels[pixel*3+channel]=value*alpha+pixels[pixel*3+channel]!*(1-alpha);
   }
   if(!tri.transparent)depth[pixel]=z;
  }
 }
 const rgb=Buffer.alloc(size*size*3);for(let i=0;i<rgb.length;i++)rgb[i]=encode(pixels[i]!);
 return {rgb,size};
}
const views:View[]=[
 {name:'sun-dark',title:'SUN · EMISSIVE PHOTOSPHERE / DARK',bodies:[{id:'sun'}],span:2.85},
 {name:'sun-paper',title:'SUN · EMISSIVE PHOTOSPHERE / PAPER',bodies:[{id:'sun'}],span:2.85,theme:'paper'},
 {name:'mercury',title:'MERCURY · IMPACT TERRAIN',bodies:[{id:'mercury'}],span:2.35,eye:[2,1,5]},
 {name:'venus',title:'VENUS · CONTINUOUS CLOUD DECK',bodies:[{id:'venus'}],span:2.35},
 {name:'earth-africa',title:'EARTH · AFRICA / ASIA',bodies:[{id:'earth',rotation:[0,-1.5,0]}],span:2.35,eye:[0,.25,5]},
 {name:'earth-americas',title:'EARTH · AMERICAS',bodies:[{id:'earth',rotation:[0,1.5,0]}],span:2.35,eye:[0,.25,5]},
 {name:'mars',title:'MARS · RUST / POLAR ICE',bodies:[{id:'mars'}],span:2.35,eye:[0,2,5]},
 {name:'jupiter',title:'JUPITER · BELTS / GREAT RED SPOT',bodies:[{id:'jupiter',rotation:[0,-.14,0]}],span:2.35},
 {name:'saturn',title:'SATURN · BANDED GLOBE / RING GAPS',bodies:[{id:'saturn'},{id:'saturn-rings'}],span:5.4,eye:[0,3.3,5]},
 {name:'uranus',title:'URANUS · METHANE HAZE',bodies:[{id:'uranus'}],span:2.35},
 {name:'neptune',title:'NEPTUNE · BLUE ATMOSPHERE',bodies:[{id:'neptune'}],span:2.35},
 {name:'asteroid-front',title:'ASTEROID · FRONT',bodies:[{id:'asteroid-specimen'}],span:1.9,eye:[0,1,5]},
 {name:'asteroid-side',title:'ASTEROID · SIDE',bodies:[{id:'asteroid-specimen'}],span:1.9,eye:[5,1,0]},
 {name:'asteroid-back',title:'ASTEROID · REVERSE',bodies:[{id:'asteroid-specimen'}],span:1.9,eye:[-2,-1,-5]},
 {name:'comet-nucleus',title:'COMET · BILOBED NUCLEUS',bodies:[{id:'comet-nucleus'}],span:.65,eye:[1,1,5]},
 {name:'comet-overview',title:'COMET · SOFT COMA / BAKED TAILS',bodies:[{id:'comet-nucleus'},{id:'comet-coma'},{id:'dust-tail'},{id:'ion-tail'}],target:[1.4,0,-.1],span:4.1,eye:[1.4,2,5]},
];
views.push({name:'moon',title:'MOON · MARIA / IMPACT TERRAIN / ORBIT GUIDE',bodies:[{id:'moon-demo'}],target:[0,0,0],span:.5,eye:[0,0,5]});
views.push({...views.find(v=>v.name==='comet-overview')!,name:'comet-paper',title:'COMET · SOFT COMA / PAPER',theme:'paper'});
for(const [index,angle] of [0,Math.PI/2,Math.PI,Math.PI*1.5].entries()){
 const radius=2,at:V=[Math.cos(angle)*radius,0,Math.sin(angle)*radius];
 views.push({name:`comet-away-sun-${index+1}`,title:`TAIL DIRECTION ${index+1}/4 · AWAY FROM SUN`,bodies:[{id:'comet-sun'},{id:'comet-nucleus',at,rotation:[0,-angle,0]},{id:'comet-coma',at},{id:'ion-tail',at,rotation:[0,-angle,0]},{id:'dust-tail',at,rotation:[0,-angle,0]}],span:11.5,eye:[0,8,4]});
}
const thumbnails:Buffer[]=[];
for(const view of views){
 const {rgb,size}=raster(view);
 const path=`${output}/${view.name}.png`;await sharp(rgb,{raw:{width:size,height:size,channels:3}}).png().toFile(path);
 const label=Buffer.from(`<svg width="400" height="38"><rect width="400" height="38" fill="#1f2124"/><text x="12" y="24" fill="#ece5d7" font-family="sans-serif" font-size="12">${view.title.replaceAll('&','&amp;')}</text></svg>`);
 const thumb=await sharp(rgb,{raw:{width:size,height:size,channels:3}}).resize(400,400).extend({bottom:38,background:'#1f2124'}).composite([{input:label,top:400,left:0}]).png().toBuffer();thumbnails.push(thumb);
 console.log(path);
}
for(const [name,start,end] of [['planets',0,11],['small-bodies',11,23]] as const){
 const selected=thumbnails.slice(start,end),columns=name==='planets'?4:3;
 await sharp({create:{width:columns*400,height:Math.ceil(selected.length/columns)*438,channels:3,background:'#1f2124'}}).composite(selected.map((input,i)=>({input,left:(i%columns)*400,top:Math.floor(i/columns)*438}))).png().toFile(`${output}/${name}-contact-sheet.png`);
}
console.log(`Rendered ${views.length} actual baked-geometry views to ${output}. CPU shader reconstruction; not a WebGL screenshot. Coma mu² alpha follows the opted-in live material shader.`);
