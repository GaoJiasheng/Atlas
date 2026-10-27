import { describe, expect, it } from 'vitest';
import { Group, Matrix4, Vector3 } from 'three';
import { spanGeometry, createSpanGeometry } from '../../src/engines/space-scene/lib/span';
import { spanSchema, spanIssues, type SimSpan } from '../../src/engines/space-scene/span-schema';
import { createSpanRuntime, updateSpan } from '../../src/engines/space-scene/stages/model3d/spanRuntime';
import type { PartHandle } from '../../src/engines/space-scene/stages/model3d/PartNode';
import type { MatterPart } from '../../src/engines/space-scene/matter-schema';
import { partsFile } from '../../src/engines/space-scene/schema';
import mechanismFixture from '../../src/content/topics/sample-mechanism/data/parts.json';

const link: SimSpan = { from: { part: 'a', point: [0, 0, 0] }, to: { part: 'b', point: [0, 0, 0] }, minLength: 0.001 };
const rope: MatterPart = { id: 'rope', primitive: { kind: 'cylinder', size: [0.05, 0.05, 1], at: [0, 0, 0], color: 'steel' } };
const endpoint = (id: string): MatterPart => ({ id, primitive: { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' } });
const parts = [rope, endpoint('a'), endpoint('b')];
const context = (partData = parts) => ({ parts: new Set(partData.map((p) => p.id)), partData, repeated: new Set<string>(), contextParts: new Set<string>(), animations: new Map<string, { target: string }>() });
const bind = () => ({ part: 'rope', span: structuredClone(link) });
const messages = (bindings: Parameters<typeof spanIssues>[0], partData = parts) => spanIssues(bindings, context(partData)).map((x) => x.message).join('\n');

function handle(): PartHandle {
  const object = new Group(), pose = new Group(), anim = new Group();
  object.add(pose); pose.add(anim);
  return { clip: true, object, attachmentMatrix: new Matrix4(), offset: [0, 0, 0], point: [0, 0, 0], half: [0.05, 0.5, 0.05], radius: 1, meshes: [], visible: true, fade: 1, restInverse: new Matrix4(), skinned: null, skinRest: null };
}
const world = (matrix: readonly number[], point: [number, number, number]) => new Vector3(...point).applyMatrix4(new Matrix4().fromArray(matrix)).toArray();
const close3 = (actual: readonly number[], expected: readonly number[]) => expected.forEach((x, i) => expect(actual[i]).toBeCloseTo(x, 10));

describe('straight span geometry', () => {
  it('places an arbitrary diagonal: length 5, centre [0,1.5,2], both ends exact', () => {
    const r = spanGeometry([0, 3, 0], [0, 0, 4], 0.001);
    expect(r.length).toBe(5); expect(r.centre).toEqual([0, 1.5, 2]); expect(r.shown).toBe(true);
    close3(world(r.matrix, [0, -0.5, 0]), r.from);
    close3(world(r.matrix, [0, 0.5, 0]), r.to);
    expect(Math.hypot(r.matrix[0]!, r.matrix[1]!, r.matrix[2]!)).toBeCloseTo(1, 12);
    expect(Math.hypot(r.matrix[8]!, r.matrix[9]!, r.matrix[10]!)).toBeCloseTo(1, 12);
  });
  it.each([[12.891, 36.809], [27.891, 21.809], [4.891, 44.809]])('reproduces port rope at spreader centre y=%s', (y, expected) => {
    const r = spanGeometry([-2.6, 50, -18], [-2.6, y + 0.3, -18], 0.001);
    expect(r.length).toBeCloseTo(expected, 10);
    close3(world(r.matrix, [0, -0.5, 0]), r.from); close3(world(r.matrix, [0, 0.5, 0]), r.to);
  });
  it.each([[0, 5, 0], [0, -5, 0], [5, 0, 0], [0, 0, -5], [2, -3, 4]])('orients +Y toward %s', (x, y, z) => {
    const r = spanGeometry([0, 0, 0], [x, y, z], 0.001);
    close3(world(r.matrix, [0, -0.5, 0]), [0, 0, 0]); close3(world(r.matrix, [0, 0.5, 0]), [x, y, z]);
  });
  it('hides coincident and sub-minimum points without zero division; reuses its output', () => {
    const out = createSpanGeometry();
    expect(spanGeometry([1, 2, 3], [1, 2, 3], 0.001, out)).toBe(out);
    expect(out.shown).toBe(false); expect(out.length).toBe(0); expect(out.matrix.every(Number.isFinite)).toBe(true);
    spanGeometry([0, 0, 0], [0, 0.0001, 0], 0.001, out);
    expect(out.shown).toBe(false); expect(out.matrix.every(Number.isFinite)).toBe(true);
  });
});

describe('current-frame part matrices → span → probe bounds', () => {
  it('consumes pose, offset/turn, play and shift in the same pass; updates anchors and bounds', () => {
    const a = handle(), b = handle(), target = handle();
    const map = new Map([['a', a], ['b', b], ['rope', target]]);
    const s = createSpanRuntime('rope', { ...link, from: { part: 'a', point: [1, 0, 0] }, to: { part: 'b', point: [0, 0, 1] } }, 0.05);
    // Attachment matrices are the final part transform, including the timeline and shift.
    a.attachmentMatrix.makeTranslation(0, 3, 0).multiply(new Matrix4().makeRotationZ(Math.PI / 2));
    b.attachmentMatrix.makeTranslation(0, 0, 3);
    target.object.position.set(999, 999, 999); // its own authored rest/explode must not be reapplied
    target.object.children[0]!.matrix.makeTranslation(100, 0, 0);
    expect(updateSpan(s, map)).toBe(true);
    close3(s.geometry.from, [0, 4, 0]); close3(s.geometry.to, [0, 0, 4]);
    close3(target.object.position.toArray(), [0, 2, 2]); expect(target.point).toEqual([0, 0, 0]); expect(target.offset).toEqual([0, 0, 0]);
    expect(target.half[1]).toBeGreaterThanOrEqual(2); expect(target.half[2]).toBeGreaterThanOrEqual(2);
    expect(target.object.children[0]!.matrix.equals(new Matrix4())).toBe(true);
    close3(world(target.attachmentMatrix.elements, [0, -0.5, 0]), s.geometry.from);
    close3(world(target.attachmentMatrix.elements, [0, 0.5, 0]), s.geometry.to);
    // Change both final matrices, then resolve once. No prior-frame endpoint is read.
    a.attachmentMatrix.makeTranslation(10, 3, 0); b.attachmentMatrix.makeTranslation(10, 0, 3);
    target.visible = true; updateSpan(s, map);
    close3(s.geometry.from, [11, 3, 0]); close3(s.geometry.to, [10, 0, 4]);
  });
  it('propagates endpoint hide/group visibility and restores on a later frame; no animation clock needed', () => {
    const a = handle(), b = handle(), target = handle(), map = new Map([['a', a], ['b', b], ['rope', target]]);
    a.attachmentMatrix.makeTranslation(0, 3, 0);
    const s = createSpanRuntime('rope', link, 0.05);
    updateSpan(s, map); expect(s.geometry.shown).toBe(true);
    a.visible = false; target.visible = true; updateSpan(s, map);
    expect(s.geometry.shown).toBe(false); expect(target.object.visible).toBe(false);
    a.visible = target.visible = true; b.attachmentMatrix.makeTranslation(0, 0, 4); updateSpan(s, map);
    expect(s.geometry.shown).toBe(true); expect(s.geometry.length).toBe(5);
    expect(updateSpan(s, map)).toBe(false); // idle frame doesn't dirty shadows
  });
});

describe('span validation', () => {
  it('accepts a geometry-only part+span branch', () => {
    expect(spanSchema.parse({ from: link.from, to: link.to }).minLength).toBe(0.001);
    expect(messages([bind()])).toBe('');
  });
  it('rejects non-positive minimum length, foreign source/control and multiple targets', () => {
    expect(spanSchema.safeParse({ ...link, minLength: 0 }).success).toBe(false);
    expect(messages([{ ...bind(), control: 'x' }])).toMatch(/only part \+ span/);
    expect(messages([{ ...bind(), output: 'x' }])).toMatch(/only part \+ span/);
    expect(messages([{ ...bind(), part: ['rope'] }])).toMatch(/exactly one/);
  });
  it('rejects missing/self/span/repeat endpoints, cycles and duplicate drivers', () => {
    const missing = bind(); missing.span.to.part = 'missing'; expect(messages([missing])).toMatch(/unknown span endpoint/);
    const self = bind(); self.span.to.part = 'rope'; expect(messages([self])).toMatch(/itself/);
    expect(messages([bind(), bind()])).toMatch(/duplicate span/);
    expect(messages([bind(), { part: 'rope', output: 'x', offset: {} }])).toMatch(/another binding driver/);
    const second = { part: 'a', span: { ...link, from: { part: 'rope', point: [0, 0, 0] as [number, number, number] } } };
    expect(messages([bind(), second])).toMatch(/another span \(including cycles\)/);
    expect(messages([bind()], [rope, { ...endpoint('a'), repeat: {} }, endpoint('b')])).toMatch(/cannot be repeated/);
  });
  it('rejects extra, repeat, non-unit height, rotation, context and animation-driven targets', () => {
    expect(messages([bind()], [{ ...rope, extra: [{}] }, endpoint('a'), endpoint('b')])).toMatch(/repeat or extra/);
    expect(messages([bind()], [{ ...rope, repeat: {} }, endpoint('a'), endpoint('b')])).toMatch(/repeat or extra/);
    for (const patch of [{ size: [0.05, 0.05, 2] }, { rotation: [0, 0, 90] }, { scale: [1, 2, 1] }]) {
      const data = structuredClone(parts); Object.assign(data[0]!.primitive!, patch); expect(messages([bind()], data)).toMatch(/Y-axis cylinder of height 1/);
    }
    const ctx = context(); ctx.contextParts.add('rope'); ctx.animations.set('spin', { target: 'rope' });
    expect(spanIssues([bind()], ctx).map((x) => x.message).join('\n')).toMatch(/context/);
    expect(spanIssues([bind()], ctx).map((x) => x.message).join('\n')).toMatch(/animation driver/);
    expect(messages(Array.from({ length: 17 }, () => bind()))).toMatch(/at most 16/);
  });
  it('rejects authored pose drivers at the complete parts-file boundary', () => {
    const file = structuredClone(mechanismFixture) as unknown as Record<string, any>;
    file.parts.push({ ...file.parts[0], id: 'rope', primitive: rope.primitive });
    file.sim.bind.push({ part: 'rope', span: { from: { part: 'beam', point: [0, 0, 0] }, to: { part: 'parallel-inner', point: [0, 0, 0] } } });
    file.poses = { clash: { rope: { offset: [0, 1, 0] } } };
    const result = partsFile.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((x) => x.message).join('\n')).toMatch(/span target "rope" cannot have a pose driver/);
  });
});
