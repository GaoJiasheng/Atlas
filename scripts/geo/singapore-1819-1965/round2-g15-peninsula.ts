/** Restore the omitted source-vegetated northern peninsula. No selection cap
 * becomes a bank: closure legs are verified in retained source land. */
import{readFileSync,writeFileSync}from'node:fs';import{candidates,evaluate}from'../lib/fit';import{mapshaper,pointInPolygon,toFc}from'../lib/common';
const d=import.meta.dirname;
export async function restorePeninsula(base:any){
 const input=JSON.parse(readFileSync(`${d}/round2-g15-peninsula.json`,'utf8')),cp=JSON.parse(readFileSync(`${d}/georef-G15-grid.json`,'utf8')).controlPoints;
 const model=candidates('auto',cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.model;
 const project=(p:number[])=>model.toLngLat(p[0]!,p[1]!);
 const polys=base.features.flatMap((f:any)=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates);
 let samples=0;
 for(const [a,b]of input.coverageLegs)for(let i=0;i<=1000;i++){
  const p=project([a[0]+(b[0]-a[0])*i/1000,a[1]+(b[1]-a[1])*i/1000]);
  if(!polys.some((r:number[][][])=>pointInPolygon(p,r)))throw Error(`Peninsula coverage closure would become coast at ${a} -> ${b}, fraction ${i/1000}`);samples++;
 }
 const shape=(points:number[][])=>toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[points.map(project)]}}]);
 // The internal uninked clearing is not qualified as water; only the
 // unambiguous outer mangrove front defines this added source land.
 const land=shape(input.boundary);
 const result=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2 -clean gap-fill-area=0',{a:base,b:land});
 const inverse=(p:number[])=>{let x=5000,y=6000;for(let i=0;i<7;i++){const a=model.toLngLat(x,y),b=model.toLngLat(x+1,y),c=model.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;}return[x,y];};
 const removedFragments:any[]=[];
 for(const f of result.features){
  if(f.geometry.type!=='MultiPolygon')continue;
  f.geometry.coordinates=f.geometry.coordinates.filter(poly=>{
   const pixels=poly[0]!.map(inverse);
   const offshore=pixels.every(([x,y])=>x!>4800&&x!<5200&&y!>5800&&y!<6250)&&pixels.every(p=>!pointInPolygon(p,[input.boundary]));
   if(offshore)removedFragments.push({nativeRing:pixels,source:'G15 native crop contains soundings and sea here, no dry island; complete detached G16 chart-glyph fragment removed'});
   return !offshore;
  });
 }
 writeFileSync(`${d}/round2-g15-peninsula-audit.json`,JSON.stringify({date:'2026-11-09',source:'G15',method:input.method,closureLandSamples:samples,sourceVertices:input.outer.length,removedFragments},null,2)+'\n');
 return result;
}
