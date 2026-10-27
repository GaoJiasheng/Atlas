/** Reproducible DESIGN fixture for docs/52 §3.3 and §4. No runtime generation. */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const bi = (en, zh) => ({ en, zh });
const write = (name, value) => writeFileSync(root + name, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
const tau = 2 * Math.PI, deg = 180 / Math.PI;
const geometry = { beamPivot:[0,0], shaftCentre:[2.5,-3], radiusPivot:[-2.5,-.8], beamHalfM:2.5, connectingRodM:3, orbitM:.6092838281609874, shortLinkM:.8, radiusRodM:1.25, innerFraction:.5, beamBranch:1, parallelBranch:1, pistonRodM:2.4, cylinderX:-2.5, radialDisplayClearanceM:.003, nominalStrokeM:1.2192, pump:{beamFraction:-.4,sliderX:-1,rodM:4.5} };
function circle(c0,r0,c1,r1,branch=1) {
 const dx=c1[0]-c0[0],dy=c1[1]-c0[1],d=Math.hypot(dx,dy),a=(r0*r0-r1*r1+d*d)/(2*d),h=Math.sqrt(r0*r0-a*a);
 return [c0[0]+a*dx/d-branch*h*dy/d,c0[1]+a*dy/d+branch*h*dx/d];
}
function points(theta) {
 const g=geometry,A=g.beamPivot,O=g.shaftCentre,F=g.radiusPivot;
 const P=[O[0]+g.orbitM*Math.cos(theta),O[1]+g.orbitM*Math.sin(theta)],K=circle(A,2.5,P,3),v=[K[0]-A[0],K[1]-A[1]],C=[A[0]-v[0]/2,A[1]-v[1]/2],B=[A[0]-v[0],A[1]-v[1]],E=circle(C,.8,F,1.25),D=[B[0]+E[0]-C[0],B[1]+E[1]-C[1]],S=[D[0],D[1]-2.4],Q=[-.4*v[0],-.4*v[1]],W=[-1,Q[1]-Math.sqrt(4.5**2-(Q[0]+1)**2)];
 return {A,O,F,P,K,C,B,E,D,S,Q,W};
}
const origin=[0,5.6,0], rest=points(0), world=(p,z=0)=>[p[0],p[1]+5.6,z];
const parts=[];
function part(id,en,zh,group,primitive,extra) {
 const p={id,name:bi(en,zh),group,summary:bi(`${en}: a component of this mechanism test fixture.`,`${zh}：机构引擎测试组件。`),detail:bi('Schematic DESIGN geometry for the shared-frame mechanism engine. [S1]','共用机构帧的示意设计几何。[S1]'),primitive,explode:{dir:[0,0,1],dist:.35}};
 if(extra?.length)p.extra=extra;parts.push(p);return p;
}
function rod(a,b,z=.1,width=.045,color='steel') { return {kind:'box',size:[Math.hypot(b[0]-a[0],b[1]-a[1]),width,.07],at:[(a[0]+b[0])/2,(a[1]+b[1])/2,z],rotation:[0,0,Math.atan2(b[1]-a[1],b[0]-a[0])*deg],color}; }
const endpoints={beam:['A','K'],innerLink:['C','E'],outerLink:['B','D'],bottomLink:['E','D'],radiusRod:['F','E'],driveRod:['K','P'],centreLink:['O','P'],pistonRod:['S','D'],pumpRod:['Q','W']};
const ids={beam:'beam',innerLink:'parallel-inner',outerLink:'parallel-outer',bottomLink:'parallel-bottom',radiusRod:'radius-rod',driveRod:'drive-rod',centreLink:'centre-link',piston:'piston',pistonRod:'piston-rod',planet:'planet',sun:'sun',shaft:'shaft',flywheel:'flywheel',pumpRod:'pump-rod',pumpPiston:'pump-piston'};
const names={beam:['Beam','横梁'],innerLink:['Inner link','内连杆'],outerLink:['Outer link','外连杆'],bottomLink:['Bottom link','下连杆'],radiusRod:['Radius rod','摇杆'],driveRod:['Connecting rod','传动杆'],centreLink:['Centre link','定距连杆'],piston:['Piston','活塞'],pistonRod:['Piston rod','活塞杆'],planet:['Planet','行星轮'],sun:['Sun','太阳轮'],shaft:['Shaft','输出轴'],flywheel:['Flywheel','飞轮'],pumpRod:['Pump rod','泵杆'],pumpPiston:['Pump piston','泵活塞']};
const roles={};
for(const [role,id] of Object.entries(ids)) {
 roles[role]={part:id};
 if(endpoints[role]) {
  const [a,b]=endpoints[role].map(k=>rest[k]);roles[role].restEndpoints=[a,b];
  const z=role==='radiusRod'?-.14:role==='centreLink'?-.28:role==='driveRod'?-.12:role==='beam'?0:.12;
  const prim=role==='beam'?rod(world(rest.B),world(rest.K),z,.12,'wood'):rod(world(a),world(b),z,role==='pistonRod'?.04:.045);
  part(id,...names[role],'working-motion',prim);
 }
}
part('piston',...names.piston,'working-motion',{kind:'cylinder',size:[.235125,.235125,.05],at:world(rest.S,.12),color:'brass'});
part('pump-piston',...names.pumpPiston,'working-motion',{kind:'cylinder',size:[.13,.13,.045],at:world(rest.W,.12),color:'brass'});
part('shaft',...names.shaft,'working-motion',{kind:'cylinder',size:[.06,.06,.85],at:world(rest.O,-.32),rotation:[90,0,0],color:'steel'});
part('flywheel',...names.flywheel,'working-motion',{kind:'torus',size:[2.37,.0684],at:world(rest.O,-.65),color:'steel'},Array.from({length:6},(_,i)=>({kind:'box',size:[4.65,.065,.065],at:world(rest.O,-.65),rotation:[0,0,i*30],color:'steel'})));
// Involute gears: 48 teeth, m=orbit/48, pressure angle20°, total backlash0.3mm.
// Each flank has exact involute samples; sampled radial blends round the root.
const zTeeth=48,rp=geometry.orbitM/2,module=geometry.orbitM/zTeeth,rb=rp*Math.cos(20/deg),ra=rp+module,rf=rp-1.25*module,pitch=tau/zTeeth;
const inv=r=>{const a=Math.acos(rb/r);return Math.tan(a)-a;},half=Math.PI/(2*zTeeth)-.0003/(4*rp),invP=inv(rp);
function tooth(c) {
 const polar=(r,a)=>[r*Math.cos(a+c),r*Math.sin(a+c)],base=half+invP,mid=(rb+ra)/2,tip=half+invP-inv(ra);
 return [polar(rf,-pitch/2),polar(rf,-base-.005),polar((rf+rb)/2,-base-.0015),polar(rb,-base),polar(mid,-half-invP+inv(mid)),polar(ra,-tip),polar(ra,0),polar(ra,tip),polar(mid,half+invP-inv(mid)),polar(rb,base),polar((rf+rb)/2,base+.0015),polar(rf,base+.005)];
}
function gearSectors(at,phase) {return Array.from({length:4},(_,q)=>({kind:'extrude',shape:[[0,0],...Array.from({length:12},(_,i)=>tooth((q*12+i+.5)*pitch)).flat(),[rf*Math.cos((q+1)*Math.PI/2),rf*Math.sin((q+1)*Math.PI/2)]],depth:.08,at,rotation:[0,0,phase*deg],color:'brass'}));}
// Sun has a gap along +X; planet faces it with a tooth, total constant offset half a tooth.
const sun=gearSectors(world(rest.O,.03),0),planet=gearSectors(world(rest.P,.03),pitch/2);
part('sun',...names.sun,'working-motion',sun[0],sun.slice(1));part('planet',...names.planet,'working-motion',planet[0],planet.slice(1));
// Verify actual polygon vertices and segment midpoints over a complete relative tooth cycle.
const full=Array.from({length:48},(_,i)=>tooth((i+.5)*pitch)).flat();
function inside(p,poly) {let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
const rotate=(p,a,x=0)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a)+x,p[0]*Math.sin(a)+p[1]*Math.cos(a)];
let samples=0;
for(let s=0;s<256;s++) {
 const a=pitch*s/256,b=pitch/2-a,one=full.map(p=>rotate(p,a)),two=full.map(p=>rotate(p,b,geometry.orbitM));
 for(const [poly,other] of [[one,two],[two,one]]) for(let i=0;i<poly.length;i++) {
  const p=poly[i],n=poly[(i+1)%poly.length];
  for(const t of [0,.25,.5,.75]) {const q=[p[0]+(n[0]-p[0])*t,p[1]+(n[1]-p[1])*t];if(Math.abs(q[0]-rp)>.04)continue;samples++;if(inside(q,other))throw Error(`Gear overlap at tooth-cycle sample ${s}, segment ${i}`);}
 }
}
part('cylinder','Cylinder','汽缸','working-motion',{kind:'lathe',profile:[[.238125,-.76],[.26,-.76],[.26,.76],[.238125,.76],[.238125,-.76]],arc:180,at:[-2.5,2.4,.12],color:'steel'}).shell=true;
part('engine-frame','Support frame','支架','working-motion',{kind:'box',size:[.16,5.6,.16],at:[0,2.8,-.75],color:'wood'}).context=true;
const ports={};
for(const [role,id,y,x,flow,path] of [['upperIn','valve-upper-in',3.1,-3.1,'port-steam','upper'],['lowerIn','valve-lower-in',1.7,-3.1,'port-steam','lower'],['upperOut','valve-upper-out',3.1,-2,'exhaust-steam','upper'],['lowerOut','valve-lower-out',1.7,-2,'exhaust-steam','lower']]) {
 part(id,{upperIn:'Upper inlet',lowerIn:'Lower inlet',upperOut:'Upper exhaust',lowerOut:'Lower exhaust'}[role],{upperIn:'上进汽阀',lowerIn:'下进汽阀',upperOut:'上排汽阀',lowerOut:'下排汽阀'}[role],'working-motion',{kind:'cylinder',size:[.065,.065,.045],at:[x,y,.65],color:'brass'});
 ports[role]={part:id,openOffset:[0,.015,0],flow:{id:flow,path}};
}
const govIds=['governor-balls','governor-ball-right','governor-upper','governor-upper-right','governor-lower','governor-lower-right','governor-collar','throttle-link','throttle-rod','throttle-crank','throttle-disc'];
function governor(n) {
 const c=9.81/(.5*(tau*n/60)**2),r=.5*Math.sqrt(1-c*c),h=1-c,J=[0,h],T=[1,0],M=circle(T,.4,J,1.1),psi=Math.atan2(M[1],M[0]-1),u=.5+(psi+2.814149273102258)/(Math.PI/2),a=[0,1],left=[-r,1-.5*c],right=[r,1-.5*c];
 return {c,r,h,J,T,M,psi,u,a,left,right};
}
const govWorld=p=>[p[0]+1,p[1]+2,.9],g90=governor(90);
const govParts={};
const govRod=(a,b)=>rod(govWorld(a),govWorld(b),.9,.025);
for(const [id,en,zh,p] of [
 ['governor-balls','Left ball','左飞球',{kind:'sphere',size:[.075],at:govWorld(g90.left),color:'brass'}],
 ['governor-ball-right','Right ball','右飞球',{kind:'sphere',size:[.075],at:govWorld(g90.right),color:'brass'}],
 ['governor-upper','Left upper arm','左上杆',govRod(g90.a,g90.left)],['governor-upper-right','Right upper arm','右上杆',govRod(g90.a,g90.right)],
 ['governor-lower','Left lower link','左下杆',govRod(g90.left,g90.J)],['governor-lower-right','Right lower link','右下杆',govRod(g90.right,g90.J)],
 ['governor-collar','Collar','滑套',{kind:'torus',size:[.065,.022],at:govWorld(g90.J),rotation:[90,0,0],color:'brass'}],
 ['throttle-link','Collar fork','滑套叉环',{kind:'torus',size:[.1,.012],at:govWorld(g90.J),rotation:[90,0,0],color:'steel'}],
 ['throttle-rod','Throttle rod','节流连杆',govRod(g90.J,g90.M)],['throttle-crank','Throttle crank','节流曲柄',govRod(g90.T,g90.M)],
 ['throttle-disc','Throttle disc','节流阀片',{kind:'cylinder',size:[.13,.13,.015],at:govWorld(g90.T),rotation:[90,0,45],color:'brass'}]]) {govParts[id]=p;part(id,en,zh,'regulation',p);}
