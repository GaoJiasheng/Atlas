/**
 * Exercise mode (docs/06 动作模式数据手册): the contact solver, contraction
 * computed from the joints, the exercise camera and the motion schema.
 */
import { describe, expect, it } from 'vitest';
import { contactPlan, handsCorrection, hingeAngle } from '../../src/engines/space-scene/lib/contact';
import { along, contractionAt, contractionPlan, ISOMETRIC, ROLE_WEIGHT } from '../../src/engines/space-scene/lib/contraction';
import { defaultContacts } from '../../src/engines/space-scene/lib/equipment';
import { EXERCISE_VIEWS, exercisePosture, fitExerciseCamera, viewDirection } from '../../src/engines/space-scene/lib/camera';
import { exerciseMotion } from '../../src/content/schema/fitness';
import type { Angles } from '../../src/engines/space-scene/lib/rig';

describe('contact solver', () => {
  it('a chin-up: the palms stay on the bar, so the body rises as the elbows bend', () => {
    // The first key hangs with the palms at 1.9 m; bending the elbows brings the palms 0.35 m down toward the shoulders.
    const ref = [0, 1.9, 0.05] as const;
    const now = [0, 1.55, 0.08] as const;
    const c = handsCorrection(now, ref);
    expect(c[1]).toBeCloseTo(0.35);
    expect(c[2]).toBeCloseTo(-0.03);
  });

  it('a push-up pivots about the feet so the palms keep their height', () => {
    const pivot = [0, 0, 1] as const;
    // The palms rose 0.1 m as the elbows bent (the body is held up by them): turn the body so they are back at 0.
    const ref = [0, 0, -0.4] as const;
    const now = [0, 0.1, -0.4] as const;
    const a = hingeAngle(now, ref, pivot);
    const vy = now[1] - pivot[1];
    const vz = now[2] - pivot[2];
    // Rotated about X through the pivot, the palms land on the floor height.
    const y = pivot[1] + vy * Math.cos(a) - vz * Math.sin(a);
    expect(y).toBeCloseTo(0, 6);
    expect(Math.abs(a)).toBeLessThan(0.2);
    expect(hingeAngle(pivot, ref, pivot)).toBe(0);
  });

  it('meets the first contact the rig can show, in priority order', () => {
    const rig = { hands: true, feet: true };
    expect(contactPlan(['hands'], rig, false, true)).toMatchObject({ hands: 'translate', feet: false });
    expect(contactPlan(['hands', 'feet'], rig, true, true)).toMatchObject({ hands: 'hinge', feet: false });
    expect(contactPlan(['hands', 'feet'], rig, false, true)).toMatchObject({ hands: 'translate', feet: false });
    expect(contactPlan(['feet', 'hands'], rig, true, true)).toMatchObject({ hands: null, feet: true });
    expect(contactPlan(['seat'], rig, false, true)).toMatchObject({ hands: null, feet: false });
    // Written contacts fall through to the next the rig has; a default pair without hands is dropped whole.
    expect(contactPlan(['hands', 'feet'], { hands: false, feet: true }, false, true)).toMatchObject({ hands: null, feet: true });
    expect(contactPlan(['hands', 'feet'], { hands: false, feet: true }, true, false)).toMatchObject({ hands: null, feet: false });
    // A push-up hinge needs no ankles (it pivots about the toe tips).
    expect(contactPlan(['hands', 'feet'], { hands: true, feet: false }, true, false)).toMatchObject({ hands: 'hinge', feet: false });
  });

  it('takes the contacts from the equipment when the data names none', () => {
    expect(defaultContacts({ equipment: { kind: 'pull-up-bar' } })).toEqual(['hands']);
    expect(defaultContacts({ equipment: [{ kind: 'dip-bars' }] })).toEqual(['hands']);
    expect(defaultContacts({ root: { rotation: [70, 0, 0] }, equipment: [{ kind: 'floor' }] })).toEqual(['hands', 'feet']);
    expect(defaultContacts({ root: { rotation: [-90, 0, 0] }, equipment: [{ kind: 'floor' }] })).toEqual([]);
    expect(defaultContacts({ root: { rotation: [-90, 0, 0] }, equipment: [{ kind: 'barbell' }, { kind: 'bench' }] })).toEqual(['seat']);
    expect(defaultContacts({ equipment: [{ kind: 'barbell' }] })).toEqual(['feet']);
    expect(defaultContacts({ equipment: [{ kind: 'step' }] })).toEqual(['feet']);
    expect(defaultContacts({ feet: 'free' })).toEqual([]);
    expect(defaultContacts({ contacts: ['feet', 'hands'], equipment: { kind: 'pull-up-bar' } })).toEqual(['feet', 'hands']);
  });
});

