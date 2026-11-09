/** pnpm tsx scripts/geo/digestive-system/rebuild.ts
 * Original anatomy BIN bytes are retained, independently compressed additions
 * are appended. Rebuilding never uses the previous composite as input.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { Document, NodeIO, type Extension } from '@gltf-transform/core';
import { meshopt, weld, dedup } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { BufferAttribute, BufferGeometryLoader, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { tooth, stomach, villiBlock, villiField, type V3 } from './sculpt';
import { appendGlb, unpackGlb } from './append-glb';
import {anatomySource} from './anatomy-source';
const root='src/content/topics/digestive-system',original=anatomySource();
const packet=new Document(),buffer=packet.createBuffer(),scene=packet.createScene('digestive-system-sculptures');
packet.getRoot().getAsset().copyright='Original Atlas procedural digestive close-ups, CC0-1.0. Reference morphology: OpenStax Anatomy and Physiology, Gray Anatomy and Commons photographs. No third-party mesh or image texture.';
const counts:Record<string,unknown>={};
await MeshoptSimplifier.ready;
const plans=[
 {id:'tooth-section',build:tooth,budget:49000,error:.00012,roughness:.50,label:[.485,.030,.050] as V3},
 {id:'stomach-wall',build:stomach,budget:23000,error:.00010,roughness:.68,label:[.720,.015,.074] as V3},
 {id:'villi-block',build:villiBlock,budget:14500,error:.00004,roughness:.64,label:[.941,.058,.101] as V3},
 {id:'villi-field',build:villiField,budget:25000,error:.00022,roughness:.64,label:[.920,.060,.050] as V3},
];
for(const plan of plans){
 const cache='/tmp/atlas-digestive-rebuild/geometry-cache';fs.mkdirSync(cache,{recursive:true});
 const digest=createHash('sha256').update(fs.readFileSync('scripts/geo/digestive-system/sculpt.ts')).update(fs.readFileSync('scripts/geo/digestive-system/tooth-finish.ts')).digest('hex').slice(0,12),cached=`${cache}/${plan.id}-${digest}.json`;
 const g=fs.existsSync(cached)?new BufferGeometryLoader().parse(JSON.parse(fs.readFileSync(cached,'utf8'))):plan.build();
 if(!fs.existsSync(cached))fs.writeFileSync(cached,JSON.stringify(g.toJSON()));
 const before=g.index!.count/3,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),cs=g.getAttribute('color');
 const attr=new Float32Array(ps.count*6);for(let i=0;i<ps.count;i++)attr.set([ns.getX(i),ns.getY(i),ns.getZ(i),cs.getX(i),cs.getY(i),cs.getZ(i)],i*6);
 const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(g.index!.array),new Float32Array(ps.array),3,attr,6,[.0005,.0005,.0005,.004,.004,.004],null,Math.min(g.index!.count,plan.budget*3),plan.error,['LockBorder','ErrorAbsolute']);
 g.setIndex(new BufferAttribute(indices,1));
 const target=new Vector3(...plan.label);
 const origin=target.clone().add(new Vector3(0,.008,.3));
 const material=new MeshBasicMaterial(),surface=new Mesh(g,material);surface.updateMatrixWorld();
 const hit=new Raycaster(origin,target.clone().sub(origin).normalize()).intersectObject(surface,false)[0];
 if(!hit)throw new Error(`${plan.id}: label ray missed the actual sculpture`);
 const label=hit.point.toArray();material.dispose();
 const prim=packet.createPrimitive();
 for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']] as const){const a=g.getAttribute(name);prim.setAttribute(semantic,packet.createAccessor().setType('VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));}
 prim.setIndices(packet.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));
 prim.setMaterial(packet.createMaterial(plan.id).setBaseColorFactor([1,1,1,1]).setRoughnessFactor(plan.roughness).setMetallicFactor(0).setExtras({atlasSurface:true}));
 scene.addChild(packet.createNode(plan.id).setMesh(packet.createMesh(plan.id).addPrimitive(prim)).setExtras({closed:false,labelPoint:label,anatomy:'Original procedural teaching sculpture',sourceTriangles:before}));
 counts[plan.id]={sourceTriangles:before,triangles:indices.length/3,simplificationError:error,drawCalls:1};g.dispose();console.log(plan.id,counts[plan.id]);
}
await MeshoptEncoder.ready;
await packet.transform(weld(),dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeColor:10}));
// meshopt introduces a node-local quantization transform. Convert the leader
// point through its inverse so it remains on the authored physical surface.
for(const n of packet.getRoot().listNodes()){
 const label=n.getExtras().labelPoint as V3|undefined;if(!label)continue;
 const m=new Matrix4().fromArray(n.getWorldMatrix()).invert(),v=[...label,1];
 const e=m.elements;const out=[0,1,2].map(k=>e[k]!*v[0]!+e[k+4]!*v[1]!+e[k+8]!*v[2]!+e[k+12]!);
 n.setExtras({...n.getExtras(),labelPoint:out});
}
const ext=packet.getRoot().listExtensionsUsed().map(e=>e.constructor as unknown as typeof Extension);
const sculpt=Buffer.from(await new NodeIO().registerExtensions(ext).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(packet));
if(sculpt.length>1_500_000)throw new Error(`Sculpt additions exceed 1.5 MB: ${sculpt.length}`);
const combined=appendGlb(original,sculpt),out='public/models/digestive-system.glb';fs.writeFileSync(out,combined);
const file=JSON.parse(fs.readFileSync(`${root}/data/parts.json`,'utf8'));
for(const plan of plans){const part=file.parts.find((p:any)=>p.id===plan.id);delete part.primitive;delete part.extra;part.mesh=plan.id;part.material={color:'tissue',tint:'token:bone'};}
file.model='/models/digestive-system.glb';
const part=file.parts.find((p:any)=>p.id==='tooth-section');
part.detail.en=part.detail.en.replace('A back tooth has two or three roots; the diagram shows one.','This lower molar has two unequal roots, with a pulp canal running into each.');
part.detail.zh=part.detail.zh.replace('后牙有两到三个牙根，图里只画了一个。','这颗下磨牙有两个不等大的牙根，各有一条牙髓管通入。');
const field=file.parts.find((p:any)=>p.id==='villi-field');
field.detail.en=field.detail.en.replace('The patch is a teaching diagram: real villi stand closer together [S1].','The patch is a teaching diagram; the place and shape of each villus were worked out for this drawing and not measured under a microscope [S1].');
field.detail.zh=field.detail.zh.replace('这是教学示意，真实的绒毛排得更密 [S1]。','这块内壁是教学示意，每根绒毛的位置和形状是为这幅图推算的，不是在显微镜下量出来的 [S1]。');
fs.writeFileSync(`${root}/data/parts.json`,JSON.stringify(file,null,2)+'\n');
const orig=unpackGlb(original),merged=unpackGlb(combined),sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
if(!orig.bin.equals(merged.bin.subarray(0,orig.bin.length)))throw new Error('Original anatomy BIN changed');
for(const k of ['accessors','bufferViews','meshes','nodes','materials'])for(let i=0;i<(orig.json[k]?.length??0);i++)if(JSON.stringify(orig.json[k][i])!==JSON.stringify(merged.json[k][i]))throw new Error(`Original ${k}[${i}] changed`);
const metrics={counts,originalGlbBytes:original.length,protectedAnatomyBinBytes:orig.bin.length,sculptPacketBytes:sculpt.length,combinedGlbBytes:combined.length,originalBinSha256:sha(orig.bin),combinedOriginalBinSha256:sha(merged.bin.subarray(0,orig.bin.length)),anatomyUnchanged:true};
fs.writeFileSync('scripts/geo/digestive-system/rebuild-metrics.json',JSON.stringify(metrics,null,2)+'\n');console.log(metrics);
