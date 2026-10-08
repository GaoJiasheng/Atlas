import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spaceSceneData } from '../../src/engines/space-scene/schema';
import { ENGINEERED_KINDS } from '../../src/engines/space-scene/schema';
import { primitivePieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const file = spaceSceneData.parse({
  parts: JSON.parse(readFileSync(join(__dirname, '../../src/content/topics/sample-space/data/parts.json'), 'utf8')),
}).parts;

describe('sample-space data (placeholder)', () => {
  it('stays small: ≤ 14 parts in 3 groups', () => {
    expect(file.parts).toHaveLength(13);
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
    expect(pieces).toBeLessThan(20);
  });
});
