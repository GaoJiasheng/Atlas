/** Heat v1: independent uniform-temperature bodies, a maintained reservoir and linear solid expansion. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { SimControl, SimValues } from './sim-schema';
import { numericHeatSource, solveHeatAt } from './lib/sim/heat';

export const numericSourceSchema = z.union([
  z.number().finite(),
  z.object({ control: kebabId }).strict(),
  z.object({ control: kebabId, values: z.record(kebabId, z.number().finite()) }).strict(),
]);
export type NumericSource = z.output<typeof numericSourceSchema>;
const lumpSchema = z.object({
  initial: numericSourceSchema,
  capacity: z.union([z.number().finite().positive(), z.object({ mass: numericSourceSchema, specific: z.number().finite().positive() }).strict()]),
  power: numericSourceSchema.default(0),
  reservoir: z.object({ temperature: numericSourceSchema, conductance: numericSourceSchema }).strict().optional(),
}).strict();
export const heatSchema = z.object({
  time: kebabId,
  lumps: z.record(kebabId, lumpSchema).refine((v) => Object.keys(v).length >= 1 && Object.keys(v).length <= 6, 'give 1–6 lumps'),
  expansions: z.record(kebabId, z.object({ temperature: numericSourceSchema, reference: z.number().finite().min(0).max(95), length: z.number().finite().positive(), alpha: z.number().finite().nonnegative() }).strict()).default({}).refine((v) => Object.keys(v).length <= 4, 'at most 4 expansions'),
  compare: z.record(kebabId, z.object({ first: kebabId, second: kebabId, epsilon: z.number().finite().nonnegative() }).strict()).default({}).refine((v) => Object.keys(v).length <= 4, 'at most 4 comparisons'),
}).strict();
export type HeatData = z.output<typeof heatSchema>;
export interface HeatIssue { path: (string | number)[]; message: string }

/** Validate every reachable input of each independent experiment, without unrelated control combinations. */
export function heatIssues(h: HeatData, controls: ReadonlyMap<string, SimControl>): HeatIssue[] {
  const out: HeatIssue[] = [];
  const issue = (path: HeatIssue['path'], message: string) => out.push({ path, message });
  const owns = (record: object, id: string): boolean => Object.prototype.hasOwnProperty.call(record, id);
  const time = controls.get(h.time);
  if (!time || time.kind !== 'step') issue(['time'], 'time must name a step control');
  else {
    if (time.unit !== 's' || time.format !== undefined) issue(['time'], 'elapsed time needs unit s and no time format');
    if (time.values[0] !== 0 || time.values.some((v, i) => !Number.isFinite(v) || v < 0 || v > 600 || (i > 0 && v <= time.values[i - 1]!))) issue(['time'], 'elapsed time must ascend from 0 within 0–600 s');
  }
  const ids = new Set<string>();
  for (const [section, entries] of [['lumps', h.lumps], ['expansions', h.expansions], ['compare', h.compare]] as const) for (const id of Object.keys(entries)) {
    if (ids.has(id)) issue([section, id], `duplicate heat object id "${id}"`);
    ids.add(id);
  }
  const source = (s: NumericSource, path: HeatIssue['path'], valid: (n: number) => boolean, rule: string, unit: string): string[] => {
    if (typeof s === 'number') { if (!valid(s)) issue(path, rule); return []; }
    const c = controls.get(s.control);
    if (!c) { issue(path, `unknown control "${s.control}"`); return []; }
    if (s.control === h.time) issue(path, 'elapsed time cannot also drive an experiment parameter');
    if ('values' in s) {
      if (c.kind !== 'choice') issue(path, `"${c.id}" must be a choice control for a numeric mapping`);
      else {
        for (const opt of c.options) if (!owns(s.values, opt.id)) issue(path, `missing numeric mapping for "${opt.id}"`);
        for (const id of Object.keys(s.values)) if (!c.options.some((o) => o.id === id)) issue([...path, 'values', id], `"${id}" is not an option of "${c.id}"`);
      }
      for (const v of Object.values(s.values)) if (!valid(v)) { issue(path, rule); break; }
    } else if (c.kind !== 'step') issue(path, `"${c.id}" must be a step control without a numeric mapping`);
    else {
      if (c.unit !== unit || c.format !== undefined) issue(path, `"${c.id}" needs unit ${unit} and no clock time format`);
      if (c.values.some((v) => !Number.isFinite(v) || !valid(v))) issue(path, rule);
    }
    return [c.id];
  };
  const domain = (n: number) => Number.isFinite(n) && n >= 0 && n <= 95;
  const positive = (n: number) => Number.isFinite(n) && n > 0;
  const nonnegative = (n: number) => Number.isFinite(n) && n >= 0;
  const defaults: SimValues = Object.fromEntries([...controls.values()].map((c) => [c.id, c.default]));
  for (const [id, l] of Object.entries(h.lumps)) {
    const p = ['lumps', id];
    const before = out.length;
    const reads = [
      ...source(l.initial, [...p, 'initial'], domain, 'temperature must stay within 0–95 °C', '°C'),
      ...source(l.power, [...p, 'power'], nonnegative, 'power must be finite and nonnegative', 'W'),
      ...(typeof l.capacity === 'number' ? [] : source(l.capacity.mass, [...p, 'capacity', 'mass'], positive, 'mass and capacity must be positive', 'g')),
      ...(l.reservoir ? [
        ...source(l.reservoir.temperature, [...p, 'reservoir', 'temperature'], domain, 'temperature must stay within 0–95 °C', '°C'),
        ...source(l.reservoir.conductance, [...p, 'reservoir', 'conductance'], positive, 'reservoir conductance must be positive', 'W/K'),
      ] : []),
    ];
    if (out.length !== before || !time || time.kind !== 'step') continue;
    const distinct = [...new Set(reads)];
    let bad = false;
    const visit = (i: number, values: SimValues) => {
      if (bad) return;
      if (i === distinct.length) {
        const capacity = typeof l.capacity === 'number' ? l.capacity : numericHeatSource(l.capacity.mass, values) * l.capacity.specific;
        // Each trajectory is monotone, so its two endpoints bound the entire curve.
        for (const t of [0, time.values[time.values.length - 1]!]) {
          const q = solveHeatAt({ ...h, lumps: { [id]: l }, expansions: {}, compare: {} }, values, t);
          if (!positive(capacity) || !domain(q[`temperature:${id}`] as number) || Object.values(q).some((v) => typeof v === 'number' && !Number.isFinite(v))) {
            issue(p, 'all allowed control combinations must give finite results within 0–95 °C (no clipping or phase-change plateau)'); bad = true; break;
          }
        }
        return;
      }
      const c = controls.get(distinct[i]!)!;
      const vs = c.kind === 'step' ? c.values : c.kind === 'choice' ? c.options.map((o) => o.id) : [false, true];
      for (const v of vs) visit(i + 1, { ...values, [c.id]: v });
    };
    visit(0, defaults);
  }
  for (const [id, e] of Object.entries(h.expansions)) {
    source(e.temperature, ['expansions', id, 'temperature'], domain, 'temperature must stay within 0–95 °C', '°C');
    // Ensure even extreme but finite coefficients cannot overflow derived lengths.
    const maxDelta = Math.max(e.reference, 95 - e.reference) * e.length * e.alpha * 1000;
    if (!Number.isFinite(maxDelta) || !Number.isFinite(e.length * 1000 + maxDelta)) issue(['expansions', id], 'expansion must produce finite lengths throughout 0–95 °C');
  }
  for (const [id, pair] of Object.entries(h.compare)) {
    if (!owns(h.lumps, pair.first)) issue(['compare', id, 'first'], `unknown lump "${pair.first}"`);
    if (!owns(h.lumps, pair.second)) issue(['compare', id, 'second'], `unknown lump "${pair.second}"`);
    if (pair.first === pair.second) issue(['compare', id], 'compare needs two different lumps');
  }
  return out;
}
