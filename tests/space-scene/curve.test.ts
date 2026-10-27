import { describe, expect, it } from 'vitest';
import { simSchema, type SimData } from '../../src/engines/space-scene/sim-schema';
import { curveCacheKey, curveCursor, curveDiagnostics, curveEvaluator, curveModel, curveSummary, type CurveSpec } from '../../src/engines/space-scene/lib/sim/curve';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues, setSimControl } from '../../src/engines/space-scene/lib/sim/controls';
import { recordRow } from '../../src/engines/space-scene/lib/sim/trial';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';

const l = (en: string, zh = en) => ({ en, zh });
const fixture = () => simSchema.parse({
  kind: 'heat',
  controls: [
    { id: 'elapsed-s', kind: 'step', label: l('Elapsed'), values: Array.from({ length: 11 }, (_, i) => i * 30), default: 0, unit: 's' },
    { id: 'water-g', kind: 'step', label: l('Water'), values: [200, 300, 400], default: 200, unit: 'g' },
    { id: 'heater-w', kind: 'step', label: l('Power'), values: [0, 50, 100], default: 100, unit: 'W' },
    { id: 'cover', kind: 'choice', label: l('Cover'), options: [{ id: 'bare', label: l('Bare') }, { id: 'wrapped', label: l('Wrapped') }], default: 'bare' },
  ],
  outputs: [
    { id: 'heated-c', label: l('Heated water', '加热的水'), kind: 'number', unit: '°C', decimals: 1, from: 'temperature:heater' },
    { id: 'cool-c', label: l('Cooling water', '冷却的水'), kind: 'number', unit: '°C', decimals: 1, from: 'temperature:cooler' },
  ],
  heat: { time: 'elapsed-s', lumps: {
    heater: { initial: 25, capacity: { mass: { control: 'water-g' }, specific: 4.2 }, power: { control: 'heater-w' } },
    cooler: { initial: 85, capacity: 840, reservoir: { temperature: 25, conductance: { control: 'cover', values: { bare: 2, wrapped: 0.5 } } } },
  } },
});
const curve: CurveSpec = { x: 'elapsed-s', y: ['heated-c', 'cool-c'], samples: 101 };

describe('continuous model curve', () => {
  it('samples exact analytic trajectories and endpoints, with a fixed 0–100 °C axis', () => {
    const sim = fixture();
    const model = curveModel(sim, {}, curve)!;
    expect(model.domain).toEqual([0, 300]);
    expect(model.yDomain).toEqual([0, 100]);
    expect(model.ticks).toEqual([0, 60, 120, 180, 240, 300]);
    expect(model.series[0]!.points).toHaveLength(101);
    expect(model.series[0]!.points[0]).toEqual({ x: 0, y: 25 });
    expect(model.series[0]!.points[40]!.x).toBe(120);
    expect(model.series[0]!.points[40]!.y).toBeCloseTo(39.285714286, 6);
    expect(model.series[0]!.points[100]!.y).toBeCloseTo(60.714285714, 6);
    expect(model.series[1]!.points[40]!.y).toBeCloseTo(70.088637585, 6);
    expect(model.series[1]!.points.every((p) => p.y >= 25 && p.y <= 85)).toBe(true);
    expect(model.table.map((r) => r.x)).toEqual(model.ticks);
  });
  it('cursor, observe, manual row and model table use exactly the same solver value', () => {
    const sim = fixture();
    const values = resolveSimValues(sim, { 'elapsed-s': 120 });
    const cursor = curveCursor(sim, values, curve)!;
    const outputs = evaluateSim(sim, values);
    const rows = recordRow([], { vary: 120, values: outputs });
    expect(cursor.x).toBe(120);
    expect(cursor.values['heated-c']).toBe(outputs['heated-c']);
    expect(rows[0]!.values['heated-c']).toBe(cursor.values['heated-c']);
    const model = curveModel(sim, values, curve)!;
    expect(model.series[0]!.points[40]!.y).toBe(cursor.values['heated-c']);
    expect(model.table[2]!.values['heated-c']).toBe(cursor.values['heated-c']);
    expect(outputText(sim.outputs[0]!, cursor.values['heated-c'], 'en')).toBe('39.3');
  });
  it('excludes cursor time from its cache; includes every held control, samples and series', () => {
    const sim = fixture();
    const first = curveModel(sim, {}, curve);
    expect(curveModel(sim, { 'elapsed-s': 120 }, curve)).toBe(first);
    expect(curveCacheKey(sim, {}, curve)).toBe(curveCacheKey(sim, { 'elapsed-s': 300 }, curve));
    expect(curveModel(sim, { 'heater-w': 50 }, curve)).not.toBe(first);
    expect(curveModel(sim, { 'water-g': 400 }, curve)).not.toBe(first);
    expect(curveModel(sim, { cover: 'wrapped' }, curve)).not.toBe(first);
    expect(curveModel(sim, {}, { ...curve, samples: 33 })).not.toBe(first);
    expect(curveModel(sim, {}, { ...curve, y: ['heated-c'] })).not.toBe(first);
    expect(curveModel(sim, { 'elapsed-s': 120, 'heater-w': 50 }, curve)!.series[0]!.points[40]!.y).toBeCloseTo(32.142857143, 6);
    expect(curveCursor(sim, { 'elapsed-s': 120, 'heater-w': 50 }, curve)!.x).toBe(120);
  });
  it('samples between legal steps without permitting those values in control state', () => {
    const sim = fixture();
    expect(curveEvaluator(sim, resolveSimValues(sim, {}), curve)!.sampleAt(3)['heated-c']).toBeCloseTo(25 + 300 / 840, 10);
    expect(setSimControl(sim, {}, 'elapsed-s', 3)).toEqual({});
    expect(setSimControl(sim, {}, 'elapsed-s', 120)).toEqual({ 'elapsed-s': 120 });
    expect(curveEvaluator(sim, {}, { ...curve, x: 'water-g' })).toBeNull();
    expect(curveEvaluator({ ...sim, kind: 'table' } as SimData, {}, curve)).toBeNull();
  });
  it('exposes detached numeric diagnostics and bilingual trend summaries', () => {
    const sim = fixture();
    const diagnostics = curveDiagnostics(sim, { 'elapsed-s': 120 }, curve)!;
    expect(diagnostics.cursor!.values['heated-c']).toBeCloseTo(39.285714286, 6);
    diagnostics.series[0]!.points[0]!.y = 999;
    expect(curveModel(sim, {}, curve)!.series[0]!.points[0]!.y).toBe(25);
    const model = curveModel(sim, {}, curve)!;
    expect(curveSummary(model, 'en')).toContain('Heated water rises: 25.0 °C at 0 s to 60.7 °C at 300 s');
    expect(curveSummary(model, 'en')).toContain('Cooling water falls: 85.0 °C');
    expect(curveSummary(model, 'zh')).toContain('加热的水上升');
    expect(curveSummary(model, 'zh')).toContain('冷却的水下降');
    const flat = curveModel(sim, { 'heater-w': 0 }, { ...curve, y: ['heated-c'] })!;
    expect(curveSummary(flat, 'en')).toContain('stays constant');
  });
});
