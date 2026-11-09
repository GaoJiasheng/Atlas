/** Offline geographic sanity checks in addition to the project's topology tests. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {feature} from 'topojson-client';
import {pointInPolygon} from '../lib/common';
import {ringIssues} from '../lib/rings';
import type {FeatureCollection,Polygon,MultiPolygon} from 'geojson';
const baselineCommit=JSON.parse(readFileSync('scripts/geo/ww2/licence-inventory-before.json','utf8')).baselineCommit as string;
const data=JSON.parse(readFileSync('src/content/topics/ww2/data/control.json','utf8'));
const frames: FeatureCollection[]=data.keyframes.map((k:any)=>feature(data.topology,data.topology.objects[k.object]) as unknown as FeatureCollection);
const fixtures:[number,string,number,number,string][]=[
[1,'London',-.128,51.507,'uk'],[1,'Berlin',13.405,52.52,'germany'],[1,'Beijing',116.397,39.907,'china'],
[2,'Beijing',116.397,39.907,'japan'],[2,'Shanghai',121.473,31.23,'japan'],
[5,'Sitia',26.05,35.07,'italy'],[6,'Sitia',26.05,35.07,'italy'],[8,'Sitia',26.05,35.07,'italy'],
[5,'Pskov',28.33,57.82,'germany'],[5,'Petrozavodsk',34.35,61.78,'finland'],[6,'Petrozavodsk',34.35,61.78,'finland'],
[5,'Moscow',37.62,55.75,'ussr'],[5,'Kyiv',30.524,50.45,'germany'],[5,'Athens',23.727,37.984,'italy'],[5,'Thessaloniki',22.944,40.641,'germany'],
[6,'Minsk',27.56,53.90,'germany'],[6,'Moscow',37.62,55.75,'ussr'],[6,'Singapore',103.82,1.35,'japan'],[6,'Batavia',106.83,-6.17,'japan'],
[8,'Kursk',36.19,51.74,'ussr'],[8,'Kharkov',36.23,50,'germany'],[8,'Leningrad',30.315,59.94,'ussr'],
[9,'Kyiv',30.524,50.45,'ussr'],[9,'Odessa',30.73,46.48,'ussr'],[9,'Warsaw',21.01,52.23,'germany'],[9,'Rome',12.496,41.903,'italy'],
[10,'Paris',2.352,48.857,'free-france'],[10,'Lublin',22.568,51.246,'poland'],[10,'Vienna',16.374,48.208,'germany'],
[11,'Berlin',13.405,52.52,'ussr'],[11,'Prague',14.437,50.075,'germany'],[11,'Oslo',10.752,59.914,'germany'],[11,'Vienna',16.374,48.208,'ussr'],[11,'Rome',12.496,41.903,'italy'],[11,'Chania',24.019,35.513,'germany'],
[12,'Singapore',103.82,1.35,'uk'],[12,'Harbin',126.64,45.76,'ussr'],[12,'Pyongyang',125.76,39.04,'ussr'],[12,'Seoul',126.978,37.566,'japan']];
const failures:string[]=[];
for(const [i,name,lng,lat,holder]of fixtures){const actual=frames[i-1]!.features.filter(f=>{const g=f.geometry as Polygon|MultiPolygon;return(g.type==='Polygon'?[g.coordinates]:g.coordinates).some(p=>pointInPolygon([lng,lat],p))}).map(f=>String(f.properties?.holder));if(!actual.includes(holder))failures.push(`K${i} ${name}: expected ${holder}, got ${actual.join(',')||'no coverage'}`);}
for(let i=0;i<frames.length;i++){const r=ringIssues(frames[i]!.features.flatMap(f=>{const g=f.geometry as Polygon|MultiPolygon;return g.type==='Polygon'?[g.coordinates]:g.coordinates}));if(r.zeroArea||r.selfCrossing)failures.push(`K${i+1} invalid rings: ${JSON.stringify(r)}`);}
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const unchanged=['topic.yaml',...readdirSync('src/content/topics/ww2/chapters').map(p=>'chapters/'+p),...['entities','events','glossary','presets'].map(p=>'data/'+p+'.json')];
for(const file of unchanged){const path='src/content/topics/ww2/'+file;assert.equal(hash(readFileSync(path)),hash(execFileSync('git',['show',baselineCommit+':' +path])),`Narrative/fact content changed: ${file}`);}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`WW2 map audit: ${fixtures.length} place/holder checks, 12 ring audits, ${unchanged.length} byte-identical narrative/config files.`);

const movementPath='src/content/topics/ww2/data/movements.json';
const oldMoves=JSON.parse(execFileSync('git',['show',baselineCommit+':' +movementPath],{encoding:'utf8'}));
const newMoves=JSON.parse(readFileSync(movementPath,'utf8'));
assert.equal(newMoves.length,oldMoves.length);
for(let i=0;i<newMoves.length;i++){
 const {path:oldPath,...oldFields}=oldMoves[i];const {path:newPath,...newFields}=newMoves[i];
 assert.deepEqual(newFields,oldFields,`Movement fact changed: ${newFields.id}`);
 if(!['barbarossa-n','barbarossa-c','barbarossa-s'].includes(newFields.id))assert.deepEqual(newPath,oldPath);
 else assert.notDeepEqual(newPath,oldPath,`Route was not independently redrawn: ${newFields.id}`);
}
console.log('31 movement IDs and all non-geometry facts preserved; only 3 BY-SA-derived paths replaced.');

const sourcePath='src/content/topics/ww2/data/sources.json';
const beforeSources=JSON.parse(execFileSync('git',['show',baselineCommit+':' +sourcePath],{encoding:'utf8'}));
const afterSources=JSON.parse(readFileSync(sourcePath,'utf8'));
assert.deepEqual(afterSources.sources.filter((s:any)=>s.id!=='S92'),beforeSources.sources.filter((s:any)=>s.id!=='S92'));
console.log('Only S92 bibliographic attribution updated (EN/ZH); numbered fact sources unchanged.');

const originalControl=JSON.parse(execFileSync('git',['show',baselineCommit+':src/content/topics/ww2/data/control.json'],{encoding:'utf8',maxBuffer:8*1024*1024}));
for(const k of originalControl.keyframes){
 const oldLabels=new Set(originalControl.topology.objects[k.object].geometries.filter((g:any)=>g.properties?.label).map((g:any)=>JSON.stringify(g.properties.label)));
 const currentLabels=new Set(data.topology.objects[k.object].geometries.filter((g:any)=>g.properties?.label).map((g:any)=>JSON.stringify(g.properties.label)));
 for(const label of oldLabels)assert(currentLabels.has(label),`${k.object} lost bilingual map label: ${label}`);
}
console.log('All original bilingual map labels retained in every keyframe.');
