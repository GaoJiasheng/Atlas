/** pnpm tsx scripts/figures/circuits.ts — explicit electrical graphs → graphite SVG → WebP. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { ellipse, line, path, random, screw, svg, writePlate, type Point } from './graphite';
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
  const c=boardCircuit(parallel); assert(conducting(c).has('minus'));
  for(const w of c.wires){assert.deepEqual(w.points[0],c.terminals[w.from]);assert.deepEqual(w.points.at(-1),c.terminals[w.to]);}
  for(const bulb of c.bulbs){bulb.broken=true;assert.equal(conducting(c).has('minus'),parallel);bulb.broken=false;}
 }
 const c=festiveCircuit();assert.equal(c.bulbs.length,10);assert.equal(c.bulbs.filter(b=>b.broken).length,1);assert(!conducting(c).has('minus'));assert(c.bulbs.every(b=>b.brightness===0));
}
/** Common lamp drawing. Terminals (-46,+85),(+46,+85) are wired into opposite contacts. */
function bulb(x:number,y:number,brightness:number,broken=false,scale=1):string {
 const glass=broken ? path('M-34 18Q-45 -10 -30 -29L-18 -17L-7 -38L4 -24L18 -40L24 -23L37 -31Q48 -1 32 20L19 44H-19Z','url(#glass)') : ellipse(0,0,43,51,'url(#glass)');
 let rays=''; if(brightness) for(let i=0;i<20;i++) {const a=i*Math.PI/10;const r=brightness===1?62:57;const len=brightness===1?17:6;rays+=line([[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a)*(r+len),Math.sin(a)*(r+len)]],'#888888',brightness===1?1.8:1,'opacity=".65"');}
 return `<g transform="translate(${x} ${y}) scale(${scale})" data-brightness="${brightness}" data-broken="${broken}">${rays}`+
 ellipse(0,86,59,25,'#bcbcbc')+ellipse(0,80,59,23,'#dddddd')+ellipse(0,80,59,23,'url(#hatch)','#777777',1)+
 path('M-22 45L-24 78Q0 92 24 78L22 45Z','url(#metal)')+
 [51,57,63,69,75].map(y=>path(`M-22 ${y}Q0 ${y+9} 23 ${y}`,'none','#666666',1.3)).join('')+
 glass+(!broken?path('M-27 -23Q-36 -7 -28 9','none','#eeeeee',4):'')+
 line([[-46,85],[-30,85],[-24,79]],'#555555',2)+line([[46,85],[30,85],[0,87]],'#555555',2)+
 line([[-14,43],[-12,6]],'#666666',1.8)+line([[14,43],[12,6]],'#666666',1.8)+
 (broken?path('M-12 6L-6 -2M4 -2L12 6','none','#444444',2.4):path('M-12 6L-8 -1L-4 6L0 -1L4 6L8 -1L12 6','none',brightness?'#eeeeee':'#444444',brightness?3:2))+
 screw(-46,85,6)+screw(46,85,6)+'</g>';
}
function battery():string {
 return path('M140 117H360V192H140Z','#555555')+path('M150 120H350V174H150Z','#aaaaaa')+
 [151,246].map(x=>path(`M${x} 125H${x+91}V171H${x}Z`,'url(#metal)')+path(`M${x+4} 125V171M${x+86} 125V171`,'none','#555555',2)).join('')+
 path('M244 125V171','none','#444444',4)+screw(140,140,6)+screw(360,140,6);
}
const wireInk=(w:Wire)=>{
 const p=w.points;let d=`M${p[0]![0]} ${p[0]![1]}`;
 for(let i=1;i<p.length-1;i++){
  const a=p[i-1]!,b=p[i]!,c=p[i+1]!;
  const t=Math.min(.25,14/Math.hypot(b[0]-a[0],b[1]-a[1]),14/Math.hypot(c[0]-b[0],c[1]-b[1]));
  d+=`L${b[0]+(a[0]-b[0])*t} ${b[1]+(a[1]-b[1])*t}Q${b[0]} ${b[1]} ${b[0]+(c[0]-b[0])*t} ${b[1]+(c[1]-b[1])*t}`;
 }
 d+=`L${p.at(-1)![0]} ${p.at(-1)![1]}`;
 return path(d,'none','#444444',7)+path(d,'none','#aaaaaa',2,'transform="translate(-1 -1)"');
};
export function boardsSvg():string {
 return svg([false,true].map((parallel,i)=>{
  const c=boardCircuit(parallel),r=random(143);
  let grain='';for(let j=0;j<90;j++){const y=45+r()*475;const x=30+r()*360;grain+=path(`M${x} ${y}q${45+r()*40} ${r()*5-2.5} ${65+r()*65} 0`,'none','#888888',.7,'opacity=".32"');}
  return `<g transform="translate(${50+i*590} 180)">`+
  path('M22 40H478L497 534H3Z','#d0d0d0')+path('M3 534H497V552H3Z','#aaaaaa')+path('M3 534H497V552H3Z','url(#hatch)')+grain+
  [[40,60],[460,60],[22,515],[478,515]].map(([x,y])=>screw(x!,y!)).join('')+
  c.wires.map(wireInk).join('')+battery()+bulb(150,340,c.bulbs[0]!.brightness)+bulb(350,340,c.bulbs[1]!.brightness)+'</g>';
 }).join(''));
}
export function festiveCircuit():Circuit {
 const centres:Point[]=[...[180,390,600,810,1020].map(x=>[x,280] as Point),...[1020,810,600,390,180].map(x=>[x,555] as Point)];
 const terminals:Record<string,Point>={plus:[490,760],minus:[710,760]};
 centres.forEach(([x,y],i)=>{const side=i<5?1:-1;terminals[`${i}0`]=[x-side*36.8,y+68];terminals[`${i}1`]=[x+side*36.8,y+68];});
 const wires:Wire[]=[];
 const add=(from:string,to:string,via:Point[]=[])=>wires.push({from,to,points:[terminals[from]!,...via,terminals[to]!]});
 add('plus','00',[[300,710],[130,575],[130,400]]);
 for(let i=0;i<9;i++) {
  const via:Point[]=i===4?[[1110,348],[1110,623]]:[];
  add(`${i}1`,`${i+1}0`,via);
 }
 add('91','minus',[[260,700],[710,710]]);
 return {terminals,wires,bulbs:centres.map((_,i)=>({id:String(i),brightness:0,broken:i===4}))};
}
export function festiveSvg():string {
 const c=festiveCircuit();
 return svg(ellipse(600,475,550,335,'#dcdcdc')+ellipse(600,467,537,318,'none','#777777',3)+ellipse(600,467,520,301,'none','#999999',1.2)+
 c.wires.map(wireInk).join('')+c.bulbs.map(b=>{const p=c.terminals[`${b.id}0`]!;return bulb(p[0]+(Number(b.id)<5?36.8:-36.8),p[1]-68,b.brightness,b.broken,.8);}).join('')+
 `<g transform="translate(350 620)">${battery()}</g>`);
}
export const OUTPUTS=['public/illustrations/figures/circuits-series-parallel.webp','public/illustrations/figures/circuits-festive-lights.webp'] as const;
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertCircuits();await writePlate(OUTPUTS[0],boardsSvg());await writePlate(OUTPUTS[1],festiveSvg());}
