/**
 * The `light-and-shadows` topic (docs/35): every simulated number its
 * captions and chapter bodies state is what the light model gives for that
 * beat's settings (or a design value of the study, S1); the drawn bench is the
 * model's bench (screen, axis, objects); the distance ranges keep every
 * shadow on the screen (docs/35 §9.2 decision 1); the bench and the courtyard
 * never share a view; and the syllabus boundaries (docs/35 D2, §8.2) hold:
 * no law of reflection, and transparent / translucent / opaque only in the
 * More boxes and the glossary.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { benchShadow, holeInterval } from '../../src/engines/space-scene/lib/sim/light';
import { solarNoon } from '../../src/engines/space-scene/lib/sim/sun';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import { chainName, partChain } from '../../src/engines/space-scene/lib/schematic';

const DIR = join(import.meta.dirname, '../../src/content/topics/light-and-shadows');
const parts = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const glossary: { id: string }[] = JSON.parse(readFileSync(join(DIR, 'data/glossary.json'), 'utf8')).terms;
const sim: SimData = simSchema.parse(parts.sim);
const part = (id: string) => parts.parts.find((p: { id: string }) => p.id === id);

interface Beat {
  sim?: { set?: Record<string, unknown> };
  layers?: string[];
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  layers: string[];
  set: Record<string, unknown>;
  beats: Beat[];
  body: string;
  en: string;
  zh: string;
}
const chapters: Chapter[] = readdirSync(join(DIR, 'chapters'))
  .filter((f) => f.endsWith('.mdx'))
  .sort()
  .map((f) => {
    const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
    const [, front, ...rest] = text.split(/^---$/m);
    const fm = parseYaml(front!);
    const body = rest.join('---');
    const en = body.slice(body.indexOf('<Lang en>'), body.indexOf('<Lang zh>'));
    const zh = body.slice(body.indexOf('<Lang zh>'));
    return { id: fm.id, layers: fm.state.layers, set: fm.state.sim?.set ?? {}, beats: fm.state.beats, body, en, zh };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const out = (set: Record<string, unknown>) => evaluateSim(sim, resolveSimValues(sim, set as never)) as unknown as Record<string, unknown>;
function outputsAt(ch: string, beat: number): Record<string, unknown> {
  const c = chapter(ch);
  return out({ ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
}
const shown = (v: unknown, decimals: number) => (v as number).toFixed(decimals);

/** [chapter, beat (1-based), output, decimals, shown value, English words, Chinese words] */
const BEAT_NUMBERS: [string, number, string, number, string, string, string][] = [
  ['shape-and-size', 6, 'shadow-height', 0, '30', 'thirty centimetres', '三十厘米'],
  ['torch-distance', 1, 'shadow-height', 0, '20', 'twenty centimetres across', '影子直径二十厘米'],
  ['torch-distance', 2, 'shadow-height', 0, '24', 'twenty-four centimetres', '二十四厘米'],
  ['torch-distance', 3, 'shadow-height', 0, '12', 'twelve centimetres', '十二厘米'],
  ['screen-distance', 1, 'shadow-height', 0, '12', 'twelve centimetres across', '影子直径十二厘米'],
  ['screen-distance', 2, 'shadow-height', 0, '16', 'sixteen centimetres across', '影子直径十六厘米'],
  ['screen-distance', 3, 'shadow-height', 0, '24', 'twenty-four centimetres across', '影子直径二十四厘米'],
  ['sun-shadows', 1, 'shadow-length', 2, '3.25', 'three point two five metres', '三点二五米'],
  ['sun-shadows', 2, 'shadow-length', 2, '0.21', 'zero point two one metres', '零点二一米'],
  ['sun-shadows', 3, 'shadow-length', 2, '1.99', 'one point nine nine metres', '一点九九米'],
  ['sun-shadows', 5, 'shadow-length', 2, '0.41', 'zero point four one metres', '零点四一米'],
  ['sun-shadows', 6, 'shadow-length', 2, '0.05', 'five centimetres', '五厘米'],
];

