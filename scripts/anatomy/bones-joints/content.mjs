/** Original geometry labels, teaching specimens and static ideal-lever packet.
 * This file and its generated parts.json are CC BY-SA 4.0.
 * No OpenStax artwork or prose is incorporated in this geometry packet. */
import fs from 'node:fs/promises';
import { studentDetail } from '../../geo/bones-and-joints/details.mjs';
import { applySpecimens } from '../../geo/bones-and-joints/specimens.mjs';
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
  return{id:p.id,name,group:i<10?'axial':i<34?'appendicular':'joint-detail',mesh:p.id,material:{color:'tissue',tint:'token:bone'},summary:text(words[2],words[3]),detail:studentDetail(p.id),connects:[]};
});
const byId=id=>parts.find(p=>p.id===id);
const connect=(a,...b)=>byId(a).connects.push(...b);
connect('skull','mandible','cervical-spine');connect('cervical-spine','thoracic-spine');connect('thoracic-spine','lumbar-spine','ribs-l','ribs-r');connect('lumbar-spine','sacrum');connect('sacrum','coccyx','hip-bone-l','hip-bone-r');
for(const s of ['l','r']){connect(`ribs-${s}`,'sternum');connect('sternum',`clavicle-${s}`);connect(`clavicle-${s}`,`scapula-${s}`);connect(`scapula-${s}`,`humerus-${s}`);connect(`humerus-${s}`,`radius-${s}`,`ulna-${s}`);connect(`radius-${s}`,`hand-${s}`);connect(`ulna-${s}`,`hand-${s}`);connect(`hip-bone-${s}`,`femur-${s}`);connect(`femur-${s}`,`patella-${s}`,`tibia-${s}`);connect(`tibia-${s}`,`foot-${s}`);connect(`fibula-${s}`,`tibia-${s}`,`foot-${s}`);}
connect('carpal-scaphoid','carpal-lunate','carpal-capitate');connect('carpal-lunate','carpal-capitate');connect('mcp-metacarpal','mcp-phalanx');connect('thumb-trapezium','thumb-metacarpal');
const primitive=(kind,size,at,tint='token:bone',extra={})=>({kind,size,at,color:'tissue',tint,...extra});
const add=(id,name,summary,group,shape)=>{const p={id,name:text(...name),summary:text(...summary),detail:studentDetail(id),group,primitive:shape};parts.push(p);return p;};
// Teaching part identities stay stable; the geo pipeline supplies their geometry.
const teaching=[
 ['joint-cartilage-a','Upper cartilage face','上方软骨面','Covers one side of the joint contact.','覆盖关节接触的一侧。','joint-detail'],
 ['joint-cartilage-b','Lower cartilage face','下方软骨面','Covers the opposing joint contact.','覆盖相对的关节接触面。','joint-detail'],
 ['joint-capsule','Joint capsule and fluid','关节囊与滑液','Encloses and lubricates the joint cavity.','围住关节腔，滑液润滑相对表面。','joint-detail'],
 ['joint-ligament','Ligament bands','韧带示意带','Connect bone to bone across the joint.','跨过关节连接骨与骨。','joint-detail'],
 ['bone-cortex','Compact wall and periosteum','骨密质壁与骨膜','Forms the dense outer wall of the specimen.','构成标本致密的外壁。','bone-section'],
 ['bone-lattice','Spongy bone framework','骨松质网架','Supports the ends with a hard branching framework.','以坚硬分支网架支撑骨端。','bone-section'],
 ['bone-marrow','Red and yellow marrow','红骨髓与黄骨髓','Occupies spaces inside the bone.','位于骨内的间隙。','bone-section'],
 ['bone-vessel','Bone blood vessel','骨内血管','Carries blood into the living bone.','把血液输送进活骨。','bone-section'],
 ...['clot','soft','hard','remodelled'].map((id,i)=>[`repair-stage-${id}`,['Early clot specimen','Soft bridge specimen','Hard bridge specimen','Remodelled specimen'][i],['血肿阶段标本','软骨痂阶段标本','硬骨痂阶段标本','重塑阶段标本'][i],['Shows the early gap and clot.','Shows a soft bridge around the break.','Shows a hard bony bridge.','Shows the reshaped bone outline.'][i],['显示早期断隙与血肿。','显示断处周围的软性桥接。','显示硬的骨性桥接。','显示重新塑形的骨外形。'][i],'bone-section'])
];
for(const[id,en,zh,enSummary,zhSummary,group]of teaching)
  parts.push({id,name:text(en,zh),summary:text(enSummary,zhSummary),detail:studentDetail(id),group});
