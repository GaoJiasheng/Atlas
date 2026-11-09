/** Original build-time insect relief meshes. All lengths are scene units.
 * Curved cuticular lofts, articulated tarsi, socketed spines, real vein relief.
 * Shared only by grasshopper and mosquito; no runtime dependency. */
import fs from 'node:fs';
import {BufferGeometry,BufferAttribute,Vector3,CatmullRomCurve3,Color,Matrix4} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,meshopt,simplify} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {partSchema} from '../../../src/engines/space-scene/schema.ts';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const body=css.slice(css.indexOf(':root[data-theme="paper"] {'));
export const tokens=Object.fromEntries([...body.slice(0,body.indexOf('\n}')).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));
export const V=p=>new Vector3(...p),arr=v=>v.toArray();
export const mix=(a,b,t)=>arr(V(a).lerp(V(b),t));
export const worldPath=p=>p.path.map(x=>arr(V(x).add(V(p.at))));
const base=new Color(tokens.bone);
export class Relief {
 pieces=[]; features=[];
 add(g,color='fossil',alpha=1){
  const c=new Color(tokens[color]??color),ps=g.getAttribute('position'),rgb=new Float32Array(ps.count*4);
  for(let i=0;i<ps.count;i++)rgb.set([c.r/base.r,c.g/base.g,c.b/base.b,alpha],i*4);
  g.setAttribute('color',new BufferAttribute(rgb,4));
  if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');this.pieces.push(g);return g;
 }
 /** Variable elliptical sections transported along a centripetal centreline. */
 loft(path,radii,color='fossil',options={}){
  const curve=new CatmullRomCurve3(path.map(V)),steps=Math.max(4,Math.round((options.steps??Math.max(8,path.length*6))*(this.specimen?.6:1))),radial=Math.max(10,Math.round((options.radial??20)*(this.specimen?.65:1)));
  const pos=[],ix=[],up=V(options.up??[0,0,1]);
  const radius=t=>{const x=t*(radii.length-1),i=Math.min(radii.length-2,Math.floor(x)),f=x-i;return radii[i]*(1-f)+radii[i+1]*f;};
  for(let i=0;i<=steps;i++){
   const t=i/steps,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();let u=up.clone().addScaledVector(tan,-up.dot(tan));if(u.length()<.01)u=new Vector3(0,1,0).cross(tan);u.normalize();const v=tan.clone().cross(u).normalize();
   const r=radius(t),flat=options.flat??1;
   for(let j=0;j<radial;j++){const a=j/radial*Math.PI*2;pos.push(...arr(p.clone().addScaledVector(u,Math.cos(a)*r*flat).addScaledVector(v,Math.sin(a)*r)));}
  }
  for(let i=0;i<steps;i++)for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=a+radial,d=b+radial;ix.push(a,b,c,b,d,c);}
  // Point fans close the ends without spheres at every joint.
  for(const end of [0,steps]){const k=pos.length/3;pos.push(...arr(curve.getPoint(end/steps)));for(let j=0;j<radial;j++){const a=end*radial+j,b=end*radial+(j+1)%radial;ix.push(...(end===0?[k,b,a]:[k,a,b]));}}
  const g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pos),3));g.setIndex(ix);g.computeVertexNormals();return this.add(g,color);
 }
 segment(a,b,r,color='fossil',flat=1){return this.loft([a,mix(a,b,.12),mix(a,b,.4),mix(a,b,.78),b],[r*.65,r*1.1,r,r*.78,r*.58],color,{flat,steps:14});}
 feature(kind,at,detail={}){this.features.push({kind,at,...detail});}
 bake(part,filter=()=>true){
  const copy=structuredClone(part);const prims=[copy.primitive,...copy.extra??[]].filter(filter);if(!prims.length)return;copy.primitive=prims[0];copy.extra=prims.slice(1);if(!copy.extra.length)delete copy.extra;
  const p=partSchema.parse(copy),slots=partMaterialSlots(p);
  for(const piece of partPieces(p)){if(piece.lines)continue;for(const m of piece.matrices??[new Matrix4()]){
   const g=piece.geometry.clone().applyMatrix4(m).translate(...p.primitive.at);const slot=slots[piece.slot??0];this.add(g,resolveMaterialLook(slot.color,tokens,'paper',slot.tint).color);
  }}
 }
 geometry(){return mergeGeometries(this.pieces,false);}
}
export function along(path,t){const c=new CatmullRomCurve3(path.map(V));return arr(c.getPointAt(Math.max(0,Math.min(1,t))));}
export function tarsus(mesh,path,count,r,color,whiteBands=0,allWhiteLast=false){
 const lengths=count===3?[0,.44,.64,1]:[0,.4,.6,.75,.87,1];
 for(let k=0;k<count;k++){
  const a=along(path,lengths[k]),b=along(path,lengths[k+1]),rad=r*(1-.11*k);
  const pts=[a,mix(a,b,.08),mix(a,b,.25),mix(a,b,.75),b];
  mesh.loft(pts,[rad*.57,rad,rad*.94,rad*.76,rad*.5],allWhiteLast&&k===4?'bone':color,{radial:24,steps:16,flat:count===3?.72:1});
  if(k<whiteBands){const g=mesh.pieces.at(-1),p=g.getAttribute('position'),c=g.getAttribute('color'),axis=V(b).sub(V(a)),length2=axis.lengthSq();for(let i=0;i<p.count;i++){const t=new Vector3().fromBufferAttribute(p,i).sub(V(a)).dot(axis)/length2;if(t<.36)c.setXYZW(i,1,1,1,1);}}
  if(count===3){const padPath=[.09,.24,.46,.7,.82].map(t=>mix(a,b,t)).map(p=>[p[0],p[1]-rad*.53,p[2]]);mesh.loft(padPath,[rad*.15,rad*.6,rad*.7,rad*.58,rad*.12],'ink-3',{flat:1.3,radial:32,steps:22});}
  mesh.feature('tarsomere',mix(a,b,.5),{index:k+1,count});
 }
 const tip=path.at(-1),dir=V(tip).sub(V(along(path,.92))).normalize();let lateral=new Vector3(0,1,0).cross(dir).normalize();if(lateral.length()<.1)lateral.set(0,0,1);
 const cr=r*(count===3?2.1:1.8);
 for(const s of [-1,1]){const a=V(tip).addScaledVector(lateral,s*r*.62),b=a.clone().addScaledVector(dir,cr*.65).addScaledVector(lateral,s*cr*.44),c=a.clone().addScaledVector(dir,cr).addScaledVector(lateral,s*cr*.28).add(new Vector3(0,-cr*.3,0)),d=a.clone().addScaledVector(dir,cr*.7).add(new Vector3(0,-cr*.55,0));mesh.loft([arr(a),arr(b),arr(c),arr(d)],[r*.29,r*.25,r*.16,r*.015],'ink',{radial:16,steps:16});mesh.feature('claw',arr(c));}
 if(count===3){const a=V(tip).addScaledVector(dir,r*.15),b=a.clone().addScaledVector(dir,r*.75);mesh.loft([arr(a),arr(a.clone().lerp(b,.5)),arr(b)],[r*.4,r*.65,r*.32],'ink-3',{flat:1.2,steps:10});mesh.feature('arolium',arr(b));}
}
export async function publish(topic,data,meshes){
 const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene(topic+'-relief');const metrics={};
 doc.getRoot().getAsset().copyright='Atlas original procedural reconstruction; reference photographs listed in topic REBUILD-3D.md. No third-party mesh.';
 const material=doc.createMaterial('cuticle-relief').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.42).setMetallicFactor(0).setExtras({atlasSurface:true});
 for(const [id,relief] of Object.entries(meshes)){
  const g=relief.geometry(), translucent=Array.from(g.getAttribute('color').array).some((v,i)=>i%4===3&&v<.99);
  const own=translucent?material.clone().setAlphaMode('BLEND').setDoubleSided(true).setRoughnessFactor(.72):material;
  const prim=doc.createPrimitive().setMaterial(own);
  for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]){const a=g.getAttribute(name);prim.setAttribute(semantic,doc.createAccessor().setType(name==='color'?'VEC4':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));}
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(prim)).setExtras({closed:false}));
  metrics[id]={triangles:g.getAttribute('position').count/3,features:relief.features};
  const part=data.parts.find(p=>p.id===id.replace(/-other$/,''));
  if(!id.endsWith('-other')){delete part.primitive;delete part.extra;delete part.repeat;part.mesh=id;part.material={color:'chitin',tint:'token:bone'};if(part.bilateral)part.bilateral={mesh:id+'-other'};}
 }
 await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);await doc.transform(weld(),simplify({simplifier:{...MeshoptSimplifier,simplify:(indices,positions,stride,target,error,flags)=>{const prim=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).find(p=>p.getAttribute('POSITION').getArray()===positions);if(!prim)return MeshoptSimplifier.simplify(indices,positions,stride,target,error,flags);const n=prim.getAttribute('NORMAL').getArray(),c=prim.getAttribute('COLOR_0').getArray(),attrs=new Float32Array(n.length/3*7);for(let i=0;i<n.length/3;i++)attrs.set([n[i*3],n[i*3+1],n[i*3+2],c[i*4],c[i*4+1],c[i*4+2],c[i*4+3]],i*7);return MeshoptSimplifier.simplifyWithAttributes(indices,positions,stride,attrs,7,[.04,.04,.04,.12,.12,.12,.1],null,target,error,flags);}},ratio:.35,error:.00025,lockBorder:true}),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10,quantizeColor:10}));
 // A wing is one draw with vertex alpha. Cache optimization may interleave
 // its membrane with veins. Preserve the actual GPU painter order explicitly:
 // translucent membrane triangles first, fully opaque raised relief last.
 for(const primitive of doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives())){
  if(primitive.getMaterial()?.getAlphaMode()!=='BLEND')continue;
  const color=primitive.getAttribute('COLOR_0'),alpha=color.getArray(),indices=primitive.getIndices(),source=indices.getArray(),clear=[],solid=[];
  let maxAlpha=0;for(let i=3;i<alpha.length;i+=4)maxAlpha=Math.max(maxAlpha,alpha[i]);
  for(let i=0;i<source.length;i+=3){const target=(alpha[source[i]*4+3]+alpha[source[i+1]*4+3]+alpha[source[i+2]*4+3])/3<maxAlpha*.99?clear:solid;target.push(source[i],source[i+1],source[i+2]);}
  indices.setArray(new source.constructor([...clear,...solid]));
 }
 const dest=`public/models/${topic}.glb`;fs.mkdirSync('public/models',{recursive:true});const bytes=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);fs.writeFileSync(dest,bytes);
 for(const node of doc.getRoot().listNodes()){const p=node.getMesh()?.listPrimitives()[0];if(p)metrics[node.getName()].shippedTriangles=p.getIndices().getCount()/3;}
 data.model=`/models/${topic}.glb`;fs.writeFileSync(`src/content/topics/${topic}/data/parts.json`,JSON.stringify(data,null,1)+'\n');
 fs.writeFileSync(`scripts/geo/${topic}/mesh-audit.json`,JSON.stringify({bytes:bytes.length,parts:metrics},null,2)+'\n');console.log(topic,bytes.length,'bytes',Object.values(metrics).reduce((s,p)=>s+p.triangles,0),'triangles');
}
export function otherSide(relief){const out=new Relief();for(const src of relief.pieces){const g=src.clone();const ps=g.getAttribute('position'),ns=g.getAttribute('normal');for(let i=0;i<ps.count;i++){const z=ps.getZ(i);ps.setZ(i,-z);ns.setZ(i,-ns.getZ(i)); // Wind the reflected surface outwards.
 }for(let i=0;i<ps.count;i+=3)for(const name of ['position','normal','color']){const a=g.getAttribute(name),b=[a.getX(i+1),a.getY(i+1),a.getZ(i+1),a.itemSize===4?a.getW(i+1):1];if(a.itemSize===4){a.setXYZW(i+1,a.getX(i+2),a.getY(i+2),a.getZ(i+2),a.getW(i+2));a.setXYZW(i+2,...b);}else{a.setXYZ(i+1,a.getX(i+2),a.getY(i+2),a.getZ(i+2));a.setXYZ(i+2,...b.slice(0,3));}}
 out.pieces.push(g);}return out;}
