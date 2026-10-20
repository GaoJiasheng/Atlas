/** Topic adapter: shared compose/simplify do not yet accept empty recipe frames.
 * Build nonempty K1/K4, then insert literal empty TopoJSON objects (engine contract E2).
 * Approximation is applied per K1 feature after shared simplification, with geometry unchanged.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const run=(args:string[])=>{const r=spawnSync('pnpm',['tsx',...args],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);};
run(['scripts/geo/singapore-land-use/control-recipes.ts']);
run(['scripts/geo/lib/compose.ts','--topic','singapore-land-use','K1','K4']);
run(['scripts/geo/lib/simplify.ts','--topic','singapore-land-use','--budget','2.4','--fine','0.01','--quant','50000']);
const file='src/content/topics/singapore-land-use/data/control.json';const d=JSON.parse(readFileSync(file,'utf8'));
for(const id of ['K2','K3'])d.topology.objects[id]={type:'GeometryCollection',geometries:[]};
for(const g of d.topology.objects.K1.geometries)g.properties.certainty='approximate';
// Review 2026-10-20 (Opus): a hold frame (same object as K4) ends the timeline on 31 December 2025, as the spec
// sets; without it the last dated event (November 2025) would end the axis and clamp the final beat.
d.keyframes=[{t:'1959-04-01',object:'K1'},{t:'1966-01-01',object:'K2'},{t:'2019-01-01',object:'K3'},{t:'2019-11-18',object:'K4'},{t:'2025-12-31',object:'K4'}];
writeFileSync(file,JSON.stringify(d));
console.log('Inserted empty K2/K3; marked each K1 feature approximate. Geometry unchanged.');
