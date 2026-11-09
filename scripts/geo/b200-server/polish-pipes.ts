/** Constant-bore copper U heat pipes: two buried legs, large-radius returns,
 * straight condenser crest. Preserves the four repeated paired tower stations. */
import fs from 'node:fs';
const path='src/content/topics/b200-server/data/parts.json',file=JSON.parse(fs.readFileSync(path,'utf8'));
const p=file.parts.find((p:{id:string})=>p.id==='gpu-heatsinks');
for(const q of p.extra){if(q.kind!=='sweep'||q.color!=='copper')continue;
 const x=q.path[0][0],r=.00225;
 q.path=[[x,-.264,-.058],[x,-.006,-.058],[x,.0010,-.051],[x,.0010,.051],[x,-.006,.058],[x,-.264,.058]];
 q.radius=r;q.radial=24;q.segments=20;q.caps='flat';
}
fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
