/**
 * The scale every instrument shares (docs/32 §3.2, docs/08 tick grammar, the
 * same as the number line): a hairline mark every small part, a longer
 * 1.5 px one at each number (the half-way mark of ten parts a little longer),
 * numbers in the serif at the numbered marks (on a two-unit scale `1 m` at
 * each whole big unit, what is over between), a small empty box where a
 * number is hidden, marks drawn bold (`highlight`), break lines over a
 * skipped stretch; the counting arcs (each part numbered, signal) and the
 * parts as buttons while the child counts them. Everything is placed by the
 * track, so the small parts are equal by construction.
 */
import type { ReactNode } from 'react';
import type { InstrumentSpec } from '../../schema';
import { hiddenLabel, isMajor, isMid, labelled, markAt, markText, numText, skipped, type Scale } from '../../lib/instrument';
import { useParts } from '../svg';
import type { Track, TrackPoint } from './geometry';

const off = (p: TrackPoint, d: number) => ({ x: p.x + p.nx * d, y: p.y + p.ny * d });

/** How a number sits beside its mark: after it (marks across), or centred (marks up and down). */
function anchorOf(p: TrackPoint): 'start' | 'end' | 'middle' {
  if (p.nx > 0.7) return 'start';
  if (p.nx < -0.7) return 'end';
  return 'middle';
}

export interface MarksProps {
  s: InstrumentSpec;
  sc: Scale;
  track: Track;
  /** Draw the numbers (a magnifier draws its own). */
  numbers?: boolean;
  /** The numbers' distance past the mark (default a little past the numbered mark). */
  gap?: number;
  /** Only the marks within (a magnifier's stretch). */
  within?: { from: number; to: number };
  /** Print every number on the marks given only (the magnifier: its two ends). */
  only?: number[];
  /** Numbers on a second scale (`dual`): the small unit's totals on this track. */
  totals?: boolean;
  className?: string;
}

/** The marks and numbers of a scale. */
export function Marks({ s, sc, track, numbers = true, gap = 6, within, only, totals, className }: MarksProps) {
  const out: ReactNode[] = [];
  const lit = new Set((s.highlight ?? []).map((d) => d.units));
  const textOf = (v: number) => (totals ? numText(v, 0) : markText(sc, v));
  const shown = numbersShown(s, sc, track, only ? only : null, textOf);
  for (let i = 0; i <= sc.parts; i++) {
    const v = markAt(sc, i);
    if (within && (v < within.from || v > within.to)) continue;
    if (skipped(s, v)) continue;
    const p = track.at(v);
    const big = isMajor(sc, v) || v === sc.from || v === sc.to;
    const len = big ? track.marks.major : isMid(sc, v) ? track.marks.mid : track.marks.minor;
    const q = off(p, len);
    out.push(<line key={`m${i}`} className={big ? 'ms-inst__major' : 'ms-inst__minor'} data-lit={lit.has(v) || undefined} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />);
    const show = shown.has(v);
    if (!numbers) continue;
    const t = off(p, track.marks.major + gap + (anchorOf(p) === 'middle' ? track.font * 0.55 : 0));
    if (!only && hiddenLabel(s, v)) {
      const w = track.font * 1.6;
      out.push(<rect key={`h${i}`} className="ms-inst__hidden" x={t.x - (anchorOf(p) === 'start' ? 0 : anchorOf(p) === 'end' ? w : w / 2)} y={t.y - track.font * 0.6} width={w} height={track.font * 1.2} />);
      continue;
    }
    if (!show) continue;
    const text = textOf(v);
    out.push(
      <text key={`n${i}`} className="ms-inst__num" x={t.x} y={t.y} textAnchor={anchorOf(p)} dominantBaseline="central" fontSize={track.font}>
        {text}
      </text>,
    );
  }
  return (
    <g className={className ?? 'ms-inst__marks'} aria-hidden="true">
      {out}
    </g>
  );
}

/**
 * The numbers printed: the labelled marks, thinned (every 2nd, 5th or 10th, the ends always) when they would touch on a
 * small stage — numbers never collide (docs/32 §3.2).
 */
