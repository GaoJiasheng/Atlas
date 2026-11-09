/** Replace only reviewed source-bank arcs in the shared native raster trace.
 * Runs before registration; no geographic hand drawing or runtime code.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import{execFileSync}from'node:child_process';
import{candidates,evaluate}from'../lib/fit';
import{ringIssues}from'../lib/rings';
import{pointInPolygon}from'../lib/common';
const d=import.meta.dirname,read=(f:string)=>JSON.parse(readFileSync(`${d}/${f}`,'utf8'));
type P=number[];
const dist=(a:P,b:P)=>Math.hypot(a[0]!-b[0]!,a[1]!-b[1]!);
const length=(r:P[])=>r.slice(1).reduce((n,p,i)=>n+dist(p,r[i]!),0);
const reports=[];
for(const id of process.argv.slice(2).length?process.argv.slice(2):['G9','G11','G16']){
 console.log(`Checking native banks: ${id}`);
 const measured=read(`residual-${id}-banks.json`);
 if(id==='G11'){
  const outer=read('residual-G11-outer.json');
  measured.arcs.push(...outer.arcs);
  measured.method+=` Outer bank: ${outer.method}`;
 }
 const spec=JSON.parse(execFileSync('python3',[`${d}/residual-interpolate.py`],{input:JSON.stringify(measured),maxBuffer:20*1024*1024}).toString());
 if(spec.source!==id)throw Error(`Wrong source ${id}`);
 const cp=read(`georef-${id}.json`).controlPoints;
 const model=candidates('auto',cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.model;
 const inverse=(p:P):P=>{let x=5000,y=4000;for(let i=0;i<10;i++){const a=model.toLngLat(x,y),b=model.toLngLat(x+1,y),c=model.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;}if(dist(model.toLngLat(x,y),p)>1e-8)throw Error('Inverse failed');return[x,y];};
 const file=`work/coast-${id.toLowerCase()}-main.geojson`,fc=read(file);
 const rings:P[][]=fc.features.flatMap((f:any)=>f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat());
 const native=rings.map(r=>r.map(inverse));
 const arcReports=[];
 for(const arc of spec.arcs){
  console.log(`  ${arc.name}`);
  const points:P[]=arc.coordinates;
  const locate=(p:P)=>native.map((r,ri)=>{
   let best={ri,seg:-1,t:0,p:[0,0],distance:Infinity};
   for(let i=1;i<r.length;i++){
    const a=r[i-1]!,b=r[i]!,dx=b[0]!-a[0]!,dy=b[1]!-a[1]!,n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p[0]!-a[0]!)*dx+(p[1]!-a[1]!)*dy)/n)):0;
    const q=[a[0]!+t*dx,a[1]!+t*dy],distance=dist(p,q);
    if(distance<best.distance)best={ri,seg:i-1,t,p:q,distance};
   }return best;
  });
  const starts=locate(points[0]!),ends=locate(points.at(-1)!);
  const pair=starts.map((a,i)=>({a,b:ends[i]!})).sort((u,v)=>u.a.distance+u.b.distance-v.a.distance-v.b.distance)[0]!;
  const {a,b}=pair;
  if(a.ri!==b.ri||a.seg<0||b.seg<0)throw Error(`${id} ${arc.name}: endpoints on different rings`);
  if(Math.max(a.distance,b.distance)>20)throw Error(`${id} ${arc.name}: endpoints too far from retained bank: ${a.distance}/${b.distance}`);
  const r=native[a.ri]!;
  // Traverse forwards on the source ring, retaining exact segment endpoints.
  const forward=(start:typeof a,end:typeof a):P[]=>{
   if(start.seg===end.seg&&start.t<=end.t)return[start.p,end.p];
   const out=[start.p];let i=(start.seg+1)%(r.length-1);
   for(let guard=0;guard<=r.length;guard++){
    out.push(r[i]!);
    if(i===end.seg){out.push(end.p);return out;}
    i=(i+1)%(r.length-1);
   }throw Error('Ring walk failed');
  };
  const ab=forward(a,b),ba=forward(b,a);
  const replacement=length(ab)<=length(ba)?points:[...points].reverse();
  const rest=length(ab)<=length(ba)?ba:ab;
  const joined=[...replacement,...rest];
  if(dist(joined[0]!,joined.at(-1)!)>1e-8)joined.push(joined[0]!);
  // Remove duplicate neighbouring samples only; preserve all measured curves.
  const clean=joined.filter((p,i)=>!i||dist(p,joined[i-1]!)>1e-7);
  const issues=ringIssues([[clean]]);
  if(issues.zeroArea||issues.selfCrossing){
   writeFileSync(`${d}/work/residual-native-failure.json`,JSON.stringify({id,name:arc.name,a,b,joined:clean,replacement,rest}));
   throw Error(`${id} ${arc.name}: source arc creates invalid ring ${JSON.stringify(issues)}`);
  }
  native[a.ri]=clean;
  arcReports.push({name:arc.name,inputVertices:arc.points.length,vertices:points.length,replacedVertices:(length(ab)<=length(ba)?ab:ba).length,endpointDistancePx:[a.distance,b.distance],sourceCurveLengthPx:length(points)});
 }
 for(let i=0;i<rings.length;i++)rings[i]!.splice(0,rings[i]!.length,...native[i]!.map(p=>model.toLngLat(p[0]!,p[1]!)));
 const discarded=[];
 // Identify exact whole old ink components by measured native bounds. Bounds
 // select an existing component only; they never clip or create map geometry.
 for(const drop of spec.discardComponents??[]){
  const matches:any[]=[];
  for(const [fi,f]of fc.features.entries()){
   const ps=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
   for(const [pi,poly]of ps.entries()){
    const ri=rings.indexOf(poly[0]),r=native[ri];if(!r)throw Error('Lost source ring identity');
    const xs=r.map(p=>p[0]!),ys=r.map(p=>p[1]!);
    const bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    if(r.length===drop.vertices&&bounds.every((v,i)=>Math.abs(v-drop.sourceNativeBounds[i])<.01))matches.push({fi,pi,poly,r,bounds});
   }
  }
  if(matches.length!==1)throw Error(`${id} ${drop.name}: expected one exact source component, found ${matches.length}`);
  const m=matches[0];
  if(m.poly.length!==1||!pointInPolygon(drop.nativeWaterWitness,[m.r]))throw Error(`${id} ${drop.name}: component/water witness mismatch`);
  if(m.bounds[2]-m.bounds[0]>100||m.bounds[3]-m.bounds[1]>100)throw Error('Refusing to discard a large source component');
  const g=fc.features[m.fi].geometry;
  if(g.type!=='MultiPolygon')throw Error('Refusing to discard an entire feature');
  g.coordinates.splice(m.pi,1);
  discarded.push({...drop,removedVertices:m.r.length});
 }
 for(const island of spec.islands??[]){
  const points:P[]=island.coordinates;
  if(dist(points[0]!,points.at(-1)!)>1e-6)throw Error(`Unclosed source island ${island.name}`);
  const issues=ringIssues([[points]]);
  if(issues.zeroArea||issues.selfCrossing)throw Error(`Invalid source island ${island.name}`);
  const g=fc.features[0].geometry;
  if(g.type==='Polygon'){g.coordinates=[g.coordinates];g.type='MultiPolygon';}
  g.coordinates.push([points.map(p=>model.toLngLat(p[0]!,p[1]!))]);
 }
 writeFileSync(`${d}/${file}`,JSON.stringify(fc));
 reports.push({source:id,method:spec.method,limits:spec.limits,arcs:arcReports,discardedComponents:discarded,islands:(spec.islands??[]).map((i:any)=>({name:i.name,inputVertices:i.points.length,vertices:i.coordinates.length}))});
}
writeFileSync(`${d}/residual-trace-audit.json`,JSON.stringify({date:'2026-11-09',method:'Reviewed original-pixel bank arcs, shape-preserving vector interpolation at <=2px; old registration retained; short endpoint joins measured explicitly. Source ring validity checked before reprojection.',reports},null,2)+'\n');
console.log(reports.map(r=>({source:r.source,arcs:r.arcs.length,vertices:r.arcs.reduce((n,a)=>n+a.vertices,0)})));
