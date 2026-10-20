import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { outputText, outputWords, timeText, valueText, valueWords } from '../../src/engines/space-scene/lib/sim/text';
import { placeDirection, simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { chartModel, chartSummary } from '../../src/engines/space-scene/lib/sim/chart';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { boardSim } from './fixtures/board-circuit';

const time = simSchema.parse({ ...boardSim, controls: [{ id: 'time', kind: 'step', label: { en: 'Time', zh: '时间' }, values: [8, 9, 13], default: 8, unit: 'h', format: 'time' }] }).controls[0]!;
const output = simSchema.parse({ ...boardSim, outputs: [{ id: 'noon', label: { en: 'Noon', zh: '正午' }, from: 'sun:noon', unit: 'h', format: 'time' }] }).outputs[0]!;

describe('light time display uses shared clock notation', () => {
  it('formats controls, fractional hours and short graph ticks in both languages', () => {
    expect(valueText(time, 8, 'en')).toBe('8.00 am');
    expect(valueText(time, 8, 'zh')).toBe('上午 8.00');
    expect(outputText(output, 12 + 50 / 60, 'en')).toBe('12.50 pm');
    expect(timeText(13, 'en', true)).toBe('1 pm');
    expect(timeText(8, 'zh', true)).toBe('上午 8');
    expect(outputText(output, NaN, 'en')).toBe('—');
    expect(timeText(23 + 59.9 / 60, 'en')).toBe('12.00 am');
    expect(valueWords(time, 8, 'en')).toMatch(/eight.*a\.m\./);
    expect(valueWords(time, 8, 'zh')).toContain('八');
    expect(outputWords(output, 13, 'en')).toMatch(/one.*p\.m\./);
  });

  it('describes elapsed graph steps as durations', () => {
    const rows = [8, 9, 13].map((vary) => ({ vary, values: { noon: vary - 7 } }));
    const model = chartModel(rows, time, [output], 9)!;
    const summary = chartSummary(model, {
      locale: 'en', x: 'Time', xText: (v) => valueText(time, v, 'en'), xDeltaText: (v) => `${v} h`,
      y: () => 'Length', yText: (_, v) => `${v} m`,
    });
    expect(summary).toContain('for every 1 h');
    expect(summary).toContain('at 8.00 am');
  });
});

describe('sun-disc placement', () => {
  it('normalizes the vector and retains the sphere and facing contract', () => {
    const effects = simEffects({ ...boardSim, bind: [{ output: 'sun-at', part: 'sun', place: { centre: [10, 0.05, 0], radius: 7, face: 'centre' } }] }, {}, { 'sun-at': { x: 3, y: 4, z: 0 } });
    const p = effects.place.get('sun')!;
    expect(p.direction).toEqual([0.6, 0.8, 0]);
    const centre = new Vector3(...p.centre);
    const position = centre.clone().addScaledVector(new Vector3(...p.direction), p.radius);
    expect(position.distanceTo(centre)).toBeCloseTo(7, 12);
    const facing = new Vector3(...p.direction).negate();
    const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), facing);
    expect(new Vector3(0, 1, 0).applyQuaternion(rotation).distanceTo(facing)).toBeLessThan(1e-12);
  });

  it('interpolates along the sphere, including equal and opposite vectors', () => {
    const out: [number, number, number] = [0, 0, 0];
    for (const target of [[1, 0, 0], [0, 1, 0], [0, -1, 0]] as const) {
      for (let i = 0; i <= 10; i++) {
        placeDirection([0, 1, 0], [...target], i / 10, out);
        expect(Math.hypot(...out)).toBeCloseTo(1, 12);
        if (i === 10) expect(new Vector3(...out).distanceTo(new Vector3(...target))).toBeLessThan(1e-6);
      }
    }
    placeDirection([0, 1, 0], [1, 0, 0], 0.5, out);
    expect(out[0]).toBeCloseTo(Math.SQRT1_2, 12);
    expect(out[1]).toBeCloseTo(Math.SQRT1_2, 12);
  });
});
