import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { partsFile } from '../../src/engines/space-scene/schema';
import { needsSimTools, prepareEngineData } from '../../src/engines/core/loading-data';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import * as client from '../../src/engines/space-scene/lib/sim/sim-tools.client';
import { readSimTools } from '../../src/engines/space-scene/lib/sim/sim-tools-resource';
import { simEffects, slotTint, placeDirection } from '../../src/engines/space-scene/lib/sim/bind';
import { statusTag } from '../../src/engines/space-scene/lib/sim/table';
import { evaluateSimOnStage } from '../../src/engines/space-scene/lib/sim/carrier';
import { outputText, valueText } from '../../src/engines/space-scene/lib/sim/text';

describe('optional browser simulation tools', () => {
  it('keeps ordinary part highlights and telemetry synchronous without simulation data', async () => {
    for (const engine of ['space-scene', 'time-scene', 'math-scene', 'simulation'] as const) {
      expect(needsSimTools(engine, {})).toBe(false);
      await prepareEngineData(engine, {});
    }
    expect(needsSimTools('time-scene', { parts: { sim: {} } })).toBe(false);
    expect(client.slotTint).toBe(slotTint);
    expect(client.placeDirection).toBe(placeDirection);
    expect(client.statusTag).toBe(statusTag);
    expect(client.slotTint(0, 'chapter', null)).toBe('chapter');
    expect(client.statusTag([], [])).toBe('SIM');
  });

  for (const topic of readdirSync('src/content/topics')) {
    const path = `src/content/topics/${topic}/data/parts.json`;
    if (!existsSync(path)) continue;
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    if (!raw.sim) continue;
    const file = partsFile.parse(raw);
    const sim = simSchema.parse(raw.sim);
    it(`${topic}: prepares the original tools and solver before any callback runs`, async () => {
      await prepareEngineData('space-scene', { parts: { ...file, sim } });
      expect(readSimTools().simEffects).toBe(simEffects);
      const defaults = resolveSimValues(sim, {});
      const inputs = [defaults, ...sim.controls.flatMap(c => {
        const choices = c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map(o => o.id);
        return choices.map(value => resolveSimValues(sim, { [c.id]: value }));
      })];
      await Promise.resolve().then(() => {
        for (const values of inputs) {
          const expected = evaluateSimOnStage(sim, file, values, null);
          expect(client.evaluateSimOnStage(sim, file, values, null)).toEqual(expected);
          expect(client.simEffects(sim, values, expected.outputs)).toEqual(simEffects(sim, values, expected.outputs));
          for (const locale of ['en', 'zh'] as const) {
            for (const control of sim.controls) expect(client.valueText(control, values[control.id], locale)).toBe(valueText(control, values[control.id], locale));
            for (const output of sim.outputs) expect(client.outputText(output, expected.outputs[output.id], locale)).toBe(outputText(output, expected.outputs[output.id], locale));
          }
        }
      });
    });
  }
});
