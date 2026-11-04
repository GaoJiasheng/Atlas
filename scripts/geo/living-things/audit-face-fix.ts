/** Compare the two-specimen fix against a preserved live asset. No browser. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;
const baseline=process.argv[2];if(!baseline)throw new Error('Pass the preserved baseline .glb path');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const staged=process.argv.includes('--staging');
const [before,after]=await Promise.all([io.read(baseline),io.read(staged?'/tmp/atlas-living-polish/living-things.glb':'public/models/living-things.glb')]);
const signatures=(doc:typeof before)=>new Map(doc.getRoot().listNodes().map(node=>{
 const hash=createHash('sha256');hash.update(JSON.stringify(node.getWorldMatrix()));
 for(const p of node.getMesh()!.listPrimitives()){
  for(const key of [...p.listSemantics()].sort()){
   const a=p.getAttribute(key)!.getArray()!;hash.update(key);hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));
  }
  const a=p.getIndices()!.getArray()!;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));
 }
 return [node.getName(),hash.digest('hex')];
}));
const old=signatures(before),now=signatures(after),changed=[...now.keys()].filter(k=>old.get(k)!==now.get(k));
const expected=process.argv.includes('--bat-only')?['fruit-bat']:['asian-toad','fruit-bat'];
if(JSON.stringify(changed.slice().sort())!==JSON.stringify(expected))throw new Error(`Unexpected changed meshes: ${changed}`);
const oldJson=JSON.parse(readFileSync(baseline.replace(/\.glb$/,'.json'),'utf8')),newJson=JSON.parse(readFileSync(staged?'/tmp/atlas-living-polish/parts.json':'src/content/topics/living-things/data/parts.json','utf8'));
for(const file of [oldJson,newJson])for(const p of file.parts)if(changed.includes(p.id)){delete p.primitive.at;delete p.primitive.size;}
if(JSON.stringify(oldJson)!==JSON.stringify(newJson))throw new Error('Non-envelope topic data changed');
console.log(`Only ${expected.join(' and ')} changed; ${now.size-expected.length} other decoded meshes (positions/normals/colours/UVs/indices/transforms) identical. All topic data except their envelopes identical.`);
