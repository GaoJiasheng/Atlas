import { describe, expect, it } from 'vitest';
import {
  bakeFlowPath,
  FLOW_SAMPLES_MAX,
  FLOW_SAMPLES_MIN,
  flowParticleU,
  flowSampleCount,
  isClosedPath,
  sampleBaked,
  samplePath,
} from '../../src/engines/space-scene/lib/flow-curve';

const close = (a: readonly number[], b: readonly number[], digits = 5) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, digits));

describe('flow curves', () => {
  const straight = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
  ];
  const symmetric = [
    [-1, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
  ];

  it('samples the ends and the middle of an open path (u = 0, 0.5, 1)', () => {
    close(samplePath(straight, 0), [0, 0, 0]);
    close(samplePath(straight, 0.5), [1, 0, 0]);
    close(samplePath(straight, 1), [2, 0, 0]);
    // A symmetric arch peaks at its middle control point.
    close(samplePath(symmetric, 0), [-1, 0, 0]);
    close(samplePath(symmetric, 0.5), [0, 1, 0]);
    close(samplePath(symmetric, 1), [1, 0, 0]);
  });

  it('detects closed loops and wraps u', () => {
    const loop = [
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
      [1, 0, 0],
    ];
    expect(isClosedPath(loop)).toBe(true);
    expect(isClosedPath(straight)).toBe(false);
    close(samplePath(loop, 0), [1, 0, 0]);
    close(samplePath(loop, 1), [1, 0, 0]);
    close(samplePath(loop, 1.25), samplePath(loop, 0.25));
  });

  it('bakes evenly spaced samples that match the curve', () => {
    const baked = bakeFlowPath(straight, 64);
    expect(baked.count).toBe(64);
    expect(baked.points).toHaveLength(64 * 3);
    expect(baked.length).toBeCloseTo(2, 5);
    expect(baked.closed).toBe(false);
    close(sampleBaked(baked, 0), [0, 0, 0]);
    close(sampleBaked(baked, 0.5), [1, 0, 0], 4);
    close(sampleBaked(baked, 1), [2, 0, 0]);
    const arch = bakeFlowPath(symmetric);
    close(sampleBaked(arch, 0.5), samplePath(symmetric, 0.5), 2);
  });

  it('bakes more samples on longer paths (64–512), so tight bends are not cut', () => {
    expect(flowSampleCount(0)).toBe(FLOW_SAMPLES_MIN);
    expect(flowSampleCount(0.2)).toBe(FLOW_SAMPLES_MIN);
    expect(flowSampleCount(2)).toBe(251);
    expect(flowSampleCount(40)).toBe(FLOW_SAMPLES_MAX);
    // A 4 m path with right-angle corners every 0.25 m (rounded by the curve): the baked polyline keeps within 3 mm of it.
    const zigzag: number[][] = [];
    for (let i = 0; i <= 16; i++) zigzag.push([i * 0.25, i % 2 === 0 ? 0 : 0.25, 0]);
    const baked = bakeFlowPath(zigzag);
    expect(baked.count).toBe(flowSampleCount(baked.length));
    expect(baked.count).toBeGreaterThan(256);
    let worst = 0;
    for (let k = 0; k < 1000; k++) {
      const u = (k + 0.5) / 1000;
      const a = sampleBaked(baked, u);
      const b = samplePath(zigzag, u);
      worst = Math.max(worst, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
    expect(worst).toBeLessThan(0.003);
    // The old fixed 64 samples cut those corners by centimetres.
    const coarse = bakeFlowPath(zigzag, 64);
    let coarseWorst = 0;
    for (let k = 0; k < 1000; k++) {
      const u = (k + 0.5) / 1000;
      const a = sampleBaked(coarse, u);
      const b = samplePath(zigzag, u);
      coarseWorst = Math.max(coarseWorst, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
    expect(coarseWorst).toBeGreaterThan(worst * 4);
  });

  it('advances particles at speed / length per second and wraps', () => {
    expect(flowParticleU(0, 1, 1, 4)).toBeCloseTo(0.25);
    expect(flowParticleU(0.9, 1, 1, 4)).toBeCloseTo(0.15);
    expect(flowParticleU(0.5, 0, 3, 4)).toBeCloseTo(0.5);
    expect(flowParticleU(0.2, 10, 0, 4)).toBeCloseTo(0.2);
  });
});
