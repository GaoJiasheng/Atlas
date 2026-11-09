/** Offline decoded-GLB comparisons; no browser or desktop access. */
import fs from 'node:fs';import sharp from 'sharp';import {Vector3}from'three';
import {loadTopic,render,bounds,compare,verifyRig,tokens,type V}from'../round3/studio';
const look=process.argv[2]??'look1',out=`/private/tmp/atlas-muscles-round4-comparisons/${look}`;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/rig.json`,JSON.stringify(verifyRig(),null,2));
const heroes:Record<string,{prefix:string;angle:number;ref:string}>={core:{prefix:'rectus-abdominis',angle:0,ref:'Gray392'},back:{prefix:'trapezius-transverse',angle:180,ref:'Gray409'},chest:{prefix:'pectoralis-major-sternocostal',angle:0,ref:'Gray410'},arms:{prefix:'biceps-brachii-',angle:0,ref:'Gray410'},legs:{prefix:'rectus-femoris',angle:0,ref:'OpenStax1105-front'},shoulders:{prefix:'deltoid-',angle:0,ref:'Gray410'}};
const rows=[];
for(const [topic,h]of (process.argv.includes('--exercise-only')?[]:Object.entries(heroes))){
 const final=(await loadTopic(topic,false,'paper','anatomy',undefined,`public/models/muscles-${topic}.glb`)).filter(s=>s.id.startsWith(h.prefix)),main=(await loadTopic(topic,true)).filter(s=>s.id.startsWith(h.prefix)),box=bounds(main),target=box.getCenter(new Vector3()).toArray()as V,extent=box.getSize(new Vector3()),size=Math.max(extent.y,extent.x*800/640)*1.2;
 for(const [name,angle,zoom]of [['front',h.angle,1],['three-quarter',h.angle+35,1],['profile',h.angle+90,1],['detail',h.angle+20,.55]]as const){
  const detail=main.filter(s=>s.id.endsWith('.l')),db=bounds(detail),de=db.getSize(new Vector3());const opt={angle,target:name==='detail'?db.getCenter(new Vector3()).toArray()as V:target,size:name==='detail'?Math.max(de.y,de.x*800/640)*.78:size*zoom,width:640,height:800};await render(final,`${out}/${topic}-${name}-final.png`,opt);await render(main,`${out}/${topic}-${name}-main.png`,opt);
  const a=await sharp(`${out}/${topic}-${name}-final.png`).raw().toBuffer(),b=await sharp(`${out}/${topic}-${name}-main.png`).raw().toBuffer(),d=Buffer.alloc(a.length);let total=0,changed=0,max=0;for(let i=0;i<a.length;i++){const v=Math.abs(a[i]!-b[i]!);d[i]=Math.min(255,v*8);total+=v;if(v)changed++;max=Math.max(max,v);}await sharp(d,{raw:{width:640,height:800,channels:3}}).png().toFile(`${out}/${topic}-${name}-diff-x8.png`);
  await compare(`${out}/${topic}-${name}-final.png`,`${out}/${topic}-${name}-main.png`,`${out}/${topic}-${name}-sheet.png`,`${topic} / ${name}: restored | pre-rebuild main (994cdc76)`,'Main GLB / identical camera and studio');
  rows.push({topic,view:name,mae:total/a.length,max,changedChannels:changed});
 }
 await compare(`${out}/${topic}-front-final.png`,`scripts/anatomy/rebuild-evidence/refs/${h.ref}.png`,`${out}/${topic}-drawing-sheet.png`,`${topic}: native surface vs historical anatomical plate; dissection differs`);
 console.log(topic,rows.filter(r=>r.topic===topic));
}
// Posed elbow and mask check against the accepted round-3 asset.
for(const topic of ['core','arms','chest']){
 const pose={'elbow.l':{flexion:100},'forearm.l':{pronation:90},'elbow.r':{flexion:100},'forearm.r':{pronation:90}},data=JSON.parse(fs.readFileSync(`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));for(const name of Object.keys(pose))if(!data.rig.joints[name])delete pose[name as keyof typeof pose];
 for(const [tag,file]of [['before',`scripts/anatomy/cache/round4-before/muscles-${topic}.glb`],['final',`public/models/muscles-${topic}.glb`]]){const shapes=await loadTopic(topic,false,'paper','exercise',pose,file);for(const s of shapes){if(s.id.startsWith('exercise-')){if(!(topic==='core'?/rectus-abdominis/.test(s.id):topic==='arms'?/biceps-brachii-long/.test(s.id):/pectoralis-major-sternocostal/.test(s.id))){s.positions=new Float32Array();continue;}s.rgb.set(tokens('paper').signal!);s.polygonOffset=[-1,-4];}else s.depthPush=0;}await render(shapes,`${out}/${topic}-exercise-${tag}.png`,{angle:25,width:800,height:900});const rig=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8')),elbow=rig.joints.find((j:any)=>j.name==='elbow.l').position;await render(shapes.filter(s=>!s.id.startsWith('exercise-')),`${out}/${topic}-elbow-${tag}.png`,{angle:35,target:elbow,size:.32,width:640,height:800});}
 await compare(`${out}/${topic}-elbow-final.png`,`${out}/${topic}-elbow-before.png`,`${out}/${topic}-elbow-sheet.png`,`${topic}: elbow flexion 100 / pronation 90; corrected weights | round 3`,'Round 3 / same pose');
 await compare(`${out}/${topic}-exercise-final.png`,`${out}/${topic}-exercise-before.png`,`${out}/${topic}-exercise-sheet.png`,`${topic}: continuous masks and elbow weight correction | accepted round 3`,'Accepted round 3 / same pose');
}
if(rows.length)fs.writeFileSync(`${out}/diffs.json`,JSON.stringify(rows,null,2));console.log(out);
