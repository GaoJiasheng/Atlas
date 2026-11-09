/** Offline check of actual geometry and the five production LabelProbe rays. */
import fs from 'node:fs';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry,BufferAttribute,Matrix4,Mesh,MeshBasicMaterial,DoubleSide,Raycaster,Vector3,Box3} from 'three';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
export async function pipelineScene(){
 const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/water/data/parts.json','utf8')));
 await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+data.model);await doc.transform(dequantize());
 const shapes:Mesh[]=[];const bounds=new Map<string,Box3>();
 for(const p of data.parts){
  if(p.mesh){
   const node=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!,prim=node.getMesh()!.listPrimitives()[0]!,g=new BufferGeometry();
   for(const [name,semantic,size]of [['position','POSITION',3],['uv','TEXCOORD_0',2]] as const){const a=prim.getAttribute(semantic);if(a)g.setAttribute(name,new BufferAttribute(Float32Array.from(a.getArray()!),size));}
   g.setIndex(Array.from(prim.getIndices()!.getArray()!));g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
   const mat=prim.getMaterial()!,image=mat.getBaseColorTexture()?.getImage();
   const m=new Mesh(g,new MeshBasicMaterial({side:mat.getDoubleSided()?DoubleSide:0}));m.name=p.id;m.userData.group=p.group;
   if(image){const d=await sharp(Buffer.from(image)).ensureAlpha().raw().toBuffer({resolveWithObject:true});m.userData.alpha={pixels:d.data,width:d.info.width,height:d.info.height,cutoff:mat.getAlphaCutoff()};}
   shapes.push(m);
  }else{
   const slots=partMaterialSlots(p);
   for(const piece of partPieces(p)){
    if(piece.lines)continue;
    const slot=slots[piece.slot??0]!,look=resolveMaterialLook(slot.color,{},'paper',slot.tint);
    for(const matrix of piece.matrices??[new Matrix4()]){
     const g=piece.geometry.clone().applyMatrix4(matrix).translate(...p.primitive!.at),m=new Mesh(g,new MeshBasicMaterial());m.name=p.id;m.userData.group=p.group;m.userData.occludes=look.opacity>.6;shapes.push(m);
    }piece.geometry.dispose();
   }
  }
 }
 for(const m of shapes){m.updateMatrixWorld();m.geometry.computeBoundingBox();const b=bounds.get(m.name)??new Box3();b.union(m.geometry.boundingBox!);bounds.set(m.name,b);}
 const box=bounds.get('johor-main')!,center=box.getCenter(new Vector3()),half=box.getSize(new Vector3()).multiplyScalar(.5);
 const cast=(position:number[],id='johor-main',layers?:string[])=>{
  const b=bounds.get(id)!,c=b.getCenter(new Vector3()),h=b.getSize(new Vector3()).multiplyScalar(.5),camera=new Vector3().fromArray(position),fz=c.z+Math.sign(camera.z-c.z)*h.z*.5;
  const points=[c,...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy])=>new Vector3(c.x+sx!*h.x*.5,c.y+sy!*h.y*.5,fz))];
  return points.map(point=>{
   const distance=point.distanceTo(camera),ray=new Raycaster(camera,point.clone().sub(camera).normalize(),0,distance-.02);
   const hit=ray.intersectObjects(shapes.filter(m=>m.name!==id&&m.userData.occludes!==false&&(!layers||!m.userData.group||layers.includes(m.userData.group))),false).find(hit=>{
    const a=hit.object.userData.alpha;if(!a||!hit.uv)return true;
    const u=hit.uv.x-Math.floor(hit.uv.x),v=hit.uv.y-Math.floor(hit.uv.y);
    return a.pixels[(Math.floor(v*a.height)*a.width+Math.floor(u*a.width))*4+3]/255>=a.cutoff;
   });return {point:point.toArray(),blocker:hit?.object.name??null,clearance:hit?distance-hit.distance:null};
  });
 };
 return {center:center.toArray(),half:half.toArray(),cast,dispose(){shapes.forEach(m=>{m.geometry.dispose();(m.material as MeshBasicMaterial).dispose();});}};
}
