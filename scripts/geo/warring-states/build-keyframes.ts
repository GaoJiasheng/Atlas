/** Compose recipes from registered published-map areas. No invented geographic edges.
 * G9 has no boundary geometry; G10 is the approved alternate period schematic.
 */
import{readFileSync}from'node:fs';import{writeJson}from'../lib/common';
import type {GeomSpec} from '../lib/manifest';
import {required} from './strict-input';
const d='scripts/geo/warring-states',m=JSON.parse(readFileSync(`${d}/sources.json`,'utf8'));
const n:Record<string,string>={qin:'秦',jin:'晋',yan:'燕',qi:'齐',lu:'鲁',zhou:'周',zheng:'郑',wey:'卫',cao:'曹',song:'宋',chen:'陈',cai:'蔡',chu:'楚',wu:'吴',yue:'越',ba:'巴',shu:'蜀',han:'韩',wei:'魏',zhao:'赵',zhongshan:'中山',ju:'莒'};
const ras=(id:string,h:string)=>({raster:id,class:h});const svg=(h:string)=>({svg:'G3-network',class:h});
const chineseLabel=(holder:string,label?:string):string=>{
 const state=required(n[holder], `${holder} Chinese name`);
 if(label?.includes('(later Xinzheng seat)'))return state+'（后来的新郑都城位置）';
 if(label?.includes('(Chuqiu)'))return state+'（楚丘）';
 if(label?.includes('(former Wu lands)'))return state+'（原吴国地区）';
 if(label?.includes('(residual; inferred)'))return state+'（剩余地区；推定）';
 if(label?.includes('(280 BCE extent)'))return state+'（前280年范围）';
 if(label==='QIN EMPIRE (schematic union)')return '秦帝国（示意合并）';
 return state;
};
const st=(holder:string,from:GeomSpec,src:string[],note:string,label?:string)=>({holder,from,src,note,label:{en:label??holder.toUpperCase(),zh:chineseLabel(holder,label)}});
const key=(id:string,t:string,steps:ReturnType<typeof st>[],method:string,source:string)=>({id,t,steps,method,checks:[{name:method,center:[113,33],zoom:3.9,source}]});
const early=['qin','jin','yan','qi','wey','lu','ju','song','zhou','zheng','chu','wu','yue','ba'];
const earlySteps=(year:number)=>early.map(h=>st(h,ras('G10',h),['G10','G9'],`Undated published period schematic projected to ${year} BCE; broad extent retained; smaller annexed states have no individual source polygons.`,h.toUpperCase()+(h==='zheng'&&year===770?' (later Xinzheng seat)':h==='wey'&&year<=650?' (Chuqiu)':'')));
const mid=['qin','jin','yan','qi','lu','zhou','zheng','wey','cao','song','chen','cai','chu','wu'];
const midSteps=mid.map(h=>st(h,svg(h),['G3'],'Exact published fifth-century vector border paths; 1 km snapping, gaps closed within 40 km; modern NE shore used for coastal closure.'));
// Secondary period map supplies bounded minor states omitted by G3. Later steps
// override earlier fills; all outer edges still come from one of the source maps.
for(const h of ['ba','ju','yue'])midSteps.push(st(h,ras('G10',h),['G10'],'Bounded source G10 component supplements fifth-century map; date is approximate.'));
const later=midSteps.map(s=>{const old=s.holder,newHolder=old==='wu'?'yue':old==='chen'?'chu':old==='cao'?'song':old;return st(newHolder,s.from,[...s.src,'S1','S2'],`Whole-source-state reassignment: Wu→Yue 473 BCE; Chen→Chu 479 BCE; Cao→Song 487 BCE. No boundary redrawn.`,old==='wu'?'YUE (former Wu lands)':undefined);});
const jinSplit=later.filter(s=>s.holder!=='jin').map(s=>s.holder==='cai'||s.holder==='ju'?st('chu',s.from,[...s.src,'S1'],`Whole-state annexation: Cai 447 BCE; Ju 431 BCE.`):s);
const trio=['han','zhao','wei'];
const splitGeom:GeomSpec[]=trio.map(h=>({intersect:[svg('jin'),ras('G7',h)]}));
// Residual Jin geometry is retained rather than a fabricated enclave around a city.
jinSplit.push(st('jin',{difference:[svg('jin'),{union:splitGeom}]},['G3','G7'],'Remainder outside borrowed 350 BCE Three Jin source classes; not a reconstruction of the exact 403 BCE ducal domain.','JIN (residual; inferred)'));
trio.forEach((h,i)=>jinSplit.push(st(h,required(splitGeom[i], `${h} borrowed geometry`),['G3','G7','S1','S9'],'403 BCE recognition; internal division borrowed from 350 BCE source and clipped to fifth-century Jin outline.',h.toUpperCase())));
const seven=['qin','zhao','wei','han','qi','chu','yan','yue','song','lu','wey','zhongshan'];
const k7=seven.map(h=>st(h,ras('G7',h),['G7'],'Original-pixel colour outline digitization of published 350 BCE map; tiny royal-house symbols are not treated as territorial polygons.'));
const eight=['qin','zhao','wei','han','qi','chu','yan','lu','wey'];
const k8=eight.map(h=>st(h,ras('G8',h),['G8'],'Original-pixel digitization of published 280 BCE map. Qi tint follows source; extent of Yan occupation is not separable in its palette.'));
// G11 exceeds the registration budget. Do not use its geometry for K9–K11.
// G8 supplies a conservative, explicitly dated carry-forward; no 260 BCE gains
// or shrinking state outlines are inferred from labels or unregistered maps.
const k9=eight.map(h=>st(h,ras('G8',h),['G8'],
 '280 BCE source extent carried forward to 260 BCE; not a reconstruction of intervening territorial changes. G11 is excluded because its registration exceeds budget. Zhou has no bounded G8 face and is omitted.',
 h.toUpperCase()+' (280 BCE extent)'));
