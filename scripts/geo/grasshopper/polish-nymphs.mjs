import fs from 'node:fs';
import {nymph} from './nymphs.mjs';
import {compile,install,evidence} from '../kits/residual-polish.mjs';
const data=JSON.parse(fs.readFileSync('scripts/geo/grasshopper/source-parts.json','utf8')),items=[];
for(let stage=1;stage<=6;stage++){const id='nymph-'+stage,relief=nymph(data.parts.find(p=>p.id===id),stage);items.push({id,geometry:relief.geometry()});}
const candidate=evidence+'/nymph-candidate.glb';await compile(candidate,items,{ratio:.12,error:.00055,normalWeight:.035,position:16,normal:10});console.log('grasshopper bytes',await install('public/models/grasshopper.glb',candidate,items.map(p=>p.id)));
