/** Actual production meshes, before/after and each visible beat. No GPU estimates. */
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {parse} from 'yaml';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {evaluateSim} from '../../../src/engines/space-scene/lib/sim';
import {simEffects} from '../../../src/engines/space-scene/lib/sim/bind';
import {resolveSimValues} from '../../../src/engines/space-scene/lib/sim/controls';
const dir='src/content/topics/sound';
const input=process.argv[2]??`${dir}/data/parts.json`;
const d=partsFile.parse(JSON.parse(readFileSync(input,'utf8')));
const parts=d.parts.map(p=>{
 const pieces=partPieces(p);
 const triangles=pieces.reduce((n,q)=>n+(q.lines?0:(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3)*(q.matrices?.length??1),0);
 pieces.forEach(q=>q.geometry.dispose());return {id:p.id,triangles,pieces:pieces.length};
});
const beats=readdirSync(`${dir}/chapters`).filter(f=>f.endsWith('.mdx')).sort().flatMap(name=>{
 const c=parse(readFileSync(`${dir}/chapters/${name}`,'utf8').split(/^---$/m)[1]!);
 return c.state.beats.map((b:any,i:number)=>{
  const s={...c.state,...b},v=resolveSimValues(d.sim!,{...c.state.sim.set,...b.sim.set}),fx=simEffects(d.sim!,v,evaluateSim(d.sim!,v));
  const shown=new Set(d.parts.filter(p=>(!p.group||s.layers.includes(p.group))&&!s.hide.includes(p.id)&&!fx.hidden.has(p.id)).map(p=>p.id));
  return {chapter:c.id,beat:i+1,triangles:parts.filter(p=>shown.has(p.id)).reduce((a,p)=>a+p.triangles,0)};
 });
});
const result={input,total:parts.reduce((n,p)=>n+p.triangles,0),parts,beats,maxBeat:beats.reduce((a:any,b:any)=>a.triangles>b.triangles?a:b),note:'Structural triangles incl context; excludes dynamic wave/pulse overlays, shadows and ground. All authored parts simultaneously is a conservative upper bound.'};
if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
