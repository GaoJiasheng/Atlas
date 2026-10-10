import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Box3, BufferGeometry, Matrix4, Vector3 } from 'three';
import { partsFile, primitiveSchema, spaceChapterIssues, spaceChapterState, spaceSceneData } from '../../src/engines/space-scene/schema';
import { partBounds, primitiveLocalBox } from '../../src/engines/space-scene/lib/parts';
import { sweepBox, sweepStations } from '../../src/engines/space-scene/lib/sweep';
import { fanFrame, fanPoint, wingBox } from '../../src/engines/space-scene/lib/wing';
import { mirrorAxial, mirrorEuler, mirrorPoint } from '../../src/engines/space-scene/lib/bilateral';
import { lerpTransform, restTransform, sampleSequence, toTransform } from '../../src/engines/space-scene/lib/pose';
import { formatLength, mmPerUnit, scaleBar } from '../../src/engines/space-scene/lib/units';
import { animationScale3 } from '../../src/engines/space-scene/lib/animation';
import { resolveAllPartDisplays } from '../../src/engines/space-scene/lib/visibility';
import { numberedParts, partChain } from '../../src/engines/space-scene/lib/schematic';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { sweepGeometry, wingMembrane } from '../../src/engines/space-scene/stages/model3d/organic';
import { spaceSceneEngine } from '../../src/engines/space-scene/index';
import { TOKEN_NAMES } from '../../src/theme/theme';
import type { Primitive } from '../../src/engines/space-scene/schema';

const prim = (p: Record<string, unknown>) => primitiveSchema.parse({ at: [0, 0, 0], color: 'chitin', ...p });
const part = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: { en: id },
  group: 'g',
  summary: { en: 's' },
  detail: { en: 'd' },
  primitive: { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' },
  ...extra,
});
const file = (parts: unknown[], more: Record<string, unknown> = {}) => ({ parts, groups: [{ id: 'g', name: { en: 'G' }, color: 'token:cold' }], ...more });

const LEG = {
  kind: 'sweep',
  path: [[0, 0, 0], [0.4, 0.3, 0.1], [0.8, 0, 0.2]],
  radius: [0.06, 0.05, 0.02],
  section: { flat: 0.5 },
  rings: { every: 0.1, depth: 0.15 },
};
const WING = {
  kind: 'wing',
  outline: [[0, 0], [1, 0], [0.9, 0.4], [0.5, 0.6], [0.1, 0.3]],
  veins: [[[0, 0], [0.9, 0.2]], [[0, 0], [0.5, 0.5]]],
  thickness: 0.01,
  fold: { hinge: [0, 0], segments: 5, lead: [1, 0] },
  color: 'membrane',
};

/** Union of placed pieces (instances applied). */
function piecesBox(pieces: { geometry: BufferGeometry; matrices: Matrix4[] | null }[]): Box3 {
  const box = new Box3();
  for (const p of pieces) {
    p.geometry.computeBoundingBox();
    for (const m of p.matrices ?? [new Matrix4()]) box.union(p.geometry.boundingBox!.clone().applyMatrix4(m));
  }
  return box;
}

/** Share of triangles whose winding agrees with their vertex normals (front faces point out). */
function outwardShare(g: BufferGeometry): number {
  const geo = g.index ? g.toNonIndexed() : g;
  const P = geo.getAttribute('position');
  const N = geo.getAttribute('normal');
  const a = new Vector3(), b = new Vector3(), c = new Vector3(), n = new Vector3();
  let ok = 0, total = 0;
  for (let i = 0; i + 2 < P.count; i += 3) {
    a.fromBufferAttribute(P, i);
    b.fromBufferAttribute(P, i + 1);
    c.fromBufferAttribute(P, i + 2);
    const face = b.clone().sub(a).cross(c.clone().sub(a));
    if (face.lengthSq() < 1e-14) continue;
    n.fromBufferAttribute(N, i).add(new Vector3().fromBufferAttribute(N, i + 1)).add(new Vector3().fromBufferAttribute(N, i + 2));
    total++;
    if (face.dot(n) > 0) ok++;
  }
  return ok / Math.max(1, total);
}

