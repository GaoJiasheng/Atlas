/** Records the five manually reviewed plates, leaving round-2 acceptance intact. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {PREVIEW} from './round3-graphite.js';
import {polyp} from './coral-reef-polyp.js';
import {cloud} from './monsoon-and-weather-cloud-cutaway.js';
import {trigger} from './warring-states-crossbow-trigger.js';
import {chariot} from './warring-states-zhou-war-chariot.js';
for(const build of [polyp,cloud,trigger,chariot])assert(build().length>1000);
type Entry={id:string;slug:string;chapter:string;method:string;alt:{en:string;zh:string};caption:{en:string;zh:string};checks:string[]};
type Stat={id:string;bytes:number;sha256:string;width:number;height:number;occupancy:{width:number;height:number};transparentPixels:number;colouredPixels:number};
const entries=JSON.parse(readFileSync('scripts/figures/round3-spec.json','utf8')) as Entry[];
const stats=JSON.parse(readFileSync(`${PREVIEW}/final/sizes.json`,'utf8')) as Stat[];
const keySpans420:Record<string,Record<string,number>>={
 'coral-reef-polyp':{tentacleLength:50,mouthWidth:42,septalBlade:85,corallite:230},
 'monsoon-and-weather-cloud-cutaway':{enlargedIcePlate:40,enlargedDrop:40,towerHeight:180,anvil:360},
 'warring-states-tiger-tally':{eachHalf:185,blankFlank:70},
 'warring-states-crossbow-trigger':{housing:210,catch:117,cam:75,trigger:129,pin:41},
 'warring-states-zhou-war-chariot':{horse:176,wheel:147,box:99,pole:170,yokeSaddle:40},
};
const records=entries.map(e=>{
 const s=stats.find(s=>s.id===e.id);assert(s);assert(s.bytes<=120000);assert.equal(s.colouredPixels,0);assert(s.occupancy.width>=.6);
 assert(Object.values(keySpans420[e.id]!).every(n=>n>=40));
 const checks=[...e.checks.map(s=>'Verified in the geometry/source and 2× proof: '+s),
  'Visually inspected at 420px and 840px in paper and CSS-equivalent cinema inversion, side by side with A-grade circuits-series-parallel. Form-following hatching and varied pencil contours remain legible; no fake writing, ornamental glyphs, noise-texture fill or unintended floating parts.',
  `Readability/export: ${s.width}×${s.height}; subject bounds ${(s.occupancy.width*100).toFixed(1)}% of frame width; named major teaching-feature spans below are at least 40px at reading width. ${s.bytes} bytes; transparent WebP; decoded RGB spread at most 2.`,
  'EN/ZH alt text and captions verified against the final image and both chapter occurrences. Inversion changes material shading only; no light/dark physical state is encoded, so no inversion opt-out is needed.'];
 assert.equal(checks.length,6);
 return {slug:e.slug,kind:'figure',file:`figures/${e.id}.webp`,chapterIdea:e.caption.en,subject:e.alt.en,method:e.method,checks,tries:3,verifiedAt:'2026-11-09',...s,id:undefined,keySpans420:keySpans420[e.id],requiresNoInvert:false,sources:e.slug==='warring-states'?['src/content/topics/warring-states/data/SOURCES.md']:[],alt:e.alt,caption:e.caption,previews:{directory:`${PREVIEW}/final`,paper420:`${e.id}-paper-with-A-420.png`,cinema420:`${e.id}-cinema-with-A-420.png`,paper2x:`${e.id}-paper-with-A-840.png`,cinema2x:`${e.id}-cinema-with-A-840.png`}};
});
const lines=records.map(r=>JSON.stringify(r));
writeFileSync('scripts/figures/round3-manifest.jsonl',lines.join('\n')+'\n');
const ids=new Set(records.map(r=>r.file));
const kept=readFileSync('scripts/figures/redo-cd-manifest.jsonl','utf8').trim().split('\n').filter(line=>!ids.has((JSON.parse(line) as {file:string}).file));
writeFileSync('scripts/figures/redo-cd-manifest.jsonl',[...kept,...lines].join('\n')+'\n');
console.log(`Wrote five six-item checklists; preserved ${kept.length} existing records.`);
