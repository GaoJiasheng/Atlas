/** Run: pnpm tsx scripts/geo/b200-server/rotors.audit.ts
 * Tests the transported GLB with Three's actual loader/skinning and the exact
 * sampleAngles/quaternion functions MotionDriver uses, without browser APIs.
 */
import assert from 'node:assert/strict';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkinnedMesh, Quaternion, Vector3 } from 'three';
import { addFanRotors, fanRotorCentres } from './rotors';
import { rigSchema, animationSchema } from '../../../src/engines/space-scene/schema';
import { sampleAngles, anglesQuat } from '../../../src/engines/space-scene/lib/rig';

await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene();
const built=addFanRotors(doc,buffer,scene);
rigSchema.parse(built.rig);built.animations.forEach(a=>animationSchema.parse(a));
assert.equal(Object.keys(built.rig.joints).length,40);assert.equal(built.animations.length,40);
assert.ok(built.triangles<=30_000);
await doc.transform(weld(),dedup(),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const bytes=await io.writeBinary(doc);
const loaded=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,'');
const mesh=loaded.scene.getObjectByName('fan_rotors')??loaded.scene.getObjectByName('fan-rotors');
assert.ok(mesh instanceof SkinnedMesh,'fan-rotors must remain a real Three SkinnedMesh after transport');
assert.equal(mesh.skeleton.bones.length,40);
const positions=mesh.geometry.getAttribute('position'),joints=mesh.geometry.getAttribute('skinIndex'),weights=mesh.geometry.getAttribute('skinWeight');
const representative=new Map<number,number>();
for(let i=0;i<positions.count;i++){
  assert.ok(Math.abs(weights.getX(i)-1)<1e-5);assert.equal(weights.getY(i)+weights.getZ(i)+weights.getW(i),0);
  const k=joints.getX(i);assert.ok(k>=0&&k<40);if(!representative.has(k))representative.set(k,i);
}
assert.equal(representative.size,40);
loaded.scene.updateMatrixWorld(true);mesh.skeleton.update();
const before=new Map<number,Vector3>();
for(const [k,i] of representative)before.set(k,mesh.applyBoneTransform(i,new Vector3().fromBufferAttribute(positions,i)));
const centres=fanRotorCentres(),time=.317;
for(let i=0;i<40;i++){
  const anim=built.animations[i]!;assert.equal(anim.kind,'sequence');if(anim.kind!=='sequence')throw Error('sequence required');
  const angles=sampleAngles(anim.keys,time,true),q=anglesQuat(built.rig.joints[`fan-rotor-${i.toString().padStart(2,'0')}`]!.axes,angles);
  mesh.skeleton.bones[i]!.quaternion.fromArray(q);
  const repeat=sampleAngles(anim.keys,time+1.5,true);assert.ok(Math.abs(angles.rotation!-repeat.rotation!)<1e-8);
}
loaded.scene.updateMatrixWorld(true);mesh.skeleton.update();
let maxError=0;
for(const [k,i] of representative){
  const center=new Vector3(...centres[k]!),q=mesh.skeleton.bones[k]!.quaternion;
  const expected=before.get(k)!.clone().sub(center).applyQuaternion(q).add(center);
  const actual=mesh.applyBoneTransform(i,new Vector3().fromBufferAttribute(positions,i));
  maxError=Math.max(maxError,expected.distanceTo(actual));
  assert.ok(expected.distanceTo(actual)<.00001,`rotor ${k} must spin about its own centre after meshopt`);
  assert.ok(actual.distanceTo(before.get(k)!)>.001,`rotor ${k} must move`);
  assert.ok(mesh.skeleton.bones[k]!.getWorldPosition(new Vector3()).distanceTo(center)<1e-7);
}
// A full turn each 1.5 seconds gives40RPM. Audit the bounded smoothstep
// deviation from ideal rotation as the engine actually samples the32keys.
let maxAngleError=0;
const sequence=built.animations[0]!;if(sequence.kind!=='sequence')throw Error('sequence required');
for(let i=0;i<1500;i++){
  const t=i/1000;maxAngleError=Math.max(maxAngleError,Math.abs(sampleAngles(sequence.keys,t,true).rotation!-(-180+t*240)));
}
assert.ok(maxAngleError<1.12);assert.ok(new Quaternion().fromArray(anglesQuat({rotation:[0,0,-1]},{rotation:-180})).angleTo(new Quaternion().fromArray(anglesQuat({rotation:[0,0,-1]},{rotation:180})))<1e-7);
console.log(JSON.stringify({triangles:built.triangles,vertices:positions.count,bones:40,draws:1,glbBytes:bytes.byteLength,maxSkinErrorMetres:maxError,maxAngleDeviationDegrees:maxAngleError,averageRpm:40}));
