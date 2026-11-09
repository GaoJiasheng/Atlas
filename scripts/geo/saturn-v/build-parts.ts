/** Apollo 11 configuration study, metres. Run: pnpm tsx scripts/geo/saturn-v/build-parts.ts.
 * NASA references inspected: refs/stack.png, stages.png, lm.png, lm-front.png, csm.png.
 * S25/S26 constrain topology and nominal dimensions. S90 owns illustrative coordinates,
 * terminal configurations, simplified storage, compressed stowed gear, flow speed and ideal table.
 * No flight dynamics, independently solved landing hinges, temperature or fuel-depletion model.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { rebuildMuseum } from './bake-museum';
import {sicFeeds} from './apollo11-geometry';
import { partsFile } from '../../../src/engines/space-scene/schema';

type V3 = [number, number, number];
type V2 = [number, number];
type Prim = { kind: string; at: V3; color: string; [key: string]: unknown };
type Part = { id: string; group: string; name: {en:string;zh:string}; summary: {en:string;zh:string}; detail: {en:string;zh:string}; primitive: Prim; extra?: Prim[]; repeat?: Record<string, unknown>; shell?: boolean; clip?: boolean; explode: {dir:V3;dist:number}; connects: string[]; castShadow: boolean };
const bi = (en: string, zh: string) => ({ en, zh });
const p = (kind: string, at: V3, color: string, fields: Record<string, unknown>): Prim => ({ kind, at, color, ...fields });
const lathe = (at: V3, profile: V2[], color = 'steel', fields: Record<string, unknown> = {}) => p('lathe', at, color, {profile, segments:64, ...fields});
const cyl = (at:V3,r:number,h:number,color='steel') => p('cylinder',at,color,{size:[r,r,h]});
const torus = (at:V3,r:number,t:number,color='steel') => p('torus',at,color,{size:[r,t],rotation:[90,0,0]});
const box = (at:V3,size:V3,color='steel',fields:Record<string,unknown>={}) => p('bevelBox',at,color,{size,bevel:Math.min(.025,Math.min(...size)/4),...fields});
const tube = (at:V3,path:V3[],r:number,color='steel') => p('tube',at,color,{path,radius:r,bendRadius:r*2});
const extrude = (at:V3,shape:V2[],depth:number,color='steel',fields:Record<string,unknown>={})=>p('extrude',at,color,{shape,depth,bevel:0.01,...fields});
/** A thin closed annular wall, never a solid-cylinder substitute for a shell. */
const wall = (at:V3,r:number,h:number,color='enamel',fields:Record<string,unknown>={})=>lathe(at,[[r,-h/2],[r,h/2],[r-.08,h/2],[r-.08,-h/2],[r,-h/2]],color,fields);
/** Hollow bell: mouth at -h/2, throat toward +Y; both surfaces and lip are explicit. */
const bell = (at:V3,r:number,h:number,color='steel')=>lathe(at,[
 [r,-h/2],[r*.96,-h*.36],[r*.83,-h*.15],[r*.65,h*.06],[r*.42,h*.28],[r*.24,h*.42],[r*.25,h/2],
 [r*.20,h/2],[r*.19,h*.42],[r*.37,h*.28],[r*.60,h*.06],[r*.78,-h*.15],[r*.91,-h*.36],[r*.95,-h/2],[r,-h/2],
],color);
const ring = (at:V3,r:number,h=.12,color='steel')=>wall(at,r,h,color);
const radial = (count:number,radius:number)=>({count,axis:[0,1,0],radius});
const parts:Part[]=[];
const directions:Record<string,{dir:V3;dist:number}>={
 'stage-one':{dir:[-1,0,0],dist:12},'upper-stages':{dir:[1,0,0],dist:12},
 'guidance-adapter':{dir:[0,0,1],dist:6},'return-craft':{dir:[1,0,0],dist:16},lander:{dir:[-1,0,0],dist:16},
};
function add(id:string,group:string,en:string,zh:string,summaryEn:string,summaryZh:string,detailEn:string,detailZh:string,primitive:Prim,options:Partial<Part>={}){
 const item:Part={id,group,name:bi(en,zh),summary:bi(summaryEn,summaryZh),detail:bi(detailEn,detailZh),primitive,explode:directions[group]!,connects:[],castShadow:false,...options};parts.push(item);return item;
}

// S-IC: the bottom engine mouth reaches y=0; body ends at 42.06 m.
const sicSkin=wall([0,23.78,0],5.03,36.56);
sicSkin.profile=[[5.03,-18.28],[5.03,18.28],[4.95,18.28],[4.95,-18.28],[5.03,-18.28]];
add('sic-shell','stage-one','S-IC structure','S-IC承力外壳','Supports tanks and carries thrust upwards.','支撑储箱，把推力传向上方。','The first-stage structure joins the tanks and engines to the rocket above. It follows the nominal Apollo 11 arrangement, simplified. To inspect it after separation, return to a beat that shows this stage. [S25, S90]','第一级结构把储箱、发动机和上方箭体连起来，形状依据阿波罗11号的名义构型并经过简化。分离后若想查看它，先回到显示第一级的节拍。[S25, S90]',sicSkin,{shell:true,connects:['sic-fuel','sic-oxidiser','f1-centre','f1-outer','sii-shell'],extra:[ring([0,8.1,0],5.05,.28),ring([0,23.3,0],5.05,.20),ring([0,41.9,0],5.05,.28)]});
add('sic-fuel','stage-one','S-IC kerosene tank','S-IC煤油箱','Stores RP-1 kerosene for five F-1 engines.','为五台F-1储存RP-1煤油。','The lower tank feeds kerosene to the first-stage engines. The upper tank holds liquid oxygen separately. The model uses shallower curved tank ends so the tanks stay apart. [S25, S90]','下方储箱把煤油送往第一级发动机，上方储箱单独装液氧。模型把弧形封头画浅，让两箱保持分开。[S25, S90]',p('vessel',[0,16,0],'steel',{radius:4.6,length:11,headRatio:.35,tint:'token:holder-4'}),{connects:['f1-centre','f1-outer'],explode:{dir:[-12,0,2],dist:Math.hypot(12,2)}});
add('sic-oxidiser','stage-one','S-IC oxygen tank','S-IC液氧箱','Carries oxygen for burning fuel.','携带燃烧所需的氧。','The upper first-stage tank supplies liquid oxygen as oxidiser. In the cutaway, its five feed lines run down through the kerosene tank to the engines. Smaller pipework is left out. [S25, S90]','第一级上方储箱供应液氧氧化剂。剖面中，五根供氧管穿过煤油箱通往发动机，省略较细的管路。[S25, S90]',p('vessel',[0,33,0],'steel',{radius:4.6,length:13,headRatio:.35,tint:'token:holder-2'}),{connects:['f1-centre','f1-outer'],explode:{dir:[-12,0,-2],dist:Math.hypot(12,2)}});
const f1=bell([0,2.75,0],1.85,5.5);
const f1Extra=[cyl([0,5.9,0],.55,.8),torus([0,1.2,0],1.68,.07),tube([0,4.9,0],[[.35,0,0],[1.05,-.7,0],[1.2,-1.9,0]],.14)];
add('f1-centre','stage-one','Central F-1 engine','中央F-1发动机','Burns kerosene and oxygen to produce thrust.','燃烧煤油和氧，产生推力。','One fixed central F-1 and four outer F-1s make five engines. Look inside the hollow nozzle for its narrow throat and wider rim. The nozzle shape and feed equipment are simplified. [S25, S90]','中央一台固定F-1加外围四台，共五台。空心喷管里可见较窄的喉部和较宽的边缘，形状与供料设备经过简化。[S25, S90]',f1,{extra:f1Extra,connects:['sic-fuel','sic-oxidiser']});
add('f1-outer','stage-one','Four outer F-1 engines','外围四台F-1发动机','Add thrust and swivel to help steer.','增加推力，可偏转控制方向。','Four F-1s surround the fixed central engine. In the model, their mounting radius is 3.8 m and the smallest gap between nozzle rims is 0.10 m. The bells extend beyond the tank cylinder but stay within the fins’ outer reach. Steering movement is not shown. [S25, S90]','四台F-1围绕固定的中央发动机。模型安装半径为3.8米，喷口边缘最小间隙为0.10米。喷管超出储箱圆筒，但未超出尾翼外缘。画面不演示偏转。[S25, S90]',structuredClone(f1),{extra:structuredClone(f1Extra),repeat:radial(4,3.8),connects:['sic-fuel','sic-oxidiser']});
add('sic-fins','stage-one','Four stabilising fins','四片稳定尾翼','Help stabilise the rocket in air.','帮助火箭在大气中保持稳定。','Four fins extend from the first stage. They help stabilise the rocket as it travels through the atmosphere. Their shape follows the nominal Apollo 11 arrangement, simplified. Return to a first-stage beat to inspect them after separation. [S25, S90]','四片尾翼伸出第一级，帮助火箭穿过大气层时保持稳定，形状依据阿波罗11号的名义构型并经过简化。分离后，先回到第一级仍在的节拍，再查看尾翼。[S25, S90]',extrude([0,4.8,0],[[0,-2.2],[1.8,-2.2],[1.8,-.9],[0,3.2]],.14,'enamel',{rotation:[0,90,0]}),{repeat:radial(4,5.03),clip:false,connects:['sic-shell']});

