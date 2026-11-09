/** Revised source registration and reviewed 1958 preconstruction Jurong shore.
 * Source pixels remain in the retained JSON. No modern coastline is used to
 * adjust the historical shore. The source frame selects the splice only.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FeatureCollection, Geometry } from 'geojson';
import { candidates, evaluate } from '../lib/fit';
import { mapshaper, pointInPolygon, toFc } from '../lib/common';
import { buildG16Model } from './resume-register-G16-model';
import { buildModel } from './resume-register-anu1958-model';
import { spliceBanks } from './round2-splice';
import{restorePeninsula}from'./round2-g15-peninsula';

const dir = resolve(import.meta.dirname);
const read = (name: string): any => JSON.parse(readFileSync(`${dir}/${name}`, 'utf8'));
const write = (name: string, data: unknown) => writeFileSync(`${dir}/${name}`, JSON.stringify(data));
const ringsOf=(fc:any):number[][][]=>fc.features.flatMap((f:any)=>f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.type==='MultiPolygon'?f.geometry.coordinates.flat():[]);
const cp = read('georef-G16.json').controlPoints;
const old = candidates('auto', cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.model;
const revised = buildG16Model();
function reproject(p: number[]): number[] {
  let x=11000,y=7000;
  for (let i=0;i<8;i++) {
    const a=old.toLngLat(x,y),b=old.toLngLat(x+1,y),c=old.toLngLat(x,y+1);
    const u=b[0]-a[0],v=c[0]-a[0],w=b[1]-a[1],z=c[1]-a[1],dx=p[0]!-a[0],dy=p[1]!-a[1],det=u*z-v*w;
    x+=(dx*z-v*dy)/det; y+=(u*dy-dx*w)/det;
  }
  const check=old.toLngLat(x,y);
  if (Math.hypot(check[0]-p[0]!,check[1]-p[1]!)>1e-8) throw Error('G16 inverse registration did not converge');
  return revised.toLngLat(x,y);
}
function coordinates(value: any): any {
  return typeof value[0] === 'number' ? reproject(value) : value.map(coordinates);
}
let base = read('work/coast-g16-main.geojson') as FeatureCollection;
for (const f of base.features) {
  const g=f.geometry as Geometry & {coordinates: any};
  g.coordinates=coordinates(g.coordinates);
}
write('work/resume-G16-registered.geojson',base);
// Keep the separately dated far-west G15 source outside the new G35 coverage.
const g15Water=read('work/G15-west-water.geojson');
// Join complete source-bank arcs at two genuine intersections. Unlike a
// water-mask cap this retains the entire northern G16 peninsula. Every new
// shoreline segment is inherited from G15 or G16; no offshore cap is needed.
const spliced=spliceBanks(base,g15Water)!;
write('work/round2-spliced-base.geojson',spliced.base);
base=await restorePeninsula(spliced.base);
const g15NorthJoin=spliced.report.north.p;
const removedCoverageFrames=0;
const g15NorthSeaSplice:number[][]=[]; // no coverage closure enters this splice
const accepted = read('resume-jurong-reviewed.json');
if (accepted.status !== 'source-trace-reviewed') throw Error('Jurong source trace has not been visually reviewed');
const source = buildModel();
const project = ([x,y]: number[]) => source.toLngLat(x!+400,y!+3400);
const shore: number[][] = accepted.coordinates;
// Keep coverage closures well OUTSIDE the internal selector. On a curved
// scan warp, projecting two endpoints gives a different chord from the
// selector's sampled edge; the old coincident y30 closures left a false
// hairline across dry land. Only the measured shore is exposed after clipping.
const ring = [...shore,[2800,1400],[2900,1400],[2900,-100],[250,-100],shore[0]!].map(project);
let patchLand = toFc([{type:'Feature',properties:{source:'G35',certainty:'approximate'},geometry:{type:'Polygon',coordinates:[ring]}}]);
const waterPixels:number[][][][]=[];
let waterStep=0;
for(const mask of [read('resume-jurong-east-verified-full-water.json'),read('resume-jurong-east-verified-pandan-water.json'),read('resume-pandan-water.json')]) {
  const pixels=mask.coordinates??mask.polygons;
  waterPixels.push(...pixels);
  const water=toFc([{type:'Feature',properties:{},geometry:{type:'MultiPolygon',coordinates:pixels.map((p:number[][][])=>p.map(r=>r.map(project)))}}]);
  patchLand=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:patchLand,b:water});
  write(`work/resume-G35-water-step-${++waterStep}.geojson`,patchLand);
}
function inRing([x,y]:number[], r:number[][]):boolean {
  let inside=false;
  for(let i=0,j=r.length-1;i<r.length;j=i++) {
    const a=r[i]!,b=r[j]!;
    if((a[1]!>y!)!==(b[1]!>y!)&&x!<(b[0]!-a[0]!)*(y!-a[1]!)/(b[1]!-a[1]!)+a[0]!)inside=!inside;
  }
  return inside;
}
function onSourceBoundary(p:number[],r:number[][]):boolean {
  return r.slice(1).some((b,i)=>{
    const a=r[i]!,dx=b[0]!-a[0]!,dy=b[1]!-a[1]!,n=dx*dx+dy*dy;
    const t=n?Math.max(0,Math.min(1,((p[0]!-a[0]!)*dx+(p[1]!-a[1]!)*dy)/n)):0;
    return Math.hypot(p[0]!-a[0]!-t*dx,p[1]!-a[1]!-t*dy)<=.75;
  });
}
const isWater=(p:number[])=>waterPixels.some(poly=>(inRing(p,poly[0]!)||onSourceBoundary(p,poly[0]!))&&!poly.slice(1).some(r=>inRing(p,r)));
for(const [a,b] of accepted.waterOnlyJoins as [number[],number[]][]) {
  for(let i=5;i<96;i++) {
    const p=[a[0]!+(b[0]!-a[0]!)*i/100,a[1]!+(b[1]!-a[1]!)*i/100];
    if(!isWater(p))throw Error(`A selection closure would become invented coastline at native ${p}`);
  }
}
const islandSpec=read('resume-jurong-reviewed-islands.json');
if(islandSpec.status!=='source-islands-reviewed')throw Error('Island bank review is incomplete');
for(const island of islandSpec.islands) {
  const land=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:island.coordinates.map((r:number[][])=>r.map(project))}}]);
  patchLand=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2',{a:patchLand,b:land});
}
write('work/resume-G35-island-step.geojson',patchLand);
// Stitch at actual intersections of the two source coast traces. A rectangular
// source frame must not manufacture a vertical/horizontal connector at sea.
function inverseSource(p:number[]):number[]{
 let x=1400,y=900;
 for(let i=0;i<8;i++){
  const a=project([x,y]),b=project([x+1,y]),c=project([x,y+1]);
  const u=b[0]-a[0],v=c[0]-a[0],w=b[1]-a[1],z=c[1]-a[1],dx=p[0]!-a[0],dy=p[1]!-a[1],det=u*z-v*w;
  x+=(dx*z-v*dy)/det;y+=(u*dy-dx*w)/det;
 }
 return[x,y];
}
const intersections:{lnglat:number[];native:number[]}[]=[];
for(const a of ringsOf(base))for(let i=1;i<a.length;i++){
 const p=a[i-1]!,q=a[i]!;
 for(const b of ringsOf(patchLand))for(let j=1;j<b.length;j++){
  const r=b[j-1]!,s=b[j]!;
  if(Math.max(p[0]!,q[0]!)<Math.min(r[0]!,s[0]!)||Math.min(p[0]!,q[0]!)>Math.max(r[0]!,s[0]!)||Math.max(p[1]!,q[1]!)<Math.min(r[1]!,s[1]!)||Math.min(p[1]!,q[1]!)>Math.max(r[1]!,s[1]!))continue;
  const ux=q[0]!-p[0]!,uy=q[1]!-p[1]!,vx=s[0]!-r[0]!,vy=s[1]!-r[1]!,dx=r[0]!-p[0]!,dy=r[1]!-p[1]!,den=ux*vy-uy*vx;
  if(Math.abs(den)<1e-20)continue;
  const t=(dx*vy-dy*vx)/den,u=(dx*uy-dy*ux)/den;
  if(t<0||t>1||u<0||u>1)continue;
  const point=[p[0]!+t*ux,p[1]!+t*uy];intersections.push({lnglat:point,native:inverseSource(point)});
 }
}
const westJoin=intersections.filter(p=>p.native[0]!>0&&p.native[0]!<700&&p.native[1]!>35&&p.native[1]!<450).sort((a,b)=>a.native[1]!-b.native[1]!)[0];
const eastJoin=intersections.filter(p=>p.native[0]!>2700&&p.native[0]!<2795&&p.native[1]!>1100&&p.native[1]!<1295).sort((a,b)=>a.native[0]!-b.native[0]!)[0];
if(!westJoin||!eastJoin)throw Error(`No source-coast intersection for a truthful splice: west=${JSON.stringify(westJoin)} east=${JSON.stringify(eastJoin)}`);
const east=eastJoin.native[0]!,northWest=westJoin.native[1]!;
// A straight inland selection edge cut G15's paired western inlet at y327.
// Route the INTERNAL splice through land common to both dated source masks.
// This preserves the complete G15 inland banks and creates no new map bank.
const commonLand=await mapshaper('-i a.json b.json combine-files -clip target=a b',{a:base,b:patchLand});
const commonPolys=commonLand.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]);
const common=(p:number[])=>commonPolys.some(poly=>pointInPolygon(project(p),poly));
const landSegment=(a:number[],b:number[])=>{
 const n=Math.max(2,Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)));
 for(let i=1;i<n;i++)if(!common([a[0]!+(b[0]!-a[0]!)*i/n,a[1]!+(b[1]!-a[1]!)*i/n]))return false;
 return true;
};
const step=5,xMin=150,yMin=0,nx=135,ny=141;
const nativeCell=(id:number)=>[xMin+(id%nx)*step,yMin+Math.floor(id/nx)*step];
const dry=Uint8Array.from({length:nx*ny},(_,id)=>Number(common(nativeCell(id))));
const targetId=((40-yMin)/step)*nx+(800-xMin)/step;
if(!dry[targetId])throw Error('Inland splice destination is not common source land');
const startId=Array.from({length:dry.length},(_,id)=>id).filter(id=>dry[id]&&Math.hypot(nativeCell(id)[0]!-westJoin.native[0]!,nativeCell(id)[1]!-westJoin.native[1]!)<80)
 .sort((a,b)=>Math.hypot(nativeCell(a)[0]!-westJoin.native[0]!,nativeCell(a)[1]!-westJoin.native[1]!)-Math.hypot(nativeCell(b)[0]!-westJoin.native[0]!,nativeCell(b)[1]!-westJoin.native[1]!))
 .find(id=>landSegment(westJoin.native,nativeCell(id)));
if(startId===undefined)throw Error('No common-land entry at the qualified source coast intersection');
const previous=new Int32Array(dry.length).fill(-1),queue=[startId];previous[startId]=startId;
for(let i=0;i<queue.length&&previous[targetId]===-1;i++){
 const id=queue[i]!,x=id%nx,y=Math.floor(id/nx);
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  if(!dx&&!dy)continue;
  const xx=x+dx,yy=y+dy,next=yy*nx+xx;
  if(xx<0||xx>=nx||yy<0||yy>=ny||!dry[next]||previous[next]!==-1)continue;
  if(dx&&dy&&(!dry[y*nx+xx]||!dry[yy*nx+x]))continue;
  if(!landSegment(nativeCell(id),nativeCell(next)))continue;
  previous[next]=id;queue.push(next);
 }
}
if(previous[targetId]===-1)throw Error('No dry-land splice route; do not publish a source-frame water cap');
const route:number[][]=[];
for(let id=targetId;;id=previous[id]!){route.push(nativeCell(id));if(id===startId)break;}
route.reverse();route.unshift(westJoin.native);route.push([800,30]);
const commonLandSplice:number[][]=[];
for(const p of route){
 while(commonLandSplice.length>1){
  const a=commonLandSplice.at(-2)!,b=commonLandSplice.at(-1)!;
  if(Math.abs((b[0]!-a[0]!)*(p[1]!-b[1]!)-(b[1]!-a[1]!)*(p[0]!-b[0]!))>1e-9)break;
  commonLandSplice.pop();
 }
 commonLandSplice.push(p);
}
for(let i=1;i<commonLandSplice.length;i++)if(!landSegment(commonLandSplice[i-1]!,commonLandSplice[i]!))throw Error('Inland splice left common source land');
const frameCorners=[[0,northWest],...commonLandSplice,[east,30],[east,eastJoin.native[1]!],[east,1300],[0,1300],[0,northWest]];
const framePixels: number[][]=[];
for (let k=1;k<frameCorners.length;k++) {
  const a=frameCorners[k-1]!,b=frameCorners[k]!;
  const n=Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)/100);
  for(let i=0;i<n;i++) framePixels.push([a[0]!+(b[0]!-a[0]!)*i/n,a[1]!+(b[1]!-a[1]!)*i/n]);
}
framePixels.push(framePixels[0]!);
let selector=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[framePixels.map(project)]}}]);
const rest=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:base,b:selector});
const patch=await mapshaper('-i a.json b.json combine-files -clip target=a b',{a:patchLand,b:selector});
// Default -clean fills small polygon gaps, including genuine narrow tidal
// channels. Preserve the source's paired banks at this FIRST union too; the
// final delivery step cannot recover channels already lost from its input.
const merged=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2 -clean gap-fill-area=0',{a:rest,b:patch});
write('work/coast-g16-with-west.geojson',merged);
write('work/resume-G35-jurong-land.geojson',patch);
// The shared pipeline first subtracts modern WATERBODY polygons. Restore the
// historical source land locally afterwards, avoiding today's rectilinear canals.
const jurong=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[103.60,1.27],[103.79,1.27],[103.79,1.48],[103.60,1.48],[103.60,1.27]]]}}]);
const historicalLand=await mapshaper('-i a.json b.json combine-files -clip target=a b',{a:merged,b:jurong});
write('work/resume-L5-historical-land.geojson',historicalLand);
write('resume-coast-integration.json',{
  date:'2026-11-09',source:'G35:1958 GSGS4923 edition1-GSGS, ANU Copyright Expired',
  period:'Preconstruction shoreline used for 1961-01-01; first earth-moving September1961 per dated primary Budget Statement. Later1961–1965 reclamation is not individually mapped.',
  shoreVertices:shore.length,removedCoverageFrames,g15NorthJoin,g15ArcSplice:spliced.report,g15NorthSeaSplice,historicalRestoreBox:[103.60,1.27,103.79,1.48],sourceFrame:[400,3430,400+east,4700],sourceCoastJoins:{west:westJoin,east:eastJoin},commonLandSplice,
  registration:{G16:'Printed Mercator graticule +6-ground translation; external LOO54.74/72.87m, approximate',G35:'16 printed Johore grid intersections, poly2 +19-road translation; external LOO39.82/82.01m, approximate'},
  seam:'Source-frame boundaries meet actual intersections of the G35 and prior source coastlines; the western internal splice follows a verified common-dry-land path, preserving complete G15 inlet banks without a straight water cap. No rectangle connector is exposed as coast. Cross-source alignment retains the measured registration uncertainty. Brown coral remains sea. Source land restores modern canal cuts for every era.',
});
console.log(`G16 grid-constrained registration and ${shore.length}-vertex source-reviewed G35 Jurong shore selected; absolute accuracy remains approximate.`);
