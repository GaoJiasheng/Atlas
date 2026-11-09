/** Carry main's anatomy buffers (every non-skin mesh: topology, normals, _FIBRE, UVs, binds) into the rebuilt GLBs unchanged. No anatomy quantize/simplify pass. */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {correctForearmWeights,featherMasks,simplifyExerciseBody,compactExerciseBody} from './exercise.mjs';
import {filterNormals} from './normal-filter.mjs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {copyToDocument,prune,dedup} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
for(const topic of process.env.MUSCLES_TOPICS?.split(',')??['core','back','chest','arms','legs','shoulders']){
 for(const [directory,commit]of [['rebuild-baseline','994cdc76'],['round4-before','490d13bf']]){const file=`scripts/anatomy/cache/${directory}/muscles-${topic}.glb`;if(!fs.existsSync(file)){fs.mkdirSync(`scripts/anatomy/cache/${directory}`,{recursive:true});fs.writeFileSync(file,execFileSync('git',['show',`${commit}:public/models/muscles-${topic}.glb`],{maxBuffer:20_000_000}));}}
 const doc=await io.read(`scripts/anatomy/cache/round4-before/muscles-${topic}.glb`),main=await io.read(`scripts/anatomy/cache/rebuild-baseline/muscles-${topic}.glb`);
 const nodes=doc.getRoot().listNodes(),source=main.getRoot().listNodes().filter(n=>n.getMesh()&&!n.getName().startsWith('skin-'));
 const map=copyToDocument(doc,main,source.flatMap(n=>[n.getMesh(),n.getSkin().getInverseBindMatrices()]));
 fs.writeFileSync(`scripts/anatomy/round4/provenance-${topic}.json`,JSON.stringify(Object.fromEntries(source.map(n=>[n.getName(),n.getExtras().sourceNodes])),null,2)+'\n');
 const skins=new Map();
 for(const n of source){const target=nodes.find(k=>k.getName()===n.getName());if(!target)throw Error(n.getName());const mesh=map.get(n.getMesh()),old=target.getMesh();mesh.listPrimitives().forEach((p,i)=>{
 const op=old.listPrimitives()[i]??old.listPrimitives()[0];p.setMaterial(op.getMaterial());
 });
 let skin=skins.get(n.getSkin());if(!skin){skin=doc.createSkin('native-anatomy-main');for(const j of n.getSkin().listJoints()){const tj=nodes.find(k=>k.getName()===j.getName());if(JSON.stringify(tj.getWorldMatrix())!==JSON.stringify(j.getWorldMatrix()))throw Error('Joint changed '+j.getName());skin.addJoint(tj);}skin.setInverseBindMatrices(map.get(n.getSkin().getInverseBindMatrices()));skins.set(n.getSkin(),skin);}
 target.setMesh(mesh).setSkin(skin).setMatrix(n.getMatrix());
 }
 const twistVertices=correctForearmWeights(doc),bodyBudget=await simplifyExerciseBody(doc,topic),masks=featherMasks(doc);if(bodyBudget)await compactExerciseBody(doc);
 fs.writeFileSync(`scripts/anatomy/round4/exercise-${topic}.json`,JSON.stringify({twistVertices,bodyBudget,masks},null,2)+'\n');
 await doc.transform(dedup(),prune({keepLeaves:true,keepAttributes:true}));
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const buffer=doc.getRoot().listBuffers()[0];for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
 const bytes=await filterNormals(await io.writeBinary(doc),doc);fs.writeFileSync(`public/models/muscles-${topic}.glb`,bytes);console.log(topic,bytes.length);
}
