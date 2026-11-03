/** Independent checks of docs/48's teaching mathematics and the actual shipped data. */
import { glbIssues } from '../../scripts/lib/glb-check';
import { loadGeology } from '../../scripts/geo/inside-the-earth/load-geology';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { BufferGeometry, Vector3, type Mesh } from 'three';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { decodeSimParam, resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { outputText } from '../../src/engines/space-scene/lib/sim/text';
import { tableCombinations } from '../../src/engines/space-scene/lib/sim/table';
import { tableSourceIssues } from '../../src/engines/space-scene/table-schema';
import { eachPieces, isClosedPrimitive, partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const DIR = join(import.meta.dirname, '../../src/content/topics/inside-the-earth');
const raw = JSON.parse(readFileSync(process.env.ATLAS_EARTH_PARTS ?? join(DIR, 'data/parts.json'), 'utf8'));
const file = partsFile.parse(raw);
const meshes=file.model ? await loadGeology(process.env.ATLAS_EARTH_MESH ?? join(DIR,'../../../../public',file.model.slice(1))) : new Map();
const sim = file.sim!;
const chapters = readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const [, front] = readFileSync(join(DIR, 'chapters', f), 'utf8').split(/^---$/m);
  return yaml(front!);
});
const out = (set: Record<string, unknown> = {}) => evaluateSim(sim, resolveSimValues(sim, set));
const fx = (set: Record<string, unknown>) => simEffects(sim, resolveSimValues(sim, set), out(set));
const letters = Array.from({ length: 17 }, (_, i) => String.fromCharCode(97 + i));
const waves = ['p', 's'].flatMap((kind) => letters.map((l) => `wave-${kind}-${l}`));
const water = ['sea-bed', 'sea-bed-left', 'sea-bed-right', ...letters.map((l) => `sea-column-${l}`)];
const offset = (pose: string, part: string) => file.poses![pose]!.parts[part]!.offset!;
const closeVector = (actual: readonly number[], wanted: readonly number[]) => wanted.forEach((v, i) => expect(actual[i]).toBeCloseTo(v, 12));

describe('inside-the-earth: concentric closed shells, never equal-thickness rings', () => {
  it('uses the exact four radii, with closed spherical shells sharing their boundary surfaces and a quarter-wedge opening', () => {
    const radii = [0, 1221 / 6371, 3485 / 6371, 6341 / 6371, 1];
    const ids = ['earth-inner-core', 'earth-outer-core', 'earth-mantle', 'earth-crust'];
    const boundaries: number[][][] = [];
    ids.forEach((id, i) => {
      const p = file.parts.find((p) => p.id === id)!.primitive!;
      expect(p.kind).toBe('lathe');
      if (p.kind !== 'lathe') throw new Error(`${id} must be a shell profile`);
      expect(p.arc).toBe(270);
      expect(p.segments).toBeGreaterThanOrEqual(48);
      expect(p.rotation).toEqual(file.parts.find((p) => p.id === 'earth-crust')!.primitive!.rotation);
      expect(isClosedPrimitive(p)).toBe(true);
      expect(p.profile[0]).toEqual(p.profile.at(-1));
      const outer = radii[i + 1]!, inner = radii[i]!;
      const radial = p.profile.map(([r, y]) => Math.hypot(r, y));
      expect(Math.max(...radial)).toBeCloseTo(outer, 14);
      // Every non-axis point lies on one of the shell's two boundaries.
      for (let j = 0; j < p.profile.length; j++) {
        if (p.profile[j]![0] < 1e-14) continue;
        expect(Math.min(Math.abs(radial[j]! - inner), Math.abs(radial[j]! - outer))).toBeLessThan(1e-14);
      }
      if (i > 0) expect(radial.some((r) => Math.abs(r - inner) < 1e-14)).toBe(true);
      boundaries.push(p.profile.filter(([r, y]) => Math.abs(Math.hypot(r, y) - outer) < 1e-14));
      if (i > 0) {
        const onInner = p.profile.filter(([r, y]) => Math.abs(Math.hypot(r, y) - inner) < 1e-14);
        for (const v of onInner) expect(boundaries[i - 1]!.some((u) => Math.hypot(u[0]! - v[0], u[1]! - v[1]) < 1e-12)).toBe(true);
      }
    });
    expect(ids.map((_, i) => (radii[i + 1]! - radii[i]!) * 6371)).toEqual([1221, 2264, 2856, 30].map((n) => expect.closeTo(n, 9)));
    expect(1221 + 2264 + 2856 + 30).toBe(6371);
    const magma = file.parts.find((p) => p.id === 'volcano-storage')!.primitive!;
    for (const id of ['earth-inner-core', 'earth-outer-core']) {
      const core = file.parts.find((p) => p.id === id)!;
      expect(`${core.detail.en} ${core.summary.en}`).toMatch(/metal/);
      expect(core.primitive!.tint).not.toBe(magma.tint);
    }
  });
});

