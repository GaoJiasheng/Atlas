/** Original illustrative Joukowski model; docs/45 §4. No viscous/finite-wing model. */
import type { AirfoilData } from '../../airfoil-schema';
import type { SimControl, SimValues } from '../../sim-schema';
export const AIRFOIL_STATES = [
  'still',
  'ideal-attached',
  'separated-illustration',
] as const;
export type AirfoilMode = (typeof AIRFOIL_STATES)[number];
export const R = 1.08;
export const Z_LE = -(1 + 2 * 0.08) - 1 / (1 + 2 * 0.08);
export const C = 2 - Z_LE;
export const A = (8 * Math.PI * R) / C;
export class AirfoilInputError extends Error {
  constructor(
    public field: string,
    public reason: string,
  ) {
    super(`${field}: ${reason}`);
    this.name = 'AirfoilInputError';
  }
}
function range(
  field: string,
  value: unknown,
  min: number,
  max: number,
  open = false,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    (open ? value <= min : value < min) ||
    value > max
  )
    throw new AirfoilInputError(
      field,
      `expected a finite number ${open ? '>' : '≥'} ${min} and ≤ ${max}`,
    );
  return value;
}
export function atmosphereAt(h: number) {
  range('altitude', h, 0, 10000);
  const temperature = 15.04 - 0.00649 * h;
  const pressure = 101.29 * ((temperature + 273.1) / 288.08) ** 5.256;
  return {
    temperature,
    pressure,
    rho: pressure / (0.2869 * (temperature + 273.1)),
  };
}
export function solveAirfoil(d: AirfoilData, values: SimValues) {
  const angle = range(d.angle, values[d.angle], -20, 20),
    speed = range(d.speed, values[d.speed], 0, 60);
  range('chord', d.chord, 0.05, 5);
  range('area', d.area, 0.01, 20);
  const rho =
    d.atmosphere.kind === 'constant'
      ? range('density', d.atmosphere.density, 0, 2, true)
      : atmosphereAt(
          range(d.atmosphere.altitude, values[d.atmosphere.altitude], 0, 10000),
        ).rho;
  const t = Math.abs(angle),
    peak = A * Math.sin((12 * Math.PI) / 180);
  const cl =
    t <= 12
      ? A * Math.sin((angle * Math.PI) / 180)
      : Math.sign(angle) *
        peak *
        (t <= 16 ? 1 - (0.15 * (t - 12)) / 4 : 0.85 - (0.25 * (t - 16)) / 4);
  const q = 0.5 * rho * speed ** 2,
    lift = q * d.area * cl;
  const mode: AirfoilMode =
    speed === 0
      ? 'still'
      : t <= 12
        ? 'ideal-attached'
        : 'separated-illustration';
  return {
    angle,
    speed,
    rho,
    q,
    cl,
    lift,
    mode,
    'lift-n': lift,
    'flow-state': mode,
    [`control:${d.angle}`]: angle,
    [`control:${d.speed}`]: speed,
    ...(d.atmosphere.kind === 'nasa-troposphere'
      ? {
          [`control:${d.atmosphere.altitude}`]: values[
            d.atmosphere.altitude
          ] as number,
        }
      : {}),
  };
}
export function airfoilQuantity(
  d: AirfoilData,
  from: string,
  controls: readonly SimControl[],
): 'number' | 'state' | null {
  if (from === 'flow-state') return 'state';
  if (['rho', 'q', 'cl', 'lift-n'].includes(from)) return 'number';
  const ids = [
    d.angle,
    d.speed,
    ...(d.atmosphere.kind === 'nasa-troposphere'
      ? [d.atmosphere.altitude]
      : []),
  ];
  return from.startsWith('control:') &&
    ids.includes(from.slice(8)) &&
    controls.some((c) => c.id === from.slice(8) && c.kind === 'step')
    ? 'number'
    : null;
}
/** Only physical keep conditions reset a table; display choices never do. */
export function airfoilRecordSignature(
  d: AirfoilData,
  values: SimValues,
  vary: string,
): string {
  const ids = [
    d.angle,
    d.speed,
    ...(d.atmosphere.kind === 'nasa-troposphere'
      ? [d.atmosphere.altitude]
      : []),
  ];
  return JSON.stringify([
    d.model,
    d.profile,
    d.chord,
    d.area,
    d.atmosphere,
    ids.filter((id) => id !== vary).map((id) => [id, values[id]]),
  ]);
}
export function airfoilPlot(
  d: AirfoilData,
  values: SimValues,
  from: 'cl' | 'lift-n',
) {
  const x = Array.from({ length: 81 }, (_, i) => -20 + i * 0.5);
  const y = x.map(
    (angle) => solveAirfoil(d, { ...values, [d.angle]: angle })[from],
  );
  const peak = Math.max(...y.map(Math.abs));
  return {
    x,
    y,
    extent: peak ? peak * 1.1 : 1,
    segments: [
      [0, 16],
      [16, 64],
      [64, 80],
    ],
    current: { x: values[d.angle] as number, y: solveAirfoil(d, values)[from] },
  };
}
