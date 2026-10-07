import { describe, expect, it } from 'vitest';
import { DEFAULT_CAMERA, fitCameraToAspect, resolveTargetCamera, roundCamera, tweenCamera } from '../../src/engines/space-scene/lib/camera';

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

describe('tweenCamera', () => {
  it('eases from start to end', () => {
    expect(tweenCamera(a, b, 0)).toEqual({ position: [0, 0, 10], target: [0, 0, 0], fov: 40 });
    expect(tweenCamera(a, b, 1)).toEqual({ position: [10, 0, 0], target: [0, 2, 0], fov: 30 });
    const mid = tweenCamera(a, b, 0.5);
    expect(mid.position[0]).toBeCloseTo(5);
    expect(mid.target[1]).toBeCloseTo(1);
    expect(tweenCamera(a, b, 0.25).position[0]).toBeLessThan(2.5); // ease-in
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
    const narrow = fitCameraToAspect(cam, 0.475);
    expect(narrow.position[2]).toBeCloseTo(20);
    expect(fitCameraToAspect(narrow, 0.475, true).position[2]).toBeCloseTo(10);
  });
});