describe('inside-the-earth: the local geological models preserve the explanatory constraints', () => {
  const part = (id: string) => file.parts.find((p) => p.id === id)!;
  it('moving boundary samples carry continuous material strata and crust through their poses', () => {
    for (const id of ['edge-div-left','edge-div-right','edge-trans-left','edge-trans-right']) {
      const p=part(id), body=p.primitive!, crust=p.extra![0]!;
      expect(body.kind).toBe('extrude');
      expect(crust.kind).toBe('extrude');
      if(body.kind!=='extrude' || crust.kind!=='extrude') throw new Error('geological sections need solid beds');
      const layers=[body,...p.extra!.slice(1,5)];
      for(let k=0;k<layers.length-1;k++) {
        const lower=layers[k]!,upper=layers[k+1]!;
        if(lower.kind!=='extrude' || upper.kind!=='extrude') throw new Error('bed missing');
        expect(lower.shape.slice(lower.shape.length/2).reverse()).toEqual(upper.shape.slice(0,upper.shape.length/2));
        expect(lower.depth).toBe(upper.depth);
      }
      const highest=layers.at(-1)!;
      if(highest.kind!=='extrude') throw new Error('highest bed missing');
      expect(highest.shape.slice(highest.shape.length/2).reverse()).toEqual(crust.shape.slice(0,crust.shape.length/2));
      expect(crust.shape.slice(crust.shape.length/2).some((p,i,a)=> i>0 && p[1]!==a[i-1]![1])).toBe(true);
    }
    for (const id of ['edge-trans-left', 'edge-trans-right']) closeVector(offset('edge-slide', id).slice(0, 2), [0, 0]);
    expect(offset('edge-slide', 'edge-trans-left')[2]).toBe(-offset('edge-slide', 'edge-trans-right')[2]!);
  });

  it('the descending slab joins the incoming plate across its full thickness, and partial melt sits above it', () => {
    const incoming = part('edge-sub-left').primitive!, crust = part('edge-sub-left').extra![0]!, slab = part('edge-slab').primitive!, slabCrust = part('edge-slab').extra![0]!;
    if (incoming.kind !== 'box' || crust.kind !== 'box' || slab.kind !== 'extrude' || slabCrust.kind !== 'extrude') throw new Error('the slab must be a continuous two-material extruded plate');
    const joinX = incoming.at[0] + incoming.size[0]! / 2;
    const join = slab.shape.filter(([x]) => Math.abs(x - joinX) < 1e-12);
    expect(join).toHaveLength(2);
    expect(join.map(([, y]) => y).sort()).toEqual([incoming.at[1] - incoming.size[1]! / 2, incoming.at[1] + incoming.size[1]! / 2].sort().map((v) => expect.closeTo(v, 12)));
    const crustJoin = slabCrust.shape.filter(([x]) => Math.abs(x - joinX) < 1e-12);
    expect(crustJoin).toHaveLength(2);
    expect(crustJoin.map(([, y]) => y).sort()).toEqual([crust.at[1] - crust.size[1]! / 2, crust.at[1] + crust.size[1]! / 2].sort().map((v) => expect.closeTo(v, 12)));
    expect(slab.depth).toBe(incoming.size[2]);
    expect(slabCrust.depth).toBe(crust.size[2]);
    expect(part('edge-sub-left').connects).toContain('edge-slab');
    const melt = part('edge-melt').primitive!;
    const top = slab.shape.slice(0, slab.shape.length / 2);
    // Dense samples must turn continuously from the horizontal incoming plate;
    // a coarse staircase can preserve the endpoints while failing this check.
    expect(top.length).toBeGreaterThanOrEqual(65);
    const angles = top.slice(1).map(([x, y], i) => Math.atan2(y - top[i]![1], x - top[i]![0]));
    expect(Math.abs(angles[0]!)).toBeLessThan(0.03);
    for (let i = 1; i < angles.length; i++) expect(Math.abs(angles[i]! - angles[i - 1]!)).toBeLessThan(0.05);
    const bottom = slab.shape.slice(slab.shape.length / 2).reverse();
    const crustTop = slabCrust.shape.slice(0, slabCrust.shape.length / 2);
    const crustBottom = slabCrust.shape.slice(slabCrust.shape.length / 2).reverse();
    top.forEach(([x, y], i) => {
      expect(bottom[i]![0]).toBeCloseTo(x, 12);
      expect(y - bottom[i]![1]).toBeCloseTo(incoming.size[1]!, 12);
      closeVector(crustBottom[i]!, [x, y]);
      expect(crustTop[i]![0]).toBeCloseTo(x, 12);
      expect(crustTop[i]![1] - y).toBeCloseTo(crust.size[1]!, 12);
      expect(crustTop[i]![1] - bottom[i]![1]).toBeCloseTo(incoming.size[1]! + crust.size[1]!, 12);
    });
    const segment = top.findIndex((p, i) => p[0] <= melt.at[0] && (top[i + 1]?.[0] ?? -Infinity) >= melt.at[0]);
    expect(segment).toBeGreaterThanOrEqual(0);
    const a = top[segment]!, b = top[segment + 1]!;
    const slabY = a[1] + (melt.at[0] - a[0]) / (b[0] - a[0]) * (b[1] - a[1]);
    expect(melt.at[1]).toBeGreaterThan(slabY);
  });

  it('gives the stratovolcano inward-curving flanks and a recessed crater rather than a straight cone', () => {
    const cone = part('volcano-cone').primitive!;
    if (cone.kind !== 'lathe') throw new Error('the volcano must have a curved meridian');
    expect(cone.segments).toBeGreaterThanOrEqual(48);
    expect(isClosedPrimitive(cone)).toBe(true);
    const summit = Math.max(...cone.profile.map(([, y]) => y));
    const rim = cone.profile.findIndex(([, y]) => y === summit);
    const flank = cone.profile.slice(0, rim + 1);
    expect(flank.length).toBeGreaterThan(20);
    const [baseR, baseY] = flank[0]!, [rimR] = flank.at(-1)!;
    const middle = flank.find(([, y]) => y > baseY + (summit - baseY) * 0.4 && y < baseY + (summit - baseY) * 0.6)!;
    expect(middle).toBeDefined();
    const linearRadius = baseR + (rimR - baseR) * (middle[1] - baseY) / (summit - baseY);
    expect(middle[0]).toBeLessThan(linearRadius - (baseR - rimR) * 0.05);
    for (let i = 1; i < flank.length; i++) {
      expect(flank[i]![1]).toBeGreaterThan(flank[i - 1]![1]);
      expect(flank[i]![0]).toBeLessThan(flank[i - 1]![0]);
    }
    const innerWall = cone.profile.slice(rim + 1);
    expect(innerWall.some(([r, y]) => r < rimR && y < summit - 0.1)).toBe(true);
  });

  it('fits the irregular magma chamber to its host-rock opening and connects branching passages', () => {
    const chamber = part('volcano-storage').primitive!, host = part('volcano-host').primitive!, trunk = part('volcano-conduit').primitive!;
    if (chamber.kind !== 'extrude' || host.kind !== 'extrude' || trunk.kind !== 'sweep') throw new Error('the chamber and plumbing must be continuous shaped solids');
    expect(host.holes).toHaveLength(1);
    const hole = host.holes![0]!;
    expect(hole.length).toBeGreaterThan(24);
    const globalShape = chamber.shape.map(([x, y]): [number, number] => [x + chamber.at[0] - host.at[0], y + chamber.at[1] - host.at[1]]);
    for (const [x, y] of globalShape) expect(hole.some(([hx, hy]) => Math.hypot(hx - x, hy - y) < 1e-10)).toBe(true);
    const left = Math.min(...hole.map(([x]) => x)), right = Math.max(...hole.map(([x]) => x));
    // Bilaterally mirrored ellipses have no irregular roof or side pockets.
    expect(hole.some(([x, y]) => !hole.some(([xx, yy]) => Math.hypot(xx - (left + right - x), yy - y) < 1e-4))).toBe(true);
    const radius = Array.isArray(trunk.radius) ? Math.max(...trunk.radius) : trunk.radius;
    const segmentDistance = (p: readonly number[], a: readonly number[], b: readonly number[]) => {
      const ab = b.map((v, i) => v - a[i]!), ap = p.map((v, i) => v - a[i]!);
      const t = Math.max(0, Math.min(1, ap.reduce((s, v, i) => s + v * ab[i]!, 0) / ab.reduce((s, v) => s + v * v, 0)));
      return Math.hypot(...p.map((v, i) => v - a[i]! - t * ab[i]!));
    };
    const branches = part('volcano-conduit').extra!.filter((p) => p.kind === 'sweep');
    expect(branches.length).toBeGreaterThanOrEqual(3);
    for (const passage of [trunk, ...branches]) {
      if (passage.kind !== 'sweep') throw new Error('a volcanic passage must be a sweep');
      expect(passage.radial).toBeGreaterThanOrEqual(48);
      if (passage === trunk) continue;
      const endpointDistances = [passage.path[0]!, passage.path.at(-1)!].map((p) => Math.min(...trunk.path.slice(1).map((b, i) => segmentDistance(p, trunk.path[i]!, b))));
      expect(Math.min(...endpointDistances)).toBeLessThan(radius);
    }
  });

  it('the flared conduit covers the former vent gap and reaches the crater floor without a second overlapping pipe wall',()=>{
    const trunk=part('volcano-conduit').primitive!,vent=part('volcano-vent').primitive!,cone=part('volcano-cone').primitive!;
    if(trunk.kind!=='sweep' || vent.kind!=='lathe' || cone.kind!=='lathe') throw new Error('vent geometry missing');
    expect(trunk.path.at(-1)![1]).toBeCloseTo(1.22,12);
    expect(vent.profile.some(([r,y])=>Math.abs(y-1.22)<1e-10 && Math.abs(r-0.115)<1e-10)).toBe(true);
    expect(cone.profile.some(([r,y])=>Math.abs(y-1.22)<1e-10 && Math.abs(r-0.115)<1e-10)).toBe(true);
    const radii=trunk.radius as number[];
    const last=trunk.path.length-1;
    for(let i=last-3;i<last;i++) expect(radii[i+1]).toBeGreaterThan(radii[i]!);
    expect(part('volcano-vent').connects).toContain('volcano-conduit');
    expect(vent.at).toEqual(trunk.path.at(-1)!.map((v,i)=>i===1 ? 0 : v));
    expect(Math.min(...vent.profile.map(([,y])=>y))).toBeLessThan(trunk.path.at(-1)![1]);
    const lava=part('volcano-lava').primitive!;
    if(lava.kind!=='sweep') throw new Error('lava missing');
    // Samples follow the wall before reaching the rim, rather than bridging
    // diagonally over the crater's open air as a floating strip.
    expect(lava.path.length).toBeGreaterThan(9);
    expect(lava.path.slice(0,5).every(p=>p[2]<0 && p[1]>=1.22 && p[1]<1.34)).toBe(true);
  });

  it('fault bedding is solid, irregular and shared across the contact before horizontal slip',()=>{
    for(const side of ['left','right']) {
      const p=part(`fault-${side}`),beds=[p.primitive!,...p.extra!.slice(0,8)];
      expect(beds).toHaveLength(9);
      for(let i=0;i<beds.length-1;i++) {
        const a=beds[i]!,b=beds[i+1]!;
        if(a.kind!=='extrude' || b.kind!=='extrude') throw new Error('solid fault bedding missing');
        expect(a.shape.slice(a.shape.length/2).reverse()).toEqual(b.shape.slice(0,b.shape.length/2));
      }
      expect(beds.every(p=>p.kind==='extrude' && p.depth===1)).toBe(true);
    }
  });

  it('the shipped relief GLB meets the native asset licence, node and size checks',async()=>{
    expect(file.model).toBe('/models/inside-the-earth.glb');
    const issues=await glbIssues(process.env.ATLAS_EARTH_MESH ?? join(DIR,'../../../../public',file.model!.slice(1)),file.parts.filter(p=>p.mesh).map(p=>({node:p.mesh!,what:p.id})));
    expect(issues).toEqual([]);
  });

  it('decodes the compressed asset with the runtime loader and preserves scene-space geometry',async()=>{
    const bytes=readFileSync(process.env.ATLAS_EARTH_MESH ?? join(DIR,'../../../../public',file.model!.slice(1)));
    expect(bytes.length).toBeLessThanOrEqual(1_500_000);
    const header=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
    expect(header.extensionsRequired).toContain('EXT_meshopt_compression');
    const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
      .parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,'');
    gltf.scene.updateMatrixWorld(true);
    const vertex=new Vector3();
    for(const [id,pieces] of meshes) {
      const mesh=gltf.scene.getObjectByName(id) as Mesh<BufferGeometry>;
      expect(mesh?.isMesh,id).toBe(true);
      expect(mesh.userData.closed,id).toBe(true);
      const runtime=mesh.geometry.getAttribute('position'),cpu=pieces[0]!.geometry.getAttribute('position');
      expect(runtime.count,id).toBe(cpu.count);
      expect(mesh.geometry.index!.count,id).toBe(pieces[0]!.geometry.index!.count);
      let error=0;
      for(let i=0;i<runtime.count;i++) {
        vertex.fromBufferAttribute(runtime,i).applyMatrix4(mesh.matrixWorld);
        error=Math.max(error,vertex.distanceTo(new Vector3(cpu.getX(i),cpu.getY(i),cpu.getZ(i))));
      }
      expect(error,id).toBeLessThan(2e-7);
      mesh.geometry.dispose();
    }
  });

  it('ships finite sculpted relief with outward flank winding and depth-varying terrain',()=>{
    if(!file.model)throw new Error('geological relief GLB is required');
    for(const id of ['volcano-cone','fault-left','fault-right','edge-sub-right','collision-fold','edge-melt']) {
      expect(part(id).mesh).toBe(id);
      const pieces=meshes.get(id)!;
      expect(pieces).toHaveLength(1);
      const g=pieces[0]!.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal');
      expect(p.count).toBeGreaterThan(500);
      let finite=true;for(let i=0;i<p.count;i++) finite &&= [p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite);
      expect(finite,id).toBe(true);
      g.computeBoundingBox();
      expect(g.boundingBox!.max.z-g.boundingBox!.min.z).toBeGreaterThan(.1);
    }
    const cone=meshes.get('volcano-cone')![0]!.geometry,p=cone.getAttribute('position'),n=cone.getAttribute('normal');
    // Back flank must face outward, not have inverted triangle winding.
    let tested=0,minOutward=Infinity;
    for(let i=0;i<p.count;i++) if(p.getZ(i)<-.3 && p.getY(i)>.1 && p.getY(i)<.7) {
      minOutward=Math.min(minOutward,p.getX(i)*n.getX(i)+p.getZ(i)*n.getZ(i));tested++;
    }
    expect(tested).toBeGreaterThan(100);expect(minOutward).toBeGreaterThan(0);
    const fault=meshes.get('fault-left')![0]!.geometry.getAttribute('position');
    const ys=[];for(let i=0;i<fault.count;i++)if(fault.getY(i)>1.22)ys.push(fault.getY(i));
    expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(.004);
  });

  it('draws an irregular ash plume as one instanced shape within the topic triangle budget', () => {
    const ash = part('volcano-ash');
    const fragments = [ash.primitive!, ...ash.extra!];
    expect(fragments.length).toBeGreaterThan(20);
    expect(fragments.every((p) => p.kind === 'lathe')).toBe(true);
    const ys = fragments.map((p) => p.at[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0.6);
    expect(file.animations.some((a) => a.target === ash.id && 'each' in a && a.each)).toBe(true);
    const plume = eachPieces(ash);
    try {
      expect(plume).toHaveLength(1);
      expect(plume[0]!.matrices!.length).toBeGreaterThan(fragments.length);
      const geometry = plume[0]!.geometry;
      geometry.computeBoundingBox();
      expect(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x).toBeGreaterThan(0);
    } finally { plume.forEach((p) => p.geometry.dispose()); }
    let triangles = 0;
    const byGroup = new Map<string, number>();
    for (const p of file.parts) {
      const each = file.animations.some((a) => a.target === p.id && 'each' in a && a.each);
      const pieces = p.mesh ? meshes.get(p.mesh)!.map((piece: import('../../src/engines/space-scene/stages/model3d/geometry').ShapePiece)=>({...piece,geometry:piece.geometry.clone()})) : each ? eachPieces(p) : partPieces(p);
      for (const piece of pieces) {
        if (!piece.lines) {
          const count = (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1);
          triangles += count;
          const group = p.group ?? 'ungrouped';
          byGroup.set(group, (byGroup.get(group) ?? 0) + count);
        }
        piece.geometry.dispose();
      }
    }
    expect(triangles).toBeLessThan(450_000);
    for (const [group, count] of byGroup) expect(count, group).toBeLessThan(200_000);
  });

  it('loads a locked contact before releasing slip, keeps the two markers with their blocks, and marks the epicentre directly above the focus', () => {
    const loaded = file.poses!['fault-loaded']!.parts;
    closeVector(loaded['fault-marker-lock']!.offset!, [0, 0, 0]);
    for (const side of ['left', 'right']) {
      expect(loaded[`fault-marker-${side}`]!.rotation!.some((v) => v !== 0)).toBe(true);
      closeVector(offset('fault-slipped', `fault-marker-${side}`), offset('fault-slipped', `fault-${side}`));
      expect(Math.abs(offset('fault-slipped', `fault-${side}`)[2]!)).toBeCloseTo(0.15, 12);
      expect(file.poses!['fault-slipped']!.parts[`fault-marker-${side}`]!.rotation ?? [0, 0, 0]).toEqual([0, 0, 0]);
    }
    const focus = part('fault-focus').primitive!, epicentre = part('fault-epicentre').primitive!;
    expect(focus.at[0]).toBe(epicentre.at[0]);
    expect(focus.at[2]).toBe(epicentre.at[2]);
    expect(epicentre.at[1]).toBeGreaterThan(focus.at[1]);
    const waveChapter = chapters.find((c) => c.id === 'slip-and-waves');
    const poses = waveChapter.state.beats.map((b: { pose?: string }) => b.pose);
    expect(poses).toContain('fault-loaded');
    expect(poses).toContain('fault-slipped');
    expect(poses.indexOf('fault-loaded')).toBeLessThan(poses.indexOf('fault-slipped'));
  });
});

