/** Verify proposed shared-geometry lifetime fix on real interleaved GLB data.
 * Run explicitly in the isolated patch-applied verification snapshot.
 */
import {describe,it,expect} from 'vitest';import fs from 'node:fs';
import {BoxGeometry,Mesh} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {edgesOf} from '../../../src/engines/space-scene/stages/model3d/bodyGeometry';
function independent(source:any){const derived=edgesOf(source,30);for(const name of Object.keys(source.attributes)){const original=source.getAttribute(name),copy=derived.getAttribute(name);expect(copy).not.toBe(original);expect(copy.array).not.toBe(original.array);if(original.isInterleavedBufferAttribute){expect('data' in copy).toBe(true);if('data' in copy)expect(copy.data).not.toBe(original.data);}expect(copy.count).toBe(original.count);expect(copy.itemSize).toBe(original.itemSize);expect(Buffer.from(copy.array.buffer,copy.array.byteOffset,copy.array.byteLength).equals(Buffer.from(original.array.buffer,original.array.byteOffset,original.array.byteLength))).toBe(true);}derived.dispose();expect(source.getAttribute('position').count).toBeGreaterThan(0);}
describe('muscles derived geometry buffer lifetime',()=>{
 it('owns plain buffers',()=>independent(new BoxGeometry()));
 it('owns real interleaved source buffers when discarded during beat transitions',async()=>{for(const topic of ['core','legs']){const b=fs.readFileSync(`public/models/muscles-${topic}.glb`),g=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');const m=g.scene.getObjectByName('skin-outline') as Mesh;independent(m.geometry);}});
});
