/** Read-only mesh audit against the committed round-1 GLB.
 * Pass its local path; --record-baseline stores immutable fingerprints for tests.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
const original=process.argv[2];if(!original)throw Error('Provide the committed round-1 GLB path');
const bytes=fs.readFileSync(original),sha=createHash('sha256').update(bytes).digest('hex');
const expected='fc9a1c983407d246e5d946c10d480f2f2c08d18066c0122ce0c7a3c19633ba46';
if(sha!==expected)throw Error('Input differs from committed round-1 water.glb');
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const fingerprint=(node:Node)=>createHash('sha256').update(JSON.stringify({matrix:node.getWorldMatrix(),attributes:node.getMesh()!.listPrimitives().map(p=>({attributes:p.listSemantics().map(s=>[s,Array.from(p.getAttribute(s)!.getArray()!)]),indices:Array.from(p.getIndices()!.getArray()!),material:p.getMaterial()!.getExtras()}))})).digest('hex');
const [before,after]=await Promise.all([io.readBinary(bytes),io.read('public/models/water.glb')]);
const acceptedFingerprints:Record<string,string>={};
for(const name of ['cumulus','rain-cloud','hdb-block','roof-tank','barrage','crest-gates','pump-house']){
 const a=before.getRoot().listNodes().find(n=>n.getName()===name)!,b=after.getRoot().listNodes().find(n=>n.getName()===name)!;
 acceptedFingerprints[name]=fingerprint(a);if(fingerprint(b)!==acceptedFingerprints[name])throw Error('Accepted round-1 mesh changed: '+name);
}
if(process.argv.includes('--record-baseline')){
 const filename='scripts/geo/water/comparisons/round2-before-metrics.json',baseline=JSON.parse(fs.readFileSync(filename,'utf8'));
 fs.writeFileSync(filename,JSON.stringify({...baseline,round1GLBSHA256:sha,acceptedFingerprints},null,2)+'\n');
}
console.log({round1GLBSHA256:sha,acceptedFingerprints,allSevenMatch:true});
