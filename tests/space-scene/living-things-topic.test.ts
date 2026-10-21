/**
 * The `living-things` topic (docs/38): the sort data is the spec's feature
 * table (§3.4, the engine fixture's copy), every count the captions state is
 * what the model gives for that beat's settings (§2.8), each predict-first
 * question reveals the value §2.8 says, the tick table in chapter 6 is the
 * feature table, every specimen fits its case cell and lands inside its pad,
 * and the wording rules of D3 and D5 hold (no "all fish", moving is not a
 * sign of life, no exclamation marks).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { solveSort } from '../../src/engines/space-scene/lib/sim/sort';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import { partSchema } from '../../src/engines/space-scene/schema';
import { simIssues, simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import { SPECIMENS as SPEC_TABLE } from './fixtures/specimen-tray';

const DIR = join(import.meta.dirname, '../../src/content/topics/living-things');
const file = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const sim: SimData = simSchema.parse(file.sim);
const parts = (file.parts as unknown[]).map((p) => partSchema.parse(p));
const part = (id: string) => parts.find((p) => p.id === id)!;

interface Beat {
  sim?: { set?: Record<string, unknown> };
  caption: { en: string; zh: string };
}
interface Chapter {
  id: string;
  set: Record<string, unknown>;
  beats: Beat[];
  predict?: { start?: Record<string, unknown>; change: Record<string, unknown>; observe: string };
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

type Out = Record<string, unknown>;
const evaluate = (set: Record<string, unknown>): Out => evaluateSim(sim, resolveSimValues(sim, set as never), [], undefined, parts as never) as unknown as Out;
const outputsAt = (ch: string, beat: number) => {
  const c = chapter(ch);
  return evaluate({ ...c.set, ...(c.beats[beat - 1]!.sim?.set ?? {}) });
};

describe('living-things: the sort data', () => {
  it('validates against the parts (no sim issues)', () => {
    const ctx = {
      parts: new Set(parts.map((p) => p.id)),
      partData: parts as never,
      flows: new Map(),
      animations: new Map(),
      poses: new Set<string>(),
      countable: new Set<string>(),
      contextParts: new Set(parts.filter((p) => p.context).map((p) => p.id)),
    };
    expect(simIssues(sim, ctx as never).map((x) => `${x.path.join('.')}: ${x.message}`)).toEqual([]);
  });

  it('the feature table is the spec’s (docs/38 §3.4), specimen by specimen, in case order', () => {
    const specimens = sim.sort!.specimens;
    expect(Object.keys(specimens)).toEqual(Object.keys(SPEC_TABLE));
    for (const [id, s] of Object.entries(SPEC_TABLE)) {
      expect(specimens[id]!.group, id).toBe(s.group);
      expect(specimens[id]!.traits, id).toEqual(s.traits);
    }
  });

  it('every specimen sits in its own case cell (§3.2: nine to a row from the back left) and fits it', () => {
    for (const [i, id] of Object.keys(sim.sort!.specimens).entries()) {
      const p = part(id);
      const c = i % 9;
      const r = Math.floor(i / 9);
      expect(p.primitive!.at[0], id).toBeCloseTo(-0.36 + 0.09 * c, 6);
      expect(p.primitive!.at[2], id).toBeCloseTo(-0.465 + 0.09 * r, 6);
      const b = partBounds(p)!;
      expect(b.min[1], id).toBeCloseTo(0.015, 4);
      expect(b.max[1] - b.min[1], id).toBeLessThanOrEqual(0.12);
      for (const k of [0, 2] as const) {
        expect(b.max[k] - p.primitive!.at[k], id).toBeLessThanOrEqual(0.0362);
        expect(p.primitive!.at[k] - b.min[k], id).toBeLessThanOrEqual(0.0362);
      }
    }
  });
});

describe('living-things: §2.8 on the real bench', () => {
  it('T4: the case empties 18 → 16 → 14 → 12 → 7 → 3 → 0; the dolphin with the fish from the fourth question', () => {
    const left = [0, 1, 2, 3, 4, 5, 6].map((k) => evaluate({ tray: 'animals', 'asked-animal': k })['count-u']);
    expect(left).toEqual([18, 16, 14, 12, 7, 3, 0]);
    expect([0, 1, 2, 3, 4, 5, 6].map((k) => evaluate({ tray: 'animals', 'asked-animal': k })['where-dolphin'])).toEqual(['u', 'u', 'u', 'u', 'd', 'd', 'd']);
  });

  it('T5: seven wrongly placed, none after moving them; each suspect’s verdict and true group', () => {
    expect(evaluate({ tray: 'classmate', fix: false }).wrong).toBe(7);
    expect(evaluate({ tray: 'classmate', fix: true }).wrong).toBe(0);
    const belongs: Record<string, [string, string]> = {
      'fruit-bat': ['wrong', 'mammal'],
      dolphin: ['wrong', 'mammal'],
      penguin: ['wrong', 'bird'],
      spider: ['wrong', 'none'],
      'asian-toad': ['wrong', 'amphibian'],
      mudskipper: ['wrong', 'fish'],
      pangolin: ['wrong', 'mammal'],
      shark: ['right', 'fish'],
    };
    for (const [s, [verdict, group]] of Object.entries(belongs)) {
      const o = evaluate({ tray: 'classmate', fix: false, suspect: s });
      expect([o.verdict, o.belongs], s).toEqual([verdict, group]);
    }
  });

  it('T6: kinds in group A for each first question (second: hair or fur)', () => {
    const kinds = ['feathers', 'hair', 'six-legs', 'fins', 'scales', 'can-fly'].map((first) => evaluate({ tray: 'own-key', first, second: 'hair' })['kinds-a']);
    expect(kinds).toEqual([1, 1, 1, 2, 3, 3]);
  });
});

/** [chapter, beat (1-based), output, value, English words, Chinese words] */
const BEAT_COUNTS: [string, number, string, number | string, string, string][] = [
  ['before-you-start', 1, 'count-u', 32, 'thirty-two', '三十二'],
  ['alive-or-not', 1, 'on-tray', 7, 'Seven things', '七样东西'],
  ['alive-or-not', 2, 'where-toy-car', 'a', 'the toy car joins the animals', '玩具车和动物分到一组'],
  ['alive-or-not', 2, 'where-chilli', 'b', 'the chilli plant stays with the pebble', '辣椒苗却和石头在一起'],
  ['alive-or-not', 4, 'where-toy-car', 'b', 'The toy car, the pebble and the plastic flower never do', '玩具车、石头和塑料花都不会长大'],
  ['alive-or-not', 4, 'count-b', 3, 'The toy car, the pebble and the plastic flower', '玩具车、石头和塑料花'],
  ['four-big-groups', 1, 'count-u', 13, 'Thirteen living things', '十三件生物'],
  ['four-big-groups', 2, 'count-a', 4, 'The four plants move to group A', '四株植物移到 A 组'],
  ['four-big-groups', 2, 'where-mushroom', 'u', 'The mushroom stays behind', '蘑菇留在原处'],
  ['four-big-groups', 3, 'count-b', 4, 'The four animals move to group B', '四只动物移到 B 组'],
  ['four-big-groups', 4, 'count-c', 4, 'in group C', '在 C 组'],
  ['four-big-groups', 4, 'count-d', 1, 'The bacteria are group D', '细菌是 D 组'],
  ['flowering-or-not', 1, 'on-tray', 6, 'Six plants', '六株植物'],
  ['flowering-or-not', 2, 'count-a', 1, 'only the ixora goes to group A', '只有龙船花去了 A 组'],
  ['flowering-or-not', 5, 'count-a', 3, 'the ixora, the chilli and the rhu are flowering plants', '龙船花、辣椒、木麻黄是开花植物'],
  ['flowering-or-not', 6, 'count-a', 6, 'Non-flowering plants are green too', '不开花植物也是绿色的'],
  ['animal-groups', 1, 'on-tray', 18, 'Eighteen model animals', '十八只动物模型'],
  ['animal-groups', 2, 'count-a', 2, 'the grasshopper and the beetle are insects, in group A', '蝗虫和甲虫是昆虫，进了 A 组'],
  ['animal-groups', 3, 'count-b', 2, 'the myna and the penguin are birds, in group B', '八哥和企鹅是鸟类，进了 B 组'],
  ['animal-groups', 4, 'count-c', 2, 'the squirrel and the fruit bat are mammals, in group C', '松鼠和果蝠是哺乳动物，进了 C 组'],
  ['animal-groups', 5, 'count-d', 5, 'the dolphin goes there too', '海豚也进了 D 组'],
  ['animal-groups', 6, 'count-e', 4, 'the gecko, the python, the turtle and the pangolin go to group E', '壁虎、蟒蛇、海龟和穿山甲进了 E 组'],
  ['animal-groups', 6, 'count-f', 1, 'the tree frog goes to group F', '树蛙进了 F 组'],
  ['animal-groups', 6, 'count-x', 2, 'The toad and the spider are left over', '剩下蟾蜍和蜘蛛'],
  ['classified-wrongly', 1, 'wrong', 7, 'Seven of them are in the wrong group', '其中七只放错了组'],
  ['classified-wrongly', 6, 'wrong', 0, 'In the right groups', '放回正确的组以后'],
  ['classified-wrongly', 6, 'where-dolphin', 'c', 'the mammals now include the bat, the dolphin and the pangolin', '哺乳动物里多了果蝠、海豚和穿山甲'],
  ['make-a-flowchart', 1, 'count-b', 2, 'sends the squirrel and the bat to group B', '把松鼠和果蝠送进 B 组'],
  ['make-a-flowchart', 2, 'kinds-a', 3, 'three kinds of animal in one group', '三类动物混在一组'],
  ['make-a-flowchart', 2, 'count-a', 4, 'a bird, a bat and two insects', '一只鸟、一只蝙蝠和两只昆虫'],
  ['make-a-flowchart', 3, 'kinds-a', 3, 'mixes fish, reptiles and the pangolin', '鱼、爬行动物和属于哺乳动物的穿山甲'],
  ['make-a-flowchart', 4, 'kinds-a', 1, 'groups A and B each hold one kind of animal', 'A、B 两组各只有一类动物'],
  ['make-a-flowchart', 4, 'kinds-b', 1, 'groups A and B each hold one kind of animal', 'A、B 两组各只有一类动物'],
  ['make-a-flowchart', 5, 'count-c', 14, 'Group C still holds fourteen', 'C 组里还有十四只'],
];

