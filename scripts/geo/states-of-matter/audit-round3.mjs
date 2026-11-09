/** Round 3 audit compares the actual shipping mesh to the committed acceptance
 * baseline snapshot, including accepted tissue and wood material route. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
const root='scripts/geo/states-of-matter/evidence',candidate=!!process.env.ATLAS_CANDIDATE,path=candidate?'/private/tmp/states-of-matter-candidate.glb':'public/models/states-of-matter.glb';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const baselineBytes=process.env.ATLAS_R3_BASELINE?fs.readFileSync(process.env.ATLAS_R3_BASELINE):execFileSync('git',['show','6740205a:public/models/states-of-matter.glb'],{maxBuffer:4000000});
const [before,after]=await Promise.all([io.readBinary(new Uint8Array(baselineBytes)),io.read(path)]);await before.transform(dequantize());await after.transform(dequantize());
const mat=m=>[m.getBaseColorFactor(),m.getRoughnessFactor(),m.getMetallicFactor(),m.getAlphaMode(),m.getDoubleSided(),m.getExtras()];
const preserved=[];for(const a of before.getRoot().listNodes()){
 const mesh=a.getMesh();if(!mesh||['sponge','ice-cube'].includes(a.getName()))continue;
 const b=after.getRoot().listNodes().find(n=>n.getName()===a.getName());assert.ok(b);assert.deepEqual(b.getWorldMatrix(),a.getWorldMatrix());
 for(const [i,p]of mesh.listPrimitives().entries()){const q=b.getMesh().listPrimitives()[i];assert.deepEqual(q.getIndices().getArray(),p.getIndices().getArray(),`${a.getName()}: topology`);assert.deepEqual(mat(q.getMaterial()),mat(p.getMaterial()),`${a.getName()}: source finish`);for(const s of p.listSemantics())assert.deepEqual(q.getAttribute(s).getArray(),p.getAttribute(s).getArray(),`${a.getName()}: ${s}`);}
 preserved.push(a.getName());
}
const raw=JSON.parse(fs.readFileSync(candidate?'scripts/geo/states-of-matter/evidence/candidate-parts.json':'src/content/topics/states-of-matter/data/parts.json')),old=JSON.parse(execFileSync('git',['show','6740205a:src/content/topics/states-of-matter/data/parts.json'],{encoding:'utf8',maxBuffer:1000000}));
assert.deepEqual(raw,old,'Part ids, counts, teaching text, material tints, poses, flows, chapters and framing contract');
const sponge=after.getRoot().listMeshes().find(m=>m.getName()==='sponge').listPrimitives()[0],ice=after.getRoot().listMeshes().find(m=>m.getName()==='ice-cube').listPrimitives()[0];
assert.ok(sponge.getIndices().getCount()/3<=35000,'Sponge <=35k triangles');assert.equal(ice.getMaterial().getRoughnessFactor(),.04);
assert.equal(ice.getMaterial().getAlphaMode(),'BLEND');assert.equal(ice.getAttribute('COLOR_0').getType(),'VEC4');
const c=ice.getAttribute('COLOR_0'),alpha=Array.from({length:c.getCount()},(_,i)=>c.getElement(i,[0,0,0,0])[3]);assert.ok(alpha.some(a=>a>.20&&a<.24),'Actual decoded face alpha');assert.ok(alpha.some(a=>a>.55&&a<.66),'Actual decoded edge alpha');
const proof=JSON.parse(fs.readFileSync(`${root}/sponge-passages.json`)),diam=proof.structure.mouths.filter(m=>m.axis===1&&m.sign>0).map(m=>m.diameter);assert.ok(diam.length>=285&&diam.length<=320);assert.ok(diam.filter(d=>d>=.001&&d<.002).length/diam.length>=.58);assert.ok(diam.filter(d=>d>=.002&&d<.004).length/diam.length>=.28);assert.ok(diam.filter(d=>d>=.004&&d<=.007).length/diam.length>=.08);
const bytes=fs.readFileSync(path);assert.ok(bytes.length<=1500000,`GLB ${bytes.length} >1.5MB`);
const counts=doc=>Object.fromEntries(doc.getRoot().listMeshes().map(m=>[m.getName(),{triangles:m.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0),draws:m.listPrimitives().length}]));
const result={passed:true,acceptedAndStaticMeshesPreserved:preserved,allPartDataIdentical:true,before:{glbBytes:baselineBytes.length,meshes:counts(before)},after:{glbBytes:bytes.length,meshes:counts(after)},sponge:proof.structure,glbSha256:createHash('sha256').update(bytes).digest('hex')};
fs.writeFileSync(`${root}/audit-round3.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,before:{glbBytes:result.before.glbBytes},after:{glbBytes:bytes.length},sponge:{...result.sponge,mouths:undefined,topDiameters:undefined}},null,2));
