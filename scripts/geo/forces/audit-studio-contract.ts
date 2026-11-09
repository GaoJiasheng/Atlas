/** Compare the CPU rig to what Lighting actually passes to the renderer. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Color} from 'three';
import {studioRigs} from './hardware-studio-cpu';
const source=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
for(const theme of ['paper','cinema'] as const){
 const body=source.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))![1]!;
 const rig=studioRigs[theme];
 const entry=(name:string)=>body.match(new RegExp(`${name}: \\[([^\\]]+)`))![1]!;
 const hex=(s:string)=>[...s.matchAll(/'(#[0-9a-f]+)'/g)].map(m=>new Color(m[1]!).toArray());
 const hemi=entry('hemi');assert.deepEqual(hex(hemi),rig.hemi.slice(0,2));assert.equal(Number(hemi.split(',')[2]),rig.hemi[2]);
 for(const [i,name]of ['key','fill','rim'].entries()){
  const e=entry(name);assert.deepEqual(hex(e)[0],new Color(rig.lights[i]![0]).toArray());assert.equal(Number(e.split(',')[1]),rig.lights[i]![1]);
  const d=source.match(new RegExp(`const ${name.toUpperCase()}_DIR: Vec3 = normalize3\\(\\[([^\\]]+)`))![1]!.split(',').map(Number);assert.deepEqual(d,rig.lights[i]![2]);
 }
 assert.equal(Number(body.match(/env: ([\d.]+)/)![1]),rig.env);assert.equal(Number(body.match(/exposure: ([\d.]+)/)![1]),rig.exposure);
}
console.log('PASS: CPU studio colours, light directions/intensities, hemisphere, environment and exposure match actual engine rig.');
