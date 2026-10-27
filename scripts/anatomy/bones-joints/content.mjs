/** Original geometry labels, teaching specimens and static ideal-lever packet.
 * This file and its generated parts.json are CC BY-SA 4.0.
 * No OpenStax artwork or prose is incorporated in this geometry packet. */
import fs from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../..');
const manifest=JSON.parse(await fs.readFile(resolve(here,'manifest.json'),'utf8'));
const nativeRig=JSON.parse(await fs.readFile(resolve(here,'anatomy-rig.json'),'utf8'));
const oldParts=JSON.parse(await fs.readFile(resolve(root,'src/content/topics/muscles-arms/data/parts.json'),'utf8'));
const text=(en,zh)=>({en,zh});
const glossary={
  skull:['Skull','颅骨组','Surrounds and protects the brain.','围护脑。'],mandible:['Mandible','下颌骨','Carries the lower teeth and moves at the jaw.','承托下牙，并在颌关节活动。'],
  'cervical-spine':['Cervical spine','颈椎组','Supports the head above the trunk.','在躯干上方支撑头部。'],
  'thoracic-spine':['Thoracic spine','胸椎组','Supports the ribs along the back.','在背部承托肋骨。'],
  'lumbar-spine':['Lumbar spine','腰椎组','Transfers trunk load towards the pelvis.','把躯干负重传向骨盆。'],
  sacrum:['Sacrum','骶骨','Links the spine with the pelvic ring.','连接脊柱与骨盆环。'],coccyx:['Coccyx','尾骨','Forms the small lower end of the spine.','构成脊柱下端的小骨段。'],
  sternum:['Sternum','胸骨','Supports the front of the ribcage.','支撑胸廓前方。'],ribs:['Ribs and costal cartilage','肋骨与肋软骨','Curve around the heart and lungs.','弯绕在心脏和肺的外侧。'],
  clavicle:['Clavicle','锁骨','Holds the shoulder away from the chest.','把肩部撑在胸廓外侧。'],scapula:['Scapula','肩胛骨','Provides the socket for the upper arm.','为上臂提供关节窝。'],
  humerus:['Humerus','肱骨','Acts as the upper arm’s bony lever.','构成上臂的骨性杠杆。'],radius:['Radius','桡骨','Turns with the hand around the ulna.','随手绕尺骨转动。'],ulna:['Ulna','尺骨','Forms the main hinge at the elbow.','构成肘部主要的铰链结构。'],
  hand:['Hand bones','手骨组','Support the palm and fingers as a linked group.','共同支撑手掌与手指。'],
  'hip-bone':['Hip bone','髋骨','Transfers weight and holds the hip socket.','传递负重，并构成髋关节窝。'],
  femur:['Femur','股骨','Carries load along the thigh.','沿大腿传递负重。'],patella:['Patella','髌骨','Redirects the front thigh tendon at the knee.','在膝前改变大腿前侧肌腱的走向。'],
  tibia:['Tibia','胫骨','Carries most lower-leg weight towards the ankle.','把小腿大部分负重传向踝部。'],fibula:['Fibula','腓骨','Supports the outer side of the ankle.','支撑踝关节外侧。'],foot:['Foot bones','足骨组','Share load through the heel, arches and toes.','经足跟、足弓和足趾分担负重。'],
  'carpal-scaphoid':['Scaphoid','舟骨','Meets neighbouring wrist bones.','与相邻腕骨相接。'], 'carpal-lunate':['Lunate','月骨','Shares the curved wrist contact region.','参与腕部弧形接触区。'], 'carpal-capitate':['Capitate','头状骨','Sits centrally among the wrist bones.','位于腕骨中央。'],
  'mcp-metacarpal':['Index metacarpal','第二掌骨','Forms the palm side of the index knuckle.','构成食指指根靠手掌的一侧。'], 'mcp-phalanx':['Index proximal phalanx','食指近节指骨','Moves on the index metacarpal head.','在第二掌骨头上活动。'],
  'thumb-trapezium':['Trapezium','大多角骨','Provides the base surface for the thumb.','为拇指基部提供关节面。'], 'thumb-metacarpal':['Thumb metacarpal','第一掌骨','Moves over the trapezium at the thumb base.','在拇指基部的大多角骨上活动。']
};
const parts=manifest.parts.map((p,i)=>{
  const base=i<34?p.id.replace(/-[lr]$/,''):p.id,words=glossary[base];if(!words)throw Error(`No original label ${p.id}`);
  const side=i<34&&/-[lr]$/.test(p.id)?(p.id.endsWith('-l')?'left':'right'):null;
  const name=text(side?`${words[0]} · ${side}`:words[0],side?`${words[1]}·${side==='left'?'左':'右'}`:words[1]);
  return{id:p.id,name,group:i<10?'axial':i<34?'appendicular':'joint-detail',mesh:p.id,material:{color:'tissue',tint:'token:bone'},summary:text(words[2],words[3]),detail:text(`${words[2]} This selectable region contains ${p.sources.length===1?'one named source structure':'several named source structures'}. The source shape is retained at adult reference scale; the model selection count is not a count of individual bones. ${i>=34?'This is a translated close-up from the left hand; the same scale and relative source positions are retained. ':''}[S30]`,`${words[3]} 此可选区域${p.sources.length===1?'对应一项命名源结构':'合并多项命名源结构'}。模型保留成人参考比例，点选部件的数量不等于单块骨的数量。${i>=34?'这是从左手平移出的近景，保留原尺度和相对位置。':''}[S30]`),connects:[]};
});
const byId=id=>parts.find(p=>p.id===id);
const connect=(a,...b)=>byId(a).connects.push(...b);
connect('skull','mandible','cervical-spine');connect('cervical-spine','thoracic-spine');connect('thoracic-spine','lumbar-spine','ribs-l','ribs-r');connect('lumbar-spine','sacrum');connect('sacrum','coccyx','hip-bone-l','hip-bone-r');
for(const s of ['l','r']){connect(`ribs-${s}`,'sternum');connect('sternum',`clavicle-${s}`);connect(`clavicle-${s}`,`scapula-${s}`);connect(`scapula-${s}`,`humerus-${s}`);connect(`humerus-${s}`,`radius-${s}`,`ulna-${s}`);connect(`radius-${s}`,`hand-${s}`);connect(`ulna-${s}`,`hand-${s}`);connect(`hip-bone-${s}`,`femur-${s}`);connect(`femur-${s}`,`patella-${s}`,`tibia-${s}`);connect(`tibia-${s}`,`foot-${s}`);connect(`fibula-${s}`,`tibia-${s}`,`foot-${s}`);}
connect('carpal-scaphoid','carpal-lunate','carpal-capitate');connect('carpal-lunate','carpal-capitate');connect('mcp-metacarpal','mcp-phalanx');connect('thumb-trapezium','thumb-metacarpal');
const primitive=(kind,size,at,tint='token:bone',extra={})=>({kind,size,at,color:'tissue',tint,...extra});
const add=(id,name,summary,group,shape,extra,detail)=>{const p={id,name:text(...name),summary:text(...summary),detail:detail??text('Original qualitative teaching geometry. Proportions and separation are enlarged for reading; this is not a scanned specimen or a measurement [S34].','原创定性教学示意。比例和间距为便于观察而放大，不是扫描标本或测量结果 [S34]。'),group,primitive:shape};if(extra?.length)p.extra=extra;parts.push(p);return p;};
// A deliberately generic joint, shown separately from the real hand close-ups.
add('joint-cartilage-a',['Upper cartilage face','上方软骨面'],['Covers one side of the joint contact.','覆盖关节接触的一侧。'],'joint-detail',primitive('sphere',[.066],[-2,.022,0],'token:cold',{scale:[1,.13,1]}),[primitive('capsule',[.052,.11],[-2,.129,0])]);
add('joint-cartilage-b',['Lower cartilage face','下方软骨面'],['Covers the opposing joint contact.','覆盖相对的关节接触面。'],'joint-detail',primitive('sphere',[.066],[-2,-.022,0],'token:cold',{scale:[1,.13,1]}),[primitive('capsule',[.052,.11],[-2,-.129,0])]);
add('joint-capsule',['Joint capsule','关节囊'],['Encloses the joint cavity.','包围关节腔。'],'joint-detail',primitive('capsule',[.078,.10],[-2,0,0],'token:neutral',{color:'membrane'}));
add('joint-ligament',['Ligament bands','韧带示意带'],['Connect bone to bone across the joint.','跨过关节连接骨与骨。'],'joint-detail',primitive('capsule',[.009,.17],[-2.063,0,.02],'token:cut'),[primitive('capsule',[.009,.17],[-1.937,0,.02],'token:cut')]);
const profile=[[.075,-.26],[.082,-.23],[.073,-.19],[.045,-.13],[.035,-.04],[.037,.12],[.068,.20],[.075,.25],[.047,.25],[.043,.20],[.022,.12],[.021,-.04],[.028,-.13],[.048,-.19],[.055,-.23],[.05,-.26]];
add('bone-cortex',['Compact bone wall','骨密质壁'],['Forms the dense outer wall of the specimen.','构成标本致密的外壁。'],'bone-section',{kind:'lathe',profile,segments:48,arc:235,at:[2,0,0],color:'tissue',tint:'token:bone'});
const struts=[];
for(const y of [-.215,.195])for(let n=0;n<8;n++){const a=n*Math.PI/4,b=a+Math.PI*.7;struts.push({kind:'tube',path:[[Math.cos(a)*.044,y-.018,Math.sin(a)*.044],[Math.cos(b)*.035,y+.018,Math.sin(b)*.035]],radius:.003,at:[2,0,0],color:'tissue',tint:'token:bone'});}
add('bone-lattice',['Spongy bone framework','骨松质网架'],['Supports the ends with a hard branching framework.','以坚硬分支网架支撑骨端。'],'bone-section',struts[0],struts.slice(1));
add('bone-marrow',['Bone marrow','骨髓'],['Occupies spaces inside the bone.','位于骨内的间隙。'],'bone-section',primitive('capsule',[.018,.29],[2,0,0],'token:cut'));
add('bone-vessel',['Bone blood vessel','骨内血管'],['Carries blood into the living bone.','把血液输送进活骨。'],'bone-section',{kind:'tube',path:[[-.11,-.03,.03],[-.04,-.03,.03],[0,-.02,.02],[0,.14,.02]],radius:.0045,at:[2,0,0],color:'tissue',tint:'token:blood-rich'});
add('growth-plate',['Growth plate','生长板示意'],['Marks a growing bone’s cartilage region.','标示生长中骨的软骨区域。'],'bone-section',primitive('cylinder',[.063,.063,.009],[2,.179,0],'token:cold'));
add('remodel-patch',['Remodelling patch','重塑示意区'],['Marks a surface being renewed.','标示正在更新的骨表面。'],'bone-section',primitive('sphere',[.022],[2.026,.02,.025],'token:cut',{scale:[.3,2.3,1]}));
// Each stage is a complete independent specimen; no topology morphing or timing.
const repairXs=[1.46,1.82,2.18,2.54],repairIds=['clot','soft','hard','remodelled'];
for(let i=0;i<4;i++){
  const x=repairXs[i],col=['token:muscle-3','token:cold','token:bone','token:bone'][i];
  const shapes=[primitive('capsule',[.032,.115],[x,-.102,0]),primitive('capsule',[.032,.115],[x,.102,0]),primitive('sphere',[i===3?.033:.05],[x,0,0],col,{scale:[1,i===3?1.2:1.45,1]})];
  add(`repair-stage-${repairIds[i]}`,[[ 'Early clot specimen','Soft bridge specimen','Hard bridge specimen','Remodelled specimen'][i],['血肿阶段标本','软骨痂阶段标本','硬骨痂阶段标本','重塑阶段标本'][i]],[['Shows the early gap and clot.','Shows a soft bridge around the break.','Shows a hard bony bridge.','Shows the reshaped bone outline.'][i],['显示早期断隙与血肿。','显示断处周围的软性桥接。','显示硬的骨性桥接。','显示重新塑形的骨外形。'][i]],'bone-section',shapes[0],shapes.slice(1));
}
for(const[id,en,zh,summary,summaryZh]of [['biceps-l','Biceps brachii · left','肱二头肌·左','Pulls the radius to help bend the elbow.','拉动桡骨，协助屈肘。'],['triceps-l','Triceps brachii · left','肱三头肌·左','Pulls the ulna to help straighten the elbow.','拉动尺骨，协助伸肘。']])parts.push({id,name:text(en,zh),summary:text(summary,summaryZh),detail:text('Real left-side source muscle heads are grouped here. The original source rig, weights and fibre fields are retained. Movement and tension displays are qualitative; attachment-face medical review remains pending [S30].','这里合并真实左侧源肌肉的各头，保留原有关节链、蒙皮权重和肌纤维字段。动作与张力显示为定性示意，附着骨面的专业解剖审查尚待完成 [S30]。'),group:'pull-and-lever',mesh:id,material:{color:'muscle',tint:id==='biceps-l'?'token:muscle-1':'token:muscle-2'},connects:id==='biceps-l'?['scapula-l','radius-l']:['scapula-l','humerus-l','ulna-l']});
const attachments=JSON.parse(await fs.readFile(resolve(here,'../arms/attachments.json'),'utf8'));
const flex=attachments.sites.find(s=>s.muscle==='biceps-brachii-long.l'&&s.kind==='insertion').centroid;
const ext=attachments.sites.find(s=>s.muscle==='triceps-brachii-long.l'&&s.kind==='insertion').centroid;
const tendonDetail=text('Enlarged schematic tendon segment guided by the inherited source attachment candidate. It is not an isolated scanned tendon. The named attachment face remains pending review; no surface-accuracy approval is claimed [S30, S34].','依照继承的源附着候选位置放大的肌腱段示意，并非单独扫描的肌腱。命名附着骨面的审查尚待完成，不声称已通过骨面精度审查 [S30, S34]。');
add('flexor-tendon',['Flexor tendon segment','屈肌腱段示意'],['Transmits a pull towards the radius.','向桡骨传递拉力。'],'pull-and-lever',{kind:'tube',path:[[flex[0]-.009,flex[1]+.065,flex[2]+.012],flex],radius:.004,at:[0,0,0],color:'tissue',tint:'token:bone'},null,tendonDetail);
add('extensor-tendon',['Extensor tendon segment','伸肌腱段示意'],['Transmits a pull towards the ulna.','向尺骨传递拉力。'],'pull-and-lever',{kind:'tube',path:[[ext[0]-.008,ext[1]+.063,ext[2]-.008],ext],radius:.004,at:[0,0,0],color:'tissue',tint:'token:bone'},null,tendonDetail);
add('lever-beam',['Ideal lever beam','理想杠杆梁'],['Carries the load around a fixed pivot.','绕固定支点承托负载。'],'pull-and-lever',primitive('bevelBox',[.014,.30,.024],[4,-.15,0],'token:ink-2',{bevel:.003,color:'powder'}),null,text('A massless beam in an ideal planar balance. Its displayed length is 0.30 m. The load can be placed at 0.15 or 0.30 m from the pivot. The equivalent perpendicular pull acts 0.04 m from that pivot; it is not a diagram of the actual biceps line of pull [S34].','理想平面平衡中的无质量梁，显示长度为0.30 m。负载可放在距支点0.15或0.30 m处。等效垂直拉力作用在距支点0.04 m处，不代表真实肱二头肌的拉力方向 [S34]。'));
add('lever-load',['External load','外加负载'],['Applies a vertical downward force.','施加竖直向下的力。'],'pull-and-lever',primitive('bevelBox',[.042,.042,.042],[4,0,0],'token:cut',{bevel:.004,color:'powder'}),null,text('An abstract point load. The force value is chosen in newtons, not inferred from this block’s size or material. Zero removes the external load force, not all real forces in a human arm [S34].','抽象点负载。力值用牛顿选择，不由方块的大小或材料推算。零表示无外加负载力，并不表示真实手臂上所有力都消失 [S34]。'));
parts.push({id:'skin-outline',name:text('Body outline','体表轮廓'),summary:text('Locates the skeleton within the adult reference body.','在成人参考身体中定位骨架。'),detail:text('Inherited source body surface, including the source hand pieces, retained as context [S30].','继承的源体表包含源手部表面，仅用于定位 [S30]。'),mesh:'skin-outline',material:{color:'membrane',tint:'token:ink-3'},context:true,shell:true});
if(parts.length!==62)throw Error(`Expected61+context, found ${parts.length}`);
const pivot=nativeRig.joints.find(j=>j.name==='elbow.l').position;
const tendonPose=degrees=>Object.fromEntries(['flexor-tendon','extensor-tendon'].map(id=>[id,{pivot,rotation:[-degrees,0,0]}]));
const detailContacts=JSON.parse(await fs.readFile(resolve(here,'joint-detail.json'),'utf8')).contacts;
const mcpPivot=detailContacts.find(c=>c.parts[0]==='mcp-metacarpal').position;
const thumbPivot=detailContacts.find(c=>c.parts[0]==='thumb-trapezium').position;
// Opposing-source-surface candidates; no claim of validated clinical axes.
const poses={
 'elbow-flexed':{'joint:elbow.l':{flexion:85},...tendonPose(85),duration:1},
 'elbow-extended':{'joint:elbow.l':{flexion:5},...tendonPose(5),duration:1},
 'forearm-pronated':{'joint:elbow.l':{flexion:75},'joint:forearm.l':{pronation:150},...tendonPose(75),duration:1},
 'plane-glide':{'carpal-scaphoid':{offset:[.0015,0,0]},'carpal-lunate':{offset:[-.0015,0,0]},duration:1},
 'mcp-two-axes':{'mcp-phalanx':{pivot:mcpPivot,rotation:[25,0,12]},duration:1},
 'thumb-cmc':{'thumb-metacarpal':{pivot:thumbPivot,rotation:[18,0,18]},duration:1},
 'hip-three-axes':{'joint:hip.l':{flexion:25,abduction:15,'internal-rotation':10},duration:1},
 'comfortable-walk':{'joint:hip.l':{flexion:15},'joint:hip.r':{extension:15},'joint:knee.r':{flexion:15},duration:1}
};
const controls=[{id:'mode',kind:'choice',label:text('Display mode','显示模式'),default:'explore',options:[{id:'explore',label:text('Explore anatomy','观察解剖')},{id:'lever',label:text('Ideal lever','理想杠杆')}]},...[
 ['elbow-angle','Angle from vertical down','由竖直向下转过的角度',[30,60,90,120],90,'°'],['load-force','External force','外加力',[0,10,20],20,'N'],['load-distance','Load distance','负载距离',[.15,.30],.30,'m']
].map(([id,en,zh,values,def,unit])=>({id,kind:'step',label:text(en,zh),values,default:def,unit}))];
const outputSpecs=[['angle','Angle','角度','°',0],['load','External force','外加力','N',0],['distance','Load distance','负载距离','m',2],['load-arm','Load moment arm','负载力臂','m',3],['load-torque','Load moment','负载力矩','N·m',2],['muscle-force','Equivalent pull','等效拉力','N',1],['residual','Balance residual','平衡残差','N·m',3],['tip-x','Load horizontal offset','负载水平位移','m',3],['tip-y','Load vertical offset','负载竖直位移','m',3]];
const outputs=outputSpecs.map(([id,en,zh,unit,decimals])=>({id,kind:'number',label:text(en,zh),unit,decimals,tag:'sim'}));
const rows=[];for(const angle of [30,60,90,120])for(const load of [0,10,20])for(const distance of [.15,.30]){
 const rad=angle*Math.PI/180,arm=distance*Math.abs(Math.sin(rad)),torque=load*arm,force=torque/.04;
 rows.push({when:{'elbow-angle':angle,'load-force':load,'load-distance':distance},set:{angle,load,distance,'load-arm':arm,'load-torque':torque,'muscle-force':force,residual:0,'tip-x':distance*Math.sin(rad),'tip-y':-distance*Math.cos(rad)},source:['S34']});
}
const leverWhen={control:'mode',is:{eq:'lever'}};
const bind=[{output:'angle',joint:'elbow.l',movement:'flexion',angle:{per:1,origin:0},when:leverWhen},{control:'mode',part:['lever-beam','lever-load'],visible:{eq:'lever'}},{output:'angle',part:'lever-beam',rotate:{axis:[0,0,1],pivot:[4,0,0],per:1,origin:0}},{output:'tip-x',part:'lever-load',offset:{axis:[1,0,0],per:1}},{output:'tip-y',part:'lever-load',offset:{axis:[0,1,0],per:1}}];
const arrows=[{part:'lever-load',force:'gravity',dir:[0,-1,0],value:{output:'load'},when:leverWhen}];
for(const angle of [30,60,90,120]){const rad=angle*Math.PI/180;arrows.push({part:'lever-beam',force:'push',dir:[Math.cos(rad),Math.sin(rad),0],value:{output:'muscle-force'},offset:[-.11*Math.sin(rad),.11*Math.cos(rad),.015],when:{control:'elbow-angle',is:{eq:angle}}});}
const presets=[
 ['hero','Whole skeleton','完整骨架',[3.2,1.2,4.3],[0,-.35,0],30],['front','Front','正面',[0,.3,4.8],[0,-.35,0],28],['chest','Chest','胸部',[.8,.4,1.6],[0,.05,0],28],['elbow','Elbow','肘部',[1.1,-.15,1.25],[.3,-.15,0],28],['hip','Hip','髋部',[1,-.6,1.8],[0,-.6,0],30],['bone-closeup','Bone section','骨截面',[3.1,.6,2],[2,0,0],30]
].map(([id,en,zh,position,target,fov])=>({id,label:text(en,zh),camera:{position,target,fov}}));
const data={model:'/models/bones-and-joints.glb',parts,groups:[['axial','Axial skeleton','中轴骨架','bone'],['appendicular','Limbs and girdles','四肢与带骨','bone'],['joint-detail','Joint close-ups','关节近景','cold'],['bone-section','Inside living bone','活骨内部','cut'],['pull-and-lever','Muscle pull and lever','肌肉拉力与杠杆','muscle-1'],['force-overlay','Equivalent forces','等效力','f-push']].map(([id,en,zh,t])=>({id,name:text(en,zh),color:`token:${t}`,...(['force-overlay','bone-section'].includes(id)?{card:false}:{})})),flows:[],animations:[],rig:{joints:oldParts.rig.joints,demo:{elbow:{flexion:85},forearm:{pronation:90},hip:{flexion:25,abduction:15,'internal-rotation':10}}},poses,units:{modelUnit:'m',scale:1},presets,views:{assembled:{camera:presets[0].camera},reference:{camera:presets[1].camera},cover:presets[0].camera,section:{plane:'xy'}},spec:[{key:text('Anatomy','解剖'),value:text('Adult male reference','成人男性参考'),tag:'design'},{key:text('Adult bones','成人骨数'),value:'206',tag:'typical'},{key:text('Synovial types','滑膜关节类型'),value:'6',tag:'typical'},{key:text('Lever model','杠杆模型'),value:text('Ideal static balance','理想静力平衡'),tag:'sim'}],sim:{kind:'table',controls,outputs,table:{experiments:{lever:{keys:['elbow-angle','load-force','load-distance'],rows}}},bind,overlays:[{kind:'force-vectors',group:'force-overlay',per:.001,max:.20,arrows}]}};
data.telemetry = [['load','External force','外加力','N',0],['load-arm','Load moment arm','负载力臂','m',2],['muscle-force','Equivalent pull','等效拉力','N',0],['angle','Angle','角度','°',0]].map(([follow,en,zh,unit,decimals]) => ({key:text(en,zh),follow,unit,decimals,scope:'observe'}));
await fs.mkdir(resolve(root,'src/content/topics/bones-and-joints/data'),{recursive:true});
await fs.writeFile(resolve(root,'src/content/topics/bones-and-joints/data/parts.json'),JSON.stringify(data,null,2)+'\n');
await fs.writeFile(resolve(here,'anatomy-sites.json'),JSON.stringify({license:'CC BY-SA 4.0',review:'pending; inherited source candidates, not approved named bone faces',sites:attachments.sites.filter(s=>['biceps-brachii-long.l','biceps-brachii-short.l','triceps-brachii-long.l','triceps-brachii-lateral.l','triceps-brachii-medial.l'].includes(s.muscle))},null,2)+'\n');
console.log(JSON.stringify({parts:parts.length,selectable:parts.filter(p=>!p.context).length,poses:Object.keys(poses),simRows:rows.length,simOutputs:outputs.length,detailCamera:{position:[-1.75,.12,.62],target:[-2,-.04,0],fov:28},leverCamera:{position:[4.7,.45,1.6],target:[4.12,-.03,0],fov:28}}));
