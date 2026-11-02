/**
 * bones-and-joints chapter-02 figure "protected organs", drawn from explicit geometry.
 *
 *   pnpm tsx scripts/figures/bones-protected-organs.ts [--svg <out.svg>]
 *
 * Anterior view of the thorax as a graphite technical plate on a transparent ground:
 * thoracic vertebrae T1–T12 behind, heart and both lungs in a light tone, and in front
 * twelve ribs per side with their costal cartilages and the sternum. Every rib is built
 * from its own vertebra outwards, so the count and the attachments hold by construction
 * (tests/space-scene/bones-and-joints-figure.test.ts):
 *   ribs 1–7   true      their own cartilage reaches the sternum
 *   ribs 8–10  false     their cartilage joins the cartilage of the rib above (costal margin)
 *   ribs 11–12 floating  free anterior tip; the posterior end still joins T11 / T12
 * Writes public/illustrations/figures/bones-and-joints-protected-organs.webp
 * (1200×900, single density, the docs/06 chapter-figure shape of scripts/illustrate.ts).
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

export type Point = readonly [number, number];
export type Side = 'right' | 'left';
export type RibKind = 'true' | 'false' | 'floating';

export interface Vertebra {
  id: string;
  /** Centre of the body, figure units (x = 0 on the midline, y grows downwards). */
  centre: Point;
  halfWidth: number;
  height: number;
}

export interface Rib {
  /** The subject's side: the subject's left is on the viewer's right in an anterior view. */
  side: Side;
  number: number;
  kind: RibKind;
  vertebra: string;
  /** Bone centreline from the head at its vertebra to the costochondral junction or free tip. */
  bone: Point[];
  /** Index in `bone` where the shaft passes in front of the organs (lateral bend). */
  frontFrom: number;
  /** Costal cartilage centreline from the junction to its anterior attachment; empty for floating ribs. */
  cartilage: Point[];
  /** What the anterior end reaches. */
  joins: { to: 'sternum' } | { to: 'cartilage'; rib: number } | { to: 'free' };
}

export interface Thorax {
  vertebrae: Vertebra[];
  ribs: Rib[];
  /** Closed outline of the sternum (manubrium, body, xiphoid), clockwise from the jugular notch. */
  sternum: Point[];
  /** Joint lines across the sternum: sternal angle and xiphisternal joint. */
  sternalJoints: [Point, Point][];
  lungs: Record<Side, Point[]>;
  heart: Point[];
}

const MIRROR: Record<Side, number> = { right: -1, left: 1 };

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (1 - t) ** 3;
    const b = 3 * (1 - t) ** 2 * t;
    const c = 3 * (1 - t) * t ** 2;
    const d = t ** 3;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
}

/** Point at fraction `t` of a polyline's length. */
export function along(line: readonly Point[], t: number): Point {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    const d = Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1]);
    seg.push(d);
    total += d;
  }
  let left = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]! || i === seg.length - 1) {
      const f = seg[i]! === 0 ? 0 : Math.min(1, left / seg[i]!);
      const a = line[i]!;
      const b = line[i + 1]!;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    left -= seg[i]!;
  }
  return line[line.length - 1]!;
}