describe('sweep (B2)', () => {
  it('accepts a profile, sections, rings and a wall; rejects a mismatched profile, a wall thicker than the tube and repeated points', () => {
    expect(prim(LEG).kind).toBe('sweep');
    for (const section of ['round', 'flat', 'u', { u: 120 }, { u: 90, flat: 0.6 }]) expect(primitiveSchema.safeParse({ ...LEG, section, at: [0, 0, 0], color: 'tissue' }).success).toBe(true);
    expect(primitiveSchema.safeParse({ ...LEG, radius: [0.1, 0.1], at: [0, 0, 0], color: 'tissue' }).success).toBe(false);
    expect(primitiveSchema.safeParse({ ...LEG, radius: 0.05, hollow: 0.06, at: [0, 0, 0], color: 'tissue' }).success).toBe(false);
    expect(primitiveSchema.safeParse({ ...LEG, path: [[0, 0, 0], [0, 0, 0]], radius: 0.1, at: [0, 0, 0], color: 'tissue' }).success).toBe(false);
  });
  it('frames are orthonormal, never flip, and the radius follows the profile with ring grooves', () => {
    const { stations, length } = sweepStations(prim(LEG) as Extract<Primitive, { kind: 'sweep' }>);
    expect(length).toBeGreaterThan(1);
    stations.forEach((st, i) => {
      const t = new Vector3(...st.t), n = new Vector3(...st.n), b = new Vector3(...st.b);
      expect(t.length()).toBeCloseTo(1, 5);
      expect(Math.abs(t.dot(n))).toBeLessThan(1e-6);
      expect(b.clone().sub(t.clone().cross(n)).length()).toBeLessThan(1e-6);
      if (i > 0) expect(n.dot(new Vector3(...stations[i - 1]!.n))).toBeGreaterThan(0.5);
    });
    expect(stations[0]!.r).toBeGreaterThan(stations[stations.length - 1]!.r);
    const rs = stations.map((s) => s.r);
    expect(Math.min(...rs.slice(0, 10))).toBeLessThan(0.06 * 0.9);
  });
  it('geometry lies inside its box, faces point out (solid, hollow and U)', () => {
    for (const extra of [{}, { hollow: 0.01 }, { section: 'u' }, { caps: 'flat' }]) {
      const p = prim({ ...LEG, ...extra }) as Extract<Primitive, { kind: 'sweep' }>;
      const g = sweepGeometry(p);
      g.computeBoundingBox();
      const box = sweepBox(p);
      const bb = g.boundingBox!;
      [bb.min.x, bb.min.y, bb.min.z].forEach((v, i) => expect(v).toBeGreaterThanOrEqual(box.min[i]! - 1e-3));
      [bb.max.x, bb.max.y, bb.max.z].forEach((v, i) => expect(v).toBeLessThanOrEqual(box.max[i]! + 1e-3));
      expect(outwardShare(g)).toBeGreaterThan(0.97);
    }
  });
});

describe('scale (B3)', () => {
  it('stretches a primitive along its own axes: a sphere becomes an ellipsoid', () => {
    const p = prim({ kind: 'sphere', size: [1], scale: [1, 2, 0.5] });
    expect(primitiveLocalBox(p)).toEqual({ min: [-1, -2, -0.5], max: [1, 2, 0.5] });
    const box = piecesBox(partPieces({ primitive: p }));
    expect(box.max.y).toBeCloseTo(2, 2);
    expect(box.max.z).toBeCloseTo(0.5, 2);
    expect(primitiveSchema.safeParse({ kind: 'sphere', size: [1], scale: [1, -1, 1], at: [0, 0, 0], color: 'eye' }).success).toBe(false);
  });
});

