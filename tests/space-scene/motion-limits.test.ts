/**
 * Exercise-mode motion (docs/06 动作模式数据手册): opposite actions in the
 * contraction plan, the palm's grip point, single-hand and knee contacts, flat
 * palms near a surface, the shoulder's horizontal sweep and per-key body turns.
 */
import { describe, expect, it } from 'vitest';
import { Bone, Quaternion, Vector3 } from 'three';
import { contractionAt, contractionPlan } from '../../src/engines/space-scene/lib/contraction';
import { contactPlan, NO_CONTACT } from '../../src/engines/space-scene/lib/contact';
import { handFrame, handPlan, PALM, RELAXED, surfaceHeights, surfaceUnder } from '../../src/engines/space-scene/lib/hands';
import { equipmentJoints, heightOf, PALM_LIFT, placeFixed } from '../../src/engines/space-scene/lib/equipment';
import { isStanding, standCorrection, type FootPair } from '../../src/engines/space-scene/lib/stance';
import { anglesQuat, jointCandidates, type Angles } from '../../src/engines/space-scene/lib/rig';
import { EXERCISE_LIFT, EXERCISE_LIFT_MAX, exerciseLift, fitExerciseCamera } from '../../src/engines/space-scene/lib/camera';
import { gripPoint, makeGrip } from '../../src/engines/space-scene/stages/model3d/grip';
import { exerciseMotion } from '../../src/content/schema/fitness';

describe('contraction with both members of a pair', () => {
  // Pectoralis major's sheet lists shoulder flexion and extension as prime; a bench press runs flexion 80° → extension 25°.
  const muscles = new Map([['pec', { id: 'pec', actions: [{ joint: 'shoulder', movement: 'flexion', role: 'prime' }, { joint: 'shoulder', movement: 'extension', role: 'prime' }] }]]);
  const parts = [{ id: 'pec', muscle: 'pec' }];
  const keys = [{ 'shoulder.l': { flexion: 80 } as Angles }, { 'shoulder.l': { extension: 25 } as Angles }];
  const plan = contractionPlan({ exercise: { primary: ['pec'], secondary: [], stabilisers: [] }, muscles: muscles as never, parts, rigJoints: new Set(['shoulder.l']), keys });

  it('counts only the member the motion goes along: short at the top of the press, long at the chest', () => {
    expect(plan.terms.map((t) => t.movement)).toEqual(['flexion']);
    const at = (a: Angles) => contractionAt(plan, new Map([['shoulder.l', a]])).get('pec')!;
    expect(at({ flexion: 80 })).toBeCloseTo(1);
    expect(at({ extension: 25 })).toBeCloseTo(0);
  });

  it('lets a stronger role win over a weaker opposite', () => {
    const m = new Map([['x', { id: 'x', actions: [{ joint: 'shoulder', movement: 'flexion', role: 'assist' }, { joint: 'shoulder', movement: 'extension', role: 'prime' }] }]]);
    const p = contractionPlan({ exercise: { primary: ['x'], secondary: [], stabilisers: [] }, muscles: m as never, parts: [{ id: 'x', muscle: 'x' }], rigJoints: new Set(['shoulder.l']), keys });
    expect(p.terms.map((t) => t.movement)).toEqual(['extension']);
  });
});

