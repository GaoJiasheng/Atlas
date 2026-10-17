/** Read-only inverse-fit search windows; predictions are never observations. */
import {resolve} from 'node:path';
import {readJson,writeJson} from '../lib/common';
import {candidates,evaluate} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
const dir=resolve(import.meta.dirname);
const targets: {name:string;lnglat:[number,number]}[]=[
 {name:'Jurong Road / Bukit Timah Road (now Jalan Jurong Kechil)',lnglat:[103.776068175,1.3402483]},
 {name:'Choa Chu Kang Road / Upper Bukit Timah Road',lnglat:[103.7610695,1.379693]},
 {name:'Nee Soon Road / Springleaf Road',lnglat:[103.8228731,1.3975756]},
 {name:'Braddell Road / Thomson Road',lnglat:[103.8379867,1.3431198]},
 {name:'Yio Chu Kang Road / Upper Serangoon Road',lnglat:[103.8779647,1.3539814]},
 {name:'Clementi Road / Pasir Panjang Road',lnglat:[103.7680848,1.2923909]},
 {name:'Holland Road / Farrer Road',lnglat:[103.8069794,1.3098676]},
 {name:'Bukit Timah Road / Adam-Farrer Road',lnglat:[103.81328475,1.3230049]},
 {name:'Thomson Road / Balestier Road',lnglat:[103.8419455,1.3263877]},
 {name:'Changi Road / Joo Chiat Road',lnglat:[103.8975743,1.3161647]},
];
for(const id of ['G9','G11','G16']){
 const input=readJson<{controlPoints:ControlPoint[]}>(`${dir}/georef-${id}.json`);
 const fit=candidates('auto',input.controlPoints).map(c=>evaluate(c.proj,c.kind,input.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 const guides=targets.map(p=>{let x=id==='G9'?5500:id==='G11'?4700:11000,y=id==='G9'?4700:id==='G11'?4600:7000;
  for(let i=0;i<10;i++){const a=fit.model.toLngLat(x,y),b=fit.model.toLngLat(x+1,y),c=fit.model.toLngLat(x,y+1);const u=b[0]-a[0],v=c[0]-a[0],w=b[1]-a[1],z=c[1]-a[1],dx=p.lnglat[0]-a[0],dy=p.lnglat[1]-a[1],d=u*z-v*w;x+=(dx*z-v*dy)/d;y+=(u*dy-dx*w)/d;}
  return {...p,prediction:[Math.round(x),Math.round(y)]};});
 writeJson(`${dir}/work/third-${id}-guides.json`,guides,true);
}
