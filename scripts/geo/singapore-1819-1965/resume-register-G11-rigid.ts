/** Euclidean fit of the printed Johore grid; no historical CRS is invented. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fitModel,type Projection} from '../lib/fit';
import type{ControlPoint}from'../lib/manifest';
const p=import.meta.dirname;
const require=createRequire(import.meta.url),proj4=require(process.env.ATLAS_PROJ4_MODULE??'../.tools/node_modules/proj4');
const groundDefinition='+proj=laea +lat_0=1.3 +lon_0=103.85 +ellps=WGS84 +x_0=0 +y_0=0 +units=m';
export const groundProjection:Projection={name:'local-ellipsoidal-WGS84-LAEA-m',forward:(l,b)=>proj4('WGS84',groundDefinition,[l,b]) as [number,number],inverse:(x,y)=>proj4(groundDefinition,'WGS84',[x,y]) as [number,number]};
const identity:Projection={name:'printed-Johore-local-grid',forward:(x,y)=>[x,y],inverse:(x,y)=>[x,y]};
const input=JSON.parse(readFileSync(`${p}/resume-G11-grid.json`,'utf8')) as {controlPoints:{name:string;svg:[number,number];gridYards:[number,number]}[]};
const grid:ControlPoint[]=input.controlPoints.map(c=>({name:c.name,svg:c.svg,lnglat:[c.gridYards[0]*.9144,c.gridYards[1]*.9144] as [number,number]}));
const external=JSON.parse(readFileSync(`${p}/georef-G11.json`,'utf8')).controlPoints as ControlPoint[];
function rigidFit(points:{grid:[number,number];ground:[number,number]}[],rotate:boolean){
 const n=points.length,gx=points.reduce((s,c)=>s+c.grid[0],0)/n,gy=points.reduce((s,c)=>s+c.grid[1],0)/n,px=points.reduce((s,c)=>s+c.ground[0],0)/n,py=points.reduce((s,c)=>s+c.ground[1],0)/n;
 let dot=0,cross=0;for(const c of points){const x=c.grid[0]-gx,y=c.grid[1]-gy,u=c.ground[0]-px,v=c.ground[1]-py;dot+=x*u+y*v;cross+=x*v-y*u}const theta=rotate?Math.atan2(cross,dot):0,co=Math.cos(theta),si=Math.sin(theta);return{rotationRadians:theta,translationMetres:[px-co*gx+si*gy,py-si*gx-co*gy]as[number,number]};
}
function apply(m:ReturnType<typeof rigidFit>,a:[number,number]):[number,number]{const co=Math.cos(m.rotationRadians),si=Math.sin(m.rotationRadians);return[co*a[0]-si*a[1]+m.translationMetres[0],si*a[0]+co*a[1]+m.translationMetres[1]]}
function measure(a:number[]){return{rmsM:Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length),maxM:Math.max(...a)}}
const reports=[];
for(const kind of ['affine','poly2']as const){
 const model=fitModel(identity,kind,grid),errors=grid.map(c=>{const a=model.toLngLat(c.svg[0],c.svg[1]);return Math.hypot(a[0]-c.lnglat[0],a[1]-c.lnglat[1])}),loo=grid.map((c,i)=>{const m=fitModel(identity,kind,grid.filter((_,j)=>j!==i)),a=m.toLngLat(c.svg[0],c.svg[1]);return Math.hypot(a[0]-c.lnglat[0],a[1]-c.lnglat[1])});
 const externalReports=[];
 for(const set of [{name:'all18',points:external},{name:'town-roads12',points:external.filter(c=>!c.name.startsWith('Tanjong'))}]){
  const pts=set.points.map(c=>({name:c.name,grid:model.toLngLat(c.svg[0],c.svg[1]),ground:groundProjection.forward(c.lnglat[0],c.lnglat[1])}));
  for(const rotate of [false,true]){const parameters=rigidFit(pts,rotate),rs=pts.map(c=>{const a=apply(parameters,c.grid);return{name:c.name,errorM:Math.hypot(a[0]-c.ground[0],a[1]-c.ground[1])}}),ls=pts.map((c,i)=>{const m=rigidFit(pts.filter((_,j)=>j!==i),rotate),a=apply(m,c.grid);return{name:c.name,errorM:Math.hypot(a[0]-c.ground[0],a[1]-c.ground[1])}});externalReports.push({set:set.name,count:pts.length,method:rotate?'grid+unit-scale-rotation-and-translation':'grid+translation',parameters,fit:measure(rs.map(c=>c.errorM)),loo:measure(ls.map(c=>c.errorM)),residuals:rs,looResiduals:ls})}
 }
 reports.push({kind,internal:{count:grid.length,fit:measure(errors),loo:measure(loo)},external:externalReports});
}
writeFileSync(`${p}/resume-register-G11-fit-report.json`,JSON.stringify({qualification:'Internal square-grid observations do not count as independent surviving-feature controls. External uses the unchanged18 native ground observations, with their pre-existing identification/generalisation limitations. Euclidean metre errors; unit scale preserved.',reports},null,2)+'\n');console.log(reports.map(r=>({kind:r.kind,internal:r.internal,external:r.external.map(t=>({set:t.set,method:t.method,fit:t.fit,loo:t.loo,rotation:t.parameters.rotationRadians}))})));
