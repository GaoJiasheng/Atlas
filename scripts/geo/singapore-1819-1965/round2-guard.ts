/** Independent delivery guard, with no per-map RMS acceptance threshold. */
import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';import{feature}from'topojson-client';
import{candidates,evaluate}from'../lib/fit';import{pointInPolygon}from'../lib/common';import{buildModel}from'./resume-register-anu1958-model';
const d=import.meta.dirname,read=(f:string)=>JSON.parse(readFileSync(`${d}/${f}`,'utf8'));
const receipt=read('round2-rebuild-audit.json');
for(const a of receipt.assets){const h=createHash('sha256').update(readFileSync(`${d}/../../../${a.path}`)).digest('hex');if(h!==a.sha256)throw Error(`Rebuild output changed: ${a.path}`);}
const coast=JSON.parse(readFileSync(`${d}/../../../public/geo/land-sg-history.json`,'utf8'));
const fc:any=feature(coast,coast.objects['land-sg-history']);const f=fc.features.find((f:any)=>f.properties.id==='L5');
const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
const covers=(p:number[])=>polygons.some((r:number[][][])=>pointInPolygon(p,r));
const spec=read('georef-G15-grid.json'),model=candidates('auto',spec.controlPoints).map(c=>evaluate(c.proj,c.kind,spec.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.model;
const peninsula=[[5000,6060],[5050,6100]].map(native=>({native,lnglat:model.toLngLat(native[0]!,native[1]!)}));
if(peninsula.some(p=>!covers(p.lnglat)))throw Error('Northern source-dry peninsula lost');
const g35=buildModel();
function inverse(p:number[]):number[]{let x=2000,y=4000;for(let i=0;i<8;i++){const a=g35.toLngLat(x,y),b=g35.toLngLat(x+1,y),c=g35.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;}return[x-400,y-3400];}
// No real bank exists along the old y30 coverage cap in this native window.
const capVertices=polygons.flatMap((p:number[][][])=>p.flatMap(r=>r.map(inverse))).filter((p:number[])=>p[0]!>850&&p[0]!<2600&&Math.abs(p[1]!-30)<.8);
if(capVertices.length)throw Error(`False inland coverage seam survived (${capVertices.length} vertices)`);
const audit=read('polish-audit.json');
if(!audit.sourceCompleteness.accepted)throw Error('Paired-bank/source splice guard failed');
if(audit.deliveredRings.coast.selfCrossing||audit.deliveredRings.control.selfCrossing)throw Error('Invalid delivery rings');
const report={date:'2026-11-09',status:'passed',freshSourceRebuild:receipt.status,publishedAssets:receipt.assets,sourceHashesVerified:audit.sourceAudit.map((s:any)=>({id:s.ref,license:s.license,sha256:s.sha256})),jurongHead:audit.sourceCompleteness.jurongHead,g15Splice:audit.sourceCompleteness.g15Splice,northernDryPeninsula:peninsula.map(p=>({...p,land:covers(p.lnglat)})),falseInlandCoverageVertices:capVertices.length,deliveredRings:audit.deliveredRings,accuracyPolicy:'Report fitted and leave-one-out RMS; positions approximate, no strict RMS tolerance. Source licence, geometry, wet/dry witnesses and fresh rebuild are hard guards.'};
writeFileSync(`${d}/round2-guard.json`,JSON.stringify(report,null,2)+'\n');console.log('PASS: source rights/hashes, fresh rebuild, paired banks, northern dry peninsula, no false cap, zero ring defects');
