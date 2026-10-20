/**
 * The magnifier (docs/32 §3.2 `zoom`, the clock's and the hundred grid's
 * lens): a small ring on one numbered stretch of the instrument, two leader
 * hairlines, and a big box where that stretch is drawn straight across its
 * width — its small parts large enough to count, the numbers only at its two
 * ends (no value is printed on a part), and where the reading falls.
 */
import type { InstrumentSpec } from '../../schema';
import type { Scale } from '../../lib/instrument';
import type { Rect } from '../layout';
import { straightTrack, type Track } from './geometry';
import { CountArcs, Marks } from './Scale';
import { magnifiedCounts, magnifierRing } from './magnifier-geometry';

export function Magnifier({ s, sc, track, stretch, pointer, mag, counted }: { s: InstrumentSpec; sc: Scale; track: Track; stretch: { from: number; to: number }; pointer: number | null; mag: Rect; counted?: number[] }) {
  const { x: cx, y: cy, r: ring } = magnifierRing(s, sc, track, stretch);
  const counts = magnifiedCounts(sc, stretch, counted);
  // The stretch alone, straight, as a scale of its own: the same small part, now wide.
  const sub: Scale = { ...sc, from: stretch.from, to: stretch.to, parts: Math.round((stretch.to - stretch.from) / sc.minor) };
  const spec: InstrumentSpec = { ...s, skip: undefined, highlight: undefined, labels: 'ends' };
  const pad = 26;
  const inner = straightTrack(spec, sub, { x: mag.x + pad, y: mag.y + mag.h * 0.5 }, { x: 1, y: 0 }, mag.w - 2 * pad, { x: 0, y: 1 }, Math.min(30, mag.h * 0.2));
  const corners = [
    { x: mag.x, y: mag.y },
    { x: mag.x, y: mag.y + mag.h },
  ];
  const near = mag.x > cx ? corners : corners.map((q) => ({ ...q, x: q.x + mag.w }));
  const inside = pointer !== null && pointer >= stretch.from && pointer <= stretch.to;
  return (
    <g className="ms-inst__mag" aria-hidden="true">
      <circle className="ms-inst__ring" cx={cx} cy={cy} r={ring} />
      {near.map((q, i) => (
        <line key={i} className="ms-inst__leader" x1={cx + ((q.x - cx) / Math.hypot(q.x - cx, q.y - cy)) * ring} y1={cy + ((q.y - cy) / Math.hypot(q.x - cx, q.y - cy)) * ring} x2={q.x} y2={q.y} />
      ))}
      <rect className="ms-inst__lens" x={mag.x} y={mag.y} width={mag.w} height={mag.h} />
      <line className="ms-inst__axis" x1={mag.x + pad} x2={mag.x + mag.w - pad} y1={mag.y + mag.h * 0.5} y2={mag.y + mag.h * 0.5} />
      <Marks s={spec} sc={sub} track={inner} only={[stretch.from, stretch.to]} />
      <CountArcs sc={sub} track={inner} parts={counts.parts} numbers={counts.numbers} />
      {inside && <path className="ms-inst__arrow" d={`M${inner.at(pointer!).x} ${mag.y + mag.h * 0.5 - 4}l-8 -15h16Z`} />}
    </g>
  );
}
