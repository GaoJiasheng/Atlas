/** Shared delivery helpers; no browser, external rendering service or runtime dependency. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { etched, ellipse, line, path, pts, svg, writePlate, type Point } from './graphite.js';
export { etched, ellipse, line, path, pts, svg, type Point };
export const PREVIEW = resolve(process.env.ATLAS_CD_PREVIEW ?? '/tmp/atlas-redo-cd');
export const poly = (p: readonly Point[], fill='#dedede', stroke='#555555', width=1.3) => etched(`M${pts(p)}Z`,fill,stroke,width);
export const arrow = (a:Point,b:Point,width=4) => {
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,s=18;
 return line([a,b],'#555555',width)+path(`M${b[0]-ux*s-uy*s*.5} ${b[1]-uy*s+ux*s*.5}L${b[0]} ${b[1]}L${b[0]-ux*s+uy*s*.5} ${b[1]-uy*s-ux*s*.5}`,'none','#555555',width);
};
export const sectionDefs = `<defs><pattern id="section" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V13" stroke="#777" stroke-width="1.1"/></pattern></defs>`;
export async function deliver(id:string,body:string,extra='',width=1200,height=900) {
 mkdirSync(`${PREVIEW}/svg`,{recursive:true});
 const source=svg(body,width,height,sectionDefs+extra);
 if (/<text\b|<image\b/.test(source)) throw new Error(`${id}: text or untracked raster in plate`);
 writeFileSync(`${PREVIEW}/svg/${id}.svg`,source);
 await writePlate(`public/illustrations/figures/${id}.webp`,source);
}
export const main = (url:string) => process.argv[1] !== undefined && pathToFileURL(resolve(process.argv[1])).href===url;