/** Sternum half-width at height y (manubrium wide at the top, body, then a tapering xiphoid). */
const STERNUM_PROFILE: Point[] = [
  [32, 196], [34, 214], [29, 246], [21, 286], [21, 296], [23, 340], [25, 400], [24, 456], [19, 496],
  [11, 506], [9, 540], [3, 568],
];
export function sternumHalfWidth(y: number): number {
  const p = STERNUM_PROFILE;
  if (y <= p[0]![1]) return p[0]![0];
  for (let i = 1; i < p.length; i++) {
    const [w1, y1] = p[i]!;
    const [w0, y0] = p[i - 1]!;
    if (y <= y1) return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}
const STERNUM_TOP = 196;
const STERNUM_BOTTOM = 568;
const STERNAL_ANGLE = 291;
const XIPHISTERNAL = 501;

/** Rib design table, one row per rib (figure units, viewer's-left mirror applied later). */
interface RibDesign {
  /** Lateral reach of the bend and its height below the head. */
  reach: number;
  bendDrop: number;
  /** Costochondral junction (true and false ribs) or free tip (floating ribs). */
  end: Point;
  /** Sternal attachment of a true rib's cartilage, as a height on the sternum edge. */
  sternalY?: number;
  /** How far a cartilage sags before turning up to the sternum. */
  sag?: number;
}
const DESIGN: RibDesign[] = [
  { reach: 112, bendDrop: 26, end: [86, 206], sternalY: 214, sag: 0 },
  { reach: 168, bendDrop: 36, end: [104, 280], sternalY: 292, sag: 2 },
  { reach: 214, bendDrop: 44, end: [118, 344], sternalY: 338, sag: 4 },
  { reach: 250, bendDrop: 52, end: [132, 404], sternalY: 384, sag: 8 },
  { reach: 276, bendDrop: 58, end: [146, 462], sternalY: 426, sag: 14 },
  { reach: 294, bendDrop: 64, end: [160, 520], sternalY: 464, sag: 22 },
  { reach: 304, bendDrop: 70, end: [180, 576], sternalY: 496, sag: 28 },
  { reach: 308, bendDrop: 74, end: [212, 624] },
  { reach: 304, bendDrop: 76, end: [244, 662] },
  { reach: 294, bendDrop: 76, end: [270, 694] },
  { reach: 280, bendDrop: 96, end: [270, 744] },
  { reach: 244, bendDrop: 84, end: [232, 770] },
];
/** Where a false rib's cartilage meets the cartilage above, as a fraction from that cartilage's junction. */
const JOIN_AT = 0.42;

function vertebrae(): Vertebra[] {
  const out: Vertebra[] = [];
  let y = 72;
  for (let i = 0; i < 12; i++) {
    const height = 34 + 1.6 * i;
    out.push({ id: `T${i + 1}`, centre: [0, y + height / 2], halfWidth: 23 + 1.1 * i, height });
    y += height + 8;
  }
  return out;
}

function ribsFor(side: Side, spine: Vertebra[]): Rib[] {
  const m = MIRROR[side];
  const flip = (p: Point): Point => [p[0] * m, p[1]];
  const ribs: Rib[] = [];
  const cartilageOf: Point[][] = [];
  for (let i = 0; i < 12; i++) {
    const n = i + 1;
    const d = DESIGN[i]!;
    const v = spine[i]!;
    const head: Point = [v.halfWidth - 3, v.centre[1] - v.height * 0.12];
    // Every rib: a back half from its vertebra out to the lateral bend (behind the organs), then
    // the part seen from the front. Floating ribs turn at the flank and stop in a free tip there.
    const end = d.end;
    const bend: Point = [d.reach, head[1] + d.bendDrop];
    const back = cubic(head, [head[0] + (d.reach - head[0]) * 0.62, head[1] + d.bendDrop * 0.02], [d.reach, head[1] + d.bendDrop * 0.3], bend, 18);
    const front = cubic(
      bend,
      [d.reach + 1, bend[1] + (end[1] - bend[1]) * 0.4],
      [end[0] + (d.reach - end[0]) * 0.5, end[1] - (end[1] - bend[1]) * 0.22],
      end,
      n <= 10 ? 22 : 10,
    );
    const bone = [...back, ...front.slice(1)];
    const frontFrom = back.length - 4;
    let cartilage: Point[] = [];
    let joins: Rib['joins'];
    if (n <= 7) {
      const sy = d.sternalY!;
      const sx = sternumHalfWidth(sy) - 8;
      const dx = end[0] - sx;
      cartilage = cubic(end, [end[0] - dx * 0.4, end[1] + d.sag!], [sx + dx * 0.3, sy + (end[1] - sy) * 0.35], [sx, sy], 16);
      joins = { to: 'sternum' };
    } else if (n <= 10) {
      const above = cartilageOf[i - 1]!;
      const meet = along(above, JOIN_AT + 0.08 * (n - 8));
      const dx = end[0] - meet[0];
      cartilage = cubic(end, [end[0] - dx * 0.45, end[1] + 6], [meet[0] + dx * 0.25, meet[1] + 10], meet, 14);
      joins = { to: 'cartilage', rib: n - 1 };
    } else {
      joins = { to: 'free' };
    }
    cartilageOf.push(cartilage);
    ribs.push({
      side,
      number: n,
      kind: n <= 7 ? 'true' : n <= 10 ? 'false' : 'floating',
      vertebra: v.id,
      bone: bone.map(flip),
      frontFrom,
      cartilage: cartilage.map(flip),
      joins,
    });
  }
  return ribs;
}

function sternumOutline(): Point[] {
  const right: Point[] = [];
  for (let y = STERNUM_TOP; y <= STERNUM_BOTTOM; y += 4) right.push([sternumHalfWidth(y), y]);
  const notch: Point[] = [
    [-14, STERNUM_TOP],
    [-6, STERNUM_TOP + 8],
    [6, STERNUM_TOP + 8],
    [14, STERNUM_TOP],
  ];
  const left = [...right].reverse().map(([x, y]): Point => [-x, y]);
  return [...notch, ...right, ...left];
}

export function thorax(): Thorax {
  const spine = vertebrae();
  const ribs = [...ribsFor('right', spine), ...ribsFor('left', spine)];
  const joint = (y: number): [Point, Point] => [[-sternumHalfWidth(y), y], [sternumHalfWidth(y), y]];
  // Organs: the subject's right lung is on the viewer's left; the heart leans to the subject's left.
  const rightLung: Point[] = [
    [-70, 70], [-108, 96], [-160, 160], [-212, 240], [-246, 330], [-266, 420], [-276, 510], [-270, 580],
    [-232, 566], [-176, 532], [-118, 512], [-70, 516], [-62, 470], [-60, 400], [-52, 330], [-44, 260], [-42, 180], [-50, 110],
  ];
  // The left lung's medial border follows the heart (cardiac notch).
  const leftLung: Point[] = [
    [66, 72], [104, 98], [158, 162], [210, 242], [244, 332], [266, 424], [278, 516], [276, 598],
    [240, 588], [196, 572], [168, 570], [164, 522], [158, 474], [130, 414], [88, 364], [58, 300], [44, 180], [48, 110],
  ];
  // Heart, anterior view: right atrium on the viewer's left, apex down towards the viewer's right.
  const heart: Point[] = [
    [-20, 334], [-38, 358], [-46, 398], [-42, 438], [-24, 474], [4, 502], [42, 524], [84, 542], [124, 554],
    [140, 544], [146, 514], [140, 476], [124, 436], [102, 400], [78, 372], [54, 352], [22, 338],
  ];
  return {
    vertebrae: spine,
    ribs,
    sternum: sternumOutline(),
    sternalJoints: [joint(STERNAL_ANGLE), joint(XIPHISTERNAL)],
    lungs: { right: rightLung, left: leftLung },
    heart,
  };
}

/* ------------------------------------------------------------------ SVG */

const INK = '#2b2b2b';
const INK_BACK = '#8f8f8f';
const INK_SOFT = '#6e6e6e';
const BONE = '#ffffff';
const CARTILAGE = '#ececec';

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const pts = (line: readonly Point[]) => line.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

/** Smooth closed path through points (Catmull-Rom as cubic Béziers). */
function closedSpline(p: readonly Point[]): string {
  const n = p.length;
  let d = `M${f(p[0]![0])},${f(p[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n]!;
    const p1 = p[i]!;
    const p2 = p[(i + 1) % n]!;
    const p3 = p[(i + 2) % n]!;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d} Z`;
}

/** Left and right edges of a band of varying width around a centreline. */
function edges(line: readonly Point[], width: (t: number) => number): [Point[], Point[]] {
  const a: Point[] = [];
  const b: Point[] = [];
  for (let i = 0; i < line.length; i++) {
    const prev = line[Math.max(0, i - 1)]!;
    const next = line[Math.min(line.length - 1, i + 1)]!;
    const len = Math.hypot(next[0] - prev[0], next[1] - prev[1]) || 1;
    const nx = -(next[1] - prev[1]) / len;
    const ny = (next[0] - prev[0]) / len;
    const w = width(i / (line.length - 1)) / 2;
    const p = line[i]!;
    a.push([p[0] + nx * w, p[1] + ny * w]);
    b.push([p[0] - nx * w, p[1] - ny * w]);
  }
  return [a, b];
}

function ribWidth(rib: Rib): (t: number) => number {
  if (rib.kind === 'floating') {
    const base = rib.number === 11 ? 15 : 14;
    return (t) => (t < 0.08 ? base - 3 + t * 30 : base * (1 - 0.6 * Math.max(0, (t - 0.6) / 0.4) ** 1.6));
  }
  const body = rib.number === 1 ? 17 : 15;
  return (t) => (t < 0.06 ? body - 5 + t * 70 : body - 2 * t);
}

/** One band: fill without stroke, then its two side contours (ends left open unless asked). */
function band(line: readonly Point[], width: (t: number) => number, fill: string, ink: string, stroke: number, extra = ''): string {
  const [a, b] = edges(line, width);
  const outline = [...a, ...[...b].reverse()];
  return (
    `<polygon points="${pts(outline)}" fill="${fill}"/>` +
    `<polyline points="${pts(a)}" fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` +
    `<polyline points="${pts(b)}" fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
  );
}

function cap(line: readonly Point[], width: (t: number) => number, at: 'start' | 'end', ink: string, stroke: number): string {
  const [a, b] = edges(line, width);
  const i = at === 'start' ? 0 : line.length - 1;
  const p = a[i]!;
  const q = b[i]!;
  const c = line[i]!;
  const o = line[at === 'start' ? 1 : line.length - 2]!;
  const len = Math.hypot(c[0] - o[0], c[1] - o[1]) || 1;
  const bulge = Math.hypot(p[0] - q[0], p[1] - q[1]) * 0.55;
  const ctl: Point = [c[0] + ((c[0] - o[0]) / len) * bulge, c[1] + ((c[1] - o[1]) / len) * bulge];
  return `<path d="M${f(p[0])},${f(p[1])} Q${f(ctl[0])},${f(ctl[1])} ${f(q[0])},${f(q[1])}" fill="${BONE}" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round"/>`;
}

function hatch(id: string, step: number, angle: number, ink: string, width: number, opacity: number): string {
  return (
    `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">` +
    `<line x1="0" y1="0" x2="0" y2="${step}" stroke="${ink}" stroke-width="${width}" stroke-opacity="${opacity}"/></pattern>`
  );
}

export function svg(t: Thorax = thorax(), size: Point = [1200, 900]): string {
  // Fit the drawing into the 4:3 sheet with the illustrate.ts margin (6% each side).
  const all: Point[] = [...t.lungs.right, ...t.lungs.left, ...t.ribs.flatMap((r) => [...r.bone, ...r.cartilage])];
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const x0 = Math.min(...xs) - 12;
  const x1 = Math.max(...xs) + 12;
  const y0 = Math.min(...ys) - 12;
  const y1 = Math.max(...ys) + 12;
  const margin = 0.06;
  const k = Math.min((size[0] * (1 - 2 * margin)) / (x1 - x0), (size[1] * (1 - 2 * margin)) / (y1 - y0));
  const tx = size[0] / 2 - ((x0 + x1) / 2) * k;
  const ty = size[1] / 2 - ((y0 + y1) / 2) * k;

  const parts: string[] = [];
  // Spine (behind everything except the posterior rib shafts that tuck under the bodies).
  // The back half of every rib, in a light contour: it runs behind the organs to its vertebra.
  const posterior = t.ribs.map((r) => {
    const w = ribWidth(r);
    const back = r.bone.slice(0, r.frontFrom + 1);
    return `<g data-rib-back="${r.side}-${r.number}">${band(back, (u) => w((u * r.frontFrom) / (r.bone.length - 1)), 'none', INK_BACK, 1.7)}</g>`;
  });
  parts.push(`<g id="posterior-ribs">${posterior.join('')}</g>`);

  const spine = t.vertebrae
    .map((v) => {
      const [cx, cy] = v.centre;
      const w = v.halfWidth;
      const h = v.height / 2;
      const tp = (m: number) =>
        `<path d="M${f(m * (w - 4))},${f(cy - h * 0.7)} L${f(m * (w + 16))},${f(cy - h * 0.6)} Q${f(m * (w + 24))},${f(cy - h * 0.35)} ${f(m * (w + 16))},${f(cy - h * 0.08)} L${f(m * (w - 4))},${f(cy + h * 0.1)} Z" fill="${BONE}" stroke="${INK_BACK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      const proc = tp(-1) + tp(1);
      const body = `<rect x="${f(cx - w)}" y="${f(cy - h)}" width="${f(2 * w)}" height="${f(2 * h)}" rx="${f(w * 0.28)}" fill="${BONE}" stroke="${INK_SOFT}" stroke-width="2.2"/>`;
      const waist = `<path d="M${f(-w + 3)},${f(cy - h + 5)} Q0,${f(cy - h + 10)} ${f(w - 3)},${f(cy - h + 5)} M${f(-w + 3)},${f(cy + h - 5)} Q0,${f(cy + h - 1)} ${f(w - 3)},${f(cy + h - 5)}" fill="none" stroke="${INK_BACK}" stroke-width="1.2"/>`;
      return `<g data-vertebra="${v.id}">${proc}${body}${waist}</g>`;
    })
    .join('');
  parts.push(`<g id="spine">${spine}</g>`);

  // Organs in a light tone: translucent so the spine and the back of the ribs read through.
  const lung = (side: Side) =>
    `<path d="${closedSpline(t.lungs[side])}" fill="#bdbdbd" fill-opacity="0.32" stroke="${INK_SOFT}" stroke-width="2.4"/>` +
    `<path d="${closedSpline(t.lungs[side])}" fill="url(#hatch-lung)"/>`;
  const fissures =
    `<path d="M-246,330 C-200,340 -120,350 -56,352" fill="none" stroke="${INK_BACK}" stroke-width="1.8"/>` +
    `<path d="M-212,240 C-200,320 -170,420 -118,512" fill="none" stroke="${INK_BACK}" stroke-width="1.8"/>` +
    `<path d="M210,242 C208,330 200,440 190,570" fill="none" stroke="${INK_BACK}" stroke-width="1.8"/>`;
  // Heart in a light tone like the lungs, but solid (it hides the back of the ribs), with a darker edge: superior vena cava,
  // ascending aorta and arch, pulmonary trunk, and the groove between the ventricles.
  const vessel = 'fill="#e4e4e4" stroke="#555555" stroke-width="2.2" stroke-linejoin="round"';
  const heart =
    `<path d="M-38,344 L-40,236 L-18,236 L-14,336 Z" ${vessel}/>` +
    `<path d="M-8,338 C-14,286 -6,232 34,226 C66,222 82,246 80,276 L60,280 C60,262 50,252 36,254 C14,258 14,296 16,334 Z" ${vessel}/>` +
    `<path d="M30,344 C32,316 44,296 62,290 L76,306 C62,314 56,332 56,352 Z" ${vessel}/>` +
    `<path d="${closedSpline(t.heart)}" fill="#dedede" stroke="#4a4a4a" stroke-width="3"/>` +
    `<path d="${closedSpline(t.heart)}" fill="url(#hatch-lung)"/>` +
    `<path d="M58,354 C72,412 94,482 120,550" fill="none" stroke="${INK_SOFT}" stroke-width="1.8"/>` +
    `<path d="M-22,468 C-2,432 8,394 2,354" fill="none" stroke="${INK_BACK}" stroke-width="1.5"/>`;
  parts.push(`<g id="organs">${lung('right')}${lung('left')}${fissures}${heart}</g>`);

  // Front of the cage: cartilages (lighter, dashed contour) under the anterior shafts, then the sternum.
  const front: string[] = [];
  for (const side of ['right', 'left'] as const) {
    // Lowest first: floating ribs sit behind rib 10 at the flank, and each cartilage of the
    // costal margin is overlapped by the one it joins.
    const ribs = t.ribs.filter((r) => r.side === side).sort((a, b) => b.number - a.number);
    for (const r of ribs) {
      const w = ribWidth(r);
      const fr = r.bone.slice(r.frontFrom);
      const off = r.frontFrom / (r.bone.length - 1);
      const fw = (u: number) => w(off + u * (1 - off));
      // Graphite shading: one fine line running inside one edge of the shaft.
      const [, shade] = edges(fr, (u) => fw(u) * 0.52);
      const shading = `<polyline points="${pts(shade.slice(2, -2))}" fill="none" stroke="${INK_BACK}" stroke-width="1.3" stroke-linecap="round"/>`;
      let ends: string;
      if (r.kind === 'floating') {
        // Free, rounded tip at the flank.
        ends = cap(fr, fw, 'end', INK, 2.6);
      } else {
        // Costochondral junction: a solid line across the band where bone becomes cartilage.
        const [a, b] = edges(fr, fw);
        const pa = a[a.length - 1]!;
        const pb = b[b.length - 1]!;
        ends = `<line x1="${f(pa[0])}" y1="${f(pa[1])}" x2="${f(pb[0])}" y2="${f(pb[1])}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
      }
      const cartilage = r.cartilage.length ? band(r.cartilage, () => (r.number === 1 ? 15 : 12), CARTILAGE, INK_SOFT, 1.8, ' stroke-dasharray="7 5"') : '';
      front.push(`<g data-rib="${r.side}-${r.number}" data-kind="${r.kind}" data-vertebra="${r.vertebra}">${cartilage}${band(fr, fw, BONE, INK, 2.6)}${shading}${ends}</g>`);
    }
  }
  parts.push(`<g id="anterior-ribs">${front.join('')}</g>`);

  const sternum =
    `<polygon points="${pts(t.sternum)}" fill="${BONE}" fill-opacity="0.76" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>` +
    t.sternalJoints.map(([a, b]) => `<line x1="${f(a[0] + 3)}" y1="${f(a[1])}" x2="${f(b[0] - 3)}" y2="${f(b[1])}" stroke="${INK_SOFT}" stroke-width="2"/>`).join('') +
    `<path d="M-14,${STERNUM_TOP + 30} C-10,${STERNUM_TOP + 60} -12,${STERNAL_ANGLE - 20} -16,${STERNAL_ANGLE - 6} M14,${STERNAL_ANGLE + 30} C12,380 13,440 12,${XIPHISTERNAL - 16}" fill="none" stroke="${INK_BACK}" stroke-width="1.4"/>`;
  parts.push(`<g id="sternum">${sternum}</g>`);

  const defs = `<defs>${hatch('hatch-lung', 9, 35, INK_SOFT, 1, 0.22)}</defs>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 ${size[0]} ${size[1]}">` +
    defs +
    `<g transform="translate(${f(tx)} ${f(ty)}) scale(${k.toFixed(4)})">${parts.join('')}</g></svg>`
  );
}

export const OUTPUT = 'public/illustrations/figures/bones-and-joints-protected-organs.webp';
/** scripts/illustrate.ts FIGURE variant budget. */
export const BUDGET = 120 * 1024;

async function main(): Promise<void> {
  const root = resolve(import.meta.dirname, '../..');
  const args = process.argv.slice(2);
  const text = svg();
  const svgOut = args[args.indexOf('--svg') + 1];
  if (args.includes('--svg') && svgOut) writeFileSync(resolve(svgOut), text);
  // Neutral greys only: greyscale near-lossless WebP keeps every decoded pixel R = G = B
  // (lossy YUV WebP rounds chroma) and stays inside the illustrate.ts 120 KiB figure budget.
  const bytes = await sharp(Buffer.from(text)).greyscale().ensureAlpha().webp({ nearLossless: true, quality: 40, effort: 6 }).toBuffer();
  if (bytes.length > BUDGET) throw new Error(`${OUTPUT}: ${bytes.length} B is over the ${BUDGET} B figure budget`);
  writeFileSync(resolve(root, OUTPUT), bytes);
  console.log(`wrote ${OUTPUT}  1200×900  ${bytes.length} B  sha256 ${createHash('sha256').update(bytes).digest('hex')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
