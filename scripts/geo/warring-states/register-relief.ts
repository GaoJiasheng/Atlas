/** G18 reference-only registration from identifiable NE river junctions.
 * Start with six independently identified junctions, then match further NE nodes
 * to source blue river pixels within 5 px; keep the full snap distances in audit.
 */
import{readFileSync}from'node:fs';import sharp from'sharp';import{candidates,evaluate}from'../lib/fit';import{writeJson}from'../lib/common';
const d='scripts/geo/warring-states';const ne=JSON.parse(readFileSync(`${d}/raw/ne-rivers.geojson`,'utf8'));
const seeds=[
 ['Wei–Yellow confluence',[110.293468,34.623155],[462,573]],
 ['Jing–Wei confluence',[109.070974,34.470038],[383,588]],
 ['Fen–Yellow confluence',[110.554861,35.458604],[486,502]],
 ['Han–Yangtze confluence',[114.289561,30.566352],[822,959]],
 ['Jialing–Yangtze confluence',[106.586843,29.585639],[217,1030]],
].map(([name,lnglat,svg])=>({name,lnglat,svg,coordinateSource:'Natural Earth 10m rivers named endpoint; source junction visually identified'}));
// Invert the preliminary affine model using three transformed image basis points.
const r=evaluate(candidates('equirectangular+affine',seeds as any)[0]!.proj,'affine',seeds as any);const a=r.model.toLngLat(0,0),b=r.model.toLngLat(1,0),c=r.model.toLngLat(0,1);const A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1];const det=A*D-B*C;
const inv=(l:number,p:number):[number,number]=>[(D*(l-a[0])-B*(p-a[1]))/det,(-C*(l-a[0])+A*(p-a[1]))/det];
const im=await sharp(`${d}/raw/G18.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const selected=[];for(const f of ne.features){const name=f.properties.name;if(!['Luan','Hai','Huai','Han','Fen','Wei','Jing','Ying','Jialing','Gan','Yangtze'].includes(name))continue;const lines=f.geometry.type==='MultiLineString'?f.geometry.coordinates:[f.geometry.coordinates];for(const line of lines){for(const q of [line[0],line[Math.floor(line.length*.2)],line[Math.floor(line.length*.4)],line[Math.floor(line.length*.6)],line[Math.floor(line.length*.8)],line.at(-1)]){const [u,v]=inv(q[0],q[1]);if(u<20||v<20||u>im.info.width-20||v>im.info.height-20)continue;if([...seeds,...selected].some((p:any)=>Math.hypot(p.svg[0]-u,p.svg[1]-v)<35))continue;
let best:any=null;for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const x=Math.round(u)+dx,y=Math.round(v)+dy,i=(y*im.info.width+x)*4;const rr=im.data[i]!,gg=im.data[i+1]!,bb=im.data[i+2]!;if(!(rr<100&&gg>85&&gg<180&&bb>120&&bb>rr+50))continue;const ds=Math.hypot(x-u,y-v);if(!best||ds<best.distance)best={svg:[x,y],distance:ds};}if(best)selected.push({name:name+' NE river vertex '+selected.length,lnglat:q,svg:best.svg,snapPx:best.distance,coordinateSource:'NE named river vertex; anchored nearest blue path within 5px; reference-only map'});
}}}
const cps=[...seeds,...selected];const best=candidates('auto',cps as any).map(c=>evaluate(c.proj,c.kind,cps as any)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
writeJson(`${d}/g18-registration.json`,{controlPoints:cps,report:best.report,method:'Visual junction anchors and reproducible nearest-blue NE endpoint matches. G18 is not used to reconstruct any historical geometry.'},true);
console.log('G18',cps.length,best.report.rmsKm,best.report.maxKm,best.report.looRmsKm);
const m=JSON.parse(readFileSync(`${d}/sources.json`,'utf8'));m.raster.G18={dataset:'G18',projection:'auto',palette:{'#c6ecff':'_sea','#a8c68f':'_land'},tolerance:20,land:['_land'],sea:['_sea'],maxResidualKm:40,controlPoints:cps};writeJson(`${d}/sources.json`,m,true);writeJson(`${d}/work/raster-G18-fit.json`,best.report,true);
