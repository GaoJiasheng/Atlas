import { describe, expect, it } from 'vitest';
import { blocAt, blocsOf, blocSpansN, changesBloc, firstBloc } from '../../src/engines/time-scene/lib/bloc';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import { entityCssColor } from '../../src/engines/time-scene/colors';
import type { Entity } from '../../src/engines/time-scene/schema';

const italy: Entity = {
  id: 'italy',
  name: { en: 'Italy', zh: '意大利' },
  joined: '1940-06-10',
  bloc: [
    { bloc: 'axis', from: '1940-06-10', to: '1943-09-08' },
    // Gap between the armistice and the declaration of war.
    { bloc: 'allied', from: '1943-10-13' },
  ],
};
const japan: Entity = { id: 'japan', name: { en: 'Japan', zh: '日本' }, joined: '1937-07-07', bloc: 'axis' };
const n = (t: string) => toNumber(t);

describe('blocAt', () => {
  it('returns a plain bloc at any time', () => {
    expect(blocAt(japan, n('1900'))).toBe('axis');
    expect(blocAt(japan, n('1945-09-02'))).toBe('axis');
  });

  it('follows the spans of an entity that changes sides', () => {
    expect(blocAt(italy, n('1941-01-01'))).toBe('axis');
    expect(blocAt(italy, n('1943-10-13'))).toBe('allied');
    expect(blocAt(italy, n('1945-05-08'))).toBe('allied');
  });

  it('uses the first span before it starts and the last ended span inside a gap', () => {
    expect(blocAt(italy, n('1939-09-01'))).toBe('axis');
    expect(blocAt(italy, n('1943-09-20'))).toBe('axis');
  });

  it('switches exactly at `from` (spans are [from, to))', () => {
    expect(blocAt(italy, n('1943-10-12'))).toBe('axis');
    expect(blocAt(italy, n('1943-10-13'))).toBe('allied');
  });
});

describe('bloc helpers', () => {
  it('lists blocs and detects side changes', () => {
    expect(firstBloc(italy)).toBe('axis');
    expect(blocsOf(italy)).toEqual(['axis', 'allied']);
    expect(changesBloc(italy)).toBe(true);
    expect(changesBloc(japan)).toBe(false);
    expect(blocSpansN(japan)).toEqual([{ bloc: 'axis', from: -Infinity, to: Infinity }]);
    expect(blocSpansN(italy)[1]).toEqual({ bloc: 'allied', from: n('1943-10-13'), to: Infinity });
  });

  it('colours by the bloc at t unless the entity has its own colour', () => {
    expect(entityCssColor(italy, n('1941'))).toBe('var(--accent-axis)');
    expect(entityCssColor(italy, n('1944'))).toBe('var(--accent-allied)');
    expect(entityCssColor(italy)).toBe('var(--accent-axis)');
  });
});
