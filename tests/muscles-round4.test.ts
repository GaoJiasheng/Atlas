import fs from 'node:fs';
import {canonicalTriangles}from'../scripts/anatomy/round4/topology.mjs';
import {nodeDigest}from'../scripts/anatomy/round4/anatomy-digests.mjs';
import {createHash}from'node:crypto';
import {it,expect}from'vitest';
import{NodeIO}from'@gltf-transform/core';import{ALL_EXTENSIONS}from'@gltf-transform/extensions';
import{MeshoptDecoder}from'meshoptimizer';import{MeshoptDecoder as EngineDecoder}from'three/examples/jsm/libs/meshopt_decoder.module.js';
import{GLTFLoader}from'three/examples/jsm/loaders/GLTFLoader.js';
const topics=['core','back','chest','arms','legs','shoulders'];
// Exception to the 1.5 MB model cap (as heart-and-lungs): these six GLBs carry main's full anatomy buffers, so the cap is main's own file size (994cdc76).
const mainBytes:Record<string,number>={core:3828212,back:3954616,chest:3802480,arms:3196088,legs:3983112,shoulders:2231780};
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const digest=(a:ArrayBufferView)=>createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
it('keeps the shipped hero buffers and bind data identical to pre-rebuild main',async()=>{
 await MeshoptDecoder.ready;const fixture=JSON.parse(fs.readFileSync('scripts/anatomy/round4/native-heroes.json','utf8'));
 expect(fixture.commit).toBe('994cdc76');for(const[topic,entry]of Object.entries(fixture.topics)as[string,any][]){const doc=await io.read(`public/models/muscles-${topic}.glb`);for(const[name,expected]of Object.entries(entry.nodes)as[string,any][]){const n=doc.getRoot().listNodes().find(n=>n.getName()===name)!,p=n.getMesh()!.listPrimitives()[0]!;for(const[s,a]of Object.entries(expected.attributes)as[string,any][]){const actual=p.getAttribute(s)!;expect(actual.getArray()!.constructor.name).toBe(a.array);expect(actual.getNormalized()).toBe(a.normalized);expect(digest(actual.getArray()!)).toBe(a.sha256);}expect(digest(canonicalTriangles(p.getIndices()!.getArray()!))).toBe(expected.indices);expect(digest(n.getSkin()!.getInverseBindMatrices()!.getArray()!)).toBe(expected.bind);expect(n.getMatrix()).toEqual(expected.matrix);expect(n.getSkin()!.listJoints().map(j=>[j.getName(),j.getWorldMatrix()])).toEqual(expected.joints);}}
});
it('restores every anatomy node to main, bit for bit',async()=>{
 await MeshoptDecoder.ready;const fixture=JSON.parse(fs.readFileSync('scripts/anatomy/round4/anatomy-digests.json','utf8'));
 expect(fixture.commit).toBe('994cdc76');for(const[topic,nodes]of Object.entries(fixture.topics)as[string,Record<string,string>][]){const doc=await io.read(`public/models/muscles-${topic}.glb`);for(const[name,expected]of Object.entries(nodes)){const n=doc.getRoot().listNodes().find(n=>n.getName()===name)!;expect(nodeDigest(n),`${topic}/${name}`).toBe(expected);}}
},60000);
it('ships high precision anatomy within main\'s own size and decodes with the actual engine meshopt decoder',async()=>{
 await MeshoptDecoder.ready;for(const topic of topics){const file=`public/models/muscles-${topic}.glb`,bytes=fs.readFileSync(file);expect(bytes.length).toBeLessThanOrEqual(mainBytes[topic]!);const doc=await io.read(file);for(const n of doc.getRoot().listNodes()){if(!n.getMesh()||/^(exercise-|skin-)/.test(n.getName()))continue;for(const p of n.getMesh()!.listPrimitives())for(const s of['NORMAL','_FIBRE']){const a=p.getAttribute(s);if(!a)continue;expect(a.getArray()!.BYTES_PER_ELEMENT,`${topic}/${n.getName()}/${s}`).toBeGreaterThanOrEqual(2);}}
 const gltf=await new GLTFLoader().setMeshoptDecoder(EngineDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)as ArrayBuffer,'');expect(gltf.scene.children.length).toBeGreaterThan(0);
 }
},20000);
it('keeps continuous feather weights, complete label masks and exact body/mask skin attributes',async()=>{
 await MeshoptDecoder.ready;for(const topic of topics){const doc=await io.read(`public/models/muscles-${topic}.glb`),nodes=doc.getRoot().listNodes(),body=nodes.find(n=>n.getName()==='skin-outline')!,bp=body.getMesh()!.listPrimitives()[0]!;for(const n of nodes.filter(n=>n.getName().startsWith('exercise-'))){const p=n.getMesh()!.listPrimitives()[0]!,alpha=p.getAttribute('COLOR_0')!;expect(p.getIndices()!.getCount()).toBeGreaterThan(0);let intermediate=0;for(let i=0;i<alpha.getCount();i++){const v=alpha.getElement(i,[])[3]!;if(v>0&&v<1)intermediate++;}expect(intermediate,`${topic}/${n.getName()}`).toBeGreaterThan(0);for(const s of['POSITION','NORMAL','JOINTS_0','WEIGHTS_0'])expect(p.getAttribute(s)).toBe(bp.getAttribute(s));expect(n.getSkin()).toBe(body.getSkin());}
 }
},20000);
it('preserves the accepted exercise normal-map opt-out at the executing PartNode site',()=>{const source=fs.readFileSync('src/engines/space-scene/stages/model3d/PartNode.tsx','utf8');expect(source).toContain('if (exerciseMask) pm.material.normalScale.set(0, 0)');});
it('keeps the elbow cross-section under actual 90-degree forearm pronation',async()=>{
 const {fixture}=await import('../scripts/anatomy/round2-motion/probe');const {Vector3}=await import('three');
 for(const topic of topics){const f=await fixture(topic);if(!f.data.rig.joints['forearm.l'])continue;f.pose({});const body=f.gltf.scene.getObjectByName('skin-outline')as import('three').SkinnedMesh,a=f.node('elbow.l').getWorldPosition(new Vector3()),axis=f.node('hand.l').getWorldPosition(new Vector3()).sub(a),length=axis.length();axis.normalize();const candidates:{i:number;radius:number}[]=[];for(let i=0;i<body.geometry.getAttribute('position').count;i++){const q=body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld).sub(a),t=q.dot(axis)/length,radius=q.addScaledVector(axis,-q.dot(axis)).length();if(t>-.04&&t<.09&&radius>.015&&radius<.07)candidates.push({i,radius});}expect(candidates.length,topic).toBeGreaterThan(5);f.pose({'forearm.l':{pronation:90}});for(const c of candidates){const q=body.getVertexPosition(c.i,new Vector3()).applyMatrix4(body.matrixWorld).sub(a),radius=q.addScaledVector(axis,-q.dot(axis)).length();expect(radius/c.radius,`${topic} elbow vertex ${c.i}`).toBeGreaterThan(.98);}}
},20000);
