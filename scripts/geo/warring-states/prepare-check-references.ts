/** Original published pixels are shown beside the traced masks' registered result. */
import{readFileSync,copyFileSync}from'node:fs';import{writeJson}from'../lib/common';
const d='scripts/geo/warring-states',m=JSON.parse(readFileSync(`${d}/sources.json`,'utf8'));
for(const id of ['G7','G8','G10','G11']){const src=m.raster[id],alias=id+'-reference';m.raster[alias]={...src,dataset:id,palette:{'#ffffff':'_outside'},land:[],sea:[],registrationOnly:true};copyFileSync(`${d}/work/raster-${id}-fit.json`,`${d}/work/raster-${alias}-fit.json`);}
writeJson(`${d}/sources.json`,m,true);
