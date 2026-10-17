/**
 * The decimal models (docs/29 §3.2–3.5, §3.10): the hundred grid's shading
 * order, runs and magnifier; the place-value chart's discs, trades, shares
 * and shifts; the decimal line's zoom levels and rounding ends; money's
 * pieces; the rules `validate` puts on them; the decimal readings (X8).
 */
import { describe, expect, it } from 'vitest';
import { model as modelSchema, taskSchema, type Model, type Task } from '../../src/engines/math-scene/schema';
import { cellPlace, fills, fillTo, partialCells, runsOf } from '../../src/engines/math-scene/lib/dgrid';
import { applyDTrade, chartColumns, dcounts, dsharePlace, dstandard, dtotal, shiftedValue, DZERO } from '../../src/engines/math-scene/lib/placevalue';
import { levelsFor, levelsOf, pathTo, roundingEnds, roundingLine, valueAt } from '../../src/engines/math-scene/lib/dline';
import { piecesByPlace, totalCents } from '../../src/engines/math-scene/lib/money';
import { formatDecimal, parseDecimal } from '../../src/engines/math-scene/lib/decimal';
import { decimalModelIssues } from '../../src/engines/math-scene/validate-decimals';
import { taskIssues } from '../../src/engines/math-scene/validate';
import { decimalWords, moneyWords } from '../../src/engines/math-scene/lib/words';
import { parseRich, plainText, speakable } from '../../src/lib/rich-text';
import { cleanDecimal } from '../../src/engines/math-scene/lib/decimal-tasks';

const m = (x: unknown): Model => modelSchema.parse(x);
const d = (s: string) => parseDecimal(s)!;
const f = (x: { units: number; dp: number } | null) => (x ? formatDecimal(x) : null);
const placeholder = { prompt: { en: 'p', zh: 'p' }, guide: { en: 'g', zh: 'g' }, hints: [{ en: 'h', zh: 'h' }], feedback: { correct: { en: 'c', zh: 'c' }, fallback: { en: 'f', zh: 'f' }, reveal: { en: 'r', zh: 'r' }, wrong: [] } };
const task = (x: Record<string, unknown>): Task => taskSchema.parse({ ...placeholder, ...x });

describe('the hundred grid', () => {
  it('shades whole strips from the left, then squares from the top', () => {
    const g = m({ kind: 'decimal-grid', given: '0.35' });
    if (g.kind !== 'decimal-grid') throw new Error('grid');
    const pieces = fills(100, runsOf(g));
    expect(pieces).toHaveLength(35);
    expect(cellPlace(100, pieces.at(-1)!.cell)).toEqual({ whole: 0, strip: 3, square: 4 });
    expect(cellPlace(10, 13)).toEqual({ whole: 1, strip: 3, square: 0 });
  });
  it('keeps the runs in order and their sum (0.3 + 0.05)', () => {
    const g = m({ kind: 'decimal-grid', runs: [{ value: '0.3', tone: 'cold' }, { value: '0.05', tone: 'signal' }] });
    if (g.kind !== 'decimal-grid') throw new Error('grid');
    const pieces = fills(100, runsOf(g));
    expect(pieces.filter((p) => p.tone === 'cold')).toHaveLength(30);
    expect(pieces.filter((p) => p.tone === 'signal').map((p) => p.cell)).toEqual([30, 31, 32, 33, 34]);
  });
  it('puts the thousandths in the one square the magnifier opens', () => {
    const g = m({ kind: 'decimal-grid', level: 1000, given: '0.235', zoom: { at: '0.23' } });
    if (g.kind !== 'decimal-grid') throw new Error('grid');
    expect(partialCells(1000, runsOf(g))).toEqual([23]);
    expect(decimalModelIssues(g)).toEqual([]);
    expect(decimalModelIssues(m({ kind: 'decimal-grid', level: 1000, given: '0.235', zoom: { at: '0.22' } })).join()).toContain('magnifier must open that square');
    expect(decimalModelIssues(m({ kind: 'decimal-grid', level: 100, given: '0.235' })).join()).toContain('more places');
  });
  it('fills a check to an amount (the stepper)', () => {
    expect(fillTo(1000, 104, 100)).toEqual({ cells: Array.from({ length: 10 }, (_, i) => i), slivers: 4 });
    expect(fillTo(10, 1600, 20).cells).toHaveLength(16);
  });
});

