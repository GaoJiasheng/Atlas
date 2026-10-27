/** Original schematic geometry. Institutional references and limits: model-audit.md.
 * Run once from author coordinates; never normalise the generated JSON again.
 */
import fs from 'node:fs';
import { partBounds } from '../../../src/engines/space-scene/lib/parts';
import { partsFile, type Part, type Primitive } from '../../../src/engines/space-scene/schema';

type V = [number, number, number];
const bi = (en: string, zh: string) => ({ en, zh });
const bone = 'token:bone';
const parts: Part[] = [];
function sweep(at: V, path: V[], radius: number | number[], tint = bone, options = {}): Primitive {
  return {kind:'sweep', at, path, radius, color:'tissue', tint, caps:'round', ...options} as Primitive;
}
function tube(at: V,path: V[], radius: number, tint=bone): Primitive {
  return {kind:'tube',at,path,radius,bendRadius:radius*2,color:'tissue',tint};
}
function box(at: V,size: V,tint='token:neutral'): Primitive {
  return {kind:'bevelBox',at,size,bevel:Math.min(...size)*.08,color:'abrasive',tint};
}
function extrude(at: V,shape: number[][],depth:number,holes:number[][][]=[],tint=bone,options={}): Primitive {
  return {kind:'extrude',at,shape,depth,holes,bevel:Math.min(depth*.12,.012),color:'tissue',tint,...options} as Primitive;
}
const rect=(w:number,h:number)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const ellipse=(x:number,y:number,rx:number,ry:number,n=16)=>Array.from({length:n},(_,i)=>[x+rx*Math.cos(i/n*Math.PI*2),y+ry*Math.sin(i/n*Math.PI*2)]);
function add(id:string,group:string,name:[string,string],summary:[string,string],detail:[string,string],geometry:Primitive[],options={}): Part {
  const p={id,group,name:bi(...name),summary:bi(...summary),detail:bi(...detail),primitive:geometry[0],...(geometry.length>1?{extra:geometry.slice(1)}:{}),explode:{dir:[0,1,0],dist:0},connects:[],castShadow:false,clip:true,...options} as Part;
  parts.push(p); return p;
}
function sampleBone(at:V,length=1.1,tint=bone): Primitive {
  return sweep(at,[[-length/2,0,0],[-length*.39,.015,0],[-length*.22,0,0],[length*.2,-.025,0],[length*.39,0,0],[length/2,.025,0]],[.17,.19,.085,.075,.18,.15],tint,{section:{flat:.78},up:[0,0,1]});
}

// Evidence plates. Holes run through a thin upper stratum and stop on a base:
// the footprint and leaf are actual negative relief, never a floating foot/leaf.
add('bone-sample','specimens',['Bone','骨化石'],['Records the shape of a body part.','记录身体部分的形体。'],['A fossil bone is body evidence. Shape alone cannot give an exact numerical age. This generic bone is an original schematic, without a species or specimen identity. [S2, S58, S90]','骨化石属于身体证据。单凭外形不能给出精确的数值年龄。这根通用示意骨不指定物种或标本身份。[S2, S58, S90]'],[sampleBone([-1.25,.55,0],.85)]);
const track=[[-.10,-.39],[-.22,-.25],[-.20,-.08],[-.38,.12],[-.43,.34],[-.33,.40],[-.12,.13],[-.07,.11],[-.07,.51],[.04,.62],[.12,.50],[.13,.11],[.19,.10],[.37,.39],[.49,.34],[.42,.12],[.25,-.08],[.20,-.29],[.06,-.40]];
const leaf=[[-.03,-.49],[-.16,-.30],[-.30,-.06],[-.30,.14],[-.19,.35],[0,.51],[.19,.34],[.30,.12],[.28,-.10],[.14,-.34],[.03,-.49]];
add('track-slab','specimens',['Footprint','足迹板'],['Records contact with sediment during an activity.','记录活动时与沉积物的接触。'],['The recessed outline is a trace of activity, not a foot bone resting on a rock. Its three main toe impressions are a generic teaching design; this outline does not identify the maker to a species. [S2, S7, S48, S90]','凹入的轮廓记录活动，不是放在岩石上的脚骨。三个主要趾印只是通用教学设计，不能据此鉴定制造者的物种。[S2, S7, S48, S90]'],[extrude([0,.29,0],rect(1.06,1.40),.075,[track],'token:neutral',{rotation:[-90,0,0],color:'abrasive'}),box([0,.19,0],[1.06,.12,1.40],'token:ink-2')]);
add('leaf-slab','specimens',['Leaf imprint','叶印痕板'],['Records a leaf shape as a shallow impression.','用浅印痕记录叶的形状。'],['This example retains a shallow leaf impression without organic material or a carbon film. A leaf is a body part, so preservation as an impression does not make it activity evidence. The generic shape is not a species identification. [S54, S2, S90]','这个例子保留浅叶印痕，没有有机物或碳膜。叶属于身体部分，保存成印痕并不会使它变成活动证据。通用叶形不用于鉴定物种。[S54, S2, S90]'],[extrude([1.16,.30,0],rect(.90,1.26),.045,[leaf],'token:neutral',{rotation:[-90,0,0],color:'abrasive'}),box([1.16,.245,0],[.9,.06,1.26],'token:neutral')]);
add('leaf-lid','specimens',['Upper slab','覆盖片'],['Covers the impression until the slab is moved aside.','移开后才露出下面的印痕。'],['Moving this upper piece exposes the negative relief below. These two schematic pieces are not claimed to be an actual matching fossil and counterpart. [S54, S90]','移开覆盖片，才露出下方的凹印。这两片是教学示意，不称为真实配对的化石正负片。[S54, S90]'],[box([1.16,.40,0],[.90,.13,1.26])],{shell:true,explode:{dir:[0,1,0],dist:.7}});