/** States the captions name. */
const BEAT_STATES: [string, number, string, string][] = [
  ['seeing-light', 1, 'eye', 'none'],
  ['seeing-light', 2, 'eye', 'some'],
  ['seeing-light', 3, 'eye', 'some'],
  ['seeing-light', 4, 'eye', 'bright'],
  ['seeing-light', 5, 'eye', 'none'],
  ['straight-lines', 1, 'dot', 'yes'],
  ['straight-lines', 2, 'dot', 'no'],
  ['straight-lines', 5, 'shadow-shape', 'none'],
  ['through-or-blocked', 1, 'shadow-kind', 'hardly'],
  ['through-or-blocked', 2, 'shadow-kind', 'lighter'],
  ['through-or-blocked', 3, 'shadow-kind', 'lighter'],
  ['through-or-blocked', 4, 'shadow-kind', 'dark'],
  ['shape-and-size', 1, 'shadow-shape', 'circle'],
  ['shape-and-size', 2, 'shadow-shape', 'triangle'],
  ['shape-and-size', 3, 'shadow-shape', 'thin-strip'],
  ['shape-and-size', 4, 'shadow-shape', 'rectangle'],
  ['shape-and-size', 5, 'shadow-shape', 'circle'],
  ['shape-and-size', 6, 'shadow-shape', 'circle'],
  ['sun-shadows', 1, 'shadow-points', 'west'],
  ['sun-shadows', 2, 'shadow-points', 'north'],
  ['sun-shadows', 3, 'shadow-points', 'east'],
  ['sun-shadows', 5, 'shadow-points', 'south'],
  ['sun-shadows', 6, 'shadow-points', 'west'],
];

