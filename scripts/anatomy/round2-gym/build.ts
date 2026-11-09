/** Build-time only. Runtime loads compressed meshes; no factory crosses into src. */
import fs from 'node:fs';
import { BufferAttribute, BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Document, NodeIO, VertexLayout } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import type { Primitive, Part } from '../../../src/engines/space-scene/schema';
import { gymBarbellShape,gymDumbbellShape,gymBenchShape,gymRackShape,gymColumnShape,gymOutputPulleyShape,gymPulleyShape,type GymShape } from './kit';
const c='token:neutral';type V=[number,number,number];
const box=(size:V,at:V):Primitive=>({kind:'bevelBox',size,at,bevel:.008,color:c});
const tube=(path:V[],radius:number):Primitive=>({kind:'tube',path,radius,bendRadius:.028,at:[0,0,0],color:c});
const list=(s:GymShape)=>[s.primitive,...s.extra??[]];
const assembly=(p:Primitive[]):GymShape=>({primitive:p[0]!,extra:p.slice(1)});
const move=(s:GymShape,at:V)=>list(s).map(p=>({...p,at:p.at.map((v,i)=>v+at[i]!) as V}));
const column=list(gymColumnShape(0)).map(p=>({...p,at:[p.at[0],p.at[1],p.at[2]-.6] as V}));
const latFrame=assembly([...column,box([.07,.065,.80],[0,2.17,-.37]),...move(gymPulleyShape(),[0,2.11,0]),box([.07,.065,.16],[0,2.17,-.07]),tube([[0,.66,-1.004],[0,2.11,-1.004],[0,2.144,-.97],[0,2.144,0],[0,2.11,.034]],.0028),box([.07,.045,1.08],[0,.045,-.14])]);
const latBar=assembly([tube([[-.60,-.09,0],[-.49,-.045,0],[-.37,0,0],[.37,0,0],[.49,-.045,0],[.60,-.09,0]],.014),{kind:'torus',size:[.019,.004],at:[0,.019,0],color:c}]);
const seat=assembly([box([.34,.065,.32],[0,-.0325,0]),box([.24,.015,.28],[0,-.071,0]),box([.065,.265,.065],[0,-.204,0]),box([.48,.03,.46],[0,-.329,0]),box([.07,.20,.07],[0,-.17,.145])]);
const pads=assembly([box([.055,.30,.055],[0,-.19,-.055]),box([.065,.045,.22],[0,-.22,-.13]),box([.075,.10,.08],[0,0,-.055]),{kind:'lathe',profile:[[0,-.21],[.062,-.21],[.07,-.20],[.07,-.035],[.062,-.025],[.012,-.025],[.012,.025],[.062,.025],[.07,.035],[.07,.20],[.062,.21],[0,.21]],segments:40,rotation:[0,0,90],at:[0,0,0],color:c}]);
export function geometry(shape:GymShape,fit=false):BufferGeometry{
 const parts=list(shape).map(p=>{
  const pieces=partPieces({primitive:p} as Part).filter(x=>!x.lines);
  const gs=pieces.map(x=>{if(x.matrices?.length===1)x.geometry.applyMatrix4(x.matrices[0]!);return x.geometry;});
  const g=gs.length===1?gs[0]!:mergeGeometries(gs,false)!;g.translate(...p.at);
  if(fit){const pos=g.getAttribute('position');g.setAttribute('_fit',new BufferAttribute(Float32Array.from({length:pos.count},(_,i)=>p.kind==='extrude'&&p.at[1]===0?pos.getY(i)/1.3:p.at[1]>.6?1:0),1));}
  return g;
 });
 return mergeGeometries(parts,false)!;
}
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('muscles-runtime-gym');
doc.getRoot().getAsset().copyright='Atlas original procedural geometry, repository MIT licence. Catalogue photos are research only.';
const material=doc.createMaterial('neutral-studio').setBaseColorFactor([.251,.227,.188,1]).setRoughnessFactor(.68);
const shapes:Record<string,GymShape>={barbell:gymBarbellShape(),dumbbell:gymDumbbellShape(),rack:gymRackShape(1),cable:gymColumnShape(0),pulley:gymOutputPulleyShape(),'lat-frame':latFrame,'lat-bar':latBar,'lat-seat':seat,'lat-pads':pads};
for(const angle of [0,30,45,84])shapes[`bench-${angle}`]=gymBenchShape(angle);
const metrics:Record<string,unknown>={};
for(const [name,shape]of Object.entries(shapes).filter(([n])=>!process.argv.includes('--lat')||n.startsWith('lat-'))){
 if(!process.argv.includes('--lat')&&name.startsWith('lat-'))continue;
 const g=geometry(shape,name==='rack');const prim=doc.createPrimitive().setMaterial(material);
 for(const [key,a]of Object.entries(g.attributes).filter(([k])=>['position','normal','_fit'].includes(k)))prim.setAttribute(key==='position'?'POSITION':key==='normal'?'NORMAL':key.toUpperCase(),doc.createAccessor().setType(a.itemSize===3?'VEC3':a.itemSize===2?'VEC2':'SCALAR').setArray(new Float32Array(a.array)).setBuffer(buffer));
 prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(g.index?new Uint32Array(g.index.array):Uint32Array.from({length:g.getAttribute('position').count},(_,i)=>i)).setBuffer(buffer));
 scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
 g.computeBoundingBox();metrics[name]={triangles:(g.index?.count??g.getAttribute('position').count)/3,draws:1,bounds:{min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()}};
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10}));
const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const data=await io.writeBinary(doc);if(data.length>1500000)throw Error(`GLB over budget ${data.length}`);
fs.writeFileSync(process.argv.includes('--lat')?'public/models/muscles-back-pulldown.glb':'public/models/muscles-core-gym.glb',data);fs.writeFileSync(process.argv.includes('--lat')?'scripts/anatomy/round2-gym/pulldown-metrics.json':'scripts/anatomy/round2-gym/metrics.json',JSON.stringify({bytes:data.length,models:metrics},null,2));console.log(data.length,metrics);