// S-II five J-2s and a single, shared bulkhead at y=53.5. The fuel owns it;
// the oxidiser stops 0.04 m short, rather than drawing intersecting vessel heads.
add('sii-shell','upper-stages','S-II structure','S-II承力外壳','Joins the second-stage engines and tanks.','连接第二级发动机与储箱。','The second-stage structure connects five hydrogen–oxygen engines, their tanks and the upper rocket. It follows the nominal Apollo 11 arrangement, simplified. It separates with the stage after its work is done. [S25, S90]','第二级结构连接五台氢氧发动机、储箱和上方箭体，依据阿波罗11号的名义构型并经过简化。完成工作后随这一级分离。[S25, S90]',wall([0,54.48,0],5.03,24.84),{shell:true,connects:['sii-fuel','sii-oxidiser','j2-centre','j2-outer','sivb-shell'],extra:[ring([0,46.0,0],5.05,.25),ring([0,66.7,0],5.05,.25)]});
add('sii-fuel','upper-stages','S-II hydrogen tank','S-II液氢箱','Stores liquid hydrogen for the second stage.','为第二级储存液氢。','The large upper tank stores hydrogen. A shared insulated divider separates it from oxygen below. The model shows one divider. At launch its edge is 50.6 m above the bottom of the engines, and it curves upward from there. The ends of the two tanks do not overlap. [S25, S90]','较大的上方储箱装液氢，与下方液氧箱共用隔热底板。模型只画一道分隔面。发射时，它的边缘在发动机底部上方50.6米处，从那里向上拱起；两个储箱的端部不重叠。[S25, S90]',lathe([0,59,0],[[0,-5.5],[4.5,-5.5],[4.5,3.6],[4.2,4.7],[3.0,5.8],[0,6.2]],'steel',{tint:'token:holder-4'}),{connects:['sii-oxidiser','j2-centre','j2-outer'],explode:{dir:[12,0,2],dist:Math.hypot(12,2)}});
add('sii-oxidiser','upper-stages','S-II oxygen tank','S-II液氧箱','Stores oxygen for five second-stage J-2s.','为第二级五台J-2储存液氧。','Liquid oxygen sits below the hydrogen tank. A common insulated divider keeps the two propellants separate. The model leaves out the divider’s detailed layers and structure. [S25, S90]','液氧位于液氢箱下方，共用的隔热底板让两种推进剂分开。模型省略底板的详细分层和结构。[S25, S90]',lathe([0,49,0],[[0,-2],[2.8,-1.8],[4.2,-1.0],[4.5,0],[4.5,4.46],[0,4.46]],'steel',{tint:'token:holder-2'}),{connects:['sii-fuel','j2-centre','j2-outer'],explode:{dir:[12,0,-2],dist:Math.hypot(12,2)}});
const j2=bell([0,44,0],1,3);
add('j2-centre','upper-stages','Central S-II J-2','S-II中央J-2','Adds thrust at the centre of the second stage.','在第二级中央提供推力。','One fixed central J-2 works with four outer J-2s. All burn liquid hydrogen and liquid oxygen. The hollow nozzle shape is simplified. [S25, S90]','固定的中央J-2与外围四台一起工作，均燃烧液氢和液氧。空心喷管形状经过简化。[S25, S90]',j2,{connects:['sii-fuel','sii-oxidiser'],extra:[cyl([0,45.7,0],.32,.6)]});
add('j2-outer','upper-stages','Four outer S-II J-2s','S-II外围四台J-2','Add thrust and swivel for control.','提供推力，可偏转控制方向。','Four outer J-2s and one central engine make five. The model places the outer engines on a 2.5 m mounting radius so their nozzles stay apart. It does not animate steering. [S25, S90]','外围四台加中央一台，共五台。模型安装半径为2.5米，让喷管保持分开，不演示偏转。[S25, S90]',structuredClone(j2),{repeat:radial(4,2.5),connects:['sii-fuel','sii-oxidiser'],extra:[cyl([0,45.7,0],.32,.6)]});
// S-IVB interstage contracts from the 10.06 m lower diameter to the 6.61 m body.
add('sivb-shell','upper-stages','S-IVB structure','S-IVB承力外壳','Supports the third-stage engine and spacecraft.','支撑第三级发动机和飞船。','The third-stage structure carries one restartable engine, its tanks and the spacecraft above. It follows the nominal Apollo 11 arrangement, simplified. Return to a third-stage beat to inspect it after separation. [S25, S90]','第三级结构支撑一台可重启发动机、储箱和上方飞船，依据阿波罗11号的名义构型并经过简化。分离后先回到第三级仍在的节拍，再查看它。[S25, S90]',wall([0,78.1,0],3.305,13.14),{shell:true,connects:['sivb-fuel','sivb-oxidiser','sivb-engine','iu-ring'],extra:[lathe([0,69.2,0],[[5.03,-2.3],[3.305,2.3],[3.225,2.3],[4.95,-2.3],[5.03,-2.3]],'enamel'),ring([0,84.5,0],3.325,.24)]});
add('sivb-fuel','upper-stages','S-IVB hydrogen tank','S-IVB液氢箱','Stores hydrogen for Earth orbit and departure.','储存入轨和出发所用的液氢。','A shared divider separates hydrogen above from oxygen below. In the model its edge is 73.5 m above the bottom of the engines, and it curves upward from there. Both burns draw on these tanks and use the same J-2 engine. [S25, S90]','共用底板把上方液氢与下方液氧分开。模型中，它的边缘在发动机底部上方73.5米处，从那里向上拱起。两次燃烧都取用这些储箱，使用同一台J-2。[S25, S90]',lathe([0,80,0],[[0,-5],[2.9,-5],[2.9,2.0],[2.5,2.8],[0,3.4]],'steel',{tint:'token:holder-4'}),{connects:['sivb-oxidiser','sivb-engine'],explode:{dir:[12,0,2],dist:Math.hypot(12,2)}});
add('sivb-oxidiser','upper-stages','S-IVB oxygen tank','S-IVB液氧箱','Supplies oxygen to the third-stage J-2.','向第三级J-2供应液氧。','The lower tank supplies liquid oxygen. The cutaway keeps it separate from the hydrogen above, stopping its top face 0.04 m below the shared divider so the shapes do not overlap, and shows the feed layout. It simplifies the tank walls and pipework. [S25, S90]','下方储箱供应液氧。剖面把它与上方液氢分开，上表面止于共用底板下方0.04米，轮廓不会相互穿入，并显示供料布局，并简化储箱壁和管路。[S25, S90]',lathe([0,72,0],[[0,-1.2],[1.9,-1.0],[2.7,-.4],[2.9,.2],[2.9,2.96],[0,2.96]],'steel',{tint:'token:holder-2'}),{connects:['sivb-fuel','sivb-engine'],explode:{dir:[12,0,-2],dist:Math.hypot(12,2)}});
add('sivb-engine','upper-stages','Single S-IVB J-2','S-IVB单台J-2','Starts Earth orbit, then restarts for the Moon.','先帮助入地球轨道，再重启送往月球。','The third stage has one J-2 engine. It fires to help establish Earth orbit, then restarts to send Apollo towards the Moon. The hollow nozzle is simplified. [S25, S90]','第三级只有一台J-2，先点火帮助进入地球轨道，再次启动把阿波罗送向月球。空心喷管经过简化。[S25, S90]',bell([0,68.8,0],1,3),{connects:['sivb-fuel','sivb-oxidiser']});

