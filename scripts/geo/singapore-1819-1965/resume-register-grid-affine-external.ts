/** Independent printed-grid poly2 scan calibration, followed by a full affine
 * external transform. All original observations are retained in each named set.
 * Leave-one-external-out holds the independently observed grid model fixed. */
import{readFileSync,writeFileSync}from'node:fs';
import{createRequire}from'node:module';
import{fitModel,type Projection,type Model}from'../lib/fit';
import type{ControlPoint}from'../lib/manifest';
import{buildNativeModel,nativeProjection}from'./resume-register-anu1958-model';
const p=import.meta.dirname,require=createRequire(import.meta.url),proj4=require(process.env.ATLAS_PROJ4_MODULE??'../.tools/node_modules/proj4');
const definition='+proj=laea +lat_0=1.3 +lon_0=103.85 +ellps=WGS84 +x_0=0 +y_0=0 +units=m';
const ground:Projection={name:'ellipsoidal-WGS84-local-LAEA-m',forward:(l,b)=>proj4('WGS84',definition,[l,b])as[number,number],inverse:(x,y)=>proj4(definition,'WGS84',[x,y])as[number,number]};
const identity:Projection={name:'printed-local-grid-metres',forward:(x,y)=>[x,y],inverse:(x,y)=>[x,y]};
function read(name:string){return JSON.parse(readFileSync(`${p}/${name}`,'utf8'))}
function localModel(id:string):Model{
 if(id==='G35'){const n=buildNativeModel();return{name:'G35-independent16-grid-poly2',toLngLat(x,y){const a=n.toLngLat(x,y);return nativeProjection.forward(a[0],a[1])}}}
 const input=read(id==='G9'?'resume-register-G9-grid.json':'resume-G11-grid.json');
 const cps:ControlPoint[]=input.controlPoints.map((c:any)=>({name:c.name,svg:c.svg,lnglat:id==='G9'?c.gridMetres:[c.gridYards[0]*.9144,c.gridYards[1]*.9144]}));
 return fitModel(identity,'poly2',cps);
}
function metrics(values:number[]){return{rmsM:Math.sqrt(values.reduce((s,v)=>s+v*v,0)/values.length),maxM:Math.max(...values)}}
const reports=[];
for(const id of['G9','G11','G35']){
 const native=localModel(id),all:ControlPoint[]=read(id==='G35'?'resume-register-anu1958-external.json':`georef-${id}.json`).controlPoints;
 const sets=id==='G35'?[{name:'all22-original-candidates',points:all},{name:'previously-declared19-roads',points:all.filter(c=>!c.name.startsWith('Tanjong'))}]:[{name:'all18-original-observations',points:all}];
 for(const set of sets){
  const cps:ControlPoint[]=set.points.map(c=>({name:c.name,svg:native.toLngLat(c.svg[0],c.svg[1]),lnglat:c.lnglat}));
  const model=fitModel(ground,'affine',cps);
  const toGround=(x:number,y:number)=>{const a=model.toLngLat(x,y);return ground.forward(a[0],a[1])};
  const residuals=cps.map(c=>{const a=toGround(c.svg[0],c.svg[1]),b=ground.forward(c.lnglat[0],c.lnglat[1]);return{name:c.name,errorM:Math.hypot(a[0]-b[0],a[1]-b[1])}});
  const loo=cps.map((c,i)=>{const m=fitModel(ground,'affine',cps.filter((_,j)=>j!==i)),l=m.toLngLat(c.svg[0],c.svg[1]),a=ground.forward(l[0],l[1]),b=ground.forward(c.lnglat[0],c.lnglat[1]);return{name:c.name,errorM:Math.hypot(a[0]-b[0],a[1]-b[1])}});
  const ref=cps[0]!.svg,z=toGround(ref[0],ref[1]),e=toGround(ref[0]+1,ref[1]),n=toGround(ref[0],ref[1]+1);
  const a=e[0]-z[0],b=n[0]-z[0],c=e[1]-z[1],d=n[1]-z[1],sx=Math.hypot(a,c),sy=Math.hypot(b,d),det=a*d-b*c,dot=a*b+c*d;
  const tr=sx*sx+sy*sy,disc=Math.sqrt(Math.max(0,tr*tr-4*det*det));
  const fit=metrics(residuals.map(r=>r.errorM)),cross=metrics(loo.map(r=>r.errorM));
  const budget=id==='G9'?{rmsM:40,maxM:80}:{rmsM:30,maxM:60};
  reports.push({map:id,set:set.name,externalCount:cps.length,independentGridCount:16,method:'16-source-grid poly2 scan calibration fixed; full6parameter affine grid-to-ellipsoidalWGS84-LAEA transformation; leave-one-external-out holds gridcalibration fixed; no residual pruning',fit,loo:cross,budget,numericallyWithinBudget:cross.rmsM<=budget.rmsM&&cross.maxM<=budget.maxM,externalQualification:'Existing point identity/generalisation limitations remain; a numerical pass alone cannot qualify ambiguous original observations.',affine:{matrix:[[a,b],[c,d]],translationMetres:[z[0]-a*ref[0]-b*ref[1],z[1]-c*ref[0]-d*ref[1]],axisScales:[sx,sy],axisScaleChangePercent:[(sx-1)*100,(sy-1)*100],determinant:det,principalScales:[Math.sqrt((tr+disc)/2),Math.sqrt((tr-disc)/2)],axisAngleDegrees:Math.acos(Math.max(-1,Math.min(1,dot/(sx*sy))))*180/Math.PI,shearDeviationFrom90Degrees:90-Math.acos(Math.max(-1,Math.min(1,dot/(sx*sy))))*180/Math.PI,rotationEastAxisDegrees:Math.atan2(c,a)*180/Math.PI},residuals,looResiduals:loo});
 }
}
writeFileSync(`${p}/resume-register-grid-affine-external-report.json`,JSON.stringify({qualification:'Diagnostic only; no live geometry changed. Internal grid calibration and external georegistration separated. Scale/shear are fitted and explicitly not held fixed. All points in each pre-existing named set retained.',reports},null,2)+'\n');
console.log(JSON.stringify(reports.map(r=>({map:r.map,set:r.set,count:r.externalCount,fit:r.fit,loo:r.loo,budget:r.budget,pass:r.numericallyWithinBudget,affine:r.affine})),null,2));
