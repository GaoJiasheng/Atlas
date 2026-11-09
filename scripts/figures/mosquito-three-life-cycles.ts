/** Existing graphite specimens isolated in SVG; stage order and every arrow are code. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { path, svg, writePlate } from './graphite';
import { arrow, assertLayout, source, type Box } from './b-layout';
const specimens=[
 ['M216 219L318 216L319 334L334 334L326 351L210 355L204 337L217 336Z',{x:204,y:216,w:130,h:140}],
 ['M333 358L421 359L424 369L401 372L401 401L394 453L389 490L402 516L385 540L359 544L334 526L327 499L343 461L352 413L364 374L333 370Z',{x:327,y:358,w:97,h:186}],
 ['M210 539L335 537L345 552L321 564L323 596L311 631L289 671L261 682L246 663L263 627L245 614L221 607L215 584L224 558L205 552Z',{x:205,y:537,w:140,h:145}],
 ['M70 362H257V548H70Z',{x:70,y:362,w:187,h:186}],
 ['M560 332L575 290L601 259L627 246L659 246L710 266L697 292L678 318L637 338L593 347L557 347Z',{x:557,y:246,w:153,h:101}],
 ['M628 460L659 421L709 404L761 396L793 404L810 421L813 450L791 477L756 491L701 500L656 493L617 487Z',{x:617,y:396,w:196,h:104}],
 ['M553 534L657 502L668 515L642 533L649 570L657 605L646 641L625 676L610 680L591 647L585 609L588 572L598 543L560 553Z',{x:553,y:502,w:115,h:178}],
 ['M433 385L452 377L494 384L506 395L505 380H565L552 397L590 378L625 378L629 398L614 442L598 474L574 502L547 505L532 480L517 505L494 501L465 486L448 452L436 420Z',{x:433,y:377,w:196,h:128}],
 ['M872 292L915 277L964 275L1006 278L1068 299L1073 375L1036 399L879 392Z',{x:872,y:275,w:201,h:124}],
 ['M1000 460H1139V598H1000Z',{x:1000,y:460,w:139,h:138}],
 ['M750 460H995V620H750Z',{x:750,y:460,w:245,h:160}],
] as const;
export const cycles=[['egg','larva','pupa','adult'],['egg','caterpillar','chrysalis','adult'],['egg','nymph','adult']] as const;
export const boxes:Box[]=cycles.flatMap((row,i)=>row.map((_,j)=>({x:row.length===4?45+j*290:80+j*405,y:[30,325,620][i]!,w:230,h:220})));
export function assertCycles():void {assert.deepEqual(cycles.map(c=>c.length),[4,4,3]);assert.equal(specimens.length,11);assert.equal(boxes.length,11);assertLayout(boxes);for(const c of cycles){const edges=c.map((_,i)=>[i,(i+1)%c.length]);assert.equal(edges.length,c.length);assert(edges.every(([a,b])=>b===(a!+1)%c.length));assert(!edges.some(([a,b])=>edges.some(([c,d])=>a===d&&b===c)));}}
/** Keep the largest connected specimen, rejecting separate old arrow/leaf fragments.
 * Eight-neighbour connectivity preserves diagonal antennae and legs. */
async function isolate(outline:string,cut:string|undefined,box:{x:number;y:number;w:number;h:number}):Promise<string>{
 const drawing=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><mask id="m" maskUnits="userSpaceOnUse" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}">${path(outline,'white','none')}${cut?path(cut,'black','none'):''}</mask><image href="${source('mosquito-three-life-cycles')}" width="1200" height="900" mask="url(#m)"/></svg>`;
 const {data,info}=await sharp(Buffer.from(drawing)).extract({left:box.x,top:box.y,width:box.w,height:box.h}).ensureAlpha().raw().toBuffer({resolveWithObject:true}),labels=new Int32Array(info.width*info.height),sizes=[0];let label=0;
 for(let k=0;k<labels.length;k++){if(labels[k]||data[k*4+3]!<=8)continue;label++;const queue=[k];labels[k]=label;for(let n=0;n<queue.length;n++){const p=queue[n]!,x=p%info.width,y=Math.floor(p/info.width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,q=yy*info.width+xx;if(xx<0||xx>=info.width||yy<0||yy>=info.height||labels[q]||data[q*4+3]!<=8)continue;labels[q]=label;queue.push(q);}}sizes.push(queue.length);}
 const keep=sizes.indexOf(Math.max(...sizes));assert(keep>0);
 for(let k=0;k<labels.length;k++){if(labels[k]===keep)continue;const x=k%info.width,y=Math.floor(k/info.width);let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<info.width&&yy>=0&&yy<info.height&&labels[yy*info.width+xx]===keep)near=true;}if(!near)data[k*4+3]=0;}
 return 'data:image/png;base64,'+(await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer()).toString('base64');
}
export async function cyclesSvg():Promise<string> {
 let idx=0,body='';for(const [row,stages] of cycles.entries()){
  const rowBoxes=boxes.slice(idx,idx+stages.length);
  for(const [j,b] of rowBoxes.entries()){
   const [outline,box]=specimens[idx]!,scale=Math.min(b.w/box.w,b.h/box.h),x=b.x+(b.w-box.w*scale)/2,y=b.y+(b.h-box.h*scale)/2;
   const cuts:Record<number,string>={0:'M202 270H216V328H202ZM315 270H338V328H315Z',2:'M205 567H224V596H205ZM326 565H346V601H326Z',3:'M155 513H178V550H155Z',9:'M1080 460H1140V499H1098L1080 489ZM1044 580L1071 569V609H1044Z',10:'M815 460H850V483L840 511L825 507ZM920 613H995V635H920Z'};
   const specimen=await isolate(outline,cuts[idx],box);
   body+=`<image href="${specimen}" x="${x}" y="${y}" width="${box.w*scale}" height="${box.h*scale}"/>`;
   if(j<rowBoxes.length-1)body+=arrow([[b.x+b.w+10,b.y+110],[rowBoxes[j+1]!.x-12,b.y+110]],2.8);
   idx++;
  }
  const first=rowBoxes[0]!,last=rowBoxes.at(-1)!,yy=[285,580,875][row]!;
  body+=arrow([[last.x+115,last.y+225],[last.x+115,yy],[first.x+115,yy],[first.x+115,first.y+225]],2.8);
 }
 return svg(body);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertCycles();await writePlate('public/illustrations/figures/mosquito-three-life-cycles.webp',await cyclesSvg());}
