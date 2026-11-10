/** Original procedural museum atlas. Run: pnpm tsx scripts/geo/solar-system/build-parts.ts.
 * Geometry and embedded surface textures are baked locally; no external runtime requests.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTTextureWebP, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { dedup, prune, quantize, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { BufferGeometry, Color, Float32BufferAttribute, SphereGeometry, TorusGeometry, SRGBColorSpace, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { surfaceColor } from './surfaces';
import { generateSurfaceTextures, surfaceTextureDirectory, surfaceTextureIds } from './build-textures';

const dir='scripts/geo/solar-system', topic='src/content/topics/solar-system';
const baseline=JSON.parse(readFileSync(`${dir}/baseline-parts.json`,'utf8'));
const file=structuredClone(baseline);
const parsedBaseline=partsFile.parse(baseline);
const doc=new Document(), buffer=doc.createBuffer();
doc.createExtension(EXTTextureWebP).setRequired(true);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
doc.getRoot().getAsset().copyright='Atlas original procedural meshes and surface reconstruction, CC0-1.0. Earth coastline: Natural Earth public domain via world-atlas (ISC, Mike Bostock). See solar-system/data/SOURCES.md.';
const scene=doc.createScene('solar-system');
const textureBytes=process.argv.includes('--textures')?await generateSurfaceTextures():Object.fromEntries(surfaceTextureIds.map(id=>[id,{bytes:readFileSync(`${surfaceTextureDirectory}/${id}.webp`)}]));
const textures=Object.fromEntries(Object.entries(textureBytes).map(([id,t])=>[id,doc.createTexture(id).setImage(t.bytes).setMimeType('image/webp')]));
const counts:Record<string,{before:number;after:number}>={};
const noise=(x:number,y:number,z:number)=>Math.sin(x*3.1+Math.sin(z*4.7))*Math.sin(y*4.3+z*1.7)*.5+Math.sin(y*8.1-x*2.3)*.2;
const c=new Color();
function colours(g:BufferGeometry, sample:(x:number,y:number,z:number)=>number[], emission=0, alpha=1) {
 const p=g.getAttribute('position'), values:number[]=[], e:number[]=[];
 for(let i=0;i<p.count;i++){
  const v=sample(p.getX(i),p.getY(i),p.getZ(i));
  c.setRGB(v[0]!,v[1]!,v[2]!,SRGBColorSpace);
  values.push(c.r,c.g,c.b,v[3]??alpha);e.push(emission);
 }
 g.setAttribute('color',new Float32BufferAttribute(values,4));g.setAttribute('_emission',new Float32BufferAttribute(e,1));
 return g;
}
function sphere(id:string,r=1,w=128,h=64,emission=0){
 const g=new SphereGeometry(r,w,h);
 const uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
 return colours(g,(x,y,z)=>surfaceColor(id,x/r,y/r,z/r),emission);
}
function sun(r:number){
 const g=sphere('sun',r,128,64,1);
 const shells=[g];
 for(const [scale,a] of [[1.22,.20]]) {
  shells.push(colours(new SphereGeometry(r*scale!,64,32),()=>[1,.77,.40,a!],2));
 }
 return mergeGeometries(shells)!;
}
function rocky(r:number,seed:number,bilobed=false,w=64,h=40){
 const g=new SphereGeometry(1,w,h),p=g.getAttribute('position');
 const v=new Vector3();
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i);const {x,y,z}=v;
  const irregular=1+.16*noise(x*1.4+seed,y*1.3,z*1.6)+.055*noise(x*4+seed,y*4,z*4);
  // Neck between two unequal lobes, plus broad depressions, not joined balls.
  const neck=bilobed? .64+.39*Math.pow(Math.abs(x),.6)+.14*x:1;
  const dimple=1-.10*Math.exp(-((x-.4)**2+(y-.55)**2+(z-.55)**2)/.07);
  v.set(x*(bilobed?1.52:1.19),y*(bilobed?.85:.73)*neck,z*(bilobed?.86:.94)*neck).multiplyScalar(r*irregular*dimple);
  p.setXYZ(i,v.x,v.y,v.z);
 }
 g.computeVertexNormals();
 return colours(g,(x,y,z)=>{
  const n=noise(x/r*8+seed,y/r*8,z/r*8), striae=Math.sin((y/r+noise(x/r,y/r,z/r)*.04)*100)*.018;
  const b=(bilobed?.28:.44)+n*.13+striae;
  return [b*1.04,b,b*.92];
 });
}
function rings(){
 const positions:number[]=[], normals:number[]=[], colors:number[]=[], indices:number[]=[],emission:number[]=[];
 // Radii relative to the existing mean-radius teaching globe, using USGS ring edges.
 // The F ring is drawn wider than its true ~0.005 width (with lower opacity) so it never falls below a pixel.
 const zones=[[1.24,1.53,.56],[1.53,2.018,.98],[2.096,2.26,.86],[2.27,2.347,.8],[2.398,2.414,.62]];
 for(const [lo,hi,bright] of zones){
  const steps=Math.max(2,Math.ceil((hi!-lo!)*125)),N=160,base=positions.length/3;
  for(let j=0;j<=steps;j++){
   const r=lo!+(hi!-lo!)*j/steps;
   // Ringlet modulation stays well below the radial sampling rate (125 steps/unit): higher
   // frequencies alias into moire at overview sizes.
   const b=bright!*(.91+.055*Math.sin(r*38)+.035*Math.sin(r*91));
   c.setRGB(b,b*.92,b*.78,SRGBColorSpace);
   for(let i=0;i<=N;i++){
    const a=2*Math.PI*i/N;positions.push(r*Math.cos(a),0,r*Math.sin(a));normals.push(0,1,0);colors.push(c.r,c.g,c.b,lo!<1.53?.42:lo!>2.39?.55:1);emission.push(0);
   }
  }
  for(let j=0;j<steps;j++)for(let i=0;i<N;i++){
   const a=base+j*(N+1)+i,b=a+N+1;
   indices.push(a,b,a+1,a+1,b,b+1);
   // One face with a double-sided material avoids duplicate coplanar alpha draws.
  }
 }
 return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setAttribute('normal',new Float32BufferAttribute(normals,3)).setAttribute('color',new Float32BufferAttribute(colors,4)).setAttribute('_emission',new Float32BufferAttribute(emission,1)).setIndex(indices);
}
function haze(r:number){
 return colours(new SphereGeometry(r,64,40),()=>[.56,.70,.76,.42],3);
}
function tail(dust:boolean){
 const pos:number[]=[],idx:number[]=[],co:number[]=[],es:number[]=[];
 const L=dust?2.8:3.3,N=64,R=24;
 for(let j=0;j<=N;j++){
  const t=j/N, x=t*L, width=(dust?.012+.28*Math.sin(t*Math.PI*.8):.012+.07*Math.sin(t*Math.PI*.8));
  for(let k=0;k<=R;k++){
   const a=k/R*Math.PI*2, z=dust?-.78*t*t:0;
   pos.push(x,Math.cos(a)*width*(dust?.55:1),z+Math.sin(a)*width);
   const rgb=dust?[.80,.60,.34]:[.22,.52,.80];c.setRGB(rgb[0]!,rgb[1]!,rgb[2]!,SRGBColorSpace);
   co.push(c.r,c.g,c.b,.62*(1-t)**1.3);es.push(3);
  }
 }
 for(let j=0;j<N;j++)for(let k=0;k<R;k++){const a=j*(R+1)+k,b=a+R+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pos,3)).setAttribute('color',new Float32BufferAttribute(co,4)).setAttribute('_emission',new Float32BufferAttribute(es,1)).setIndex(idx);g.computeVertexNormals();return g;
}
function baselineTriangles(part:any){
 const p=parsedBaseline.parts.find(x=>x.id===part.id)!;
 return partPieces(p).reduce((n,piece)=>{const total=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();return n+total;},0);
}
function add(id:string,g:BufferGeometry,at:number[]=[0,0,0],sheet=false){
 if(!g.index)g.setIndex(Array.from({length:g.getAttribute('position').count},(_,i)=>i));
 const p=file.parts.find((p:any)=>p.id===id);
 const mesh=doc.createMesh(id), primitive=doc.createPrimitive();
 for(const [name,a] of Object.entries(g.attributes)){
  
  const semantic=name==='position'?'POSITION':name==='normal'?'NORMAL':name==='color'?'COLOR_0':name==='uv'?'TEXCOORD_0':name.toUpperCase();
  const type=a.itemSize===4?'VEC4':a.itemSize===3?'VEC3':a.itemSize===2?'VEC2':'SCALAR';
  primitive.setAttribute(semantic,doc.createAccessor().setType(type).setArray(new Float32Array(a.array)).setBuffer(buffer));
 }
 primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(buffer));
 const textureId=['moon-parent','meteor-world','earth-viewpoint','reflecting-world'].includes(id)?'earth':id==='moon-demo'?'moon':id;
 const material=doc.createMaterial(id).setBaseColorFactor([1,1,1,1]).setRoughnessFactor(1).setMetallicFactor(0).setDoubleSided(sheet).setExtras({atlasSurface:true});
 const alpha=g.getAttribute('color');
 if(alpha && Array.from({length:alpha.count},(_,i)=>alpha.getW(i)).some(a=>a<1))material.setAlphaMode('BLEND');
 if(textures[textureId]){material.setBaseColorTexture(textures[textureId]!);if(id!=='moon-demo')primitive.setAttribute('COLOR_0',null);}
 primitive.setMaterial(material);mesh.addPrimitive(primitive);
 scene.addChild(doc.createNode(id).setMesh(mesh).setTranslation(at as [number,number,number]).setExtras({closed:!sheet}));
 counts[id]={before:baselineTriangles(p),after:g.index!.count/3};
 delete p.primitive;delete p.extra;delete p.repeat;p.mesh=id;p.material={color:'matte',tint:'#ffffff'};
 if(['sun','comet-sun'].includes(id))p.material.color='membrane';
 g.dispose();
}
for(const id of ['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'])add(id,id==='sun'?sun(1):sphere(id,1,128,64));
add('saturn-rings',rings(),[0,0,0],true);
// Rocky-planet close-up: existing meshes re-instanced in one row, all four radii from
// the physical inputs and one shared factor (Earth = 1 scene unit), so no new geometry.
const rockyIds=['mercury','venus','earth','mars'] as const, earthKm=parsedBaseline.sim!.solarSystem!.bodies.find(b=>b.id==='earth')!.radiusKm;
const rockyRadii=rockyIds.map(id=>parsedBaseline.sim!.solarSystem!.bodies.find(b=>b.id===id)!.radiusKm/earthKm);
const rockyGap=.8,rockyWidth=rockyRadii.reduce((n,r)=>n+2*r,0)+rockyGap*3;
let rockyX=-5.5-rockyWidth/2;
rockyIds.forEach((id,i)=>{
 const r=rockyRadii[i]!,part=file.parts.find((p:any)=>p.id===`${id}-closeup`);
 const source=doc.getRoot().listMeshes().find(m=>m.getName()===id)!;
 scene.addChild(doc.createNode(`${id}-closeup`).setMesh(source).setTranslation([rockyX+r,0,0]).setScale([r,r,r]).setExtras({closed:true,...(id==='earth'?{labelPoint:[.42,.74,.53]}:{})}));
 delete part.primitive;part.mesh=`${id}-closeup`;part.material={color:'matte',tint:'#ffffff'};
 rockyX+=2*r+rockyGap;
});
for(const [id,r,at] of [['moon-parent',.8,[-2,0,0]],['meteor-world',.8,[-2,0,0]],['earth-viewpoint',.5,[0,-.6,0]],['reflecting-world',.65,[3,0,0]]] as const)add(id,sphere('earth',r,96,48),[...at]);
const moon=colours(sphere('moon',.18,96,48),()=>[1,1,1]);
// Keep the original orbit centre/radius, with a small opening around the Moon
// so a close-up never puts a thick guide through the visible lunar hemisphere.
const gap=.5;
const moonOrbit=new TorusGeometry(1.9,.012,8,192,2*Math.PI-2*gap);
moonOrbit.rotateZ(gap);moonOrbit.rotateX(Math.PI/2);moonOrbit.translate(-1.9,0,0);
colours(moonOrbit,()=>[.8,.8,.8]);
const guideUV=moonOrbit.getAttribute('uv');
for(let i=0;i<guideUV.count;i++)guideUV.setXY(i,.5/1024,.5/512);
add('moon-demo',mergeGeometries([moon,moonOrbit])!,[-.1,0,0]);
add('asteroid-specimen',rocky(.65,2),[2,0,0]);
const rocks:BufferGeometry[]=[];
for(let i=0;i<36;i++){
 const angle=i*Math.PI*2/36+.035*Math.sin(i*17),r=3.2+.22*Math.sin(i*4.1);
 const g=rocky(.04+.035*(.5+.5*Math.sin(i*7.2)),i,false,16,10);
 g.rotateX(i*1.3);g.rotateZ(i*.9);g.translate(r*Math.cos(angle),.13*Math.sin(i*3.7),r*Math.sin(angle));rocks.push(g);
}
add('asteroid-belt',mergeGeometries(rocks)!);
add('comet-sun',sun(.35));add('comet-nucleus',rocky(.15,4,true));add('comet-coma',haze(.35),[0,0,0],true);
add('ion-tail',tail(false),[0,0,0],true);add('dust-tail',tail(true),[0,0,0],true);
// A separately licensed display copy opts into CSS-pixel points. The shared
// source catalogue and legacy sample-solar fixture remain byte-for-byte intact.
const catalogue=JSON.parse(readFileSync('public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json','utf8'));
// Slightly stronger core coverage at laptop DPR without a halo or world-space geometry.
catalogue.meta.pointSizeCssPx=8.5;
catalogue.meta.linkRadius=.024;
writeFileSync('public/catalogues/solar-system/stars-hyg-v41-readable-cc-by-sa.json',JSON.stringify(catalogue,null,2)+'\n');
file.sim.overlays.find((o:any)=>o.kind==='catalogue-sky').catalogue='stars-hyg-v41-readable-cc-by-sa.json';
file.model='/models/solar-system.glb';
// Solar photosphere colour is baked; the former additive glow would wash it out.
file.sim.bind=file.sim.bind.filter((b:any)=>!(b.part==='sun'&&b.glow));
partsFile.parse(file);
mkdirSync('public/models',{recursive:true});
await MeshoptEncoder.ready;
// Keep the accepted positions, UVs, triangle order, emission modes and WebPs intact.
// glTF's normalized attributes pack lighting normals to 16 bits and RGBA to 8 bits;
// GLTFLoader decodes them natively. This avoids downsampling any close-up texture.
await doc.transform(weld(),dedup(),prune(),quantize({pattern:/^(NORMAL|COLOR_0)$/,quantizeNormal:16,quantizeColor:8}));
// Required explicitly because only NORMAL (not POSITION) uses mesh quantization.
doc.createExtension(KHRMeshQuantization).setRequired(true);
const glb=await new NodeIO().registerExtensions([EXTTextureWebP,EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);
if(glb.byteLength>1_500_000)throw new Error(`Solar-system GLB exceeds 1,500,000 bytes: ${glb.byteLength}`);
writeFileSync('public/models/solar-system.glb',glb);
writeFileSync(`${dir}/proposed-parts.json`,JSON.stringify(file,null,2)+'\n');
writeFileSync(`${topic}/data/parts.json`,JSON.stringify(file,null,2)+'\n');
writeFileSync(`${dir}/triangle-counts.json`,JSON.stringify(counts,null,2)+'\n');
console.log(counts);
