/**
 * The `mosquito` topic (docs/33): the measured stage table is Sasmita et al.
 * 2019 Table 2 (S16) and the head widths Bar & Andrew 2013 (S29); every
 * simulated number its captions and chapter bodies state is what the
 * life-cycle model gives for that beat's settings (or a design value of the
 * study, S1); the NEA B-L-O-C-K and S-A-W wording is quoted exactly as
 * sourced, in English and in NEA's own Chinese; the syllabus and tone
 * boundaries (docs/33 §1.2, §1.6, D7, D8) hold.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/mosquito');
const parts = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sources: { id: string; text: { en: string; zh: string } }[] = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources;
const glossary: { id: string }[] = JSON.parse(readFileSync(join(DIR, 'data/glossary.json'), 'utf8')).terms;
const sim: SimData = simSchema.parse(parts.sim);
const lc = sim.lifeCycle!;
const source = (id: string) => sources.find((s) => s.id === id)!;

interface Beat {
  sim?: { set?: Record<string, unknown> };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
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
    return { id: fm.id, set: fm.state.sim?.set ?? {}, beats: fm.state.beats, body, en, zh };
  });
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const out = (set: Record<string, unknown>) => evaluateSim(sim, resolveSimValues(sim, set)) as unknown as Record<string, unknown>;
function outputsAt(ch: string, beat: number): Record<string, unknown> {
  const c = chapter(ch);
  return out({ ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
}

describe('mosquito topic: the measured tables', () => {
  it('the stage days are Sasmita et al. 2019 Table 2, Khan diet (S16), as its source entry quotes them', () => {
    expect(lc.days).toEqual({
      '20': { l1: 2.99, l2: 1.52, l3: 1.62, l4: 3.15, pupa: 4.04, total: 13.4 },
      '25': { l1: 2.53, l2: 1.17, l3: 1.08, l4: 2.77, pupa: 2.61, total: 10.18 },
      '28': { l1: 1.88, l2: 0.68, l3: 1.0, l4: 1.82, pupa: 1.86, total: 7.23 },
      '32': { l1: 1.55, l2: 0.95, l3: 0.7, l4: 1.63, pupa: 1.7, total: 6.4 },
    });
    const s16 = source('S16').text.en;
    for (const row of ['2.99, 1.52, 1.62, 3.15, 4.04, total 13.40', '2.53, 1.17, 1.08, 2.77, 2.61, total 10.18', '1.88, 0.68, 1.00, 1.82, 1.86, total 7.23', '1.55, 0.95, 0.70, 1.63, 1.70, total 6.40'])
      expect(s16).toContain(row);
  });

  it('the head widths are Bar & Andrew 2013 (S29), and the larvae are drawn to that study (no invented sizes)', () => {
    expect(lc.size).toEqual({ head: { unit: 'mm', values: { l1: 0.235, l2: 0.392, l3: 0.64, l4: 0.987 } } });
    expect(source('S29').text.en).toContain('0.235, 0.392, 0.640 and 0.987 mm');
    expect(source('S29').text.en).toContain('1.745, 2.935, 4.343 and 7.202 mm');
  });

  it('the S1 design study states the model results the model gives', () => {
    const s1 = source('S1').text.en;
    const t = [20, 25, 28, 32].map((temp) => out({ temp }));
    expect(t.map((o) => (o['to-adult'] as number).toFixed(1))).toEqual(['13.4', '10.2', '7.2', '6.4']);
    expect(t.map((o) => (o['larva-days'] as number).toFixed(1))).toEqual(['9.3', '7.6', '5.4', '4.7']);
    expect(t.map((o) => (o['pupa-days'] as number).toFixed(1))).toEqual(['4.1', '2.6', '1.9', '1.7']);
    expect(s1).toContain('13.4, 10.2, 7.2 and 6.4 days');
    expect(s1).toContain('9.3, 7.6, 5.4 and 4.7 days');
    expect(s1).toContain('4.1, 2.6, 1.9 and 1.7 days');
    const days = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((day) => out({ temp: 28, day }).stage);
    expect(days).toEqual(['l1', 'l1', 'l2', 'l3', 'l4', 'l4', 'pupa', 'pupa', 'adult']);
    const every = [2, 4, 6, 8, 10, 14].map((e) => out({ temp: 28, every: e }).adults);
    expect(every).toEqual(['none', 'none', 'none', 'some', 'some', 'some']);
    expect(s1).toContain('every 2, 4 or 6 days no adult comes out, every 8, 10 or 14 days some do');
    const rate = [20, 25, 28, 32].map((temp) => ((out({ temp }).rate as Record<string, number>)['life-cycle:ring']!).toFixed(2));
    expect(rate).toEqual(['0.54', '0.71', '1.00', '1.13']);
    // The 28 °C instar lengths the larva details quote (1.9, 0.7, 1.0 and 1.8 days): each stage scaled to the study's total.
    const d = lc.days['28']!;
    const scale = d.total! / (d.l1! + d.l2! + d.l3! + d.l4! + d.pupa!);
    expect(['l1', 'l2', 'l3', 'l4'].map((s) => (d[s]! * scale).toFixed(1))).toEqual(['1.9', '0.7', '1.0', '1.8']);
    expect(parts.parts.find((p: { id: string }) => p.id === 'larva-l2').detail.en).toContain('about 0.7 days');
  });
});

/** [chapter, beat (1-based), output, shown value, decimals, English words, Chinese words] */
const BEAT_NUMBERS: [string, number, string, string, number, string, string][] = [
  ['eggs-and-larvae', 6, 'stage', 'l4', 0, 'fourth instar by day four', '第四天已经是第四龄'],
  ['round-the-cycle', 1, 'to-adult', '7.2', 1, 'about seven days', '大约七天'],
  ['round-the-cycle', 2, 'to-adult', '13.4', 1, 'about thirteen days', '大约要十三天'],
  ['round-the-cycle', 3, 'to-adult', '6.4', 1, 'six point four days', '六点四天'],
  ['pupa-to-adult', 3, 'pupa-days', '1.9', 1, 'about two days', '大约要两天'],
  ['breaking-the-cycle', 1, 'adults', 'some', 0, 'some had already become adults', '已经有一些长成成虫'],
  ['breaking-the-cycle', 2, 'eggs-left', 'none', 0, 'Scrubbing the wall gets rid of them', '卵也除掉了'],
];

