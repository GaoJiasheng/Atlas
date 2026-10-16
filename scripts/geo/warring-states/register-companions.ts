/** Shared-cartography checks use matched source city dots after actual image scaling. */
import{readFileSync}from'node:fs';import sharp from'sharp';import{candidates,evaluate}from'../lib/fit';import{writeJson}from'../lib/common';
const d='scripts/geo/warring-states',m=JSON.parse(readFileSync(`${d}/sources.json`,'utf8'));
for(const[id,width,height]of[['G4',1280,865],['G6',330,224]]as const){
 const cp=m.svg.G3.controlPoints.map((p:any)=>({...p,svg:[p.svg[0]*width/567.50659,p.svg[1]*height/383.53125]}));
 const best=candidates('auto',cp).map(c=>evaluate(c.proj,c.kind,cp)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 writeJson(`${d}/work/raster-${id}-fit.json`,{...best.report,method:'Same published SVG base as G3, source city symbol positions scaled to this published raster rendering. Not independent corroboration.'},true);
 m.raster[id]={dataset:id,projection:'auto',palette:{'#a8c68f':'_land','#c6ecff':'_sea'},tolerance:12,land:['_land'],sea:['_sea'],minRegionPx:12,maxResidualKm:40,controlPoints:cp};
 console.log(id,best.report.rmsKm,best.report.maxKm);
}
writeJson(`${d}/sources.json`,m,true);
