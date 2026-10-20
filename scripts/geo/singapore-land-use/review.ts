/** Decode published controls for source-comparison figures (no geometry changes). */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
const d=JSON.parse(readFileSync('src/content/topics/singapore-land-use/data/control.json','utf8'));
for(const id of ['K1','K4'])writeFileSync(`${import.meta.dirname}/work/published-${id}.geojson`,JSON.stringify(feature(d.topology,d.topology.objects[id])));