export function numbersShown(s: InstrumentSpec, sc: Scale, track: Track, only: number[] | null, textOf: (v: number) => string): Set<number> {
  const all: number[] = [];
  for (let i = 0; i <= sc.parts; i++) {
    const v = markAt(sc, i);
    if (skipped(s, v)) continue;
    if (only ? only.includes(v) : labelled(s, sc, v)) all.push(v);
  }
  if (only || all.length < 3) return new Set(all);
  // Room each number needs along the scale: its width across a horizontal scale, its height up a vertical one or round a dial.
  const need = (v: number) => {
    const p = track.at(v);
    const across = Math.abs(p.ny) > 0.7 ? textOf(v).length * track.font * 0.58 : track.font * 1.15;
    return across + 6;
  };
  const gapPx = (a: number, b: number) => Math.hypot(track.at(b).x - track.at(a).x, track.at(b).y - track.at(a).y);
  for (const step of [1, 2, 5, 10]) {
    const kept = all.filter((_, k) => k % step === 0 || k === all.length - 1);
    // The last two may be closer than a step: drop the one before the end then.
    if (kept.length > 2 && gapPx(kept.at(-2)!, kept.at(-1)!) < (need(kept.at(-2)!) + need(kept.at(-1)!)) / 2) kept.splice(kept.length - 2, 1);
    // Round a dial the last number comes back near the first.
    if (track.kind === 'dial' && kept.length > 2 && gapPx(kept.at(-1)!, kept[0]!) < (need(kept.at(-1)!) + need(kept[0]!)) / 2) kept.pop();
    if (kept.every((v, k) => k === 0 || gapPx(kept[k - 1]!, v) >= (need(kept[k - 1]!) + need(v)) / 2)) return new Set(kept);
  }
  return new Set([all[0]!, all.at(-1)!]);
}

/** Break lines over a skipped stretch (technical drawing: two zigzags across the strip). */
export function SkipBreaks({ s, track, depth }: { s: InstrumentSpec; track: Track; depth: number }) {
  if (!s.skip) return null;
  const a = track.at(s.skip.from.units);
  const b = track.at(s.skip.to.units);
  const zig = (p: TrackPoint, k: number) => {
    // Along the mark's direction, across the strip, a zigzag shifted along the scale by k px.
    const tx = -p.ny;
    const ty = p.nx;
    const pts = [0, 0.25, 0.5, 0.75, 1].map((f, i) => ({ x: p.x + p.nx * (f * depth - 4) + tx * (k + (i % 2 ? 5 : -5)), y: p.y + p.ny * (f * depth - 4) + ty * (k + (i % 2 ? 5 : -5)) }));
    return `M${pts.map((q) => `${q.x} ${q.y}`).join('L')}`;
  };
  const mid = { ...a, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const gapPx = Math.hypot(b.x - a.x, b.y - a.y) * 0.22;
  return (
    <g className="ms-inst__skip" aria-hidden="true">
      <path d={zig(mid, -gapPx)} />
      <path d={zig(mid, gapPx)} />
    </g>
  );
}

/** Arcs over parts (`parts`: the mark each starts at), numbered 1, 2, 3 … in the order given, on the side away from the marks. */
export function CountArcs({ sc, track, parts, tone = 'signal', stagger, lift = 2 }: { sc: Scale; track: Track; parts: number[]; tone?: 'signal' | 'ink'; stagger?: boolean; lift?: number }) {
  if (parts.length === 0) return null;
  const h = Math.min(26, Math.max(10, track.partPx * 0.45));
  return (
    <g className="ms-inst__count" data-tone={tone} aria-hidden="true">
      {parts.map((k, n) => {
        const p = track.at(markAt(sc, k));
        const q = track.at(markAt(sc, k + 1));
        const nx = (p.nx + q.nx) / 2;
        const ny = (p.ny + q.ny) / 2;
        const c = { x: (p.x + q.x) / 2 - nx * (h * 2 + lift), y: (p.y + q.y) / 2 - ny * (h * 2 + lift) };
        const label = { x: (p.x + q.x) / 2 - nx * (h + lift + 13), y: (p.y + q.y) / 2 - ny * (h + lift + 13) };
        return (
          <g key={k} className="ms-inst__arc" style={stagger ? { animationDelay: `${Math.min(n * 90, 600)}ms` } : undefined}>
            <path d={`M${p.x - p.nx * lift} ${p.y - p.ny * lift}Q${c.x} ${c.y} ${q.x - q.nx * lift} ${q.y - q.ny * lift}`} />
            {track.partPx >= 9 && (
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="central">
                {n + 1}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** The parts as buttons (tap one to count it, again to take it back; ← → move, Enter counts), on the arcs' side. */
export function PartButtons({ sc, track, parts, counted, onToggle, enabled, label }: { sc: Scale; track: Track; parts: number[]; counted: number[]; onToggle(part: number): void; enabled: boolean; label(part: number): string }) {
  const p = useParts({ count: parts.length, marked: (i) => counted.includes(parts[i]!), toggle: (i) => onToggle(parts[i]!), enabled });
  const reach = 44;
  return (
    <g className="ms-inst__parts" data-keys="arrows" {...p.container}>
      {parts.map((k, i) => {
        const a = track.at(markAt(sc, k));
        const b = track.at(markAt(sc, k + 1));
        const pts = [a, b, { ...b, x: b.x - b.nx * reach, y: b.y - b.ny * reach }, { ...a, x: a.x - a.nx * reach, y: a.y - a.ny * reach }];
        return (
          <g key={k} {...p.part(i)} className="ms-inst__part" aria-label={label(k)}>
            <path d={`M${pts.map((q) => `${q.x} ${q.y}`).join('L')}Z`} />
          </g>
        );
      })}
    </g>
  );
}
