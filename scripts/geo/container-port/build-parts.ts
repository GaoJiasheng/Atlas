/** Original generic terminal study. Metres; Y up, sea -Z. No real Tuas geometry.
 * References: refs/02 INSST crane photos; refs/03 CTU Annex2p1. Reference assets stay gitignored.
 * Run: pnpm tsx scripts/geo/container-port/build-parts.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { partsFile } from '../../../src/engines/space-scene/schema';
const text = (en: string, zh: string) => ({ en, zh });
type V = [number, number, number];
type P = Record<string, unknown>;
const box = (size: V, at: V, color = 'steel'): P => ({ kind: 'box', size, at, color });
const cyl = (radius: number, length: number, at: V, color = 'steel', rotation: V = [0,0,0]): P => ({ kind:'cylinder', size:[radius,radius,length], at, color, rotation });
const beam = (a: V,b: V,w=.6,color='steel'): P => {
 const d=b.map((v,i)=>v-a[i]!) as V, n=Math.hypot(...d);
 return {kind:'box',size:[w,n,w],at:a.map((v,i)=>(v+b[i]!)/2),rotation:[Math.atan2(d[2],Math.hypot(d[0],d[1]))*180/Math.PI,0,-Math.atan2(d[0],d[1])*180/Math.PI],color};
};
const parts: P[]=[];
function add(id:string,en:string,zh:string,group:string,primitive:P,extras:P[]=[],summary?:[string,string],source='S1',connects:string[]=[]):P {
 const p:P={id,name:text(en,zh),group,primitive,summary:text(...(summary??[`${en} forms one part of the handling chain.`,`${zh}是搬运链中的一个部分。`])),detail:text(`${summary?.[0]??`${en} forms part of the handling chain.`} [${source}]\n\nThis part is drawn in a compressed teaching layout. Its geometry and placement are design choices, not a surveyed terminal or equipment specification. [S1]`,`${summary?.[1]??`${zh}是搬运链中的一个部分。`}[${source}]\n\n本零件采用压缩教学布局。几何和位置是设计值，不是码头测绘或设备规格。[S1]`),explode:{dir:[0,1,0],dist:0},castShadow:false};
 if(extras.length)p.extra=extras;if(connects.length)p.connects=connects;parts.push(p);return p;
}
/** Corrugated footprint, extruded vertically. Single primitive permits count/repeat.
 * Overall extents retain external length and width; corrugation cuts inward only. */
