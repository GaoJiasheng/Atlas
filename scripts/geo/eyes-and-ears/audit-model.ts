/** Offline draw-budget audit. Uses shipped triangles and the engine's actual
 * layer/hide/simulation resolution; no frustum culling or clipping savings.
 * pnpm tsx scripts/geo/eyes-and-ears/audit-model.ts [parts.json] [model.glb]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { parse } from 'yaml';
import { SphereGeometry, Vector3 } from 'three';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { resolvePartDisplay } from '../../../src/engines/space-scene/lib/visibility';
import { evaluateSim } from '../../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../../src/engines/space-scene/lib/sim/bind';

const root=resolve(import.meta.dirname,'../../..');
const topic=resolve(root,'src/content/topics/eyes-and-ears');
export async function auditModel(input=resolve(topic,'data/parts.json'),model?:string) {
  const file=partsFile.parse(JSON.parse(readFileSync(input,'utf8')));
  const doc=await new NodeIO().read(model??resolve(root,'public',file.model!.slice(1)));
  const byPart:Record<string,number>={},bounds:Record<string,{min:number[],max:number[]}>={},boneMm:Record<string,number>={};
  for(const part of file.parts) {
    const node=part.mesh?doc.getRoot().listNodes().find(n=>n.getName()===part.mesh):null;
    const mesh=node?.getMesh()?.listPrimitives()[0];
    if(mesh) {
      byPart[part.id]=(mesh.getIndices()?.getCount()??mesh.getAttribute('POSITION')!.getCount())/3;
      const a=mesh.getAttribute('POSITION')!,points:Vector3[]=[];
      for(let i=0;i<a.getCount();i++) {const v:number[]=[];a.getElement(i,v);points.push(new Vector3(v[0],v[1],v[2]));}
      bounds[part.id]={min:[0,1,2].map(k=>Math.min(...points.map(p=>p.getComponent(k)))),max:[0,1,2].map(k=>Math.max(...points.map(p=>p.getComponent(k))))};
      if(['malleus','incus','stapes'].includes(part.id)) {
        let span=0;for(let i=0;i<points.length;i+=3) for(let j=i+1;j<points.length;j+=3) span=Math.max(span,points[i]!.distanceToSquared(points[j]!));
        boneMm[part.id]=Math.sqrt(span)/.052;
      }
    } else {
      const pieces=partPieces(part);let n=0;const points:Vector3[]=[];
      for(const p of pieces) {
        n+=(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1);
        const a=p.geometry.getAttribute('position');
        for(const m of p.matrices??[null]) for(let i=0;i<a.count;i++) {
          const v=new Vector3().fromBufferAttribute(a,i);if(m) v.applyMatrix4(m);v.add(new Vector3(...part.primitive!.at));points.push(v);
        }
        p.geometry.dispose();
      }
      byPart[part.id]=n;bounds[part.id]={min:[0,1,2].map(k=>Math.min(...points.map(p=>p.getComponent(k)))),max:[0,1,2].map(k=>Math.max(...points.map(p=>p.getComponent(k))))};
    }
  }
  const sphere=new SphereGeometry(1,12,10),sphereTriangles=sphere.index!.count/3;sphere.dispose();
  const beats=[];
  for(const name of readdirSync(resolve(topic,'chapters')).filter(n=>n.endsWith('.mdx')).sort()) {
    const chapter=parse(readFileSync(resolve(topic,'chapters',name),'utf8').split(/^---$/m)[1]!);
    const s=chapter.state;
    for(const [i,b] of s.beats.entries()) {
      const sim=file.sim!,values=resolveSimValues(sim,{...s.sim.set,...b.sim?.set});
      const fx=simEffects(sim,values,evaluateSim(sim,values));
      const state={...s,...b,hidden:[...(b.hide??s.hide??[]),...fx.hidden]};
      const visible=file.parts.filter(p=>resolvePartDisplay(p,state,file.parts).visible);
      const surfaces=visible.reduce((n,p)=>n+byPart[p.id]!,0);
      const shadow=visible.filter(p=>p.castShadow===true).reduce((n,p)=>n+byPart[p.id]!,0);
      // Conservative: both transparent sphere passes, even when the condition
      // would switch an overlay off. Lines/point-sprite flows add no triangles.
      const overlays=state.layers.includes('study-bench')&&state.view!=='exploded'?(41+2)*sphereTriangles*2:0;
      beats.push({chapter:chapter.id,beat:i+1,parts:visible.map(p=>p.id),surfaces,shadow,overlays,drawnUpperBound:surfaces+shadow+overlays+4});
    }
  }
  const total=Object.values(byPart).reduce((a,b)=>a+b,0);
  const aperture=Math.min(byPart['iris-aperture-small']!,byPart['iris-aperture-large']!);
  const shadow=file.parts.filter(p=>p.castShadow===true).reduce((n,p)=>n+byPart[p.id]!,0);
  return {kind:'Offline architecture bound, not renderer.info or FPS',totalTriangles:total,byPart,bounds,boneMm,
    peakBeat:beats.reduce((a,b)=>a.drawnUpperBound>b.drawnUpperBound?a:b),
    // Stronger than all 40 authored states; includes ALL layers, one active iris,
    // both study overlays and an extra shadow pass, with zero culling savings.
    allLayersDrawnUpperBound:total-aperture+shadow+(41+2)*sphereTriangles*2+4,
    // Both iris inserts may briefly draw during an aperture crossfade.
    transitionDrawnUpperBound:total+shadow+(41+2)*sphereTriangles*2+4,
    simplification:doc.getRoot().listNodes().map(n=>({id:n.getName(),sourceTriangles:Number(n.getExtras().sourceTriangles),triangles:Number(n.getExtras().triangles),simplificationError:Number(n.getExtras().simplificationError)})),beats};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  process.stdout.write(JSON.stringify(await auditModel(process.argv[2],process.argv[3]),null,2)+'\n');
}
