/** Source-pixel waypoints follow the printed enclosing streets/plot lines on G1.
 * These are tracing guides, never geographic polygon vertices. lines.ts snaps
 * to ink and follows its least-cost pixel path. G1 has no colour legend.
 * The labelled planned areas are not a map of actual ethnic residence.
 */
import { readJson, writeJson } from '../lib/common';
import { resolve } from 'node:path';
const dir=resolve(import.meta.dirname);
const cp=readJson<any>(resolve(dir,'georef-G1.json'));
const previous=readJson<any>(resolve(dir,'lines.json'));
const outlines:Record<string,number[][]>={
 'chinese-kampong':[[278,75],[577,169],[548,236],[510,253],[479,331],[440,354],[397,330],[310,300],[201,263],[167,250],[198,236],[370,292],[399,218],[253,163],[278,75]],
 'chulia-kampong':[[591,124],[681,153],[699,181],[718,221],[575,174],[591,124]],
 'government-hill':[[833,111],[890,99],[930,79],[954,63],[984,76],[1035,101],[1005,205],[963,251],[910,251],[838,274],[802,225],[824,176],[833,111]],
 'cantonment':[[1105,270],[1361,389],[1295,481],[1062,362],[1105,270]],
 'european-town':[[1061,374],[1299,494],[1357,535],[1185,688],[1110,643],[1023,601],[914,551],[952,479],[1000,404],[1061,374]],
 'arab-kampong':[[1185,688],[1357,535],[1420,583],[1248,748],[1185,688]],
 'kampong-glam':[[1259,760],[1429,594],[1492,648],[1527,748],[1357,876],[1299,817],[1259,760]],
 'bugis-kampong':[[1366,885],[1538,762],[1571,893],[1564,913],[1467,984],[1414,930],[1366,885]],
 'native-cantonment':[[1350,285],[1390,262],[1425,310],[1386,335],[1350,285]]
};
const legend:Record<string,string>={'chinese-kampong':'Chinese Campong','chulia-kampong':'Chuliah Campong','government-hill':'Singapore Hill / Flag Staff (government hill identification)','cantonment':'Cantonment Plain','native-cantonment':'Native Cantonment','european-town':'European Town','arab-kampong':'Arab Campong','kampong-glam':"Sultan’s (compound; mapped as Kampong Glam)",'bugis-kampong':'Bugis Campong'};
const lines:Record<string,unknown>={};
for(const [id,corners] of Object.entries(outlines)){
 const parts:any[]=[];
 for(let i=0;i<corners.length-1;i++){
   const via:number[][]=[]; const a=corners[i]!,b=corners[i+1]!;const n=Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)/35);
   for(let j=0;j<=n;j++)via.push([Math.round(a[0]!+(b[0]!-a[0]!)*j/n),Math.round(a[1]!+(b[1]!-a[1]!)*j/n)]);
   parts.push({map:'jackson',color:['#555249','#918674'],tolerance:55,via,snapPx:8,gapCost:40});
 }
 lines[id]={note:`G1 printed ${legend[id]}; enclosing printed roads/plot limits, inferred allocation extent rather than a colour class. CP historic continuity is a review gap.`,parts,close:[]};
}
writeJson(resolve(dir,'lines.json'),{maps:{...previous.maps,jackson:{dataset:'g1',projection:'auto',maxResidualKm:0.12,controlPoints:cp.controlPoints}},lines:{...previous.lines,...lines}},true);
writeJson(resolve(dir,'jackson-legend.json'),{source:'G1',hasColourLegend:false,method:'Printed labels and enclosing street/plot strokes; source-pixel least-cost traces, clipped to dated L1 coast',classes:legend,knownGaps:['No coloured class legend exists in the specified original.','Street/plot enclosures are interpreted from printed allocation names; actual residence is not inferred.','Kampong Glam maps the printed Sultan compound; the label itself is Sultan’s.','Government hill maps the printed Singapore Hill road enclosure.','Modern junction identifications need independent historical continuity review.']},true);
