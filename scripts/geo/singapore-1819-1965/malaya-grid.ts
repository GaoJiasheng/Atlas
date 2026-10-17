/** Regional grid registration of the georeferenced published G23 map.
 * These are printed Greenwich graticule intersections, NOT independently checked
 * surviving-feature CPs. Grid fit residual is internal precision, not external
 * accuracy; the required landmark audit remains open and geometry is approximate.
 */
import sharp from 'sharp';import{existsSync}from'node:fs';import{resolve}from'node:path';import{readJson,writeJson}from'../lib/common';
const dir=resolve(import.meta.dirname);const cp:any[]=[];
for(const [lon,x]of[[100,3350],[101,5905],[102,8465],[103,11020]])for(const[lat,y]of[[7,3185],[4,10920],[1,18670]])cp.push({name:`Printed Greenwich grid ${lon}E ${lat}N`,svg:[x,y],lnglat:[lon,lat]});
const data={dataset:'g23-quarter',projection:'auto',maxResidualKm:10,controlPointType:'printed-graticule; external landmark audit outstanding',controlPoints:cp.map(p=>({...p,svg:p.svg.map((v:number)=>v/4)})),knownGaps:['Twelve printed graticule CPs establish map registration; they do not meet the requested surviving-feature CP requirement.','Historic geodetic datum not identified; approximately kilometre-level regional use only.','G23 has no Borneo coverage.']};
await sharp(`${dir}/raw/G23.jpg`,{limitInputPixels:false}).resize({width:Math.round(15614/4),height:Math.round(20593/4),fit:'fill'}).jpeg({quality:95}).toFile(`${dir}/work/G23-quarter.jpg`);
const manifest=readJson<any>(`${dir}/sources.json`);manifest.datasets['g23-quarter']={...manifest.datasets.g23,ref:'G23',file:'../work/G23-quarter.jpg',role:'Quarter-size source raster for bounded-memory lines.ts tracing; derived directly from full-resolution G23 with uniform scale'};writeJson(`${dir}/sources.json`,manifest,true);
writeJson(`${dir}/georef-G23-grid.json`,data,true);
const selected=existsSync(`${dir}/georef-G23-landmarks.json`)?readJson<any>(`${dir}/georef-G23-landmarks.json`):data;
writeJson(`${dir}/georef-G23.json`,selected,true);const lines=readJson<any>(`${dir}/lines.json`);lines.maps.malaya=selected;writeJson(`${dir}/lines.json`,lines,true);
