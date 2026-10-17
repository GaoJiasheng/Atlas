import fs from 'node:fs';
import { createRequire } from 'node:module';
import { routes } from './content-routes';
const require = createRequire(new URL('../.tools/package.json', import.meta.url));
const pointIn = require('@turf/boolean-point-in-polygon').default;
const intersect = require('@turf/line-intersect').default;
const land = JSON.parse(fs.readFileSync(new URL('./raw/ne_10m_admin_0_countries.geojson',import.meta.url),'utf8'));
const parts = land.features.flatMap((f:any) => (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]).map((c:any) => {
  const coords = c.flat();
  return { type:'Feature', properties:{name:f.properties.ADMIN}, geometry:{type:'Polygon',coordinates:c}, box:[Math.min(...coords.map((p:any)=>p[0])),Math.min(...coords.map((p:any)=>p[1])),Math.max(...coords.map((p:any)=>p[0])),Math.max(...coords.map((p:any)=>p[1]))]};
}));
type Position = [number, number];
type Bounds = [number, number, number, number];
const inside = (p:Position,box:Bounds) => p[0]>=box[0]&&p[0]<=box[2]&&p[1]>=box[1]&&p[1]<=box[3];
const result = routes.map(r => {
 const hits:any[]=[];let samples=0,crossings=0;
 for(let i=1;i<r.points.length;i++) {
   const a=r.points[i-1]!,b=r.points[i]!;
   const box: Bounds=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
   const candidates=parts.filter((p:any)=>p.box[0]<=box[2]&&p.box[2]>=box[0]&&p.box[1]<=box[3]&&p.box[3]>=box[1]);
   const line={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[a,b]}};
   crossings+=candidates.reduce((sum:number,p:any)=>sum+intersect(line,p).features.length,0);
   const n=Math.max(1,Math.ceil(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))/0.002));
   for(let j=0;j<=n;j++) {
     const p: Position=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n];samples++;
     for(const l of candidates) if(inside(p,l.box)&&pointIn(p,l)) { if(!hits.some(h=>h.segment===i-1))hits.push({segment:i-1,at:p.map(x=>+x.toFixed(5)),land:l.properties.name});break; }
   }
 }
 return {id:r.id,segments:r.points.length-1,samples,shoreCrossings:crossings,landSamples:hits};
});
fs.writeFileSync(new URL('./content-route-check.json',import.meta.url),JSON.stringify({dataset:'Natural Earth 1:10m admin-0 countries (public domain); all polygon parts incl small islands; source-derived corridors sampled every <=0.002 degrees and exact line/boundary intersections',results:result},null,2)+'\n');
console.log(JSON.stringify(result.map(r=>({id:r.id,crossings:r.shoreCrossings,hits:r.landSamples}))));
