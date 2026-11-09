import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { makeMicroscopeSim } from '../../src/engines/space-scene/lib/sim/microscope-fixture';
import { microscopeSchema } from '../../src/engines/space-scene/microscope-schema';
import { microscopeFeatures, solveMicroscope } from '../../src/engines/space-scene/lib/sim/microscope';
import { polishField, polishOnionPatch } from '../../scripts/geo/cells/polish-field.mjs';

const m = microscopeSchema.parse(polishField(makeMicroscopeSim()).microscope);
const onion = m.patterns.find(p => p.id === 'onion-grid')!;
const values = { specimen: 'onion-bulb', objective: 40, 'slide-x': -200, 'slide-y': 0, 'focus-z': 0, illumination: 1, 'field-on': true };
const chapters = readdirSync('src/content/topics/cells/chapters').map(f => JSON.parse(readFileSync(`src/content/topics/cells/chapters/${f}`, 'utf8').split('---')[1]!));

describe('cells polish: microscope fields and authored beats', () => {
  it('keeps target arithmetic while replacing the repeated rectangle with staggered irregular cells', () => {
    expect(onion.features.filter(f => f.role === 'wall')).toHaveLength(24);
    expect(onion.features.filter(f => f.role === 'nucleus')).toHaveLength(24);
    expect(onion.features.some(f => f.role === 'chloroplast')).toBe(false);
    const walls = onion.features.filter(f => f.role === 'wall');
    const widths = walls.map(f => Math.max(...f.pointsUm!.map(p => p[0])) - Math.min(...f.pointsUm!.map(p => p[0])));
    expect(new Set(widths).size).toBeGreaterThan(12);
    const heights = walls.map(f => Math.max(...f.pointsUm!.map(p => p[1])) - Math.min(...f.pointsUm!.map(p => p[1])));
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(15);
    expect(walls.every(f => f.pointsUm!.length > 8)).toBe(true);
    expect(onion.features.find(f => f.id === 'onion-nucleus')!.atUm).toEqual([200, 0, 0]);
    expect(solveMicroscope(m, values)['target-u']).toBe(0);
    expect(solveMicroscope(m, values)['field-diameter-um']).toBe(450);
    expect(microscopeFeatures(m, values).some(f => f.instanceId === '0:0:onion-nucleus')).toBe(true);
  });

  it('stays under the finite feature budget and keeps the whole low-power field populated', () => {
    const nx = onion.tileRange.x[1] - onion.tileRange.x[0] + 1;
    const ny = onion.tileRange.y[1] - onion.tileRange.y[0] + 1;
    expect(nx * ny * onion.features.length).toBe(2016);
    expect(nx * ny * onion.features.length).toBeLessThanOrEqual(2048);
    for (const x of [-1000, 0, 1000]) for (const y of [-1000, 0, 1000]) {
      const features = microscopeFeatures(m, { ...values, objective: 4, 'slide-x': x, 'slide-y': y });
      expect(features.length).toBeGreaterThan(200);
      const centers = features.filter(f => f.role === 'wall');
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        expect(centers.some(f => f.u * dx! + f.v * dy! > .85)).toBe(true);
      }
    }
  });

  it('keeps nine onion cells and six fitted tissue cells with individual nuclei', () => {
    const parts = [{ id: 'onion-patch', detail: { en: '', zh: '' } }, { id: 'tissue-patch', detail: { en: '', zh: '' } }];
    const result = polishOnionPatch(parts);
    for (const [id, count] of [['onion-patch', 9], ['tissue-patch', 6]] as const) {
      const patch = result.find((p: { id: string }) => p.id === id)!;
      const primitives = [patch.primitive, ...patch.extra];
      expect(primitives.filter((p: { kind: string }) => p.kind === 'lathe')).toHaveLength(count);
      expect(primitives.filter((p: { holes?: unknown[] }) => p.holes?.length)).toHaveLength(count);
      expect(patch.extra.length).toBeLessThanOrEqual(32);
    }
  });

  it('uses clear illumination in every authored observation and exposes the named lenses', () => {
    for (const c of chapters) for (const b of [c.state, ...c.state.beats]) expect(b.sim.set.illumination).toBe(1);
    const power = chapters.find(c => c.id === 'power-and-field')!.state.beats;
    expect(power[1].camera).toBe('scope-whole');
    expect(power[1].labels).toEqual(['scope-eyepiece', 'scope-objective-four']);
    expect(power[2].labels).toContain('scope-objective-forty');
    expect(power[2].part).toBe('scope-objective-forty');
    expect(power[2].sim.set.objective).toBe(40);
    const first = chapters.find(c => c.id === 'before-you-start')!.state.beats[0];
    for (const id of ['animal-membrane', 'plant-cell-wall']) expect(first.hide).not.toContain(id);
  });
});
