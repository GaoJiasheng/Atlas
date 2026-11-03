/** Original sound apparatus. Run with pnpm tsx scripts/geo/sound/build-sound.ts.
 * Keeps the lesson's 24 numbered parts, controls and local-motion markers.
 * Turned/pressed profiles follow the reference topology in reference-audit.md.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { primitiveSchema, partsFile } from '../../../src/engines/space-scene/schema';

type V = [number,number,number];
type P = [number,number];
const path = 'src/content/topics/sound/data/parts.json';
const data = JSON.parse(readFileSync(path,'utf8'));
const part = (id: string) => data.parts.find((p: {id:string}) => p.id===id);
const round = (n:number) => +n.toFixed(7);
const add = (a:V,b:V):V => a.map((n,i)=>round(n+b[i]!)) as V;
const lathe = (at:V, profile:P[], color:string, rest={}) => primitiveSchema.parse({kind:'lathe',at,profile,segments:48,color,...rest});
const box = (at:V,size:V,color:string,bevel=.006,rest={}) => primitiveSchema.parse({kind:'bevelBox',at,size,bevel,color,...rest});
const ring = (at:V,r:number,t:number,h:number,color='steel',rest={}) => lathe(at,[[r-t,-h/2],[r,-h/2],[r,h/2],[r-t,h/2],[r-t,-h/2]],color,rest);
const sweep = (at:V,path:V[],radius:number,color:string,rest={}) => primitiveSchema.parse({kind:'sweep',at,path,radius,radial:10,segments:12,caps:'flat',color,...rest});
const circle = (r:number,n=24):P[] => Array.from({length:n},(_,i)=>[round(r*Math.cos(i/n*2*Math.PI)),round(r*Math.sin(i/n*2*Math.PI))]);

// Single-headed concert tom: uninterrupted shell, 45-degree bearing edge,
// reinforcing rings, rolled triple-flange hoop, six matched tension assemblies.
const centre:V=[-1.95,.85,1.04];
const shell=part('drum-shell');
shell.primitive=lathe(centre,[[.324,-.2],[.338,-.2],[.34,-.196],[.34,.178],[.336,.194],[.326,.2],[.319,.184],[.319,-.192],[.324,-.2]],'wood');
shell.extra=[
  ring(add(centre,[0,-.178,0]),.319,.012,.025,'wood'),
  ring(add(centre,[0,.15,0]),.319,.012,.025,'wood'),
  lathe(add(centre,[0,-.193,0]),[[.328,-.007],[.344,-.007],[.347,-.003],[.347,.004],[.342,.008],[.335,.008],[.335,0],[.328,0],[.328,-.007]],'stainless'),
];
for(let i=0;i<6;i++) {
  const a=(i*60+30)*Math.PI/180;
  const radial=(r:number,y:number):V=>add(centre,[r*Math.sin(a),y,r*Math.cos(a)]);
  // Insulating gasket and tapered cast lug body: the spindle enters its top.
  const lugShape:P[]=Array.from({length:40},(_,j)=>{const t=j*Math.PI/20;return [round(Math.sin(t)*(.012+.007*(1+Math.cos(t))/2)),round(.055*Math.cos(t))];});
  shell.extra.push(primitiveSchema.parse({kind:'extrude',shape:lugShape,depth:.01,bevel:.002,at:radial(.344,.014),rotation:[0,i*60+30,0],color:'rubber'}));
  shell.extra.push(primitiveSchema.parse({kind:'extrude',shape:lugShape,depth:.029,bevel:.0095,at:radial(.36,.014),rotation:[0,i*60+30,0],color:'stainless'}));
  // A stepped spindle, fine thread ridges and square drum-key socket head.
  const thread:P[]=[[0,-.013],[.006,-.013]];
  for(let j=0;j<8;j++)thread.push([.0065,-.012+j*.0025],[.0053,-.0108+j*.0025]);
  thread.push([.0053,.144],[.01,.144],[.01,.148],[0,.148]);
  shell.extra.push(lathe(radial(.366,.066),thread,'steel',{segments:16}));
  shell.extra.push(box(radial(.366,.221),[.014,.014,.014],'stainless',.001,{rotation:[0,i*60+30,0]}));
}
// A genuine little vent ferrule, open bore and rolled lip, between lugs.
shell.extra.push(ring(add(centre,[.34,.03,0]),.012,.004,.018,'brass',{rotation:[0,0,90],segments:24}));
shell.name={en:'Single-head drum shell',zh:'单面鼓鼓腔'};
shell.summary={en:'A hollow shell and tension hardware support one stretched head.',zh:'空心鼓腔与张力五金支撑一层绷紧的鼓面。'};
shell.detail={en:'A continuous wooden shell has shaped bearing edges, reinforcing rings and six lugs with tension rods. The rolled upper hoop tensions one head; the lower edge remains open with a protective ring and no second head. This generic concert-tom DESIGN is not a solved resonator. [S1, S5]',zh:'连续木质鼓腔带有成形承边、加强圈，以及六组鼓耳与拉杆。上鼓圈绷紧一层鼓面；下沿有保护圈，底部敞开，没有第二层鼓面。这是通用单面筒鼓的设计参考，不是求解过的共鸣器。[S1, S5]'};
const head=part('drumhead');
head.primitive=lathe([-1.95,1.054,1.04],[[0,-.002],[.321,-.002],[.327,-.004],[.335,-.009],[.34,-.016],[.34,-.004],[.335,.002],[.323,.004],[0,.004]],'membrane');
head.extra=[lathe(add(centre,[0,.199,0]),[[.334,-.022],[.349,-.022],[.351,-.018],[.351,-.012],[.343,-.012],[.343,.018],[.347,.022],[.347,.027],[.339,.027],[.336,.022],[.336,-.014],[.334,-.014],[.334,-.022]],'stainless')];
for(let i=0;i<6;i++) {
  const a=(i*60+30)*Math.PI/180;
  const at=add(centre,[.355*Math.sin(a),.207,.355*Math.cos(a)]);
  head.extra.push(primitiveSchema.parse({kind:'extrude',at,rotation:[90,0,-(i*60+30)],shape:[[-.022,-.014],[.022,-.014],[.022,.011],[.014,.026],[-.014,.026],[-.022,.011]],holes:[circle(.0075,16).map(([x,y])=>[x,y+.009])],depth:.006,bevel:.0015,color:'steel'}));
}
// Keep the existing marker's height and phase: membrane's top remains 1.058.

// Bench's work surface stays at .65, so every teaching specimen stays attached.
// Extend its structure downwards to restore standing-height island proportions.
const bench=part('laboratory-bench');
bench.primitive=box([0,.59,0],[6.4,.12,3.6],'powder',.025,{tint:'#666b64'});
bench.extra=[];
for(const x of [-2.91,2.91])for(const z of [-1.48,1.48]) {
  bench.extra.push(box([x,-.36,z],[.15,1.78,.15],'powder',.012,{tint:'#c2c4b9'}));
  bench.extra.push(lathe([x,-1.29,z],[[0,-.05],[.095,-.05],[.105,-.036],[.105,-.021],[.044,-.014],[.025,-.014],[.025,.06],[0,.06]],'rubber',{segments:24}));
}
for(const z of [-1.48,1.48])bench.extra.push(box([0,.38,z],[5.85,.22,.11],'powder',.009,{tint:'#a6ada3'}));
for(const x of [-2.91,2.91]) {
  bench.extra.push(box([x,.38,0],[.11,.22,2.85],'powder',.009,{tint:'#a6ada3'}));
  bench.extra.push(box([x,-.96,0],[.1,.13,2.88],'powder',.009,{tint:'#a6ada3'}));
}
// Two suspended drawer pedestals; separate front panels leave honest shadow gaps.
for(const x of [-2.18,2.18]) {
  bench.extra.push(box([x,-.19,.1],[1.22,1.19,2.55],'powder',.018,{tint:'#b6beb3'}));
  for(const [y,h] of [[.20,.27],[-.20,.50],[-.62,.30]] as const) {
    bench.extra.push(box([x,y,1.402],[1.16,h,.038],'enamel',.008,{tint:'#c6ccbf'}));
    bench.extra.push(sweep([x,y+.04,1.424],[[-.24,0,0],[-.24,0,.055],[-.20,0,.065],[.20,0,.065],[.24,0,.055],[.24,0,0]],.012,'stainless',{segments:24,radial:12}));
  }
}
bench.extra.push(box([0,.513,0],[6.25,.025,3.45],'rubber',.008));
bench.summary={en:'A resin worktop, steel frame and suspended storage support the apparatus.',zh:'树脂台面、钢架与悬挂式储物柜支撑实验器材。'};
bench.detail={en:'This original laboratory island has a rounded resin worktop, under-top rails, steel legs, levelling feet and suspended drawer cabinets. The worktop retains the original specimen contact height; its taller underframe is schematic. It is not selectable and carries no measured acoustic properties. [S1]',zh:'这个原创实验岛台带有圆边树脂台面、台下横梁、钢腿、调平脚与悬挂式抽屉柜。台面保留原有实验器材的接触高度；下方较高的框架为示意结构。它不可选中，也不承载实测声学参数。[S1]'};

// A loudspeaker cutaway with a real hollow baffle and open right-hand case.
// Axis +Z; rear depth -.23 from the mounting flange. Never a disc over a box.
const speaker=part('speaker-case');
speaker.primitive=primitiveSchema.parse({kind:'panelHole',size:[.5,.62,.024],hole:{r:.178,at:[0,.02]},at:[1.45,.96,-.754],color:'powder',tint:'#51564f'});
const front:V=[1.45,.98,-.738];
const turn=(profile:P[],color:string,rest={})=>lathe(front,profile,color,{rotation:[90,0,0],...rest});
speaker.extra=[
 box([1.212,.96,-.95],[.024,.62,.36],'powder',.009,{tint:'#51564f'}),
 box([1.45,1.258,-.95],[.5,.024,.36],'powder',.009,{tint:'#51564f'}),
 box([1.45,.662,-.95],[.5,.024,.36],'powder',.009,{tint:'#51564f'}),
 box([1.45,.96,-1.118],[.5,.62,.024],'powder',.009,{tint:'#51564f'}),
 // Mounting flange with shallow screw seating lip.
 turn([[.161,-.016],[.181,-.016],[.184,-.012],[.184,-.004],[.18,0],[.165,0],[.161,-.004],[.161,-.016]],'steel'),
 // Half-roll foam surround, smooth arc, and its return surface.
 turn([...Array.from({length:17},(_,i)=>{const a=i*Math.PI/16;return [.153+.015*Math.cos(a),.002+.015*Math.sin(a)] as P;}),[.138,-.002],[.168,-.002],[.168,.002]],'rubber'),
 // Curvilinear pressed-paper cone with a thin, fully closed return profile.
 turn([[.032,-.104],[.052,-.092],[.074,-.069],[.099,-.044],[.121,-.022],[.139,.001],[.141,.002],[.141,-.001],[.123,-.025],[.101,-.047],[.076,-.072],[.054,-.095],[.033,-.107],[.032,-.104]].reverse() as P[],'fabric',{tint:'#5b5e52'}),
 // Spherical-segment dust cap built from a sampled profile, not a disc.
 turn([[0,-.056],...Array.from({length:13},(_,i)=>{const a=i*Math.PI/24;return [.044*Math.sin(a),-.1+.044*Math.cos(a)] as P;}),[.044,-.101],[0,-.101]].reverse() as P[],'fabric',{tint:'#42483e'}),
 // Ferrite ring sits between steel top/back plates; central pole is vented.
 turn([[.039,-.227],[.082,-.227],[.084,-.224],[.084,-.179],[.081,-.176],[.039,-.176],[.039,-.227]],'rubber'),
 turn([[.0365,-.179],[.086,-.179],[.086,-.169],[.0365,-.169],[.0365,-.179]],'steel'),
 turn([[.012,-.241],[.086,-.241],[.087,-.235],[.087,-.228],[.03,-.228],[.03,-.133],[.012,-.133],[.012,-.241]],'steel'),
 // Coil former and copper winding: visible through the basket windows.
 turn([[.0305,-.187],[.032,-.187],[.032,-.095],[.0305,-.095],[.0305,-.187]],'plastic',{tint:'#a88d60'}),
 primitiveSchema.parse({kind:'coil',at:add(front,[0,0,-.17]),rotation:[90,0,0],radius:.0325,wire:.0013,turns:10,length:.026,segments:24,radial:6,color:'copper'}),
 // Corrugated centring spider, ten radial section crests sampled by radius.
 turn([[.032,-.129],...Array.from({length:33},(_,i)=>[.033+i*.00135,-.134+.0035*Math.cos(i*Math.PI/4)] as P),[.077,-.143],[.033,-.143],[.032,-.129]].reverse() as P[],'fabric',{tint:'#a58b52'}),
 turn([[.072,-.155],[.082,-.155],[.082,-.14],[.072,-.14],[.072,-.155]],'powder'),
];
// Four stamped, tapered basket ribs with bent flanges. Their open spaces expose
// the spider/magnet; they are deliberately not a solid conical basket substitute.
for(let i=0;i<4;i++) {
 const angle=i*90+45;
 speaker.extra.push(primitiveSchema.parse({kind:'extrude',at:front,shape:[[.166,-.009],[.177,-.012],[.17,-.037],[.098,-.153],[.08,-.166],[.073,-.151],[.09,-.14],[.153,-.03]],depth:.023,bevel:.003,rotation:[90,angle,0],color:'steel'}));
 const a=angle*Math.PI/180;
 speaker.extra.push(lathe(add(front,[.174*Math.cos(a),.174*Math.sin(a),.005]),[[0,-.003],[.0055,-.003],[.006,.002],[.004,.005],[0,.005]],'steel',{segments:16,rotation:[90,0,0]}));
}
for(const x of [-.06,.06])speaker.extra.push(sweep(front,[[x,-.07,-.06],[x*1.35,-.08,-.115],[x*1.2,-.09,-.15]],.0015,'copper',{segments:16,radial:6}));
// Section-edge trim signals an intentional exhibit cut, rather than missing casework.
speaker.extra.push(box([1.688,.96,-1.1],[.015,.575,.014],'wood',.003));
speaker.extra.push(box([1.688,1.239,-.94],[.015,.014,.32],'wood',.003));
speaker.extra.push(box([1.688,.682,-.94],[.015,.014,.32],'wood',.003));
speaker.detail={en:'The open-side cutaway shows the paper cone, rolled surround, domed dust cap, open metal basket, corrugated spider, voice coil and rear magnet inside a hollow cabinet. This original generic DESIGN has no brand or measured sound level. Near and far poses illustrate moving away without calculating decibels or a safe duration. [S1, S10, S13]',zh:'侧面剖开的空心箱体露出纸盆、卷边悬边、圆顶防尘帽、开窗金属盆架、波纹定心支片、音圈与后方磁体。这个原创通用设计不对应品牌或实测声级；远近姿态示意远离声源，不计算分贝或安全聆听时长。[S1, S10, S13]'};

// Move label 18's real anchor onto the left vibrating span, away from bridge 20.
// Two collinear, end-contact spans render as one unbroken physical string.
const string=part('monochord-string');
string.primitive={kind:'sweep',path:[[-.375,0,0],[.375,0,0]],radius:.006,radial:8,segments:4,caps:'flat',at:[-1.945,1.1,-.9],color:'steel'};
string.extra=[{kind:'sweep',path:[[-.545,0,0],[.545,0,0]],radius:.006,radial:8,segments:4,caps:'flat',at:[-1.025,1.1,-.9],color:'steel'}];
if(!data.sim.bind.some((b:{part:string})=>b.part==='wave-reference')) data.sim.bind.push({control:'medium',part:'wave-reference',visible:{eq:'air'}});
// Tuning fork: same U outline (outer r .2, inner r .12, bend centre y −.12), with a 32-step bend so close-ups stay smooth.
const bend=(r:number,from:number,to:number):P[]=>Array.from({length:33},(_,i)=>{const a=(from+(to-from)*i/32)*Math.PI;return [round(r*Math.cos(a)),round(-.12+r*Math.sin(a))];});
part('fork').primitive.shape=[[-.2,.62],...bend(.2,1,2),[.2,.62],[.12,.62],...bend(.12,2,1),[-.12,.62]];
// Parse without serialising defaults into the authored data.
partsFile.parse(data);
writeFileSync(path,JSON.stringify(data,null,2)+'\n');
console.log('Built sound: drum, loudspeaker, laboratory bench; preserved numbered parts and simulations.');
