/** The deliberately schematic port model (docs/62 §4); all distances are metres. */
import { z } from 'zod';
import { sourceId } from '../../content/schema/sources';
import { kebabId } from '../../content/schema/common';
import type { SimControl } from './sim-schema';
import type { MatterPart } from './matter-schema';
import { modelBounds } from './lib/parts';

const finite = z.number().finite();
const positive = finite.positive();
const xyz = z.tuple([finite, finite, finite]);
export const portSchema = z.object({
  count: z.object({ n20: kebabId, n40: kebabId }).strict(),
  lift: z.object({
    enabled: kebabId, workingPart: kebabId, spreaderPart: kebabId, trolleyPart: kebabId,
    source: xyz, destination: xyz, boxHeight: positive, spreaderDepth: positive,
    clearBottomY: finite,
    knots: z.object({ lock: positive, raised: positive, crossed: positive, landed: positive, released: positive, finished: positive }).strict(),
    slow: finite.min(1),
  }).strict(),
  yard: z.object({ above: kebabId, state: kebabId, target: kebabId, blockers: z.tuple([kebabId, kebabId]), pitch: positive, park: z.tuple([xyz, xyz]), retrieved: xyz }).strict(),
  capacity: z.object({ cranes: kebabId, carriers: kebabId, yards: kebabId, arrivals: kebabId, hours: kebabId, rate: z.object({ crane: finite.nonnegative(), carrier: finite.nonnegative(), yard: finite.nonnegative() }).strict() }).strict(),
  source: z.array(sourceId).min(1),
}).strict();
export type PortData = z.output<typeof portSchema>;
export type PortIssue = { path: (string | number)[]; message: string };

export function portIssues(p: PortData, controls: ReadonlyMap<string, SimControl>, parts: readonly MatterPart[]): PortIssue[] {
  const out: PortIssue[] = [];
  const issue = (path: PortIssue['path'], message: string) => out.push({ path, message });
  const control = (path: string[], id: string, kind: SimControl['kind']) => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" must be a ${kind} control`);
    return c?.kind === kind ? c : undefined;
  };
  const step = (path: string[], id: string, legal: (n: number) => boolean, message: string) => {
    const c = control(path, id, 'step');
    if (c?.kind === 'step' && c.values.some((n) => !Number.isFinite(n) || !legal(n))) issue(path, message);
  };
  for (const name of ['n20', 'n40'] as const) step(['count', name], p.count[name], (n) => Number.isInteger(n) && n >= 0 && n <= 4, 'box counts must be nonnegative integers from 0 to 4');
  control(['lift', 'enabled'], p.lift.enabled, 'toggle');
  step(['yard', 'above'], p.yard.above, (n) => Number.isInteger(n) && n >= 0 && n <= 2, 'above must be an integer from 0 to 2');
  const state = control(['yard', 'state'], p.yard.state, 'choice');
  if (state?.kind === 'choice' && (state.options.length !== 3 || !['original', 'cleared', 'retrieved'].every((id) => state.options.some((o) => o.id === id)))) issue(['yard', 'state'], 'yard state options must be exactly original, cleared, retrieved');
  for (const name of ['cranes', 'carriers', 'yards'] as const) step(['capacity', name], p.capacity[name], (n) => Number.isInteger(n) && n >= 1, 'resource counts must be integers of at least 1');
  step(['capacity', 'arrivals'], p.capacity.arrivals, (n) => n >= 0, 'arrivals must be nonnegative boxes per hour');
  step(['capacity', 'hours'], p.capacity.hours, (n) => n > 0, 'hours must be positive');
  const largest = (id: string) => { const c = controls.get(id); return c?.kind === 'step' ? Math.max(...c.values) : 0; };
  const rates = [largest(p.capacity.cranes) * p.capacity.rate.crane, largest(p.capacity.carriers) * p.capacity.rate.carrier, largest(p.capacity.yards) * p.capacity.rate.yard];
  if (rates.some((n) => !Number.isFinite(n)) || !Number.isFinite(Math.max(largest(p.capacity.arrivals), ...rates) * largest(p.capacity.hours))) issue(['capacity'], 'all legal resource counts, rates and hours must produce finite outputs');
  const part = (path: (string | number)[], id: string) => {
    const item = parts.find((x) => x.id === id);
    if (!item) issue(path, `unknown part "${id}"`);
    else if (item.context || !item.primitive) issue(path, `"${id}" must be a non-context primitive part`);
    return item;
  };
  for (const name of ['workingPart', 'spreaderPart', 'trolleyPart'] as const) part(['lift', name], p.lift[name]);
  part(['yard', 'target'], p.yard.target);
  p.yard.blockers.forEach((id, i) => part(['yard', 'blockers', i], id));
  if (new Set([p.yard.target, ...p.yard.blockers]).size !== 3) issue(['yard', 'blockers'], 'target and both blockers must be distinct parts');
  const l = p.lift;
  if (l.source[0] !== l.destination[0]) issue(['lift', 'destination'], 'lift source and destination must share X (this model moves along Y and Z)');
  if (l.clearBottomY < Math.max(l.source[1], l.destination[1]) + l.boxHeight / 2) issue(['lift', 'clearBottomY'], 'clearBottomY must clear both box top positions');
  const spreader = parts.find((x) => x.id === l.spreaderPart)?.primitive;
  const spreaderSource = [l.source[0], l.source[1] + l.boxHeight / 2 + l.spreaderDepth / 2, l.source[2]];
  if (spreader && spreader.at.some((n, i) => Math.abs(n - spreaderSource[i]!) > 1e-6)) issue(['lift', 'spreaderPart'], 'spreader rest centre must put its bottom at the source box top');
  const times = Object.values(l.knots);
  if (times.some((t, i) => i > 0 && t <= times[i - 1]!)) issue(['lift', 'knots'], 'lift knots must be strictly ascending');
  const trolley = parts.find((x) => x.id === l.trolleyPart)?.primitive;
  if (trolley && trolley.at[1] <= l.clearBottomY + l.boxHeight + l.spreaderDepth) issue(['lift', 'trolleyPart'], 'trolley anchor must be above the highest spreader top');
  // The working part is displaced from source by timeline channels; mismatched origins would misplace it.
  const cargo = parts.find((x) => x.id === l.workingPart)?.primitive;
  if (cargo && cargo.at.some((n, i) => Math.abs(n - l.source[i]!) > 1e-6)) issue(['lift', 'source'], 'source must match the working part rest centre');
  const bounds = modelBounds(parts as Parameters<typeof modelBounds>[0]);
  for (const key of ['source', 'destination'] as const) if (bounds && l[key].some((n, i) => n < bounds.min[i]! - 1e-6 || n > bounds.max[i]! + 1e-6)) issue(['lift', key], 'lift point must lie within the model rest envelope');
  return out;
}

/** Sources are loaded separately from parts.json, so this check belongs to content validation. */
export function portSourceIssues(p: PortData, sources: ReadonlyMap<string, { design?: boolean }>): PortIssue[] {
  const out: PortIssue[] = [];
  p.source.forEach((id, i) => { if (!sources.has(id)) out.push({ path: ['source', i], message: `unknown source "${id}"` }); });
  if (!p.source.some((id) => sources.get(id)?.design === true)) out.push({ path: ['source'], message: 'port model must cite a design:true source for its schematic geometry, times and rates' });
  return out;
}
