/** Numeric teaching models, not an operational terminal or queue simulator. */
import type { PortData } from '../../port-schema';
import type { MatterPart } from '../../matter-schema';
import type { SimValues, SimOutput } from '../../sim-schema';
import type { SimOutputValue } from './index';
import type { Timeline } from './timeline';

export const PORT_CHANNELS = ['trolley-dz', 'spreader-dy', 'cargo-dy', 'cargo-dz', 'lock-deg'] as const;
export const PORT_STATES: Readonly<Record<string, readonly string[]>> = { 'lift-status': ['lock-not-confirmed', 'ready'], bottleneck: ['crane', 'carrier', 'yard', 'tied'] };
const NUMBERS = ['boxes', 'teu', 'rehandles', 'retrieval-lifts', 'crane-rate', 'carrier-rate', 'yard-rate', 'capacity-rate', 'completed', 'queue-growth', 'queued'];
export function portQuantity(from: string): SimOutput['kind'] | null {
  return NUMBERS.includes(from) ? 'number' : PORT_STATES[from] ? 'state' : from === 'lift-run' ? 'timeline' : from === 'yard-slots' ? 'vector' : null;
}
/** Stable, short geometry identity: unrelated box-count or capacity values cannot restart the lift. */
function geometryHash(lift: PortData['lift']): string {
  let hash = 2166136261;
  for (const ch of JSON.stringify(lift)) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}
export function portLift(l: PortData['lift'], enabled: boolean): Timeline {
  const { lock, raised, crossed, landed, released, finished } = l.knots;
  const up = l.clearBottomY + l.boxHeight / 2 - l.source[1];
  const down = l.destination[1] - l.source[1];
  const dz = l.destination[2] - l.source[2];
  const times = [0, lock, raised, crossed, landed, released, finished];
  const values = [[0, 0, 0, dz, dz, dz, dz], [0, 0, up, up, down, down, up], [0, 0, up, up, down, down, down], [0, 0, 0, dz, dz, dz, dz], [0, 90, 90, 90, 90, 0, 0]];
  return { kind: 'timeline', key: `port-lift:${enabled}:${geometryHash(l)}`, duration: enabled ? finished : 0, slow: l.slow,
    channels: Object.fromEntries(PORT_CHANNELS.map((name, i) => [name, { samples: enabled ? times.map((t, j) => [t, values[i]![j]!] as [number, number]) : [[0, 0] as [number, number]] }])) };
}
export function portYard(p: PortData, above: number, state: string, parts: readonly MatterPart[]): Record<string, number> {
  const y = p.yard;
  const target = parts.find((x) => x.id === y.target)?.primitive?.at ?? [0, p.yard.pitch / 2, 0];
  const slots: Record<string, number> = {};
  const put = (id: string, rest: readonly number[], goal: readonly number[], shown: boolean) => {
    for (const [i, axis] of ['x', 'y', 'z'].entries()) slots[`${id}:${axis}`] = goal[i]! - rest[i]!;
    slots[`${id}:shown`] = Number(shown);
  };
  put(y.target, target, state === 'retrieved' ? y.retrieved : target, true);
  y.blockers.forEach((id, i) => {
    const rest = parts.find((x) => x.id === id)?.primitive?.at ?? [target[0]!, target[1]! + (i + 1) * y.pitch, target[2]!];
    put(id, rest, state === 'original' ? rest : y.park[i]!, i < above);
  });
  return slots;
}
export function solvePort(p: PortData, values: SimValues, parts: readonly MatterPart[] = []): Record<string, SimOutputValue> {
  const num = (id: string, fallback = 0) => typeof values[id] === 'number' && Number.isFinite(values[id]) ? values[id] as number : fallback;
  const n20 = num(p.count.n20), n40 = num(p.count.n40), above = num(p.yard.above);
  const crane = num(p.capacity.cranes, 1) * p.capacity.rate.crane;
  const carrier = num(p.capacity.carriers, 1) * p.capacity.rate.carrier;
  const yard = num(p.capacity.yards, 1) * p.capacity.rate.yard;
  const capacity = Math.min(crane, carrier, yard), arrivals = num(p.capacity.arrivals), hours = num(p.capacity.hours, 1);
  const minima = (['crane', 'carrier', 'yard'] as const).filter((id) => ({ crane, carrier, yard })[id] === capacity);
  const enabled = values[p.lift.enabled] === true;
  return { boxes: n20 + n40, teu: n20 + 2 * n40, 'lift-status': enabled ? 'ready' : 'lock-not-confirmed', 'lift-run': portLift(p.lift, enabled),
    'yard-slots': portYard(p, above, String(values[p.yard.state]), parts), rehandles: above, 'retrieval-lifts': above + 1,
    'crane-rate': crane, 'carrier-rate': carrier, 'yard-rate': yard, 'capacity-rate': capacity,
    completed: Math.min(arrivals, capacity) * hours, 'queue-growth': Math.max(0, arrivals - capacity), queued: Math.max(0, arrivals - capacity) * hours,
    bottleneck: minima.length > 1 ? 'tied' : minima[0]! };
}
