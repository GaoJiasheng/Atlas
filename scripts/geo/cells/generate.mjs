/** Original Atlas procedural model; metres, Y up, +Z towards viewer.
 * Run: pnpm tsx scripts/geo/cells/generate.mjs
 * References inspected: preparation cells.png and cells-microscope.png,
 * 2026-10-29; scientific topology from docs/63 §3 / facts F-B04–F-B12.
 * No downloaded mesh, photograph or texture enters the production model.
 */
import { writeFileSync } from 'node:fs';
import { makeMicroscopeSim } from '../../../src/engines/space-scene/lib/sim/microscope-fixture.ts';
import { fileURLToPath } from 'node:url';
const root = new URL('../../../', import.meta.url);
const output = new URL('src/content/topics/cells/data/parts.json', root);
const bi = (en, zh) => ({ en, zh });
const round = n => Math.round(n * 1e9) / 1e9;
const ellipse = (rx, ry, x=0, y=0, n=48) => Array.from({length:n}, (_,i) => [round(x+rx*Math.cos(i*2*Math.PI/n)),round(y+ry*Math.sin(i*2*Math.PI/n))]);
const rect = (w,h,r=.003) => {
  const pts=[];
  for (let c=0;c<4;c++) {
    const a=c*Math.PI/2, cx=(c===0||c===3?1:-1)*(w/2-r), cy=(c<2?1:-1)*(h/2-r);
    for(let j=0;j<=6;j++) { const t=a+j*Math.PI/12; pts.push([round(cx+r*Math.cos(t)),round(cy+r*Math.sin(t))]); }
  }
  return pts;
};
const extrude = (shape, depth, at, color='membrane', holes=[]) => ({kind:'extrude',shape,depth,at,color,...(holes.length?{holes}:{}),bevel:0});
const ring = (w,h,iw,ih,d,at,color='membrane') => extrude(rect(w,h),d,at,color,[rect(iw,ih,.002)]);
const box = (size,at,color='membrane',bevel=0) => ({kind:bevel?'bevelBox':'box',size,at,color,...(bevel?{bevel}:{})});
const cyl = (r,h,at,color='steel',rotation) => ({kind:'cylinder',size:[r,r,h],at,color,...(rotation?{rotation}:{})});
const ellipsoid = (size,at,color='tissue',tint='token:neutral') => ({kind:'sphere',size:[.5],scale:size,at,color,tint});
const parts=[];
const part = (id,en,zh,group,summary,detail,primitive,more={}) => {
 const p={id,name:bi(en,zh),group,summary:bi(...summary),detail:bi(...detail),primitive,castShadow:false,...more}; parts.push(p); return p;
};
// A thin ellipsoid shell is laminated in Z: each layer is an annulus,
// never a second solid cell. The cytoplasm has an actual nucleus opening.
const animalLayers = (membrane) => Array.from({length:15}, (_,i) => {
 const depth=.016/15, z=(i-7)*depth, f=Math.sqrt(1-(z/.008)**2);
 const outer=ellipse(.060*f,.045*f);
 let holes=[];
 if(membrane) holes=[ellipse(.0587*f,.0437*f)];
 else if(Math.abs(z-.001)<.0065+depth/2) {const near=Math.max(0,Math.abs(z-.001)-depth/2), nf=Math.sqrt(Math.max(0,1-(near/.0065)**2)); holes=[ellipse(.012*nf,.010*nf,.015,0)];}
 return extrude(membrane?outer:ellipse(.0587*f,.0437*f),depth,[.1,.1,z],membrane?'membrane':'membrane',holes);
});
const am=animalLayers(true), ac=animalLayers(false);
part('animal-membrane','Cell membrane','细胞膜','animal-cell',
 ['Regulates substances entering and leaving the cell.','调节物质进出细胞。'],
 ['The cell membrane separates the inside of this animal cell from its surroundings. It regulates the passage of substances; it is not a rigid cell wall [S4].\n\nThe model uses a hollow, thickened boundary around a flattened example cell. Real membranes are much thinner than this visible model boundary, and real animal cells have varied shapes [S20].',
 '细胞膜分隔这个动物细胞的内外，调节物质进出；它不是坚硬的细胞壁 [S4]。\n\n模型用加厚的中空薄壳围住一个扁平的示例细胞。真实细胞膜远比模型边界薄，动物细胞的形状也并不相同 [S20]。'],am[7],{extra:am.filter((_,i)=>i!==7),shell:true,explode:{dir:[0,0,1],dist:.07,stage:0},connects:['animal-cytoplasm']});
