/** Shared-cartography checks use matched source city dots after actual image scaling. */
import { candidates, evaluate } from '../lib/fit';
import { writeJson } from '../lib/common';
import type { ControlPoint } from '../lib/manifest';
import { controlPoints, object, readJson, required } from './strict-input';
const dir = 'scripts/geo/warring-states';
const manifest = object(readJson(`${dir}/sources.json`));
const sourcePoints = controlPoints(object(object(manifest.svg).G3).controlPoints);
const raster = object(manifest.raster);
for (const [id, width, height] of [['G4', 1280, 865], ['G6', 330, 224]] as const) {
  const points: ControlPoint[] = sourcePoints.map((point) => ({
    ...point, svg: [point.svg[0] * width / 567.50659, point.svg[1] * height / 383.53125],
  }));
  const results = candidates('auto', points).map((candidate) => evaluate(candidate.proj, candidate.kind, points))
    .sort((a, b) => a.report.looRmsKm - b.report.looRmsKm);
  const best = required(results[0], `${id} fit`);
  writeJson(`${dir}/work/raster-${id}-fit.json`, { ...best.report, method: 'Same published SVG base as G3, source city symbol positions scaled to this published raster rendering. Not independent corroboration.' }, true);
  raster[id] = { dataset: id, projection: 'auto', palette: { '#a8c68f': '_land', '#c6ecff': '_sea' }, tolerance: 12, land: ['_land'], sea: ['_sea'], minRegionPx: 12, maxResidualKm: 40, controlPoints: points };
  console.log(id, best.report.rmsKm, best.report.maxKm);
}
writeJson(`${dir}/sources.json`, manifest, true);
