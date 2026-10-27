/** Independent arithmetic and actual author-data checks for docs/52 §4.5. */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import { partsFile } from '../src/engines/space-scene/schema';
import { parse as parseYaml } from 'yaml';
import { createMechanismFrame, solveMechanism } from '../src/engines/space-scene/lib/mechanism';
import { evaluateSim } from '../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../src/engines/space-scene/lib/sim/controls';
import { cellValue } from '../src/engines/space-scene/lib/sim/table';

const source = JSON.parse(readFileSync(new URL('../src/content/topics/steam-engine/data/parts.json', import.meta.url), 'utf8'));
const fixture = partsFile.parse(source);
const experiments = fixture.sim!.table!.experiments;
const num = (value: unknown): number => typeof value === 'number' ? value : cellValue(value as { value: number; decimals: number });
const area = Math.PI * 0.47625 ** 2 / 4, rodArea = Math.PI * 0.04 ** 2 / 4;
const forceN = (top: number, bottom: number) => 1000 * (top * (area - rodArea) + 101.325 * rodArea - bottom * area);

describe('production steam-engine tables and actual static poses', () => {
  it('reproduces every pressure row from the two piston faces and exposed rod', () => {
    const rows = experiments['pressure-table']!.rows;
    expect(fixture.sim!.kind).toBe('table'); expect(rows).toHaveLength(9);
    for (const row of rows) {
      const cold = row.when['cold-pressure'] as number, rate = row.when['cycle-rate'] as number;
      const down = forceN(110, cold) / 1000, up = -forceN(cold, 110) / 1000, work = (down + up) * 1.2192;
      expect(num(row.set['force-down'])).toBeCloseTo(down, 8); expect(num(row.set['force-up'])).toBeCloseTo(up, 8);
      expect(num(row.set['work-cycle'])).toBeCloseTo(work, 8); expect(num(row.set['indicated-power'])).toBeCloseTo(work * rate / 60, 8);
      expect(num(row.set['newcomen-force'])).toBeCloseTo((101.325 - cold) * area, 8);
      expect(row.source).toContain('S1');
    }
    const defaults = rows.find((r) => r.when['cold-pressure'] === 20 && r.when['cycle-rate'] === 10)!.set;
    expect(num(defaults['force-down'])).toBeCloseTo(16.02164000431131, 8); expect(num(defaults['force-up'])).toBeCloseTo(15.930345321797988, 8);
    expect(num(defaults['work-cycle'])).toBeCloseTo(38.95586050959246, 8); expect(num(defaults['indicated-power'])).toBeCloseTo(6.492643418265409, 8);
    expect(num(defaults['newcomen-force'])).toBeCloseTo(14.487182485876407, 8);
    expect(Math.abs(forceN(101.325, 101.325))).toBeLessThan(1e-9);
    expect(Math.abs(forceN(110, 110))).toBeGreaterThan(1);
    expect(rows.filter((r) => r.when['cycle-rate'] === 10).map((r) => num(r.set['force-down']))).toEqual(expect.arrayContaining([
      expect.closeTo(16.0216400043, 8), expect.closeTo(10.6774595607, 8), expect.closeTo(5.3332791171, 8),
    ]));
  });
  it('reproduces the three static governor positions and preserves every actual rigid rod', () => {
    const expected = [[60, 0.503019594234333, 84.92403502048649], [90, 0.7791198196597037, 50], [120, 0.8757548985585832, 36.26315839616716]];
    for (const [n, h, opening] of expected) {
      const row = experiments['governor-table']!.rows.find((r) => r.when['governor-rpm'] === n)!;
      const cosine = 9.81 / (0.5 * (2 * Math.PI * n! / 60) ** 2), radius = 0.5 * Math.sqrt(1 - cosine ** 2);
      expect(num(row.set['collar-rise'])).toBeCloseTo(h!, 6); expect(num(row.set['throttle-opening'])).toBeCloseTo(opening!, 6);
      expect(num(row.set['ball-radius'])).toBeCloseTo(radius, 9); expect(num(row.set['ball-angle'])).toBeCloseTo(Math.acos(cosine) * 180 / Math.PI, 9);
      const pose = fixture.poses![row.set['governor-pose'] as string]!; expect(pose.duration).toBe(0);
      const centre = (id: string) => {
        const p = fixture.parts.find((x) => x.id === id)!.primitive!, offset = pose.parts[id]!.offset!;
        return [p.at[0] + offset[0], p.at[1] + offset[1]];
      };
      const left = centre('governor-balls'), right = centre('governor-ball-right'), collar = centre('governor-collar');
      expect(left[0]! + right[0]!).toBeCloseTo(2, 12); expect(left[1]).toBeCloseTo(right[1]!, 12);
      expect(collar[1]! - 2).toBeCloseTo(h!, 9);
      const rods = [
        ['governor-upper', [1, 3], left, 0.5], ['governor-upper-right', [1, 3], right, 0.5],
        ['governor-lower', left, collar, 0.5], ['governor-lower-right', right, collar, 0.5],
      ] as const;
      const rodEnds = (id: string) => {
        const p = fixture.parts.find((x) => x.id === id)!.primitive!;
        if (p.kind !== 'box') throw new Error('fixture governor rod must be a box');
        const angle = ((p.rotation?.[2] ?? 0) + (pose.parts[id]!.rotation?.[2] ?? 0)) * Math.PI / 180, c = centre(id), half = p.size[0]! / 2;
        return [[c[0]! - half * Math.cos(angle), c[1]! - half * Math.sin(angle)], [c[0]! + half * Math.cos(angle), c[1]! + half * Math.sin(angle)]];
      };
      for (const [id, a, b, length] of rods) {
        const [actualA, actualB] = rodEnds(id);
        expect(Math.hypot(actualA![0]! - a[0]!, actualA![1]! - a[1]!)).toBeLessThan(1e-9);
        expect(Math.hypot(actualB![0]! - b[0]!, actualB![1]! - b[1]!)).toBeLessThan(1e-9);
        expect(Math.hypot(actualA![0]! - actualB![0]!, actualA![1]! - actualB![1]!)).toBeCloseTo(length, 9);
      }
      const [j, m] = rodEnds('throttle-rod'), [t, crankM] = rodEnds('throttle-crank');
      expect(Math.hypot(j![0]! - collar[0]!, j![1]! - collar[1]!)).toBeLessThan(1e-9);
      expect(Math.hypot(m![0]! - crankM![0]!, m![1]! - crankM![1]!)).toBeLessThan(1e-9);
      expect(t![0]).toBeCloseTo(2, 12); expect(t![1]).toBeCloseTo(2, 12);
      expect(Math.hypot(j![0]! - m![0]!, j![1]! - m![1]!)).toBeCloseTo(1.1, 9);
      expect(Math.hypot(t![0]! - m![0]!, t![1]! - m![1]!)).toBeCloseTo(0.4, 9);
    }
  });
  it('balances all energy rows and provides exactly enough unmodified repeated pieces', () => {
    const rows = experiments['energy-table']!.rows; expect(rows).toHaveLength(3);
    for (const row of rows) {
      const work = num(row.set['useful-work']), reject = num(row.set['heat-out']);
      expect(work + reject).toBe(100); expect(num(row.set['heat-in'])).toBe(100);
      expect(work).toBe(row.when['work-share']);
    }
    for (const [id, count] of [['energy-input', 100], ['energy-work', 30], ['energy-reject', 90]] as const) {
      const p = fixture.parts.find((x) => x.id === id)!; expect(p.repeat!.count).toBe(count); expect(p.extra).toBeUndefined();
    }
  });
});

