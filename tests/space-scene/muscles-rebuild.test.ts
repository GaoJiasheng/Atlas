/** Decode the shipped bytes through the engine's loader. In particular,
 * GltfSource takes the first primitive: additions in a second primitive are
 * invisible at runtime, even when an offline exporter shows them correctly.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Box3, PropertyBinding, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

const counts={arms:31,back:32,chest:22,core:19,legs:33,shoulders:24};
// Independently recover disconnected surfaces from the decoded first primitive.
// Flattening a closed native plate onto a single offset left a negative-volume
// thumb and nearly zero-volume finger plates despite finite bounds/normals.
function checkNailShells(hand:SkinnedMesh,label:string){
 const points=Array.from({length:hand.geometry.getAttribute('position').count},(_,i)=>hand.getVertexPosition(i,new Vector3()).applyMatrix4(hand.matrixWorld));
 const ix=hand.geometry.index!,parent=points.map((_,i)=>i);
 const root=(start:number)=>{let i=start;while(parent[i]!==i){parent[i]=parent[parent[i]!]!;i=parent[i]!;}return i;};
 for(let i=0;i<ix.count;i+=3)for(let k=1;k<3;k++)parent[root(ix.getX(i+k))]=root(ix.getX(i));
 const groups=new Map<number,{vertices:number[];faces:number[][]}>();
 for(let i=0;i<points.length;i++){const r=root(i);if(!groups.has(r))groups.set(r,{vertices:[],faces:[]});groups.get(r)!.vertices.push(i);}
 for(let i=0;i<ix.count;i+=3)groups.get(root(ix.getX(i)))!.faces.push([ix.getX(i),ix.getX(i+1),ix.getX(i+2)]);
 const plates=[...groups.values()].sort((a,b)=>b.vertices.length-a.vertices.length).slice(1);
 expect(plates,`${label}: five separate real nail plates`).toHaveLength(5);
 for(const plate of plates){
  const origin=points[plate.vertices[0]!]!,edges=new Map<string,{count:number;direction:number}>();let volume=0;
  for(const f of plate.faces){
   const a=points[f[0]!]!,b=points[f[1]!]!,c=points[f[2]!]!;
   volume+=a.clone().sub(origin).dot(b.clone().sub(origin).cross(c.clone().sub(origin)))/6;
   for(let k=0;k<3;k++){const a=f[k]!,b=f[(k+1)%3]!,key=`${Math.min(a,b)},${Math.max(a,b)}`,edge=edges.get(key)??{count:0,direction:0};edge.count++;edge.direction+=a<b?1:-1;edges.set(key,edge);}
  }
  expect([...edges.values()].every(e=>e.count===2&&e.direction===0),`${label}: closed consistently wound shell`).toBe(true);
  expect(volume,`${label}: positive relief volume exceeding one cubic millimetre`).toBeGreaterThan(1e-9);
 }
}
const mainBytes:Record<string,number>={core:3828212,back:3954616,chest:3802480,arms:3196088,legs:3983112,shoulders:2231780};
describe('six muscle topics: rebuilt asset/renderer contract',()=>{
 it.each(Object.entries(counts))('%s preserves selectable parts, full rig and visible smooth skin',async(topic,count)=>{
  const data=JSON.parse(readFileSync(`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));
  expect(data.parts).toHaveLength(count);
  expect(new Set(data.parts.map((p:{id:string})=>p.id)).size).toBe(count);
  expect(data.views.exerciseBody).toBe('mannequin');
  const bytes=readFileSync(`public/models/muscles-${topic}.glb`);
  // Exception to the 1.5 MB model cap (as heart-and-lungs): main's full anatomy buffers are kept, so the cap is main's own file size.
  expect(bytes.length).toBeLessThanOrEqual(mainBytes[topic]!);
  const n=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+n).toString());
  const meshNodes=json.nodes.filter((n:{mesh?:number})=>n.mesh!==undefined);
  for(const node of meshNodes)expect(json.meshes[node.mesh].primitives,`${topic} ${node.name}: secondary primitives are dropped by GltfSource`).toHaveLength(1);
  const triangles=json.meshes.reduce((sum:number,m:{primitives:{indices:number}[]})=>sum+m.primitives.reduce((n,p)=>n+json.accessors[p.indices].count/3,0),0);
  expect(triangles).toBeLessThanOrEqual(350_000);
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,'');
  gltf.scene.updateMatrixWorld(true);
  for(const part of data.parts){
   if(part.mesh)expect(gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(part.mesh)),`${topic} ${part.id}`).toBeDefined();
   if(part.bilateral?.mesh)expect(gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(part.bilateral.mesh))).toBeDefined();
  }
  expect(Object.keys(data.rig.joints)).toHaveLength(topic==='chest'?17:19);
  const sourceRig=JSON.parse(readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8'));
  expect(sourceRig.joints).toHaveLength(19);
  for(const joint of sourceRig.joints as {node:string;position:number[]}[]){
   const node=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(joint.node));
   expect(node,`${topic} ${joint.node}`).toBeDefined();
   expect(node!.getWorldPosition(new Vector3()).distanceTo(new Vector3(...joint.position as [number,number,number]))).toBeLessThan(.0002);
  }
  for(const id of ['skin-outline','skin-hand.l','skin-hand.r']){
   const mesh=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(id)) as SkinnedMesh;
   expect(mesh.isSkinnedMesh).toBe(true);
   expect(mesh.geometry.getAttribute('normal')).toBeDefined();
   const p=mesh.geometry.getAttribute('position'),w=mesh.geometry.getAttribute('skinWeight');
   for(let i=0;i<p.count;i+=Math.max(1,Math.floor(p.count/300))){
    const point=mesh.getVertexPosition(i,new Vector3());
    expect(point.toArray().every(Number.isFinite)).toBe(true);
    expect(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)).toBeCloseTo(1,2);
   }
  }
  // A resumed wrist partition once assigned nearby thigh triangles to the hand.
  // Measure the exact skinned vertices the loader will render, including nail plates.
  for(const side of ['l','r']){
   const hand=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(`skin-hand.${side}`)) as SkinnedMesh;
   const box=new Box3();
   for(let i=0;i<hand.geometry.getAttribute('position').count;i++)box.expandByPoint(hand.getVertexPosition(i,new Vector3()).applyMatrix4(hand.matrixWorld));
   const size=box.getSize(new Vector3());
   expect(size.x,`${topic} ${side}: hand must exclude adjacent thigh`).toBeLessThan(.14);
   expect(size.y).toBeLessThan(.18);
   expect(size.z).toBeLessThan(.12);
   expect(size.y).toBeGreaterThan(.12);
   checkNailShells(hand,`${topic} ${side}`);
  }
  const outline=gltf.scene.getObjectByName('skin-outline') as SkinnedMesh;
  expect((outline.geometry.index?.count??outline.geometry.getAttribute('position').count)/3).toBeGreaterThan(12_000);
  // Protected face openings once drained the voxel fill, leaving an 11.6-L
  // thin shell that looked whole at rest and opened into membranes when posed.
  const bodyPoints=Array.from({length:outline.geometry.getAttribute('position').count},(_,i)=>outline.getVertexPosition(i,new Vector3()).applyMatrix4(outline.matrixWorld));
  const index=outline.geometry.index!;let signedVolume=0;
  for(let i=0;i<index.count;i+=3){
   const a=bodyPoints[index.getX(i)]!,b=bodyPoints[index.getX(i+1)]!,c=bodyPoints[index.getX(i+2)]!;
   signedVolume+=a.dot(b.clone().cross(c))/6;
  }
  expect(signedVolume,`${topic}: source-proportioned solid figure, not hollow panel skins`).toBeGreaterThan(.03);
  expect(signedVolume).toBeLessThan(.10);
  expect(Math.abs(Math.min(...bodyPoints.map(p=>p.y))-sourceRig.floorY),`${topic}: soles remain on the rig floor`).toBeLessThan(.005);

  gltf.scene.traverse(o=>{if(o instanceof SkinnedMesh)o.geometry.dispose();});
 });
});