describe('light-and-shadows topic: captions say what the model gives', () => {
  it.each(BEAT_NUMBERS)('%s beat %i: %s = %s', (ch, beat, output, decimals, value, en, zh) => {
    expect(shown(outputsAt(ch, beat)[output], decimals)).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it.each(BEAT_STATES)('%s beat %i: %s is %s', (ch, beat, output, state) => {
    expect(outputsAt(ch, beat)[output]).toBe(state);
  });

  it('the sensor readings in the materials caption are the model at the chapter settings', () => {
    const c = chapter('through-or-blocked');
    const readings = ['clear-glass', 'frosted-glass', 'tracing-paper', 'cardboard'].map((m) => shown(out({ ...c.set, material: m })['light-behind'], 0));
    expect(readings).toEqual(['91', '45', '35', '0']);
    const caption = c.beats[4]!.caption;
    for (const w of ['ninety-one', 'forty-five', 'thirty-five', 'zero']) expect(caption.en).toContain(w);
    for (const w of ['百分之九十一', '百分之四十五', '百分之三十五', '零']) expect(caption.zh).toContain(w);
  });

  it('the torch steps: from 20 to 15 cm the shadow grows by 4 cm, from 30 to 40 cm it shrinks by 2 cm', () => {
    const h = (a: number) => Math.round(out({ ...chapter('torch-distance').set, 'd-torch': a })['shadow-height'] as number);
    expect(h(15) - h(20)).toBe(4);
    expect(h(30) - h(40)).toBe(2);
    const caption = chapter('torch-distance').beats[4]!.caption;
    expect(caption.en).toContain('only two centimetres');
    expect(caption.en).toContain('grew by four');
    expect(caption.zh).toContain('只小了两厘米');
    expect(caption.zh).toContain('大了四厘米');
  });

  it('the screen steps: every 10 cm adds 4 cm (the straight-line graph)', () => {
    const h = (b: number) => Math.round(out({ ...chapter('screen-distance').set, 'd-screen': b })['shadow-height'] as number);
    expect([10, 20, 30, 40].map(h)).toEqual([12, 16, 20, 24]);
    expect(chapter('screen-distance').beats[3]!.caption.en).toContain('four centimetres, for every ten centimetres');
  });

  it('20 October: the Sun is highest at about 12.50 pm (ten to one)', () => {
    const noon = out({ date: 'oct-20' }).noon as number;
    expect(Math.round(noon * 60)).toBe(12 * 60 + 50);
    expect(chapter('sun-shadows').beats[1]!.caption.en).toContain('ten to one');
    expect(chapter('sun-shadows').beats[1]!.caption.zh).toContain('十二点五十分');
  });
});

/** Inputs (S1 design values), and values derived from the readings, that the bodies state. */
const DESIGN = new Set([
  '8cm', '12cm', '1.2cm', '2cm', '2mm', '30cm', '1m', '3', '45°', '10cm',
  '20October2026', '21June2026', '24March2026', '2026年10月20日', '2026年6月21日', '2026年3月24日',
  '23–24March', '19–20September2026', '3月23–24日', '2026年9月19–20日',
]);
/** Differences of two displayed readings (checked in the step tests above), and a reading converted to centimetres. */
const DERIVED = new Set(['4cm', '2cm', '5cm']);

const norm = (s: string) => s.replace(/\s+/g, '').replace(/毫米/g, 'mm').replace(/厘米/g, 'cm').replace(/米/g, 'm');

describe('light-and-shadows topic: every S1 number in the chapter bodies is the model or the design', () => {
  const grid: Record<string, unknown>[] = [];
  for (const a of [15, 20, 30, 40, 60]) for (const b of [10, 20, 30, 40]) for (const object of ['card-circle', 'card-square', 'card-triangle', 'card-circle-big', 'tin', 'cone', 'ball']) for (const turn of [0, 45, 90]) grid.push({ 'd-torch': a, 'd-screen': b, object, turn });
  for (const b of [10, 20, 30, 40]) for (const material of ['clear-glass', 'frosted-glass', 'tracing-paper', 'cardboard']) grid.push({ 'd-screen': b, material });
  for (const date of ['oct-20', 'jun-21', 'mar-24']) for (let time = 8; time <= 18; time++) grid.push({ date, time });
  const modelled = new Set<string>();
  for (const set of grid) {
    const o = out(set);
    for (const def of sim.outputs) {
      const v = o[def.id];
      if (typeof v !== 'number' || !Number.isFinite(v) || def.unit === 'h') continue;
      modelled.add(norm(`${v.toFixed(def.decimals ?? 0)}${def.unit ?? ''}`));
    }
  }
  modelled.add('2.0cm'); // the bright dot, below
  it('the bright dot through three holes in line is 2.0 cm across, and none when the middle card moves', () => {
    const [lo, hi] = holeInterval(sim.light!.holes!, 20, 30, false);
    expect((hi - lo).toFixed(1)).toBe('2.0');
    const [lo2, hi2] = holeInterval(sim.light!.holes!, 20, 30, true);
    expect(hi2).toBeLessThan(lo2);
  });

  it.each(chapters.map((c) => [c.id, c.body] as const))('%s', (_id, body) => {
    const nums = [...body.matchAll(/<Num s="S1">([^<]+)<\/Num>/g)].map((m) => norm(m[1]!));
    for (const n of nums) expect(modelled.has(n) || DESIGN.has(n) || DERIVED.has(n), n).toBe(true);
  });

  it('the clock times in Num are the model: noon on 20 October, and the earliest and latest noon of 2026', () => {
    const times = new Set(chapters.flatMap((c) => [...c.body.matchAll(/<Num s="S1"><Time t="(\d\d):(\d\d)" \/><\/Num>/g)].map((m) => `${m[1]}:${m[2]}`)));
    expect([...times].sort()).toEqual(['12:48', '12:50', '13:19']);
    let lo = 24,
      hi = 0;
    for (let d = new Date('2026-01-01T00:00:00Z'); d.getUTCFullYear() === 2026; d.setUTCDate(d.getUTCDate() + 1)) {
      const n = solarNoon(d.toISOString().slice(0, 10), 103.8, 8);
      lo = Math.min(lo, n);
      hi = Math.max(hi, n);
    }
    const hm = (h: number) => `${Math.floor(h)}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
    expect([hm(lo), hm(hi)]).toEqual(['12:48', '13:19']);
  });
});

describe('light-and-shadows topic: the drawn bench is the model bench', () => {
  it('the screen board is 60 × 50 cm, centred on the light axis, its face at the zero offset', () => {
    const board = part('screen-board').primitive;
    expect(board.size[1] * 100).toBeCloseTo(sim.light!.bench!.screen.size[1], 6);
    expect(board.size[2] * 100).toBeCloseTo(sim.light!.bench!.screen.size[0], 6);
    expect(board.at[0] - board.size[0] / 2).toBeCloseTo(0, 6);
    expect(board.at.slice(1)).toEqual(sim.light!.bench!.holder.slice(1));
    const receiver = sim.overlays!.find((o) => o.kind === 'shadow-cast' && 'part' in o.receiver && o.receiver.part === 'screen-board');
    expect(receiver).toBeDefined();
  });

  it('every object part is centred on the holder; the cards are 2 mm thick; the hole cards sit 10 cm apart', () => {
    for (const id of Object.keys(sim.light!.bench!.objects)) expect(part(id).primitive.at).toEqual(sim.light!.bench!.holder);
    expect(part('card-circle').primitive.profile[1][0] * 200).toBeCloseTo(8, 6);
    expect(part('card-circle-big').primitive.profile[1][0] * 200).toBeCloseTo(12, 6);
    for (const c of sim.light!.holes!.cards) expect(part(c.part).primitive.at[0] * 100).toBeCloseTo(c.at, 6);
  });

  it('every distance step keeps every object and turn on the 60 × 50 cm screen (decision 1)', () => {
    const bench = sim.light!.bench!;
    for (const id of Object.keys(bench.objects))
      for (const turn of [0, 45, 90])
        for (const a of [15, 20, 30, 40, 60])
          for (const b of [10, 20, 30, 40]) {
            const s = benchShadow(bench, id, turn, a, b);
            expect(Math.max(-s.min[1], s.max[1]) * 2, `${id} ${turn} ${a}/${b}`).toBeLessThanOrEqual(50);
            expect(Math.max(-s.min[0], s.max[0]) * 2, `${id} ${turn} ${a}/${b}`).toBeLessThanOrEqual(60);
          }
  });

  it('views: no engine shadows (two places 10 m apart) and REFERENCE frames the shown layers', () => {
    expect(parts.views.shadows).toBe('none');
    expect(parts.views.reference).toEqual({ fit: 'layers' });
  });

  it('the bench and the courtyard never share a view', () => {
    const bench = new Set(['source', 'objects', 'sheets', 'screen', 'hole-cards', 'dark-box']);
    for (const c of chapters)
      for (const layers of [c.layers, ...c.beats.map((b) => b.layers ?? c.layers)]) {
        if (layers.includes('outdoors')) expect(layers.filter((l) => bench.has(l)), c.id).toEqual([]);
      }
  });
});

/** The main line: chapter bodies without their <More> boxes, and the captions. */
function mainLine(c: Chapter): string {
  return c.body.replace(/<More[\s\S]*?<\/More>/g, '').replace(/src="[^"]*"/g, '') + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n');
}

describe('light-and-shadows topic: syllabus boundaries (docs/35 D2, §8.2)', () => {
  it.each(chapters.map((c) => [c.id, c] as const))('%s keeps transparent / translucent / opaque out of the main line', (_id, c) => {
    const text = mainLine(c).replace(/透明玻璃/g, '');
    for (const word of [/transparent/i, /translucent/i, /opaque/i, /透明/, /不透明/]) expect(text, String(word)).not.toMatch(word);
  });

  it('no law of reflection or angles of reflection anywhere', () => {
    for (const c of chapters) expect(c.body + JSON.stringify(c.beats)).not.toMatch(/law of reflection|angle of (incidence|reflection)|反射定律|入射角|反射角/i);
  });

  it('extensions beyond the syllabus are said to be so', () => {
    for (const [ch, title] of [
      ['straight-lines', 'Why real shadows can look blurry'],
      ['torch-distance', 'Two triangles'],
      ['shape-and-size', 'Why the turned square is not a rectangle'],
      ['sun-shadows', 'How these numbers were worked out'],
    ] as const) {
      const box = chapter(ch).en.slice(chapter(ch).en.indexOf(title));
      expect(box.slice(0, 400), `${ch}: ${title}`).toMatch(/beyond the syllabus/);
    }
  });

  it('no grades, Chinese quotation marks only, no exclamation marks; the safety line is in 00 and 07', () => {
    for (const c of chapters) {
      expect(c.body).not.toMatch(/\bP[3-6]\b|Primary [3-6]|小[三四五六]|Foundation/);
      expect(c.zh.replace(/<[^>]*>/g, '')).not.toMatch(/[「」『』"]/);
      expect(c.body + JSON.stringify(c.beats)).not.toMatch(/!|！/);
    }
    expect(chapter('before-you-start').en).toMatch(/never look straight at the Sun/);
    expect(chapter('sun-shadows').en).toMatch(/never look straight at the Sun/);
    expect(chapter('sun-shadows').zh).toMatch(/不要直视太阳/);
  });

  it('every glossary term is wrapped once in English and once in Chinese', () => {
    for (const { id } of glossary) {
      const re = new RegExp(`<Term id="${id}">`, 'g');
      expect(chapters.reduce((n, c) => n + (c.en.match(re)?.length ?? 0), 0), id).toBe(1);
      expect(chapters.reduce((n, c) => n + (c.zh.match(re)?.length ?? 0), 0), id).toBe(1);
    }
  });
});

describe('light-and-shadows topic: compact chain labels', () => {
  it('every visible chain node fits its column and keeps its full bilingual name', () => {
    const layout = partChain(parts.parts, parts.groups, 330, { row: 23, compactRow: 16, compactAfter: 10, header: 18, gap: 10 });
    const budget = Math.max(6, Math.floor(((layout.columns[0]?.w ?? 90) - 22) / (layout.compact ? 5.4 : 5.8)));
    for (const node of layout.nodes) {
      const p = part(node.id);
      const label = chainName(p);
      expect(label.en.length, node.id).toBeLessThanOrEqual(budget);
      expect(label.zh.length, node.id).toBeGreaterThan(0);
      expect(p.name.en.length, node.id).toBeGreaterThan(0);
      expect(p.name.zh.length, node.id).toBeGreaterThan(0);
    }
    expect(part('box-torch')).toMatchObject({ name: { en: 'Small torch', zh: '小手电筒' }, chainName: { en: 'Torch', zh: '手电筒' } });
    expect(part('box-inside').chainName).toEqual({ en: 'Darkness', zh: '黑暗' });
  });
});
