/**
 * Where an instrument goes in its box (docs/32 §3.2 "规模"): every scale is a
 * track — a straight one (a ruler, a tape, a height chart, a jug's side, a
 * dial straightened) or a circle (a dial) — that says where a value sits on
 * the page and which way its mark points. The marks, the numbers, the
 * counting arcs, the magnifier and the `unroll` all draw from the track, so
 * every small part is the same size by construction. Pure (no DOM).
 */
import type { InstrumentSpec } from '../../schema';
import { dialAngle, drawnParts, rimPoint, shareOf, SKIP_PARTS, valueAtAngle, type Scale } from '../../lib/instrument';
import type { Rect } from '../layout';

export interface Pt {
  x: number;
  y: number;
}
/** A point on a track and the direction its mark points (a unit vector). */
export interface TrackPoint extends Pt {
  nx: number;
  ny: number;
}
export interface Track {
  kind: 'straight' | 'dial';
  at(v: number): TrackPoint;
  /** The value under a page point, unsnapped (millionths). */
  valueAt(p: Pt): number;
  /** Mark lengths (px): a small part's, the half-way one, a numbered one. */
  marks: { minor: number; mid: number; major: number };
  /** The numbers' size (px, ≥ 13). */
  font: number;
  /** A small part's length on the page (px). */
  partPx: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A straight track: `from` at `p0`, along `dir` for `length` px, the marks pointing along `n`. */
export function straightTrack(s: InstrumentSpec, sc: Scale, p0: Pt, dir: Pt, length: number, n: Pt, markScale: number): Track {
  const partPx = length / Math.max(1, drawnParts(s, sc));
  const major = clamp(markScale, 12, 30);
  return {
    kind: 'straight',
    at: (v) => {
      const k = shareOf(s, sc, v) * length;
      return { x: p0.x + dir.x * k, y: p0.y + dir.y * k, nx: n.x, ny: n.y };
    },
    valueAt: (p) => {
      const share = ((p.x - p0.x) * dir.x + (p.y - p0.y) * dir.y) / length;
      if (!s.skip) return sc.from + share * (sc.to - sc.from);
      const a = s.skip.from.units;
      const b = s.skip.to.units;
      const short = SKIP_PARTS * sc.minor;
      const distance = share * (sc.to - sc.from - (b - a) + short);
      if (distance <= a - sc.from) return sc.from + distance;
      if (distance >= a - sc.from + short) return sc.from + distance + b - a - short;
      return a + ((distance - (a - sc.from)) / short) * (b - a);
    },
    marks: { minor: major * 0.5, mid: major * 0.72, major },
    font: clamp(major * 0.62, 13, 22),
    partPx,
  };
}

/** A dial's track: the rim at radius `r`, 0 at the top, clockwise; the marks point in. */
export function dialTrack(s: InstrumentSpec, sc: Scale, c: Pt, r: number): Track {
  const major = clamp(r * 0.13, 12, 30);
  const deg = (v: number) => dialAngle(s, sc, v);
  return {
    kind: 'dial',
    at: (v) => {
      const p = rimPoint(c.x, c.y, r, deg(v));
      const len = Math.hypot(p.x - c.x, p.y - c.y) || 1;
      return { x: p.x, y: p.y, nx: (c.x - p.x) / len, ny: (c.y - p.y) / len };
    },
    valueAt: (p) => {
      const a = (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI + 90;
      return valueAtAngle(s, sc, a);
    },
    marks: { minor: major * 0.5, mid: major * 0.72, major },
    font: clamp(r * 0.085, 13, 22),
    partPx: (((s.sweep ?? 330) / 360) * 2 * Math.PI * r) / Math.max(1, sc.parts),
  };
}

/** The `unroll` between a dial's track (t = 0) and its straight line (t = 1): every mark on its own way, the same marks at both ends. */
export function blendTrack(a: Track, b: Track, t: number): Track {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    kind: a.kind,
    at: (v) => {
      const p = a.at(v);
      const q = b.at(v);
      const nx = lerp(p.nx, q.nx, t);
      const ny = lerp(p.ny, q.ny, t);
      const len = Math.hypot(nx, ny) || 1;
      return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), nx: nx / len, ny: ny / len };
    },
    valueAt: b.valueAt,
    marks: { minor: lerp(a.marks.minor, b.marks.minor, t), mid: lerp(a.marks.mid, b.marks.mid, t), major: lerp(a.marks.major, b.marks.major, t) },
    font: lerp(a.font, b.font, t),
    partPx: lerp(a.partPx, b.partPx, t),
  };
}

