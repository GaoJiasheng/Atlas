/** Static triangle totals use runtime visibility, including ghosted objects.
 * No GPU/FPS claim. pnpm tsx ... [parts file] [report file] */
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {parse} from 'yaml';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {resolveAllPartDisplays} from '../../../src/engines/space-scene/lib/visibility';
import {simEffects} from '../../../src/engines/space-scene/lib/sim/bind';
import {evaluateSim} from '../../../src/engines/space-scene/lib/sim';
import {resolveSimValues} from '../../../src/engines/space-scene/lib/sim/controls';
const data=partsFile.parse(JSON.parse(readFileSync(process.argv[2]??'src/content/topics/bones-and-joints/data/parts.json','utf8')));
const bytes=readFileSync('public'+data.model!);const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
const counts:Record<string,number>={};
for(const p of data.parts){
 if(p.mesh){const node=gltf.nodes.find((n:{name:string})=>n.name===p.mesh);counts[p.id]=gltf.meshes[node.mesh].primitives.reduce((n:number,p:{indices:number})=>n+gltf.accessors[p.indices].count/3,0);}
 else {const pieces=partPieces(p);counts[p.id]=pieces.reduce((n,p)=>n+(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1),0);pieces.forEach(p=>p.geometry.dispose());}
}
const root='src/content/topics/bones-and-joints/chapters',beats=[];
for(const name of readdirSync(root).filter(n=>n.endsWith('.mdx'))){
 const ch=parse(readFileSync(`${root}/${name}`,'utf8').split('---')[1]!);
 for(let i=0;i<ch.state.beats.length;i++){
  const state={...ch.state,...ch.state.beats[i]},values=resolveSimValues(data.sim!,state.sim?.set??{});
  const hidden=new Set([...(state.hide??[]),...simEffects(data.sim!,values,evaluateSim(data.sim!,values)).hidden]);
  const shown=resolveAllPartDisplays(data.parts,{view:state.view,part:state.part??null,layers:state.layers,hidden:[...hidden],ghosted:state.ghost});
  const visible=data.parts.filter(p=>shown.get(p.id)?.visible).map(p=>p.id);
  beats.push({chapter:ch.id,beat:i+1,triangles:visible.reduce((n,id)=>n+counts[id]!,0)});
 }
}
const sum=(ids:string[])=>ids.reduce((n,id)=>n+(counts[id]??0),0);
const report={parts:counts,bone:sum(['bone-cortex','bone-lattice','bone-marrow','bone-vessel']),growth:sum(['bone-cortex','bone-lattice','bone-marrow','bone-vessel','growth-plate']),repair:sum(['repair-stage-clot','repair-stage-soft','repair-stage-hard','repair-stage-remodelled','repair-clot-skin','repair-soft-skin']),joint:sum(['joint-cartilage-a','joint-cartilage-b','joint-capsule','joint-ligament']),maxBeat:beats.reduce((a,b)=>a.triangles>b.triangles?a:b),beats};
if(report.maxBeat.triangles>350_000)throw Error(`Visible beat over 350k: ${JSON.stringify(report.maxBeat)}`);
writeFileSync(process.argv[3]??'/tmp/bones-polish/counts-after.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,parts:undefined,beats:undefined}));
