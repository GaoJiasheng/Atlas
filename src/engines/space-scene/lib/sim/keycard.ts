/**
 * The flowchart card (docs/38 §4.4 E-LT3; pure, deterministic, unit-tested):
 * what the card says for the tray on show (`keyModel`: the questions, the
 * leaves with their names and counts, the selected specimen's way through),
 * where everything goes in a 280-unit-wide viewBox (`keyLayout`) and the
 * card in words for screen readers (`keySummary`).
 *
 * One question, two, or a chain all draw the same way: question boxes down
 * the left, each box's YES line runs right to its leaf (A, B …), a NO line
 * runs down to the next box, and the last NO runs down to the last leaf
 * (B for one question, C for two, the chain's `else`). A question not asked
 * yet (a chain's beyond `asked`, a choice at `none`) is drawn dashed and
 * faint; its leaf is still drawn (0). A classmate's arrangement has no
 * questions: one row per group, its heading and count, and a ✗ with "n
 * wrong" on a group that holds a specimen in the wrong group (gone once the
 * fix is on). The whole case (no key) is one line of words.
 *
 * Leaves are buttons: every hit area is at least 54 units square, 44 CSS px
 * while the card is drawn at 82 % (the right column at 1280 px).
 */
import { tx, type Locale } from '../../../../i18n';
import type { Bilingual } from '../../../../content/schema/common';
import type { SimValues } from '../../sim-schema';
import type { SortData, SortKey } from '../../sort-schema';
import { IN_CASE, solveSort, sortPlacement, traySpecimens } from './sort';

export const KEY_W = 280;
/** A leaf's smallest hit square (viewBox units): 44 CSS px at 82 % of 280 px. */
export const KEY_HIT = 54;

/** Card words in both languages (the i18n strings, passed in so the layout stays pure). */
export interface KeyWords {
  yes: string;
  no: string;
  neither: string;
  pick: string;
  /** `{q}`: the question. */
  yesTo: string;
  /** `{g}`: the group letter. */
  group: string;
  /** `{n}`: how many are wrong. */
  wrong: string;
  /** `{group}`: where it belongs. */
  belongs: string;
  /** `{n}`: specimens in the case. */
  inCase: string;
  /** `{g}`, `{n}`: a leaf in words. */
  leaf: string;
  /** `{steps}`. */
  summary: string;
  /** `{n}`: the whole case in words. */
  wholeCase: string;
  /** Punctuation in the summary (`: `, `, `, `; `, `.`; Chinese full-width). */
  colon: string;
  comma: string;
  semicolon: string;
  stop: string;
}

export interface KeyQuestion {
  id: string;
  text: string;
  /** Not asked yet: dashed, faint. */
  pending: boolean;
}

export interface KeyLeafModel {
  group: string;
  name: string;
  count: number;
  /** Not reached yet (a chain's `else` before every question is asked). */
  pending: boolean;
  /** Specimens in the wrong group here (arrangement only; 0 = none). */
  wrong: number;
  /** The pad part the leaf selects (none: not a button). */
  pad?: string | undefined;
}

export interface KeyModel {
  kind: 'questions' | 'arrangement' | 'case';
  /** Which key: one question, two, a chain, a classmate's arrangement, or none (the whole case). */
  key: 'ask' | 'two' | 'chain' | 'arrangement' | 'none';
  questions: KeyQuestion[];
  /** Questions' leaves in order (A, B …), then the last NO leaf; or the arrangement's groups. */
  leaves: KeyLeafModel[];
  /** Specimens still in the case. */
  inCase: number;
  /** Specimens on the tray (the whole case: all). */
  onTray: number;
  /** The selected specimen's way: the boxes it went through, its answer at each, the leaf it is in, and (in the wrong group) where it belongs. */
  trail: { boxes: number[]; answers: ('yes' | 'no')[]; leaf: string | null; belongs: string | null } | null;
}

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
const q = (text: string, locale: Locale) => `${text}${locale === 'zh' ? '？' : '?'}`;

