/** Decoded-runtime counts and preservation audit for this residual batch. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parse} from 'yaml';
import {resolveAllPartDisplays} from '../../../src/engines/space-scene/lib/visibility.ts';
import {io,evidence} from '../kits/residual-polish.mjs';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces,eachPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
const codec=await io(),changed={plant:['leaf-section'],grasshopper:Array.from({length:6},(_,i)=>'nymph-'+(i+1)),forces:['paper-crumpled'],'how-planes-fly':['fuselage-shell','cockpit-glazing'],aircon:['inverter-board'],'b200-server':['gpu-heatsinks'],'container-port':['quay-context'],'living-things':['fruit-bat']},result={};
const hashNode=node=>{const h=createHash('sha256');h.update(JSON.stringify(node.getWorldMatrix()));for(const p of node.getMesh()?.listPrimitives()??[])for(const [s,a]of [['indices',p.getIndices()],...p.listSemantics().sort().map(s=>[s,p.getAttribute(s)])]){h.update(s);let v=a.getArray();if(s==='indices'){v=new Uint32Array(v);for(let i=0;i<v.length;i+=3){const q=[v[i],v[i+1],v[i+2]],k=[0,1,2].sort((a,b)=>q[a]-q[b]||q[(a+1)%3]-q[(b+1)%3]||q[(a+2)%3]-q[(b+2)%3])[0];v.set([q[k],q[(k+1)%3],q[(k+2)%3]],i);}}h.update(Buffer.from(v.buffer,v.byteOffset,v.byteLength));}return h.digest('hex');};
for(const [slug,ids]of Object.entries(changed)){
 const entry={};const signatures=[];
 for(const stage of ['before','after']){
  const raw=JSON.parse(fs.readFileSync(stage==='before'?`${evidence}/before/${slug}/parts.json`:`src/content/topics/${slug}/data/parts.json`)),file=partsFile.parse(raw),doc=file.model?await codec.read(stage==='before'?`${evidence}/before/${slug}/${file.model.split('/').at(-1)}`:'public'+file.model):null,meshes=new Map(doc?.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>[n.getName(),n])??[]),parts={};
  signatures.push(new Map([...meshes].map(([id,n])=>[id,hashNode(n)])));
  for(const p of file.parts){let triangles=0,calls=0;if(p.mesh){const node=meshes.get(p.mesh);triangles=node.getMesh().listPrimitives().reduce((s,q)=>s+q.getIndices().getCount()/3,0);calls=1;}
   else{for(const q of file.animations?.some(a=>a.target===p.id&&a.each)?eachPieces(p):partPieces(p)){if(!q.lines)triangles+=(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1);calls++;q.geometry.dispose();}}
   parts[p.id]={triangles,calls};
  }
  const states=[];for(const name of fs.readdirSync(`src/content/topics/${slug}/chapters`).filter(n=>n.endsWith('.mdx'))){const c=parse(fs.readFileSync(`src/content/topics/${slug}/chapters/${name}`,'utf8').split('---')[1]),base=c.state;if(!base)continue;for(const [i,beat]of [base,...base.beats??[]].entries()){const state={...base,...beat,part:beat.part??base.part??null,hidden:beat.hide??base.hide??[],ghosted:beat.ghost??base.ghost??[]},visible=resolveAllPartDisplays(file.parts,state);let triangles=0,calls=0;for(const [id,d]of visible)if(d.visible){triangles+=parts[id].triangles;calls+=parts[id].calls;}states.push({chapter:c.id,beat:i,triangles,calls});}}
  entry[stage]={states,maxAuthoredTriangles:Math.max(...states.map(s=>s.triangles)),maxAuthoredCalls:Math.max(...states.map(s=>s.calls)),triangles:Object.values(parts).reduce((n,p)=>n+p.triangles,0),calls:Object.values(parts).reduce((n,p)=>n+p.calls,0),bytes:file.model?fs.statSync(stage==='before'?`${evidence}/before/${slug}/${file.model.split('/').at(-1)}`:'public'+file.model).size:0,parts};
 }
 const [a,b]=signatures;entry.changedMeshes=[...b].filter(([id,h])=>a.has(id)&&a.get(id)!==h).map(([id])=>id);entry.unexpectedMeshes=entry.changedMeshes.filter(id=>!ids.includes(id));if(entry.unexpectedMeshes.length)throw Error('Unrelated mesh edits '+slug+' '+entry.unexpectedMeshes);entry.preservedMeshes=[...a.keys()].filter(id=>!ids.includes(id)&&a.get(id)===b.get(id)).length;
 const old=JSON.parse(fs.readFileSync(`${evidence}/before/${slug}/parts.json`)),now=JSON.parse(fs.readFileSync(`src/content/topics/${slug}/data/parts.json`));
 for(const d of [old,now]){delete d.model;for(const p of d.parts)if(ids.includes(p.id)){for(const key of ['primitive','extra','mesh','material'])delete p[key];}}
 if(JSON.stringify(old)!==JSON.stringify(now))throw Error('Teaching/text/non-target part changed '+slug);
 if(slug==='grasshopper'){const path='scripts/geo/grasshopper/performance.json',perf=JSON.parse(fs.readFileSync(path));perf.after={...perf.after,parts:entry.after.parts,states:entry.after.states,inventoryTriangles:entry.after.triangles,inventoryCalls:entry.after.calls,glbBytes:entry.after.bytes,maxAuthoredTriangles:entry.after.maxAuthoredTriangles,maxAuthoredCalls:entry.after.maxAuthoredCalls};fs.writeFileSync(path,JSON.stringify(perf,null,2)+'\n');}
 result[slug]=entry;console.log(slug,entry.before.triangles,'→',entry.after.triangles,'triangles;',entry.before.bytes,'→',entry.after.bytes,'bytes;',entry.preservedMeshes,'other meshes exact');
}
fs.writeFileSync(evidence+'/metrics.json',JSON.stringify(result,null,2));if(Object.values(result).some(r=>r.after.maxAuthoredTriangles>350000||r.after.bytes>1500000))process.exitCode=1;
