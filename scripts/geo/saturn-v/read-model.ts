/** Read precisely the meshopt payload and node matrices shipped to the engine. */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry,Float32BufferAttribute,Matrix4,Vector3} from 'three';
export async function readModel(path='public/models/saturn-v.glb'){
 await MeshoptDecoder.ready;
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
 const doc=await io.read(path);
 const labels=new Map(doc.getRoot().listNodes().flatMap(n=>{const a=n.getExtras().labelPoint as number[]|undefined;return a?[[n.getName(),new Vector3(...a as [number,number,number]).applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix())).toArray()] as [string,number[]]]:[];}));
 await doc.transform(dequantize());
 const meshes=new Map<string,BufferGeometry>();
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){const g=new BufferGeometry();for(const [name,semantic]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]as const){const a=p.getAttribute(semantic);if(a)g.setAttribute(name,new Float32BufferAttribute(a.getArray()!,3));}if(p.getIndices())g.setIndex(Array.from(p.getIndices()!.getArray()!));g.applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()));g.userData.labelPoint=labels.get(n.getName());meshes.set(n.getName(),g);}
 return meshes;
}
