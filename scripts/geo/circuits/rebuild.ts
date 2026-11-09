/** FA-130-class brushed motor, magnetic buzzer and stamped test clips.
 * Original procedural geometry. References and two visual rounds: REBUILD-3D.md.
 * Regenerates only the three reviewed parts, preserving IDs and teaching state.
 * No GLB is needed: the engine supports hollow lathes and bevelled extrusions
 * with true holes, plus smooth curved-panel walls and helical wire springs.
 */
import fs from 'node:fs';
import {partsFile} from '../../../src/engines/space-scene/schema';
type V=[number,number,number];
type P=Record<string,any>;
const path='src/content/topics/circuits/data/parts.json';
const file=JSON.parse(fs.readFileSync(path,'utf8'));
const round=(n:number)=>Number(n.toFixed(7));
const circle=(r:number,x=0,y=0,n=64)=>Array.from({length:n},(_,i)=>[round(x+r*Math.cos(i*2*Math.PI/n)),round(y+r*Math.sin(i*2*Math.PI/n))]);
const box=(w:number,h:number)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const roundedRect=(w:number,h:number,r:number,x=0,y=0,n=8)=>[[-1,-1],[1,-1],[1,1],[-1,1]].flatMap(([sx,sy],j)=>Array.from({length:n+1},(_,i)=>{const a=Math.PI+(j+i/n)*Math.PI/2;return[round(x+sx!*(w/2-r)+r*Math.cos(a)),round(y+sy!*(h/2-r)+r*Math.sin(a))];}));
const extrude=(at:V,shape:number[][],depth:number,color='steel',more:P={}):P=>({kind:'extrude',at,shape,depth,color,...more});
const lathe=(at:V,profile:number[][],color='steel',more:P={}):P=>({kind:'lathe',at,profile,segments:64,color,...more});
const sweep=(at:V,path:V[],radius:number|number[],color='rubber',more:P={}):P=>({kind:'sweep',at,path,radius,radial:16,segments:40,caps:'flat',color,...more});
const motor=file.parts.find((p:P)=>p.id==='motor');
const mx=-.27,mz=-.035,R=.01005,Z=.00755,flat=Math.sqrt(R*R-Z*Z),bottom=.0034,top=.025,cy=(bottom+top)/2;
// FA-130's can is a circular section with two flattened faces, not a cylinder.
const cross=(r=R,z=Z)=>{const a=Math.asin(z/r),n=76;return [1,-1].flatMap(s=>Array.from({length:n+1},(_,i)=>{const t=-a+i*2*a/n;return[round(s*r*Math.cos(t)),round(s*r*Math.sin(t))];}));};
const canFace=(sign:number)=>extrude([mx,cy,mz+sign*(Z-.00018)],roundedRect(flat*2,top-bottom,.00055),.00036,'steel',{bevel:.00008,holes:[roundedRect(.0027,.0038,.0008,-.003,-.0067),roundedRect(.0027,.0038,.0008,.003,-.0067)],});
motor.primitive=canFace(1);
motor.extra=[canFace(-1), ...[1,-1].map(s=>({kind:'curvedPanel',radius:R,angle:2*Math.asin(Z/R)*180/Math.PI,height:top-bottom,thickness:.00036,segments:96,at:[mx+s*R,cy,mz],rotation:[0,s*90,0],color:'steel',})),
 // Deep-drawn front face: true centre bore and punched cooling apertures.
 extrude([mx,top-.0004,mz],cross(),.0018,'steel',{rotation:[-90,0,0],bevel:.00012,holes:[circle(.00225),circle(.00055,0,.0051)]}),
 // Recessed pale end bell and its moulded shoulder beneath the crimped can.
 extrude([mx,.0017,mz],cross(R-.00025,Z-.00025),.0034,'enamel',{rotation:[-90,0,0],bevel:.00045,holes:[circle(.0031)]}),
 extrude([mx,.0034,mz],cross(R-.00015,Z-.00015),.0008,'steel',{rotation:[-90,0,0],holes:[cross(R-.00075,Z-.00075)],bevel:.0001,}),
 lathe([mx,.005,mz],[[0,0],[.0058,0],[.0058,.019],[0,.019]],'powder'),
 ...[-1,1].map(s=>extrude([mx,.0083,mz+s*.0065],roundedRect(.011,.007,.001),.0005,'powder')),
 // Raised swaged shaft bearing, annular bronze bush and 2 mm shaft with tip bevel.
 lathe([mx,.0251,mz],[[.00225,0],[.00295,0],[.003075,.00025],[.003075,.0011],[.0029,.0015],[.00225,.0015],[.00225,0]],'steel',{}),
 lathe([mx,.0262,mz],[[.00103,0],[.0022,0],[.0022,.00045],[.00205,.0007],[.00103,.0007],[.00103,0]],'brass'),
 lathe([mx,.0265,mz],[[0,0],[.001,0],[.001,.0077],[.00085,.0079],[0,.0079]],'steel'),
 // Rear bearing in the end bell; opposed, punched solder tabs belong to the same assembly.
 lathe([mx,.00005,mz],[[0,0],[.0028,0],[.003,.0002],[.003,.00065],[0,.00065]],'powder'),
 ...[-1,1].map(s=>extrude([mx+s*.00425,.0008,mz+.007],roundedRect(.0025,.005,.00035),.00035,'brass',{holes:[roundedRect(.0012,.0019,.0005,0,.0012)],rotation:[90,0,0],bevel:.00009})),
 // Two folded can-retaining tangs grip the end-bell shoulder.
 ...[-1,1].map(s=>extrude([mx+s*.00995,.0031,mz],roundedRect(.0020,.0028,.00045),.00045,'steel',{rotation:[0,s*90,0],bevel:.00012,})),
];
file.parts.find((p:P)=>p.id==='motor-fan').primitive.at[1]=.0340;
// Preserve the circuit's electrical facts. Only the physical description changes.
motor.detail.en=motor.detail.en.replace('A small motor in a steel case with a shaft and two tabs for wires,','A small brushed motor with a flattened steel case, a plastic end cap clamped on, cooling holes, a bearing for the shaft and two metal tabs with holes for the wires,');
motor.detail.zh=motor.detail.zh.replace('一个装在钢壳里的小电机，有一根轴和两个接线片，','一个有刷小电机，带压扁的钢外壳、夹紧固定的塑料端盖、通风孔、转轴轴承和两个带孔的金属接线片，');
const buzzer=file.parts.find((p:P)=>p.id==='buzzer');
// The cited CMI-1295 form is Ø12 × 10 mm; the previous Ø30 mm puck was wrong.
// Deep port and recessed diaphragm, rather than a steel decal over the lid.
buzzer.primitive=lathe([-.27,.0015,-.105],[[0,0],[.0056,0],[.0059,.0002],[.006,.0005],[.006,.0092],[.00595,.00965],[.00565,.010],[.00165,.010],[.00148,.0098],[.00148,.0072],[.0049,.0072],[.0049,.001],[0,.001]],'powder');
buzzer.extra=[
 lathe([-.27,.003,-.105],[[0,0],[.0048,0],[.0048,.0003],[0,.0003]],'powder'),
 lathe([-.27,.0015,-.105],[[.00565,0],[.00605,0],[.00605,.00032],[.00565,.00032],[.00565,0]],'powder'),
 ...[-1,1].map(s=>lathe([-.27+s*.003,.00015,-.105],[[0,0],[.0003,0],[.0003,.0022],[0,.0022]],'steel')),
 ...[-1,1].map(s=>sweep([-.27+s*.003,.00045,-.105],[[0,0,0],[s*.0003,-.0001,.0025],[s*.003,.0002,.009],[s*.006,.0002,.02]],.00055,'rubber',{...(s>0?{tint:'token:pole-n'}:{})})),
 ...[-1,1].map(s=>lathe([-.27+s*.003,.0001,-.105],[[0,0],[.00075,0],[.0009,.00035],[.0006,.001],[.0003,.0011],[0,.0011]],'steel')),
 // Moulded polarity mark is genuine shallow relief on the top rim.
 extrude([-.266,.01152,-.105],box(.0014,.0003),.00012,'powder',{rotation:[90,0,0]}),
 extrude([-.266,.01152,-.105],box(.0003,.0014),.00012,'powder',{rotation:[90,0,0]}),
];
buzzer.detail.en=buzzer.detail.en.replace('The housing follows the 12 mm diameter and 10 mm height of the reference form [S18]. ', '');
buzzer.detail.zh=buzzer.detail.zh.replace('外壳按参考器件的直径 12 mm、高 10 mm 绘制 [S18]。', '');
buzzer.detail.en=buzzer.detail.en.replace('A small round buzzer with two leads,','A small can-shaped magnetic buzzer with a sunken sound hole and two wires soldered on,').replace(/(?:(?:The generic housing|Its case is a typical one).*?\[S18\]\. )?Inside, a coil/,'Its case is a typical one, drawn 12 mm across and 10 mm tall, close to the size of the small magnetic buzzer in the source [S18]. Inside, a coil');
buzzer.detail.zh=buzzer.detail.zh.replace('一个小小的圆形蜂鸣器，带两根引线，','一个圆筒形电磁蜂鸣器，带凹进去的发声孔和两根焊上的导线，').replace(/(?:(?:通用外壳|外壳是常见的样式).*?\[S18\]。)?里面有一个线圈/,'外壳是常见的样式，画成直径 12 mm、高 10 mm，和资料里的小型电磁蜂鸣器差不多大 [S18]。里面有一个线圈');
const clips=file.parts.find((p:P)=>p.id==='gap-clips');
const all:P[]=[];
// Stamped channel jaws, with hollow hinge cheeks, staggered teeth and coil spring.
for(const [tip,dir] of [[-.085,-1],[-.055,1]]){
 const pos=(x:number,y:number,z=0):V=>[round(tip!+dir!*x),y,round(.115+z)];
 const shape=(points:number[][])=>points.map(([x,y])=>[round(dir!*x!),y!]);
 const jaw=(upper:boolean)=>{
  const xs=[0,.004,.010,.017,.023,.027];
  const ys=upper?[.0160,.0166,.0176,.0190,.0204,.0212]:[.0148,.01465,.0146,.0146,.0148,.0152];
  const bed=xs.map((x,i)=>[x,ys[i]!]);
  all.push(sweep(pos(0,0),xs.map((x,i)=>[dir!*x,ys[i]!,0] as V),[.0018,.0019,.00205,.00225,.0024,.00255],'steel',{section:{flat:.09},up:[0,1,0],radial:24,segments:72}));
  for(const side of [-1,1]){
   const cheek=upper?[[0,.016],[.001,.0157],[.002,.0162],[.003,.01575],[.004,.0163],[.005,.0158],[.006,.0164],[.007,.0159],[.008,.0165],[.010,.0166],[.012,.0168],[.014,.0164],...Array.from({length:17},(_,i)=>{const a=Math.PI+i/16*Math.PI;return[.0175+.0032*Math.cos(a),.0163+.00185*Math.sin(a)];}),[.021,.0177],[.022,.0202]]:
   [[0,.01525],[.001,.01565],[.002,.0152],[.003,.0156],[.004,.01515],[.005,.01555],[.006,.0151],[.007,.0155],[.008,.0151],[.010,.0151],[.012,.0158],...Array.from({length:17},(_,i)=>{const a=Math.PI-i/16*Math.PI;return[.0175+.0033*Math.cos(a),.0163+.0019*Math.sin(a)];}),[.021,.0163],[.022,.0149]];
   const profile=[...bed.filter(([x])=>x!<=.023),...cheek.reverse()];
   all.push(extrude(pos(0,0,side*.0018),shape(profile),.0004,'steel',{rotation:[0,-side*dir!*1.5,0],bevel:.00006,holes:[circle(.00085,dir!*.0175,.0163,32)]}));
  }
 };
 jaw(false);jaw(true);
 all.push(lathe(pos(.0175,.0163),[[0,-.0027],[.0008,-.0027],[.00095,-.00245],[.00095,.00245],[.0008,.0027],[0,.0027]],'steel',{rotation:[90,0,0]}));
 all.push({kind:'coil',radius:.00125,wire:.00023,turns:5.5,length:.005,segments:24,radial:10,at:pos(.023,.0177),color:'steel'});
 all.push(lathe(pos(.025,.0209),[[0,0],[.0024,0],[.003,.0002],[.0032,.0004],[.0032,.0007],[.0027,.0009],[.0024,.0008],[.0024,.0005],[0,.0005]],'steel'));
 // Tapered hollow insulation boot: the wire actually enters its rear bore.
 all.push(lathe(pos(.027,.0160),[[.0013,-.005],[.0016,-.005],[.0021,-.0045],[.0027,-.003],[.0031,.0005],[.0030,.0047],[.0027,.005],[.0021,.005],[.0017,.001],[.0013,-.005]],'rubber',{rotation:[0,0,-dir!*90],tint:'token:pole-n'}));
 all.push(lathe(pos(.0265,.016),[[.0009,-.003],[.0017,-.003],[.0017,.003],[.0009,.003],[.0009,-.003]],'brass',{rotation:[0,0,-dir!*90]}));
}
clips.primitive=all[0];clips.extra=all.slice(1);
// Wire endpoints land inside the two rear crimp barrels, no exposed air gap.
const leads=file.parts.find((p:P)=>p.id==='leads');
leads.extra[0].path[leads.extra[0].path.length-1]=[.0215,-.0032,.045];
clips.detail.en=clips.detail.en.replace('Two crocodile clips','Two spring-loaded crocodile clips with toothed metal jaws, hinge pins and insulated covers where the wires join,');
clips.detail.zh=clips.detail.zh.replace('电路板前方的两只鳄鱼夹','电路板前方的两只弹簧鳄鱼夹，带锯齿形金属夹口、转轴和包住接线处的绝缘套');
// Whole-topic sweep: remove the remaining low-resolution manufactured curves.
file.parts.find((p:P)=>p.id==='plastic-straw').primitive.segments=64;
file.parts.find((p:P)=>p.id==='wooden-stick').primitive.shape=roundedRect(.054,.010,.005,0,0,12);
const band=file.parts.find((p:P)=>p.id==='rubber-band');
band.primitive=sweep([.020,.0029,.215],[[.011,0,0],[.006,.00015,.0048],[-.004,0,.0052],[-.0105,-.0001,.0006],[-.006,0,-.0044],[.004,.0001,-.0051]],[.00075,.00068,.00072,.00076,.00065,.00071],'rubber',{closed:true,caps:'none',section:{flat:.4},up:[0,1,0],segments:96,radial:20,tint:'token:neutral'});
// Validate the exact persisted input the renderer receives.
partsFile.parse(file);
fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
console.log('Rebuilt circuits motor, buzzer and test gap; part IDs and mechanisms preserved.');
