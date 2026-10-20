/** Decode read-only upstream geometries; preserve their provenance, never redraw. */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
const dir=import.meta.dirname;
for (const [file,kind] of [['land-sg-history','history'],['land-sg-modern','today']] as const) {
 const data=JSON.parse(readFileSync(`public/geo/${file}.json`,'utf8'));
 const fc={features: Object.values(data.objects).flatMap((o:any)=>(feature(data,o) as any).features)};
 for(const id of kind==='history'?['L4','L5']:['today']) {
  const features=fc.features.filter((f:any)=>kind==='history'?f.properties?.id===id:f.properties?.kind==='land'&&(!f.properties?.id||f.properties.id==='L11'));
  writeFileSync(`${dir}/work/input-${id}.geojson`,JSON.stringify({type:'FeatureCollection',features}));
 }
}