// Continuous, horizontal contacts; the middle shell leaves a cavity for one bone.
add('sediment-low','burial',['Lower sediment','下部沉积'],['Supports the younger beds above it.','承托上方较新的沉积层。'],['In this upright, undisturbed example, the lower bed was deposited first. Layer thickness is not a clock. The section is invented and has no real time scale. [S59, S90]','在这个正立、未扰动的例子里，下层较早沉积。厚度不是时钟；该剖面为虚构示意，没有真实时间尺度。[S59, S90]'],[box([0,.3,0],[2.8,.6,1.6],'token:ink-2')]);
const middle=[box([0,.64,0],[2.8,.08,1.6]),box([0,.98,-.72],[2.8,.60,.16]),box([-1.31,.98,0],[.18,.60,1.6]),box([1.31,.98,0],[.18,.60,1.6]),box([0,.98,.72],[2.8,.60,.16])];
add('sediment-mid','burial',['Bone-bearing sediment','含骨沉积'],['Encloses the buried remains.','围住埋藏的遗存。'],['The middle shell stands for sediment surrounding the bone. X-ray makes its wall transparent so the single body part inside can be examined. Rapid burial may help preservation but does not guarantee a fossil. [S2, S90]','中层薄壳表示围着骨的沉积物。X光视图让外壁透明，以便观察里面的单个身体部分。快速埋藏有利于保存，但不保证形成化石。[S2, S90]'],middle,{shell:true});
add('sediment-high','burial',['Covering sediment','覆盖沉积'],['Covers the bone-bearing layer.','覆盖含骨层。'],['Removing this covering layer represents an exposed state after covering rock has been removed by weathering and erosion. The model does not make the bone float upward. [S3, S90]','移开覆盖层表示风化与侵蚀去掉上覆岩层后的出露状态，模型不表示骨自己向上浮起。[S3, S90]'],[box([0,1.58,0],[2.8,.6,1.6],'token:neutral')],{shell:true,explode:{dir:[0,1,0],dist:1}});
add('buried-bone','burial',['Buried bone','埋藏骨'],['Preserves a body part within the middle bed.','在中层内保存身体部分。'],['This single bone lies inside the middle bed. The pore study is an alternative magnified view of the same teaching object, not another bone. Minerals can be deposited in natural pores during burial. [S2, S4, S90]','这一根骨完整位于中层。孔隙研究是同一教学对象的替代放大视图，不是另一根骨。埋藏过程中，矿物可沉积在原有孔隙内。[S2, S4, S90]'],[sampleBone([0,.96,.22],1.75)]);
const poreHoles=[ellipse(-.71,.02,.19,.16,11),ellipse(-.27,.06,.15,.19,12),ellipse(.12,.06,.17,.15,10),ellipse(.53,.03,.17,.17,11),ellipse(-.42,-.29,.12,.10,10),ellipse(.37,-.27,.14,.10,10)];
const poreOutline=[[-1.03,-.18],[-.93,-.44],[-.70,-.48],[-.49,-.35],[.40,-.35],[.70,-.48],[.94,-.40],[1.02,-.17],[.98,.17],[.78,.43],[.54,.36],[-.51,.37],[-.77,.43],[-.98,.26]];
add('pore-shell','burial',['Bone pores','骨的孔隙'],['Shows original spaces within the bone wall.','显示骨壁内原有的空隙。'],['This enlarged, open schematic section shows irregular pores and the retained wall around them. It alternates with the whole bone, without a microscopic scale or an identified bone type. [S4, S90]','这个放大、开放的示意剖面显示不规则孔隙及其周围保留的骨壁。它与整骨交替显示，不标显微尺度，也不鉴定骨件类型。[S4, S90]'],[extrude([0,1,.60],poreOutline,.25,poreHoles),sweep([0,1,.40],[[-.90,-.26,0],[-.42,-.30,0],[.42,-.3,0],[.88,-.26,0]],[.14,.12,.12,.14],bone)],{clip:true});
add('pore-minerals','burial',['Pore minerals','孔隙矿物'],['Fills part of the existing pore space.','充填部分原有孔隙。'],['The small mineral masses sit within pores; the surrounding original wall remains. Filling a pore differs from replacement of dissolved original material, though the processes can occur together. No mineral species is assigned. [S4, S90]','小块矿物位于孔隙内，周围原有骨壁仍在。填孔不同于替代已溶解的原有物质，二者也可以共同发生。本模型不指定矿物种类。[S4, S90]'],poreHoles.slice(0,4).map(h=>extrude([0,1,.61],h.map(([x,y])=>[x!*.92,y!*.92]),.19,[],'token:cold')));

