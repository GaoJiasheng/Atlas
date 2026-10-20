/**
 * The life-cycle ring card's layout and words (docs/33 §4.3, §4.6): nodes
 * evenly on the circle, the first at 12 o'clock, clockwise, deterministic;
 * arcs between neighbours with the arrow at the middle; each arc's words =
 * the model's stage length (one decimal), the egg's note, "lays eggs" back
 * round; the in-water band behind exactly the water stages; the group
 * bracket; the second ring; the ring as words in English and Chinese.
 */
import { describe, expect, it } from 'vitest';
import { cycleArcWords, cycleGroups, cycleSummary, daysText, ringLayout, ringPoint } from '../../src/engines/space-scene/lib/sim/cycle';
import { solveLifeCycle, stageSpans } from '../../src/engines/space-scene/lib/sim/lifecycle';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { formatReading } from '../../src/engines/space-scene/lib/telemetry';
import { aedesSim } from './fixtures/aedes-cycle';

const lc = aedesSim.lifeCycle!;
const opts = { cx: 150, cy: 106, radius: 76, groups: cycleGroups(lc) };
const lay = ringLayout(lc.stages, opts);
const angleOf = (x: number, y: number) => ((Math.atan2(x - opts.cx, -(y - opts.cy)) * 180) / Math.PI + 360) % 360;

describe('ring layout', () => {
  it('first stage at 12 o\'clock, the rest evenly spaced clockwise on the circle', () => {
    expect(lay.nodes.map((n) => n.id)).toEqual(['egg', 'l1', 'l2', 'l3', 'l4', 'pupa', 'adult']);
    expect(lay.nodes[0]).toMatchObject({ x: 150, y: 30, angle: 0 });
    lay.nodes.forEach((n, i) => {
      expect(Math.hypot(n.x - opts.cx, n.y - opts.cy)).toBeCloseTo(76, 1);
      expect(n.angle).toBeCloseTo((i * 360) / 7, 9);
      expect(angleOf(n.x, n.y)).toBeCloseTo((i * 360) / 7, 0);
    });
    // Clockwise on screen (y down): the second node is right of the first, the last left of it.
    expect(lay.nodes[1]!.x).toBeGreaterThan(opts.cx);
    expect(lay.nodes[6]!.x).toBeLessThan(opts.cx);
  });
  it('deterministic', () => {
    expect(JSON.stringify(ringLayout(lc.stages, opts))).toBe(JSON.stringify(lay));
  });
  it('group stages a size smaller; a bracket inside the ring spanning them', () => {
    expect(lay.nodes.filter((n) => n.small).map((n) => n.id)).toEqual(['l1', 'l2', 'l3', 'l4']);
    expect(lay.nodes.find((n) => n.id === 'egg')!.r).toBeGreaterThan(lay.nodes.find((n) => n.id === 'l1')!.r);
    expect(lay.brackets).toHaveLength(1);
    expect(lay.brackets[0]!.group).toBe('larva');
    const lbl = lay.brackets[0]!.label;
    expect(Math.hypot(lbl.x - opts.cx, lbl.y - opts.cy)).toBeLessThan(76 - 28);
  });
  it('one arc between each pair of neighbours, the last back to the first; the arrow at the middle, heading clockwise', () => {
    expect(lay.arcs.map((a) => `${a.from}>${a.to}`)).toEqual(['egg>l1', 'l1>l2', 'l2>l3', 'l3>l4', 'l4>pupa', 'pupa>adult', 'adult>egg']);
    lay.arcs.forEach((a, i) => {
      const mid = (i + 0.5) * (360 / 7);
      expect(a.arrow.rotate).toBeCloseTo(mid, 1);
      expect(angleOf(a.arrow.x, a.arrow.y)).toBeCloseTo(mid, 0);
      expect(a.d).toMatch(/^M [\d.]+ [\d.]+ A 76 76 0 0 1 [\d.]+ [\d.]+$/);
    });
  });
  it('the in-water band lies behind the water stages only; the wall stage gets a stroke', () => {
    expect(lay.bands).toHaveLength(1);
    expect(lay.bands[0]!.stages).toEqual(['l1', 'l2', 'l3', 'l4', 'pupa']);
    expect(lay.nodes.filter((n) => n.wall).map((n) => n.id)).toEqual(['egg']);
    const plain = ringLayout(lc.stages, { ...opts, places: false });
    expect(plain.bands).toEqual([]);
    expect(plain.nodes.every((n) => n.wall === null)).toBe(true);
  });
  it('names and arc words sit outside the ring; anchored away from it', () => {
    for (const n of lay.nodes) expect(Math.hypot(n.label.x - opts.cx, n.label.y - opts.cy)).toBeGreaterThan(76);
    expect(lay.nodes[0]!.label.anchor).toBe('middle');
    expect(lay.nodes[1]!.label.anchor).toBe('start');
    expect(lay.nodes[6]!.label.anchor).toBe('end');
  });
  it('the second ring: three stages, no band, no wall', () => {
    const second = ringLayout(lc.card!.compare!.stages, { cx: 150, cy: 250, radius: 30, places: false });
    expect(second.nodes.map((n) => n.id)).toEqual(['egg', 'nymph', 'adult']);
    expect(second.arcs).toHaveLength(3);
    expect(second.nodes[0]).toMatchObject({ x: 150, y: 220 });
    expect(ringPoint(0, 0, 10, 90)).toEqual({ x: 10, y: 0 });
  });
});

describe('ring words', () => {
  const at = (temp: number) => stageSpans(lc, temp)!.spans;
  it('each arc says the model\'s stage length, one decimal; the egg its note; the adult "lays eggs"', () => {
    for (const temp of [20, 25, 28, 32]) {
      const words = cycleArcWords(lc, at(temp));
      const q = solveLifeCycle(lc, resolveSimValues(aedesSim, { temp }), aedesSim.controls);
      expect(words[0]).toEqual({ kind: 'note', stage: 'egg' });
      expect(words[6]).toEqual({ kind: 'lays' });
      ['l1', 'l2', 'l3', 'l4', 'pupa'].forEach((id, k) => {
        const w = words[k + 1]!;
        expect(w.kind).toBe('days');
        if (w.kind === 'days') expect(daysText(w.days, 'en')).toBe(`${formatReading(q[`days:${id}`] as number, 1)} d`);
      });
    }
    const w28 = cycleArcWords(lc, at(28)).map((w) => (w.kind === 'days' ? daysText(w.days, 'en') : w.kind));
    expect(w28).toEqual(['note', '1.9 d', '0.7 d', '1.0 d', '1.8 d', '1.9 d', 'lays']);
    expect(daysText(1.857, 'zh')).toBe('1.9 天');
  });
  it('screen-reader words, English and Chinese', () => {
    expect(cycleSummary(lc, at(28), '28 °C', 'en')).toBe(
      'Life cycle in this model at 28 °C: Egg, waits for water; Larva 1, 1.9 days; Larva 2, 0.7 days; Larva 3, 1.0 days; Larva 4, 1.8 days; Pupa, 1.9 days; Adult, lays eggs.',
    );
    expect(cycleSummary(lc, at(20), '20 °C', 'zh')).toBe('这个模型里水温 20 °C 时的生活史：卵，等水来；一龄，3.0 天；二龄，1.5 天；三龄，1.6 天；四龄，3.2 天；蛹，4.1 天；成虫，产卵。');
  });
});
