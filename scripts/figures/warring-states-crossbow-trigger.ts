/** Todd CC0 9873460546 and UW assembled/parts diagrams: three moving
 * castings, two transverse axes. Every exploded bore remains on its axis. */
import assert from 'node:assert/strict';
import { main } from './redo-cd-utils.js';
import { surface,pencil,path,line,ellipse,face,save,type Point } from './round3-graphite.js';
const add=(a:Point,b:Point):Point=>[a[0]+b[0],a[1]+b[1]];
const front:Point=[450,420],rear:Point=[730,420],axis:Point=[100,-60];
const shift=(t:number):Point=>[axis[0]*t,axis[1]*t];
export const mechanism={front,rear,axis,catchOffset:shift(-3.2),camOffset:shift(3.75),bladeOffset:shift(-1.8),pinOffsets:[shift(-3.9),shift(2.7)],floorY:480,bladeLength:310};
export function trigger(){
 const {catchOffset,camOffset,bladeOffset,pinOffsets}=mechanism;
 for(const d of [catchOffset,camOffset,bladeOffset,...pinOffsets])assert.equal(d[0]*axis[1]-d[1]*axis[0],0,'Explosion follows the actual pin axes');
 const catchPivot=add(front,catchOffset),camPivot=add(rear,camOffset),bladePivot=add(rear,bladeOffset);
 assert.deepEqual(add(front,[100,20]),add(rear,[-180,20]),'Cam nose supports catch heel in the assembled position');
 assert(bladePivot[1]+310>mechanism.floorY);assert.equal(pinOffsets.length,2);
 let b='';
 // Fine dashed guides are drawn before the metal: they disappear within parts.
 for(const [origin,lo,hi] of [[front,-3.7,1],[rear,-1.9,4]] as const)b+=line([add(origin,shift(lo)),add(origin,shift(hi))],'#969696',.8,'stroke-dasharray="6 10"');
 // Guo: rectangular open-topped box with vertical sides, no bevelled tray.
 b+=face([[320,332],[820,332],[920,272],[420,272]],.27);
 b+=face([[420,272],[920,272],[920,420],[420,420]],.64);
 b+=face([[340,466],[800,466],[900,406],[440,406]],.47);
 // Floor slot for the xuandao (assembled blade centre crosses at x=724).
 b+=path('M704 453L738 453L806 412L773 412Z','#fff','#555',.9);
 const topLeft:Point=[320,332],topRight:Point=[820,332],height:Point=[0,148],depth:Point=[100,-60];
 const bottomLeft=add(topLeft,height),bottomRight=add(topRight,height);
 // Shared corners make all four walls exactly the same vertical height.
 assert.equal(bottomRight[1]-topRight[1],148);assert.equal(bottomLeft[1]-topLeft[1],148);
 b+=face([topRight,add(topRight,depth),add(bottomRight,depth),bottomRight],.63);
 b+=face([topLeft,add(topLeft,depth),add(bottomLeft,depth),bottomLeft],.33);
 b+=face([topLeft,topRight,bottomRight,bottomLeft],.39);
 for(const [x,y]of [front,rear]){
  b+=ellipse(x,y,19,22,'#fff','#555',1.15);
  b+=pencil(`M${x-15} ${y-10}Q${x-1} ${y-28} ${x+14} ${y-10}`,1.25,.8);
 }
 // Narrow top rims reveal the wall thickness, without chamfers.
 b+=face([[320,332],[820,332],[812,340],[328,340]],.18);
 b+=line([[328,340],[328,478],[820,478]],'#444',1.1);
 function casting(d:string,box:readonly[number,number,number,number],p:Point,tone:number){
  const depth:Point=[18,-10.8];
  return `<g transform="translate(${p})">`+
   `<g transform="translate(${depth})">${surface(d,box,(u,v)=>tone+.24,.55,2,57,.9)}</g>`+
   surface(d,box,(u,v)=>tone+.2*v+.12*Math.abs(u-.3),-.75,3,19,1.1)+
   ellipse(0,0,16,19,'#fff','#4c4c4c',1.1)+pencil('M-13 -8Q-3 -24 12 -12',1,.8)+'</g>';
 }
 // One casting: upright wangshan, curved body and the two ya teeth.
 const catchD='M-50 23Q-84 -2 -70 -54L-45 -242Q-40 -258 -22 -256L-15 -251L-13 -137Q-9 -106 21 -91L61 -108L69 -151L96 -147L103 -85Q103 -45 88 -19L100 20L64 27Q-5 62 -50 23Z';
 // Rear tooth is offset only through the thickness of this casting.
 b+=`<g transform="translate(${catchPivot})">`+
  // A common transverse base carries two SOLID upright teeth, with clear air
  // between their tips. They are not a slot cut into one claw.
  face([[61,-108],[115,-140],[157,-117],[103,-85]],.46)+
  face([[123,-183],[150,-179],[157,-117],[130,-121]],.38)+
  face([[150,-179],[168,-190],[175,-128],[157,-117]],.64)+
  face([[123,-183],[141,-194],[168,-190],[150,-179]],.2)+'</g>';
 b+=casting(catchD,[-80,-260,190,325],catchPivot,.24);
 b+=`<g transform="translate(${catchPivot})">`+pencil('M-36 -240L-32 -143Q-25 -105 6 -92M-58 24Q0 48 58 20',.7,.6)+'</g>';
 // Gouxin is a short hooked rocking cam, not a jointed connecting rod.
 const camD='M-180 20L-180 3Q-146 9 -116 -6L-76 -3Q-43 -8 -51 -34Q-58 -49 -79 -46L-80 -61Q-53 -86 -20 -72Q23 -60 29 -21Q36 11 7 27Q-16 40 -48 28L-180 33Z';
 b+=casting(camD,[-182,-80,216,124],camPivot,.38);
 // Xuandao is on the rear axis and descends beneath the floor slot.
 const bladeD='M-25 -5Q-31 -34 -3 -38Q28 -43 34 -13Q41 19 10 31L-10 310Q-38 324 -63 305L-26 35Z';
 b+=casting(bladeD,[-65,-42,104,370],bladePivot,.23);
 // Exactly two cylindrical pins, each collinear with its own housing bores.
 for(const [i,p]of [front,rear].entries()){
  const base=add(p,pinOffsets[i]!),tip=add(base,shift(i===0?.94:-.94));
  const d=`M${base[0]-8} ${base[1]-13}L${tip[0]-8} ${tip[1]-13}Q${tip[0]+12} ${tip[1]-10} ${tip[0]+10} ${tip[1]+9}L${base[0]+10} ${base[1]+10}Z`;
  b+=surface(d,[Math.min(base[0],tip[0])-10,Math.min(base[1],tip[1])-15,122,89],(_u,v)=>.18+.65*v,.4,2,47,.8);
  b+=ellipse(base[0],base[1],12,15,'#fff','#555',.9)+pencil(`M${base[0]+3} ${base[1]-12}Q${base[0]+15} ${base[1]+1} ${base[0]+3} ${base[1]+13}`,1,.65);
 }
 assert(216<rear[0]-front[0],'Cam is compact compared with pivot spacing');
 return b;
}
if(main(import.meta.url))await save('warring-states-crossbow-trigger',trigger());
