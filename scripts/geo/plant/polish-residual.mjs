import {leafSection} from './sweep.mjs';
import {compile,install,evidence} from '../kits/residual-polish.mjs';
const candidate=evidence+'/plant-candidate.glb';
await compile(candidate,[{id:'leaf-section',geometry:leafSection()}],{ratio:.20,error:.0008,position:14,normal:10});
console.log('plant bytes',await install('public/models/plant.glb',candidate,['leaf-section']));
