/** Physical clearance of the actual decoded asset and shader-baked incoming flow.
 * A ball swept along each baked segment covers every possible particle jitter.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {Box3,DoubleSide,Mesh,Raycaster,Triangle,Vector3} from 'three';
import {bakeFlowPath} from '../../../src/engines/space-scene/lib/flow-curve';
import {partsFile} from '../../../src/engines/space-scene/schema';

// The full incoming, buccal, branchial and outgoing water routes.
const ENTRY_X=[.915,1.070] as const;
type Point=[number,number,number];
type TopicParts=ReturnType<typeof partsFile.parse>;
type Collision={segment:number;distance:number;point:Point};
export type MouthAudit={model:string;spread:number;entryX:typeof ENTRY_X;meshes:number;triangles:number;paths:{id:string;segments:number;centerlineHits:Point[];collisions:Collision[]}[]};

function segmentDistanceSq(p:Vector3,q:Vector3,a:Vector3,b:Vector3){
 const u=q.clone().sub(p),v=b.clone().sub(a),w=p.clone().sub(a),A=u.dot(u),B=u.dot(v),C=v.dot(v),D=u.dot(w),E=v.dot(w),den=A*C-B*B;
 if(A===0)return w.addScaledVector(v,C>0?-Math.max(0,Math.min(1,E/C)):0).lengthSq();
 if(C===0)return w.addScaledVector(u,Math.max(0,Math.min(1,-D/A))).lengthSq();
 let s=den>0?Math.max(0,Math.min(1,(B*E-C*D)/den)):0,t=(B*s+E)/C;
 if(t<0){t=0;s=A>0?Math.max(0,Math.min(1,-D/A)):0;}
 else if(t>1){t=1;s=A>0?Math.max(0,Math.min(1,(B-D)/A)):0;}
 return w.addScaledVector(u,s).addScaledVector(v,-t).lengthSq();
}

function triangleDistanceSq(a:Vector3,b:Vector3,t:Triangle){
 const direction=b.clone().sub(a),length=direction.length(),ray=new Raycaster(a,direction.divideScalar(length),0,length);
 const hit=ray.ray.intersectTriangle(t.a,t.b,t.c,false,new Vector3());
 if(hit&&hit.distanceToSquared(a)<=length*length)return 0;
 const nearest=new Vector3();
 const endpointDistances=[a,b].map(p=>t.closestPointToPoint(p,nearest).distanceToSquared(p)).filter(Number.isFinite);
 return Math.min(...endpointDistances,segmentDistanceSq(a,b,t.a,t.b),segmentDistanceSq(a,b,t.b,t.c),segmentDistanceSq(a,b,t.c,t.a));
}

function entrySegment(a:Vector3,b:Vector3){
 if(a.distanceToSquared(b)===0)return null;
 const dx=b.x-a.x;
 if(dx===0)return a.x>=ENTRY_X[0]&&a.x<=ENTRY_X[1]?[a,b] as const:null;
 const t0=(ENTRY_X[0]-a.x)/dx,t1=(ENTRY_X[1]-a.x)/dx;
 const lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(1,Math.max(t0,t1));
 return hi>lo?[a.clone().lerp(b,lo),a.clone().lerp(b,hi)] as const:null;
}

export async function auditFishMouth(file:TopicParts=partsFile.parse(JSON.parse(readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8')))):Promise<MouthAudit>{
 if(!file.model)throw new Error('The topic has no runtime model URL');
 const flow=file.flows.find(f=>f.id==='gill-water');
 if(!flow?.paths||typeof flow.spread!=='number')throw new Error('Expected authored gill-water paths and numeric renderer spread');
 const bytes=readFileSync('public'+file.model),buffer=Uint8Array.from(bytes).buffer;
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer,'');
 gltf.scene.updateMatrixWorld(true);
 const part=file.parts.find(p=>p.id==='fish-body'),object=part?.mesh?gltf.scene.getObjectByName(part.mesh):undefined;
 if(!object)throw new Error('The renderer-bound fish-body node is absent');
 const meshes:Mesh[]=[];object.traverse(child=>{if(child instanceof Mesh)meshes.push(child);});
 if(!meshes.length)throw new Error('The renderer-bound fish-body has no descendant meshes');
 const triangles:{triangle:Triangle;box:Box3}[]=[];
 // GLTFLoader creates a Group for a multi-primitive mesh. Include every
 // primitive, including transparent membranes, in both intersection checks.
 for(const mesh of meshes){
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material])material.side=DoubleSide;
  const position=mesh.geometry.getAttribute('position'),index=mesh.geometry.index;
  if(!index)throw new Error('Expected indexed decoded fish geometry');
  for(let k=0;k<index.count;k+=3){
   const vertices=[0,1,2].map(j=>new Vector3().fromBufferAttribute(position,index.getX(k+j)).applyMatrix4(mesh.matrixWorld));
   triangles.push({triangle:new Triangle(vertices[0]!,vertices[1]!,vertices[2]!),box:new Box3().setFromPoints(vertices)});
  }
 }
 const report:MouthAudit={model:file.model,spread:flow.spread,entryX:ENTRY_X,meshes:meshes.length,triangles:triangles.length,paths:[]};
 for(const path of flow.paths){
  const baked=bakeFlowPath(path.path),row:MouthAudit['paths'][number]={id:path.id,segments:0,centerlineHits:[],collisions:[]};
  for(let k=0;k<baked.count-1;k++){
   const segment=entrySegment(new Vector3().fromArray(baked.points,k*3),new Vector3().fromArray(baked.points,(k+1)*3));
   if(!segment)continue;
   row.segments++;const [a,b]=segment,direction=b.clone().sub(a),length=direction.length();
   row.centerlineHits.push(...new Raycaster(a,direction.normalize(),0,length).intersectObjects(meshes,false).map(h=>h.point.toArray() as Point));
   const capsuleBox=new Box3().setFromPoints([a,b]).expandByScalar(flow.spread);
   let closest:{triangle:Triangle;distance:number}|undefined;
   for(const candidate of triangles){
    if(!candidate.box.intersectsBox(capsuleBox))continue;
    const distance=Math.sqrt(triangleDistanceSq(a,b,candidate.triangle));
    if(distance<=flow.spread&&(!closest||distance<closest.distance))closest={triangle:candidate.triangle,distance};
   }
   if(closest){const point=closest.triangle.closestPointToPoint(a.clone().lerp(b,.5),new Vector3()).toArray() as Point;row.collisions.push({segment:k,distance:closest.distance,point});}
  }
  report.paths.push(row);
 }
 gltf.scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});
 return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=await auditFishMouth();console.log(JSON.stringify(report,null,2));
 if(report.paths.length!==4||report.paths.some(p=>p.segments===0||p.centerlineHits.length||p.collisions.length))process.exitCode=1;
}