/* ------------------------------------------------------------------ */
/* Frames: each instrument's parts in its box                          */
/* ------------------------------------------------------------------ */

/** A ruler or a horizontal tape: the body, the scale along its top edge, room above for the thing laid on it. */
export interface StraightFrame {
  track: Track;
  /** The body (the ruler's strip; a path's road). */
  body: Rect;
  /** Where the thing laid on it sits (above the top edge; a height chart: beside the strip). */
  thing: Rect;
  /** Where brackets and a second scale go (below; a height chart: to the right). */
  below: number;
  vertical: boolean;
  /** Pixels per unit along the scale. */
  ppu: number;
  /** A height chart's floor (page y), drawn only when its scale starts at 0. */
  floor: number | null;
  /** Radius of the head beside a vertical chart (zero for a horizontal strip). */
  personRadius: number;
}

/** Room a part-counting row and a thing laid on the scale take (px). */
const COUNT_ROOM = 34;
const BRACKET_ROW = 40;

/** The head's position along a chart, shared by grouped charts to keep one scale. */
export function heightHeadShare(s: InstrumentSpec, sc: Scale): number {
  return s.head ? clamp(shareOf(s, sc, s.head.units), 0, 1) : 1;
}

/** A ruler or a tape in a box: horizontal by default, a height chart standing up. */
export function straightFrame(s: InstrumentSpec, sc: Scale, box: Rect, opts: { counting: boolean; headShare?: number }): StraightFrame {
  const vertical = s.orient === 'vertical' || (s.orient === undefined && s.look === 'height-chart');
  const brackets = (s.brackets?.length ? 1 : 0) * BRACKET_ROW + (s.dual ? 22 : 0);
  const units = (sc.to - sc.from) / 1_000_000;
  const inset = s.type === 'ruler' ? (s.broken ? 0.35 : (s.inset?.units ?? 500_000) / 1_000_000) : 0;
  const tail = s.type === 'ruler' ? 0.5 : 0;
  const path = s.look === 'path';
  if (!vertical) {
    const spanUnits = units * (drawnParts(s, sc) / Math.max(1, sc.parts)) + inset + tail;
    const width = Math.min(box.w * 0.88, box.w - 40);
    // A tape or a metre rule: a little strip either side of its first and last numbers (the hook, the end caps).
    const lead = s.type === 'tape' && !path ? 18 : 0;
    const ppu = (width - 2 * lead) / spanUnits;
    const count = opts.counting ? COUNT_ROOM : 0;
    let bodyH = path ? clamp(width * 0.05, 26, 44) : clamp(width * 0.075, 52, 92);
    let thingH = clamp(bodyH * 0.62, 30, 70);
    // A short box (three tapes stacked, a phone): the strip and the thing on it shrink to fit, the marks with them.
    const fixed = count + 10 + brackets + (path ? 34 : 0);
    const room = box.h - 8 - fixed;
    if (bodyH + thingH > room) {
      const k = Math.max(0.3, room / (bodyH + thingH));
      bodyH = Math.max(path ? 16 : 22, bodyH * k);
      thingH = Math.max(12, thingH * k);
    }
    const top = count + thingH + 10;
    const total = top + bodyH + brackets + (path ? 34 : 0);
    const y0 = box.y + Math.max(8, (box.h - total) / 2) + top;
    const x0 = box.x + (box.w - width) / 2;
    const p0 = { x: x0 + lead + inset * ppu, y: y0 };
    const len = units * (drawnParts(s, sc) / Math.max(1, sc.parts)) * ppu;
    const track = straightTrack(s, sc, p0, { x: 1, y: 0 }, len, path ? { x: 0, y: -1 } : { x: 0, y: 1 }, path ? bodyH * 0.9 : bodyH * 0.34);
    return {
      track,
      body: { x: x0, y: y0, w: width, h: bodyH },
      thing: { x: x0, y: y0 - count - thingH - 4, w: width, h: thingH },
      below: y0 + bodyH + (path ? 30 : 8),
      vertical: false,
      ppu,
      floor: null,
      personRadius: 0,
    };
  }
  // Standing up: the strip on the right of the box's middle, the person (the head board) on its left, brackets to its right.
  // About half the stage tall on a large screen (docs/32 §3.2), most of a small box.
  const desiredHeight = Math.max(box.h * 0.2, Math.min(box.h * 0.86, box.h - 40, box.h * 0.6 + 100));
  const desiredStrip = clamp(desiredHeight * 0.16, 70, 120) + (s.dual ? 60 : 0);
  const right = (opts.counting ? 50 : 0) + brackets * 1.8;
  // Fit the actual head, shoulders and head board beside the strip, even
  // when two charts share a phone's width.
  const personRoom = box.w - desiredStrip - right - 16;
  const widthRadius = Math.max(1, Math.min((personRoom - 26) / 2.9, (personRoom - 34) / 2));
  const personRadius = Math.min(34, clamp(desiredStrip * 1.7, 110, 220) * 0.2, box.h * 0.1, widthRadius);
  // Reserve only the part of a cropped person's head and shoulders below
  // the lowest mark. Higher readings keep the chart's full height.
  const croppedPerson = sc.from > 0 && s.head !== undefined;
  const headShare = opts.headShare ?? heightHeadShare(s, sc);
  const extension = Math.min(16, box.h * 0.08) + personRadius * 3.6;
  const available = box.h - Math.min(20, box.h * 0.1);
  const height = croppedPerson && headShare < 1 ? Math.min(desiredHeight, (available - extension) / (1 - headShare)) : desiredHeight;
  const reserve = croppedPerson ? Math.max(0, extension - headShare * height) : 0;
  const ppu = height / (units * (drawnParts(s, sc) / Math.max(1, sc.parts)));
  // A second scale (`dual`) needs room for both columns of numbers across the strip.
  const stripW = clamp(height * 0.16, 70, 120) + (s.dual ? 60 : 0);
  const left = s.head ? Math.max(26 + personRadius * 2.9, 34 + personRadius * 2) : clamp(stripW * 1.7, 110, 220);
  const total = left + stripW + right;
  const x0 = box.x + (s.head ? (box.w - total) / 2 : Math.max(8, (box.w - total) / 2)) + left;
  const yBottom = box.y + (box.h + height - reserve) / 2;
  const track = straightTrack(s, sc, { x: x0, y: yBottom }, { x: 0, y: -1 }, height, { x: 1, y: 0 }, stripW * 0.32);
  // The strip runs a little past its end marks, so the end numbers sit on the strip and not on its edges.
  const pad = clamp(track.font * 0.9, 12, 20);
  return {
    track,
    body: { x: x0, y: yBottom - height - pad, w: stripW, h: height + 2 * pad },
    thing: { x: x0 - left, y: yBottom - height, w: left, h: height },
    below: x0 + stripW + 10,
    vertical: true,
    ppu,
    floor: sc.from === 0 ? yBottom : null,
    personRadius,
  };
}

