/** Projection diagnostics using the shared least-squares/LOO evaluator.
 * No geometry is published by this script. Historical datum names must not
 * be inferred from a later EPSG definition merely because the origins match.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { candidates, evaluate, type Projection } from '../lib/fit';
import { readJson, writeJson } from '../lib/common';
import type { ControlPoint } from '../lib/manifest';
const require = createRequire(import.meta.url);
const proj4 = require('../.tools/node_modules/proj4') as (from:string,to:string,p:[number,number])=>[number,number];
const dir=resolve(import.meta.dirname);
for (const id of ['G9','G11','G16']) {
  const input=readJson<{controlPoints:ControlPoint[]}>(`${dir}/georef-${id}.json`);
  const tries=candidates('auto',input.controlPoints).map(c=>evaluate(c.proj,c.kind,input.controlPoints).report);
  const definitions=id==='G11' ? [
    ['Johore-printed-Everest-no-datum-shift','+proj=cass +lat_0=2.042583333333333 +lon_0=103.56275833333333 +x_0=411480 +y_0=274320 +ellps=evrst30 +units=m'],
    ['Johore-printed-Everest-Kertau1968-shift-candidate','+proj=cass +lat_0=2.042583333333333 +lon_0=103.56275833333333 +x_0=411480 +y_0=274320 +ellps=evrst48 +towgs84=-11,851,5 +units=m'],
  ] : id==='G9' ? [
    ['Fort-Canning-origin-Cassini-candidate','+proj=cass +lat_0=1.292111111111111 +lon_0=103.84794722222222 +ellps=evrst30 +units=m'],
    ['Fort-Canning-origin-Cassini-Kertau-shift-candidate','+proj=cass +lat_0=1.292111111111111 +lon_0=103.84794722222222 +ellps=evrst48 +towgs84=-11,851,5 +units=m'],
  ] : [['printed-Mercator-Everest-Kertau-shift-candidate','+proj=merc +lat_ts=0 +lon_0=0 +ellps=evrst48 +towgs84=-11,851,5 +units=m']];
  for(const [name,definition] of definitions){
    const def=`+x_0=0 +y_0=0 ${definition}`;
    const p:Projection={name:name!,forward:(lng,lat)=>proj4('WGS84',def,[lng,lat]),inverse:(x,y)=>proj4(def,'WGS84',[x,y])};
    for(const kind of input.controlPoints.length>=9?['affine','poly2'] as const:['affine'] as const)tries.push(evaluate(p,kind,input.controlPoints).report);
  }
  tries.sort((a,b)=>a.looRmsKm-b.looRmsKm);
  writeJson(`${dir}/work/third-projections-${id}.json`,{controlPointCount:input.controlPoints.length,marginalia:id==='G11'?'Johore Grid (Red); Cassini Soldner; Everest; origin 2°02′33.30″N 103°33′45.93″E; false 450,000 yards E / 300,000 yards N':id==='G9'?'Two-mile reference squares originating at Fort Canning Signal Staff; printed staff position 1°17′31.60″N 103°50′52.61″E. Cassini is a candidate, not a printed projection identification.':'Mercator printed in title cartouche',datumCaution:'Kertau 1968 was defined after these maps. Its three-parameter shift is a tested candidate only, not proof of the earlier datum; no grid points count as independent surviving-feature controls.',tries},true);
  console.log(id,tries.map(t=>({model:t.model,rmsM:t.rmsKm*1000,maxM:t.maxKm*1000,looRmsM:t.looRmsKm*1000,looMaxM:t.looMaxKm*1000})));
}
