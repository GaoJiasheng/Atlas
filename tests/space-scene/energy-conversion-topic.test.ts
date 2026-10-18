/**
 * The published `energy-conversion` topic (docs/31): every simulated number
 * its captions and chapter bodies state is what the model gives for that
 * beat's settings (or a design value of the study, S1); every chain keeps
 * its energy at every node for every setting it reads; the energy bars add up
 * to 100 % through every run; the fact-audit corrections hold in the data;
 * the syllabus boundary (docs/31 §0-3, §0-4) holds in the main line.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { energyBarValues } from '../../src/engines/space-scene/lib/sim/bars';
import { isTimeline, type Timeline } from '../../src/engines/space-scene/lib/sim/timeline';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/energy-conversion');
const parts = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sim: SimData = simSchema.parse(parts.sim);
const energy = sim.energy!;

interface Beat {
  sim?: { set?: Record<string, unknown> };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  set: Record<string, unknown>;
  beats: Beat[];
  body: string;
}
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters'))
  .filter((f) => f.endsWith('.mdx'))
  .sort()
  .map((f) => {
    const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
    const [, front, ...rest] = text.split(/^---$/m);
    const fm = parseYaml(front!);
    return { id: fm.id, set: fm.state.sim?.set ?? {}, beats: fm.state.beats, body: rest.join('---') };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;

function outputsAt(ch: string, beat: number): Record<string, unknown> {
  const c = chapter(ch);
  const values = resolveSimValues(sim, { ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
  return evaluateSim(sim, values) as unknown as Record<string, unknown>;
}
const out = (set: Record<string, unknown>) => evaluateSim(sim, resolveSimValues(sim, set)) as unknown as Record<string, unknown>;

/** [chapter, beat (1-based), output, decimals, shown value, English words, Chinese words] */
const BEAT_NUMBERS: [string, number, string, number, string, string, string][] = [
  ['energy-from-the-sun', 2, 'useful', 0, '21', 'a fifth', '五分之一'],
  ['energy-from-the-sun', 4, 'panel-power', 2, '0.00', 'give no electrical energy', '不产生电能'],
  ['electrical-energy-at-home', 3, 'useful', 0, '40', 'four tenths', '十分之四'],
  ['electrical-energy-at-home', 4, 'useful', 0, '1', 'one part in a hundred', '一百份里只有大约一份'],
  ['up-high-and-moving', 1, 'impact-speed', 1, '4.4', 'four point four metres a second', '每秒四点四米'],
  ['up-high-and-moving', 1, 'bounce-height', 0, '55', 'fifty-five centimetres', '五十五厘米'],
  ['up-high-and-moving', 3, 'bounce-height', 0, '5', 'five centimetres', '五厘米'],
  ['stored-energy', 1, 'run-time', 0, '9', 'nine seconds', '九秒'],
  ['pedal-power', 4, 'lamp-power', 1, '2.8', 'two point eight watts', '二点八瓦'],
  ['pedal-power', 5, 'lamp-power', 2, '0.00', 'goes out', '熄灭'],
  ['pedal-power', 6, 'lamp-power', 2, '0.00', 'stays dark', '不亮'],
  ['never-used-up', 3, 'same-light', 0, '100', 'four times', '四倍'],
  ['never-used-up', 4, 'same-light', 0, '25', 'a quarter', '四分之一'],
];