describe('inside-the-earth: the finite content contract', () => {
  it('ships exactly the useful 91 parts, 27 poses, six controls, seven outputs and four bindings', () => {
    const fixed = `earth-crust earth-mantle earth-outer-core earth-inner-core plate-crust plate-rigid-mantle plate-deep-mantle edge-div-left edge-div-right edge-sub-left edge-sub-right edge-slab edge-melt edge-trans-left edge-trans-right collision-fold volcano-cone volcano-host volcano-storage volcano-conduit volcano-vent volcano-bubbles volcano-lava volcano-ash fault-left fault-right fault-marker-left fault-marker-lock fault-marker-right fault-focus fault-epicentre sea-coast building-ground building-foundation building-frame building-floors building-core`.split(' ');
    expect(file.parts.map((p) => p.id).sort()).toEqual([...fixed, ...waves, ...water].sort());
    expect(Object.keys(file.poses!)).toHaveLength(27);
    expect(sim.controls.map((c) => c.id).sort()).toEqual(['flow-mode', 'sea-step', 'sea-uplift', 'water-depth', 'wave-kind', 'wave-step']);
    expect(sim.outputs).toHaveLength(7);
    expect(sim.bind).toHaveLength(4);
    expect(sim.kind).toBe('table');
    const sourceFile = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')) as { sources: { id: string; design?: boolean }[] };
    const sources = new Map(sourceFile.sources.map((s) => [s.id, s]));
    expect(tableSourceIssues(sim.table!, sim.outputs, sources)).toEqual([]);
  });

  it('has one and only one sourced table row for every permitted combination, with no extra keys or states', () => {
    expect(Object.keys(sim.table!.experiments).sort()).toEqual(['depth', 'sea', 'wave']);
    let count = 0;
    for (const [id, experiment] of Object.entries(sim.table!.experiments)) {
      const combinations = tableCombinations(experiment.keys.map((id) => sim.controls.find((c) => c.id === id)!));
      expect(experiment.rows, id).toHaveLength(id === 'depth' ? 3 : 18);
      for (const values of combinations) expect(experiment.rows.filter((r) => experiment.keys.every((k) => r.when[k] === values[k])), `${id} ${JSON.stringify(values)}`).toHaveLength(1);
      for (const row of experiment.rows) {
        expect(Object.keys(row.when).sort()).toEqual([...experiment.keys].sort());
        expect(row.source).toContain('S63');
        for (const [key, value] of Object.entries(row.set)) {
          const output = sim.outputs.find((o) => o.id === key)!;
          expect(output).toBeDefined();
          expect(output.from).toBeUndefined();
          if (typeof value === 'string') expect(output.states?.[value]).toBeDefined();
        }
      }
      count += experiment.rows.length;
    }
    expect(count).toBe(39);
    expect(resolveSimValues(sim, decodeSimParam('wave-step.99~wave-kind.invalid~sea-uplift.no~water-depth.0~unknown.4'))).toEqual(resolveSimValues(sim, {}));
  });

  it('contains eight independent chapters, 36 bilingual captions, visible indexed parts and only the two intended cards', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([3, 5, 5, 4, 4, 5, 5, 5]);
    expect(chapters.filter((c) => c.state.sim.try).map((c) => c.id)).toEqual(['slip-and-waves', 'moving-the-sea']);
    for (const ch of chapters) {
      const st = ch.state;
      expect(Object.keys(st.sim.set).sort(), ch.id).toEqual(sim.controls.map((c) => c.id).sort());
      expect(st).toMatchObject({ view: 'assembled', explode: 0, cutaway: 'none', run: false, part: null, pose: null, ghost: [] });
      expect(st.camera).toBeDefined();
      for (const id of st.index.parts) {
        const p = file.parts.find((p) => p.id === id)!;
        expect(p, `${ch.id} ${id}`).toBeDefined();
        expect(st.hide).not.toContain(id);
        expect(st.layers).toContain(p.group);
      }
      for (const beat of st.beats) {
        expect(beat.caption.en.length).toBeGreaterThan(20);
        expect(beat.caption.zh.length).toBeGreaterThan(8);
        const labels = beat.labels ?? st.labels;
        expect(labels.length).toBeLessThanOrEqual(6);
        for (const id of labels) expect(st.index.parts, `${ch.id} label ${id}`).toContain(id);
        if (beat.part) expect(st.index.parts).toContain(beat.part);
      }
    }
  });
});

