/** Source-preserving six-region repair. CC BY-SA 4.0; no runtime downloads. */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {weld,quantize,reorder,prune,compactPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {Vector3,Matrix3,Matrix4,Triangle,Ray} from 'three';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..'),req=createRequire(import.meta.url);
const {ALL_EXTENSIONS,EXTMeshoptCompression}=await import(pathToFileURL(req.resolve('@gltf-transform/extensions',{paths:[dirname(req.resolve('@gltf-transform/functions'))]})));
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const source=JSON.parse(await fs.readFile(resolve(here,'cache/rebuild-source.json'),'utf8'));
const nailMeta=JSON.parse(await fs.readFile(resolve(here,'cache/rebuild-nails-source.json'),'utf8')),nailProjectionCache=new Map();
const results=process.env.MUSCLES_TOPICS?JSON.parse(await fs.readFile(resolve(here,'cache/rebuild-counts.json'),'utf8')):[];
for(const topic of (process.env.MUSCLES_TOPICS?.split(',')??['arms','back','chest','core','legs','shoulders'])){
 const file=resolve(root,`public/models/muscles-${topic}.glb`),before=await fs.readFile(resolve(here,`cache/rebuild-baseline/muscles-${topic}.glb`));
 const doc=await io.readBinary(before),buffer=doc.createBuffer('rebuilt-anatomy'),nodes=doc.getRoot().listNodes(),meshes=nodes.filter(n=>n.getMesh()),find=n=>nodes.find(x=>x.getName()===n);
 const acc=(name,type,a,norm=false)=>doc.createAccessor(name).setType(type).setArray(a).setNormalized(norm).setBuffer(buffer);
 const rig=JSON.parse(await fs.readFile(resolve(here,`${topic}/rig.json`),'utf8'));
 const centre=rig.sourceCentre??rig.sourceChestCentre;const c=[centre[0],centre[2],-centre[1]];
 const oldSkin=find('skin-outline').getSkin(),joints=oldSkin.listJoints(),skin=doc.createSkin('rebuilt-source-rig');for(const j of joints)skin.addJoint(j);skin.setInverseBindMatrices(acc('rebuilt-inverse-bind','MAT4',new Float32Array(joints.flatMap(j=>new Matrix4().fromArray(j.getWorldMatrix()).invert().toArray()))));
 const stats=[];
 function normalArray(pos,idx){const normals=new Float32Array(pos.length);for(let i=0;i<idx.length;i+=3){const [a,b,c]=[idx[i],idx[i+1],idx[i+2]],A=new Vector3().fromArray(pos,a*3),B=new Vector3().fromArray(pos,b*3),C=new Vector3().fromArray(pos,c*3),n=B.sub(A).cross(C.sub(A));for(const k of[a,b,c]){normals[k*3]+=n.x;normals[k*3+1]+=n.y;normals[k*3+2]+=n.z;}}for(let i=0;i<normals.length;i+=3)new Vector3().fromArray(normals,i).normalize().toArray(normals,i);return normals;}
 function topologyRepair(pos,idx){
  const canonical=new Map(),r=[];for(let i=0;i<pos.length;i+=3){const key=[pos[i],pos[i+1],pos[i+2]].map(v=>Math.round(v*1e7)).join(',');if(!canonical.has(key))canonical.set(key,i/3);r.push(canonical.get(key));}
  let degenerate=0,duplicate=0;const seen=new Set(),out=[];for(let i=0;i<idx.length;i+=3){const f=[idx[i],idx[i+1],idx[i+2]],w=f.map(k=>r[k]);if(new Set(w).size<3){degenerate++;continue;}const key=[...w].sort((a,b)=>a-b).join(',');if(seen.has(key)){duplicate++;continue;}seen.add(key);out.push(...f);}
  const edges=new Map(),next=new Map();for(let i=0;i<out.length;i+=3){const f=out.slice(i,i+3).map(k=>r[k]);for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(',');edges.set(key,(edges.get(key)??0)+1);}}
  for(let i=0;i<out.length;i+=3){const f=out.slice(i,i+3).map(k=>r[k]);for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3];if(edges.get([Math.min(a,b),Math.max(a,b)].join(','))===1)next.set(a,b);}}
  let holes=0,added=0;const visited=new Set();for(const start of next.keys()){if(visited.has(start))continue;const loop=[],path=new Set();let k=start;while(next.has(k)&&!path.has(k)){path.add(k);visited.add(k);loop.push(k);k=next.get(k);}if(k!==start||loop.length<3||loop.length>20)continue;let diameter=0;for(const a of loop)for(const b of loop)diameter=Math.max(diameter,new Vector3().fromArray(pos,a*3).distanceTo(new Vector3().fromArray(pos,b*3)));if(diameter>.006)continue;for(let i=1;i<loop.length-1;i++){out.push(loop[0],loop[i+1],loop[i]);added++;}holes++;}
  return{indices:new Uint32Array(out),degenerate,duplicate,holes,added,boundaryEdges:[...edges.values()].filter(v=>v===1).length};
 }
 let totalBefore=0;
 for(const node of meshes){
  const previous=node.getSkin();if(!previous)throw Error('Missing skin '+node.getName());const js=previous.listJoints(),inv=previous.getInverseBindMatrices();const matrices=js.map((j,i)=>{const b=[];inv.getElement(i,b);return new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(b));});
  for(const p of node.getMesh().listPrimitives()){
   const pa=p.getAttribute('POSITION'),na=p.getAttribute('NORMAL'),wa=p.getAttribute('WEIGHTS_0'),ja=p.getAttribute('JOINTS_0'),pos=new Float32Array(pa.getCount()*3),normals=new Float32Array(pos.length),ji=new Uint16Array(pa.getCount()*4),weights=new Float32Array(pa.getCount()*4);
   for(let i=0;i<pa.getCount();i++){const P=[],N=[],W=[],J=[];pa.getElement(i,P);na?.getElement(i,N);wa.getElement(i,W);ja.getElement(i,J);const v=new Vector3(),n=new Vector3();for(let k=0;k<4;k++){ji[i*4+k]=joints.indexOf(js[J[k]]);weights[i*4+k]=W[k];if(W[k]){v.add(new Vector3().fromArray(P).applyMatrix4(matrices[J[k]]).multiplyScalar(W[k]));if(na)n.add(new Vector3().fromArray(N).applyMatrix3(new Matrix3().getNormalMatrix(matrices[J[k]])).multiplyScalar(W[k]));}}v.toArray(pos,i*3);n.normalize().toArray(normals,i*3);}
   const original=p.getIndices()?.getArray()??Uint32Array.from({length:pa.getCount()},(_,i)=>i);totalBefore+=original.length/3;const repair=topologyRepair(pos,original);let idx=repair.indices;
   const name=node.getName(),isSkin=name.startsWith('skin-'),bone=node.getExtras().role==='bone';const ratio=isSkin?.65:bone?.30:topic==='legs'?.25:topic==='back'?.30:.35,error=isSkin?.0006:bone?.001:['back','legs'].includes(topic)?.00085:.00075;
   if(idx.length>1200){[idx]=MeshoptSimplifier.simplify(idx,pos,3,Math.floor(idx.length/3*ratio)*3,error,['LockBorder','ErrorAbsolute']);}
   p.setAttribute('POSITION',acc(name+'-position','VEC3',pos)).setAttribute('NORMAL',acc(name+'-normal','VEC3',na?normals:normalArray(pos,idx))).setAttribute('JOINTS_0',acc(name+'-joints','VEC4',ji)).setAttribute('WEIGHTS_0',acc(name+'-weights','VEC4',weights)).setIndices(acc(name+'-triangles','SCALAR',idx));
   const uv=p.getAttribute('TEXCOORD_0');if(uv){const a=[];for(let i=0;i<uv.getCount();i++){const v=[];uv.getElement(i,v);a.push(...v.map(x=>Math.round(x*4095)/4095));}p.setAttribute('TEXCOORD_0',acc(name+'-uv','VEC2',Int16Array.from(a,x=>Math.round(Math.max(-1,Math.min(1,x))*32767)),true));}
   for(const semantic of ['_U','_FIBRE']){const a=p.getAttribute(semantic);if(!a)continue;const arr=[];for(let i=0;i<a.getCount();i++){const v=[];a.getElement(i,v);arr.push(...v);}p.setAttribute(semantic,acc(name+semantic,a.getType(),semantic==='_U'?Uint16Array.from(arr,x=>Math.round(Math.min(1,Math.max(0,x))*65535)):Int8Array.from(arr,x=>Math.round(Math.min(1,Math.max(-1,x))*127)),true));}
   stats.push({name,sourceTriangles:original.length/3,afterTriangles:idx.length/3,errorLimitM:error,removedDegenerate:repair.degenerate,removedDuplicate:repair.duplicate,filledTinyHoles:repair.holes,addedTriangles:repair.added,boundaryEdgesBefore:repair.boundaryEdges});
  }
  node.setSkin(skin).setTranslation([0,0,0]).setRotation([0,0,0,1]).setScale([1,1,1]);
 }
 // Actual continuous implicit skin reconstructed from the complete source surface union.
 const continuous=JSON.parse(await fs.readFile(resolve(here,'cache/rebuild-skin-compact.json'),'utf8'));
 for(const name of ['skin-outline','skin-hand.l','skin-hand.r']){
  const geometry=continuous.parts[name];const pos=Float32Array.from(geometry.positions.flat(),(x,i)=>x-c[i%3]),norm=new Float32Array(geometry.normals.flat()),n=pos.length/3,J=new Uint16Array(n*4),W=new Float32Array(n*4);
  for(let i=0;i<n;i++){let entries=geometry.weights[i].map((w,k)=>[w,k]).filter(([w])=>w>0).sort((a,b)=>b[0]-a[0]).slice(0,4);const total=entries.reduce((s,[w])=>s+w,0);for(let k=0;k<entries.length;k++){J[i*4+k]=joints.findIndex(j=>j.getName()===continuous.jointNames[entries[k][1]]);W[i*4+k]=entries[k][0]/total;}}
  let idx=Uint32Array.from(geometry.indices);const before=geometry.rawTriangles;const p=doc.createPrimitive().setAttribute('POSITION',acc(name+'-continuous-position','VEC3',pos)).setAttribute('NORMAL',acc(name+'-continuous-normal','VEC3',norm)).setAttribute('JOINTS_0',acc(name+'-continuous-joints','VEC4',J)).setAttribute('WEIGHTS_0',acc(name+'-continuous-weights','VEC4',W)).setIndices(acc(name+'-continuous-indices','SCALAR',idx));const node=find(name),mesh=doc.createMesh(name+'-continuous').setExtras({closed:false,role:'skin'});p.setMaterial(node.getMesh().listPrimitives()[0].getMaterial());mesh.addPrimitive(p);node.setMesh(mesh).setSkin(skin).setExtras({...node.getExtras(),continuousSkin:true,voxelStepM:continuous.stepM,method:continuous.method});stats.push({name:name+' continuous source skin',sourceTriangles:before,afterTriangles:idx.length/3,voxelStepM:continuous.stepM,errorLimitM:geometry.error});
 }
 // Z-Anatomy's five true nail plates on each hand and foot, with their original asymmetry.
 for(const side of ['l','r'])for(const foot of [false,true]){
  const name=`Nail plate${foot?' (foot)':''}.${side}`,sourceMesh=source.meshes[name];if(!sourceMesh)throw Error('Missing '+name);const sculpt=continuous.parts[foot?'skin-outline':`skin-hand.${side}`];// Project the native mid-surface while retaining its real closed-shell thickness.
  let prepared=nailProjectionCache.get(name);
  if(!prepared){
   const meta=nailMeta[name],faces=[];
   for(let i=0;i<sculpt.indices.length;i+=3){const ids=sculpt.indices.slice(i,i+3),vertices=ids.map(k=>new Vector3(...sculpt.positions[k]));if(foot&&vertices.every(v=>v.y>.16))continue;const centre=vertices.reduce((a,b)=>a.add(b),new Vector3()).multiplyScalar(1/3),radius=Math.max(...vertices.map(v=>v.distanceTo(centre)));faces.push({ids,tri:new Triangle(...vertices),centre,radius});}
   const ray=new Ray(),point=new Vector3(),direction=new Vector3(),closest=new Vector3(),best=new Vector3(),bary=new Vector3(),normal=new Vector3(),bestNormal=new Vector3(),projected=[];let rayMisses=0;
   for(let i=0;i<meta.midPositions.length;i++){
    point.fromArray(meta.midPositions[i]);direction.fromArray(meta.normals[i]);ray.set(point.clone().addScaledVector(direction,.025),direction.clone().negate());let min=Infinity;
    const near=faces.filter(f=>f.centre.distanceToSquared(point)<(.03+f.radius)**2);
    const setBest=(f,q)=>{best.copy(q);f.tri.getBarycoord(q,bary);normal.set(0,0,0);for(let k=0;k<3;k++)normal.addScaledVector(new Vector3(...sculpt.normals[f.ids[k]]),bary.getComponent(k));bestNormal.copy(normal.normalize());};
    for(const f of near){if(!ray.intersectTriangle(f.tri.a,f.tri.b,f.tri.c,false,closest))continue;const d=ray.origin.distanceToSquared(closest);if(d>=min)continue;min=d;setBest(f,closest);}
    if(!Number.isFinite(min)){rayMisses++;for(const f of near){f.tri.closestPointToPoint(point,closest);const d=point.distanceToSquared(closest);if(d>=min)continue;min=d;setBest(f,closest);}}
    if(!Number.isFinite(min))throw Error('No skin projection for native nail '+name);
    // Restore the original CLOSED shell's signed displacement about its
    // mid-surface. The underside is above skin by at least 80 micrometres.
    best.addScaledVector(bestNormal,meta.lifts[i]+meta.signedOffsets[i]);projected.push(...best.toArray());
   }
   prepared={projected,rayMisses};nailProjectionCache.set(name,prepared);
  }
  const projected=prepared.projected.map((x,i)=>x-c[i%3]);
  const pos=new Float32Array(projected);let idx=Uint32Array.from(sourceMesh.indices);[idx]=MeshoptSimplifier.simplify(idx,pos,3,(foot?700:1000)*3,.00003,['LockBorder','ErrorAbsolute']);const ji=joints.findIndex(j=>j.getName()===`joint.${foot?'ankle':'hand'}.${side}`),n=pos.length/3,J=new Uint16Array(n*4),W=new Float32Array(n*4);for(let i=0;i<n;i++){J[i*4]=ji;W[i*4]=1;}const p=doc.createPrimitive().setAttribute('POSITION',acc(name+'-position','VEC3',pos)).setAttribute('NORMAL',acc(name+'-normal','VEC3',normalArray(pos,idx))).setAttribute('JOINTS_0',acc(name+'-joints','VEC4',J)).setAttribute('WEIGHTS_0',acc(name+'-weights','VEC4',W)).setIndices(acc(name+'-triangles','SCALAR',idx));const target=find(foot?'skin-outline':`skin-hand.${side}`);p.setMaterial(target.getMesh().listPrimitives()[0].getMaterial());target.getMesh().addPrimitive(p);target.setExtras({...target.getExtras(),sourceNails:name});stats.push({name,sourceTriangles:sourceMesh.sourceTriangles,afterTriangles:idx.length/3,sourceNailPlates:5,errorLimitM:.00003,nativeClosedShell:true,projectionRayMisses:prepared.rayMisses});
 }
 function combine(mesh){
  const ps=mesh.listPrimitives();if(ps.length<2)return;const out=doc.createPrimitive(),semantics=ps[0].listSemantics();let base=0;const indices=[];for(const p of ps){for(const i of p.getIndices().getArray())indices.push(i+base);base+=p.getAttribute('POSITION').getCount();}
  for(const semantic of semantics){const first=ps[0].getAttribute(semantic),values=[];for(const p of ps){const a=p.getAttribute(semantic);if(!a)throw Error('Missing '+semantic);for(let i=0;i<a.getCount();i++){const v=[];a.getElement(i,v);values.push(...v);}}out.setAttribute(semantic,acc(mesh.getName()+'-'+semantic,first.getType(),semantic==='JOINTS_0'?new Uint16Array(values):new Float32Array(values)));}out.setIndices(acc(mesh.getName()+'-merged-indices','SCALAR',new Uint32Array(indices)));out.setMaterial(ps[0].getMaterial());for(const p of ps)mesh.removePrimitive(p);mesh.addPrimitive(out);
 }
 for(const name of ['skin-outline','skin-hand.l','skin-hand.r'])combine(find(name).getMesh());
 // Reuse the smooth source skin for the optional wire style as well; no faceted proxy.
 const wire=find('skin-wire');wire.setMesh(find('skin-outline').getMesh()).setSkin(skin).setExtras({...wire.getExtras(),renderIntent:'smooth-source-silhouette',sourceNode:'skin-outline',includesHands:false});
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives())compactPrimitive(primitive);
 await doc.transform(weld(),reorder({encoder:MeshoptEncoder}),quantize({pattern:/^(POSITION|NORMAL|TEXCOORD_\d+|WEIGHTS_\d+)$/,quantizePosition:16,quantizeNormal:8,quantizeTexcoord:10,quantizeWeight:10}),prune({keepLeaves:true,keepAttributes:true}));
 doc.getRoot().getAsset().copyright += '\nRebuild 2026-11-05: tiny source-hole closure, duplicate-face cleanup, smooth source figure replaces faceted wire proxy, original five hand and foot nail plates, fibre fields encoded as normalized 16-bit attributes. CC BY-SA 4.0.';
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
 const out=await io.writeBinary(doc);await fs.writeFile(file,out);const decoded=await io.readBinary(out);let triangles=0,draws=0;for(const n of decoded.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){triangles+=p.getIndices().getCount()/3;draws++;}
 const r={topic,beforeBytes:before.length,afterBytes:out.length,beforeTriangles:totalBefore,afterTriangles:triangles,draws,stats};const prior=results.findIndex(x=>x.topic===topic);if(prior>=0)results[prior]=r;else results.push(r);console.log(JSON.stringify({...r,stats:undefined}));await fs.writeFile(resolve(here,'cache/rebuild-counts.json'),JSON.stringify(results,null,2)+'\n');
}
