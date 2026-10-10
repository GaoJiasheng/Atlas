import { describe, expect, it } from 'vitest';
import {
  COVER_FILL,
  COVER_MAX_HEIGHT,
  DEFAULT_CAMERA,
  fitCameraToAspect,
  fitSphereCamera,
  referenceCamera,
  resolveTargetCamera,
  roundCamera,
  transitionCamera,
  tweenCamera,
} from '../../src/engines/space-scene/lib/camera';

const a = { position: [0, 0, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 40 };
const b = { position: [10, 0, 0] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 30 };
const views = { exploded: { camera: b } };

describe('resolveTargetCamera', () => {
  it('prefers an explicit camera, then the view preset, then the inherited one', () => {
    expect(resolveTargetCamera({ explicit: a, view: 'exploded', views, inherited: null })).toBe(a);
    expect(resolveTargetCamera({ explicit: null, view: 'exploded', views, inherited: a })).toEqual(b);
    expect(resolveTargetCamera({ explicit: null, view: 'xray', views, inherited: a })).toBe(a);
    expect(resolveTargetCamera({ explicit: null, view: 'xray', views, inherited: null })).toBe(DEFAULT_CAMERA);
  });
});

const dist = (p: readonly number[], q: readonly number[]) => Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);

describe('tweenCamera', () => {
  it('starts and ends exactly on the two cameras', () => {
    const start = tweenCamera(a, b, 0);
    start.position.forEach((v, i) => expect(v).toBeCloseTo(a.position[i]!));
    expect(start.fov).toBe(40);
    expect(tweenCamera(a, b, 1)).toEqual({ position: [10, 0, 0], target: [0, 2, 0], fov: 30 });
  });
  it('swings around the target instead of cutting through the model', () => {
    // a looks from +Z, b from +X: a straight line would pass within ~7 of the origin.
    for (const k of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const cam = tweenCamera(a, b, k);
      expect(dist(cam.position, cam.target)).toBeGreaterThan(9.99);
    }
    const mid = tweenCamera(a, b, 0.5);
    expect(mid.target[1]).toBeCloseTo(1);
    expect(mid.position[0]).toBeGreaterThan(6); // on the arc, not the chord (5)
    expect(tweenCamera(a, b, 0.25).position[0]).toBeLessThan(5); // ease-in
  });
  it('takes the short way round and interpolates the radius geometrically', () => {
    const from = { position: [0, 0, 2] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    const to = { position: [-8, 0, -0.01] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    const mid = tweenCamera(from, to, 0.5);
    expect(dist(mid.position, mid.target)).toBeCloseTo(4, 3); // sqrt(2 * 8)
    expect(mid.position[0]).toBeLessThan(0); // via -X (short way), not +X
  });
  it('rounds for the URL', () => {
    expect(roundCamera({ position: [1.23456, 2, 3], target: [0, 0.00049, 0], fov: 40 })).toEqual({
      position: [1.235, 2, 3],
      target: [0, 0, 0],
    });
  });
});

describe('fitCameraToAspect', () => {
  it('pulls back on narrow stages only, and inverts exactly', () => {
    const cam = { position: [0, 0, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    expect(fitCameraToAspect(cam, 1.6)).toBe(cam);
    const narrow = fitCameraToAspect(cam, 0.8);
    expect(narrow.position[2]).toBeCloseTo(20);
    expect(fitCameraToAspect(narrow, 0.8, true).position[2]).toBeCloseTo(10);
    // Phones: half the pull-back (1.6 × 0.5 / 0.4 = 2), never closer than the authored camera.
    expect(fitCameraToAspect(cam, 0.4).position[2]).toBeCloseTo(20);
    expect(fitCameraToAspect(cam, 0.46).position[2]).toBeLessThan(fitCameraToAspect(cam, 0.8).position[2]);
    expect(fitCameraToAspect(fitCameraToAspect(cam, 0.46), 0.46, true).position[2]).toBeCloseTo(10);
  });
});

describe('referenceCamera', () => {
  const bounds = { min: [-1.3, -0.75, -0.65] as [number, number, number], max: [1.3, 0.35, 0.65] as [number, number, number] };
  it('looks straight at the section plane with a long lens, framing the model', () => {
    const cam = referenceCamera(bounds, 'xy', 1.5);
    expect(cam.target).toEqual([0, -0.2, 0]);
    expect(cam.position[0]).toBeCloseTo(0);
    expect(cam.position[1]).toBeCloseTo(-0.2);
    expect(cam.fov).toBeLessThan(20);
    // Half the model width fits inside the horizontal half field of view.
    const halfH = Math.tan(((cam.fov! * Math.PI) / 180) / 2) * (cam.position[2] - 0.65);
    expect(halfH * 1.5).toBeGreaterThan(1.3);
  });
  it('side and plan views use the other axes', () => {
    expect(referenceCamera(bounds, 'zy', 1).position[0]).toBeGreaterThan(5);
    expect(referenceCamera(bounds, 'xz', 1).position[1]).toBeGreaterThan(5);
  });
});

describe('transitionCamera', () => {
  const ch1 = { position: [3, 2, 4] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
  it('a preset always lands on its own camera (chapter without a camera of its own)', () => {
    // Chapter 2 inherits chapter 1's camera as its baseline and has an exploded view preset (b).
    // Picking preset 01 stores ch1's camera, which equals that baseline: it must still win over b.
    expect(transitionCamera({ reason: 'preset', stored: ch1, baseline: ch1, own: null, view: 'exploded', views })).toBe(ch1);
  });
  it('chapters: own camera, else view preset, else inherited', () => {
    expect(transitionCamera({ reason: 'chapter', stored: ch1, baseline: ch1, own: ch1, view: 'exploded', views })).toBe(ch1);
    expect(transitionCamera({ reason: 'chapter', stored: ch1, baseline: ch1, own: null, view: 'exploded', views })).toEqual(b);
    expect(transitionCamera({ reason: 'chapter', stored: ch1, baseline: ch1, own: null, view: 'xray', views })).toBe(ch1);
    // A URL camera that differs from the baseline is explicit.
    expect(transitionCamera({ reason: 'url', stored: a, baseline: ch1, own: null, view: 'exploded', views })).toBe(a);
  });
  it('snap does not pick a new target', () => {
    expect(transitionCamera({ reason: 'snap', stored: ch1, baseline: ch1, own: null, view: 'assembled', views })).toBeNull();
  });
});

describe('fitSphereCamera (default cover camera)', () => {
  const view = { position: [3, 2, 4] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 30 };
  it('centres the sphere, keeps the view direction and fills ~75 % of the stage width', () => {
    const cam = fitSphereCamera(view, [0.5, 1, 0], 1.2, 1.6);
    expect(cam.target).toEqual([0.5, 1, 0]);
    expect(cam.fov).toBe(30);
    const d = [cam.position[0] - 0.5, cam.position[1] - 1, cam.position[2]];
    const len = Math.hypot(d[0]!, d[1]!, d[2]!);
    const dir0 = [3, 2, 4].map((v) => v / Math.hypot(3, 2, 4));
    d.forEach((v, i) => expect(v / len).toBeCloseTo(dir0[i]!, 6));
    // The sphere's silhouette: tan(asin(r / d)) against the half width tan(hfov / 2).
    const tv = Math.tan((30 * Math.PI) / 360);
    const share = Math.tan(Math.asin(1.2 / len)) / (tv * 1.6);
    expect(share).toBeCloseTo(COVER_FILL, 6);
  });
  it('overruns the height of very wide stages by at most 30 %', () => {
    const cam = fitSphereCamera(view, [0, 0, 0], 1, 3);
    const len = Math.hypot(...cam.position);
    const tv = Math.tan((30 * Math.PI) / 360);
    expect(Math.tan(Math.asin(1 / len)) / tv).toBeCloseTo(COVER_MAX_HEIGHT, 6);
  });
});
