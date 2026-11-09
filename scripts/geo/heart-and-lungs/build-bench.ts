/** pnpm tsx scripts/geo/heart-and-lungs/build-bench.ts [round]
 * Append the museum bench to a new container. Accepted anatomy is untouched. */
import fs from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld,dedup} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {Color} from 'three';
import {pathToFileURL} from 'node:url';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {fishSculpt,gillSculpt,coverSculpt,plantSculpt,tubeSculpt,soilSculpt,SCULPT_FACTS} from './sculpt-bench';
import {appendGlb,unpack} from './append-glb';
import {fishTank} from './bench';
export async function buildBench(round=15){
const out=`/tmp/atlas-heart-round3/round${round}`;fs.mkdirSync(out,{recursive:true});
const file='src/content/topics/heart-and-lungs/data/parts.json';
// Preserve accepted primitive tessellation too: shared specimen-kit defaults
// evolved since this topic was published. Rebuilding must not change its gas
// balls, jar, table or pot while sculpting the four flagged objects.
const parts=JSON.parse(fs.readFileSync('scripts/geo/heart-and-lungs/baseline-parts.json','utf8'));
const tank=fishTank();Object.assign(parts.parts.find((p:any)=>p.id==='fish-tank'),{primitive:tank.primitive,extra:tank.extra});
const gill=parts.parts.find((p:any)=>p.id==='gills');gill.detail.en=gill.detail.en.replace('one row of filaments each','two rows of filaments on each arch');gill.detail.zh=gill.detail.zh.replace('每道一排鳃丝','每道两排鳃丝');
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('bench-sculpture');
const tokenCSS=fs.readFileSync('src/theme/tokens.css','utf8'),at=tokenCSS.indexOf(':root[data-theme="paper"] {'),css=tokenCSS.slice(at,tokenCSS.indexOf('\n}',at));
const tokens=Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));
const palette=(g:any,token:string)=>{const base=new Color(tokens[token]),bone=new Color(tokens.bone),a=g.getAttribute('color');for(let i=0;i<a.count;i++)a.setXYZ(i,a.getX(i)*base.r/bone.r,a.getY(i)*base.g/bone.g,a.getZ(i)*base.b/bone.b);return g;};
const plant=plantSculpt(),water=tubeSculpt('water'),food=tubeSculpt('food'),soil=soilSculpt();
// All pigment samples derive from the actual technical-plate token table.
// Shared token:bone multiply keeps the whole mesh responsive to plate theme.
for(const [g,t] of [[plant,'seedling'],[water,'cold'],[food,'food'],[soil,'neutral']] as const)palette(g,t);
const plantMesh=mergeGeometries([plant,water,food,soil],false)!;
const meshes={'fish-body':fishSculpt(),'gills':gillSculpt(),'gill-cover':coverSculpt(),'plant-specimen':plantMesh};
const stats:Record<string,unknown>={};
for(const [id,g] of Object.entries(meshes)){
 const m=doc.createMesh(id),p=doc.createPrimitive();
 for(const [from,to] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']] as const){const a=g.getAttribute(from);p.setAttribute(to,doc.createAccessor().setType('VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));}
 p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(buffer));
 const mat=doc.createMaterial(id+'-surface').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(id==='fish-body'?.57:id==='gill-cover'?.57:.58).setMetallicFactor(0).setExtras({atlasSurface:true});p.setMaterial(mat);m.addPrimitive(p);scene.addChild(doc.createNode(id).setMesh(m).setExtras({closed:true}));
 stats[id]={triangles:g.index!.count/3,drawCalls:1};
 const part=parts.parts.find((p:any)=>p.id===id);delete part.primitive;delete part.extra;part.mesh=id;part.material={color:'tissue',tint:`token:${id==='gills'?'blood-poor':id==='plant-specimen'?'bone':'neutral'}`};
 g.dispose();
}
await doc.transform(weld(),dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12,quantizeColor:12}));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const sculpt=Buffer.from(await io.writeBinary(doc));if(sculpt.length>1_500_000)throw new Error('Sculpt payload exceeds 1.5 MB');
const original=fs.readFileSync('public/models/heart-and-lungs.glb'),combined=appendGlb(original,sculpt);
if(!unpack(combined).bin.subarray(0,unpack(original).bin.length).equals(unpack(original).bin))throw new Error('Inherited anatomy binary changed');
fs.writeFileSync(`${out}/heart-and-lungs-sculpt.glb`,sculpt);fs.writeFileSync('public/models/heart-and-lungs-bench.glb',combined);parts.model='/models/heart-and-lungs-bench.glb';fs.writeFileSync(file,JSON.stringify(parts,null,1)+'\n');fs.writeFileSync(`${out}/parts.json`,JSON.stringify(parts,null,1)+'\n');
fs.writeFileSync(`${out}/stats.json`,JSON.stringify({round,parts:stats,sculptBytes:sculpt.length,originalBytes:original.length,combinedBytes:combined.length,facts:SCULPT_FACTS},null,2)+'\n');console.log(JSON.stringify({round,parts:stats,sculptBytes:sculpt.length,combinedBytes:combined.length}));

}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await buildBench(Number(process.argv[2]??15));
