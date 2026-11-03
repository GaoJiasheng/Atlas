import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {BufferAttribute,BufferGeometry,Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import {parse} from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const base = 'scripts/anatomy/bones-joints/';
const manifest = json(base + 'manifest.json');
const file = partsFile.parse(json('src/content/topics/bones-and-joints/data/parts.json'));
const glb = readFileSync('public/models/bones-and-joints.glb');
const gltf = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString('utf8').trim());
const ribNames = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];

describe('bones and joints: exact source geometry packet', () => {
  it('exports 34 distinct skeleton selections and seven real hand close-up bones', () => {
    expect(manifest.parts).toHaveLength(41);
    expect(manifest.parts.slice(0,34).every((p: {station: number[]}) => p.station.every(x => x === 0))).toBe(true);
    expect(manifest.parts.slice(34).every((p: {station: number[]}) => p.station[0]! < -2)).toBe(true);
    expect(file.parts.filter(p => !p.context)).toHaveLength(61);
    expect(file.parts.filter(p => p.context).map(p => p.id).sort()).toEqual(['lever-pivot','repair-clot-skin','repair-soft-skin','skin-outline']);
    const meshNames = gltf.nodes.filter((n: {mesh?: number}) => n.mesh !== undefined).map((n: {name: string}) => n.name).sort();
    expect(meshNames).toHaveLength(44);
    expect(meshNames).toEqual(file.parts.flatMap(p => p.mesh && !p.mesh.startsWith('polished-') ? [p.mesh] : []).sort());
    expect(new Set(meshNames).size).toBe(44);
  });
  it('adds only the original polished cortex while retaining the audited anatomy byte-for-byte', () => {
    expect(file.model).toBe('/models/bones-and-joints-polished.glb');
    const copy=readFileSync('public/models/bones-and-joints-polished.glb');
    const length=copy.readUInt32LE(12), json=JSON.parse(copy.subarray(20,20+length).toString('utf8'));
    expect(json.nodes.slice(0,gltf.nodes.length)).toEqual(gltf.nodes);
    expect(json.meshes.slice(0,gltf.meshes.length)).toEqual(gltf.meshes);
    expect(json.accessors.slice(0,gltf.accessors.length)).toEqual(gltf.accessors);
    const sourceBinary=28+glb.readUInt32LE(12),copyBinary=28+length;
    expect(copy.subarray(copyBinary,copyBinary+glb.readUInt32LE(sourceBinary-8)).equals(glb.subarray(sourceBinary))).toBe(true);
    const added=json.nodes.filter((n:{name:string})=>n.name==='polished-cortex');
    expect(added).toHaveLength(1);
    expect(added[0].translation).toEqual([2,0,0]);
    const mesh=json.meshes[added[0].mesh].primitives[0];
    expect(json.accessors[mesh.indices].count/3).toBeLessThan(35_000);
    // At midshaft the coronal window is open: a ray reaches the inner
    // posterior cortex, rather than a slab across the marrow cavity.
    const buffer=copy.subarray(copyBinary);
    const array=(id:number)=>{const a=json.accessors[id],v=json.bufferViews[a.bufferView];
      const chunk=Uint8Array.from(buffer.subarray(v.byteOffset,v.byteOffset+v.byteLength)).buffer;
      return a.componentType===5125?new Uint32Array(chunk):a.componentType===5123?new Uint16Array(chunk):a.componentType===5122?new Int16Array(chunk):new Float32Array(chunk);};
    const geometry=new BufferGeometry().setAttribute('position',new BufferAttribute(Float32Array.from(array(mesh.attributes.POSITION),(v,i)=>v*added[0].scale[i%3]),3))
      .setIndex(new BufferAttribute(new Uint32Array(array(mesh.indices)),1));
    const material=new MeshBasicMaterial(), specimen=new Mesh(geometry,material);
    specimen.updateMatrixWorld(true);
    const hits=new Raycaster(new Vector3(-.012,.02,.1),new Vector3(0,0,-1)).intersectObject(specimen);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.point.z).toBeLessThan(-.012);
    const portal=new Raycaster(new Vector3(.06,-.042,-.0085),new Vector3(-1,0,0)).intersectObject(specimen);
    const nearby=new Raycaster(new Vector3(.06,-.058,-.0085),new Vector3(-1,0,0)).intersectObject(specimen);
    expect(portal[0]!.point.x).toBeLessThan(-.016);
    expect(nearby[0]!.point.x).toBeGreaterThan(-.004);
    geometry.dispose();material.dispose();
    expect(copy.length).toBeLessThanOrEqual(4_000_000);
    expect(file.parts.filter(p=>!p.context)).toHaveLength(61);
  });
  it('keeps both uncounted tissue skins in the parent stage’s authored visibility states',()=>{
    for(const name of readdirSync('src/content/topics/bones-and-joints/chapters').filter(n=>n.endsWith('.mdx'))){
      const c=parse(readFileSync('src/content/topics/bones-and-joints/chapters/'+name,'utf8').split('---')[1]!);
      for(const beat of [{},...c.state.beats]){const state={...c.state,...beat};
        for(const id of ['clot','soft'])expect(state.hide.includes(`repair-${id}-skin`)).toBe(state.hide.includes(`repair-stage-${id}`));
      }
    }
  });
  it('retains exactly twelve named ribs on each real side and separates paired long bones', () => {
    for (const side of ['l','r']) {
      const ribs = manifest.parts.find((p: {id: string}) => p.id === `ribs-${side}`);
      expect(ribs.sources.filter((s: string) => !s.startsWith('Costal'))).toEqual(ribNames.map(n => `${n} rib.${side}`));
      expect(ribs.sources.filter((s: string) => s.startsWith('Costal'))).toHaveLength(10);
      for (const bone of ['radius','ulna','tibia','fibula','patella']) expect(manifest.parts.find((p: {id: string}) => p.id === `${bone}-${side}`).sources).toHaveLength(1);
      expect(manifest.parts.find((p: {id: string}) => p.id === `radius-${side}`).joint).toBe(`forearm.${side}`);
      expect(manifest.parts.find((p: {id: string}) => p.id === `ulna-${side}`).joint).toBe(`elbow.${side}`);
    }
    expect(manifest.parts.find((p: {id: string}) => p.id === 'sternum').sources).toEqual(['Manubrium of sternum','Body of sternum','Xiphoid process']);
  });
  it('binds audit evidence to the actual compressed asset within unchanged budgets', () => {
    expect(createHash('sha256').update(glb).digest('hex')).toBe(manifest.modelSha256);
    expect(glb.length).toBe(manifest.bytes);
    expect(glb.length).toBeLessThanOrEqual(4_000_000);
    expect(manifest.triangles).toBeLessThanOrEqual(350_000);
    expect(manifest.draws).toBeLessThan(60);
    expect(Math.max(...manifest.sourceMeshes.map((s: {bboxErrorM: number}) => s.bboxErrorM))).toBeLessThanOrEqual(1e-6);
    const surface = json(base + 'surface-audit.json'), codec = json(base + 'codec-audit.json');
    expect(surface.failed).toEqual([]);
    expect(surface.maxSampledErrorM).toBeLessThanOrEqual(.001);
    expect(codec.meshNodes).toBe(44); expect(codec.rigJoints).toBe(19);
    expect(codec.maxCodecBBoxErrorM).toBeLessThan(.0001);
    expect(codec.parts).toHaveLength(44);
    expect(gltf.asset.copyright).toContain('Z-Anatomy');
    expect(gltf.asset.copyright).toContain('CC-BY-SA 2.1 Japan');
    expect(gltf.asset.copyright).toContain('CC-BY-SA 4.0');
    expect(manifest.nativeBlender.status).toBe('REVIEW');
  });
  it('independently recomputes all 24 ideal balances and the abstract load position', () => {
    const sim = file.sim!;
    expect(sim.table!.experiments.lever!.rows).toHaveLength(24);
    for (const angle of [30,60,90,120]) for (const load of [0,10,20]) for (const length of [.15,.30]) {
      const values = resolveSimValues(sim, {mode:'lever','elbow-angle':angle,'load-force':load,'load-distance':length});
      const out = evaluateSim(sim, values), radians = angle*Math.PI/180;
      const x = length*Math.sin(radians), y = -length*Math.cos(radians);
      expect(out['load-arm']).toBeCloseTo(Math.abs(x),12);
      expect(out['load-torque']).toBeCloseTo(load*Math.abs(x),12);
      expect(out['muscle-force']).toBeCloseTo(load*Math.abs(x)/.04,10);
      expect(out.residual).toBeCloseTo(0,12);
      expect(out['tip-x']).toBeCloseTo(x,12); expect(out['tip-y']).toBeCloseTo(y,12);
    }
  });
  it('places four equivalent pull arrows on a true 0.04 m perpendicular arm', () => {
    const overlay = file.sim!.overlays!.find(o => o.kind === 'force-vectors');
    if (!overlay || overlay.kind !== 'force-vectors') throw new Error('Missing force vectors');
    const arrows = overlay.arrows.filter(a => a.part === 'lever-beam');
    expect(arrows).toHaveLength(4);
    for (const [i, degrees] of [30,60,90,120].entries()) {
      const a = arrows[i]!, theta = degrees*Math.PI/180, centre = [.15*Math.sin(theta),-.15*Math.cos(theta)];
      const p = [centre[0]!+a.offset![0],centre[1]!+a.offset![1]];
      expect(Math.hypot(...a.dir)).toBeCloseTo(1,12);
      expect(Math.hypot(...p)).toBeCloseTo(.04,12);
      expect(p[0]!*a.dir[1]-p[1]!*a.dir[0]).toBeCloseTo(.04,12);
      expect(a.when).toEqual({control:'elbow-angle',is:{eq:degrees}});
    }
    // per = 0.001 m/N would scale the shaft to a hairline; width keeps it readable beside the 14 mm beam.
    expect(overlay.width).toBeGreaterThanOrEqual(.05);
    expect(overlay.arrows.find(a => a.part === 'lever-load')?.at).toBe('bottom');
  });
});