describe('the place-value chart', () => {
  it('holds a number as discs and keeps its value through trades', () => {
    const c = dstandard(d('2.35'));
    expect(c).toEqual({ ...DZERO, O: 2, t: 3, h: 5 });
    expect(dtotal(c)).toBe(2350);
    const traded = applyDTrade(c, 'O>t');
    expect(traded).toEqual({ ...DZERO, O: 1, t: 13, h: 5 });
    expect(dtotal(traded)).toBe(2350);
    expect(applyDTrade(dcounts({ h: 13 }), 'h>t')).toEqual({ ...DZERO, t: 1, h: 3 });
  });
  it('shares a place into plates as far as it goes', () => {
    expect(dsharePlace({ ...DZERO, O: 5, t: 6 }, { ...DZERO }, 'O', 4)).toEqual({ mat: { ...DZERO, O: 1, t: 6 }, dealt: { ...DZERO, O: 1 } });
  });
  it('moves the digits, never the point', () => {
    expect(f(shiftedValue(d('2.35'), 1))).toBe('23.5');
    expect(f(shiftedValue(d('2.35'), 3))).toBe('2350');
    expect(f(shiftedValue(d('4.8'), -2))).toBe('0.048');
    expect(shiftedValue(d('3.07'), -2)).toBeNull();
  });
  it('draws the columns the numbers need (and where the digits slide to)', () => {
    const v = m({ kind: 'place-value', value: '34.506' });
    const s = m({ kind: 'place-value', value: '4.8', shift: { by: 2, dir: 'right' } });
    if (v.kind !== 'place-value' || s.kind !== 'place-value') throw new Error('chart');
    expect(chartColumns(v)).toEqual(['T', 'O', 't', 'h', 'th']);
    expect(chartColumns(s)).toEqual(['O', 't', 'h', 'th']);
  });
  it('checks plates, columns and disc counts', () => {
    expect(decimalModelIssues(m({ kind: 'place-value', value: '5.6', plates: 4, dealt: { O: 1, t: 4 }, column: { op: '÷', a: '5.6', b: '4' } }))).toEqual([]);
    expect(decimalModelIssues(m({ kind: 'place-value', value: '5.6', plates: 4, dealt: { O: 1, t: 3 } })).join()).toContain('not 5.6');
    expect(decimalModelIssues(m({ kind: 'place-value', value: '2', column: { op: '÷', a: '2', b: '3' } })).join()).toContain('does not end');
  });
});

describe('the decimal number line and its zoom', () => {
  it('blows one step up into ten, twice', () => {
    const line = m({ kind: 'numberline', scale: 'decimal', from: '0', to: '1', step: '0.1', zoom: [{ from: '0.2', to: '0.3' }, { from: '0.23', to: '0.24' }] });
    if (line.kind !== 'numberline' || line.scale !== 'decimal') throw new Error('line');
    const levels = levelsOf(line);
    expect(levels.map((l) => l && `${f(l.from)}–${f(l.to)} by ${f(l.step)}`)).toEqual(['0–1 by 0.1', '0.2–0.3 by 0.01', '0.23–0.24 by 0.001']);
    expect(f(valueAt(levels[2]!, 5))).toBe('0.235');
    expect(pathTo(line, d('0.235'), 2)).toEqual({ path: [2, 3], tick: 5 });
    expect(levelsFor(line, [2, 3]).at(-1)!.steps).toBe(10);
    expect(decimalModelIssues(line)).toEqual([]);
  });
  it('rejects a zoom that is not one step of the line above', () => {
    expect(decimalModelIssues(m({ kind: 'numberline', scale: 'decimal', from: '0', to: '1', step: '0.1', zoom: [{ from: '0.2', to: '0.4' }] })).join()).toContain('not one step');
    expect(decimalModelIssues(m({ kind: 'numberline', scale: 'decimal', from: '0', to: '3', step: '0.1' })).join()).toContain('30 steps');
  });
  it('finds a rounding line: the two neighbours and the nearer', () => {
    const e = roundingEnds(d('2.96'), 1);
    expect([f(e.lo), f(e.hi), f(e.nearest)]).toEqual(['2.9', '3.0', '3.0']);
    const l = roundingLine(d('3.447'), 1);
    expect([f(l.from), f(l.to), f(l.step)]).toEqual(['3.4', '3.5', '0.01']);
  });
});

describe('money', () => {
  it('shows an amount by its places, with no 1-cent coin', () => {
    expect(piecesByPlace(235)).toEqual(['1', '1', '0.1', '0.1', '0.1', '0.05']);
    expect(piecesByPlace(1245)).toEqual(['10', '1', '1', '0.1', '0.1', '0.1', '0.1', '0.05']);
    expect(totalCents(piecesByPlace(1000))).toBe(1000);
    expect(decimalModelIssues(m({ kind: 'money', amount: '2.32' })).join()).toContain('5 cents');
  });
});

