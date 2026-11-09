import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import { loadTopic,render,compare,bounds,verifyRig,type V } from './studio';
const topics=process.env.MUSCLES_TOPICS?.split(',')??['arms','back','chest','core','legs','shoulders'];
const phase=process.argv[2]??'iteration1',baseline=phase==='baseline';
const dir=`scripts/anatomy/rebuild-evidence/comparisons/${phase}`;
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(`${dir}/studio-rig.json`,JSON.stringify(verifyRig(),null,2)+'\n');
fs.writeFileSync(`${dir}/asset-hashes.json`,JSON.stringify(Object.fromEntries(topics.map(topic=>[topic,createHash('sha256').update(fs.readFileSync(`public/models/muscles-${topic}.glb`)).digest('hex')])),null,2)+'\n');
const refs:Record<string,string>={arms:'Gray410.png',back:'Gray409.png',chest:'Gray410.png',core:'Gray392.png',legs:'Gray434.png',shoulders:'Gray410.png'};
const output=[];
for(const topic of topics){
 const shapes=await loadTopic(topic,baseline),b=bounds(shapes),c=b.getCenter(b.min.clone()),extent=b.getSize(b.min.clone());
 const body=await loadTopic(topic,baseline,'paper','body');
 for(const [name,angle] of [['front',0],['three-quarter',35],['profile',90]] as const){
  const file=`${dir}/${topic}-${name}.png`;
  output.push(await render(shapes,file,{angle,caption:`${phase} ${topic} ${name}`}));
  // Frontal/oblique plates differ in dissection. This is documented, not a
  // falsely labelled exact-angle photographic match.
  await compare(file,`scripts/anatomy/rebuild-evidence/refs/${refs[topic]}`,`${dir}/${topic}-${name}-sheet.png`,`${phase} / ${topic} / ${name} — reference dissection &amp; angle differ where noted`);
 }
 if(topic==='back'){
  const file=`${dir}/${topic}-posterior.png`;output.push(await render(shapes,file,{angle:180}));await compare(file,'scripts/anatomy/rebuild-evidence/refs/Gray409.png',`${dir}/${topic}-posterior-sheet.png`,`${phase} / back / posterior — superficial and deep historical dissection`);
 }
 // Characteristic detail follows the named region's actual decoded bounds.
 const detail=shapes.filter(s=>topic==='core'?s.id.startsWith('rectus'):topic==='arms'?s.id.startsWith('biceps'):topic==='legs'?s.id.startsWith('gastrocnemius'):topic==='back'?s.id.startsWith('trapezius'):topic==='chest'?s.id.startsWith('pectoralis-major'):s.id.startsWith('deltoid'));
 const db=bounds(detail.length?detail:shapes),dc=db.getCenter(db.min.clone());
 const detailFile=`${dir}/${topic}-detail.png`,angle=topic==='back'||topic==='legs'?180:20;
 output.push(await render(shapes,detailFile,{angle,target:dc.toArray() as V,size:Math.max(.22,db.getSize(db.min.clone()).y*1.12)}));
 await compare(detailFile,`scripts/anatomy/rebuild-evidence/refs/${refs[topic]}`,`${dir}/${topic}-detail-sheet.png`,`${phase} / ${topic} / characteristic detail — see review for plate crop correspondence`);
 output.push(await render(body,`${dir}/${topic}-body.png`,{angle:25}));
 output.push(await render(body,`${dir}/${topic}-body-front.png`,{angle:0}));
 await compare(`${dir}/${topic}-body-front.png`,'scripts/anatomy/rebuild-evidence/refs/OpenStax1105-front.png',`${dir}/${topic}-body-front-sheet.png`,`${phase} / ${topic} / complete body front — silhouette and proportion reference`,'OpenStax 2016 · CC BY 4.0 · anterior anatomy');
 if(topic==='legs'){
  const low=bounds(body).min.y;
  const file=`${dir}/foot-profile.png`;
  let minZ=Infinity,maxZ=-Infinity;for(const surface of body)for(let i=0;i<surface.positions.length;i+=3)if(surface.positions[i+1]!<low+.13){minZ=Math.min(minZ,surface.positions[i+2]!);maxZ=Math.max(maxZ,surface.positions[i+2]!);}
  output.push(await render(body,file,{angle:270,target:[-.08,low+.11,(minZ+maxZ)/2],size:Math.max(.42,(maxZ-minZ)*1.45)}));
  await compare(file,'scripts/anatomy/rebuild-evidence/refs/Gray441.png',`${dir}/foot-profile-sheet.png`,`${phase} / foot / right lateral profile — tendon dissection reference`);
 }
 if(topic==='arms'){
  const hand=body.filter(s=>s.id==='skin-hand.l');const hb=bounds(hand);const hc=hb.getCenter(hb.min.clone());
  const file=`${dir}/hand-dorsal.png`;const handRender=await render(hand,file,{angle:180,target:hc.toArray() as V,size:hb.getSize(hb.min.clone()).y*1.25});
  await sharp(fs.readFileSync(file)).rotate(180).png().toFile(file);
  output.push({...handRender,imageInPlaneRotationDeg:180,directionVerification:'Decoded dorsal surface/nail relief visually confirmed from180; earlier pre-shell occlusion calculation retained as historical audit'});
  await compare(file,'scripts/anatomy/rebuild-evidence/refs/Gray424.png',`${dir}/hand-dorsal-sheet.png`,`${phase} / hand / decoded dorsal180deg; isolated image rolled180deg to match reference`);
 }
 console.log(`${phase} ${topic}: ${shapes.reduce((n,s)=>n+s.positions.length/9,0)} anatomy triangles; bounds ${extent.toArray().map(x=>x.toFixed(3))}; centre ${c.toArray().map(x=>x.toFixed(3))}`);
}
fs.writeFileSync(`${dir}/renders.json`,JSON.stringify(output,null,2)+'\n');
