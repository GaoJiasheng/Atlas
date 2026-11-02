import type { SimKind, SimOutput } from '../../sim-schema';
import type { Timeline } from './timeline';
/** An output's value: a number, a state id, numbers per id (a vector) or a run over time (a timeline). */
export type SimOutputValue = null | number | string | Readonly<Record<string, number>> | Timeline;
export type SimOutputs = Readonly<Record<string, SimOutputValue>>;

/**
 * Models whose parts are separate experiments on one bench (the forces
 * model's push, fall, slide, roll, spring and brake; the energy model's
 * chains, one per chapter): the PLATE block names
 * only a state the chapter's card or settings move. A circuit, a set of
 * magnets or one animal's life cycle is one system: its first state (the
 * stage on the day on show) always describes the bench.
 */
export const SEPARATE_EXPERIMENTS: Readonly<Record<SimKind, boolean>> = { circuit: false, magnet: false, force: true, energy: true, 'life-cycle': false, matter: true, light: true, sort: true, materials: true, table: true, seeds: true, heat: true, 'orbit-rotation': true, airfoil: true, port: true, senses: true, microscope: true, 'solar-system': true };

/** A number output's value (0 for states and vectors; NaN = not applicable here). */
export const numberOf = (v: SimOutputValue | undefined): number => (typeof v === 'number' ? v : v === null ? NaN : 0);

/** Decimals an output is shown with: a table cell's own for this value (`decimalsAt`), else the output's, else 3 for amps, 2 for volts, 0 otherwise. */
export function outputDecimals(o: Pick<SimOutput, 'decimals' | 'unit'> & { decimalsAt?: Readonly<Record<string, number>> | undefined }, value?: number): number {
  const cell = value !== undefined && o.decimalsAt ? o.decimalsAt[String(value)] : undefined;
  return cell ?? o.decimals ?? (o.unit === 'A' ? 3 : o.unit === 'V' ? 2 : 0);
}
