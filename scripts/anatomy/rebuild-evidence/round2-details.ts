/** Characteristic anatomy isolated at the same visibility as a focused beat. */
import {loadTopic,render,compare,bounds,type V}from './studio';import fs from 'node:fs';
const dir='scripts/anatomy/rebuild-evidence/comparisons/round2-final-anatomy';
const refs:Record<string,string>={arms:'Gray414.png',back:'Gray409.png',chest:'Gray410.png',core:'Gray392.png',legs:'Gray434.png',shoulders:'Gray414.png'};
for(const topic of['arms','back','chest','core','legs','shoulders']){
 const all=await loadTopic(topic),shapes=all.filter(s=>topic==='core'?s.id.startsWith('rectus'):topic==='chest'?s.id.startsWith('pectoralis'):topic==='arms'?s.id.startsWith('biceps'):topic==='back'?s.id.startsWith('trapezius'):topic==='legs'?s.id.startsWith('gastrocnemius'):s.id.startsWith('deltoid'));
 const b=bounds(shapes),target=b.getCenter(b.min.clone()).toArray()as V,size=Math.max(.22,b.getSize(b.min.clone()).y*1.18),angle=['legs','back'].includes(topic)?180:15;
 const file=`${dir}/${topic}-isolated-detail.png`;await render(shapes,file,{angle,target,size,width:900,height:1000});await compare(file,`scripts/anatomy/rebuild-evidence/refs/${refs[topic]}`,`${dir}/${topic}-isolated-detail-sheet.png`,`${topic} isolated characteristic mesh; reference angle/dissection varies`);console.log(topic);
 if(topic==='chest'){const inter=all.filter(s=>s.id.startsWith('intercostal'));const b=bounds(inter);await render(inter,`${dir}/chest-intercostal-detail.png`,{angle:35,target:b.getCenter(b.min.clone()).toArray()as V,size:b.getSize(b.min.clone()).y*1.25,width:900,height:1000});}
}
