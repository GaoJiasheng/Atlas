/**
 * Real meshes and human muscles (docs/16 §9 M1–M13): the rig and joint
 * angles, contraction, the exercise clock, peel stages, sites, part solo and
 * tints, the schema's new fields and checks, shared fitness data, the
 * equipment and the sample glb.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Box3, PropertyBinding, Vector3, type SkinnedMesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  anglesQuat,
  bothSides,
  canMove,
  contractLevel,
  contractScale,
  exerciseLoop,
  foldAngles,
  movementAxis,
  musclePartIds,
  quatApply,
  sampleAngles,
  sampleContract,
} from '../../src/engines/space-scene/lib/rig';
import { explodeStages, stagedAmount } from '../../src/engines/space-scene/lib/explode';
import { activeSites, pullLines, siteCentroid, siteKey } from '../../src/engines/space-scene/lib/sites';
import { resolveAllPartDisplays } from '../../src/engines/space-scene/lib/visibility';
import { barbellShape, benchShape, cableHandleShape, dumbbellShape, parallelBarsShape } from '../../src/engines/space-scene/lib/equipment';
import { partsFile, spaceChapterIssues, spaceChapterState, spaceSceneData } from '../../src/engines/space-scene/schema';
import { exerciseSheet, musclesFile, sharedFitnessIssues, withSharedFitness, type SharedFitnessParsed } from '../../src/content/schema/fitness';
import { detailSourceIds } from '../../src/engines/space-scene/lib/detail';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { fibreMeasure } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { glbIssues, loadedName } from '../../scripts/lib/glb-check';
import { readSharedFitness } from '../../scripts/lib/shared-data';
import { buildSampleGlb, SAMPLE_COPYRIGHT } from '../../scripts/make-sample-glb';
import { mergeSourcesMd, sourcesBlock, SHARED_BEGIN, SHARED_END } from '../../scripts/sources-md';

const ROOT = join(__dirname, '../..');
const close = (a: readonly number[], b: readonly number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 5));

describe('rig: joint angles about anatomical axes', () => {
  const axes = { flexion: [-1, 0, 0], abduction: [0, 0, 1] } as const;
  it('drives a movement by its own axis or its opposite negated', () => {
    expect(movementAxis(axes, 'flexion')).toEqual({ axis: [-1, 0, 0], sign: 1 });
    expect(movementAxis(axes, 'extension')).toEqual({ axis: [-1, 0, 0], sign: -1 });
    expect(movementAxis(axes, 'adduction')!.sign).toBe(-1);
    expect(canMove(axes, 'internal-rotation')).toBe(false);
    expect(foldAngles(axes, { extension: 20, abduction: 10, pronation: 30 })).toEqual({ flexion: -20, abduction: 10 });
  });
  it('flexion 90° about −X swings an arm hanging down (−Y) forward (+Z)', () => {
    close(quatApply(anglesQuat(axes, { flexion: 90 }), [0, -1, 0]), [0, 0, 1]);
    // Abduction of the left arm (+X side) lifts it out to +X.
    close(quatApply(anglesQuat(axes, { abduction: 90 }), [0, -1, 0]), [1, 0, 0]);
  });
  it('left joints drive their right counterparts unless named', () => {
    const rig = new Set(['elbow.l', 'elbow.r', 'shoulder.l']);
    expect(bothSides({ 'elbow.l': { flexion: 90 }, 'shoulder.l': { flexion: 10 } }, rig)).toEqual({
      'elbow.l': { flexion: 90 },
      'elbow.r': { flexion: 90 },
      'shoulder.l': { flexion: 10 },
    });
    expect(bothSides({ 'elbow.l': { flexion: 90 }, 'elbow.r': { flexion: 30 } }, rig)['elbow.r']).toEqual({ flexion: 30 });
  });
  it('samples joint clips and contraction keys', () => {
    const keys = [
      { t: 0, angles: { flexion: 0 }, contract: 0 },
      { t: 2, angles: { flexion: 90 }, contract: 1 },
    ];
    expect(sampleAngles(keys, 1, false).flexion).toBeCloseTo(45);
    expect(sampleAngles(keys, 5, false).flexion).toBe(90);
    expect(sampleContract(keys, 1, false)).toBeCloseTo(0.5);
    expect(sampleContract([{ t: 0 }, { t: 1 }], 0.5, false)).toBeNull();
  });
});

describe('contraction and the exercise clock', () => {
  it('a contract animation breathes 0 → amount → 0', () => {
    expect(contractLevel(0.6, 0.5, 0)).toBe(0);
    expect(contractLevel(0.6, 0.5, 1)).toBeCloseTo(0.6);
    expect(contractLevel(0.6, 0.5, 1, 0.5)).toBeCloseTo(0.3);
  });
  it('without fibre data a part shortens along its longest axis and swells across it', () => {
    const s = contractScale([0.02, 0.2, 0.03], 1);
    expect(s[1]).toBeLessThan(1);
    expect(s[0]).toBeGreaterThan(1);
    expect(contractScale([0.02, 0.2, 0.03], 0)).toEqual([1, 1, 1]);
  });
  it('loops start → end → start at the tempo, holding at both ends', () => {
    const tempo = [2, 1, 1, 1];
    expect(exerciseLoop(2, tempo, 0)).toEqual({ from: 0, to: 1, k: 0 });
    expect(exerciseLoop(2, tempo, 1).k).toBeCloseTo(0.5);
    expect(exerciseLoop(2, tempo, 2.5)).toEqual({ from: 1, to: 1, k: 1 });
    const back = exerciseLoop(2, tempo, 3.5);
    expect([back.from, back.to]).toEqual([1, 0]);
    expect(exerciseLoop(2, tempo, 4.5)).toEqual({ from: 0, to: 0, k: 1 });
    // Three keys: start → mid in the first half of the way down.
    expect(exerciseLoop(3, tempo, 0.5)).toMatchObject({ from: 0, to: 1 });
    expect(exerciseLoop(3, tempo, 1.5)).toMatchObject({ from: 1, to: 2 });
  });
  it('finds the parts that show a muscle or one of its heads', () => {
    const parts = [
      { id: 'pec-clav', muscle: 'pec-clav' },
      { id: 'pec-clav-r', muscle: 'pec-clav' },
      { id: 'pec-stern', muscle: 'pec-stern' },
      { id: 'skin', muscle: 'pec-clav', context: true },
    ];
    const parentOf = new Map([
      ['pec-clav', 'pec'],
      ['pec-stern', 'pec'],
    ]);
    expect(musclePartIds(parts, 'pec', parentOf)).toEqual(['pec-clav', 'pec-clav-r', 'pec-stern']);
    expect(musclePartIds(parts, 'pec-stern', parentOf)).toEqual(['pec-stern']);
  });
});

describe('peel stages (M4)', () => {
  it('three stages move in turn: 0–0.4, 0.3–0.7, 0.6–1', () => {
    expect(stagedAmount(0.2, 0, 3)).toBeCloseTo(0.5);
    expect(stagedAmount(0.2, 1, 3)).toBe(0);
    expect(stagedAmount(0.5, 1, 3)).toBeCloseTo(0.5);
    expect(stagedAmount(0.5, 2, 3)).toBe(0);
    expect(stagedAmount(1, 2, 3)).toBe(1);
    expect(stagedAmount(0.5, undefined, 3)).toBe(0.5);
    expect(explodeStages([{ explode: { stage: 0 } }, { explode: { stage: 2 } }, { explode: {} }])).toBe(3);
  });
});

describe('sites (M6) and solo / tints (M11)', () => {
  const sites = [
    { muscle: 'a', kind: 'origin' as const, bone: 'x', points: [[0, 0, 0], [0, 2, 0]] },
    { muscle: 'a', kind: 'insertion' as const, bone: 'y', points: [[1, 0, 0]] },
    { muscle: 'b', kind: 'origin' as const, bone: 'x', points: [[5, 0, 0]] },
  ];
  it('shows the selected muscle\'s and the listed ones\', with a line of pull per muscle', () => {
    expect(activeSites(sites, 'a', [])).toEqual([0, 1]);
    expect(activeSites(sites, null, ['b'])).toEqual([2]);
    expect(pullLines(sites, [0, 1, 2])).toEqual([{ muscle: 'a', origin: 0, insertion: 1 }]);
    expect(siteCentroid(sites[0]!.points)).toEqual([0, 1, 0]);
    expect(siteKey(2, 'c')).toBe('2:c');
  });
  it('a soloed part keeps itself, what it connects and the shells solid', () => {
    const parts = [
      { id: 'm', group: 'muscles', connects: ['bone'] },
      { id: 'other', group: 'muscles' },
      { id: 'bone', group: 'skeleton' },
      { id: 'skin', context: true, shell: true },
    ];
    const d = resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['muscles', 'skeleton'], solo: 'm' });
    expect(d.get('m')!.faint).toBe(false);
    expect(d.get('bone')!.faint).toBe(false);
    expect(d.get('skin')!.faint).toBe(false);
    expect(d.get('other')!.faint).toBe(true);
    // A group id still solos the group.
    expect(resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['muscles', 'skeleton'], solo: 'skeleton' }).get('m')!.faint).toBe(true);
  });
  it('highlight tints parts or groups signal / cold', () => {
    const parts = [{ id: 'm', group: 'muscles' }, { id: 'n', group: 'muscles' }, { id: 'b', group: 'skeleton' }];
    const d = resolveAllPartDisplays(parts, { view: 'assembled', part: null, layers: ['muscles', 'skeleton'], highlight: { signal: ['m'], cold: ['skeleton'] } });
    expect([d.get('m')!.tint, d.get('n')!.tint, d.get('b')!.tint]).toEqual(['signal', null, 'cold']);
  });
});

/** A minimal glb parts file to break in one way at a time. */
const glbParts = (extra: Record<string, unknown> = {}, part: Record<string, unknown> = {}) => ({
  model: '/models/sample-space.glb',
  groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink' }],
  parts: [
    { id: 'm', name: { en: 'M' }, group: 'g', summary: { en: 'S' }, detail: { en: 'D' }, mesh: 'm.l', material: { color: 'muscle' }, bilateral: { axis: 'x', mesh: 'm.r' }, ...part },
    { id: 'b', name: { en: 'B' }, group: 'g', summary: { en: 'S' }, detail: { en: 'D' }, mesh: 'b.l', material: { color: 'tissue' } },
  ],
  rig: { joints: { 'elbow.l': { node: 'elbow.l', axes: { flexion: [-1, 0, 0] } }, 'elbow.r': { node: 'elbow.r', axes: { flexion: [-1, 0, 0] } } } },
  ...extra,
});
const errors = (raw: unknown) => {
  const r = partsFile.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('parts.json: glb parts, rig, poses, clips, sites (M2, M3, M5, M6, M7, M13)', () => {
  it('accepts a glb part with material, a real twin node, a joint pose and a joint clip, and expands them', () => {
    const file = partsFile.parse(
      glbParts({
        poses: { bend: { 'joint:elbow.l': { flexion: 90 }, contract: { m: 0.7 } } },
        animations: [{ id: 'wave', target: 'joint:elbow.l', kind: 'sequence', keys: [{ t: 0, angles: { flexion: 0 } }, { t: 1, angles: { flexion: 30 } }] }],
        sites: [{ muscle: 'm', kind: 'origin', bone: 'b', points: [[0.1, 0, 0]] }],
      }),
    );
    expect(file.parts.find((p) => p.id === 'm-r')?.mesh).toBe('m.r');
    expect(file.poses!.bend!.joints).toEqual({ 'elbow.l': { flexion: 90 }, 'elbow.r': { flexion: 90 } });
    expect(file.poses!.bend!.contract).toEqual({ m: 0.7, 'm-r': 0.7 });
    expect(file.animations.map((a) => a.target)).toEqual(['joint:elbow.l', 'joint:elbow.r']);
    expect(file.sites!.map((s) => [s.muscle, s.points[0]![0]])).toEqual([
      ['m', 0.1],
      ['m-r', -0.1],
    ]);
  });
  it('rejects a glb part without material, an unknown joint, a joint clip with transforms, a site on an unknown part', () => {
    expect(errors(glbParts({}, { material: undefined }))).toContain('parts.0.material: a glb-only part needs a `material` ({ color, tint? })');
    expect(errors(glbParts({ poses: { p: { 'joint:knee.l': { flexion: 10 } } } })).join('\n')).toContain('unknown joint "knee.l"');
    expect(
      errors(glbParts({ animations: [{ id: 'x', target: 'joint:elbow.l', kind: 'sequence', keys: [{ t: 0, rotation: [1, 0, 0] }, { t: 1, angles: { flexion: 1 } }] }] })).join('\n'),
    ).toContain("a joint clip's keys give `angles` only");
    expect(errors(glbParts({ sites: [{ muscle: 'm', kind: 'origin', bone: 'nope', points: [[0, 0, 0]] }] })).join('\n')).toContain('unknown part "nope"');
    expect(errors(glbParts({}, { bilateral: { mesh: 'x' }, mesh: undefined, primitive: { kind: 'sphere', size: [1], at: [0, 0, 0], color: 'steel' } })).join('\n')).toContain(
      "`bilateral.mesh` pairs a glb node with this part's own `mesh`",
    );
    expect(errors(glbParts({ rig: { joints: { 'elbow.l': { node: 'e', axes: { flexion: [1, 0, 0], extension: [1, 0, 0] } } } } })).join('\n')).toContain('one axis per pair');
    expect(errors(glbParts({ model: undefined })).join('\n')).toContain('a rig turns the bones of a glb skeleton');
  });
  it('allows up to 32 poses', () => {
    const poses = Object.fromEntries(Array.from({ length: 32 }, (_, i) => [`p${i}`, { m: { rotation: [i, 0, 0] } }]));
    expect(errors(glbParts({ poses }))).toEqual([]);
    expect(errors(glbParts({ poses: { ...poses, p32: {} } })).join('\n')).toContain('at most 32 poses');
  });
});

describe('shared fitness data (M10)', () => {
  const shared = readSharedFitness(join(ROOT, 'src/content/shared'));
  it('merges only what a topic uses, the shared sources and the muscles its exercises name', () => {
    const merged = withSharedFitness({ parts: { parts: [{ id: 'x', muscle: 'sample-flexor' }] } }, shared) as { fitness: { muscles: { id: string }[]; exercises: { id: string }[] } };
    expect(merged.fitness.muscles.map((m) => m.id)).toEqual(['sample-flexor']);
    expect(merged.fitness.exercises.map((e) => e.id)).toEqual(['sample-curl', 'sample-raise', 'sample-hang']);
    // Topics without shared links are left alone.
    expect(withSharedFitness({ parts: { parts: [{ id: 'x' }] } }, shared)).toEqual({ parts: { parts: [{ id: 'x' }] } });
  });
  it('checks links across the shared tree', () => {
    const muscles = musclesFile.parse(shared.muscles.sample);
    const curl = exerciseSheet.parse({ ...(shared.exercises.sample as { exercises: object[] }).exercises[0], primary: ['nobody'], dose: [{ text: { en: 'Twice a week' }, s: ['M9'] }] });
    const tree: SharedFitnessParsed = { muscles: new Map([['sample', muscles]]), exercises: new Map([['x', { exercises: [curl] }]]), sources: [] };
    const issues = sharedFitnessIssues(tree).map((i) => `${i.level} ${i.message}`);
    expect(issues).toContain('error primary: unknown muscle "nobody"');
    expect(issues).toContain('error M9: unknown shared source (not in shared/fitness/sources.json)');
    expect(issues.some((i) => i.startsWith('error exercises: unknown exercise "sample-raise"'))).toBe(true);
  });
  it('lists the shared M# sources in their own block of a topic\'s SOURCES.md', () => {
    const block = sourcesBlock([{ id: 'M1', text: { en: 'Gray 1918', zh: '格氏解剖学' } }], [SHARED_BEGIN, SHARED_END]);
    const md = mergeSourcesMd('# Sources · x\n\nnotes', block, 'x', [SHARED_BEGIN, SHARED_END], 'Shared sources (M#)');
    expect(md).toContain('## Shared sources (M#)');
    expect(md).toContain('- [M1] Gray 1918 / 格氏解剖学');
    // Running it again replaces the block in place.
    expect(mergeSourcesMd(md, block, 'x', [SHARED_BEGIN, SHARED_END])).toBe(md);
  });
  it('cites shared sources as [M#] in details', () => {
    expect(detailSourceIds('Fibres [M3] and [S2, M10].')).toEqual(['M3', 'S2', 'M10']);
  });
  it('a topic: muscle links, training exercises and exercise beats are checked', () => {
    const raw = (training: object) =>
      withSharedFitness({ parts: glbParts({}, { muscle: 'sample-flexor', summary: undefined, detail: undefined }), training }, shared);
    const ok = spaceSceneData.parse(raw({ exercises: ['sample-hang'] }));
    // The muscle sheet fills summary, detail and short.
    expect(ok.parts.parts[0]!.summary.en).toMatch(/placeholder muscle/);
    expect(ok.parts.parts[0]!.short?.en).toBe('Sample flexor');
    // sample-raise moves shoulder.l, which this rig lacks.
    const bad = spaceSceneData.safeParse(raw({ exercises: ['sample-raise', 'nope'] }));
    expect(bad.success).toBe(false);
    const msgs = bad.success ? '' : bad.error.issues.map((i) => i.message).join('\n');
    expect(msgs).toContain('unknown exercise "nope"');
    expect(msgs).toContain('joint "shoulder.l" is not in this topic\'s rig');
    const state = spaceChapterState.parse({ exercise: { id: 'sample-curl' }, sites: ['m'], highlight: { signal: ['nope'] } });
    expect(state.exercise).toEqual({ id: 'sample-curl', phase: 'loop' });
    expect(spaceChapterIssues(state, ok)).toEqual([
      'state.exercise: "sample-curl" is not in data/training.json exercises',
      'state.highlight: unknown group or part "nope"',
      'state.sites: "m" has no sites in parts.json',
    ]);
  });
});

describe('equipment (M8)', () => {
  it('builds every kind from engine primitives, one or two materials each', () => {
    for (const shape of [barbellShape(), dumbbellShape(), cableHandleShape(), benchShape(), benchShape(30), parallelBarsShape(0.5, 1)]) {
      const pieces = partPieces({ primitive: shape.primitive, ...(shape.extra ? { extra: shape.extra } : {}) });
      expect(pieces.length).toBeGreaterThan(0);
      expect(pieces.length).toBeLessThanOrEqual(2);
    }
  });
  it('an inclined bench raises its back toward −Z', () => {
    const back = benchShape(45).extra![0]!;
    expect(back.at[1]).toBeGreaterThan(0);
    expect(back.at[2]).toBeLessThan(0);
  });
});

describe('the sample glb (M1)', () => {
  const file = join(ROOT, 'public/models/sample-space.glb');
  it('is current: the generator writes the same bytes', async () => {
    const built = await buildSampleGlb();
    expect(Buffer.from(built).equals(readFileSync(file))).toBe(true);
  });
  it('passes the build checks; a missing node is an error', async () => {
    expect(await glbIssues(file, [{ node: 'sample-flexor.l', what: 'part' }, { node: 'elbow.r', what: 'joint' }])).toEqual([]);
    expect(await glbIssues(file, [{ node: 'nope.l', what: 'part "x" mesh' }])).toEqual(['part "x" mesh: no node named "nope.l"']);
    expect(await glbIssues(join(ROOT, 'public/models/none.glb'), [])).toEqual(['file not found under public/']);
    expect(loadedName('pec major.l')).toBe(PropertyBinding.sanitizeNodeName('pec major.l'));
  });
  it('loads in three with the meshopt decoder: skinned muscle with fibre data, licence in asset.copyright', async () => {
    const buf = readFileSync(file);
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, '');
    expect(gltf.asset.copyright).toBe(SAMPLE_COPYRIGHT);
    gltf.scene.updateMatrixWorld(true);
    const flexor = gltf.scene.getObjectByName(loadedName('sample-flexor.l')) as SkinnedMesh;
    expect(flexor.isSkinnedMesh).toBe(true);
    expect(flexor.userData.closed).toBe(true);
    const g = flexor.geometry;
    g.setAttribute('atlasU', g.getAttribute('_u'));
    g.setAttribute('atlasFibre', g.getAttribute('_fibre'));
    const fibre = fibreMeasure(g)!;
    expect(fibre.length).toBeGreaterThan(0);
    expect(fibre.thickness).toBeGreaterThan(0);
    // At rest the skinned muscle sits on the left limb (+X), from below the shoulder to past the elbow.
    flexor.computeBoundingBox();
    const box = new Box3().copy(flexor.boundingBox!).applyMatrix4(flexor.matrixWorld);
    const c = box.getCenter(new Vector3());
    expect(c.x).toBeCloseTo(1.78, 1);
    expect(box.max.y).toBeCloseTo(0.45, 1);
    expect(box.min.y).toBeCloseTo(-0.08, 1);
  });
});
