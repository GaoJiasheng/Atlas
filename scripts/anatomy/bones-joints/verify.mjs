/** Decode actual published bytes and independently inspect bind geometry/weights. */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {MeshoptDecoder} from 'meshoptimizer';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../..');
const require=createRequire(import.meta.url);
const {ALL_EXTENSIONS}=await import(pathToFileURL(require.resolve('@gltf-transform/extensions',{paths:[dirname(require.resolve('@gltf-transform/functions'))]})));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
export function transform(m,p){return [0,1,2].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);}
export function decodedPoints(node){
  const points=[],skin=node.getSkin(),binds=skin?.getInverseBindMatrices(),worlds=skin?.listJoints().map(j=>j.getWorldMatrix());
  for(const primitive of node.getMesh().listPrimitives()){
    const pos=primitive.getAttribute('POSITION'),weights=primitive.getAttribute('WEIGHTS_0'),joints=primitive.getAttribute('JOINTS_0');
    for(let i=0;i<pos.getCount();i++){
      const p=[];pos.getElement(i,p);
      if(!skin){points.push(transform(node.getWorldMatrix(),p));continue;}
      const w=[],j=[],out=[0,0,0];weights.getElement(i,w);joints.getElement(i,j);
      if(w.some(v=>!Number.isFinite(v)||v<0)||Math.abs(w.reduce((a,b)=>a+b,0)-1)>.002)throw Error(`Weights ${node.getName()}#${i}`);
      for(let k=0;k<4;k++){if(!w[k])continue;const bind=[];binds.getElement(j[k],bind);const v=transform(worlds[j[k]],transform(bind,p));for(let a=0;a<3;a++)out[a]+=v[a]*w[k];}
      if(out.some(v=>!Number.isFinite(v)))throw Error(`Nonfinite geometry ${node.getName()}`);
      points.push(out);
    }
  }
  return points;
}
export function pointBounds(points){return{min:[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...points.map(p=>p[i])))};}
const manifest=JSON.parse(await fs.readFile(resolve(here,'manifest.json'),'utf8'));
const model=resolve(root,'public/models/bones-and-joints.glb'),document=await io.read(model),nodes=document.getRoot().listNodes();
const rows=[];
for(const part of manifest.parts){const node=nodes.find(n=>n.getName()===part.id),points=decodedPoints(node),box=pointBounds(points);const error=Math.max(...box.min.map((v,i)=>Math.abs(v-part.bounds.min[i])),...box.max.map((v,i)=>Math.abs(v-part.bounds.max[i])));if(error>.0001)throw Error(`Codec bind bounds ${part.id}: ${error}`);rows.push({part:part.id,codecBBoxErrorM:error});}
const old=await io.read(resolve(root,'public/models/muscles-arms.glb'));
for(const[id,sources]of [['biceps-l',['biceps-brachii-long.l','biceps-brachii-short.l']],['triceps-l',['triceps-brachii-long.l','triceps-brachii-lateral.l','triceps-brachii-medial.l']],['skin-outline',['skin-outline','skin-hand.l','skin-hand.r']]]){
  const actual=pointBounds(decodedPoints(nodes.find(n=>n.getName()===id)));
  const expected=pointBounds(sources.flatMap(name=>decodedPoints(old.getRoot().listNodes().find(n=>n.getName()===name))));
  const error=Math.max(...actual.min.map((v,i)=>Math.abs(v-expected.min[i])),...actual.max.map((v,i)=>Math.abs(v-expected.max[i])));
  if(error>.00015)throw Error(`Inherited bind bounds ${id}: ${error}`);rows.push({part:id,codecBBoxErrorM:error});
}
const bytes=await fs.readFile(model);if(createHash('sha256').update(bytes).digest('hex')!==manifest.modelSha256)throw Error('Published SHA mismatch');
const rig=JSON.parse(await fs.readFile(resolve(here,'anatomy-rig.json'),'utf8'));
for(const joint of rig.joints){const node=nodes.find(n=>n.getName()===joint.node),world=node.getWorldMatrix();if(Math.hypot(...joint.position.map((v,i)=>v-world[12+i]))>1e-5)throw Error(`Rig position ${joint.name}`);}
const result={status:'automated gates passed; native/medical review still pending',meshNodes:nodes.filter(n=>n.getMesh()).length,rigJoints:rig.joints.length,maxCodecBBoxErrorM:Math.max(...rows.map(r=>r.codecBBoxErrorM)),parts:rows};
await fs.writeFile(resolve(here,'codec-audit.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,parts:undefined}));
