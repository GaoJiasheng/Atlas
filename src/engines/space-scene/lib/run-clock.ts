/** Shared running time; the senses bench freezes transmission while its pieces are separated. */
import { damp } from './math';
export interface RunTime { elapsed: number; phase: number; energy: number }
export const sensesMotionBlocked = (kind: string | undefined, view: string, displayedExplode: number): boolean => kind === 'senses' && (view === 'exploded' || displayedExplode > 0);
/** Mutates the existing stage cache; blocked transmission stops immediately without an ease tail. */
export function stepRunTime(runtime: RunTime, run: boolean, dt: number, blocked = false): void {
  if (blocked) { runtime.energy = 0; return; }
  runtime.elapsed += dt;
  runtime.energy = damp(runtime.energy, run ? 1 : 0, 5, dt);
  if (run && runtime.energy > .995) runtime.energy = 1;
  if (!run && runtime.energy < .01) runtime.energy = 0;
  runtime.phase += dt * runtime.energy;
}