describe('inside-the-earth: captions select the simulated states they describe', () => {
  it('binds the P/S captions to the expected snapshots and front distances', () => {
    const wave = chapters.find((c) => c.id === 'slip-and-waves');
    expect(wave.state.beats.map((b: { sim: { set: Record<string, unknown> } }) => b.sim.set['wave-step'])).toEqual([0, 0, 0, 3, 5]);
    expect(out({ ...wave.state.sim.set, ...wave.state.beats[3].sim.set })['wave-front']).toBe(3);
    expect(out({ ...wave.state.sim.set, ...wave.state.beats[4].sim.set })['wave-front']).toBe(2.5);
    expect(wave.state.beats[3].caption.en).toMatch(/upper P/);
    expect(wave.state.beats[4].caption.en).toMatch(/lower S/);
  });

  it('binds the sea captions and prediction to the source, snapshot and depth they describe', () => {
    const sea = chapters.find((c) => c.id === 'moving-the-sea');
    const expected = [
      ['no-uplift-in-model', 'water-rest', 4000], ['displaced', 'water-at-1', 4000],
      ['spreading', 'water-at-3', 4000], ['spreading', 'water-at-3', 100], ['spreading', 'water-at-3', 4000],
    ];
    sea.state.beats.forEach((b: { sim: { set: Record<string, unknown> } }, i: number) => {
      const o = out({ ...sea.state.sim.set, ...b.sim.set });
      expect([o['water-stage'], o['water-shape']]).toEqual(expected[i]!.slice(0, 2));
      expect(Number(o['longwave-ms'])).toBeCloseTo(Math.sqrt(9.8 * Number(expected[i]![2])), 10);
    });
    const prediction = sea.state.sim.try.predict;
    expect(prediction.start).toEqual({ 'sea-uplift': true, 'sea-step': 3, 'water-depth': 4000 });
    expect(prediction.change).toEqual({ 'water-depth': 100 });
    expect(prediction.observe).toBe('longwave-kmh');
  });
});

