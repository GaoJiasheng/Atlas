/**
 * Fractions inside text (docs/15 §4.2, C10): `{3/4}`, `{1 3/4}` and blanks
 * `{?/12}`, `{8/?}` in data and UI text are typeset as small stacked fractions
 * (`renderRich`) and read as words (`speakable`: "three quarters" /「四分之三」)
 * for the presentation voice and screen readers. Used by the lesson tray,
 * card, reader inspector and the glossary card; text without tokens passes
 * through unchanged. Client-safe (React `createElement`, no JSX file needed).
 */
import { createElement, Fragment, type ReactNode } from 'react';
import { fractionWords, type FracSlots } from '../engines/math-scene/lib/words';
import { groupRuns, splitGlue } from './frac-glue';

export type RichPart = { text: string } | { frac: FracSlots };

const TOKEN = /\{(?:(\d+) )?(\d+|\?)\/(\d+|\?)\}/g;

const slot = (s: string): number | null => (s === '?' ? null : Number(s));

/** Split text into plain runs and fraction tokens. */
export function parseRich(text: string): RichPart[] {
  const out: RichPart[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const [, w, n, d] = m;
    out.push({ frac: w !== undefined ? { w: Number(w), n: slot(n!), d: slot(d!) } : { n: slot(n!), d: slot(d!) } });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Text with every fraction token read as words. */
export function speakable(text: string, locale: 'en' | 'zh'): string {
  return parseRich(text)
    .map((p) => ('text' in p ? p.text : fractionWords(p.frac, locale)))
    .join('');
}

/** Bad-looking tokens: `{…}` with a slash that is not a valid fraction token (validator). */
export function badTokens(text: string): string[] {
  const ok = new Set([...text.matchAll(TOKEN)].map((m) => m.index));
  return [...text.matchAll(/\{[^{}]*\/[^{}]*\}/g)].filter((m) => !ok.has(m.index)).map((m) => m[0]);
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

/** Text with its fraction tokens typeset; a fraction and the operator beside it stay on one line. */
export function renderRich(text: string, locale: 'en' | 'zh'): ReactNode {
  const parts = parseRich(text);
  if (parts.length === 1 && 'text' in parts[0]!) return text;
  const items: { node: ReactNode; glued: boolean }[] = [];
  parts.forEach((p, i) => {
    if ('frac' in p) items.push({ node: fracNode(p.frac, locale, `f${i}`), glued: true });
    else
      splitGlue(p.text, parts[i - 1] !== undefined && 'frac' in parts[i - 1]!, parts[i + 1] !== undefined && 'frac' in parts[i + 1]!).forEach((piece, k) =>
        items.push({ node: createElement(Fragment, { key: `t${i}.${k}` }, piece.text), glued: piece.glue }),
      );
  });
  return createElement(
    Fragment,
    null,
    groupRuns(items).map((g, i) => (Array.isArray(g) ? createElement('span', { key: `g${i}`, className: 'atlas-nowrap' }, g) : g)),
  );
}