describe('contraction from motion', () => {
  const muscles = new Map([
    ['biceps-brachii', { id: 'biceps-brachii', actions: [{ joint: 'elbow', movement: 'flexion', role: 'prime' }, { joint: 'forearm', movement: 'supination', role: 'assist' }] }],
    ['triceps-brachii', { id: 'triceps-brachii', actions: [{ joint: 'elbow', movement: 'extension', role: 'prime' }] }],
    ['rectus-abdominis', { id: 'rectus-abdominis', actions: [{ joint: 'trunk', movement: 'flexion', role: 'prime' }] }],
    ['external-oblique', { id: 'external-oblique', actions: [{ joint: 'trunk', movement: 'lateral-flexion', role: 'prime' }] }],
    ['latissimus-dorsi', { id: 'latissimus-dorsi', actions: [{ joint: 'shoulder', movement: 'extension', role: 'prime' }, { joint: 'shoulder', movement: 'adduction', role: 'stabilise' }] }],
  ] as const);
  const parts = [
    { id: 'biceps-brachii', muscle: 'biceps-brachii' },
    { id: 'biceps-brachii-r', muscle: 'biceps-brachii' },
    { id: 'triceps-brachii', muscle: 'triceps-brachii' },
    { id: 'rectus-abdominis', muscle: 'rectus-abdominis' },
    { id: 'external-oblique', muscle: 'external-oblique' },
    { id: 'external-oblique-r', muscle: 'external-oblique' },
    { id: 'latissimus-dorsi', muscle: 'latissimus-dorsi' },
    { id: 'skin', context: true },
  ];
  const rigJoints = new Set(['trunk', 'shoulder.l', 'shoulder.r', 'elbow.l', 'elbow.r']);
  const planFor = (exercise: { primary: string[]; secondary?: string[]; stabilisers?: string[] }, keys: Record<string, Angles>[]) =>
    contractionPlan({ exercise: { secondary: [], stabilisers: [], ...exercise }, muscles: muscles as never, parts, rigJoints, keys });
  const at = (joints: Record<string, Angles>) => new Map(Object.entries(joints));

  it('reads a joint along a movement, its opposite counting backwards', () => {
    expect(along({ flexion: 30 }, 'flexion')).toBe(30);
    expect(along({ flexion: 30 }, 'extension')).toBe(-30);
    expect(along({ extension: 20, flexion: 5 }, 'extension')).toBe(15);
    expect(along({ 'lateral-flexion': -12 }, 'lateral-flexion', 0)).toBe(12);
  });

  it('a curl: the biceps shortens as the elbow flexes (prime weight 1); the triceps it lengthens is not listed', () => {
    const keys = [{ 'elbow.l': { flexion: 10 }, 'elbow.r': { flexion: 10 } }, { 'elbow.l': { flexion: 130 }, 'elbow.r': { flexion: 130 } }];
    const plan = planFor({ primary: ['biceps-brachii'] }, keys);
    expect(plan.parts.sort()).toEqual(['biceps-brachii', 'biceps-brachii-r']);
    expect(contractionAt(plan, at(keys[0]!)).get('biceps-brachii')).toBe(0);
    expect(contractionAt(plan, at(keys[1]!)).get('biceps-brachii-r')).toBe(1);
    expect(contractionAt(plan, at({ 'elbow.l': { flexion: 70 } })).get('biceps-brachii')).toBeCloseTo(0.5);
    expect(contractionAt(plan, at({ 'elbow.l': { flexion: 70 } })).has('triceps-brachii')).toBe(false);
  });

  it('a pushdown: the triceps is shortest where the elbow is straightest, whatever the key order', () => {
    const keys = [{ 'elbow.l': { flexion: 95 } }, { 'elbow.l': { flexion: 5 } }];
    const plan = planFor({ primary: ['triceps-brachii'] }, keys);
    expect(contractionAt(plan, at(keys[0]!)).get('triceps-brachii')).toBe(0);
    expect(contractionAt(plan, at(keys[1]!)).get('triceps-brachii')).toBe(1);
  });

  it('weights assist and stabilise actions, and holds a listed muscle whose joints do not move isometric', () => {
    // A row: shoulder extension moves; the lat's prime action counts fully.
    const keys = [{ 'shoulder.l': { flexion: 30 } }, { 'shoulder.l': { extension: 20 } }];
    const plan = planFor({ primary: ['latissimus-dorsi'], stabilisers: ['rectus-abdominis'] }, keys);
    const end = contractionAt(plan, at(keys[1]!));
    expect(end.get('latissimus-dorsi')).toBe(ROLE_WEIGHT.prime);
    expect(end.get('rectus-abdominis')).toBe(ISOMETRIC);
    // Only an adduction (the stabilise action) moving: weight 0.2.
    const add = [{ 'shoulder.l': { abduction: 40 } }, { 'shoulder.l': { abduction: 0 } }];
    expect(contractionAt(planFor({ primary: ['latissimus-dorsi'] }, add), at(add[1]!)).get('latissimus-dorsi')).toBeCloseTo(ROLE_WEIGHT.stabilise);
  });

  it('a side bend on the unsided trunk: the left oblique shortens one way, the right the other', () => {
    const keys = [{ trunk: { 'lateral-flexion': -20 } }, { trunk: { 'lateral-flexion': 20 } }];
    const plan = planFor({ primary: ['external-oblique'] }, keys);
    const left = contractionAt(plan, at(keys[1]!));
    expect(left.get('external-oblique')).toBe(1);
    expect(left.get('external-oblique-r')).toBe(0);
  });

  it('ignores movements smaller than the threshold and joints the rig lacks', () => {
    const keys = [{ 'elbow.l': { flexion: 10 } }, { 'elbow.l': { flexion: 12 } }];
    const plan = planFor({ primary: ['biceps-brachii'] }, keys);
    expect(plan.terms).toHaveLength(0);
    expect(plan.isometric).toContain('biceps-brachii');
  });
});

