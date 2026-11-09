/** Records one digest per main (994cdc76) anatomy node, covering every attribute, the canonical triangles and the bind matrices. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {canonicalTriangles} from './topology.mjs';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
export function nodeDigest(node){
 const hash=createHash('sha256'),add=a=>hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)),p=node.getMesh().listPrimitives()[0];
 for(const semantic of [...p.listSemantics()].sort()){const a=p.getAttribute(semantic);hash.update(`${semantic}:${a.getArray().constructor.name}:${a.getNormalized()}`);add(a.getArray());}
 add(canonicalTriangles(p.getIndices().getArray()));add(node.getSkin().getInverseBindMatrices().getArray());
 return hash.digest('hex');
}
if(process.argv[1]===import.meta.filename){
 const out={commit:'994cdc76',topics:{}};
 for(const topic of ['core','back','chest','arms','legs','shoulders']){const doc=await io.read(`scripts/anatomy/cache/rebuild-baseline/muscles-${topic}.glb`);out.topics[topic]=Object.fromEntries(doc.getRoot().listNodes().filter(n=>n.getMesh()&&!n.getName().startsWith('skin-')).map(n=>[n.getName(),nodeDigest(n)]));}
 fs.writeFileSync('scripts/anatomy/round4/anatomy-digests.json',JSON.stringify(out,null,1)+'\n');
}
