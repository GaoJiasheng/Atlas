/** Rebuild only owned topic data; source anatomy/rig packets stay byte-identical. */
import { readFileSync, writeFileSync } from 'node:fs';
import {studentDetail} from './details.mjs';
import { boneSpecimens } from './specimens.mjs';
const file='src/content/topics/bones-and-joints/data/parts.json';
const data=JSON.parse(readFileSync(file,'utf8'));
for(const [id,pieces] of Object.entries(boneSpecimens())){
 const part=data.parts.find(p=>p.id===id);part.primitive=pieces[0];
 if(pieces.length>1)part.extra=pieces.slice(1);else delete part.extra;
}
for(const id of ['bone-cortex','growth-plate'])data.parts.find(p=>p.id===id).detail=studentDetail(id);
writeFileSync(file,JSON.stringify(data,null,2)+'\n');
