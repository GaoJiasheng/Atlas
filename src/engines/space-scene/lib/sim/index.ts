/**
 * The try-it model registry (docs/22 §4.3 S2; pure, synchronous, well under
 * a millisecond): `evaluateSim(sim, values)` runs the topic's model
 * (`circuit` → lib/sim/circuit.ts, `magnet` → lib/sim/magnet.ts) and maps its
 * quantities onto the declared outputs (`from`, default the output's id).
 */
import type { SimData, SimOutput, SimValues } from '../../sim-schema';
import { solveCircuit } from './circuit';
import { solveMagnets } from './magnet';

/** An output's value: a number, a state id, or numbers per id (a vector). */
export type SimOutputValue = number | string | Readonly<Record<string, number>>;
export type SimOutputs = Readonly<Record<string, SimOutputValue>>;

/** Every model quantity for these control values. */
export function simQuantities(sim: SimData, values: SimValues): Record<string, SimOutputValue> {
  if (sim.kind === 'circuit' && sim.circuit) return solveCircuit(sim.circuit, values).quantities;
  if (sim.kind === 'magnet' && sim.magnet) return solveMagnets(sim.magnet, values);
  return {};
}

/** The declared outputs for these control values (missing quantities: 0 / the first state / an empty vector). */
export function evaluateSim(sim: SimData, values: SimValues): SimOutputs {
  const q = simQuantities(sim, values);
  const out: Record<string, SimOutputValue> = {};
  for (const o of sim.outputs) {
    const v = q[o.from ?? o.id];
    out[o.id] = v ?? (o.kind === 'state' ? (Object.keys(o.states ?? {})[0] ?? '') : o.kind === 'vector' ? {} : 0);
  }
  return out;
}

/** A number output's value (0 for states and vectors). */
export const numberOf = (v: SimOutputValue | undefined): number => (typeof v === 'number' ? v : 0);

/** Decimals an output is shown with: its own, else 3 for amps, 2 for volts, 0 otherwise. */
export function outputDecimals(o: Pick<SimOutput, 'decimals' | 'unit'>): number {
  return o.decimals ?? (o.unit === 'A' ? 3 : o.unit === 'V' ? 2 : 0);
}
