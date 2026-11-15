import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {save,rect,line,ellipse,stipple,texture} from './continental-drift-plate.js';
// Conceptual two-air-bellows seal after US8490333B2, Fig 1.
// Section is laid out horizontally: door / flexible seal / cabinet.
export const dimensions={steel:64,foam:336,liner:32,sealDepth:184,magnetThickness:30,contactSkin:6};
export const magnet={x:670,y:362,w:30,h:110};
export const steelFace=706;
export const chambers=[{x:558,y:310,w:65,h:140},{x:553,y:474,w:104,h:125}];
export const pipe={x:810,y:575,r:20};
export const projection={sx:.78,sy:1.2};
export const pipeRx=pipe.r*projection.sy/projection.sx;
assert(Math.abs(pipeRx*projection.sx-pipe.r*projection.sy)<1e-8);
assert.equal(chambers.length,2);
assert.equal(magnet.x+magnet.w+dimensions.contactSkin,steelFace);
assert(magnet.x>540&&magnet.y>300&&magnet.y+magnet.h<610);
assert(pipe.x-pipe.r>steelFace+dimensions.steel);
assert.equal(dimensions.foam/dimensions.steel,42/8);
assert.equal(dimensions.liner/dimensions.steel,4/8);
let b='';
// Door layers: steel outer panel; foam; thin plastic inner liner.
b+=rect(90,204,64,500,'url(#metal)','#555555',2);
b+=rect(154,204,336,500,'#ededed','#777777',1.2)+stipple(159,209,326,490,1500,12);
b+=rect(490,204,32,500,'#d3d3d3','#777777',1);
b+=rect(522,294,28,330,'#d3d3d3','#777777',1);
// Cabinet return: front steel folded onto its outside sheet and inner liner.
b+=rect(770,204,336,500,'#ededed','#777777',1.2)+stipple(775,209,326,460,1400,14);
b+=rect(706,204,64,500,'url(#metal)','#555555',2);
b+=rect(770,204,336,8,'#999999','#555555',2);
b+=rect(770,672,336,32,'#d3d3d3','#777777',1);
// Soft seal with two enclosed air bellows and a separate magnet pocket.
b+=texture('M550 294L653 294Q705 294 706 328L706 590Q706 624 671 624L550 624L550 598L574 583L564 484L550 469Z','url(#dark)');
for(const c of chambers)b+=rect(c.x,c.y,c.w,c.h,'#f1f1f1','#777777',1.4,12);
b+=rect(magnet.x,magnet.y,magnet.w,magnet.h,'#303030','#555555',2);
b+=ellipse(pipe.x,pipe.y,pipeRx,pipe.r,'#b4b4b4','#666666',2)+ellipse(pipe.x,pipe.y,14*projection.sy/projection.sx,14,'#eeeeee','#777777',1);
// 45-degree hatching on sectioned magnet and rigid liner; foam remains stippled.
for(let y=370;y<465;y+=12)b+=line([[674,y],[696,y+22]],'#bdbdbd',.7);
for(let y=220;y<670;y+=18)b+=line([[495,y],[516,y+21]],'#999999',.7);
for(let x=725;x<1045;x+=18)b+=line([[x,678],[x+20,698]],'#999999',.7);
// Context inset uses the newly drawn appliance, with the gasket location circled.
const fridge=readFileSync('art/img4/raw/refrigerator.png').toString('base64');
const context=`<image href="data:image/png;base64,${fridge}" x="12" y="225" width="305" height="445" preserveAspectRatio="xMidYMid meet"/>`;
// Enlarged horizontal section, rendered without arrows or text.
b='<g transform="translate(300 -80) scale(.78 1.2)">'+b+'</g>';
b=context+b;
b+=ellipse(255,545,27,35,'none','#777777',1.4);
b+=line([[278,525],[355,343]],'#999999',1,'stroke-dasharray="5 6"')+line([[278,567],[355,685]],'#999999',1,'stroke-dasharray="5 6"');
if(!process.argv.includes('--check')) await save('refrigerator-gasket-section',b);
