/** Offline delivery optimisation. Preserve every appended specimen triangle;
 * source anatomy uses bounded-error simplification with borders locked.
 * Audit decoded surfaces with audit-codec.ts before shipping. */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, weld, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync } from 'node:fs';
const input=process.argv[2]??'public/models/bones-and-joints-polished.glb';
const output=process.argv[3]??input;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
const document=await io.read(input),before=statSync(input).size;
if(before<1_500_000||document.getRoot().getExtras().atlasDeliveryCodec)throw Error('Regenerate the full cortex/round-2 packet before re-encoding.');
document.getRoot().setExtras({...document.getRoot().getExtras(),atlasDeliveryCodec:'2026-11-09'});
// Appended specimens use unnormalized integer positions. Materialise them
// as floats before requantisation; otherwise the library clamps their axes.
for(const a of document.getRoot().listAccessors())if(a.getType()==='VEC3'&&a.getComponentType()!==5126&&!a.getNormalized()){const v=a.getArray()!;a.setArray(new Float32Array(v));}
await document.transform(weld());
for(const mesh of document.getRoot().listMeshes())if(!mesh.getName().startsWith('polished-'))for(const primitive of mesh.listPrimitives())simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio:.4,error:.0014,lockBorder:true});
const custom=new Set(document.getRoot().listMeshes().flatMap(m=>m.listPrimitives().flatMap(p=>['_FIBRE','_U'].flatMap(k=>p.getAttribute(k)?[p.getAttribute(k)!]:[]))));
for(const a of custom){const result=new Int16Array(a.getCount()*a.getElementSize()),v:number[]=[];for(let i=0;i<a.getCount();i++){a.getElement(i,v);for(let k=0;k<a.getElementSize();k++)result[i*a.getElementSize()+k]=Math.round(Math.max(-1,Math.min(1,v[k]!))*2047)*16;}a.setArray(result).setNormalized(true);}
await document.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:14,quantizeNormal:12,quantizeWeight:16}));
await io.write(output,document);
console.log({input,output,before,after:statSync(output).size});