add('iu-ring','guidance-adapter','Instrument unit','仪器舱','Measures motion and guides the rocket.','测量运动，引导火箭。','This ring sits between the third stage and the spacecraft adapter. It holds guidance and control equipment in racks around the inside of the ring. Its job is control: it is not another stage with main engines. [S25, S90]','这个环位于第三级与飞船适配器之间，环的内侧排着装制导控制设备的机架。它负责控制，不是另一个装主发动机的级。[S25, S90]',wall([0,85.13,0],3.305,.92,'steel'),{connects:['sivb-shell','sla-shell'],extra:[box([2.8,85.13,0],[.45,.5,1.1]),box([-2.8,85.13,0],[.45,.5,1.1])]});
const slaProfile:V2[]=[[3.305,-4.205],[1.95,4.205],[1.87,4.205],[3.225,-4.205],[3.305,-4.205]];
add('sla-shell','guidance-adapter','Spacecraft–LM adapter','飞船—登月舱适配器','Encloses the folded lander at launch.','发射时包住收拢的登月舱。','The adapter links the third stage and instrument unit to the service module. Four tapered panels enclose one lunar module. Click the beats to see the panels removed and the lander extracted. [S25, S26, S90]','适配器把第三级和仪器舱连接到服务舱。四片渐缩面板包住一艘登月舱。点击节拍，观察面板移除、登月舱抽出的顺序。[S25, S26, S90]',lathe([0,89.795,0],slaProfile,'enamel',{arc:89.4}),{shell:true,connects:['iu-ring','sm-shell','lm-descent'],extra:[90,180,270].map(a=>lathe([0,89.795,0],slaProfile,'enamel',{arc:89.4,rotation:[0,a,0]}))});

