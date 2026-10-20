/**
 * What a screen reader hears of an instrument (docs/32 §8: the scale, where the pointer or the ends are, never the
 * reading worked out): the printed range and gaps, then each landmark named as a sighted child sees it — a printed
 * number, or so many small parts on from the printed number before it (a hidden number, a scale numbered only at its
 * ends or not at all is never read out). A balance: what is on each pan (weights by their mass, loads unnamed) and
 * which way the beam tips.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { InstrumentSpec, PanThing } from '../schema';
import { beamTilt, labelled, markAt, markOf, pointerOf, scaleOf, unitOf } from './instrument';
import { qtyWords } from './words';
import { SCALE } from './decimal';

export function describeInstrument(s: InstrumentSpec, locale: Locale): string {
  const words = (units: number) => qtyWords({ kind: 'meas', unit: unitOf(s), value: { units, dp: 0 } }, locale);
  if (s.type === 'balance') {
    const pan = (items: PanThing[]) => items.map((item) => (item.weight !== undefined ? words(item.weight * SCALE) : t(locale, 'math.measure.describe.object'))).join(' + ') || t(locale, 'math.measure.describe.empty');
    const tilt = beamTilt(s);
    return t(locale, 'math.measure.describe.balance', {
      a: pan(s.left ?? []),
      b: pan(s.right ?? []),
      tilt: t(locale, tilt === 0 ? 'math.measure.level' : tilt < 0 ? 'math.measure.leftHeavier' : 'math.measure.rightHeavier'),
    });
  }
  const sc = scaleOf(s);
  if (!sc || s.scale === false) return t(locale, 'math.measure.describe.container');

  /* the printed numbers, and a mark named by them */
  const printed: number[] = [];
  for (let i = 0; i <= sc.parts; i++) if (labelled(s, sc, markAt(sc, i))) printed.push(markAt(sc, i));
  const below = (v: number) => printed.filter((p) => p <= v).at(-1) ?? null;
  const above = (v: number) => printed.find((p) => p >= v) ?? null;
  const name = (v: number): string => {
    if (printed.includes(v)) return words(v);
    const lo = below(v);
    return lo === null ? t(locale, 'math.measure.describe.fromStart', { n: (v - sc.from) / sc.minor }) : t(locale, 'math.measure.describe.partsAfter', { n: (v - lo) / sc.minor, a: words(lo) });
  };

  const head =
    s.labels === 'none'
      ? t(locale, 'math.measure.describe.scaleNone', { n: sc.parts })
      : s.labels === 'ends'
        ? t(locale, 'math.measure.describe.scaleEnds', { a: words(sc.from), b: words(sc.to), n: sc.parts })
        : t(locale, 'math.measure.describe.scale', { a: name(sc.from), b: name(sc.to), gap: words(sc.major), n: sc.per });

  const object = s.object ?? s.line;
  if (object) {
    const a = object.from.units;
    const b = object.to.units;
    if (markOf(sc, b) !== null) return `${head} ${t(locale, 'math.measure.describe.onEnds', { a: name(a), b: name(b) })}`;
    // An end off the marks: the marks either side, not rounded for the child.
    const lo = sc.from + Math.floor((b - sc.from) / sc.minor) * sc.minor;
    return `${head} ${t(locale, 'math.measure.describe.ends', { a: name(a), b: name(lo), c: name(lo + sc.minor) })}`;
  }
  const v = pointerOf(s);
  if (v === null) return head;
  if (printed.includes(v)) return `${head} ${t(locale, 'math.measure.describe.mark', { v: words(v) })}`;
  const lo = below(v);
  const hi = above(v);
  if (lo !== null && hi !== null) return `${head} ${t(locale, 'math.measure.describe.between', { a: words(lo), b: words(hi), n: (v - lo) / sc.minor })}`;
  return `${head} ${t(locale, 'math.measure.describe.pointer', { p: name(v) })}`;
}
