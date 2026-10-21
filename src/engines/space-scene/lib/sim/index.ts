/**
 * The try-it model registry (docs/22 §4.3 S2; pure, synchronous, well under
 * a millisecond): `evaluateSim(sim, values)` runs the topic's model
 * (`circuit` → lib/sim/circuit.ts, `magnet` → lib/sim/magnet.ts, `force` →
 * lib/sim/force.ts, `energy` → lib/sim/energy.ts, `life-cycle` →
 * lib/sim/lifecycle.ts, `sort` → lib/sim/sort.ts, `materials` → lib/sim/materials.ts) and maps its quantities onto the declared outputs
 * (`from`, default the output's id). A timeline output's value is a
 * `Timeline` (lib/sim/timeline.ts).
 * The magnet model's `clips` is the clip count the chapter's try-it card
 * observes (`observe`), NaN (shown `—`) where it observes none. `frames`
 * (lib/sim/carrier.ts `magnetFrames`): where the magnets' parts are now.
 */
import type { SimData, SimKind, SimOutput, SimValues } from '../../sim-schema';
import { solveCircuit } from './circuit';
import { CLIP_QUANTITIES, ringPoint, solveMagnets } from './magnet';
import type { Vec3 } from '../math';
import type { MagnetFrames } from './frame';
import { solveForces } from './force';
import { solveEnergy } from './energy';
import type { MatterPart } from '../../matter-schema';
import { solveMatter, matterLiquidShapes } from './matter';
import { solveLifeCycle } from './lifecycle';
import { solveLight } from './light';
import { solveMaterials } from './materials';
import { solveSort, type SortPart } from './sort';
import { EMPTY_TIMELINE, type Timeline } from './timeline';

/** An output's value: a number, a state id, numbers per id (a vector) or a run over time (a timeline). */
export type SimOutputValue = number | string | Readonly<Record<string, number>> | Timeline;
export type SimOutputs = Readonly<Record<string, SimOutputValue>>;

/** Where the compass is: `magnet.compass`, else the first `at` binding's ring at its control's value (null: none). */
export function compassPoint(sim: SimData, values: SimValues): Vec3 | null {
  const m = sim.magnet;
  if (!m) return null;
  const at = (ring: string, control: string): Vec3 | null => {
    const r = m.rings?.[ring];
    const k = values[control];
    return r && typeof k === 'number' ? ringPoint(r, k) : null;
  };
  if (m.compass) return 'at' in m.compass ? m.compass.at : at(m.compass.ring, m.compass.control);
  for (const b of sim.bind) if ('part' in b && b.at !== undefined && b.control !== undefined) return at(b.at, b.control);
  return null;
}

/** Every model quantity for these control values; `observe`: the outputs the chapter's try-it card observes. */
export function simQuantities(sim: SimData, values: SimValues, observe: readonly string[] = [], frames?: MagnetFrames, parts: readonly MatterPart[] = []): Record<string, SimOutputValue> {
  if (sim.kind === 'light' && sim.light) return solveLight(sim.light, values, sim.controls);
  if (sim.kind === 'sort' && sim.sort) return solveSort(sim.sort, values, parts as readonly SortPart[]);
  if (sim.kind === 'matter' && sim.matter) return solveMatter(sim.matter, values, matterLiquidShapes(parts));
  if (sim.kind === 'materials' && sim.materials) return solveMaterials(sim.materials, values, sim.controls);
  if (sim.kind === 'circuit' && sim.circuit) return solveCircuit(sim.circuit, values).quantities;
  if (sim.kind === 'magnet' && sim.magnet) {
    const q: Record<string, SimOutputValue> = solveMagnets(sim.magnet, values, compassPoint(sim, values), frames);
    const clip = observe.map((id) => sim.outputs.find((o) => o.id === id)?.from ?? id).find((f) => (CLIP_QUANTITIES as readonly string[]).includes(f));
    q.clips = clip !== undefined ? q[clip]! : NaN;
    return q;
  }
  if (sim.kind === 'force' && sim.force) return solveForces(sim.force, values);
  if (sim.kind === 'energy' && sim.energy) return solveEnergy(sim.energy, values, sim.controls);
  if (sim.kind === 'life-cycle' && sim.lifeCycle) return solveLifeCycle(sim.lifeCycle, values, sim.controls);
  return {};
}

/** The declared outputs for these control values (missing quantities: 0 / the first state / an empty vector / a still timeline). */
export function evaluateSim(sim: SimData, values: SimValues, observe: readonly string[] = [], frames?: MagnetFrames, parts: readonly MatterPart[] = []): SimOutputs {
  const q = simQuantities(sim, values, observe, frames, parts);
  const out: Record<string, SimOutputValue> = {};
  for (const o of sim.outputs) {
    const v = q[o.from ?? o.id];
    out[o.id] = v ?? (o.kind === 'state' ? (Object.keys(o.states ?? {})[0] ?? '') : o.kind === 'vector' ? {} : o.kind === 'timeline' ? EMPTY_TIMELINE : 0);
  }
  return out;
}

/**
 * Models whose parts are separate experiments on one bench (the forces
 * model's push, fall, slide, roll, spring and brake; the energy model's
 * chains, one per chapter): the PLATE block names
 * only a state the chapter's card or settings move. A circuit, a set of
 * magnets or one animal's life cycle is one system: its first state (the
 * stage on the day on show) always describes the bench.
 */
export const SEPARATE_EXPERIMENTS: Readonly<Record<SimKind, boolean>> = { circuit: false, magnet: false, force: true, energy: true, 'life-cycle': false, matter: true, light: true, sort: true, materials: true };

/** A number output's value (0 for states and vectors; NaN = not applicable here). */
export const numberOf = (v: SimOutputValue | undefined): number => (typeof v === 'number' ? v : 0);

/** Decimals an output is shown with: its own, else 3 for amps, 2 for volts, 0 otherwise. */
export function outputDecimals(o: Pick<SimOutput, 'decimals' | 'unit'>): number {
  return o.decimals ?? (o.unit === 'A' ? 3 : o.unit === 'V' ? 2 : 0);
}