describe('wing (B8)', () => {
  const wing = prim(WING) as Extract<Primitive, { kind: 'wing' }>;
  it('fan 1 is the outline as drawn; fan 0 folds it onto the leading edge, pleated', () => {
    const f = fanFrame(wing.outline, wing.fold!);
    expect(fanPoint(f, 0.5, 0.6, 1)).toEqual([0.5, 0.6, 0]);
    const [x, y] = fanPoint(f, 0.5, 0.6, 0);
    const a = Math.atan2(y, x);
    expect(a).toBeCloseTo(Math.atan2(0.6, 0.5) * 0.12, 5);
    expect(Math.hypot(x, y)).toBeCloseTo(Math.hypot(0.5, 0.6), 6);
    const zs = [0.05, 0.15, 0.25, 0.35].map((k) => fanPoint(f, Math.cos(k), Math.sin(k), 0)[2]);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(0.01);
  });
  it('folded at rest by default; the box follows the fan', () => {
    expect(wingBox(wing).max[1]).toBeLessThan(0.2);
    expect(wingBox(wing, 1).max[1]).toBeCloseTo(0.6, 3);
    const b = partBounds({ primitive: wing })!;
    expect(b.max[1]).toBeLessThan(0.2);
  });
  it('membrane faces point out; a folding wing is its own piece and redraws for its fan', () => {
    expect(outwardShare(wingMembrane(wing))).toBeGreaterThan(0.99);
    const pieces = partPieces({ primitive: wing });
    const fan = pieces.find((p) => p.fan && !p.lines)!;
    expect(pieces.some((p) => p.lines)).toBe(true);
    fan.geometry.computeBoundingBox();
    const folded = fan.geometry.boundingBox!.max.y;
    expect(fan.fan!.apply(1)).toBe(true);
    fan.geometry.computeBoundingBox();
    expect(fan.geometry.boundingBox!.max.y).toBeGreaterThan(folded + 0.3);
    expect(fan.fan!.apply(1)).toBe(false);
  });
});

