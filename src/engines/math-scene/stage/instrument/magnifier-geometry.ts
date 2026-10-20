/** The magnifier's source marker and the counted parts visible in its enlarged stretch. */
import type { InstrumentSpec } from '../../schema';
import { markAt, type Scale } from '../../lib/instrument';
import type { Track } from './geometry';

export function magnifierRing(s: InstrumentSpec, sc: Scale, track: Track, stretch: { from: number; to: number }): { x: number; y: number; r: number } {
  if (track.kind === 'dial') {
    // A small source ring follows the rim at the middle of the gap. A circle
    // around the gap's chord grows into the face as the numbered gap widens.
    const p = track.at((stretch.from + stretch.to) / 2);
    const rimRadius = (track.partPx * sc.parts) / (((s.sweep ?? 330) * Math.PI) / 180);
    const r = Math.max(12, Math.min(26, rimRadius * 0.16));
    return { x: p.x - p.nx * r * 0.75, y: p.y - p.ny * r * 0.75, r };
  }
  const a = track.at(stretch.from);
  const b = track.at(stretch.to);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: Math.max(18, Math.hypot(b.x - a.x, b.y - a.y) / 2 + 12) };
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