// CM/SM are authored in one launch frame. Every configuration applies one shared rigid matrix.
const cmSkin=lathe([0,102.5,0],[[1.95,-1.5],[.44,1.5],[.36,1.5],[1.87,-1.5],[1.95,-1.5]],'enamel');
const cmWindows:Prim[]=[];
// Two forward rendezvous panes, a hatch pane and two side panes, based on S25 CSM layout.
for(const a of [-62,-26,0,26,62]){
 const rad=a*Math.PI/180;const y=a===0?102.15:102.75;const r=1.95-(y-101)*1.51/3+.035;
 cmWindows.push(extrude([Math.sin(rad)*r,y,Math.cos(rad)*r],[[-.13,-.16],[.13,-.16],[.11,.16],[-.11,.16]],.045,'glass',{rotation:[-27,a,0]}));
}
add('cm-shell','return-craft','Command module cabin','指令舱乘员舱','Carries three astronauts home through the atmosphere.','搭载三名宇航员穿过大气层返回。','The cone joins the service module above the heat shield. Five window positions follow the overall Apollo layout. Cabin equipment, wall layers and hatch mechanisms are simplified. The front compartment cover belongs to the cone and is separate from the docking probe. [S25, S90]','锥形舱在防热盾上方与服务舱相接，五处舷窗依据阿波罗总体布局。舱内设备、壁层和舱门机构简化。前舱盖属于锥形舱，与对接探杆分开。[S25, S90]',cmSkin,{shell:true,extra:cmWindows,connects:['cm-heatshield','cm-couches','cm-probe','sm-shell']});
add('cm-heatshield','return-craft','Blunt heat shield','钝头防热盾','Protects the cabin during atmospheric entry.','进入大气层时保护乘员舱。','The broad, blunt shield returns with the cabin after the service module separates. Cutaway keeps its protective surface whole. The model shows its position without calculating entry heat, loss of shield material or trajectory. [S25, S90]','服务舱分离后，宽而钝的防热盾随乘员舱返回。剖视保留完整的保护面，显示它的位置，不计算再入热量、防热材料消耗或轨迹。[S25, S90]',lathe([0,101,0],[[0,-.23],[.8,-.20],[1.65,-.12],[1.95,0],[1.95,.12],[0,.12]],'abrasive'),{clip:false,connects:['cm-shell','sm-shell']});
add('cm-couches','return-craft','Three crew couches','三个乘员座位','Support the crew during launch and return.','发射和返回时支撑乘员。','Three couches fit inside the command module and move with it. Cushions, backs and restraints are simplified. People and full control panels are left out so the seats stay visible. [S25, S90]','指令舱内有三个座位，随舱体一起移动。坐垫、靠背和约束装置经过简化。画面省去人物和完整控制面板，让座位看得清楚。[S25, S90]',box([0,101.85,.25],[.53,.16,1.3],'fabric',{rotation:[-12,0,0]}),{repeat:{count:3,axis:[1,0,0],spacing:.65},extra:[box([0,102.18,-.3],[.53,.75,.16],'fabric',{rotation:[-22,0,0]})],clip:false,connects:['cm-shell']});
add('cm-probe','return-craft','Docking probe','对接探杆','Guides the cabins into docking position.','引导两舱进入对接位置。','The command-module probe meets the lunar module’s docking port. In the launch model its tip is 102.3 m above the bottom of the engines. The docking views bring it to the port, 92.5 m above the bottom of the engines. It is separate from the cone’s front cover. The homeward and return views hide the probe. [S25, S90]','指令舱探杆接上登月舱对接口。在发射模型中，探杆尖端在发动机底部上方102.3米处；对接画面把它送到发动机底部上方92.5米处的接口。它与锥形舱的前舱盖分开，在返航和返回画面中隐藏。[S25, S90]',tube([0,104.2,0],[[0,-.2,0],[0,.5,0]],.065),{extra:[p('cone',[0,104.71,0],'steel',{size:[.16,.18]})],clip:false,connects:['cm-shell','lm-docking-port']});
add('sm-shell','return-craft','Service module structure','服务舱结构','Carries propulsion and support equipment.','承载推进和支持设备。','The cylindrical service module stays attached to the command module as they turn and dock. It has no solar wings. Four thruster clusters, radiator panels and a dish antenna appear outside; pipework is simplified. [S25, S90]','圆柱形服务舱在转身和对接时与指令舱保持连接，没有太阳翼。外部有四组小推力器、散热板和一副碟形天线，管路简化。[S25, S90]',wall([0,97.5,0],1.95,7),{shell:true,connects:['cm-shell','sm-tanks','sm-engine'],extra:[ring([0,100.7,0],1.97,.2),ring([0,94.3,0],1.97,.2),...[0,1,2,3].flatMap(k=>{const a=k*Math.PI/2;return [box([2*Math.sin(a),99.2,2*Math.cos(a)],[.3,.35,.35]),box([1.96*Math.sin(a),96.6,1.96*Math.cos(a)],[.4,1.8,.06],'enamel',{rotation:[0,k*90,0]})];})]});
add('sm-tanks','return-craft','Service storage','服务舱储存设备','Stores propulsion and crew-support supplies.','储存推进和乘员支持物资。','These vessels hold supplies for the service engine and crew cabin. Four large propellant tanks, three fuel cells and the oxygen and hydrogen tanks sit in separate bays. They move with the command and service modules. [S25, S90]','这些储罐储存服务发动机和乘员舱所需物资。四个大推进剂储箱、三组燃料电池以及氧、氢储罐分装在不同舱位，随指令舱、服务舱一起移动。[S25, S90]',p('vessel',[.9,97.6,0],'steel',{radius:.6,length:3.3,headRatio:.5}),{extra:[p('vessel',[-.9,97.6,0],'steel',{radius:.6,length:3.3,headRatio:.5})],connects:['sm-engine','cm-shell']});
add('sm-engine','return-craft','Service propulsion engine','服务推进发动机','Changes the spacecraft’s motion on the lunar journey.','在月球往返途中改变飞船运动。','One main engine sits below the service module. Its hollow nozzle turns with the connected command and service modules when they face the lander. [S25, S90]','一台主发动机接在服务舱下方。两舱转向登月舱时，空心喷管也随整体转动。[S25, S90]',bell([0,94,0],1.15,2.6),{connects:['sm-shell','sm-tanks']});
const lesExtras:Prim[]=[];
for(const s of [-1,1])for(const z of [-1,1])lesExtras.push(tube([0,105.9,0],[[s*.46,-1.6,z*.46],[s*.3,1.4,z*.3]],.045));
lesExtras.push(cyl([0,108.55,0],.38,2.4),p('cone',[0,110.45,0],'enamel',{size:[.38,1.1]}));
add('les-tower','return-craft','Launch escape system','发射逃逸系统','Can pull the cabin away in a launch emergency.','发射紧急时能把乘员舱拉离火箭。','A supporting frame and motor sit above the cabin. At launch, a cover over the cabin protects it and leaves with the tower. The tower’s top reaches the model’s 111 m height. By parking orbit, this system has separated. Emergency operation is not shown. [S25, S90]','支架和发动机位于乘员舱上方。发射时，一个罩子盖住乘员舱加以保护，并随逃逸塔一起离开。逃逸塔顶端达到模型111米总高。进入停泊轨道时，这套系统已分离。画面不演示紧急操作。[S25, S90]',ring([0,104.35,0],.61,.15),{extra:lesExtras,clip:false,connects:['cm-shell']});

