/** Audit the actual renderer-loaded crown where a signed relief split the loft. */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {Mesh,Raycaster,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
export async function auditFishCrown(){
 await MeshoptDecoder.ready;
 const parts=JSON.parse(fs.readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8')),bytes=fs.readFileSync('public'+parts.model);
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
 const root=gltf.scene.getObjectByName('fish-body');
 if(!root)throw new Error('The renderer-bound fish-body node is absent');
 const meshes:Mesh[]=[];root.traverse(o=>{if(o instanceof Mesh)meshes.push(o);});
 if(!meshes.length)throw new Error('The renderer-bound fish-body has no descendant meshes');
 const triangles=meshes.reduce((count,mesh)=>{if(!mesh.geometry.index)throw new Error('Expected indexed decoded fish geometry');return count+mesh.geometry.index.count/3;},0);
 const ray=new Raycaster(),hits=[];
 for(const x of [.978,.984,.990,.996])for(const z of [-.0702,-.0700,-.0698]){
  ray.set(new Vector3(x,.30,z),new Vector3(0,-1,0));const h=ray.intersectObjects(meshes,false)[0];hits.push({x,z,y:h?.point.y??null});
 }
 gltf.scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});
 return {model:parts.model,meshes:meshes.length,triangles,hits};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=await auditFishCrown();console.log(JSON.stringify(r,null,2));if(r.hits.some(h=>h.y===null||h.y<.215))process.exitCode=1;}
