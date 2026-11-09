/** Human review record + reproducible export checks. Review date records the actual
 * 420px and 840px inspection, not a claim that running this script performs visual QA.
 * Run after redo-cd-review.ts; output is the requested per-image JSONL checklist.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { PREVIEW } from './redo-cd-utils.js';
import { tally } from './warring-states-tiger-tally.js';
import { trigger } from './warring-states-crossbow-trigger.js';
import { chariot } from './warring-states-zhou-war-chariot.js';
import { measure } from './warring-states-qin-measure-and-slips.js';
import { polyp } from './coral-reef-polyp.js';
import { zones } from './coral-reef-zones.js';
import { boundaries } from './inside-the-earth-boundary-models.js';
import { shoaling } from './plates-and-hazards-tsunami-shoaling.js';
import { swallowing } from './digestive-system-swallowing.js';
import { cloud } from './monsoon-and-weather-cloud-cutaway.js';
import { barrage } from './water-marina-barrage.js';
// Importing and executing every geometry function runs its teaching assertions.
for (const draw of [tally,trigger,chariot,measure,polyp,zones,boundaries,shoaling,swallowing,cloud,barrage]) assert(draw().length>100);
type Entry={slug:string;id:string;method:string;subject:string;checks:string[];keySpans:Record<string,number>;sources?:string[]};
const trace='PD trace + asserted SVG/graphite.ts';
const code='Asserted SVG/graphite.ts';
const ai='AI graphite drawing + illustrate.ts raster pipeline';
const recompress='Re-encode existing drawing, unchanged composition';
const entries:Entry[]=[
 {slug:'warring-states',id:'warring-states-tiger-tally',method:trace,subject:'Two longitudinal halves of one crouching-tiger tally',keySpans:{flank:270,cutFace:270},sources:['src/content/topics/warring-states/data/SOURCES.md'],checks:[
  'Counted two matching longitudinal half-profiles, each with one flank and two legs; the lower half has a flat hatched mating face.',
  'Compared the outer silhouette with Gary Todd’s CC0 Qin tally photograph; both halves use the same traced contour.',
  'Inspected both blank inscription fields: no glyphs, pseudo-writing, teeth or invented eye.']},
 {slug:'warring-states',id:'warring-states-crossbow-trigger',method:trace,subject:'Opened housing and three-member release train with two drawn-out pins',keySpans:{catch:96,sear:78,trigger:157,pins:46},sources:['src/content/topics/warring-states/data/SOURCES.md'],checks:[
  'Counted one integrated sight/catch, one sear, one long trigger and two assembly pins; no comb-shaped member.',
  'Followed the trigger → sear → catch contacts and release arrows; guide lines align both removed pins with their pivot bores.',
  'Compared external catch/trigger contours with the CC0 reference; exposed housing/contact geometry is explicitly a teaching construction.']},
 {slug:'warring-states',id:'warring-states-zhou-war-chariot',method:trace,subject:'Unhitched single-pole chariot structure',keySpans:{box:149,pole:231,yokes:44,wheels:164},sources:['src/content/topics/warring-states/data/SOURCES.md'],checks:[
  'Counted two wheels, one continuous curved centre pole, one transverse crossbar and two attached neck saddles.',
  'Counted 24 constructed spokes per wheel, checked long hubs and axle centred beneath the low near-square carriage.',
  'Compared structure with Philg88’s CC0 diagram; no horses, modern bridle, breast collar or traces are depicted.']},
 {slug:'warring-states',id:'warring-states-qin-measure-and-slips',method:trace,subject:'Open bronze measure and blank tied bamboo slips',keySpans:{measure:250,handle:70,slips:100},sources:['src/content/topics/warring-states/data/SOURCES.md'],checks:[
  'Checked one shallow rectangular cavity, thick continuous rim and one hollow handle against the CC0 measure reference.',
  'Counted ten continuous bamboo strips joined by two cords.',
  'Inspected the measure band and every slip at 840px: no characters, inscriptions or pseudo-writing.']},
 {slug:'coral-reef',id:'coral-reef-polyp',method:code,subject:'Oblique coral-polyp cutaway',keySpans:{tentacles:60,mouth:46.9,pharynx:65,cup:150,septa:81},checks:[
  'Counted twelve distinct attached tentacles around one oral disc and one small horizontal oval mouth; no pupil, iris or eye-like slit.',
  'Checked the oblique open front exposes a continuous gastric space, pharynx, soft wall and thick sectioned skeletal cup.',
  'Counted six visible septa attached inside the cup; section hatching separates the cut wall from the cavity.']},
 {slug:'coral-reef',id:'coral-reef-zones',method:code,subject:'Reef flat, crest and slope beneath a sea-surface line',keySpans:{flat:127,crest:75,slope:157},checks:[
  'Followed a horizontal sea surface above a shallow flat, raised wave-washed crest and deepening reef slope.',
  'Counted three bracketed zones separated by two dashed guides; the crest remains at/below the sea surface.',
  'Checked greater depth on the right and an uninterrupted reef section; no porous block obscures the profile.']},
 {slug:'inside-the-earth',id:'inside-the-earth-boundary-models',method:code,subject:'Spreading, subduction and transform motion',keySpans:{spreading:353,slab:280,transform:350,markerOffset:42},checks:[
  'Checked opposed outward arrows around a rift and rising material, with no flame-like spray.',
  'Followed the oceanic slab below the opposing plate; convergence arrows face each other.',
  'Checked transform arrows are opposite and parallel to the fault; the same reference band is offset 42px at 420px width.']},
 {slug:'plates-and-hazards',id:'plates-and-hazards-tsunami-shoaling',method:code,subject:'Qualitative tsunami shoaling towards a coast',keySpans:{longWave:199,nearshoreWave:42,deepWater:140,coast:204},checks:[
  'Followed low long waves over deep water becoming taller and closer together towards the shore.',
  'Checked a continuous rising seabed, dry coast and dashed still-water level; troughs remain above the bed.',
  'Ran shallow-water scaling assertions: depth decreases, amplitude grows and wavelength shortens; caption states vertical exaggeration.']},
 {slug:'singapore-1819-1965',id:'singapore-1819-1965-rubber-and-tin',method:ai,subject:'Rubber tapping, rubber sheets and tin ingot',keySpans:{cut:156,spoutToCupPath:60,cup:100,knife:170,sheets:112,ingot:170},checks:[
  'Counted one narrow sloping tapping cut in vertically furrowed bark, one spout and a continuous latex path to one attached cup; no floral or feather pattern.',
  'Counted one curved tapping knife, two hanging rubber sheets and one plain tin ingot.',
  'Inspected all objects for fake writing, detached tree parts and AI ornament; no characters, inscriptions or zigzag break lines.']},
 {slug:'digestive-system',id:'digestive-system-swallowing',method:code,subject:'Sagittal swallowing section',keySpans:{bolus:47.6,tongue:143,softPalate:160,epiglottis:61.6,airway:96,gullet:116},checks:[
  'Checked one large food bolus follows the posterior passage into the gullet behind the ringed windpipe.',
  'Checked the raised soft palate closes the nasal passage; the folded epiglottis covers the laryngeal inlet and remains attached by a continuous stalk.',
  'Checked the tongue pushes backwards, incisors stay inside the lips and the external neck contour is smooth with no exposed spines.']},
 {slug:'monsoon-and-weather',id:'monsoon-and-weather-cloud-cutaway',method:code,subject:'Enlarged ice crystals and liquid drops in a storm cloud',keySpans:{ice:42,drops:40.6,cloud:329},checks:[
  'Counted six enlarged hexagonal ice crystals wholly above the dashed freezing-level guide.',
  'Counted six round liquid drops wholly below the guide; checked separate rain streaks beneath the base.',
  'Checked the broad anvil top and open section remain legible; particle shapes carry phase meaning in both themes.']},
 {slug:'water',id:'water-marina-barrage',method:trace,subject:'Low nine-gate barrage with a lowered crest-gate section',keySpans:{gateBays:40.6,pumpBuilding:192,gateSection:130},sources:['src/content/topics/water/data/SOURCES.md'],checks:[
  'Compared the sea-side curved overhang, glazing, open columns and landscaped ramp with Stockvault’s CC0 photograph.',
  'Counted nine broad low steel gate bays; checked the low continuous deck, with no high spillway or waterfall.',
  'Followed shallow water over the hinged lowered crest in the enlarged section; photograph adaptation and constructed section are distinguished in both captions.']},
 {slug:'energy-conversion',id:'energy-conversion@2x',method:ai,subject:'One intact building with roof solar array, lift and fan',keySpans:{solarArray:294,lift:79,fan:95},checks:[
  'Counted one intact two-storey building with connected floors/columns, one roof solar array, one lift car and one large fan.',
  'Checked the solar array, lift and fan each exceed 40px at a 420px cover width; no zigzag floor breaks or floating storey.',
  'Inspected the final sun-removal edit: no solar disc, rays, text, characters or inscriptions; inversion changes material shading only.']},
 {slug:'fossils-and-skeletons',id:'fossils-and-skeletons-fossilisation',method:recompress,subject:'Existing three-bed fossilisation section',keySpans:{bone:300,beds:323},checks:[
  'Compared original and re-encoded drawing at 420px and 840px: three continuous sediment beds and two interfaces remain clear.',
  'Checked one porous long bone stays wholly in the middle bed, with both expanded ends and mineral-filled interior visible.',
  'Checked fine pore and sediment detail against the original; endpoint alpha normalization and the WebP drawing preset preserve the grain without a blur prefilter.']},
 {slug:'inside-the-earth',id:'inside-the-earth-magma-cutaway',method:recompress,subject:'Existing volcano and magma-chamber section',keySpans:{chamber:120,conduit:100,section:369},checks:[
  'Compared original and re-encoded drawing at 420px and 840px; crater, central conduit and connected magma chamber remain clear.',
  'Checked the strata, rock texture and continuous cut faces against the original without composition or geometry changes.',
  'Checked both themes for retained chamber, conduit and section contrast; no visible compression loss at review sizes.']},
 {slug:'space-race',id:'space-race-lunokhod',method:recompress,subject:'Existing exploded Lunokhod drawing',keySpans:{body:180,lid:100,wheels:54},checks:[
  'Counted eight wheels in two rows of four; compared their tread and hub detail before/after at 420px and 840px.',
  'Checked the raised lid, antennae, body and axles retain their original placement and silhouettes.',
  'Checked both themes for retained wheel/body separation and graphite detail; no visible compression loss at review sizes.']},
 {slug:'flower-and-seed',id:'flower-and-seed-bee-pollination',method:recompress,subject:'Existing bee visiting a flower',keySpans:{bee:180,flower:230},checks:[
  'Compared original and re-encoded drawing at 420px and 840px; bee, anthers, flower and leaves retain their original placement.',
  'Checked pollen grains, bee hair, wing veins and flower contours remain readable in both themes.',
  'Checked graphite textures and edge alpha against the original; no visible compression loss at review sizes.']},
];
const stats=JSON.parse(readFileSync(`${PREVIEW}/final/sizes.json`,'utf8')) as {id:string;bytes:number;width:number;height:number;occupancy:{width:number;height:number}}[];
const captions=JSON.parse(readFileSync(`${PREVIEW}/captions.json`,'utf8')) as Record<string,string[]>;
const records=[];
for (const e of entries) {
 const cover=e.id.endsWith('@2x'), relative=`${cover?'':'figures/'}${e.id}.webp`, file=`public/illustrations/${relative}`;
 const bytes=readFileSync(file), report=stats.find(x=>x.id===(cover?e.id:`figures/${e.id}`))!;
 assert.equal(bytes.length,report.bytes);assert(report.occupancy.width>=.6&&report.occupancy.height>=.6);
 assert(Object.values(e.keySpans).every(n=>n>=40),`${e.id}: a key teaching feature is below 40px`);
 assert(bytes.length<=(cover?260*1024:120000));
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,cover?1600:1200);assert.equal(info.height,cover?1600:900);
 let transparent=0,coloured=0;
 for(let i=0;i<data.length;i+=4){if(data[i+3]===0)transparent++;if(data[i+3]&&Math.max(data[i]!,data[i+1]!,data[i+2]!)-Math.min(data[i]!,data[i+1]!,data[i+2]!)>2)coloured++;}
 assert(transparent>0);assert.equal(coloured,0);
 const name=e.id, checks=[...e.checks,
  'Visually reviewed paper and cinema composites at 420px and 840px (2× display zoom) on 2026-11-09; contours, material hatching and teaching relationships remain readable.',
  `Readability: alpha bounds ${(report.occupancy.width*100).toFixed(1)}% × ${(report.occupancy.height*100).toFixed(1)}% of frame; each listed key teaching feature has a projected longest extent ≥40px at 420px (conservative lower bounds in keySpans420).`,
  `Export verified: ${info.width}×${info.height}, transparent WebP, decoded RGB channel spread ≤2, ${bytes.length} bytes; inspected for fake writing and unwanted detached parts.`];
 assert(checks.length>=3&&checks.length<=6);
 const cap=captions[e.id];
 const variants=[];
 if(cover)for(const [suffix,width,budget]of [['',800,90*1024],['@2x',1600,260*1024]] as const){
  const name=`energy-conversion${suffix}.webp`,v=readFileSync(`public/illustrations/${name}`);
  const meta=await sharp(v).metadata();
  assert.equal(meta.width,width);assert.equal(meta.height,width);assert(meta.hasAlpha);assert(v.length<=budget);
  variants.push({file:name,width,height:width,bytes:v.length,sha256:createHash('sha256').update(v).digest('hex')});
 }
 records.push({slug:e.slug,kind:cover?'cover':'figure',file:relative,chapterIdea:e.subject,subject:e.subject,method:e.method,checks,verifiedAt:'2026-11-09',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,width:info.width,height:info.height,variants:cover?variants:undefined,occupancy:report.occupancy,keySpans420:e.keySpans,cinema:'invert; no physical illumination polarity is encoded',requiresNoInvert:false,sources:e.sources,alt:cap?{en:cap[0],zh:cap[1]}:cover?{en:'Graphite cutaway of one intact two-storey apartment building with a roof solar array, one lift car and one large fan.',zh:'一座完整双层住宅的石墨剖面：屋顶有太阳能板，右侧有一辆升降机，下层有一台大电扇。'}:undefined,caption:cap?{en:cap[2],zh:cap[3]}:cover?{en:'Solar panels convert light into electrical energy; the lift and fan convert electrical energy into motion.',zh:'太阳能板把光能转换成电能；升降机和电扇把电能转换成运动。'}:undefined,previews:{paper420:`${name}-paper-420.png`,cinema420:`${name}-cinema-420.png`,both840:`${name}-themes-840.png`}});
}
writeFileSync('scripts/figures/redo-cd-manifest.jsonl',records.map(r=>JSON.stringify(r)).join('\n')+'\n');
const deleted=['b200-cpu-tray','b200-power','plant-chilli-life-cycle','plant-leaf-cross-section','plant-stoma','water-johor-river'];
for(const id of deleted)assert(!existsSync(`public/illustrations/figures/${id}.webp`));
writeFileSync('scripts/figures/redo-cd-unused.json',JSON.stringify({verifiedAt:'2026-11-09',deleted:deleted.map(id=>({id,reason:id.startsWith('b200')?'No content reference; the published chapter already uses the rack, module and airflow figures.':id.startsWith('plant')?'No content reference; current plant chapters already have topic-specific figures.':'No content reference; the water-supply lesson uses its existing map and treatment figures.'})),skipped:[{id:'b200-gpu-tray',reason:'Present but unreferenced; brief explicitly assigns a redraw only if present AND referenced.'}]},null,2)+'\n');
console.log(`Verified ${records.length} image records, six checks each; six unused assets deleted; GPU tray skipped.`);