describe('bilateral parts (B4)', () => {
  const data = partsFile.parse(
    file(
      [
        part('femur', {
          primitive: { ...LEG, at: [0.1, 0.5, 0.3], rotation: [10, 20, 30], color: 'chitin' },
          extra: [{ kind: 'sphere', size: [0.05], at: [0.2, 0.5, 0.35], color: 'chitin' }],
          explode: { dir: [0, 0.2, 1], dist: 1 },
          connects: ['tibia', 'body'],
          bilateral: true,
        }),
        part('tibia', { primitive: { kind: 'box', size: [0.1, 0.1, 0.1], at: [0.8, 0.5, 0.4], color: 'chitin' }, connects: ['femur'], bilateral: { labelBoth: true } }),
        part('body'),
      ],
      {
        animations: [{ id: 'kick', target: 'tibia', kind: 'oscillate', axis: [0, 0.3, 1], amplitude: 10, hz: 1, pivot: [0.8, 0.5, 0.4] }],
        flows: [{ id: 'f', group: 'g', path: [[0, 0, 0.2], [1, 0, 0.2]], speed: 1, color: 'token:cold', parts: ['body', 'femur'], bilateral: true }],
        poses: { flex: { tibia: { pivot: [0.8, 0.5, 0.4], rotation: [5, 10, -30], offset: [0, 0, 0.1] }, duration: 0.15 } },
      },
    ),
  );
  const byId = new Map(data.parts.map((p) => [p.id, p]));
  it('adds a mirror twin after each paired part, with sides and pairs', () => {
    expect(data.parts.map((p) => p.id)).toEqual(['femur', 'femur-r', 'tibia', 'tibia-r', 'body']);
    expect(byId.get('femur')).toMatchObject({ side: 'left', pair: 'femur-r' });
    expect(byId.get('femur-r')).toMatchObject({ side: 'right', pair: 'femur', twinOf: 'femur' });
    expect(byId.get('body')!.pair).toBeUndefined();
  });
  it('mirrors placement, explode and connects; bounds and geometry are the reflection', () => {
    const twin = byId.get('femur-r')!;
    expect(twin.primitive!.at).toEqual([0.1, 0.5, -0.3]);
    expect(twin.primitive!.rotation).toEqual([-10, -20, 30]);
    expect(twin.primitive!.scale).toEqual([1, 1, -1]);
    expect(twin.extra![0]!.at).toEqual([0.2, 0.5, -0.35]);
    expect(twin.explode.dir).toEqual([0, 0.2, -1]);
    expect(twin.connects).toEqual(['tibia-r', 'body']);
    const a = partBounds(byId.get('femur')!)!;
    const b = partBounds(twin)!;
    expect(b.min[2]).toBeCloseTo(-a.max[2], 6);
    expect(b.max[2]).toBeCloseTo(-a.min[2], 6);
    expect(b.min[0]).toBeCloseTo(a.min[0], 6);
    const pa = piecesBox(partPieces(byId.get('femur')!));
    const pb = piecesBox(partPieces(twin));
    expect(pb.min.z).toBeCloseTo(-pa.max.z, 4);
    expect(pb.max.x).toBeCloseTo(pa.max.x, 4);
    // Mirrored bakes keep their faces pointing out.
    for (const piece of partPieces(twin)) expect(outwardShare(piece.geometry)).toBeGreaterThan(0.97);
  });
  it('mirrors animations, pose entries and bilateral flows', () => {
    const kick = data.animations.find((a) => a.id === 'kick-r')!;
    expect(kick).toMatchObject({ target: 'tibia-r', pivot: [0.8, 0.5, -0.4] });
    expect(kick.kind === 'oscillate' && kick.axis).toEqual([-0, -0.3, 1]);
    expect(data.poses!.flex!.duration).toBe(0.15);
    expect(data.poses!.flex!.parts['tibia-r']).toEqual({ pivot: [0.8, 0.5, -0.4], rotation: [-5, -10, -30], offset: [0, 0, -0.1] });
    const f = data.flows.find((x) => x.id === 'f-r')!;
    expect(f.path[0]).toEqual([0, 0, -0.2]);
    expect(f.parts).toEqual(['body', 'femur-r']);
  });
  it('the helpers: points flip one axis, axial vectors and Euler angles the other two', () => {
    expect(mirrorPoint([1, 2, 3], 'z')).toEqual([1, 2, -3]);
    expect(mirrorAxial([1, 2, 3], 'z')).toEqual([-1, -2, 3]);
    expect(mirrorEuler([10, 20, 30], 'x')).toEqual([10, -20, -30]);
  });
  it('rejects a twin id that clashes with a part; chapters may name twins', () => {
    expect(partsFile.safeParse(file([part('leg', { bilateral: true }), part('leg-r')])).success).toBe(false);
    const parsed = spaceSceneData.parse({ parts: file([part('leg', { bilateral: true }), part('body')]) });
    expect(spaceChapterIssues(spaceChapterState.parse({ part: 'leg-r', hide: ['leg-r'], labels: ['leg-r'] }), parsed)).toEqual([]);
  });
  it('twins are not numbered or carded (they share their part\'s number); hide / ghost of a part cover its twin', () => {
    expect(numberedParts(data.parts).map((p) => p.id)).toEqual(['femur', 'tibia', 'body']);
    const chain = partChain(data.parts, data.groups);
    expect(chain.nodes.map((n) => [n.id, n.n])).toEqual([['femur', 1], ['tibia', 2], ['body', 3]]);
    const d = resolveAllPartDisplays(data.parts, { view: 'assembled', part: null, layers: ['g'], hidden: ['femur'], ghosted: ['tibia'] });
    expect(d.get('femur-r')!.visible).toBe(false);
    expect(d.get('tibia-r')!.faint).toBe(true);
    const only = resolveAllPartDisplays(data.parts, { view: 'assembled', part: null, layers: ['g'], hidden: ['femur-r'] });
    expect(only.get('femur')!.visible).toBe(true);
  });
});

