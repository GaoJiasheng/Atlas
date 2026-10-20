import { performance } from 'node:perf_hooks';
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { capacity, clipProfile, easeFillVolume, fillBounds, fillShapeForPrimitive, fillSlice, levelForVolume, validateFillProfile, volumeBelow, type FillProfile } from '../../src/engines/space-scene/lib/fill';
import { primitiveSchema } from '../../src/engines/space-scene/schema';
import { createFillGeometry, updateFillGeometry } from '../../src/engines/space-scene/stages/model3d/fillGeometry';

const cylinder: FillProfile = [[0, 0], [0.0185, 0], [0.0185, 0.25], [0, 0.25]];
const flask: FillProfile = [[0, 0], [0.042, 0], [0.016, 0.1], [0.016, 0.14], [0, 0.14]];
const cavity: FillProfile = [[0, 0], [0.12, 0], [0.12, 0.2], [0, 0.2], [0, 0.124], [0.037, 0.124], [0.037, 0.03], [0, 0.03], [0, 0]];
const relative = (actual: number, expected: number, tolerance = 1e-6) => expect(Math.abs(actual - expected) / expected).toBeLessThan(tolerance);

describe('liquid fill volume and its inverse', () => {
  it('integrates a cylinder exactly and clamps levels to the cavity', () => {
    relative(volumeBelow(cylinder, 0.1), Math.PI * 0.0185 ** 2 * 0.1);
    relative(capacity(cylinder), Math.PI * 0.0185 ** 2 * 0.25);
    expect(volumeBelow(cylinder, -1)).toBe(0);
    expect(levelForVolume(cylinder, -1)).toBe(0);
    expect(levelForVolume(cylinder, 1)).toBe(0.25);
    expect(levelForVolume(cylinder, 200e-6)).toBeCloseTo(200e-6 / (Math.PI * 0.0185 ** 2), 12);
  });

  it('integrates a tapered flask including the neck by the frustum formula', () => {
    const frustum = Math.PI * 0.1 * (0.042 ** 2 + 0.042 * 0.016 + 0.016 ** 2) / 3;
    relative(volumeBelow(flask, 0.1), frustum);
    relative(capacity(flask), frustum + Math.PI * 0.016 ** 2 * 0.04);
    expect(levelForVolume(flask, 200e-6) * 100).toBeCloseTo(4.991, 2);
  });

  it('agrees with spherical-cap volume to better than one part per million', () => {
    const radius = 0.08, count = 4096;
    const hemisphere: FillProfile = [[0, 0], ...Array.from({ length: count }, (_, i): [number, number] => {
      const angle = (i + 1) / count * Math.PI / 2;
      return [radius * Math.sin(angle), radius * (1 - Math.cos(angle))];
    }), [0, radius]];
    const h = 0.03;
    relative(volumeBelow(hemisphere, h), Math.PI * h * h * (radius - h / 3));
    relative(capacity(hemisphere), 2 / 3 * Math.PI * radius ** 3);
  });

  it('subtracts a cavity with a shared axis boundary', () => {
    expect(validateFillProfile(cavity)).toEqual([]);
    const expected = (y: number) => Math.PI * (0.12 ** 2 * y - 0.037 ** 2 * Math.max(0, Math.min(y, 0.124) - 0.03));
    for (const y of [0.02, 0.07, 0.149, 0.2]) relative(volumeBelow(cavity, y), expected(y));
    relative(capacity(cavity), expected(0.2));
  });

  it('inverts every sampled level, including negative local Y and cavity boundaries', () => {
    for (const profile of [cylinder, flask, cavity, cylinder.map(([r, y]) => [r, y - 0.1] as const)]) {
      const { min, max } = fillBounds(profile);
      for (let i = 1; i < 50; i++) {
        const y = min + (max - min) * i / 50;
        expect(Math.abs(levelForVolume(profile, volumeBelow(profile, y)) - y)).toBeLessThan(1e-9);
      }
    }
  });

  it('uses the exact centred box cross-section', () => {
    const box = { kind: 'box' as const, size: [0.2, 0.3, 0.4] };
    relative(capacity(box), 0.024);
    relative(volumeBelow(box, 0), 0.012);
    expect(levelForVolume(box, 0.004)).toBeCloseTo(-0.1, 12);
    const primitive = primitiveSchema.parse({ ...box, at: [0, 0, 0], color: 'membrane' });
    expect(fillShapeForPrimitive(primitive)).toEqual(box);
  });

  it('normalises upright scale and mirrors and rejects tilted or open lathes', () => {
    const lathe = { kind: 'lathe', profile: cylinder, at: [0, 0, 0], color: 'membrane' };
    const scaled = fillShapeForPrimitive(primitiveSchema.parse({ ...lathe, scale: [2, 3, 2], mirror: 'y', rotation: [0, 45, 0] }))!;
    relative(capacity(scaled), capacity(cylinder) * 12);
    expect(fillBounds(scaled)).toEqual({ min: -0.75, max: 0 });
    expect(levelForVolume(scaled, capacity(scaled) / 2)).toBeCloseTo(-0.375, 10);
    expect(fillShapeForPrimitive(primitiveSchema.parse({ ...lathe, scale: [2, 1, 1] }))).toBeNull();
    expect(fillShapeForPrimitive(primitiveSchema.parse({ ...lathe, arc: 180 }))).toBeNull();
    expect(fillShapeForPrimitive(primitiveSchema.parse({ ...lathe, rotation: [30, 0, 0] }))).toBeNull();
    const box = fillShapeForPrimitive(primitiveSchema.parse({ kind: 'box', size: [0.2, 0.3, 0.4], scale: [2, 3, 4], mirror: 'x', rotation: [0, 90, 0], at: [0, 0, 0], color: 'membrane' }))!;
    relative(capacity(box), 0.024 * 24);
    const geometry = createFillGeometry(box);
    updateFillGeometry(geometry, box, capacity(box) / 2);
    const positions = geometry.getAttribute('position');
    expect(Math.max(...Array.from({ length: 24 }, (_, i) => positions.getX(i)))).toBeCloseTo(0.8, 6);
    expect(Math.max(...Array.from({ length: 24 }, (_, i) => positions.getZ(i)))).toBeCloseTo(0.2, 6);
    geometry.dispose();
  });
});

