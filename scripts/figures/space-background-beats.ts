/** PD profile-guided graphite drawings → metric comparison and complete R-7 study.
 * Run: pnpm tsx scripts/figures/space-background-beats.ts
 * Geometry sources and limits are recorded in the topic's SOURCES.md.
 */
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { PRE, plate, save, specimen } from './space-plate';
const ppm=25,base=820,lengths=[21.2,29.2] as const;
const heights=lengths.map(m=>Math.round(m*ppm));
assert.equal(heights[0],530);assert.equal(heights[1],730);
assert.equal(heights[0]!/heights[1]!,lengths[0]/lengths[1]);
assert(base-heights[1]!>=70&&base<900-60);
const drawings=await Promise.all(['juno','r7'].map(id=>specimen(`${PRE}/${id}.png`)));
// Match the reference profile envelopes as well as their metric heights.
const ratios=[1355/7564,100/278];
const widths=heights.map((height,i)=>Math.round(height*ratios[i]!));
const bodies=await Promise.all(drawings.map((body,i)=>sharp(body).resize({height:heights[i],width:widths[i],fit:'fill'}).png().toBuffer()));
const centres=[390,755];
const pieces=await Promise.all(bodies.map(async(input,i)=>{const m=await sharp(input).metadata();return{input,left:Math.round(centres[i]!-m.width!/2),top:base-heights[i]!};}));
assert.equal(pieces.length,2);
// Metric scale bar is intentional vector geometry, never generated writing. The
// caption supplies the bilingual interpretation; 125 px = 5 m in BOTH profiles.
const scaleHeight=5*ppm;assert.equal(scaleHeight,125);
const bar=Buffer.from(`<svg width="1200" height="900"><g stroke="#555" fill="none" stroke-width="1.5"><path d="M180 ${base}V${base-scaleHeight}M169 ${base}H191M169 ${base-scaleHeight}H191"/><path d="M169 ${base-scaleHeight/2}H180" stroke-width="1"/></g></svg>`);
await save('space-race-background-rivalry',await sharp({create:{width:1200,height:900,channels:4,background:'#00000000'}}).composite([...pieces,{input:bar}]).png().toBuffer());
// One complete R-7 diagonal specimen enlarges Korolev's work without a portrait.
const rotated=await sharp(drawings[1]).rotate(48,{background:'#00000000'}).png().toBuffer();
await sharp(rotated).png().toFile(`${PRE}/r7-diagonal.png`);
await plate(`${PRE}/r7-diagonal.png`,'space-race-r7-work');
await plate(`${PRE}/mittelwerk.png`,'space-race-background-mittelwerk');
