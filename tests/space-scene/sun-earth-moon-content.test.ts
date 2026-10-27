import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import raw from '../../src/content/topics/sun-earth-moon/data/parts.json';
import solar from '../../src/content/topics/sun-earth-moon/data/singapore-sun-2026.json';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { orbitSnapshot } from '../../src/engines/space-scene/lib/sim/orbit-rotation';
import { orbitDisplay, orbitalTiltGuide } from '../../src/engines/space-scene/lib/sim/orbit-projection';
import type { SpaceChapterState } from '../../src/engines/space-scene/schema';
const root = resolve('src/content/topics/sun-earth-moon');
const chapters = readdirSync(`${root}/chapters`).sort().map((file) => {
  const text = readFileSync(`${root}/chapters/${file}`, 'utf8');
  return { ...parse(text.split('---')[1]!) as { id: string; kind?: string; state: SpaceChapterState }, text };
});
const sim = simSchema.parse({ ...raw.sim, orbitRotation: { ...raw.sim.orbitRotation, solarYear: { ...raw.sim.orbitRotation.solarYear, table: solar } } });
const cfg = sim.orbitRotation!;
const snapshot = (chapter: number, beat: number) => {
  const s = chapters[chapter]!.state;
  return orbitSnapshot(cfg, resolveSimValues(sim, { ...s.sim?.set, ...s.beats?.[beat]?.sim?.set }), { timeSeconds: 0 });
};
const q = (chapter: number, beat: number) => snapshot(chapter, beat).quantities;

