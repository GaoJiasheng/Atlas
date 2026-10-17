/** Candidate-set comparison, without altering active georeferences. */
import {resolve} from 'node:path';
import {readJson,writeJson} from '../lib/common';
import {candidates,evaluate} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
const dir=resolve(import.meta.dirname);
const review=readJson<{readings:(ControlPoint&{map:string;status:string})[]}>(`${dir}/third-control-readings.json`);
for(const id of ['G9','G11','G16']){
 const old=readJson<{controlPoints:ControlPoint[]}>(`${dir}/georef-${id}.json`).controlPoints;
 const rows=review.readings.filter(c=>c.map===id);
 const results=[];
 for(const set of ['standing-building-candidate-only','all-road-candidates-diagnostic'] as const){
  const points=[...old,...rows.filter(c=>set==='all-road-candidates-diagnostic'||c.status.startsWith('standing-building'))];
  const tries=candidates('auto',points).map(c=>evaluate(c.proj,c.kind,points).report).sort((a,b)=>a.looRmsKm-b.looRmsKm);
  results.push({set,controlPointCount:points.length,tries});
 }
 writeJson(`${dir}/work/third-control-fit-${id}.json`,results,true);
 console.log(id,results.map(r=>({set:r.set,count:r.controlPointCount,best:r.tries[0]})));
}