describe('inside-the-earth: independently calculated single-cycle wave snapshots', () => {
  for (let k = 0; k <= 8; k++) {
    it(`snapshot ${k}: both rows vibrate about their own rest positions; the inspected type changes only the front`, () => {
      const pose = `wave-snap-${k}`;
      expect(file.poses![pose]!.duration).toBe(0);
      expect(Object.keys(file.poses![pose]!.parts).sort()).toEqual([...waves].sort());
      for (const kind of ['p', 's']) {
        const set = { 'wave-kind': kind, 'wave-step': k };
        const o = out(set);
        expect(o['wave-shape']).toBe(k ? `wave-at-${k}` : 'wave-rest');
        expect(o['wave-stage']).toBe(k ? 'travelling' : 'rest');
        expect(o['wave-front']).toBe((kind === 'p' ? 4 : 2) * k / 4);
        const effects = fx(set);
        for (const wave of ['p', 's']) for (let i = 0; i < 17; i++) {
          const tau = k / 4 - (i / 2) / (wave === 'p' ? 4 : 2);
          const u = tau < 0 || tau > 1 ? 0 : 0.08 * Math.sin(2 * Math.PI * tau);
          const id = `wave-${wave}-${letters[i]}`;
          expect(effects.poses.get(id)).toBe(pose);
          closeVector(offset(pose, id), wave === 'p' ? [u, 0, 0] : [0, u, 0]);
        }
      }
    });
  }
  it('pins the nontrivial e-marker examples and zero wavefront/end points from the spec', () => {
    closeVector(offset('wave-snap-3', 'wave-p-e'), [0.08, 0, 0]);
    closeVector(offset('wave-snap-3', 'wave-s-e'), [0, 0, 0]);
    closeVector(offset('wave-snap-5', 'wave-p-e'), [-0.08, 0, 0]);
    closeVector(offset('wave-snap-5', 'wave-s-e'), [0, 0.08, 0]);
    for (const id of ['wave-p-a', 'wave-s-a', 'wave-p-q']) closeVector(offset('wave-snap-8', id), [0, 0, 0]);
  });
});