part('animal-cytoplasm','Cytoplasm','细胞质','animal-cell',
 ['Supports many chemical reactions in the cell.','是细胞内许多化学反应发生的区域。'],
 ['Cytoplasm occupies the region inside the membrane and outside the nucleus. Many chemical reactions occur here; the model leaves a space for the nucleus rather than filling it with another solid layer [S4].\n\nThe translucent material exposes the model interior. It is an explanatory colour and does not reproduce the appearance of an unstained cell through a classroom microscope [S20].',
 '细胞质位于细胞膜以内、细胞核以外，许多化学反应在这里发生。模型为细胞核留出空间，没有用第二层实心材料把核填满 [S4]。\n\n半透明的材料便于看见模型内部；它是说明用的视觉编码，不代表未经染色的细胞在课堂显微镜下的样子 [S20]。'],ac[7],{extra:ac.filter((_,i)=>i!==7),explode:{dir:[0,0,-1],dist:.02,stage:1},connects:['animal-membrane','animal-nucleus']});
part('animal-nucleus','Nucleus','细胞核','animal-cell',
 ['Holds genetic instructions and helps control the cell.','保存遗传指令，并参与控制细胞活动。'],
 ['The nucleus contains genetic material and helps control the activities of this example cell. It is a separate structure within the cytoplasm [S4].\n\nThis flattened epithelial model has one nucleus. The example does not mean that all animal cells have the same shape or that a nucleus is always central; small vesicles and other structures are omitted [S20].',
 '细胞核含有遗传物质，参与控制这个示例细胞的活动；它是细胞质中的独立结构 [S4]。\n\n这个扁平上皮细胞模型只画一个核。它不表示所有动物细胞形状相同，也不表示核总在中央；模型省略了小囊泡等结构 [S20]。'],ellipsoid([.023,.019,.013],[.115,.1,.001]),{explode:{dir:[0,0,1],dist:.025,stage:2},connects:['animal-cytoplasm']});
part('plant-cell-wall','Cell wall','细胞壁','plant-cell',
 ['Supports and protects the plant cell.','支持并保护植物细胞。'],
 ['The cell wall lies outside the cell membrane. It supports and protects the plant cell, while the membrane still regulates passage into and out of the cell [S4].\n\nThe rounded rectangular shell is a design study of one photosynthetic plant cell. Wall thickness is exaggerated so the wall and membrane remain distinguishable; neither is a solid box filling the cell [S20].',
 '细胞壁在细胞膜外侧，支持和保护植物细胞。细胞膜仍然存在，继续调节物质进出 [S4]。\n\n圆角长方壳代表一个能进行光合作用的植物细胞。模型把壁厚画大，让壁和膜可以分别辨认；两者都不是填满内部的实心盒子 [S20]。'],ring(.16,.08,.158,.078,.05,[-.1,.12,0],'tissue'),{shell:true,explode:{dir:[0,0,1],dist:.18,stage:0},connects:['plant-membrane']});
part('plant-membrane','Cell membrane','细胞膜','plant-cell',
 ['Regulates substances entering and leaving the cell.','调节物质进出植物细胞。'],
 ['The plant cell membrane forms a boundary just inside the cell wall and regulates substances passing into and out of the cell. The wall does not replace it [S4].\n\nA narrow visual gap separates the two hollow shells in this model. That separation and the membrane thickness are enlarged for legibility, rather than measured from a microscope image [S20].',
 '植物细胞膜紧靠细胞壁内侧，形成细胞内外的边界并调节物质进出；细胞壁不会代替细胞膜 [S4]。\n\n模型在两个中空薄壳之间留了可见间隙。间隙与膜厚都是为了辨认而放大，不是从显微图像量得的尺寸 [S20]。'],ring(.1576,.0776,.1564,.0764,.046,[-.1,.12,0]),{shell:true,explode:{dir:[0,0,1],dist:.125,stage:1},connects:['plant-cell-wall','plant-cytoplasm']});
