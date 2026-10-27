/** Display mapping and north-up view basis, independent of camera, locale and theme. */
import type { OrbitRotation } from '../../orbit-rotation-schema';
import type { OrbitSnapshot, V3, Q4 } from './orbit-rotation';
import { add, cross, dot, mul, sub, unit, rotate } from './orbit-rotation';
export interface OrbitDisplay {
  origin: V3;
  centres: Record<'sun' | 'earth' | 'moon' | 'observer', V3>;
  radii: Record<'sun' | 'earth' | 'moon' | 'observer', number>;
  multipliers: {
    size: Record<'sun' | 'earth' | 'moon', number>;
    earthSun: number;
    earthMoon: number;
  };
}
export function orbitDisplay(c: OrbitRotation, s: OrbitSnapshot, scale: string): OrbitDisplay {
  const k = c.display.trueScaleMPerKm,
    sh = c.display.schematic,
    trueScale = scale === 'true-scale';
  const E = mul(unit(s.bodies.earth.position), trueScale ? c.orbit.earthRadiusKm * k : sh.earthOrbitM),
    M = add(
      E,
      mul(
        unit(sub(s.bodies.moon.position, s.bodies.earth.position)),
        trueScale ? s.parameters.range * k : (sh.moonOrbitM * s.parameters.range) / c.orbit.moonReferenceKm,
      ),
    );
  const radii = {
    sun: trueScale ? s.bodies.sun.radiusKm * k : sh.sunRadiusM,
    earth: trueScale ? s.bodies.earth.radiusKm * k : sh.earthRadiusM,
    moon: trueScale ? s.bodies.moon.radiusKm * k : sh.moonRadiusM,
    observer: trueScale ? s.bodies.earth.radiusKm * k : sh.earthRadiusM,
  };
  const centres = {
    sun: [0, 0, 0] as V3,
    earth: E,
    moon: M,
    observer: add(E, mul(unit(sub(s.bodies.observer.position, s.bodies.earth.position)), radii.earth)),
  };
  // Keep Earth at the origin: close views remain numerically stable at true scale.
  const origin = s.lab === 'coupled' || s.lab === 'year' ? ([0, 0, 0] as V3) : E;
  for (const id of ['sun', 'earth', 'moon', 'observer'] as const) centres[id] = sub(centres[id], origin);
  return {
    origin,
    centres,
    radii,
    multipliers: {
      size: {
        sun: radii.sun / (s.bodies.sun.radiusKm * k),
        earth: radii.earth / (s.bodies.earth.radiusKm * k),
        moon: radii.moon / (s.bodies.moon.radiusKm * k),
      },
      earthSun: (trueScale ? c.orbit.earthRadiusKm * k : sh.earthOrbitM) / (c.orbit.earthRadiusKm * k),
      earthMoon: (trueScale ? s.parameters.range * k : (sh.moonOrbitM * s.parameters.range) / c.orbit.moonReferenceKm) / (s.parameters.range * k),
    },
  };
}
export function northBasis(forward: V3, north: V3) {
  const f = unit(forward);
  let up = sub(north, mul(f, dot(north, f)));
  if (Math.hypot(...up) < 1e-9) up = sub([0, 1, 0], mul(f, f[1]));
  if (Math.hypot(...up) < 1e-9) up = sub([0, 0, 1], mul(f, f[2]));
  up = unit(up);
  return { forward: f, up, right: unit(cross(f, up)) };
}
export function bodyPlacement(
  s: OrbitSnapshot,
  d: OrbitDisplay,
  b: {
    body: 'sun' | 'earth' | 'moon' | 'observer';
    attachment: 'centre' | 'surface';
    localDirection?: V3 | undefined;
    surfaceFactor?: number | undefined;
    scaleWithRadius: boolean;
  },
): { position: V3; quaternion: Q4; scale: number } {
  const q = s.bodies[b.body].quaternion;
  return {
    position:
      b.attachment === 'surface'
        ? add(d.centres[b.body], mul(rotate(q, unit(b.localDirection!)), d.radii[b.body] * (b.surfaceFactor ?? 1)))
        : d.centres[b.body],
    quaternion: q,
    scale: b.scaleWithRadius ? d.radii[b.body] : 1,
  };
}

/** A selectable reference-plane guide with its normal and the axial-tilt arc.
 * Disconnected strokes use the guide writer's NaN pen-up convention. */
export function orbitalTiltGuide(earth: V3, axis: V3, earthRadius: number, planeRadius: number): V3[] {
  const lift = (p: V3) => add(earth, p);
  const gap = (): V3 => [NaN, 0, 0];
  const normalLength = earthRadius * 1.7, arcRadius = earthRadius * 1.55;
  const angle = Math.acos(Math.max(-1, Math.min(1, axis[1])));
  const sideways = Math.hypot(axis[0], axis[2]);
  const direction: V3 = sideways > 1e-12 ? [axis[0] / sideways, 0, axis[2] / sideways] : [0, 0, 1];
  const outline: V3[] = [[-planeRadius,0,-planeRadius],[planeRadius,0,-planeRadius],[planeRadius,0,planeRadius],[-planeRadius,0,planeRadius],[-planeRadius,0,-planeRadius]];
  return [
    ...outline.map(lift), gap(), lift([0,0,0]), lift([0,normalLength,0]), gap(),
    ...Array.from({length: 25}, (_,i) => {
      const a = angle * i / 24;
      return lift([direction[0] * Math.sin(a) * arcRadius, Math.cos(a) * arcRadius, direction[2] * Math.sin(a) * arcRadius]);
    }),
  ];
}
