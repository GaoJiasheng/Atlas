/** Build-time regularised thin-plate warp experiment. Independent leave-one-out
 * errors select smoothing; fitted residuals never stand in for ground error. */
import {readFileSync,writeFileSync} from 'node:fs';
import {candidates,evaluate,laea,type Model} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
const d=import.meta.dirname;
const ground=laea(103.85,1.35);
function solve(matrix:number[][],vector:number[]):number[]{
 const a=matrix.map((r,i)=>[...r,vector[i]!]),n=a.length;
 for(let k=0;k<n;k++){
  let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(a[i]![k]!)>Math.abs(a[pivot]![k]!))pivot=i;
  [a[k],a[pivot]]=[a[pivot]!,a[k]!];const scale=a[k]![k]!;
  if(Math.abs(scale)<1e-14)throw Error('Singular TPS');
  for(let j=k;j<=n;j++)a[k]![j]!/=scale;
  for(let i=0;i<n;i++)if(i!==k){const v=a[i]![k]!;for(let j=k;j<=n;j++)a[i]![j]!-=v*a[k]![j]!;}
 }
 return a.map(r=>r[n]!);
}
const phi=(a:number[],b:number[])=>{const r2=(a[0]!-b[0]!)**2+(a[1]!-b[1]!)**2;return r2?r2*Math.log(r2)/2:0;};
export function tps(points:ControlPoint[],smooth:number):Model{
 const coords=points.map(p=>p.svg.map(x=>x/1000));
 const A=coords.map((a,i)=>[...coords.map((b,j)=>phi(a,b)+(i===j?smooth:0)),1,a[0]!,a[1]!]);
 A.push([...coords.map(()=>1),0,0,0],[...coords.map(p=>p[0]!),0,0,0],[...coords.map(p=>p[1]!),0,0,0]);
 const targets=points.map(p=>ground.forward(...p.lnglat));
 const cx=solve(A,[...targets.map(p=>p[0]),0,0,0]),cy=solve(A,[...targets.map(p=>p[1]),0,0,0]);
 return {name:`regularised thin-plate spline λ=${smooth}`,toLngLat(x,y){const p=[x/1000,y/1000],basis=[...coords.map(a=>phi(p,a)),1,...p];return ground.inverse(basis.reduce((s,v,i)=>s+v*cx[i]!,0),basis.reduce((s,v,i)=>s+v*cy[i]!,0));}};
}
export function study(points:ControlPoint[]){
 const measure=(errors:number[])=>({rmsM:Math.sqrt(errors.reduce((s,x)=>s+x*x,0)/errors.length),maxM:Math.max(...errors)});
 const error=(model:Model,p:ControlPoint)=>{const a=ground.forward(...model.toLngLat(...p.svg)),b=ground.forward(...p.lnglat);return Math.hypot(a[0]-b[0],a[1]-b[1])*6371008.8;};
 return [0,.001,.01,.1,1,10,100].map(smoothing=>{
  const model=tps(points,smoothing),fit=points.map(p=>error(model,p));
  const loo=points.map((p,i)=>error(tps(points.filter((_,j)=>j!==i),smoothing),p));
  return {smoothing,fit:measure(fit),loo:measure(loo),points:points.map((p,i)=>({name:p.name,fitM:fit[i],looM:loo[i]}))};
 }).sort((a,b)=>a.loo.rmsM-b.loo.rmsM);
}
if(process.argv.includes('--study')){
 const reports=['G1','G4','G7','G9','G11','G16'].map(id=>{
  const input=JSON.parse(readFileSync(`${d}/georef-${id}.json`,'utf8'));
  const old=candidates('auto',input.controlPoints).map(c=>evaluate(c.proj,c.kind,input.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.report;
  const trials=study(input.controlPoints);
  return {id,count:input.controlPoints.length,baselineLooRmsM:old.looRmsKm*1000,trials,adopted:false,qualification:'Existing source/ground correspondence limitations remain. A smaller LOO error alone cannot certify an uncertain landmark or extrapolation.'};
 });
 writeFileSync(`${d}/round2-tps-report.json`,JSON.stringify({date:'2026-11-09',reports},null,2)+'\n');
 console.log(reports.map(r=>({id:r.id,before:r.baselineLooRmsM,best:r.trials[0]})));
}
