/**
 * Core content rig extension (CC BY-SA 4.0 geometric derivative).
 * After rebuilding the unextended core pipeline model, run:
 *   node scripts/anatomy/core/extend-content-rig.mjs [input.glb]
 * Keeps existing mesh selection and weights, adds same-body knee/ankle
 * landmarks, and extends only the lower-body skin-outline weights.
 * Input may be a separate copy; output is public/models/muscles-core.glb.
 * Already extended input is left unchanged. No engine or legs file is edited.
 */
import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import {dirname,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import fs from 'node:fs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const req=createRequire(resolve(ROOT,'package.json'));
const {NodeIO,Accessor}=await import(pathToFileURL(req.resolve('@gltf-transform/core')).href);
const funcs=await import(pathToFileURL(req.resolve('@gltf-transform/functions')).href);
const {ALL_EXTENSIONS}=await import(pathToFileURL(req.resolve('@gltf-transform/extensions',{paths:[dirname(req.resolve('@gltf-transform/functions'))]})).href);
const {MeshoptDecoder,MeshoptEncoder}=await import(pathToFileURL(req.resolve('meshoptimizer')).href);await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const {mat4}=await import(pathToFileURL(req.resolve('gl-matrix',{paths:[dirname(req.resolve('@gltf-transform/functions'))]})).href);
const root=ROOT+'/';const input=root+'public/models/muscles-core.glb';
const sourcePath=process.argv[2]?resolve(process.argv[2]):input;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(sourcePath);await doc.transform(funcs.dequantize());const nodes=doc.getRoot().listNodes(),buffer=doc.getRoot().listBuffers()[0];
if(nodes.some(n=>n.getName()==='joint.knee.l')){
 console.log('Core content rig already present; rebuild the base pipeline model before extending it again.');process.exit(0);
}
const base=JSON.parse(fs.readFileSync(root+'scripts/anatomy/core/rig.json'));const leg=JSON.parse(fs.readFileSync(root+'scripts/anatomy/legs/rig.json'));
const delta=[leg.sourceCentre[0]-base.sourceCentre[0],leg.sourceCentre[2]-base.sourceCentre[2],base.sourceCentre[1]-leg.sourceCentre[1]];
const extras=leg.joints.filter(j=>/^(knee|ankle)\./.test(j.name)).map(j=>({...j,position:j.position.map((v,i)=>v+delta[i])}));
const added=new Map();
for(const j of extras){const parentName=j.name.startsWith('knee')?'joint.hip.'+j.name.slice(-1):'joint.knee.'+j.name.slice(-1);const parent=nodes.find(n=>n.getName()===parentName)??added.get(parentName);const pp=parent.getWorldTranslation();const node=doc.createNode(j.node).setTranslation(j.position.map((v,i)=>v-pp[i])).setExtras({source:'Same Z-Anatomy body, knees/ankles from legs rig; core content integration',license:'CC BY-SA 4.0'});parent.addChild(node);added.set(j.node,node);nodes.push(node);}
const skins=doc.getRoot().listSkins();
for(const skin of skins){const joints=skin.listJoints();const binds=skin.getInverseBindMatrices();const basis=mat4.create();const firstBind=[];binds.getElement(0,firstBind);mat4.multiply(basis,joints[0].getWorldMatrix(),firstBind);const array=[];for(let i=0;i<joints.length;i++){const v=[];binds.getElement(i,v);array.push(...v);}
 for(const j of extras){const node=added.get(j.node);skin.addJoint(node);const inv=mat4.create();mat4.invert(inv,node.getWorldMatrix());mat4.multiply(inv,inv,basis);array.push(...inv);}
 skin.setInverseBindMatrices(doc.createAccessor().setType(Accessor.Type.MAT4).setArray(new Float32Array(array)).setBuffer(buffer));
}
// Skin outline only: preserve upper-body weights, add a smooth hip→knee→ankle chain below the thigh.
const outline=nodes.find(n=>n.getName()==='skin-outline');const skin=outline.getSkin();const js=skin.listJoints();
const transform=(m,p)=>[0,1,2].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);
for(const prim of outline.getMesh().listPrimitives()){
 const pos=prim.getAttribute('POSITION'),w=prim.getAttribute('WEIGHTS_0'),ji=prim.getAttribute('JOINTS_0');
 for(let i=0;i<pos.getCount();i++){const p=[],ww=[],jj=[];pos.getElement(i,p);w.getElement(i,ww);ji.getElement(i,jj);let rest=[0,0,0];
  for(let k=0;k<4;k++){if(!ww[k])continue;const bind=[];skin.getInverseBindMatrices().getElement(jj[k],bind);const q=transform(js[jj[k]].getWorldMatrix(),transform(bind,p));rest=rest.map((a,j)=>a+q[j]*ww[k]);}
  const side=rest[0]>0?'l':'r',knee=extras.find(j=>j.name==='knee.'+side),ankle=extras.find(j=>j.name==='ankle.'+side);const y=rest[1];
  if(y>knee.position[1]+.12)continue;
  const hipi=js.findIndex(n=>n.getName()==='joint.hip.'+side),ki=js.findIndex(n=>n.getName()===knee.node),ai=js.findIndex(n=>n.getName()===ankle.node);
  let a,b,t;if(y>knee.position[1]-.12){a=hipi;b=ki;t=Math.max(0,Math.min(1,(knee.position[1]+.12-y)/.24));}else{a=ki;b=ai;t=Math.max(0,Math.min(1,(ankle.position[1]+.11-y)/.20));}
  ji.setElement(i,[a,b,0,0]);w.setElement(i,[1-t,t,0,0]);
 }
}
await doc.transform(funcs.meshopt({encoder:MeshoptEncoder,level:'medium'}));await io.write(input,doc);
const pfile=root+'src/content/topics/muscles-core/data/parts.json';const p=JSON.parse(fs.readFileSync(pfile));
for(const j of extras)p.rig.joints[j.name]={node:j.node,axes:j.name.startsWith('knee')?{flexion:j.axes.flexion}:{dorsiflexion:j.axes.dorsiflexion}};
p.rig.demo.knee={flexion:40,extension:15};p.rig.demo.ankle={dorsiflexion:10};fs.writeFileSync(pfile,JSON.stringify(p,null,2)+'\n');
fs.writeFileSync(root+'scripts/anatomy/core/content-rig.json',JSON.stringify({joints:extras.map(({name,node,position})=>({name,node,position})),delta,bytes:fs.statSync(input).size,skinChange:'Only body-outline weights below the knees. Existing anatomical meshes, fibre attributes, attachment coordinates and three original joints retained.'},null,2));
console.log('extended core rig',extras.map(j=>j.name),'bytes',fs.statSync(input).size);