part('governor-spindle','Spindle','调速器轴','regulation',{kind:'cylinder',size:[.02,.02,1.15],at:[1,2.5,.9],color:'steel'});
const poses={};
for(const [n,name] of [[60,'gov-slow'],[90,'gov-middle'],[120,'gov-fast']]) {
 const g=governor(n),pose={duration:0};
 const rodEnds={'governor-upper':[g.a,g.left],'governor-upper-right':[g.a,g.right],'governor-lower':[g.left,g.J],'governor-lower-right':[g.right,g.J],'throttle-rod':[g.J,g.M],'throttle-crank':[g.T,g.M]};
 for(const [id,p] of Object.entries(govParts)) {
  let target,rot=0;
  if(rodEnds[id]) {const [a,b]=rodEnds[id];target=govWorld([(a[0]+b[0])/2,(a[1]+b[1])/2]);rot=Math.atan2(b[1]-a[1],b[0]-a[0])*deg-p.rotation[2];}
  else target=govWorld(id==='governor-balls'?g.left:id==='governor-ball-right'?g.right:id==='throttle-disc'?g.T:g.J);
  if(id==='throttle-disc')rot=90*g.u-45;
  pose[id]={pivot:p.at,offset:target.map((v,i)=>v-p.at[i]),rotation:[0,0,rot]};
 }
 poses[name]=pose;
}
for(const [id,en,zh,count,x,y,color] of [['energy-input','Heat input','输入热量',100,-10,2.8,'token:hot'],['energy-work','Useful work','输出功',30,-10,1.6,'token:signal'],['energy-reject','Rejected heat','排出热量',90,-10,.4,'token:cold']]) {
 const p=part(id,en,zh,'teaching',{kind:'box',size:[.035,.35,.12],at:[x,y,0],color});p.repeat={count,axis:[1,0,0],spacing:.046};delete p.explode;
}
const choices=(id,en,zh,values,defaultValue)=>({id,kind:'choice',label:bi(en,zh),options:values.map(([id,en,zh])=>({id,label:bi(en,zh)})),default:defaultValue});
const step=(id,en,zh,values,d)=>({id,kind:'step',label:bi(en,zh),values,default:d});
const controls=[choices('experiment','Study','研究',[['pressure','Pressure','压强'],['mechanism','Mechanism','机构'],['governor','Governor','调速器'],['energy','Energy account','能量账本']],'mechanism'),step('cold-pressure','Cold pressure · kPa abs','冷端压强 · 千帕绝压',[20,50,80],20),step('cycle-rate','Cycles per minute','每分钟周期数',[8,10,12],10),step('governor-rpm','Steady governor rpm','调速器静态转速',[60,90,120],90),step('work-share','Work per hundred units','每百份中的功',[10,20,30],20),choices('motion-mode','Motion','运动',[['manual','Manual','手动'],['auto','Auto','自动']],'manual'),step('phase-deg','Orbit phase · degrees','轨道相位 · 度',[0,90,180,270,360],0)];
const output=(id,en,zh,unit='',decimals=3)=>({id,kind:'number',tag:'sim',label:bi(en,zh),unit,decimals});
const outputs=[output('hot-abs','Hot pressure','热端压强','kPa abs'),output('cold-abs','Cold pressure','冷端压强','kPa abs'),output('force-down','Downward force','向下合力','kN'),output('force-up','Upward force','向上合力','kN'),output('newcomen-force','Open cylinder force','开口缸合力','kN'),output('work-cycle','Indicated work per cycle','每周期指示功','kJ'),output('indicated-power','Model indicated power','模型指示功率','kW'),output('governor-speed','Steady speed','静态转速','rpm'),output('ball-angle','Upper arm angle','上杆夹角','deg'),output('ball-radius','Ball radius','球半径','m'),output('collar-rise','Collar rise','滑套升程','m'),output('throttle-opening','Throttle opening','节流开度','%',1),{id:'governor-pose',kind:'state',label:bi('Governor position','调速器姿态'),states:{'gov-slow':bi('Slow','低速'),'gov-middle':bi('Middle','中速'),'gov-fast':bi('Fast','高速')}},output('heat-in','Heat input','输入热量','units',0),output('useful-work','Useful work','输出功','units',0),output('heat-out','Rejected heat','排出热量','units',0)];
const row=(when,set)=>({when,set,source:['S1']});
const A=Math.PI*.47625**2/4,Ar=Math.PI*.04**2/4;
const pressureRows=[];for(const cold of [20,50,80])for(const rate of [8,10,12]) {const fd=110*(A-Ar)+101.325*Ar-cold*A,fu=110*A-cold*(A-Ar)-101.325*Ar,w=(fd+fu)*1.2192;pressureRows.push(row({'cold-pressure':cold,'cycle-rate':rate},{'hot-abs':110,'cold-abs':cold,'force-down':fd,'force-up':fu,'newcomen-force':(101.325-cold)*A,'work-cycle':w,'indicated-power':w*rate/60}));}
const governorRows=[60,90,120].map((n,i)=>{const g=governor(n);return row({'governor-rpm':n},{'governor-speed':n,'ball-angle':Math.acos(g.c)*deg,'ball-radius':g.r,'collar-rise':g.h,'throttle-opening':100*g.u,'governor-pose':['gov-slow','gov-middle','gov-fast'][i]});});
const energyRows=[10,20,30].map(w=>row({'work-share':w},{'heat-in':100,'useful-work':w,'heat-out':100-w}));
const camera={position:[10,8.5,17],target:[-.4,2.8,0],fov:30};
const flows=[{id:'port-steam',paths:[{id:'upper',path:[[-3.1,3.1,.65],[-2.5,3.1,.65]]},{id:'lower',path:[[-3.1,1.7,.65],[-2.5,1.7,.65]]}],color:'token:hot'},{id:'exhaust-steam',paths:[{id:'upper',path:[[-2,3.1,.65],[-1.5,3.1,.65],[-1.5,.5,.65]]},{id:'lower',path:[[-2,1.7,.65],[-1.7,1.7,.65],[-1.7,.5,.65]]}],color:'token:cold'}].map(f=>({...f,group:'steam-flow',speed:.12,count:120,size:.6,spread:.004,clip:false,whenRun:true,flat:true,ends:'fade'}));
const data={parts,groups:[{id:'working-motion',name:bi('Working mechanism','工作机构'),color:'token:signal'},{id:'regulation',name:bi('Static governor','静态调速器'),color:'token:ink-2'},{id:'teaching',name:bi('Energy account','能量账本'),color:'token:ink-2',card:false},{id:'steam-flow',name:bi('Steam routes','蒸汽路径'),color:'token:hot'}],flows,animations:[],views:{assembled:{camera},exploded:{camera},section:{plane:'xy'},cover:camera,reference:{camera}},presets:[{id:'linkage-view',label:bi('LINKS','连杆'),camera:{position:[-1,7,6],target:[-1.3,4.8,0],fov:30}},{id:'gear-view',label:bi('GEARS','齿轮'),camera:{position:[4.5,3.5,3.5],target:[2.7,2.6,0],fov:30}},{id:'governor-view',label:bi('GOVERNOR','调速器'),camera:{position:[3.8,3.8,6],target:[1.4,2.6,.9],fov:30}},{id:'energy-view',label:bi('ACCOUNT','账本'),camera:{position:[-7.5,4.4,9],target:[-10,1.8,0],fov:30}}],poses,mechanisms:[{id:'main-engine',kind:'beam-steam',origin,clock:{phaseControl:'phase-deg',rateControl:'cycle-rate',modeControl:'motion-mode',experimentControl:'experiment'},geometry,parts:roles,ports}],telemetry:[{key:bi('Force down / up','向下 / 向上合力'),unit:'kN',follow:['force-down','force-up'],scope:'observe'},{key:bi('Indicated work','指示功'),unit:'kJ',follow:'work-cycle',scope:'observe'},{key:bi('Collar rise','滑套升程'),unit:'m',follow:'collar-rise',scope:'observe'},{key:bi('Throttle','节流开度'),unit:'%',follow:'throttle-opening',scope:'observe'},{key:bi('Work share','输出功'),unit:'units',follow:'useful-work',scope:'observe'},{key:bi('Rejected heat','排出热量'),unit:'units',follow:'heat-out',scope:'observe'}],sim:{kind:'table',controls,outputs,bind:[{output:'governor-pose',part:govIds,pose:{'gov-slow':'gov-slow','gov-middle':'gov-middle','gov-fast':'gov-fast'}},{output:'heat-in',part:'energy-input',count:true},{output:'useful-work',part:'energy-work',count:true},{output:'heat-out',part:'energy-reject',count:true}],table:{experiments:{'pressure-table':{keys:['cold-pressure','cycle-rate'],rows:pressureRows},'governor-table':{keys:['governor-rpm'],rows:governorRows},'energy-table':{keys:['work-share'],rows:energyRows}}}}};
write('data/parts.json',data);
write('topic.yaml',`id: sample-mechanism\ntitle: { en: "Sample: Shared mechanism", zh: "示例：共用机构" }\nsubtitle: { en: "Draft fixture for a rigid beam mechanism", zh: "刚性横梁机构的草稿测试" }\nsubject: science\nlevels: [P5]\nmoe: []\nmode: space\nengine: space-scene\nstage: model3d\ntheme: paper\nsensitivity: open\nstatus: draft\nnote: { en: "Engine fixture · reconstructed links and enlarged clearances · model pressures, static governor positions and energy shares", zh: "引擎测试 · 连杆重建、间隙放大 · 压力、调速器静态位置和能量份数均为模型值" }\n`);
write('data/sources.json',{sources:[{id:'S1',text:bi('Atlas mechanism design study: docs/52 §3.3–4; see data/SOURCES.md for all dimensions, equations and gear sampling.','Atlas 机构设计研究：docs/52 第3.3–4节；尺寸、算式和齿轮采样见 data/SOURCES.md。'),design:true}]});
write('data/glossary.json',{terms:[]});
write('data/SOURCES.md',`# Sample mechanism design study (S1)\n\nDraft engine fixture; no historical reconstruction or measured performance claim. All dimensions and tables are DESIGN / SIM from docs/52 §3.3–4. Original fixture files use the repository content license.\n\nPressure: D=0.47625m, d=0.04m, stroke=1.2192m, A=πD²/4, Ar=πd²/4, atmosphere=101.325kPa abs, hot=110kPa abs. F(top,bottom)=1000(top(A-Ar)+101.325Ar-bottom A) N; downward F(110,cold), upward -F(cold,110); W=(Fd+Fu)stroke/1000 kJ; Pi=W rate/60 kW. Comparison force=(101.325-cold)A kN has no rod-area term. Cold20/50/80 × rate8/10/12 gives nine complete rows.\n\nGovernor: L=0.5m, g=9.81m/s², ω=2πn/60, c=g/(Lω²), r=L√(1-c²), angle=acos(c), h=2L(1-c), J=(0,h), T=(1,0), M=circle(T,0.4,J,1.1,+1), ψ=atan2(My,Mx-1), ψ90=-2.814149273102258; u=0.5+(ψ-ψ90)/(π/2). Pose duration is zero; every upper/lower arm remains0.5m, JM1.1m, TM0.4m. Governor world origin [1,2,0.9]. No dynamic governor or engine-speed coupling.\n\nEnergy boundary is working-fluid heat input100 normalized units, useful work10/20/30 and rejection90/80/70, never measured Lap efficiency. One solid slice represents one normalized unit.\n\nGeometry is exactly docs/52 §4.2, exported alongside this file in parts.json. Nine rod roles have θ0 local restEndpoints. World origin [0,5.6,0]. Distinct depths separate crossing radius/parallel rods, drive rod, gears, and rear flywheel. Piston display radial clearance0.003m. Valve travel0.015m and flow speed0.12m/s are display design.\n\nGears use48 identical involute teeth per wheel, module orbit/48, pitch radius orbit/2, pressure angle20°, addendum=module, dedendum=1.25 × module, total tangential backlash0.0003m divided equally. Each wheel is four90° sectors of12 teeth; each sector has146 outline points; each wheel uses one primitive and3 extra sectors. Exact involute flank samples and a rounded radial root blend are emitted by generate.mjs. Initial phases differ by half a tooth for tooth-to-gap engagement. Offline audit sampled256 relative phases over a full tooth period (which repeats48 times over a turn), both polygon boundaries at vertices and quarter-segment samples near contact: ${samples} point-in-polygon checks, no overlap. This is a discrete polygon audit, not a manufacturing tolerance claim.\n`);
const allMain=parts.filter(p=>p.group==='working-motion'&&!p.context).map(p=>p.id),allGov=parts.filter(p=>p.group==='regulation').map(p=>p.id),energy=['energy-input','energy-work','energy-reject'];
const predict=(control,from,to,observe,en,zh)=>({prompt:bi(en,zh),start:{[control]:from},change:{[control]:to},observe,options:[['more','More','变大'],['less','Less','变小'],['same','The same','不变']].map(([id,en,zh])=>({id,label:bi(en,zh),means:id}))});
function chapter(filename,id,order,title,zh,state) {
 // JSON is valid YAML frontmatter, preserving complete bilingual shapes exactly.
 if (state.try) {state.sim.try={...state.try,vary:state.try.vary[0],keep:[state.try.keep]};delete state.try;}
 const meta={id,order,...(order===0?{kind:'background'}:{}),title:bi(title,zh),state};
 write(`chapters/${filename}.mdx`,'---\n'+JSON.stringify(meta,null,2)+'\n---\n\n<Lang en>\n\nDraft engine fixture: this chapter checks the model state shown in the caption. Every numerical outcome comes from the design study [S1].\n\n</Lang>\n\n<Lang zh>\n\n引擎草稿测试：本章核对字幕对应的模型状态。所有数值结果来自设计研究 [S1]。\n\n</Lang>\n');
}
const base={view:'assembled',explode:0,run:false,part:null,layers:['working-motion','steam-flow'],labels:['beam','piston','sun','planet'],camera,summary:bi('A single mechanism frame keeps the rods, gears and valve routes together.','同一份机构帧同步连杆、齿轮和配汽路径。'),sim:{set:{experiment:'mechanism','motion-mode':'manual','phase-deg':0}},index:{parts:allMain}};
chapter('00-before-you-start','before-you-start',0,'Shared mechanism fixture','共用机构测试',{...base,beats:[{caption:bi('A schematic engine fixture with one shared phase.','一套使用同一相位的机构示意测试。')},{camera:'linkage-view',labels:['parallel-inner','parallel-outer','parallel-bottom','radius-rod'],caption:bi('The crossing rods occupy separate depths. Their crossing is not a joint.','交叉杆处在不同深度；交叉处不是铰链。')}]});
chapter('01-pressure','pressure',1,'Pressure table','压强数表',{...base,sim:{set:{experiment:'pressure','motion-mode':'manual','phase-deg':0}},try:{vary:['cold-pressure'],keep:bi('Same piston and hot-side pressure','相同活塞与热端压强'),observe:['force-down'],record:true,predict:predict('cold-pressure',20,50,'force-down','How will the downward force change in this model?','模型中的向下合力会怎样变化？')},beats:[{caption:bi('The pressure table evaluates both piston faces and the exposed rod area.','压强数表同时处理活塞两面和外露杆面积。')},{sim:{set:{'cold-pressure':50}},caption:bi('Higher cold-side pressure reduces the downward net force.','冷端压强升高，向下合力减小。')}]});
chapter('02-power-both-ways','power-both-ways',2,'Both working directions','两个工作方向',{...base,run:true,try:{vary:['cold-pressure'],keep:bi('Same bore, rod and hot-side pressure','相同内径、杆径和热端压强'),observe:['force-down','force-up','work-cycle'],record:true,predict:predict('cold-pressure',20,50,'work-cycle','How will the indicated work per cycle change?','每周期指示功会怎样变化？')},beats:[{sim:{set:{'phase-deg':0}},caption:bi('The downward stroke opens the upper inlet and lower exhaust.','向下行程开启上进汽阀和下排汽阀。')},{sim:{set:{'phase-deg':90}},caption:bi('At ninety degrees the same geometry determines both valves and rods.','九十度时，同一份几何解同时决定阀口和连杆。')},{sim:{set:{'phase-deg':180}},caption:bi('The upward stroke opens the lower inlet and upper exhaust.','向上行程开启下进汽阀和上排汽阀。')},{sim:{set:{'phase-deg':270}},camera:'gear-view',labels:['planet','sun','centre-link'],caption:bi('The planet stays fixed to its connecting rod; the centre link keeps the gear spacing.','行星轮固定在传动杆上；定距连杆保持齿轮中心距。')},{sim:{set:{'motion-mode':'auto','phase-deg':0}},caption:bi('A complete cycle gives two net sun turns, using one continuously solved mechanism.','连续解算的同一机构每完成一个周期，太阳轮净转两圈。')}]});
chapter('03-speed-feedback','speed-feedback',3,'Static governor','静态调速器',{...base,layers:['regulation'],camera:{position:[3.8,3.8,6],target:[1.4,2.6,.9],fov:30},labels:['governor-balls','governor-ball-right','governor-collar','throttle-disc'],index:{parts:allGov},sim:{set:{experiment:'governor','motion-mode':'manual','phase-deg':0,'governor-rpm':60}},try:{vary:['governor-rpm'],keep:bi('Same link lengths, balls and gravity','相同杆长、球和重力'),observe:['collar-rise','throttle-opening'],record:true,predict:predict('governor-rpm',60,120,'throttle-opening','How will the model throttle opening change?','模型的节流阀开度会怎样变化？')},beats:[60,90,120,60].map(n=>({sim:{set:{'governor-rpm':n}},caption:bi('Compare a complete static governor position. All rods keep their lengths.','比较完整的调速器静态姿态；所有刚杆均保持长度。')}))});
chapter('04-follow-the-energy','follow-the-energy',4,'Energy account','能量账本',{...base,layers:['teaching'],camera:{position:[-7.5,4.4,9],target:[-10,1.8,0],fov:30},labels:energy,index:{parts:energy},sim:{set:{experiment:'energy','work-share':20,'motion-mode':'manual','phase-deg':0}},try:{vary:['work-share'],keep:bi('One hundred heat-input units','一百份输入热量'),observe:['useful-work','heat-out'],record:true,predict:predict('work-share',20,30,'heat-out','How will the rejected heat share change?','排出热量的份数会怎样变化？')},beats:[10,20,30].map(w=>({sim:{set:{'work-share':w}},caption:bi('The two output rows together equal the separate input row. These are normalized model shares.','两排输出合计等于独立的一排输入；这里比较归一化模型份数。')}))});
console.log(`Generated ${parts.length} parts, 15 table rows, 3 rigid governor poses, 48-tooth gears; ${samples} polygon samples clear.`);
