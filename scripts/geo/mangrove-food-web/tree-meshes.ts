/** Original offline mesh surfaces, shared by the GLB export and CPU QA. */
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, reorder } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BufferGeometry } from 'three';
import type { ShapePiece } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { branchingTree, treeGeometry, bakePrimitives, pencilRootSystem, propRootSystem } from '../kits/tree';
export const treeStudies={
 'api-tree':branchingTree([-.46,0,-.13],{height:.70,spread:.28,lean:.025,species:'api'}),
 'bakau-tree':branchingTree([.18,0,-.25],{height:.78,spread:.27,species:'bakau'}),
};
export function treeMeshes():Map<string,BufferGeometry> {
 const api=pencilRootSystem([-.46,0,-.13]);
 return new Map([
  // Selectable crowns (foliage) and their context trunks/limbs (bark).
  ['api-tree',treeGeometry(treeStudies['api-tree'],'leaves')],['bakau-tree',treeGeometry(treeStudies['bakau-tree'],'leaves')],
  ['api-trunk',treeGeometry(treeStudies['api-tree'],'wood')],['bakau-trunk',treeGeometry(treeStudies['bakau-tree'],'wood')],
  ['api-lateral',bakePrimitives(api.lateral)],['api-pencil',bakePrimitives(api.pencils)],['bakau-prop',bakePrimitives(propRootSystem([.18,0,-.25]))],
 ]);
}
export async function writeTreeMeshes(){
 const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('mangrove-studies');
 doc.getRoot().getAsset().copyright='Original Atlas procedural geometry. CC BY-NC-SA 4.0. No third-party mesh, texture or traced outline.';
 for(const [id,raw] of treeMeshes()){
  const g=mergeVertices(raw,1e-7),pos=g.getAttribute('position'),normal=g.getAttribute('normal');
  const acc=(name:string,type:'VEC3'|'SCALAR',array:Float32Array<ArrayBuffer>|Uint32Array<ArrayBuffer>)=>doc.createAccessor(name).setType(type).setArray(array).setBuffer(buffer);
  const prim=doc.createPrimitive().setAttribute('POSITION',acc(id+'-position','VEC3',new Float32Array(pos.array))).setAttribute('NORMAL',acc(id+'-normal','VEC3',new Float32Array(normal.array))).setIndices(acc(id+'-indices','SCALAR',new Uint32Array(g.index!.array)));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(prim)).setExtras({closed:true}));g.dispose();raw.dispose();
 }
 // Meshopt + quantised attributes (the engine's loader decodes both): ~4× smaller
 // than raw floats, so the stage is ready sooner on an iPad.
 await MeshoptEncoder.ready;
 await doc.transform(reorder({encoder:MeshoptEncoder}),quantize({pattern:/^(POSITION|NORMAL)$/,quantizePosition:16,quantizeNormal:12}));
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const io=new NodeIO().registerExtensions([EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
 const out=resolve('public/models/mangrove-food-web.glb');mkdirSync(resolve(out,'..'),{recursive:true});writeFileSync(out,await io.writeBinary(doc));
}
export const meshPiece=(geometry:BufferGeometry):ShapePiece=>({geometry,matrices:null,slot:0});
