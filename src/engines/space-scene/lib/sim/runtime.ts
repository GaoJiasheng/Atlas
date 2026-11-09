/** Browser registry. Only the topic's model is fetched; the build/test registry stays synchronous. */
import type { SimData, SimKind, SimValues } from '../../sim-schema';
import type { MatterPart } from '../../matter-schema';
import type { MagnetFrames } from './frame';
import type { Vec3 } from '../math';
import { EMPTY_TIMELINE } from './timeline';
import type { SimOutputs, SimOutputValue } from './output';
export { numberOf, outputDecimals, SEPARATE_EXPERIMENTS } from './output';
export type { SimOutputs, SimOutputValue } from './output';

type Solver = (sim: SimData, values: SimValues, observe: readonly string[], frames: MagnetFrames | undefined, parts: readonly MatterPart[], context?: { timeSeconds: number }) => Record<string, SimOutputValue>;
const loaders: Record<SimKind, () => Promise<Solver>> = {
  circuit: () => import('./circuit').then(m => (s, v) => s.circuit ? m.solveCircuit(s.circuit, v).quantities : {}),
  magnet: () => import('./magnet-solver').then(m => (s, v, observe, frames) => {
    if (!s.magnet) return {};
    const at = (ring: string, control: string): Vec3 | null => {
      const r = s.magnet!.rings?.[ring], k = v[control];
      return r && typeof k === 'number' ? m.ringPoint(r, k) : null;
    };
    const c = s.magnet.compass;
    let compass: Vec3 | null = c ? ('at' in c ? c.at : at(c.ring, c.control)) : null;
    if (!c) for (const b of s.bind) if ('part' in b && b.at !== undefined && b.control !== undefined) { compass = at(b.at, b.control); break; }
    const q: Record<string, SimOutputValue> = m.solveMagnets(s.magnet, v, compass, frames);
    const clip = observe.map(id => s.outputs.find(o => o.id === id)?.from ?? id).find(f => (m.clipQuantities() as readonly string[]).includes(f));
    q.clips = clip !== undefined ? q[clip]! : NaN;
    return q;
  }),
  force: () => import('./force').then(m => (s, v) => s.force ? m.solveForces(s.force, v) : {}),
  energy: () => import('./energy').then(m => (s, v) => s.energy ? m.solveEnergy(s.energy, v, s.controls) : {}),
  'life-cycle': () => import('./lifecycle').then(m => (s, v) => s.lifeCycle ? m.solveLifeCycle(s.lifeCycle, v, s.controls) : {}),
  matter: () => import('./matter').then(m => (s, v, _o, _f, parts) => s.matter ? m.solveMatter(s.matter, v, m.matterLiquidShapes(parts)) : {}),
  light: () => import('./light').then(m => (s, v) => s.light ? m.solveLight(s.light, v, s.controls) : {}),
  sort: () => import('./sort').then(m => (s, v, _o, _f, parts) => s.sort ? m.solveSort(s.sort, v, parts as readonly import('./sort').SortPart[]) : {}),
  materials: () => import('./materials').then(m => (s, v) => s.materials ? m.solveMaterials(s.materials, v, s.controls) : {}),
  table: () => import('./table-solver').then(m => (s, v) => s.table ? m.solveTable(s.table, v, s.outputs) : {}),
  seeds: () => import('./seeds').then(m => (s, v) => s.seeds ? m.solveSeeds(s.seeds, v, s.controls) : {}),
  heat: () => import('./heat').then(m => (s, v) => s.heat ? m.solveHeat(s.heat, v) : {}),
  'orbit-rotation': () => import('./orbit-rotation').then(m => (s, v, _o, _f, _p, context) => s.orbitRotation ? m.solveOrbitRotation(s.orbitRotation, v, context) : {}),
  airfoil: () => import('./airfoil').then(m => (s, v) => s.airfoil ? m.solveAirfoil(s.airfoil, v) : {}),
  port: () => import('./port').then(m => (s, v, _o, _f, parts) => s.port ? m.solvePort(s.port, v, parts) : {}),
  senses: () => import('./senses').then(m => (s, v) => s.senses ? m.solveSenses(s.senses, v) : {}),
  microscope: () => import('./microscope').then(m => (s, v) => s.microscope ? m.solveMicroscope(s.microscope, v) : {}),
  'solar-system': () => import('./solar-system').then(m => (s, v) => s.solarSystem ? m.solveSolarSystem(s.solarSystem, v) : {}),
};
const solvers = new Map<SimKind, Solver>();
const pending = new Map<SimKind, Promise<void>>();
export function loadSim(kind: SimKind): Promise<void> {
  let promise = pending.get(kind);
  if (!promise) {
    promise = loaders[kind]().then(solver => { solvers.set(kind, solver); });
    pending.set(kind, promise);
  }
  return promise;
}
/** Suspend the view before any HUD or R3F frame can evaluate an unloaded model. */
export function readSim(kind: SimKind): void {
  if (!solvers.has(kind)) throw loadSim(kind);
}
export function simQuantities(sim: SimData, values: SimValues, observe: readonly string[] = [], frames?: MagnetFrames, parts: readonly MatterPart[] = [], context?: { timeSeconds: number }): Record<string, SimOutputValue> {
  readSim(sim.kind);
  return solvers.get(sim.kind)!(sim, values, observe, frames, parts, context);
}
export function evaluateSim(sim: SimData, values: SimValues, observe: readonly string[] = [], frames?: MagnetFrames, parts: readonly MatterPart[] = [], context?: { timeSeconds: number }): SimOutputs {
  const q = simQuantities(sim, values, observe, frames, parts, context);
  return Object.fromEntries(sim.outputs.map(o => {
    const v = q[o.from ?? o.id];
    return [o.id, v === null && o.nullable ? null : v ?? (o.kind === 'state' ? (Object.keys(o.states ?? {})[0] ?? '') : o.kind === 'vector' ? {} : o.kind === 'timeline' ? EMPTY_TIMELINE : 0)];
  }));
}
