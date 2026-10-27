/** The published captions must agree with the actual table and source geometry. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';

const dir = 'src/content/topics/bones-and-joints';
const file = partsFile.parse(JSON.parse(readFileSync(join(dir, 'data/parts.json'), 'utf8')));
const chapters = readdirSync(join(dir, 'chapters')).filter((name) => name.endsWith('.mdx')).sort().map((name) => {
  const [, front, ...body] = readFileSync(join(dir, 'chapters', name), 'utf8').split(/^---$/m);
  return { ...parseYaml(front!), body: body.join('---') };
});
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const lever = chapter('muscles-and-levers');
const atBeat = (i: number) => {
  const values = resolveSimValues(file.sim!, { ...lever.state.sim?.set, ...lever.state.beats[i].sim?.set });
  const outputs = evaluateSim(file.sim!, values);
  return { values, outputs, effects: simEffects(file.sim!, values, outputs), caption: lever.state.beats[i].caption };
};

describe('bones and joints: captions agree with their displayed model', () => {
  it('keeps the agreed eight chapters and forty bilingual, nonempty captions', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 6, 5, 5, 6, 6, 4, 4]);
    for (const c of chapters) for (const b of c.state.beats) {
      expect(b.caption.en.length).toBeGreaterThan(10);
      expect(b.caption.zh.length).toBeGreaterThan(5);
    }
  });
  it('states 150 N at the actual 20 N, 0.30 m, 90-degree beat', () => {
    const b = atBeat(4);
    expect(b.outputs.load).toBe(20);
    expect(b.outputs['load-arm']).toBeCloseTo(.3, 10);
    expect(b.outputs['load-torque']).toBeCloseTo(6, 10);
    expect(b.outputs['muscle-force']).toBeCloseTo(150, 9);
    expect(b.effects.joints.get('elbow.l')).toEqual({ flexion: 90 });
    expect(b.caption.en).toMatch(/150|one hundred and fifty/);
    expect(b.caption.zh).toMatch(/150|一百五十/);
  });
  it('connects the four PLATE rows to observed numeric outputs instead of leaving readings absent', () => {
    expect(file.telemetry?.map((r) => r.follow)).toEqual(['load', 'load-arm', 'muscle-force', 'angle']);
    expect(file.telemetry?.every((r) => r.scope === 'observe')).toBe(true);
    for (const r of file.telemetry ?? []) expect(lever.state.sim.try.observe).toContain(r.follow);
  });
  it('states 75 N after shortening the perpendicular arm by changing the angle', () => {
    const before = atBeat(4), after = atBeat(5);
    expect(after.outputs.load).toBe(before.outputs.load);
    expect(after.values['load-distance']).toBe(before.values['load-distance']);
    expect(after.outputs['load-arm']).toBeCloseTo(.15, 10);
    expect(after.outputs['muscle-force']).toBeCloseTo(75, 9);
    expect(after.effects.joints.get('elbow.l')).toEqual({ flexion: 30 });
    expect(after.caption.en).toMatch(/75|seventy-five/);
    expect(after.caption.zh).toMatch(/75|七十五/);
  });
  it('the distance prediction changes only distance and doubles the required model force', () => {
    const close = atBeat(3), far = atBeat(4);
    expect(close.values['load-force']).toBe(far.values['load-force']);
    expect(close.values['elbow-angle']).toBe(far.values['elbow-angle']);
    expect(far.values['load-distance']).toBe((close.values['load-distance'] as number) * 2);
    expect(far.outputs['muscle-force']).toBeCloseTo((close.outputs['muscle-force'] as number) * 2, 9);
  });
  it('anatomical pulling beats leave the rig to their declared named pose', () => {
    for (let i = 0; i < 3; i++) expect(atBeat(i).effects.joints.size).toBe(0);
    for (const c of chapters.filter((c) => c.id !== 'muscles-and-levers')) {
      const v = resolveSimValues(file.sim!, c.state.sim?.set ?? {});
      expect(simEffects(file.sim!, v, evaluateSim(file.sim!, v)).joints.size).toBe(0);
    }
  });
  it('six synovial examples use the intended distinct bones, with no growth or healing-time solver', () => {
    const indexes = new Set(chapter('six-synovial-types').state.index.parts);
    for (const id of ['carpal-scaphoid', 'carpal-lunate', 'humerus-l', 'ulna-l', 'radius-l', 'mcp-metacarpal', 'mcp-phalanx', 'thumb-trapezium', 'thumb-metacarpal', 'hip-bone-l', 'femur-l']) expect(indexes.has(id)).toBe(true);
    expect(file.sim!.kind).toBe('table');
    expect(Object.keys(file.sim!.table!.experiments)).toEqual(['lever']);
    expect(chapter('growth-and-repair').state.sim?.try).toBeUndefined();
    expect(chapter('growth-and-repair').body).toMatch(/deadline|days|天数|期限/);
  });
});
