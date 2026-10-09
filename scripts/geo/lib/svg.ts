/**
 * Minimal SVG reader for georeferencing: walks the element tree, resolves
 * nested transforms and inherited fills, and flattens <path>/<rect>/<circle>/
 * <ellipse>/<polygon> geometry into rings in SVG user units. Elements inside
 * <clipPath id="…"> are reported with fill `clip:<id>`; <marker>, <pattern>,
 * <mask> and <symbol> contents are ignored. Text positions are collected for
 * labelling control points.
 */
export type Pt = [number, number];
/** 2D affine matrix [a, b, c, d, e, f] as in SVG `matrix()`. */
export type Mat = [number, number, number, number, number, number];

export interface SvgShape {
  id: string;
  /** Lower-case #rrggbb, `none`, or `clip:<id>`. */
  fill: string;
  /** Sub-paths in SVG user units (open sub-paths are filled as if closed). */
  rings: Pt[][];
}

export interface SvgText {
  text: string;
  at: Pt;
}

export interface SvgDoc {
  viewBox: [number, number, number, number];
  shapes: SvgShape[];
  texts: SvgText[];
}

const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

export function mul(m: Mat, n: Mat): Mat {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

export function apply(m: Mat, p: Pt): Pt {
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

function nums(s: string): number[] {
  return (s.match(/-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []).map(Number);
}

export function parseTransform(s: string | undefined): Mat {
  if (!s) return IDENTITY;
  let m: Mat = IDENTITY;
  for (const [, fn, args] of s.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = nums(args ?? '');
    let t: Mat = IDENTITY;
    switch (fn) {
      case 'matrix':
        t = [a[0] ?? 1, a[1] ?? 0, a[2] ?? 0, a[3] ?? 1, a[4] ?? 0, a[5] ?? 0];
        break;
      case 'translate':
        t = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0];
        break;
      case 'scale':
        t = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
        break;
      case 'rotate': {
        const r = ((a[0] ?? 0) * Math.PI) / 180;
        const cx = a[1] ?? 0;
        const cy = a[2] ?? 0;
        const rot: Mat = [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
        t = mul(mul([1, 0, 0, 1, cx, cy], rot), [1, 0, 0, 1, -cx, -cy]);
        break;
      }
      case 'skewX':
        t = [1, 0, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 1, 0, 0];
        break;
      case 'skewY':
        t = [1, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 0, 1, 0, 0];
        break;
    }
    m = mul(m, t);
  }
  return m;
}

/* ------------------------------------------------------------------ */
/* Path data                                                           */
/* ------------------------------------------------------------------ */

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, out: Pt[], steps = 8): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

function quad(p0: Pt, p1: Pt, p2: Pt, out: Pt[], steps = 6): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
}

/** SVG elliptical arc (endpoint parameterisation, SVG 1.1 F.6.5). */
function arc(p0: Pt, rxIn: number, ryIn: number, phiDeg: number, large: number, sweep: number, p1: Pt, out: Pt[]): void {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) {
    out.push(p1);
    return;
  }
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2;
  const dy = (p0[1] - p1[1]) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  let co = Math.sqrt(Math.max(0, num / den));
  if (large === sweep) co = -co;
  const cxp = (co * rx * y1) / ry;
  const cyp = (-co * ry * x1) / rx;
  const cx = cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2;
  const cy = sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dt = ang((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  else if (sweep && dt < 0) dt += 2 * Math.PI;
  const steps = Math.max(4, Math.ceil(Math.abs(dt) / (Math.PI / 12)));
  for (let i = 1; i <= steps; i++) {
    const t = t1 + (dt * i) / steps;
    out.push([cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin, cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos]);
  }
}

/** Path data -> list of sub-path point lists (local coordinates). */
export function parsePathData(d: string): Pt[][] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out: Pt[][] = [];
  let cur: Pt[] = [];
  let pos: Pt = [0, 0];
  let start: Pt = [0, 0];
  let lastCtrl: Pt | null = null;
  let lastCmd = '';
  let i = 0;
  let cmd = '';
  const num = () => Number(tokens[i++]);
  const isNum = () => i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i] ?? '');
  const flush = () => {
    if (cur.length > 1) out.push(cur);
    cur = [];
  };
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i] ?? '')) cmd = tokens[i++] ?? '';
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const o = (x: number, y: number): Pt => (rel ? [pos[0] + x, pos[1] + y] : [x, y]);
    switch (C) {
      case 'M': {
        flush();
        pos = o(num(), num());
        start = pos;
        cur = [pos];
        cmd = rel ? 'l' : 'L';
        lastCtrl = null;
        break;
      }
      case 'L':
        pos = o(num(), num());
        cur.push(pos);
        lastCtrl = null;
        break;
      case 'H':
        pos = [rel ? pos[0] + num() : num(), pos[1]];
        cur.push(pos);
        lastCtrl = null;
        break;
      case 'V':
        pos = [pos[0], rel ? pos[1] + num() : num()];
        cur.push(pos);
        lastCtrl = null;
        break;
      case 'C': {
        const p1 = o(num(), num());
        const p2 = o(num(), num());
        const p3 = o(num(), num());
        cubic(pos, p1, p2, p3, cur);
        lastCtrl = p2;
        pos = p3;
        break;
      }
      case 'S': {
        const p1: Pt = lastCtrl && /[CS]/i.test(lastCmd) ? [2 * pos[0] - lastCtrl[0], 2 * pos[1] - lastCtrl[1]] : pos;
        const p2 = o(num(), num());
        const p3 = o(num(), num());
        cubic(pos, p1, p2, p3, cur);
        lastCtrl = p2;
        pos = p3;
        break;
      }
      case 'Q': {
        const p1 = o(num(), num());
        const p2 = o(num(), num());
        quad(pos, p1, p2, cur);
        lastCtrl = p1;
        pos = p2;
        break;
      }
      case 'T': {
        const p1: Pt = lastCtrl && /[QT]/i.test(lastCmd) ? [2 * pos[0] - lastCtrl[0], 2 * pos[1] - lastCtrl[1]] : pos;
        const p2 = o(num(), num());
        quad(pos, p1, p2, cur);
        lastCtrl = p1;
        pos = p2;
        break;
      }
      case 'A': {
        const rx = num();
        const ry = num();
        const phi = num();
        const large = num();
        const sweep = num();
        const p1 = o(num(), num());
        arc(pos, rx, ry, phi, large, sweep, p1, cur);
        pos = p1;
        lastCtrl = null;
        break;
      }
      case 'Z':
        if (cur.length) cur.push(start);
        pos = start;
        flush();
        cur = [pos];
        lastCtrl = null;
        break;
      default:
        i++;
    }
    lastCmd = C;
    // Implicit repeat: keep the command while numbers follow.
    if (C === 'Z') {
      if (isNum()) cmd = 'L';
    }
  }
  flush();
  return out;
}

