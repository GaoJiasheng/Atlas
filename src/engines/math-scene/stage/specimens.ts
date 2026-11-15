/** Read-only background specimens; kept separate from the optional SVG models. */
import type { ChartModelSpec, ArrayModelSpec, ClockModelSpec, DecimalGridModelSpec, GridModelSpec, InstrumentModelSpec, NetModelSpec } from '../schema';

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

/** Line symmetry (docs/79 §3.4): the "house" folded along its middle, part of the way over. */
export const SPECIMEN_SYMMETRY: GridModelSpec = {
  kind: 'grid',
  unit: 'unit',
  show: 'cells',
  cols: 4,
  rows: 4,
  figures: [{ id: 'house', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [1, 3], [2, 3]], halves: [[0, 3, 'se'], [3, 3, 'sw']], tone: 'cold' }],
  candidates: [{ x: 2 }],
  fold: { line: { x: 2 }, t: 0.7 },
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

/** The graphs lesson's specimen (docs/77 §3.3): the fruit bar graph, one gridline worth 1, a reading line from the mango bar. */
export const SPECIMEN_CHART: ChartModelSpec = {
  kind: 'chart',
  type: 'bar',
  orient: 'vertical',
  title: { en: 'Favourite fruit of a class', zh: '一个班最喜欢的水果' },
  cats: [
    { id: 'mango', label: { en: 'Mango', zh: '芒果' }, value: 8 },
    { id: 'durian', label: { en: 'Durian', zh: '榴梿' }, value: 6 },
    { id: 'rambutan', label: { en: 'Rambutan', zh: '红毛丹' }, value: 9 },
    { id: 'banana', label: { en: 'Banana', zh: '香蕉' }, value: 4 },
  ],
  axis: { from: 0, to: 10, step: 1, labels: 2, name: { en: 'Number of pupils', zh: '人数' } },
  guide: ['mango'],
  highlight: { mango: 'cold' },
};

/** The averages lesson's specimen (docs/78 §3.3): towers of 2, 4 and 6 blocks and the average line at 4. */
export const SPECIMEN_TOWERS: ChartModelSpec = {
  kind: 'chart',
  type: 'bar',
  orient: 'vertical',
  stack: true,
  cats: [
    { id: 'wei-jie', label: { en: 'Wei Jie', zh: 'Wei Jie' }, value: 2 },
    { id: 'siti', label: { en: 'Siti', zh: 'Siti' }, value: 4 },
    { id: 'arjun', label: { en: 'Arjun', zh: 'Arjun' }, value: 6 },
  ],
  axis: { from: 0, to: 8, step: 1, labels: 1 },
  mean: 4,
};
