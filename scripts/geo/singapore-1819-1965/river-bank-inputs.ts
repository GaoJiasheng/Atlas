/** Digitised native-raster lower-river water banks, fitted by shared auto.
 * The colour tracer cannot distinguish bank ink from overprinted street/text
 * ink on G1/G4. Use directly inspected source-pixel bank vertices instead.
 * This is a map trace, not a hand-invented geographic polygon. URA WATERBODY
 * supplies upstream exclusions outside these source-qualified reaches. G4 upper
 * channels are extracted from native source bank ink by resume-town-masks.py;
 * the persisted pixel contours preserve the printed marsh island as a hole.
 * This adapter writes work inputs only and never rewrites lines.json.
 */
import { resolve } from 'node:path';
import type { FeatureCollection } from 'geojson';
import type { ControlPoint } from '../lib/manifest';
import { candidates,evaluate } from '../lib/fit';
import { mapshaper,readJson,toFc,writeJson } from '../lib/common';
type Pt=[number,number];
interface Input {controlPoints:ControlPoint[]}
interface NativeTrace {source:string;method:string;coordinates:Pt[][]}
const dir=resolve(import.meta.dirname);
const banks:Record<string,Pt[]>={
 G1:[[605,504],[597,497],[588,487],[577,481],[563,478],[547,477],[540,463],[536,450],[535,435],[536,418],[535,402],[538,387],[544,380],[560,369],[580,362],[600,354],[620,346],[640,337],[660,327],[680,317],[700,307],[705,295],[707,280],[709,265],[709,250],[705,236],[697,224],[690,210],[683,196],[675,180],[667,164],[660,150],[657,138],[658,127],[662,119],[672,113],[687,108],[704,105],[722,101],[737,94],[743,85],[744,75],[742,65],[738,60],
 [758,60],[761,73],[761,86],[758,97],[750,104],[740,109],[727,112],[712,113],[697,116],[686,120],[680,126],[679,136],[682,148],[688,162],[698,180],[706,195],[717,209],[729,222],[737,235],[739,248],[736,260],[731,272],[730,284],[733,290],[730,302],[724,323],[703,340],[680,358],[656,377],[632,396],[608,415],[585,433],[567,448],[579,453],[599,455],[620,455],[641,456],[650,480],[650,520],[625,516],[605,504]],
 G4:[[360,693],[349,685],[339,674],[330,662],[324,651],[321,641],[322,632],[326,623],[333,615],[341,607],[349,598],[354,589],[359,580],[357,568],[355,555],[352,545],[347,535],[338,525],[328,517],[323,510],[322,502],[324,492],[323,486],[315,478],[307,470],[302,461],[299,451],[301,441],[306,431],
 [330,432],[326,442],[324,453],[326,465],[333,477],[344,490],[355,502],[365,515],[372,529],[376,544],[379,560],[380,573],[386,579],[385,594],[384,608],[383,622],[379,632],[367,640],[363,653],[357,665],[350,678],[351,685],[361,690],[374,694],[390,691],[398,715],[362,725],[360,693]],
};
for(const id of ['G1','G4']){
 const cp=readJson<Input>(`${dir}/georef-${id}.json`), fit=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 const ring=banks[id]!.map(p=>fit.model.toLngLat(p[0],p[1]));
 const raw=toFc([{type:'Feature',properties:{source:id,method:'Native source-pixel river-bank trace; affine selected by projection auto. G1 follows the printed upstream channel to the source frame; G4 continues upstream of North Bridge Road to a clearly printed narrow river cross-section. Offshore mouth closure is water selection. Upstream reach beyond these source limits is not independently reconstructed.',reading:'work/'+id+'-lowerbank-grid.png',certainty:'approximate'},geometry:{type:'Polygon',coordinates:[ring]}}]);
 let clean:FeatureCollection=await mapshaper('-i a.json -clean',{a:raw});
 if(id==='G4') {
  const native=readJson<NativeTrace>(`${dir}/resume-town-G4-upper-native.json`);
  const upper=toFc([{type:'Feature',properties:{source:id,method:native.method,reading:'work/resume-town-G4-upper-overlay.png'},geometry:{type:'Polygon',coordinates:native.coordinates.map(r=>r.map(p=>fit.model.toLngLat(p[0],p[1])))}}]);
  clean=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2 -clean',{a:clean,b:upper});
 }
 writeJson(`${dir}/work/${id}-river-water.geojson`,clean);
}
console.log('G1/G4 native-source river water written, with G4 upper surveyed channel extension; lines.json is unchanged.');