const cyt=[
 extrude([[-.009,-.03],[.009,-.03],[.009,.03],[-.009,.03]],.044,[-.169,.12,0],'membrane',[ellipse(.0073,.0063)]),
 box([.018,.06,.044],[-.031,.12,0]),
 box([.156,.008,.044],[-.1,.154,0]),
 box([.156,.008,.044],[-.1,.086,0]),
 box([.12,.06,.002],[-.1,.12,.021]),
 box([.12,.06,.002],[-.1,.12,-.021]),
];
part('plant-cytoplasm','Cytoplasm','细胞质','plant-cell',
 ['Supports reactions in the region around the vacuole.','在大液泡外围，是许多化学反应发生的区域。'],
 ['Much of the cytoplasm in a mature plant cell can lie around a large central vacuole. Many chemical reactions take place in the cytoplasm [S4].\n\nSix thin model bodies surround the vacuole; the side body also has an opening for the nucleus. The empty centre is not a second solid mass of cytoplasm, and the translucent colour is an explanatory choice [S20].',
 '成熟植物细胞的大液泡外围可分布着一层细胞质；许多化学反应在细胞质中进行 [S4]。\n\n模型用六个薄体围住液泡，侧面的薄体为核留孔，没有把中央再填成实心细胞质。半透明颜色只是说明用的视觉编码 [S20]。'],cyt[0],{extra:cyt.slice(1),explode:{dir:[0,0,-1],dist:.035,stage:1},connects:['plant-membrane','plant-nucleus','plant-chloroplasts','plant-vacuole']});
part('plant-nucleus','Nucleus','细胞核','plant-cell',
 ['Holds genetic instructions and helps control the cell.','保存遗传指令，并参与控制细胞活动。'],
 ['The nucleus contains genetic material and helps control cell activities. A large vacuole may leave it near the side of a mature plant cell, so position alone is not an identification rule [S4, S10].\n\nThis model places one nucleus outside the central vacuole with a visible gap. The location, size and separation are design choices for reading the model [S20].',
 '细胞核含有遗传物质，参与控制细胞活动。成熟植物细胞中的大液泡可使核靠近一侧，因此不能只凭位置辨认核 [S4, S10]。\n\n模型只画一个核，位于中央液泡之外，两者有可见间隙。位置、大小和间隙是为了讲解而选择的设计值 [S20]。'],ellipsoid([.014,.012,.012],[-.169,.12,0]),{explode:{dir:[-.3,0,1],dist:.04,stage:2},connects:['plant-cytoplasm']});
const chloroplast=ellipsoid([.014,.004,.008],[-.1,.084,0],'tissue','token:seedling');
const chloroplastTop=ellipsoid([.014,.004,.008],[-.1,.156,0],'tissue','token:seedling');
part('plant-chloroplasts','Chloroplasts','叶绿体','plant-cell',
 ['Use light energy to make food by photosynthesis.','利用光能进行光合作用，制造食物。'],
 ['Chloroplasts contain chlorophyll, a pigment involved in absorbing light for photosynthesis. They occur in photosynthetic plant cells; not every plant cell has them [S4].\n\nThe model places six chloroplasts around the large vacuole. Six is a design count, not a rule for real cells. Internal membranes are omitted. Onion bulb epidermis is a useful comparison because it normally lacks chloroplasts [S20, S23, S24].',
 '叶绿体含有叶绿素；这种色素参与吸收光，供光合作用制造食物。叶绿体存在于进行光合作用的植物细胞中，并不是每个植物细胞都有 [S4]。\n\n模型把六个叶绿体放在大液泡外围；六个是设计数量，不是真实细胞的固定规则。模型省略叶绿体的内部膜结构。洋葱鳞茎表皮通常没有叶绿体，可用来比较 [S20, S23, S24]。'],chloroplast,{extra:[chloroplastTop],repeat:{count:3,axis:[1,0,0],spacing:.05},explode:{dir:[0,1,1],dist:.035,stage:2},connects:['plant-cytoplasm']});
part('plant-vacuole','Large vacuole','大液泡','plant-cell',
 ['Contains cell sap and helps support the plant cell.','容纳细胞液，并帮助支持植物细胞。'],
 ['A large central vacuole contains water and dissolved substances, often called cell sap. Its contents help maintain pressure against the cell wall and support a mature plant cell [S4].\n\nThe clear central body represents liquid, not air or an empty hole. Its design envelope is 0.12 × 0.06 × 0.04 m in the enlarged model. Animal cells can have smaller vesicles, which are omitted here [S20, S4].',
 '大液泡中含有水和溶解物质，常称为细胞液。液泡内的液体有助于维持向细胞壁施加的压力，支持成熟植物细胞 [S4]。\n\n中央透明体表示液体，不是空气或空洞。在放大的模型中，其设计包络为 0.12 × 0.06 × 0.04 米。动物细胞也可有较小囊泡，本模型没有画出 [S20, S4]。'],box([.12,.06,.04],[-.1,.12,0],'glass',.004),{explode:{dir:[0,0,1],dist:.075,stage:2},connects:['plant-cytoplasm']});