/** A dial in a box: the face, the pan above it, the straight line it unrolls to. */
export interface DialFrame {
  c: Pt;
  r: number;
  track: Track;
  /** The pan above the face. */
  pan: Rect;
  /** The same scale straight under the face's middle (the unroll's end, the straightened view). */
  line: Track;
  lineRect: Rect;
}

export function dialFrame(s: InstrumentSpec, sc: Scale, box: Rect, opts: { counting: boolean }): DialFrame {
  // A short box (a phone with the tray open): the pan shrinks to a rim so the face keeps its size (≥ 180 px across, docs/32 §3.2).
  const panK = box.h < 360 ? 0.08 : 0.62;
  // Counting arcs stand outside the rim: room for them; a large box keeps the face about half the stage tall.
  const room = opts.counting ? 56 : 0;
  const r = clamp(Math.min((box.h - 24 - room) / (2 + panK + 0.13), (box.w - 2 * room) * 0.42, box.h * 0.24 + 50), 60, 420);
  const panH = r * panK;
  const total = panH + 2 * r;
  const top = box.y + Math.max(6, (box.h - total) / 2);
  const c = { x: box.x + box.w / 2, y: top + panH + r };
  const w = Math.min(box.w * 0.9, box.w - 40);
  const lineRect = { x: box.x + (box.w - w) / 2, y: c.y, w, h: 60 };
  return {
    c,
    r,
    track: dialTrack(s, sc, c, r * 0.94),
    pan: { x: c.x - r * 0.62, y: top, w: r * 1.24, h: panH },
    line: straightTrack(s, sc, { x: lineRect.x, y: c.y }, { x: 1, y: 0 }, w, { x: 0, y: 1 }, clamp(w / 40, 12, 26)),
    lineRect,
  };
}

/** A jug in a box: its outline, the scale up its right side, the level. */
export interface JugFrame {
  /** The container's outside (the shape is drawn in it). */
  body: Rect;
  /** The bottom of the inside and the height the scale runs to. */
  floor: number;
  track: Track | null;
  /** The level's top for a value (page y). */
  levelY(v: number): number;
  line: Track | null;
  lineRect: Rect;
}

