/** Shipped heat lesson claims must match the evaluator and its apparatus bindings. */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore } from 'zustand/vanilla';
import { SceneContext, type SceneContextValue } from '../../src/engines/core/context';
import { TryCurve } from '../../src/engines/space-scene/explorer/TryCurve';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as yaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { curveCursor, curveModel, fitTemperatureAxis } from '../../src/engines/space-scene/lib/sim/curve';
import { fillShapeForPrimitive, fillSlice } from '../../src/engines/space-scene/lib/fill';
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
    expect(Number(at('heating-curves', 4)['heated-c'])).toBeCloseTo(32.142857143, 6);
    expect(chapter('heating-curves').state.beats[3]!.caption.en).toContain('32.1');
    expect(chapter('heating-curves').state.beats[3]!.caption.zh).toContain('32.1');
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
        expect(model.domain).toEqual([0, 300]);
        expect(model.series.every(s => s.points.every(p => p.y >= model.yDomain[0] && p.y <= model.yDomain[1]))).toBe(true);
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
      const bulb = probe.primitive!;
      expect(liquid.kind).toBe('cylinder'); expect(bulb.kind).toBe('lathe');
      if (liquid.kind !== 'cylinder' || bulb.kind !== 'lathe') throw new Error('missing glass reservoir');
      expect(bulb.at[1] - .007).toBeGreaterThan(liquid.at[1] - liquid.size[2]! / 2);
      expect(bulb.at[1] + .011).toBeLessThan(liquid.at[1] + liquid.size[2]! / 2);
      expect(Math.hypot(bulb.at[0] - liquid.at[0], bulb.at[2] - liquid.at[2]) + .0028).toBeLessThan(liquid.size[0]!);
      // A reservoir must blend into its neck, never collapse to a point and reopen.
      expect(bulb.profile.slice(1,-1).every(([radius])=>radius>0)).toBe(true);
      // Coloured upper capillary remains inside the glass (including its radius).
      const column=file.parts.find(p=>p.id===probeId+'-marker')?.primitive ?? file.parts.find(p=>p.id==='probe-marker')!.primitive!;
      expect(Math.abs(column!.at[2]-bulb.at[2])+.00065).toBeLessThan(.0022);
    }
    for (const id of ['probe-clamp', 'heater-probe-support', 'cooler-probe-support']) {
      const clamp = file.parts.find(p => p.id === id)!;
      expect([clamp.primitive, ...clamp.extra!].filter(p => p?.kind === 'coil')).toHaveLength(3);
      expect([clamp.primitive, ...clamp.extra!].filter(p => p?.color === 'token:neutral')).toHaveLength(3);
    }
  });
  it('uses the actual fill binding and engine fill geometry for a connected fixed-bulb liquid column', () => {
    for (const [probeId, marker] of [['probe', 'probe-marker'], ['heater-probe', 'heater-probe-marker'], ['cool-probe', 'cool-probe-marker']]) {
      const column = file.parts.find(p => p.id === marker)!;
      const probe = file.parts.find(p => p.id === probeId)!;
      const shape = fillShapeForPrimitive(column.primitive)!;
      const binding = sim.bind.find(b => 'part' in b && b.part === marker)!;
      expect('fill' in binding && binding.fill).toBeTruthy();
      const temperatures = [5, 25, 80];
      const levels = temperatures.map(temperature => {
        const v = resolveSimValues(sim, { 'bath-c': temperature, 'cool-start-c': temperature, 'elapsed-s': 0 });
        const effects = simEffects(sim, v, evaluateSim(sim, v));
        const fill = effects.fill.get(marker!)!;
        const slice = fillSlice(shape, fill.volume, { below: fill.below, meniscus: fill.meniscus });
        expect(slice.shown).toBe(true);
        const at = column.primitive!.at[1];
        const stemTop = probe.primitive!.at[1] + .202;
        expect(slice.level + at).toBeLessThan(stemTop);
        expect(slice.bottom + at).toBeCloseTo(probe.primitive!.at[1] + .05, 8);
        return slice.level;
      });
      if (probeId !== 'heater-probe') expect(levels[0]!).toBeLessThan(levels[2]!);
    }
  });
  it('the fitted °C axis covers complete trajectories and keeps cursor sampling exact', () => {
    for (const c of chapters) {
      const curve = c.state.sim.try?.curve; if (!curve) continue;
      for (let i=1; i<=c.state.beats.length; i++) {
        const values = valuesAt(c.id, i), model = curveModel(sim, values, curve)!;
        for (const series of model.series) for (const p of series.points) {
          expect(p.y).toBeGreaterThanOrEqual(model.yDomain[0]);
          expect(p.y).toBeLessThanOrEqual(model.yDomain[1]);
        }
        expect(model.yTicks.length).toBeGreaterThanOrEqual(3);
        expect(model.yTicks.length).toBeLessThanOrEqual(9);
        expect(curveModel(sim, { ...values, 'elapsed-s': 0 }, curve)!.yDomain).toEqual(model.yDomain);
      }
    }
    const cold=curveModel(sim,valuesAt('slowing-heat-transfer',4),chapter('slowing-heat-transfer').state.sim.try!.curve!)!;
    expect(cold.yDomain[1]-cold.yDomain[0]).toBeLessThanOrEqual(10);
    for (const values of [[25,25],[-15,-2],[5,8],[25,190]]) {
      const axis=fitTemperatureAxis([{points:values.map(y=>({y}))}]);
      expect(axis.domain[0]).toBeLessThanOrEqual(Math.min(...values));
      expect(axis.domain[1]).toBeGreaterThanOrEqual(Math.max(...values));
      expect(axis.ticks.every(Number.isFinite)).toBe(true);
    }
  });
  it('renders TryCurve with fitted ticks and a visible cold-start rise in EN and ZH', () => {
    const curve=chapter('slowing-heat-transfer').state.sim.try!.curve!;
    const values=valuesAt('slowing-heat-transfer',4);
    for (const locale of ['en','zh'] as const) {
      const context={locale,store:createStore(()=>({sim:values}))} as unknown as SceneContextValue;
      const html=renderToStaticMarkup(createElement(SceneContext.Provider,{value:context},createElement(TryCurve,{sim,values,curve})));
      const points=html.match(/<polyline[^>]*points="([^"]+)"/)![1]!.split(' ').map(p=>p.split(',').map(Number));
      expect(points).toHaveLength(101);
      const ys=points.map(p=>p[1]!);
      expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(20);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(18);
      expect(Math.max(...ys)).toBeLessThanOrEqual(160);
      expect(html).not.toContain('>100</text>');
      expect(html).toContain('>5</text>');
    }
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
