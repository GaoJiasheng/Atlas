import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {evaluate,type Projection} from '../lib/fit';
const require=createRequire(import.meta.url);const proj4=require(process.env.ATLAS_PROJ4_MODULE??'../.tools/node_modules/proj4');const p=import.meta.dirname;
const input=JSON.parse(readFileSync(`${p}/resume-register-anu1958-grid.json`,'utf8'));
const def='+proj=cass +lat_0=2.042583333333333 +lon_0=103.56275833333333 +x_0=411480 +y_0=274320 +ellps=evrst30 +units=m';
const proj:Projection={name:'Johore-printed-Everest-local',forward:(lng,lat)=>proj4('WGS84',def,[lng,lat]),inverse:(x,y)=>proj4(def,'WGS84',[x,y])};
const cps=input.controlPoints.map((c:any)=>({...c,lnglat:proj.inverse(c.gridYards[0]*.9144,c.gridYards[1]*.9144)}));const fits=(['affine','poly2']as const).map(k=>evaluate(proj,k,cps));
writeFileSync(`${p}/work/resume-register-anu1958-fit.json`,JSON.stringify({definition:def,qualification:'Internal grid scan fit only. No historical datum shift assumed; this is not WGS84 ground accuracy.',fits:fits.map(f=>f.report)},null,2)+'\n');console.log(fits.map(f=>({model:f.report.model,rmsM:f.report.rmsKm*1000,maxM:f.report.maxKm*1000,looRmsM:f.report.looRmsKm*1000,looMaxM:f.report.looMaxKm*1000})));
