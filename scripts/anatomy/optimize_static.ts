/** Static anatomy: meshopt codec roundtrip, strict node/attribute/budget gates. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { type Document, type NodeIO } from '@gltf-transform/core';
import { weld, reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

export async function optimizeStatic(root: string, topic: string, io: NodeIO, document: Document, compression: any) {
  const cache=resolve(root,'cache');
  const manifest=JSON.parse(await readFile(resolve(root,topic,'manifest.json'),'utf8'));
  const frame=JSON.parse(await readFile(resolve(root,topic,'organs.json'),'utf8'));
  const expected=new Set<string>(manifest.expectedNodes);
  function verify(doc: Document) {
    const nodes=doc.getRoot().listNodes();
    if(nodes.length!==expected.size || new Set(nodes.map(n=>n.getName())).size!==expected.size) throw new Error('Static node count/uniqueness');
    if(doc.getRoot().listSkins().length || doc.getRoot().listAnimations().length) throw new Error('Static region has rig/animation');
    for(const n of nodes){
      if(!expected.has(n.getName()) || !n.getMesh() || n.getSkin())throw new Error(`Unexpected static node ${n.getName()}`);
      const role=n.getExtras().role;
      for(const p of n.getMesh()!.listPrimitives()){
        const pos=p.getAttribute('POSITION');if(!pos?.getArray())throw new Error('Missing positions');
        for(const s of ['JOINTS_0','WEIGHTS_0','_FIBRE'])if(p.getAttribute(s))throw new Error(`Static ${n.getName()} carries ${s}`);
        if(role==='tube'){
          const u=p.getAttribute('_U');if(!u || u.getCount()!==pos.getCount())throw new Error(`Missing tube _U: ${n.getName()}`);
          let lo=Infinity,hi=-Infinity;
          for(let i=0;i<u.getCount();i++){const x=u.getScalar(i);if(!Number.isFinite(x)||x<0||x>1)throw new Error('Invalid tube station');lo=Math.min(lo,x);hi=Math.max(hi,x);}
          if(lo>.001||hi<.999)throw new Error(`Tube _U endpoints: ${n.getName()}`);
        }
        for(const s of p.listSemantics()){const a=p.getAttribute(s)!;for(const v of a.getArray()!)if(!Number.isFinite(v))throw new Error(`Nonfinite ${n.getName()} ${s}`);}
      }
    }
  }
  for(const n of document.getRoot().listNodes()){
    const mesh=n.getMesh();if(!mesh)continue;
    if(typeof n.getExtras().closed!=='boolean')throw new Error(`Missing closed ${n.getName()}`);
    mesh.setExtras({...n.getExtras()});
    for(const p of mesh.listPrimitives()){
      p.setAttribute('TEXCOORD_0',null);
      if(n.getName()==='skin-wire')p.setAttribute('NORMAL',null);
      const u=p.getAttribute('_U');if(u)u.setArray(new Float32Array(Array.from(u.getArray()!,v=>Math.round(v*32768)/32768)));
    }
  }
  verify(document);
  await document.transform(weld(),reorder({encoder:MeshoptEncoder}),quantize({pattern:/^(POSITION|NORMAL)$/,
    quantizePosition:16,quantizeNormal:12}),prune({keepLeaves:true,keepAttributes:true}));
  document.createExtension(compression).setRequired(true).setEncoderOptions({method:compression.EncoderMethod.QUANTIZE});
  document.getRoot().getAsset().copyright=`Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0\n(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center\nfor Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now\nCC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).\nChanges for Atlas: structures selected for the digestive region and four other systems, simplified, renamed, centreline _U baked.\nStatic meshes; no rig, weights, fibres or attachment sites. digestive-system.glb is licensed\nCC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).`;
  const bytes=await io.writeBinary(document);const decoded=await io.readBinary(bytes);verify(decoded);
  await decoded.transform(dequantize());
  const clouds:any[]=[];
  for(const n of decoded.getRoot().listNodes()){
    const m=n.getWorldMatrix(),points:number[][]=[],faces:number[][]=[],u:number[]=[];
    for(const p of n.getMesh()!.listPrimitives()){
      const pos=p.getAttribute('POSITION')!,offset=points.length;
      for(let i=0;i<pos.getCount();i++){
        const v:number[]=[];pos.getElement(i,v);
        points.push([0,1,2].map(a=>m[a]!*v[0]!+m[a+4]!*v[1]!+m[a+8]!*v[2]!+m[a+12]!));
        if(p.getAttribute('_U'))u.push(p.getAttribute('_U')!.getScalar(i));
      }
      const ix=p.getIndices()!.getArray()!;
      for(let i=0;i<ix.length;i+=3)faces.push([ix[i]!+offset,ix[i+1]!+offset,ix[i+2]!+offset]);
    }
    clouds.push({name:n.getName(),role:n.getExtras().role,points,faces,u,closed:n.getMesh()!.getExtras().closed});
  }
  const shell=clouds.find(n=>n.name==='skin-outline');const ys=shell.points.map((p:number[])=>p[1]);
  const minY=Math.min(...ys),maxY=Math.max(...ys);
  if(Math.abs(minY-frame.floorY)>.003 || Math.abs(maxY-minY-frame.statureM)>.003)throw new Error('Static coordinate/floor/stature drift');
  for(const n of clouds){
    const x=n.points.reduce((s:number,p:number[])=>s+p[0]!,0)/n.points.length;
    if(n.name.endsWith('.l')&&x<=0 || n.name.endsWith('.r')&&x>=0)throw new Error('Side mismatch '+n.name);
  }
  const table=clouds.map(n=>({node:n.name,role:n.role,triangles:n.faces.length,primitives:decoded.getRoot().listNodes().find(x=>x.getName()===n.name)!.getMesh()!.listPrimitives().length,closed:n.closed,skinned:false}));
  const triangles=table.reduce((s,n)=>s+n.triangles,0),b=manifest.budgets.total;
  if(bytes.byteLength>b.maxBytes||triangles>b.maxTriangles)throw new Error('Hard budget exceeded');
  if(bytes.byteLength>b.targetBytes||triangles>b.targetTriangles)throw new Error('Soft budget exceeded');
  const wire=table.find(n=>n.node==='skin-wire');if(!wire||wire.triangles<3000||wire.triangles>5000)throw new Error('Wire triangle range');
  const output=resolve(root,'../../public/models',manifest.output);
  await mkdir(dirname(output),{recursive:true});await writeFile(output,bytes);
  await writeFile(resolve(cache,`${topic}-decoded.json`),JSON.stringify(clouds));
  for(const e of decoded.getRoot().listExtensionsUsed())if(e.extensionName==='EXT_meshopt_compression')e.dispose();
  for(const mesh of decoded.getRoot().listMeshes())for(const p of mesh.listPrimitives())p.setAttribute('_U',null);
  await decoded.transform(prune({keepLeaves:true}));
  const auditBuffer=decoded.createBuffer('audit');
  for(const a of decoded.getRoot().listAccessors())a.setBuffer(auditBuffer);
  for(const b of decoded.getRoot().listBuffers())if(b!==auditBuffer)b.dispose();
  await io.write(resolve(cache,`${topic}-audit.glb`),decoded);
  const summary={output,bytes:bytes.byteLength,triangles,nodeCount:table.length,drawCalls:table.reduce((s,n)=>s+n.primitives,0),sha256:createHash('sha256').update(bytes).digest('hex'),nodes:table,rig:false,extensions:['KHR_mesh_quantization','EXT_meshopt_compression'],coordinateCheck:{minY,maxY,statureM:maxY-minY}};
  await writeFile(resolve(cache,`${topic}-optimize-stats.json`),JSON.stringify(summary,null,2)+'\n');
  console.table(table);console.log(JSON.stringify(summary));
}
