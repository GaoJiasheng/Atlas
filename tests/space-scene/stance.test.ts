/**
 * Standing exercises (docs/16 §6.5): planted feet, the extension demo of a
 * hinge straight at rest, and the camera backing off a standing lift's bar.
 */
import { describe, expect, it } from 'vitest';
import { footRoll, footSlip, footWeight, isStanding, LIFT_BAND, standCorrection, type FootPair } from '../../src/engines/space-scene/lib/stance';
import { demoAngles } from '../../src/engines/space-scene/lib/rig';
import { BAR, heldSpan } from '../../src/engines/space-scene/lib/equipment';
import { fitSpan, SPAN_FILL } from '../../src/engines/space-scene/lib/camera';

const foot = (x: number, y: number, z: number, heelY = y, ballY = y): FootPair => ({ heel: [x, heelY, z - 0.05], ball: [x, ballY, z + 0.13] });

describe('planted feet', () => {
  it('drops the body so the lowest contact stays on the floor (a squat lifts both feet toward the pelvis)', () => {
    const ref = [foot(0.1, -0.9, 0), foot(-0.1, -0.9, 0)];
    const now = [foot(0.1, -0.7, 0.04), foot(-0.1, -0.7, 0.04)];
    const c = standCorrection(now, ref);
    expect(c[1]).toBeCloseTo(-0.2);
    expect(c[2]).toBeCloseTo(-0.04);
    expect(c[0]).toBeCloseTo(0);
  });

  it('pivots a calf raise on the ball: the toes stay, the body rises', () => {
    const ref = [foot(0.1, -0.9, 0)];
    // The heel rose 6 cm, the ball sank 1 cm (the ankle turned about itself).
    const now = [{ heel: [0.1, -0.84, -0.05], ball: [0.1, -0.91, 0.14] } as FootPair];
    const c = standCorrection(now, ref);
    expect(c[1]).toBeCloseTo(0.01);
    expect(c[2]).toBeCloseTo(-0.01);
    expect(footRoll(-0.84, -0.91)).toBe(1);
    expect(footRoll(-0.9, -0.9)).toBe(0.5);
  });

  it('keeps the standing foot of a single-leg move fixed and lets the lifted one go', () => {
    const ref = [foot(0.1, -0.9, 0), foot(-0.1, -0.9, 0)];
    // Left foot (standing) drifted 3 cm forward with the turn; right foot is 12 cm up and back.
    const now = [foot(0.1, -0.85, 0.03), foot(-0.1, -0.73, -0.4)];
    const c = standCorrection(now, ref);
    expect(c[2]).toBeCloseTo(-0.03);
    expect(c[1]).toBeCloseTo(-0.05);
    expect(footSlip(now, ref, c)).toBeCloseTo(0);
    expect(footWeight(-0.73, -0.85)).toBe(0);
    expect(footWeight(-0.85 + LIFT_BAND / 2, -0.85)).toBeCloseTo(0.5);
  });

  it('reports the slip two feet share when they move apart', () => {
    const ref = [foot(0.1, -0.9, 0), foot(-0.1, -0.9, 0)];
    const now = [foot(0.12, -0.8, 0), foot(-0.12, -0.8, 0)];
    const c = standCorrection(now, ref);
    expect(c[0]).toBeCloseTo(0);
    expect(footSlip(now, ref, c)).toBeCloseTo(0.02);
  });

  it('counts only upright exercises without a bench, floor or bars as standing', () => {
    expect(isStanding([0, 0, 0], [])).toBe(true);
    expect(isStanding([-10, 30, 0], [{ kind: 'barbell' }])).toBe(true);
    expect(isStanding([-90, 0, 0], [])).toBe(false);
    expect(isStanding([0, 0, 0], [{ kind: 'bench' }])).toBe(false);
    expect(isStanding([0, 0, 0], [{ kind: 'floor' }])).toBe(false);
  });
});

describe('demo of a hinge straight at rest', () => {
  it('swings knee and elbow extension back from flexion, never past straight', () => {
    expect(demoAngles('knee', 'extension', 60, 0)).toEqual({ flexion: 60 });
    expect(demoAngles('knee', 'extension', 60, 1)).toEqual({ flexion: 0 });
    expect(demoAngles('elbow', 'extension', 30, 0.5)).toEqual({ flexion: 15 });
    expect(demoAngles('hip', 'extension', 20, 1)).toEqual({ extension: 20 });
    expect(demoAngles('knee', 'flexion', 55, 1)).toEqual({ flexion: 55 });
  });
});

describe('a standing lift keeps its bar off the side panels', () => {
  const press = { root: { rotation: [0, 0, 0] }, equipment: { kind: 'barbell' as const } };
  it('finds the bar of standing lifts only', () => {
    expect(heldSpan(press)).toEqual({ half: BAR.length / 2, yaw: 0 });
    expect(heldSpan({ root: { rotation: [-90, 0, 0] }, equipment: [{ kind: 'barbell' }, { kind: 'bench' }] })).toBeNull();
    expect(heldSpan({ root: { rotation: [0, 0, 0] }, equipment: { kind: 'dumbbell' } })).toBeNull();
    expect(heldSpan(undefined)).toBeNull();
  });

  it('backs the camera off until the bar ends sit inside the fill, never closer', () => {
    const cam = { position: [0, 0, 4] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 22 };
    const aspect = 1.5;
    const out = fitSpan(cam, { half: 1.1, yaw: 0 }, aspect);
    const d = out.position[2];
    const tanH = Math.tan((22 * Math.PI) / 360) * aspect;
    expect(1.1 / (d * tanH)).toBeCloseTo(SPAN_FILL);
    expect(out.target).toEqual(cam.target);
    const far = { ...cam, position: [0, 0, 12] as [number, number, number] };
    expect(fitSpan(far, { half: 1.1, yaw: 0 }, aspect)).toBe(far);
    // End-on (the body turned 90°): no move needed.
    expect(fitSpan(cam, { half: 1.1, yaw: 90 }, aspect).position[2]).toBeCloseTo(4);
    // Stacked HUD (phones): the bar may leave the frame.
    expect(fitSpan(cam, { half: 1.1, yaw: 0 }, 0.5)).toBe(cam);
  });
});
