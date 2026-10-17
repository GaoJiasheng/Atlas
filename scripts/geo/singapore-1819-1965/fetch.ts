/** Full-resolution archival inputs only; no downloaded map is a published geometry.
 * pnpm tsx scripts/geo/singapore-1819-1965/fetch.ts [G1 G2 ...]
 * Commons imageinfo supplies original URL, dimensions and structured author/licence;
 * revisions supplies the exact file-page wikitext, including licence templates.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const dir=resolve('scripts/geo/singapore-1819-1965');
mkdirSync(`${dir}/raw`,{recursive:true});
const spec=readFileSync('docs/28-singapore-1819-1965-content-spec.md','utf8');
const names=new Map<string,string>();
for(const m of spec.matchAll(/^\| (G\d+) \| `([^`]+)`/gm)) if(!names.has(m[1]!)) names.set(m[1]!,m[2]!);
const wanted=process.argv.slice(2);
const ids=wanted.length?wanted:[...names.keys()].filter(x=>!['G21','G22','G28','G30','G31'].includes(x));
const ua='AtlasSingaporeHistoricalMapResearch/1.0 (educational archival source documentation)';
const logFile=`${dir}/raw/fetch-log.json`;
let limited=false;
let logs:any[]=existsSync(logFile)?JSON.parse(readFileSync(logFile,'utf8')):[];
if(!Array.isArray(logs)) logs=[];
function save(item:any){logs=logs.filter(x=>x.id!==item.id);logs.push(item);logs.sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));writeFileSync(logFile,JSON.stringify(logs,null,2)+'\n');}
async function get(url:string){let last:any;for(let attempt=0;attempt<4;attempt++)try{const r=await fetch(url,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(180000)});if(!r.ok){const error=Error(`HTTP ${r.status}${r.headers.get('retry-after')?' Retry-After '+r.headers.get('retry-after'):''}: ${url}`);if(r.status===429)throw Object.assign(error,{rateLimited:true});throw error;}return r;}catch(e){if((e as any).rateLimited)throw e;last=e;if(attempt<3)await new Promise(r=>setTimeout(r,2000*(attempt+1)));}throw last;}
async function api(p:Record<string,string>){return (await get('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',...p}))).json();}
async function one(id:string){try{
 if(logs.some(x=>x.id===id&&x.sha256&&existsSync(`${dir}/raw/${x.file}`))){console.log(`${id}: cached verified download`);return;}
 let title=names.get(id);if(!title)throw Error('No spec filename');
 if(title.includes(' ... ')&&existsSync(`${dir}/raw/${id}-metadata.json`)){const cached=JSON.parse(readFileSync(`${dir}/raw/${id}-metadata.json`,'utf8'));const cachedTitle=(Object.values(cached.query.pages)[0] as any).title;
  if(typeof cachedTitle!=='string')throw Error('Cached Commons filename missing');
  title=cachedTitle.replace(/^File:/,'');}
 if(title.includes(' ... ')){const found:any=await api({list:'search',srnamespace:'6',srsearch:'intitle:"Admiralty Chart No 2586"',srlimit:'10'});title=found.query.search.find((x:any)=>x.title.includes('Corrections to 1954'))?.title?.replace(/^File:/,'');if(!title)throw Error('Exact G17 title unresolved');}
 const cachedMetadata=`${dir}/raw/${id}-metadata.json`;
 const data:any=existsSync(cachedMetadata)?JSON.parse(readFileSync(cachedMetadata,'utf8')):await api({titles:'File:'+title,prop:'imageinfo|revisions',iiprop:'url|size|extmetadata',rvprop:'content',rvslots:'main'});
 const page:any=Object.values(data.query.pages)[0];if(page.missing!==undefined)throw Error(`Missing Commons file ${title}`);
 const ii=page.imageinfo[0];const wt=page.revisions?.[0]?.slots?.main?.['*']??'';const ext=ii.extmetadata??{};
 const extn=title!.split('.').pop()!.toLowerCase();const file=`${id}.${extn}`;
 writeFileSync(`${dir}/raw/${id}-filepage.wikitext`,wt);writeFileSync(`${dir}/raw/${id}-metadata.json`,JSON.stringify(data,null,2));
 let bytes:Buffer;try{const original=await get(ii.url);bytes=Buffer.from(await original.arrayBuffer());writeFileSync(`${dir}/raw/${file}`,bytes);}catch(e){if((e as any).rateLimited)limited=true;const entry={id,file,title:page.title,page:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,url:ii.url,author:ext.Artist?.value??'',license:ext.LicenseShortName?.value??'',licenseUrl:ext.LicenseUrl?.value??'',licenseTemplateText:wt,filePageWikitext:`${id}-filepage.wikitext`,width:ii.width,height:ii.height,error:String(e),attemptedAt:new Date().toISOString(),crossCheckOnly:['G19','G20','G27'].includes(id)};save(entry);console.error(`${id}: ${e}`);return;}
 const licenceSection=wt.match(/==\s*\{\{int:license-header\}\}\s*==([\s\S]*?)(?=\n==[^=]|$)/i)?.[1]?.trim()??wt.match(/==\s*(?:Licensing|License|Permission)\s*==([\s\S]*?)(?=\n==[^=]|$)/i)?.[1]?.trim()??wt;
 save({id,file,title:page.title,page:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,url:ii.url,api:'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&titles='+encodeURIComponent(page.title),author:ext.Artist?.value??'',license:ext.LicenseShortName?.value??'',licenseUrl:ext.LicenseUrl?.value??'',licenseTemplateText:licenceSection,filePageWikitext:`${id}-filepage.wikitext`,width:ii.width,height:ii.height,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),fetchedAt:new Date().toISOString(),crossCheckOnly:['G19','G20','G27'].includes(id),licenseReview:['G16','G19','G20','G27'].includes(id)?'Needs archival date/original-publication verification; do not infer from LicenseShortName alone.':'File-page template retained for review.'});
 console.log(`${id}: ${ii.width}×${ii.height}, ${bytes.length} bytes, ${ext.LicenseShortName?.value}`);
}catch(e){save({id,error:String(e),attemptedAt:new Date().toISOString()});console.error(`${id}: ${e}`);}}
for(const [i,id] of ids.entries()){await one(id);if(limited){console.error('Stopped: respecting Wikimedia Retry-After; rerun after600seconds.');break;}if(i+1<ids.length)await new Promise(r=>setTimeout(r,30000));}
if(!wanted.length||wanted.includes('G30'))try{
 const id='d_4765db0e87b9c86336792efe8a1f7a66';const endpoint=`https://api-open.data.gov.sg/v1/public/api/datasets/${id}/poll-download`;
 const meta:any=await (await get(endpoint)).json();if(!meta.data?.url)throw Error(JSON.stringify(meta));
 const bytes=Buffer.from(await (await get(meta.data.url)).arrayBuffer());const file='ura-mp2019-planning-area.geojson';writeFileSync(`${dir}/raw/${file}`,bytes);
 save({id:'G30',file,title:'URA Master Plan 2019 Planning Area Boundary (No Sea)',url:meta.data.url,api:endpoint,page:`https://data.gov.sg/datasets/${id}/view`,author:'Urban Redevelopment Authority',license:'Singapore Open Data Licence version 1.0',licenseUrl:'https://data.gov.sg/open-data-licence',licenseTemplateText:'Contains information from URA Master Plan 2019 Planning Area Boundary (No Sea) accessed on '+new Date().toISOString().slice(0,10)+' from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0',width:null,height:null,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),fetchedAt:new Date().toISOString()});console.log(`G30: ${bytes.length} bytes`);
}catch(e){save({id:'G30',error:String(e),attemptedAt:new Date().toISOString()});console.error(e);}
