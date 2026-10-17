/** Standalone coast/source review plates. Geometry comes from shared local-land.ts. */
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import sharp from 'sharp';
import type {FeatureCollection} from 'geojson';
import {areaFeatures,toFc} from '../lib/common';
import {feature} from 'topojson-client';
const dir=resolve(import.meta.dirname);
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'));
const spec=read(`${dir}/sources.json`).pipeline.localLand;
const topo=read('public/geo/land-sg-history.json');
const baseline:FeatureCollection=toFc(Object.values(topo.objects).flatMap(o=>(feature(topo,o as Parameters<typeof feature>[1]) as unknown as FeatureCollection).features).filter(f=>f.properties?.kind==='coast-today'));
// Standalone review plates; these are source comparisons, not application screenshots.
const shots=resolve(process.env.SG_REVIEW_DIR??'docs/screenshots/singapore-1819-1965');mkdirSync(shots,{recursive:true});
const escapeXml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const sourceMaps:Record<string,{map:string;caption:string;crop?:{left:number;top:number;width:number;height:number}}>= {
 L0:{map:'G1',caption:'1822 proposed town plan, backcast to1819; outer island from later G9'},
 L1:{map:'G4',caption:'1839 town source; outer island from later G9'},
 L2:{map:'G7',caption:'1893 town source substitutes for1887; outer island from later G9'},
 L3:{map:'G9',caption:'Printed1911 / edition1912 / revision1916; exact survey date mixed'},
 L4:{map:'G11',caption:'Revision1937 / War Office1941 / AMS1944; current registration diagnostics in Second pass report'},
 L5:{map:'G16',caption:'South/east evidence corrected through1954; west reconstruction and date qualifications in Second pass report',crop:{left:6200,top:3000,width:9200,height:5400}},
 'L5-west':{map:'G15',caption:'G15 west: underlying survey1960–61, later corrected edition; see qualified reconstruction method',crop:{left:450,top:6000,width:6250,height:7000}},
};
type Era={id:string;from?:string;to?:string;reviewId:string};
const reviews:Era[]=[...spec.eras.map((e:Era)=>({...e,reviewId:e.id})),{...spec.eras[5],reviewId:'L5-west'}];
for(const era of reviews){
 const info=sourceMaps[era.reviewId]!;const land=read(`${dir}/work/coast-${era.id}.geojson`);
 const bounds=era.reviewId==='L5-west'?[103.58,1.25,103.75,1.44]:['L0','L1','L2'].includes(era.id)?[103.832,1.271,103.87,1.313]:[103.55,1.14,104.12,1.50];
 const xy=([lng=0,lat=0]:number[])=>[35+(lng-bounds[0]!)/(bounds[2]!-bounds[0]!)*830,590-(lat-bounds[1]!)/(bounds[3]!-bounds[1]!)*510];
 const pathOf=(data:FeatureCollection)=>areaFeatures(data).map(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(poly=>poly.map(ring=>ring.map((point,i)=>{const [x,y]=xy(point);return `${i?'L':'M'}${x!.toFixed(2)},${y!.toFixed(2)}`;}).join(' ')+' Z').join(' ')).join(' ')).join(' ');
 const todayPath=baseline.features.flatMap(f=>f.geometry.type==='MultiLineString'?f.geometry.coordinates:f.geometry.type==='LineString'?[f.geometry.coordinates]:[]).map(line=>line.map((p,i)=>{const [x=0,y=0]=xy(p);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')).join(' ');
 const label=`${era.id} ${era.from??'before1823'} to ${era.to??'end of topic'}`;
 const left=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640"><rect width="900" height="640" fill="#edf1ee"/><defs><clipPath id="map"><rect x="24" y="60" width="852" height="545"/></clipPath></defs><text x="30" y="32" font-size="21" font-family="sans-serif">${escapeXml(label)}</text><g clip-path="url(#map)"><path d="${pathOf(land)}" fill="#b7c5bd" fill-rule="evenodd" stroke="#30413b" stroke-width="1.1"/><path d="${todayPath}" fill="none" stroke="#a66833" stroke-width="1" stroke-dasharray="4 3"/></g><text x="30" y="628" font-size="14" font-family="sans-serif">Solid: draft era land · dashed: URA2019 coast</text></svg>`);
 let original=sharp(`${dir}/raw/${info.map}.jpg`,{limitInputPixels:false});if(info.crop)original=original.extract(info.crop);
 const source=await original.resize({width:900,height:600,fit:'contain',background:'#f3efdf'}).png().toBuffer();
 const header=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1840" height="790"><rect width="1840" height="790" fill="#f3efdf"/><text x="24" y="30" font-size="22" fill="#8a3126" font-family="sans-serif">UNACCEPTED RESEARCH DRAFT — geographical accuracy criteria failed</text><text x="944" y="66" font-size="18" font-family="sans-serif">${info.map} original published source (scale differs)</text><text x="24" y="750" font-size="17" font-family="sans-serif">${escapeXml(info.caption)}</text><text x="24" y="778" font-size="15" fill="#8a3126" font-family="sans-serif">Detached historical islands are omitted. Coverage and source-age gaps remain; review only, not accepted for teaching.</text></svg>`);
 await sharp(header).composite([{input:await sharp(left).png().toBuffer(),left:20,top:80},{input:source,left:920,top:100}]).png().toFile(`${shots}/coast-${era.reviewId}.png`);
}
console.log(`wrote ${reviews.length} source-comparison review plates; geographic acceptance remains rejected`);