add('ash-low','age-section',['Lower ash','下方灰层'],['Provides the older bounding layer.','提供较古老的边界地层。'],['Suitable minerals in the lower primary ash layer provide an age constraint. All ages and set errors used by this teaching section are invented SIM values. Colour does not identify the rock. [S5, S58, S90]','下方原生灰层中的合适矿物提供年龄约束。本教学剖面的全部年龄及设定误差都是虚构SIM值；颜色不用于鉴定岩性。[S5, S58, S90]'],[box([0,.3,0],[2.8,.15,1.6],'token:ink-2')]);
add('fossil-bed','age-section',['Fossil bed','含化石层'],['Places fossil evidence between dated ash layers.','把化石置于可测年的灰层之间。'],['The enclosed bone is between the two ash layers in an upright, undisturbed section with primary ash and no reworking of the fossil. The dates constrain an interval, not an exact birthday or an average age. [S58, S59, S90]','正立、未扰动的剖面中，骨位于两灰层之间；灰层为原生，化石未再搬运。上下年龄限定范围，不给出精确生日或平均年龄。[S58, S59, S90]'],[box([0,.405,0],[2.8,.06,1.6]),box([0,1.49,0],[2.8,.06,1.6]),box([0,.95,-.74],[2.8,1.04,.12]),box([-1.34,.95,0],[.12,1.04,1.6]),box([1.34,.95,0],[.12,1.04,1.6]),sampleBone([0,.91,.28],1.6)],{shell:true});
add('ash-high','age-section',['Upper ash','上方灰层'],['Provides the younger bounding layer.','提供较年轻的边界地层。'],['In this checked upright section the upper primary ash layer is younger. Its thickness does not directly reveal elapsed time. These invented dates do not date the Singapore museum specimens. [S5, S58, S59, S90]','在这个已核对正立条件的剖面中，上方原生灰层较年轻。厚度不能直接显示经过的时间；虚构年龄不能用于新加坡馆藏标本。[S5, S58, S59, S90]'],[box([0,1.6,0],[2.8,.15,1.6],'token:ink-2')]);
add('dated-crystal','age-section',['Dated mineral','测年矿物'],['Represents the material whose isotope clock is measured.','代表测量同位素时钟的材料。'],['The clock concerns a specified event in suitable minerals from ash, with assumptions and uncertainty. It is not a carbon-fourteen date of a Mesozoic dinosaur bone. This enlarged generic crystal has no assigned mineral species. [S5, S6, S58, S90]','时钟针对灰中合适矿物历史的特定事件，带有假设与误差；不是用碳十四给中生代恐龙骨测年。这颗放大的通用晶体不指定矿种。[S5, S6, S58, S90]'],[extrude([1.1,1.94,.5],[[-.15,-.19],[.02,-.28],[.21,-.1],[.19,.14],[.01,.3],[-.17,.10]],.27,[],'token:cold',{rotation:[0,25,0]})],{clip:false});

