/** Execute the proposed engine factories in an isolated patched copy. This is
 * surface-path verification, not GPU or exercise-contact acceptance. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
// esbuild is Vite's installed compiler; no new repository dependency.
const { build }=createRequire(require.resolve('vite'))('esbuild');
import { geometry } from './build-gym';
import { gymBarbellShape, gymDumbbellShape, gymBenchShape, gymRackShape, gymColumnShape, gymOutputPulleyShape } from '../kits/muscles-gym';
const root=process.cwd(),scratch=fs.mkdtempSync(path.join(root,'scripts/geo/muscles-core/.patch-verify-'));
const files=['src/engines/space-scene/lib/equipment.ts','src/engines/space-scene/stages/model3d/Equipment.tsx'];
try {
 for(const file of files){const target=path.join(scratch,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
 const patch=fs.readFileSync('scripts/geo/muscles-core/gym-runtime.patch');
 execFileSync('patch',['--batch','-p1','-d',scratch],{input:patch,stdio:['pipe','pipe','pipe']});
 const result=await build({entryPoints:[path.join(root,files[1]!)],bundle:true,platform:'node',format:'esm',packages:'external',write:false,logLevel:'silent',plugins:[{name:'isolated-gym-patch',setup(b:any){b.onLoad({filter:/\.(tsx|ts)$/},async (args:{path:string})=>{
  const relative=path.relative(root,args.path);if(!files.includes(relative))return;
  let contents=fs.readFileSync(path.join(scratch,relative),'utf8');
  if(relative===files[1])contents+='\nexport { oneGeometry, columnPulley };\nexport { barbellShape, dumbbellShape, benchShape, rackShape, columnShape };\n';
  return {contents,loader:relative.endsWith('.tsx')?'tsx':'ts',resolveDir:path.dirname(args.path)};
 });}}]});
 const output=path.join(scratch,'patched-engine.mjs');fs.writeFileSync(output,result.outputFiles[0]!.text);
 const actual=await import(pathToFileURL(output).href);
 for(const [name,expected,args]of [
  ['barbellShape',gymBarbellShape,[]],['dumbbellShape',gymDumbbellShape,[]],['benchShape',gymBenchShape,[30]],['rackShape',gymRackShape,[1.15]],['columnShape',gymColumnShape,[0]],['columnPulley',gymOutputPulleyShape,[]],
 ]as const){
  const shape=actual[name](...args);assert.deepEqual(shape,expected(...args as [number]));
  const rendered=actual.oneGeometry(shape),candidate=geometry(shape);
  assert.equal(rendered.index?.count,candidate.index?.count);assert.equal(rendered.getAttribute('position').count,candidate.getAttribute('position').count);
  assert.deepEqual(Array.from(rendered.getAttribute('position').array),Array.from(candidate.getAttribute('position').array));
  rendered.dispose();candidate.dispose();
 }
 const record={date:'2026-11-09',patch:'scripts/geo/muscles-core/gym-runtime.patch',factories:6,result:'Passed: actual isolated patched equipment factories and actual Equipment.tsx oneGeometry path match review geometry position-for-position.',limits:'Original engine files remain unchanged. This does not execute useFrame placement, grip contacts, cable tangency, browser rendering or GPU shaders.'};
 fs.writeFileSync('scripts/anatomy/rebuild-evidence/gym/patch-verification.json',JSON.stringify(record,null,2));console.log(record.result);
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