/** The key's questions in order (`ask`: one or two; a chain: all) and the control values they are asked at. */
function keyQuestions(key: Exclude<SortKey, { arrangement: unknown }>, values: SimValues): { ids: (string | null)[]; asked: number; last: string } {
  if ('ask' in key) {
    const first = values[key.ask];
    const a = typeof first === 'string' && first !== 'none' ? first : null;
    if (!key.no) return { ids: [a], asked: a ? 1 : 0, last: 'b' };
    const second = values[key.no.ask];
    const b = typeof second === 'string' && second !== 'none' ? second : null;
    return { ids: [a, b], asked: a ? (b ? 2 : 1) : 0, last: 'c' };
  }
  const raw = values[key.asked];
  const k = Math.max(0, Math.min(key.chain.length, typeof raw === 'number' ? Math.floor(raw) : 0));
  return { ids: key.chain, asked: k, last: key.else };
}

/** What the card shows for these values (`part`: the selected part, if a specimen on the tray). */
export function keyModel(s: SortData, values: SimValues, part: string | null, words: KeyWords, locale: Locale): KeyModel {
  const place = sortPlacement(s, values);
  const t = s.trays[place.tray];
  const out = solveSort(s, values);
  const count = (g: string) => (typeof out[`count:${g}`] === 'number' ? (out[`count:${g}`] as number) : 0);
  const layout = place.layout === 'none' ? undefined : s.layouts[place.layout];
  const pad = (g: string) => layout?.[g]?.pad;
  const inCase = count(IN_CASE);
  const onTray = traySpecimens(s, place.tray).length;
  const key = t?.key;
  const label = (b: Bilingual | undefined) => (b ? tx(b, locale) : '');
  if (!key || !layout) return { kind: 'case', key: 'none', questions: [], leaves: [], inCase, onTray, trail: null };
  const where = part !== null ? place.where.get(part) : undefined;
  const sp = part !== null ? s.specimens[part] : undefined;
  if ('arrangement' in key) {
    const fix = values[key.fix] === true;
    const leaves = Object.entries(key.arrangement)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([g, grp]) => {
        const ids = [...place.where].filter(([, at]) => at === g).map(([id]) => id);
        const wrong = fix ? 0 : ids.filter((id) => headingFor(key, s.specimens[id]!.group) !== g).length;
        return { group: g, name: label(s.groups[grp.heading]?.label), count: ids.length, pending: false, wrong, pad: pad(g) };
      });
    const right = sp ? headingFor(key, sp.group) : undefined;
    const trail = where !== undefined && sp ? { boxes: [], answers: [], leaf: where, belongs: right !== undefined && right !== where ? label(s.groups[sp.group]?.label) : null } : null;
    return { kind: 'arrangement', key: 'arrangement', questions: [], leaves, inCase, onTray, trail };
  }
  const { ids, asked, last } = keyQuestions(key, values);
  const questions = ids.map((id, i) => ({ id: id ?? `q${i + 1}`, text: id ? q(label(s.questions[id]?.label), locale) : words.pick, pending: id === null || i >= asked }));
  const leafName = (i: number): string => {
    if ('ask' in key) return i === 0 ? fill(words.yesTo, { q: questions[0]!.text }) : key.no ? fill(words.yesTo, { q: questions[1]!.text }) : words.no;
    return label(s.questions[key.chain[i]!]?.label);
  };
  const leaves: KeyLeafModel[] = ids.map((_, i) => {
    const g = String.fromCharCode(97 + i);
    return { group: g, name: leafName(i), count: count(g), pending: i >= asked, wrong: 0, pad: pad(g) };
  });
  const elseName = 'ask' in key ? (key.no ? words.neither : words.no) : key.elseHeading ? label(s.groups[key.elseHeading]?.label) : words.neither;
  leaves.push({ group: last, name: elseName, count: count(last), pending: asked < ids.length, wrong: 0, pad: pad(last) });
  // The selected specimen's way down: each asked box it reached, yes at the one that took it.
  let trail: KeyModel['trail'] = null;
  if (where !== undefined && sp) {
    const boxes: number[] = [];
    const answers: ('yes' | 'no')[] = [];
    for (let i = 0; i < asked; i++) {
      const id = ids[i];
      boxes.push(i);
      const yes = id !== null && id !== undefined && sp.traits[id] === true;
      answers.push(yes ? 'yes' : 'no');
      if (yes) break;
    }
    trail = { boxes, answers, leaf: where === IN_CASE ? null : where, belongs: null };
  }
  return { kind: 'questions', key: 'ask' in key ? (key.no ? 'two' : 'ask') : 'chain', questions, leaves, inCase, onTray, trail };
}

