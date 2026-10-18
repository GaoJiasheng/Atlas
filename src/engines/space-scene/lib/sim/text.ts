/**
 * Try-it values and readings as words (pure): a control's value (`2`,
 * `Series`, `On`) and an output's (a number with its decimals, `—` where it
 * does not apply; a state's label).
 */
import { tx } from '../../../../i18n';
import type { SimControl, SimOutput, SimValue } from '../../sim-schema';
import { numberOf, outputDecimals, type SimOutputValue } from './index';
import { formatReading } from '../telemetry';

const ON_OFF = { on: { en: 'On', zh: '开' }, off: { en: 'Off', zh: '关' } } as const;

/** A control's value as words: `2`, `Series`, `On`. */
export function valueText(c: SimControl, v: SimValue | undefined, locale: 'en' | 'zh'): string {
  if (c.kind === 'toggle') return tx(v ? ON_OFF.on : ON_OFF.off, locale);
  if (c.kind === 'step') return `${v}${c.unit ? ` ${c.unit}` : ''}`;
  return tx(c.options.find((o) => o.id === v)?.label ?? { en: String(v), zh: String(v) }, locale);
}

/** An output's value as text: a number with its decimals (`—` where it does not apply), a state's label. */
export function outputText(o: SimOutput, v: SimOutputValue | undefined, locale: 'en' | 'zh'): string {
  if (o.kind === 'state') return tx(o.states?.[String(v)] ?? { en: String(v ?? ''), zh: String(v ?? '') }, locale);
  if (o.kind === 'vector' || o.kind === 'timeline') return '';
  const n = numberOf(v);
  return Number.isFinite(n) ? formatReading(n, outputDecimals(o)) : '—';
}
