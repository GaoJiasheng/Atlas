import { describe, expect, it } from 'vitest';
import { markerFocus } from '../../src/engines/time-scene/lib/markers';

describe('markerFocus', () => {
  it('leaves the browsed map as it was', () => { expect(markerFocus('map', true, false)).toBe(1); expect(markerFocus('map', false, false)).toBe(0.6); });
  it('keeps what a beat names at full strength', () => expect(markerFocus('named', false, true)).toBe(1));
  it('steps back the markers a beat does not name', () => {
    expect(markerFocus('named', false, false)).toBeLessThan(0.2);
    expect(markerFocus('named', true, false)).toBeLessThan(0.6);
    expect(markerFocus('beat', false, false)).toBeLessThan(markerFocus('beat', true, false));
  });
});
