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
  it('stays small: 14 parts + 1 context wall in 3 groups', () => {
    expect(file.parts).toHaveLength(15);
    expect(file.parts.filter((p) => p.context)).toHaveLength(1);
    expect(file.groups).toHaveLength(3);
    expect(file.flows).toHaveLength(2);
    expect(file.animations).toHaveLength(3);
  });
  it('exercises every engineered kind and one repeat', () => {
    const kinds = new Set(file.parts.map((p) => p.primitive?.kind));
    for (const k of ENGINEERED_KINDS) expect(kinds.has(k)).toBe(true);
    expect(file.parts.filter((p) => p.repeat)).toHaveLength(1);
  });
  it('stays well under the draw-call budget', () => {
    // One draw call per piece (instanced pieces included).
    const pieces = file.parts.reduce((n, p) => n + primitivePieces(p).length, 0);
    expect(pieces).toBeLessThan(22);
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
