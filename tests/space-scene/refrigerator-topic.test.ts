import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { partsFile, spaceChapterState } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';

// docs/74 (refrigerator): try-it numbers, design-study consistency, and the three engine behaviours the spec asked to check.
const dir = 'src/content/topics/refrigerator';
const file = partsFile.parse(JSON.parse(readFileSync(`${dir}/data/parts.json`, 'utf8')));
const sim = file.sim!;
const chapters = readdirSync(`${dir}/chapters`).filter((n) => n.endsWith('.mdx')).sort().map((n) => {
  const text = readFileSync(`${dir}/chapters/${n}`, 'utf8');
  const front = parse(text.match(/^---\n([\s\S]*?)\n---/)![1]!);
  return { ...front, state: spaceChapterState.parse(front.state), body: text };
});
const run = (set: Record<string, unknown>) => {
  const values = resolveSimValues(sim, set);
  return { values, out: evaluateSim(sim, values) };
};

describe('refrigerator topic', () => {
  it('has seven chapters and 31 beats', () => {
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 4, 4, 4, 5]);
  });

  it('try-it gives the S1 results at 300 s and 600 s (kitchen 28 °C, start 4 °C)', () => {
    const table: [string, string, number, number][] = [
      ['full', 'closed', 4.2, 4.5], ['full', 'thin', 4.7, 5.3], ['full', 'open', 6.7, 9.1],
      ['empty', 'closed', 5.3, 6.6], ['empty', 'thin', 7.8, 11.0], ['empty', 'open', 16.2, 22.2],
    ];
    for (const [contents, setup, at300, at600] of table) {
      expect(run({ contents, setup, 'elapsed-s': 300 }).out['fridge-c'] as number).toBeCloseTo(at300, 0);
      expect(Math.abs((run({ contents, setup, 'elapsed-s': 600 }).out['fridge-c'] as number) - at600)).toBeLessThan(0.06);
    }
  });

  it('the simulated operating point conserves energy where the plate shows it', () => {
    const t = Object.fromEntries(file.telemetry!.filter((r) => 'run' in r).map((r) => [(r.key as { en: string }).en, r]));
    const heatOut = (t['Heat out'] as { run: number }).run;
    const power = (t['Power'] as { run: number }).run;
    expect(heatOut - power).toBe(108); // taken in at COP 1.8 × 60 W
    expect(Math.abs(power * 1.8 - 108)).toBeLessThan(1e-9);
    expect(file.spec!.find((s) => (s.key as { en: string }).en === 'Energy')!.value).toBe('317 kWh/yr');
  });

  it('a control not offered on the card (heater-w) never appears in any try card', () => {
    for (const c of chapters) {
      const card = c.state.sim?.try;
      if (card) expect([card.vary, ...(card.also ?? [])]).not.toContain('heater-w');
    }
  });

  it('sim bindings act on the context food part, and the door pose binding overrides only when the door is open', () => {
    const empty = simEffects(sim, run({ contents: 'empty' }).values, run({ contents: 'empty' }).out);
    expect(empty.hidden.has('food-items')).toBe(true);
    const full = simEffects(sim, run({}).values, run({}).out);
    expect(full.hidden.has('food-items')).toBe(false);
    // Closed: no pose entry, so a chapter / beat pose (doors-open) stays in charge of the doors.
    expect(full.poses.has('fresh-door')).toBe(false);
    const open = simEffects(sim, run({ setup: 'open' }).values, run({ setup: 'open' }).out);
    expect(open.poses.get('fresh-door')).toBe('fresh-door-open');
    const defrost = simEffects(sim, run({ 'heater-w': 250 }).values, run({ 'heater-w': 250 }).out);
    expect(defrost.glow.get('defrost-heater')?.level).toBe(1);
  });
});
