/** Offline encoding only: retain every triangle; position/normal quantisation
 * follows the existing mangrove codec. No simplify or runtime dependency. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import {Matrix4,Vector3} from 'three';
import { statSync } from 'node:fs';
export async function compressModel(input:string,output=input){
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;
const document=await io.read(input),before=statSync(input).size;
const anchors=document.getRoot().listNodes().flatMap(n=>{const p=n.getExtras().labelPoint;return Array.isArray(p)?[{node:n,point:new Vector3(...p).applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()))}]:[];});
await document.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeWeight:16}));
for(const {node,point}of anchors)node.setExtras({...node.getExtras(),labelPoint:point.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()).invert()).toArray()});
await io.write(output,document);
console.log({input,output,before,after:statSync(output).size});
}
if(process.argv[1]?.endsWith('/compress-model.ts'))await compressModel(process.argv[2]??'public/models/coral-reef.glb',process.argv[3]);
