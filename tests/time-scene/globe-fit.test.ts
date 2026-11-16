import { describe, expect, it } from 'vitest';
import { GLOBE_FIT_RATIO, globeDiameter, globeFitZoom, zoomForDiameter } from '../../src/engines/time-scene/lib/globeFit';

describe('globe fit (rotation map)', () => {
  it('matches the disc MapLibre drew (measured 2026-11-16 at 1440 × 900: about 352 px at z 1.3, 10° N)', () => {
    // The measured value used rim points 89.9° from the centre, just inside the silhouette.
    expect(globeDiameter(1.3, 10, 900)).toBeGreaterThan(352);
    expect(globeDiameter(1.3, 10, 900)).toBeLessThan(365);
  });
  it('inverts', () => {
    for (const [z, lat] of [[0.5, 0], [1.2, -65], [2.4, 40]] as const) expect(zoomForDiameter(globeDiameter(z, lat, 820), lat, 820)).toBeCloseTo(z, 9);
  });
  it('fits a disc a little larger than the free rect, leaves close-ups and smaller discs alone, never zooms in', () => {
    const lat = -65, H = 900;
    const side = 490;
    const near = zoomForDiameter(side * 1.4, lat, H);
    const fitted = globeFitZoom(near, lat, H, side, 760);
    expect(globeDiameter(fitted, lat, H)).toBeCloseTo(side, 6);
    expect(fitted).toBeLessThan(near);
    const close = zoomForDiameter(side * (GLOBE_FIT_RATIO + 0.1), lat, H);
    expect(globeFitZoom(close, lat, H, side, 760)).toBe(close);
    const small = zoomForDiameter(side * 0.8, lat, H);
    expect(globeFitZoom(small, lat, H, side, 760)).toBe(small);
    expect(globeFitZoom(near, lat, H, 0, 760)).toBe(near);
  });
});
