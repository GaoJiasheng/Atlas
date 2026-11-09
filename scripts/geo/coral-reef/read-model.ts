/** Decode the distributed meshopt packet for CPU QA, in stage coordinates. */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferAttribute,BufferGeometry,Matrix4,Vector3} from 'three';
export async function readModel(path:string){
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);
 const meshes=new Map<string,{geometry:BufferGeometry;matrix:Matrix4}[]>();
 for(const node of doc.getRoot().listNodes())if(node.getMesh()){
  const pieces=node.getMesh()!.listPrimitives().map(p=>{
   const geometry=new BufferGeometry();
   for(const [semantic,name]of [['POSITION','position'],['NORMAL','normal']] as const){const a=p.getAttribute(semantic);if(a){const array=new Float32Array(a.getCount()*a.getElementSize()),element:number[]=[];for(let i=0;i<a.getCount();i++){a.getElement(i,element);array.set(element,i*a.getElementSize());}geometry.setAttribute(name,new BufferAttribute(array,3));}}
   if(p.getIndices())geometry.setIndex(new BufferAttribute(new Uint32Array(p.getIndices()!.getArray()!),1));
   if(!geometry.hasAttribute('normal'))geometry.computeVertexNormals();
   return {geometry,matrix:new Matrix4().fromArray(node.getWorldMatrix())};
  });meshes.set(node.getName(),pieces);
 }
 const labelPoints=new Map(doc.getRoot().listNodes().flatMap(n=>{const p=n.getExtras().labelPoint;return Array.isArray(p)?[[n.getName(),new Vector3(...p).applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()))] as const]:[];}));
 return {doc,meshes,labelPoints};
}
