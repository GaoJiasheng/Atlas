import fs from 'node:fs';
import {partSchema} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {hardwareModels} from './hardware-model';
const baseline=JSON.parse(fs.readFileSync('scripts/geo/forces/hardware-before.json','utf8'));
const after=hardwareModels(5),rows=[];
for(const p of baseline.parts){let beforeTriangles=0,beforeCalls=0;const pieces=partPieces(partSchema.parse(p));for(const piece of pieces){if(piece.lines)continue;beforeTriangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);beforeCalls++;}const model=after.find(m=>m.id===p.id)!;rows.push({id:p.id,beforeTriangles,afterTriangles:model.geometry.getAttribute('position').count/3,beforeCalls,afterCalls:1});}
const metrics={rows,beforeTriangles:rows.reduce((s,r)=>s+r.beforeTriangles,0),afterTriangles:rows.reduce((s,r)=>s+r.afterTriangles,0),beforeCalls:rows.reduce((s,r)=>s+r.beforeCalls,0),afterCalls:rows.length,glbBytes:fs.statSync('scripts/geo/forces/evidence/forces-hardware.glb').size};fs.writeFileSync('scripts/geo/forces/hardware-metrics.json',JSON.stringify(metrics,null,2)+'\n');console.log(JSON.stringify(metrics,null,2));
