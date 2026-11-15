import assert from 'node:assert/strict';
import {save,path,ellipse,texture} from './continental-drift-plate.js';
export const sendingMembrane=490,receivingMembrane=580;
export const vesicles=[[390,398],[480,416],[566,389],[665,420],[755,393],[335,448]] as const;
assert(receivingMembrane>sendingMembrane);assert(vesicles.every(([,y])=>y+33< sendingMembrane));
let b=texture('M420 110L420 210C240 220 175 337 225 444Q252 494 325 490L855 490Q970 486 985 420C1010 300 911 220 770 210L770 110','#d4d4d4');
b+=path('M325 482L854 482','none','#8d8d8d',1.2);
for(const [x,y]of vesicles)b+=ellipse(x,y,33,33,'#e3e3e3','#777777',2)+ellipse(x,y,27,27,'url(#hatch)','none');
// Two omega-shaped fusion profiles open into the cleft, part of upper membrane.
for(const x of [530,705])b+=path(`M${x-24} 490L${x-24} 480C${x-75} 420 ${x+75} 420 ${x+24} 480L${x+24} 490`,'#dadada','#666666',2.5);
b+=texture('M180 580L1020 580L1020 774Q600 804 180 774Z','#dedede');
b+=path('M180 588L1020 588','none','#858585',1.3);
for(let x=310;x<940;x+=88)b+=path(`M${x-15} 582L${x-15} 562Q${x} 547 ${x+15} 562L${x+15} 582`,'#b7b7b7','#707070',1.6);
for(const [x,y]of [[478,524],[552,539],[654,520],[720,551],[812,529],[614,559]])b+=ellipse(x!,y!,4,4,'#747474','none');
await save('brain-and-nerves-synapse',b);