describe('liquid slicing and easing', () => {
  it('returns explicitly closed clipped profiles and preserves the integral', () => {
    for (const profile of [cylinder, flask, cavity]) {
      const clipped = clipProfile(profile, 0.07);
      expect(clipped.at(-1)).toEqual(clipped[0]);
      relative(capacity(clipped), volumeBelow(profile, 0.07));
      expect(clipped.every(([, y]) => y <= 0.07)).toBe(true);
    }
  });

  it('starts water above the specified volume of sand', () => {
    const slice = fillSlice(cylinder, 65e-6, { below: 100e-6 });
    expect(slice.bottom).toBeCloseTo(levelForVolume(cylinder, 100e-6), 12);
    expect(slice.level).toBeCloseTo(levelForVolume(cylinder, 165e-6), 12);
    relative(capacity(slice.profile), 65e-6);
    expect(fillSlice(cylinder, 1, { below: 100e-6 }).volume).toBeCloseTo(capacity(cylinder) - 100e-6, 12);
  });

  it('keeps decorative meniscus out of both the reading and modeled volume', () => {
    const flat = fillSlice(cylinder, 200e-6), lip = fillSlice(cylinder, 200e-6, { meniscus: 0.0015 });
    expect(lip.volume).toBe(flat.volume);
    expect(lip.level).toBe(flat.level);
    expect(lip.profile).toEqual(flat.profile);
    expect(Math.max(...lip.meniscus.map(([, y]) => y))).toBe(lip.level + 0.0015);
    relative(capacity(lip.profile), 200e-6);
  });

  it('hides empty and sub-threshold liquids without changing the modeled reading', () => {
    expect(fillSlice(cylinder, 0).shown).toBe(false);
    expect(fillSlice(cylinder, capacity(cylinder) * 0.0009).shown).toBe(false);
    expect(fillSlice(cylinder, capacity(cylinder) * 0.001).shown).toBe(true);
    expect(fillSlice(cylinder, 0, { below: 100e-6 }).profile).toEqual([]);
  });

  it('eases complementary volumes in sync, with zero endpoint velocity', () => {
    for (let i = 0; i <= 100; i++) {
      const elapsed = i / 100 * 1.2;
      expect(easeFillVolume(200e-6, 0, elapsed, 1.2) + easeFillVolume(0, 200e-6, elapsed, 1.2)).toBeCloseTo(200e-6, 15);
    }
    expect(easeFillVolume(0, 1, 0.1, 1)).toBeCloseTo(0.004);
    expect(easeFillVolume(0, 1, 0.5, 1)).toBe(0.5);
    expect(easeFillVolume(0, 1, 0.9, 1)).toBeCloseTo(0.996);
    expect(easeFillVolume(0, 1, 0, 0)).toBe(1);
  });

  it('rejects open, crossing, touching and degenerate non-axis profiles', () => {
    expect(validateFillProfile(cylinder)).toEqual([]);
    expect(validateFillProfile([[0.01, 0], [0.02, 0.1], [0.01, 0.1]])).not.toEqual([]);
    expect(validateFillProfile([[0, 0], [0.04, 0.1], [0.04, 0], [0, 0.1]])).not.toEqual([]);
    expect(validateFillProfile([[0, 0], [0.04, 0], [0.04, 0.1], [0.02, 0.05], [0.04, 0], [0, 0.1]])).not.toEqual([]);
    expect(validateFillProfile([[0, 0], [0, 1], [0, 2]])).not.toEqual([]);
    expect(validateFillProfile([[0, 0], [0.04, 0], [0.02, 0], [0.04, 0.1], [0, 0.1]])).not.toEqual([]);
  });
});