describe('decimal tasks the validator refuses', () => {
  const issues = (x: Record<string, unknown>) => taskIssues(task(x), 't', { bridge: false, practice: false }).map((i) => i.message).join(' | ');
  it('a round-on-line stands on the two neighbours and writes the places', () => {
    expect(issues({ id: 'r', kind: 'round-on-line', model: { kind: 'numberline', scale: 'decimal', from: '2.9', to: '3.0', step: '0.01' }, value: '2.96', to: 1, then: { answer: '3.0', form: 'decimal', places: 1 } })).toBe('');
    expect(issues({ id: 'r', kind: 'round-on-line', model: { kind: 'numberline', scale: 'decimal', from: '2', to: '3', step: '0.1' }, value: '2.96', to: 1, then: { answer: '3.0', form: 'decimal' } })).toContain('the two neighbours');
  });
  it('an answer agrees with its work, and only diagnosable codes are declared', () => {
    expect(issues({ id: 'a', kind: 'input', model: { kind: 'place-value', value: '2.36' }, answer: '9.4', form: 'decimal', work: { do: 'multiply', a: '2.36', b: '4' } })).toContain('the work comes to 9.44');
    expect(issues({ id: 'a', kind: 'input', model: { kind: 'place-value', value: '2.36' }, answer: '9.44', form: 'decimal', work: { do: 'multiply', a: '2.36', b: '4' }, feedback: { ...placeholder.feedback, wrong: [{ when: 'round-chain', say: { en: 's', zh: 's' }, sample: '9' }] } })).toContain('"round-chain" needs');
    expect(issues({ id: 'a', kind: 'input', model: { kind: 'place-value', value: '2.36' }, answer: '9.44', form: 'decimal', work: { do: 'multiply', a: '2.36', b: '4' }, feedback: { ...placeholder.feedback, wrong: [{ when: 'tens-as-ones', say: { en: 's', zh: 's' }, sample: '9' }] } })).toContain('is a whole-ops code, not one for decimals');
  });
  it('an align-add starts away from the point', () => {
    expect(issues({ id: 'a', kind: 'align-add', model: { kind: 'place-value', rows: ['3.45', '1.25'] }, op: '+', a: '3.45', b: '1.25', then: { answer: '4.7', form: 'decimal' } })).toContain('start lined up');
  });
});

describe('decimals and money read aloud (docs/29 D9, X8)', () => {
  it('reads the digits after the point one by one', () => {
    expect(decimalWords(d('0.35'), 'en')).toBe('zero point three five');
    expect(decimalWords(d('34.506'), 'en')).toBe('thirty-four point five zero six');
    expect(decimalWords(d('3.0'), 'en')).toBe('three point zero');
    expect(decimalWords(d('0.35'), 'zh')).toBe('零点三五');
    expect(decimalWords(d('34.506'), 'zh')).toBe('三十四点五零六');
  });
  it('reads money in dollars and cents', () => {
    expect(moneyWords(235, 'en')).toBe('2 dollars 35 cents');
    expect(moneyWords(35, 'en')).toBe('35 cents');
    expect(moneyWords(300, 'en')).toBe('3 dollars');
    expect(moneyWords(235, 'zh')).toBe('2 元 35 分');
  });
  it('finds decimals and money in text, speaks them, keeps their text', () => {
    expect(speakable('0.45 + 0.38 = 0.83', 'en')).toBe('zero point four five + zero point three eight = zero point eight three');
    expect(speakable('2.96 ≈ 3.0', 'zh')).toBe('二点九六 约等于 三点零');
    expect(speakable('$2.35 and $0.35', 'en')).toBe('2 dollars 35 cents and 35 cents');
    expect(speakable('2 ÷ 3 = 0.666…', 'en')).toBe('2 ÷ 3 = zero point six six six, and so on');
    expect(speakable('{u:1.5 l}', 'en')).toBe('one point five litres');
    expect(plainText('{u:1.5 l} and $2.35', 'en')).toBe('1.5 ℓ and $2.35');
    expect(parseRich('Step 3 of 4.')).toEqual([{ text: 'Step 3 of 4.' }]);
  });
  it('a decimal box keeps digits and one point, `.35` written 0.35', () => {
    expect(cleanDecimal('.35')).toBe('0.35');
    expect(cleanDecimal('1.2.3')).toBe('1.23');
    expect(cleanDecimal('ab12')).toBe('12');
  });
});
