/** Additional source observations, assessed without pruning old controls. */
import {readFileSync,writeFileSync} from 'node:fs';
import {candidates,evaluate} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
const d=import.meta.dirname,read=(name:string)=>JSON.parse(readFileSync(`${d}/${name}`,'utf8'));
const old=read('third-control-readings.json').readings;
const more=read('resume-extra-controls.json'),reports=[];
for(const id of ['G9','G11']) {
 const active=read(`georef-${id}.json`).controlPoints as ControlPoint[];
 const guides=read(`work/third-${id}-guides.json`);
 const extras=more.observations.filter((p:any)=>p.map===id).map((p:any)=>({...guides[p.guideIndex],...p,status:'unqualified-source-reading-candidate'}));
 const points=[...active,...old.filter((p:any)=>p.map===id),...extras];
 const fits=candidates('auto',points).map(c=>evaluate(c.proj,c.kind,points).report).sort((a,b)=>a.looRmsKm-b.looRmsKm);
 const best=fits[0]!;
 reports.push({map:id,activeCount:active.length,previousCandidateCount:points.length-extras.length,newReadings:extras.length,candidateCount:points.length,adopted:false,reason:'Road widening/realignment and historical symbol generalisation remain unresolved. No original control is dropped; source readings do not qualify modern correspondence.',points,fits});
 console.log(`${id}: ${points.length} candidates; ${best.model}; LOO RMS/max ${(best.looRmsKm*1000).toFixed(2)}/${(best.looMaxKm*1000).toFixed(2)} m; not adopted`);
}
writeFileSync(`${d}/resume-extra-controls-report.json`,JSON.stringify({date:'2026-11-09',method:more.method,reports},null,2)+'\n');
