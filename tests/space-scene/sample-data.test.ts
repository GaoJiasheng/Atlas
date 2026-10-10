import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import { ENGINEERED_KINDS } from '../../src/engines/space-scene/schema';
import { primitivePieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const read = (name: string) => JSON.parse(readFileSync(join(__dirname, `../../src/content/topics/sample-space/data/${name}.json`), 'utf8'));
const data = spaceSceneData.parse({ parts: read('parts'), sources: read('sources'), glossary: read('glossary') });
const file = data.parts;

describe('sample-space data (placeholder)', () => {
  it('stays small: 18 parts (3 bilateral pairs) + 1 context wall in 4 groups', () => {
    // 18 numbered parts, 3 mirror twins added by the bilateral expansion, the wall.
    expect(file.parts).toHaveLength(22);
    expect(file.parts.filter((p) => p.twinOf)).toHaveLength(3);
    expect(file.parts.filter((p) => p.context)).toHaveLength(1);
    expect(file.groups).toHaveLength(4);
    expect(file.flows).toHaveLength(2);
    // 4 written + the leg's mirrored step.
    expect(file.animations).toHaveLength(5);
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
