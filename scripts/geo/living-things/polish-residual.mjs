/** Rebuild one specimen; byte-preserve all 27 accepted neighbours and text. */
import fs from 'node:fs';
import {specimen} from './models.ts';
import {modelBounds,modelGeometry,writeSculptures} from './bake.ts';
import {place,scaleModel} from './kit.ts';
import {SPECIMEN_IDS} from './sort-data.ts';
import {caseCell} from './specimens/lab.ts';
import {install,evidence,fitLeafNode} from '../kits/residual-polish.mjs';
import {partBounds} from '../../../src/engines/space-scene/lib/parts.ts';
const id='fruit-bat',drawn=specimen(id),b=modelBounds(drawn),home=drawn.primitive.at,reach=Math.max(b.max[0]-home[0],home[0]-b.min[0],b.max[2]-home[2],home[2]-b.min[2]),fit=Math.min(1,.036/reach),raw=fit<1?scaleModel(drawn,fit):drawn,bb=modelBounds(raw),local=place(raw,[-raw.primitive.at[0],-bb.min[1],-raw.primitive.at[2]]),placed=place(local,caseCell(SPECIMEN_IDS.indexOf(id)+1)),g=modelGeometry(placed);
g.computeBoundingBox();const box=g.boundingBox,at=[placed.primitive.at[0],(box.min.y+box.max.y)/2,placed.primitive.at[2]];g.translate(-at[0],-at[1],-at[2]);
const candidate=evidence+'/bat-candidate.glb',decoded=(await writeSculptures(candidate,[{id,geometry:g,at}]))[id];
// Higher-precision quantization can move an extremum a few microns beyond the
// accepted proxy. Fit the decoded result, retaining the authored floor/home.
const part=JSON.parse(fs.readFileSync('src/content/topics/living-things/data/parts.json','utf8')).parts.find(p=>p.id===id),envelope=partBounds(part),origin=[(envelope.min[0]+envelope.max[0])/2,.015,(envelope.min[2]+envelope.max[2])/2];
let contraction=1;
for(let k=0;k<3;k++){
 const upper=decoded.max[k]-origin[k],lower=origin[k]-decoded.min[k];
 if(upper>0)contraction=Math.min(contraction,(envelope.max[k]-origin[k]-1e-7)/upper);
 if(k!==1&&lower>0)contraction=Math.min(contraction,(origin[k]-envelope.min[k]-1e-7)/lower);
}
if(contraction<1){fitLeafNode(candidate,id,origin,contraction);console.log('Decoded envelope contraction',contraction);}
console.log('living bytes',await install('public/models/living-things.glb',candidate,[id],{compactDefaults:true}));
