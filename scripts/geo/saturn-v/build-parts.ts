/** Apollo 11 configuration study, metres. Run: pnpm tsx scripts/geo/saturn-v/build-parts.ts.
 * NASA references inspected: refs/stack.png, stages.png, lm.png, lm-front.png, csm.png.
 * S25/S26 constrain topology and nominal dimensions. S90 owns illustrative coordinates,
 * terminal configurations, simplified storage, compressed stowed gear, flow speed and ideal table.
 * No flight dynamics, independently solved landing hinges, temperature or fuel-depletion model.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
const stageDetail=bi('Geometry follows the nominal Apollo 11 arrangement; wall thickness, local ribs and internal layout are simplified design values. Select a configuration beat before inspecting a stage that has separated. [S25, S90]','几何依据阿波罗11号名义构型；壁厚、局部加强环和内部布局采用简化设计值。查看已经分离的级时，先切到显示该级的构型拍。[S25, S90]');

// S-IC: the bottom engine mouth reaches y=0; body ends at 42.06 m.
const sicSkin=wall([0,23.78,0],5.03,36.56);
sicSkin.profile=[[5.03,-18.28],[5.03,18.28],[4.95,18.28],[4.95,-18.28],[5.03,-18.28]];
add('sic-shell','stage-one','S-IC structure','S-IC承力外壳','The first-stage structure carries the tanks and transfers engine thrust into the stack.','第一级结构支承储箱，并把发动机推力传到上方箭体。',stageDetail.en,stageDetail.zh,sicSkin,{shell:true,connects:['sic-fuel','sic-oxidiser','f1-centre','f1-outer','sii-shell'],extra:[ring([0,8.1,0],5.05,.28),ring([0,23.3,0],5.05,.20),ring([0,41.9,0],5.05,.28)]});
add('sic-fuel','stage-one','S-IC kerosene tank','S-IC煤油箱','This tank stores RP-1 kerosene for the five F-1 engines.','这个储箱为五台F-1发动机储存RP-1煤油。','The lower kerosene tank feeds the first-stage engines. Liquid oxygen is stored in the separate upper tank. Domed heads use a reduced illustrative depth to keep the two tanks physically separate. [S25, S90]','下方煤油箱向第一级发动机供料；液氧放在独立的上方储箱。封头采用较浅的示意尺寸，使两箱保持分开。[S25, S90]',p('vessel',[0,16,0],'steel',{radius:4.6,length:11,headRatio:.35,tint:'token:holder-4'}),{connects:['f1-centre','f1-outer'],explode:{dir:[-12,0,2],dist:Math.hypot(12,2)}});
add('sic-oxidiser','stage-one','S-IC oxygen tank','S-IC液氧箱','This tank carries liquid oxygen so combustion does not depend on outside air.','这个储箱携带液氧，让燃烧不依赖外界空气。','The upper first-stage tank supplies oxidiser, not fuel. The delivery path passes beside the fuel tank in this cutaway teaching layout; detailed plumbing is omitted. [S25, S90]','第一级上方储箱供应氧化剂，不是燃料。本教学剖面把供氧路径放在煤油箱旁，省略详细管网。[S25, S90]',p('vessel',[0,33,0],'steel',{radius:4.6,length:13,headRatio:.35,tint:'token:holder-2'}),{connects:['f1-centre','f1-outer'],explode:{dir:[-12,0,-2],dist:Math.hypot(12,2)}});
const f1=bell([0,2.75,0],1.85,5.5);
const f1Extra=[cyl([0,5.9,0],.55,.8),torus([0,1.2,0],1.68,.07),tube([0,4.9,0],[[.35,0,0],[1.05,-.7,0],[1.2,-1.9,0]],.14)];
add('f1-centre','stage-one','Central F-1 engine','中央F-1发动机','The fixed central F-1 turns carried kerosene and oxygen into a downward exhaust stream.','固定的中央F-1把携带的煤油和氧转化为向下的排气。','One central engine and four outer engines make five. This bell is hollow, with a visible throat and lip; its teaching profile and feed hardware do not reproduce a manufacturing drawing. [S25, S90]','中央一台加外围四台，共五台。喷管为空心，喉部与唇缘可辨；教学轮廓和供料设备不复刻制造图。[S25, S90]',f1,{extra:f1Extra,connects:['sic-fuel','sic-oxidiser']});
add('f1-outer','stage-one','Four outer F-1 engines','外围四台F-1发动机','The four outer F-1 engines add thrust and could swivel to help steer the launch vehicle.','外围四台F-1增加推力，并能偏转帮助控制飞行方向。','These four repeated engines surround one fixed central engine. The illustrative 3.8 m mounting radius leaves a 0.10 m minimum mouth-to-mouth gap; their exposed bells extend beyond the tank cylinder, within the fin envelope. Gimbal motion is not simulated. [S25, S90]','四台重复发动机围绕一台固定中央发动机。3.8米示意安装半径使最近喷口边缘留0.10米间隙；露出的喷管超出储箱圆筒，但不越过尾翼包络。本模型不模拟偏转。[S25, S90]',structuredClone(f1),{extra:structuredClone(f1Extra),repeat:radial(4,3.8),connects:['sic-fuel','sic-oxidiser']});
add('sic-fins','stage-one','Four stabilising fins','四片稳定尾翼','Four fins provide aerodynamic stabilisation while the rocket travels through the atmosphere.','四片尾翼在火箭穿过大气层时帮助稳定。',stageDetail.en,stageDetail.zh,extrude([0,4.8,0],[[0,-2.2],[1.8,-2.2],[1.8,-.9],[0,3.2]],.14,'enamel',{rotation:[0,90,0]}),{repeat:radial(4,5.03),clip:false,connects:['sic-shell']});

// S-II five J-2s and a single, shared bulkhead at y=53.5. The fuel owns it;
// the oxidiser stops 0.04 m short, rather than drawing intersecting vessel heads.
add('sii-shell','upper-stages','S-II structure','S-II承力外壳','The second-stage structure joins five hydrogen engines to the tanks and the upper stack.','第二级结构把五台氢氧发动机、储箱和上方箭体连接起来。',stageDetail.en,stageDetail.zh,wall([0,54.48,0],5.03,24.84),{shell:true,connects:['sii-fuel','sii-oxidiser','j2-centre','j2-outer','sivb-shell'],extra:[ring([0,46.0,0],5.05,.25),ring([0,66.7,0],5.05,.25)]});
add('sii-fuel','upper-stages','S-II hydrogen tank','S-II液氢箱','The large upper second-stage tank stores liquid hydrogen.','第二级较大的上方储箱储存液氢。','Hydrogen and oxygen share an insulated bulkhead. This simplified fuel profile includes that one boundary at y=53.5 m; the lower oxygen profile stops below it. There are no overlapping domed heads. [S25, S90]','液氢和液氧之间共用隔热底板。简化液氢轮廓包含y=53.5米处的这一道边界，下方液氧轮廓止于其下，避免封头相交。[S25, S90]',lathe([0,59,0],[[0,-5.5],[4.5,-5.5],[4.5,3.6],[4.2,4.7],[3.0,5.8],[0,6.2]],'steel',{tint:'token:holder-4'}),{connects:['sii-oxidiser','j2-centre','j2-outer'],explode:{dir:[12,0,2],dist:Math.hypot(12,2)}});
add('sii-oxidiser','upper-stages','S-II oxygen tank','S-II液氧箱','The lower second-stage tank stores liquid oxygen for the five J-2 engines.','第二级下方储箱为五台J-2储存液氧。','The upper face ends just below the common bulkhead owned by the fuel-tank geometry. Real bulkhead insulation and structural detail are omitted; the two propellants remain separate. [S25, S90]','上表面止于液氢箱几何所含的共底板下方。模型省略真实隔热层和结构细节，两种推进剂仍分开。[S25, S90]',lathe([0,49,0],[[0,-2],[2.8,-1.8],[4.2,-1.0],[4.5,0],[4.5,4.46],[0,4.46]],'steel',{tint:'token:holder-2'}),{connects:['sii-fuel','j2-centre','j2-outer'],explode:{dir:[12,0,-2],dist:Math.hypot(12,2)}});
const j2=bell([0,44,0],1,3);
add('j2-centre','upper-stages','Central S-II J-2','S-II中央J-2','The central J-2 supplies one of the second stage’s five main thrust streams.','中央J-2提供第二级五股主推力中的一股。','One fixed central J-2 and four surrounding J-2 engines burn liquid hydrogen and liquid oxygen. The hollow bell is a simplified profile. [S25, S90]','一台固定中央J-2和外围四台J-2燃烧液氢、液氧。空心喷管轮廓经过简化。[S25, S90]',j2,{connects:['sii-fuel','sii-oxidiser'],extra:[cyl([0,45.7,0],.32,.6)]});
add('j2-outer','upper-stages','Four outer S-II J-2s','S-II外围四台J-2','Four outer J-2 engines share the second-stage work and could swivel for control.','外围四台J-2共同承担第二级推进，并能偏转控制方向。','Four repeated outer engines plus the central engine make five, as in the NASA stage description. The 2.5 m teaching mounting radius preserves separation between the bells. Steering is not animated. [S25, S90]','四台外围重复发动机加中央一台，共五台，与NASA级段说明相符。2.5米教学安装半径使喷管彼此分开；模型不演示偏转。[S25, S90]',structuredClone(j2),{repeat:radial(4,2.5),connects:['sii-fuel','sii-oxidiser'],extra:[cyl([0,45.7,0],.32,.6)]});
// S-IVB interstage contracts from the 10.06 m lower diameter to the 6.61 m body.
add('sivb-shell','upper-stages','S-IVB structure','S-IVB承力外壳','The third-stage structure carries the restartable engine and the spacecraft above it.','第三级结构支承可重启发动机和上方飞船。',stageDetail.en,stageDetail.zh,wall([0,78.1,0],3.305,13.14),{shell:true,connects:['sivb-fuel','sivb-oxidiser','sivb-engine','iu-ring'],extra:[lathe([0,69.2,0],[[5.03,-2.3],[3.305,2.3],[3.225,2.3],[4.95,-2.3],[5.03,-2.3]],'enamel'),ring([0,84.5,0],3.325,.24)]});
add('sivb-fuel','upper-stages','S-IVB hydrogen tank','S-IVB液氢箱','The third-stage hydrogen tank stores fuel for orbital insertion and the later restart.','第三级液氢箱储存入轨和随后重启所用燃料。','A single common boundary at y=75 m separates fuel above from oxygen below. Restart reuses the same J-2 engine; no additional engine is shown. [S25, S90]','y=75米的一道共同边界把上方液氢与下方液氧分开。重启使用同一台J-2，不额外增加发动机。[S25, S90]',lathe([0,80,0],[[0,-5],[2.9,-5],[2.9,2.0],[2.5,2.8],[0,3.4]],'steel',{tint:'token:holder-4'}),{connects:['sivb-oxidiser','sivb-engine'],explode:{dir:[12,0,2],dist:Math.hypot(12,2)}});
add('sivb-oxidiser','upper-stages','S-IVB oxygen tank','S-IVB液氧箱','The third-stage lower tank supplies liquid oxygen to the single J-2.','第三级下方储箱向唯一的J-2供应液氧。','Its upper face stops 0.04 m below the common bulkhead in the fuel geometry, so the profiles do not interpenetrate. Tanks and feed lines are a layout study, not a pressure-vessel design. [S25, S90]','它的上表面止于液氢箱共底板下方0.04米，轮廓不会相互穿入。储箱和供料线路用于解释布局，不是压力容器设计。[S25, S90]',lathe([0,72,0],[[0,-1.2],[1.9,-1.0],[2.7,-.4],[2.9,.2],[2.9,2.96],[0,2.96]],'steel',{tint:'token:holder-2'}),{connects:['sivb-fuel','sivb-engine'],explode:{dir:[12,0,-2],dist:Math.hypot(12,2)}});
add('sivb-engine','upper-stages','Single S-IVB J-2','S-IVB单台J-2','This single restartable J-2 first helps establish Earth orbit and later sends Apollo toward the Moon.','这一台可重启J-2先帮助进入地球轨道，随后把阿波罗送向月球。','One engine is present in every S-IVB configuration. The later burn is a restart of that engine, not a second nozzle appearing. The hollow profile is illustrative. [S25, S90]','各个S-IVB构型中始终只有一台发动机。后续燃烧是这台发动机重启，不是出现第二个喷管。空心轮廓为示意。[S25, S90]',bell([0,68.8,0],1,3),{connects:['sivb-fuel','sivb-oxidiser']});

add('iu-ring','guidance-adapter','Instrument unit','仪器舱','The instrument unit measures motion and guides the launch vehicle.','仪器舱测量运动并引导运载火箭。','The ring sits between the S-IVB and spacecraft adapter. It contains guidance and control equipment, not a fourth main propulsion stage. Internal equipment is represented by a few coherent modules. [S25, S90]','这个环位于S-IVB与飞船适配器之间，内装制导控制设备，不是第四个主推进级。内部设备用少量规整模块概括。[S25, S90]',wall([0,85.13,0],3.305,.92,'steel'),{connects:['sivb-shell','sla-shell'],extra:[box([2.8,85.13,0],[.45,.5,1.1]),box([-2.8,85.13,0],[.45,.5,1.1])]});
const slaProfile:V2[]=[[3.305,-4.205],[1.95,4.205],[1.87,4.205],[3.225,-4.205],[3.305,-4.205]];
add('sla-shell','guidance-adapter','Spacecraft–LM adapter','飞船—登月舱适配器','Four tapered panels enclose the folded lunar module during launch.','四片渐缩面板在发射时包住收拢的登月舱。','The adapter joins the S-IVB/instrument unit to the service module. One LM is carried inside. Removing four panels is shown as a static configuration change; no invented hinge trajectory is implied. [S25, S26, S90]','适配器把S-IVB和仪器舱连接到服务舱，内部只携带一份登月舱。四面板以静态构型变化移除，不表示虚构的铰链运动轨迹。[S25, S26, S90]',lathe([0,89.795,0],slaProfile,'enamel',{arc:89.4}),{shell:true,connects:['iu-ring','sm-shell','lm-descent'],extra:[90,180,270].map(a=>lathe([0,89.795,0],slaProfile,'enamel',{arc:89.4,rotation:[0,a,0]}))});

// CM/SM are authored in one launch frame. Every configuration applies one shared rigid matrix.
const cmSkin=lathe([0,102.5,0],[[1.95,-1.5],[.44,1.5],[.36,1.5],[1.87,-1.5],[1.95,-1.5]],'enamel');
const cmWindows:Prim[]=[];
// Two forward rendezvous panes, a hatch pane and two side panes, based on S25 CSM layout.
for(const a of [-62,-26,0,26,62]){
 const rad=a*Math.PI/180;const y=a===0?102.15:102.75;const r=1.95-(y-101)*1.51/3+.035;
 cmWindows.push(extrude([Math.sin(rad)*r,y,Math.cos(rad)*r],[[-.13,-.16],[.13,-.16],[.11,.16],[-.11,.16]],.045,'glass',{rotation:[-27,a,0]}));
}
add('cm-shell','return-craft','Command module cabin','指令舱乘员舱','The command module carries the three astronauts and is the cabin that returns through Earth’s atmosphere.','指令舱搭载三名宇航员，也是穿越地球大气层返回的乘员舱。','The cone attaches to the service module above the heat shield. Five window positions follow the general CSM arrangement; cabin equipment, wall layers and hatch mechanisms are simplified. The forward compartment cover is part of the cone and is distinct from the docking probe. [S25, S90]','锥形舱体在防热盾上方与服务舱相接。五处舷窗依据CSM总体布局；舱内设备、壁层和舱门机构经过简化。前舱盖属于锥形舱体，与对接探杆是不同零件。[S25, S90]',cmSkin,{shell:true,extra:cmWindows,connects:['cm-heatshield','cm-couches','cm-probe','sm-shell']});
add('cm-heatshield','return-craft','Blunt heat shield','钝头防热盾','The heat shield protects the command module during atmospheric entry.','防热盾在进入大气层时保护指令舱。','The continuous blunt underside remains intact in cutaway mode. It returns with the cabin after the service module is discarded. No entry temperature, ablation rate or flight trajectory is calculated. [S25, S90]','连续的钝头底面在剖视模式中保持完整。服务舱抛弃后，它随乘员舱返回。模型不计算再入温度、烧蚀率或飞行轨迹。[S25, S90]',lathe([0,101,0],[[0,-.23],[.8,-.20],[1.65,-.12],[1.95,0],[1.95,.12],[0,.12]],'abrasive'),{clip:false,connects:['cm-shell','sm-shell']});
add('cm-couches','return-craft','Three crew couches','三个乘员座位','Three couches support the command-module crew during launch and return.','三个座位在发射与返回时支承指令舱乘员。','There are exactly three repeated couches inside the same cabin. Cushion, back and restraint shapes are simplified; people and full control panels are omitted. The couches move with every cabin pose. [S25, S90]','同一乘员舱内有三个重复座位。坐垫、靠背和约束结构经过简化，省略人物和完整控制面板。每种构型中座位都随舱体运动。[S25, S90]',box([0,101.85,.25],[.53,.16,1.3],'fabric',{rotation:[-12,0,0]}),{repeat:{count:3,axis:[1,0,0],spacing:.65},extra:[box([0,102.18,-.3],[.53,.75,.16],'fabric',{rotation:[-22,0,0]})],clip:false,connects:['cm-shell']});
add('cm-probe','return-craft','Docking probe','对接探杆','The probe guides the command module into the lunar module’s docking drogue.','探杆引导指令舱进入登月舱的对接锥套。','The modeled contact point is [0,104.8,0] m in the launch frame; docking poses bring it onto the LM port at [0,92.5,0]. The probe is hidden for homeward and return configurations, distinct from the cone’s front cover. [S25, S90]','发射基准中的接触点为[0,104.8,0]米；对接姿态把它送到[0,92.5,0]的登月舱接口。返航与返回构型隐藏探杆；它与锥舱前盖不同。[S25, S90]',tube([0,104.2,0],[[0,-.2,0],[0,.5,0]],.065),{extra:[p('cone',[0,104.71,0],'steel',{size:[.16,.18]})],clip:false,connects:['cm-shell','lm-docking-port']});
add('sm-shell','return-craft','Service module structure','服务舱结构','The service module carries propulsion and support equipment for the crew cabin.','服务舱承载乘员舱所需的推进和支持设备。','The cylindrical service module stays rigidly attached to the command module during turnaround and docking. It has no solar wings. Four small control clusters and radiator strips are indicative external equipment; detailed nozzle counts and plumbing are not modeled. [S25, S90]','圆柱形服务舱在转身与对接时始终与指令舱刚性相接，不装太阳翼。四处小型控制组件和散热条概括外部设备，不复刻详细喷嘴计数与管线。[S25, S90]',wall([0,97.5,0],1.95,7),{shell:true,connects:['cm-shell','sm-tanks','sm-engine'],extra:[ring([0,100.7,0],1.97,.2),ring([0,94.3,0],1.97,.2),...[0,1,2,3].flatMap(k=>{const a=k*Math.PI/2;return [box([2*Math.sin(a),99.2,2*Math.cos(a)],[.3,.35,.35]),box([1.96*Math.sin(a),96.6,1.96*Math.cos(a)],[.4,1.8,.06],'enamel',{rotation:[0,k*90,0]})];})]});
add('sm-tanks','return-craft','Service storage','服务舱储存设备','These vessels represent stored propulsion and support supplies in the service module.','这些储罐概括服务舱储存的推进与支持物资。','The service engine draws from the service module, which also supports the crew cabin. This selection is deliberately not a complete tank inventory or routed plumbing CAD; the layout moves with the full CSM rigid body. [S25, S90]','服务发动机从服务舱取用物资，服务舱也支持乘员舱。这些几何不是完整储罐清单或管线CAD；整套布局始终随CSM刚体运动。[S25, S90]',p('vessel',[.9,97.6,0],'steel',{radius:.6,length:3.3,headRatio:.5}),{extra:[p('vessel',[-.9,97.6,0],'steel',{radius:.6,length:3.3,headRatio:.5})],connects:['sm-engine','cm-shell']});
add('sm-engine','return-craft','Service propulsion engine','服务推进发动机','The service engine changes the spacecraft’s motion during the lunar journey.','服务发动机在月球往返途中改变飞船运动。','A single hollow main bell is attached below the service module. It turns with the command and service modules when they face the LM; it never remains behind as a floating part. [S25, S90]','一个空心主喷管接在服务舱下方。CSM转向登月舱时它也一起转动，不会作为悬空零件留在原处。[S25, S90]',bell([0,94,0],1.15,2.6),{connects:['sm-shell','sm-tanks']});
const lesExtras:Prim[]=[];
for(const s of [-1,1])for(const z of [-1,1])lesExtras.push(tube([0,105.9,0],[[s*.46,-1.6,z*.46],[s*.3,1.4,z*.3]],.045));
lesExtras.push(cyl([0,108.55,0],.38,2.4),p('cone',[0,110.45,0],'enamel',{size:[.38,1.1]}));
add('les-tower','return-craft','Launch escape system','发射逃逸系统','The escape system could pull the crew cabin away during a launch emergency.','发射紧急情况时，逃逸系统能把乘员舱拉离火箭。','The truss and motor form a simplified launch escape system above the cabin. Its top reaches the study’s 111 m stack height. It is already absent in parking orbit and every later configuration; emergency operation is not simulated. [S25, S90]','桁架和发动机概括乘员舱上方的发射逃逸系统，顶端达到本研究111米栈高。进入停泊轨道及之后的构型都不显示它；模型不模拟紧急操作。[S25, S90]',ring([0,104.35,0],.61,.15),{extra:lesExtras,clip:false,connects:['cm-shell']});

// LM: angular pressurised cabin, octagonal descent body, 4 radial landing assemblies,
// a single front ladder, two front windows. The single LM is enclosed by the SLA at launch.
const oct:V2[]=Array.from({length:8},(_,i)=>{const a=(i+.5)*Math.PI/4;return [Math.cos(a)*2.15,Math.sin(a)*2.15] as V2;});
add('lm-descent','lander','Lunar module descent stage','登月舱下降级','The descent stage slows the lunar module and becomes its landing platform.','下降级使登月舱减速，并成为着陆平台。','The octagonal equipment stage supports four legs, the ladder and one descent engine. It remains on the Moon when the ascent stage leaves. Gold-toned insulating surfaces and internal storage are simplified. [S26, S90]','八边形设备级支承四条腿、梯子和一台下降发动机。上升级离开时它留在月面。金色隔热表面与内部储存设备经过简化。[S26, S90]',extrude([0,88,0],oct,1.8,'brass',{rotation:[90,0,0],holes:[Array.from({length:16},(_,i)=>[.8*Math.cos(i*Math.PI/8),.8*Math.sin(i*Math.PI/8)])]}),{connects:['lm-descent-engine','lm-legs','lm-ladder','lm-ascent']});
add('lm-descent-engine','lander','Descent engine','下降发动机','The descent engine supplies the braking thrust used for landing.','下降发动机提供着陆减速所需推力。','This one engine belongs to the descent stage and remains with it. Its hollow nozzle is separate from the ascent engine above; neither burn nor landing trajectory is integrated. [S26, S90]','这一台发动机属于下降级并随它留下。空心喷管与上方上升发动机分开；模型不积分燃烧过程或着陆轨迹。[S26, S90]',bell([0,86.9,0],.72,1.5),{connects:['lm-descent']});
// Rest geometry is deployed. The per-part XZ compression is a terminal envelope study,
// NOT a hinge solution. Scale about axis x=z=0 compresses repeat offsets consistently.
const legOrigin:V3=[0,87.5,0];
add('lm-legs','lander','Four landing legs','四条着陆支腿','Four landing assemblies spread the load onto four footpads.','四组着陆支腿把载荷分散到四个足垫上。','Four radial copies each contain a primary strut, two secondary braces and one pad. Deployed pad bottoms share y=85.6 m before the landed offset brings them to y=0. A compressed X/Z terminal envelope represents stowage inside the adapter; the model shows folded and deployed shapes rather than an exact hinge mechanism or folding path. [S26, S90]','四个径向重复组件各有一根主支柱、两根副撑和一个足垫。展开后足垫底部共处y=85.6米，着陆偏移再把它们移到y=0。适配器内的收拢状态用X/Z压缩终态包络表示；模型展示收拢和展开的形态，不表示精确铰链机构或折叠路径。[S26, S90]',tube(legOrigin,[[0,-.4,0],[0,-1.79,-2.25]],.11),{repeat:radial(4,2),extra:[tube([0,87.5,0],[[-.75,-.4,.45],[0,-1.25,-1.85]],.065),tube([0,87.5,0],[[.75,-.4,.45],[0,-1.25,-1.85]],.065),cyl([0,85.68,-2.25],.46,.16,'steel')],clip:false,connects:['lm-descent','lm-ladder']});
const cabin:V2[]=[[-1.15,-1.1],[1.15,-1.1],[1.6,-.35],[1.28,.95],[.5,1.35],[-.55,1.35],[-1.35,.8],[-1.55,-.3]];
add('lm-ascent','lander','Lunar module ascent cabin','登月舱上升舱','The ascent cabin carries two astronauts from the lunar surface back toward the command module.','上升舱搭载两名宇航员从月面返回指令舱所在处。','Angular pressure-cabin and equipment-bay forms follow the NASA overview. The crew work standing; this is not a streamlined cone. The front hatch, two windows and top docking port share the ascent body’s pose. Antennas and detailed support equipment are omitted. [S26, S90]','折面压力舱和设备舱形态依据NASA总览。乘员站立工作，舱体不是流线圆锥。前舱门、两扇窗和顶部对接口都随上升舱运动；省略天线和详细支持设备。[S26, S90]',extrude([0,90.6,0],cabin,2.45,'steel'),{shell:true,extra:[box([0,90.05,1.26],[.81,.81,.05],'enamel'),box([0,90.5,-1.3],[2.7,1.4,.7],'steel'),p('sphere',[-1.58,90.1,-.15],'steel',{size:[.48],scale:[1,1.35,1]}),p('sphere',[1.58,90.1,-.15],'steel',{size:[.48],scale:[1,1.35,1]})],connects:['lm-descent','lm-ascent-engine','lm-windows','lm-docking-port']});
add('lm-ascent-engine','lander','Ascent engine','上升发动机','The ascent engine lifts the ascent stage away from the descent platform.','上升发动机把上升级从下降平台送离。','The single small bell belongs to the ascent stage and leaves with it. It occupies the central opening above the descent engine; the two are separate engines attached to different stages. [S26, S90]','这个小型单喷管属于上升级并随它离开，位于下降发动机上方的中央开口。两台发动机独立，分别连接不同级段。[S26, S90]',bell([0,89,0],.43,.8),{connects:['lm-ascent']});
add('lm-windows','lander','Two forward windows','两扇前窗','Two triangular forward windows let the standing crew see the landing area.','两扇三角形前窗让站立的乘员观察着陆区。','Both front windows belong to one selectable part and sit above the central hatch. They follow the ascent cabin in every configuration. The overhead docking window is omitted, so this part does not claim to show every LM window. [S26, S90]','两扇前窗属于一个可选零件，位于中央舱门上方，所有构型中都随上升舱运动。模型省略顶部对接窗，因此这个零件不表示登月舱全部舷窗。[S26, S90]',extrude([-.68,91.12,1.25],[[-.37,.25],[.37,.25],[.2,-.28]],.045,'glass'),{extra:[extrude([.68,91.12,1.25],[[-.37,.25],[.37,.25],[-.2,-.28]],.045,'glass')],clip:false,connects:['lm-ascent']});
const ladderExtra:Prim[]=[tube([0,87,2.6],[[.25,1.55,-.45],[.25,-1.2,1.9]],.045)];
for(let i=0;i<9;i++){const k=i/8;ladderExtra.push(tube([0,87,2.6],[[-.25,1.5-k*2.65,-.4+k*2.25],[.25,1.5-k*2.65,-.4+k*2.25]],.035));}
add('lm-ladder','lander','Single forward ladder','唯一的前方舷梯','One ladder gives the crew a route down the forward landing leg.','一支舷梯沿前方着陆腿为乘员提供下行通路。','Only the forward leg has a ladder. It stays with the descent stage during ascent. Its stowed terminal envelope is compressed with the landing gear; rung spacing is illustrative. [S26, S90]','只有前方支腿带梯子。上升级升空时，梯子随下降级留下。它的收拢终态包络与支腿一起压缩；横档间距为示意。[S26, S90]',tube([0,87,2.6],[[-.25,1.55,-.45],[-.25,-1.2,1.9]],.045),{extra:ladderExtra,clip:false,connects:['lm-descent','lm-legs']});
add('lm-docking-port','lander','LM docking port','登月舱对接口','The top docking port accepts the command module’s probe and joins the two cabins.','顶部对接口接纳指令舱探杆，并把两舱连接起来。','Its interface centre is [0,92.5,0] m in the launch frame. Docked, extracted and rendezvous poses align it exactly with the probe tip. The tunnel is a simplified open ring; seals and docking-latch kinematics are omitted. [S25, S26, S90]','发射基准中的接口中心为[0,92.5,0]米。对接、抽取和交会姿态都把它与探杆尖端准确对齐。通道用简化开环表示，省略密封和锁扣运动机构。[S25, S26, S90]',torus([0,92.5,0],.42,.09),{extra:[wall([0,92.26,0],.48,.45)],clip:false,connects:['lm-ascent','cm-probe']});

export const PHASE_POSES:Record<string,string>={launch:'launch-packed','first-off':'upper-stack',parking:'parking-stack',translunar:'translunar-stack',separated:'csm-clear',turned:'csm-turned',docked:'nose-to-lm',extracted:'csm-lm-extracted',lunar:'lm-landed',ascent:'lm-ascent',rendezvous:'rendezvous',homeward:'homeward-csm',return:'return-cm'};
export const DOCKING={probe:[0,104.8,0] as V3,port:[0,92.5,0] as V3,csmPivot:[0,99,0] as V3,landedOffset:[0,-85.6,0] as V3};
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
 // R_x(180) moves the probe to y=93.2, so -0.7 brings it exactly onto the LM port.
 if(['docked','extracted'].includes(phase))rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-.7,0]);
 if(phase==='extracted'){
  rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-85.7,0]);
  for(const id of lmIds){const entry=pose[id] as Transform;pose[id]={...entry,offset:[0,-85,0]};}
 }
 if(['lunar','ascent','rendezvous'].includes(phase)){
  for(const id of lmIds)pose[id]={pivot:gearPivot,rotation:[0,0,0],offset:DOCKING.landedOffset,scale:[1,1,1]};
  rigid(pose,csmIds,DOCKING.csmPivot,[0,0,0],[22,-89,0]);
 }
 if(['ascent','rendezvous'].includes(phase))for(const id of ascentIds)pose[id]={pivot:gearPivot,rotation:[0,0,0],offset:[0,-77.6,0],scale:[1,1,1]};
 if(phase==='rendezvous')rigid(pose,csmIds,DOCKING.csmPivot,[180,0,0],[0,-78.3,0]);
 if(phase==='homeward')rigid(pose,csmIds,DOCKING.csmPivot,[0,0,0],[0,-94,0]);
 if(phase==='return')rigid(pose,csmIds,[0,102.5,0],[0,0,155],[0,-100,0]);
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
            "en": "First Off",
            "zh": "一级分离"
          }
        },
        {
          "id": "parking",
          "label": {
            "en": "Parking",
            "zh": "地球停泊轨道"
          }
        },
        {
          "id": "translunar",
          "label": {
            "en": "Translunar",
            "zh": "向月球出发"
          }
        },
        {
          "id": "separated",
          "label": {
            "en": "Separated",
            "zh": "飞船分离"
          }
        },
        {
          "id": "turned",
          "label": {
            "en": "Turned",
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
            "en": "Extracted",
            "zh": "抽出登月舱"
          }
        },
        {
          "id": "lunar",
          "label": {
            "en": "Lunar",
            "zh": "月面构型"
          }
        },
        {
          "id": "ascent",
          "label": {
            "en": "Ascent",
            "zh": "上升级升空"
          }
        },
        {
          "id": "rendezvous",
          "label": {
            "en": "Rendezvous",
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
        "en": "Show Sic",
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
        "en": "Show Sii",
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
        "en": "Show Upper",
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
        "en": "Show Sla",
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
        "en": "Show Cm",
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
        "en": "Show Probe",
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
        "en": "Show Sm",
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
        "en": "Show Lm Descent",
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
        "en": "Show Lm Ascent",
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
        "en": "Show Les",
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
 {id:'fuel-feed',group:'propellant-flow',color:'token:holder-4',speed:.8,count:360,spread:.035,parts:['sic-fuel','f1-centre','f1-outer'],paths:engines.map(([x,,z],i)=>({id:`fuel-${i+1}`,path:[[0,10,0],[x*.8,8,z*.8],[x+.22,6.2,z],[x+.22,5.2,z]]}))},
 {id:'oxidiser-feed',group:'propellant-flow',color:'token:holder-2',speed:.8,count:480,spread:.035,parts:['sic-oxidiser','f1-centre','f1-outer'],paths:engines.map(([x,,z],i)=>({id:`oxygen-${i+1}`,path:[[4.2,26,0],[4.74,24.3,0],[4.74,8.6,0],[x-.22,7.3,z],[x-.22,5.2,z]]}))},
 {id:'exhaust-out',group:'propellant-flow',color:'token:hot',speed:1.6,count:480,spread:[.35,.04,.35],clip:false,parts:['f1-centre','f1-outer'],paths:engines.map(([x,,z],i)=>({id:`exhaust-${i+1}`,path:[[x,.1,z],[x,-4,z],[x,-7,z]]}))},
];
export const CAMERAS={
 hero:{position:[150,82,173],target:[0,55,0],fov:30},
 engines:{position:[18,6,20],target:[0,4,0],fov:30},
 tank:{position:[24,26,28],target:[0,25,0],fov:30},
 stages:{position:[150,65,170],target:[0,55,0],fov:30},
 apollo:{position:[18,105,22],target:[0,99,0],fov:30},
 lander:{position:[14,7,16],target:[0,3.5,0],fov:30},
};
const labels:Record<keyof typeof CAMERAS,{en:string;zh:string}>={hero:bi('Whole stack','完整箭体'),engines:bi('First-stage engines','第一级发动机'),tank:bi('Propellant tanks','推进剂储箱'),stages:bi('Three main stages','三个主推进级'),apollo:bi('Apollo spacecraft','阿波罗飞船'),lander:bi('Lunar module','登月舱')};
const file={
 parts,
 groups:[
 {id:'stage-one',name:bi('First stage','第一级'),color:'token:holder-1'},
 {id:'upper-stages',name:bi('Upper stages','上面级'),color:'token:holder-2'},
 {id:'guidance-adapter',name:bi('Guidance and adapter','制导与适配器'),color:'token:holder-3'},
 {id:'return-craft',name:bi('Command and service modules','指令舱与服务舱'),color:'token:holder-4'},
 {id:'lander',name:bi('Lunar module','登月舱'),color:'token:holder-5',scale:{unit:'m',magnification:1}},
 {id:'propellant-flow',name:bi('Fuel · oxygen · exhaust','燃料·氧化剂·排气'),color:'token:hot',card:false},
 ],flows,animations:[],poses,units:{modelUnit:'m',scale:1},
 views:{assembled:{camera:CAMERAS.hero},xray:{camera:CAMERAS.hero},exploded:{camera:{position:[160,85,180],target:[0,55,0],fov:30}},cover:CAMERAS.hero,shadows:'none',cutaway:{normal:[0,0,1],offset:0},section:{plane:'xy'}},
 presets:Object.entries(CAMERAS).map(([id,camera])=>({id:id==='lander'?'lander-view':id,label:labels[id as keyof typeof CAMERAS],camera})),
 spec:[{key:bi('Configuration','构型'),value:bi('Apollo 11 study','阿波罗11号研究'),tag:'design'},{key:bi('Launch height','发射栈高'),value:'111 m',tag:'typical'},{key:bi('Main stages','主推进级'),value:'3',tag:'typical'}],
 telemetry:[{key:bi('Reference engines · TYPICAL','参考级发动机·典型'),unit:'',follow:'engine-count',decimals:0},{key:bi('Initial mass · SIM','初始质量·模拟'),unit:'kg',follow:'initial-mass',decimals:0},{key:bi('Final mass · SIM','最终质量·模拟'),unit:'kg',follow:'final-mass',decimals:0},{key:bi('Ideal speed change · SIM','理想速度变化·模拟'),unit:'m/s',follow:'ideal-dv',decimals:2}],
 sim:{...sim,controls:runtimeControls,outputs:[...sim.outputs,{id:'configuration-name',label:bi('Current configuration','当前构型'),kind:'state',states:Object.fromEntries(phaseOptions.map(o=>[o.id,o.label]))}],table:{experiments:{...sim.table.experiments,'phase-state':{keys:['phase'],rows:runtimePhaseRows}}},bind:bindings},
};
// Validate before touching the deliverable. No source/network fetch is needed to regenerate.
partsFile.parse(file);
if(parts.length!==33||Object.keys(poses).length!==13)throw new Error('Saturn topology contract');
for(const row of sim.table.experiments.ideal.rows){const v=row.set;if(!(v['initial-mass']>v['final-mass']&&v['final-mass']>0))throw new Error('Invalid ideal mass ratio');}
const output=fileURLToPath(new URL('../../../src/content/topics/saturn-v/data/parts.json',import.meta.url));
writeFileSync(output,JSON.stringify(file,null,2)+'\n');
// Reading back catches accidental truncation and proves the artifact, not only the in-memory input.
partsFile.parse(JSON.parse(readFileSync(output,'utf8')));
process.stdout.write(`saturn-v: ${parts.length} parts, ${Object.keys(poses).length} poses, ${flows.length} flows; schema valid\n`);
