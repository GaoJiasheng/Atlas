/** Analytic heat results at an explicit elapsed time; no integration or wall clock. */
import type { HeatData, NumericSource } from '../../heat-schema';
import type { SimOutput, SimValues } from '../../sim-schema';

const owns = (record: object, id: string): boolean => Object.prototype.hasOwnProperty.call(record, id);
export const HEAT_DIRECTIONS = ['warming', 'steady', 'cooling'] as const;
export const HEAT_COMPARISONS = ['first-warmer', 'same', 'second-warmer'] as const;
export function numericHeatSource(source: NumericSource, values: SimValues): number {
  if (typeof source === 'number') return source;
  return 'values' in source ? (owns(source.values, String(values[source.control])) ? source.values[String(values[source.control])]! : NaN) : typeof values[source.control] === 'number' ? values[source.control] as number : NaN;
}
export function solveHeatAt(h: HeatData, values: SimValues, seconds: number): Record<string, number | string> {
  const q: Record<string, number | string> = {};
  for (const [id, lump] of Object.entries(h.lumps)) {
    const t0 = numericHeatSource(lump.initial, values);
    const c = typeof lump.capacity === 'number' ? lump.capacity : numericHeatSource(lump.capacity.mass, values) * lump.capacity.specific;
    const p = numericHeatSource(lump.power, values);
    const u = lump.reservoir ? numericHeatSource(lump.reservoir.conductance, values) : 0;
    const ta = lump.reservoir ? numericHeatSource(lump.reservoir.temperature, values) : t0;
    // expm1 retains small temperature changes and avoids cancellation for tiny time steps.
    const change = u === 0 ? p * seconds / c : (p / u + ta - t0) * -Math.expm1(-u * seconds / c);
    const temperature = t0 + change;
    const rate = p - u * (temperature - ta);
    const energy = c * change;
    q[`temperature:${id}`] = temperature;
    q[`change:${id}`] = change;
    q[`rate:${id}`] = rate;
    q[`energy:${id}`] = energy;
    q[`supplied:${id}`] = p * seconds;
    q[`reservoir-energy:${id}`] = p * seconds - energy;
    q[`direction:${id}`] = rate > 1e-9 ? 'warming' : rate < -1e-9 ? 'cooling' : 'steady';
  }
  for (const [id, e] of Object.entries(h.expansions)) {
    const delta = e.length * e.alpha * (numericHeatSource(e.temperature, values) - e.reference);
    q[`delta-mm:${id}`] = delta * 1000;
    q[`length-mm:${id}`] = (e.length + delta) * 1000;
  }
  for (const [id, pair] of Object.entries(h.compare)) {
    const difference = Number(q[`temperature:${pair.first}`]) - Number(q[`temperature:${pair.second}`]);
    q[`compare:${id}`] = difference > pair.epsilon ? 'first-warmer' : difference < -pair.epsilon ? 'second-warmer' : 'same';
  }
  return q;
}
export const solveHeat = (h: HeatData, values: SimValues): Record<string, number | string> => solveHeatAt(h, values, Number(values[h.time]));
const UNITS: Readonly<Record<string, string>> = { temperature: '°C', change: 'K', rate: 'W', energy: 'J', supplied: 'J', 'reservoir-energy': 'J', 'delta-mm': 'mm', 'length-mm': 'mm' };
export const heatUnit = (from: string): string | undefined => UNITS[from.split(':')[0]!];
export const heatStates = (from: string): readonly string[] | undefined => from.startsWith('direction:') ? HEAT_DIRECTIONS : from.startsWith('compare:') ? HEAT_COMPARISONS : undefined;
/** Exact catalogue lookup: unknown names never acquire a default number output. */
export function heatQuantity(h: HeatData, from: string): SimOutput['kind'] | null {
  const [prefix, id, extra] = from.split(':');
  if (!id || extra !== undefined) return null;
  if (prefix === 'compare') return owns(h.compare, id) ? 'state' : null;
  if (prefix === 'delta-mm' || prefix === 'length-mm') return owns(h.expansions, id) ? 'number' : null;
  if (!owns(h.lumps, id)) return null;
  return prefix === 'direction' ? 'state' : prefix && ['temperature', 'change', 'rate', 'energy', 'supplied', 'reservoir-energy'].includes(prefix) ? 'number' : null;
}