function headingFor(key: Extract<SortKey, { arrangement: unknown }>, group: string): string | undefined {
  const entries = Object.entries(key.arrangement);
  return (entries.find(([, g]) => g.heading === group) ?? entries.find(([, g]) => g.heading === 'none'))?.[0];
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KeyBoxLayout extends Rect {
  index: number;
  lines: string[];
  pending: boolean;
}

export interface KeyLeafLayout extends Rect {
  group: string;
  lines: string[];
  hit: Rect;
}

export interface KeyLineLayout {
  /** `yes`: box i → leaf i; `no`: box i → the next box (or the last leaf). */
  kind: 'yes' | 'no';
  from: number;
  d: string;
  label: { x: number; y: number; anchor: 'start' | 'middle' };
  pending: boolean;
}

export interface KeyLayout {
  width: number;
  height: number;
  boxes: KeyBoxLayout[];
  leaves: KeyLeafLayout[];
  lines: KeyLineLayout[];
  /** The whole case: the words, wrapped. */
  text: string[];
  /** Baseline of the SIM line. */
  foot: number;
}

const BOX_X = 6;
const BOX_W = 148;
const LEAF_X = 180;
const LEAF_W = KEY_W - 6 - LEAF_X;
const ROW_GAP = 24;
const BOX_FONT = 12;
const LEAF_FONT = 11;
const LINE_H = 14;

/** A rough advance width (em): CJK and full-width forms 1, capitals .66, the rest .55. */
function advance(ch: string): number {
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 0x2e80) return 1;
  if (ch >= 'A' && ch <= 'Z') return 0.66;
  if (ch === ' ' || ch === ',' || ch === '.' || ch === ':' || ch === 'i' || ch === 'l') return 0.3;
  return 0.55;
}

const textWidth = (s: string, size: number) => [...s].reduce((w, ch) => w + advance(ch), 0) * size;

/**
 * Words wrapped to `width` units at `size` (CJK breaks anywhere, else at
 * spaces); at most `max` lines, the last ending in … when cut.
 */
export function wrapText(s: string, width: number, size: number, max = 3): string[] {
  const units: string[] = [];
  for (const m of s.matchAll(/[⺀-￿]|[^\s⺀-￿]+\s*|\s+/g)) units.push(m[0]);
  const lines: string[] = [];
  let line = '';
  for (const u of units) {
    if (line !== '' && textWidth((line + u).trimEnd(), size) > width) {
      lines.push(line.trimEnd());
      line = u.trimStart();
    } else line += u;
  }
  if (line.trim() !== '') lines.push(line.trimEnd());
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let lastLine = kept[max - 1]!;
  while (lastLine.length > 1 && textWidth(`${lastLine}…`, size) > width) lastLine = lastLine.slice(0, -1);
  kept[max - 1] = `${lastLine.trimEnd()}…`;
  return kept;
}