const k10=k9.map(s=>st(s.holder==='han'?'qin':s.holder==='lu'?'chu':s.holder,s.from,[...s.src,'S1'],
 'Whole-source-state reassignment: Han→Qin 230 BCE; Lu→Chu 256 BCE. Remaining geometry is the 280 BCE G8 extent, not a 230 BCE boundary reconstruction. No Qin commandery gains are traced; failed or insufficient G11/G13/G15/G16/G17 registrations are excluded.'));
const k11=[st('qin',{union:k10.map(s=>s.from)},['G8','S1'],
 'Union of represented G8-derived state extents after the six kingdoms were annexed. This is a schematic union of 280 BCE geography, not the Qin imperial boundary in 221 BCE. No Lingnan, northern steppe or unbounded Yue addition is supplied. Wey’s dependent ruling house survived until 209 BCE; this fill does not date its abolition.',
 'QIN EMPIRE (schematic union)')];
m.keyframes=[key('K1','-0770',earlySteps(770),'G10 undated period schematic; inference, not year-exact borders','G10'),key('K2','-0650',earlySteps(650),'Same G10 period geometry; minor annexation shapes unavailable','G10'),key('K3','-0600',earlySteps(600),'Same G10 period geometry; early expansions not reconstructed','G10'),key('K4','-0500',midSteps,'G3 vector border network + bounded G10 minor-state components','G3'),key('K5','-0473',later,'Whole-state annexations from K4 geometry; inferred','G4'),key('K6','-0403',jinSplit,'Three Jin divisions borrowed from 350 BCE; inferred','G7'),key('K7','-0350',k7,'G7 published 350 BCE state outlines','G7'),key('K8','-0280',k8,'G8 published 280 BCE state outlines','G8'),key('K9','-0260',k9,'G8 280 BCE extent carried forward; 260 BCE changes not reconstructed','G8'),key('K10','-0230',k10,'G8 carry-forward with Han/Lu whole-state reassignment; inferred','G8'),key('K11','-0221',k11,'Union of G8-derived represented state extents; inferred','G8')];
m.pipeline.compose={lightM:100,sliverKm2:1};m.pipeline.clean={snapDeg:.001,sliverKm2:.5};m.pipeline.islandsKm2={focus:1,coarse:5};m.pipeline.coast={...m.pipeline.coast,enabled:false,gapKm:6,detailLand:null,detailBox:null,land:'public/geo/warring-states-region.json',worldBox:[100,20,125,44]};
writeJson(`${d}/sources.json`,m,true);
console.log('Prepared 11 source-based recipes; source gaps remain explicit.');
