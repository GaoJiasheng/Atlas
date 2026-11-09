import fs from 'node:fs';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces,eachPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
const file=partsFile.parse(JSON.parse(fs.readFileSync(process.argv[2]??'scripts/geo/b200-server/source-parts.json','utf8')));
let triangles=0,calls=0;const perPart:Record<string,unknown>={};
for(const p of file.parts){let t=0,c=0;for(const q of file.animations.some(a=>a.target===p.id&&'each'in a&&a.each)?eachPieces(p):partPieces(p)){if(q.lines)continue;t+=(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1);c++;}perPart[p.id]={triangles:t,calls:c};triangles+=t;calls+=c;}
console.log(JSON.stringify({triangles,calls,perPart},null,2));
