/** Deterministic protection plate. Thoracic geometry is the count/attachment-
 * audited 040f192 construction; the cranial and spinal sections are original
 * explicit geometry in centimetres (adult proportions), scaled onto the sheet.
 * pnpm tsx scripts/geo/bones-and-joints/protected-organs.ts */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { svg as thoraxSvg, thorax } from '../../figures/bones-protected-organs';
export { thorax } from '../../figures/bones-protected-organs';
export type { Point, Rib, Side } from '../../figures/bones-protected-organs';
export const OUTPUT = 'public/illustrations/bones-and-joints/bones-and-joints-protected-organs.webp';
export const BUDGET = 120 * 1024;

type P = readonly [number, number];
const INK = '#2f2f2f';
const INK_SOFT = '#646464';
const INK_BACK = '#9a9a9a';
const BONE = '#fbfbfb';
const f = (n: number) => (Math.round(n * 10) / 10).toString();
const pts = (l: readonly P[]) => l.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

/** Dense Catmull-Rom samples through the given points (open, or closed). */
function sample(p: readonly P[], closed = false, steps = 10): P[] {
  const n = p.length;
  const at = (i: number) => (closed ? p[(i + n) % n]! : p[Math.max(0, Math.min(n - 1, i))]!);
  const out: P[] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, c2: number, d: number) =>
        0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) out.push(p[n - 1]!);
  return out;
}
/** Smooth runs joined at sharp corners: each run's last point is the next run's first. */
const runs = (...r: P[][]) => r.flatMap((x, i) => (i ? sample(x).slice(1) : sample(x)));
/** Offset a polyline sideways by w(u); positive is to the left of travel in screen space. */
function offset(l: readonly P[], w: (u: number) => number): P[] {
  return l.map((p, i) => {
    const a = l[Math.max(0, i - 1)]!;
    const b = l[Math.min(l.length - 1, i + 1)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const d = w(i / (l.length - 1));
    return [p[0] + ((b[1] - a[1]) / len) * d, p[1] - ((b[0] - a[0]) / len) * d] as P;
  });
}
/** Organic wobble across a curve (deterministic): sulci and folia are never ruler-smooth. */
function wobble(l: readonly P[], amp: number, seed: number): P[] {
  const n = Math.max(1, l.length / 18); // about one meander per 1.8 cm of curve
  return offset(l, (u) => amp * (Math.sin(u * n * 6.28 + seed) + 0.35 * Math.sin(u * n * 14.1 + seed * 2.3)) * Math.sin(Math.PI * u) ** 0.5);
}
const poly = (l: readonly P[], attrs: string) => `<polygon points="${pts(l)}" ${attrs}/>`;
const line = (l: readonly P[], attrs: string) => `<polyline points="${pts(l)}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
const leader = (d: string) => `<path d="${d}" fill="none" stroke="#646464" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
const label = (x: number, y: number, en: string, zh: string, size = 32) =>
  `<text x="${x}" y="${y}" font-family="Arial, PingFang SC, sans-serif" font-size="${size}" fill="#393939">${en}<tspan x="${x}" dy="${size}" font-size="${size}">${zh}</tspan></text>`;

/** A label set on several lines (English wrapped, then Chinese); aria-label keeps the whole term. */
const stack = (x: number, y: number, lines: string[], size = 28) =>
  `<text x="${x}" y="${y}" aria-label="${lines.join(' ')}" font-family="Arial, PingFang SC, sans-serif" font-size="${size}" fill="#393939">${lines[0]}${lines.slice(1).map((l) => `<tspan x="${x}" dy="${size}">${l}</tspan>`).join('')}</text>`;

/* ---------------------------------------------------------------- 01 cranial section
 * Lateral view of an adult skull, Frankfort plane horizontal, porion at the origin,
 * x forward (face to the page right), y up, in cm. The lateral wall of the vault is
 * cut away along the cranial floor: the cut edge shows the outer table, diploë and
 * inner table (thicker at the frontal sinus and the occipital), revealing the brain. */
const SK = { s: 11, ox: 194, oy: 236 };
const sk = (l: readonly P[]): P[] => l.map(([x, y]) => [SK.ox + SK.s * x, SK.oy - SK.s * y] as P);

const GLABELLA: P = [9.38, 4.15];
const vaultOuter: P[] = [GLABELLA, [9.3, 5.6], [8.85, 7.3], [8.0, 9.0], [6.7, 10.6], [5.0, 11.85], [3.0, 12.65], [0.8, 13.05], [-1.5, 12.95], [-3.8, 12.35], [-5.8, 11.15], [-7.4, 9.55], [-8.6, 7.6], [-9.4, 5.6], [-9.65, 4.0], [-9.45, 2.6], [-8.95, 1.6], [-7.9, 0.75], [-6.4, -0.15], [-4.8, -0.75], [-3.6, -1.1]];
function cranium(): string {
  const outline = runs(
    [[8.9, 2.95], [9.2, 3.45], ...vaultOuter.slice(0, 17)],
    vaultOuter.slice(16).concat([[-2.3, -1.4]] as P[]),
    [[-2.3, -1.4], [-1.85, -2.45], [-1.25, -3.0], [-0.72, -2.75], [-0.45, -1.85], [0.1, -1.2], [0.6, -1.2]],
    [[0.6, -1.2], [1.6, -2.2], [3.0, -2.9], [4.3, -3.3], [4.75, -3.65], [5.0, -3.85]],
    [[5.0, -3.85], [7.0, -3.92], [9.0, -3.86], [10.0, -3.76], [10.5, -3.7]],
    [[10.5, -3.7], [10.75, -3.05], [10.9, -2.55], [11.1, -2.3]],
    [[11.1, -2.3], [10.6, -2.15], [10.2, -1.85]],
    [[10.2, -1.85], [9.95, -1.1], [9.95, -0.25], [10.15, 0.15], [10.5, 0.5]],
    [[10.5, 0.5], [10.0, 1.3], [9.45, 2.2], [8.9, 2.95]],
  );
  return poly(sk(outline), `fill="${BONE}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"`);
}
/** Outer vault, glabella → opisthion, and the inner table offset inside it. */
function vault() {
  const outer = sk(sample(vaultOuter, false, 14));
  // cm thickness along the arc: frontal sinus 1.0 at the glabella, 0.55 over the vault, 0.8 at the inion, 0.5 at the base.
  const thick = (u: number) => (u < 0.08 ? 1.0 - (u / 0.08) * 0.35 : u < 0.72 ? 0.65 : u < 0.8 ? 0.65 + ((u - 0.72) / 0.08) * 0.2 : 0.8 - ((u - 0.8) / 0.2) * 0.3);
  const inner = offset(outer, (u) => SK.s * thick(u)); // traversed glabella → vertex → occiput, so inward is the positive side on screen
  return { outer, inner };
}
/** Cranial floor seen from the side, opisthion → frontal: posterior fossa opening (foramen magnum), petrous ridge, middle fossa, orbit roof. */
const floorCm: P[] = [[-0.8, -1.62], [-0.35, -0.6], [-0.05, 0.75], [1.0, 0.85], [2.2, 0.62], [3.4, 0.62], [4.2, 1.05], [4.75, 2.1], [5.5, 2.95], [7.0, 3.25], [8.1, 3.55]];

function brain(): { cerebrum: P[]; cerebellum: P[]; stem: P[]; sulci: P[][]; folia: P[][] } {
  const cerebrumUpper = offset(sample(vaultOuter.slice(0, 16), false, 14), (u) => -(u < 0.1 ? 1.2 - u * 4.5 : 0.75 + 0.05 * Math.sin(u * 9)));
  const lower: P[] = [[-8.35, 3.05], [-7.0, 2.5], [-5.0, 2.15], [-3.0, 1.8], [-1.4, 1.45], [0.3, 1.1], [2.0, 0.95], [3.5, 1.05], [4.25, 1.45], [4.45, 2.1], [4.3, 2.6], [4.8, 2.92], [5.6, 3.3], [6.7, 3.5], [7.6, 3.65], [8.05, 3.95]];
  const upper = cerebrumUpper.filter((p) => p[1] > 3.3 || p[0] < 0);
  const cerebrum = [...sample([lower[lower.length - 1]!, upper[0]!], false, 2), ...upper.slice(1, -1), ...sample([upper[upper.length - 1]!, ...lower], false, 8)];
  const cerebellum = sample([[-1.8, 1.25], [-3.4, 1.62], [-5.3, 1.88], [-6.9, 1.82], [-7.75, 1.15], [-7.35, 0.35], [-6.0, -0.3], [-4.4, -0.62], [-3.0, -0.6], [-2.1, -0.25], [-1.6, 0.45]], true, 8);
  const stem = sample([[-0.9, 1.7], [0.15, 1.2], [0.35, 0.45], [0.2, -0.35], [-0.3, -0.85], [-0.75, -1.35], [-1.0, -2.1], [-1.9, -2.1], [-2.15, -1.2], [-2.2, -0.2], [-2.0, 0.9], [-1.6, 1.6]], true, 8);
  const S = (p: P[], amp = 0.09, seed = 1) => wobble(sample(p, false, 10), amp * 2.4, seed);
  const sulci = [
    S([[4.55, 2.85], [3.0, 3.4], [1.2, 3.95], [-0.6, 4.55], [-1.7, 5.4]], 0.06, 1), // lateral sulcus
    S([[3.55, 3.2], [3.9, 4.0], [4.05, 4.6]], 0.04, 2),
    S([[0.05, 12.35], [0.6, 10.6], [1.3, 9.0], [1.85, 7.3], [2.35, 5.6], [2.6, 4.55]], 0.12, 3), // central
    S([[2.7, 11.95], [3.05, 10.4], [3.5, 9.2], [3.9, 7.8], [4.2, 6.3]], 0.11, 4),
    S([[-2.0, 11.85], [-1.35, 10.1], [-0.65, 8.6], [-0.2, 7.0], [0.25, 5.5]], 0.11, 5),
    S([[7.45, 8.3], [6.1, 9.05], [4.85, 9.6], [3.5, 9.95]], 0.1, 6),
    S([[7.7, 6.0], [6.4, 6.5], [5.25, 7.0], [4.1, 7.35]], 0.1, 7),
    S([[6.9, 4.45], [5.7, 4.75], [4.95, 5.4]], 0.06, 8),
    S([[3.95, 2.1], [2.4, 2.5], [0.6, 3.0], [-1.0, 3.6], [-2.5, 4.45]], 0.08, 9),
    S([[3.05, 1.4], [1.2, 1.6], [-0.6, 2.0], [-2.3, 2.45]], 0.07, 10),
    S([[-0.7, 9.1], [-2.3, 8.65], [-3.8, 8.2], [-5.3, 7.4], [-6.2, 6.4]], 0.1, 11),
    S([[-7.3, 7.6], [-6.75, 5.9], [-7.1, 4.3]], 0.08, 12),
    S([[-4.9, 5.6], [-6.35, 4.65], [-7.7, 3.7]], 0.08, 13),
    S([[-3.4, 10.7], [-4.6, 9.7], [-5.9, 9.2]], 0.08, 14),
    S([[-2.9, 6.8], [-3.6, 5.9], [-4.5, 5.75]], 0.06, 15),
    S([[6.3, 10.1], [5.5, 9.0]], 0.05, 16),
    S([[1.4, 11.9], [1.8, 10.7]], 0.05, 17),
    S([[7.9, 7.1], [7.0, 7.6], [6.2, 8.0]], 0.05, 18),
    S([[5.6, 11.0], [4.9, 10.5], [4.2, 10.9]], 0.05, 19),
    S([[6.9, 5.4], [6.1, 5.7], [5.4, 6.2]], 0.05, 20),
    S([[-4.5, 11.2], [-5.4, 10.1], [-6.7, 9.6]], 0.05, 21),
    S([[-1.6, 7.2], [-2.0, 6.4], [-1.7, 5.6]], 0.05, 22),
    S([[1.6, 2.2], [0.4, 2.45], [-0.5, 2.8]], 0.04, 23),
    S([[-5.8, 3.4], [-4.6, 3.0], [-3.4, 3.15]], 0.05, 24),
  ];
  // Folia: arcs concentric with the cerebellum's upper surface, as in a lateral view.
  const folia = Array.from({ length: 8 }, (_, k) => {
    const r = 1.5 + k * 0.32;
    return wobble(Array.from({ length: 41 }, (_, i) => {
      const a = Math.PI * (1.08 + (i / 40) * 0.84);
      return [-4.6 + r * 1.35 * Math.cos(a), 2.7 + r * Math.sin(a)] as P;
    }), 0.05, k);
  });
  return { cerebrum, cerebellum, stem, sulci, folia };
}

function tooth(x0: number, x1: number, kind: 'm' | 'p' | 'c' | 'i', top: number, tip: number): P[] {
  const dir = Math.sign(tip - top);
  const h = Math.abs(tip - top);
  const neck = 0.12 * (x1 - x0);
  const y = (k: number) => top + dir * h * k;
  const base: P[] = [[x0 + neck, y(0)], [x0, y(0.45)]];
  const close: P[] = [[x1, y(0.45)], [x1 - neck, y(0)]];
  const w = x1 - x0;
  const crown: P[] =
    kind === 'm'
      ? [[x0 + 0.04 * w, y(0.9)], [x0 + 0.25 * w, y(1)], [x0 + 0.5 * w, y(0.9)], [x0 + 0.75 * w, y(1)], [x1 - 0.04 * w, y(0.9)]]
      : kind === 'p'
        ? [[x0 + 0.1 * w, y(0.88)], [x0 + 0.5 * w, y(1)], [x1 - 0.1 * w, y(0.88)]]
        : kind === 'c'
          ? [[x0 + 0.15 * w, y(0.85)], [x0 + 0.55 * w, y(1.05)], [x1 - 0.1 * w, y(0.82)]]
          : [[x0 + 0.1 * w, y(0.95)], [x0 + 0.55 * w, y(1)], [x1 - 0.05 * w, y(0.93)]];
  return sample([...base, ...crown, ...close], false, 5);
}

function skull(): string {
  const { outer, inner } = vault();
  const floor = sk(sample(floorCm, false, 10));
  const window: P[] = [...inner, ...floor];
  const b = brain();
  // Section band between the tables, open at both cut ends.
  const band: P[] = [...outer, ...[...inner].reverse()];
  const sinus = sk(sample([[8.55, 3.85], [8.95, 3.9], [9.05, 4.55], [8.85, 5.35], [8.55, 4.9]], true, 6));
  // Zygomatic bone and arch (drawn over the coronoid process, which passes medial to it).
  const arch = sk(runs(
    [[0.75, 0.45], [2.5, 0.2], [4.4, 0.1], [5.9, 0.35], [6.9, 1.0], [7.35, 2.2], [7.6, 3.25]],
    [[7.6, 3.25], [7.95, 3.2], [7.95, 1.95], [8.4, 0.75], [8.85, 0.1]],
    [[8.85, 0.1], [8.3, -0.9], [7.4, -1.55], [6.4, -1.75]],
    [[6.4, -1.75], [5.4, -1.15], [3.6, -0.82], [2.0, -0.55], [1.45, -0.38]],
    [[1.45, -0.38], [1.05, 0.0], [0.75, 0.45]],
  ));
  const orbit = sk(sample([[7.85, 3.35], [8.4, 3.75], [9.0, 3.55], [9.3, 2.75], [9.3, 1.55], [9.0, 0.7], [8.4, 0.35], [7.95, 0.8], [7.85, 2.0]], true, 8));
  const orbitDeep = sk(sample([[8.3, 3.2], [8.85, 3.15], [9.08, 2.3], [8.98, 1.25], [8.6, 0.85], [8.32, 1.6], [8.22, 2.5]], true, 6));
  const mandible = sk(runs(
    [[0.62, -0.75], [1.0, -0.42], [1.5, -0.7], [1.42, -1.25]],
    [[1.42, -1.25], [1.6, -1.75], [2.4, -2.3], [3.2, -1.7], [3.7, -0.95]],
    [[3.7, -0.95], [3.72, -2.3], [3.85, -3.6], [4.2, -4.75], [4.6, -5.25]],
    [[4.6, -5.2], [6.5, -5.3], [8.5, -5.4], [9.9, -5.45], [10.15, -5.5]],
    [[10.15, -5.5], [10.0, -6.15], [9.85, -6.75], [10.05, -7.55], [9.8, -8.3], [9.05, -8.75]],
    [[9.05, -8.75], [7.4, -8.5], [5.2, -8.05], [3.2, -7.5], [2.1, -7.3], [1.25, -7.15], [0.55, -6.65], [0.3, -5.9], [0.35, -4.6], [0.55, -3.0], [0.75, -1.9], [0.66, -1.15], [0.62, -0.75]],
  ));
  const upper: [number, number, 'm' | 'p' | 'c' | 'i'][] = [[4.95, 5.75, 'm'], [5.8, 6.75, 'm'], [6.8, 7.85, 'm'], [7.9, 8.55, 'p'], [8.6, 9.2, 'p'], [9.25, 9.85, 'c'], [9.82, 10.22, 'i'], [10.12, 10.62, 'i']];
  const lowerT: [number, number, 'm' | 'p' | 'c' | 'i'][] = [[4.75, 5.6, 'm'], [5.65, 6.65, 'm'], [6.7, 7.85, 'm'], [7.9, 8.5, 'p'], [8.55, 9.1, 'p'], [9.15, 9.7, 'c'], [9.68, 10.0, 'i'], [9.92, 10.3, 'i']];
  const occ = (x: number) => -4.6 - 0.025 * (x - 7.5) ** 2 * (x < 7.5 ? 1 : 0);
  const teeth = [
    ...lowerT.map(([a, c, k]) => tooth(a, c, k, -5.28 - (a > 9.6 ? 0.08 : 0), k === 'i' ? -4.42 : occ((a + c) / 2) + 0.02)),
    ...upper.map(([a, c, k]) => tooth(a, c, k, -3.8, k === 'i' ? -4.88 : k === 'c' ? -4.72 : occ((a + c) / 2) - 0.02)),
  ].map((t) => poly(sk(t), `fill="#ffffff" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`)).join('');
  const styloid = sk([[-0.55, -1.55], [-0.2, -1.6], [0.45, -3.7]]);
  const D = (l: P[], attrs: string) => line(sk(sample(l, false, 8)), attrs);
  const fine = `stroke="${INK_SOFT}" stroke-width="1.1"`;
  const faint = `stroke="${INK_BACK}" stroke-width="1"`;
  return `<g id="cranial-section">
<defs><clipPath id="cranial-window"><polygon points="${pts(window)}"/></clipPath>
<clipPath id="cerebellum-clip"><polygon points="${pts(sk(b.cerebellum))}"/></clipPath>
<pattern id="diploe" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#ececec"/><circle cx="1.6" cy="1.8" r="0.9" fill="#b4b4b4"/><circle cx="4.5" cy="4.4" r="0.7" fill="#c2c2c2"/></pattern>
<linearGradient id="brain-tone" x2="0" y2="1"><stop stop-color="#efefef"/><stop offset="1" stop-color="#d4d4d4"/></linearGradient></defs>
${poly(styloid, `fill="#f0f0f0" stroke="${INK_SOFT}" stroke-width="1.1"`)}
${cranium()}
<polygon points="${pts(window)}" fill="#dcdcdc"/>
<g clip-path="url(#cranial-window)">
${poly(sk(b.stem), `fill="#d6d6d6" stroke="${INK_SOFT}" stroke-width="1.5"`)}
${D([[-0.1, 0.7], [0.0, 0.0], [-0.35, -0.6]], faint)}
${poly(sk(b.cerebellum), `fill="#d9d9d9" stroke="${INK_SOFT}" stroke-width="1.6"`)}
<g clip-path="url(#cerebellum-clip)">${b.folia.map((l) => line(sk(l), k(l))).join('')}</g>
${poly(sk(b.cerebrum), `fill="url(#brain-tone)" stroke="#4d4d4d" stroke-width="1.8"`)}
${b.sulci.map((l, i) => line(sk(l), `stroke="#6a6a6a" stroke-width="${i === 0 || i === 2 ? 1.6 : 1.25}"`)).join('')}
</g>
${poly(band, `fill="url(#diploe)" stroke="none"`)}
${line(outer, `stroke="${INK}" stroke-width="2.4"`)}${line(inner, `stroke="${INK}" stroke-width="1.5"`)}
${line([outer[0]!, inner[0]!], `stroke="${INK}" stroke-width="1.5"`)}${line([outer[outer.length - 1]!, inner[inner.length - 1]!], `stroke="${INK}" stroke-width="1.5"`)}
${poly(sinus, `fill="#c9c9c9" stroke="${INK_SOFT}" stroke-width="1.1"`)}
${line(floor.slice(0, 1).concat(floor.slice(1)), `stroke="${INK}" stroke-width="1.6"`)}
${D([[-3.6, 1.9], [-2.3, 1.65], [-0.9, 1.35]], `stroke="${INK_SOFT}" stroke-width="1.2" stroke-dasharray="4 3"`)}
<ellipse cx="${f(SK.ox + 0.12 * SK.s)}" cy="${f(SK.oy + 0.05 * SK.s)}" rx="${f(0.42 * SK.s)}" ry="${f(0.5 * SK.s)}" fill="#9d9d9d" stroke="${INK}" stroke-width="1.3"/>
${D([[-3.0, 0.45], [-1.4, 0.62], [0.75, 0.45]], fine)}
${D([[-2.25, -0.4], [-1.6, -1.2], [-1.25, -2.4]], faint)}
${D([[7.3, -1.6], [6.9, -2.5], [6.6, -3.4]], faint)}${D([[9.45, -1.3], [9.55, -2.5], [9.75, -3.55]], faint)}
${D([[9.2, 2.65], [9.55, 1.6], [9.95, 0.45]], fine)}
<circle cx="${f(SK.ox + 9.15 * SK.s)}" cy="${f(SK.oy + 0.45 * SK.s)}" r="1.6" fill="${INK_SOFT}"/>
${poly(sk(sample([[10.15, 0.0], [9.98, -0.6], [10.0, -1.4], [10.4, -1.95], [10.25, -1.0]], true, 5)), `fill="#a3a3a3" stroke="none"`)}
${poly(mandible, `fill="${BONE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`)}
${D([[0.75, -1.15], [1.35, -1.2]], faint)}${D([[3.85, -2.6], [4.6, -4.4], [6.2, -6.6]], faint)}${D([[0.9, -6.2], [1.6, -5.9], [2.4, -5.8]], faint)}
<circle cx="${f(SK.ox + 7.7 * SK.s)}" cy="${f(SK.oy + 7.0 * SK.s)}" r="1.7" fill="${INK_SOFT}"/>
${poly(arch, `fill="${BONE}" stroke="${INK}" stroke-width="1.9" stroke-linejoin="round"`)}
${poly(orbit, `fill="#c4c4c4" stroke="${INK}" stroke-width="1.7"`)}${poly(orbitDeep, `fill="#a6a6a6" stroke="none"`)}
${D([[8.15, 0.15], [8.85, -0.2]], faint)}
${D([[5.0, -3.83], [7.0, -3.9], [9.0, -3.84], [10.45, -3.72]], fine)}
${teeth}
</g>`;
  function k(l: P[]) {
    return `stroke="${INK_SOFT}" stroke-width="${l === b.folia[3] ? 1.5 : 1}"`;
  }
}

/* ---------------------------------------------------------------- 02 spinal section
 * Four thoracic vertebrae cut in the midline (anterior to the page right, cm × 20) and
 * one vertebra seen from above (anterior up, cm × 20). The cord runs inside the
 * vertebral canal: bodies and discs in front, laminae, spinous processes and the
 * ligamenta flava behind, the pedicles of the arch at each side. */
const SP = { s: 20, ox: 118, oy: 492 };
const sp = (l: readonly P[]): P[] => l.map(([x, y]) => [SP.ox + SP.s * x, SP.oy + SP.s * y] as P);
const PITCH = 2.75;
const BODY = 2.2;
function spinalSagittal(): string {
  const parts: string[] = [];
  const n = 4;
  const H = n * PITCH - (PITCH - BODY);
  const ghost: string[] = [];
  const front: string[] = [];
  for (let i = 0; i < n; i++) {
    const y = i * PITCH;
    // Far-side pedicle and the intervertebral foramen below it (behind the cord).
    ghost.push(poly(sp(sample([[1.95, y + 0.25], [1.2, y + 0.3], [0.35, y + 0.35], [0.3, y + 1.15], [1.1, y + 1.05], [1.95, y + 1.05]], true, 4)), `fill="#e2e2e2" stroke="${INK_BACK}" stroke-width="1.1" stroke-dasharray="3 3"`));
    // Vertebral body in section: cortical rim, cancellous interior, slightly concave front.
    const body = sp(runs(
      [[1.95, y + 0.05], [3.4, y], [4.85, y + 0.08]],
      [[4.85, y + 0.08], [4.72, y + 0.7], [4.62, y + 1.1], [4.72, y + 1.5], [4.88, y + BODY - 0.05]],
      [[4.88, y + BODY - 0.05], [3.4, y + BODY + 0.02], [1.95, y + BODY]],
      [[1.95, y + BODY], [1.9, y + 1.1], [1.95, y + 0.05]],
    ));
    front.push(`<g data-section-vertebra="${i + 1}">${poly(body, `fill="url(#spongy)" stroke="${INK}" stroke-width="2"`)}`);
    front.push(line(sp(sample([[2.1, y + 0.2], [3.4, y + 0.16], [4.68, y + 0.24]], false, 4)), `stroke="${INK_SOFT}" stroke-width="1"`));
    front.push(line(sp(sample([[2.1, y + BODY - 0.18], [3.4, y + BODY - 0.14], [4.72, y + BODY - 0.2]], false, 4)), `stroke="${INK_SOFT}" stroke-width="1"`));
    // Lamina and spinous process in section, sloping down and back like roof tiles.
    const arch = sp(runs(
      [[0.3, y + 0.12], [-0.2, y + 0.25], [-0.55, y + 0.5]],
      [[-0.55, y + 0.5], [-1.5, y + 1.5], [-2.4, y + 2.6]],
      [[-2.4, y + 2.6], [-2.75, y + 2.98], [-2.65, y + 3.4], [-2.15, y + 3.42]],
      [[-2.15, y + 3.42], [-1.05, y + 2.4], [-0.2, y + 1.6], [0.3, y + 1.5]],
      [[0.3, y + 1.5], [0.36, y + 0.8], [0.3, y + 0.12]],
    ));
    front.push(poly(arch, `fill="url(#spongy)" stroke="${INK}" stroke-width="2"`) + '</g>');
    if (i < n - 1) {
      const d = y + BODY;
      // Intervertebral disc: annulus with a nucleus pulposus.
      front.push(poly(sp(sample([[1.95, d], [3.4, d + 0.02], [4.88, d - 0.05], [4.98, d + 0.28], [4.88, d + 0.6], [3.4, d + 0.53], [1.95, d + 0.55], [1.88, d + 0.28]], true, 4)), `fill="#e9e9e9" stroke="${INK_SOFT}" stroke-width="1.3"`));
      front.push(`<ellipse cx="${f(SP.ox + 3.35 * SP.s)}" cy="${f(SP.oy + (d + 0.275) * SP.s)}" rx="${f(0.62 * SP.s)}" ry="${f(0.17 * SP.s)}" fill="#d0d0d0" stroke="${INK_BACK}" stroke-width="1"/>`);
      // Ligamentum flavum closes the canal between laminae; interspinous ligament between processes.
      front.push(poly(sp([[0.34, y + 1.5], [0.34, y + PITCH + 0.12], [-0.12, y + PITCH + 0.32], [-0.18, y + 1.56]]), `fill="#d2d2d2" stroke="${INK_SOFT}" stroke-width="1.1"`));
      front.push(poly(sp(sample([[-0.3, y + 1.62], [-1.0, y + 2.4], [-1.75, y + 3.2], [-1.4, y + PITCH + 1.72], [-0.5, y + PITCH + 0.66]], true, 4)), `fill="#e8e8e8" fill-opacity="0.7" stroke="${INK_BACK}" stroke-width="1" stroke-dasharray="3 3"`));
    }
  }
  // Dura and cord, continuous through the stack, cut off above and below with break lines.
  const top = -0.9;
  const bot = H + 0.5;
  const cord = sp(runs(
    [[0.72, top], [0.72, bot]],
    [[0.72, bot], [0.9, bot + 0.1], [1.1, bot - 0.08], [1.25, bot + 0.06], [1.42, bot]],
    [[1.42, bot], [1.42, top]],
    [[1.42, top], [1.25, top + 0.08], [1.1, top - 0.08], [0.9, top + 0.06], [0.72, top]],
  ));
  const dura = (x: number) => line(sp([[x, top + 0.25], [x, bot - 0.2]]), `stroke="${INK_SOFT}" stroke-width="1.1" stroke-dasharray="5 3"`);
  parts.push(`<rect x="${f(SP.ox + 0.36 * SP.s)}" y="${f(SP.oy + (top + 0.25) * SP.s)}" width="${f(1.54 * SP.s)}" height="${f((bot - top - 0.45) * SP.s)}" fill="#f2f2f2" fill-opacity="0.6"/>`);
  parts.push(`<g data-ghost="pedicles">${ghost.join('')}</g>`);
  parts.push(dura(0.5), dura(1.72));
  parts.push(poly(cord, `fill="#bdbdbd" stroke="${INK}" stroke-width="1.7"`));
  parts.push(line(sp([[1.07, top + 0.2], [1.07, bot - 0.2]]), `stroke="#8a8a8a" stroke-width="1" stroke-dasharray="2 4"`));
  parts.push(...front);
  return `<g id="vertebral-canal">${parts.join('')}</g>`;
}

const AX = { s: 20, ox: 150, oy: 793 };
const ax = (l: readonly P[]): P[] => l.map(([x, y]) => [AX.ox + AX.s * x, AX.oy + AX.s * y] as P);
function spinalAxial(): string {
  // Right half outline (x ≥ 0), mirrored: body, pedicle, transverse process, lamina, spinous process.
  const half: P[] = [[0, -3.55], [0.9, -3.45], [1.45, -2.95], [1.55, -2.1], [1.3, -1.25], [1.05, -0.95], [1.05, -0.35], [1.4, -0.3], [2.5, 0.05], [3.15, 0.25], [3.25, 0.65], [2.9, 0.9], [1.9, 0.9], [1.05, 1.1], [0.55, 1.45], [0.32, 2.2], [0.24, 3.1], [0.12, 3.6], [0, 3.65]];
  const right = sample(half, false, 6);
  const outline = [...right, ...[...right].reverse().slice(1, -1).map(([x, y]) => [-x, y] as P)];
  const canal = sample([[0, -0.82], [0.72, -0.6], [0.92, 0.1], [0.7, 0.72], [0, 0.95], [-0.7, 0.72], [-0.92, 0.1], [-0.72, -0.6]], true, 6);
  const cord = sample([[0, -0.38], [0.48, -0.28], [0.56, 0.08], [0.42, 0.42], [0, 0.5], [-0.42, 0.42], [-0.56, 0.08], [-0.48, -0.28]], true, 6);
  const grey = sample([[0.06, -0.08], [0.28, -0.3], [0.34, -0.22], [0.16, 0.0], [0.34, 0.32], [0.26, 0.38], [0.06, 0.12], [-0.06, 0.12], [-0.26, 0.38], [-0.34, 0.32], [-0.16, 0.0], [-0.34, -0.22], [-0.28, -0.3], [-0.06, -0.08]], true, 3);
  const bodyRim = sample([[0, -3.3], [0.8, -3.2], [1.25, -2.75], [1.3, -2.0], [1.05, -1.4], [0, -1.18], [-1.05, -1.4], [-1.3, -2.0], [-1.25, -2.75], [-0.8, -3.2]], true, 6);
  return `<g id="vertebra-from-above" data-axial-vertebra="1">
${poly(ax(outline), `fill="${BONE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"`)}
${poly(ax(bodyRim), `fill="url(#spongy)" stroke="${INK_BACK}" stroke-width="1"`)}
${poly(ax(canal), `fill="#e2e2e2" stroke="${INK}" stroke-width="1.7"`)}
<circle cx="${AX.ox}" cy="${f(AX.oy + 0.07 * AX.s)}" r="${f(0.7 * AX.s)}" fill="none" stroke="${INK_SOFT}" stroke-width="1" stroke-dasharray="3 2"/>
${poly(ax(cord), `fill="#bdbdbd" stroke="${INK}" stroke-width="1.5"`)}${poly(ax(grey), `fill="#8f8f8f" stroke="none"`)}
${[1, -1].map((m) => `<ellipse cx="${f(AX.ox + m * 1.0 * AX.s)}" cy="${f(AX.oy + 0.2 * AX.s)}" rx="${f(0.32 * AX.s)}" ry="${f(0.22 * AX.s)}" fill="#e6e6e6" stroke="${INK_SOFT}" stroke-width="1"/>`).join('')}
</g>`;
}

const TH = { x: 452, y: 84, size: [620, 740] as P };
export function svg(t = thorax()) {
  const drawing = thoraxSvg(t, TH.size)
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    // In an anterior view the thoracic spine lies behind the sternum, heart and lungs:
    // every vertebra is ghosted, so none reads as standing in front of the manubrium.
    .replace('<g id="spine">', '<g id="spine" opacity="0.32">');
  const numbers = t.ribs
    .filter((r) => r.side === 'left')
    .map((r) => {
      const p = r.bone[r.frontFrom]!; // same fitted transform as thoraxSvg
      return `<text x="${p[0] + (r.number === 12 ? 44 : 24)}" y="${p[1] + (r.number === 12 ? 12 : 5)}" font-size="24" fill="#555" font-family="Arial">${r.number}</text>`;
    })
    .join('');
  // The thorax inner transform is reused for numbers: fit bounds are fixed by the audited geometry.
  const inner = drawing.match(/<g transform="([^"]+)"/)![1]!;
  const [tx, ty, k] = inner.match(/-?[\d.]+/g)!.map(Number) as [number, number, number];
  const at = (p: P): string => `${f(TH.x + tx + k * p[0])},${f(TH.y + ty + k * p[1])}`;
  const mid = (l: readonly P[]): P => l[Math.floor(l.length / 2)]!;
  const centroid = (l: readonly P[]): P => [l.reduce((a, p) => a + p[0], 0) / l.length, l.reduce((a, p) => a + p[1], 0) / l.length];
  const vert = (id: string) => t.vertebrae.find((v) => v.id === id)!.centre;
  const rib8 = t.ribs.find((r) => r.side === 'left' && r.number === 8)!;
  const lungL = centroid(t.lungs.left);
  const heart = centroid(t.heart);
  const sternum = centroid(t.sternum);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<defs><pattern id="spongy" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#f4f4f4"/><path d="M0,3 Q2.5,1 4.5,3.2 T9,3 M2,9 Q3,6 6,6.5 T8.5,9 M4.5,3.2 L5.5,6.3" fill="none" stroke="#b9b9b9" stroke-width="0.9"/></pattern></defs>
${label(44, 42, '01  CRANIAL SECTION', '颅骨剖面')}${skull()}
${label(345, 168, 'Brain', '脑')}${leader('M338,158 L300,158 L236,140')}
${label(45, 309, 'Skull', '颅骨')}${leader('M58,280 L58,206 L86,190')}
${label(44, 428, '02  SPINAL SECTION', '脊柱局部剖面')}${spinalSagittal()}${spinalAxial()}
${label(265, 486, 'Spinal cord', '脊髓')}${leader('M258,476 L144,476')}
${label(265, 795, 'Vertebrae', '椎骨')}${leader('M258,785 L236,785 L222,700')}
<text x="205" y="868" font-family="Arial, PingFang SC, sans-serif" font-size="20" fill="#555">from above · 俯视</text>
${label(506, 42, '03  THORAX · ANTERIOR VIEW', '胸廓正面观')}
<g transform="translate(${TH.x} ${TH.y})">${drawing}<g transform="${inner}">${numbers}</g></g>
${label(506, 846, '1–7 True · 8–10 False · 11–12 Floating', '1–7 真肋 · 8–10 假肋 · 11–12 浮肋', 26)}
${label(486, 200, 'Sternum', '胸骨', 28)}${leader(`M486,212 L610,212 L${at([sternum[0], sternum[1] - 60])}`)}
${stack(1060, 128, ['Thoracic', 'spine', '胸椎'])}${leader(`M1054,146 L1000,146 L${at(vert('T1'))}`)}
${label(1060, 262, 'Lungs', '肺', 28)}${leader(`M1054,252 L1036,252 L${at([lungL[0] + 40, lungL[1] - 60])}`)}
${label(1060, 432, 'Heart', '心脏', 28)}${leader(`M1054,422 L1036,422 L${at(heart)}`)}
${stack(1060, 600, ['Costal', 'cartilage', '肋软骨'])}${leader(`M1054,618 L1040,618 L${at(mid(rib8.cartilage))}`)}
</svg>`;
}

async function main() {
  const s = svg();
  const previews = 'scripts/geo/bones-and-joints/previews/polish-2026-11-03';
  mkdirSync('public/illustrations/bones-and-joints', { recursive: true });
  mkdirSync(previews, { recursive: true });
  writeFileSync(`${previews}/protected-organs.svg`, s);
  const bytes = await sharp(Buffer.from(s)).greyscale().ensureAlpha().webp({ nearLossless: true, quality: 35, effort: 6 }).toBuffer();
  if (bytes.length > BUDGET) throw Error(`Figure exceeds budget: ${bytes.length}`);
  writeFileSync(OUTPUT, bytes);
  console.log(JSON.stringify({ output: OUTPUT, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }));
  await sharp(Buffer.from(s)).flatten({ background: '#e9e4d8' }).png().toFile(`${previews}/protected-organs-paper.png`);
  const inverted = await sharp(Buffer.from(s)).negate({ alpha: false }).png().toBuffer();
  await sharp(inverted).flatten({ background: '#1f2124' }).png().toFile(`${previews}/protected-organs-cinema.png`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
