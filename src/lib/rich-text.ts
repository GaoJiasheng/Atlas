/**
 * Numbers inside text (docs/15 §4.2, C10; docs/19 §3.0 G7): tokens in data and
 * UI text that are typeset (`renderRich`) and read as words (`speakable`) for
 * the presentation voice and screen readers:
 *   `{3/4}`, `{1 3/4}`, blanks `{?/12}`, `{8/?}`  a small stacked fraction ("three quarters" /「四分之三」)
 *   `{t:09:40}`  a time of day in 12-hour time, by the lesson's notation (`9.40 am`; zh prose `上午 9.40`)
 *   `{t:7:20|face}`  as a clock face reads it, no am / pm (`7.20`)
 *   `{t:19:20|24}`  in 24-hour time (`19:20`)
 *   `{t:19:20|ampm}`  12-hour time with the letters am / pm in Chinese too (`7.20 pm`, where the letters are the point)
 *   `{d:95m}`, `{d:1h35m}`, `{d:75s}`  a duration in the units written (`1 h 35 min` / `1 小时 35 分钟`)
 *   `{u:28 cm2}`, `{u:1.5 l}`  a measure (`28 cm²`, `1.5 ℓ`, read "twenty-eight square centimetres", "one point five litres")
 * Whole numbers are written as they are; `3 r 2` reads "3 remainder 2" /「3 余 2」.
 * Decimals and money are written as they are (`0.235`, `$2.35`, `0.666…`) and
 * read digit by digit after the point ("zero point two three five" /
 * 「零点二三五」) and in dollars and cents ("2 dollars 35 cents" /「2 元 35 分」);
 * `≈` reads "is about" /「约等于」 (docs/29 X8). A decimal, an amount and
 * the operator beside them stay on one line.
 * Used by the lesson tray, card, reader inspector and the glossary card; text
 * without tokens passes through unchanged. Client-safe (React `createElement`,
 * no JSX file needed). The lesson's notation reaches the time tokens through
 * `NotationContext` (the MathScene view provides it).
 */
import { createContext, createElement, Fragment, useContext, type ReactNode } from 'react';
import { clockWords, decimalWords, durationWords, fractionWords, moneyWords, numberEn, numberZh, type FracSlots } from '../engines/math-scene/lib/words';
import { clockText, DEFAULT_NOTATION, durationText, measureText, parseClock, parseDuration, parseMeasure, unitWords, type ClockMode, type DurUnit, type Measure, type Notation } from '../engines/math-scene/lib/value';
import { parseDecimal, type Decimal } from '../engines/math-scene/lib/decimal';
import { groupRuns, splitGlue } from './frac-glue';

export type RichPart =
  | { text: string }
  | { frac: FracSlots }
  /** `letters`: am / pm written as letters in Chinese too (`|ampm`). */
  | { time: number; mode: ClockMode; letters?: boolean }
  | { dur: number; units: DurUnit[] }
  | { measure: Measure }
  /** A decimal written in the text (`more`: it goes on, `0.666…`). */
  | { dec: Decimal; raw: string; more: boolean }
  /** An amount of money written in the text, in cents. */
  | { money: number; raw: string };

/** The lesson's way of writing times (`lesson.json` `notation`). */
export const NotationContext = createContext<Notation>(DEFAULT_NOTATION);

const CANDIDATE = /\{([^{}]*)\}/g;
const FRAC = /^(?:(\d+) )?(\d+|\?)\/(\d+|\?)$/;
const TIME = /^t:(\d{1,2}:\d{2}(?::\d{2})?)(?:\|(face|24|ampm))?$/;
const DUR = /^d:(\S+)$/;
const MEASURE = /^u:(.+)$/;

const slot = (s: string): number | null => (s === '?' ? null : Number(s));

/** Money (`$2.35`, `$7`) and decimals (`0.35`, `0.666…`) in plain text. */
const NUMBERS = /\$(\d{1,5})(?:\.(\d{2}))?|(?<![\d.])(\d{1,5}\.\d{1,6})(…)?(?![\d.])/g;

