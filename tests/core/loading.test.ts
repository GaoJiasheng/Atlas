import { describe, expect, it } from 'vitest';
import { engineLoaders, engineView, readEngine, readUrlAdapter } from '../../src/engines/core/loading';
import { getEngine } from '../../src/engines/registry';
import { geographyUrlBaseline, geographyUrlPatch } from '../../src/engines/time-scene/lib/geography';
import { monthlyUrlBaseline, monthlyUrlPatch } from '../../src/engines/time-scene/lib/climatology-state';
import type { EngineId } from '../../src/engines/core/types';

describe('engine loading boundary', () => {
  for (const id of Object.keys(engineLoaders) as EngineId[]) {
    it(`${id}: loads the same descriptor used by static rendering and existing state tests`, async () => {
      const engine = await engineLoaders[id]();
      expect(engine).toBe(getEngine(id));
      expect(readEngine(id)).toBe(engine);
      expect(engineView(engine)).toBe(engineView(engine));
    });
  }

  it('keeps geography and climatology views distinct, with stable identities', () => {
    const engine = getEngine('time-scene');
    const historical = engineView(engine);
    const geography = engineView(engine, 'geography');
    const monthly = engineView(engine, 'climatology');
    expect(new Set([historical, geography, monthly]).size).toBe(3);
    expect(engineView(engine, 'geography')).toBe(geography);
    expect(engineView(engine, 'climatology')).toBe(monthly);
    expect(engineView(getEngine('space-scene'), 'geography')).toBe(engineView(getEngine('space-scene')));
  });

  it('uses the existing URL hydration and baseline functions for each monthly mode', () => {
    expect(readUrlAdapter('geography')).toEqual({ patch: geographyUrlPatch, baseline: geographyUrlBaseline });
    expect(readUrlAdapter('climatology')).toEqual({ patch: monthlyUrlPatch, baseline: monthlyUrlBaseline });
    expect(readUrlAdapter()).toBeNull();
    expect(readUrlAdapter('dated')).toBeNull();
  });
});