export function jugFrame(s: InstrumentSpec, sc: Scale | null, box: Rect): JugFrame {
  const shape = s.shape ?? 'jug';
  const aspect = shape === 'bottle' ? 0.38 : shape === 'bowl' ? 1.9 : shape === 'pail' ? 0.95 : shape === 'beaker' ? 0.62 : shape === 'cup' ? 0.72 : shape === 'bottle-jug' ? 0.5 : 0.7;
  // About half the stage tall on a large screen (docs/32 §3.2), most of a phone's short box.
  const maxH = shape === 'bowl' ? box.h * 0.42 : Math.min(box.h * (box.h < 300 ? 0.94 : 0.8), box.h * 0.5 + 110);
  // Keep room for the numbers and dimension labels without shrinking the
  // vessel to a thumbnail on a phone or beside the 1024 px reader.
  const scaleRoom = s.scale && sc ? s.eye ? 160 : s.brackets?.length ? 150 : 80 : 20;
  const h = Math.min(maxH, (box.w - scaleRoom - 40) / aspect);
  const w = h * aspect;
  const x = box.x + (box.w - w - scaleRoom) / 2;
  const y = box.y + (box.h - h) / 2 + (shape === 'bowl' ? box.h * 0.12 : 0);
  const floor = y + h - Math.max(6, h * 0.03);
  const scaleTop = y + h * 0.12;
  const run = floor - scaleTop;
  // No scale: the container full to the shoulder.
  const levelY = (v: number) => (sc ? floor - ((v - sc.from) / (sc.to - sc.from)) * run : shape === 'bottle' ? y + h * 0.4 : shape === 'bowl' ? y + h * 0.18 : floor - run * 0.85);
  const lineW = Math.min(box.w * 0.9, box.w - 40);
  const lineRect = { x: box.x + (box.w - lineW) / 2, y: box.y + box.h / 2, w: lineW, h: 60 };
  return {
    body: { x, y, w, h },
    floor,
    track: s.scale && sc ? straightTrack(s, sc, { x: x + w, y: floor }, { x: 0, y: -1 }, run, { x: 1, y: 0 }, clamp(h * 0.045, 12, 26)) : null,
    levelY,
    line: sc ? straightTrack(s, sc, { x: lineRect.x, y: lineRect.y }, { x: 1, y: 0 }, lineW, { x: 0, y: 1 }, clamp(lineW / 40, 12, 26)) : null,
    lineRect,
  };
}

/** A balance in a box: the stand, the pivot, the beam's length, the pans' size. */
export interface BalanceFrame {
  pivot: Pt;
  half: number;
  panW: number;
  base: Rect;
}

export function balanceFrame(box: Rect): BalanceFrame {
  const half = clamp(box.w * 0.34, 90, 380);
  const height = clamp(box.h * 0.5, 120, 420);
  const pivot = { x: box.x + box.w / 2, y: box.y + box.h / 2 - height * 0.05 };
  return { pivot, half, panW: clamp(half * 0.72, 70, 260), base: { x: pivot.x - half * 0.5, y: pivot.y + height * 0.48, w: half, h: clamp(height * 0.06, 8, 20) } };
}

/** The magnifier's box beside the instrument (wide) or under it (narrow), and the room left for the instrument. */
export function magnifierSplit(box: Rect): { inst: Rect; mag: Rect; wide: boolean } {
  const wide = box.w >= box.h * 1.1;
  if (wide) {
    const mw = clamp(box.w * 0.34, 160, 420);
    const mh = Math.min(box.h * 0.4, mw * 0.5, 190);
    return { inst: { ...box, w: box.w - mw - 24 }, mag: { x: box.x + box.w - mw, y: box.y + (box.h - mh) / 2, w: mw, h: mh }, wide };
  }
  const mh = clamp(box.h * 0.3, 110, 240);
  return { inst: { ...box, h: box.h - mh - 16 }, mag: { x: box.x + box.w * 0.08, y: box.y + box.h - mh, w: box.w * 0.84, h: mh }, wide };
}

/** Boxes for instruments side by side (a pair or a set), the same size so one scale draws them all; standing in a column when they are long and flat. */
export function sideBySide(box: Rect, n: number, flat: boolean): Rect[] {
  const gap = 24;
  const labelH = 26;
  if (flat) {
    const h = (box.h - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({ x: box.x, y: box.y + i * (h + gap) + labelH, w: box.w, h: h - labelH }));
  }
  const w = (box.w - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: box.x + i * (w + gap), y: box.y + labelH, w, h: box.h - labelH }));
}
