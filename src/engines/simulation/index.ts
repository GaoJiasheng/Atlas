/** Simulation descriptor (docs/03 §C). Engine arrives in a later phase. */
import { defineEngine } from '../core/engine';

export type SimulationExt = Record<never, never>;

export const simulationEngine = defineEngine<SimulationExt, Record<string, unknown>>({
  id: 'simulation',
  defaults: () => ({}),
  fromChapterState: () => ({}),
  fromUrl: () => ({}),
  load: () => import('./View'),
});