describe('animation pivots, vector pulse, sequences (B5)', () => {
  it('pulse scales per axis', () => {
    const out: [number, number, number] = [1, 1, 1];
    animationScale3({ id: 'p', target: 't', kind: 'pulse', scale: [1, 1.2, 1.04], hz: 1, whenRun: true }, 0.5, 1, out);
    expect(out[0]).toBeCloseTo(1, 6);
    expect(out[1]).toBeCloseTo(1.2, 6);
    expect(out[2]).toBeCloseTo(1.04, 6);
  });
  it('sequences ease key to key, loop or hold', () => {
    const keys = [{ t: 0, rotation: [0, 0, 0] as [number, number, number] }, { t: 1, rotation: [0, 0, 90] as [number, number, number] }];
    expect(sampleSequence(keys, 0.5, true).rotation[2]).toBeCloseTo(45, 6);
    expect(sampleSequence(keys, 1.5, true).rotation[2]).toBeCloseTo(45, 6);
    expect(sampleSequence(keys, 3, false).rotation[2]).toBeCloseTo(90, 6);
    expect(sampleSequence(keys, 0.5, true, [1, 2, 3]).pivot).toEqual([1, 2, 3]);
  });
  it('the schema checks key order, `fan` in every key or none, and that `fan` drives a folding wing', () => {
    const wingPart = part('wing', { primitive: { ...WING, at: [0, 0, 0] } });
    const seq = (keys: unknown[], target = 'wing') => partsFile.safeParse(file([wingPart, part('box')], { animations: [{ id: 'a', target, kind: 'sequence', keys }] }));
    expect(seq([{ t: 0, fan: 0 }, { t: 1, fan: 1 }]).success).toBe(true);
    expect(seq([{ t: 1 }, { t: 0.5 }]).success).toBe(false);
    expect(seq([{ t: 0, fan: 0 }, { t: 1 }]).success).toBe(false);
    expect(seq([{ t: 0, fan: 0 }, { t: 1, fan: 1 }], 'box').success).toBe(false);
  });
});

describe('poses (B6)', () => {
  it('parse into { duration, parts }, check the parts and that `fan` meets a folding wing', () => {
    const ok = partsFile.parse(file([part('a')], { poses: { up: { a: { rotation: [0, 0, 10] } } } }));
    expect(ok.poses!.up).toEqual({ duration: 0.8, parts: { a: { rotation: [0, 0, 10] } } });
    expect(partsFile.safeParse(file([part('a')], { poses: { up: { b: { rotation: [0, 0, 10] } } } })).success).toBe(false);
    expect(partsFile.safeParse(file([part('a')], { poses: { up: { a: { fan: 1 } } } })).success).toBe(false);
    expect(partsFile.safeParse(file([part('a')], { poses: { up: { duration: -1 } } })).success).toBe(false);
  });
  it('transforms ease between poses; a fan given at one end eases from the rest fan', () => {
    const a = restTransform();
    const b = toTransform({ rotation: [0, 0, 40], scale: 2, fan: 1 });
    const mid = lerpTransform(a, b, 0.5, 0);
    expect(mid.rotation[2]).toBeCloseTo(20, 6);
    expect(mid.scale).toEqual([1.5, 1.5, 1.5]);
    expect(mid.fan).toBeCloseTo(0.5, 6);
    expect(lerpTransform(b, a, 1, 0).fan).toBeNull();
  });
  it('chapter `pose` is not cumulative; named cuts, pose and ghost reach the store', () => {
    expect(spaceSceneEngine.fromChapterState({ pose: 'flex', cutaway: 'sagittal', ghost: ['g'] })).toMatchObject({ pose: 'flex', cutaway: 'sagittal', ghosted: ['g'] });
    expect(spaceSceneEngine.fromChapterState({})).toMatchObject({ pose: null, ghosted: [] });
    expect(spaceSceneEngine.fromUrl({ pose: 'flex', cutaway: 'sagittal' })).toEqual({ pose: 'flex', cutaway: 'sagittal' });
  });
});

