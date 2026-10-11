import { describe, expect, it } from 'vitest';
import { withSharedFitness } from '../../src/content/schema/fitness';
import { readSharedFitness } from '../../scripts/lib/shared-data';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import { ENGINEERED_KINDS } from '../../src/engines/space-scene/schema';
import { primitivePieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const read = (name: string) => JSON.parse(readFileSync(join(__dirname, `../../src/content/topics/sample-space/data/${name}.json`), 'utf8'));
const data = spaceSceneData.parse(
  withSharedFitness(
    { parts: read('parts'), sources: read('sources'), glossary: read('glossary'), training: read('training') },
    readSharedFitness(join(__dirname, '../../src/content/shared')),
  ),
);
const file = data.parts;

describe('sample-space data (placeholder)', () => {
  it('stays small: 21 parts (6 bilateral pairs) + 1 context wall in 5 groups', () => {
    // 21 numbered parts, 3 mirror twins and 3 glb twins added by the bilateral expansion, the wall.
    expect(file.parts).toHaveLength(28);
    expect(file.parts.filter((p) => p.twinOf)).toHaveLength(6);
    expect(file.parts.filter((p) => p.context)).toHaveLength(1);
    expect(file.groups).toHaveLength(5);
    expect(file.flows).toHaveLength(2);
    // 6 written + the leg's and the flexor's mirrored copies + the shoulder clip's right-side copy.
    expect(file.animations).toHaveLength(9);
  });
  it('exercises the glb path: skinned mesh parts with materials, real right-side nodes, rig, sites, a muscle sheet and exercises', () => {
    expect(file.model).toBe('/models/sample-space.glb');
    const flexor = file.parts.find((p) => p.id === 'sample-flexor')!;
    const twin = file.parts.find((p) => p.id === 'sample-flexor-r')!;
    expect(flexor.material).toEqual({ color: 'muscle', tint: 'token:muscle-1' });
    expect(twin.mesh).toBe('sample-flexor.r');
    // The muscle sheet fills the part's summary, detail and short name.
    expect(flexor.summary.en).toMatch(/placeholder muscle/);
    expect(flexor.short?.en).toBe('Sample flexor');
    expect(Object.keys(file.rig!.joints)).toEqual(['shoulder.l', 'elbow.l', 'hand.l', 'shoulder.r', 'elbow.r', 'hand.r']);
    // Left joints drive the right ones; the pose contracts both flexors.
    expect(file.poses!['sample-curl']!.joints['elbow.r']).toEqual({ flexion: 100 });
    expect(file.poses!['sample-curl']!.contract).toEqual({ 'sample-flexor': 0.8, 'sample-flexor-r': 0.8 });
    // Sites mirrored for the twin.
    expect(file.sites!.filter((s) => s.muscle === 'sample-flexor-r').map((s) => s.bone)).toEqual(['sample-upper-r', 'sample-lower-r']);
    expect(data.training?.exercises).toEqual(['sample-curl', 'sample-raise']);
    expect(data.fitness?.muscles.map((m) => m.id)).toEqual(['sample-flexor']);
    expect(data.fitness?.exercises.map((e) => e.id)).toEqual(['sample-curl', 'sample-raise', 'sample-hang']);
  });
  it('exercises the organism features: sweep, wing, scale, bilateral, pose, named cut, units, organism materials', () => {
    const kinds = new Set(file.parts.flatMap((p) => [p.primitive?.kind, ...(p.extra ?? []).map((e) => e.kind)]));
    expect(kinds.has('sweep') && kinds.has('wing')).toBe(true);
    expect(file.parts.some((p) => p.primitive?.scale)).toBe(true);
    expect(Object.keys(file.poses ?? {})).toContain('sample-open');
    expect(Object.keys(file.views.cuts ?? {})).toContain('sample-cross');
    expect(file.units).toEqual({ modelUnit: 'cm', scale: 25 });
    const colors = new Set(file.parts.flatMap((p) => [p.primitive?.color, ...(p.extra ?? []).map((e) => e.color)]));
    for (const c of ['chitin', 'membrane', 'tissue', 'eye']) expect(colors.has(c as never)).toBe(true);
    expect(file.animations.some((a) => a.pivot)).toBe(true);
  });
  it('exercises every engineered kind and one repeat', () => {
    const kinds = new Set(file.parts.map((p) => p.primitive?.kind));
    for (const k of ENGINEERED_KINDS) expect(kinds.has(k)).toBe(true);
    expect(file.parts.filter((p) => p.repeat)).toHaveLength(1);
  });
  it('stays well under the draw-call budget', () => {
    // One draw call per piece (instanced pieces included).
    const pieces = file.parts.reduce((n, p) => n + primitivePieces(p).length, 0);
    expect(pieces).toBeLessThan(28);
  });
  it('exercises hide, shells, enamel, stops + open ends, spec, telemetry', () => {
    expect(file.parts.filter((p) => p.shell).length).toBeGreaterThan(0);
    expect(file.parts.some((p) => p.primitive?.color === 'enamel')).toBe(true);
    expect(file.flows.some((f) => f.stops && f.ends === 'open')).toBe(true);
    expect(file.flows.some((f) => f.parts)).toBe(true);
    expect(file.spec?.length).toBeGreaterThan(0);
    expect(file.telemetry?.length).toBeGreaterThan(0);
    expect(data.glossary?.terms.length).toBeGreaterThan(0);
  });
});
