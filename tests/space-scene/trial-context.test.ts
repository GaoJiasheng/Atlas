import { describe, expect, it } from 'vitest';
import { predictionContextKey, predictionHidden, predictionIsCurrent, recordRow, tableContextKey } from '../../src/engines/space-scene/lib/sim/trial';
import { trialContextPatch } from '../../src/engines/space-scene/lib/sim/session';
import { createSpaceUi } from '../../src/engines/space-scene/ui';

const values = { 'elapsed-s': 120, 'heater-w': 100, 'water-g': 200, cover: 'bare' };
const answer = { chapter: 'heating', guess: 'more', before: { ...values, 'elapsed-s': 0 }, after: values, value: 25 };

describe('temporary fair-test conditions', () => {
  it('sorts all resolved controls, excluding only vary and keeping the chapter', () => {
    const key = tableContextKey('heating', values, 'elapsed-s');
    expect(tableContextKey('heating', { cover: 'bare', 'water-g': 200, 'heater-w': 100, 'elapsed-s': 300 }, 'elapsed-s')).toBe(key);
    expect(tableContextKey('heating', { ...values, 'heater-w': 50 }, 'elapsed-s')).not.toBe(key);
    expect(tableContextKey('cooling', values, 'elapsed-s')).not.toBe(key);
    expect(predictionContextKey('heating', { ...values, 'elapsed-s': 300 })).not.toBe(predictionContextKey('heating', values));
  });
  it('changes in vary preserve rows; any held condition clears this chapter alone and adds the bilingual notice state', () => {
    const ui = createSpaceUi();
    const rows = [{ vary: 0, values: { 'heated-c': 25 } }, { vary: 120, values: { 'heated-c': 39.285714285714285 } }];
    ui.setState({ simTables: { heating: rows, cooling: rows }, simTableContexts: { heating: tableContextKey('heating', values, 'elapsed-s') } });
    expect(trialContextPatch(ui.getState(), 'heating', { ...values, 'elapsed-s': 300 }, 'elapsed-s')).toEqual({});
    ui.setState(trialContextPatch(ui.getState(), 'heating', { ...values, 'heater-w': 50 }, 'elapsed-s'));
    expect(ui.getState().simTables.heating).toEqual([]);
    expect(ui.getState().simTables.cooling).toBe(rows);
    expect(ui.getState().simTableNotices.heating).toBe(true);
    expect(trialContextPatch(ui.getState(), 'heating', { ...values, 'heater-w': 50 }, 'elapsed-s')).toEqual({});
  });
  it('uses the record vary, independent of a curve x; the same value overwrites and at most 12 remain', () => {
    expect(tableContextKey('cooling', values, 'cover')).not.toBe(tableContextKey('cooling', { ...values, 'elapsed-s': 300 }, 'cover'));
    expect(tableContextKey('cooling', values, 'cover')).toBe(tableContextKey('cooling', { ...values, cover: 'wrapped' }, 'cover'));
    let rows = recordRow([], { vary: 120, values: { temperature: 39.3 } });
    rows = recordRow(rows, { vary: 120, values: { temperature: 32.1 } });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.values.temperature).toBe(32.1);
    for (let n = 0; n < 20; n++) rows = recordRow(rows, { vary: n, values: {} });
    expect(rows).toHaveLength(12);
  });
});

describe('prediction isolation and concealment', () => {
  it('hides predictive answers until a guess or explicit authored reveal, while old topics without prediction remain visible', () => {
    expect(predictionHidden(true, false, null, 'heating', values)).toBe(true);
    expect(predictionHidden(true, false, answer, 'heating', values)).toBe(false);
    expect(predictionHidden(true, true, null, 'heating', values)).toBe(false);
    expect(predictionHidden(false, false, null, 'heating', values)).toBe(false);
  });
  it('retains before/after snapshots and invalidates on time, conditions, chapter or beat changes', () => {
    expect(predictionIsCurrent(answer, 'heating', { ...values })).toBe(true);
    for (const changed of [{ ...values, 'elapsed-s': 60 }, { ...values, 'water-g': 400 }, { ...values, 'heater-w': 50 }]) {
      expect(predictionHidden(true, false, answer, 'heating', changed)).toBe(true);
      const ui = createSpaceUi(); ui.setState({ simPredict: answer });
      expect(trialContextPatch(ui.getState(), 'heating', changed, 'elapsed-s').simPredict).toBeNull();
    }
    const ui = createSpaceUi(); ui.setState({ simPredict: answer });
    expect(trialContextPatch(ui.getState(), 'cooling', values, 'elapsed-s').simPredict).toBeNull();
    expect(trialContextPatch(ui.getState(), 'heating', values, 'elapsed-s', true).simPredict).toBeNull();
    expect(answer.before['elapsed-s']).toBe(0);
    expect(answer.after['elapsed-s']).toBe(120);
  });
});
