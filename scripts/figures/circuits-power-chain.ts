/** Four retained round-two graphite crops; only the cable cross-section is new. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { readFileSync,writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { cast,ellipse,f,line,path,random,svg,type Point } from './graphite';
import { pencil,hatchShape } from './graphite-hatching';
import { encode } from './round2-io';
import { assertLayout,type Box } from './b-layout';
export const stations=['generation','transmission','substation','underground','homes'];
export const links=[[0,1],[1,2],[2,3],[3,4]];
export const boxes:Box[]=[{x:50,y:45,w:470,h:350},{x:750,y:45,w:400,h:350},{x:845,y:520,w:305,h:330},{x:450,y:520,w:290,h:330},{x:45,y:520,w:285,h:330}];
export const cableSections:Point[]=[[535,753],[595,753],[655,753]];
export const cableRadius=26,groundY=535,archCrown=591,trayY=781;
export const arrowWidth=4.5,arrowHead=20;
const arrows:Point[][]=[[[555,220],[705,220]],[[1060,421],[1060,486]],[[825,690],[762,690]],[[432,690],[352,690]]];
export function assertPowerChain():void {
 assert.equal(stations.length,5);assert.deepEqual(links,[[0,1],[1,2],[2,3],[3,4]]);assertLayout(boxes);
 assert.equal(arrows.length,4);assert(arrowWidth>=4&&arrowHead>=18);
 assert.equal(cableSections.length,3);assert(archCrown-groundY>=50,'soil above arch');
 for(const [i,[x,y]] of cableSections.entries()) {
  assert(y-cableRadius>archCrown&&x-cableRadius>487&&x+cableRadius<703);
  assert.equal(y+cableRadius,trayY-2,'each cable rests on tray, not side walls');
  for(const q of cableSections.slice(i+1))assert(Math.hypot(x-q[0],y-q[1])>2*cableRadius);
 }
 assert(Math.min(boxes[3]!.w,boxes[3]!.h)*420/1200>=40,'stage readable at 420');
}
function arrow(points:Point[]):string {
 const a=points.at(-2)!,b=points.at(-1)!,ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
 return line(points,'#494949',arrowWidth)+path(`M${b.join(' ')}L${f(b[0]-arrowHead*Math.cos(ang-.45))} ${f(b[1]-arrowHead*Math.sin(ang-.45))}L${f(b[0]-arrowHead*Math.cos(ang+.45))} ${f(b[1]-arrowHead*Math.sin(ang+.45))}Z`,'#494949','none');
}
/** Orthographic section: cables point towards the viewer; no receding edges,
 * back wall, pipe flanges or transverse lengths of cable. */
