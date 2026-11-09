/** True compressed GLB, same studio/ACES, neutral standing and supine review. */
import fs from 'node:fs';import{Matrix3,Vector3}from'three';import{loadTopic,render,type V}from'./rebuild-evidence/round2-studio';import{fixture}from'./round2-motion/probe';import{bothSides}from'../../src/engines/space-scene/lib/rig';
const pass=process.argv[2]??'cap-look1',dir=`scripts/anatomy/rebuild-evidence/comparisons/neutral-cap/${pass}`;fs.mkdirSync(dir,{recursive:true});
const src=JSON.parse(fs.readFileSync('scripts/anatomy/core/rig.json','utf8')),c=src.sourceCentre??src.sourceChestCentre,target=new Vector3(-c[0],.86-c[2],c[1]);
const body=await loadTopic('core',false,'paper','body'),rows=[];
for(const angle of[0,35,90]){rows.push(await render(body,`${dir}/standing-${angle}.png`,{angle,width:720,height:900}));rows.push(await render(body,`${dir}/hips-${angle}.png`,{angle,target:target.toArray() as V,size:.58,width:900,height:900}));}
const f=await fixture('core');f.setRoot({rotation:[-93.3018,0,0]});const joints=bothSides({'hip.l':{extension:21.182,abduction:18.816},'knee.l':{flexion:81.659},'ankle.l':{dorsiflexion:8.64}},new Set(Object.keys(f.data.rig.joints))),supine=await loadTopic('core',false,'paper','body',joints),nm=new Matrix3().getNormalMatrix(f.root);
for(const s of supine)for(let i=0;i<s.positions.length;i+=3){new Vector3().fromArray(s.positions,i).applyMatrix4(f.root).toArray(s.positions,i);new Vector3().fromArray(s.normals,i).applyMatrix3(nm).normalize().toArray(s.normals,i);}
const supineTarget=target.clone().applyMatrix4(f.root);
for(const angle of[0,35,90])rows.push(await render(supine,`${dir}/supine-hips-${angle}.png`,{target:supineTarget.toArray() as V,size:.70,camera:{position:supineTarget.clone().add(new Vector3(Math.sin(angle*Math.PI/180)*2,1.4,Math.cos(angle*Math.PI/180)*2)).toArray() as V,target:supineTarget.toArray() as V,fov:20},width:900,height:800}));
fs.writeFileSync(`${dir}/manifest.json`,JSON.stringify({date:'2026-11-09',mode:'actual compressed core GLB body meshes; native rig; engine studio / ACES',rows},null,2)+'\n');console.log(dir);
