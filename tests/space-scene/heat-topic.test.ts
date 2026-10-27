/** Shipped heat lesson claims must match the evaluator and its apparatus bindings. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as yaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { curveCursor, curveModel } from '../../src/engines/space-scene/lib/sim/curve';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import type { SimTry, SimValues } from '../../src/engines/space-scene/sim-schema';
const DIR = join(import.meta.dirname, '../../src/content/topics/heat');
const raw = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const file = partsFile.parse(raw);
const sim = file.sim!;
interface Beat { sim?: { set?: SimValues }; labels?: string[]; caption: { en: string; zh: string } }
interface Chapter { id: string; order: number; kind?: string; state: { sim: { set: SimValues; try?: SimTry }; beats: Beat[]; index: { parts: string[] } }; body: string }
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((name) => {
  const text = readFileSync(join(DIR, 'chapters', name), 'utf8');
  const [, front, ...body] = text.split(/^---$/m);
  return { ...yaml(front!), body: body.join('---') };
});
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const valuesAt = (id: string, beat: number) => {
  const c = chapter(id);
  return resolveSimValues(sim, { ...c.state.sim.set, ...c.state.beats[beat - 1]!.sim?.set });
};
const at = (id: string, beat: number) => evaluateSim(sim, valuesAt(id, beat));

describe('heat published topic', () => {
  it('ships eight chapters, 37 beats, 34 apparatus parts and a context bench', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters[0]!.kind).toBe('background');
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 4, 5, 5, 5, 4]);
    expect(file.parts.filter((p) => !p.context)).toHaveLength(34);
    expect(file.parts.filter((p) => p.context).map((p) => p.id)).toEqual(['bench']);
    expect(sim.controls).toHaveLength(7); expect(sim.outputs).toHaveLength(24);
    expect(yaml(readFileSync(join(DIR, 'topic.yaml'), 'utf8')).status).toBe('published');
  });
  it('caption comparisons use the temperatures at the same authored time', () => {
    expect(Number(at('temperature-and-heat', 3)['metal-c'])).toBe(25);
    expect(Number(at('temperature-and-heat', 3)['plastic-c'])).toBe(25);
    expect(Number(at('temperature-and-heat', 4)['heated-j'])).toBe(12000);
    expect(Number(at('heating-curves', 2)['heated-c'])).toBeCloseTo(39.285714286, 6);
    expect(chapter('heating-curves').state.beats[1]!.caption.en).toContain('39.3');
    expect(Number(at('heating-curves', 3)['heated-change-k'])).toBeCloseTo(Number(at('heating-curves', 2)['heated-change-k']) / 2, 10);
    expect(Number(at('heating-curves', 5)['heated-c'])).toBe(25);
    expect(at('heat-along-spoons', 2)['tip-comparison']).toBe('first-warmer');
    expect(at('heat-along-spoons', 4)['tip-comparison']).toBe('second-warmer');
    expect(at('heat-along-spoons', 5)['metal-direction']).toBe('steady');
    expect(Number(at('cooling-curves', 3)['cool-c'])).toBeCloseTo(54.372499573, 6);
    expect(Number(at('cooling-curves', 4)['cool-c'])).toBeCloseTo(75.187858438, 6);
    expect(Number(at('slowing-heat-transfer', 4)['cool-c'])).toBeCloseTo(6.378744406, 6);
    expect(at('slowing-heat-transfer', 4)['cool-direction']).toBe('warming');
    expect(Number(at('expansion-and-contraction', 1)['rod-delta-mm'])).toBeCloseTo(0.072, 9);
    expect(Number(at('expansion-and-contraction', 5)['rod-delta-mm'])).toBe(0);
  });
  it('every plotted teaching beat shares the evaluator and exact cursor temperature', () => {
    for (const c of chapters) {
      const curve = c.state.sim.try?.curve;
      if (!curve) continue;
      for (let i = 0; i < c.state.beats.length; i++) {
        const values = valuesAt(c.id, i + 1);
        const q = evaluateSim(sim, values);
        const model = curveModel(sim, values, curve)!;
        const cursor = curveCursor(sim, values, curve)!;
        expect(model.domain).toEqual([0, 300]); expect(model.yDomain).toEqual([0, 100]);
        for (const s of model.series) {
          expect(s.points).toHaveLength(101);
          expect(cursor.values[s.output.id]).toBe(q[s.output.id]);
          expect(s.points.find((p) => p.x === cursor.x)!.y).toBe(q[s.output.id]);
        }
      }
    }
  });
  it('only the independent rod indicator is displaced by the magnified calculation', () => {
    const v = valuesAt('expansion-and-contraction', 1);
    const effects = simEffects(sim, v, evaluateSim(sim, v));
    expect(effects.offset.get('rod-end-marker')?.[0]).toBeCloseTo(0.036, 9);
    expect(effects.offset.get('rod')).toBeUndefined();
    expect(raw.sim.bind.some((b: { part?: string; stretch?: unknown }) => b.part === 'rod' && b.stretch)).toBe(false);
  });
  it('immerses each probe bulb without touching the vessel floor or wall, with the clamp on its stem', () => {
    for (const [probeId, waterId] of [['probe', 'bath-water'], ['heater-probe', 'heater-water'], ['cool-probe', 'cooling-water']]) {
      const probe = file.parts.find((p) => p.id === probeId)!;
      const liquid = file.parts.find((p) => p.id === waterId)!.primitive!;
      const bulb = probe.extra!.find((p) => p.kind === 'sphere')!;
      expect(liquid.kind).toBe('cylinder'); expect(bulb.kind).toBe('sphere');
      if (liquid.kind !== 'cylinder' || bulb.kind !== 'sphere') throw new Error('probe apparatus must include liquid and bulb');
      expect(bulb.at[1] - bulb.size[0]!).toBeGreaterThan(liquid.at[1] - liquid.size[2]! / 2);
      expect(bulb.at[1] + bulb.size[0]!).toBeLessThan(liquid.at[1] + liquid.size[2]! / 2);
      expect(Math.hypot(bulb.at[0] - liquid.at[0], bulb.at[2] - liquid.at[2]) + bulb.size[0]!).toBeLessThan(liquid.size[0]!);
    }
    const stem = file.parts.find((p) => p.id === 'probe')!.primitive!;
    const clamp = file.parts.find((p) => p.id === 'probe-clamp')!.extra![0]!;
    if (stem.kind !== 'tube' || clamp.kind !== 'box') throw new Error('missing connected thermometer support');
    const end = stem.at[1] + Math.max(...stem.path.map((p) => p[1]));
    expect(end).toBeGreaterThanOrEqual(clamp.at[1] + clamp.size[1]! / 2);
    expect(stem.at[1]).toBeLessThan(clamp.at[1]);
  });
  it('all beat labels have accessible chapter index entries and concise bilingual captions', () => {
    for (const c of chapters) for (const b of c.state.beats) {
      for (const id of b.labels ?? []) expect(c.state.index.parts).toContain(id);
      expect(b.labels?.length ?? 0).toBeLessThanOrEqual(6);
      expect(b.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      expect(b.caption.zh.length).toBeGreaterThan(8);
    }
  });
  it('all 16 published terms have one first-use link per language and both figures are local', () => {
    const glossary = JSON.parse(readFileSync(join(DIR, 'data/glossary.json'), 'utf8'));
    expect(glossary.terms).toHaveLength(16);
    for (const locale of ['en', 'zh']) {
      const prose = chapters.map((c) => c.body.match(new RegExp(`<Lang ${locale}>([\\s\\S]*?)</Lang>`))?.[1] ?? '').join('\n');
      for (const term of glossary.terms) expect(prose.match(new RegExp(`<Term id="${term.id}">`, 'g'))?.length ?? 0).toBe(1);
    }
    for (const id of ['heat-spoons', 'heat-expansion']) expect(existsSync(join(DIR, '../../../../public/illustrations/figures', `${id}.webp`))).toBe(true);
    const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources;
    expect(sources.find((s: { id: string; design?: boolean }) => s.id === 'S27').design).toBe(true);
  });
});
