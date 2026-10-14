/**
 * Magnet model (docs/22 §4.2; pure, unit-tested). A first, small version for
 * the magnets topic: bar magnets as Gilbert charge pairs (north +1, south −1
 * at the pole points), the push or pull between the first two, and the
 * illustrative paper-clip counts. Field lines and the compass come with the
 * magnets topic (docs/22 §4.4 M1, M4).
 *
 * Quantities: `force` (pull positive, push negative, % of the pull at the
 * `reference` setting), `facing` (`opposite` poles facing or the `same`),
 * `clips-cards`, `clips-stroke`, `clips-em`.
 */
import type { MagnetData, SimValues } from '../../sim-schema';
import type { Vec3 } from '../math';

interface Pole {
  at: Vec3;
  q: number;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);

/** A magnet's two poles with these control values (moved along its axis, turned round). */
export function magnetPoles(m: MagnetData['magnets'][number], values: SimValues): Pole[] {
  const move = m.move;
  const d = move ? ((typeof values[move.control] === 'number' ? (values[move.control] as number) : move.origin) - move.origin) * move.per : 0;
  const n = len(move?.axis ?? [1, 0, 0]) || 1;
  const shift: Vec3 = move ? [(move.axis[0] / n) * d, (move.axis[1] / n) * d, (move.axis[2] / n) * d] : [0, 0, 0];
  const turned = m.flip !== undefined && m.flip.when.includes(String(values[m.flip.control]));
  const at = (p: Vec3): Vec3 => [p[0] + shift[0], p[1] + shift[1], p[2] + shift[2]];
  return [
    { at: at(turned ? m.south : m.north), q: 1 },
    { at: at(turned ? m.north : m.south), q: -1 },
  ];
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

const count = (values: SimValues, id: string | undefined) => (id !== undefined && typeof values[id] === 'number' ? (values[id] as number) : 0);

/** Every magnet quantity for these control values. */
export function solveMagnets(m: MagnetData, values: SimValues): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  const [a, b] = m.magnets;
  if (a && b) {
    const now = pull(magnetPoles(a, values), magnetPoles(b, values));
    const refValues: SimValues = { ...values };
    if (a.move) refValues[a.move.control] = m.reference;
    if (b.move) refValues[b.move.control] = m.reference;
    if (a.flip) refValues[a.flip.control] = '';
    if (b.flip) refValues[b.flip.control] = '';
    const ref = Math.abs(pull(magnetPoles(a, refValues), magnetPoles(b, refValues)));
    out.force = ref > 0 ? (now / ref) * 100 : 0;
    out.facing = now >= 0 ? 'opposite' : 'same';
  } else {
    out.force = 0;
    out.facing = 'opposite';
  }
  const c = m.clips;
  const gap = 2 * count(values, c?.cards);
  out['clips-cards'] = Math.floor(10 * (5 / (5 + gap)) ** 2);
  out['clips-stroke'] = Math.min(6, Math.floor(count(values, c?.strokes) / 5));
  out['clips-em'] = c?.switch !== undefined && values[c.switch] === true ? 3 * Math.max(1, count(values, c?.cells)) : 1;
  return out;
}
