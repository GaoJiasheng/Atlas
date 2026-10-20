/** The magnifier's source marker and the counted parts visible in its enlarged stretch. */
import type { InstrumentSpec } from '../../schema';
import { dialAngle, dialSweep, markAt, type Scale } from '../../lib/instrument';
import type { Pt, Track } from './geometry';

/**
 * Where the magnified stretch is marked on the instrument. A straight scale
 * gets a ring round the stretch. A dial gets a band along its rim over the
 * stretch, from just inside the marks to just outside the rim: a ring round
 * the stretch's chord would grow into the face (the needle, the hub, the unit)
 * as the numbered gap widens.
 */
export type MagnifierSource =
  | { kind: 'ring'; x: number; y: number; r: number }
  | { kind: 'band'; d: string; c: Pt; inner: number; outer: number; ends: [Pt, Pt] };

export function magnifierSource(s: InstrumentSpec, sc: Scale, track: Track, stretch: { from: number; to: number }): MagnifierSource {
  if (track.kind === 'dial') {
    const rim = (track.partPx * sc.parts) / ((dialSweep(s) * Math.PI) / 180);
    const a = track.at(stretch.from);
    const c = { x: a.x + a.nx * rim, y: a.y + a.ny * rim };
    const inner = rim - track.marks.major - 4;
    const outer = rim + track.marks.major * 0.4;
    const out = (v: number, radius: number): Pt => {
      const p = track.at(v);
      return { x: c.x - p.nx * radius, y: c.y - p.ny * radius };
    };
    const large = dialAngle(s, sc, stretch.to) - dialAngle(s, sc, stretch.from) > 180 ? 1 : 0;
    const [o0, o1, i1, i0] = [out(stretch.from, outer), out(stretch.to, outer), out(stretch.to, inner), out(stretch.from, inner)];
    const d = `M${o0.x} ${o0.y}A${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y}L${i1.x} ${i1.y}A${inner} ${inner} 0 ${large} 0 ${i0.x} ${i0.y}Z`;
    return { kind: 'band', d, c, inner, outer, ends: [o0, o1] };
  }
  const a = track.at(stretch.from);
  const b = track.at(stretch.to);
  return { kind: 'ring', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: Math.max(18, Math.hypot(b.x - a.x, b.y - a.y) / 2 + 12) };
}

/**
 * The leader hairlines from the source marker to the box's two near corners
 * (upper corner first). From a band: upper end to upper corner when neither
 * line crosses the face, else both from the end nearer each corner.
 */
export function magnifierLeaders(src: MagnifierSource, corners: [Pt, Pt]): [Pt, Pt][] {
  if (src.kind === 'ring') {
    return corners.map((q) => {
      const len = Math.hypot(q.x - src.x, q.y - src.y) || 1;
      return [{ x: src.x + ((q.x - src.x) / len) * src.r, y: src.y + ((q.y - src.y) / len) * src.r }, q];
    });
  }
  const [up, down] = src.ends[0].y <= src.ends[1].y ? src.ends : [src.ends[1], src.ends[0]];
  const [top, bottom] = corners;
  if (clearOf(src.c, src.outer - 1, up, top) && clearOf(src.c, src.outer - 1, down, bottom)) return [[up, top], [down, bottom]];
  const nearer = (q: Pt) => (Math.hypot(up.x - q.x, up.y - q.y) <= Math.hypot(down.x - q.x, down.y - q.y) ? up : down);
  return [[nearer(top), top], [nearer(bottom), bottom]];
}

/** Does segment a–b stay at least `r` from `c`? */
function clearOf(c: Pt, r: number, a: Pt, b: Pt): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(a.x + t * dx - c.x, a.y + t * dy - c.y) >= r;
}

export function magnifiedCounts(sc: Scale, stretch: { from: number; to: number }, counted: number[] = []): { parts: number[]; numbers: number[] } {
  const parts: number[] = [];
  const numbers: number[] = [];
  for (const [n, k] of counted.entries()) {
    const from = markAt(sc, k);
    if (from < stretch.from || markAt(sc, k + 1) > stretch.to) continue;
    parts.push((from - stretch.from) / sc.minor);
    numbers.push(n + 1);
  }
  return { parts, numbers };
}
