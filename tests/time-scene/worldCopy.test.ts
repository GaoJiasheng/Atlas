import { describe, expect, it } from 'vitest';
import { pickWorldCopy, projectNearCentre, type LngLat } from '../../src/engines/time-scene/lib/geo';

/** Mercator-like stand-in: x is linear in longitude around the camera centre. */
function camera(centreLng: number, width = 1000, pxPerDeg = 4) {
  const project = ([lng, lat]: LngLat) => ({ x: width / 2 + (lng - centreLng) * pxPerDeg, y: 300 - lat });
  return { project, centreX: width / 2 };
}

describe('pickWorldCopy', () => {
  it('keeps the main copy when the camera looks at it', () => {
    const cam = camera(10);
    expect(pickWorldCopy(2, (l) => cam.project([l, 0]).x, cam.centreX)).toBe(2);
  });

  it('moves a longitude west of the antimeridian into the copy the camera looks at', () => {
    // Camera over the Pacific east of the dateline view: centre 175E; Oahu is -158 (= 202).
    const cam = camera(175);
    expect(pickWorldCopy(-158, (l) => cam.project([l, 0]).x, cam.centreX)).toBe(202);
    // The reverse: centre -170, a point at 175 belongs to the copy at -185.
    const west = camera(-170);
    expect(pickWorldCopy(175, (l) => west.project([l, 0]).x, west.centreX)).toBe(-185);
  });

  it('is stable for unwrapped inputs already past 180', () => {
    const cam = camera(-158);
    expect(pickWorldCopy(202, (l) => cam.project([l, 0]).x, cam.centreX)).toBe(-158);
    const near = camera(190);
    expect(pickWorldCopy(202, (l) => near.project([l, 0]).x, near.centreX)).toBe(202);
  });
});

describe('projectNearCentre', () => {
  it('projects the Kido Butai mid-point on screen from either side of the dateline', () => {
    const mid: LngLat = [180.5, 35]; // middle of the unwrapped Hitokappu -> Oahu path
    for (const centre of [175, -175, -158, 150]) {
      const cam = camera(centre);
      const p = projectNearCentre(cam.project, mid, cam.centreX);
      expect(Math.abs(p.x - cam.centreX)).toBeLessThan(180 * 4);
      expect(Math.abs(p.lng - mid[0]) % 360).toBe(0); // same place, some world copy
    }
  });

  it('returns the longitude used', () => {
    const cam = camera(175);
    expect(projectNearCentre(cam.project, [-158, 21], cam.centreX).lng).toBe(202);
  });
});