describe('energy-conversion topic: captions say what the model gives', () => {
  it.each(BEAT_NUMBERS)('%s beat %i: %s = %s', (ch, beat, output, decimals, value, en, zh) => {
    const o = outputsAt(ch, beat);
    expect((o[output] as number).toFixed(decimals)).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it('the clear-noon sunlight in the captions is the model input (900 W/m²) and the kettle takes about 157 s', () => {
    expect(energy.solar!.irradiance.clear).toBe(900);
    expect(chapter('energy-from-the-sun').beats[0]!.caption.en).toContain('nine hundred watts');
    // 1 kg × 4,186 J/(kg °C) × 70 °C ÷ (2,200 W × 85 %): the fact audit's 293.02 kJ and 157 s.
    const q = 1 * 4186 * 70;
    expect(q / 1000).toBeCloseTo(293.02, 2);
    expect(Math.round(q / (2200 * (energy.shares.kettle!['heat-water']! / 100)))).toBe(157);
    expect(chapter('electrical-energy-at-home').beats[4]!.caption.en).toContain('a little over two and a half minutes');
  });

  it('the swing keeps 78 % after eight swings and is paused at a turning point', () => {
    const o = out({ chain: 'swing' });
    expect((o.useful as number).toFixed(0)).toBe('78');
    const run = o['swing-run'] as Timeline;
    const end = energyBarValues(run, { bars: { potential: 'pe', kinetic: 'ke', lost: 'lost' }, lostSplit: { heat: 0.9, sound: 0.1 } }, run.duration)!;
    expect(end.potential).toBeCloseTo(78.37, 1);
    expect(end.kinetic).toBeCloseTo(0, 6);
    expect(end.lost).toBeCloseTo(21.63, 1);
  });

  it('the dynamo levels off below its 3 W rating (fact audit SIM-G-limit)', () => {
    const watts = [0, 5, 10, 15, 20, 25].map((speed) => (out({ chain: 'dynamo', speed })['lamp-power'] as number).toFixed(2));
    expect(watts).toEqual(['0.00', '1.23', '2.21', '2.59', '2.75', '2.84']);
    const bright = [0, 5, 10, 15, 20, 25].map((speed) => (out({ chain: 'dynamo', speed }).brightness as number).toFixed(0));
    expect(bright).toEqual(['0', '41', '74', '86', '92', '95']);
    expect(energy.dynamo!.imax ** 2 * energy.dynamo!.lampOhms).toBeLessThanOrEqual(energy.dynamo!.rated);
  });

  it('LED and filament lamps give the same light from 25 % and 100 % of the gas (SIM-H-same-light)', () => {
    const led = out({ chain: 'gas-to-home', 'lamp-type': 'led' });
    const fil = out({ chain: 'gas-to-home', 'lamp-type': 'filament' });
    expect(led['same-light']).toBe(25);
    expect(fil['same-light']).toBe(100);
    expect(led['lamp-glow']).toBe(fil['lamp-glow']);
    expect((fil.links as Record<string, number>)['g-fil-light']).toBe(5);
    expect((fil.links as Record<string, number>)['g-el']).toBe(55);
    expect((fil.links as Record<string, number>)['g-home']).toBe(53);
  });
});

/** Design values (S1 and the cited sources' figures quoted through S1) that the bodies state as inputs. */
const DESIGN = new Set([
  '100 %', '12', '1.953 m²', '900 W/m²', '640 W/m²', '150 W/m²', '30 °C', '2,200 W', '157 s', '58 g', '1 m', '0.57 J',
  '2 times', '2 倍', '3 %', '8', '1.5 s', '2', '4', '6', '3 W', '55 %',
]);

describe('energy-conversion topic: every S1 number in the chapter bodies is the model or the design', () => {
  const grid: Record<string, unknown>[] = [];
  for (const sky of ['clear', 'average', 'overcast', 'night']) for (const liftAt of ['ground', 'top']) grid.push({ chain: 'solar', sky, 'lift-at': liftAt });
  for (const appliance of ['fan', 'lamp', 'speaker', 'kettle']) grid.push({ chain: 'home', appliance });
  for (const drop of [25, 50, 75, 100]) for (const surface of ['tile', 'rubber', 'carpet', 'sand']) grid.push({ chain: 'bounce', drop, surface });
  grid.push({ chain: 'swing' });
  for (const winds of [0, 2, 4, 6, 8]) grid.push({ chain: 'windup', winds });
  grid.push({ chain: 'torch', 'torch-on': true });
  for (const speed of [0, 5, 10, 15, 20, 25]) for (const on of [true, false]) grid.push({ chain: 'dynamo', speed, 'dynamo-on': on });
  for (const lamp of ['led', 'filament']) grid.push({ chain: 'gas-to-home', 'lamp-type': lamp });
  grid.push({ chain: 'whole' });
  const modelled = new Set<string>();
  for (const set of grid) {
    const o = out(set);
    for (const def of sim.outputs) {
      const v = o[def.id];
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      const d = def.decimals ?? 0;
      modelled.add(def.unit ? `${v.toFixed(d)} ${def.unit}` : v.toFixed(d));
    }
    for (const v of Object.values(o.links as Record<string, number>)) modelled.add(`${v} %`);
  }
  // The controls' own values, with their units (15 km/h, 100 cm).
  for (const c of sim.controls) if (c.kind === 'step') for (const v of c.values) modelled.add(c.unit ? `${v} ${c.unit}` : String(v));

  it.each(chapters.map((c) => [c.id, c.body] as const))('%s', (_id, body) => {
    const nums = [...body.matchAll(/<Num s="S1">([^<]+)<\/Num>/g)].map((m) => m[1]!);
    for (const n of nums) expect(modelled.has(n) || DESIGN.has(n), n).toBe(true);
  });
});

describe('energy-conversion topic: energy is kept at every node and the bars add up', () => {
  const combos: Record<string, unknown>[] = [];
  for (const sky of ['clear', 'average', 'overcast', 'night']) for (const liftAt of ['ground', 'top']) combos.push({ chain: 'solar', sky, 'lift-at': liftAt });
  for (const appliance of ['fan', 'lamp', 'speaker', 'kettle']) combos.push({ chain: 'home', appliance });
  for (const surface of ['tile', 'rubber', 'carpet', 'sand']) for (const letGo of [true, false]) combos.push({ chain: 'bounce', surface, 'let-go': letGo });
  combos.push({ chain: 'swing' }, { chain: 'torch', 'torch-on': true }, { chain: 'torch', 'torch-on': false }, { chain: 'whole' });
  for (const winds of [0, 2, 8]) combos.push({ chain: 'windup', winds });
  for (const speed of [0, 15]) for (const on of [true, false]) combos.push({ chain: 'dynamo', speed, 'dynamo-on': on });
  for (const lamp of ['led', 'filament']) combos.push({ chain: 'gas-to-home', 'lamp-type': lamp });

  it.each(combos.map((c) => [JSON.stringify(c), c] as const))('%s: what goes into each node comes out of it', (_k, set) => {
    const o = out(set);
    const chain = energy.chains[set.chain as string]!;
    const links = o.links as Record<string, number>;
    const sinks = new Set(chain.nodes.filter((n) => n.sink).map((n) => n.id));
    const into = new Map<string, number>();
    const from = new Map<string, number>();
    for (const l of chain.links) {
      into.set(l.to, (into.get(l.to) ?? 0) + (links[l.id] ?? 0));
      from.set(l.from, (from.get(l.from) ?? 0) + (links[l.id] ?? 0));
    }
    for (const n of chain.nodes) {
      if (sinks.has(n.id) || !into.has(n.id) || !from.has(n.id)) continue;
      expect(from.get(n.id), n.id).toBe(into.get(n.id));
    }
  });

  it.each(['bounce-run', 'swing-run', 'toy-run'])('%s: the three bars add up to 100 % at every moment', (id) => {
    const o = out({ chain: 'windup', winds: 6 });
    const run = o[id] as Timeline;
    expect(isTimeline(run)).toBe(true);
    for (let k = 0; k <= 40; k++) {
      const v = energyBarValues(run, { bars: { potential: 'pe', kinetic: 'ke', lost: 'lost' }, lostSplit: { heat: 0.9, sound: 0.1 } }, (run.duration * k) / 40)!;
      expect(v.potential + v.kinetic + v.lost).toBeCloseTo(100, 6);
    }
  });
});

describe('energy-conversion topic: the fact-audit corrections are in the data', () => {
  it('rooftop panels supply the lift and the grid, never the flat', () => {
    const solar = energy.chains.solar!;
    expect(solar.nodes.map((n) => n.part).filter(Boolean)).not.toContain('distribution-board');
    expect(solar.note?.en).toMatch(/counterweight/);
  });

  it('the ball rests on the floor and is lifted by the bottom-of-ball height (ENG-MODEL-02)', () => {
    const ball = parts.parts.find((p: { id: string }) => p.id === 'tennis-ball').primitive;
    const tile = parts.parts.find((p: { id: string }) => p.id === 'surface-tile').primitive;
    expect(ball.at[1] - ball.size[0]).toBeCloseTo(tile.at[1] + tile.size[1] / 2, 4);
  });

  it('the kettle and the LED shares are marked illustrative, the speaker 1 % is a textbook assumption', () => {
    const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; text: { en: string }; note?: { en: string } }[];
    const s1 = sources.find((s) => s.id === 'S1')!;
    expect(s1.note!.en).toMatch(/LED lamp's 40 % light is a model value/);
    expect(s1.note!.en).toMatch(/kettle's, fan's/);
    expect(sources.find((s) => s.id === 'S16')!.note!.en).toMatch(/assumption/);
  });
});

/** The main line: chapter bodies without their <More> boxes, and the captions. */
function mainLine(c: Chapter): string {
  return c.body.replace(/<More[\s\S]*?<\/More>/g, '') + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n');
}

describe('energy-conversion topic: syllabus boundary (docs/31 §0-3, §0-4)', () => {
  it.each(chapters.map((c) => [c.id, c] as const))('%s keeps the sub-terms of potential energy and the law out of the main line', (_id, c) => {
    const text = mainLine(c);
    for (const word of [/chemical potential/i, /gravitational potential/i, /elastic potential/i, /化学势能/, /重力势能/, /弹性势能/, /conservation of energy/i, /能量守恒/, /joule/i, /焦耳/]) {
      expect(text, String(word)).not.toMatch(word);
    }
  });

  it('energy is never "used up": every "used up" is negated, and energy is never said to be made', () => {
    for (const c of chapters) {
      const text = mainLine(c);
      for (const m of text.matchAll(/used up|use up|uses up/gi)) {
        const before = text.slice(Math.max(0, m.index! - 12), m.index!);
        expect(before, `${c.id}: …${before}${m[0]}`).toMatch(/never |not |n't /);
      }
      for (const m of text.matchAll(/用完/g)) {
        const before = text.slice(Math.max(0, m.index! - 6), m.index!);
        expect(before, `${c.id}: …${before}用完`).toMatch(/不会$|能源会$|有一天会$/);
      }
      expect(text).not.toMatch(/(?<!not |do not |does not )\b(make|makes|create|creates) energy/i);
    }
  });

  it('the sub-terms appear nowhere, not even in a More box', () => {
    for (const c of chapters) expect(c.body).not.toMatch(/chemical potential|gravitational potential|elastic potential|化学势能|重力势能|弹性势能/i);
  });

  it('no grades in the text and only Chinese quotation marks in Chinese', () => {
    for (const c of chapters) {
      expect(c.body).not.toMatch(/\bP[3-6]\b|Primary [3-6]|primary [3-6]|小[三四五六]|Foundation/);
      const zh = [...c.body.matchAll(/<Lang zh>([\s\S]*?)<\/Lang>/g)].map((m) => m[1]).join('') + c.beats.map((b) => b.caption.zh).join('');
      // Prose only: the tags' attributes are JSX.
      expect(zh.replace(/<[^>]*>/g, '')).not.toMatch(/[「」『』"]/);
    }
  });
});