/** Where the card's boxes, lines and leaves go. */
export function keyLayout(m: KeyModel, words: KeyWords): KeyLayout {
  const boxes: KeyBoxLayout[] = [];
  const leaves: KeyLeafLayout[] = [];
  const lines: KeyLineLayout[] = [];
  let y = 6;
  if (m.kind === 'case') {
    const text = wrapText(fill(words.wholeCase, { n: m.onTray }), KEY_W - 12, BOX_FONT, 4);
    const h = 8 + text.length * LINE_H;
    return { width: KEY_W, height: h + 24, boxes, leaves, lines, text, foot: h + 18 };
  }
  if (m.kind === 'arrangement') {
    for (const l of m.leaves) {
      const name = wrapText(l.name, KEY_W - 12 - 30 - 40, LEAF_FONT, 2);
      const belongs = m.trail?.leaf === l.group && m.trail.belongs !== null ? 1 : 0;
      const h = Math.max(KEY_HIT, 10 + LINE_H * (name.length + (l.wrong > 0 ? 1 : 0) + belongs) + 6);
      const r = { x: BOX_X, y, w: KEY_W - 12, h };
      leaves.push({ group: l.group, lines: name, ...r, hit: { ...r } });
      y += h + 4;
    }
    return { width: KEY_W, height: y + 20, boxes, leaves, lines, text: [], foot: y + 14 };
  }
  const n = m.questions.length;
  let prevBottom = 0;
  m.questions.forEach((qq, i) => {
    const text = wrapText(qq.text, BOX_W - 16, BOX_FONT, 3);
    const bh = 10 + LINE_H * text.length;
    const leaf = m.leaves[i]!;
    const name = wrapText(leaf.name, LEAF_W - 12, LEAF_FONT, 2);
    const lh = Math.max(KEY_HIT, 8 + LINE_H + LINE_H * name.length + 4);
    const rowH = Math.max(bh, lh);
    const cy = y + rowH / 2;
    const box = { index: i, x: BOX_X, y: cy - bh / 2, w: BOX_W, h: bh, lines: text, pending: qq.pending };
    boxes.push(box);
    const lr = { x: LEAF_X, y: cy - lh / 2, w: LEAF_W, h: lh };
    leaves.push({ group: leaf.group, lines: name, ...lr, hit: { ...lr } });
    lines.push({ kind: 'yes', from: i, d: `M ${BOX_X + BOX_W} ${cy} H ${LEAF_X}`, label: { x: (BOX_X + BOX_W + LEAF_X) / 2, y: cy - 4, anchor: 'middle' }, pending: qq.pending });
    if (i > 0) {
      const x = BOX_X + BOX_W / 2;
      lines.push({ kind: 'no', from: i - 1, d: `M ${x} ${prevBottom} V ${box.y}`, label: { x: x + 5, y: (prevBottom + box.y) / 2 + 4, anchor: 'start' }, pending: m.questions[i - 1]!.pending });
    }
    prevBottom = box.y + bh;
    y += rowH + ROW_GAP;
  });
  // The last NO: down to the last leaf, under the boxes.
  const last = m.leaves[n]!;
  const name = wrapText(last.name, BOX_W - 12, LEAF_FONT, 2);
  const lh = Math.max(KEY_HIT, 8 + LINE_H + LINE_H * name.length + 4);
  const lr = { x: BOX_X, y: prevBottom + ROW_GAP, w: BOX_W, h: lh };
  leaves.push({ group: last.group, lines: name, ...lr, hit: { ...lr } });
  const x = BOX_X + BOX_W / 2;
  lines.push({ kind: 'no', from: n - 1, d: `M ${x} ${prevBottom} V ${lr.y}`, label: { x: x + 5, y: (prevBottom + lr.y) / 2 + 4, anchor: 'start' }, pending: m.questions[n - 1]!.pending });
  const bottom = lr.y + lh;
  return { width: KEY_W, height: bottom + 40, boxes, leaves, lines, text: [], foot: bottom + 34 };
}

/** The card in words (its `aria-label`). */
export function keySummary(m: KeyModel, words: KeyWords): string {
  const leafWords = (l: KeyLeafModel) => fill(words.leaf, { g: l.group.toUpperCase(), n: l.count });
  if (m.kind === 'case') return fill(words.wholeCase, { n: m.onTray });
  if (m.kind === 'arrangement') {
    const steps = m.leaves.map((l) => [leafWords(l), l.name, ...(l.wrong > 0 ? [fill(words.wrong, { n: l.wrong })] : [])].join(words.comma));
    return fill(words.summary, { steps: steps.join(words.semicolon) });
  }
  const n = m.questions.length;
  const sp = words.stop === '.' ? ' ' : '';
  const parts = m.questions.map((qq, i) => `${qq.text}${sp}${words.yes}${words.colon}${leafWords(m.leaves[i]!)}${words.stop}`);
  const steps = parts.map((p, i) => (i === 0 ? p : `${words.no}${words.colon}${p}`)).join(sp);
  return fill(words.summary, { steps: `${steps}${sp}${words.no}${words.colon}${leafWords(m.leaves[n]!)}` });
}
