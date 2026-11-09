import { describe, expect, it } from 'vitest';
import { needsPartFill, prepareEngineData } from '../../src/engines/core/loading-data';
import { loadPartFill, readPartFill } from '../../src/engines/space-scene/lib/sim/part-fill';
import { capacity, easeFillVolume, fillShapeForPrimitive } from '../../src/engines/space-scene/lib/fill';
import { createFillGeometry, updateFillGeometry } from '../../src/engines/space-scene/stages/model3d/fillGeometry';

describe('liquid runtime loading', () => {
  const data = { parts: { sim: { bind: [{ part: 'liquid', fill: { per: 1 } }] } } };
  it('loads only for an explicit SpaceScene part fill binding', () => {
    expect(needsPartFill('space-scene', data)).toBe(true);
    for (const value of [undefined, null, {}, { parts: {} }, { parts: { sim: { bind: [] } } }, { parts: { sim: { bind: [{ part: 'cup' }, { flow: 'water' }] } } }]) {
      expect(needsPartFill('space-scene', value)).toBe(false);
    }
    expect(needsPartFill('time-scene', data)).toBe(false);
    expect(needsPartFill('math-scene', data)).toBe(false);
  });
  it('finishes preparation before exposing exactly the existing geometry and easing functions', async () => {
    await prepareEngineData('space-scene', data);
    expect(readPartFill()).toMatchObject({ capacity, easeFillVolume, fillShapeForPrimitive, createFillGeometry, updateFillGeometry });
    const runtime = readPartFill();
    await loadPartFill();
    expect(readPartFill()).toBe(runtime);
    await expect(prepareEngineData('space-scene', {})).resolves.toBeUndefined();
  });
});
