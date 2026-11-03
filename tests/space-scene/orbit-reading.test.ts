import { describe, expect, it } from 'vitest';
import { orbitExpectedParts, orbitReadingComplete } from '../../src/engines/space-scene/stages/model3d/orbitReading';

const parts = [{ id: 'sun-body', mesh: 'sun-body' }, { id: 'observer-marker' }, { id: 'unused' }];

describe('orbit rendered reading', () => {
  it('waits for glb bodies that have no stand-in while the model loads', () => {
    const shapes = new Map([['observer-marker', {}]]);
    const expected = orbitExpectedParts(parts, shapes, true);
    expect([...expected].sort()).toEqual(['observer-marker', 'sun-body']);
    const handles = new Map([['observer-marker', { object: {} }]]);
    expect(orbitReadingComplete(['sun-body', 'observer-marker'], expected, handles)).toBe(false);
    handles.set('sun-body', { object: {} });
    expect(orbitReadingComplete(['sun-body', 'observer-marker'], expected, handles)).toBe(true);
  });
  it('waits for a handle whose node has not attached its object yet', () => {
    const expected = new Set(['observer-marker']);
    expect(orbitReadingComplete(['observer-marker'], expected, new Map([['observer-marker', { object: null }]]))).toBe(false);
  });
  it('does not wait for bodies that will never be drawn (model failed, no stand-in)', () => {
    const expected = orbitExpectedParts(parts, new Map([['observer-marker', {}]]), false);
    expect(orbitReadingComplete(['sun-body', 'observer-marker'], expected, new Map([['observer-marker', { object: {} }]]))).toBe(true);
  });
});
