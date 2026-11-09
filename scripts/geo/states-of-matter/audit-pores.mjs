/** Ray-check every intended top pore in the real GLTFLoader shipping mesh. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parseShippingGLB} from './node-gltf.ts';
import {MeshoptDecoder} from 'meshoptimizer';
import {DoubleSide,MeshBasicMaterial,Raycaster,Vector3} from 'three';
const root='scripts/geo/states-of-matter/evidence',proof=JSON.parse(fs.readFileSync(`${root}/sponge-passages.json`));
const file=process.env.ATLAS_CANDIDATE?'/private/tmp/states-of-matter-candidate.glb':'public/models/states-of-matter.glb',bytes=fs.readFileSync(file);
await MeshoptDecoder.ready;const gltf=await parseShippingGLB(bytes);gltf.scene.updateMatrixWorld(true);
const mesh=gltf.scene.getObjectByName('sponge');mesh.material=new MeshBasicMaterial({side:DoubleSide});
const ray=new Raycaster(),down=new Vector3(0,-1,0),pores=[];
for(const p of proof.structure.mouths.filter(m=>m.axis===1&&m.sign===1)){
 const origin=new Vector3(...p.surface).add(new Vector3(0,.01,0));ray.set(origin,down);const hit=ray.intersectObject(mesh,false)[0];
 const depth=hit?hit.distance-.01:0;pores.push({diameter:p.diameter,point:p.surface,depth,open:depth>.00065});
}
const result={passed:pores.filter(p=>p.open).length>=285,intended:pores.length,openInShippingMesh:pores.filter(p=>p.open).length,distribution:{small:pores.filter(p=>p.diameter<.002).length,medium:pores.filter(p=>p.diameter>=.002&&p.diameter<.004).length,large:pores.filter(p=>p.diameter>=.004).length},method:'Native shipping GLTFLoader; downward rays at actual SDF surface mouth centres. A mouth must admit the ray at least 0.65 mm below the body surface.',pores};
fs.writeFileSync(`${root}/audit-pores.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,pores:undefined},null,2));assert.ok(result.passed);
