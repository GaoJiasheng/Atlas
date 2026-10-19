/** The visible landmarks of an instrument, without calculating a reading for the learner. */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { InstrumentSpec, PanThing } from '../schema';
import { beamTilt, markOf, pointerOf, scaleOf, unitOf } from './instrument';
import { qtyWords } from './words';
import { SCALE } from './decimal';

export function describeInstrument(s: InstrumentSpec, locale: Locale): string {
  const words = (units: number) => qtyWords({ kind: 'meas', unit: unitOf(s), value: { units, dp: 0 } }, locale);
  if (s.type === 'balance') {
    const pan = (items: PanThing[]) => items.map((item) => item.weight !== undefined
      ? words(item.weight * SCALE)
      : t(locale, 'math.measure.describe.object')).join(' + ') || t(locale, 'math.measure.describe.empty');
    const tilt = beamTilt(s);
    return t(locale, 'math.measure.describe.balance', {
      a: pan(s.left ?? []), b: pan(s.right ?? []),
      tilt: t(locale, tilt === 0 ? 'math.measure.level' : tilt < 0 ? 'math.measure.leftHeavier' : 'math.measure.rightHeavier'),
    });
  }
  const sc = scaleOf(s);
  if (!sc || s.scale === false) return t(locale, 'math.measure.describe.container');
  const head = t(locale, 'math.measure.describe.scale', { a: words(sc.from), b: words(sc.to), gap: words(sc.major), n: sc.per });
  const object = s.object ?? s.line;
  if (object) {
    const a = object.from.units;
    const b = object.to.units;
    const lo = sc.from + Math.floor((b - sc.from) / sc.minor) * sc.minor;
    return `${head} ${markOf(sc, b) !== null
      ? t(locale, 'math.measure.describe.onEnds', { a: words(a), b: words(b) })
      : t(locale, 'math.measure.describe.ends', { a: words(a), b: words(lo), c: words(lo + sc.minor) })}`;
  }
  const v = pointerOf(s);
  if (v === null) return head;
  if (v % sc.major === 0) return `${head} ${t(locale, 'math.measure.describe.mark', { v: words(v) })}`;
  const lo = Math.max(sc.from, Math.floor(v / sc.major) * sc.major);
  return `${head} ${t(locale, 'math.measure.describe.between', { a: words(lo), b: words(Math.min(sc.to, lo + sc.major)), n: (v - lo) / sc.minor })}`;
}
