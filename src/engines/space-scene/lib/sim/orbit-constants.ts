/** Client-safe quantity and input registry; no schema or renderer dependency. */
export const ORBIT_LABS = ['coupled', 'day', 'year', 'moon', 'eclipse', 'local-year'] as const;
export const ORBIT_BODIES = ['sun', 'earth', 'moon', 'observer'] as const;
export const ORBIT_INPUTS = [
  'lab',
  'elapsed',
  'year-angle',
  'lunar-angle',
  'spin-angle',
  'obliquity',
  'lunar-tilt',
  'node-angle',
  'observer-lat',
  'moon-range',
  'synchronous',
  'scale-mode',
  'day-index',
] as const;
export const ORBIT_STEPS: Readonly<Record<string, readonly number[]>> = {
  elapsed: [0, 21600, 43200, 64800, 86400, 2360594.88, 31557600],
  'year-angle': [0, 90, 180, 270],
  'lunar-angle': [0, 0.3, 1, 45, 90, 135, 180, 180.75, 181, 182, 225, 270, 315],
  'spin-angle': [0, 90, 180, 270, 360],
  obliquity: [0, 23.44],
  'lunar-tilt': [0, 5.145],
  'node-angle': [0, 90],
  'observer-lat': [-45, 0, 1.3342, 45, 80],
  'moon-range': [363300, 384400, 405500],
  'day-index': Array.from({ length: 365 }, (_, i) => i + 1),
};
export const ORBIT_STATES: Readonly<Record<string, readonly string[]>> = {
  'observer-day': ['day', 'night', 'boundary', 'not-applicable'],
  'daylight-state': ['normal', 'polar-day', 'polar-night', 'not-applicable'],
  'moon-phase': ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent', 'not-applicable'],
  'solar-eclipse': ['none', 'partial', 'total', 'annular', 'not-applicable'],
  'lunar-eclipse': ['none', 'penumbral', 'partial', 'total', 'not-applicable'],
};
export const ORBIT_VECTORS = ['body-frame', 'solar-directions', 'earth-axis-direction'];
export const ORBIT_NUMBERS = [
  'geometric-daylight-hours',
  'noon-altitude-deg',
  'observer-altitude-deg',
  'moon-lit-percent',
  'moon-phase-angle-deg',
  'solar-visible',
  'sun-diameter-deg',
  'moon-diameter-deg',
  'disc-separation-deg',
  'earth-sun-km',
  'earth-moon-km',
  'local-sunrise',
  'local-noon',
  'local-sunset',
  'local-daylight-minutes',
];
export function orbitQuantity(from: string): 'vector' | 'state' | 'number' | null {
  return ORBIT_VECTORS.includes(from) ? 'vector' : from in ORBIT_STATES ? 'state' : ORBIT_NUMBERS.includes(from) ? 'number' : null;
}
