/** Splice open source-bank arcs at genuine intersections. Coverage-mask caps
 * never enter the coast: both replacement endpoints are on both source banks. */
import {readFileSync,writeFileSync} from 'node:fs';
import {pointInPolygon} from '../lib/common';
import {ringIssues} from '../lib/rings';
export function spliceBanks(base:any,water:any){
 const polys=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 const rings=base.features.flatMap((f:any)=>polys(f)).map((p:number[][][])=>p[0]!);
 const mainland=rings.find((r:number[][])=>pointInPolygon([103.8,1.35],[r]));
 if(!mainland)throw Error('Missing G16 mainland');
 const wrings=water.features.flatMap((f:any)=>polys(f)).map((p:number[][][])=>p[0]!);
 const waterRing=wrings.sort((a:number[][],b:number[][])=>b.length-a.length)[0]!;
 // The original mask has three long image-frame closures. Rotate the ring
 // into a source-bank-only open line between these closures.
 const paths:number[][][]=[];let path:number[][]=[];
 for(let k=0;k<waterRing.length-1;k++){
  const a=waterRing[k]!,b=waterRing[k+1]!;
  if(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)>.005){if(path.length)paths.push(path);path=[];}
  else {if(!path.length)path.push(a);path.push(b);}
 }
 if(path.length){if(paths.length&&Math.hypot(path.at(-1)![0]!-paths[0]![0]![0]!,path.at(-1)![1]!-paths[0]![0]![1]!)<1e-10)paths[0]=[...path,...paths[0]!.slice(1)];else paths.push(path);}
 const bank=paths.sort((a,b)=>b.length-a.length)[0]!;
 const crosses:{p:number[];a:number;b:number;t:number;u:number}[]=[];
 for(let i=1;i<mainland.length;i++)for(let j=1;j<bank.length;j++){
  const a=mainland[i-1]!,b=mainland[i]!,c=bank[j-1]!,d=bank[j]!;
  if(Math.max(a[0]!,b[0]!)<Math.min(c[0]!,d[0]!)||Math.min(a[0]!,b[0]!)>Math.max(c[0]!,d[0]!)||Math.max(a[1]!,b[1]!)<Math.min(c[1]!,d[1]!)||Math.min(a[1]!,b[1]!)>Math.max(c[1]!,d[1]!))continue;
  const ux=b[0]!-a[0]!,uy=b[1]!-a[1]!,vx=d[0]!-c[0]!,vy=d[1]!-c[1]!,dx=c[0]!-a[0]!,dy=c[1]!-a[1]!,det=ux*vy-uy*vx;
  if(Math.abs(det)<1e-20)continue;
  const t=(dx*vy-dy*vx)/det,u=(dx*uy-dy*ux)/det;
  if(t>=0&&t<=1&&u>=0&&u<=1)crosses.push({p:[a[0]!+t*ux,a[1]!+t*uy],a:i,b:j,t,u});
 }
 if(process.argv.includes('--survey')){console.log(JSON.stringify({bankLength:bank.length,endpoints:[bank[0],bank.at(-1)],crosses},null,2));return;}
 const north=crosses.filter(c=>c.p[1]!>1.34&&c.p[1]!<1.345).sort((a,b)=>b.p[1]!-a.p[1]!)[0];
 const south=crosses.filter(c=>c.p[1]!<1.31).sort((a,b)=>a.p[1]!-b.p[1]!)[0];
 if(!north||!south)throw Error('Missing qualified source-bank intersections');
 const sub= north.b<south.b?[north.p,...bank.slice(north.b,south.b),south.p]:[north.p,...bank.slice(south.b,north.b).reverse(),south.p];
 const rest=south.a<north.a?[...mainland.slice(south.a,north.a),north.p]:[...mainland.slice(south.a,-1),...mainland.slice(0,north.a),north.p];
 const alternative=south.a>north.a?[...mainland.slice(north.a,south.a).reverse(),north.p]:[...mainland.slice(0,south.a).reverse(),...mainland.slice(north.a,-1).reverse(),north.p];
 const candidates=[rest,alternative].map(r=>[...sub,...r]);
 const joined=candidates.find(r=>pointInPolygon([103.8,1.35],[r])&&!ringIssues([[r]]).selfCrossing);
 if(!joined)throw Error('Source arc splice is not a simple mainland ring');
 for(const f of base.features)for(const p of polys(f))if(p[0]===mainland)p[0]=joined;
 const issues=ringIssues([[joined]]);
 if(issues.selfCrossing||issues.zeroArea)throw Error(`Invalid arc splice ${JSON.stringify(issues)}`);
 const report={date:'2026-11-09',method:'G15 Tuas open natural-bank arc, joined at exact segment intersections to the complementary G16 mainland arc. Poyan/Berih north of 1.34141N stays on the complete G16 source rather than the incomplete northern G15 mask; its omitted G15-observed mangrove tip is restored separately. No source coverage closure or new straight connector is exposed.',north,south,g15SourceVertices:sub.length,g16RetainedVertices:joined.length-sub.length,issues};
 writeFileSync(`${import.meta.dirname}/round2-splice-audit.json`,JSON.stringify(report,null,2)+'\n');
 return {base,report};
}
if(process.argv.includes('--survey')){const d=import.meta.dirname;spliceBanks(JSON.parse(readFileSync(`${d}/work/resume-G16-registered.geojson`,'utf8')),JSON.parse(readFileSync(`${d}/work/G15-west-water.geojson`,'utf8')));}