describe('reusable liquid geometry', () => {
  it('reserves enough reusable space when clipping a non-convex round profile', () => {
    const corrugated: FillProfile = [[0, 0], [0.1, 0], [0.1, 0.1], ...Array.from({ length: 60 }, (_, i): [number, number] => [0.099 - i * 0.001, i % 2 ? 0.09 : 0.01]), [0, 0.1]];
    expect(validateFillProfile(corrugated)).toEqual([]);
    const geometry = createFillGeometry(corrugated);
    expect(() => updateFillGeometry(geometry, corrugated, volumeBelow(corrugated, 0.05))).not.toThrow();
    geometry.dispose();
  });
  it('draws centred box liquid above a base volume with a raised rectangular lip', () => {
    const box = { kind: 'box' as const, size: [0.2, 0.3, 0.4] };
    const geometry = createFillGeometry(box, 0.0015);
    const slice = updateFillGeometry(geometry, box, 0.004, 0.008, 0.0015);
    expect(slice.bottom).toBeCloseTo(-0.05, 12);
    expect(slice.level).toBeCloseTo(0, 12);
    const positions = geometry.getAttribute('position');
    expect(Math.max(...Array.from({ length: positions.count }, (_, i) => positions.getY(i)))).toBeCloseTo(0.0015, 8);
    expect(geometry.drawRange.count).toBe(60);
    updateFillGeometry(geometry, box, 0.004, 0.008, 0);
    expect(geometry.drawRange.count).toBe(36);
    geometry.dispose();
  });
  it('keeps its GPU buffers and builds outward winding with a closed top and meniscus', () => {
    const geometry = createFillGeometry(cylinder, 0.0015), position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal'), index = geometry.index!;
    updateFillGeometry(geometry, cylinder, 200e-6, 0, 0.0015);
    let tested = 0;
    const a = new Vector3(), b = new Vector3(), c = new Vector3(), n = new Vector3(), cross = new Vector3();
    for (let k = 0; k < geometry.drawRange.count; k += 3) {
      a.fromBufferAttribute(position, index.getX(k)); b.fromBufferAttribute(position, index.getX(k + 1)); c.fromBufferAttribute(position, index.getX(k + 2));
      cross.subVectors(b, a).cross(c.sub(a));
      if (cross.lengthSq() < 1e-22) continue;
      n.fromBufferAttribute(normal, index.getX(k));
      expect(cross.dot(n)).toBeGreaterThan(0); tested++;
    }
    expect(tested).toBeGreaterThan(100);
    updateFillGeometry(geometry, cylinder, 100e-6);
    expect(geometry.getAttribute('position')).toBe(position);
    expect(geometry.getAttribute('normal')).toBe(normal);
    expect(geometry.index).toBe(index);
    expect(geometry.getAttribute('uv').count).toBe(position.count);
    updateFillGeometry(geometry, cylinder, 0);
    expect(geometry.drawRange.count).toBe(0);
    geometry.dispose();
  });

  it('rebuilds 100 eased frames within the five millisecond CPU budget', () => {
    const geometry = createFillGeometry(flask, 0.0015);
    const frames = Array.from({ length: 100 }, (_, i) => easeFillVolume(0, 200e-6, (i + 1) / 100, 1));
    // Warm the actual hot path, then use whole-run medians to limit OS scheduling
    // noise when the other Vitest workers are busy. The five-ms budget is fixed.
    for (let warm = 0; warm < 5; warm++) for (const volume of frames) updateFillGeometry(geometry, flask, volume, 0, 0.0015);
    const samples = Array.from({ length: 5 }, () => {
      const start = performance.now();
      for (const volume of frames) updateFillGeometry(geometry, flask, volume, 0, 0.0015);
      return performance.now() - start;
    }).sort((a, b) => a - b);
    expect(samples[2]).toBeLessThan(5);
    geometry.dispose();
  });
});