describe('living-things: captions say what the model gives', () => {
  it.each(BEAT_COUNTS)('%s beat %i: %s = %s', (ch, beat, output, value, en, zh) => {
    expect(outputsAt(ch, beat)[output]).toBe(value);
    const caption = chapter(ch).beats[beat - 1]!.caption;
    expect(caption.en).toContain(en);
    expect(caption.zh).toContain(zh);
  });

  it('chapter 6, last beat: group C is thirteen animals of four kinds and a spider', () => {
    const q = solveSort(sim.sort!, resolveSimValues(sim, { tray: 'own-key', first: 'six-legs', second: 'feathers' } as never), parts as never);
    const c = Object.keys(sim.sort!.specimens).filter((id) => q[`where:${id}`] === 'c');
    expect(c.length).toBe(14);
    const groups = c.map((id) => sim.sort!.specimens[id]!.group);
    expect(groups.filter((g) => g === 'none')).toEqual(['none']);
    expect([...new Set(groups.filter((g) => g !== 'none'))].sort()).toEqual(['amphibian', 'fish', 'mammal', 'reptile']);
  });
});

/** What each chapter's predict-first reveals (docs/38 §5: T1–T6). */
const REVEALS: [string, unknown][] = [
  ['alive-or-not', 'a'],
  ['four-big-groups', 'u'],
  ['flowering-or-not', 'b'],
  ['animal-groups', 'd'],
  ['classified-wrongly', 'c'],
  ['make-a-flowchart', 3],
];
describe('living-things: predict first', () => {
  it.each(REVEALS)('%s reveals %s', (ch, value) => {
    const c = chapter(ch);
    const p = c.predict!;
    const before = evaluate({ ...c.set, ...(p.start ?? {}) });
    const after = evaluate({ ...c.set, ...(p.start ?? {}), ...p.change });
    expect(after[p.observe]).toBe(value);
    // The guess is about a change: if nothing moves (the mushroom), the reveal says so.
    expect(before[p.observe] === value).toBe(ch === 'four-big-groups');
  });
});