// T. rex: original teaching reconstruction, never an individual specimen inventory.
const basis={direct:{en:'Direct record',zh:'直接记录',tint:bone},comparison:{en:'Comparison',zh:'比较依据',tint:'token:cold'},inferred:{en:'Inference',zh:'推定',tint:'token:neutral'}};
function sk(id:string,name:[string,string],level:keyof typeof basis,material:[string,string],summary:[string,string],geometry:Primitive[],dir:V,dist:number,connects:string[]=[],note:[string,string]=['The module is not a single bone or a count of discovered material.','模块不等于一块骨，也不是出土材料数量。']) {
 const b=basis[level];
 geometry.forEach(p=>{p.color='tissue';p.tint=b.tint;});
 return add(id,'skeleton',name,summary,[`${summary[0]}\n\nInvented teaching example. Shape evidence: ${b.en}.\nDisplay material: ${material[0]}. ${note[0]} [S7, S55, S56, S90]`,`${summary[1]}\n\n虚构教学例。形状依据：${b.zh}。\n展示材料：${material[1]}。${note[1]}[S7, S55, S56, S90]`],geometry,{short:bi(`${name[0]} · ${b.en}`,`${name[1]}·${b.zh}`),chainName:bi(name[0],name[1]),explode:{dir,dist},connects});
}
const skullOutline=[[-.83,-.21],[-.86,.11],[-.70,.25],[-.40,.31],[-.03,.45],[.27,.45],[.48,.25],[.46,-.13],[.28,-.29],[.02,-.27],[-.17,-.20],[-.39,-.25],[-.59,-.22]];
const skullHoles=[ellipse(-.60,.08,.14,.09),[[-.39,-.04],[-.34,.19],[-.15,.25],[-.01,.12],[-.09,-.07]],ellipse(.18,.18,.12,.17),[[.33,.21],[.40,.20],[.39,-.08],[.30,-.15]]];
const skullGeo:Primitive[]=[extrude([-2.76,2.36,.24],skullOutline,.11,skullHoles),extrude([-2.76,2.36,-.24],skullOutline,.11,skullHoles),sweep([-2.76,2.36,0],[[-.72,.18,-.24],[-.72,.24,0],[-.72,.18,.24]],.065),sweep([-2.76,2.36,0],[[.26,.40,-.24],[.26,.47,0],[.26,.40,.24]],.075)];
for(const z of [-.24,.24]) for(let i=0;i<7;i++){const x=-3.48+i*.135; skullGeo.push(extrude([x,2.15,z],[[-.045,.035],[.047,.035],[.015,-.16],[-.016,-.12]],.065));}
sk('sk-skull',['Skull','头骨'],'direct',['cast of the documented original','已记录原件的复制件'],['Supports the jaw and encloses the open skull framework.','与下颌对应，呈现中空的骨性框架。'],skullGeo,[-1,.4,0],.5,['sk-jaw','sk-neck'],['A cast can preserve direct shape evidence. Openings are schematic; no tooth count or specimen identity is claimed.','复制件也可以保留直接形状依据；孔洞为示意，不指定牙数或标本身份。']);
const jawGeo:Primitive[]=[];
for(const z of [-.25,.25]) {jawGeo.push(sweep([-2.76,2.01,z],[[-.79,-.01,0],[-.48,-.11,0],[-.03,-.10,0],[.32,.02,0],[.41,.14,0]],[.065,.085,.07,.10,.07]));for(let i=0;i<6;i++)jawGeo.push(extrude([-3.45+i*.15,2.005,z],[[-.04,-.01],[.04,-.01],[.012,.115]],.055));}
jawGeo.push(sweep([-3.48,1.99,0],[[0,0,-.25],[0,-.02,0],[0,0,.25]],.055));
sk('sk-jaw',['Jaw','下颌'],'direct',['original fossil in this example','本例中的原化石'],['Forms the lower outline beneath the skull.','在头骨下方构成下颌轮廓。'],jawGeo,[0,-1,0],.35);
const neckGeo=[sweep([-1.95,2.07,0],[[-.35,.23,0],[-.27,.14,0],[-.11,-.02,0],[.10,-.10,0],[.34,-.09,0]],[.12,.14,.13,.12,.14],bone,{rings:{every:.15,depth:.19}})];
sk('sk-neck',['Neck','颈部'],'comparison',['cast based on another specimen','参考其他标本的复制件'],['Joins the skull to the trunk in a curved axis.','以弯曲的轴连接头骨与躯干。'],neckGeo,[-1,.5,0],.4,['sk-trunk']);
const trunkGeo:Primitive[]=[sweep([-.62,2.01,0],[[-1.03,-.03,0],[-.59,.12,0],[0,.14,0],[.55,.05,0],[1.1,-.05,0]],[.13,.15,.16,.16,.16],bone,{rings:{every:.18,depth:.2}})];
for(let i=0;i<9;i++)trunkGeo.push(sweep([-.62,2.01,0],[[ -.85+i*.22,.08,0],[-.81+i*.22,.41,0]],[.052,.028]));
sk('sk-trunk',['Trunk','躯干轴'],'direct',['original fossils in this example','本例中的原化石'],['Links the neck, ribs and pelvis along the back.','沿背部连接颈、肋部与骨盆。'],trunkGeo,[0,.6,0],.4,['sk-ribs','sk-pelvis','sk-arm-l','sk-arm-r']);
const ribs:Primitive[]=[];
for(let i=0;i<8;i++){const x=-1.47+i*.23, width=.38+Math.sin((i+1)/9*Math.PI)*.30;for(const s of [-1,1])ribs.push(tube([x,2.08,0],[[0,0,s*.07],[.02,-.17,s*width],[.08,-.54,s*width],[.15,-.86,s*.24]],.038));}
sk('sk-ribs',['Ribs','肋部'],'comparison',['sculpted restoration constrained by comparisons','有比较依据的补塑'],['Outlines the open rib cage beneath the trunk.','在躯干下方形成开放胸廓。'],ribs,[0,0,1],.5);
const pelvisShape=[[-.42,.23],[-.26,.40],[.39,.39],[.61,.23],[.42,.05],[.21,-.05],[.04,-.19],[-.20,-.18],[-.31,.04]];
const pelvisGeo:Primitive[]=[extrude([.5,1.9,.29],pelvisShape,.13,[ellipse(.04,.08,.14,.12)]),extrude([.5,1.9,-.29],pelvisShape,.13,[ellipse(.04,.08,.14,.12)])];
for(const z of [-.29,.29]){pelvisGeo.push(sweep([.5,1.9,z],[[.07,-.09,0],[-.16,-.55,0],[-.22,-.77,0]],[.065,.05,.08]));pelvisGeo.push(sweep([.5,1.9,z],[[.12,-.11,0],[.46,-.50,0],[.62,-.66,0]],[.06,.05,.025]));}
sk('sk-pelvis',['Pelvis','骨盆'],'direct',['original fossils in this example','本例中的原化石'],['Connects the trunk with the hindlimbs and tail.','连接躯干、后肢与尾。'],pelvisGeo,[0,.5,0],.3,['sk-leg-l','sk-leg-r','sk-tail-base']);
for(const [id,z,level] of [['sk-arm-l',.43,'direct'],['sk-arm-r',-.43,'comparison']] as const){const s=Math.sign(z);const geo:Primitive[]=[sweep([-1.45,1.76,z],[[0,0,0],[.19,-.23,s*.01],[.02,-.39,s*.015]],[.085,.065,.048])];for(const dz of [-.065,.065])geo.push(sweep([-1.43,1.37,z],[[0,0,dz],[-.17,-.03,dz],[-.28,-.08,dz],[-.31,-.15,dz]],[.039,.033,.025,.006]));sk(id,[z>0?'Left forelimb':'Right forelimb',z>0?'左前肢':'右前肢'],level,[z>0?'original fossils in this example':'sculpted counterpart constrained by comparison',z>0?'本例中的原化石':'有对侧比较依据的补塑'],['Forms a short forelimb with two functional fingers.','构成带两个功能指的短前肢。'],geo,[0,0,Math.sign(z)],.45,[],['Each T. rex hand has two functional fingers [S9]. The count does not apply to every dinosaur.','霸王龙每手有两个功能指[S9]，不能推广到所有恐龙。']);}
for(const [id,z]of [['sk-leg-l',.48],['sk-leg-r',-.48]] as const){const s=Math.sign(z);const geo:Primitive[]=[sweep([.52,1.78,z],[[0,0,0],[-.30,-.40,s*.04],[-.35,-.63,s*.06]],[.16,.13,.14]),sweep([.17,1.15,z+s*.06],[[0,0,0],[.32,-.43,s*.02],[.29,-.72,s*.03]],[.095,.07,.095]),sweep([.46,.43,z+s*.09],[[0,0,0],[-.08,-.27,s*.01]],[.065,.075])];for(const dz of [-.16,0,.16])geo.push(sweep([.38,.16,z+s*.10],[[0,0,0],[-.21,-.03,dz*.7],[-.49,-.04,dz],[-.58,-.02,dz]],[.06,.05,.035,.007]));geo.push(sweep([.42,.33,z-s*.01],[[0,0,0],[.12,-.08,-s*.13],[.17,-.12,-s*.14]],[.027,.02,.005]));sk(id,[z>0?'Left hindlimb':'Right hindlimb',z>0?'左后肢':'右后肢'],'direct',['original fossils in this example','本例中的原化石'],['Supports the hindquarters through three main load-bearing toes.','通过三个主要承重趾支撑后部身体。'],geo,[0,0,Math.sign(z)],.5,[],['Three main support toes follow the theropod constraint [S48]. A small raised toe is not a fourth main support toe.','三个主要承重趾依兽脚类约束[S48]；小抬趾不是第四个主要承重趾。']);}
sk('sk-tail-base',['Tail base','尾基'],'inferred',['sculpted restoration','示意补塑'],['Continues the backbone behind the pelvis.','在骨盆后延续身体轴。'],[sweep([1.36,1.92,0],[[-.4,.02,0],[0,-.01,0],[.62,-.13,0],[1.04,-.19,0]],[.17,.15,.115,.085],bone,{rings:{every:.16,depth:.17}})],[1,0,0],.45,['sk-tail-tip']);
sk('sk-tail-tip',['Tail tip','尾端'],'inferred',['sculpted restoration','示意补塑'],['Tapers into a long tail raised clear of the platform.','逐渐收细为抬离台面的长尾。'],[sweep([2.94,1.72,0],[[-.54,.01,0],[0,-.06,0],[.62,-.10,0],[1.13,-.04,0]],[.085,.065,.037,.008],bone,{rings:{every:.17,depth:.15}})],[1,0,0],.7);

