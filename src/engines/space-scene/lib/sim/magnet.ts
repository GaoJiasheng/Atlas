/**
 * Magnet model (docs/22 §4.2; pure, unit-tested): magnets as Gilbert charge
 * pairs (north +q, south −q at the pole points, q = moment ÷ pole distance;
 * an electromagnet's moment × cells while on, × its residual while off), the
 * push or pull between the first two, the compass bearing in their field plus
 * Earth's, which field state is on show, and the illustrative paper-clip
 * counts. Field lines and iron filings of a state: lib/sim/field.ts. A
 * magnet with a `part` is where that part is now (`frames`,
 * lib/sim/carrier.ts): its poles are moved and turned along with the part,
 * after the model's own `move` / `flip`.
 *
 * Quantities: `force` (pull positive, push negative, % of the pull at the
 * `reference` setting; NaN, shown `—`, while the field state on show leaves
 * either of the first two magnets off the bench), `facing` (`opposite`
 * poles facing or the `same`),
 * `needle-bearing` (degrees 0–360, clockwise from model north seen from
 * above), `field-state`, `clips-cards`, `clips-stroke`, `clips-em`
 * (`clips`, the observed one of these, comes from lib/sim/index.ts).
 */
import type { MagnetData, SimValues } from '../../sim-schema';
import type { Vec3 } from '../math';
import { applyFrame, type Frame, type MagnetFrames } from './frame';

interface Pole {
  at: Vec3;
  q: number;
}

type Magnet = MagnetData['magnets'][number];
type Ring = NonNullable<MagnetData['rings']>[string];

/** Most field lines one field state draws (a flow's paths: lib/flow-curve MAX_FLOW_PATHS). */
export const MAX_FIELD_LINES = 16;
/** Clip counts the `clips` reading picks from (the one the chapter's card observes). */
export const CLIP_QUANTITIES = ['clips-cards', 'clips-stroke', 'clips-em'] as const;

/** μ0 / 4π (T·m / A): B = μ0/4π · q / r² for a pole of strength q (A·m). */
export const MU0_4PI = 1e-7;
/** Moment of a magnet without `moment` (A·m²: a school bar magnet). */
export const DEFAULT_MOMENT = 1;
/** Model north without `earth` (−Z: into the bench, docs/22 §3.2). */
const NORTH: Vec3 = [0, 0, -1];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const num = (values: SimValues, id: string | undefined, fallback: number) =>
  id !== undefined && typeof values[id] === 'number' ? (values[id] as number) : fallback;

/** A magnet's two poles with these control values (moved along its axis, turned round, then where its part's `frame` puts them), unit charges. */
export function magnetPoles(m: Magnet, values: SimValues, frame?: Frame): Pole[] {
  const move = m.move;
  const d = move ? ((typeof values[move.control] === 'number' ? (values[move.control] as number) : move.origin) - move.origin) * move.per : 0;
  const n = len(move?.axis ?? [1, 0, 0]) || 1;
  const shift: Vec3 = move ? [(move.axis[0] / n) * d, (move.axis[1] / n) * d, (move.axis[2] / n) * d] : [0, 0, 0];
  const turned = m.flip !== undefined && m.flip.when.includes(String(values[m.flip.control]));
  const at = (p: Vec3): Vec3 => {
    const q: Vec3 = [p[0] + shift[0], p[1] + shift[1], p[2] + shift[2]];
    return frame ? applyFrame(frame, q) : q;
  };
  return [
    { at: at(turned ? m.south : m.north), q: 1 },
    { at: at(turned ? m.north : m.south), q: -1 },
  ];
}

/** Moment now (A·m²): `moment`, × cells while an electromagnet's switch is on, × `residual` while off. */
export function magnetMoment(m: Magnet, values: SimValues): number {
  const base = m.moment ?? DEFAULT_MOMENT;
  if (!m.power) return base;
  if (values[m.power.switch] === true) return base * Math.max(0, num(values, m.power.cells, 1));
  return base * m.power.residual;
}

/** A magnet's poles with their strengths (A·m): ± moment ÷ pole distance. */
export function magnetCharges(m: Magnet, values: SimValues, frame?: Frame): Pole[] {
  const d = len(sub(m.north, m.south)) || 1;
  const q = magnetMoment(m, values) / d;
  return magnetPoles(m, values, frame).map((p) => ({ at: p.at, q: p.q * q }));
}

/** B (tesla) at `p` from these poles. */
export function fieldAt(poles: readonly Pole[], p: readonly number[]): Vec3 {
  const b: Vec3 = [0, 0, 0];
  for (const c of poles) {
    const r: Vec3 = [p[0]! - c.at[0], p[1]! - c.at[1], p[2]! - c.at[2]];
    const d = len(r);
    if (d < 1e-6) continue;
    const k = (MU0_4PI * c.q) / (d * d * d);
    b[0] += k * r[0];
    b[1] += k * r[1];
    b[2] += k * r[2];
  }
  return b;
}

