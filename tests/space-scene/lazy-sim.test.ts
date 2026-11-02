import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { evaluateSim, simQuantities } from '../../src/engines/space-scene/lib/sim';
import { loadSim, evaluateSim as browserEvaluate, simQuantities as browserQuantities } from '../../src/engines/space-scene/lib/sim/runtime';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';

describe('lazy browser solver registry parity', () => {
  const cases = readdirSync('src/content/topics').flatMap(topic => {
    const path = `src/content/topics/${topic}/data/parts.json`;
    if (!existsSync(path)) return [];
    const file = JSON.parse(readFileSync(path, 'utf8'));
    return file.sim ? [{ topic, file, sim: simSchema.parse(file.sim) }] : [];
  });
  it('covers every registered simulation kind', () => {
    expect(new Set(cases.map(c => c.sim.kind)).size).toBe(18);
  });
  for (const { topic, file, sim } of cases) it(`${topic}: same quantities and output fallbacks for every control setting`, async () => {
    await loadSim(sim.kind);
    const defaults = resolveSimValues(sim, {});
    const inputs = [defaults, ...sim.controls.flatMap(c => {
      const choices = c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map(o => o.id);
      return choices.map(value => resolveSimValues(sim, { [c.id]: value }));
    })];
    const observe = sim.outputs.map(o => o.id);
    for (const values of inputs) {
      expect(browserQuantities(sim, values, observe, undefined, file.parts)).toEqual(simQuantities(sim, values, observe, undefined, file.parts));
      expect(browserEvaluate(sim, values, observe, undefined, file.parts)).toEqual(evaluateSim(sim, values, observe, undefined, file.parts));
    }
  });
});
