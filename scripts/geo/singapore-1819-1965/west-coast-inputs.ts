/** G15 western Singapore source trace. Printed graticule registration is an
 * internal chart registration, not an externally surveyed control-point audit.
 * Native pixels below were read on the downloaded 1960–61 survey chart; avoid
 * the distinct 1966 dredging/shipyard/jetty strokes. */
import { resolve } from 'node:path';
import { readJson, writeJson } from '../lib/common';
import { candidates, evaluate } from '../lib/fit';
import type { ControlPoint } from '../lib/manifest';
type Pt=[number,number];
interface MapInput { dataset:string;projection:string;maxResidualKm:number;controlPoints:ControlPoint[] }
interface LineInput {note:string;parts:{map:string;color:string[];tolerance:number;via:Pt[];snapPx:number;gapCost:number}[];close:Pt[]}
interface LinesInput {maps:Record<string,MapInput>;lines:Record<string,LineInput>}
const dir=resolve(import.meta.dirname), spec=readJson<LinesInput>(`${dir}/lines.json`);
// Individually read printed minute ticks / grid lines. These establish only
// source chart coordinates: no claim that its old datum is modern WGS84.
const cp:ControlPoint[]=[];
const rows:[number,number,number][]=[[26,2116,2181],[24,4424,4496],[22,6741,6816],[20,9050,9130]];
for(const [minute,leftY,rightY] of rows){
 for(const [lonMinute,topX,bottomX] of [[38,2685,2583],[40,5035,4930],[42,7384,7275]] as const){
  const y=leftY+(rightY-leftY)*(topX-500)/10200;
  const x=topX+(bottomX-topX)*(y-385)/15270;
  cp.push({name:`Printed graticule 103°${lonMinute}'E 1°${minute}'N (internal registration only)`,svg:[Math.round(x),Math.round(y)],lnglat:[103+lonMinute/60,1+minute/60]});
 }
}
const input:MapInput={dataset:'g15',projection:'auto',maxResidualKm:0.06,controlPoints:cp};
writeJson(`${dir}/georef-G15-grid.json`,{...input,status:'internal-printed-graticule-registration-not-external-accuracy',coordinateSource:'G15 printed meridians/parallels, native raster. Not a modern surviving-feature CP set. Survey south of Tg Karang 1960–61; corrected scan contains later port installations excluded from this natural-shore trace.'},true);
spec.maps['coast-g15']=input;
// Native-pixel guides read in work/G15-mainland-west.png (crop origin450,6000;
// displayed at 1/5 scale). Dense guides restrict following to the vegetation /
// high-water shore, rather than chart soundings, jetties or 1966 dredging.
const reduced:Pt[]=[[950,0],[966,45],[976,90],[974,118],[991,139],[1020,153],[1038,169],[1024,186],[1006,189],[984,172],[959,181],[940,183],[918,165],[885,153],[871,168],[868,187],[854,194],[840,185],[827,169],[812,174],[789,157],[775,164],[761,187],[742,184],[721,177],[717,190],[736,209],[739,221],[716,234],[704,251],[691,260],[672,264],[666,274],[646,280],[625,290],[608,297],[600,309],[593,340],[583,372],[584,391],[600,402],[621,419],[644,430],[664,435],[684,447],[691,471],[705,486],[724,482],[730,474],[722,462],[724,454],[741,460],[755,482],[770,501],[784,510],[783,525],[775,539],[786,552],[780,563],[770,561],[762,545],[751,528],[739,518],[726,520],[717,535],[715,555],[705,571],[695,567],[687,547],[681,534],[669,529],[657,527],[649,515],[632,513],[618,503],[606,487],[600,473],[590,466],[578,469],[569,482],[560,487],[555,481],[554,463],[544,451],[533,445],[524,447],[519,466],[512,479],[506,499],[502,521],[507,540],[512,554],[509,571],[497,585],[495,607],[496,629],[482,649],[473,668],[466,693],[453,711],[443,735],[444,757],[453,774],[471,789],[491,804],[505,817],[520,827],[541,827],[558,817],[579,822],[596,832],[614,838],[632,844],[649,844],[669,835],[686,836],[703,851],[720,866],[733,884],[745,903],[753,927],[758,950],[758,976],[752,1000],[743,1022],[746,1042],[759,1061],[771,1083],[788,1105],[806,1127],[826,1143],[849,1148],[875,1144],[902,1136],[928,1124],[949,1108],[970,1089],[989,1074],[1011,1058],[1034,1049],[1050,1040],[1061,1046],[1069,1065],[1074,1085],[1089,1090],[1106,1081],[1112,1060],[1122,1040],[1138,1026],[1155,1016],[1176,1013],[1195,1017],[1214,1028],[1230,1041],[1250,1047]];
const via:Pt[]=[];
for(let i=1;i<reduced.length;i++){
 const a=reduced[i-1]!,b=reduced[i]!,n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);
 for(let j=0;j<n;j++)via.push([Math.round(450+5*(a[0]+(b[0]-a[0])*j/n)),Math.round(6000+5*(a[1]+(b[1]-a[1])*j/n))]);
}
const end=reduced.at(-1)!;via.push([450+end[0]*5,6000+end[1]*5]);
const fits=candidates('auto',cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm),fit=fits[0]!;
spec.lines['coast-g15-west-water']={note:'G15 Admiralty2587: natural western mainland shore from 1960–61 survey south of Tg Karang; later jetties/dredging/shipyard works do not define this shore. Approximate chart-coordinate registration using printed graticule; old datum and exact correction dates remain limits. Source extent ends before eastern Jurong/Pandan; no assertion of complete1961Jurong.',parts:[{map:'coast-g15',color:['#685636','#8c764b'],tolerance:65,via,snapPx:2,gapCost:40}],close:[[6700,15700],[500,15700],[500,6000]].map(p=>fit.model.toLngLat(p[0]!,p[1]!))};
writeJson(`${dir}/lines.json`,spec,true);
writeJson(`${dir}/work/georef-G15-grid-fit.json`,fit.report,true);
console.log(`G15 western shore: ${via.length} source guides, internal model ${fit.report.model}; external accuracy unmeasured.`);
