/** CPU triangle rasterisation of the actual generated mesh and analytic
 * sunlight, atlasSurface night fill and accepted solar emission path.
 * No browser, desktop, WebGL or GPU; DOM/HUD acceptance remains downstream.
 * pnpm tsx scripts/geo/sun-earth-moon/render-preview.ts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { EXTTextureWebP, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { BufferAttribute, BufferGeometry, CylinderGeometry, Color, Matrix3, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { parse } from 'yaml';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { orbitSnapshot, type V3, type OrbitSnapshot } from '../../../src/engines/space-scene/lib/sim/orbit-rotation';
import { orbitDisplay, bodyPlacement, orbitalTiltGuide } from '../../../src/engines/space-scene/lib/sim/orbit-projection';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
import { sampleMap, geographicDirection } from './surfaces';
const root=resolve(import.meta.dirname,'../../..'),topic=resolve(root,'src/content/topics/sun-earth-moon');
const output=process.argv[2]?.startsWith('--')?'/tmp/atlas-sun-earth-moon/previews':process.argv[2]??'/tmp/atlas-sun-earth-moon/previews';
const selected=process.argv.indexOf('--only');const only=selected<0?null:process.argv[selected+1];mkdirSync(output,{recursive:true});
const raw=JSON.parse(readFileSync(resolve(topic,'data/parts.json'),'utf8'));
const file=partsFile.parse(raw);
const table=JSON.parse(readFileSync(resolve(topic,'data/singapore-sun-2026.json'),'utf8'));
const sim=simSchema.parse({...raw.sim,orbitRotation:{...raw.sim.orbitRotation,solarYear:{...raw.sim.orbitRotation.solarYear,table}}});
const cfg=sim.orbitRotation!;
const chapters=readdirSync(resolve(topic,'chapters')).sort().map(f=>parse(readFileSync(resolve(topic,'chapters',f),'utf8').split('---')[1]!) as {state:{camera:{position:V3;target:V3;fov:number};beats:{camera:{position:V3;target:V3;fov:number};sim:{set:Record<string,unknown>};hide:string[]}[];sim:{set:Record<string,unknown>}}});
const snapshot=(chapter:number,beat:number)=>orbitSnapshot(cfg,resolveSimValues(sim,{...chapters[chapter]!.state.sim.set,...chapters[chapter]!.state.beats[beat]!.sim.set}),{timeSeconds:0});
interface Texture {data:Buffer;width:number;height:number;channels:number}
interface Piece {g:BufferGeometry;matrix:Matrix4;color:Color;texture?:Texture;body?:'earth'|'moon'|'sun';kind?:string}
const maps=new Map<string,{g:BufferGeometry;texture:Texture}>();
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions([EXTTextureWebP,EXTMeshoptCompression]).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(resolve(root,'public/models/sun-earth-moon.glb'));
for(const n of doc.getRoot().listNodes()){
 const p=n.getMesh()!.listPrimitives()[0]!,g=new BufferGeometry();
 for(const [a,b]of [['POSITION','position'],['NORMAL','normal'],['TEXCOORD_0','uv']]){
  const attr=p.getAttribute(a!)!;g.setAttribute(b!,new BufferAttribute(new Float32Array(attr.getArray()!),attr.getElementSize()));
 }
 g.setIndex(new BufferAttribute(new Uint32Array(p.getIndices()!.getArray()!),1));
 const tex=p.getMaterial()!.getBaseColorTexture()!,img=await sharp(Buffer.from(tex.getImage()!)).removeAlpha().raw().toBuffer({resolveWithObject:true});
 maps.set(n.getName(),{g,texture:{data:img.data,width:img.info.width,height:img.info.height,channels:img.info.channels}});
}
const tokens=new Map<string,string>();
for(const m of readFileSync(resolve(root,'src/theme/tokens.css'),'utf8').matchAll(/--([\w-]+):\s*([^;]+);/g)) if(!tokens.has(m[1]!))tokens.set(m[1]!,m[2]!);
function color(s:string):Color{
 if(s.startsWith('token:'))return color(tokens.get(s.slice(6))??'#857d70');
 const a=/var\(--([\w-]+)\)/.exec(s);if(a)return color(tokens.get(a[1]!)??'#857d70');
 return new Color(s.startsWith('#')?s:'#c9bc9f');
}
function pieces(s:OrbitSnapshot,textured=true,only?:string[]):Piece[]{
 const d=orbitDisplay(cfg,s,'schematic'),out:Piece[]=[];
 for(const part of file.parts){
  if(only&&!only.includes(part.id))continue;
  const binding=sim.bind.find(b=>'part'in b&&b.part===part.id&&b.bodyTransform);
  if(!binding||!('bodyTransform'in binding)||!binding.bodyTransform)continue;
  const t=bodyPlacement(s,d,binding.bodyTransform),m=new Matrix4().compose(new Vector3(...t.position),new Quaternion(...t.quaternion),new Vector3(t.scale,t.scale,t.scale));
  const surface=textured?maps.get(part.id):null;
  const body=binding.bodyTransform.body==='observer'?undefined:binding.bodyTransform.body;
  if(surface){out.push({g:surface.g,matrix:m,color:new Color('white'),texture:surface.texture,body});continue;}
  for(const piece of partPieces(!textured&&maps.has(part.id)?{...part,mesh:undefined,primitive:{kind:'sphere' as const,size:[1],at:[0,0,0],color:'matte',tint:part.id==='earth-body'?'token:cold':part.id==='moon-body'?'token:neutral':'token:en-light'}}:part))for(const instance of piece.matrices??[new Matrix4()]){
   const slot=partMaterialSlots(part)[piece.slot??0]??{color:'matte',tint:part.id==='earth-body'?'token:cold':part.id==='moon-body'?'token:neutral':'token:en-light'};
   out.push({g:piece.geometry,matrix:m.clone().multiply(instance),color:color(slot.tint??slot.color),body:part.id.endsWith('-body')?body:undefined,kind:part.id});
  }
 }
 return out;
}
/** The same plane/normal/tilt-arc points and tube radius as OrbitDriver. */
function tiltGuides(s:OrbitSnapshot):Piece[]{
 const d=orbitDisplay(cfg,s,'schematic'),e=new Vector3(...d.centres.earth),r=d.radii.earth;
 const points=orbitalTiltGuide(d.centres.earth,s.axis,r,.84);
 const sun=new Vector3(...s.solarDirections.earth),b1=new Vector3().crossVectors(sun,Math.abs(sun.y)<.9?new Vector3(0,1,0):new Vector3(1,0,0)).normalize(),b2=new Vector3().crossVectors(sun,b1);
 points.push([NaN,0,0],e.clone().addScaledVector(sun,r*1.1).toArray() as V3,e.clone().addScaledVector(sun,r*3).toArray() as V3,[NaN,0,0]);
 for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;points.push(e.clone().addScaledVector(b1,Math.cos(a)*r*1.006).addScaledVector(b2,Math.sin(a)*r*1.006).toArray() as V3);}
 const out:Piece[]=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1]!,b=points[i]!;if(!Number.isFinite(a[0])||!Number.isFinite(b[0]))continue;
  const start=new Vector3(...a),end=new Vector3(...b),v=end.clone().sub(start),length=v.length();if(length<1e-12)continue;
  const matrix=new Matrix4().compose(start.add(end).multiplyScalar(.5),new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v.normalize()),new Vector3(1,1,1));
  out.push({g:new CylinderGeometry(r*.006,r*.006,length,6,1,true),matrix,color:color('token:ink-3'),kind:'orbit-guide'});
 }
 return out;
}
const width=1100,height=900,footer=50;
type Screen={x:number;y:number;q:number;u:number;v:number;nx:number;ny:number;nz:number;px:number;py:number;pz:number};
const cross=(a:Screen,b:Screen,x:number,y:number)=>(b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x);
const aces=(v:number)=>Math.max(0,Math.min(1,(v*(2.51*v+.03))/(v*(2.43*v+.59)+.14)));
const gamma=(v:number)=>v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055;
const linear=Array.from({length:256},(_,i)=>{const v=i/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
const viewReports:unknown[]=[];
async function render(name:string,items:Piece[],position:V3,target:V3,fov:number,sun:V3,title:string,textured=true,dark=false,baselineFill=.035){
 if(only&&name!==only)return;
 const camera=new PerspectiveCamera(fov,width/(height-footer),.0001,10000);camera.position.fromArray(position);camera.lookAt(...target);camera.updateMatrixWorld();
 const buffer=Buffer.alloc(width*height*3);for(let i=0;i<width*height;i++)[0,1,2].forEach(c=>buffer[i*3+c]=dark?[31,33,36][c]!:[233,228,216][c]!);
 const depth=new Float64Array(width*height).fill(Infinity);const light=new Vector3(...sun).normalize();let tris=0;
 for(const item of items){
  const p=item.g.getAttribute('position'),n=item.g.getAttribute('normal'),uv=item.g.getAttribute('uv'),idx=item.g.index;
  const nm=new Matrix3().getNormalMatrix(item.matrix);
  const verts:Screen[]=Array.from({length:p.count},(_,i)=>{
   const pt=new Vector3().fromBufferAttribute(p,i).applyMatrix4(item.matrix),no=new Vector3().fromBufferAttribute(n,i).applyMatrix3(nm).normalize();
   const pr=pt.clone().applyMatrix4(camera.matrixWorldInverse),q=1/-pr.z;pr.applyMatrix4(camera.projectionMatrix);
   return {x:(pr.x*.5+.5)*width,y:(.5-pr.y*.5)*(height-footer),q,u:uv?.getX(i)??0,v:uv?.getY(i)??0,nx:no.x,ny:no.y,nz:no.z,px:pt.x,py:pt.y,pz:pt.z};
  });
  const count=idx?.count??p.count;tris+=count/3;
  for(let i=0;i<count;i+=3){
   const a=verts[idx?.getX(i)??i]!,b=verts[idx?.getX(i+1)??i+1]!,c=verts[idx?.getX(i+2)??i+2]!;
   if(a.q<=0||b.q<=0||c.q<=0)continue;
   const area=cross(a,b,c.x,c.y);if(area>=-1e-9)continue;
   const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x))),y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(height-footer-1,Math.ceil(Math.max(a.y,b.y,c.y)));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const aa=cross(b,c,x+.5,y+.5)/area,bb=cross(c,a,x+.5,y+.5)/area,cc=1-aa-bb;if(aa<0||bb<0||cc<0)continue;
    const q=aa*a.q+bb*b.q+cc*c.q,z=1/q,j=y*width+x;if(z>=depth[j]!)continue;depth[j]=z;
    const interp=(key:keyof Screen)=>(aa*a[key]*a.q+bb*b[key]*b.q+cc*c[key]*c.q)/q;
    let nx=interp('nx'),ny=interp('ny'),nz=interp('nz');const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
    let r=item.color.r,g=item.color.g,bl=item.color.b;
    if(item.texture){const tex=item.texture,lat=90-interp('v')*180,lon=interp('u')*360-180;[r,g,bl]=[0,1,2].map(k=>{const v=sampleMap(tex.data,tex.width,tex.height,tex.channels,lat,lon,k),i=Math.max(0,Math.min(254,Math.floor(v)));return linear[i]!+(linear[i+1]!-linear[i]!)*(v-i);}) as V3;}
    const day=Math.max(0,nx*light.x+ny*light.y+nz*light.z);
    let rgb:V3=[r,g,bl];
    if(item.body==='sun'){
     if(textured){const vx=position[0]-interp('px'),vy=position[1]-interp('py'),vz=position[2]-interp('pz'),mu=Math.abs((vx*nx+vy*ny+vz*nz)/Math.hypot(vx,vy,vz));rgb=rgb.map(v=>v*(1.5*(.46+.54*mu))) as V3;}
    }else if(item.body){
     const fill=textured?.05:baselineFill;
     rgb=rgb.map(v=>textured?fill*(1-day)+v*day:v*(fill+(1-fill)*day)) as V3;
    }else{const lit=.45+.55*Math.max(0,nx*.4+ny*.7+nz*.5);rgb=rgb.map(v=>v*lit) as V3;}
    rgb.forEach((v,k)=>buffer[j*3+k]=Math.round(gamma(aces(v*(dark?1:1.05)))*255));
   }
  }
 }
 const caption=`<svg width="${width}" height="${height}"><text x="20" y="${height-30}" font-size="15" font-family="sans-serif" fill="${dark?'#e7e5df':'#2a2824'}">${title}</text><text x="20" y="${height-12}" font-size="11" font-family="monospace" fill="${dark?'#b9b4a8':'#555047'}">CPU MESH PREVIEW · ${textured?'LIVE ATLAS SURFACE':'ROUND-1 BASELINE'} · ${tris} TRIANGLES · NO BROWSER / GPU / HUD QA</text></svg>`;
 await sharp(buffer,{raw:{width,height,channels:3}}).composite([{input:Buffer.from(caption)}]).png().toFile(resolve(output,name+'.png'));
 viewReports.push({name,triangles:tris,position,target,fov,textured});process.stdout.write(name+'\n');
}
// Close-ups use the same shipped geometry with unit-scale body placements.
const identity=new Matrix4();
for(const [name,direction]of [['earth-singapore',geographicDirection(10,108)],['earth-africa',geographicDirection(15,22)],['earth-americas',geographicDirection(14,-85)]] as const){
 const model=maps.get('earth-body')!;
 const pos=direction.map(v=>v*3.5) as V3;
 const light=new Vector3(...direction).add(new Vector3(-.6,.35,.1)).normalize().toArray() as V3;
 await render(name,[{g:model.g,matrix:identity,color:new Color('white'),texture:model.texture,body:'earth'}],pos,[0,0,0],38,light,'Natural Earth 110m · continents, illustrative clouds, fixed Singapore locator');
}
const earth=maps.get('earth-body')!;
await render('earth-night',[{g:earth.g,matrix:identity,color:new Color('white'),texture:earth.texture,body:'earth'}],[3.5,.6,0],[0,0,0],38,[-1,.1,0],'Neutral grey teaching fill on the night side',true,true);
const moon=maps.get('moon-body')!;
for(const [name,pos,light]of [['moon-nearside',[3.4,.1,0],[1,.15,.15]],['moon-quarter',[3.4,.1,0],[.15,.1,1]],['moon-farside',[-3.4,.2,0],[-1,.3,.2]]] as [string,V3,V3][]){
 await render(name,[{g:moon.g,matrix:identity,color:new Color('white'),texture:moon.texture,body:'moon'}],pos,[0,0,0],38,light,'LROC maria and crater rays · LOLA relief at true vertical scale');
}
const sun=maps.get('sun-body')!;
await render('sun-self-lit',[{g:sun.g,matrix:identity,color:new Color('white'),texture:sun.texture,body:'sun'}],[2,.7,3],[0,0,0],38,[-1,0,0],'Self-luminous photosphere · restrained granulation and limb darkening');
await render('sun-self-lit-cinema',[{g:sun.g,matrix:identity,color:new Color('white'),texture:sun.texture,body:'sun'}],[-2,.2,-3],[0,0,0],38,[1,0,0],'Self-lit Sun · opposing camera and light · no moving specular',true,true);
await render('moon-night',[{g:moon.g,matrix:identity,color:new Color('white'),texture:moon.texture,body:'moon'}],[3.4,.1,0],[0,0,0],38,[-1,0,0],'Neutral dark grey lunar night-side teaching fill',true,true);
// A camera and inspection light at Earth isolate orientation from lunar phase.
// These four panels verify the actual snapshot quaternion, not a duplicate map.
for(const angle of [0,90,180,270]){
 const s=orbitSnapshot(cfg,resolveSimValues(sim,{...chapters[4]!.state.sim.set,'lunar-angle':angle,synchronous:true}),{timeSeconds:0});
 const d=orbitDisplay(cfg,s,'schematic'),centre=new Vector3(...d.centres.moon),direction=new Vector3(...d.centres.earth).sub(centre).normalize();
 const eye=centre.clone().addScaledVector(direction,d.radii.moon*3.4).toArray() as V3;
 await render(`synchronous-${angle}`,pieces(s,true,['moon-body']),eye,centre.toArray() as V3,38,direction.toArray() as V3,`Moon from Earth at orbit ${angle}° · camera-aligned inspection light (phase isolated)`);
}
{
 const s=snapshot(3,0),d=orbitDisplay(cfg,s,'schematic'),centre=new Vector3(...d.centres.earth);
 const direction=new Vector3(...s.bodies.observer.position).sub(new Vector3(...s.bodies.earth.position)).normalize();
 await render('singapore-observer',pieces(s,true,['earth-body','observer-marker']),centre.clone().addScaledVector(direction,d.radii.earth*3.5).toArray() as V3,centre.toArray() as V3,38,s.solarDirections.earth,'03.1 · Singapore texture ring and actual moving observer share the same meridian');
}
for(const [name,ci,bi]of [['tilt-02-1',2,0],['far-side-04-5',4,4]] as const){
 const s=snapshot(ci,bi),c=chapters[ci]!.state.beats[bi]!.camera,hide=chapters[ci]!.state.beats[bi]!.hide;
 const visible=file.parts.filter(p=>!hide.includes(p.id)).map(p=>p.id);
 await render(name,[...pieces(s,true,visible),...(ci===2?tiltGuides(s):[])],c.position,c.target,c.fov,s.solarDirections.moon,ci===2?'02.1 · 23.4° axial tilt and equator':'04.5 · enlarged sunlit far-side patch; original controls unchanged');
 if(ci===4)await render('before-04-5',pieces(s,false),[.15,.65,1.6],[0,0,.5],42,s.solarDirections.moon,'Before · blank Moon and the previous wide camera',false);
}
const reportPath=resolve(output,'preview.json');
const previous=only&&existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')).views as {name:string}[]:[];
const rendered=new Set(viewReports.map(v=>(v as {name:string}).name));
writeFileSync(reportPath,JSON.stringify({kind:'CPU raster of final compressed geometry and accepted material formulas; not WebGL, HUD or GPU acceptance',views:[...previous.filter(v=>!rendered.has(v.name)),...viewReports]},null,2)+'\n');
