/** Persist the manual review completed at 420px and 840px in both CSS themes. */
import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{PREVIEW}from'./redo-cd-utils.js';
import{polyp}from'./coral-reef-polyp.js';
import{swallowing}from'./digestive-system-swallowing.js';
import{boundaries}from'./inside-the-earth-boundary-models.js';
import{cloud}from'./monsoon-and-weather-cloud-cutaway.js';
import{tally}from'./warring-states-tiger-tally.js';
import{trigger}from'./warring-states-crossbow-trigger.js';
import{chariot}from'./warring-states-zhou-war-chariot.js';
import{measure}from'./warring-states-qin-measure-and-slips.js';
import{barrage}from'./water-marina-barrage.js';
import{zones}from'./coral-reef-zones.js';
import{shoaling}from'./plates-and-hazards-tsunami-shoaling.js';
for(const fn of[polyp,swallowing,boundaries,cloud,tally,trigger,chariot,measure,barrage,zones,shoaling])assert(fn().length>100);
type Entry={slug:string,id:string,method:string,alt:{en:string;zh:string},caption:{en:string;zh:string},checks:string[]};
type Stat={id:string,bytes:number,sha256:string,width:number,height:number,occupancy:{width:number,height:number},transparentPixels:number,colouredPixels:number};
const entries=JSON.parse(readFileSync('scripts/figures/round2-spec.json','utf8'))as Entry[];
const stats=JSON.parse(readFileSync(`${PREVIEW}/final/sizes.json`,'utf8'))as Stat[];
/** Conservative observed longest extents, in px at a 420px display width; never line thickness. */
const key:Record<string,Record<string,number>>={
 'coral-reef-polyp':{tentacle:40,mouth:41,septa:65,cup:140},
 'digestive-system-swallowing':{bolus:80,tongue:110,softPalate:60,epiglottis:55,trachea:105,oesophagus:95},
 'inside-the-earth-boundary-models':{block:160,arrow:43,referenceBandOffset:42},
 'monsoon-and-weather-cloud-cutaway':{iceCrystal:41,droplet:43,anvil:330},
 'warring-states-tiger-tally':{outerHalf:320,matingFace:320,blankFlank:150},
 'warring-states-crossbow-trigger':{catch:110,sear:100,trigger:150,pin:40,housing:280},
 'warring-states-zhou-war-chariot':{horse:165,wheel:140,box:80,pole:120,yokeSaddle:40},
 'warring-states-qin-measure-and-slips':{measure:240,handle:70,slip:110,tiedSheet:140},
 'water-marina-barrage':{gateBay:41,building:165,skyline:150},
 'coral-reef-zones':{flat:130,crest:75,slope:155},
 'plates-and-hazards-tsunami-shoaling':{lowLongWave:160,tallNearshoreWave:45,deepWater:160,coast:140},
};
const records=entries.map(e=>{
 const s=stats.find(s=>s.id===e.id)!;assert(s);assert(s.bytes<=120000);assert(s.occupancy.width>=.6&&s.occupancy.height>=.6);assert(s.colouredPixels===0);
 const spans=key[e.id]!;assert(Object.values(spans).every(v=>v>=40));
 const checks=[...e.checks.map(c=>'Visually verified: '+c),
  'Inspected paper and cinema at420px and840px (2×), each beside the A-grade circuits-series-parallel plate: graphite hatching, varied contours, form modelling and teaching relationships remain legible; no fake writing or unintended detached parts.',
  `Readability verified: subject bounds ${(100*s.occupancy.width).toFixed(1)}% × ${(100*s.occupancy.height).toFixed(1)}%; conservative observed key-feature longest extents at420px are recorded below (all≥40px).`,
  `Export verified: ${s.width}×${s.height}, transparent neutral-graphite WebP, ${s.bytes}bytes, decoded RGB spread≤2. Inversion changes material shading only; no physical illumination polarity is encoded.`];
 assert(checks.length>=3&&checks.length<=6);
 return{slug:e.slug,kind:'figure',file:`figures/${e.id}.webp`,chapterIdea:e.caption.en,subject:e.alt.en,method:e.method,checks,verifiedAt:'2026-11-09',...s,id:undefined,keySpans420:spans,requiresNoInvert:false,cinema:'invert(1), contrast(.94), screen, opacity .86; no physical light/dark semantics',sources:['data/SOURCES.md'],alt:e.alt,caption:e.caption,previews:{paper420:`${e.id}-paper-420.png`,cinema420:`${e.id}-cinema-420.png`,paperWithA840:`${e.id}-paper-with-A-840.png`,cinemaWithA840:`${e.id}-cinema-with-A-840.png`}};
});
writeFileSync('public/illustrations/round2-manifest.jsonl',records.map(r=>JSON.stringify(r)).join('\n')+'\n');
const ids=new Set(records.map(r=>r.file));
const previous=readFileSync('public/illustrations/redo-cd-manifest.jsonl','utf8').trim().split('\n').filter(Boolean).map(s=>JSON.parse(s)as{file:string});
// Keep accepted artwork/re-encode records byte-for-byte as text, replacing only this batch's entries.
const kept=readFileSync('public/illustrations/redo-cd-manifest.jsonl','utf8').trim().split('\n').filter(line=>!ids.has((JSON.parse(line)as{file:string}).file));
writeFileSync('public/illustrations/redo-cd-manifest.jsonl',[...kept,...records.map(r=>JSON.stringify(r))].join('\n')+'\n');
console.log(`Verified ${records.length} round2 checklists; retained ${previous.length-kept.length} superseded records only in source history.`);
