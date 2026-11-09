import {crumpledPaper} from './crumpled-paper.ts';
import {compile,install,evidence} from '../kits/residual-polish.mjs';
const path=evidence+'/paper-candidate.glb';await compile(path,[{id:'paper-crumpled',geometry:crumpledPaper(),material:{roughness:.9,metalness:0},extras:{closed:false}}],{ratio:1,error:.00008,position:16,normal:12});console.log('forces bytes',await install('public/models/forces.glb',path,['paper-crumpled']));
