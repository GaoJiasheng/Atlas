/** G16 printed Mercator axis fit plus six-ground-point translation.
 * External LOO54.74m RMS/72.87m max FAILS the30/60m requirement. */
import {readFileSync} from 'node:fs';
import type {Model} from '../lib/fit';
interface Report {
 internalAxisFits:{longitude:{coefficients:[number,number,number]};latitude:{coefficients:[number,number,number]}};
 externalTranslationFit:{translationMetres:[number,number]};
}
function make(shift:boolean):Model{
 const r=JSON.parse(readFileSync(`${import.meta.dirname}/resume-G16-graticule.json`,'utf8')) as Report;
 const cx=r.internalAxisFits.longitude.coefficients,cy=r.internalAxisFits.latitude.coefficients;
 const [dx,dy]=shift?r.externalTranslationFit.translationMetres:[0,0];
 const radius=6378137,rad=Math.PI/180;
 return {name:`G16 constrained printed Mercator graticule${shift?' +6-ground translation; external tolerance FAILED':''}`,toLngLat(x,y){
  const u=x/10000,v=y/10000;
  const east=cx[0]+u*cx[1]+v*cx[2]+dx,north=cy[0]+u*cy[1]+v*cy[2]+dy;
  return[east/radius/rad,(2*Math.atan(Math.exp(north/radius))-Math.PI/2)/rad];
 }};
}
export function buildG16NativeModel():Model{return make(false)}
export function buildG16Model():Model{return make(true)}