describe('exercise camera', () => {
  const motion = (rotation: [number, number, number], trunk = 0) => ({ root: { rotation }, keys: [{ joints: {} }, { joints: { trunk: { flexion: trunk } } }] });
  it('picks the posture from the root turn and the trunk', () => {
    expect(exercisePosture(motion([-90, 0, 0]))).toBe('supine');
    expect(exercisePosture(motion([70, 0, 0]))).toBe('prone');
    expect(exercisePosture(motion([0, 0, 75]))).toBe('side-lying');
    expect(exercisePosture(motion([0, 0, 0], 45))).toBe('hinge');
    expect(exercisePosture(motion([0, 0, 0], 10))).toBe('upright');
    expect(EXERCISE_VIEWS.upright.azimuth).toBeGreaterThan(0);
  });

  it('looks along the view direction turned with the body', () => {
    const front = viewDirection(0, 0);
    expect(front[2]).toBeCloseTo(1);
    const side = viewDirection(90, 0, 0);
    expect(side[0]).toBeCloseTo(1);
    expect(viewDirection(0, 0, 90)[0]).toBeCloseTo(1);
    expect(viewDirection(0, 90)[1]).toBeCloseTo(1);
  });

  it('frames a standing figure at least 60 % of the frame height, lifted above the caption', () => {
    // A 1.8 m figure as a column of points, seen from the front.
    const pts: number[] = [];
    for (let i = 0; i <= 20; i++) pts.push(0.2 * Math.sin(i), -0.9 + (1.8 * i) / 20, 0.1 * Math.cos(i));
    const aspect = 16 / 9;
    const cam = fitExerciseCamera(pts, [0, 0, 1], aspect, { fov: 24 })!;
    const d = cam.position[2] - cam.target[2];
    const tanV = Math.tan((24 * Math.PI) / 360);
    // The top and bottom of the figure on screen (fractions of the half height).
    const top = (0.9 - cam.target[1]) / ((d - 0) * tanV);
    const bottom = (-0.9 - cam.target[1]) / (d * tanV);
    expect(top - bottom).toBeGreaterThan(1.2);
    expect(top).toBeLessThanOrEqual(0.71);
    expect(bottom).toBeGreaterThanOrEqual(-0.71);
    expect(top + bottom).toBeGreaterThan(0);
    expect(fitExerciseCamera([], [0, 0, 1], aspect)).toBeNull();
  });

  it('a lying figure fits the width between the HUD side panels', () => {
    const pts = [-0.9, 0, 0, 0.9, 0, 0, 0, 0.2, 0, 0, -0.2, 0];
    const aspect = 16 / 9;
    const cam = fitExerciseCamera(pts, [0, 0, 1], aspect, { fov: 24 })!;
    const d = cam.position[2];
    const tanH = Math.tan((24 * Math.PI) / 360) * aspect;
    expect(0.9 / (d * tanH)).toBeCloseTo(0.56, 2);
  });
});

describe('motion schema', () => {
  const keys = [{ phase: 'start', joints: {} }, { phase: 'end', joints: {} }];
  it('takes the new equipment kinds, contacts and camera', () => {
    const ok = exerciseMotion.safeParse({
      equipment: [{ kind: 'pull-up-bar', grip: 'supinated', height: 2.3 }],
      contacts: ['hands'],
      feet: 'free',
      camera: { azimuth: 35, elevation: 10 },
      keys,
    });
    expect(ok.success).toBe(true);
    expect(exerciseMotion.safeParse({ equipment: { kind: 'cable', at: [0, 0.4, -1], handle: 'bar' }, keys }).success).toBe(true);
    expect(exerciseMotion.safeParse({ equipment: { kind: 'incline-bench', angle: 30, at: [0, -0.3, 0.2] }, keys }).success).toBe(true);
  });
  it('refuses fields a kind does not take, a cable without its pulley, a repeated contact', () => {
    expect(exerciseMotion.safeParse({ equipment: { kind: 'dumbbell', at: [0, 0, 0] }, keys }).success).toBe(false);
    expect(exerciseMotion.safeParse({ equipment: { kind: 'cable' }, keys }).success).toBe(false);
    expect(exerciseMotion.safeParse({ equipment: { kind: 'barbell', on: 'back' }, keys }).success).toBe(false);
    expect(exerciseMotion.safeParse({ contacts: ['hands', 'hands'], keys }).success).toBe(false);
    expect(exerciseMotion.safeParse({ equipment: { kind: 'parallel-bars' }, keys }).success).toBe(false);
  });
});
