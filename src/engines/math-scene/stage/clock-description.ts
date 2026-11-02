/** Accessible description of clock hands, independent of SVG rendering. */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { ClockFaceSpec } from '../schema';
import { dial, handAngles } from '../lib/clock';
import { durationWords } from '../lib/words';

export function describeClock(f: ClockFaceSpec, locale: Locale): string {
  if (f.face === 'stopwatch') return durationWords(f.elapsed?.t ?? 0, ['m', 's'], locale);
  const a = handAngles(f.time, f.faulty);
  const [hourDeg, minDeg] = a.swapped ? [a.minute, a.hour] : [a.hour, a.minute];
  const numeral = (n: number) => ((n + 11) % 12) + 1;
  const hd = dial(hourDeg);
  const h = Math.floor(hd / 30);
  const hour = Math.abs(hd - h * 30) < 0.01 ? t(locale, 'math.clock.on', { n: numeral(h) }) : t(locale, 'math.clock.between', { a: numeral(h), b: numeral(h + 1) });
  const mm = Math.round(dial(minDeg) / 6) % 60;
  const minute = mm % 5 === 0 ? t(locale, 'math.clock.on', { n: numeral(mm / 5) }) : t(locale, 'math.clock.mark', { m: mm });
  return t(locale, 'math.clock.hands', { hour, minute });
}