/** Force on B from A along A → B (positive = pulled toward A), arbitrary units. */
export function pull(a: readonly Pole[], b: readonly Pole[]): number {
  const ca = a.reduce<Vec3>((s, p) => [s[0] + p.at[0] / a.length, s[1] + p.at[1] / a.length, s[2] + p.at[2] / a.length], [0, 0, 0]);
  const cb = b.reduce<Vec3>((s, p) => [s[0] + p.at[0] / b.length, s[1] + p.at[1] / b.length, s[2] + p.at[2] / b.length], [0, 0, 0]);
  const axis = sub(cb, ca);
  const n = len(axis) || 1;
  let f = 0;
  for (const p of a)
    for (const q of b) {
      const r = sub(q.at, p.at);
      const d = len(r);
      if (d < 1e-9) continue;
      // Like charges push B away from A (along +r).
      const k = (p.q * q.q) / (d * d * d);
      f += k * ((r[0] * axis[0] + r[1] * axis[1] + r[2] * axis[2]) / n);
    }
  return -f;
}

/** Position `k` (1-based) of a ring: bearing `start` + (k − 1) × 360 ÷ count, clockwise from model north seen from above. */
export function ringPoint(ring: Ring, k: number): Vec3 {
  const b = ((ring.start + ((k - 1) * 360) / ring.count) * Math.PI) / 180;
  return [ring.center[0] + ring.radius * Math.sin(b), ring.center[1], ring.center[2] - ring.radius * Math.cos(b)];
}

/** The field state on show: the first whose `when` holds ('' without `fields`). */
export function fieldStateOf(m: MagnetData, values: SimValues): string {
  for (const [name, f] of Object.entries(m.fields ?? {})) if (Object.entries(f.when ?? {}).every(([id, v]) => values[id] === v)) return name;
  return '';
}

/** The magnets of a field state (all of them without `fields` or `magnets`). */
export function fieldMagnets(m: MagnetData, state: string): Magnet[] {
  const ids = m.fields?.[state]?.magnets;
  return ids ? m.magnets.filter((g) => ids.includes(g.id)) : m.magnets;
}

/** Earth's field (tesla) and the horizontal unit vector of model north. */
export function earthField(m: MagnetData): { b: Vec3; north: Vec3 } {
  const n = m.earth?.north ?? NORTH;
  const h = Math.hypot(n[0], n[2]) || 1;
  const north: Vec3 = [n[0] / h, 0, n[2] / h];
  const t = (m.earth?.uT ?? 0) * 1e-6;
  return { b: [north[0] * t, 0, north[2] * t], north };
}

/** Bearing (degrees 0–360, clockwise from model north seen from above) of a field's horizontal part. */
export function bearingOf(b: Vec3, north: Vec3): number {
  // East is north turned 90° clockwise seen from above (+Y up): (−n.z, 0, n.x).
  const east: Vec3 = [-north[2], 0, north[0]];
  const deg = (Math.atan2(b[0] * east[0] + b[2] * east[2], b[0] * north[0] + b[2] * north[2]) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

/**
 * Every magnet quantity for these control values; `compass`: where the needle
 * is (null: no needle reading); `frames`: where the magnets' parts are now
 * (the push / pull between them there, of the pull at `reference` on the rest
 * bench).
 */
export function solveMagnets(m: MagnetData, values: SimValues, compass: Vec3 | null = null, frames?: MagnetFrames): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  const [a, b] = m.magnets;
  const state = fieldStateOf(m, values);
  const onBench = new Set(fieldMagnets(m, state).map((g) => g.id));
  if (a && b) {
    const now = pull(magnetPoles(a, values, frames?.get(a.id)), magnetPoles(b, values, frames?.get(b.id)));
    const refValues: SimValues = { ...values };
    if (a.move) refValues[a.move.control] = m.reference;
    if (b.move) refValues[b.move.control] = m.reference;
    if (a.flip) refValues[a.flip.control] = '';
    if (b.flip) refValues[b.flip.control] = '';
    const ref = Math.abs(pull(magnetPoles(a, refValues), magnetPoles(b, refValues)));
    out.force = !onBench.has(a.id) || !onBench.has(b.id) ? NaN : ref > 0 ? (now / ref) * 100 : 0;
    out.facing = now >= 0 ? 'opposite' : 'same';
  } else {
    out.force = 0;
    out.facing = 'opposite';
  }
  out['field-state'] = state;
  if (compass) {
    const poles = fieldMagnets(m, state).flatMap((g) => magnetCharges(g, values, frames?.get(g.id)));
    const earth = earthField(m);
    const f = fieldAt(poles, compass);
    out['needle-bearing'] = bearingOf([f[0] + earth.b[0], f[1], f[2] + earth.b[2]], earth.north);
  } else out['needle-bearing'] = 0;
  const c = m.clips;
  const gap = 2 * num(values, c?.cards, 0);
  out['clips-cards'] = Math.floor(10 * (5 / (5 + gap)) ** 2);
  out['clips-stroke'] = Math.min(6, Math.floor(num(values, c?.strokes, 0) / 5));
  out['clips-em'] = c?.switch !== undefined && values[c.switch] === true ? 3 * Math.max(1, num(values, c?.cells, 0)) : 1;
  return out;
}