export function underground():string {
 const soil=`M450 ${groundY}H740V846H450Z`;
 const arch=`M473 835V${archCrown+122}A122 122 0 0 1 717 ${archCrown+122}V835Z`;
 const opening='M487 824V713A108 108 0 0 1 703 713V824Z';
 let b=path(soil,'#ffffff','none')+hatchShape('soil',soil,{x:450,y:535,w:290,h:311},2.4,.34);
 // Loose stones in the soil: outlined, shaded on their lower-right side.
 const stones=random(5351);
 for(let i=0;i<44;i++) {
  const x=458+stones()*274,y=548+stones()*290,rx=2.5+stones()*5,ry=rx*(.55+stones()*.3);
  if(x>466&&x<724&&(y>archCrown+122||Math.hypot(x-595,y-archCrown-122)<131))continue;
  b+=ellipse(x,y,rx+1.2,ry+1.2,'#ffffff','none')+ellipse(x,y,rx,ry,'#e8e8e8','#4a4a4a',.8)+pencil([[x-rx*.2,y+ry*.7],[x+rx*.8,y+ry*.1]],.9,.6);
 }
 for(let i=0;i<15;i++) {
  const y=547+i*19;
  b+=pencil([[452,y],[483,y-1],[508,y+1],[541,y],[580,y+2],[621,y],[657,y-1],[698,y+1],[737,y]],.6,.25);
 }
 b+=path(arch,'#ffffff','#555555',1.5)+hatchShape('arch-concrete',arch,{x:473,y:590,w:244,h:245},1.25,.62,true);
 b+=path(opening,'#ffffff','#3e3e3e',2.2);
 b+=hatchShape('arch-shadow','M487 824V713A108 108 0 0 1 703 713V824H695V713A100 100 0 0 0 495 713V824Z',{x:487,y:605,w:216,h:219},1.3,.6);
 // A supported transverse tray, attached to both cut tunnel walls.
 b+=path(`M487 ${trayY}H703V788H487Z`,'#ffffff','#494949',1.7)+hatchShape('tray',`M487 ${trayY}H703V788H487Z`,{x:487,y:trayY,w:216,h:7},1.2,.75);
 for(const side of [487,703]) {
  const direction=side===487?1:-1;
  b+=path(`M${side} 788l${direction*24} 0l${-direction*24} 23Z`,'#ffffff','#555555',1.4);
  b+=pencil([[side,794],[side+direction*15,789]],1,.6);
 }
 for(const [i,[x,y]] of cableSections.entries()) {
  const disc=`M${x-cableRadius} ${y}a${cableRadius} ${cableRadius} 0 1 0 ${2*cableRadius} 0a${cableRadius} ${cableRadius} 0 1 0 ${-2*cableRadius} 0`;
  b+=cast(x+4,trayY+1,cableRadius*1.05,6);
  b+=ellipse(x,y,cableRadius,cableRadius,'#ffffff','#363636',2)+hatchShape(`sheath-${i}`,disc,{x:x-26,y:y-26,w:52,h:52},1.1,.8,true);
  b+=path(`M${f(x-cableRadius*.62)} ${f(y-cableRadius*.62)}A${cableRadius-3} ${cableRadius-3} 0 0 1 ${f(x+cableRadius*.62)} ${f(y-cableRadius*.62)}`,'none','#e6e6e6',2.2,'opacity=".8"');
  b+=ellipse(x,y,18,18,'#ffffff','#555555',1.25);
  // Seven solid wire ends, not the empty bore of a water pipe.
  for(let j=0;j<7;j++) {
   const a=(j-1)*Math.PI/3,xx=x+(j?10*Math.cos(a):0),yy=y+(j?10*Math.sin(a):0);
   b+=ellipse(xx,yy,4.7,4.7,'#ffffff','#454545',.9)+pencil([[xx-3,yy+1],[xx+2,yy-3]],1.5,.72)+pencil([[xx-1,yy+3],[xx+3,yy-1]],1,.6);
  }
 }
 b+=pencil([[448,535],[493,534.7],[547,535.4],[602,535],[669,534.8],[742,535]],2.7,.95);
 for(const x of [463,508,689,728])b+=pencil([[x,535],[x-2,542],[x+1,550]],.9,.55);
 return b;
}
export function powerSvg():string {
 const href='data:image/png;base64,'+readFileSync(new URL('./sources/i-b-round3/power-edit.png',import.meta.url)).toString('base64');
 const crops:Box[]=[{x:37,y:30,w:765,h:566},{x:812,y:20,w:612,h:570},{x:920,y:620,w:520,h:440},{x:478,y:622,w:440,h:435},{x:15,y:617,w:450,h:440}];
 const groups=crops.map((b,i)=>{
  if(i===3)return underground();
  const t=boxes[i]!,scale=Math.min(t.w/b.w,t.h/b.h),dx=t.x+(t.w-b.w*scale)/2,dy=t.y+(t.h-b.h*scale)/2;
  return `<g transform="translate(${dx} ${dy}) scale(${scale}) translate(${-b.x} ${-b.y})"><clipPath id="group-${i}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/></clipPath><image href="${href}" width="1448" height="1086" clip-path="url(#group-${i})"/></g>`;
 }).join('');
 return svg(groups+arrows.map(arrow).join(''));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assertPowerChain();
 if(process.argv.includes('--svg'))writeFileSync(process.argv[process.argv.indexOf('--svg')+1]!,powerSvg());
 await encode('public/illustrations/figures/circuits-power-chain.webp',await sharp(Buffer.from(powerSvg())).png().toBuffer());
}