describe('named cuts, ghost, chapter refs (B7, B10)', () => {
  const data = spaceSceneData.parse({
    parts: file([part('a'), part('ctx', { group: 'g', context: true })], {
      poses: { open: { a: { rotation: [0, 0, 5] } } },
      views: { cuts: { sagittal: { normal: [0, 0, -1], label: { en: 'Sagittal' } } } },
    }),
  });
  it('names must exist', () => {
    const state = spaceChapterState.parse({ cutaway: 'sagittal', pose: 'open', ghost: ['g', 'a'], beats: [{ caption: { en: 'c' }, cutaway: 'thorax', pose: 'shut', ghost: ['nope'] }] });
    expect(spaceChapterIssues(state, data)).toEqual([
      'state.beats.0.ghost: unknown group or part "nope"',
      'state.beats.0.pose: unknown pose "shut" (not in parts.json poses)',
      'state.beats.0.cutaway: unknown cut "thorax" (none, half or a views.cuts name)',
    ]);
  });
  it('rejects the engine\'s own cut names and too many cuts', () => {
    expect(partsFile.safeParse(file([part('a')], { views: { cuts: { half: { normal: [1, 0, 0] } } } })).success).toBe(false);
    const cuts = Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map((k) => [k, { normal: [1, 0, 0] }]));
    expect(partsFile.safeParse(file([part('a')], { views: { cuts } })).success).toBe(false);
  });
  it('ghost draws groups faint and unpickable; solo ghosts every other group; context parts with a group follow it (B11)', () => {
    const parts = [
      { id: 'a', group: 'g' },
      { id: 'b', group: 'h' },
      { id: 'ctx', group: 'h', context: true },
      { id: 'free', context: true },
    ];
    const ghost = resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['g', 'h'], ghosted: ['h'] });
    expect(ghost.get('b')).toMatchObject({ visible: true, faint: true, opacity: 0.12, ghost: true, selectable: false });
    expect(ghost.get('ctx')!.faint).toBe(true);
    expect(ghost.get('a')!.faint).toBe(false);
    const solo = resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['h'], solo: 'g' });
    expect(solo.get('a')).toMatchObject({ visible: true, faint: false });
    expect(solo.get('b')!.faint).toBe(true);
    expect(solo.get('free')!.faint).toBe(false);
    // The selected part stays solid.
    expect(resolveAllPartDisplays(parts, { view: 'assembled', part: 'b', layers: ['g', 'h'], ghosted: ['h'] }).get('b')!.faint).toBe(false);
  });
  it('a group with `card: false` stays out of the part chain', () => {
    const chain = partChain([{ id: 'a', group: 'g', connects: [] }, { id: 'b', group: 'h', connects: [] }], [{ id: 'g' }, { id: 'h', card: false }]);
    expect(chain.columns.map((c) => c.id)).toEqual(['g']);
  });
});

describe('units (B1)', () => {
  it('scale bar and lengths in real units; scene units without', () => {
    const units = { modelUnit: 'mm' as const, scale: 25 };
    expect(mmPerUnit(units)).toBe(25);
    expect(scaleBar(2.6, units)).toEqual({ step: 0.4, label: '10 MM' });
    expect(scaleBar(2.6, undefined)).toEqual({ step: 0.5, label: '0.5 U' });
    expect(formatLength(64, 'mm')).toBe('64 MM');
    expect(formatLength(650, 'cm')).toBe('65 CM');
    expect(formatLength(2500, 'mm')).toBe('2.5 M');
    expect(partsFile.safeParse(file([part('a')], { units: { modelUnit: 'in', scale: 1 } })).success).toBe(false);
  });
});

describe('organism materials and tokens (B9, B12)', () => {
  it('every organism family resolves; membranes are see-through and double-sided', () => {
    for (const f of ['chitin', 'membrane', 'tissue', 'muscle', 'trachea', 'nerve', 'eye'] as const) {
      const look = resolveMaterialLook(f, {}, 'paper');
      expect(look.color).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(resolveMaterialLook('membrane', {}, 'cinema')).toMatchObject({ doubleSided: true });
    expect(resolveMaterialLook('membrane', {}, 'paper').opacity).toBeLessThan(0.6);
    expect(resolveMaterialLook('eye', {}, 'paper').finish).toBe('hex');
    expect(resolveMaterialLook('chitin', {}, 'paper', '#a08040').color).toBe('#a08040');
    // Machine families keep their look.
    expect(resolveMaterialLook('powder', {}, 'paper')).toMatchObject({ normal: 0.1, glow: 0, doubleSided: false });
  });
  it('food and haemolymph are tokens in both themes', () => {
    expect(TOKEN_NAMES).toContain('food');
    expect(TOKEN_NAMES).toContain('haemolymph');
    const css = readFileSync(join(__dirname, '../../src/theme/tokens.css'), 'utf8');
    expect(css.match(/--food:/g)).toHaveLength(2);
    expect(css.match(/--haemolymph:/g)).toHaveLength(2);
  });
});