/* ------------------------------------------------------------------ */
/* Document walk                                                       */
/* ------------------------------------------------------------------ */

function attrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, k, v1, v2] of s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) if (k) out[k] = v1 ?? v2 ?? '';
  return out;
}

function styleProp(a: Record<string, string>, prop: string): string | undefined {
  const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`).exec(a.style ?? '');
  return (m?.[1] ?? a[prop])?.trim();
}

export function normColor(c: string | undefined): string | undefined {
  if (!c) return undefined;
  const s = c.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  if (s === 'white') return '#ffffff';
  if (s === 'black') return '#000000';
  return s;
}

const SKIP = new Set(['marker', 'pattern', 'mask', 'symbol', 'metadata', 'style', 'title', 'desc']);

export function readSvg(text: string): SvgDoc {
  const vbAttr = /<svg\b[^>]*\bviewBox="([^"]+)"/s.exec(text)?.[1];
  let viewBox: [number, number, number, number];
  if (vbAttr) {
    const v = nums(vbAttr);
    viewBox = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, v[3] ?? 0];
  } else {
    const svgTag = /<svg\b([^>]*)>/s.exec(text)?.[1] ?? '';
    const a = attrs(svgTag);
    viewBox = [0, 0, parseFloat(a.width ?? '0'), parseFloat(a.height ?? '0')];
  }
  interface Frame {
    tag: string;
    m: Mat;
    fill: string | undefined;
    clip?: string;
    skip: boolean;
  }
  const stack: Frame[] = [{ tag: 'root', m: IDENTITY, fill: '#000000', skip: false }];
  const shapes: SvgShape[] = [];
  const texts: SvgText[] = [];
  const re = /<(\/?)([\w:-]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>|([^<]+)/gs;
  let pendingText: { at: Pt; buf: string } | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const [, close, rawTag, rest, selfClose, chars] = m;
    const top = stack[stack.length - 1]!;
    if (chars !== undefined) {
      if (pendingText && !top.skip) pendingText.buf += chars;
      continue;
    }
    const tag = (rawTag ?? '').replace(/^svg:/, '');
    if (close) {
      if (tag === 'text' && pendingText) {
        const t = pendingText.buf.replace(/\s+/g, ' ').trim();
        if (t) texts.push({ text: t, at: pendingText.at });
        pendingText = null;
      }
      if (stack.length > 1) stack.pop();
      continue;
    }
    const a = attrs(rest ?? '');
    const mat = mul(top.m, parseTransform(a.transform));
    const fillRaw = styleProp(a, 'fill');
    const fill = fillRaw && fillRaw !== 'inherit' ? normColor(fillRaw) : top.fill;
    const skip = top.skip || SKIP.has(tag);
    const clip = tag === 'clipPath' ? a.id : top.clip;
    const frame: Frame = { tag, m: mat, fill, clip, skip };
    if (!skip) {
      const shapeFill = clip ? `clip:${clip}` : fill ?? '#000000';
      let rings: Pt[][] | null = null;
      if (tag === 'path' && a.d) rings = parsePathData(a.d);
      else if (tag === 'rect') {
        const x = parseFloat(a.x ?? '0');
        const y = parseFloat(a.y ?? '0');
        const w = parseFloat(a.width ?? '0');
        const h = parseFloat(a.height ?? '0');
        rings = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]];
      } else if (tag === 'circle' || tag === 'ellipse') {
        const cx = parseFloat(a.cx ?? '0');
        const cy = parseFloat(a.cy ?? '0');
        const rx = parseFloat(a.r ?? a.rx ?? '0');
        const ry = parseFloat(a.r ?? a.ry ?? '0');
        const ring: Pt[] = [];
        for (let k = 0; k <= 24; k++) ring.push([cx + rx * Math.cos((k / 24) * 2 * Math.PI), cy + ry * Math.sin((k / 24) * 2 * Math.PI)]);
        rings = [ring];
      } else if (tag === 'polygon' && a.points) {
        const v = nums(a.points);
        const ring: Pt[] = [];
        for (let k = 0; k + 1 < v.length; k += 2) ring.push([v[k]!, v[k + 1]!]);
        if (ring.length) ring.push(ring[0]!);
        rings = [ring];
      } else if (tag === 'text' || tag === 'tspan') {
        const x = nums(a.x ?? '')[0];
        const y = nums(a.y ?? '')[0];
        if (tag === 'text') pendingText = { at: apply(mat, [x ?? 0, y ?? 0]), buf: '' };
        else if (pendingText && x !== undefined && y !== undefined && !pendingText.buf.trim()) pendingText.at = apply(mat, [x, y]);
      }
      if (rings && rings.length && (clip || (fill && fill !== 'none'))) {
        shapes.push({ id: a.id ?? '', fill: shapeFill, rings: rings.map((r) => r.map((p) => apply(mat, p))) });
      }
    }
    if (!selfClose) stack.push(frame);
  }
  return { viewBox, shapes, texts };
}

/* ------------------------------------------------------------------ */
/* Rings -> polygons (even-odd nesting)                                */
/* ------------------------------------------------------------------ */

function ringArea(r: Pt[]): number {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j]![0] + r[i]![0]) * (r[j]![1] - r[i]![1]);
  return a / 2;
}

function inRing(p: Pt, r: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i]!;
    const [xj, yj] = r[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Group one shape's sub-paths into polygons with holes using even-odd nesting
 * depth (a ring inside an odd number of other rings is a hole of the smallest
 * ring containing it).
 */
export function ringsToPolygons(rings: Pt[][]): Pt[][][] {
  const closed = rings
    .filter((r) => r.length >= 3)
    .map((r) => {
      const c = r.slice();
      const f = c[0]!;
      const l = c[c.length - 1]!;
      if (f[0] !== l[0] || f[1] !== l[1]) c.push(f);
      return c;
    })
    .filter((r) => r.length >= 4 && Math.abs(ringArea(r)) > 1e-9);
  const info = closed.map((r) => ({ r, area: Math.abs(ringArea(r)), depth: 0, parent: -1 }));
  info.forEach((a, i) => {
    let best = -1;
    let bestArea = Infinity;
    info.forEach((b, j) => {
      if (i === j || b.area <= a.area) return;
      const probe = a.r[0]!;
      if (inRing(probe, b.r)) {
        a.depth++;
        if (b.area < bestArea) {
          bestArea = b.area;
          best = j;
        }
      }
    });
    a.parent = best;
  });
  const polys = new Map<number, Pt[][]>();
  info.forEach((a, i) => {
    if (a.depth % 2 === 0) polys.set(i, [a.r]);
  });
  info.forEach((a) => {
    if (a.depth % 2 === 1 && a.parent >= 0) polys.get(a.parent)?.push(a.r);
  });
  return [...polys.values()];
}