// Local living-bird study. A separate enlarged feather is a comparison object.
const bodyGeo:Primitive[]=[{kind:'sphere',at:[-1.65,1.02,0],size:[.33],scale:[1.30,1.0,.78],color:'powder',tint:'token:ink-2'},{kind:'sphere',at:[-1.96,1.36,0],size:[.23],scale:[.95,1.06,.9],color:'powder',tint:'token:ink-2'},sweep([-2.16,1.36,0],[[0,0,0],[-.26,-.03,0]],[.09,.012],'token:bone'),extrude([-1.33,.85,0],[[-.03,.16],[.43,-.20],[.49,-.31],[.31,-.34],[-.10,-.04]],.18,[],'token:ink-2')];
for(const z of [-.18,.18])bodyGeo.push({kind:'sphere',at:[-2.015,1.42,z],size:[.027],color:'powder',tint:'token:bone'});
add('myna-body','living-museum',['Myna','八哥'],['Shows the main outline of a local living bird.','显示本地活鸟的大部位轮廓。'],['This original teaching bird represents a Javan myna found in Singapore. Birds are nested within theropod dinosaurs; combining that classification with the local occurrence makes this a local living-dinosaur example. It is not a Tyrannosaurus transforming into a myna. [S8, S23, S90]','这只原创教学鸟代表新加坡能见到的爪哇八哥。鸟类嵌套于兽脚类恐龙内；把这项分类与本地出现资料合起来，它就是本地活恐龙的例子，不是霸王龙变成八哥。[S8, S23, S90]'],bodyGeo);
const wingGeo:Primitive[]=[extrude([-1.63,1.03,.23],[[-.26,.13],[.03,.18],[.31,-.12],[.34,-.30],[.11,-.27],[-.18,-.07]],.065,[],'token:neutral')];
for(let i=0;i<5;i++)wingGeo.push(tube([-1.63,1.03,.27],[[i*.047-.15,.04,0],[i*.05+.06,-.21,0]],.009,'token:ink-2'));
add('myna-wing','living-museum',['Wing','翼'],['Represents the bird forelimb.','代表鸟的前肢。'],['The folded wing marks a broad anatomical region, not a measured myna bone reconstruction. Similar outlines alone do not establish ancestry; classification uses wider fossil and anatomical evidence. [S8, S10, S90]','折翼标出解剖大部位，不是八哥骨骼的测量复原。相似外形本身不能确立祖先关系，分类结合更广泛的化石与解剖证据。[S8, S10, S90]'],wingGeo);
const birdLeg:Primitive[]=[];for(const z of [-.13,.13]){birdLeg.push(sweep([-1.7,.77,z],[[0,0,0],[.03,-.23,0],[-.06,-.47,0]],[.027,.022,.018],'token:bone'));for(const dz of [-.10,0,.10])birdLeg.push(sweep([-1.76,.30,z],[[0,0,0],[-.15,-.03,dz]],.012,'token:bone'));}
add('myna-leg','living-museum',['Bird hindlimbs','鸟的后肢'],['Supports the living-bird outline.','支撑活鸟的外形。'],['Both hindlimbs belong to the local-bird teaching model. Their appearance does not identify the maker of the separate footprint slab. No exact body measurements or fine myna osteology are claimed. [S8, S23, S90]','两条后肢属于本地鸟教学模型，外形不能用于鉴定另一工位足迹的制造者。不宣称精确身体尺寸或细致的八哥骨学数据。[S8, S23, S90]'],birdLeg);
const featherShape=[[-.015,-.63],[-.17,-.44],[-.28,-.12],[-.25,.24],[-.13,.58],[.02,.83],[.20,.51],[.30,.13],[.26,-.22],[.13,-.48],[.015,-.63]];
const featherGeo:Primitive[]=[extrude([-.52,1.14,.40],featherShape,.025,[],'token:bone'),tube([-.52,1.14,.425],[[0,-.78,0],[0,.1,0],[.02,.77,0]],.014,'token:ink-2')];for(let i=0;i<7;i++){const y=-.39+i*.15;const tip=y+.16;const width=Math.max(.03,.24*(1-Math.abs(tip-.06)/.78));for(const s of [-1,1])featherGeo.push(tube([-.52,1.14,.42],[[0,y,0],[s*width,tip,0]],.004,'token:ink-2'));}
add('myna-feather','living-museum',['Feather','羽毛比较件'],['Enlarges a modern feather for comparison.','放大现生鸟羽以便比较。'],['This is a modern-bird comparison model, not a fossil and not drawn to the bird body scale. Archaeopteryx fossils preserve a combination of features useful in studying early birds; this does not label it the proven direct ancestor of all birds. [S10, S90]','这是现生鸟类比较模型，不是化石，也不与鸟身体采用同一尺度。始祖鸟化石保存的特征组合有助研究早期鸟类，但不表示它已被证实是所有鸟的直接祖先。[S10, S90]'],featherGeo);