describe('grip point', () => {
  // Elbow at the origin, the wrist 0.27 m below it.
  const rig = () => {
    const elbow = new Bone();
    const hand = new Bone();
    hand.position.set(0, -0.27, 0);
    elbow.add(hand);
    elbow.updateMatrixWorld(true);
    return { elbow, hand };
  };

  it('puts a numeric offset along the forearm to the palm centre, and turns it with the wrist', () => {
    const { hand } = rig();
    const g = makeGrip(hand, 0.08)!;
    const pos = new Vector3();
    const axis = new Vector3();
    gripPoint(g, pos, axis);
    expect(pos.y).toBeCloseTo(-0.35);
    expect(axis.y).toBeCloseTo(-1);
    // Wrist flexed 90° about X: the palm swings forward or back with it, the forearm stays.
    hand.quaternion.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
    hand.updateMatrixWorld(true);
    gripPoint(g, pos, axis);
    expect(pos.y).toBeCloseTo(-0.27);
    expect(Math.abs(pos.z)).toBeCloseTo(0.08);
    expect(axis.y).toBeCloseTo(-1);
  });

  it('takes the vector form in the rest frame, turned the same way', () => {
    const { hand } = rig();
    const g = makeGrip(hand, [0.013, -0.074, 0.039])!;
    const pos = new Vector3();
    gripPoint(g, pos, new Vector3());
    expect(pos.toArray().map((x) => +x.toFixed(4))).toEqual([0.013, -0.344, 0.039]);
    hand.quaternion.copy(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
    hand.updateMatrixWorld(true);
    gripPoint(g, pos, new Vector3());
    expect(pos.x).toBeCloseTo(-0.013);
    expect(pos.z).toBeCloseTo(-0.039);
  });
});

describe('single-hand and knee contacts', () => {
  const rig = { hands: true, handL: true, handR: true, feet: true, knees: true };

  it('holds one palm (a one-arm row) and pivots about the knees on the floor (bird dog)', () => {
    expect(contactPlan(['hand.l', 'knees'], rig, true, true)).toEqual({ ...NO_CONTACT, hands: 'hinge', grip: 'l', pivot: 'knees' });
    expect(contactPlan(['hand.r'], rig, false, true)).toEqual({ ...NO_CONTACT, hands: 'translate', grip: 'r' });
    expect(contactPlan(['hands', 'feet'], rig, true, true)).toEqual({ ...NO_CONTACT, hands: 'hinge', grip: 'both', pivot: 'feet' });
  });

  it('keeps the knees when they come first, and skips contacts the rig cannot show', () => {
    expect(contactPlan(['knees'], rig, false, true)).toEqual({ ...NO_CONTACT, knees: true });
    expect(contactPlan(['hand.l', 'knees'], { ...rig, knees: false }, true, true)).toEqual({ ...NO_CONTACT, hands: 'translate', grip: 'l' });
    expect(contactPlan(['knees', 'feet'], { ...rig, knees: false }, false, true)).toEqual({ ...NO_CONTACT, feet: true });
  });

  it('accepts the new kinds in the data, each once', () => {
    const keys = [{ phase: 'start', joints: {} }, { phase: 'end', joints: {} }];
    expect(exerciseMotion.safeParse({ contacts: ['hand.l', 'knees'], keys }).success).toBe(true);
    expect(exerciseMotion.safeParse({ contacts: ['knees', 'knees'], keys }).success).toBe(false);
  });
});

describe('flat palms', () => {
  it('lays a free hand flat within 2 cm of a surface, a held one never', () => {
    expect(handPlan({ equipment: { kind: 'floor' } }, 'l', true)).toBe(PALM);
    expect(handPlan({ equipment: { kind: 'floor' } }, 'l', false)).toBe(RELAXED);
    expect(handPlan({ equipment: { kind: 'dumbbell' } }, 'l', true).kind).toBe('fist');
    // One palm on the bench (a one-arm row): that hand flat, the other holds the dumbbell.
    const row = { root: { rotation: [66, 0, 0] }, contacts: ['hand.r' as const, 'knees' as const], equipment: [{ kind: 'dumbbell' as const, hand: 'left' as const }, { kind: 'bench' as const }] };
    expect(handPlan(row, 'r')).toBe(PALM);
    expect(handPlan(row, 'l').kind).toBe('fist');
  });

  it('finds the surface under a palm: the floor or a bench top, within 2 cm above or a little into it', () => {
    const heights = surfaceHeights([{ kind: 'bench', at: [0, -0.2, 0] }], { trunkY: 0.6, floor: 0, modelFloor: -0.9 });
    expect(heights[0]).toBe(0);
    expect(heights[1]).toBeCloseTo(0.4);
    expect(surfaceUnder(0.4 + PALM_LIFT + 0.015, heights)).toBeCloseTo(0.4);
    expect(surfaceUnder(PALM_LIFT - 0.03, heights)).toBe(0);
    expect(surfaceUnder(0.2, heights)).toBeNull();
  });

  it('runs the fingers on along a forearm lying on the floor (a forearm plank), not toward the head', () => {
    // Body frame of a plank turned 84° about X; the forearm lies along the floor, pointing toward the head side.
    const a = (84 * Math.PI) / 180;
    const up = [0, Math.cos(a), -Math.sin(a)] as const;
    const forearm = [0.2, Math.sin(a), Math.cos(a)] as const;
    const f = handFrame('l', PALM, { forearm, sceneUp: up });
    const n = Math.hypot(...forearm);
    // The fingers follow the forearm's own line (its x lean too).
    expect(f.y[0]).toBeCloseTo(0.2 / n, 2);
  });
});

describe('horizontal sweep of the shoulder', () => {
  // A left shoulder's axes as the muscle glbs export them (rig order: flexion, abduction, horizontal adduction).
  const axes = { flexion: [-1, 0, 0], abduction: [0, 0, 1], 'horizontal-adduction': [0, -1, 0] };
  const hand = (angles: Angles) => {
    const q = anglesQuat(axes, angles);
    return new Vector3(0, -1, 0).applyQuaternion(new Quaternion(q[0], q[1], q[2], q[3]));
  };

  it('moves the hand of a low, forward-hanging arm forward and across the body', () => {
    const before = hand({ flexion: 30 });
    const after = hand({ flexion: 30, 'horizontal-adduction': 40 });
    // Left arm: medial is −X, forward +Z.
    expect(after.x).toBeLessThan(before.x - 0.2);
    expect(after.z).toBeGreaterThan(0.3);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('sweeps an arm raised to the side forward instead of twisting it (a cable fly)', () => {
    const side = hand({ abduction: 85 });
    const swept = hand({ abduction: 85, 'horizontal-adduction': 40 });
    expect(swept.z).toBeGreaterThan(0.6);
    expect(swept.x).toBeLessThan(side.x - 0.2);
  });
});

describe('per-key body turn', () => {
  it('lets a key tilt the body (a curl-up), in the motion root form', () => {
    const keys = [
      { phase: 'start', joints: {} },
      { phase: 'end', joints: {}, root: { rotation: [-80, 0, 0] } },
    ];
    expect(exerciseMotion.safeParse({ root: { rotation: [-90, 0, 0] }, keys }).success).toBe(true);
    expect(exerciseMotion.safeParse({ keys: [keys[0], { ...keys[1], root: { rotation: [1, 2] } }] }).success).toBe(false);
  });
});

describe('equipment additions', () => {
  const keys = [{ phase: 'start', joints: {} }, { phase: 'end', joints: {} }];
  const ok = (equipment: unknown) => exerciseMotion.safeParse({ equipment, keys }).success;

  it('holds a dumbbell on end between both palms (a goblet squat), the hands open round it', () => {
    expect(ok({ kind: 'dumbbell', hold: 'vertical' })).toBe(true);
    expect(ok({ kind: 'dumbbell', hold: 'along', hand: 'left' })).toBe(true);
    expect(ok({ kind: 'barbell', hold: 'vertical' })).toBe(false);
    expect(handPlan({ equipment: { kind: 'dumbbell', hold: 'vertical' } }, 'l')).toBe(RELAXED);
    expect(handPlan({ equipment: { kind: 'dumbbell', hold: 'vertical', hand: 'right' } }, 'r').kind).toBe('fist');
    expect(ok({ kind: 'dumbbell', hold: 'both' })).toBe(true);
    expect(handPlan({ equipment: { kind: 'dumbbell', hold: 'both' } }, 'r')).toBe(RELAXED);
  });

  it('pulls a cable on an ankle cuff, leaving the hands free', () => {
    expect(ok({ kind: 'cable', to: 'ankle.l', at: [0.6, -0.9, 0] })).toBe(true);
    expect(ok({ kind: 'cable', to: 'feet', at: [0.6, -0.9, 0] })).toBe(false);
    expect(ok({ kind: 'band', to: 'ankle.r', at: [0, -0.9, 0.5] })).toBe(false);
    expect(equipmentJoints({ kind: 'cable', to: 'ankle.r' })).toEqual(['ankle.r']);
    expect(handPlan({ equipment: { kind: 'cable', to: 'ankle.l', at: [0.6, -0.9, 0] } } as never, 'l')).toBe(RELAXED);
  });

  it('stands a wall and a post on the floor at the trunk + at, the body still standing', () => {
    expect(ok([{ kind: 'wall', at: [0, 0, -0.3] }, { kind: 'post', at: [0.4, 0, 0.2], height: 1 }])).toBe(true);
    expect(ok({ kind: 'post', turn: 30 })).toBe(false);
    const ctx = { trunk: [0, 1, 0] as const, palms: null, modelFloor: -0.05 };
    expect(placeFixed({ kind: 'wall', at: [0, 0, -0.3] }, ctx, null)).toEqual([0, -0.05, -0.3]);
    expect(placeFixed({ kind: 'post', at: [0.4, 0, 0] }, ctx, -0.2)).toEqual([0.4, -0.2, 0]);
    expect(heightOf({ kind: 'wall' })).toBe(2);
    expect(heightOf({ kind: 'post' })).toBe(1.1);
    expect(isStanding([0, 0, 0], [{ kind: 'wall' }, { kind: 'post' }])).toBe(true);
  });

  it('anchors the balls of the feet on a step and lets the heels drop (a calf raise with heel drop)', () => {
    const foot = (heelY: number, ballY: number): FootPair => ({ heel: [0.1, heelY, -0.05], ball: [0.1, ballY, 0.14] });
    const ref = [foot(0, 0)];
    // The ankle dorsiflexed: the heel 5 cm down, the ball 1 cm up.
    const now = [foot(-0.05, 0.01)];
    expect(standCorrection(now, ref, undefined, true)[1]).toBeCloseTo(-0.01);
    // On the floor the heel would hold instead and lift the body.
    expect(standCorrection(now, ref)[1]).toBeCloseTo(0.05);
  });
});

describe('exercise camera under the caption card', () => {
  it('lifts the figure by the card’s share of the stage while presenting, within a cap', () => {
    expect(exerciseLift(0, 900)).toBe(EXERCISE_LIFT);
    expect(exerciseLift(150, 900)).toBeCloseTo(EXERCISE_LIFT + 150 / 900);
    expect(exerciseLift(800, 900)).toBe(EXERCISE_LIFT_MAX);
    // The lifted frame still holds the figure: a point at the bottom of the sweep stays above the card.
    const pts = [0, 0, 0, 0, 1.8, 0, 0.3, 0.9, 0];
    const cam = fitExerciseCamera(pts, [0, 0, 1], 16 / 9, { lift: exerciseLift(150, 900) })!;
    const d = cam.position[2] - 0;
    const tanV = Math.tan((cam.fov! * Math.PI) / 360);
    const bottom = (0 - cam.target[1]) / (tanV * d); // share of the half height, −1 = the frame's bottom edge
    expect(bottom).toBeGreaterThan(-1 + (2 * 150) / 900);
  });
});

describe('wrist actions on a rig without wrist joints', () => {
  it('fall back to the hand joint (the demo buttons, the contraction plan, validate)', () => {
    expect(jointCandidates('wrist', 'flexion', 'l')).toEqual(['wrist.l', 'wrist', 'hand.l']);
    expect(jointCandidates('forearm', 'pronation', 'r')).toEqual(['forearm.r', 'forearm', 'elbow.r']);
    expect(jointCandidates('shoulder', 'flexion', 'r')).toEqual(['shoulder.r', 'shoulder']);
  });
});
