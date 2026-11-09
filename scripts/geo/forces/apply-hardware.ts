/** Run AFTER merging forces-hardware nodes into the topic's forces.glb. */
import fs from 'node:fs';
const file='src/content/topics/forces/data/parts.json',d=JSON.parse(fs.readFileSync(file,'utf8'));
const families:Record<string,string>={'retort-stand':'steel','drop-stand':'steel','release-clamps':'steel','wheel-stand':'steel','brake-caliper':'casing','brake-cable':'rubber','shoe-soles':'plastic','paper-crumpled':'enamel'};
for(const p of d.parts){const f=families[p.id];if(!f)continue;delete p.primitive;delete p.extra;p.mesh=p.id;p.material={color:f,tint:'#ffffff'};if(p.id==='paper-crumpled')p.primitive={kind:'sphere',size:[.025],at:[1.07,.319,.14],color:'enamel',tint:'#ffffff'};}
d.model='/models/forces.glb';
fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
