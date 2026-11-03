/** Bake the comparison rows from the complete stage geometry. Individual
 * surfaces stay disconnected; no long sweep joins separate specimens.
 * SpaceScene uses one material per mesh part, so these two small comparison
 * studies are deliberately monochrome, with geometry identical to the stages.
 */
import { mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, simplify, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { Matrix4, type BufferGeometry } from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { primitiveSchema } from '../../../src/engines/space-scene/schema';
import { primitivePieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import type { P } from './specimens';

const SIMPLIFY_RATIO=.5, SIMPLIFY_ERROR=.0008;
export async function writeComparisonMeshes(rows: Map<string,P[]>, path:string):Promise<void> {
  const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('comparison-studies');
  doc.getRoot().getAsset().copyright='Original Atlas procedural geometry, Gao Jiasheng 2026. CC BY-NC-SA 4.0. No third-party mesh or texture.';
  for(const [id,primitives] of rows){
    const surfaces:BufferGeometry[]=[];
    for(const p of primitives){
      const primitive=primitiveSchema.parse(p);
      for(const piece of primitivePieces({primitive})){
        if(piece.lines){piece.geometry.dispose();continue;}
        for(const instance of piece.matrices??[new Matrix4()]){
          const g=piece.geometry.clone().applyMatrix4(new Matrix4().makeTranslation(...primitive.at).multiply(instance));
          for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);
          surfaces.push(g.index?g.toNonIndexed():g);
          if(g.index)g.dispose();
        }
        piece.geometry.dispose();
      }
    }
    const merged=mergeGeometries(surfaces,false);
    if(!merged)throw new Error(`Cannot merge ${id}`);
    const geometry=mergeVertices(merged,1e-7);
    const mesh=doc.createMesh(id),p=doc.createPrimitive();
    for(const [from,to] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']]){
      const a=geometry.getAttribute(from!);
      p.setAttribute(to!,doc.createAccessor().setType(from==='uv'?'VEC2':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));
    }
    p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(geometry.index!.array)).setBuffer(buffer));
    p.setMaterial(doc.createMaterial(id).setRoughnessFactor(.85).setMetallicFactor(0));
    mesh.addPrimitive(p);scene.addChild(doc.createNode(id).setMesh(mesh));
    for(const g of surfaces)g.dispose();merged.dispose();geometry.dispose();
  }
  await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
  // The rows are drawn at about a quarter of the stage specimens' size: a
  // bounded-error simplification keeps every silhouette, digit and feather.
  await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:SIMPLIFY_RATIO,error:SIMPLIFY_ERROR}),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:14}));
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
  mkdirSync(dirname(path),{recursive:true});await io.write(path,doc);
  if(statSync(path).size>8*1024*1024)throw new Error('Comparison mesh exceeds the local asset budget');
}