const DIR = new URL('../src/content/topics/steam-engine/', import.meta.url);
type Text = { en: string; zh: string };
type Scene = {
  sim?: { set?: Record<string, string | number | boolean>; try?: { vary: string; observe: string[]; record?: boolean; replay?: unknown; predict?: { start: Record<string, number>; change: Record<string, number>; observe: string; options: { id: string; means: string; label: Text }[] } } };
  run?: boolean; hide?: string[]; labels?: string[]; layers?: string[]; pose?: string;
  index?: { parts?: string[] }; summary?: Text;
};
type Beat = Scene & { caption: Text };
type Chapter = { id: string; kind?: string; order: number; title: Text; state: Scene & { beats: Beat[] }; body: string };
const chapters: Chapter[] = readdirSync(new URL('chapters/', DIR)).filter(f => f.endsWith('.mdx')).sort().map(f => {
  const text = readFileSync(new URL(`chapters/${f}`, DIR), 'utf8');
  const [, front, ...body] = text.split(/^---$/m);
  return { ...parseYaml(front!), body: body.join('---') };
});
const chapter = (id: string) => chapters.find(c => c.id === id)!;
const at = (id: string, index: number) => {
  const c = chapter(id), b = c.state.beats[index - 1]!;
  const values = resolveSimValues(fixture.sim!, { ...c.state.sim?.set, ...b.sim?.set });
  return { b, values, out: evaluateSim(fixture.sim!, values) };
};
const expectedChapters = ['before-you-start', 'atmospheric-push', 'keep-hot-and-cold-apart', 'power-both-ways', 'parallel-motion', 'sun-and-planet', 'speed-feedback', 'follow-the-energy'];
const expectedParts = `boiler boiler-water furnace steam-main throttle throttle-disc valve-chest valve-upper-in valve-lower-in valve-upper-out valve-lower-out cylinder piston piston-rod beam parallel-inner parallel-outer parallel-bottom radius-rod drive-rod planet sun centre-link shaft flywheel governor-spindle governor-balls governor-ball-right governor-upper governor-upper-right governor-lower governor-lower-right governor-collar throttle-link throttle-rod throttle-crank condenser injection-jet cooling-cistern air-pump pump-piston pump-rod hot-well feed-pump water-pipes load-wheel nc-cylinder nc-piston nc-beam nc-pump nc-chain nc-pump-chain nc-jet energy-input energy-work energy-reject`.split(' ');

