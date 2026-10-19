/**
 * The life-cycle ring card's layout and words (docs/33 §4.3 E-M2; pure,
 * deterministic, unit-tested). The stages sit evenly on a circle, the first
 * at 12 o'clock, clockwise (the textbook life-cycle drawing; the dish seen
 * from above runs the same way). Between neighbours runs an arc with its
 * arrowhead at the middle; beside each arc (outside the ring, between the
 * node names) its words: a stage's length in days at the temperature on show,
 * the `note` of a stage that takes no days (the egg: "waits for water"), or
 * "lays eggs" on the arc from the last stage back to the first. Stages in a
 * group (the four larval stages) are drawn a size smaller, with a bracket
 * inside the ring; stages `in: water` get a wide cold band inside the ring
 * with "in water" along it; a `wall` stage a short upright stroke. SVG
 * coordinates (y down); angles in degrees from 12 o'clock, clockwise.
 */
import { t, tx, type Locale } from '../../../../i18n';
import type { LifeCycleData } from '../../sim-schema';
import { groupStages, lastStage, type StageSpan } from './lifecycle';
import { formatReading } from '../telemetry';

export interface RingPoint {
  x: number;
  y: number;
}
export type Anchor = 'start' | 'middle' | 'end';
export interface RingText extends RingPoint {
  anchor: Anchor;
}

export interface RingNode extends RingPoint {
  id: string;
  /** Degrees from 12 o'clock, clockwise. */
  angle: number;
  /** Node circle radius. */
  r: number;
  small: boolean;
  /** Where the stage's name goes (outside the ring). */
  label: RingText;
  /** A `wall` stage: a short upright stroke beside the node. */
  wall: { x: number; y1: number; y2: number } | null;
}

export interface RingArc {
  from: string;
  to: string;
  /** SVG path along the circle (clockwise). */
  d: string;
  /** The arrowhead at the arc's middle: where, and its heading (degrees, SVG rotate). */
  arrow: RingPoint & { rotate: number };
  /** Where the arc's words go (outside the ring). */
  text: RingText;
}

export interface RingBand {
  /** The band's arc (a wide stroke) and the path its words run along. */
  d: string;
  width: number;
  /** Stage ids it lies behind. */
  stages: string[];
}

export interface RingBracket {
  group: string;
  d: string;
  label: RingText;
}

export interface RingLayout {
  cx: number;
  cy: number;
  radius: number;
  nodes: RingNode[];
  arcs: RingArc[];
  bands: RingBand[];
  brackets: RingBracket[];
}

export interface RingStage {
  id: string;
  in?: string;
}

export interface RingOptions {
  cx: number;
  cy: number;
  radius: number;
  /** Node radius (default 6.5); stages in a group: `small` (default 4.5). */
  node?: number;
  small?: number;
  /** How far outside the ring names and arc words sit (default 11). */
  outside?: number;
  /** Groups drawn small with a bracket inside the ring. */
  groups?: readonly { id: string; stages: readonly string[] }[];
  /** Draw the in-water band and the wall stroke (default true). */
  places?: boolean;
}

const RAD = Math.PI / 180;
const round = (v: number) => Math.round(v * 100) / 100 || 0;

/** The point at `angle` (degrees from 12 o'clock, clockwise) on a circle of radius `r` about (cx, cy). */
export function ringPoint(cx: number, cy: number, r: number, angle: number): RingPoint {
  return { x: round(cx + r * Math.sin(angle * RAD)), y: round(cy - r * Math.cos(angle * RAD)) };
}

/** Text outside the ring at `angle`: anchored away from the circle, its baseline set so it centres on the point. */
function outsideText(cx: number, cy: number, r: number, angle: number, size = 10): RingText {
  const p = ringPoint(cx, cy, r, angle);
  const s = Math.sin(angle * RAD);
  const c = Math.cos(angle * RAD);
  const anchor: Anchor = s > 0.25 ? 'start' : s < -0.25 ? 'end' : 'middle';
  return { x: p.x, y: round(p.y + 0.35 * size - 0.45 * size * c), anchor };
}

/** Text inside the ring at `angle`: anchored toward the centre. */
function insideText(cx: number, cy: number, r: number, angle: number, size = 9): RingText {
  const p = ringPoint(cx, cy, r, angle);
  const s = Math.sin(angle * RAD);
  const c = Math.cos(angle * RAD);
  const anchor: Anchor = s > 0.25 ? 'end' : s < -0.25 ? 'start' : 'middle';
  return { x: p.x, y: round(p.y + 0.35 * size + 0.45 * size * c), anchor };
}

