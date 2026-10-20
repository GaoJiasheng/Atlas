import { describe, expect, it } from 'vitest';
import { SCALE } from '../../src/engines/math-scene/lib/decimal';
import { readingQty } from '../../src/engines/math-scene/lib/measure-tasks';
import type { InstrumentSpec } from '../../src/engines/math-scene/schema';

/** A dial marked in kg with tenths: a reading of 1.4 kg must keep its decimal place. */
const dial = { kind: 'instrument', type: 'dial', unit: 'kg', from: 0, to: 3, major: 1, minor: 10 } as unknown as InstrumentSpec;

describe('readingQty keeps the places a reading needs', () => {
  it('1.4 kg stays 1.4 kg, not 1 kg', () => {
    const q = readingQty(dial, 1.4 * SCALE);
    expect(q.kind).toBe('meas');
    if (q.kind === 'meas') expect(q.value).toEqual({ units: 1_400_000, dp: 1 });
  });
  it('a whole reading has no places', () => {
    const q = readingQty(dial, 2 * SCALE);
    if (q.kind === 'meas') expect(q.value.dp).toBe(0);
  });
  it('0.25 kg keeps two places', () => {
    const q = readingQty(dial, 0.25 * SCALE);
    if (q.kind === 'meas') expect(q.value.dp).toBe(2);
  });
});