/** Plain text split into its runs, decimals and amounts. */
function numbersIn(text: string): RichPart[] {
  const out: RichPart[] = [];
  let last = 0;
  for (const m of text.matchAll(NUMBERS)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ money: Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0), raw: m[0] });
    else out.push({ dec: parseDecimal(m[3]!)!, raw: m[0], more: !!m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** One `{…}` token's content as a part, or `null` when it is not a token (or a bad one). */
function tokenPart(body: string): Exclude<RichPart, { text: string }> | null {
  const f = FRAC.exec(body);
  if (f) {
    const [, w, n, d] = f;
    return { frac: w !== undefined ? { w: Number(w), n: slot(n!), d: slot(d!) } : { n: slot(n!), d: slot(d!) } };
  }
  const t = TIME.exec(body);
  if (t) {
    const at = parseClock(t[1]!);
    const mode: ClockMode = t[2] === '24' ? '24' : t[2] === 'face' ? 'face' : '12';
    if (at === null || (mode === 'face' && Number(t[1]!.split(':')[0]) > 12)) return null;
    return t[2] === 'ampm' ? { time: at, mode, letters: true } : { time: at, mode };
  }
  const d = DUR.exec(body);
  if (d) {
    const v = parseDuration(d[1]!);
    return v ? { dur: v.t, units: v.units } : null;
  }
  const u = MEASURE.exec(body);
  if (u) {
    const m = parseMeasure(u[1]!);
    return m ? { measure: m } : null;
  }
  return null;
}

/** A Chinese character or full-width punctuation. */
const CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;

/**
 * Spaces between a token and Chinese text when the token itself shows Chinese at that end (`上午 9.40`, `1 小时 35 分钟`):
 * "是 {t:19:10}。" shows "是晚上 7.10。", not "是 晚上 7.10。". A space beside digits or Latin letters stays.
 */
function tidySpaces(parts: RichPart[], locale: 'en' | 'zh'): RichPart[] {
  if (locale !== 'zh') return parts;
  const out = parts.map((p) => ('text' in p ? { text: p.text } : p));
  out.forEach((p, i) => {
    if ('text' in p || 'frac' in p) return;
    const s = shown(p, locale, DEFAULT_NOTATION, false);
    const prev = out[i - 1];
    const next = out[i + 1];
    if (CJK.test(s[0] ?? '') && prev && 'text' in prev && /\s$/.test(prev.text) && CJK.test(prev.text.trimEnd().at(-1) ?? '')) prev.text = prev.text.trimEnd();
    if (CJK.test(s.at(-1) ?? '') && next && 'text' in next && /^\s/.test(next.text) && CJK.test(next.text.trimStart()[0] ?? '')) next.text = next.text.trimStart();
  });
  return out.filter((p) => !('text' in p) || p.text !== '');
}

/** Split text into plain runs and tokens. */
export function parseRich(text: string): RichPart[] {
  const out: RichPart[] = [];
  let last = 0;
  const push = (s: string) => {
    if (!s) return;
    for (const p of numbersIn(s)) {
      const prev = out.at(-1);
      if ('text' in p && prev && 'text' in prev) prev.text += p.text;
      else out.push(p);
    }
  };
  for (const m of text.matchAll(CANDIDATE)) {
    const part = tokenPart(m[1]!);
    if (!part) continue;
    push(text.slice(last, m.index));
    out.push(part);
    last = m.index + m[0].length;
  }
  push(text.slice(last));
  return out;
}

/** A token's text as shown (`line`: a number sentence, the notation's am / pm and h / min in both languages). */
function shown(p: Exclude<RichPart, { text: string }>, locale: 'en' | 'zh', notation: Notation, line: boolean): string {
  if ('frac' in p) {
    const s = (v: number | null) => (v === null ? '?' : String(v));
    return `${p.frac.w ? `${p.frac.w} ` : ''}${s(p.frac.n)}/${s(p.frac.d)}`;
  }
  if ('time' in p) return clockText(p.time, p.mode, notation, locale, line || !!p.letters);
  if ('dur' in p) return durationText(p.dur, p.units, locale, line);
  if ('raw' in p) return p.raw;
  return measureText(p.measure, locale);
}

/** `3 r 2` read aloud. */
const REMAINDER = /(\d)\s+r\s+(\d)/g;

/** A measure read aloud: a whole number in words ("twenty-eight square centimetres"), a decimal digit by digit ("one point five litres"). */
function measureWords(m: Measure, locale: 'en' | 'zh'): string {
  const whole = m.value.dp === 0 && m.value.units % 1_000_000 === 0;
  const n = m.value.units / 1_000_000;
  const number = whole ? (locale === 'zh' ? numberZh(n) : numberEn(n)) : decimalWords(m.value, locale);
  return `${number}${locale === 'zh' ? '' : ' '}${unitWords(m.unit, locale, whole && n === 1 ? 1 : 2)}`;
}

/** Text with every token read as words. */
export function speakable(text: string, locale: 'en' | 'zh'): string {
  return parseRich(text)
    .map((p) => {
      if ('text' in p) return p.text.replace(REMAINDER, locale === 'zh' ? '$1 余 $2' : '$1 remainder $2').replace(/\s*≈\s*/g, locale === 'zh' ? ' 约等于 ' : ' is about ');
      if ('frac' in p) return fractionWords(p.frac, locale);
      if ('time' in p) return clockWords(p.time, p.mode, locale);
      if ('dur' in p) return durationWords(p.dur, p.units, locale);
      if ('money' in p) return moneyWords(p.money, locale);
      if ('dec' in p) return decimalWords(p.dec, locale, p.more);
      return measureWords(p.measure, locale);
    })
    .join('');
}

/** Text with every token written out as shown (aria labels, plain strings). */
export function plainText(text: string, locale: 'en' | 'zh', notation: Notation = DEFAULT_NOTATION, line = false): string {
  return tidySpaces(parseRich(text), line ? 'en' : locale)
    .map((p) => ('text' in p ? p.text : shown(p, locale, notation, line)))
    .join('');
}

/** Bad-looking tokens (validator): `{…}` with a slash that is not a fraction, or a `{t:…}` / `{d:…}` / `{u:…}` that does not parse. */
export function badTokens(text: string): string[] {
  return [...text.matchAll(CANDIDATE)].filter((m) => /\/|^[tdu]:/.test(m[1]!) && !tokenPart(m[1]!)).map((m) => m[0]);
}

const cell = (cls: string, v: number | null) => createElement('span', { className: v === null ? `${cls} atlas-frac__blank` : cls }, v === null ? '?' : String(v));

/** One stacked fraction (`<Frac>` renders the same markup on the server). */
export function fracNode(f: FracSlots, locale: 'en' | 'zh', key?: string | number): ReactNode {
  return createElement(
    'span',
    { key, className: 'atlas-frac', role: 'img', 'aria-label': fractionWords(f, locale) },
    f.w ? createElement('span', { className: 'atlas-frac__w', 'aria-hidden': true }, String(f.w)) : null,
    createElement('span', { className: 'atlas-frac__f', 'aria-hidden': true }, cell('atlas-frac__n', f.n), cell('atlas-frac__d', f.d)),
  );
}

/** A time, a duration, a measure, a decimal or an amount: one unbreakable run, its words for screen readers. */
function ValueToken({ part, locale, line }: { part: Exclude<RichPart, { text: string } | { frac: FracSlots }>; locale: 'en' | 'zh'; line: boolean }) {
  const notation = useContext(NotationContext);
  const words = 'time' in part ? clockWords(part.time, part.mode, locale) : 'dur' in part ? durationWords(part.dur, part.units, locale) : 'money' in part ? moneyWords(part.money, locale) : 'dec' in part ? decimalWords(part.dec, locale, part.more) : null;
  return createElement('span', { className: 'atlas-value', 'aria-label': words ?? undefined }, shown(part, locale, notation, line));
}

/**
 * Text with its tokens typeset; a fraction (or a time) and the operator beside
 * it stay on one line. `line`: the text is a number sentence (the 12-hour
 * am / pm and h / min stay as the notation writes them in Chinese too).
 */
export function renderRich(text: string, locale: 'en' | 'zh', opts: { line?: boolean } = {}): ReactNode {
  const line = !!opts.line;
  const parts = tidySpaces(parseRich(text), line ? 'en' : locale);
  if (parts.length === 1 && 'text' in parts[0]!) return parts[0].text;
  const items: { node: ReactNode; glued: boolean }[] = [];
  const isToken = (p: RichPart | undefined) => p !== undefined && !('text' in p);
  parts.forEach((p, i) => {
    if ('frac' in p) items.push({ node: fracNode(p.frac, locale, `f${i}`), glued: true });
    else if (!('text' in p)) items.push({ node: createElement(ValueToken, { key: `v${i}`, part: p, locale, line }), glued: true });
    else
      splitGlue(p.text, isToken(parts[i - 1]), isToken(parts[i + 1])).forEach((piece, k) =>
        items.push({ node: createElement(Fragment, { key: `t${i}.${k}` }, piece.text), glued: piece.glue }),
      );
  });
  return createElement(
    Fragment,
    null,
    groupRuns(items).map((g, i) => (Array.isArray(g) ? createElement('span', { key: `g${i}`, className: 'atlas-nowrap' }, g) : g)),
  );
}