describe('steam-engine production content contract', () => {
  it('provides the specified 56 independently selectable parts, four contexts, eight chapters and 36 beats', () => {
    expect(fixture.parts.filter(p => !p.context).map(p => p.id).sort()).toEqual([...expectedParts].sort());
    expect(fixture.parts.filter(p => p.context).map(p => p.id).sort()).toEqual(['engine-frame', 'foundation', 'boiler-seating', 'comparison-support'].sort());
    expect(chapters.map(c => c.id)).toEqual(expectedChapters);
    expect(chapters.map(c => c.state.beats.length)).toEqual([4, 5, 5, 5, 4, 5, 4, 4]);
    expect(chapters.reduce((n, c) => n + c.state.beats.length, 0)).toBe(36);
    expect(chapters.filter(c => c.kind === 'background').map(c => c.id)).toEqual(['before-you-start']);
    expect(fixture.groups.filter(g => g.card !== false && !g.id.endsWith('-flow')).map(g => g.id)).toEqual(['steam-supply', 'working-motion', 'condensing', 'regulation']);
    expect(fixture.groups.find(g => g.id === 'teaching')!.card).toBe(false);
  });

  it.each(expectedChapters)('%s has concise bilingual captions and indexes every label', id => {
    const c = chapter(id), index = c.state.index!.parts!;
    expect(new Set(index).size).toBe(index.length);
    for (const p of index) expect(expectedParts).toContain(p);
    for (const b of c.state.beats) {
      expect(b.caption.en.trim()).not.toBe(''); expect(b.caption.zh.trim()).not.toBe('');
      expect(b.caption.en.trim().split(/\s+/).length).toBeLessThanOrEqual(45);
      for (const label of b.labels ?? c.state.labels ?? []) expect(index, label).toContain(label);
    }
  });

  it('keeps both 14-entry indexes, all 56 selectable parts and four functional cards', () => {
    for (const id of ['before-you-start', 'speed-feedback']) expect(chapter(id).state.index!.parts).toHaveLength(14);
    expect(new Set(chapters.flatMap(c => c.state.index!.parts!)).size).toBe(56);
    const cards = chapters.filter(c => c.state.sim?.try);
    expect(cards.map(c => c.id)).toEqual(['keep-hot-and-cold-apart', 'power-both-ways', 'speed-feedback', 'follow-the-energy']);
    const expected = [
      ['cold-pressure', ['force-down']], ['cold-pressure', ['force-down', 'force-up', 'work-cycle']],
      ['governor-rpm', ['collar-rise', 'throttle-opening']], ['work-share', ['useful-work', 'heat-out']],
    ];
    for (const [i, c] of cards.entries()) {
      const card = c.state.sim!.try!;
      expect([card.vary, card.observe]).toEqual(expected[i]); expect(card.record).toBe(true); expect(card.replay).toBeUndefined();
      const pred = card.predict!;
      expect(pred.options.map(o => [o.id, o.means])).toEqual([['more', 'more'], ['less', 'less'], ['same', 'same']]);
      const read = (set: Record<string, number>) => evaluateSim(fixture.sim!, resolveSimValues(fixture.sim!, { ...c.state.sim!.set, ...set }))[pred.observe] as number;
      expect(read(pred.change)).toBeLessThan(read(pred.start));
    }
  });

  it('uses the same values in the captions, discrete controls and model', () => {
    const down = at('power-both-ways', 4);
    expect(down.out['force-down']).toBeCloseTo(16.02164000431131, 8);
    expect(down.b.caption.en).toContain('sixteen kilonewtons'); expect(down.b.caption.zh).toContain('十六千牛');
    const ledger = at('follow-the-energy', 3);
    expect([ledger.out['heat-in'], ledger.out['useful-work'], ledger.out['heat-out']]).toEqual([100, 20, 80]);
    expect(ledger.b.caption.en).toMatch(/one hundred.*twenty.*eighty/); expect(ledger.b.caption.zh).toMatch(/一百.*二十.*八十/);
    expect(at('keep-hot-and-cold-apart', 5).values['cold-pressure']).toBe(50);
    expect([1, 2, 3, 4].map(i => at('speed-feedback', i).values['governor-rpm'])).toEqual([60, 90, 120, 60]);
    expect([1, 2, 3, 4].map(i => at('parallel-motion', i).values['phase-deg'])).toEqual([0, 90, 180, 270]);
    expect(at('power-both-ways', 2).values['phase-deg']).toBe(0); expect(at('power-both-ways', 3).values['phase-deg']).toBe(180);
  });

  it('separates the continuously driven machine from independent static governor and energy studies', () => {
    for (const i of [4, 5]) {
      const { b, values } = at('sun-and-planet', i);
      expect(values['motion-mode']).toBe('auto'); expect(b.run ?? chapter('sun-and-planet').state.run).toBe(true);
      const hidden = b.hide ?? chapter('sun-and-planet').state.hide ?? [];
      expect(hidden.includes('regulation') || fixture.parts.filter(p => p.group === 'regulation').every(p => hidden.includes(p.id))).toBe(true);
    }
    for (const b of chapter('speed-feedback').state.beats) expect(b.run ?? chapter('speed-feedback').state.run).toBe(false);
    expect(at('keep-hot-and-cold-apart', 3).values['phase-deg']).toBe(180);
    expect(solveMechanism(Math.PI, fixture.mechanisms[0]!.geometry).points.W[1]).toBeGreaterThan(solveMechanism(Math.PI - .001, fixture.mechanisms[0]!.geometry).points.W[1]);
    expect(chapter('follow-the-energy').state.beats[2]!.layers).toEqual(['teaching']);
    expect(chapter('before-you-start').state.beats[1]!.layers).toEqual(['teaching']);
  });

  it('keeps Newcomen rigid bodies unscaled and flexible chains attached at every static end state', () => {
    for (const [id, beta] of [['nc-fill', -12], ['nc-condense', -12], ['nc-power', 12], ['nc-return', -12]] as const) {
      const pose = fixture.poses![id]!; expect(pose.duration).toBe(0);
      const d = -1.5 * beta * Math.PI / 180;
      expect(pose.parts['nc-piston']!.offset).toEqual([0, d, 0]);
      expect(pose.parts['nc-pump']!.offset).toEqual([0, -d, 0]);
      for (const body of ['nc-piston', 'nc-pump', 'nc-beam']) expect(pose.parts[body]!.scale).toBeUndefined();
      expect(pose.parts['nc-jet']).toBeUndefined();
      expect(pose.parts['nc-beam']!.pivot).toEqual([-11, 3.5, 0]);
      expect(pose.parts['nc-beam']!.rotation).toEqual([0, 0, beta]);
      for (const [chain, displacement] of [['nc-chain', d], ['nc-pump-chain', -d]] as const) {
        const primitive = fixture.parts.find(p => p.id === chain)!.primitive!;
        const move = pose.parts[chain]!, centreY = primitive.at[1] + move.offset![1];
        if (primitive.kind !== 'cylinder' || !Array.isArray(move.scale)) throw new Error('NC chains require cylinder geometry and an explicit axial scale');
        const length = primitive.size[2]! * move.scale[1];
        expect(length).toBeGreaterThan(.185); expect(length).toBeLessThan(.815);
        expect(centreY + length / 2).toBeCloseTo(3.5, 12);
        const body = fixture.parts.find(p => p.id === (chain === 'nc-chain' ? 'nc-piston' : 'nc-pump'))!;
        const shaft = chain === 'nc-chain' ? body.extra![0]! : body.primitive!;
        if (shaft.kind !== 'cylinder') throw new Error('NC rod must be cylindrical');
        const rodTop = shaft.at[1] + shaft.size[2]! / 2 + displacement;
        expect(centreY - length / 2).toBeCloseTo(rodTop, 12);
        expect(primitive.at[0]).toBe(shaft.at[0]);
      }
    }
  });

  it('turns the actual throttle disc normal across the fixed steam passage as its opening changes', () => {
    const disc = fixture.parts.find(p => p.id === 'throttle-disc')!.primitive!;
    const body = fixture.parts.find(p => p.id === 'throttle')!.primitive!;
    expect(disc.kind).toBe('cylinder'); expect(body.kind).toBe('lathe');
    expect(body.rotation ?? [0, 0, 0]).toEqual([0, 0, 0]);
    const radians = (v: readonly number[]) => new Euler(v[0]! * Math.PI / 180, v[1]! * Math.PI / 180, v[2]! * Math.PI / 180);
    let previousObstruction = -Infinity;
    for (const rpm of [60, 90, 120]) {
      const row = experiments['governor-table']!.rows.find(r => r.when['governor-rpm'] === rpm)!;
      const pose = fixture.poses![row.set['governor-pose'] as string]!.parts['throttle-disc']!;
      // A cylinder's thin circular face has local Y normal. Apply the mesh rest
      // rotation, then the parent pose; Rx90 would leave it edge-on at every speed.
      const normal = new Vector3(0, 1, 0).applyEuler(radians(disc.rotation ?? [0, 0, 0])).applyEuler(radians(pose.rotation ?? [0, 0, 0]));
      const angle = num(row.set['throttle-opening']) / 100 * Math.PI / 2;
      expect(normal.z).toBeCloseTo(0, 12);
      expect(normal.y).toBeCloseTo(Math.cos(angle), 12);
      expect(normal.x).toBeCloseTo(-Math.sin(angle), 12);
      expect(Math.abs(normal.y)).toBeGreaterThan(previousObstruction);
      previousObstruction = Math.abs(normal.y);
    }
    const flow = fixture.flows.find(f => f.id === 'live-steam')!;
    expect(flow.paths!.find(p => p.id === 'main')!.path.at(-1)).toEqual([2, 2.1, .9]);
    expect(flow.paths!.find(p => p.id === 'after-throttle')!.path[0]).toEqual([2, 1.9, .9]);
  });

  it('retains six bounded material flows, fixed port gates and separate water routes', () => {
    expect(fixture.flows.map(f => f.id).sort()).toEqual(['live-steam', 'port-steam', 'exhaust-steam', 'cooling-water', 'mixed-discharge', 'feed-water'].sort());
    for (const f of fixture.flows) {
      expect(f.whenRun).toBe(true); expect(f.flat).toBe(true); expect(f.clip).toBe(false); expect(f.ends).toBe('fade');
      expect(f.count).toBeLessThanOrEqual(360); expect(f.spread).toBeLessThanOrEqual(.004);
    }
    expect(fixture.flows.some(f => f.id === 'energy-flow')).toBe(false);
    const m = fixture.mechanisms[0]!;
    expect(Object.values(m.ports).map(p => `${p.flow.id}:${p.flow.path}`).sort()).toEqual(['port-steam:upper', 'port-steam:lower', 'exhaust-steam:upper', 'exhaust-steam:lower'].sort());
  });

  it('has 15 complete sourced rows, seven controls, a design source and 16 bilingual terms', () => {
    expect(Object.values(experiments).reduce((n, e) => n + e.rows.length, 0)).toBe(15);
    expect(fixture.sim!.controls.map(c => c.id)).toEqual(['experiment', 'cold-pressure', 'cycle-rate', 'governor-rpm', 'work-share', 'motion-mode', 'phase-deg']);
    const sources = JSON.parse(readFileSync(new URL('data/sources.json', DIR), 'utf8')).sources;
    expect(sources).toHaveLength(16); expect(sources.find((s: { id: string }) => s.id === 'S1').design).toBe(true);
    const terms = JSON.parse(readFileSync(new URL('data/glossary.json', DIR), 'utf8')).terms;
    expect(terms).toHaveLength(16);
    for (const term of terms) {
      expect(term.term.en).toBeTruthy(); expect(term.term.zh).toBeTruthy(); expect(term.definition.en).toBeTruthy(); expect(term.definition.zh).toBeTruthy();
    }
  });

  it('keeps production geometry rigid across the full cycle with the specified stroke and clearance', () => {
    const geometry = fixture.mechanisms[0]!.geometry, frame = createMechanismFrame();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, clearance = Infinity, residual = 0;
    for (let n = 0; n < 32768; n++) {
      solveMechanism(n * 2 * Math.PI / 32768, geometry, frame);
      minX = Math.min(minX, frame.points.D[0]); maxX = Math.max(maxX, frame.points.D[0]);
      minY = Math.min(minY, frame.points.D[1]); maxY = Math.max(maxY, frame.points.D[1]);
      clearance = Math.min(clearance, frame.clearanceMarginM); residual = Math.max(residual, frame.linkResidualM);
      expect(Math.abs(frame.sunAngleRad + frame.planetAngleRad - 2 * frame.thetaRad)).toBeLessThan(1e-10);
    }
    expect(maxY - minY).toBeCloseTo(1.2192000154, 6); expect(minX).toBeCloseTo(-2.500931896, 8); expect(maxX).toBeCloseTo(-2.499137005, 8);
    expect(clearance).toBeGreaterThan(.002); expect(residual).toBeLessThan(1e-9);
    expect(solveMechanism(2 * Math.PI, geometry).shaftTurns).toBeCloseTo(2, 12);
  });
});
