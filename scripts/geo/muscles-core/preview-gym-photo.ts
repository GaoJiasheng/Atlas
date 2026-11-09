/** Photo-angle studies: perspective camera, inspected reference crops and all
 * residual differences disclosed. The flat bench study is rebuilt from the
 * same runtime factory at 0°, separately meshopt-encoded/decoded for QA. */
import fs from 'node:fs';
import sharp from 'sharp';
import { Color, Matrix4, Matrix3, Vector3 } from 'three';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, weld, meshopt } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { render, tokens, type Surface, type V } from '../../anatomy/rebuild-evidence/studio';
import { gymBenchShape } from '../kits/muscles-gym';
import { geometry } from './build-gym';
const dir='scripts/anatomy/rebuild-evidence/gym/final',refs='scripts/anatomy/rebuild-evidence/gym/refs';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc=await io.read('public/models/muscles-core-gym.glb');await doc.transform(dequantize());
const flat=new Document(),buffer=flat.createBuffer(),g=geometry(gymBenchShape(0)),p=flat.createPrimitive();
for(const [a,s]of [['position','POSITION'],['normal','NORMAL']]as const)p.setAttribute(s,flat.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(buffer));
p.setIndices(flat.createAccessor().setType('SCALAR').setArray(g.index?new Uint32Array(g.index.array):Uint32Array.from({length:g.getAttribute('position').count},(_,i)=>i)).setBuffer(buffer));
flat.createScene().addChild(flat.createNode('bench-flat').setMesh(flat.createMesh().addPrimitive(p)));
await flat.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10}));
const flatDecoded=await io.readBinary(await io.writeBinary(flat));await flatDecoded.transform(dequantize());
function surfaces(id:string):Surface[]{
 const model=id==='bench-flat'?flatDecoded:doc,node=model.getRoot().listNodes().find(n=>n.getName()===id)!,prim=node.getMesh()!.listPrimitives()[0]!,ps=prim.getAttribute('POSITION')!,ns=prim.getAttribute('NORMAL')!,idx=prim.getIndices()!,world=new Matrix4().fromArray(node.getWorldMatrix()),nm=new Matrix3().getNormalMatrix(world),positions=new Float32Array(idx.getCount()*3),normals=new Float32Array(idx.getCount()*3),v=new Vector3();
 for(let k=0;k<idx.getCount();k++){const j=idx.getScalar(k);v.fromArray(ps.getElement(j,[0,0,0])).applyMatrix4(world);positions.set(v.toArray(),k*3);v.fromArray(ns.getElement(j,[0,0,0])).applyMatrix3(nm).normalize();normals.set(v.toArray(),k*3);}
 return [{id,positions,normals,rgb:new Color(tokens('paper').neutral!),roughness:.68,metalness:0,envIntensity:.5}];
}
interface Study{id:string;name:string;ref:string;crop?:{left:number;top:number;width:number;height:number};camera:{position:V;target:V;fov:number};residual:string}
const studies:Study[]=[
 {id:'barbell',name:'barbell-photo-angle',ref:'Olympic_barbell.jpg',camera:{position:[-1.25,.25,.90],target:[-.18,0,0],fov:42},residual:'Perspective near/far plate scale and ascending shaft matched approximately. Reference has 450 mm multi-plate loading; model deliberately preserves original 300 mm single plate per side and 2.2 m bar.'},
 {id:'dumbbell',name:'dumbbell-photo-angle',ref:'Dumbells_and_free_weights_in_a_gym.jpg',crop:{left:380,top:455,width:110,height:125},camera:{position:[.58,.055,.025],target:[0,0,0],fov:30},residual:'Cropped one fixed round dumbbell, viewing down its grip axis from above. Head shape is a generic fixed 140 mm head; reference has three relief rings and printed markings, which this design does not copy.'},
 {id:'bench-flat',name:'bench-photo-angle',ref:'WeightBenchSide.jpg',camera:{position:[-1.8,.95,1.10],target:[0,-.17,.04],fov:41},residual:'Matched side-oblique view and flat pad setting using same factory at incline=0. Reference is a curved-leg consumer bench with leg developer; model is generic ladder-adjustable steel-section bench preserving existing 1.2×.3/.45 m contract.'},
 {id:'rack',name:'rack-photo-angle',ref:'Power_Rack.JPG',crop:{left:750,top:460,width:230,height:440},camera:{position:[.95,1.17,1.12],target:[.60,1.02,-.01],fov:32},residual:'Matched near-front post / hole / support detail with modest side elevation. Reference is four-post cage and different holder system; model preserves two stand uprights and existing J-cup bar axis.'},
 {id:'cable',name:'cable-photo-angle',ref:'Multifunctional_cable_and_row_machines_in_a_gym.jpg',crop:{left:325,top:445,width:125,height:280},camera:{position:[.38,.64,.70],target:[0,.4,-.37],fov:43},residual:'Matched low front-oblique view of the stack and vertical rods. Reference frame is round-section, shrouded multi-station equipment; model is an unshrouded single tower and does not assert identical weight/count/mechanical advantage.'},
];
const records=[];
for(const s of studies){
 const file=`${dir}/${s.name}.png`;records.push({...s,render:await render(surfaces(s.id),file,{width:800,height:600,camera:s.camera})});
 let ref=sharp(`${refs}/${s.ref}`);if(s.crop)ref=ref.extract(s.crop);
 const right=await ref.resize(800,600,{fit:'contain',background:'#f1ede4'}).png().toBuffer(),left=await sharp(file).png().toBuffer();
 const head=Buffer.from(`<svg width="1600" height="83"><rect width="1600" height="83" fill="#e9e4d8"/><text x="15" y="25" font-family="sans-serif" font-size="18">${s.name} · perspective photo-angle study</text><text x="15" y="49" font-family="sans-serif" font-size="14">Actual decoded kit / runtime factory; engine studio + ACES</text><text x="815" y="49" font-family="sans-serif" font-size="14">Commons photo ${s.crop?'crop; no geometry/photo warping':'original'}</text><text x="15" y="72" font-family="sans-serif" font-size="13">Approximate camera match; equipment-design and dimensional residuals recorded in photo-manifest.json</text></svg>`);
 await sharp({create:{width:1600,height:683,channels:3,background:'#e9e4d8'}}).composite([{input:left,left:0,top:83},{input:right,left:800,top:83},{input:head,left:0,top:0}]).png().toFile(`${dir}/${s.name}-comparison.png`);
 console.log(s.name);
}
fs.writeFileSync(`${dir}/photo-manifest.json`,JSON.stringify({studies:records,claim:'Approximate photo-angle/crop matching studies, NOT exact model or camera calibration. Full mandatory matched front/three-quarter/profile/detail evidence remains incomplete.'},null,2));
