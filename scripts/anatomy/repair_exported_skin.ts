/** Final acceptance uses the exact decoder/dequantizer employed by the audit. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import type {NodeIO} from '@gltf-transform/core';

export async function repairExportedSkin(io: NodeIO, initial: Uint8Array, root: string, topic: string): Promise<Uint8Array> {
  let bytes=initial;
  const candidate=resolve(root,`cache/${topic}-publish-candidate.glb`);
  const inspection=resolve(root,`cache/${topic}-codec-shell.json`);
  const repairs: unknown[]=[];
  for (let iteration=0;iteration<4;iteration++) {
    await writeFile(candidate,bytes);
    execFileSync(process.execPath,['--import','tsx',resolve(root,'decode_weights.ts'),'--topic',topic,'--input',candidate],{stdio:'ignore'});
    await writeFile(inspection,await readFile(resolve(root,`cache/${topic}-weight-meshes.json`)));
    execFileSync('python3',[resolve(root,'inspect_exported_shell.py'),inspection],{stdio:'inherit'});
    const updates: {name:string; weights:Record<string,number>[];sourceVertices:number[];shellMismatchesFixed:number;outliersFixed:number}[]=JSON.parse(await readFile(inspection,'utf8'));
    if (!updates.length) {
      await writeFile(resolve(root,`cache/${topic}-codec-shell-repair.json`),JSON.stringify(repairs,null,2)+'\n');
      return bytes;
    }
    const doc=await io.readBinary(bytes);
    for (const update of updates) {
      const node=doc.getRoot().listNodes().find(n=>n.getName()===update.name)!;
      const primitives=node.getMesh()!.listPrimitives();
      if (primitives.length!==1) throw new Error('Derived skin must have one primitive');
      const weights=primitives[0]!.getAttribute('WEIGHTS_0')!, joints=primitives[0]!.getAttribute('JOINTS_0')!;
      const names=node.getSkin()!.listJoints().map(j=>j.getName().replace(/^joint\./,''));
      for (let i=0;i<update.weights.length;i++) {
        const entries=Object.entries(update.weights[i]!).sort(([a],[b])=>names.indexOf(a)-names.indexOf(b));
        const quantized=[0,1,2,3].map(k=>Math.round((entries[k]?.[1]??0)*65535));
        const largest=quantized.indexOf(Math.max(...quantized));
        quantized[largest]! += 65535-quantized.reduce((a,b)=>a+b,0);
        const index=update.sourceVertices[i]!;
        weights.setElement(index,quantized.map(v=>v/65535));
        joints.setElement(index,[0,1,2,3].map(k=>entries[k]?names.indexOf(entries[k]![0]):0));
      }
      repairs.push({iteration,name:update.name,shellMismatchesFixed:update.shellMismatchesFixed,outliersFixed:update.outliersFixed});
    }
    const buffer=doc.createBuffer('codec-repaired');
    for (const accessor of doc.getRoot().listAccessors()) accessor.setBuffer(buffer);
    for (const old of doc.getRoot().listBuffers()) if (old!==buffer) old.dispose();
    bytes=await io.writeBinary(doc);
  }
  throw new Error('Codec shell repair did not converge');
}
