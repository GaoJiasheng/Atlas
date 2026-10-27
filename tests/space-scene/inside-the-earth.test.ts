/** Independent checks of docs/48's teaching mathematics and the actual shipped data. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';
import { tableCombinations } from '../../src/engines/space-scene/lib/sim/table';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { isClosedPrimitive } from '../../src/engines/space-scene/stages/model3d/geometry';

const DIR = join(import.meta.dirname, '../../src/content/topics/inside-the-earth');
const raw = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const file = partsFile.parse(raw);
const sim = file.sim!;
const chapters = readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const [, front] = readFileSync(join(DIR, 'chapters', f), 'utf8').split(/^---$/m);
  return yaml(front!);
});
const out = (set: Record<string, unknown> = {}) => evaluateSim(sim, resolveSimValues(sim, set));
const fx = (set: Record<string, unknown>) => simEffects(sim, resolveSimValues(sim, set), out(set));
const letters = Array.from({ length: 17 }, (_, i) => String.fromCharCode(97 + i));
const waves = ['p', 's'].flatMap((kind) => letters.map((l) => `wave-${kind}-${l}`));
const water = ['sea-bed', 'sea-bed-left', 'sea-bed-right', ...letters.map((l) => `sea-column-${l}`)];
const offset = (pose: string, part: string) => file.poses![pose]!.parts[part]!.offset!;
const closeVector = (actual: readonly number[], wanted: readonly number[]) => wanted.forEach((v, i) => expect(actual[i]).toBeCloseTo(v, 12));

describe('inside-the-earth: concentric closed shells, never equal-thickness rings', () => {
  it('uses the exact four radii, with closed half-shells sharing their boundary surfaces without overlap or gaps', () => {
    const radii = [0, 1221 / 6371, 3485 / 6371, 6341 / 6371, 1];
    const ids = ['earth-inner-core', 'earth-outer-core', 'earth-mantle', 'earth-crust'];
    const boundaries: number[][][] = [];
    ids.forEach((id, i) => {
      const p = file.parts.find((p) => p.id === id)!.primitive!;
      expect(p.kind).toBe('lathe');
      if (p.kind !== 'lathe') throw new Error(`${id} must be a shell profile`);
      expect(p.arc).toBe(180);
      expect(isClosedPrimitive(p)).toBe(true);
      expect(p.profile[0]).toEqual(p.profile.at(-1));
      const outer = radii[i + 1]!, inner = radii[i]!;
      const radial = p.profile.map(([r, y]) => Math.hypot(r, y));
      expect(Math.max(...radial)).toBeCloseTo(outer, 14);
      // Every non-axis point lies on one of the shell's two boundaries.
      for (let j = 0; j < p.profile.length; j++) {
        if (p.profile[j]![0] < 1e-14) continue;
        expect(Math.min(Math.abs(radial[j]! - inner), Math.abs(radial[j]! - outer))).toBeLessThan(1e-14);
      }
      if (i > 0) expect(radial.some((r) => Math.abs(r - inner) < 1e-14)).toBe(true);
      boundaries.push(p.profile.filter(([r, y]) => Math.abs(Math.hypot(r, y) - outer) < 1e-14));
      if (i > 0) {
        const onInner = p.profile.filter(([r, y]) => Math.abs(Math.hypot(r, y) - inner) < 1e-14);
        for (const v of onInner) expect(boundaries[i - 1]!.some((u) => Math.hypot(u[0]! - v[0], u[1]! - v[1]) < 1e-12)).toBe(true);
      }
    });
    expect(ids.map((_, i) => (radii[i + 1]! - radii[i]!) * 6371)).toEqual([1221, 2264, 2856, 30].map((n) => expect.closeTo(n, 9)));
    expect(1221 + 2264 + 2856 + 30).toBe(6371);
    const magma = file.parts.find((p) => p.id === 'volcano-storage')!.primitive!;
    for (const id of ['earth-inner-core', 'earth-outer-core']) {
      const core = file.parts.find((p) => p.id === id)!;
      expect(`${core.detail.en} ${core.summary.en}`).toMatch(/metal/);
      expect(core.primitive!.tint).not.toBe(magma.tint);
    }
  });
});

describe('inside-the-earth: the local geological models preserve the explanatory constraints', () => {
  const part = (id: string) => file.parts.find((p) => p.id === id)!;
  it('each moving boundary block carries its touching crust and mantle as one logical part', () => {
    for (const id of ['edge-div-left', 'edge-div-right', 'edge-trans-left', 'edge-trans-right', 'edge-sub-left']) {
      const body = part(id).primitive!, crust = part(id).extra![0]!;
      expect(body.kind).toBe('box');
      expect(crust.kind).toBe('box');
      if (body.kind !== 'box' || crust.kind !== 'box') throw new Error('a boundary block must contain its two layers');
      expect(body.at[0]).toBe(crust.at[0]);
      expect(body.at[2]).toBe(crust.at[2]);
      expect(body.size[0]).toBe(crust.size[0]);
      expect(body.size[2]).toBe(crust.size[2]);
      expect(body.at[1] + body.size[1]! / 2).toBeCloseTo(crust.at[1] - crust.size[1]! / 2, 12);
      expect(crust.size[1]!).toBeLessThan(body.size[1]!);
    }
    for (const id of ['edge-trans-left', 'edge-trans-right']) closeVector(offset('edge-slide', id).slice(0, 2), [0, 0]);
    expect(offset('edge-slide', 'edge-trans-left')[2]).toBe(-offset('edge-slide', 'edge-trans-right')[2]!);
  });

  it('the descending slab joins the incoming plate across its full thickness, and partial melt sits above it', () => {
    const incoming = part('edge-sub-left').primitive!, crust = part('edge-sub-left').extra![0]!, slab = part('edge-slab').primitive!;
    if (incoming.kind !== 'box' || crust.kind !== 'box' || slab.kind !== 'extrude') throw new Error('the slab must be a continuous extruded plate');
    const joinX = incoming.at[0] + incoming.size[0]! / 2;
    const join = slab.shape.filter(([x]) => Math.abs(x - joinX) < 1e-12);
    expect(join).toHaveLength(2);
    expect(join.map(([, y]) => y).sort()).toEqual([incoming.at[1] - incoming.size[1]! / 2, crust.at[1] + crust.size[1]! / 2].sort().map((v) => expect.closeTo(v, 12)));
    expect(slab.depth).toBe(incoming.size[2]);
    expect(part('edge-sub-left').connects).toContain('edge-slab');
    const melt = part('edge-melt').primitive!;
    const top = slab.shape.slice(0, slab.shape.length / 2);
    const segment = top.findIndex((p, i) => p[0] <= melt.at[0] && (top[i + 1]?.[0] ?? -Infinity) >= melt.at[0]);
    expect(segment).toBeGreaterThanOrEqual(0);
    const a = top[segment]!, b = top[segment + 1]!;
    const slabY = a[1] + (melt.at[0] - a[0]) / (b[0] - a[0]) * (b[1] - a[1]);
    expect(melt.at[1]).toBeGreaterThan(slabY);
  });

  it('loads a locked contact before releasing slip, keeps the two markers with their blocks, and marks the epicentre directly above the focus', () => {
    const loaded = file.poses!['fault-loaded']!.parts;
    closeVector(loaded['fault-marker-lock']!.offset!, [0, 0, 0]);
    for (const side of ['left', 'right']) {
      expect(loaded[`fault-marker-${side}`]!.rotation!.some((v) => v !== 0)).toBe(true);
      closeVector(offset('fault-slipped', `fault-marker-${side}`), offset('fault-slipped', `fault-${side}`));
      expect(Math.abs(offset('fault-slipped', `fault-${side}`)[2]!)).toBeCloseTo(0.15, 12);
      expect(file.poses!['fault-slipped']!.parts[`fault-marker-${side}`]!.rotation ?? [0, 0, 0]).toEqual([0, 0, 0]);
    }
    const focus = part('fault-focus').primitive!, epicentre = part('fault-epicentre').primitive!;
    expect(focus.at[0]).toBe(epicentre.at[0]);
    expect(focus.at[2]).toBe(epicentre.at[2]);
    expect(epicentre.at[1]).toBeGreaterThan(focus.at[1]);
    const waveChapter = chapters.find((c) => c.id === 'slip-and-waves');
    const poses = waveChapter.state.beats.map((b: { pose?: string }) => b.pose);
    expect(poses).toContain('fault-loaded');
    expect(poses).toContain('fault-slipped');
    expect(poses.indexOf('fault-loaded')).toBeLessThan(poses.indexOf('fault-slipped'));
  });
});

describe('inside-the-earth: the finite content contract', () => {
  it('ships exactly the useful 91 parts, 27 poses, six controls, seven outputs and four bindings', () => {
    const fixed = `earth-crust earth-mantle earth-outer-core earth-inner-core plate-crust plate-rigid-mantle plate-deep-mantle edge-div-left edge-div-right edge-sub-left edge-sub-right edge-slab edge-melt edge-trans-left edge-trans-right collision-fold volcano-cone volcano-host volcano-storage volcano-conduit volcano-vent volcano-bubbles volcano-lava volcano-ash fault-left fault-right fault-marker-left fault-marker-lock fault-marker-right fault-focus fault-epicentre sea-coast building-ground building-foundation building-frame building-floors building-core`.split(' ');
    expect(file.parts.map((p) => p.id).sort()).toEqual([...fixed, ...waves, ...water].sort());
    expect(Object.keys(file.poses!)).toHaveLength(27);
    expect(sim.controls.map((c) => c.id).sort()).toEqual(['flow-mode', 'sea-step', 'sea-uplift', 'water-depth', 'wave-kind', 'wave-step']);
    expect(sim.outputs).toHaveLength(7);
    expect(sim.bind).toHaveLength(4);
    expect(sim.kind).toBe('table');
    const sourceFile = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')) as { sources: { id: string; design?: boolean }[] };
    const sources = new Map(sourceFile.sources.map((s) => [s.id, s]));
    expect(tableSourceIssues(sim.table!, sim.outputs, sources)).toEqual([]);
  });

  it('has one and only one sourced table row for every permitted combination, with no extra keys or states', () => {
    expect(Object.keys(sim.table!.experiments).sort()).toEqual(['depth', 'sea', 'wave']);
    let count = 0;
    for (const [id, experiment] of Object.entries(sim.table!.experiments)) {
      const combinations = tableCombinations(experiment.keys.map((id) => sim.controls.find((c) => c.id === id)!));
      expect(experiment.rows, id).toHaveLength(id === 'depth' ? 3 : 18);
      for (const values of combinations) expect(experiment.rows.filter((r) => experiment.keys.every((k) => r.when[k] === values[k])), `${id} ${JSON.stringify(values)}`).toHaveLength(1);
      for (const row of experiment.rows) {
        expect(Object.keys(row.when).sort()).toEqual([...experiment.keys].sort());
        expect(row.source).toContain('S63');
        for (const [key, value] of Object.entries(row.set)) {
          const output = sim.outputs.find((o) => o.id === key)!;
          expect(output).toBeDefined();
          expect(output.from).toBeUndefined();
          if (typeof value === 'string') expect(output.states?.[value]).toBeDefined();
        }
      }
      count += experiment.rows.length;
    }
    expect(count).toBe(39);
    expect(resolveSimValues(sim, decodeSimParam('wave-step.99~wave-kind.invalid~sea-uplift.no~water-depth.0~unknown.4'))).toEqual(resolveSimValues(sim, {}));
  });

  it('contains eight independent chapters, 36 bilingual captions, visible indexed parts and only the two intended cards', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([3, 5, 5, 4, 4, 5, 5, 5]);
    expect(chapters.filter((c) => c.state.sim.try).map((c) => c.id)).toEqual(['slip-and-waves', 'moving-the-sea']);
    for (const ch of chapters) {
      const st = ch.state;
      expect(Object.keys(st.sim.set).sort(), ch.id).toEqual(sim.controls.map((c) => c.id).sort());
      expect(st).toMatchObject({ view: 'assembled', explode: 0, cutaway: 'none', run: false, part: null, pose: null, ghost: [] });
      expect(st.camera).toBeDefined();
      for (const id of st.index.parts) {
        const p = file.parts.find((p) => p.id === id)!;
        expect(p, `${ch.id} ${id}`).toBeDefined();
        expect(st.hide).not.toContain(id);
        expect(st.layers).toContain(p.group);
      }
      for (const beat of st.beats) {
        expect(beat.caption.en.length).toBeGreaterThan(20);
        expect(beat.caption.zh.length).toBeGreaterThan(8);
        const labels = beat.labels ?? st.labels;
        expect(labels.length).toBeLessThanOrEqual(6);
        for (const id of labels) expect(st.index.parts, `${ch.id} label ${id}`).toContain(id);
        if (beat.part) expect(st.index.parts).toContain(beat.part);
      }
    }
  });
});

describe('inside-the-earth: captions select the simulated states they describe', () => {
  it('binds the P/S captions to the expected snapshots and front distances', () => {
    const wave = chapters.find((c) => c.id === 'slip-and-waves');
    expect(wave.state.beats.map((b: { sim: { set: Record<string, unknown> } }) => b.sim.set['wave-step'])).toEqual([0, 0, 0, 3, 5]);
    expect(out({ ...wave.state.sim.set, ...wave.state.beats[3].sim.set })['wave-front']).toBe(3);
    expect(out({ ...wave.state.sim.set, ...wave.state.beats[4].sim.set })['wave-front']).toBe(2.5);
    expect(wave.state.beats[3].caption.en).toMatch(/upper P/);
    expect(wave.state.beats[4].caption.en).toMatch(/lower S/);
  });

  it('binds the sea captions and prediction to the source, snapshot and depth they describe', () => {
    const sea = chapters.find((c) => c.id === 'moving-the-sea');
    const expected = [
      ['no-uplift-in-model', 'water-rest', 4000], ['displaced', 'water-at-1', 4000],
      ['spreading', 'water-at-3', 4000], ['spreading', 'water-at-3', 100], ['spreading', 'water-at-3', 4000],
    ];
    sea.state.beats.forEach((b: { sim: { set: Record<string, unknown> } }, i: number) => {
      const o = out({ ...sea.state.sim.set, ...b.sim.set });
      expect([o['water-stage'], o['water-shape']]).toEqual(expected[i]!.slice(0, 2));
      expect(Number(o['longwave-ms'])).toBeCloseTo(Math.sqrt(9.8 * Number(expected[i]![2])), 10);
    });
    const prediction = sea.state.sim.try.predict;
    expect(prediction.start).toEqual({ 'sea-uplift': true, 'sea-step': 3, 'water-depth': 4000 });
    expect(prediction.change).toEqual({ 'water-depth': 100 });
    expect(prediction.observe).toBe('longwave-kmh');
  });
});

describe('inside-the-earth: independently calculated single-cycle wave snapshots', () => {
  for (let k = 0; k <= 8; k++) {
    it(`snapshot ${k}: both rows vibrate about their own rest positions; the inspected type changes only the front`, () => {
      const pose = `wave-snap-${k}`;
      expect(file.poses![pose]!.duration).toBe(0);
      expect(Object.keys(file.poses![pose]!.parts).sort()).toEqual([...waves].sort());
      for (const kind of ['p', 's']) {
        const set = { 'wave-kind': kind, 'wave-step': k };
        const o = out(set);
        expect(o['wave-shape']).toBe(k ? `wave-at-${k}` : 'wave-rest');
        expect(o['wave-stage']).toBe(k ? 'travelling' : 'rest');
        expect(o['wave-front']).toBe((kind === 'p' ? 4 : 2) * k / 4);
        const effects = fx(set);
        for (const wave of ['p', 's']) for (let i = 0; i < 17; i++) {
          const tau = k / 4 - (i / 2) / (wave === 'p' ? 4 : 2);
          const u = tau < 0 || tau > 1 ? 0 : 0.08 * Math.sin(2 * Math.PI * tau);
          const id = `wave-${wave}-${letters[i]}`;
          expect(effects.poses.get(id)).toBe(pose);
          closeVector(offset(pose, id), wave === 'p' ? [u, 0, 0] : [0, u, 0]);
        }
      }
    });
  }
  it('pins the nontrivial e-marker examples and zero wavefront/end points from the spec', () => {
    closeVector(offset('wave-snap-3', 'wave-p-e'), [0.08, 0, 0]);
    closeVector(offset('wave-snap-3', 'wave-s-e'), [0, 0, 0]);
    closeVector(offset('wave-snap-5', 'wave-p-e'), [-0.08, 0, 0]);
    closeVector(offset('wave-snap-5', 'wave-s-e'), [0, 0.08, 0]);
    for (const id of ['wave-p-a', 'wave-s-a', 'wave-p-q']) closeVector(offset('wave-snap-8', id), [0, 0, 0]);
  });
});

describe('inside-the-earth: independently calculated balanced sea displacements and long-wave speed', () => {
  for (let q = 0; q <= 8; q++) {
    it(`snapshot ${q}: signed displacement balances; the source retains its offset until switched off`, () => {
      const pose = `sea-snap-${q}`;
      expect(file.poses![pose]!.duration).toBe(0);
      expect(Object.keys(file.poses![pose]!.parts).sort()).toEqual([...water].sort());
      const K = (v: number) => Math.max(0, 1 - Math.abs(v));
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        const j = i - 8, d = (q - 1) / 2;
        const eta = q === 0 ? 0 : 0.06 * (K(j - d) + K(j + d) - K(j - 1 - d) - K(j + 1 + d));
        closeVector(offset(pose, `sea-column-${letters[i]}`), [0, eta, 0]);
        sum += offset(pose, `sea-column-${letters[i]}`)[1]!;
      }
      expect(Math.abs(sum)).toBeLessThan(1e-12);
      for (const [id, amount] of [['sea-bed', 0.06], ['sea-bed-left', -0.03], ['sea-bed-right', -0.03]] as const) closeVector(offset(pose, id), [0, q ? amount : 0, 0]);
      for (const uplift of [false, true]) {
        const set = { 'sea-step': q, 'sea-uplift': uplift };
        const o = out(set), effects = fx(set);
        expect(o['water-stage']).toBe(!uplift ? 'no-uplift-in-model' : q === 0 ? 'rest' : q === 1 ? 'displaced' : 'spreading');
        expect(o['water-shape']).toBe(uplift && q ? `water-at-${q}` : 'water-rest');
        for (const id of water) expect(effects.poses.get(id)).toBe(uplift ? pose : 'sea-snap-0');
        expect(effects.poses.has('sea-coast')).toBe(false);
      }
    });
  }

  it.each([[100, '31.3', '112.7'], [1000, '99.0', '356.4'], [4000, '198.0', '712.8']] as const)('depth %i m keeps full precision and formats the two units once', (h, ms, kmh) => {
    const o = out({ 'water-depth': h, 'sea-uplift': false });
    expect(Number(o['longwave-ms'])).toBeCloseTo(Math.sqrt(9.8 * h), 10);
    expect(Number(o['longwave-kmh'])).toBeCloseTo(Number(o['longwave-ms']) * 3.6, 10);
    expect(outputText(sim.outputs.find((o) => o.id === 'longwave-ms')!, o['longwave-ms']!, 'en')).toBe(ms);
    expect(outputText(sim.outputs.find((o) => o.id === 'longwave-kmh')!, o['longwave-kmh']!, 'en')).toBe(kmh);
    expect(o['water-stage']).toBe('no-uplift-in-model');
  });

  it('isolates wave, water snapshots and depth experiments over the full cross-product', () => {
    const baseline = { 'wave-kind': 's', 'wave-step': 5, 'sea-uplift': true, 'sea-step': 3, 'water-depth': 4000 };
    const b = out(baseline);
    for (const kind of ['p', 's']) for (let k = 0; k <= 8; k++) {
      const o = out({ ...baseline, 'wave-kind': kind, 'wave-step': k });
      for (const id of ['water-shape', 'water-stage', 'longwave-ms', 'longwave-kmh']) expect(o[id]).toBe(b[id]);
    }
    for (const uplift of [false, true]) for (let q = 0; q <= 8; q++) for (const h of [100, 1000, 4000]) {
      const o = out({ ...baseline, 'sea-uplift': uplift, 'sea-step': q, 'water-depth': h });
      for (const id of ['wave-shape', 'wave-stage', 'wave-front']) expect(o[id]).toBe(b[id]);
      const atSameSnapshot = out({ 'sea-uplift': uplift, 'sea-step': q });
      for (const id of ['water-shape', 'water-stage']) expect(o[id]).toBe(atSameSnapshot[id]);
    }
  });
});
