/** Complete author example: raw fixture, validated before use. Constant density reproduces docs/45 §4.7. */
import fixture from '../../../src/content/topics/sample-airfoil/data/parts.json';
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
export const AIRFOIL_BENCH_SIM = {
  ...fixture.sim,
  airfoil: {
    ...fixture.sim.airfoil,
    atmosphere: { kind: 'constant', density: 1.225 },
  },
};
export const AIRFOIL_SIM = simSchema.parse(AIRFOIL_BENCH_SIM);
export const AIRFOIL_DATA = AIRFOIL_SIM.airfoil!;
export const AIRFOIL_DEFAULTS = {
  'angle-deg': 4,
  'airspeed-mps': 40,
  'altitude-m': 0,
  'flow-view': 'streamlines',
  'diagram-case': 'none',
};
export const NASA_AIRFOIL = {
  ...AIRFOIL_DATA,
  atmosphere: { kind: 'nasa-troposphere' as const, altitude: 'altitude-m' },
};
