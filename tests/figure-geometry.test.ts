import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { boardCircuit, conducting, festiveCircuit, assertClearance, assertTrayContainment, boardsSvg, festiveSvg, OUTPUTS as CIRCUITS } from '../scripts/figures/circuits';
import { CAN, SCREEN, project, shadow, silhouette, shadowsSvg, OUTPUT as SHADOWS } from '../scripts/figures/light-shadows';
import { RADIUS, SLICES, fractionsSvg, OUTPUTS as FRACTIONS } from '../scripts/figures/fractions';
import { BUDGET } from '../scripts/figures/graphite';
import { coverInverts, PHYSICAL_TONE_COVERS } from '../src/lib/drawing-tone';

describe('geometry-drawn illustration facts', () => {
 it('draws a single series path through both bulbs and loses it if either filament opens', () => {
  const c=boardCircuit(false);
  expect(c.wires.map(w=>[w.from,w.to])).toEqual([['plus','a0'],['a1','b0'],['b1','minus']]);
  expect(conducting(c).has('minus')).toBe(true);
  for(const b of c.bulbs){b.broken=true;expect(conducting(c).has('minus')).toBe(false);b.broken=false;}
 });
 it('connects each parallel bulb across opposite battery terminals; either survives the other opening', () => {
  const c=boardCircuit(true);
  for(const b of c.bulbs){
   const poles=[0,1].map(n=>c.wires.find(w=>w.to===`${b.id}${n}`)!.from);
   expect(poles.sort()).toEqual(['minus','plus']);
   b.broken=true;expect(conducting(c).has('minus')).toBe(true);b.broken=false;
  }
  for(const parallel of [false,true])for(const w of boardCircuit(parallel).wires){
   expect(w.points[0]).toEqual(c.terminals[w.from]);expect(w.points.at(-1)).toEqual(c.terminals[w.to]);
  }
  expect(c.bulbs[0]!.brightness).toBeGreaterThan(boardCircuit(false).bulbs[0]!.brightness);
  expect(boardsSvg().match(/data-brightness="1"/g)).toHaveLength(2);
  expect(boardsSvg().match(/data-brightness="0.26"/g)).toHaveLength(2);
 });
 it('keeps wires clear of unrelated terminals and every lamp inside the tray lip',()=>{
  for(const c of [boardCircuit(false),boardCircuit(true),festiveCircuit()])expect(()=>assertClearance(c)).not.toThrow();
  expect(()=>assertTrayContainment()).not.toThrow();
  const short=festiveCircuit();short.wires[0]!.points.splice(1,0,short.terminals['11']!);
  expect(()=>assertClearance(short)).toThrow(/passes terminal/);
 });
 it('draws ten series lamps, one open filament, all ten dark; repairing it closes the loop', () => {
  const c=festiveCircuit();expect(c.bulbs).toHaveLength(10);
  expect(c.wires).toHaveLength(11);expect(c.bulbs.filter(b=>b.broken)).toHaveLength(1);
  expect(conducting(c).has('minus')).toBe(false);
  expect(c.bulbs.every(b=>b.brightness===0)).toBe(true);
  expect(festiveSvg().match(/data-brightness="0"/g)).toHaveLength(10);
  expect(festiveSvg().match(/data-broken="true"/g)).toHaveLength(1);
  c.bulbs.find(b=>b.broken)!.broken=false;expect(conducting(c).has('minus')).toBe(true);
  for(const w of c.wires){expect(w.points[0]).toEqual(c.terminals[w.from]);expect(w.points.at(-1)).toEqual(c.terminals[w.to]);}
 });
 it('projects the same cylinder along parallel rays: end-on circle, side-on rectangle', () => {
  for(const axis of ['x','y'] as const){
   const original=silhouette(axis),s=shadow(axis);
   for(let i=0;i<s.length;i++){
    expect(s[i]).toEqual(project(original[i]!));
    expect(s[i]![0]).toBe(SCREEN);expect(s[i]!.slice(1)).toEqual(original[i]!.slice(1));
   }
  }
  for(const [,y,z] of shadow('x')) expect(Math.hypot(y,z)).toBeCloseTo(CAN.radius,9);
  expect(shadow('y').map(p=>p.slice(1))).toEqual([
   [-CAN.length/2,-CAN.radius],[CAN.length/2,-CAN.radius],[CAN.length/2,CAN.radius],[-CAN.length/2,CAN.radius],
  ]);
  expect(shadowsSvg()).not.toContain('NaN');
 });
 it('has eight congruent sectors covering the disc; moving one preserves its shape and area at both sizes', () => {
  expect(SLICES).toHaveLength(8);expect(SLICES.filter(s=>s.offset!==0)).toHaveLength(1);
  let area=0;
  for(const [i,s] of SLICES.entries()){
   expect(s.end-s.start).toBeCloseTo(Math.PI/4,12);
   if(i)expect(s.start).toBe(SLICES[i-1]!.end);
   area+=(s.end-s.start)*RADIUS**2/2;
  }
  expect(area).toBeCloseTo(Math.PI*RADIUS**2,7);
  for(const size of [800,1600])expect(fractionsSvg(size).match(/data-slice="/g)).toHaveLength(8);
 });
 it.each([...CIRCUITS,SHADOWS,...FRACTIONS])('%s: shipped raster is transparent, neutral graphite and within 120 KB', async output => {
  expect(statSync(output).size).toBeLessThanOrEqual(BUDGET);
  const meta=await sharp(output).metadata();
  expect([meta.width,meta.height]).toEqual(output.includes('fractions')?[output.includes('@2x')?1600:800,output.includes('@2x')?1600:800]:[1200,900]);
  expect(meta.hasAlpha).toBe(true);
  const {data,info}=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Lossy WebP RGB↔YUV rounding can differ by one 8-bit code value.
  // This tolerance admits codec rounding, while still rejecting coloured artwork.
  let neutral=true,transparent=false;
  for(let i=0;i<data.length;i+=info.channels){if(Math.max(data[i]!,data[i+1]!,data[i+2]!)-Math.min(data[i]!,data[i+1]!,data[i+2]!)>1)neutral=false;if(data[i+3]===0)transparent=true;}
  expect(neutral).toBe(true);expect(transparent).toBe(true);
 });
});

describe('physical-tone opt-outs from docs/69 §4.1.4',()=>{
 it('covers exactly the three named covers, with both densities sharing one policy',()=>{
  expect(PHYSICAL_TONE_COVERS).toEqual(['light-and-shadows','solar-system','sun-earth-moon']);
  for(const s of PHYSICAL_TONE_COVERS)expect(coverInverts(s)).toBe(false);
  expect(coverInverts('fractions')).toBe(true);
 });
 it('excludes opted-out drawings from inversion and uses a monotonic paper treatment',async()=>{
  const css=readFileSync('src/styles/global.css','utf8');
  const inverted=css.match(/:root\[data-theme="cinema"\] \.atlas-drawing:not\(\[data-invert="false"\]\)\s*\{([^}]+)\}/)![1]!;
  expect(inverted).toContain('filter: invert(1)');
  const preserved=css.match(/:root\[data-theme="cinema"\] \.atlas-drawing\[data-invert="false"\]\s*\{([^}]+)\}/)![1]!;
  expect(preserved).not.toContain('invert(');
  expect(preserved).toContain('mix-blend-mode: normal');
  expect(preserved).toContain('opacity: 1');
  expect(preserved).toContain('background: var(--drawing-paper)');
  expect(css).toMatch(/:root\[data-theme="cinema"\] \.fp__item:has\(\[data-invert="false"\]\)\s*\{\s*mix-blend-mode: normal/);
  expect(readFileSync('src/theme/tokens.css','utf8')).toContain('--drawing-paper: #e9e4d8');
  const [,b,c]=preserved.match(/filter: brightness\(([\d.]+)\) contrast\(([\d.]+)\)/)!;
  const brightness=Number(b),contrast=Number(c);
  expect(brightness).toBeGreaterThan(0);expect(contrast).toBeGreaterThan(0);
  expect(brightness).toBeLessThanOrEqual(1);
  // Check the actual shipped phase pixels through both treatments. Positive
  // slope preserves phase polarity, including quarter-Moon handedness.
  const pixels=await sharp('public/illustrations/figures/sun-earth-moon-four-phases.webp').resize(420,315).flatten({background:'#e9e4d8'}).greyscale().raw().toBuffer();
  const mean=(x:number,y:number)=>{
   let sum=0;for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)sum+=pixels[(y+dy)*420+x+dx]!;
   return sum/81;
  };
  for(const theme of ['paper','cinema']){
   const tone=(v:number)=>theme==='paper'?v:Math.max(0,Math.min(255,brightness*contrast*v+255*(1-contrast)/2));
   expect(tone(mean(136,227))-tone(mean(136,87))).toBeGreaterThan(70);
   expect(tone(mean(315,87))-tone(mean(252,87))).toBeGreaterThan(70);
   expect(tone(mean(252,227))-tone(mean(315,227))).toBeGreaterThan(70);
  }
 });
 it('marks both language copies of exactly the seven named chapter figures',async()=>{
  const {globSync}=await import('node:fs');
  const counts:Record<string,number>={};
  for(const p of globSync('src/content/topics/*/chapters/*.mdx'))for(const m of readFileSync(p,'utf8').matchAll(/<Figure src="([^"]+)" invert=\{false\}/g)) counts[m[1]!]=(counts[m[1]!]??0)+1;
  expect(counts).toEqual(Object.fromEntries(['circuits-series-parallel','sun-earth-moon-four-phases','sun-earth-moon-parallel-axes','light-and-shadows-shadow-distance','light-and-shadows-same-object-two-shadows','light-and-shadows-sun-day','plant-light-fair-test'].map(s=>[`figures/${s}`,2])));
 });
});
