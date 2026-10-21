/**
 * Try-it values and readings as words (pure): a control's value (`2`,
 * `Series`, `On`) and an output's (a number with its decimals, `—` where it
 * does not apply; a state's label).
 */
import { plainText, speakable } from '../../../../lib/rich-text';
import { tx } from '../../../../i18n';
import type { SimControl, SimOutput, SimValue } from '../../sim-schema';
import { numberOf, outputDecimals, type SimOutputValue } from './index';
import { formatReading } from '../telemetry';

const ON_OFF = { on: { en: 'On', zh: '开' }, off: { en: 'Off', zh: '关' } } as const;

/** Local clock hours use the site's shared time token, rounded to the nearest minute. */
export function timeToken(hours: number): string {
  const minutes = Math.round(hours * 60);
  return `{t:${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}}`;
}

export function timeText(hours: number, locale: 'en' | 'zh', short = false): string {
  if (!Number.isFinite(hours)) return '—';
  const text = plainText(timeToken(hours), locale);
  return short ? text.replace(/\.00(?= |$)/, '') : text;
}

/** Time values read as clock words instead of decimal hours. */
export function valueWords(c: SimControl, v: SimValue | undefined, locale: 'en' | 'zh'): string {
  return c.kind === 'step' && c.format === 'time' && typeof v === 'number' ? speakable(timeToken(v), locale) : valueText(c, v, locale);
}

export function outputWords(o: SimOutput, v: SimOutputValue | undefined, locale: 'en' | 'zh'): string {
  return o.format === 'time' && typeof v === 'number' && Number.isFinite(v) ? speakable(timeToken(v), locale) : outputText(o, v, locale);
}

/** A control's value as words: `2`, `Series`, `On`. */
export function valueText(c: SimControl, v: SimValue | undefined, locale: 'en' | 'zh'): string {
  if (c.kind === 'toggle') return tx(v ? ON_OFF.on : ON_OFF.off, locale);
  if (c.kind === 'step' && c.format === 'time') return timeText(Number(v), locale);
  if (c.kind === 'step') return `${v}${c.unit ? ` ${c.unit}` : ''}`;
  return tx(c.options.find((o) => o.id === v)?.label ?? { en: String(v), zh: String(v) }, locale);
}

/** An output's value as text: a number with its decimals (`—` where it does not apply), a state's label. */
export function outputText(o: SimOutput, v: SimOutputValue | undefined, locale: 'en' | 'zh'): string {
  if (o.kind === 'state') return tx(o.states?.[String(v)] ?? { en: String(v ?? ''), zh: String(v ?? '') }, locale);
  if (o.kind === 'vector' || o.kind === 'timeline') return '';
  const n = numberOf(v);
  if (o.format === 'time') return timeText(n, locale);
  return Number.isFinite(n) ? formatReading(n, outputDecimals(o, n)) : '—';
}
