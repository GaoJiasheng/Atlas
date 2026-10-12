/**
 * Exercise-mode hands (lib/hands.ts; docs/06 动作模式数据手册 · body styles
 * and hands): which hand an exercise shows, how it is turned for the grip,
 * and the geometry helpers of the wire figure.
 */
import { describe, expect, it } from 'vitest';
import { FIST_MIN_RADIUS, featureEdges, handFrame, handPlan, keepTriangles, RELAXED, type HandPlan } from '../../src/engines/space-scene/lib/hands';
import { BAR, DIP_BAR, DUMBBELL } from '../../src/engines/space-scene/lib/equipment';

type V = readonly [number, number, number];
const close = (a: readonly number[], b: V) => a.forEach((x, i) => expect(x).toBeCloseTo(b[i]!, 6));
const cross = (a: readonly number[], b: readonly number[]) => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];
const dot = (a: readonly number[], b: readonly number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;

describe('hand kind', () => {
  it('closes a fist round a bar in both hands, at the bar’s radius', () => {
    const p = handPlan({ equipment: { kind: 'barbell', grip: 'pronated' } }, 'l');
    expect(p).toEqual<HandPlan>({ kind: 'fist', grip: 'pronated', axis: 'between', radius: BAR.shaft / 2 });
    expect(handPlan({ equipment: { kind: 'pull-up-bar', grip: 'supinated' }, contacts: ['hands'] }, 'r')).toMatchObject({ kind: 'fist', grip: 'supinated', axis: 'between' });
    expect(handPlan({ equipment: { kind: 'lat-bar' } }, 'r')).toMatchObject({ kind: 'fist', grip: 'pronated', axis: 'between' });
  });

  it('closes a fist round a handle only in the hand that holds it', () => {
    const one = { equipment: { kind: 'dumbbell' as const, hand: 'right' as const, grip: 'neutral' as const } };
    expect(handPlan(one, 'r')).toEqual<HandPlan>({ kind: 'fist', grip: 'neutral', axis: 'across', radius: DUMBBELL.handle / 2 });
    expect(handPlan(one, 'l')).toBe(RELAXED);
    expect(handPlan({ equipment: [{ kind: 'cable', hand: 'left', at: [1, 0, 0] }, { kind: 'cable', hand: 'right', at: [-1, 0, 0] }] } as never, 'r').kind).toBe('fist');
    // A band or a kettlebell's wire handle: the fingers cannot close tighter than FIST_MIN_RADIUS.
    expect(handPlan({ equipment: { kind: 'band', at: [0, 0, 1] } } as never, 'l').radius).toBe(FIST_MIN_RADIUS);
    expect(handPlan({ equipment: { kind: 'band', to: 'feet', at: [0, 0, 1] } } as never, 'l')).toBe(RELAXED);
  });

  it('grips dip bars with a neutral fist along the bars', () => {
    expect(handPlan({ equipment: { kind: 'dip-bars' } }, 'l')).toEqual<HandPlan>({ kind: 'fist', grip: 'neutral', axis: 'scene-z', radius: DIP_BAR.radius });
  });

  it('opens the palm on the floor when the palms are a contact, else leaves the hand relaxed', () => {
    expect(handPlan({ root: { rotation: [70, 0, 0] }, equipment: { kind: 'floor' }, contacts: ['hands', 'feet'] }, 'l').kind).toBe('palm');
    // Face down on the floor (root ≥ 30° about X): the default contacts are the palms and feet.
    expect(handPlan({ root: { rotation: [75, 0, 0] }, equipment: { kind: 'floor' } }, 'r').kind).toBe('palm');
    // Lying on the floor face up (a bridge): the hands rest.
    expect(handPlan({ root: { rotation: [-90, 0, 0] }, equipment: { kind: 'floor' } }, 'r')).toBe(RELAXED);
    expect(handPlan({ equipment: { kind: 'bench' } }, 'l')).toBe(RELAXED);
    expect(handPlan(undefined, 'l')).toBe(RELAXED);
  });
});

describe('hand frame', () => {
  const fist = (grip: HandPlan['grip'], axis: HandPlan['axis'] = 'across'): HandPlan => ({ kind: 'fist', grip, axis, radius: 0.015 });
  const down: V = [0, -1, 0];

  it('is right-handed for the right hand and mirrored for the left', () => {
    const r = handFrame('r', fist('pronated'), { forearm: down });
    const l = handFrame('l', fist('pronated'), { forearm: down });
    expect(dot(cross(r.x, r.y), r.z)).toBeCloseTo(1, 6);
    expect(dot(cross(l.x, l.y), l.z)).toBeCloseTo(-1, 6);
  });

  it('points the thumbs at each other on a pronated bar and away on a supinated one', () => {
    // Arms hanging, the bar palm to palm: left hand at +X, the other hand toward −X.
    const pro = handFrame('l', fist('pronated', 'between'), { forearm: down, toOther: [-0.5, 0, 0] });
    close(pro.x, [-1, 0, 0]);
    close(pro.z, [0, 0, -1]); // palm toward the thighs, knuckles forward (a deadlift)
    const sup = handFrame('l', fist('supinated', 'between'), { forearm: down, toOther: [-0.5, 0, 0] });
    close(sup.x, [1, 0, 0]);
    close(sup.z, [0, 0, 1]); // palm forward (a curl)
  });

  it('turns a bench press grip palms toward the feet and a pull-up grip palms forward', () => {
    // Lying face up, arms up along the body's +Z (the skeleton frame before the root turn).
    const bench = handFrame('r', fist('pronated', 'between'), { forearm: [0, 0, 1], toOther: [0.5, 0, 0] });
    close(bench.x, [1, 0, 0]);
    close(bench.z, [0, -1, 0]);
    const pull = handFrame('l', fist('pronated', 'between'), { forearm: [0, 1, 0], toOther: [-0.5, 0, 0] });
    close(pull.z, [0, 0, 1]);
    const chin = handFrame('l', fist('supinated', 'between'), { forearm: [0, 1, 0], toOther: [-0.5, 0, 0] });
    close(chin.z, [0, 0, -1]);
  });

  it('points a neutral grip’s thumb forward, or toward the head when the forearm points forward', () => {
    close(handFrame('r', fist('neutral'), { forearm: down }).x, [0, 0, 1]); // hammer curl
    close(handFrame('l', fist('neutral'), { forearm: [0, 0, 1] }).x, [0, 1, 0]); // a lying fly at the top
    // Dip bars run along the scene's Z, here seen from a body turned 90° about Y.
    close(handFrame('l', fist('neutral', 'scene-z'), { forearm: down, sceneZ: [1, 0, 0] }).x, [1, 0, 0]);
  });

  it('lays a flat palm face down with the fingers the way the head points', () => {
    // A push-up: the body turned 70° about X, so the scene's up is tilted in the body's frame.
    const a = (70 * Math.PI) / 180;
    const up: V = [0, Math.cos(a), -Math.sin(a)];
    const f = handFrame('r', { kind: 'palm', grip: 'neutral', axis: 'across', radius: 0 }, { forearm: [0, -Math.cos(a), Math.sin(a)], sceneUp: up });
    close(f.z, [0, -up[1], -up[2]]);
    expect(dot(f.y, f.z)).toBeCloseTo(0, 6);
    expect(f.y[1]).toBeGreaterThan(0.9 * Math.sin(a) * Math.sin(a)); // toward the head (body +Y) along the floor
    expect(f.x[0]).toBeCloseTo(1, 6); // the right thumb toward the body's left, the other hand
  });
});

describe('wire figure geometry', () => {
  it('keeps the triangles without a dropped vertex', () => {
    expect(keepTriangles([0, 1, 2, 2, 3, 4, 4, 5, 0], (v) => v === 3)).toEqual([0, 1, 2, 4, 5, 0]);
  });

  it('draws the crease of a bent strip and its borders, not the flat diagonal or a seam', () => {
    // Two quads hinged 90° at x = 1 (the crease), the second with its own copy of the hinge vertices (a seam).
    const position = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, /* seam copies */ 1, 0, 0, 1, 1, 0, /* bent */ 1, 0, 1, 1, 1, 1];
    const index = [0, 1, 2, 0, 2, 3, 4, 6, 7, 4, 7, 5];
    const edges = featureEdges(position, index, 20);
    const pairs = new Set<string>();
    for (let i = 0; i < edges.length; i += 2) {
      const at = (v: number) => position.slice(v * 3, v * 3 + 3).join(',');
      pairs.add([at(edges[i]!), at(edges[i + 1]!)].sort().join(' / '));
    }
    // The 90° crease once, the six outer borders; never the diagonals.
    expect(pairs.has(['1,0,0', '1,1,0'].join(' / '))).toBe(true);
    expect(pairs.has(['0,0,0', '1,1,0'].join(' / '))).toBe(false);
    expect(pairs.has(['1,0,0', '1,1,1'].join(' / '))).toBe(false);
    expect(pairs.size).toBe(7);
    // Flat: only the borders.
    expect(featureEdges([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], [0, 1, 2, 0, 2, 3], 20).length / 2).toBe(4);
  });
});

describe('views.exerciseBody', () => {
  it('takes wire, mannequin or ghost', async () => {
    const { viewsSchema } = await import('../../src/engines/space-scene/schema');
    const base = { assembled: { camera: { position: [1, 1, 1], target: [0, 0, 0] } } };
    for (const body of ['wire', 'mannequin', 'ghost']) expect(viewsSchema.safeParse({ ...base, exerciseBody: body }).success).toBe(true);
    expect(viewsSchema.safeParse({ ...base, exerciseBody: 'solid' }).success).toBe(false);
  });
});