function sauropod(cx:number,z:number):Primitive[]{
 const geo:Primitive[]=[sweep([cx,1,z],[[-1.0,.74,0],[-.85,.64,0],[-.61,.33,0],[-.43,.03,0],[.02,.03,0],[.38,.02,0],[.77,-.12,0],[1.26,-.19,0],[1.58,-.16,0]],[.04,.055,.065,.09,.10,.085,.055,.025,.004],bone,{rings:{every:.10,depth:.15}}),{kind:'sphere',at:[cx-1.06,1.76,z],size:[.08],scale:[1.8,.70,.75],color:'tissue',tint:bone}];
 for(const x of [-.37,.34])for(const s of [-1,1]){geo.push(sweep([cx+x,1,z+s*.16],[[0,0,0],[x<0?-.05:.13,-.38,s*.04],[x<0?-.03:.08,-.76,s*.05]],[.07,.055,.07]));geo.push(sweep([cx+x,1,z+s*.16],[[x<0?-.03:.08,-.76,s*.05],[-.08,-.80,s*.05]],[.065,.07]));}
 for(let i=0;i<5;i++)for(const s of [-1,1])geo.push(tube([cx-.30+i*.13,1.03,z],[[0,0,s*.03],[0,-.13,s*.23],[.035,-.38,s*.14]],.022));
 return geo;
}
for(const [id,cx,z,title,zh]of [['prince-study',.0,-.65,'Prince','Prince'],['apollonia-study',1.0,.1,'Apollonia','Apollonia'],['twinky-study',2.0,.85,'Twinky','Twinky']]as const){
 add(id,'living-museum',[`${title} study`,`${zh} 示意`],[`Introduces ${title} through a generic long-necked quadruped study.`,`以通用长颈四足示意介绍${title}。`],[`${title} is a current name used for a diplodocid sauropod fossil displayed at Lee Kong Chian Natural History Museum. The discovery site was Dana Quarry, Wyoming, in the Jurassic Morrison Formation. This original generic study does not copy the mount, individual size, species identity, sex or original-versus-restored bone inventory. Finding the specimens together is not proof of a parent–offspring relationship. [S17, S57, S90]`,`${title}是李光前自然历史博物馆展出的一具梁龙科蜥脚类化石的现行名字，发现于怀俄明州Dana采石场侏罗纪莫里森组。本原创通用示意不复制展台姿态、个体大小，不指定种、性别，也不标原骨与修复部分。一起发现不能证明亲子关系。[S17, S57, S90]`],sauropod(cx,z));
}

