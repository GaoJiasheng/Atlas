/** Build shared local-land eras from decoded upstream and measured raster differences. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const dir=import.meta.dirname;const p=`${dir}/sources.json`;const d=JSON.parse(readFileSync(p,'utf8'));const stats=JSON.parse(readFileSync(`${dir}/coast-statistics.json`,'utf8'));
const eras:any[]=[{id:'L4',to:'1961-01-01',outline:'work/input-L4.geojson',src:['G11']},{id:'L5',from:'1961-01-01',to:stats[0].date,outline:'work/input-L5.geojson',src:['G11']}];
for(let i=0;i<stats.length;i++){const row=stats[i];const e:any={id:row.era,from:row.date,to:stats[i+1]?.date??'2019-11-18',src:['G3','G9']};for(const k of ['minus','plus']){const f=`work/landsat-${row.era}-${k}.geojson`;if(row[`${k}_km2`]>0&&existsSync(`${dir}/${f}`))e[k]=[f];}eras.push(e);}
eras.push({id:'L11',from:'2019-11-18',src:['G3']});d.pipeline.localLand.eras=eras;writeFileSync(p,JSON.stringify(d,null,2)+'\n');console.log(eras);
