/** Select shared source-line outputs for the shared dated-land pipeline.
 * The west-source rectangle below is only a splice selector; its final shore
 * is G15's traced source bank and the remainder stays G16's source outline.
 */
import { resolve } from 'node:path';
import type { FeatureCollection, Polygon } from 'geojson';
import { mapshaper,readJson,toFc,writeJson } from '../lib/common';
const dir=resolve(import.meta.dirname), traced=readJson<FeatureCollection>(`${dir}/work/svg-lines.geojson`);
const select=(id:string):FeatureCollection=>{const a=traced.features.filter(f=>f.properties?.class===id);if(a.length!==1)throw Error(`Expected one shared source trace ${id}, got${a.length}`);return toFc(a);};
for(const id of ['g9','g11','g16'])writeJson(`${dir}/work/coast-${id}-main.geojson`,select(`coast-${id}-main`));
for(const id of ['G1','G4','G7'])writeJson(`${dir}/work/${id}-town-water.geojson`,select(`coast-${id.toLowerCase()}-town-water`));
const westWater=select('coast-g15-west-water');
writeJson(`${dir}/work/G15-west-water.geojson`,westWater);
// Restrict the edition's usable natural shore to western Tuas/Pasir Laba.
// Eastern Jurong oil-depot/shipyard shore is NOT imported: the corrected
// edition does not date each addition to1961. Rectangle edges are inland data
// splice boundaries, not asserted historical territory/coast vertices.
const ring:Polygon={type:'Polygon',coordinates:[[[103.59,1.24],[103.691,1.24],[103.691,1.373],[103.59,1.373],[103.59,1.24]]]};
const box=toFc([{type:'Feature',properties:{},geometry:ring}]);
const old=readJson<FeatureCollection>(`${dir}/work/coast-g16-main.geojson`);
const east=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:old,b:box});
const west=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:box,b:westWater});
const merged=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2',{a:east,b:west});
writeJson(`${dir}/work/coast-g16-with-west.geojson`,merged);
writeJson(`${dir}/work/west-coast-method.json`,{method:'G16 shared source outline, west Tuas/PasirLaba replaced by G15 natural shore surveyed1960–61; current URA land intersection happens in shared local-land. G15 shore traced on source raster; retained source naturalshore only westof103.691E. No laterjetty/dredging/shipyard outline defines the splice.',selectorBox:[103.59,1.24,103.691,1.373],sources:['G15','G16','G30'],externalAccuracy:'G15 printed graticule registration only; modern surviving-feature accuracy unmeasured.',remaining:'Not a complete dated1961Jurong reconstruction: corrected easternport/oildepot additions require datedqualification; G14 is not used. Chartdatum/georeferencing/splice disagreement remains approximate.'},true);
console.log('Shared source coast/water inputs selected; qualified approximate western Tuas splice written.');
