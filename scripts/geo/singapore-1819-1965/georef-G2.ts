/** Diagnostic for the 1828 island inset. No geometry is published by this file. */
import { candidates, evaluate } from '../lib/fit';
import { readJson,writeJson } from '../lib/common';
import { resolve } from 'node:path';
const dir=resolve(import.meta.dirname);
const cp=readJson<any>(resolve(dir,'georef-G2.json'));
const fits=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);
const best=fits[0]!;
writeJson(resolve(dir,'work/georef-G2-fit.json'),best.report,true);
console.log(best.report);
function inv(lng:number,lat:number){let x=800,y=500;for(let i=0;i<10;i++){const a=best.model.toLngLat(x,y),b=best.model.toLngLat(x+1,y),c=best.model.toLngLat(x,y+1);const d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const u=lng-a[0],v=lat-a[1];x+=(u*(c[1]-a[1])-v*(c[0]-a[0]))/d;y+=(v*(b[0]-a[0])-u*(b[1]-a[1]))/d;}return [Math.round(x),Math.round(y)];}
const osm=readJson<any>(resolve(dir,'raw/control-island-osm.json'));
for(const f of osm.elements.filter((e:any)=>e.tags?.name&&e.lon))if(/Tanjong|Timah|Canning|Subar/.test(f.tags.name))console.log(f.tags.name,inv(f.lon,f.lat));
