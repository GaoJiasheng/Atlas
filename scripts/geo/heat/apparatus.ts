/** Heat-only school apparatus. Dimensions are design reconstruction, not a named product. */
import type {Primitive} from '../../../src/engines/space-scene/schema';
type V=[number,number,number];
type P=Record<string,any>;
const b=(at:V,size:V,color='steel',bevel=.001):Primitive=>(Math.min(...size)<.0008?{kind:'box',at,size,color}:{kind:'bevelBox',at,size,color,bevel:Math.min(bevel,Math.min(...size)*.4)}) as Primitive;
const lat=(at:V,profile:number[][],color='steel',rotation?:V,segments=64):Primitive=>({kind:'lathe',at,profile,color,segments,...(rotation?{rotation}:{})}) as Primitive;
const rod=(at:V,r:number,h:number,color='steel',rotation?:V):Primitive=>lat(at,[[0,-h/2],[r*.85,-h/2],[r,-h/2+.0004],[r,h/2-.0004],[r*.85,h/2],[0,h/2]],color,rotation,48);
const sweep=(path:V[],r:number,color='steel'):Primitive=>({kind:'sweep',at:[0,0,0],path,radius:r,radial:16,segments:48,color,caps:'round'}) as Primitive;
function screw(at:V,axis:'x'|'z',length=.015):Primitive[]{
 const rot:V=axis==='x'?[0,0,90]:[90,0,0];
 const p:Primitive[]=[rod(at,.0016,length,'steel',rot)];
 const head:V=[at[0]-(axis==='x'?length/2:0),at[1],at[2]+(axis==='z'?length/2:0)];
 p.push(b(head,axis==='x'?[.003,.011,.008]:[.011,.008,.003],'steel',.001));
 // Genuine thread relief, merged into the same metal draw call.
 p.push({kind:'coil',at,radius:.00175,wire:.0003,turns:6,length:.009,segments:16,radial:6,rotation:rot,color:'steel'} as Primitive);
 return p;
}
function base(x:number,z:number,away=false):Primitive[]{
 // Rounded cast shoe, rolled top edge and raised threaded rod socket.
 const p=[b([x+(away?-.018:.018),.758,z],[.085,.016,.065],'powder',.005),rod([x,.774,z],.009,.018,'powder'),rod([x,.903,z],.004,.257,'stainless')];
 for(const dx of (away?[-.049,.013]:[-.013,.049]))for(const dz of [-.022,.022])p.push(b([x+dx,.751,z+dz],[.012,.002,.012],'rubber',.0008));
 p.push(lat([x,.784,z],[[.004,.0],[.007,.0],[.007,.003],[.004,.003]],'steel',undefined,6));return p;
}
function clamp(x:number,z:number,y:number,probeX:number):Primitive[]{
 const p:Primitive[]=[];
 // Two open C seats in orthogonal planes, never a solid black cube.
 const seat:number[][]=[];
 for(let i=0;i<=32;i++){const a=(45+i*270/32)*Math.PI/180;seat.push([Math.cos(a)*.011,Math.sin(a)*.011]);}
 for(let i=32;i>=0;i--){const a=(45+i*270/32)*Math.PI/180;seat.push([Math.cos(a)*.005,Math.sin(a)*.005]);}
 p.push({kind:'extrude',at:[x,y+.006,z],shape:seat,depth:.008,bevel:.0007,rotation:[90,0,0],color:'steel'} as Primitive);
 p.push({kind:'extrude',at:[x,y,z],shape:seat,depth:.010,bevel:.0007,rotation:[0,90,0],color:'steel'} as Primitive);
 p.push(...screw([x-.012,y+.006,z],'x',.018),...screw([x,y,z+.012],'z',.019));
 p.push(rod([(x+probeX-.014)/2,y,z],.0028,probeX-.014-x,'stainless',[0,0,90]));
 p.push(b([probeX-.015,y,z],[.014,.008,.009],'steel',.002));
 // Paired curved fingers embrace the stem; one fork is split into two prongs.
 for(const side of [-1,1])for(const dy of (side===1?[-.0035,.0035]:[0])){
  p.push(sweep([[probeX-.018,y+dy,z+side*.004],[probeX-.010,y+dy,z+side*.009],[probeX-.001,y+dy,z+side*.006],[probeX+.003,y+dy,z+side*.003]],.0016));
  p.push(sweep([[probeX-.004,y+dy,z+side*.0034],[probeX,y+dy,z+side*.0034],[probeX+.002,y+dy,z+side*.003]],.0014,'token:neutral'));
 }
 p.push(rod([probeX-.012,y,z+.012],.0015,.023,'steel',[90,0,0]),...screw([probeX-.012,y,z+.016],'z',.012));
 return p;
}
export function polishApparatus(parts:P[],sim:P,iteration=2){
 const get=(id:string)=>parts.find(p=>p.id===id)!;
 const replace=(id:string,p:Primitive[])=>{get(id).primitive=p[0];if(p.length>1)get(id).extra=p.slice(1);else delete get(id).extra;};
 const bathStand=base(-.66,.102);
 // Offset the shoe under its socket to clear the spoon-holder shoe behind it.
 bathStand[0]!.at[2]-=.014;for(const p of bathStand)if(p.color==='rubber')p.at[2]-=.014;
 replace('retort-stand',bathStand);
 replace('probe-clamp',clamp(-.66,.102,.97,-.580));
 for(const [id,x,bottom] of [['heater-probe-support',.15,.788],['cooler-probe-support',.55,.75]] as const){replace(id,[...base(x-.11,.078,true),...clamp(x-.11,.078,bottom+.195,x)]);}
 // A real retort crossbar and two lined spring clips replace the T-table.
 const holder=[...base(-.60,.165),...clamp(-.60,.165,.905,-.55),rod([-.55,.905,.128],.0025,.072,'steel',[0,0,90])];
 for(const x of [-.567,-.533]){
  holder.push(sweep([[x,.905,.128],[x,.906,.110],[x-.004,.908,.097],[x,.908,.092],[x+.004,.908,.097],[x,.908,.103]],.0014));
  holder.push(b([x,.906,.098],[.007,.003,.006],'token:neutral',.001));
 }
 replace('bath-holder',holder);
 for(const [id,marker,x,z,bottom] of [['probe','probe-marker',-.580,.102,.75],['heater-probe','heater-probe-marker',.15,.078,.788],['cool-probe','cool-probe-marker',.55,.078,.75]] as const){
  const bulb=bottom+.027;
  // Enlarged bore is diagrammatic; fixed glass, separately bound coloured fill.
  // Elongated alcohol reservoir blended into the stem (not a sphere on a stick).
  const envelope:number[][]=[[0,-.007]];
  for(let i=1;i<=16;i++){const a=-Math.PI/2+i*(145*Math.PI/180)/16;envelope.push([.0028*Math.cos(a),.007*Math.sin(a)]);}
  envelope.push([.0018,.011],[.0022,.014],[.0022,.198],[.0021,.200],[.0016,.2015],[0,.202]);
  const p:Primitive[]=[lat([x,bulb,z],envelope,'glass')];
  const reservoir:number[][]=[[0,-.005]];
  for(let i=1;i<=16;i++){const a=-Math.PI/2+i*(145*Math.PI/180)/16;reservoir.push([.00165*Math.cos(a),.005*Math.sin(a)]);}
  reservoir.push([.00065,.009],[0,.009]);
  p.push(lat([x,bulb,z+.0003],reservoir,'token:hot')); 
  // The fixed capillary joins the dynamic segment at y=bulb+.05.
  p.push(sweep([[x,bulb+.006,z+.0003],[x,bulb+.012,z+.0008],[x,bulb+.020,z+.0014],[x,bulb+.0505,z+.0014]],.00065,'token:hot')); 
  // Opaque milk-glass backing and engraved ticks on the front surface.
  p.push(b([x,bulb+.110,z-.001],[.0029,.176,.0008],'enamel',.0003));
  for(let i=0;i<=10;i++)p.push(b([x+.0012,bulb+.05+i*.008,z+.0018],[i%2===0?.0021:.0013,.00035,.0003],'token:ink-2',.0001));
  // Original compact numeral contours, one relief extrusion per digit.
  const rect=(x0:number,y0:number,x1:number,y1:number)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const digits:Record<string,{shape:number[][];holes?:number[][][]}>={
   '0':{shape:rect(0,0,6,10),holes:[rect(1,1,5,9)]},'1':{shape:rect(4,0,5,10)},
   '2':{shape:[[0,10],[6,10],[6,4],[1,4],[1,1],[6,1],[6,0],[0,0],[0,5],[5,5],[5,9],[0,9]]},
   '4':{shape:[[0,10],[1,10],[1,6],[5,6],[5,10],[6,10],[6,0],[5,0],[5,5],[0,5]]},
   '6':{shape:[[6,10],[0,10],[0,0],[6,0],[6,6],[1,6],[1,9],[6,9]],holes:[rect(1,1,5,5)]},
   '8':{shape:rect(0,0,6,10),holes:[rect(1,1,5,4),rect(1,6,5,9)]},
  };
  const scale=(points:number[][])=>points.map(([u,v])=>[(u! -3)*.0001,(v!-5)*.0001]);
  for(let value=0;value<=100;value+=20){const text=String(value);for(let j=0;j<text.length;j++){const digit=digits[text[j]!]!;p.push({kind:'extrude',at:[x-.001+(j-(text.length-1)/2)*.00072,bulb+.05+value*.0008,z+.00186],shape:scale(digit.shape),holes:digit.holes?.map(scale),depth:.00010,color:'token:ink-2'} as Primitive);}}
  replace(id,p);
  replace(marker,[lat([x,bulb+.004,z+.0014],[[0,0],[.00065,0],[.00065,.148],[0,.148]],'token:hot',undefined,32)]);
  delete get(marker).extra;
  const bind=sim.bind.find((q:P)=>q.part===marker);delete bind.offset;
  bind.fill={per:Math.PI*.00065**2*.0008,below:57.5,meniscus:.00015,ease:0};
  get(marker).name={en:get(id).name.en+' liquid column',zh:get(id).name.zh+'液柱'};
  get(marker).summary={en:'Its top marks the model temperature on the probe.',zh:'液柱顶端标示探头对应的模型温度。'};
  get(marker).detail={en:'The liquid column and card use the same temperature value before rounding. The column rises inside the stem to show that temperature, without calculating a liquid volume. [S27]',zh:'液柱和卡片使用同一个取整前的温度值。液柱在杆内升高来显示温度，不计算液柱体积。[S27]'};
 }
 // Hotplate with a ceramic deck, rolled casing seam, vent slots and recessed fascia.
 const heater=[b([.15,.765,.1],[.14,.028,.14],'enamel',.006),b([.15,.779,.1],[.139,.003,.139],'rubber',.001),rod([.15,.783,.1],.054,.007,'steel'),rod([.15,.787,.1],.052,.002,'enamel')];
 heater.push(b([.15,.766,.172],[.105,.019,.002],'powder',.001));
 for(const x of [.12,.18]){
  heater.push(rod([x,.766,.176],.0075,.006,'rubber',[90,0,0]),rod([x,.766,.180],.0065,.002,'steel',[90,0,0]),b([x,.770,.1815],[.001,.004,.0008],'token:ink',.0002));
  for(let k=0;k<3;k++){const a=(-120+k*120)*Math.PI/180;heater.push(b([x+Math.sin(a)*.010,.766+Math.cos(a)*.010,.174],[.001,.001,.0004],'token:bone',.0001));}
 }
 heater.push({kind:'sphere',at:[.15,.768,.174],size:[.0016],color:'token:signal'} as Primitive);
 for(const dx of [-.052,.052])for(const dz of [-.05,.05])heater.push(b([.15+dx,.752,.1+dz],[.016,.004,.017],'rubber',.0015));
 for(const side of [-1,1])for(let i=0;i<4;i++)heater.push(b([.15+side*.0703,.764,.065+i*.022],[.0007,.003,.006],'token:ink-2',.0003));
 heater.push(sweep([[.15,.759,.030],[.15,.754,.012],[.19,.752,-.013],[.245,.752,.005]],.0022,'rubber'));
 replace('heater',heater);
 replace('rod',[rod([.05,.807,-.22],.003,.1,'steel',[0,0,90])]);
 // Proper shallow saddles, pedestal feet and rolling/sliding contact with the 100 mm rod.
 for(const [id,x] of [['rod-support-left',.01],['rod-support-right',.09]] as const){
  const p:Primitive[]=[b([x,.754,-.22],[.027,.008,.038],'powder',.003),rod([x,.777,-.22],.004,.038,'steel')];
  p.push({kind:'extrude',at:[x,.798,-.22],shape:[[-.010,-.004],[.010,-.004],[.010,.010],[.006,.011],[.003,.0075],[0,.006],[-.003,.0075],[-.006,.011],[-.010,.010]],depth:.010,bevel:.0006,rotation:[0,90,0],color:'steel'} as Primitive);
  replace(id,p);
 }
 // Glass syringe: rolled lip, feet and etched graduations. Preserve piston movement.
 const gas=get('gas-cylinder');gas.primitive.segments=96;gas.extra=[];
 for(let i=0;i<12;i++)gas.extra.push(b([.657,.768+i*.009,-.212],[i%2?.006:.010,.00055,.0005],'token:ink-2',.00015));
 gas.extra.push(lat([.65,.889,-.24],[[.026,0],[.030,0],[.030,.002],[.026,.002],[.026,0]],'glass'),b([.65,.753,-.24],[.074,.006,.064],'powder',.003));
 const piston=get('gas-piston');piston.extra.push(lat([.65,.815,-.24],[[.024,-.003],[.026,-.003],[.026,-.001],[.024,-.001]],'rubber'));
 // Fixed reservoir reference is a physical labelled display, never a live sensor.
 const room=get('room-reference');room.extra.push(b([.75,.793,.108],[.035,.040,.002],'powder',.001));
 const digit=(n:number,cx:number)=>{
  const bars:Record<number,number[]>={2:[0,1,3,4,6],5:[0,2,3,5,6]};
  const coords:([number,number,number,number])[]=[[0,.010,.008,.0012],[.004,.005,.0012,.008],[-.004,.005,.0012,.008],[0,0,.008,.0012],[-.004,-.005,.0012,.008],[.004,-.005,.0012,.008],[0,-.010,.008,.0012]];
  for(const k of bars[n]!){const [x,y,w,h]=coords[k]!;room.extra.push(b([cx+x,.793+y,.1095],[w,h,.0006],'token:bone',.00015));}
 };
 digit(2,.743);digit(5,.756);
 room.extra.push(lat([.766,.807,.1095],[[.001,0],[.0017,0],[.0017,.0005],[.001,.0005],[.001,0]],'token:bone',[90,0,0],24));
 // Bench rim and leg levelling pads; keep its specified 1.8 × .7 m envelope.
 const bench=get('bench');bench.primitive.color='powder';
 for(const x of [-.78,.78])for(const z of [-.25,.25])bench.extra.push(b([x,.008,z],[.052,.016,.052],'rubber',.004));
 // Round all legacy turned forms to the close-up standard.
 for(const part of parts)for(const p of [part.primitive,...part.extra??[]])if(p?.kind==='lathe')p.segments=Math.max(p.segments??48,64);
 if(iteration>=2){
  // Iteration 2: retain a narrow stem and reduce oversized adjusting heads.
  get('probe-clamp').detail={en:'The horizontal arm joins the stand with a screw clamp. Padded jaws hold the thermometer stem, so the probe stays above the cup bottom. [S27]',zh:'横臂用螺钉夹连接铁架台。带衬垫的夹爪夹住温度计杆，感温端与杯底留有间隔。[S27]'};
  for(const id of ['heater-probe-support','cooler-probe-support'])get(id).detail={en:'The base rests on the bench beside the cup. A screw clamp joins the upright and arm, and padded jaws hold the probe stem above the open mouth. [S27]',zh:'底座放在烧杯旁的台面上。螺钉夹连接立杆与横臂，带衬垫的夹爪在杯口上方夹住探头杆。[S27]'};
 }
}
