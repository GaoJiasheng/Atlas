/** CPU inspection of the shipped GLB accessors (same local geometry as WebGL). */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { BufferGeometry, Float32BufferAttribute, Matrix4 } from 'three';
import type { ShapePiece } from '../../../src/engines/space-scene/stages/model3d/geometry';
export async function loadGeology(path:string):Promise<Map<string,ShapePiece[]>> {
  await MeshoptDecoder.ready;
  const out=new Map<string,ShapePiece[]>(),doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);
  await doc.transform(dequantize());
  for(const node of doc.getRoot().listNodes()) {
    const pieces:ShapePiece[]=[];
    for(const p of node.getMesh()?.listPrimitives()??[]) {
      const g=new BufferGeometry();
      for(const [source,target,size] of [['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]] as const) {
        const a=p.getAttribute(source)?.getArray();if(a)g.setAttribute(target,new Float32BufferAttribute(a,size));
      }
      const index=p.getIndices()?.getArray();if(index)g.setIndex(Array.from(index));
      // Match GltfSource's rest transform after meshopt quantisation. CPU
      // previews/audits operate in scene space, including normal transforms.
      g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
      pieces.push({geometry:g,matrices:null,slot:0});
    }
    if(pieces.length)out.set(node.getName(),pieces);
  }
  return out;
}
