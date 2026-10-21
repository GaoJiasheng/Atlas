/**
 * The `heart-and-lungs` topic (docs/40): the table in parts.json is the
 * engine's author template cell by cell (§2.9), the sim validates against the
 * topic's parts, flows, animations and sources, every number a caption states
 * is the model's output (or a sourced fact) at that beat, the balls on the
 * rack match the outputs, the round shows the right blood segments, the
 * predict-first questions reveal what §5 says, the blood flows are flat and
 * the air flows tidal, and the wording rules of §1.6 and §8.2 hold.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { partSchema } from '../../src/engines/space-scene/schema';
import { simIssues, simSchema, type SimData, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { HEART_LUNGS_SIM } from './fixtures/heart-lungs-table';

const DIR = join(import.meta.dirname, '../../src/content/topics/heart-and-lungs');
const file = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; design?: boolean }[];
const sim: SimData = simSchema.parse(file.sim);
const parts = (file.parts as unknown[]).map((p) => partSchema.parse(p));
const flows = file.flows as { id: string; group: string; flat?: boolean; tidal?: { sync: string }; ends?: string; paths?: { id: string }[] }[];
const animations = file.animations as { id: string; kind: string; target: string; loop?: boolean; hz?: number }[];

interface Beat {
  sim?: { set?: SimValues };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  set: SimValues;
  beats: Beat[];
  predict?: { start?: SimValues; change: SimValues; observe: string; options: { id: string; means: string }[] };
  body: string;
}
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters'))
  .filter((f) => f.endsWith('.mdx'))
  .sort()
  .map((f) => {
    const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
    const [, front, ...rest] = text.split(/^---$/m);
    const fm = parseYaml(front!);
    return { id: fm.id, set: fm.state.sim?.set ?? {}, beats: fm.state.beats, predict: fm.state.sim?.try?.predict, body: rest.join('---') };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const evaluate = (set: SimValues) => evaluateSim(sim, resolveSimValues(sim, set)) as unknown as Record<string, unknown>;
const at = (ch: string, beat: number) => {
  const c = chapter(ch);
  return { ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) };
};

describe('heart-and-lungs: the table', () => {
  it('is the author template, cell by cell (docs/40 §2.9)', () => {
    expect(file.sim.table).toEqual(JSON.parse(JSON.stringify(HEART_LUNGS_SIM.table)));
    expect(file.sim.bind).toEqual(JSON.parse(JSON.stringify(HEART_LUNGS_SIM.bind)));
    expect(file.sim.controls.map((c: { id: string }) => c.id)).toEqual(HEART_LUNGS_SIM.controls.map((c) => c.id));
    expect(file.sim.outputs.map((o: { id: string }) => o.id)).toEqual(HEART_LUNGS_SIM.outputs.map((o) => o.id));
  });

  it('validates against the parts, flows, animations and sources of the topic', () => {
    const ctx = {
      parts: new Set(parts.map((p) => p.id)),
      partData: parts as never,
      flows: new Map(flows.map((f) => [f.id, { paths: f.paths ?? [{ id: 'main' }], own: true }])),
      animations: new Map(animations.map((a) => [a.id, a])),
      poses: new Set(Object.keys(file.poses)),
      countable: new Set(parts.filter((p) => p.repeat).map((p) => p.id)),
      contextParts: new Set(parts.filter((p) => p.context).map((p) => p.id)),
    };
    expect(simIssues(sim, ctx as never).map((x) => `${x.path.join('.')}: ${x.message}`)).toEqual([]);
    expect(tableSourceIssues(sim.table!, sim.outputs, new Map(sources.map((s) => [s.id, s])))).toEqual([]);
    expect(sources.filter((s) => s.design).map((s) => s.id)).toEqual(['S37']);
  });

  it('the rack has a ball for every per cent the table can ask for', () => {
    for (const [id, out] of [['n2-balls', 'n2'], ['o2-balls', 'o2'], ['co2-balls', 'co2'], ['h2o-balls', 'h2o']] as const) {
      const max = Math.max(...['in', 'out'].map((sample) => Math.round(Number(evaluate({ sample })[out]))));
      expect(parts.find((p) => p.id === id)!.repeat!.count, id).toBeGreaterThanOrEqual(max);
    }
    const shown = (sample: string) => {
      const fx = simEffects(sim, resolveSimValues(sim, { sample }), evaluate({ sample }) as never);
      return ['n2-balls', 'o2-balls', 'co2-balls', 'h2o-balls'].map((p) => fx.count.get(p));
    };
    expect(shown('in')).toEqual([78, 21, 0, 1]);
    expect(shown('out')).toEqual([78, 16, 4, 6]);
  });
});

describe('heart-and-lungs: captions say what the model shows', () => {
  it('chapter 2: the jar, breathed in then out', () => {
    expect(evaluate(at('what-changes-in-the-air', 1))).toMatchObject({ n2: 78, o2: 21 });
    expect(chapter('what-changes-in-the-air').beats[0]!.caption.en).toMatch(/78 are nitrogen and 21 are oxygen/);
    expect(evaluate(at('what-changes-in-the-air', 2)).co2).toBe(0.04);
    expect(chapter('what-changes-in-the-air').beats[1]!.caption.en).toMatch(/0\.04 per cent/);
    expect(evaluate(at('what-changes-in-the-air', 3))).toMatchObject({ o2: 16, co2: 4 });
    expect(chapter('what-changes-in-the-air').beats[2]!.caption.en).toMatch(/about 16 parts oxygen.*about 4/);
  });

  it('chapter 4: each beat is the step of the round its caption tells', () => {
    const where = [1, 2, 3, 4, 5].map((b) => evaluate(at('the-blood-route', b)).where);
    expect(where).toEqual(['heart-to-lungs', 'in-lungs', 'lungs-to-heart', 'in-body', 'whole']);
    const blood = [1, 2, 3, 4, 5].map((b) => evaluate(at('the-blood-route', b)).blood);
    expect(blood).toEqual(['poor', 'poor-to-rich', 'rich', 'rich-to-poor', 'both']);
  });

  it('chapter 4 beat 4 shows the blood leaving the heart and changing colour in the body', () => {
    const set = at('the-blood-route', 4);
    const fx = simEffects(sim, resolveSimValues(sim, set), evaluate(set) as never);
    for (const f of ['to-body', 'exchange-body', 'oxygen-muscle', 'co2-muscle']) expect(fx.flows.get(f)?.visible, f).toBe(true);
    for (const f of ['to-lungs', 'from-lungs', 'from-body']) expect(fx.flows.get(f)?.visible, f).toBe(false);
  });

  it('chapter 5: running is faster than rest in breaths and heartbeats, paced in hertz', () => {
    const rest = evaluate(at('three-systems', 3));
    const run = evaluate(at('three-systems', 4));
    expect([rest.breaths, rest.beats, run.breaths, run.beats]).toEqual([20, 90, 40, 165]);
    const fx = simEffects(sim, resolveSimValues(sim, at('three-systems', 4)), run as never);
    expect(fx.animations.get('heartbeat')?.hz).toBeCloseTo(165 / 60, 3);
    expect(fx.animations.get('breathe')?.hz).toBeCloseTo(40 / 60, 3);
    // The heartbeat's own frequency is the resting pace (90 a minute).
    expect(animations.find((a) => a.id === 'heartbeat')!.hz).toBeCloseTo(90 / 60, 6);
  });

  it('the body text quotes the model values of the card', () => {
    const body = chapter('three-systems').body;
    for (const n of ['20', '90', '40', '165']) expect(body).toContain(`<Num s="S37">${n}</Num>`);
  });
});

describe('heart-and-lungs: predict first reveals what the spec says', () => {
  it.each([
    ['nose-windpipe-lungs', 'flows-in', 'in'],
    ['what-changes-in-the-air', 'less', 16],
    ['the-blood-route', 'back-to-heart', 'lungs-to-heart'],
    ['three-systems', 'faster', 165],
  ] as const)('%s', (id, option, value) => {
    const p = chapter(id).predict!;
    const after = evaluate({ ...chapter(id).set, ...(p.start ?? {}), ...p.change });
    expect(after[p.observe]).toBe(value);
    expect(p.options.map((o) => o.id)).toContain(option);
  });
});

describe('heart-and-lungs: flows', () => {
  const blood = ['heart-right', 'to-lungs', 'exchange-lungs', 'from-lungs', 'heart-left', 'to-body', 'exchange-body', 'from-body'];
  it('all eight blood flows are flat and open-ended (docs/40 §9.2)', () => {
    for (const id of blood) {
      const f = flows.find((x) => x.id === id)!;
      expect([f.flat, f.ends], id).toEqual([true, 'open']);
    }
  });
  it('the air flows breathe with the lungs (tidal)', () => {
    for (const id of ['air-right', 'air-left']) expect(flows.find((x) => x.id === id)!.tidal).toEqual({ sync: 'breathe' });
  });
  it('blood is drawn only in the two reds (never blue)', () => {
    for (const f of flows.filter((x) => x.group === 'blood-rich' || x.group === 'blood-poor')) {
      expect(JSON.stringify(f)).not.toMatch(/token:(cold|xray|air)/);
    }
  });
});

describe('heart-and-lungs: wording (docs/40 §1.6, §8.2)', () => {
  const all = chapters.map((c) => c.body + JSON.stringify(c.beats)).join('\n') + JSON.stringify(file.parts);
  it('no exclamation marks, no "blue blood", no P6 energy wording, no 100,000 km', () => {
    expect(all).not.toMatch(/!(?!=)/);
    expect(all).not.toMatch(/blue blood|蓝色的血|蓝血/i);
    expect(all).not.toMatch(/release(s|d)? energy|释放能量|呼吸作用/);
    expect(all).not.toMatch(/100,000 km|60,000 miles|10 万千米/);
    expect(all).not.toMatch(/dirty blood|脏血/);
  });
  it('Chinese uses 膈, not 横膈膜', () => {
    expect(all).not.toMatch(/横膈膜/);
    expect(all).toMatch(/膈/);
  });
  it('captions never say blue and never call breathed air a single gas', () => {
    for (const c of chapters) {
      for (const b of c.beats) {
        expect(b.caption.en, c.id).not.toMatch(/\bblue\b/i);
        expect(b.caption.zh, c.id).not.toMatch(/蓝/);
        expect(b.caption.en, c.id).not.toMatch(/breathe (in|out) only|we breathe in oxygen\b/i);
      }
    }
  });
  it('artery, vein, capillary and alveoli appear only in the "further" boxes and part details that say the syllabus does not ask for them', () => {
    for (const c of chapters) {
      const outside = c.body.replace(/<More[\s\S]*?<\/More>/g, '');
      expect(outside, c.id).not.toMatch(/\b(arter(y|ies)|veins?|capillar(y|ies)|alveoli)\b|动脉|静脉|毛细血管|肺泡/i);
      for (const b of c.beats) expect(b.caption.en + b.caption.zh, c.id).not.toMatch(/\b(arter|vein|capillar|alveol)|动脉|静脉|毛细血管|肺泡/i);
    }
  });
});