// Bake the spec's one-time positive uniform affine transform for all six studies.
const sets:Record<string,string[]>={specimens:parts.filter(p=>p.group==='specimens').map(p=>p.id),burial:parts.filter(p=>p.group==='burial').map(p=>p.id),'age-section':parts.filter(p=>p.group==='age-section').map(p=>p.id),skeleton:parts.filter(p=>p.group==='skeleton').map(p=>p.id),bird:parts.filter(p=>p.id.startsWith('myna-')).map(p=>p.id),museum:parts.filter(p=>p.id.endsWith('-study')).map(p=>p.id)};
const layout:Record<string,{center:V;scale:number;bounds:{min:V;max:V}}>={};
for(const [set,ids]of Object.entries(sets)){
 const items=parts.filter(p=>ids.includes(p.id));const boxes=items.map(p=>partBounds(p)!);
 const min=[0,1,2].map(i=>Math.min(...boxes.map(b=>b.min[i]!)))as V,max=[0,1,2].map(i=>Math.max(...boxes.map(b=>b.max[i]!)))as V;
 const c=min.map((v,i)=>(v+max[i]!)/2)as V;const h=min.map((v,i)=>(max[i]!-v)/2);const k=Math.min(...[4,2,1.4].map((v,i)=>h[i]!>0?v/h[i]!:Infinity));
 layout[set]={center:c,scale:k,bounds:{min,max}};
 const point=(v:V)=>v.map((x,i)=>[0,2,0][i]!+k*(x-c[i]!)) as V;
 for(const p of items){for(const g of [p.primitive!,...(p.extra??[])]){
   g.at=point(g.at);if('size'in g&&g.size)g.size=g.size.map(v=>v*k)as never;
   if('path'in g)g.path=g.path.map(v=>v.map(x=>x*k)as V);
   if(g.kind==='extrude')g.shape=g.shape.map(v=>v.map(x=>x*k)as[number,number]);
   if('holes'in g&&g.holes)g.holes=g.holes.map(h=>h.map(v=>v.map(x=>x*k)as[number,number]));
   if('radius'in g&&g.radius!==undefined)g.radius=(Array.isArray(g.radius)?g.radius.map(x=>x*k):g.radius*k)as never;
   for(const key of ['depth','bevel','bendRadius','hollow']as const)if(key in g&&(g as any)[key]!==undefined)(g as any)[key]*=k;
   if('rings'in g&&g.rings)g.rings.every*=k;
 }p.explode.dist*=k;}
}
function camera(set:string,position:V,target:V){const{center:c,scale:k}=layout[set]!;const tr=(v:V)=>v.map((x,i)=>Math.round(([0,2,0][i]!+k*(x-c[i]!))*1e5)/1e5)as V;return{position:tr(position),target:tr(target),fov:34};}
const cameras={
 'evidence-close':camera('specimens',[4,3,6],[0,.7,0]),
 'burial-close':camera('burial',[4,2.8,5],[0,1,0]),
 'layers-close':camera('age-section',[4,2.6,5],[0,1,0]),
 'skeleton-side':camera('skeleton',[1.08,3.128,14.04],[0,1.4,0]),
 'bird-close':camera('bird',[-.5,2,5],[-1.5,1,0]),
 'museum-close':camera('museum',[4,3,7],[1.6,1,0]),
 'pores-detail':camera('burial',[1.6,1.6,2.6],[0,1,.5]),
 'crystal-detail':camera('age-section',[2.8,2.8,3],[1.1,1.9,.5]),
 'hands-detail':camera('skeleton',[-.7,1.9,3.7],[-1.3,1.4,0]),
 'feather-detail':camera('bird',[.2,1.8,3],[-.52,1.14,.4]),
 'museum-pair':camera('museum',[2.7,2.3,5],[1,1,0]),
};
add('study-plinth','context',['Study platform','示意底台'],['Supports the schematic studies.','承托示意研究。'],['A schematic layout platform, not a museum mount.','示意布局底台，不是馆藏展台。'],[box([0,-.10,0],[9,.12,3],'token:neutral')],{context:true,castShadow:false,clip:false});delete parts.at(-1)!.group;
const labels:Record<string,[string,string]>={'evidence-close':['Evidence','证据'],'burial-close':['Burial','埋藏'],'layers-close':['Layers','地层'],'skeleton-side':['Skeleton','骨架'],'bird-close':['Bird','鸟'],'museum-close':['Museum','馆藏']};
const path='src/content/topics/fossils-and-skeletons/data/parts.json';
const previous=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):{};
const result={...previous,parts,groups:[{id:'specimens',name:bi('Fossil evidence','化石证据'),color:'token:ink-2',card:false},{id:'burial',name:bi('Burial and minerals','埋藏与矿物'),color:'token:neutral',card:false},{id:'age-section',name:bi('Layers and ages','地层与年龄'),color:'token:ink-2',card:false},{id:'skeleton',name:bi('Rebuilding','骨架复原'),color:'token:bone'},{id:'living-museum',name:bi('Living birds and museum','活鸟与馆藏'),color:'token:neutral',card:false}],flows:[],animations:[],views:{assembled:{camera:cameras['skeleton-side']},xray:{camera:cameras['burial-close']},exploded:{camera:cameras['skeleton-side']},reference:{fit:'layers'},section:{plane:'xy'},cutaway:{normal:[0,0,-1],offset:1.07}},presets:Object.entries(labels).map(([id,label])=>({id,label:bi(...label),camera:cameras[id as keyof typeof cameras]}))};
result.spec=[
 {key:bi('MODEL','模型'),value:bi('Schematic','示意'),tag:'design'},
 {key:bi('EVIDENCE','证据'),value:bi('Body and activity','身体与活动'),tag:'typical'},
 {key:bi('AGES','年代'),value:bi('Bracket, not one date','年龄范围'),tag:'design'},
 {key:bi('MUSEUM','馆藏'),value:bi('Three diplodocids','三具梁龙科标本'),tag:'typical'},
];
result.sim=JSON.parse(fs.readFileSync('scripts/geo/fossils-and-skeletons/sim.json','utf8'));
partsFile.parse(result);
fs.writeFileSync(path,JSON.stringify(result,(_,v)=>typeof v==='number'?Math.round(v*1e6)/1e6:v,2)+'\n');
fs.writeFileSync('scripts/geo/fossils-and-skeletons/model-layout.json',JSON.stringify({studies:layout,cameras},null,2)+'\n');
console.log(`Wrote ${parts.length-1} selectable parts plus context; six exact-AABB study transforms.`);
