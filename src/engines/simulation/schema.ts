/**
 * Simulation engine (docs/03 §C) is Phase 2+. The schema is a placeholder so a
 * simulation topic can be scaffolded: `{ params: Slider[], model, view }` will
 * be specified when the engine is built.
 */
import { z } from 'zod';
import { theme } from '../../content/schema/common';

export const simulationData = z.record(z.string(), z.unknown());
export type SimulationData = z.output<typeof simulationData>;

export const simulationChapterState = z
  .object({ theme: theme.optional() })
  .catchall(z.unknown());
