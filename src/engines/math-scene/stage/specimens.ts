/** Read-only background specimens; kept separate from the optional SVG models. */
import type { ArrayModelSpec, ClockModelSpec, DecimalGridModelSpec, GridModelSpec, InstrumentModelSpec, NetModelSpec } from '../schema';

export const SPECIMEN_GRID: GridModelSpec = {
  kind: 'grid',
  unit: 'cm',
  show: 'cells',
  figures: [{ id: 'a', rect: [0, 0, 4, 3], tone: 'cold' }],
  tiles: { a: 'all' },
  walk: { a: 'all' },
  dims: [
    { side: 'top', figure: 'a' },
    { side: 'left', figure: 'a' },
  ],
};

export const SPECIMEN_ARRAY: ArrayModelSpec = { kind: 'array', object: 'dot', layout: 'rows', rows: 3, cols: 4, braces: true, container: 'ring' };

export const SPECIMEN_CLOCK: ClockModelSpec = { kind: 'clock', time: 7 * 3600 + 20 * 60, face: 'clock', numerals: true, ticks: 'minutes', minuteLabels: true };

export const SPECIMEN_DIAL: InstrumentModelSpec = {
  kind: 'instrument',
  type: 'dial',
  unit: 'g',
  from: { units: 0, dp: 0 },
  to: { units: 1000_000_000, dp: 0 },
  major: { units: 100_000_000, dp: 0 },
  minor: { units: 50_000_000, dp: 0 },
  value: { units: 0, dp: 0 },
  labels: 'major',
  scale: true,
  tilt: 'auto',
};

export const SPECIMEN_NET: NetModelSpec = { kind: 'net', solid: { type: 'cuboid', size: [1, 1, 1] }, layout: { cubeNet: '141-e' }, fold: 0.5, stagger: true, view: 'iso', turn: 0 };

export const SPECIMEN_DECIMAL: DecimalGridModelSpec = { kind: 'decimal-grid', level: 100, given: { units: 350_000, dp: 2 } };
