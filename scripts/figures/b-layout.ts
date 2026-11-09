/** Shared offline composition tools for the docs/69 B plates. No image model involved. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ellipse, etched, f, line, path, type Point } from './graphite';
export const source = (id:string) => 'data:image/png;base64,'+readFileSync(new URL(`./materials/b-review/${id}-source.png`,import.meta.url)).toString('base64');
export type Box = {x:number;y:number;w:number;h:number};
export function assertLayout(boxes:Box[], minimum=114):void {
 for(const b of boxes){assert(b.x>=20&&b.y>=20&&b.x+b.w<=1180&&b.y+b.h<=880);assert(Math.min(b.w,b.h)>=minimum,`key specimen below 40 px at 420: ${JSON.stringify(b)}`);}
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'overlapping specimens');}
 const xs=boxes.flatMap(b=>[b.x,b.x+b.w]),ys=boxes.flatMap(b=>[b.y,b.y+b.h]);assert(Math.max(...xs)-Math.min(...xs)>=720);assert(Math.max(...ys)-Math.min(...ys)>=540);
}
export function arrow(points:Point[],width=3):string {
 const a=points.at(-2)!,b=points.at(-1)!,ang=Math.atan2(b[1]-a[1],b[0]-a[0]),n=14;
 return line(points,'#555555',width)+path(`M${f(b[0])} ${f(b[1])}L${f(b[0]-n*Math.cos(ang-.45))} ${f(b[1]-n*Math.sin(ang-.45))}L${f(b[0]-n*Math.cos(ang+.45))} ${f(b[1]-n*Math.sin(ang+.45))}Z`,'#555555','none');
}
export function crop(id:string,clip:string,sourceBox:Box,target:Box):string {
 const scale=Math.min(target.w/sourceBox.w,target.h/sourceBox.h),dx=target.x+(target.w-sourceBox.w*scale)/2,dy=target.y+(target.h-sourceBox.h*scale)/2;
 return `<g transform="translate(${dx} ${dy}) scale(${scale}) translate(${-sourceBox.x} ${-sourceBox.y})"><clipPath id="${clip}">${path(`M${sourceBox.x} ${sourceBox.y}h${sourceBox.w}v${sourceBox.h}h${-sourceBox.w}Z`,'white','none')}</clipPath><image href="${source(id)}" width="1200" height="900" clip-path="url(#${clip})"/></g>`;
}
export const rect=(x:number,y:number,w:number,h:number,fill='url(#wood)')=>etched(`M${x} ${y}h${w}v${h}h${-w}Z`,fill);
export const pin=(p:Point,r=18)=>ellipse(p[0],p[1],r,r,'url(#metal)','#494949',1.5)+ellipse(p[0],p[1],r*.45,r*.45,'url(#dark)','#666666',1);