add('growth-plate',['Growth plate','生长板示意'],['Marks a growing bone’s cartilage region.','标示生长中骨的软骨区域。'],'bone-section',primitive('cylinder',[.063,.063,.009],[2,.179,0],'token:cold'));
add('remodel-patch',['Remodelling patch','重塑示意区'],['Marks a surface being renewed.','标示正在更新的骨表面。'],'bone-section',primitive('sphere',[.022],[2.026,.02,.025],'token:cut',{scale:[.3,2.3,1]}));
for(const[id,en,zh,summary,summaryZh]of [['biceps-l','Biceps brachii · left','肱二头肌·左','Pulls the radius to help bend the elbow.','拉动桡骨，协助屈肘。'],['triceps-l','Triceps brachii · left','肱三头肌·左','Pulls the ulna to help straighten the elbow.','拉动尺骨，协助伸肘。']])parts.push({id,name:text(en,zh),summary:text(summary,summaryZh),detail:studentDetail(id),group:'pull-and-lever',mesh:id,material:{color:'muscle',tint:id==='biceps-l'?'token:muscle-1':'token:muscle-2'},connects:id==='biceps-l'?['scapula-l','radius-l']:['scapula-l','humerus-l','ulna-l']});
const attachments=JSON.parse(await fs.readFile(resolve(here,'../arms/attachments.json'),'utf8'));
const flex=attachments.sites.find(s=>s.muscle==='biceps-brachii-long.l'&&s.kind==='insertion').centroid;
const ext=attachments.sites.find(s=>s.muscle==='triceps-brachii-long.l'&&s.kind==='insertion').centroid;
add('flexor-tendon',['Flexor tendon segment','屈肌腱段示意'],['Transmits a pull towards the radius.','向桡骨传递拉力。'],'pull-and-lever',{kind:'tube',path:[[flex[0]-.009,flex[1]+.065,flex[2]+.012],flex],radius:.004,at:[0,0,0],color:'tissue',tint:'token:bone'});
add('extensor-tendon',['Extensor tendon segment','伸肌腱段示意'],['Transmits a pull towards the ulna.','向尺骨传递拉力。'],'pull-and-lever',{kind:'tube',path:[[ext[0]-.008,ext[1]+.063,ext[2]-.008],ext],radius:.004,at:[0,0,0],color:'tissue',tint:'token:bone'});
add('lever-beam',['Ideal lever beam','理想杠杆梁'],['Carries the load around a fixed pivot.','绕固定支点承托负载。'],'pull-and-lever',primitive('bevelBox',[.014,.30,.024],[4,-.15,0],'token:ink-2',{bevel:.003,color:'powder'}));
add('lever-load',['External load','外加负载'],['Applies a vertical downward force.','施加竖直向下的力。'],'pull-and-lever',primitive('bevelBox',[.042,.042,.042],[4,0,0],'token:cut',{bevel:.004,color:'powder'}));
parts.push({id:'skin-outline',name:text('Body outline','体表轮廓'),summary:text('Locates the skeleton within the adult reference body.','在成人参考身体中定位骨架。'),detail:studentDetail('skin-outline'),mesh:'skin-outline',material:{color:'membrane',tint:'token:ink-3'},context:true,shell:true});
applySpecimens(parts);
if(parts.filter(p=>!p.context).length!==61)throw Error('Expected 61 selectable parts');
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
const bind=[{output:'angle',joint:'elbow.l',movement:'flexion',angle:{per:1,origin:0},when:leverWhen},{control:'mode',part:['lever-beam','lever-load','lever-pivot'],visible:{eq:'lever'}},{output:'angle',part:'lever-beam',rotate:{axis:[0,0,1],pivot:[4,0,0],per:1,origin:0}},{output:'tip-x',part:'lever-load',offset:{axis:[1,0,0],per:1}},{output:'tip-y',part:'lever-load',offset:{axis:[0,1,0],per:1}}];
const arrows=[{part:'lever-load',force:'gravity',dir:[0,-1,0],value:{output:'load'},at:'bottom',when:leverWhen}];
for(const angle of [30,60,90,120]){const rad=angle*Math.PI/180;arrows.push({part:'lever-beam',force:'push',dir:[Math.cos(rad),Math.sin(rad),0],value:{output:'muscle-force'},offset:[-.11*Math.sin(rad),.11*Math.cos(rad),.015],when:{control:'elbow-angle',is:{eq:angle}}});}
const presets=[
 ['hero','Whole skeleton','完整骨架',[3.2,1.2,4.3],[0,-.35,0],30],['front','Front','正面',[0,.3,4.8],[0,-.35,0],28],['chest','Chest','胸部',[.8,.4,1.6],[0,.05,0],28],['elbow','Elbow','肘部',[1.1,-.15,1.25],[.3,-.15,0],28],['hip','Hip','髋部',[1,-.6,1.8],[0,-.6,0],30],['bone-closeup','Bone section','骨截面',[2.24,.10,1.25],[2,0,0],30]
].map(([id,en,zh,position,target,fov])=>({id,label:text(en,zh),camera:{position,target,fov}}));
const data={model:'/models/bones-and-joints.glb',parts,groups:[['axial','Axial skeleton','中轴骨架','bone'],['appendicular','Limbs and girdles','四肢与带骨','bone'],['joint-detail','Joint close-ups','关节近景','cold'],['bone-section','Inside living bone','活骨内部','cut'],['pull-and-lever','Muscle pull and lever','肌肉拉力与杠杆','muscle-1'],['force-overlay','Equivalent forces','等效力','f-push']].map(([id,en,zh,t])=>({id,name:text(en,zh),color:`token:${t}`,...(['force-overlay','bone-section'].includes(id)?{card:false}:{})})),flows:[],animations:[],rig:{joints:oldParts.rig.joints,demo:{elbow:{flexion:85},forearm:{pronation:90},hip:{flexion:25,abduction:15,'internal-rotation':10}}},poses,units:{modelUnit:'m',scale:1},presets,views:{assembled:{camera:presets[0].camera},reference:{camera:presets[1].camera},cover:presets[0].camera,section:{plane:'xy'}},spec:[{key:text('Anatomy','解剖'),value:text('Adult male reference','成人男性参考'),tag:'design'},{key:text('Adult bones','成人骨数'),value:'206',tag:'typical'},{key:text('Synovial types','滑膜关节类型'),value:'6',tag:'typical'},{key:text('Lever model','杠杆模型'),value:text('Ideal static balance','理想静力平衡'),tag:'sim'}],sim:{kind:'table',controls,outputs,table:{experiments:{lever:{keys:['elbow-angle','load-force','load-distance'],rows}}},bind,overlays:[{kind:'force-vectors',group:'force-overlay',per:.001,max:.20,width:.06,arrows}]}};
data.telemetry = [['load','External force','外加力','N',0],['load-arm','Load moment arm','负载力臂','m',2],['muscle-force','Equivalent pull','等效拉力','N',0],['angle','Angle','角度','°',0]].map(([follow,en,zh,unit,decimals]) => ({key:text(en,zh),follow,unit,decimals,scope:'observe'}));
await fs.mkdir(resolve(root,'src/content/topics/bones-and-joints/data'),{recursive:true});
await fs.writeFile(resolve(root,'src/content/topics/bones-and-joints/data/parts.json'),JSON.stringify(data,null,2)+'\n');
await fs.writeFile(resolve(here,'anatomy-sites.json'),JSON.stringify({license:'CC BY-SA 4.0',review:'pending; inherited source candidates, not approved named bone faces',sites:attachments.sites.filter(s=>['biceps-brachii-long.l','biceps-brachii-short.l','triceps-brachii-long.l','triceps-brachii-lateral.l','triceps-brachii-medial.l'].includes(s.muscle))},null,2)+'\n');
console.log(JSON.stringify({parts:parts.length,selectable:parts.filter(p=>!p.context).length,poses:Object.keys(poses),simRows:rows.length,simOutputs:outputs.length,detailCamera:{position:[-1.75,.12,.62],target:[-2,-.04,0],fov:28},leverCamera:{position:[4.7,.45,1.6],target:[4.12,-.03,0],fov:28}}));
