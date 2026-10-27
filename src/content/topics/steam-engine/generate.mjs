/** Steam-engine production data, built on sample-mechanism. DESIGN / SIM: docs/52.
 * Run node src/content/topics/steam-engine/generate.mjs. Writes parts.json only. */
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
 const p={id,name:bi(en,zh),group,primitive,explode:{dir:[0,0,1],dist:.35}};
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

// Production layers and functional components. All layout dimensions are DESIGN.
const get=id=>parts.find(p=>p.id===id);
const box=(size,at,color='wood')=>({kind:'bevelBox',size,bevel:.018,at,color});
const tube=(path,radius=.05,color='stainless')=>({kind:'tube',path,radius,at:[0,0,0],color});
const shell=(r,l,at,color='steel',arc)=>({kind:'lathe',profile:[[r,-l/2],[r+.025,-l/2],[r+.025,l/2],[r,l/2],[r,-l/2]],at,color,...(arc?{arc}:{})});
const disc=(r,h,at,color='steel')=>({kind:'cylinder',size:[r,r,h],at,color});
function add(id,en,zh,group,primitive,extra){return part(id,en,zh,group,primitive,extra);}
for(const id of ['valve-upper-in','valve-lower-in','valve-upper-out','valve-lower-out','throttle-disc'])get(id).group='steam-supply';
for(const id of ['pump-rod','pump-piston'])get(id).group='condensing';
// Complete cylinder, through-rod top gland, sealed bottom and port necks.
get('cylinder').primitive=shell(.238125,1.52,[-2.5,2.46,.12]);
get('cylinder').extra=[{kind:'panelHole',size:[.55,.55,.045],hole:{r:.025,at:[0,0]},at:[-2.5,3.2425,.12],rotation:[90,0,0],color:'steel'},disc(.275,.045,[-2.5,1.6775,.12])];
// A schematic belt and right-angle take-off retain the drive connection.
// It is static in this study; no pulley ratio drives governor-rpm.
get('shaft').primitive.size=[.06,.06,2.0];
get('shaft').primitive.at=[2.5,2.6,0];
get('governor-spindle').extra=[{kind:'torus',size:[.12,.012],at:[2.5,2.6,.8],color:'steel'},{kind:'torus',size:[.10,.012],at:[1,2,.8],color:'steel'},tube([[2.5,2.48,.8],[1,1.9,.8],[.9,2,.8],[1,2.1,.8],[2.5,2.72,.8],[2.62,2.6,.8],[2.5,2.48,.8]],.008,'rubber'),{kind:'cone',size:[.08,.08],at:[1,2.03,.9],color:'brass'},{kind:'cone',size:[.08,.08],at:[1,2,.86],rotation:[90,0,0],color:'brass'}];
// A shaped beam with end bosses: every extra shares the existing rigid driver.
get('beam').primitive={kind:'extrude',shape:[[-2.5,-.07],[-2.2,-.12],[0,-.17],[2.2,-.12],[2.5,-.07],[2.5,.07],[2.2,.12],[0,.17],[-2.2,.12],[-2.5,.07]],depth:.22,at:[0,5.6,0],rotation:[0,0,Math.atan2(rest.K[1],rest.K[0])*deg],color:'wood'};
get('beam').extra=[disc(.17,.30,[0,5.6,0],'brass')];
get('beam').extra[0].rotation=[90,0,0];
// Six diametric bars in fixture become six radial spokes, deliberately RECON.
get('flywheel').extra=Array.from({length:6},(_,i)=>{const a=i*tau/6;return {kind:'box',size:[2.31,.075,.075],at:[2.5+1.155*Math.cos(a),2.6+1.155*Math.sin(a),-.65],rotation:[0,0,i*60],color:'steel'};});
get('flywheel').extra.push({kind:'cylinder',size:[.15,.15,.25],at:[2.5,2.6,-.65],rotation:[90,0,0],color:'steel'});
add('boiler','Boiler','锅炉','steam-supply',shell(.6,2.2,[-5,1.4,-.4],'steel'),[disc(.625,.055,[-5,.3,-.4]),disc(.625,.055,[-5,2.5,-.4])]).shell=true;
// Boiler is horizontal along X; all three meshes have the same orientation.
for(const p of [get('boiler').primitive,...get('boiler').extra]){p.rotation=[0,0,90];}
get('boiler').extra=[{...disc(.625,.055,[-6.1275,1.4,-.4]),rotation:[0,0,90]},{...disc(.625,.055,[-3.8725,1.4,-.4]),rotation:[0,0,90]}];
add('boiler-water','Boiler water','锅炉水','steam-supply',{kind:'lathe',profile:[[0,-1.08],[.575,-1.08],[.575,1.08],[0,1.08]],arc:180,at:[-5,1.4,-.4],rotation:[0,0,90],color:'token:cold'});
add('furnace','Furnace','炉膛','steam-supply',{kind:'extrude',shape:[[-1.2,-.35],[1.2,-.35],[1.2,.28],[.85,.42],[-.85,.42],[-1.2,.28]],depth:1.3,at:[-5,.42,-.4],color:'ceramic'},[{kind:'box',size:[.75,.29,.025],at:[-5,.35,.265],color:'powder'}]);
const livePath=[[-5,2,-.4],[-5,3.6,-.4],[2,3.6,-.4],[2,2.4,-.4],[2,2.4,.9],[2,2.1,.9]];
const afterThrottle=[[2,1.9,.9],[2,1.35,.9],[-3.1,1.35,.9],[-3.1,2.4,.65]];
add('steam-main','Steam main','供汽管','steam-supply',tube(livePath),[tube(afterThrottle)]).shell=true;
add('throttle','Throttle body','节流阀体','steam-supply',shell(.145,.20,[2,2,.9],'brass')).shell=true;
const upperIn=[[-3.1,3.1,.65],[-2.5,3.1,.65],[-2.5,3.1,.12]],lowerIn=[[-3.1,1.7,.65],[-2.5,1.7,.65],[-2.5,1.7,.12]];
const upperOut=[[-2.5,3.1,.12],[-2.5,3.1,.65],[-2,3.1,.65],[-1.65,3.1,.65],[-1.65,.55,.65]],lowerOut=[[-2.5,1.7,.12],[-2.5,1.7,.65],[-2,1.7,.65],[-1.4,1.7,.65],[-1.4,.55,.65],[-1.65,.55,.65]];
add('valve-chest','Valve chest','阀箱','steam-supply',tube([[-3.1,1.7,.65],[-3.1,3.1,.65]],.095,'steel'),[tube([[-2,1.7,.65],[-2,3.1,.65]],.095,'steel'),...[upperIn,lowerIn,upperOut,lowerOut].map(p=>tube(p,.045))]).shell=true;
add('condenser','Condenser','冷凝器','condensing',shell(.22,.7,[-1.65,.55,.65])).shell=true;
const injection=[[-2.6,.55,1.2],[-2.15,.55,1.2],[-1.65,.55,.9],[-1.65,.55,.65]];
add('injection-jet','Injection jet','冷水喷口','condensing',tube(injection,.025,'brass'));
add('cooling-cistern','Cooling cistern','冷水箱','condensing',box([1.05,.06,1.55],[-1.95,.07,.95],'steel'),[box([.045,.75,1.55],[-2.475,.445,.95],'steel'),box([.045,.75,1.55],[-1.425,.445,.95],'steel'),box([1.05,.75,.045],[-1.95,.445,.175],'steel'),box([1.05,.75,.045],[-1.95,.445,1.725],'steel'),{kind:'box',size:[1.0,.018,1.5],at:[-1.95,.58,.95],color:'glass'}]).shell=true;
const pumpY=world(rest.W)[1];
add('air-pump','Air pump','抽气泵','condensing',shell(.135,.92,[-1,pumpY,.12])).shell=true;
// The inlet/outlet check plates are schematic fixed fittings, distinct from the shared-frame piston.
get('air-pump').extra=[disc(.15,.035,[-1,pumpY-.4775,.12],'brass'),{kind:'panelHole',size:[.30,.30,.035],hole:{r:.028,at:[0,0]},at:[-1,pumpY+.4775,.12],rotation:[90,0,0],color:'brass'}];
add('hot-well','Hot well','热井','condensing',shell(.24,.4,[-.35,.30,1.2],'brass'),[disc(.24,.025,[-.35,.0875,1.2],'brass')]);
add('feed-pump','Feed pump','给水泵','condensing',shell(.08,.35,[-.75,.4,1.5],'brass'),[disc(.085,.04,[-.75,.595,1.5],'brass')]);
const mixed=[[-1.65,.3,.65],[-1,.3,.12],[-1,pumpY-.4,.12],[-1,pumpY+.4,.12],[-.35,pumpY+.4,1.2],[-.35,.5,1.2]];
const feed=[[-.35,.3,1.2],[-.75,.3,1.5],[-.75,.55,1.5],[-4.4,.55,1.5],[-4.4,1.4,.2]];
const overflow=[[-.35,.48,1.2],[.15,.48,1.2],[.15,.15,1.2]],fresh=[[-3,.9,1.2],[-2.475,.9,1.2],[-2.475,.58,1.2]];
// The pump cavity is a fluid route, never a metal pipe through its moving piston.
add('water-pipes','Water pipes','水管','condensing',tube(mixed.slice(0,3),.035),[tube(mixed.slice(3),.035),tube(feed,.035),tube(overflow,.035),tube(fresh,.035)]);
get('pump-piston').extra=[disc(.035,.009,[world(rest.W)[0]+.06,world(rest.W)[1]+.03,.12],'brass')];
add('load-wheel','Mill drive','机器取力轮','working-motion',{kind:'torus',size:[.25,.035],at:[4.97,2.6,-.65],color:'wood'},[{kind:'cylinder',size:[.055,.055,.55],at:[4.97,2.6,-.65],rotation:[90,0,0],color:'steel'}]);
// Independent Newcomen principle station. Rigid bodies never scale; only the flexible exposed chains do.
add('nc-cylinder','Open cylinder','开口汽缸','teaching',shell(.3,1.4,[-12.5,1.85,0],'steel',180),[disc(.325,.04,[-12.5,1.13,0])]);
add('nc-piston','Pump-engine piston','泵机活塞','teaching',disc(.285,.055,[-12.5,2,0],'brass'),[{kind:'cylinder',size:[.025,.025,1],at:[-12.5,2.5,0],color:'steel'}]);
// Circular end arcs have fixed vertical tangency x=±R; wrapped chain sections are omitted.
// End sheaves are arc guides about the same pivot, not extra joints.
const arcGuide=(side)=>({kind:'extrude',shape:[...Array.from({length:17},(_,i)=>{const a=(side===1?-24:156)+i*3;return [1.5*Math.cos(a/deg),1.5*Math.sin(a/deg)];}),...Array.from({length:17},(_,i)=>{const a=(side===1?24:204)-i*3;return [1.43*Math.cos(a/deg),1.43*Math.sin(a/deg)];})],depth:.09,at:[-11,3.5,0],color:'steel'});
add('nc-beam','Pumping beam','泵机横梁','teaching',box([2.8,.17,.14],[-11,3.5,0]),[arcGuide(1),arcGuide(-1)]);
add('nc-pump','Mine pump','矿井泵','teaching',{kind:'cylinder',size:[.055,.055,2.8],at:[-9.5,1.6,0],color:'steel'},[{kind:'cylinder',size:[.15,.15,.35],at:[-9.5,.375,0],color:'steel'}]);
add('nc-chain','Piston-side chain','活塞侧链段','teaching',{kind:'cylinder',size:[.013,.013,.5],at:[-12.5,3.25,0],color:'steel'});
add('nc-pump-chain','Pump-side chain','泵侧链段','teaching',{kind:'cylinder',size:[.013,.013,.5],at:[-9.5,3.25,0],color:'steel'});
add('nc-jet','Cylinder jet','缸内喷口','teaching',tube([[-13.1,1.5,.15],[-12.8,1.5,.15],[-12.5,1.5,0]],.025,'brass'),[tube([[-13.1,1.2,-.15],[-12.5,1.2,-.15]],.04)]);
for(const [name,betaDeg] of [['nc-fill',-12],['nc-condense',-12],['nc-power',12],['nc-return',-12]]){
 const beta=betaDeg/deg,dy=-1.5*beta,pose={duration:0,'nc-beam':{pivot:[-11,3.5,0],rotation:[0,0,betaDeg]},'nc-piston':{offset:[0,dy,0]},'nc-pump':{offset:[0,-dy,0]}};
 for(const [id,d] of [['nc-chain',dy],['nc-pump-chain',-dy]])pose[id]={pivot:get(id).primitive.at,offset:[0,d/2,0],scale:[1,(.5-d)/.5,1]};
 poses[name]=pose;
}
// Real load paths: a timber bent supports A, a bearing pedestal supports O.
const frame=get('engine-frame');frame.primitive=box([.24,5.6,.24],[0,2.8,-.45]);frame.extra=[box([.24,5.6,.24],[0,2.8,-1.15]),box([.55,.24,1.2],[0,5.48,-.8]),box([.5,2.3,.65],[2.5,1.15,-.65]),{kind:'cylinder',size:[.15,.15,.55],at:[2.5,2.6,-.65],rotation:[90,0,0],color:'brass'},box([.24,4.7,.24],[-3.1,2.35,-.45]),box([1,.20,.35],[-2.75,4.7,-.45]),{kind:'cylinder',size:[.08,.08,.55],at:[-2.5,4.8,-.15],rotation:[90,0,0],color:'steel'},box([.16,1.8,.16],[1,1.1,.7]),box([.5,.12,.45],[1,2,.7])];
add('foundation','Foundation','基础',null,box([11.9,.12,3.1],[-.6,-.08,.1],'ceramic')).context=true;
add('boiler-seating','Boiler seating','锅炉支座',null,box([.35,.8,1.4],[-5.85,.4,-.4],'ceramic'),[box([.35,.8,1.4],[-4.15,.4,-.4],'ceramic')]).context=true;
add('comparison-support','Comparison support','比较模型支架','teaching',box([4.5,.1,1.2],[-11,-.05,0],'ceramic'),[box([.18,3.5,.18],[-11,1.75,-.3]),box([.6,.14,.65],[-11,3.5,-.25])]).context=true;
for(const p of parts.filter(p=>p.context)){delete p.explode; if(p.group===null)delete p.group;}
// Keep the off-stage comparison support out of main station shadows and hero bounds.
frame.castShadow=true;
data.groups=[['steam-supply','Steam supply','供汽','hot'],['working-motion','Working motion','工作传动','signal'],['condensing','Condensing and water','冷凝与水','cold'],['regulation','Speed regulation','调速联动','ink-2'],['teaching','Comparison models','比较模型','ink-2'],['steam-flow','Steam routes','蒸汽路径','hot'],['water-flow','Water routes','水的路径','cold']].map(([id,en,zh,c])=>({id,name:bi(en,zh),color:`token:${c}`,...(['teaching','steam-flow','water-flow'].includes(id)?{card:false}:{})}));
const flow=(id,group,color,path,through)=>({id,group,color:`token:${color}`,...(typeof path[0][0]==='string'?{paths:path.map(([id,path])=>({id,path}))}:{path}),parts:through,speed:.12,count:180,size:.6,spread:.004,clip:false,whenRun:true,flat:true,ends:'fade'});
data.flows=[flow('live-steam','steam-flow','hot',[['main',livePath],['after-throttle',afterThrottle]],['boiler','steam-main','throttle','valve-chest']),flow('port-steam','steam-flow','hot',[['upper',upperIn],['lower',lowerIn]],['valve-chest','cylinder']),flow('exhaust-steam','steam-flow','cold',[['upper',upperOut],['lower',lowerOut]],['cylinder','condenser']),flow('cooling-water','water-flow','cold',[['injection',injection],['fresh',fresh]],['cooling-cistern','injection-jet','condenser']),flow('mixed-discharge','water-flow','cold',mixed,['condenser','air-pump','hot-well']),flow('feed-water','water-flow','cold',[['return',feed],['overflow',overflow]],['hot-well','feed-pump','boiler'])];
const cams={hero:[[11,9,15],[-.5,2.8,0]],'newcomen-view':[[-7,5,7],[-11,2,0]],'cylinder-view':[[-.5,3.5,6],[-2.45,2.3,.2]],'condenser-view':[[.5,3.4,5],[-1.7,.9,.8]],'linkage-view':[[-1,7,8.5],[-1.2,4.5,0]],'governor-view':[[3,4,5],[1,2.1,.9]]};
const cam=id=>({position:cams[id][0],target:cams[id][1],fov:30});
data.presets=Object.keys(cams).map(id=>({id,label:bi({hero:'ENGINE','newcomen-view':'NEWCOMEN','cylinder-view':'CYLINDER','condenser-view':'CONDENSER','linkage-view':'LINKS','governor-view':'GOVERNOR'}[id],{hero:'整机','newcomen-view':'纽科门','cylinder-view':'汽缸','condenser-view':'冷凝器','linkage-view':'连杆','governor-view':'调速器'}[id]),camera:cam(id)}));
data.views={assembled:{camera:cam('hero')},exploded:{camera:cam('hero')},section:{plane:'xy'},cover:cam('hero'),reference:{fit:'layers'},shadows:'auto',cuts:{'cylinder-front':{normal:[0,0,1],offset:.12,label:bi('Cylinder front','汽缸正剖')},'condenser-front':{normal:[0,0,1],offset:.65,label:bi('Condenser front','冷凝器正剖')}}};
data.spec=[['Reference bore','参考内径','≈ 0.476 m · S3'],['Reference stroke','参考行程','≈ 1.219 m · S3'],['Reference flywheel','参考飞轮','≈ 4.88 m · S5'],['Operating study','运行研究',bi('Double-acting condensing','双作用冷凝式')]].map(([en,zh,value])=>({key:bi(en,zh),value,tag:'design'}));
outputs.find(o=>o.id==='work-cycle').decimals=2;
// Context parts stay last: selectable numbering matches the specification's functional order.
const order=['boiler','boiler-water','furnace','steam-main','throttle','throttle-disc','valve-chest','valve-upper-in','valve-lower-in','valve-upper-out','valve-lower-out','cylinder','piston','piston-rod','beam','parallel-inner','parallel-outer','parallel-bottom','radius-rod','drive-rod','planet','sun','centre-link','shaft','flywheel','governor-spindle','governor-balls','governor-ball-right','governor-upper','governor-upper-right','governor-lower','governor-lower-right','governor-collar','throttle-link','throttle-rod','throttle-crank','condenser','injection-jet','cooling-cistern','air-pump','pump-piston','pump-rod','hot-well','feed-pump','water-pipes','load-wheel','nc-cylinder','nc-piston','nc-beam','nc-pump','nc-chain','nc-pump-chain','nc-jet','energy-input','energy-work','energy-reject'];
data.parts=[...order.map(get),...parts.filter(p=>p.context)];
if(data.parts.some(p=>!p)||new Set(data.parts.map(p=>p.id)).size!==60)throw Error('Expected exactly 56 selectable + 4 context parts');
const copy={
'boiler':['Makes steam by heating water.','加热水，产生蒸汽。','Heat crosses the boiler wall into the water; the furnace space stays separate. This is a generic low-pressure boiler study, not the preserved original boiler. [S7]\n\nThe shell radius and length are display design dimensions, not instructions for building or operating a boiler. [S1]','热量穿过锅炉壁传给水，炉膛与水的空间分开。这里采用通用低压锅炉的示意外形，不称为保存下来的原锅炉。[S7]\n\n外壳半径和长度属于展示设计，不是制造或操作锅炉的指导。[S1]'],
'boiler-water':['Receives heat and supplies water vapour.','吸收热量，产生水蒸气。','Water can change from liquid to vapour. The fixed water level is a visual aid, not a calculated inventory or a temperature reading. [S9][S1]','水可从液态变成气态。固定的液面帮助读图，不是计算出的水量，也不表示温度。[S9][S1]'],
'furnace':['Transfers heat towards the boiler water.','把热量传向锅炉里的水。','The furnace is outside the water space. Fuel supplies energy; the model does not calculate combustion, coal use or real engine efficiency. [S7][S1]','炉膛位于水的空间之外。燃料提供能量；模型没有计算燃烧、耗煤或实机效率。[S7][S1]'],
'steam-main':['Carries steam through the throttle to the valves.','让蒸汽经过节流阀，流向配汽阀。','The two pipe sections join at the throttle. Their layout is reconstructed to separate the supply from the exhaust and moving rods. [S7][S1]','两段供汽管在节流阀处连接。管路经过重建，把供汽、排汽和运动杆件分开。[S7][S1]'],
 'throttle':['Houses the steam-control disc.','容纳控制供汽的阀片。','The fixed hollow body stays joined to the supply pipe. The selectable disc inside changes angle in the independent static governor comparison. [S7][S1]','固定的中空阀体连接供汽管。里面可单独选择的阀片，在独立的调速器静态比较中改变角度。[S7][S1]'],
 'throttle-disc':['Changes the opening available to steam.','改变供蒸汽通过的开口。','The three static angles come from the model linkage. Opening is normalized by angle; it is not the same fraction of steam mass flow. [S1]\n\nThis disc is separate from the four distribution valves, which switch the cylinder connections. [S7]','三档静态角度由模型连杆位置求得。开度按角度归一化，不代表相同百分比的蒸汽质量流量。[S1]\n\n节流阀片与四个切换汽缸通路的配汽阀分开。[S7]'],
 'valve-chest':['Connects each cylinder end to supply or exhaust.','把汽缸两端分别接到供汽或排汽通路。','The fixed passages expose four independently selectable valve pieces. Port timing is an ideal switch from the calculated piston direction, not a measurement of Lap timing. [S7][S1]','固定通道露出四个可单独选择的阀芯。正时按计算出的活塞方向作理想切换，不是 Lap 蒸汽机的实测正时。[S7][S1]'],
 'cylinder':['Holds steam on either side of the piston.','让蒸汽分别作用在活塞两面。','ASME records a Lap bore of 18.75 in, about 0.476 m; the Birmingham catalogue records 18 in, or 0.4572 m. Both record a 4 ft stroke, about 1.219 m. The disagreement is retained without guessing its cause. [S3][S4][S16]\n\nThe closed top has a rod opening. The display clearance is enlarged; this is not a manufacturing drawing. [S1]','ASME 记录 Lap 内径为 18.75 英寸，约 0.476 米；伯明翰目录另记 18 英寸，即 0.4572 米。两者均记行程 4 英尺，约 1.219 米。这里保留差异，不猜测原因。[S3][S4][S16]\n\n密封上盖留有活塞杆孔。显示间隙已经放大，这不是制造图。[S1]'],
 'piston':['Receives the net pressure force.','承受两侧压力产生的合力。','Steam alternately acts on either face. The rod occupies part of the upper face, and outside air acts on the exposed rod end; the pressure table includes these areas. [S8][S1]\n\nThe radial display clearance is 3 mm. Its slight sideways motion is retained rather than hidden. [S1]','蒸汽轮流作用在活塞两面。上表面有一部分被杆占据，外界空气也作用在外露杆端；压强数表把这些面积一并计算。[S8][S1]\n\n显示径向间隙为 3 毫米。机构造成的微小横移保留在画面中，没有被隐藏。[S1]'],
 'piston-rod':['Transfers push and pull to the linkage.','把推力和拉力传给连杆机构。','A rigid rod connects the piston to point D of the parallel motion and passes through the upper cover. Unlike a chain, it can transmit force in either direction. [S6][S7]\n\nIts model diameter is 0.040 m, a design input rather than a Lap measurement. [S1]','刚性活塞杆把活塞接到平行运动机构的 D 点，并穿过上盖。它与链条不同，可以传递两个方向的力。[S6][S7]\n\n模型杆径为 0.040 米，属于设计输入，不是 Lap 实测尺寸。[S1]'],
 'beam':['Transfers motion between the two ends.','在两端之间传递运动。','A fixed central pivot supports the rigid beam. Its two sides rock together; the parallel links and connecting rod share this same calculated angle. [S6][S1]','横梁由固定的中央支点支承。两端随同一个刚体摆动；平行机构与传动杆共用这一计算角度。[S6][S1]'],
 'parallel-inner':['Joins C to E with one rigid link.','用一根刚杆连接 C 点与 E 点。','C–E is one side of the hinged parallelogram. There is no extra hinge halfway along it. All lengths are reconstructed design geometry. [S6][S1]','C–E 是铰接平行四边形的一边，中间没有额外铰链。杆长均为重建的设计尺寸。[S6][S1]'],
 'parallel-outer':['Joins B to D opposite the inner link.','连接 B 点与 D 点，与内侧杆相对。','B–D remains parallel to C–E. The radius rod crosses it at a different depth without forming a joint. [S6][S1]','B–D 与 C–E 保持平行。摇杆在另一深度越过它，交叉处没有连接。[S6][S1]'],
 'parallel-bottom':['Closes the moving parallelogram.','闭合运动中的平行四边形。','E–D remains parallel to the beam segment C–B. Its endpoints are solved with the same frame, never moved by a separate sine wave. [S6][S1]','E–D 与横梁上的 C–B 段保持平行。两端由同一机构帧求解，不用独立的正弦动画代替。[S6][S1]'],
 'radius-rod':['Constrains E from a separate fixed pivot.','从独立固定支点约束 E 点。','F is fixed and E moves on a circular arc. Together with the parallelogram this guides the piston rod along a nearly straight path. The crossing with B–D is not a hinge. [S6]','F 点固定，E 点沿圆弧运动。它与平行四边形共同引导活塞杆沿近似直线运动；与 B–D 的交叉处不是铰链。[S6]'],
 'drive-rod':['Carries beam motion to the planet.','把横梁运动传给行星轮。','The planet is fixed to this rod at its lower end. It changes orientation with the rod instead of freely spinning about its own centre. [S6][S7]','行星轮固定在传动杆下端，朝向随传动杆改变，并非绕自身中心自由转动。[S6][S7]'],
 'planet':['Orbits the sun while fixed to the rod.','随传动杆绕太阳轮运行。','Equal model gears mesh without slip. A full piston cycle produces two net sun turns, while the planet returns to its initial orientation. Instantaneous speed ratio is not constant. [S6][S7][S1]','两只相等的模型齿轮无滑动啮合。活塞完成一个周期时，太阳轮净转两圈，行星轮回到原朝向；瞬时速度比并不恒定。[S6][S7][S1]'],
 'sun':['Turns the output shaft through gear contact.','通过齿轮啮合带动输出轴。','The sun is fixed to the shaft. Its phase follows the orbit and the rod-fixed planet together; it does not use a separate rotation animation. [S6][S1]','太阳轮与输出轴固定。它的相位由轨道运动和固定在传动杆上的行星轮共同决定，不使用独立旋转动画。[S6][S1]'],
 'centre-link':['Keeps the two gear centres apart.','保持两齿轮的中心距。','The link pivots at the sun and planet centres. It fixes their spacing while the gear teeth transmit rotation; it is not a substitute for meshing teeth. [S6][S1]','定距连杆在太阳轮与行星轮中心转动，保持中心距；转动仍由齿轮啮合传递，连杆不能取代轮齿。[S6][S1]'],
 'shaft':['Carries rotation from sun to flywheel.','把太阳轮的转动传给飞轮。','The sun and flywheel share the shaft angle. Bearings support its axis. This model prescribes its phase rather than calculating shaft acceleration or load power. [S6][S1]','太阳轮与飞轮共用输出轴角度，轴承支承轴线。模型按给定相位运动，没有计算轴的加速度或负载功率。[S6][S1]'],
 'flywheel':['Stores and returns rotational energy.','储存并交还转动的能量。','A flywheel can smooth changing motion by storing and releasing energy. The prescribed model speed is not a calculated demonstration of this effect. [S7][S1]\n\nThe reference diameter is 16 ft, about 4.88 m, reported by David K. Hulse. Sources disagree on outer drive-tooth count, so no countable outer tooth ring is drawn; the spokes are reconstruction. [S5][S3][S16]','飞轮通过储存和释放能量，使运动较为平稳。模型速度由相位给定，并非算出了这种平滑效果。[S7][S1]\n\n参考直径采用 David K. Hulse 报道的 16 英尺，约 4.88 米。来源所记外缘取力齿数不同，因此模型不画可数的外缘齿圈；辐条为重建。[S5][S3][S16]'],
 'governor-spindle':['Supports the independent flyball comparison.','支承独立的飞球比较模型。','Real rotating governors respond through force and linkage. This spindle remains still in the three static comparisons; the schematic belt and right-angle take-off only mark a drive connection. No belt ratio or transient response is calculated. [S7][S1]','实际旋转调速器通过受力和连杆产生反馈。本模型的调速器轴在三档静态比较中不转动，示意皮带与直角取力只标明传动连接，没有计算传动比或瞬态响应。[S7][S1]'],
 'governor-collar':['Moves along the governor spindle.','沿调速器轴升降。','In this symmetric model the collar rises as the prescribed static speed increases. This direction follows the chosen geometry; historical lever arrangements can differ. [S7][S1]','在这个对称模型中，指定静态转速升高时滑套上升。方向取决于本设计几何，历史机器的杠杆配置可能不同。[S7][S1]'],
 'throttle-link':['Follows the collar without orbiting the shaft.','随滑套升降，不绕轴公转。','The fork sits in the collar groove and passes its vertical position to the throttle rod. It does not rotate around the spindle with the balls. [S7][S1]','叉环进入滑套槽，把升降位置传给节流连杆。它不随飞球绕调速器轴公转。[S7][S1]'],
 'throttle-rod':['Joins the collar fork to the throttle crank.','连接滑套叉环与节流曲柄。','The model selects a circle intersection for each static position. The rod keeps its design length instead of stretching between interpolated points. [S1]','模型为每个静态姿态选择圆交点，使连杆保持设计长度，不在插值过程中拉长。[S1]'],
 'throttle-crank':['Turns the throttle about its fixed axis.','绕固定阀轴带动节流阀片。','The crank joins the throttle rod to the disc axis. It turns with the independent disc while the surrounding body stays fixed. [S7][S1]','曲柄把节流连杆连接到阀片轴，与独立阀片一起转动，周围的阀体保持固定。[S7][S1]'],
 'condenser':['Condenses exhaust steam away from the cylinder.','在汽缸之外让排汽凝结。','Exhaust meets injected cold water here. Condensation releases heat and lowers the steam pressure; the air pump removes air and the water mixture. [S7][S9]\n\nThe module is a reconstructed injection condenser. The older illustration shows only the separation principle and cannot establish its internal jet. [S1][S14]','排汽在这里接触喷入的冷水。凝结释放热量，并使蒸汽压强降低；抽气泵移走空气和混合水。[S7][S9]\n\n这里重建喷射式冷凝器。旧插图只说明冷热分离，不能用来证明内部喷口构造。[S1][S14]'],
 'injection-jet':['Brings cold water into the condenser.','把冷水喷入冷凝器内部。','The water route ends at the mixing point inside the condenser. It does not spray into the working cylinder as in the atmospheric comparison. [S7][S1]','冷水路径在冷凝器内部的混合处结束，不像大气式比较模块那样直接喷入工作汽缸。[S7][S1]'],
 'cooling-cistern':['Supplies cold water around the condenser station.','为冷凝工位提供冷水。','The cistern has an external cold-water connection. Water and heat leave the system; the model is not a sealed loop that needs no outside supply. [S7][S1]','冷水箱设有外来冷水接口。水和热量会离开系统；这不是无需外来供水的密闭循环。[S7][S1]'],
 'air-pump':['Removes air and mixed water from the condenser.','从冷凝器移走空气和混合水。','The beam drives the pump rod. The upstroke draws mixture in and delivers water above the piston; on descent the mixture transfers through a check passage. Valve details are schematic. [S7][S1]','横梁带动泵杆。上行时抽入混合物，并排出活塞上方的水；下降时，混合物经止回通道转移。阀门细节为示意。[S7][S1]'],
 'pump-piston':['Displaces mixture through the air pump.','在抽气泵中推动混合物。','This piston shares the main mechanism frame. Its movement is not a separate animation or a claim of constant pumping rate. [S7][S1]','泵活塞与主机共用机构帧；它不是独立动画，也不表示恒定抽送量。[S7][S1]'],
 'pump-rod':['Transfers beam motion to the air-pump piston.','把横梁运动传给抽气泵活塞。','A point inside the beam end drives a fixed-length rod and vertical pump slider. Both endpoints are solved with the same phase as the main piston. [S1][S7]','横梁内侧取点通过定长杆驱动竖直泵滑块。两端与主活塞按同一相位求解。[S1][S7]'],
 'hot-well':['Collects the discharged warm mixture.','收集排出的温水。','The hot well receives water from the air pump. Only part returns as boiler feed; an overflow makes the open water balance visible. [S7][S1]','热井接收抽气泵排出的水。只有部分水返回锅炉，溢流口让开放的水量关系可见。[S7][S1]'],
 'feed-pump':['Returns part of the hot-well water to the boiler.','把热井中的部分水送回锅炉。','The fixed small pump marks the feed route; this study does not solve its displacement or water flow rate. Outside water replaces what leaves the system. [S7][S1]','小型固定泵标出给水路线；本研究没有求出它的排量或水流量。外来水补充离开系统的水。[S7][S1]'],
 'water-pipes':['Join injection, discharge, return and overflow.','连接注水、排水、回水与溢流。','Separate pipe sections connect the condenser, air pump, hot well and boiler. Particle dots indicate routes, not molecules, temperature or mass flow. Pipe sizes and layout are reconstructed. [S7][S1]','分开的管段连接冷凝器、抽气泵、热井和锅炉。小点表示路径，不表示分子、温度或质量流量；管径与布局经过重建。[S7][S1]'],
 'load-wheel':['Marks where rotation drives another machine.','标出转动向其他机器传递的位置。','The preserved Lap engine was used for metal polishing. This small take-off wheel represents mechanical drive, not an electricity generator or a measured load. [S2][S1]','保存的 Lap 蒸汽机曾用于金属磨光。这个小取力轮只表示机械传动，不是发电机，也不代表实测负载。[S2][S1]'],
 'nc-cylinder':['Leaves the piston top open to the atmosphere.','让活塞上方直接接触大气。','Steam fills the lower chamber. Cold water condenses steam inside this cylinder, unlike Watt’s separate condenser. This is an independent principle module, not a replica of the museum’s later engine. [S11][S12][S1]','蒸汽进入下部空间，冷水直接在缸内使蒸汽凝结，与瓦特的分离冷凝器不同。这是独立原理模块，不是博物馆晚期机器的复制品。[S11][S12][S1]'],
 'nc-piston':['Receives the atmospheric downward push.','承受大气向下的推力。','The lower pressure falls after condensation; air above pushes harder. A vacuum does not pull. This piston has no rod passing through a sealed upper cover, so the main-engine rod-area formula is not used. [S11][S8][S1]','凝结后下方压强降低，上方空气推得更强；并非真空在拉。这个活塞没有穿过密封上盖的杆，因此不用主机的杆面积公式。[S11][S8][S1]'],
 'nc-beam':['Lifts the mine-pump rod as the piston descends.','在活塞下降时提起矿井泵杆。','Its curved end guides carry flexible chains. The poses show end states rather than measured timing, and omit the chain wrapped around the end arcs. [S11][S1]','弧端引导柔性链条。姿态显示的是端态，不是实测时序；绕过弧端的一段链条省略不画。[S11][S1]'],
 'nc-pump':['Provides a weighted side for the return stroke.','以沉重的泵侧帮助回程。','When steam enters again, the weighted pump side helps raise the engine piston. Different mine-pump arrangements need not deliver water on the same stroke. [S11][S1]','蒸汽再次进入时，沉重的泵侧帮助机缸活塞升起。不同矿井泵配置不一定在同一方向的行程排水。[S11][S1]'],
 'nc-chain':['Transfers tension at the cylinder-side arc.','在汽缸侧弧端传递拉力。','The exposed flexible segment changes length between poses, while the piston and its rod stay rigid. A chain can pull but cannot push upwards like a rigid link. [S11][S6][S1]','姿态切换时，外露柔性链段改变长度，活塞与活塞杆保持刚性。链条能拉，不能像刚杆那样向上推。[S11][S6][S1]'],
 'nc-pump-chain':['Transfers tension at the pump-side arc.','在泵侧弧端传递拉力。','This chain stays between the fixed vertical tangent and the pump rod top. Its exposed length follows the same beam angle as the opposite side. [S11][S1]','链段始终连接固定竖直切点与泵杆顶端，外露长度与另一侧按同一横梁角度计算。[S11][S1]'],
 'nc-jet':['Sprays cold water directly into the open cylinder.','把冷水直接喷入开口汽缸。','The jet highlights the repeated cooling of the cylinder. Steam must then warm that cylinder again. The separate supply stub and jet are fixed, not carried by the piston. [S11][S12][S1]','喷口说明汽缸被反复冷却，之后蒸汽又要把汽缸加热。独立供汽短管与喷口固定，不随活塞移动。[S11][S12][S1]'],
 'energy-input':['Shows heat delivered to the working fluid.','显示传给工作流体的热量。','The separate input row has 100 normalized units. It represents working-fluid heat input, not all chemical energy in the fuel. [S1][S10]','独立输入排为 100 份归一化单位，表示传给工作流体的热量，不是燃料中的全部化学能。[S1][S10]'],
 'energy-work':['Shows the model share leaving as work.','显示模型中以功输出的份数。','The work row shows 10, 20 or 30 normalized units. These are teaching accounts rather than efficiency measurements of the Lap engine. [S1][S10]','输出功一排显示 10、20 或 30 份归一化单位，属于教学账本，不是 Lap 蒸汽机的效率测量。[S1][S10]'],
 'energy-reject':['Completes the output account as rejected heat.','以排出热量补全输出账本。','Rejected heat is 90, 80 or 70 units. Work plus rejection equals the separate input of 100 for a complete cycle with no net stored-energy change. [S1][S10]','排出热量为 90、80 或 70 份。完整循环的储能净变化为零，功加排热等于独立的 100 份输入。[S1][S10]'],
 'engine-frame':['Supports the beam pivot and output bearings.','支承横梁支点与输出轴承。','The timber and metal frame makes fixed pivots visible. Its members and bearing layout are reconstruction, not a digital twin of the museum object. [S2][S1]','木架与金属支架使固定支点可见。构件和轴承布局经过重建，不是馆藏机器的数字孪生。[S2][S1]'],
 'foundation':['Supports the main demonstration station.','支承主机展示工位。','This display base separates the engine from the ground plane. Its dimensions are reconstructed and not a historical engine-house footprint. [S1]','展示底座把主机与地面分开。尺寸为重建，并非历史厂房的占地范围。[S1]'],
 'boiler-seating':['Supports the boiler clear of the furnace.','使锅炉由支座承托。','The schematic masonry seats carry the boiler. Their spacing and appearance are display design. [S1]','示意砌体支座承托锅炉，间距与外形属于展示设计。[S1]'],
 'comparison-support':['Supports the independent atmospheric comparison.','支承独立的大气式比较模型。','The comparison is placed on its own stand. Its position and scale do not imply that it was part of the Lap installation. [S1]','比较模型放在独立支架上。位置与比例不表示它原本属于 Lap 装置。[S1]']
};
for(const [role,desc] of [['upper-in',['Lets steam enter above the piston.','让蒸汽进入活塞上方。','upper inlet','上进汽阀']],['lower-in',['Lets steam enter below the piston.','让蒸汽进入活塞下方。','lower inlet','下进汽阀']],['upper-out',['Connects the upper space to the condenser.','把上部空间接到冷凝器。','upper exhaust','上排汽阀']],['lower-out',['Connects the lower space to the condenser.','把下部空间接到冷凝器。','lower exhaust','下排汽阀']]])copy[`valve-${role}`]=[desc[0],desc[1],`The ${desc[2]} is a separate lifted valve piece. It shares the calculated direction and gate with the fixed steam route. The 0.015 m lift is display design, not historical timing. [S7][S1]`,`这个${desc[3]}是独立抬起的阀芯，与固定蒸汽路径共用计算出的方向和门控。0.015 米升程为展示设计，不是历史实测正时。[S7][S1]`];
for(const [id,side] of [['governor-balls','left'],['governor-ball-right','right']])copy[id]=['Marks the radius in a static speed comparison.','标出静态转速比较中的球半径。',`The ${side} ball is one of two symmetric point-mass model balls. Compare 60, 90 and 120 rpm as independent equilibria, not frames of acceleration. [S1]\n\nThe main engine phase and cold-side pressure do not drive this comparison. [S1]`,`${side==='left'?'左':'右'}球是对称点质量模型中的一球。60、90、120 转每分是独立平衡态，不是加速过程的连续画面。[S1]\n\n主机相位和冷端压强不驱动这个比较。[S1]`];
for(const id of ['governor-upper','governor-upper-right','governor-lower','governor-lower-right'])copy[id]=[id.includes('upper')?'Joins the fixed upper pivot to a ball.':'Joins a ball to the sliding collar.',id.includes('upper')?'连接固定上支点与飞球。':'连接飞球与滑套。','This rigid arm keeps its 0.5 m design length in every static position. The complete linkage changes instantly between solved equilibria, avoiding stretched intermediate rods. [S1]','刚性杆在各静态姿态均保持 0.5 米设计长度。完整机构在求得的平衡态之间瞬切，避免中间状态拉长杆件。[S1]'];
for(const p of data.parts){
 const c=copy[p.id];if(!c)throw Error(`Missing functional copy: ${p.id}`);
 p.summary=bi(c[0],c[1]);p.detail=bi(c[2],c[3]);
 if(!p.context){p.chainName=bi(p.name.en.length<=14?p.name.en:({'governor-upper-right':'R upper arm','governor-lower-right':'R lower link','nc-chain':'Piston chain','nc-pump-chain':'Pump chain','nc-piston':'Pump piston','throttle-crank':'Throttle crank'}[p.id]||p.name.en.split(' ').slice(-2).join(' ')),p.name.zh);p.castShadow=['boiler','beam','flywheel','cylinder'].includes(p.id);p.explode??={dir:[0,0,1],dist:.35};}
}
const connections={boiler:['steam-main','boiler-water','furnace'],'steam-main':['throttle','valve-chest'],throttle:['throttle-disc','throttle-crank'],'valve-chest':['valve-upper-in','valve-lower-in','valve-upper-out','valve-lower-out'],cylinder:['piston','valve-chest'],piston:['piston-rod'],'piston-rod':['parallel-outer'],beam:['parallel-inner','parallel-outer','drive-rod','pump-rod'],'parallel-inner':['parallel-bottom','radius-rod'],'parallel-bottom':['parallel-outer'],'drive-rod':['planet'],planet:['sun','centre-link'],sun:['shaft'],shaft:['flywheel','load-wheel','governor-spindle'],'governor-spindle':['governor-upper','governor-upper-right'],'governor-upper':['governor-balls'],'governor-upper-right':['governor-ball-right'],'governor-balls':['governor-lower'],'governor-ball-right':['governor-lower-right'],'governor-lower':['governor-collar'],'governor-lower-right':['governor-collar'],'governor-collar':['throttle-link'],'throttle-link':['throttle-rod'],'throttle-rod':['throttle-crank'],condenser:['air-pump','injection-jet'],'cooling-cistern':['injection-jet'],'air-pump':['pump-piston','hot-well'],'pump-rod':['pump-piston'],'hot-well':['feed-pump','water-pipes'],'feed-pump':['boiler'],'nc-cylinder':['nc-piston','nc-jet'],'nc-piston':['nc-chain'],'nc-chain':['nc-beam'],'nc-beam':['nc-pump-chain'],'nc-pump-chain':['nc-pump']};
for(const [id,links] of Object.entries(connections))get(id).connects=links;
// A lower half water section, independent of the boiler shell's inspection state.
get('boiler-water').primitive={kind:'extrude',shape:Array.from({length:25},(_,i)=>{const a=(180+i*7.5)/deg;return [.575*Math.cos(a),.575*Math.sin(a)];}),depth:2.16,at:[-5,1.4,-.4],rotation:[0,90,0],color:'token:cold'};
// Disc normal starts in XY; world-Z pose rotates it across the Y-axis steam passage.
get('throttle-disc').primitive.rotation=[0,0,45];
// Normalize base material names and exact glossary names, never insert texture assets.
for(const p of data.parts)for(const primitive of [p.primitive,...(p.extra||[])])if(primitive.color==='ceramic')primitive.color='matte';
const rename={'parallel-inner':['Inner link','内侧短连杆'],'parallel-outer':['Outer link','外侧短连杆'],'governor-balls':['Left flyball','左飞球'],'governor-ball-right':['Right flyball','右飞球'],'governor-upper':['Left upper arm','左上摆臂'],'governor-upper-right':['Right upper arm','右上摆臂'],'governor-lower':['Left lower link','左下连杆'],'governor-lower-right':['Right lower link','右下连杆']};
for(const [id,n] of Object.entries(rename))get(id).name=bi(...n);
write('data/parts.json',data);
