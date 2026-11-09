import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../src/engines/space-scene/schema';
import { eachPieces, partPieces } from '../src/engines/space-scene/stages/model3d/geometry';
import { partBounds, primitiveLocalBox, repeatTransforms } from '../src/engines/space-scene/lib/parts';

const raw = JSON.parse(readFileSync('src/content/topics/container-port/data/parts.json', 'utf8'));
const model = partsFile.parse(raw);
const part = (id: string) => model.parts.find(p => p.id === id)!;
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
  : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]))
    : value;
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');

describe('container-port realism rebuild contracts', () => {
  it('preserves the original teaching metadata, part IDs, simulation and authored poses', () => {
    // Baseline is the published parts.json before the 2026-11-02 rebuild.
    // Geometry, repeats and cameras may change; these hashes protect the lesson.
    const metadata = raw.parts.map(({ primitive: _primitive, extra: _extra, repeat: _repeat, mesh: _mesh, material: _material, ...rest }: Record<string, unknown>) => rest);
    expect(hash(metadata), 'part names, facts, IDs, links and explode contracts').toBe('644223784b90c37ee12fed49d14e1d45afa4bdc91822751740ceef33ae4eb396');
    const unchanged = {
      groups: '0dbe6631e5357105f751916fd0b5ab9fc4120f4a2260a8129b5512d62ba75296',
      poses: 'f3b17191eac66a04de6c5e03229a444214203a021d1855ee57fae92aad364d8e',
      sim: '8c37ff3eb1404f39bb91ae8a880d5cd6f809385b31e6eeab9eaadc23c44f9568',
      spec: '111b6be7725ae2650739ce0b230559b2adfbf37c4e3afb250897c947243d13b6',
    };
    for (const [key, expected] of Object.entries(unchanged)) expect(hash(raw[key]), key).toBe(expected);
    expect(model.parts).toHaveLength(32);
    expect(model.parts.filter(p => !p.context)).toHaveLength(30);
  });

  it('retains ISO sample extents and the four separate upper-corner lock locations', () => {
    for (const [id, length] of [['sample-20', 6.058], ['sample-40', 12.192]] as const) {
      const sample = part(id), bounds = primitiveLocalBox(sample.primitive!);
      expect(bounds.max.map((v, i) => v - bounds.min[i]!)).toEqual([expect.closeTo(length, 8), expect.closeTo(2.438, 8), expect.closeTo(2.591, 8)]);
      expect(sample.repeat?.count).toBe(4);
      expect(sample.extra ?? []).toEqual([]); // Count controls count whole containers.
    }
    const locks = part('twistlocks');
    const axes = [locks.primitive!, ...(locks.extra ?? [])].filter(p => p.kind === 'cylinder');
    const centres = repeatTransforms(locks.repeat).flatMap(copy => axes.map(p => p.at.map((v, i) => v + copy.offset[i]!)));
    expect(centres).toHaveLength(4);
    expect(new Set(centres.map(p => `${p[0]},${p[2]}`)).size).toBe(4);
    for (const p of centres) {
      expect(Math.abs(p[0]!)).toBeCloseTo(2.9, 8);
      expect(Math.abs(p[2]! + 18)).toBeCloseTo(1.1, 8);
    }
  });

  it('keeps the lift and rope-span coordinate frames aligned with the authored solver', () => {
    expect(part('working-box').primitive!.at).toEqual([0, 11.2955, -18]);
    expect(part('spreader').primitive!.at).toEqual([0, 12.891, -18]);
    expect(part('trolley').primitive!.at).toEqual([0, 50, -18]);
    for (const id of ['rope-a', 'rope-b', 'rope-c', 'rope-d']) {
      const rope = part(id).primitive!;
      expect(rope.kind).toBe('cylinder');
      expect(rope.at).toEqual([0, 0, 0]);
      if (rope.kind === 'cylinder') expect(rope.size[2]).toBe(1);
    }
  });

  it('bounds expanded triangles and mesh passes using decoded meshes and the renderer geometry factory', async () => {
    await MeshoptDecoder.ready;
    const glb=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+model.model!);
    const meshes=new Map(glb.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>[n.getName(),n.getMesh()!]));
    let triangles = 0, pieces = 0;
    for (const p of model.parts) {
      // The live lock binding uses each:true, so it takes the instanced path.
      if(p.mesh){for(const primitive of meshes.get(p.mesh)!.listPrimitives()){triangles+=primitive.getIndices()!.getCount()/3;pieces++;}continue;}
      for (const piece of p.id === 'twistlocks' ? eachPieces(p) : partPieces(p)) {
        if (!piece.lines) {
          pieces++;
          triangles += (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1);
        }
        piece.geometry.dispose();
      }
    }
    expect(triangles).toBeLessThan(350_000);
    expect(pieces).toBeLessThan(150);
  });

  it('builds dense ISO bays, eight RTG tyres and smooth lofts without new engine kinds', () => {
    const cargo=part('ship-cargo'), shells=[cargo.primitive!,...cargo.extra!];
    expect(shells).toHaveLength(32);
    expect(cargo.repeat?.count).toBe(10); // 10 bays × 8 lanes × 4 tiers.
    expect(shells.every(p=>p.kind==='extrude'&&p.depth===2.591)).toBe(true);
    const tyres=[part('yard-gantry').primitive!,...part('yard-gantry').extra!].filter(p=>p.color==='rubber');
    expect(tyres).toHaveLength(8);
    for(const p of model.parts)for(const q of [p.primitive!,...(p.extra??[])].filter(Boolean)) {
      if(q.kind==='sweep')expect(q.radial).toBeGreaterThanOrEqual(48);
      if(q.kind==='lathe')expect(q.segments).toBeGreaterThanOrEqual(48);
    }
  });

  it('leaves clearance for the live box at the source and across the portal', () => {
    const moving=partBounds(part('working-box'))!;
    const intersects=(a:typeof moving,b:typeof moving)=>[0,1,2].every(i=>a.min[i]!<b.max[i]!&&a.max[i]!>b.min[i]!);
    const cargo=part('ship-cargo');
    for(const p of [cargo.primitive!,...cargo.extra!])for(const copy of repeatTransforms(cargo.repeat)) {
      const bounds=partBounds({primitive:p})!;
      const shifted={min:bounds.min.map((v,i)=>v+copy.offset[i]!),max:bounds.max.map((v,i)=>v+copy.offset[i]!)};
      expect(intersects(moving,shifted as typeof moving),'vertical source lift corridor').toBe(false);
    }
    // The original solver carries the box with its bottom at y25. Include
    // the taller rebuilt spreader, then sweep through both portal planes.
    const crossing={min:[-3.5,25,-20],max:[3.5,30,12]} as typeof moving;
    for(const p of [part('portal').primitive!,...part('portal').extra!]) {
      expect(intersects(crossing,partBounds({primitive:p})!),'portal members must clear the suspended load').toBe(false);
    }
  });

  it('lands the box on the carrier deck while its guides remain outside the walls', () => {
    const body=part('agv-body');
    expect(partBounds({primitive:body.primitive})!.max[1]).toBeCloseTo(2,8);
    expect(partBounds(part('working-box'))!.min[1]-8).toBeCloseTo(2,8);
    const guides=body.extra!.filter(p=>p.kind==='box'&&p.size[1]===.48);
    expect(guides).toHaveLength(4);
    for(const guide of guides)expect(Math.abs(guide.at[2]-10)).toBeGreaterThan(1.219+.09);
  });

});