describe('living-things: the tick table in chapter 6 is the feature table', () => {
  const COLUMNS = ['six-legs', 'feathers', 'hair', 'fins', 'scales', 'moist-skin'];
  const ROWS: [string, string, string][] = [
    ['grasshopper', 'Grasshopper', '蝗虫'],
    ['spider', 'Spider', '蜘蛛'],
    ['javan-myna', 'Javan myna', '林八哥'],
    ['penguin', 'Penguin', '企鹅'],
    ['plantain-squirrel', 'Plantain squirrel', '大蕉松鼠'],
    ['fruit-bat', 'Fruit bat', '果蝠'],
    ['dolphin', 'Dolphin', '海豚'],
    ['snakehead', 'Snakehead', '斑鱼'],
    ['tree-frog', 'Tree frog', '树蛙'],
    ['house-gecko', 'House gecko', '壁虎'],
  ];
  const body = chapter('make-a-flowchart').body;
  it.each(ROWS)('%s', (id, en, zh) => {
    const ticks = COLUMNS.map((q) => (sim.sort!.specimens[id]!.traits[q] ? '✓' : '–')).join(' | ');
    expect(body).toContain(`| ${en} | ${ticks} |`);
    expect(body).toContain(`| ${zh} | ${ticks} |`);
  });
});