describe('mosquito topic: captions say what the model gives', () => {
  it.each(BEAT_NUMBERS)('%s beat %i: %s = %s', (ch, beat, output, value, decimals, en, zh) => {
    const o = outputsAt(ch, beat);
    const v = o[output];
    expect(typeof v === 'number' ? v.toFixed(decimals) : v).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it('the opening beats of the try-it chapters sit where the bodies say', () => {
    expect(out(chapter('eggs-and-larvae').set).stage).toBe('l1');
    expect(out(chapter('pupa-to-adult').set).stage).toBe('l4');
    expect(out(chapter('round-the-cycle').set).stage).toBe('adult');
    expect(out(chapter('breaking-the-cycle').set).adults).toBe('some');
    expect(out(chapter('breaking-the-cycle').set)['eggs-left']).toBe('yes');
  });
});

/** Design values of the study (S1) that the bodies state, and the controls' own settings. */
const DESIGN = new Set(['200 times', '200 倍', '4.5 mm', '4.5 毫米', '4', '28 °C', '32 °C', '14 days', '14 天']);

describe('mosquito topic: every S1 number in the chapter bodies is the model or the design', () => {
  const modelled = new Set<string>();
  for (const temp of [20, 25, 28, 32]) {
    const o = out({ temp });
    for (const id of ['to-adult', 'larva-days', 'pupa-days']) {
      const v = (o[id] as number).toFixed(1);
      modelled.add(`${v} days`).add(`${v} 天`);
    }
  }
  it.each(chapters.map((c) => [c.id, c.body] as const))('%s', (_id, body) => {
    for (const m of body.matchAll(/<Num s="S1">([^<]+)<\/Num>/g)) expect(modelled.has(m[1]!) || DESIGN.has(m[1]!), m[1]).toBe(true);
  });
});

describe('mosquito topic: NEA wording is quoted as sourced', () => {
  const block = chapter('breaking-the-cycle');
  const EN = ['Break up hardened soil', 'Lift and empty flowerpot plates', 'Overturn pails and wipe their rims', 'Change water in vases', 'Keep roof gutters clear and place BTI insecticide inside'];
  const ZH = ['铲松干硬的泥土', '清除花盆底盘的积水', '倒置存放水桶并擦干水桶边缘', '更换花瓶里的水', '疏通阻塞的屋顶檐槽并放置BTI杀蚊药'];

  it('English B-L-O-C-K: each step in NEA\'s words (S27, S28), in the body and the captions', () => {
    const nea = `${source('S27').text.en} ${source('S28').text.en}`;
    for (const step of EN) {
      expect(nea).toContain(step);
      expect(block.en).toContain(step);
    }
    const captions = block.beats.map((b) => b.caption.en).join(' ');
    for (const step of EN) expect(captions).toContain(step);
  });

  it('Chinese B-L-O-C-K: each step in NEA\'s own Chinese (S6), in the body and the captions', () => {
    for (const step of ZH) {
      expect(source('S6').text.zh).toContain(step);
      expect(block.zh).toContain(step);
    }
    const captions = block.beats.map((b) => b.caption.zh).join(' ');
    for (const step of ZH) expect(captions).toContain(step);
  });

  it('S-A-W in NEA\'s English (S34) and Chinese (S6)', () => {
    for (const s of ['Spray insecticide in dark corners around the house', 'Apply insect repellent regularly', 'Wear long-sleeve tops and long pants']) {
      expect(source('S34').text.en).toContain(s);
      expect(block.en).toContain(s);
    }
    for (const s of ['喷杀虫剂（检查家中阴暗角落）', '用驱蚊剂（定期防范）', '穿长衣长裤（免蚊虫叮咬）']) {
      expect(source('S6').text.zh).toContain(s);
      expect(block.zh).toContain(s);
    }
  });
});

describe('mosquito topic: boundaries and tone', () => {
  const all = chapters.map((c) => c.body + c.beats.map((b) => `${b.caption.en} ${b.caption.zh}`).join(' ')).join('\n');

  it('no grade labels, no exclamation marks, no fear words, no gore', () => {
    expect(all).not.toMatch(/\bP[1-6]\b|Primary [1-6]|小[一二三四五六]\b|[一二三四五六]年级/);
    expect(all).not.toMatch(/!|！/);
    expect(all).not.toMatch(/deadly|killer|scary|terrifying|blood-red|bloodsucker|致命|杀手|可怕|恐怖|嗜血/i);
    expect(all).not.toMatch(/小朋友/);
  });

  it('Chinese uses Singapore terms and Chinese quotation marks only', () => {
    const zh = chapters.map((c) => c.zh + c.beats.map((b) => b.caption.zh).join('')).join('\n');
    expect(zh).toContain('骨痛热症（登革热）');
    expect(zh).toContain('幼虫（孑孓）');
    expect(zh).toContain('埃及伊蚊');
    expect(zh).toContain('白纹伊蚊');
    expect(zh).toContain('沃尔巴克氏菌');
    expect(zh).toContain('灭蚊行动');
    expect(zh).not.toMatch(/登革热(?!）)/);
    // Straight or corner quotes in Chinese prose (attribute values excepted: strip the MDX tags first).
    const prose = zh.replace(/<[^>]+>/g, '');
    expect(prose).not.toMatch(/「|」|『|』|"/);
  });

  it('the misconceptions are answered (docs/33 D7)', () => {
    const en = chapters.map((c) => c.en).join('\n');
    expect(en).toContain('is not a worm');
    expect(en).toMatch(/A pupa does not eat\. It is not asleep/);
    expect(en).toContain('grows in steps');
    expect(en).toContain('Only females take blood');
    expect(en).toContain('not on the water');
    expect(en).toContain('clean, still water');
    expect(en).toContain('Only a doctor can tell');
    expect(en).toMatch(/none hatched at/);
    expect(en).toContain('Males do not bite');
    expect(en).not.toMatch(/not born with the virus/);
  });

  it('every glossary term is tagged once in English and once in Chinese', () => {
    for (const { id } of glossary) {
      const tag = new RegExp(`<Term id="${id}">`, 'g');
      expect(chapters.reduce((n, c) => n + (c.en.match(tag)?.length ?? 0), 0), `${id} en`).toBe(1);
      expect(chapters.reduce((n, c) => n + (c.zh.match(tag)?.length ?? 0), 0), `${id} zh`).toBe(1);
    }
  });

  it('the home corner is never on show with the enlarged mosquitoes (docs/33 D4)', () => {
    const mosquitoGroups = ['head', 'thorax-wings', 'belly', 'male', 'water-stages'];
    for (const file of readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx'))) {
      const fm = parseYaml(readFileSync(join(DIR, 'chapters', file), 'utf8').split(/^---$/m)[1]!);
      const layers: string[] = fm.state.layers;
      for (const b of [{ layers }, ...(fm.state.beats ?? [])]) {
        const l: string[] = b.layers ?? layers;
        if (l.includes('home')) expect(l.filter((g) => mosquitoGroups.includes(g)), `${fm.id}`).toEqual([]);
      }
    }
  });
});
