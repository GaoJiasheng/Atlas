/** Exact real-NE shoreline clipping, without buffer-gap ownership. */
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { mapshaper, mapshaperApi, toFc, writeJson } from '../lib/common';
import { array, features, object, polygons, readJson, required, string, topology as narrowTopology } from './strict-input';
const dir = 'scripts/geo/warring-states';
const path = 'src/content/topics/warring-states/data/control.json';
const control = object(readJson(`${dir}/work/control-nocoast.json`));
const topology = narrowTopology(control.topology);
const region = narrowTopology(readJson('public/geo/warring-states-region.json'));
function areaFeatures(value: unknown): Feature<Polygon | MultiPolygon, Record<string, unknown>>[] {
  return features(value).map((item) => ({
    type: 'Feature', properties: object(item.properties),
    geometry: { type: 'MultiPolygon', coordinates: polygons(item.geometry) },
  }));
}
const land = toFc(areaFeatures(feature(region, required(Object.values(region.objects)[0], 'region topology object'))).filter((item) => item.properties.kind === 'land'));
const files: Record<string, FeatureCollection> = {};
const retention: { id: string; before: string[]; after: string[]; lost: string[] }[] = [];
const keyframes = array(control.keyframes).map((value) => {
  const frame = object(value);
  return { t: string(frame.t), object: string(frame.object) };
});
for (const frame of keyframes) {
  const raw = toFc(areaFeatures(feature(topology, required(topology.objects[frame.object], `${frame.object} topology object`))));
  for (const item of raw.features) {
    const properties = object(item.properties);
    const label = properties.label === undefined ? {} : object(properties.label);
    item.properties = { holder: string(properties.holder), label_en: label.en ?? '', label_zh: label.zh ?? '', src: array(properties.src ?? []).map(string).join(',') };
  }
  const cut = await mapshaper('-i a.json land.json combine-files -clip target=a land -clean', { a: raw, land });
  const holders = (collection: FeatureCollection) => [...new Set(collection.features.map((item) => string(object(item.properties).holder)))];
  const before = holders(raw), after = holders(cut), lost = before.filter((holder) => !after.includes(holder));
  if (lost.length) throw new Error(`${frame.object}: shoreline clipping lost ${lost.join(', ')}`);
  retention.push({ id: frame.object, before, after, lost });
  files[`${frame.object}.json`] = cut;
}
const ids = keyframes.map((frame) => frame.object);
const output = await mapshaperApi().applyCommands(`-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -clean target=* -o out.json format=topojson quantization=400000 target=*`, files);
const result = object(JSON.parse(required(output['out.json'], 'mapshaper topology output').toString()) as unknown);
for (const value of Object.values(object(result.objects))) {
  for (const item of array(object(value).geometries)) {
    const geometry = object(item), properties = object(geometry.properties);
    geometry.properties = { holder: properties.holder, label: { en: properties.label_en, zh: properties.label_zh }, src: [...new Set(String(properties.src ?? '').split(',').filter(Boolean))], certainty: 'approximate' };
  }
}
writeJson(path, { topology: result, keyframes });
writeJson(`${dir}/shoreline-audit.json`, { method: 'Intersection with Natural Earth 10m land after shared simplification; no buffer or invented gap fill', retention }, true);
console.log('Shore clipping retained all holders in', ids.length, 'frames');
