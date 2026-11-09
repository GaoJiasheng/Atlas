/** Targeted rebake preserves main's current text and every other apparatus. */
import fs from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,dedup,meshopt,mergeDocuments} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3} from 'three';
import {bakeGasCylinder} from './gas-cylinder';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const path='src/content/topics/heat/data/parts.json',data=JSON.parse(fs.readFileSync(path,'utf8')),model='public'+data.model;
const doc=await io.read(process.env.HEAT_BASE_MODEL??model);
const existing=doc.getRoot().listNodes().find(n=>n.getName()==='gas-cylinder');
if(existing){existing.getMesh()!.listPrimitives().forEach(p=>p.dispose());existing.getMesh()!.dispose();existing.dispose();}
const added=new Document();added.createBuffer();added.createScene('heat-gas');
const count=bakeGasCylinder(added,data.parts.find((p:{id:string})=>p.id==='gas-cylinder'));
const node=added.getRoot().listNodes().find(n=>n.getName()==='gas-cylinder')!;
const point=new Vector3(...node.getExtras().labelPoint as [number,number,number]);
await added.transform(weld(),dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeTexcoord:14}));
node.setExtras({...node.getExtras(),labelPoint:point.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()).invert()).toArray()});
mergeDocuments(doc,added);
const scenes=doc.getRoot().listScenes(),gas=doc.getRoot().listNodes().find(n=>n.getName()==='gas-cylinder')!;
scenes[0]!.addChild(gas);for(const s of scenes.slice(1))s.dispose();
const buffers=doc.getRoot().listBuffers();for(const a of doc.getRoot().listAccessors())a.setBuffer(buffers[0]!);for(const b of buffers.slice(1))b.dispose();
const bytes=await io.writeBinary(doc);if(bytes.length>1_500_000)throw Error('Heat GLB budget');
fs.writeFileSync(model,bytes);fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
console.log({triangles:count,bytes:bytes.length});
