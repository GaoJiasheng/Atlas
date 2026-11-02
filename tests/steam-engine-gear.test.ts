/** Geometry checks use emitted outlines and independent polygon contact tests,
 * rather than assuming that the mechanism's correct angular ratio implies mesh. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { gearDimensions, gearOutline, gearTooth, meshGears, spurGear, type GearSpec } from '../scripts/geo/kits/gear';
import { primitiveSchema, type Primitive } from '../src/engines/space-scene/schema';
import { solveMechanism } from '../src/engines/space-scene/lib/mechanism';
import type { BeamSteamMechanism } from '../src/engines/space-scene/mechanism-schema';

type XY = [number, number];
const tau = 2 * Math.PI;
const radius = ([x, y]: XY) => Math.hypot(x, y);
const spec: GearSpec = { module: .6092838281609874 / 48, teeth: 48, depth: .08,
  pressureAngle: 20, backlash: .0003, bore: .06, hubRadius: .092, hubDepth: .15, web: 4 };
const source = JSON.parse(readFileSync(new URL('../src/content/topics/steam-engine/data/parts.json', import.meta.url), 'utf8'));
const mechanism = source.mechanisms[0] as BeamSteamMechanism;
const primitives = (id: string): Primitive[] => {
  const p = source.parts.find((part: { id: string }) => part.id === id);
  return [p.primitive, ...(p.extra ?? [])];
};
function transform(poly: XY[], angle: number, x = 0, y = 0): XY[] {
  const c = Math.cos(angle), s = Math.sin(angle);
  return poly.map(([u, v]) => [x + c * u - s * v, y + s * u + c * v]);
}
const cross = (a: XY, b: XY, c: XY) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function inside(point: XY, polygon: XY[]): boolean {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!, b = polygon[j]!;
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}
function distanceToSegment(p: XY, a: XY, b: XY): number {
  const dx = b[0] - a[0], dy = b[1] - a[1], length2 = dx * dx + dy * dy;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
/** Strict intersections, containment and all segment distances also handle
 * concave tooth polygons. Broad-phase bounds only discard separated pairs. */
function contact(a: XY[], b: XY[]): { overlap: boolean; gap: number } {
  let gap = Infinity;
  for (let i = 0; i < a.length; i++) {
    const p = a[i]!, q = a[(i + 1) % a.length]!;
    for (let j = 0; j < b.length; j++) {
      const r = b[j]!, s = b[(j + 1) % b.length]!;
      if (cross(p, q, r) * cross(p, q, s) < -1e-24 && cross(r, s, p) * cross(r, s, q) < -1e-24) return { overlap: true, gap: 0 };
      gap = Math.min(gap, distanceToSegment(p, r, s), distanceToSegment(r, p, q));
    }
  }
  return { overlap: a.some(p => inside(p, b)) || b.some(p => inside(p, a)), gap };
}
/** Recover every physical tooth directly from the shipped sector vertices. */
function physicalTeeth(id: string): { polygon: XY[]; phase: number }[] {
  return primitives(id).flatMap(p => {
    if (p.kind !== 'extrude' || p.shape.length < 100) return [];
    const count = (p.shape.length - 2) / 13;
    expect(Number.isInteger(count)).toBe(true);
    return Array.from({ length: count }, (_, index) => ({ polygon: p.shape.slice(index * 12, (index + 1) * 12), phase: (p.rotation?.[2] ?? 0) * Math.PI / 180 }));
  });
}
function wheelContact(a: XY[][], b: XY[][], centreDistance: number) {
  // Only the facing teeth can enter the lens shared by the addendum circles.
  const tip = spec.module * 25;
  const aa = a.filter(poly => Math.max(...poly.map(p => p[0])) >= centreDistance - tip);
  const bb = b.filter(poly => Math.min(...poly.map(p => p[0])) <= tip);
  let gap = Infinity;
  for (const pa of aa) for (const pb of bb) {
    const result = contact(pa, pb);
    if (result.overlap) return result;
    gap = Math.min(gap, result.gap);
  }
  return { overlap: false, gap };
}