function container(length:number,at:V):P {
 const n=length>10?30:16, shape:number[][]=[];
 for(let i=0;i<=n*2;i++)shape.push([-length/2+length*i/(n*2),1.219-(i%2)*.055]);
 for(let i=n*2;i>=0;i--)shape.push([-length/2+length*i/(n*2),-1.219+(i%2)*.055]);
 return {kind:'extrude',shape,depth:2.591,rotation:[90,0,0],at,color:'powder'};
}
function shipShape(at:V,length=100,width=28,depth=13):P {
 const l=length/2,w=width/2;
 return {kind:'extrude',shape:[[-l+9,-w], [l-10,-w],[l-3,-w*.58],[l,0],[l-3,w*.58],[l-10,w],[-l+9,w],[-l,w*.55],[-l,-w*.55]],depth,rotation:[90,0,0],at,color:'powder'};
}
add('ship-hull','Hull','船体','vessel',shipShape([0,3.2,-18]),[],['Supports the cargo and forms the vessel’s continuous body.','承载货物，构成连续的船体。'],'S1,S11',['ship-deck']);
add('ship-deck','Deck','甲板','vessel',box([78,.6,25],[0,9.7,-18]),[box([27,.12,10],[-18,10.06,-18]),box([25,.12,10],[20,10.06,-18])],['Provides the working surface above the hull.','在船体上方提供甲板工作面。'],'S1',['ship-hull','working-box']);
add('ship-bridge','Bridge','驾驶区','vessel',box([10,8,18],[-36,14,-18],'enamel'),[box([12,3,20],[-36,19.5,-18],'enamel'),box([11,.65,19],[-36,21.3,-18],'steel'),box([.6,7,.6],[-36,24,-18])],['Houses the ship’s navigation space.','容纳船舶的驾驶空间。']);
add('ship-cargo','Deck cargo','甲板箱','vessel',container(12.192,[18,11.2955,-25]),[container(12.192,[18,13.8865,-25]),container(12.192,[18,11.2955,-10]),container(12.192,[18,13.8865,-10])]);
const portal:P[]=[];
for(const x of [-9,9])for(const z of [2,22])portal.push(beam([x,1.5,z],[x,49,z],1.5));
for(const z of [2,22]){portal.push(beam([-9,18,z],[9,18,z],1));portal.push(beam([-9,49,z],[9,49,z],1.2));portal.push(beam([-9,18,z],[9,40,z],.55));}
for(const x of [-9,9]){portal.push(beam([x,21,2],[x,21,22],.8));portal.push(beam([x,49,2],[x,49,22],1));}
add('portal','Portal','门架','quay-crane',portal.shift()!,portal,['Supports the boom above the quay.','在码头上方支撑臂架。'],'S1,S11',['crane-boom','rail-bogies']);
const bogies:P[]=[];for(const x of [-9,9])for(const z of [2,22]){bogies.push(box([6,1.1,1.4],[x,1.4,z]));for(const dx of [-2,-.7,.7,2])bogies.push(cyl(.55,.65,[x+dx,.65,z],'steel',[90,0,0]));}
add('rail-bogies','Bogies','行走轮组','quay-crane',bogies.shift()!,bogies,['Carry the crane along its quay rails.','让岸桥沿码头轨道移动。'],'S1,S11',['crane-rails','portal']);
add('crane-rails','Rails','轨道','quay-crane',box([105,.12,.3],[0,.1,2]),[box([105,.12,.3],[0,.1,22])],['Guide the whole crane along the quay.','引导整台岸桥沿码头移动。'],'S1,S11',['rail-bogies']);
const boom:P[]=[];
for(const x of [-4,4]){boom.push(box([.7,.7,66],[x,49,-3]),box([.6,.6,66],[x,53,-3]));for(let z=-36;z<30;z+=11)boom.push(beam([x,49,z],[x,53,z+11],.35));}
boom.push(beam([0,52,2],[0,72,12],1),beam([0,72,12],[0,53,-36],.35),beam([0,72,12],[0,53,30],.35));
add('crane-boom','Boom','臂架','quay-crane',boom.shift()!,boom,['Carries the trolley above the ship and quay.','承载在船舶和码头上方行走的小车。'],'S1,S11',['portal','trolley']);
add('trolley','Trolley','小车','quay-crane',box([6.4,.9,3],[0,50,-18]),[cyl(.48,.45,[-3.1,50.2,-19],'steel',[0,0,90]),cyl(.48,.45,[3.1,50.2,-19],'steel',[0,0,90]),cyl(.48,.45,[-3.1,50.2,-17],'steel',[0,0,90]),cyl(.48,.45,[3.1,50.2,-17],'steel',[0,0,90])],['Moves the suspended load along the boom.','沿臂架移动悬吊的货物。'],'S1,S11',['crane-boom','rope-a','rope-b','rope-c','rope-d']);
for(const c of ['a','b','c','d'])add(`rope-${c}`,'Hoist rope','起升绳','quay-crane',cyl(.055,1,[0,0,0]),[],['Connects the trolley’s hoist to the spreader.','把小车上的起升机构连接到吊具。'],'S1,S11',['trolley','spreader']);
const frame:P={kind:'extrude',shape:[[-3.029,-1.219],[3.029,-1.219],[3.029,1.219],[-3.029,1.219]],holes:[[[-2.65,-.87],[-2.65,.87],[2.65,.87],[2.65,-.87]]],depth:.6,rotation:[90,0,0],at:[0,12.891,-18],color:'steel'};
add('spreader','Spreader','集装箱吊具','quay-crane',frame,[],['Connects the hoist to the container’s upper corners.','把起升机构连接到集装箱的上角件。'],'S1,S10',['rope-a','rope-b','rope-c','rope-d','twistlocks']);
const locks=add('twistlocks','Twistlocks','旋锁','quay-crane',cyl(.08,.35,[0,12.65,-19.1]),[box([.32,.12,.16],[0,12.53,-19.1]),cyl(.08,.35,[0,12.65,-16.9]),box([.32,.12,.16],[0,12.53,-16.9])],['Turn within the upper corner fittings to form a connection.','在上角件中转动，形成连接。'],'S1,S10',['spreader','corner-fittings']);locks.repeat={count:2,axis:[1,0,0],spacing:5.8};locks.detail=text('The four simplified lock heads are enlarged to be visible. They indicate a corner connection, not an engineering drawing or operating procedure. [S1,S10]','四个简化锁头经过放大，便于识别；它们只表示角件连接，不是工程详图或操作步骤。[S1,S10]');
const workingShell=container(6.058,[0,11.2955,-18]);
workingShell.holes=[[[-2.92,-1.1],[-2.92,1.1],[2.92,1.1],[2.92,-1.1]]];
const working=add('working-box','Working box','工作箱','trace',workingShell,[box([6.058,.07,2.438],[0,12.556,-18],'powder'),box([6.058,.07,2.438],[0,10.035,-18],'powder'),box([.04,2.4,.035],[3.009,11.2955,-18],'steel'),box([.04,2.1,.035],[3.009,11.2955,-18.52],'steel'),box([.04,2.1,.035],[3.009,11.2955,-17.48],'steel')],['Keeps the same identity through this transfer.','在这次转运中保持同一只箱子的身份。'],'S1,S10',['ship-deck','corner-fittings']);working.shell=true;working.explode={dir:[0,0,1],dist:1.8};
const corners:P[]=[];for(const x of [-2.9,2.9])for(const z of [-19.1,-16.9])corners.push(box([.25,.18,.25],[x,12.5,z],'steel'),box([.12,2.3,.12],[x,11.26,z],'steel'));
add('corner-fittings','Upper corners','上角件','trace',corners.shift()!,corners,['Provide the upper corner connection points for the spreader.','在箱体上角提供吊具连接点。'],'S1,S10',['working-box','twistlocks']);
for(const [id,l,x] of [['sample-20',6.058,-5],['sample-40',12.192,5]] as const){const p=add(id,l===6.058?'20-foot samples':'40-foot samples',l===6.058?'20英尺样箱':'40英尺样箱','trace',container(l,[x,1.2955,2]),[],['Show boxes at one common scale for TEU counting.','以相同比例显示集装箱，用于TEU计数。'],'S1,S8,S9');p.repeat={count:4,axis:[0,0,1],spacing:3.3};}
add('agv-body','Carrier','自动导引车','transfer',box([8.3,.65,3.2],[0,1.675,10]),[box([5.8,.6,2.6],[0,1.1,10],'steel'),box([.3,.18,2.8],[-2.7,1.91,10]),box([.3,.18,2.8],[2.7,1.91,10])],['Carries a container horizontally between handling points.','在搬运位置之间水平运送集装箱。'],'S1,S5',['agv-wheels','working-box']);
const wheels:P[]=[];for(const x of [-2.7,0,2.7])for(const z of [8.4,11.6])wheels.push(cyl(.72,.45,[x,.72,z],'rubber',[90,0,0]));
add('agv-wheels','Wheels','车轮','transfer',wheels.shift()!,wheels,['Support the carrier’s travel on land.','支撑运输车在陆地上行走。'],'S1',['agv-body']);
const yard:P[]=[];for(const x of [10,43])for(const z of [35,45])yard.push(box([.8,13,.8],[x,6.5,z]));for(const z of [35,45])yard.push(box([34,1,1],[26.5,13,z]));for(const x of [10,43])yard.push(box([1,1,12],[x,1,40]));yard.push(box([34,.65,.65],[26.5,13,40]));
add('yard-gantry','Yard gantry','场桥','yard',yard.shift()!,yard,['Lifts containers within the yard.','在堆场内起吊集装箱。'],'S1,S5',['yard-trolley','yard-target']);
add('yard-trolley','Yard trolley','场桥小车','yard',box([6.4,.7,2.8],[18,13.3,40]),[cyl(.05,3.55,[15.4,11.175,39]),cyl(.05,3.55,[20.6,11.175,41]),box([6.05,.5,.3],[18,9.15,39]),box([6.05,.5,.3],[18,9.15,41])],['Positions a yard lifting attachment above a box.','把堆场吊具移到箱子上方。'],'S1',['yard-gantry']);
for(const [id,en,zh,y] of [['yard-target','Target','目标箱',1.2955],['yard-blocker-a','Upper box A','上层箱甲',3.8865],['yard-blocker-b','Upper box B','上层箱乙',6.4775]] as const)add(id,en,zh,'yard',container(6.058,[18,y,40]),[],['Occupies one tier in the separate yard rehandling experiment.','在独立的堆场移箱实验中占据一层。'],'S1',['yard-gantry']);
add('yard-slot','Clear slot','移箱位置','yard',box([7,.08,.1],[28,.04,38.5]),[box([7,.08,.1],[28,.04,41.5]),box([.1,.08,3],[24.5,.04,40]),box([.1,.08,3],[31.5,.04,40]),box([7,.08,.1],[38,.04,38.5]),box([7,.08,.1],[38,.04,41.5]),box([.1,.08,3],[34.5,.04,40]),box([.1,.08,3],[41.5,.04,40])],['Marks the model’s temporary parking positions for upper boxes.','标出模型中暂放上层箱的位置。']);
add('onward-ship','Onward vessel','接续船','vessel',shipShape([48,2,-51],55,23,10),[box([7,6,16],[30,10,-51],'enamel')],['Carries a transhipment box onwards to another destination.','把转运箱继续运往另一个目的地。'],'S1,S12',['working-box']);
add('destination-box','Local delivery','本地交付箱','transfer',container(6.058,[-25,1.2955,38]),[],['Represents a box whose onward step is local delivery.','表示下一步为本地交付的箱子。'],'S1,S12');
add('control-room','Control room','控制室','transfer',box([11,7,9],[-30,3.5,48],'enamel'),[box([12,.6,10],[-30,7.3,48],'steel'),box([9,1.3,.12],[-30,5.5,52.55],'steel')],['Represents people overseeing automated port operations.','表示人员监控自动化港口作业的工作场所。'],'S1,S5');
for(const [id,size,at,color] of [['quay-context',[112,1,64],[0,-.5,32],'token:neutral'],['water-context',[115,.08,40],[0,-.85,-20],'token:cold']] as const)parts.push({id,name:text(id==='quay-context'?'Quay':'Water',id==='quay-context'?'码头':'水面'),summary:text('Provides schematic scene context.','提供场景示意背景。'),detail:text('Schematic context, not measured geometry. [S1]','示意背景，不是测量几何。[S1]'),primitive:box([...size],[...at],color),context:true,castShadow:false});
const fixture=JSON.parse(readFileSync('src/content/topics/sample-port/data/parts.json','utf8'));
const sim=fixture.sim;
sim.bind=sim.bind.filter((b:{part?:unknown})=>b.part!=='diagonal-rope');
for(const b of sim.bind){if(b.part==='working-box'&&b.play)b.part=['working-box','corner-fittings'];}
sim.port.source=['S1'];
const labels:Record<string,[string,string]>={n20:['20-foot boxes','20英尺箱数'],n40:['40-foot boxes','40英尺箱数'],above:['Boxes above target','目标箱上方箱数'],cranes:['Quay cranes','岸桥台数'],carriers:['Carriers','运输车台数'],yards:['Yard cranes','场桥台数'],arrivals:['Arrivals per hour','每小时到达箱数'],hours:['Model hours','模型小时'], 'lock-confirmed':['Lock confirmation','锁定确认'],'lift-live':['Replay lift','重放吊运'],'yard-state':['Yard step','堆场步骤'],boxes:['Box count','箱数'],teu:['TEU','标准箱单位'],rehandles:['Boxes moved aside','移开箱数'],'retrieval-lifts':['Lifts including target','连目标箱的搬运数'],'crane-rate':['Quay capability','岸桥能力'],'carrier-rate':['Carrier capability','运输车能力'],'yard-rate':['Yard capability','场桥能力'],'capacity-rate':['Chain capability','链条能力'],completed:['Completed','完成箱数'],'queue-growth':['Queue growth','队列增长'],queued:['Queued','等候箱数'],'lift-status':['Lock state','锁定状态'],bottleneck:['Limiting step','瓶颈工序'],'lift-run':['Lift replay','吊运重放'],'yard-slots':['Yard positions','堆场位置']};
for(const c of [...sim.controls,...sim.outputs]){c.label=text(...labels[c.id]!);if(c.options)for(const o of c.options)o.label=text(...({original:['Stacked','原位'],cleared:['Upper boxes moved','移开上层箱'],retrieved:['Target retrieved','取出目标箱']} as Record<string,[string,string]>)[o.id]!);if(c.states)for(const id of Object.keys(c.states))c.states[id]=text(...({crane:['Quay crane','岸桥'],carrier:['Carrier','运输车'],yard:['Yard crane','场桥'],tied:['Equal limits','共同瓶颈'],ready:['Confirmed','已确认'],'lock-not-confirmed':['Not confirmed','未确认']} as Record<string,[string,string]>)[id]!);}
const poses=fixture.poses;
for(const pose of Object.values(poses) as P[]){if(pose['working-box'])pose['corner-fittings']=structuredClone(pose['working-box']);}
poses['lock-closeup']=structuredClone(poses['port-source']);
poses['box-comparison']={duration:0};
poses['transfer-on-carrier']=structuredClone(poses['lift-released']);
function transfer(at:V){const pose=structuredClone(poses['lift-released']);for(const id of ['working-box','corner-fittings'])pose[id]={offset:[at[0],at[1]-11.2955,at[2]+18]};return pose;}
poses['transfer-at-yard']=transfer([0,1.2955,40]); for(const id of ['agv-body','agv-wheels'])poses['transfer-at-yard'][id]={offset:[0,0,23]};poses['transfer-onward']=transfer([48,8.2955,-51]);poses['tuas-context']=structuredClone(poses['port-source']);
const cams:Record<string,[V,V,number]>={hero:[[105,85,115],[0,15,5],34],box:[[30,19,28],[0,2,0],32],lift:[[35,38,45],[0,23,-3],32],yard:[[75,40,95],[19,5,39],36],network:[[105,95,115],[0,12,8],36],tuas:[[105,85,115],[0,15,5],34]};
const camera=(id:string)=>{const [position,target,fov]=cams[id]!;return {position,target,fov};};
for(const p of parts)p.clip=p.id==='working-box';
const data={parts,groups:[['vessel','Vessel','船舶'],['quay-crane','Quay crane','岸桥'],['transfer','Transfer','水平运输'],['yard','Yard','堆场'],['trace','Box trace','箱子路径']].map(([id,en,zh])=>({id,name:text(en!,zh!),color:'token:ink-2'})),views:{assembled:{camera:camera('hero')},cover:camera('hero'),shadows:'contact',cuts:{'box-half':{normal:[0,0,-1],offset:-18,label:text('Container section','箱体剖面')}}},presets:Object.keys(cams).map(id=>({id:id==='yard'?'yard-view':id,label:text(...({hero:['Whole port','港口全景'],box:['Boxes','集装箱'],lift:['Crane','岸桥'],yard:['Yard','堆场'],network:['Connection','转运联系'],tuas:['Automation','自动化']} as Record<string,[string,string]>)[id]!),camera:camera(id)})),poses,sim,spec:[{key:text('Container','箱型'),value:'20 / 40 ft',tag:'typical'},{key:text('Model width','模型箱宽'),value:'2.438 m',tag:'design'}]};
partsFile.parse(data);
writeFileSync('src/content/topics/container-port/data/parts.json',JSON.stringify(data,null,2)+'\n');
console.log(`container-port: ${parts.filter(p=>!p.context).length} parts + ${parts.filter(p=>p.context).length} context, ${Object.keys(poses).length} poses; schema valid`);