describe('inside-the-earth: independently calculated balanced sea displacements and long-wave speed', () => {
  for (let q = 0; q <= 8; q++) {
    it(`snapshot ${q}: signed displacement balances; the source retains its offset until switched off`, () => {
      const pose = `sea-snap-${q}`;
      expect(file.poses![pose]!.duration).toBe(0);
      expect(Object.keys(file.poses![pose]!.parts).sort()).toEqual([...water].sort());
      const K = (v: number) => Math.max(0, 1 - Math.abs(v));
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        const j = i - 8, d = (q - 1) / 2;
        const eta = q === 0 ? 0 : 0.06 * (K(j - d) + K(j + d) - K(j - 1 - d) - K(j + 1 + d));
        closeVector(offset(pose, `sea-column-${letters[i]}`), [0, eta, 0]);
        sum += offset(pose, `sea-column-${letters[i]}`)[1]!;
      }
      expect(Math.abs(sum)).toBeLessThan(1e-12);
      for (const [id, amount] of [['sea-bed', 0.06], ['sea-bed-left', -0.03], ['sea-bed-right', -0.03]] as const) closeVector(offset(pose, id), [0, q ? amount : 0, 0]);
      for (const uplift of [false, true]) {
        const set = { 'sea-step': q, 'sea-uplift': uplift };
        const o = out(set), effects = fx(set);
        expect(o['water-stage']).toBe(!uplift ? 'no-uplift-in-model' : q === 0 ? 'rest' : q === 1 ? 'displaced' : 'spreading');
        expect(o['water-shape']).toBe(uplift && q ? `water-at-${q}` : 'water-rest');
        for (const id of water) expect(effects.poses.get(id)).toBe(uplift ? pose : 'sea-snap-0');
        expect(effects.poses.has('sea-coast')).toBe(false);
      }
    });
  }

  it.each([[100, '31.3', '112.7'], [1000, '99.0', '356.4'], [4000, '198.0', '712.8']] as const)('depth %i m keeps full precision and formats the two units once', (h, ms, kmh) => {
    const o = out({ 'water-depth': h, 'sea-uplift': false });
    expect(Number(o['longwave-ms'])).toBeCloseTo(Math.sqrt(9.8 * h), 10);
    expect(Number(o['longwave-kmh'])).toBeCloseTo(Number(o['longwave-ms']) * 3.6, 10);
    expect(outputText(sim.outputs.find((o) => o.id === 'longwave-ms')!, o['longwave-ms']!, 'en')).toBe(ms);
    expect(outputText(sim.outputs.find((o) => o.id === 'longwave-kmh')!, o['longwave-kmh']!, 'en')).toBe(kmh);
    expect(o['water-stage']).toBe('no-uplift-in-model');
  });

  it('isolates wave, water snapshots and depth experiments over the full cross-product', () => {
    const baseline = { 'wave-kind': 's', 'wave-step': 5, 'sea-uplift': true, 'sea-step': 3, 'water-depth': 4000 };
    const b = out(baseline);
    for (const kind of ['p', 's']) for (let k = 0; k <= 8; k++) {
      const o = out({ ...baseline, 'wave-kind': kind, 'wave-step': k });
      for (const id of ['water-shape', 'water-stage', 'longwave-ms', 'longwave-kmh']) expect(o[id]).toBe(b[id]);
    }
    for (const uplift of [false, true]) for (let q = 0; q <= 8; q++) for (const h of [100, 1000, 4000]) {
      const o = out({ ...baseline, 'sea-uplift': uplift, 'sea-step': q, 'water-depth': h });
      for (const id of ['wave-shape', 'wave-stage', 'wave-front']) expect(o[id]).toBe(b[id]);
      const atSameSnapshot = out({ 'sea-uplift': uplift, 'sea-step': q });
      for (const id of ['water-shape', 'water-stage']) expect(o[id]).toBe(atSameSnapshot[id]);
    }
  });
});
