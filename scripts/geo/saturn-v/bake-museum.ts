/** Build and meshopt-compress the actual named meshes consumed by GltfSource. */
import fs from 'node:fs';
import {Document,NodeIO,VertexLayout,Logger} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,meshopt,dedup,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {BufferGeometry,Matrix4,Vector3} from 'three';
import * as geo from './museum-geometry';
import * as a11 from './apollo11-geometry';
import {compressPosition} from './position-pack';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {partsFile} from '../../../src/engines/space-scene/schema';
type Data=Record<string,any>;
function copies(g:BufferGeometry,r:number){const h=new geo.Hardware();for(let i=0;i<4;i++){const a=i*Math.PI/2;h.pieces.push(g.clone().rotateY(a).translate(-r*Math.sin(a),0,-r*Math.cos(a)));}g.dispose();return h.merge();}
export async function rebuildMuseum(file:Data){
 const original=partsFile.parse(file),before:Record<string,number>={};
 for(const part of original.parts){let n=0;for(const p of partPieces(part)){n+=(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1);p.geometry.dispose();}before[part.id]=n;}
 const models:Record<string,BufferGeometry>={
  'sla-shell':geo.adapter(),'iu-ring':a11.instrumentUnit(),'sic-shell':geo.stageSkin('sic-shell'),'sii-shell':geo.stageSkin('sii-shell'),'sivb-shell':geo.stageSkin('sivb-shell'),
  'f1-centre':a11.f1([0,0,0]),'f1-outer':copies(a11.f1([0,0,0],true),3.8),
  'j2-centre':a11.j2([0,42.5,0],false),'j2-outer':copies(a11.j2([0,42.5,0]),2.5),
  'sivb-engine':a11.j2([0,67.3,0]),'sic-fins':geo.fins(),
  'les-tower':a11.launchEscape(),'cm-probe':geo.probe(),'sm-shell':a11.serviceModule(),'cm-shell':a11.commandModule(),
  'sm-engine':a11.spacecraftEngine('sps'),'cm-couches':a11.crewCouches(),
  'lm-descent':a11.descentStage(),'lm-ascent':await a11.ascentCabin(),'lm-legs':a11.landingGear(),'lm-ladder':geo.ladder(),
  'lm-descent-engine':a11.spacecraftEngine('descent'),'lm-ascent-engine':a11.spacecraftEngine('ascent'),
 };
 // Correct the inherited SM cylinder/nozzle station split against NASA's
 // p87 elevation. Keep the SLA interface at 94 m and the 111 m stack top.
 for(const id of ['cm-shell','cm-probe','cm-couches'])models[id]!.translate(0,-2.5,0);
 for(const id of ['sic-fuel','sic-oxidiser','sii-fuel','sii-oxidiser','sivb-fuel','sivb-oxidiser'])models[id]=a11.stageTank(id);
 models['sm-tanks']=a11.serviceStorage();
 for(const p of file.parts){
  const shift=p.id.startsWith('cm-')?-2.5:p.id==='sm-engine'?-1.25:0;
  if(shift)for(const q of [p.primitive,...(p.extra??[])])q.at[1]+=shift;
  if(p.id==='sm-tanks'){p.primitive.at[1]=96.3;for(const q of p.extra??[])q.at[1]=96.3;}
  if(p.id==='sm-shell'){p.primitive.at[1]=96.25;for(const q of p.primitive.profile)q[1]*=4.5/7;}
 }
 models['lm-windows']=geo.windows(models['lm-ascent']!);
 const doc=new Document().setLogger(new Logger(Logger.Verbosity.ERROR)),buffer=doc.createBuffer(),scene=doc.createScene('saturn-v');
 doc.getRoot().getAsset().copyright='Original Atlas procedural Apollo 11 AS-506 / CSM-107 / LM-5 reconstruction, repository MIT licence. LM cabin skin, bay and tank-cover facets adapted from NASA/Michael D. Carbajal Apollo Lunar Module, public domain US government work; other shapes original MIT. NASA photographs are reference evidence only; no photographic textures.';
 const bounds:Data={},after:Data={};
 const anchors:Record<string,number[]>={'sic-shell':[0,23.78,5.03],'sii-shell':[0,54.48,5.03],'sivb-shell':[0,78.1,3.31],'f1-outer':[0,2.75,3.8],'j2-outer':[0,44,2.5],'sic-fins':[5.5,6,0],'lm-legs':[0,87.2,3.4],'lm-ladder':[0,87,3.5],'cm-shell':[0,100,1.24],'sm-shell':[1.4,96.25,1.4]};
 const finishes=new Map<string,ReturnType<typeof doc.createMaterial>>();
 for(const [id,g]of Object.entries(models)){
  g.computeBoundingBox();bounds[id]={min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()};
  const metalness=id==='lm-legs'?.84:id==='lm-descent'?.72:id.includes('shell')?.32:.45,roughness=id==='lm-legs'?.31:id==='lm-descent'?.45:.55,key=`${metalness}/${roughness}`;
  let material=finishes.get(key);if(!material){material=doc.createMaterial('plate-hardware').setBaseColorFactor([1,1,1,1]).setMetallicFactor(metalness).setRoughnessFactor(roughness).setDoubleSided(true).setExtras({atlasSurface:true});finishes.set(key,material);}
  const primitive=doc.createPrimitive().setMaterial(material);
  for(const [key,semantic]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]as const){const a=g.getAttribute(key);primitive.setAttribute(semantic,doc.createAccessor().setType('VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));}
  primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(buffer));
  // World-space vertices; pose pivots remain explicitly authored scene points.
  // These nodes contain hollow shells and many separate pieces, not solid
  // volumes. Keep real interior surfaces when PartNode enables cutaway; its
  // closed=true shader would repaint every back face as a cut-face hatch.
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(primitive)).setExtras({closed:false,labelPoint:file.parts.find((p:Data)=>p.id===id)!.primitive.at}));
  const part=file.parts.find((p:Data)=>p.id===id)!;part.mesh=id;part.material={color:'#ffffff'};
  // Existing primitives remain invisible rest envelopes and count metadata.
  part.primitive.color='#ffffff';delete part.primitive.tint;for(const p of part.extra??[]){p.color='#ffffff';delete p.tint;}
  after[id]=g.index!.count/3;g.dispose();
 }
 await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
 await doc.transform(weld(),dedup());
 // The small docking head occupies most of its own close-up. Keep its smooth
 // lathe untouched instead of letting whole-topic simplification facet it.
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){
  if(n.getName()==='cm-probe')continue;
  const retained=new Set(['sic-shell','sii-shell','sivb-shell','sla-shell','sic-fins','lm-ladder']);
  const accessor=p.getAttribute('POSITION')!,min=accessor.getMin([0,0,0]),max=accessor.getMax([0,0,0]);
  const span=Math.max(...max.map((x,i)=>x-min[i]!));
  // Error is normalized by the object's size. Use metric per-feature tolerances
  // so four merged copies do not receive a looser budget than one engine.
  simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:.12,error:retained.has(n.getName())?.0003:(n.getName()==='cm-couches'?.008:new Set(['lm-ascent','lm-descent','lm-legs','les-tower']).has(n.getName())?.005:new Set(['f1-centre','f1-outer','j2-centre','j2-outer','sivb-engine']).has(n.getName())?.0095:.012)/span,lockBorder:true});
 }
 // Protect the smooth target and identifying start spheres independently
 // of the hardware simplification applied to their selectable assemblies.
 const protectedHardware:Record<string,BufferGeometry>={
  'lm-ascent':a11.dockingTarget(),
  'j2-centre':a11.j2StartTank([0,42.5,0]),
  'j2-outer':copies(a11.j2StartTank([0,42.5,0]),2.5),
  'sivb-engine':a11.j2StartTank([0,67.3,0]),
 };
 for(const [id,g]of Object.entries(protectedHardware)){
  const p=doc.getRoot().listNodes().find(n=>n.getName()===id)!.getMesh()!.listPrimitives()[0]!,offset=p.getAttribute('POSITION')!.getCount();
  for(const [key,semantic]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]as const){const accessor=p.getAttribute(semantic)!,old=accessor.getArray()!,added=g.getAttribute(key).array,merged=new Float32Array(old.length+added.length);merged.set(old);merged.set(added,old.length);accessor.setArray(merged);}
  const accessor=p.getIndices()!,old=accessor.getArray()!,extra=g.index!,indices=new Uint32Array(old.length+extra.count);indices.set(old);for(let i=0;i<extra.count;i++)indices[old.length+i]=extra.getX(i)+offset;accessor.setArray(indices);bounds[id]={min:p.getAttribute('POSITION')!.getMin([0,0,0]),max:p.getAttribute('POSITION')!.getMax([0,0,0])};g.dispose();
 }
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:12,quantizeNormal:7,quantizeColor:8}));
 for(const n of doc.getRoot().listNodes()){const p=n.getMesh()?.listPrimitives()[0];if(p)after[n.getName()]=p.getIndices()!.getCount()/3;}
 for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const id=n.getName(),point=anchors[id]??file.parts.find((p:Data)=>p.id===id)!.primitive.at;const local=new Vector3(...point as [number,number,number]).applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()).invert());n.setExtras({...n.getExtras(),labelPoint:local.toArray()});}
 const bytes=compressPosition(await new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder}).writeBinary(doc),12);
 console.log('Mesh counts',Object.fromEntries(Object.entries(after)),Object.values(after).reduce((a:any,b:any)=>a+b,0));
 if(bytes.length>1_500_000)throw new Error(`Saturn mesh ${bytes.length} bytes > 1.5MB`);
 const triangleTotal=Object.entries(before).reduce((n,[id,count])=>n+(after[id]??count),0);
 if(triangleTotal>350_000)throw new Error(`Saturn geometry ${triangleTotal} triangles > 350k`);
 fs.writeFileSync('public/models/saturn-v.glb',bytes);file.model='/models/saturn-v.glb';
 const predecessor=JSON.parse(fs.readFileSync('scripts/geo/saturn-v/round1-audit.json','utf8'));
 const totalBefore=Object.values(before).reduce((a,b)=>a+b,0),totalAfter=Object.entries(before).reduce((a,[id,b])=>a+(after[id]??b),0);
 fs.writeFileSync('scripts/geo/saturn-v/mesh-audit.json',JSON.stringify({before,after,totalBefore,totalAfter,round1:{triangles:predecessor.totalAfter,glbBytes:predecessor.glbAfter,drawCalls:predecessor.callsAfterEstimate,parts:predecessor.after},glbBefore:0,glbAfter:bytes.length,callsBeforeEstimate:original.parts.reduce((n,p)=>n+partMaterialSlots(p).length,0),callsAfterEstimate:file.parts.reduce((n:number,p:Data)=>n+(p.mesh?1:partMaterialSlots(p as any).length),0),bounds},null,2)+'\n');
 console.log(`museum ${totalBefore} → ${totalAfter} triangles; ${bytes.length} byte GLB`);
 // Geometry-only bake: bilingual copy is maintained in the topic data.
}
