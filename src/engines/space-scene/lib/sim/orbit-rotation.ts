/** Deterministic circular teaching model; km, seconds, active quaternion rotations. */
import type { OrbitRotation } from '../../orbit-rotation-schema';
import { ORBIT_STATES } from './orbit-constants';
import { validOrbitTime } from './orbit-clock';
export { validOrbitTime } from './orbit-clock';
import type { SimValues } from '../../sim-schema';
export type V3 = [number, number, number];
export type Q4 = [number, number, number, number];
export const RAD = Math.PI / 180;
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const unit = (a: V3): V3 => mul(a, 1 / (Math.hypot(...a) || 1));
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const clamp = (a: number) => Math.max(-1, Math.min(1, a));
export const wrap = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
export const qx = (a: number): Q4 => [Math.sin(a / 2), 0, 0, Math.cos(a / 2)];
export const qy = (a: number): Q4 => [0, Math.sin(a / 2), 0, Math.cos(a / 2)];
export function qm(a: Q4, b: Q4): Q4 {
  const [x, y, z, w] = a,
    [X, Y, Z, W] = b;
  return [w * X + x * W + y * Z - z * Y, w * Y - x * Z + y * W + z * X, w * Z + x * Y - y * X + z * W, w * W - x * X - y * Y - z * Z];
}
export function rotate(q: Q4, v: V3): V3 {
  const t = mul(cross([q[0], q[1], q[2]], v), 2);
  return add(v, add(mul(t, q[3]), cross([q[0], q[1], q[2]], t)));
}
export interface OrbitBody {
  position: V3;
  quaternion: Q4;
  radiusKm: number;
}
export type OrbitQuantities = Record<string, number | string | Record<string, number>>;
export interface OrbitSnapshot {
  timeSeconds: number;
  lab: string;
  parameters: {
    lambda: number;
    u: number;
    theta: number;
    tilt: number;
    node: number;
    obliquity: number;
    range: number;
  };
  bodies: Record<'sun' | 'earth' | 'moon' | 'observer', OrbitBody>;
  axis: V3;
  solarDirections: { earth: V3; moon: V3 };
  quantities: OrbitQuantities;
  shadow: {
    x: number;
    offAxis: number;
    du: number;
    dp: number;
    umbraLength: number;
    ku: number;
    kp: number;
  };
  discs: {
    sunRadius: number;
    moonRadius: number;
    separation: number;
    sunDirection: V3;
    moonDirection: V3;
  };
  dayIndex: number;
}
export function geometricDaylight(latitude: number, declination: number) {
  const c = -Math.tan(latitude * RAD) * Math.tan(declination * RAD);
  return {
    hours: c <= -1 ? 24 : c >= 1 ? 0 : (24 * Math.acos(clamp(c))) / Math.PI,
    noon: 90 - Math.abs(latitude - declination),
    state: c <= -1 ? 'polar-day' : c >= 1 ? 'polar-night' : 'normal',
  };
}
/** Angles in radians. External contact has zero overlap; internal contact counts total/annular. */
export function classifySolarDiscs(aS: number, aM: number, d: number, inFront = true): string {
  const tol = 1e-12;
  if (!inFront || d >= aS + aM - tol) return 'none';
  if (aM >= aS && d <= aM - aS + tol) return 'total';
  if (aS > aM && d <= aS - aM + tol) return 'annular';
  return 'partial';
}
export function finiteShadow(sourceRadius: number, occluderRadius: number, distance: number, offset: V3, axis: V3, satelliteRadius: number) {
  const ku = Math.asin((sourceRadius - occluderRadius) / distance),
    kp = Math.asin((sourceRadius + occluderRadius) / distance),
    umbraLength = occluderRadius / Math.sin(ku);
  const x = dot(offset, axis),
    offAxis = Math.hypot(...sub(offset, mul(axis, x))),
    du = offAxis * Math.cos(ku) + x * Math.sin(ku) - occluderRadius,
    dp = offAxis * Math.cos(kp) - x * Math.sin(kp) - occluderRadius,
    tol = 1e-6;
  const type =
    x <= 0
      ? 'none'
      : x < umbraLength && du <= -satelliteRadius + tol
        ? 'total'
        : x < umbraLength && du < satelliteRadius - tol
          ? 'partial'
          : dp < satelliteRadius - tol
            ? 'penumbral'
            : 'none';
  return { x, offAxis, du, dp, umbraLength, ku, kp, type };
}
export const timeHours = (s: string) => Number(s.slice(0, 2)) + Number(s.slice(3)) / 60;
export function orbitSnapshot(c: OrbitRotation, values: SimValues, context?: { timeSeconds: number }): OrbitSnapshot {
  const n = (key: keyof OrbitRotation['controls']) => {
    const value = values[c.controls[key]];
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError(`orbit ${key} must be finite`);
    return value;
  };
  const lab = String(values[c.controls.lab]);
  const t = context?.timeSeconds ?? n('elapsed');
  if (!validOrbitTime(t, c.clock.maxSeconds)) throw new RangeError('orbit timeSeconds must be finite and in [0, maxSeconds]');
  const λ0 = n('year-angle') * RAD,
    Ω = n('node-angle') * RAD,
    i = n('lunar-tilt') * RAD,
    ε = n('obliquity') * RAD,
    r = n('moon-range'),
    φ = n('observer-lat') * RAD;
  if (Math.abs(φ) > Math.PI / 2 || r <= c.bodies[1].radiusKm + c.bodies[2].radiusKm)
    throw new RangeError('orbit latitude / moon distance outside physical range');
  const ay = lab === 'coupled' || lab === 'year' ? 1 : 0,
    am = lab === 'coupled' || lab === 'moon' ? 1 : 0,
    ae = lab === 'coupled' || lab === 'day' ? 1 : 0;
  const λ = wrap(λ0 + (ay * 2 * Math.PI * t) / c.periods.yearSeconds),
    u = wrap(λ0 + Math.PI - Ω + n('lunar-angle') * RAD + (am * 2 * Math.PI * t) / c.periods.moonSeconds),
    θ = wrap(n('spin-angle') * RAD + (ae * 2 * Math.PI * t) / (lab === 'day' ? 86400 : c.periods.spinSeconds));
  const E: V3 = [c.orbit.earthRadiusKm * Math.cos(λ), 0, -c.orbit.earthRadiusKm * Math.sin(λ)];
  const S: V3 = [0, 0, 0];
  const orbitQ = qm(qy(Ω), qx(i)),
    m = rotate(orbitQ, [r * Math.cos(u), 0, -r * Math.sin(u)]),
    M = add(E, m),
    qE = qm(qx(ε), qy(θ)),
    qM = qm(orbitQ, qy((values[c.controls.synchronous] === true ? u : λ0 + Math.PI - Ω) + Math.PI));
  const axis: V3 = [0, Math.cos(ε), Math.sin(ε)],
    v = rotate(qE, [Math.cos(φ), Math.sin(φ), 0]),
    O = add(E, mul(v, c.bodies[1].radiusKm));
  const sE = unit(sub(S, E)),
    sM = unit(sub(S, M)),
    sO = unit(sub(S, O)),
    mO = unit(sub(M, O));
  const altitude = Math.asin(clamp(dot(v, sE))),
    declination = Math.asin(clamp(dot(axis, sE))) / RAD,
    day = geometricDaylight(φ / RAD, declination);
  const phaseCos = clamp(dot(sM, unit(mul(m, -1)))),
    phase = Math.acos(phaseCos),
    lit = (1 + phaseCos) / 2;
  const alpha = wrap(Math.atan2(-m[2], m[0]) - Math.atan2(-sE[2], sE[0])),
    bucket = Math.floor((alpha + Math.PI / 8) / (Math.PI / 4)) % 8;
  const aS = Math.asin(c.bodies[0].radiusKm / Math.hypot(...sub(S, O))),
    aM = Math.asin(c.bodies[2].radiusKm / Math.hypot(...sub(M, O))),
    d = Math.acos(clamp(dot(sO, mO)));
  const solar = classifySolarDiscs(aS, aM, d, Math.hypot(...sub(M, O)) < Math.hypot(...sub(S, O)) && dot(sO, mO) > 0);
  const shadow = finiteShadow(c.bodies[0].radiusKm, c.bodies[1].radiusKm, c.orbit.earthRadiusKm, m, mul(sE, -1), c.bodies[2].radiusKm);
  const bodies: OrbitSnapshot['bodies'] = {
    sun: {
      position: S,
      quaternion: [0, 0, 0, 1],
      radiusKm: c.bodies[0].radiusKm,
    },
    earth: { position: E, quaternion: qE, radiusKm: c.bodies[1].radiusKm },
    moon: { position: M, quaternion: qM, radiusKm: c.bodies[2].radiusKm },
    observer: { position: O, quaternion: qE, radiusKm: 0 },
  };
  const frame: Record<string, number> = {};
  for (const [id, b] of Object.entries(bodies)) {
    for (const [j, k] of ['xKm', 'yKm', 'zKm'].entries()) frame[`${id}.${k}`] = b.position[j]!;
    for (const [j, k] of ['qx', 'qy', 'qz', 'qw'].entries()) frame[`${id}.${k}`] = b.quaternion[j]!;
    frame[`${id}.radiusKm`] = b.radiusKm;
  }
  const q: OrbitQuantities = {
    'body-frame': frame,
    'solar-directions': {
      'earth.x': sE[0],
      'earth.y': sE[1],
      'earth.z': sE[2],
      'moon.x': sM[0],
      'moon.y': sM[1],
      'moon.z': sM[2],
    },
    'earth-axis-direction': { x: axis[0], y: axis[1], z: axis[2] },
    'geometric-daylight-hours': day.hours,
    'noon-altitude-deg': day.noon,
    'observer-altitude-deg': altitude / RAD,
    'observer-day': altitude > 1e-9 ? 'day' : altitude < -1e-9 ? 'night' : 'boundary',
    'daylight-state': day.state,
    'moon-lit-percent': lit * 100,
    'moon-phase-angle-deg': phase / RAD,
    'moon-phase': ORBIT_STATES['moon-phase']![bucket]!,
    'solar-eclipse': solar,
    'solar-visible': dot(v, sO) > 0 ? 1 : 0,
    'lunar-eclipse': shadow.type,
    'sun-diameter-deg': (2 * aS) / RAD,
    'moon-diameter-deg': (2 * aM) / RAD,
    'disc-separation-deg': d / RAD,
    'earth-sun-km': Math.hypot(...E),
    'earth-moon-km': Math.hypot(...m),
    'local-sunrise': NaN,
    'local-noon': NaN,
    'local-sunset': NaN,
    'local-daylight-minutes': NaN,
  };
  const dayIndex = n('day-index');
  if (lab === 'local-year') {
    for (const k of Object.keys(q))
      if (typeof q[k] === 'number') q[k] = NaN;
      else if (typeof q[k] === 'string') q[k] = 'not-applicable';
    const row = c.solarYear.table?.days[dayIndex - 1];
    if (row) {
      q['local-sunrise'] = timeHours(row.sunrise_sgt);
      q['local-noon'] = timeHours(row.solar_noon_sgt);
      q['local-sunset'] = timeHours(row.sunset_sgt);
      q['local-daylight-minutes'] = row.daylight_minutes;
    }
  }
  return {
    timeSeconds: t,
    lab,
    parameters: {
      lambda: λ,
      u,
      theta: θ,
      tilt: i,
      node: Ω,
      obliquity: ε,
      range: r,
    },
    bodies,
    axis,
    solarDirections: { earth: sE, moon: sM },
    quantities: q,
    shadow,
    discs: {
      sunRadius: aS,
      moonRadius: aM,
      separation: d,
      sunDirection: sO,
      moonDirection: mO,
    },
    dayIndex,
  };
}
export function solveOrbitRotation(c: OrbitRotation, values: SimValues, context?: { timeSeconds: number }): OrbitQuantities {
  return orbitSnapshot(c, values, context).quantities;
}
export function validateBodyFrame(frame: Record<string, number>): string[] {
  const out: string[] = [];
  for (const id of ['sun', 'earth', 'moon', 'observer']) {
    for (const k of ['xKm', 'yKm', 'zKm', 'qx', 'qy', 'qz', 'qw', 'radiusKm'])
      if (!Number.isFinite(frame[`${id}.${k}`])) out.push(`${id}.${k}: missing finite value`);
    const q = ['qx', 'qy', 'qz', 'qw'].map((k) => frame[`${id}.${k}`]!);
    if (Math.abs(Math.hypot(...q) - 1) > 1e-6) out.push(`${id}.quaternion: must be unit length`);
    if (frame[`${id}.radiusKm`]! < 0) out.push(`${id}.radiusKm: must be nonnegative`);
  }
  return out;
}
