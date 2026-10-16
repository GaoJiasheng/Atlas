/** Reproduce check-only registration; reject missing or malformed input explicitly. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { candidates, evaluate } from '../lib/fit';
import type { ControlPoint } from '../lib/manifest';
import sharp from 'sharp';
import { array, controlPoints, number, object, pair, readJson, required, string } from './strict-input';
const dir = 'scripts/geo/warring-states';
const manifest = object(readJson(`${dir}/extra-georef-manifest.json`));
mkdirSync(`${dir}/check`, { recursive: true });
interface Source { projection: string; controlPoints: ControlPoint[]; registrationInput: string; maxResidualKm: number }
const sources: Record<string, Source> = {};
for (const [id, value] of Object.entries(object(manifest.raster))) {
  const source = object(value);
  sources[id] = { projection: string(source.projection), controlPoints: controlPoints(source.controlPoints), registrationInput: string(source.registrationInput), maxResidualKm: number(source.maxResidualKm) };
}
for (const [id, value] of Object.entries(object(manifest.unregistered))) {
  const source = object(value);
  if (source.diagnosticControlPoints === undefined) continue;
  const points = controlPoints(source.diagnosticControlPoints);
  if (points.length >= 4) sources[id] = { projection: 'auto', controlPoints: points, registrationInput: string(source.registrationInput), maxResidualKm: 25 };
}
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
for (const [id, source] of Object.entries(sources)) {
  const results = candidates(source.projection, source.controlPoints)
    .map((candidate) => evaluate(candidate.proj, candidate.kind, source.controlPoints))
    .sort((a, b) => a.report.looRmsKm - b.report.looRmsKm);
  const { report, model } = required(results[0], `${id} fit result`);
  const eligible = source.controlPoints.length >= 12 && report.maxKm <= source.maxResidualKm && report.looMaxKm <= source.maxResidualKm;
  writeFileSync(`${dir}/check/extra-${id}-fit.json`, JSON.stringify({ ...report, controlPointCount: source.controlPoints.length, budgetKm: source.maxResidualKm, minimumControlPoints: 12, usableForTracing: eligible, models: results.map((result) => result.report) }, null, 2) + '\n');
  console.log(id, source.controlPoints.length, report.model, `RMS=${report.rmsKm.toFixed(2)},max=${report.maxKm.toFixed(2)},LOO=${report.looRmsKm.toFixed(2)},LOOmax=${report.looMaxKm.toFixed(2)},eligible=${eligible}`);
  const file = `${dir}/${source.registrationInput}`;
  const metadata = await sharp(file).metadata();
  const width = required(metadata.width, `${id} image width`);
  const height = required(metadata.height, `${id} image height`);
  const markers = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${source.controlPoints.map((point, index) => `<circle cx="${point.svg[0]}" cy="${point.svg[1]}" r="8" fill="none" stroke="#cf227a" stroke-width="2"/><text x="${point.svg[0] + 10}" y="${point.svg[1] - 8}" font-size="14" font-family="sans-serif" fill="#cf227a">${index + 1}</text>`).join('')}</svg>`;
  const annotated = await sharp(file).flatten({ background: '#fff' }).composite([{ input: Buffer.from(markers), top: 0, left: 0 }]).png().toBuffer();
  await sharp(annotated).toFile(`${dir}/check/extra-${id}-control-points.png`);
  const points = source.controlPoints.flatMap((point) => [point.lnglat, model.toLngLat(...point.svg)]);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const box: [number, number, number, number] = [Math.min(...xs) - 0.5, Math.min(...ys) - 0.5, Math.max(...xs) + 0.5, Math.max(...ys) + 0.5];
  const pixel = ([longitude, latitude]: [number, number]): [number, number] => [40 + (longitude - box[0]) / (box[2] - box[0]) * 660, 70 + (box[3] - latitude) / (box[3] - box[1]) * 520];
  const tags = source.controlPoints.map((point, index) => {
    const a = pixel(point.lnglat), b = pixel(model.toLngLat(...point.svg));
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#aa5522"/><circle cx="${a[0]}" cy="${a[1]}" r="4" fill="#164b7a"/><circle cx="${b[0]}" cy="${b[1]}" r="5" fill="none" stroke="#cf227a"/><text x="${b[0] + 8}" y="${b[1] - 4}" font-family="sans-serif" font-size="12">${index + 1}</text>`;
  }).join('');
  const coast = array(object(readJson(`${dir}/raw/ne-land.geojson`)).features).flatMap((value) => {
    const geometry = object(object(value).geometry);
    return geometry.type === 'MultiPolygon' ? array(geometry.coordinates) : geometry.type === 'Polygon' ? [geometry.coordinates] : [];
  }).map((value) => required(array(value)[0], 'coast outer ring')).map((value) => {
    const near = array(value).map(pair).filter(([longitude, latitude]) => longitude > box[0] - 2 && longitude < box[2] + 2 && latitude > box[1] - 2 && latitude < box[3] + 2);
    if (near.length < 3) return '';
    return `<path d="${near.map((point, index) => `${index ? 'L' : 'M'}${pixel(point).join(',')}`).join(' ')}" fill="none" stroke="#8a999c" stroke-width=".6"/>`;
  }).join('');
  const legend = source.controlPoints.map((point, index) => `<text x="${index < 11 ? 20 : 380}" y="${630 + (index % 11) * 18}" font-family="sans-serif" font-size="13">${index + 1}. ${escape(point.name)} — ${required(report.points[index], `${id} point report`).residualKm.toFixed(1)} km</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="740" height="850"><rect width="740" height="850" fill="#fcfbf6"/><text x="20" y="25" font-family="sans-serif" font-size="18">${id}: ${report.model}</text><text x="20" y="48" font-family="sans-serif" font-size="13">Blue: Wikipedia coordinate; magenta: fitted source point; grey: Natural Earth coast.</text>${coast}${tags}<text x="20" y="610" font-family="sans-serif" font-size="13">RMS ${report.rmsKm.toFixed(2)} km / max ${report.maxKm.toFixed(2)} km; LOO RMS ${report.looRmsKm.toFixed(2)} km; n=${source.controlPoints.length}</text>${legend}</svg>`;
  const left = await sharp(annotated).resize({ width: 740, height: 850, fit: 'contain', background: '#fff' }).png().toBuffer();
  const right = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp({ create: { width: 1480, height: 850, channels: 3, background: '#fff' } }).composite([{ input: left, left: 0, top: 0 }, { input: right, left: 740, top: 0 }]).png().toFile(`${dir}/check/extra-${id}-registration.png`);
}