describe('living-things: wording (docs/38 D3, D5, §1.6, §8.2)', () => {
  const everything = chapters.map((c) => c.body + c.beats.map((b) => `${b.caption.en}\n${b.caption.zh}`).join('\n')).join('\n');
  const texts = JSON.stringify(file.parts.map((p: { summary: unknown; detail: unknown }) => [p.summary, p.detail]));
  it('no sweeping “all fish / all reptiles …” rules, in either language', () => {
    for (const t of [everything, texts]) {
      expect(t).not.toMatch(/\ball (fish|mammals|reptiles|amphibians|birds|insects)\b/i);
      expect(t).not.toMatch(/所有(的)?(鱼|哺乳动物|爬行动物|两栖动物|鸟|昆虫)/);
    }
  });
  it('moving is never a sign of life; mushrooms are never plants; mould is never invisible', () => {
    expect(everything).not.toMatch(/moving is a (characteristic|sign of life)|会动是生物的特征/i);
    expect(everything).not.toMatch(/mushrooms? (is|are) (a )?plants?\b|蘑菇是植物/i);
    expect(everything).not.toMatch(/mould is too small to see|霉菌小到看不见/i);
  });
  it('no exclamation marks; Chinese quotes are “ ” only', () => {
    expect(everything).not.toMatch(/[!！]/);
    // Chinese prose (JSX attributes such as titles and captions are JSON and keep their straight quotes).
    const zh = chapters.map((c) => (c.body.split('<Lang zh>')[1] ?? '').replace(/\{\{[\s\S]*?\}\}/g, '').replace(/<[^>]*>/g, '')).join('\n');
    expect(zh).not.toMatch(/"[^"]*[一-鿿]/);
  });
  it('the Asian toad’s status is given three ways, never as one side', () => {
    expect(part('asian-toad').detail!.en).toContain('Sources disagree');
    expect(everything).not.toMatch(/Asian toad is (native|non-native|introduced)/i);
  });
});
