import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { partsFile, spaceChapterState } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
const dir = 'src/content/topics/container-port';
const file = partsFile.parse(JSON.parse(readFileSync(`${dir}/data/parts.json`, 'utf8')));
const chapters = readdirSync(`${dir}/chapters`).filter((n) => n.endsWith('.mdx')).sort().map((n) => {
 const text = readFileSync(`${dir}/chapters/${n}`, 'utf8');
 const front = parse(text.match(/^---\n([\s\S]*?)\n---/)![1]!);
 return { ...front, state: spaceChapterState.parse(front.state), body: text.split(/\n---\n/)[1]! };
});
const quantities = (ch: number, beat: number) => {
 const st = chapters[ch]!.state;
 const values = resolveSimValues(file.sim!, { ...st.sim?.set, ...st.beats[beat]!.sim?.set });
 return evaluateSim(file.sim!, values, [], undefined, file.parts);
};
describe('container port captions against authored model and sources', () => {
 it('publishes exactly eight complete bilingual chapters and thirty-six bilingual beats', () => {
  expect(chapters).toHaveLength(8); expect(chapters.map((c) => c.state.beats.length)).toEqual([4,5,5,5,4,4,4,5]);
  for (const c of chapters) { expect(c.body).toContain('<Lang en>'); expect(c.body).toContain('<Lang zh>'); for (const b of c.state.beats) { expect(b.caption!.en.length).toBeGreaterThan(10); expect(b.caption!.zh.length).toBeGreaterThan(5); } }
 });
 it('the three-box/four-TEU caption agrees with the actual count controls and capacities', () => {
  const b = chapters[1]!.state.beats[2]!;
  expect(b.caption!.en).toContain('three boxes'); expect(b.caption!.en).toContain('4 TEU');
  const q = quantities(1,2); expect([q.boxes,q.teu]).toEqual([3,4]);
  for (const [id,n] of [['sample-20',2],['sample-40',1]] as const) expect(file.parts.find((p) => p.id===id)!.repeat!.count).toBeGreaterThanOrEqual(n);
  expect(chapters[1]!.state.beats[0]!.labels).toEqual(['sample-20']);
  expect(chapters[1]!.state.beats[1]!.labels).toEqual(['sample-40']);
 });
 it('yard caption counts only the two blockers and one target, with no restoration moves', () => {
  expect(chapters[3]!.state.beats[4]!.caption!.en).toContain('two rehandles and one retrieval');
  const q=quantities(3,4); expect([q.rehandles,q['retrieval-lifts']]).toEqual([2,3]);
  const slots=q['yard-slots'] as Record<string,number>;
  expect(slots['yard-target:z']).toBe(10); expect(slots['yard-blocker-a:x']).toBe(10); expect(slots['yard-blocker-b:x']).toBe(20);
 });
 it('bottleneck captions retain18 with another crane and change to24 with another yard resource', () => {
  expect(chapters[7]!.state.beats[2]!.caption!.en).toContain('18'); expect(quantities(7,2)['capacity-rate']).toBe(18);
  expect(chapters[7]!.state.beats[3]!.caption!.en).toContain('24'); expect(quantities(7,3)['capacity-rate']).toBe(24);
  expect(quantities(7,2).queued).toBe(12); expect(quantities(7,4).queued).toBe(0);
 });
 it('keeps snapshot offsets and live timeline mutually exclusive', () => {
  for(const c of chapters) for(const b of c.state.beats){
   const live=b.sim?.set?.['lift-live'] ?? c.state.sim?.set?.['lift-live'];
   const pose=b.pose === undefined ? c.state.pose : b.pose;
   if(live===true) expect(pose).toBeNull(); else expect(live).toBe(false);
  }
  expect(file.parts.filter((p)=>p.id==='working-box')).toHaveLength(1);
 });
 it('ships the unchanged cleared public-domain geography, without guessed vessel tracks', () => {
  const hashes:Record<string,string>={ 'straits-land.geojson':'1fc12871d847d40d3bf97ac3ba027813ad9b04f9baae831671d7b7233307b661','marine-labels.geojson':'d418b2d74b94c5053ee4ecf4f4f9aeea15f448c8b658ebb9a7b6faf3bc4547a7','singapore-label.geojson':'98d2e9b459db4c57d20d14d8f960b7af6673d1b3dfd77a7be095ef53cfd12f98'};
  for (const [name,hash] of Object.entries(hashes)) expect(createHash('sha256').update(readFileSync(`${dir}/assets/${name}`)).digest('hex')).toBe(hash);
  const map=JSON.parse(readFileSync(`${dir}/assets/straits-map.json`,'utf8')); expect(map.views.map((v:{id:string})=>v.id)).toEqual(['regional','straits']);
  expect(map.views[0].labels.map((l:{id:string})=>l.id)).toContain('strait-of-malacca');
  expect(map.views[1].labels.map((l:{id:string})=>l.id)).toContain('strait-of-singapore');
  expect(JSON.stringify(map)).not.toMatch(/shipping-lanes|vessel-track/);
 });
});
