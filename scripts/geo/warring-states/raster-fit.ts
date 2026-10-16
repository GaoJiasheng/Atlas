import fs from 'node:fs';
import { candidates,evaluate } from '../lib/fit';
const m=JSON.parse(fs.readFileSync('scripts/geo/warring-states/raster-manifest.json','utf8'));
for(const [id,src] of Object.entries(m.raster) as any){const results=candidates(src.projection,src.controlPoints).map(c=>evaluate(c.proj,c.kind,src.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);console.log(id,JSON.stringify(results.map(x=>x.report),null,2));fs.writeFileSync(`scripts/geo/warring-states/check/raster-${id}-fit.json`,JSON.stringify(results[0].report,null,2));}
