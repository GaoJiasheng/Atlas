import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import { BICYCLE, bicycleChain, bicycleWheel, bottleDynamo, chainLoop, placeBicycle } from '../../scripts/geo/kits/bicycle';
import { DYNAMO_AT, DYNAMO_AXIS, DYNAMO_HINGE, DYNAMO_OFF, ORIGIN, rebuild } from '../../scripts/geo/energy-conversion/build-parts';
import { partSchema } from '../../src/engines/space-scene/schema';
import { eachPieces, partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const file = JSON.parse(readFileSync(new URL('../../src/content/topics/energy-conversion/data/parts.json', import.meta.url), 'utf8'));

describe('the rebuilt bicycle is an assembled, driven machine', () => {
  it('keeps 28 dished, crossed spokes per wheel instanced about the axle', () => {
    for (const rear of [false, true]) {
      const primitives = placeBicycle(bicycleWheel(rear), ORIGIN, true);
      const part = partSchema.parse({ ...file.parts.find((p: any) => p.id === 'front-wheel'), primitive: primitives[0], extra: primitives.slice(1) });
      const pieces = eachPieces(part);
      const spokes = pieces.filter((p) => p.matrices?.length === 7);
      expect(spokes).toHaveLength(4);
      expect(spokes.reduce((n, p) => n + p.matrices!.length, 0)).toBe(BICYCLE.spokes);
      for (const piece of pieces) for (const c of piece.pivots!) {
        // Shared Z rotation axis: no spoke or sprocket orbits a false pivot.
        expect(c[0]).toBeCloseTo(0, 7);
        expect(c[1]).toBeCloseTo(0, 7);
      }
      const rawSpokes = primitives.filter((p) => p.kind === 'sweep');
      for (const p of rawSpokes) if (p.kind === 'sweep') {
        expect(Math.hypot(p.path[0]![0], p.path[0]![1])).toBeCloseTo(0.023, 6);
        expect(Math.abs(p.path[0]![2])).toBe(0.029);
        expect(Math.hypot(p.path[1]![0], p.path[1]![1])).toBeCloseTo(0.283, 6);
      }
      pieces.forEach((p) => p.geometry.dispose());
    }
  });

  it('puts the chain on common sprocket tangents and retains the simulation ratio', () => {
    const path = chainLoop();
    // Small sprocket arc has 17 points; the following points lie on its lower tangent.
    const t = new Vector3(...path[17]!).sub(new Vector3(...path[16]!)).normalize();
    const normal = new Vector3(...path[16]!).sub(new Vector3(BICYCLE.rear[0], BICYCLE.rear[1], BICYCLE.chainZ)).normalize();
    expect(Math.abs(t.dot(normal))).toBeLessThan(1e-6);
    expect(BICYCLE.sprocket / BICYCLE.chainring).toBeCloseTo(file.sim.energy.dynamo.crankRatio, 10);
    const links = bicycleChain().filter((p) => p.kind === 'fins');
    expect(links).toHaveLength(2);
    for (const row of links) if (row.kind === 'fins') {
      const pitch = row.size[2] + row.gap;
      expect(pitch).toBeCloseTo(0.0127, 8);
      expect((row.count - 1) * pitch + row.size[2]).toBeLessThan(0.42);
    }
    const crank = file.animations.find((a: any) => a.id === 'crank-spin');
    expect(crank.pivot).toEqual([1, 0.82, 1.6]);
    for (const id of ['front-wheel-rest', 'wheel-spin']) expect(file.animations.find((a: any) => a.id === id).each).toBe(true);
  });

  const implicitTyre = (p: Vector3) => {
    const r = Math.hypot(p.x - 1.42, p.y - 0.77);
    const major = BICYCLE.tyreRadius - BICYCLE.tyreSection;
    return ((r - major) / BICYCLE.tyreSection) ** 2 + ((p.z - 1.6) / 0.021) ** 2;
  };
  function minimumRollerContact(released: boolean): number {
    const rotation = bottleDynamo(DYNAMO_AT, DYNAMO_AXIS).rotor.find((p) => p.kind === 'lathe' && p.at !== DYNAMO_AT && p.profile.some(([r]) => r === 0.011))!;
    const e = new Euler(...rotation.rotation!.map((v) => v * Math.PI / 180) as [number, number, number]);
    let minimum = Infinity;
    for (let i = 0; i < 256; i++) for (const y of [-0.0045, 0, 0.0045]) {
      const theta = i * Math.PI * 2 / 256;
      const v = new Vector3(0.011 * Math.cos(theta), y, 0.011 * Math.sin(theta)).applyEuler(e).add(new Vector3(...rotation.at));
      if (released) v.sub(new Vector3(...DYNAMO_HINGE)).applyAxisAngle(new Vector3(1, 0, 0), DYNAMO_OFF * Math.PI / 180).add(new Vector3(...DYNAMO_HINGE));
      minimum = Math.min(minimum, implicitTyre(v));
    }
    return minimum;
  }

  it('engages the roller with the tyre sidewall, then clears it in the off pose', () => {
    // Tiny soft tyre overlap at contact; 1 is the analytic tyre surface.
    expect(minimumRollerContact(false)).toBeGreaterThan(0.75);
    expect(minimumRollerContact(false)).toBeLessThan(1.1);
    expect(minimumRollerContact(true)).toBeGreaterThan(2);
    expect(new Vector3(...DYNAMO_AXIS).length()).toBeCloseTo(1, 4);
    const leads = file.parts.find((p: any) => p.id === 'dynamo-wires').primitive;
    const feedthrough = file.parts.find((p: any) => p.id === 'bicycle-dynamo').extra.find((p: any) => p.kind === 'sphere');
    expect(leads.path[0]).toEqual(DYNAMO_HINGE);
    expect(feedthrough.at).toEqual(DYNAMO_HINGE);
  });

  it('regenerates deterministically without changing labels, teaching text, ids or part count', () => {
    const data = structuredClone(file);
    const content = (d: typeof data) => d.parts.map(({ primitive, extra, castShadow, ...part }: any) => part);
    rebuild(data);
    expect(content(data)).toEqual(content(file));
    expect(data.sim).toEqual(file.sim);
    expect(data.parts).toHaveLength(53);
    expect(data).toEqual(file);
    rebuild(data);
    expect(data).toEqual(file);
  });

  it('generates finite geometry for every rebuilt assembly', () => {
    const ids = new Set(['bicycle-frame', 'front-wheel', 'rear-wheel', 'crank-pedals', 'bicycle-dynamo', 'dynamo-magnet', 'dynamo-coil', 'dynamo-wires', 'headlamp', 'kettle', 'speaker', 'speaker-cone', 'fan-blades']);
    for (const p of file.parts) if (ids.has(p.id)) {
      const part = partSchema.parse(p);
      const pieces = p.id.endsWith('wheel') ? eachPieces(part) : partPieces(part);
      for (const piece of pieces) {
        for (const name of ['position', 'normal']) expect([...piece.geometry.getAttribute(name).array].every(Number.isFinite), `${p.id}: ${name}`).toBe(true);
        piece.geometry.dispose();
      }
    }
  });
});