// LM: angular pressurised cabin, octagonal descent body, 4 radial landing assemblies,
// a single front ladder, two front windows. The single LM is enclosed by the SLA at launch.
const oct:V2[]=Array.from({length:8},(_,i)=>{const a=(i+.5)*Math.PI/4;return [Math.cos(a)*2.15,Math.sin(a)*2.15] as V2;});
add('lm-descent','lander','Lunar module descent stage','登月舱下降级','Slows the lander and supports it on the Moon.','让登月舱减速，并在月面支撑它。','The octagonal stage carries four legs, a ladder and one descent engine. It stays on the Moon when the ascent stage leaves. It is wrapped in crinkled gold and black insulation. The cutaway shows four propellant tanks around the engine; the wrinkles are drawn, not measured. [S26, S90]','八边形下降级装有四条腿、梯子和一台下降发动机，上升级离开后仍留在月面。它包着起皱的金色和黑色隔热层。剖视可见发动机周围的四个推进剂储箱；褶皱是画出来的，不是实测的。[S26, S90]',extrude([0,88,0],oct,1.8,'brass',{rotation:[90,0,0],holes:[Array.from({length:16},(_,i)=>[.8*Math.cos(i*Math.PI/8),.8*Math.sin(i*Math.PI/8)])]}),{connects:['lm-descent-engine','lm-legs','lm-ladder','lm-ascent']});
add('lm-descent-engine','lander','Descent engine','下降发动机','Provides thrust to slow the lander for touchdown.','提供着陆减速所需的推力。','The descent stage has one engine, which stays with it on the Moon. Its hollow nozzle is separate from the ascent engine above. The model shows both engines without calculating their burns or landing paths. [S26, S90]','下降级有一台发动机，随它留在月面。空心喷管与上方的上升发动机分开。模型显示两台发动机，不计算燃烧过程或着陆轨迹。[S26, S90]',bell([0,86.9,0],.72,1.5),{connects:['lm-descent']});
// Rest geometry is deployed. The per-part XZ compression is a terminal envelope study,
// NOT a hinge solution. Scale about axis x=z=0 compresses repeat offsets consistently.
const legOrigin:V3=[0,87.5,0];
add('lm-legs','lander','Four landing legs','四条着陆支腿','Spread the load across four footpads.','把载荷分散到四个足垫上。','Each of the four legs has a main strut, two braces and a footpad. Three legs also carry a long probe under the footpad that touches the ground first; the ladder leg has none. In the launch model the bottoms of the opened footpads are 85.6 m above the bottom of the engines. In the landed view all four rest on one flat surface. The model shows the legs folded and open; the folded legs are squeezed to fit inside the adapter. It does not show exactly how the hinges move. [S26, S90]','四条腿各有一根主支柱、两根副撑和一个足垫。其中三条腿的足垫下还有一根长探针，会先碰到地面；带梯子的那条腿没有。在发射模型中，展开后的足垫底部在发动机底部上方85.6米处；在着陆画面里，四个足垫都落在同一个平面上。模型显示支腿收拢和展开的样子，收拢的支腿压缩了一些，好放进适配器，不演示铰链的确切运动。[S26, S90]',tube(legOrigin,[[0,-.4,0],[0,-1.79,-2.25]],.11),{repeat:radial(4,2),extra:[tube([0,87.5,0],[[-.75,-.4,.45],[0,-1.25,-1.85]],.065),tube([0,87.5,0],[[.75,-.4,.45],[0,-1.25,-1.85]],.065),cyl([0,85.68,-2.25],.46,.16,'steel')],clip:false,connects:['lm-descent','lm-ladder']});
const cabin:V2[]=[[-1.15,-1.1],[1.15,-1.1],[1.6,-.35],[1.28,.95],[.5,1.35],[-.55,1.35],[-1.35,.8],[-1.55,-.3]];
add('lm-ascent','lander','Lunar module ascent cabin','登月舱上升舱','Carries two astronauts back to lunar orbit.','搭载两名宇航员返回月球轨道。','The angular cabin holds the crew, who work standing. Its front hatch, two windows, top docking port, radar dish, antennas and four thruster clusters move with it. The model follows the Apollo 11 lunar module, Eagle; detailed support equipment is simplified. [S26, S90]','有棱角的舱体容纳站立工作的乘员。前舱门、两扇窗、顶部对接口、雷达天线、其他天线和四组小推力器随它一起移动。模型依据阿波罗11号登月舱“鹰”号，详细支持设备简化。[S26, S90]',extrude([0,90.6,0],cabin,2.45,'steel'),{shell:true,extra:[box([0,90.05,1.26],[.81,.81,.05],'enamel'),box([0,90.5,-1.3],[2.7,1.4,.7],'steel'),p('sphere',[-1.58,90.1,-.15],'steel',{size:[.48],scale:[1,1.35,1]}),p('sphere',[1.58,90.1,-.15],'steel',{size:[.48],scale:[1,1.35,1]})],connects:['lm-descent','lm-ascent-engine','lm-windows','lm-docking-port']});
add('lm-ascent-engine','lander','Ascent engine','上升发动机','Lifts the ascent stage from the platform.','把上升级从下降平台送离。','One small nozzle sits in the central opening above the descent engine. It belongs to the ascent stage and leaves with it. The ascent and descent stages each have their own engine. [S26, S90]','一个小喷管位于下降发动机上方的中央开口，属于上升级并随它离开。上升级和下降级各有自己的发动机。[S26, S90]',bell([0,89,0],.43,.8),{connects:['lm-ascent']});
add('lm-windows','lander','Two forward windows','两扇前窗','Let the standing crew see the landing area.','让站立的乘员看见着陆区。','Two triangular windows sit above the central hatch and move with the ascent cabin. You can select both as one part. The model leaves out the overhead docking window. [S26, S90]','两扇三角窗位于中央舱门上方，随上升舱移动，可作为一个零件选择。模型省去顶部对接窗。[S26, S90]',extrude([-.68,91.12,1.25],[[-.37,.25],[.37,.25],[.2,-.28]],.045,'glass'),{extra:[extrude([.68,91.12,1.25],[[-.37,.25],[.37,.25],[-.2,-.28]],.045,'glass')],clip:false,connects:['lm-ascent']});
const ladderExtra:Prim[]=[tube([0,87,2.6],[[.25,1.55,-.45],[.25,-1.2,1.9]],.045)];
for(let i=0;i<9;i++){const k=i/8;ladderExtra.push(tube([0,87,2.6],[[-.25,1.5-k*2.65,-.4+k*2.25],[.25,1.5-k*2.65,-.4+k*2.25]],.035));}
add('lm-ladder','lander','Single forward ladder','唯一的前方舷梯','Provides a route down the front leg.','提供沿前方支腿下行的通路。','Only the front leg carries a ladder. It stays with the descent stage on the Moon. In the model, the folded ladder is compressed with the legs and its rung spacing is simplified. [S26, S90]','只有前方支腿带梯子，它随下降级留在月面。模型中收拢的梯子与支腿一起压缩，横档间距简化。[S26, S90]',tube([0,87,2.6],[[-.25,1.55,-.45],[-.25,-1.2,1.9]],.045),{extra:ladderExtra,clip:false,connects:['lm-descent','lm-legs']});
add('lm-docking-port','lander','LM docking port','登月舱对接口','Receives the probe and connects the cabins.','接纳探杆，连接两舱。','The port on top of the lunar module meets the command-module probe during docking, extraction and rendezvous. At launch its centre is 92.5 m above the bottom of the engines. An open ring shows the passage between cabins. Seals and moving latches are left out. [S25, S26, S90]','登月舱顶部接口在对接、抽取和交会时接上指令舱探杆。发射时，它的中心离发动机底部 92.5 米。开环显示两舱之间的通道，省去密封件和活动锁扣。[S25, S26, S90]',torus([0,92.5,0],.42,.09),{extra:[wall([0,92.26,0],.48,.45)],clip:false,connects:['lm-ascent','cm-probe']});

export const PHASE_POSES:Record<string,string>={launch:'launch-packed','first-off':'upper-stack',parking:'parking-stack',translunar:'translunar-stack',separated:'csm-clear',turned:'csm-turned',docked:'nose-to-lm',extracted:'csm-lm-extracted',lunar:'lm-landed',ascent:'lm-ascent',rendezvous:'rendezvous',homeward:'homeward-csm',return:'return-cm'};
export const DOCKING={probe:[0,102.3,0] as V3,port:[0,92.5,0] as V3,csmPivot:[0,99,0] as V3,landedOffset:[0,-85.6,0] as V3};
const csmIds=parts.filter(x=>x.id.startsWith('cm-')||x.id.startsWith('sm-')).map(x=>x.id);
const lmIds=parts.filter(x=>x.group==='lander').map(x=>x.id);
const ascentIds=['lm-ascent','lm-ascent-engine','lm-windows','lm-docking-port'];
type Transform={pivot?:V3;rotation?:V3;offset?:V3;scale?:V3};
const poses:Record<string,Record<string,Transform|number>>={};
function rigid(pose:Record<string,Transform|number>,ids:string[],pivot:V3,rotation:V3,offset:V3){for(const id of ids)pose[id]={pivot,rotation,offset};}
for(const [phase,name] of Object.entries(PHASE_POSES)){
 const pose:Record<string,Transform|number>={duration:.8};
 // Explicit rest entries prevent any reliance on the previous beat.
 for(const part of parts)pose[part.id]={pivot:part.primitive.at,rotation:[0,0,0],offset:[0,0,0],scale:[1,1,1]};
 const gearPivot:V3=[0,87.5,0];
 if(!['lunar','ascent','rendezvous'].includes(phase)){
  pose['lm-legs']={pivot:gearPivot,scale:[.5,1,.5],rotation:[0,0,0],offset:[0,0,0]};
  pose['lm-ladder']={pivot:[0,87.5,2.15],scale:[1,1,.3],rotation:[0,0,0],offset:[0,0,0]};
 }
 if(phase==='separated')rigid(pose,csmIds,DOCKING.csmPivot,[0,0,0],[15,0,0]);
 if(phase==='turned')rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[15,0,0]);
 // R_x(180) moves the probe to y=95.7, so -3.2 brings it exactly onto the LM port.
 if(['docked','extracted'].includes(phase))rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-3.2,0]);
 if(phase==='extracted'){
  rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-88.2,0]);
  for(const id of lmIds){const entry=pose[id] as Transform;pose[id]={...entry,offset:[0,-85,0]};}
 }
 if(['lunar','ascent','rendezvous'].includes(phase)){
  for(const id of lmIds)pose[id]={pivot:gearPivot,rotation:[0,0,0],offset:DOCKING.landedOffset,scale:[1,1,1]};
  rigid(pose,csmIds,DOCKING.csmPivot,[0,0,0],[22,-89,0]);
 }
 if(['ascent','rendezvous'].includes(phase))for(const id of ascentIds)pose[id]={pivot:gearPivot,rotation:[0,0,0],offset:[0,-77.6,0],scale:[1,1,1]};
 if(phase==='rendezvous')rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-80.8,0]);
 if(phase==='homeward')rigid(pose,csmIds,DOCKING.csmPivot,[0,0,0],[0,-91.5,0]);
 if(phase==='return')rigid(pose,csmIds,[0,100,0],[0,0,155],[0,-97.5,0]);
 poses[name]=pose;
}

