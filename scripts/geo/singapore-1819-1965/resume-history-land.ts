/** Restore source-surveyed Jurong land after the shared pipeline's modern
 * WATERBODY subtraction. The box selects coverage, never a historical coast.
 * Every exposed bank remains the respective G9/G11 source trace.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { mapshaper, toFc } from '../lib/common';
const dir=import.meta.dirname;
const selector=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[103.60,1.27],[103.79,1.27],[103.79,1.48],[103.60,1.48],[103.60,1.27]]]}}]);
for (const id of ['g9','g11']) {
  const source=JSON.parse(readFileSync(`${dir}/work/coast-${id}-main.geojson`,'utf8'));
  const restored=await mapshaper('-i a.json b.json combine-files -clip target=a b',{a:source,b:selector});
  writeFileSync(`${dir}/work/resume-${id}-jurong-land.geojson`,JSON.stringify(restored));
}
