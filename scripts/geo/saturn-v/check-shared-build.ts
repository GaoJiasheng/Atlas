/** Reproduce the shared Rollup cycle without importing topic content or a GPU.
 * pnpm exec vite build --ssr scripts/geo/saturn-v/check-shared-build.ts
 * Run the generated server module with node; this uses the untouched engine.
 */
import {partsFile} from '../../../src/engines/space-scene/schema';
export const schemaAvailable=Boolean(partsFile);

export {loadSim} from '../../../src/engines/space-scene/lib/sim/runtime';
