/** Build shared local-land eras from decoded upstream and measured raster differences. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const dir=import.meta.dirname;const p=`${dir}/sources.json`;const d=JSON.parse(readFileSync(p,'utf8'));const stats=JSON.parse(readFileSync(`${dir}/coast-statistics.json`,'utf8'));
// Review 2026-10-20 (Opus): one inherited era only. The timeline starts in April 1959; L4 (the 1941 AMS map)
// would hold for 21 months and then lose ~15 km² of western mangrove coast to L5 (Admiralty surveys
// 1954–1961), a change of source, not of land. L5 therefore runs from the start to the first Landsat date,
// and the detached islands L5 lacks (Ubin, Tekong, southern and Jurong islands) come from L6 1973
// (historic-islands.py).
const eras:any[]=[{id:'L5',to:stats[0].date,outline:'work/input-L5.geojson',plus:['work/islands-L6-detached.geojson'],src:['G11','G9']}];
for(let i=0;i<stats.length;i++){const row=stats[i];const e:any={id:row.era,from:row.date,to:stats[i+1]?.date??'2019-11-18',src:['G3','G9']};for(const k of ['minus','plus']){const f=`work/landsat-${row.era}-${k}.geojson`;if(row[`${k}_km2`]>0&&existsSync(`${dir}/${f}`))e[k]=[f];}eras.push(e);}
eras.push({id:'L11',from:'2019-11-18',src:['G3']});d.pipeline.localLand.eras=eras;writeFileSync(p,JSON.stringify(d,null,2)+'\n');console.log(eras);
