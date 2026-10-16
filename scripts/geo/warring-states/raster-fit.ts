import fs from 'node:fs';
import { candidates, evaluate } from '../lib/fit';
import { controlPoints, object, readJson, required, string } from './strict-input';
const manifest = object(readJson('scripts/geo/warring-states/raster-manifest.json'));
for (const [id, value] of Object.entries(object(manifest.raster))) {
  const source = object(value);
  const points = controlPoints(source.controlPoints);
  const results = candidates(string(source.projection), points)
    .map((candidate) => evaluate(candidate.proj, candidate.kind, points))
    .sort((a, b) => a.report.looRmsKm - b.report.looRmsKm);
  const best = required(results[0], `${id} registration result`);
  console.log(id, JSON.stringify(results.map((result) => result.report), null, 2));
  fs.writeFileSync(`scripts/geo/warring-states/check/raster-${id}-fit.json`, JSON.stringify(best.report, null, 2));
}
