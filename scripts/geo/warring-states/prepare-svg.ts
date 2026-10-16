/** Register published vector maps. Geometry is copied from source paths; never redrawn. */
import {writeFileSync} from 'node:fs';
import type {ControlPoint} from '../lib/manifest';
import {array, object, readJson, required, number} from './strict-input';
import {candidates,evaluate} from '../lib/fit';
const dir='scripts/geo/warring-states';
const manifest=object(readJson(`${dir}/sources.json`));
type AuditedPoint = ControlPoint & {coordinateSource: string};
const rawPoints: [string, [number, number], [number, number], string][] = [
 ['Yong (Fengxiang)',[107.39,34.52],[103.87,199.85],'https://en.wikipedia.org/wiki/Fengxiang_District'],
 ['Linzi',[118.35,36.86],[348.22,150.86],'https://en.wikipedia.org/wiki/Linzi_District'],
 ['Qufu',[116.99,35.58],[322.92,181.95],'https://en.wikipedia.org/wiki/Qufu'],
 ['Beijing (modern city dot)',[116.3975,39.9067],[317.74,79.08],'https://en.wikipedia.org/wiki/Beijing'],
 ['Shangqiu',[115.65,34.42],[293.09,210.41],'https://en.wikipedia.org/wiki/Shangqiu'],
 ['Ying (Jinancheng)',[112.19,30.34],[220.62,309.46],'https://en.wikipedia.org/wiki/Ying_(Chu)'],
 ['Shanghai',[121.47,31.23],[415.35,282.97],'https://en.wikipedia.org/wiki/Shanghai'],
 ['Tianjin',[117.2,39.13],[324.35,97.51],'https://en.wikipedia.org/wiki/Tianjin'],
 ['Wuhan',[114.3,30.6],[265.12,304.65],'https://en.wikipedia.org/wiki/Wuhan'],
 ['Nanjing',[118.8,32.06],[361.11,261.43],'https://en.wikipedia.org/wiki/Nanjing'],
 ['Zheng (Xinzheng)',[113.73,34.39],[254.40,217.49],'https://en.wikipedia.org/wiki/Xinzheng'],
 ['Jinan',[117.0,36.65],[326.45,148.64],'https://en.wikipedia.org/wiki/Jinan'],
 ['Gusu (Suzhou)',[120.58,31.3],[399.71,278.11],'https://en.wikipedia.org/wiki/Suzhou'],
 ["Xi’an",[108.94,34.26],[141.46,208.29],'https://en.wikipedia.org/wiki/Xi%27an'],
 ['Hangzhou',[120.15,30.27],[391.22,303.97],'https://en.wikipedia.org/wiki/Hangzhou'],
];
const cps: AuditedPoint[]=rawPoints.map(([name,lnglat,svg,coordinateSource])=>({name,lnglat,svg,coordinateSource}));
// Use the coordinate values actually read by the API/site audits, rather than
// implying extra precision for the draft's rounded municipality anchors.
const audited=object(object(object(readJson(`${dir}/coordinates-wikipedia.json`)).data).query).pages;
const matches:Record<string,string>={'Yong (Fengxiang)':'Fengxiang District','Qufu':'Qufu','Shangqiu':'Shangqiu','Shanghai':'Shanghai','Tianjin':'Tianjin','Wuhan':'Wuhan','Nanjing':'Nanjing','Zheng (Xinzheng)':'Xinzheng','Jinan':'Jinan','Gusu (Suzhou)':'Suzhou',"Xi’an": "Xi'an",'Hangzhou':'Hangzhou'};
for (const point of cps) {
 const page=Object.values(object(audited)).map(object).find(page=>page.title===matches[point.name]);
 if (page?.coordinates === undefined) continue;
 const coordinate=array(page.coordinates)[0];
 if (coordinate !== undefined) { const value=object(coordinate); point.lnglat=[number(value.lon),number(value.lat)]; }
}
const ying=required(cps.find(point=>point.name==='Ying (Jinancheng)'), 'Ying control');
ying.lnglat=[112+11/60+25.073/3600,30+24/60+20.599/3600];ying.coordinateSource='https://zh.wikipedia.org/wiki/楚纪南故城 (S205)';
const linzi=required(cps.find(point=>point.name==='Linzi'), 'Linzi control');
linzi.lnglat=[118+20/60+16.469/3600,36+53/60+23.122/3600];linzi.coordinateSource='https://zh.wikipedia.org/wiki/临淄齐国故城 (S206)';
const svg=manifest.svg === undefined ? {} : object(manifest.svg);
manifest.svg=svg;
svg.G3={dataset:'G3',projection:'auto',classes:{},land:['#a8c68f','#efebc0','#cab982','#aa8753'],sea:['#c6ecff'],maxResidualKm:40,controlPoints:cps};
svg.G5={...object(svg.G3),dataset:'G5',controlPoints:[],controlPointsFrom:'G3'};
for(const id of ['G3','G5']) {
 const results=candidates('auto',cps).map(candidate=>evaluate(candidate.proj,candidate.kind,cps)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);
 console.log(id,JSON.stringify(required(results[0], `${id} fit result`).report,null,2));
}
writeFileSync(`${dir}/sources.json`,JSON.stringify(manifest,null,2)+'\n');
