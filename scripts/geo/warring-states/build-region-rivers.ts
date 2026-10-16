/** Build region coastline and historical river lines from published sources. */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { areaGeometry, feature, featureCollection } from '../../../src/content/schema/geojson';
import { readSvg } from '../lib/svg';
import { candidates, evaluate } from '../lib/fit';
import { mapshaper, mapshaperApi, toFc, writeJson } from '../lib/common';
import { array, controlPoints, object, readJson, required } from './strict-input';
const dir = 'scripts/geo/warring-states';
const manifest = object(readJson(`${dir}/sources.json`));
const datasets = object(manifest.datasets), svg = object(manifest.svg);
const points = controlPoints(readJson(`${dir}/g1-control-points.json`));
datasets['G1-registration'] = { ...object(datasets.G1), file: 'G1-registration.svg', role: 'Style-only registration copy of G1: inline fills, all geographic paths unmodified' };
svg.G1 = { dataset: 'G1-registration', projection: 'equirectangular+affine', classes: {}, land: ['#a8c68f'], controlPoints: points, maxResidualKm: 5 };
datasets['G2-registration'] = { ...object(datasets.G2), file: 'G2-registration.svg', role: 'Geometrically unchanged background-only registration copy; G2 shares G1 base' };
svg.G2 = { ...object(svg.G1), dataset: 'G2-registration', controlPoints: [], controlPointsFrom: 'G1' };
writeJson(`${dir}/sources.json`, manifest, true);
const candidate = required(candidates('equirectangular+affine', points)[0], 'G1 projection');
const best = evaluate(candidate.proj, 'affine', points);
writeJson(`${dir}/g1-river-fit.json`, best.report, true);
console.log('G1 fit', best.report.rmsKm, best.report.maxKm);
const document = readSvg(readFileSync(`${dir}/raw/G1-rivers.svg`, 'utf8'));
const metadata = object(readJson(`${dir}/river-path-metadata.json`));
const rivers = toFc(document.shapes.map((shape) => {
  const properties = { ...object(metadata[shape.id]) };
  delete properties.src;
  delete properties.method;
  return { type: 'Feature', properties, geometry: { type: 'MultiLineString',
    coordinates: shape.rings.map((ring) => ring.map(([x, y]) => best.model.toLngLat(x, y).map((value) => Number(value.toFixed(5))))) } };
}));
// G1 historical lower reaches replace today's post-1855 Yellow River course.
const thin = await mapshaper('-i rivers.json -simplify interval=400 keep-shapes', { rivers });
writeJson('public/geo/warring-states-rivers.json', thin);
const land = featureCollection(feature(areaGeometry, z.record(z.string(), z.unknown()).nullable())).parse(readJson(`${dir}/raw/ne-land.geojson`));
const clipped = await mapshaper('-i land.json -clip bbox=100,20,125,44 -dissolve2 -simplify interval=1500 keep-shapes -clean', { land });
for (const feature of clipped.features) feature.properties = { kind: 'land' };
// Clip edges never become coast: stroke only real shoreline segments.
const coast = await mapshaper('-i land.json -lines -clip bbox=100,20,125,44 -simplify interval=1500 keep-shapes', { land });
for (const feature of coast.features) feature.properties = { kind: 'coast' };
const region = toFc([...clipped.features, ...coast.features]);
const output = await mapshaperApi().applyCommands('-i region.json -o region.topojson format=topojson quantization=100000', { 'region.json': region });
const topology = object(JSON.parse(required(output['region.topojson'], 'region TopoJSON output').toString()) as unknown);
topology.objects = { 'warring-states-region': { type: 'GeometryCollection', geometries: Object.values(object(topology.objects)).flatMap((value) => {
  const geometry = object(value);
  return geometry.type === 'GeometryCollection' ? array(geometry.geometries) : [geometry];
}) } };
topology.bbox = [100, 20, 125, 44];
writeJson('public/geo/warring-states-region.json', topology);
console.log('Rivers', thin.features.length, 'region', clipped.features.length, 'coast', coast.features.length);
