import type { MagnetData, SimValues } from '../../sim-schema';
import type { Vec3 } from '../math';
import type { MagnetFrames } from './frame';
import { fieldStateOf, fieldMagnets, magnetPoles, pull, magnetCharges, earthField, fieldAt, bearingOf, magnetNumber as num } from './magnet';
import { CLIP_QUANTITIES } from './magnet';
export { ringPoint } from './magnet';
/** Read the constant after module initialization; avoids the magnet facade cycle. */
export function clipQuantities() { return CLIP_QUANTITIES; }
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
