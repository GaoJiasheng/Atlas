/** Read-only prediction sheet for independent native-raster junction review. */
import {resolve} from 'node:path';
import sharp from 'sharp';
import {readJson,writeJson} from '../lib/common';
import {candidates,evaluate} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
interface Input {projection:string;controlPoints:ControlPoint[]}
const dir=resolve(import.meta.dirname);
const town=readJson<Input>(`${dir}/georef-G1.json`).controlPoints;
for(const id of ['G9','G11']){
 const cp=readJson<Input>(`${dir}/georef-${id}.json`);
 const fit=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 const points=town.map(p=>{let x=id==='G9'?5500:4700,y=id==='G9'?4700:4600;for(let i=0;i<8;i++){const a=fit.model.toLngLat(x,y),b=fit.model.toLngLat(x+1,y),c=fit.model.toLngLat(x,y+1);const u=b[0]-a[0],v=c[0]-a[0],w=b[1]-a[1],z=c[1]-a[1],dx=p.lnglat[0]-a[0],dy=p.lnglat[1]-a[1],d=u*z-v*w;x+=(dx*z-v*dy)/d;y+=(u*dy-dx*w)/d;}return {...p,prediction:[Math.round(x),Math.round(y)]};});
 writeJson(`${dir}/work/${id}-town-guide.json`,points,true);
 for(let i=0;i<points.length;i++){const p=points[i]!,x=p.prediction[0]!,y=p.prediction[1]!;await sharp(`${dir}/raw/${id}.jpg`,{limitInputPixels:false}).extract({left:x-100,top:y-100,width:200,height:200}).resize(800,800).png().toFile(`${dir}/work/${id}-town-cp-${i+1}.png`);}
}