describe('sun-earth-moon · published content and scientific captions', () => {
  it('ships eight chapters, 39 beats, five experiments and thirteen real selectable objects', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map(c => c.state.beats?.length)).toEqual([4, 5, 5, 5, 5, 5, 5, 5]);
    expect(chapters.filter(c => c.state.sim?.try)).toHaveLength(5);
    expect(raw.parts).toHaveLength(13);
    expect(raw.groups).toHaveLength(4);
    expect(raw.sim.controls).toHaveLength(13);
    expect(raw.sim.outputs).toHaveLength(23);
    expect(parse(readFileSync(`${root}/topic.yaml`, 'utf8')).status).toBe('published');
    for (const c of chapters) {
      expect(c.state.run).toBe(false);
      for (const beat of c.state.beats ?? []) {
        expect(Object.keys(beat.sim?.set ?? {}).sort()).toEqual(raw.sim.controls.map(c => c.id).sort());
        expect(beat.caption?.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      }
    }
  });
  it('uses all exact final captions from the signed content specification', () => {
    const spec = readFileSync(resolve('docs/44-sun-earth-moon-content-spec.md'), 'utf8');
    const rows = spec.split('\n').filter(line => /^\| (?:BG|0[1-7])\.[1-5] \|/.test(line));
    expect(rows).toHaveLength(39);
    const beats = chapters.flatMap(c => c.state.beats ?? []);
    rows.forEach((row, i) => {
      const columns = row.split('|').map(s => s.trim());
      expect(beats[i]!.caption).toEqual({ en: columns[3], zh: columns[4] });
    });
  });
  it('day captions match night, boundary, overhead light and return while orbit is frozen', () => {
    expect([0,1,2,3,4].map(i => q(1,i)['observer-day'])).toEqual(['night','boundary','day','boundary','night']);
    expect(q(1,2)['observer-altitude-deg']).toBeCloseTo(90,6);
    expect(snapshot(1,0).bodies.earth.position).toEqual(snapshot(1,4).bodies.earth.position);
  });
  it('season captions match rounded daylight, parallel axes, swapped hemispheres and zero tilt', () => {
    expect(Math.round((q(2,1)['geometric-daylight-hours'] as number)*60)).toBe(926);
    expect(Math.round((q(2,2)['geometric-daylight-hours'] as number)*60)).toBe(514);
    expect(snapshot(2,1).axis).toEqual(snapshot(2,2).axis);
    expect(q(2,3)['geometric-daylight-hours']).toBe(q(2,2)['geometric-daylight-hours']);
    expect(q(2,4)['geometric-daylight-hours']).toBe(12);
  });
  it('local captions read original minute estimates, not rounded sunset minus sunrise', () => {
    expect(Math.round(q(3,1)['local-daylight-minutes'] as number)).toBe(732);
    expect(Math.round(q(3,2)['local-daylight-minutes'] as number)).toBe(723);
    expect(q(3,3)['local-daylight-minutes']).toBe(724.417);
    expect(q(3,3)['local-sunrise']).toBeCloseTo(6 + 47/60,8);
    expect(q(3,3)['local-noon']).toBeCloseTo(12 + 49/60,8);
    expect(q(3,3)['local-sunset']).toBeCloseTo(18 + 51/60,8);
    expect(solar.days).toHaveLength(365);
    expect(JSON.stringify(solar.meta)).not.toContain('cross_check');
  });
  it('quarter captions match half-lit discs independent of Earth’s shadow', () => {
    expect([0,1,2,3].map(i => q(4,i)['moon-phase'])).toEqual(['new','first-quarter','full','last-quarter']);
    for (const i of [1,3]) {
      expect(q(4,i)['moon-lit-percent']).toBeCloseTo(50.1284773403,8);
      expect(q(4,i)['lunar-eclipse']).toBe('none');
    }
    expect(q(4,2)['moon-lit-percent']).toBe(100);
    expect(q(4,2)['lunar-eclipse']).toBe('total');
    expect(snapshot(4,4).bodies.moon.quaternion).not.toEqual(snapshot(4,1).bodies.moon.quaternion);
  });
  it('eclipse captions match off-node, node, lunar, total and annular geometries', () => {
    expect(q(5,0)['solar-eclipse']).toBe('none');
    expect(q(5,1)['solar-eclipse']).not.toBe('none');
    expect(q(5,2)['lunar-eclipse']).toBe('total');
    expect(q(5,3)['solar-eclipse']).toBe('total');
    expect(q(5,4)['solar-eclipse']).toBe('annular');
    expect(q(6,0)['solar-eclipse']).toBe('annular');
    expect(q(6,2)['solar-eclipse']).toBe('partial');
  });
  it('true-scale caption distinguishes centre distance from surface gap without changing physics', () => {
    const s = snapshot(0,2);
    const t = orbitDisplay(cfg,s,'true-scale'), d = orbitDisplay(cfg,s,'schematic');
    expect(t.radii.earth*2).toBeCloseTo(.01,12);
    const centreDistance = Math.hypot(...t.centres.moon.map((v,i) => v - t.centres.earth[i]!));
    expect(centreDistance*1000).toBeCloseTo(301.679485167,8);
    expect((centreDistance-t.radii.earth-t.radii.moon)*1000).toBeCloseTo(295.315963,6);
    expect(d.multipliers.size.earth).not.toBe(t.multipliers.size.earth);
    expect(q(0,2)['earth-moon-km']).toBeCloseTo(384400,6);
  });
  it('tilt guide measures from the orbital normal, follows the fixed axis, and closes to zero', () => {
    for (const tilt of [0,23.44]) {
      const s = snapshot(2, tilt === 0 ? 4 : 1);
      const d = orbitDisplay(cfg,s,'schematic');
      const points = orbitalTiltGuide(d.centres.earth,s.axis,d.radii.earth,.84);
      const normal = points[7]!.map((v,i) => v-d.centres.earth[i]!);
      expect(normal).toEqual([0,d.radii.earth*1.7,0]);
      const arc = points.slice(9).map(p => p.map((v,i) => v-d.centres.earth[i]!));
      for (const p of arc) expect(Math.hypot(...p)).toBeCloseTo(d.radii.earth*1.55,12);
      const end = arc.at(-1)!;
      for(let i=0;i<3;i++) expect(end[i]!/(d.radii.earth*1.55)).toBeCloseTo(s.axis[i]!,12);
      if(tilt===0) expect(arc[0]).toEqual(end);
    }
  });
  it('calendar beats retain continuous phases without imposing a full Moon on day fifteen', () => {
    expect(chapters[7]!.state.sim?.set?.['lunar-tilt']).toBe(5.145);
    expect(chapters[7]!.state.sim?.set?.['node-angle']).toBe(90);
    expect(q(7,3)['moon-lit-percent']).toBeLessThan(100);
    expect(q(7,4)['moon-lit-percent']).toBeLessThan(100);
    expect(chapters[7]!.text).not.toMatch(/"day-index":\s*15\b/);
  });
});
