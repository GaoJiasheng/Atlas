/** Local source-colour extraction around Shangdang/Yewang. Relief grey is Zhao;
 * olive green is Han; ochre is Wei. This is a colour sampling window, NOT a
 * geographic bbox or a new territorial edge: output boundaries follow actual
 * source pixels. Lettering/rivers are unknown and fill from nearest source fill.
 */
import fs from 'node:fs';import sharp from 'sharp';import {required} from './strict-input';import{readImage,fillUnknown,majority,absorbSmall}from'../lib/raster';
const rgb={han:[184,189,92],zhao:[148,162,134],wei:[219,157,92],qin:[156,129,112]};
export async function correctHanBorders(){
for(const id of['G7','G8']){
 const source=id==='G8'&&fs.existsSync('scripts/geo/warring-states/raw/G8-original.png')?'scripts/geo/warring-states/raw/G8-original.png':`scripts/geo/warring-states/raw/${id}.png`;
 const img=await readImage(source),mask=await readImage(`scripts/geo/warring-states/raw/${id}-trace.png`);
 const x0=Math.round(333*img.width/736),y0=Math.round(225*img.height/786),x1=Math.round(438*img.width/736),y1=Math.round(315*img.height/786),w=x1-x0,h=y1-y0;
 const grid=new Int16Array(w*h).fill(-1);const known=[0,0,0];
 const labelBoxes:[number,number,number,number,number][]=id==='G7'?[[398,269,420,300,2],[320,287,344,313,2],[393,207,413,234,1],[394,307,416,334,0]]:[[398,268,425,295,2],[391,307,417,335,0],[393,207,414,235,1]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ux=(x+x0)*736/img.width,uy=(y+y0)*786/img.height;if(labelBoxes.some(([a,b,c,d])=>ux>=a&&ux<c&&uy>=b&&uy<d))continue;let p=((y+y0)*img.width+x+x0)*4;const[r,g,b]=Array.from(img.data.slice(p,p+3))as[number,number,number];if(r+g+b<150||(r>240&&g>210&&b>170)||g<30)continue;const rg=r/g,bg=b/g;let k=-1;if(rg>.95&&rg<1.08&&bg>.43&&bg<.58)k=0;else if(rg>1.22&&rg<1.42&&bg>.43&&bg<.61)k=2;else if(rg>1.035&&rg<1.12&&bg>.73&&bg<.85)k=1;if(k>=0){grid[y*w+x]=k;known[k]=required(known[k], 'classification counter')+1;}}
 // Printed country labels identify their own fill; repair their annotation backgrounds.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ux=(x+x0)*736/img.width,uy=(y+y0)*786/img.height;const box=labelBoxes.find(([a,b,c,d])=>ux>=a&&ux<c&&uy>=b&&uy<d);if(box)grid[y*w+x]=box[4];}
 fillUnknown(grid,w,h);const filled=majority(grid,w,h,3);absorbSmall(filled,w,h,()=>60);let changed=0;
 const names=['han','zhao','wei']as const;const allowed=[rgb.han,rgb.zhao,rgb.wei,[255,255,255]];
 for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++){const sx=Math.floor((x+.5)*img.width/mask.width),sy=Math.floor((y+.5)*img.height/mask.height);if(sx<x0||sx>=x1||sy<y0||sy>=y1)continue;const p=(y*mask.width+x)*4;const old=Array.from(mask.data.slice(p,p+3));if(!allowed.some(c=>c.every((v,i)=>Math.abs(v-required(old[i], 'mask colour component'))<=30)))continue;const name=names[required(filled[(sy-y0)*w+sx-x0], 'filled pixel')];if(name===undefined)continue;const col=rgb[name];if(col.some((v,i)=>v!==old[i]))changed++;mask.data.set(col,p);}
 await sharp(Buffer.from(mask.data),{raw:{width:mask.width,height:mask.height,channels:4}}).png().toFile(`scripts/geo/warring-states/raw/${id}-trace.png`);
 const edges=Buffer.alloc(mask.width*mask.height*4);for(let y=1;y<mask.height-1;y++)for(let x=1;x<mask.width-1;x++){const p=(y*mask.width+x)*4;let different=false;for(const q of[p-4,p+4,p-mask.width*4,p+mask.width*4])if(mask.data[p]!==mask.data[q]||mask.data[p+1]!==mask.data[q+1]||mask.data[p+2]!==mask.data[q+2])different=true;if(different)edges.set([0,255,255,220],p);}
 await sharp(`scripts/geo/warring-states/raw/${id}.png`).composite([{input:edges,raw:{width:mask.width,height:mask.height,channels:4}}]).png().toFile(`scripts/geo/warring-states/check/raster-${id}-trace-overlay.png`);
 // Enlarged source and independently extracted local classes are reviewable.
 const region=Buffer.alloc(w*h*3);for(let p=0;p<filled.length;p++)region.set(rgb[required(names[required(filled[p], 'filled pixel')], 'classified holder')],p*3);await sharp(region,{raw:{width:w,height:h,channels:3}}).resize(w*6,h*6,{kernel:'nearest'}).png().toFile(`scripts/geo/warring-states/check/raster-${id}-han-source-classes.png`);
 console.log(`${id} source-backed Han/Zhao/Wei local correction: ${changed} mask pixels changed; directly classified source samples ${known.join('/')}`);
}}
