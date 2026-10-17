/** G7 source-pixel shoreline guides and offshore image-frame selection closure.
 * No geographic territory vertices are drawn. Shared lines.ts follows source ink.
 * The traced water selection covers only the east harbour source component.
 */
import { resolve } from 'node:path';
import { readJson,writeJson } from '../lib/common';
import { candidates,evaluate } from '../lib/fit';
const dir=resolve(import.meta.dirname), guide=readJson<any>(`${dir}/work/G7-town-shore-via.json`), cp=readJson<any>(`${dir}/georef-G7.json`);
const fits=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);const fit=fits[0]!;
// The green school grounds are not water: retain the printed Beach Road shore.
const via=guide.via as [number,number][];const left=via.findIndex(p=>p[0]>2240&&p[1]>1530&&p[1]<1600);let right=left+1;while(right<via.length&&(via[right]![0]<2400||via[right]![1]<1530))right++;
if(left<0||right>=via.length)throw Error('G7 shore review anchors not found');
via.splice(left,right-left,[2245,1560],[2270,1558],[2330,1559],[2400,1564]);
const spec=readJson<any>(`${dir}/lines.json`);spec.maps.constable=cp;
spec.lines['coast-g7-town-water']={note:'G7 1893 printed east-harbour shoreline including river banks; colour-seeded candidates snapped to printed shore ink. School grounds excluded by source-image review. West docks are a separate water component and remain a coverage gap. Closure along source image sea frame is a water selection, never a territory boundary.',parts:[{map:'constable',color:['#333b2c','#5b6752'],tolerance:60,via,snapPx:10,gapCost:40}],close:guide.closurePixels.map((p:number[])=>fit.model.toLngLat(p[0]!,p[1]!))};
writeJson(`${dir}/lines.json`,spec,true);console.log(`${via.length} G7 shore guides; source water-only frame closure.`);
