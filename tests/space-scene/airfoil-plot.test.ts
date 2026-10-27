import { it, expect } from 'vitest';
import {
  airfoilPlot,
  airfoilRecordSignature,
} from '../../src/engines/space-scene/lib/sim/airfoil';
import { recordRow } from '../../src/engines/space-scene/lib/sim/trial';
import {
  AIRFOIL_DATA as d,
  AIRFOIL_DEFAULTS as v,
  NASA_AIRFOIL,
} from './fixtures/airfoil-bench';
it('81 signed samples, solid/dashed regions, current point and V0 fallback', () => {
  const p = airfoilPlot(d, v, 'cl');
  expect(p.x).toHaveLength(81);
  expect(p.x[0]).toBe(-20);
  expect(p.x[80]).toBe(20);
  expect(p.y[0]).toBeCloseTo(-p.y[80]!, 10);
  expect(p.current.y).toBeCloseTo(0.47075898801417243, 12);
  expect(p.extent).toBeCloseTo(1.1 * 1.4031141758212335, 12);
  expect(p.segments).toEqual([
    [0, 16],
    [16, 64],
    [64, 80],
  ]);
  expect(airfoilPlot(d, { ...v, 'airspeed-mps': 0 }, 'lift-n').extent).toBe(1);
});
it('condition signature ignores display choices/vary; guards all physical keep conditions', () => {
  const sign = (values: typeof v) =>
    airfoilRecordSignature(d, values, 'angle-deg');
  expect(sign({ ...v, 'angle-deg': 16 })).toBe(sign(v));
  expect(sign({ ...v, 'flow-view': 'pressure', 'diagram-case': 'bank' })).toBe(
    sign(v),
  );
  expect(sign({ ...v, 'airspeed-mps': 20 })).not.toBe(sign(v));
  expect(
    airfoilRecordSignature(
      NASA_AIRFOIL,
      { ...v, 'altitude-m': 10000 },
      'angle-deg',
    ),
  ).not.toBe(airfoilRecordSignature(NASA_AIRFOIL, v, 'angle-deg'));
  expect(airfoilRecordSignature({ ...d, area: 3 }, v, 'angle-deg')).not.toBe(
    sign(v),
  );
});
it('records use existing 12-row limit and preserve signed values', () => {
  let rows: ReturnType<typeof recordRow> = [];
  for (const vary of [-16, 0, 12, 16])
    rows = recordRow(rows, {
      vary,
      values: {
        'cl-now': airfoilPlot(d, { ...v, 'angle-deg': vary }, 'cl').current.y,
      },
    });
  expect(rows).toHaveLength(4);
  expect(rows[0]!.values['cl-now']).toBeLessThan(0);
  for (let vary = 0; vary < 20; vary++)
    rows = recordRow(rows, { vary, values: {} });
  expect(rows).toHaveLength(12);
});

import { createStore } from 'zustand/vanilla';
import fixture from '../../src/content/topics/sample-airfoil/data/parts.json';
import { partsFile } from '../../src/engines/space-scene/schema';
import { createSpaceUi } from '../../src/engines/space-scene/ui';
import { watchAirfoil } from '../../src/engines/space-scene/explorer/AirfoilDriver';
import type { SceneStore } from '../../src/engines/core/store';
import type { SpaceSceneExt } from '../../src/engines/space-scene';
import type { Chapter } from '../../src/engines/core/types';
it('actual topic watcher resets only changed physical keep conditions and predictions, preserves compatible chapter tables', () => {
  const file = partsFile.parse(fixture),
    ui = createSpaceUi(),
    store = createStore(() => ({
      sim: { ...v },
      chapter: 'angles',
      transition: { id: 0, reason: 'init', instant: true },
    }));
  const chapters = [
    { id: 'angles', state: { sim: { try: { vary: 'angle-deg' } } } },
    { id: 'speed', state: { sim: { try: { vary: 'airspeed-mps' } } } },
  ] as unknown as Chapter[];
  const stop = watchAirfoil({
    file,
    ui,
    store: store as unknown as SceneStore<SpaceSceneExt>,
    chapters,
  });
  ui.setState({
    simTables: { angles: [{ vary: 4, values: { 'cl-now': 0.47 } }] },
    simPredict: {
      chapter: 'angles',
      guess: 'more',
      before: { ...v },
      value: 0.47,
    },
  });
  store.setState({ sim: { ...v, 'angle-deg': 16, 'flow-view': 'pressure' } });
  expect(ui.getState().simTables.angles).toHaveLength(1);
  expect(ui.getState().simPredict).not.toBeNull();
  store.setState({ chapter: 'speed' });
  store.setState({ chapter: 'angles' });
  expect(ui.getState().simTables.angles).toHaveLength(1);
  store.setState({ sim: { ...v, 'airspeed-mps': 20 } });
  expect(ui.getState().simTables.angles).toEqual([]);
  expect(ui.getState().simPredict).toBeNull();
  expect(ui.getState().airfoilReset).toBe(1);
  stop?.();
  expect(ui.getState().airfoil).toBeNull();
});
