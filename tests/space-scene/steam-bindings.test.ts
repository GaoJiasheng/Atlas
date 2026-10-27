/** Independent arithmetic and actual author-data checks for docs/52 §4.5. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { mechanismSchema } from '../../src/engines/space-scene/mechanism-schema';
import { cellValue } from '../../src/engines/space-scene/lib/sim/table';

const source = JSON.parse(readFileSync(new URL('../../src/content/topics/sample-mechanism/data/parts.json', import.meta.url), 'utf8'));
const fixture = partsFile.parse(source);
const extraBindPath = `sim.bind.${source.sim.bind.length}`;
const experiments = fixture.sim!.table!.experiments;
const num = (value: unknown): number => typeof value === 'number' ? value : cellValue(value as { value: number; decimals: number });
const area = Math.PI * 0.47625 ** 2 / 4, rodArea = Math.PI * 0.04 ** 2 / 4;
const forceN = (top: number, bottom: number) => 1000 * (top * (area - rodArea) + 101.325 * rodArea - bottom * area);

describe('steam teaching tables use the existing table sim', () => {
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

describe('strict mechanism author errors include exact paths and targets', () => {
  it('accepts the draft fixture and defaults old parts files to no mechanisms', () => {
    expect(fixture.mechanisms).toHaveLength(1);
    const old = structuredClone(source); delete old.mechanisms;
    expect(partsFile.parse(old).mechanisms).toEqual([]);
  });
  const cases: [string, (p: any) => void, string][] = [
    ['missing role', (p) => delete p.mechanisms[0].parts.beam, 'mechanisms.0.parts.beam'],
    ['unknown role field', (p) => p.mechanisms[0].parts.piston.unknown = true, 'mechanisms.0.parts.piston'],
    ['unknown mechanism field', (p) => p.mechanisms[0].unknown = true, 'mechanisms.0'],
    ['unknown part', (p) => p.mechanisms[0].parts.beam.part = 'missing-beam', 'mechanisms.0.parts.beam'],
    ['unknown flow', (p) => p.mechanisms[0].ports.upperIn.flow.id = 'missing-steam', 'mechanisms.0.ports.upperIn.flow.id'],
    ['unknown path', (p) => p.mechanisms[0].ports.upperIn.flow.path = 'missing-port', 'mechanisms.0.ports.upperIn.flow.path'],
    ['duplicate part driver', (p) => p.mechanisms[0].parts.piston.part = 'beam', 'mechanisms.0.parts.piston'],
    ['duplicate gate', (p) => p.mechanisms[0].ports.lowerIn.flow = p.mechanisms[0].ports.upperIn.flow, 'mechanisms.0.ports.lowerIn.flow'],
    ['bad branch', (p) => p.mechanisms[0].geometry.beamBranch = 0, 'mechanisms.0.geometry.beamBranch'],
    ['unsupported ratio', (p) => p.mechanisms[0].geometry.innerFraction = 0.4, 'mechanisms.0.geometry.innerFraction'],
    ['unreachable circles', (p) => p.mechanisms[0].geometry.connectingRodM = 0.1, 'mechanisms.0.geometry'],
    ['insufficient clearance', (p) => p.mechanisms[0].geometry.radialDisplayClearanceM = 0.0001, 'mechanisms.0.geometry'],
    ['wrong nominal stroke', (p) => p.mechanisms[0].geometry.nominalStrokeM = 1, 'mechanisms.0.geometry.nominalStrokeM'],
    ['invalid phase control', (p) => p.sim.controls.find((c: any) => c.id === 'phase-deg').values = [0, 180], 'mechanisms.0.clock.phaseControl'],
    ['unknown rate control', (p) => p.mechanisms[0].clock.rateControl = 'unknown-rate', 'mechanisms.0.clock.rateControl'],
    ['wrong rest endpoint', (p) => p.mechanisms[0].parts.beam.restEndpoints[0][0] += 1, 'mechanisms.0.parts.beam.restEndpoints.0'],
    ['animated valve', (p) => p.animations.push({ id: 'valve-spin', kind: 'rotate', target: 'valve-upper-in', axis: [0, 1, 0], rpm: 10 }), 'animations.0.target'],
    ['posed rod', (p) => p.poses['gov-slow'].beam = { offset: [0, 1, 0] }, 'poses.gov-slow.beam'],
    ['sim offset conflict', (p) => p.sim.bind.push({ control: 'phase-deg', part: 'beam', offset: { axis: [1, 0, 0], per: 1 } }), `${extraBindPath}.offset`],
    ['sim ring placement conflict', (p) => p.sim.bind.push({ control: 'phase-deg', part: 'beam', at: 'ring' }), `${extraBindPath}.at`],
    ['sim sphere placement conflict', (p) => p.sim.bind.push({ control: 'phase-deg', part: 'beam', place: { centre: [0, 0, 0], radius: 1 } }), `${extraBindPath}.place`],
    ['sim gated-flow conflict', (p) => p.sim.bind.push({ control: 'phase-deg', flow: 'port-steam', paths: ['upper'], visible: true }), extraBindPath],
    ['mesh driver conflict', (p) => p.parts.find((x: any) => x.id === 'beam').mesh = 'beam-mesh', 'mechanisms.0.parts.beam'],
    ['rig driver conflict', (p) => p.rig = { joints: { shoulder: { node: 'beam', axes: { flexion: [0, 0, 1] } } } }, 'mechanisms.0.parts.beam'],
    ['bilateral driver conflict', (p) => p.parts.find((x: any) => x.id === 'beam').bilateral = true, 'mechanisms.0.parts.beam'],
    ['tidal gate conflict', (p) => { p.animations.push({ id: 'tidal-clock', kind: 'oscillate', target: 'governor-spindle', axis: [1, 0, 0], amplitude: 1, hz: 1 }); p.flows.find((f: any) => f.id === 'port-steam').tidal = { sync: 'tidal-clock' }; }, 'mechanisms.0.ports.upperIn.flow'],
    ['zero valve lift', (p) => p.mechanisms[0].ports.upperIn.openOffset = [0, 0, 0], 'mechanisms.0.ports.upperIn.openOffset'],
  ];
  it.each(cases)('%s', (_label, mutate, path) => {
    const data = structuredClone(source); mutate(data); const result = partsFile.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((x) => x.path.join('.') === path)).toBe(true);
  });
  it('rejects nonfinite coordinates and lengths, extra roles and a second mechanism', () => {
    for (const value of [NaN, Infinity, -Infinity]) {
      const m = structuredClone(source.mechanisms[0]); m.origin[0] = value; expect(mechanismSchema.safeParse(m).success).toBe(false);
    }
    const data = structuredClone(source); data.mechanisms.push(structuredClone(data.mechanisms[0])); expect(partsFile.safeParse(data).success).toBe(false);
  });
});
