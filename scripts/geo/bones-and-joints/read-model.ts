/** CPU decoding of the shipped packet, including normalized attributes/skins. */
import {NodeIO,type Accessor,type Node} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferAttribute,BufferGeometry,Matrix4,Vector3} from 'three';
export const readModel=(path:string)=>new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);
export function values(a:Accessor){const result=new Float32Array(a.getCount()*a.getElementSize());const element:number[]=[];for(let i=0;i<a.getCount();i++){a.getElement(i,element);result.set(element,i*a.getElementSize());}return result;}
export function meshGeometry(node:Node,world=true,primitiveIndex=0){
 const p=node.getMesh()!.listPrimitives()[primitiveIndex]!;
 const g=new BufferGeometry().setAttribute('position',new BufferAttribute(values(p.getAttribute('POSITION')!),3));
 if(p.getAttribute('NORMAL'))g.setAttribute('normal',new BufferAttribute(values(p.getAttribute('NORMAL')!),3));
 if(p.getIndices())g.setIndex(new BufferAttribute(new Uint32Array(p.getIndices()!.getArray()!),1));
 const skin=node.getSkin(),j=p.getAttribute('JOINTS_0'),w=p.getAttribute('WEIGHTS_0');
 if(skin&&j&&w){
  const weights=values(w),indices=j.getArray()!,ibm=skin.getInverseBindMatrices()!,palettes=skin.listJoints().map((n,i)=>new Matrix4().fromArray(n.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm.getElement(i,[]))));
  const position=g.getAttribute('position'),v=new Vector3(),out=new Vector3();
  for(let i=0;i<position.count;i++){out.set(0,0,0);for(let k=0;k<4;k++){const weight=weights[i*4+k]!;if(weight)out.addScaledVector(v.fromBufferAttribute(position,i).applyMatrix4(palettes[indices[i*4+k]!]!),weight);}position.setXYZ(i,out.x,out.y,out.z);}
 }else if(world)g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
 else {g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));const stations:Record<string,number>={'polished-cortex':2,'polished-growth-disc':2,'polished-remodel-region':2,'polished-repair-clot':1.46,'polished-repair-clot-skin':1.46,'polished-repair-soft':1.82,'polished-repair-soft-skin':1.82,'polished-repair-hard':2.18,'polished-repair-remodelled':2.54};g.translate(-(stations[node.getName()]??0),0,0);}

 return g;
}