// Frozen from the reviewed preparation table (18 ideal + 3 stage + 13 phase rows).
const sim = {
  "kind": "table",
  "controls": [
    {
      "id": "payload",
      "kind": "step",
      "values": [
        100,
        200,
        300
      ],
      "default": 200,
      "label": {
        "en": "Payload",
        "zh": "载荷"
      },
      "unit": "kg"
    },
    {
      "id": "propellant",
      "kind": "step",
      "values": [
        200,
        400,
        600
      ],
      "default": 600,
      "label": {
        "en": "Propellant",
        "zh": "推进剂"
      },
      "unit": "kg"
    },
    {
      "id": "carry-inert",
      "kind": "toggle",
      "default": false,
      "label": {
        "en": "Carry extra 100 kg",
        "zh": "多带100千克结构"
      }
    },
    {
      "id": "stage-choice",
      "kind": "choice",
      "default": "first",
      "label": {
        "en": "Stage",
        "zh": "主推进级"
      },
      "options": [
        {
          "id": "first",
          "label": {
            "en": "First",
            "zh": "第一级"
          }
        },
        {
          "id": "second",
          "label": {
            "en": "Second",
            "zh": "第二级"
          }
        },
        {
          "id": "third",
          "label": {
            "en": "Third",
            "zh": "第三级"
          }
        }
      ]
    },
    {
      "id": "phase",
      "kind": "choice",
      "default": "launch",
      "label": {
        "en": "Configuration",
        "zh": "构型"
      },
      "options": [
        {
          "id": "launch",
          "label": {
            "en": "Launch",
            "zh": "发射构型"
          }
        },
        {
          "id": "first-off",
          "label": {
            "en": "First stage separated",
            "zh": "一级分离"
          }
        },
        {
          "id": "parking",
          "label": {
            "en": "Earth parking orbit",
            "zh": "地球停泊轨道"
          }
        },
        {
          "id": "translunar",
          "label": {
            "en": "Towards the Moon",
            "zh": "向月球出发"
          }
        },
        {
          "id": "separated",
          "label": {
            "en": "Spacecraft separated",
            "zh": "飞船分离"
          }
        },
        {
          "id": "turned",
          "label": {
            "en": "Spacecraft turned",
            "zh": "飞船转身"
          }
        },
        {
          "id": "docked",
          "label": {
            "en": "Docked",
            "zh": "完成对接"
          }
        },
        {
          "id": "extracted",
          "label": {
            "en": "Lander extracted",
            "zh": "抽出登月舱"
          }
        },
        {
          "id": "lunar",
          "label": {
            "en": "On the Moon",
            "zh": "月面构型"
          }
        },
        {
          "id": "ascent",
          "label": {
            "en": "Ascent stage rising",
            "zh": "上升级升空"
          }
        },
        {
          "id": "rendezvous",
          "label": {
            "en": "Lunar-orbit rendezvous",
            "zh": "月球轨道交会"
          }
        },
        {
          "id": "homeward",
          "label": {
            "en": "Homeward",
            "zh": "返航构型"
          }
        },
        {
          "id": "return",
          "label": {
            "en": "Return",
            "zh": "指令舱返回"
          }
        }
      ]
    }
  ],
  "outputs": [
    {
      "id": "initial-mass",
      "label": {
        "en": "Initial mass",
        "zh": "初始质量"
      },
      "unit": "kg",
      "decimals": 0,
      "tag": "sim"
    },
    {
      "id": "final-mass",
      "label": {
        "en": "Final mass",
        "zh": "最终质量"
      },
      "unit": "kg",
      "decimals": 0,
      "tag": "sim"
    },
    {
      "id": "ideal-dv",
      "label": {
        "en": "Ideal speed change",
        "zh": "理想速度变化"
      },
      "unit": "m/s",
      "decimals": 2,
      "tag": "sim"
    },
    {
      "id": "engine-count",
      "label": {
        "en": "Main engines",
        "zh": "主发动机"
      },
      "unit": "",
      "decimals": 0,
      "tag": "typical"
    },
    {
      "id": "fuel-name",
      "label": {
        "en": "Fuel",
        "zh": "燃料"
      },
      "kind": "state",
      "states": {
        "kerosene": {
          "en": "Kerosene",
          "zh": "煤油"
        },
        "hydrogen": {
          "en": "Liquid hydrogen",
          "zh": "液氢"
        }
      }
    },
    {
      "id": "oxygen-name",
      "label": {
        "en": "Oxidiser",
        "zh": "氧化剂"
      },
      "kind": "state",
      "states": {
        "liquid-oxygen": {
          "en": "Liquid oxygen",
          "zh": "液氧"
        }
      }
    },
    {
      "id": "show-sic",
      "label": {
        "en": "Show first stage",
        "zh": "显示第一级"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-sii",
      "label": {
        "en": "Show second stage",
        "zh": "显示第二级"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-upper",
      "label": {
        "en": "Show third stage and instrument unit",
        "zh": "显示第三级与仪器舱"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-sla",
      "label": {
        "en": "Show adapter",
        "zh": "显示适配器"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-cm",
      "label": {
        "en": "Show command module",
        "zh": "显示指令舱"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-probe",
      "label": {
        "en": "Show docking probe",
        "zh": "显示对接探杆"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-sm",
      "label": {
        "en": "Show service module",
        "zh": "显示服务舱"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-lm-descent",
      "label": {
        "en": "Show descent stage",
        "zh": "显示下降级"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-lm-ascent",
      "label": {
        "en": "Show ascent stage",
        "zh": "显示上升级"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    },
    {
      "id": "show-les",
      "label": {
        "en": "Show escape system",
        "zh": "显示逃逸系统"
      },
      "kind": "state",
      "states": {
        "shown": {
          "en": "Shown",
          "zh": "显示"
        },
        "hidden": {
          "en": "Hidden",
          "zh": "隐藏"
        }
      }
    }
  ],
  "table": {
    "experiments": {
      "ideal": {
        "keys": [
          "payload",
          "propellant",
          "carry-inert"
        ],
        "rows": [
          {
            "when": {
              "payload": 100,
              "propellant": 200,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 400,
              "final-mass": 200,
              "ideal-dv": 2079.441541679836
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 100,
              "propellant": 200,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 500,
              "final-mass": 300,
              "ideal-dv": 1532.4768712979721
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 100,
              "propellant": 400,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 600,
              "final-mass": 200,
              "ideal-dv": 3295.8368660043293
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 100,
              "propellant": 400,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 700,
              "final-mass": 300,
              "ideal-dv": 2541.893581161611
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 100,
              "propellant": 600,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 800,
              "final-mass": 200,
              "ideal-dv": 4158.883083359672
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 100,
              "propellant": 600,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 900,
              "final-mass": 300,
              "ideal-dv": 3295.8368660043293
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 200,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 500,
              "final-mass": 300,
              "ideal-dv": 1532.4768712979721
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 200,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 600,
              "final-mass": 400,
              "ideal-dv": 1216.3953243244932
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 400,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 700,
              "final-mass": 300,
              "ideal-dv": 2541.893581161611
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 400,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 800,
              "final-mass": 400,
              "ideal-dv": 2079.441541679836
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 600,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 900,
              "final-mass": 300,
              "ideal-dv": 3295.8368660043293
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 200,
              "propellant": 600,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 1000,
              "final-mass": 400,
              "ideal-dv": 2748.8721956224654
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 200,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 600,
              "final-mass": 400,
              "ideal-dv": 1216.3953243244932
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 200,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 700,
              "final-mass": 500,
              "ideal-dv": 1009.4167098636386
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 400,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 800,
              "final-mass": 400,
              "ideal-dv": 2079.441541679836
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 400,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 900,
              "final-mass": 500,
              "ideal-dv": 1763.3599947063572
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 600,
              "carry-inert": false
            },
            "set": {
              "initial-mass": 1000,
              "final-mass": 400,
              "ideal-dv": 2748.8721956224654
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "payload": 300,
              "propellant": 600,
              "carry-inert": true
            },
            "set": {
              "initial-mass": 1100,
              "final-mass": 500,
              "ideal-dv": 2365.3720810928107
            },
            "source": [
              "S90"
            ]
          }
        ]
      },
      "stage": {
        "keys": [
          "stage-choice"
        ],
        "rows": [
          {
            "when": {
              "stage-choice": "first"
            },
            "set": {
              "engine-count": 5,
              "fuel-name": "kerosene",
              "oxygen-name": "liquid-oxygen"
            },
            "source": [
              "S25"
            ]
          },
          {
            "when": {
              "stage-choice": "second"
            },
            "set": {
              "engine-count": 5,
              "fuel-name": "hydrogen",
              "oxygen-name": "liquid-oxygen"
            },
            "source": [
              "S25"
            ]
          },
          {
            "when": {
              "stage-choice": "third"
            },
            "set": {
              "engine-count": 1,
              "fuel-name": "hydrogen",
              "oxygen-name": "liquid-oxygen"
            },
            "source": [
              "S25"
            ]
          }
        ]
      },
      "phase-state": {
        "keys": [
          "phase"
        ],
        "rows": [
          {
            "when": {
              "phase": "launch"
            },
            "set": {
              "show-sic": "shown",
              "show-sii": "shown",
              "show-upper": "shown",
              "show-sla": "shown",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "shown"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "first-off"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "shown",
              "show-upper": "shown",
              "show-sla": "shown",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "shown"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "parking"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "shown",
              "show-sla": "shown",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "translunar"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "shown",
              "show-sla": "shown",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "separated"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "shown",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "turned"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "shown",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "docked"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "shown",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "extracted"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "lunar"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "ascent"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "shown",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "rendezvous"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "shown",
              "show-sm": "shown",
              "show-lm-descent": "hidden",
              "show-lm-ascent": "shown",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "homeward"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "hidden",
              "show-sm": "shown",
              "show-lm-descent": "hidden",
              "show-lm-ascent": "hidden",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          },
          {
            "when": {
              "phase": "return"
            },
            "set": {
              "show-sic": "hidden",
              "show-sii": "hidden",
              "show-upper": "hidden",
              "show-sla": "hidden",
              "show-cm": "shown",
              "show-probe": "hidden",
              "show-sm": "hidden",
              "show-lm-descent": "hidden",
              "show-lm-ascent": "hidden",
              "show-les": "hidden"
            },
            "source": [
              "S90"
            ]
          }
        ]
      }
    }
  },
  "bind": [
    {
      "output": "show-sic",
      "part": [
        "sic-shell",
        "sic-fuel",
        "sic-oxidiser",
        "f1-centre",
        "f1-outer",
        "sic-fins"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-sii",
      "part": [
        "sii-shell",
        "sii-fuel",
        "sii-oxidiser",
        "j2-centre",
        "j2-outer"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-upper",
      "part": [
        "sivb-shell",
        "sivb-fuel",
        "sivb-oxidiser",
        "sivb-engine",
        "iu-ring"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-sla",
      "part": [
        "sla-shell"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-cm",
      "part": [
        "cm-shell",
        "cm-heatshield",
        "cm-couches"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-probe",
      "part": [
        "cm-probe"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-sm",
      "part": [
        "sm-shell",
        "sm-tanks",
        "sm-engine"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-lm-descent",
      "part": [
        "lm-descent",
        "lm-descent-engine",
        "lm-legs",
        "lm-ladder"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-lm-ascent",
      "part": [
        "lm-ascent",
        "lm-ascent-engine",
        "lm-windows",
        "lm-docking-port"
      ],
      "visible": {
        "eq": "shown"
      }
    },
    {
      "output": "show-les",
      "part": [
        "les-tower"
      ],
      "visible": {
        "eq": "shown"
      }
    }
  ]
};

// Existing bindings compose: the two flow conditions are ANDed by the runtime.
// The existing choice widget is capped at 12 options. Reuse the step widget (max24)
// for all13 configurations; preserve human-readable semantic states in a sourced output.
// This is topic data adaptation, not an engine extension.
const phaseOptions = sim.controls.find(c=>c.id==='phase')!.options!;
const phases = Object.keys(PHASE_POSES);
const phaseIndex = (id:string) => {const n=phases.indexOf(id);if(n<0)throw new Error(`Unknown phase ${id}`);return n;};
const runtimeControls=sim.controls.map(c=>c.id==='phase'?{id:'phase',kind:'step',label:bi('Configuration · 0–12','构型·0–12'),values:phases.map((_,i)=>i),default:0}:c);
const runtimePhaseRows=sim.table.experiments['phase-state'].rows.map(row=>({when:{phase:phaseIndex(row.when.phase)},set:{...row.set,'configuration-name':row.when.phase},source:row.source}));
const phasePoseIndexes=Object.fromEntries(phases.map((phase,i)=>[String(i),PHASE_POSES[phase]]));
const flowIds=['fuel-feed','oxidiser-feed','exhaust-out'];
const bindings:unknown[]=[...sim.bind,
 {control:'phase',part:parts.map(p=>p.id),pose:phasePoseIndexes},
 {control:'phase',flow:flowIds,visible:{eq:0}},
 {control:'stage-choice',flow:flowIds,visible:{eq:'first'}},
];
const engines:V3[]=[[0,0,0],[0,0,-3.8],[-3.8,0,0],[0,0,3.8],[3.8,0,0]];
const flows=[
 {id:'fuel-feed',group:'propellant-flow',color:'token:holder-4',speed:.8,count:360,spread:.035,parts:['sic-fuel','f1-centre','f1-outer'],paths:sicFeeds('fuel').map((path,i)=>({id:`fuel-${i+1}`,path}))},
 {id:'oxidiser-feed',group:'propellant-flow',color:'token:holder-2',speed:.8,count:480,spread:.035,parts:['sic-oxidiser','f1-centre','f1-outer'],paths:sicFeeds('oxygen').map((path,i)=>({id:`oxygen-${i+1}`,path}))},
 {id:'exhaust-out',group:'propellant-flow',color:'token:hot',speed:1.6,count:480,spread:[.35,.04,.35],clip:false,parts:['f1-centre','f1-outer'],paths:engines.map(([x,,z],i)=>({id:`exhaust-${i+1}`,path:[[x,.1,z],[x,-4,z],[x,-7,z]]}))},
];
export const CAMERAS={
 hero:{position:[175,57,198],target:[0,45,0],fov:30},
 engines:{position:[18,6,20],target:[0,4,0],fov:30},
 tank:{position:[55,28,66],target:[0,25,0],fov:30},
 stages:{position:[175,57,198],target:[0,45,0],fov:30},
 apollo:{position:[18,105,22],target:[0,99,0],fov:30},
 lander:{position:[14,7,16],target:[0,3.5,0],fov:30},
};
const labels:Record<keyof typeof CAMERAS,{en:string;zh:string}>={hero:bi('Whole stack','完整箭体'),engines:bi('First-stage engines','第一级发动机'),tank:bi('Propellant tanks','推进剂储箱'),stages:bi('Three main stages','三个主推进级'),apollo:bi('Apollo spacecraft','阿波罗飞船'),lander:bi('Lunar module','登月舱')};
const file={
 parts,
 groups:[
 {id:'stage-one',name:bi('First stage','第一级'),color:'token:holder-1'},
 {id:'upper-stages',name:bi('Upper stages','上面两级'),color:'token:holder-2'},
 {id:'guidance-adapter',name:bi('Guidance and adapter','制导与适配器'),color:'token:holder-3'},
 {id:'return-craft',name:bi('Command and service modules','指令舱与服务舱'),color:'token:holder-4'},
 {id:'lander',name:bi('Lunar module','登月舱'),color:'token:holder-5',scale:{unit:'m',magnification:1}},
 {id:'propellant-flow',name:bi('Fuel · oxygen · exhaust','燃料·氧化剂·排气'),color:'token:hot',card:false},
 ],flows,animations:[],poses,units:{modelUnit:'m',scale:1},
 views:{assembled:{camera:CAMERAS.hero},xray:{camera:CAMERAS.hero},exploded:{camera:{position:[160,85,180],target:[0,55,0],fov:30}},cover:CAMERAS.hero,shadows:'none',cutaway:{normal:[0,0,1],offset:0},section:{plane:'xy'}},
 presets:Object.entries(CAMERAS).map(([id,camera])=>({id:id==='lander'?'lander-view':id,label:labels[id as keyof typeof CAMERAS],camera})),
 spec:[{key:bi('Configuration','构型'),value:bi('Apollo 11 model','阿波罗11号模型'),tag:'design'},{key:bi('Launch height','发射总高'),value:'111 m',tag:'typical'},{key:bi('Main stages','主推进级'),value:'3',tag:'typical'}],
 telemetry:[{key:bi('Engines in selected stage · TYPICAL','所选级发动机·典型'),unit:'',follow:'engine-count',decimals:0},{key:bi('Initial mass · SIM','初始质量·模拟'),unit:'kg',follow:'initial-mass',decimals:0},{key:bi('Final mass · SIM','最终质量·模拟'),unit:'kg',follow:'final-mass',decimals:0},{key:bi('Ideal speed change · SIM','理想速度变化·模拟'),unit:'m/s',follow:'ideal-dv',decimals:2}],
 sim:{...sim,controls:runtimeControls,outputs:[...sim.outputs,{id:'configuration-name',label:bi('Current configuration','当前构型'),kind:'state',states:Object.fromEntries(phaseOptions.map(o=>[o.id,o.label]))}],table:{experiments:{...sim.table.experiments,'phase-state':{keys:['phase'],rows:runtimePhaseRows}}},bind:bindings},
};
await rebuildMuseum(file);
// The checked-in content is the editorial source of truth. The literals above
// match it; if an editorial pass changes parts.json first, the bake keeps that
// copy instead of restoring older literals.
function preserveBilingualText(current:any, generated:any):void {
 if(!current || !generated || typeof current!=='object' || typeof generated!=='object')return;
 if(typeof current.en==='string' && typeof current.zh==='string'){
  generated.en=current.en; generated.zh=current.zh; return;
 }
 if(Array.isArray(current) && Array.isArray(generated)){
  for(let i=0;i<generated.length;i++){
   const item=generated[i], prior=item?.id ? current.find(x=>x?.id===item.id) : current[i];
   preserveBilingualText(prior,item);
  }
 }else for(const key of Object.keys(generated))preserveBilingualText(current[key],generated[key]);
}
const editorialSource=JSON.parse(readFileSync(fileURLToPath(new URL('../../../src/content/topics/saturn-v/data/parts.json',import.meta.url)),'utf8'));
preserveBilingualText(editorialSource,file);
function bilingualEntries(value:any,path=''):Record<string,string> {
 if(!value || typeof value!=='object')return {};
 if(typeof value.en==='string' && typeof value.zh==='string')return {[path+'/en']:value.en,[path+'/zh']:value.zh};
 return Object.assign({},...Object.entries(value).map(([key,item]:[string,any])=>
  bilingualEntries(item,path+'/'+(Array.isArray(value)?(item?.id??key):key))));
}
const editorialBefore=bilingualEntries(editorialSource),editorialAfter=bilingualEntries(file);
if(JSON.stringify(editorialBefore)!==JSON.stringify(editorialAfter))throw new Error('Geometry generation changed editorial text');
const editorialHash=createHash('sha256').update(JSON.stringify(editorialBefore)).digest('hex');
writeFileSync('scripts/geo/saturn-v/editorial-text-audit.json',JSON.stringify({
 date:'2026-11-09',bilingualValues:Object.keys(editorialBefore).length,
 sourceSHA256:editorialHash,outputSHA256:editorialHash,changedByBake:0,
 source:'Current checked-in parts.json immediately before the geometry bake; build literals never replace editorial copy.'
},null,2)+'\n');
// Validate before touching the deliverable. No source/network fetch is needed to regenerate.
partsFile.parse(file);
if(parts.length!==33||Object.keys(poses).length!==13)throw new Error('Saturn topology contract');
for(const row of sim.table.experiments.ideal.rows){const v=row.set;if(!(v['initial-mass']>v['final-mass']&&v['final-mass']>0))throw new Error('Invalid ideal mass ratio');}
const output=fileURLToPath(new URL('../../../src/content/topics/saturn-v/data/parts.json',import.meta.url));
writeFileSync(output,JSON.stringify(file,null,2)+'\n');
// Reading back catches accidental truncation and proves the artifact, not only the in-memory input.
partsFile.parse(JSON.parse(readFileSync(output,'utf8')));
process.stdout.write(`saturn-v: ${parts.length} parts, ${Object.keys(poses).length} poses, ${flows.length} flows; schema valid\n`);