// Instrument: base sits on y=0; the vertical specimen optical axis is x=.18,z=0.
part('scope-base','Base','底座','microscope-bench',['Supports the microscope on the bench.','在台面上稳固支撑显微镜。'],['The broad base supports the microscope and houses the lower illumination assembly [S7].\n\nThis unbranded design is 0.18 m wide, 0.03 m tall and 0.14 m deep. In class, carry an instrument according to the teacher’s guidance; the general laboratory method supports the base while holding the arm [S20, S6].','宽底座支撑显微镜，下方照明机构也位于这里 [S7]。\n\n这个无品牌模型的底座设计为宽 0.18 米、高 0.03 米、深 0.14 米。课堂搬运应听从教师指导；一般实验室方法是握住镜臂，同时托住底座 [S20, S6]。'],box([.18,.03,.14],[.2,.015,0],'enamel',.007),{castShadow:true,connects:['scope-arm','scope-illuminator']});
const armShape=[[.022,-.15],[.04,-.15],[.04,.044],[.034,.073],[.017,.098],[-.013,.115],[-.064,.115],[-.064,.093],[-.017,.093],[.002,.079],[.013,.054],[.016,.02],[.016,-.11]];
part('scope-arm','Arm','镜臂','microscope-bench',['Supports the head above the specimen.','在标本上方支撑镜头机构。'],['The arm connects the base with the upper optical assembly. Its open shape leaves working space around the slide and stage [S7].\n\nThe model uses a curved cast support without reproducing a manufacturer’s design. It provides the arm grip identified in general laboratory carrying guidance; actual carrying instructions remain specific to the instrument and teacher [S20, S6, S21].','镜臂连接底座和上方镜头机构；开放的轮廓给载物台和玻片留出操作空间 [S7]。\n\n模型使用弧形支撑，不复制某个厂商的产品。一般实验室搬运指导会要求握住镜臂；具体搬法仍应遵照仪器说明和教师要求 [S20, S6, S21]。'],extrude(armShape,.035,[.25,.18,-.03],'enamel'),{connects:['scope-base','scope-tube','scope-stage'],castShadow:true});
part('scope-eyepiece','Eyepiece','目镜','microscope-bench',['Magnifies the image formed by the objective.','再次放大物镜形成的图像。'],['The eyepiece magnifies the image made by the objective. In a compound light microscope both lens systems contribute to total magnification [S3, S7].\n\nThis design has one eyepiece rated 10×. Its slight viewing tilt is a mechanical design choice; it is not a separate third objective. The visible end glass is part of the same eyepiece [S20].','目镜进一步放大物镜形成的图像；复式光学显微镜的总放大率由这两组镜头共同决定 [S3, S7]。\n\n本模型有一个设计倍率为 10 倍的目镜，略向观察者倾斜。末端玻璃仍属于同一目镜，并不是第四个物镜 [S20]。'],cyl(.012,.045,[.18,.326,.007],'powder',[24,0,0]),{extra:[cyl(.0095,.002,[.18,.347,.0165],'glass',[24,0,0])],connects:['scope-tube']});
part('scope-tube','Body tube','镜筒','microscope-bench',['Keeps the optical elements aligned.','使光学镜组保持对齐。'],['The body tube and head hold the upper optical system in alignment with the objective assembly [S7].\n\nThe enlarged model shows the external tube, rather than a ray tracing of every internal lens. The lower vertical optical axis passes through the active objective, coverslip, slide opening, condenser and light source [S20].','镜筒和镜头座使上方光学系统与物镜机构保持对齐 [S7]。\n\n模型展示镜筒外形，没有把内部每一片透镜都画成光线追迹。下方竖直光轴经过在位物镜、盖玻片、载物台光孔、聚光镜与光源 [S20]。'],cyl(.022,.062,[.18,.278,0],'enamel'),{extra:[box([.061,.018,.043],[.202,.3,-.01],'enamel',.003)],connects:['scope-arm','scope-eyepiece','scope-turret']});
const pivot=[.2,.23,-.011547005];
part('scope-turret','Nosepiece','物镜转换器','microscope-bench',['Turns to put one objective on the optical axis.','转动，使一个物镜对准光轴。'],['The nosepiece holds the objectives and brings one of them into the optical path. Change lenses using the nosepiece rather than pushing on a lens barrel [S6, S7].\n\nThe model has three indexed positions. Each complete pose places exactly one objective above the slide opening; the other two remain to the side. Only the indexed endpoints are optical observations [S20].','物镜转换器承载物镜，并使其中一个进入光路。换镜时应转动物镜转换器，不要推压物镜镜筒 [S6, S7]。\n\n模型有三个定位姿态，每个姿态都只有一个物镜对准玻片光孔，其余两个位于旁侧。只有定位完成的状态用于观察 [S20]。'],cyl(.034,.01,pivot,'steel'),{connects:['scope-tube','scope-objective-four','scope-objective-ten','scope-objective-forty']});
const lensSpecs=[['four','Scanning lens','最低倍物镜',4,.024,[.18,.213,0]],['ten','Low lens','低倍物镜',10,.036,[.22,.207,0]],['forty','High lens','高倍物镜',40,.048,[.2,.201,-.034641015]]];
for(const [id,en,zh,power,height,at] of lensSpecs) {
 const bottom=at[1]-height/2;
 part(`scope-objective-${id}`,en,zh,'microscope-bench',['Forms a magnified image of the specimen.','形成标本的放大图像。'],[`The objective is the lens system close to the specimen and forms its magnified image. Start with the lowest-power objective to locate and centre a target [S3, S6].\n\nThis design objective is ${power}×. With the 10× eyepiece the simulated total is ${power*10}×. Its barrel is ${id==='four'?'the shortest':id==='forty'?'the longest':'intermediate in length'} of the three model objectives; all indexed poses leave a positive gap above the coverslip [S20].`,
 `物镜是靠近标本的镜组，形成标本的放大图像。先用最低倍物镜寻找目标并移到视野中央 [S3, S6]。\n\n本物镜的设计倍率为 ${power} 倍；配合 10 倍目镜，模拟总放大率为 ${power*10} 倍。在三个模型物镜中，它的镜筒${id==='four'?'最短':id==='forty'?'最长':'长度居中'}；每个定位姿态下，物镜与盖玻片之间都保留正间隙 [S20]。`],cyl(.008,height,at,'stainless'),{extra:[cyl(.009,.004,[at[0],at[1]+height/2-.003,at[2]],'steel'),cyl(.005,.001,[at[0],bottom+.0005,at[2]],'glass')],connects:['scope-turret']});
}
const stage=[box([.043,.008,.095],[.1435,.168,0],'powder',.001),box([.043,.008,.095],[.2165,.168,0],'powder',.001),box([.03,.008,.0325],[.18,.168,.03125],'powder',.001),box([.03,.008,.0325],[.18,.168,-.03125],'powder',.001)];
part('scope-stage','Stage','载物台','microscope-bench',['Supports the slide above the light opening.','在光孔上方托住载玻片。'],['The stage supports the slide. Its central opening allows light to pass from the condenser through the thin specimen and into the active objective [S7].\n\nFour solid model plates surround a clear 0.03 × 0.03 m aperture. The stage stays fixed in this activity; coarse stage travel is not offered as an interactive control [S20].','载物台托住玻片。中央光孔让聚光镜送来的光通过薄标本，进入在位物镜 [S7]。\n\n模型用四块板围成 0.03 × 0.03 米的光孔。本活动的载物台固定，不提供粗调载物台行程的控件 [S20]。'],stage[0],{extra:[...stage.slice(1),box([.04,.008,.02],[.247,.164,-.03],'powder',.001)],connects:['scope-arm','slide-glass','scope-condenser']});
part('slide-glass','Slide','载玻片','microscope-bench',['Carries the thin specimen over the light opening.','承载薄标本，使它位于光孔上方。'],['The glass slide supports a thin specimen for transmitted light observation. A thick or opaque specimen can obscure structures beneath it [S3, S6].\n\nThis teaching simulation uses prepared specimen patterns. The slide and coverslip move together by the same physical distance; cell model enlargement is not applied to their motion. Use prepared slides under the teacher’s guidance in class [S20, S6].','载玻片承载用于透射光观察的薄标本。标本过厚或不透光时，下方结构可能被遮住 [S3, S6]。\n\n本活动使用模拟预制玻片。载玻片与盖玻片按同一实际距离一起移动，不再乘上细胞模型的放大倍数。真实课堂请在教师指导下使用预制玻片 [S20, S6]。'],box([.075,.001,.025],[.18,.1725,0],'glass',.0002),{connects:['scope-stage','coverslip-glass']});
part('coverslip-glass','Coverslip','盖玻片','microscope-bench',['Covers the thin specimen on the slide.','覆盖载玻片上的薄标本。'],['A coverslip is a thin glass cover over a prepared specimen. It is distinct from the larger supporting slide underneath [S6].\n\nThe model places it above the slide opening and moves it with the slide. The objective barrels remain above it in every indexed pose; the simulation does not teach specimen collection, cutting or staining [S20].','盖玻片是覆盖薄标本的小玻璃片，与下方较大的载玻片是两个不同部件 [S6]。\n\n模型把它放在光孔上方，随载玻片一起移动。每个物镜定位姿态都与盖玻片保持间隙；本活动不教授采样、切片或染色操作 [S20]。'],box([.018,.0003,.018],[.18,.17315,0],'glass'),{connects:['slide-glass']});
part('scope-condenser','Condenser','聚光镜','microscope-bench',['Concentrates light on the specimen.','把照明光集中到标本处。'],['The condenser concentrates light onto the specimen from below the stage. It belongs to the illumination path, separate from the objective that forms the specimen image [S7].\n\nIts barrel and upper glass share the slide opening’s vertical axis. This external model simplifies the internal condenser lens group [S20].','聚光镜位于载物台下方，把照明光集中到标本处；它属于照明光路，与形成标本图像的物镜不同 [S7]。\n\n模型的镜筒和顶部玻璃对准载物台光孔的竖直轴线，内部镜组作了简化 [S20]。'],cyl(.02,.024,[.18,.135,0],'powder'),{extra:[cyl(.016,.002,[.18,.148,0],'glass')],connects:['scope-illuminator','scope-stage']});
part('scope-illuminator','Illuminator','光源','microscope-bench',['Sends light upward through the specimen.','从下方向上照亮标本。'],['The illuminator supplies light to the condenser and through the stage opening. Brightness affects visibility but does not change the lens magnification [S7].\n\nThe model light source is a pale glass disc in the base. Its brightness control changes the simulated field, rather than claiming a measured lamp output [S20].','光源把光送向聚光镜，再穿过载物台光孔照亮标本。亮度影响观察效果，却不会改变镜头的放大率 [S7]。\n\n底座中的浅色玻璃圆盘表示光源。亮度控件改变模拟视野，没有把结果声称为实测灯光输出 [S20]。'],cyl(.024,.012,[.18,.04,0],'enamel'),{extra:[cyl(.019,.002,[.18,.047,0],'glass')],connects:['scope-condenser','scope-base']});
part('scope-coarse-focus','Coarse knob','粗调节器','microscope-bench',['Makes large focus changes on a real instrument.','在真实仪器上作较大幅度的调焦。'],['A coarse focus control makes larger changes in the separation between the objective and specimen than fine focus. At high power, large movements can bring a lens into contact with the slide [S6].\n\nThis large knob is included for identification. It has no active control in the teaching simulation; only safe, limited fine focus is available [S20].','粗调节器使物镜与标本之间的距离作较大幅度的变化。高倍观察时，大幅移动可能使镜头碰到玻片 [S6]。\n\n模型保留大旋钮供辨认，不提供粗调驱动；试一试只开放范围有限的微调 [S20]。'],cyl(.024,.012,[.26,.16,0],'powder',[0,0,90]),{extra:[cyl(.020,.001,[.267,.16,0],'steel',[0,0,90])],connects:['scope-arm','scope-fine-focus']});
part('scope-fine-focus','Fine knob','微调节器','microscope-bench',['Makes small changes to bring details into focus.','细调焦平面，使细节更清楚。'],['Fine focus makes small adjustments to the focal plane. It refines the image after the specimen has been located, especially at higher power [S6, S7].\n\nThe small knob is coaxial with the coarse knob. Its visible rotation is exaggerated for readability; the fixed stage does not make a large, unsafe movement towards an objective [S20].','微调节器细调焦平面，在找到标本后进一步改善图像，尤其用于高倍观察 [S6, S7]。\n\n小旋钮与粗调节器同轴。模型把可见转角作了说明性放大；固定的载物台不会向物镜作大幅危险移动 [S20]。'],cyl(.012,.014,[.274,.16,0],'steel',[0,0,90]),{connects:['scope-coarse-focus']});
// Context remains selectable, numbered and indexed: its group alone has card:false.
const onion=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)onion.push(ring(.039,.022,.0375,.0205,.003,[-.1+x*.039,.12+y*.022,0],'tissue'));
part('onion-patch','Onion epidermis','洋葱表皮','tissue-context',['Shows adjacent cells in one layer of plant tissue.','展示植物组织中彼此相邻的一层细胞。'],['Onion bulb epidermis consists of joined plant cells. These non-photosynthetic bulb cells normally lack chloroplasts, providing a counterexample to the idea that every plant cell has chloroplasts [S23, S24].\n\nThe patch shows a designed three by three arrangement of boundaries, not a recorded microscope image. Fine membranes and nuclei are not drawn in this overview [S20].','洋葱鳞茎表皮由相邻的植物细胞组成。这些不进行光合作用的鳞茎细胞通常没有叶绿体，可用来检验“所有植物细胞都有叶绿体”的说法 [S23, S24]。\n\n此处用三行三列边界表示组织，不是真实显微照片；概览没有画出细胞膜和核等细节 [S20]。'],onion[4],{extra:onion.filter((_,i)=>i!==4)});
const leafOutline=[[0,.055],[-.018,.034],[-.028,.008],[-.019,-.024],[0,-.05],[.019,-.024],[.028,.008],[.018,.034]];
part('leaf-context','Leaf','叶','tissue-context',['Connects the enlarged cell to a plant organ.','把放大的细胞连回植物器官。'],['A leaf is a plant organ built from tissues containing many cells. Photosynthetic leaf cells are one setting in which chloroplasts can be found [S1, S4].\n\nThe simplified outline links the enlarged cell model with the whole-plant topic. It is drawn at a separate explanatory scale and does not reproduce every leaf tissue [S20].','叶是植物器官，由包含许多细胞的组织构成；进行光合作用的叶细胞是可以找到叶绿体的一种情形 [S1, S4]。\n\n简化叶形把细胞模型连回整株植物主题。它采用独立的说明比例，没有重现叶的每一层组织 [S20]。'],extrude(leafOutline,.0015,[-.2,.2,-.03],'tissue'),{extra:[{kind:'tube',path:[[0,-.05,0],[0,.045,0]],radius:.00065,at:[-.2,.2,-.0285],color:'tissue'}]});
const tissues=[]; for(let i=0;i<6;i++)tissues.push(ellipsoid([.025,.031,.012],[(i%3-1)*.024,.12+(i<3?-.015:.015),0],'tissue'));
part('tissue-patch','Tissue patch','组织示意','tissue-context',['Shows neighbouring cells working as a tissue.','展示相邻细胞组成的组织。'],['A tissue is an organised group of cells working together. Tissues make up organs; an organ is not one giant cell [S3].\n\nThis small patch uses simplified adjacent cells to show that level of organisation. It is not a microscopic identification image or a sample of a particular disease [S20].','组织是协同工作的细胞所组成的结构；组织构成器官，器官不是一个巨大的细胞 [S3]。\n\n这里用相邻的简化细胞表示这个层级，不是供显微鉴定的图像，也不是某种疾病的样本 [S20]。'],tissues[1],{extra:tissues.filter((_,i)=>i!==1)});
part('intestine-context','Small intestine','小肠','tissue-context',['Connects cells and tissues to a digestive organ.','把细胞与组织连回消化器官。'],['The small intestine is an organ in the digestive system, made from tissues and cells. Digestion and absorption are explained in the digestive-system topic [S1, S3].\n\nA short hollow curved tube is only an organ-level symbol. Its shape and size are schematic; it is not a medical anatomy model or one enormously enlarged cell [S20].','小肠是消化系统中的器官，由组织和细胞构成。消化系统主题继续解释消化与吸收 [S1, S3]。\n\n一段弯曲的中空管只是器官层级的示意符号；形状与大小都作了简化，既不是医学解剖模型，也不是一个放得极大的细胞 [S20]。'],{kind:'sweep',path:[[-.04,.025,0],[-.015,.028,0],[.025,.015,0],[.03,-.01,0],[-.025,-.025,0],[-.035,-.045,0],[.015,-.055,0]],radius:.007,hollow:.0015,caps:'none',at:[.16,.14,-.03],color:'tissue',segments:52,radial:12});
const bodyShape=[[-.012,.105],[-.026,.091],[-.026,.065],[-.016,.05],[-.043,.038],[-.065,-.012],[-.055,-.018],[-.029,.016],[-.028,-.025],[-.023,-.047],[-.026,-.12],[-.012,-.12],[0,-.052],[.012,-.12],[.026,-.12],[.023,-.047],[.028,-.025],[.029,.016],[.055,-.018],[.065,-.012],[.043,.038],[.016,.05],[.026,.065],[.026,.091],[.012,.105]];
part('body-context','Body outline','身体轮廓','tissue-context',['Places organs within the context of body systems.','把器官连回身体系统。'],['Organs work together in systems. The digestive, respiratory and circulatory systems help obtain and transport substances needed by the body’s cells [S1].\n\nThis plain silhouette is a context symbol at a separate scale. Open the heart-and-lungs and digestive-system topics for their organ structures and processes; the outline itself does not depict those processes [S20].','器官在系统中共同作用。消化、呼吸和循环系统帮助身体获取并运送细胞所需的物质 [S1]。\n\n这个轮廓只是采用独立比例的背景示意。心肺主题和消化系统主题另有器官结构与过程；身体轮廓本身不表示这些过程 [S20]。'],extrude(bodyShape,.003,[.2,.14,-.05],'membrane'));
const cameras=[
 ['pair-hero','Cell pair','细胞对照',[0,.3,.85],[0,.12,0]],
 ['animal-close','Animal front','动物细胞正面',[.1,.17,.36],[.1,.1,0]],
 ['animal-oblique','Animal depth','动物细胞厚度',[.32,.22,.27],[.1,.1,0]],
 ['plant-close','Plant cell','植物细胞',[-.1,.22,.4],[-.1,.12,0]],
 ['scope-whole','Microscope','显微镜',[.62,.4,.65],[.2,.18,0]],
 ['scope-stage-close','Stage detail','载物台近景',[.42,.26,.32],[.18,.17,0]],
];
const camera = row => ({position:row[3],target:row[4],fov:30});
const poses={};
for(const [name,angle] of [['scope-scan',0],['scope-low',-120],['scope-high',120]]){
 poses[name]={duration:.8};
 for(const id of ['scope-turret','scope-objective-four','scope-objective-ten','scope-objective-forty'])poses[name][id]={pivot,rotation:[0,angle,0]};
}
export function buildCellsParts(){
 const sim=makeMicroscopeSim('S20');
 sim.bind=[
  {control:'objective',part:['scope-turret','scope-objective-four','scope-objective-ten','scope-objective-forty'],pose:{4:'scope-scan',10:'scope-low',40:'scope-high'}},
  {control:'slide-x',part:['slide-glass','coverslip-glass'],offset:{axis:[1,0,0],per:1e-6,origin:0}},
  {control:'slide-y',part:['slide-glass','coverslip-glass'],offset:{axis:[0,0,-1],per:1e-6,origin:0}},
  {control:'focus-z',part:'scope-fine-focus',rotate:{axis:[1,0,0],per:9,origin:0}},
 ];
 return {sim,units:{modelUnit:'m',scale:1},parts,groups:[
  {id:'animal-cell',name:bi('Animal cell','动物细胞'),color:'token:neutral',scale:{unit:'um',magnification:2000}},
  {id:'plant-cell',name:bi('Plant cell','植物细胞'),color:'token:seedling',scale:{unit:'um',magnification:2000}},
  {id:'microscope-bench',name:bi('Microscope','显微镜'),color:'token:ink-2'},
  {id:'tissue-context',name:bi('Tissue','组织背景'),color:'token:neutral',card:false},
 ],flows:[],animations:[],presets:cameras.map(row=>({id:row[0],label:bi(row[1],row[2]),camera:camera(row)})),poses,
 views:{assembled:{camera:camera(cameras[0])},exploded:{camera:camera(cameras[0])},cover:camera(cameras[0]),reference:{fit:'layers'},shadows:'contact',section:{plane:'xy'},cutaway:{normal:[0,0,-1],offset:.003},explodeLabel:bi('Separate model','分离示意'),hudFrame:{parts:['animal-membrane','plant-cell-wall','scope-base','scope-arm','leaf-context','tissue-patch','intestine-context','body-context']}},
 telemetry:[{key:bi('Total power','总倍率'),unit:'×',decimals:0,follow:'total-power'},{key:bi('Field diameter','视野直径'),unit:'µm',decimals:0,follow:'field-diameter-um'}],
 spec:[{key:bi('Model','模型'),value:bi('Separate enlarged cells','细胞独立放大'),tag:'design'},{key:bi('Eyepiece','目镜'),value:'10× DESIGN',tag:'design'},{key:bi('Objectives','物镜'),value:'4 / 10 / 40× DESIGN',tag:'design'},{key:bi('Field number','视场数'),value:'18 mm DESIGN',tag:'design'}]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const file=buildCellsParts();
 writeFileSync(output,JSON.stringify(file,null,2)+'\n');
 process.stdout.write(`Generated ${parts.length} selectable cells parts.\n`);
}
