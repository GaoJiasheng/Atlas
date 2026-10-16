/** Shared simplifier carries holder/label/src; add topic-specific certainty metadata. */
import { feature } from 'topojson-client';
import { writeJson } from '../lib/common';
import { ringIssues } from '../lib/rings';
import { array, features, object, polygons, readJson, topology as narrowTopology } from './strict-input';
const path = 'src/content/topics/warring-states/data/control.json';
const control = object(readJson(path));
const topology = object(control.topology);
let count = 0;
for (const value of Object.values(object(topology.objects))) {
  for (const geometry of array(object(value).geometries)) {
    object(object(geometry).properties).certainty = 'approximate';
    count++;
  }
}
const typedTopology = narrowTopology(topology);
const allPolygons = Object.values(typedTopology.objects).flatMap((geometry) =>
  features(feature(typedTopology, geometry)).flatMap((item) => polygons(item.geometry)));
const issues = ringIssues(allPolygons);
if (issues.zeroArea || issues.selfCrossing) throw new Error('Invalid published map rings');
writeJson(path, control);
writeJson('scripts/geo/warring-states/geometry-audit.json', { features: count, ...issues }, true);
console.log('Certainty:', count, 'features', JSON.stringify(issues));