describe('build-time involute spur gear geometry', () => {
  it('emits bounded schema-valid ring sectors, a bored hub and four open spokes', () => {
    for (const teeth of [18, 24, 48, 73, 120]) {
      const pieces = spurGear({ ...spec, module: .02, teeth, bore: .02, hubRadius: .05 });
      for (const piece of pieces) {
        expect(primitiveSchema.safeParse(piece).success).toBe(true);
        if (piece.kind === 'extrude') expect(piece.shape.length).toBeLessThanOrEqual(160);
        if (piece.kind === 'lathe') {
          expect(piece.segments).toBeGreaterThanOrEqual(48);
          expect(Math.min(...piece.profile.map(p => p[0]))).toBe(.02);
        }
      }
      const hub = pieces.at(-1)!;
      expect(hub.kind).toBe('lathe');
      if (hub.kind === 'lathe') {
        expect(Math.max(...hub.profile.map(p => p[0]))).toBe(.05);
        expect(Math.max(...hub.profile.map(p => p[1])) - Math.min(...hub.profile.map(p => p[1]))).toBeCloseTo(.15, 12);
      }
      expect(pieces.filter(p => p.kind === 'extrude' && p.shape.length === 4)).toHaveLength(4);
    }
    const solid = spurGear({ ...spec, web: 'solid' });
    expect(solid.filter(p => p.kind === 'lathe')).toHaveLength(2);
    expect(solid.some(p => p.kind === 'extrude' && p.shape.length === 4)).toBe(false);
  });

  it('has 48 distinct tooth tips, relieved roots and curved narrowing flanks', () => {
    const outline = gearOutline(spec), d = gearDimensions(spec);
    expect(outline).toHaveLength(48 * 12);
    expect(Math.max(...outline.map(radius))).toBeCloseTo(spec.module * 25, 12);
    expect(Math.min(...outline.map(radius))).toBeCloseTo(spec.module * 22.75, 12);
    for (let index = 0; index < 48; index++) {
      const tooth = gearTooth(spec, index), local = transform(tooth, -index * tau / 48);
      expect(radius(local[6]!)).toBeCloseTo(d.tipRadius, 12);
      expect(Math.atan2(local[6]![1], local[6]![0])).toBeCloseTo(0, 12);
      expect(Math.atan2(local[7]![1], local[7]![0])).toBeLessThan(Math.atan2(local[9]![1], local[9]![0]));
      expect(Math.abs(cross(local[3]!, local[4]!, local[5]!))).toBeGreaterThan(1e-7);
    }
    for (const invalid of [{ ...spec, module: 0 }, { ...spec, teeth: 17 }, { ...spec, teeth: 48.5 }, { ...spec, backlash: 10 }]) expect(() => gearDimensions(invalid)).toThrow();
    expect(() => spurGear({ ...spec, bore: .1 })).toThrow();
  });

  it('places equal and unequal wheels tangent at their pitch circles with a tooth facing a gap', () => {
    for (const [a, b] of [[48, 48], [24, 36], [19, 73]]) for (const carrier of [-2.1, 0, .37, 4.8]) {
      const pair = meshGears(.02, a!, b!, [3, -2, .4], carrier, carrier);
      expect(Math.hypot(pair.b.at[0] - pair.a.at[0], pair.b.at[1] - pair.a.at[1])).toBeCloseTo(.01 * (a! + b!), 12);
      expect(pair.b.at[2]).toBe(.4);
      // A has a tooth exactly on the line of centres. At B's facing ray,
      // the independently measured tooth coordinate must be half a pitch.
      const coordinateB = (carrier + Math.PI - pair.b.phase) * b! / tau;
      expect(Math.abs(coordinateB - Math.round(coordinateB))).toBeCloseTo(.5, 12);
      const advanced = meshGears(.02, a!, b!, [3, -2, .4], carrier, carrier + .123);
      expect((advanced.b.phase - pair.b.phase) / .123).toBeCloseTo(-a! / b!, 12);
      const orbited = meshGears(.02, a!, b!, [3, -2, .4], carrier + .123, carrier);
      expect((orbited.b.phase - pair.b.phase) / .123).toBeCloseTo(1 + a! / b!, 12);
    }
  });
});

describe('production sun-and-planet physical contact', () => {
  it('keeps actual emitted teeth separated but close through a full prescribed cycle', () => {
    const sun = physicalTeeth('sun'), planet = physicalTeeth('planet');
    expect(sun).toHaveLength(48); expect(planet).toHaveLength(48);
    const rest = solveMechanism(0, mechanism.geometry);
    expect(primitives('sun')[0]!.at[2]).toBe(primitives('planet')[0]!.at[2]);
    expect(primitives('planet')[0]!.at[0] - primitives('sun')[0]!.at[0]).toBeCloseTo(mechanism.geometry.orbitM, 12);
    let largestGap = 0;
    for (let sample = 0; sample <= 3072; sample++) {
      const theta = sample * tau / 3072, frame = solveMechanism(theta, mechanism.geometry);
      // Rotate into the carrier frame, preserving the actual rest-profile phase.
      const a = sun.map(t => transform(t.polygon, t.phase + frame.sunAngleRad - theta));
      const b = planet.map(t => transform(t.polygon, t.phase + frame.planetAngleRad - theta, mechanism.geometry.orbitM));
      const result = wheelContact(a, b, mechanism.geometry.orbitM);
      if (result.overlap) throw new Error(`Production teeth penetrate at cycle sample ${sample}/3072`);
      largestGap = Math.max(largestGap, result.gap);
      expect(Math.hypot(frame.points.P[0] - frame.points.O[0], frame.points.P[1] - frame.points.O[1])).toBeCloseTo(mechanism.geometry.orbitM, 12);
    }
    expect(largestGap).toBeLessThan(.0015);
    expect(solveMechanism(tau, mechanism.geometry).sunAngleRad - rest.sunAngleRad).toBeCloseTo(4 * Math.PI, 12);
    // Negative control: half-pitch phase corruption puts two tips together.
    const bad = wheelContact(sun.map(t => transform(t.polygon, t.phase)), planet.map(t => transform(t.polygon, t.phase + Math.PI / 48, mechanism.geometry.orbitM)), mechanism.geometry.orbitM);
    expect(bad.overlap).toBe(true);
  }, 20_000);
});
