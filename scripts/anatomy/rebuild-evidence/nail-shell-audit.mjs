/** Independent exact-loader nail topology/volume audit; no source sentinels. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PropertyBinding,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
const rows=[];
for(const topic of (process.env.MUSCLES_TOPICS?.split(',')??['arms','back','chest','core','legs','shoulders'])){
 const bytes=fs.readFileSync(`public/models/muscles-${topic}.glb`),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
 for(const name of ['skin-hand.l','skin-hand.r','skin-outline']){
  const m=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(name)),position=m.geometry.getAttribute('position'),normal=m.geometry.getAttribute('normal'),ix=m.geometry.index.array,p=Array.from({length:position.count},(_,i)=>m.getVertexPosition(i,new Vector3()).applyMatrix4(m.matrixWorld)),parent=p.map((_,i)=>i);
  const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};for(let i=0;i<ix.length;i+=3)for(let k=1;k<3;k++)parent[root(ix[i+k])]=root(ix[i]);
  const groups=new Map();for(let i=0;i<p.length;i++){const r=root(i);if(!groups.has(r))groups.set(r,{vertices:[],faces:[]});groups.get(r).vertices.push(i);}for(let i=0;i<ix.length;i+=3)groups.get(root(ix[i])).faces.push([ix[i],ix[i+1],ix[i+2]]);
  const sorted=[...groups.values()].sort((a,b)=>b.vertices.length-a.vertices.length),plates=sorted.slice(1),results=[];
  for(const c of plates){
   const origin=p[c.vertices[0]],edges=new Map();let volume=0,tiny=0,normalDisagree=0;
   for(const f of c.faces){const a=p[f[0]],b=p[f[1]],d=p[f[2]],cross=b.clone().sub(a).cross(d.clone().sub(a));volume+=a.clone().sub(origin).dot(b.clone().sub(origin).cross(d.clone().sub(origin)))/6;if(cross.length()<1e-10)tiny++;const avg=f.map(i=>new Vector3().fromBufferAttribute(normal,i)).reduce((s,v)=>s.add(v),new Vector3()).normalize();if(cross.clone().normalize().dot(avg)<0)normalDisagree++;
    for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(','),e=edges.get(key)??{count:0,signed:0};e.count++;e.signed+=a<b?1:-1;edges.set(key,e);}
   }
   const openEdges=[...edges.values()].filter(e=>e.count!==2).length,inconsistentWindingEdges=[...edges.values()].filter(e=>e.count===2&&e.signed!==0).length;
   results.push({vertices:c.vertices.length,triangles:c.faces.length,signedVolumeMM3:volume*1e9,openEdges,inconsistentWindingEdges,tinyFaces:tiny,normalDisagreementFaces:normalDisagree});
  }
  const row={topic,assetSha256:createHash('sha256').update(bytes).digest('hex'),node:name,expectedPlates:name==='skin-outline'?10:5,plates:results};rows.push(row);
  if(plates.length!==row.expectedPlates||results.some(p=>p.openEdges||p.inconsistentWindingEdges||p.signedVolumeMM3<=1))throw Error('Invalid native nail shell '+JSON.stringify(row));
 }
 console.log(topic,'actual closed positive-volume nail shells passed');
}
fs.writeFileSync('scripts/anatomy/rebuild-evidence/nail-shell-audit.json',JSON.stringify({date:'2026-11-09',method:'Exact GLTFLoader/meshopt world vertices; graph components excluding main skin; each plate has five-finger/ten-toe count, closed two-manifold opposite directed edges, positive centered signed volume over1mm3. Normal disagreement/tiny faces are reported independently, not concealed.',rows},null,2)+'\n');
