/** Prove pore connectivity on the actual simplified, decoded shipping mesh.
 * No browser/GPU: GLTFLoader + Three ray/triangle intersections. Development
 * targets alone never count as evidence; every target and intervening channel
 * centreline is checked against the delivered triangle surface.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parseShippingGLB} from './node-gltf.ts';
import {MeshoptDecoder} from 'meshoptimizer';
import {DoubleSide,MeshBasicMaterial,PropertyBinding,Raycaster,Vector3} from 'three';
const root='scripts/geo/states-of-matter/evidence',proof=JSON.parse(fs.readFileSync(`${root}/sponge-passages.json`,'utf8'));
const file=JSON.parse(fs.readFileSync(process.env.ATLAS_CANDIDATE?'scripts/geo/states-of-matter/evidence/candidate-parts.json':'src/content/topics/states-of-matter/data/parts.json','utf8')),part=file.parts.find(p=>p.id==='sponge');
assert.ok(part?.mesh,'Sponge must use the shipping GLB');assert.equal(proof.part,'sponge');assert.equal(proof.units,'metres');
assert.equal(proof.paths.length,40,'Forty independently selected large buried passages are required');
await MeshoptDecoder.ready;const bytes=fs.readFileSync(process.env.ATLAS_CANDIDATE?'/private/tmp/states-of-matter-candidate.glb':`public${file.model}`),gltf=await parseShippingGLB(bytes);
gltf.scene.updateMatrixWorld(true);const node=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(part.mesh));assert.ok(node,'Shipping source node missing');
const meshes=[];node.traverse(o=>{if(o.isMesh)meshes.push(o);});assert.equal(meshes.length,1,'Production first-mesh route must deliver all sponge triangles');
const mesh=meshes[0],material=new MeshBasicMaterial({side:DoubleSide});mesh.material=material;mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();
const raycaster=new Raycaster(),directions=[[1,.217,.413],[-.413,1,.237],[.231,-.571,1],[1,-.773,.331],[-.619,-.317,1]].map(a=>new Vector3(...a).normalize());
function distances(point,direction,far=Infinity){
 raycaster.set(point,direction);raycaster.near=1e-7;raycaster.far=far;
 const hits=raycaster.intersectObject(mesh,false).map(h=>h.distance).sort((a,b)=>a-b),unique=[];
 // A shared edge produces duplicate triangle hits at the same surface. Count
 // each surface crossing once, while retaining distinct nearby pore walls.
 for(const distance of hits)if(!unique.length||distance-unique.at(-1)>1e-7)unique.push(distance);
 return unique;
}
const points=[],segments=[],failures=[];
for(const path of proof.paths){
 assert.ok(path.radius>.0008,`${path.id}: proof radius must exceed 0.8 mm`);assert.equal(path.samples.length,5);
 for(const [i,sample]of path.samples.entries()){
  assert.equal(sample.expected,'air');assert.ok(sample.sourceClearance>.00075);assert.ok(sample.depthBelowOutside>.0008);
  const point=new Vector3(...sample.point),crossings=directions.map(direction=>distances(point,direction).length),airVotes=crossings.filter(n=>n%2===0).length,retries=[];
  let passed=airVotes===directions.length;
  // An exact ray through a tiny shared triangle edge can omit one numerical
  // intersection. Resolve mixed parity with two nearby ray directions FROM
  // THE SAME POINT, never by moving the test point out of possibly solid foam.
  // All five direction families must independently classify that point as air.
  if(airVotes>0&&airVotes<directions.length){
   for(const [j,direction]of directions.entries()){
    const tangent=new Vector3().crossVectors(direction,new Vector3(.173,.731,.419)).normalize();
    const local=[crossings[j],...[-1,1].map(sign=>distances(point,direction.clone().addScaledVector(tangent,sign*.003).normalize()).length)];retries.push(local);
   }
   passed=retries.every(local=>local.filter(n=>n%2===0).length>=2);
  }
  points.push({path:path.id,sample:i,point:sample.point,crossings,airVotes,...(retries.length?{edgeAmbiguityRetries:retries}:{}),passed});
  if(!passed)failures.push(`${path.id} sample ${i}: parity ${crossings.join('/')}`);
 }
 for(let i=1;i<path.path.length;i++){
  const a=new Vector3(...path.path[i-1]),b=new Vector3(...path.path[i]),direction=b.clone().sub(a),length=direction.length();
  if(length<=2e-7)continue;direction.divideScalar(length);
  // Check the whole centreline, including inward necks, not just isolated air
  // points. A new cap sealing a passage necessarily intersects this segment.
  const hits=distances(a,direction,length-1e-7),passed=hits.length===0;
  segments.push({path:path.id,segment:i-1,length,crossings:hits,passed});if(!passed)failures.push(`${path.id} segment ${i-1}: sealed by ${hits.length} mesh crossings`);
 }
}
material.dispose();const result={passed:failures.length===0,method:'Shipping GLTFLoader mesh; double-sided ray/triangle parity in five directions, deduplicated surface crossings; mixed edge parity retried in nearby directions from the identical point; uninterrupted full channel centreline segments',glbSha256:createHash('sha256').update(bytes).digest('hex'),glbBytes:bytes.length,generatorSha256:proof.generatorSha256,paths:proof.paths.length,pointsChecked:points.length,raysPerPoint:directions.length,edgeAmbiguityPoints:points.filter(p=>p.edgeAmbiguityRetries).length,segmentsChecked:segments.length,failures,points,segments};
fs.writeFileSync(`${root}/audit-sponge-passages.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,points:undefined,segments:undefined},null,2));assert.ok(result.passed,`Shipping pore connectivity failed: ${failures.slice(0,8).join('; ')}`);
