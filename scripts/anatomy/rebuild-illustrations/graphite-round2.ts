/** Graphite engraving from studio-lit native surface geometry; no painted anatomy. */
import sharp from 'sharp';
const dir='scripts/anatomy/rebuild-illustrations';
const topics=process.argv[2]?[process.argv[2]]:['arms','back','chest','core','legs','shoulders'];const revision=Number(process.argv[3]??21);
const frames:Record<string,{target:number;size:number}>={arms:{target:1.13,size:1.08},back:{target:1.23,size:.80},chest:{target:1.32,size:.62},core:{target:1.075,size:.54},legs:{target:.49,size:1.10},shoulders:{target:1.35,size:.78}};
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const bg=(a:Buffer,i:number)=>a[i]===233&&a[i+1]===228&&a[i+2]===216;
for(const topic of topics){const f=frames[topic]!,{data:a,info}=await sharp(`${dir}/review/muscles-${topic}-studio-r${revision}.png`).raw().toBuffer({resolveWithObject:true}),b=await sharp(`${dir}/review/muscles-${topic}-skin-r${revision}.png`).raw().toBuffer(),W=info.width,H=info.height;
const d=new Float32Array(W*H),mask=new Uint8Array(W*H),muscle=new Uint8Array(W*H),out=Buffer.alloc(W*H*4);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,k=i*3,Y=f.target+(H/2-y)*f.size/H,X=Math.abs((x-W/2)*f.size/W);if(bg(b,k))continue;mask[i]=1;muscle[i]=Number(!bg(a,k));
 // Neck/head and complete hands/feet use contour-only context, never facial detail.
 const outline=Y>1.465||Y<.80&&X>.22||Y<.105;
 d[i]=outline?0:muscle[i]?Math.max(0,Math.min(.86,(247-(a[k]!*.22+a[k+1]!*.68+a[k+2]!*.10))/218)):.018;
}
// Native posterior midline sheets are not a visible vertebral column.
if(['back','shoulders'].includes(topic)){const copy=d.slice();for(let y=0;y<H;y++){const Y=f.target+(H/2-y)*f.size/H;if(Y<.92||Y>1.46)continue;const mid=W/2,span=Math.round(.007*W/f.size);for(let x=mid-span;x<=mid+span;x++){const w=1-Math.abs(x-mid)/(span+1);d[y*W+x]=copy[y*W+x]!*(1-w)+(copy[y*W+mid-span-2]!+copy[y*W+mid+span+2]!)*.5*w;}}}
for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=y*W+x,k=i*4;if(!mask[i])continue;const Y=f.target+(H/2-y)*f.size/H,X=Math.abs((x-W/2)*f.size/W),outline=Y>1.465||Y<.80&&X>.22||Y<.105;
 const edge=!mask[i-1]||!mask[i+1]||!mask[i-W]||!mask[i+W],shade=d[i]!,gradient=Math.max(Math.abs(shade-d[i-1]!),Math.abs(shade-d[i+1]!),Math.abs(shade-d[i-W]!),Math.abs(shade-d[i+W]!));
 const xj=x+Math.sin(y*.047)*.6;
 const hatch=!outline&&muscle[i]&&((xj+y*1.68)%13<.8&&shade>.12||(xj*1.9-y+8000)%21<.7&&shade>.40);
 // No interior fill in outline context. No detached second silhouette around native surfaces.
 let ink=outline?(edge?.53:0):Math.min(.83,shade*.91+Math.min(.32,gradient*.8)+(hatch?.11:0));
 const sideFade=['core','chest'].includes(topic)?1-smooth(topic==='core'?.185:.25,topic==='core'?.22:.30,X):1;
 const borderFade=sideFade*smooth(0,.018,Math.min(x,W-1-x,y,H-1-y)*f.size/W);
 const neckFade=1-smooth(1.51,1.575,Y),lowFade=topic==='legs'?smooth(-.025,.025,Y):smooth(f.target-f.size*.49,f.target-f.size*.42,Y);
 if(!muscle[i]&&!outline&&edge)ink=0;
 if(ink<.012)continue;out[k]=out[k+1]=out[k+2]=64;out[k+3]=Math.round(Math.min(1,ink/.75)*255*borderFade*neckFade*lowFade);
}
const file=`${dir}/sources/muscles-${topic}-r${revision}.png`;await sharp(out,{raw:{width:W,height:H,channels:4}}).png().toFile(file);await sharp(file).flatten({background:'#e9e4d8'}).png().toFile(`${dir}/review/muscles-${topic}-paper-r${revision}.png`);console.log(file);}
