/** pnpm tsx scripts/figures/circuits.ts — explicit electrical graphs → graphite SVG → WebP. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { cast, etched, f, ellipse, line, path, random, screw, svg, writePlate, type Point } from './graphite';
import { woodTexture } from './materials';
export type Wire = { from: string; to: string; points: Point[] };
export type Circuit = { terminals: Record<string, Point>; wires: Wire[]; bulbs: {id:string; brightness:number; broken:boolean}[] };
export function boardCircuit(parallel: boolean): Circuit {
 const terminals:Record<string,Point>={plus:[140,140],minus:[360,140],a0:[104,425],a1:[196,425],b0:[304,425],b1:[396,425]};
 const wire=(from:string,to:string,via:Point[]):Wire=>({from,to,points:[terminals[from]!,...via,terminals[to]!]});
 const wires=parallel ? [
  wire('plus','a0',[[60,140],[60,425]]),
  wire('plus','b1',[[140,80],[460,80],[460,425]]),
  wire('minus','a1',[[360,210],[235,250],[235,425]]),
  wire('minus','b0',[[360,210],[270,280],[270,425]]),
 ] : [wire('plus','a0',[[60,140],[60,425]]),wire('a1','b0',[]),wire('b1','minus',[[440,425],[440,140]])];
 return {terminals,wires,bulbs:['a','b'].map(id=>({id,brightness:parallel?1:.26,broken:false}))};
}
/** Connectivity uses the same wire endpoints the renderer draws. */
export function conducting(c:Circuit): Set<string> {
 const edges = c.wires.map(w=>[w.from,w.to]);
 for(const b of c.bulbs) if(!b.broken) edges.push([`${b.id}0`,`${b.id}1`]);
 const reached=new Set(['plus']);
 for(let changed=true;changed;) {changed=false;for(const [a,b] of edges) if(a&&b) {if(reached.has(a)&&!reached.has(b)){reached.add(b);changed=true;} if(reached.has(b)&&!reached.has(a)){reached.add(a);changed=true;}}}
 return reached;
}
export function assertCircuits():void {
 for(const parallel of [false,true]) {
  const c=boardCircuit(parallel); assert(conducting(c).has('minus'));assertClearance(c);
  for(const w of c.wires){assert.deepEqual(w.points[0],c.terminals[w.from]);assert.deepEqual(w.points.at(-1),c.terminals[w.to]);}
  for(const bulb of c.bulbs){bulb.broken=true;assert.equal(conducting(c).has('minus'),parallel);bulb.broken=false;}
 }
 const c=festiveCircuit();assertClearance(c);assertTrayContainment();assert.equal(c.bulbs.length,10);assert.equal(c.bulbs.filter(b=>b.broken).length,1);assert(!conducting(c).has('minus'));assert(c.bulbs.every(b=>b.brightness===0));
}
/** Clearance audit works in circuit coordinates, before the camera projection. */
export function assertClearance(c:Circuit):void {
 const distance=(p:Point,a:Point,b:Point)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
 };
 const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(const w of c.wires)for(let i=1;i<w.points.length;i++){
  const a=w.points[i-1]!,b=w.points[i]!;
  for(const [id,p] of Object.entries(c.terminals))if(id!==w.from&&id!==w.to)assert(distance(p,a,b)>11,`wire ${w.from}–${w.to} passes terminal ${id}`);
  for(const v of c.wires){
   if(v===w||[v.from,v.to].some(id=>id===w.from||id===w.to))continue;
   for(let j=1;j<v.points.length;j++){
    const p=v.points[j-1]!,q=v.points[j]!;
    assert(!(cross(a,b,p)*cross(a,b,q)<0&&cross(p,q,a)*cross(p,q,b)<0),`wire crossing ${w.from} / ${v.from}`);
   }
  }
 }
}
export function assertTrayContainment():void {
 const c=festiveCircuit();
 for(const bulb of c.bulbs){
  const id=Number(bulb.id),side=id<5?1:-1,p=c.terminals[`${id}0`]!,x=p[0]+side*36.8,y=p[1];
  // Conservative bounding box includes the glass dome and socket, inside the inner lip.
  for(const xx of [x-49,x+49])for(const yy of [y-100,y+15])assert(((xx-600)/529)**2+((yy-462)/303)**2<1,`bulb ${id} touches tray lip`);
 }
}
/** The board plane is projected before upright objects are placed on it. */
export const boardView=([x,y]:Point):Point=>[(x-250)*(.85+.00028*y)+250+.07*(540-y),y*.65];
const polygon=(p:Point[],fill:string,ink='#555555',w=1)=>path(`M${p.map(([x,y])=>`${f(x)} ${f(y)}`).join('L')}Z`,fill,ink,w);
/** Bulb base centre is (0,0); independent screw terminals are (-46,0),(46,0). */
function bulb(x:number,y:number,brightness:number,broken=false,scale=1,reverse=false,planeScale=1):string {
 const glass='M-20 -48C-20 -62 -43 -77 -43 -105C-43 -137 -24 -158 0 -158C26 -158 43 -136 43 -105C43 -78 20 -63 20 -48Z';
 let contour='';
 // Curving, interrupted pencil strokes describe glass thickness, never light rays.
 const r=random(136);for(let i=0;i<100;i++){
  const side=i%2?-1:1, yy=-147+r()*88, t=(yy+106)/52;
  const xx=side*(Math.sqrt(Math.max(0,1-t*t))*40-r()*8);
  contour+=path(`M${f(xx)} ${f(yy)}q${f(side*(1+r()*2))} ${f(3+r()*5)} ${f(-side*(1+r()*3))} ${f(7+r()*8)}`,'none','#626262',.45,`opacity="${.15+r()*.32}"`);
 }
 let glow='';
 if(brightness){
  glow=ellipse(0,-106,brightness===1?83:51,brightness===1?91:59,'url(#glow)','none');
  for(let i=0;i<36;i++){
   const a=i*Math.PI/18, rr=55+(i%3)*4, len=brightness===1?9+(i%4)*3:2;
   glow+=line([[Math.cos(a)*rr,-106+Math.sin(a)*rr],[Math.cos(a)*(rr+len),-106+Math.sin(a)*(rr+len)]],'#b0b0b0',.65,`opacity="${brightness===1?.65:.2}"`);
  }
 }
 const terminal=(reverse?-1:1);
 return `<g transform="translate(${x} ${y}) scale(${scale*planeScale} ${scale*.78})" data-brightness="${brightness}" data-broken="${broken}">`+
 cast(10,12,85,29)+ellipse(0,7,61,23,'url(#dark)','#494949',1)+ellipse(0,0,61,24,'url(#metal)','#555555',1)+ellipse(0,0,61,24,'url(#cross)','none')+
 ellipse(0,-5,35,19,'url(#dark)','#555555',1)+
 etched('M-26 -48V-11Q0 5 26 -11V-48Z','url(#metal)')+
 Array.from({length:7},(_,i)=>path(`M-25 ${-45+i*5}q25 13 50 0`,'none',i%2?'#ededed':'#555555',i%2?.6:1)).join('')+
 glow+etched(glass,brightness===1?'#ededed':'url(#glass)','#5b5b5b',.8)+(brightness===1?ellipse(0,-106,72,80,'url(#glow)','none',0,'opacity=".45"'):'')+`<clipPath id="glass-${x}-${y}">${path(glass,'white','none')}</clipPath><g clip-path="url(#glass-${x}-${y})">${contour}</g>`+
 path('M-28 -127Q-35 -113 -29 -98','none','#fafafa',5,'opacity=".85"')+path('M-24 -134Q-30 -131 -31 -126','none','#ffffff',2.5)+
 line([[-13,-49],[-11,-94]],'#777777',1)+line([[13,-49],[11,-94]],'#777777',1)+
 (broken?path('M-11 -94L-7 -101L-4 -96M5 -101L11 -94','none','#484848',1.5):path('M-11 -94q3 -13 6 0q3 -13 6 0q3 -13 6 0q3 -13 4 0','none',brightness?'#ffffff':'#505050',brightness===1?2.8:1.5))+
 (broken?path('M24 -149L17 -132L23 -117L13 -103L20 -89M17 -132L4 -137M23 -117L34 -111','none','#4d4d4d',1.5)+path('M24 -148L19 -132L25 -117','none','#ffffff',.7):'')+
 line([[-46*terminal,0],[-34*terminal,-1],[-26*terminal,-10]],'#666666',1.8)+line([[46*terminal,0],[34*terminal,6],[0,5]],'#666666',1.8)+
 screw(-46,0,6)+screw(46,0,6)+'</g>';
}
function battery(map:(p:Point)=>Point):string {
 const p=(x:number,y:number)=>map([x,y]);
 const face=(corners:Point[],fill:string)=>polygon(corners.map(map),fill);
 const cell=(x:number)=>{
  const [xx,yy]=p(x,185),[end]=p(x+94,185);
  return etched(`M${xx} ${yy-48}H${end}V${yy-7}H${xx}Z`,'url(#metal)')+
  ellipse(xx,yy-27,6,21,'url(#metal)','#4f4f4f',1)+ellipse(end,yy-27,5,21,'url(#metal)','#5f5f5f',.8)+
  line([[xx+8,yy-45],[end-8,yy-45]],'#eeeeee',1.8)+
  line([[xx+8,yy-13],[end-8,yy-13]],'#5e5e5e',.8)+Array.from({length:95},(_,i)=>{const t=i/95;return line([[xx+2+t*90,yy-46],[xx+2+t*90,yy-10]],'#555555',.3,`opacity="${.08+.22*t}"`);}).join('');
 };
 return cast(...p(260,185),141,27)+face([[133,123],[366,123],[366,195],[133,195]],'url(#dark)')+
 face([[133,195],[366,195],[366,208],[133,208]],'url(#dark)')+cell(149)+cell(248)+
 [139,361].map(x=>{const [xx,yy]=p(x,185);return etched(`M${xx-5} ${yy-54}h10v60h-10Z`,'url(#dark)');}).join('')+
 ['plus','minus'].map((_,i)=>{const [x,y]=p(i?360:140,140);return screw(x,y,6);}).join('');
}
const wireInk=(w:Wire,map:(p:Point)=>Point=(p)=>p)=>{
 const p=w.points.map(map);let d=`M${p[0]![0]} ${p[0]![1]}`;
 for(let i=1;i<p.length-1;i++){
  const a=p[i-1]!,b=p[i]!,c=p[i+1]!;
  const t=Math.min(.25,30/Math.hypot(b[0]-a[0],b[1]-a[1]),30/Math.hypot(c[0]-b[0],c[1]-b[1]));
  d+=`L${b[0]+(a[0]-b[0])*t} ${b[1]+(a[1]-b[1])*t}Q${b[0]} ${b[1]} ${b[0]+(c[0]-b[0])*t} ${b[1]+(c[1]-b[1])*t}`;
 }
 if(p.length===2){const a=p[0]!,b=p[1]!;d+=`Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2-13} ${b[0]} ${b[1]}`;}else d+=`L${p.at(-1)![0]} ${p.at(-1)![1]}`;
 return path(d,'none','#555555',8,'opacity=".18" transform="translate(2 3)"')+path(d,'none','#484848',5.5)+path(d,'none','#b8b8b8',1.5,'transform="translate(-.7 -.9)"')+path(d,'none','#656565',.65,'transform="translate(.7 .7)"');
};
export function boardsSvg():string {
 return svg([false,true].map((parallel,i)=>{
  const c=boardCircuit(parallel),r=random(143),q=boardView;
  let grain='';
  for(let j=0;j<1650;j++){
   const y=42+r()*483,x=8+r()*440,l=10+r()*80;
   const a=q([x,y]),b=q([Math.min(495,x+l),y]);
   grain+=path(`M${a[0]} ${a[1]}Q${(a[0]+b[0])/2} ${a[1]+r()*2-1} ${b[0]} ${b[1]}`,'none','#707070',.25+r()*.25,`opacity="${.08+r()*.21}"`);
  }
  const top=[[5,40],[495,40],[495,535],[5,535]] as Point[];
  return `<g transform="translate(${28+i*585} 250)">`+cast(265,360,295,52)+
  polygon([q([5,535]),q([495,535]),[q([495,535])[0],q([495,535])[1]+21],[q([5,535])[0],q([5,535])[1]+21]],'url(#dark)')+
  polygon(top.map(q),'url(#wood)')+polygon(top.map(q),'url(#wood-pencil)','none',0)+grain+
  line([q([8,531]),q([492,531])],'#eeeeee',1)+
  [[22,59],[477,59],[22,515],[477,515]].map(p=>screw(...q(p as unknown as Point),4)).join('')+
  c.wires.map(w=>wireInk(w,q)).join('')+battery(q)+
  bulb(...q([150,425]),c.bulbs[0]!.brightness,false,1,false,.969)+bulb(...q([350,425]),c.bulbs[1]!.brightness,false,1,false,.969)+'</g>';
 }).join(''),1200,900,`<defs><pattern id="wood-pencil" width="350" height="64" patternUnits="userSpaceOnUse"><image href="${woodTexture()}" width="350" height="64" opacity=".75"/></pattern></defs>`);
}
export function festiveCircuit():Circuit {
 const centres:Point[]=[...[230,415,600,785,970].map(x=>[x,332] as Point),...[945,770,600,430,255].map(x=>[x,572] as Point)];
 const terminals:Record<string,Point>={plus:[490,440],minus:[710,440]};
 centres.forEach(([x,y],i)=>{const side=i<5?1:-1;terminals[`${i}0`]=[x-side*36.8,y+68];terminals[`${i}1`]=[x+side*36.8,y+68];});
 const wires:Wire[]=[];
 const add=(from:string,to:string,via:Point[]=[])=>wires.push({from,to,points:[terminals[from]!,...via,terminals[to]!]});
 add('plus','00',[[450,440],[150,440],[150,420]]);
 for(let i=0;i<9;i++) {
  const via:Point[]=i===4?[[1015,400],[1015,640]]:[];
  add(`${i}1`,`${i+1}0`,via);
 }
 add('91','minus',[[160,615],[160,530],[750,530],[750,440]]);
 return {terminals,wires,bulbs:centres.map((_,i)=>({id:String(i),brightness:0,broken:i===4}))};
}
export function festiveSvg():string {
 const c=festiveCircuit(),r=random(830);
 let tooling='';
 for(let i=0;i<420;i++){
  const a=r()*Math.PI*2,rad=.15+r()*.8;
  const x=600+Math.cos(a)*530*rad,y=475+Math.sin(a)*300*rad;
  tooling+=path(`M${f(x)} ${f(y)}l${f(5+r()*18)} ${f(-3-r()*6)}`,'none','#777777',.45,'opacity=".22"');
 }
 const tray=cast(605,535,595,345)+ellipse(600,475,559,335,'url(#metal)','#555555',1.5)+
 ellipse(600,467,548,321,'#cecece','#696969',.9)+ellipse(600,462,529,303,'url(#wood)','#777777',1)+
 ellipse(600,462,529,303,'url(#hatch)','none')+tooling+
 ellipse(600,472,551,324,'none','#f1f1f1',1.4)+ellipse(600,478,553,326,'none','#777777',.6);
 return svg(tray+c.wires.map(w=>wireInk(w)).join('')+
 c.bulbs.map(b=>{
  const p=c.terminals[`${b.id}0`]!, side=Number(b.id)<5?1:-1;
  return bulb(p[0]+side*36.8,p[1],0,b.broken,.8,side<0);
 }).join('')+battery(([x,y])=>[x+350,y+300]));
}
export const OUTPUTS=['public/illustrations/figures/circuits-series-parallel.webp','public/illustrations/figures/circuits-festive-lights.webp'] as const;
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertCircuits();await writePlate(OUTPUTS[0],boardsSvg());await writePlate(OUTPUTS[1],festiveSvg());}
