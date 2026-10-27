/** Rebuild only chapter frontmatter; keep root-authored MDX bodies byte-for-byte. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spaceChapterState } from '../../../src/engines/space-scene/schema';
const ROOT = process.cwd();
const dir = join(ROOT, 'src/content/topics/container-port/chapters');
const spec = readFileSync(join(ROOT, 'docs/62-container-port-content-spec.md'), 'utf8');
const bi = (en: string, zh: string) => ({ en, zh });
const layers = ['vessel','quay-crane','transfer','yard','trace'];
const defaults = { n20:2,n40:1,'lock-confirmed':true,above:2,'yard-state':'original',cranes:1,carriers:1,yards:1,arrivals:24,hours:2,'lift-live':false };
const cameras = {
  hero:{position:[105,85,115],target:[0,15,5],fov:34},
  box:{position:[30,19,28],target:[0,2,0],fov:32},
  lift:{position:[35,38,45],target:[0,23,-3],fov:32},
  yard:{position:[68,32,72],target:[25,5,43],fov:34},
  network:{position:[105,95,115],target:[0,12,8],fov:36},
  tuas:{position:[105,85,115],target:[0,15,5],fov:34},
};
// Use the model generator’s authored camera coordinates when available.
const partsPath = join(ROOT,'src/content/topics/container-port/data/parts.json');
if (existsSync(partsPath)) {
  const file = JSON.parse(readFileSync(partsPath,'utf8')) as { presets?: {id:string;camera:unknown}[] };
  for (const p of file.presets ?? []) { const key=p.id==='yard-view'?'yard':p.id; if (key in cameras) (cameras as Record<string,unknown>)[key] = p.camera; }
}
const config = [
  {id:'before-you-start',title:bi('A box passing through','经过港口的一只箱'),camera:'hero',pose:'port-source',layers,hide:['sample-20','sample-40','onward-ship','destination-box','yard-target','yard-blocker-a','yard-blocker-b'],part:'working-box',labels:['working-box','ship-hull','portal','agv-body','yard-gantry'],index:['working-box','ship-hull','portal','agv-body','yard-gantry'],changes:[{part:'working-box'},{labels:['ship-hull','portal','agv-body','yard-gantry']},{part:'ship-hull'},{labels:['working-box']}]},
  {id:'boxes-and-teu',title:bi('Boxes and TEU','箱子与标准箱单位'),camera:'box',pose:'box-comparison',layers:['trace'],hide:['working-box','corner-fittings'],part:'sample-20',labels:['sample-20','sample-40'],index:['sample-20','sample-40'],card:{vary:'n40',also:['n20'],observe:['boxes','teu'],record:true},changes:[{part:'sample-20',labels:['sample-20'],sim:{set:{n20:1,n40:0}}},{part:'sample-40',labels:['sample-40'],sim:{set:{n20:0,n40:1}}},{sim:{set:{n20:2,n40:1}}},{sim:{set:{n20:2,n40:1}}},{sim:{set:{n20:2,n40:1}}}]},
  {id:'the-crane-load-path',title:bi('The crane’s load path','岸桥的起吊链'),camera:'lift',pose:'lift-locked',layers:['vessel','quay-crane','transfer','trace'],hide:['sample-20','sample-40','onward-ship','destination-box','ship-cargo'],part:'spreader',labels:['corner-fittings','twistlocks','spreader','trolley','rope-a'],index:['working-box','corner-fittings','twistlocks','spreader','trolley','rope-a','crane-boom','portal'],card:{vary:'lock-confirmed',observe:['lift-status'],replay:['lift-run']},changes:[{pose:'port-source',view:'xray',part:'working-box',labels:['corner-fittings'],camera:{position:[12,19,-5],target:[0,12,-18],fov:32},hide:['sample-20','sample-40','onward-ship','destination-box','ship-cargo','ship-hull','ship-deck','ship-bridge','portal','rail-bogies','crane-rails','crane-boom','agv-body','agv-wheels','control-room']},{pose:'lift-locked',view:'xray',part:'twistlocks'},{pose:'lift-raised',part:'rope-a'},{pose:'lift-crossed',part:'trolley'},{pose:null,run:true,sim:{set:{'lift-live':true}}}]},
  {id:'quay-to-yard',title:bi('From quay to yard','从岸边到堆场'),camera:'yard',pose:'transfer-at-yard',layers:['transfer','yard'],hide:['destination-box','control-room'],part:'yard-target',labels:['agv-body','yard-gantry','yard-target','yard-blocker-a','yard-blocker-b'],index:['agv-body','agv-wheels','yard-gantry','yard-trolley','yard-target','yard-blocker-a','yard-blocker-b','yard-slot'],card:{vary:'above',also:['yard-state'],observe:['rehandles','retrieval-lifts'],record:true},changes:[{part:'agv-body'},{part:'yard-gantry'},{view:'xray',part:'yard-target',sim:{set:{above:2,'yard-state':'original'}}},{sim:{set:{above:2,'yard-state':'cleared'}}},{sim:{set:{above:2,'yard-state':'retrieved'}}}]},
  {id:'an-onward-connection',title:bi('An onward connection','接着乘下一条船'),camera:'network',pose:'port-source',layers,hide:['sample-20','sample-40','yard-target','yard-blocker-a','yard-blocker-b','control-room'],part:'working-box',labels:['working-box','ship-hull','onward-ship','destination-box'],index:['working-box','ship-hull','agv-body','yard-gantry','onward-ship','destination-box'],changes:[{pose:'transfer-on-carrier'},{pose:'transfer-at-yard'},{pose:'transfer-onward',part:'onward-ship'},{pose:'transfer-onward',part:'destination-box',highlight:{signal:['destination-box'],cold:['working-box']}}]},
  {id:'beside-two-straits',title:bi('Beside two straits','两条海峡旁的枢纽'),camera:'network',pose:'port-source',layers:['vessel','quay-crane','transfer'],hide:['onward-ship','destination-box'],part:'ship-hull',labels:['ship-hull','portal','control-room'],index:['ship-hull','portal','control-room'],changes:[{part:'ship-hull'},{},{part:'control-room',labels:['portal','control-room']},{camera:cameras.hero,part:'ship-hull'}]},
  {id:'the-tuas-transition',title:bi('The Tuas transition','转向大士港口'),camera:'tuas',pose:'tuas-context',layers:['vessel','quay-crane','transfer','yard'],hide:['onward-ship','destination-box','yard-target','yard-blocker-a','yard-blocker-b'],part:'agv-body',labels:['portal','agv-body','yard-gantry','control-room'],index:['portal','agv-body','yard-gantry','control-room'],changes:[{},{},{part:'control-room',labels:['agv-body','yard-gantry','control-room']},{}]},
  {id:'keeping-the-chain-moving',title:bi('Keeping the chain moving','让整条链保持畅通'),camera:'hero',pose:'port-source',layers:['quay-crane','transfer','yard'],hide:['destination-box','control-room','yard-target','yard-blocker-a','yard-blocker-b'],part:'portal',labels:['portal','agv-body','yard-gantry'],index:['portal','agv-body','yard-gantry'],card:{vary:'cranes',also:['carriers','yards'],keep:['arrivals','hours'],observe:['capacity-rate','queued','bottleneck'],record:{chart:{y:'capacity-rate'}},predict:{start:{cranes:1,carriers:1,yards:1},change:{cranes:2},observe:'capacity-rate',options:[{id:'unchanged',means:'same',label:bi('Same','不变')},{id:'higher',means:'more',label:bi('Higher','增加')}],prompt:bi('Will another crane increase this chain’s capacity?','多一台岸桥会增加这条链的能力吗？')}},changes:[{sim:{set:{cranes:1,carriers:1,yards:1}}},{part:'yard-gantry'},{sim:{set:{cranes:2,carriers:1,yards:1}}},{sim:{set:{cranes:1,carriers:1,yards:2}}},{sim:{set:{cranes:1,carriers:1,yards:2}}}]},
] as const;
mkdirSync(dir,{recursive:true});
const evidence: unknown[] = [];
let count=0;
for (const [order,c] of config.entries()) {
  const section = spec.split(new RegExp(`### 2\\.${order+1} `))[1]?.split('\n### ')[0];
  if (!section) throw new Error(`Missing spec chapter ${c.id}`);
  const prose = section.match(/\*\*问题\*\* ZH (.*?) \/ EN (.*?) \*\*summary\*\* ZH (.*?) \/ EN (.*?) \[/);
  if (!prose) throw new Error(`Missing question/summary ${c.id}`);
  const rows = section.split('\n').filter((row)=>/^\| 0\d-\d \|/.test(row)).map((row)=>row.split('|').slice(1,-1));
  if (rows.length!==c.changes.length) throw new Error(`Beat count mismatch ${c.id}`);
  const beats=rows.map((row,i)=>{ count++; evidence.push({chapter:c.id,beat:i+1,facts:row[4]!.replace(/\s*\|$/,'').trim().split(','),caption:bi(row[3]!.trim(),row[2]!.trim())});return {...c.changes[i],caption:bi(row[3]!.trim(),row[2]!.trim())}; });
  const state = {view:'assembled',explode:0,cutaway:'none',run:false,pose:c.pose,camera:cameras[c.camera],layers:[...c.layers],hide:[...c.hide],part:c.part,labels:[...c.labels],question:bi(prose[2]!,prose[1]!),summary:bi(prose[4]!,prose[3]!),index:{parts:[...c.index]},sim:{set:{...defaults},...('card' in c ? {try:c.card} : {})},beats};
  spaceChapterState.parse(state);
  const header={id:c.id,order,title:c.title,...(order===0?{kind:'background'}:{}),state};
  const path=join(dir,`${String(order).padStart(2,'0')}-${c.id}.mdx`);
  const existing=existsSync(path)?readFileSync(path,'utf8'):'';
  const body=existing.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/,'');
  writeFileSync(path,`---\n${JSON.stringify(header,null,2)}\n---\n${body}`);
}
if(count!==36) throw new Error(`Expected 36 beats, got ${count}`);
// Evidence is editorial data, not an unsupported beat property.
writeFileSync(join(ROOT,'scripts/geo/container-port/captions.json'),JSON.stringify({spec:'docs/62-container-port-content-spec.md',captions:evidence},null,2)+'\n');
console.log(`container-port: ${config.length} chapter headers, ${count} bilingual beats; bodies preserved`);
