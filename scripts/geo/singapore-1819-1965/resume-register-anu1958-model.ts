/** Native GSGS4923 scan model; its approximately40m external LOO remains FAILED.
 * This script helper is never imported by runtime content. */
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fitModel,type Model,type Projection} from '../lib/fit';
import type {ControlPoint} from '../lib/manifest';
const require=createRequire(import.meta.url);
const proj4=require(process.env.ATLAS_PROJ4_MODULE??'../.tools/node_modules/proj4');
const definition='+proj=cass +lat_0=2.042583333333333 +lon_0=103.56275833333333 +x_0=411480 +y_0=274320 +ellps=evrst30 +units=m';
export const nativeProjection:Projection={
 name:'Johore-printed-Everest-local',
 forward:(lng,lat)=>proj4('WGS84',definition,[lng,lat]) as [number,number],
 inverse:(x,y)=>proj4(definition,'WGS84',[x,y]) as [number,number],
};
export function buildNativeModel():Model{
 const input=JSON.parse(readFileSync(`${import.meta.dirname}/resume-register-anu1958-grid.json`,'utf8')) as {controlPoints:{name:string;svg:[number,number];gridYards:[number,number]}[]};
 const cps:ControlPoint[]=input.controlPoints.map(c=>({name:c.name,svg:c.svg,lnglat:nativeProjection.inverse(c.gridYards[0]*.9144,c.gridYards[1]*.9144)}));
 return fitModel(nativeProjection,'poly2',cps);
}
export function buildModel():Model{
 const native=buildNativeModel();
 const report=JSON.parse(readFileSync(`${import.meta.dirname}/resume-register-anu1958-fit-report.json`,'utf8')) as {reports:{set:string;gridPlusTranslation:{translationMetres:[number,number]}}[]};
 const chosen=report.reports.find(r=>r.set==='roads-only');
 if(!chosen)throw new Error('G35 roads-only translation report missing');
 const [dx,dy]=chosen.gridPlusTranslation.translationMetres;
 return {name:'G35 native Johore grid poly2 +19-road translation (external tolerance FAILED)',toLngLat(x,y){const a=native.toLngLat(x,y),b=nativeProjection.forward(a[0],a[1]);return nativeProjection.inverse(b[0]+dx,b[1]+dy)}};
}