/** A clockwise arc of radius r from angle a0 to a1 (a1 > a0). */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = ringPoint(cx, cy, r, a0);
  const p1 = ringPoint(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/** The ring: nodes, arcs, the in-water band(s) and the groups' brackets. */
export function ringLayout(stages: readonly RingStage[], o: RingOptions): RingLayout {
  const { cx, cy, radius: R } = o;
  const n = stages.length;
  const step = n > 0 ? 360 / n : 0;
  const nodeR = o.node ?? 6.5;
  const smallR = o.small ?? 4.5;
  const out = o.outside ?? 11;
  const places = o.places ?? true;
  const grouped = new Set((o.groups ?? []).flatMap((g) => g.stages));
  const nodes: RingNode[] = stages.map((s, i) => {
    const angle = i * step;
    const p = ringPoint(cx, cy, R, angle);
    const small = grouped.has(s.id);
    const r = small ? smallR : nodeR;
    return {
      id: s.id,
      angle,
      ...p,
      r,
      small,
      label: outsideText(cx, cy, R + out, angle),
      wall: places && s.in === 'wall' ? { x: round(p.x - r - 5), y1: round(p.y - 9), y2: round(p.y + 9) } : null,
    };
  });
  // The arc between neighbours leaves a gap round each node (its radius + 3 px).
  const gap = (node: RingNode) => ((node.r + 3) / R) / RAD;
  const arcs: RingArc[] =
    n < 2
      ? []
      : nodes.map((a, i) => {
          const b = nodes[(i + 1) % n]!;
          const a0 = a.angle + gap(a);
          const a1 = a.angle + step - gap(b);
          const mid = a.angle + step / 2;
          const m = ringPoint(cx, cy, R, mid);
          return {
            from: a.id,
            to: b.id,
            d: arcPath(cx, cy, R, a0, a1),
            arrow: { ...m, rotate: round(mid) },
            text: outsideText(cx, cy, R + out, mid),
          };
        });
  // In-water band: each run of consecutive water stages, half a step past each end, inside the ring.
  const bands: RingBand[] = [];
  if (places) {
    const band = 10;
    const r = R - 6 - band / 2;
    let run: number[] = [];
    const flush = () => {
      if (run.length === 0) return;
      const a0 = nodes[run[0]!]!.angle - step * 0.42;
      const a1 = nodes[run[run.length - 1]!]!.angle + step * 0.42;
      bands.push({ d: arcPath(cx, cy, r, a0, a1), width: band, stages: run.map((k) => nodes[k]!.id) });
      run = [];
    };
    stages.forEach((s, i) => {
      if (s.in === 'water') run.push(i);
      else flush();
    });
    flush();
  }
  const brackets: RingBracket[] = (o.groups ?? []).flatMap((g) => {
    const at = g.stages.map((id) => nodes.find((x) => x.id === id)?.angle).filter((a): a is number => a !== undefined);
    if (at.length < 2) return [];
    const a0 = Math.min(...at) - step * 0.2;
    const a1 = Math.max(...at) + step * 0.2;
    const r = R - 28;
    const t0 = [ringPoint(cx, cy, r, a0), ringPoint(cx, cy, r + 5, a0)];
    const t1 = [ringPoint(cx, cy, r, a1), ringPoint(cx, cy, r + 5, a1)];
    const d = `M ${t0[1]!.x} ${t0[1]!.y} L ${t0[0]!.x} ${t0[0]!.y} ${arcPath(cx, cy, r, a0, a1).replace(/^M [^A]+/, '')} L ${t1[1]!.x} ${t1[1]!.y}`;
    return [{ group: g.id, d, label: insideText(cx, cy, r - 7, (a0 + a1) / 2) }];
  });
  return { cx, cy, radius: R, nodes, arcs, bands, brackets };
}

/** What an arc of the life-cycle ring says: a stage's days, the note of a stage that takes none, or "lays eggs" back to the first stage. */
export type ArcWords = { kind: 'days'; days: number } | { kind: 'note'; stage: string } | { kind: 'lays' } | { kind: 'none' };

/** The words of the arc out of each stage (in stage order), at the spans on show. */
export function cycleArcWords(lc: Pick<LifeCycleData, 'stages' | 'start'>, spans: readonly StageSpan[]): ArcWords[] {
  const last = lastStage(lc);
  const days = new Map(spans.map((s) => [s.id, s.days]));
  return lc.stages.map((s): ArcWords => {
    if (s.id === last) return { kind: 'lays' };
    const d = days.get(s.id);
    if (d !== undefined) return { kind: 'days', days: d };
    return s.note ? { kind: 'note', stage: s.id } : { kind: 'none' };
  });
}

/** The groups of a life cycle as the ring draws them. */
export function cycleGroups(lc: Pick<LifeCycleData, 'groups'>): { id: string; stages: readonly string[]; label: LifeCycleData['stages'][number]['label'] | null }[] {
  return Object.entries(lc.groups ?? {}).map(([id, g]) => ({ id, stages: groupStages(g), label: Array.isArray(g) ? null : g.label }));
}

/** Days as the card writes them: one decimal and the unit (`1.9 d`, `1.9 天`). */
export function daysText(days: number, locale: Locale): string {
  return `${formatReading(days, 1)} ${t(locale, 'space.cycle.days')}`;
}

/**
 * The ring as words for screen readers: "Life cycle at 28 °C: Egg, waits
 * for water; Larva 1, 1.9 days; …; Adult, lays eggs." (`temp`: the value
 * and unit on show).
 */
export function cycleSummary(lc: Pick<LifeCycleData, 'stages' | 'start'>, spans: readonly StageSpan[], temp: string, locale: Locale): string {
  const words = cycleArcWords(lc, spans);
  const zh = locale === 'zh';
  const items = lc.stages.map((s, i) => {
    const w = words[i]!;
    const name = tx(s.label, locale);
    const what =
      w.kind === 'days'
        ? t(locale, 'space.cycle.daysLong', { n: formatReading(w.days, 1) })
        : w.kind === 'note'
          ? tx(s.note, locale)
          : w.kind === 'lays'
            ? t(locale, 'space.cycle.lays')
            : '';
    return what ? `${name}${zh ? '，' : ', '}${what}` : name;
  });
  return t(locale, 'space.cycle.summary', { temp, stages: items.join(zh ? '；' : '; ') });
}
