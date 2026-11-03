/** Anatomy and local-asset regressions for the original procedural rebuild. */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { describe, expect, it } from 'vitest';
import { buildBird } from '../../scripts/geo/kits/bird';
import { FINE_BONE, THIN_BONE, diplodocid, longBone, theropodForelimb, theropodHindlimb, theropodPelvis, theropodSkull, vertebralColumn } from '../../scripts/geo/kits/dinosaur-skeleton';
import { partsFile, primitiveSchema, type Primitive } from '../../src/engines/space-scene/schema';

const ROOT = join(import.meta.dirname, '../..');
const file = partsFile.parse(JSON.parse(readFileSync(join(ROOT, 'src/content/topics/fossils-and-skeletons/data/parts.json'), 'utf8')));
const authored=JSON.parse(readFileSync(join(ROOT,'scripts/geo/fossils-and-skeletons/skeleton-source.json'),'utf8')) as typeof file.parts;
const geometry = (id: string) => {
  const part = authored.find(p=>p.id===id)??file.parts.find(p => p.id === id)!;
  return [part.primitive, ...(part.extra ?? [])].filter((p): p is Primitive => !!p);
};
const end = (p: Primitive): number[] => p.kind === 'sweep' ? p.at.map((v, i) => v + p.path.at(-1)![i]!) : p.at;
const samePoint = (a: readonly number[], b: readonly number[], epsilon = 1e-5) => a.every((v, i) => Math.abs(v - b[i]!) < epsilon);
const isClaw = (p: Primitive) => p.kind === 'sweep' && Array.isArray(p.radius) && p.radius.at(-1)! <= .002;

describe('fossils rebuild: reusable anatomical geometry', () => {
  it('all selectable kit modules fit the primitive limit and use smooth round surfaces', () => {
    const skull = theropodSkull();
    const modules = [...Object.values(buildBird()), skull.skull, skull.jaw, theropodPelvis(),
      theropodForelimb(.43), theropodForelimb(-.43), theropodHindlimb(.48), theropodHindlimb(-.48),
      vertebralColumn([[-2.3, 2.39, 0], [-1.65, 1.98, 0]], 10, .075, .105, .11),
      vertebralColumn([[2.4,1.73,0],[4.07,1.68,0]],24,.062,.008,.07,{chevrons:true,archLimit:8}),
      vertebralColumn([[.96, 1.94, 0], [2.4, 1.73, 0]], 16, .13, .062, .20, { chevrons: true })];
    for (const module of modules) {
      expect(module.length).toBeGreaterThan(0);
      expect(module.length).toBeLessThanOrEqual(33);
    }
    const museum = diplodocid(0, 0);
    expect(museum.length).toBeGreaterThan(33); // baked into one shared local mesh
    for (const p of modules.flat()) {
      expect(primitiveSchema.safeParse(p).success, p.kind).toBe(true);
      if (p.kind === 'sweep') expect(p.radial).toBeGreaterThanOrEqual(Math.max(...[p.radius].flat()) < FINE_BONE ? 16 : Math.max(...[p.radius].flat()) < THIN_BONE ? 24 : 48);
      if (p.kind === 'lathe') expect(p.segments).toBeGreaterThanOrEqual(48);
    }
    for(const p of museum){expect(primitiveSchema.safeParse(p).success).toBe(true);if(p.kind==='lathe')expect(p.segments).toBeGreaterThanOrEqual(12);if(p.kind==='sweep')expect(p.radial).toBeGreaterThanOrEqual(16);}
    expect(museum.filter(p => p.kind === 'lathe')).toHaveLength(15 + 10 + 5 + 80);
  });

  it('both living-bird feet have three forward toes, a backward hallux and matching curved claws', () => {
    const bird = buildBird();
    for (const side of [-1, 1]) {
      const foot = [-1.71, .30, side * .14];
      const digits = bird.legs.filter(p => p.kind === 'sweep' && samePoint(p.at, foot));
      const forward = digits.filter(p => end(p)[0]! < p.at[0]);
      const hallux = digits.filter(p => end(p)[0]! > p.at[0]);
      expect(forward).toHaveLength(3);
      expect(hallux).toHaveLength(1);
      expect(new Set(forward.map(p => end(p)[2])).size).toBe(3);
      for (const toe of [...forward, ...hallux]) {
        const claw = bird.legs.find(p => isClaw(p) && samePoint(p.at, end(toe)));
        expect(claw).toBeDefined();
        expect(Math.sign(end(claw!)[0]! - claw!.at[0])).toBe(Math.sign(end(toe)[0]! - toe.at[0]));
        expect(end(claw!)[1]).toBeLessThan(claw!.at[1]);
      }
    }
    expect(bird.legs.filter(p => p.kind === 'sweep' && p.rings)).toHaveLength(8);
  });

  it('tucks the myna feathered thigh into its belly above the scaled lower leg', () => {
    const layout=JSON.parse(readFileSync(join(ROOT,'scripts/geo/fossils-and-skeletons/model-layout.json'),'utf8')).studies.bird;
    const authorY=(y:number)=>(y-2-layout.lift)/layout.scale+layout.center[1];
    const thighs=geometry('myna-leg').filter(p=>p.kind==='sweep'&&p.tint==='token:ink-2'&&authorY(p.at[1])>.9);
    expect(thighs).toHaveLength(0); // continuous belly, no separate external femoral stump
    const scales=geometry('myna-leg').filter(p=>p.kind==='sweep'&&p.color==='scales');
    expect(scales).toHaveLength(12); // two tibiae, two tarsi, eight toes
    expect(scales.filter(p=>p.kind==='sweep'&&p.rings)).toHaveLength(10); // hallux uses the scale material's continuous pattern
    for(const part of file.parts.filter(p=>p.id.endsWith('-study'))) {
      expect(part.material).toEqual({color:'plastic',tint:'token:fossil'});
      expect(part.castShadow).toBe(true);
    }
    const platform=geometry('study-plinth')[0]!;
    expect(platform.kind).toBe('bevelBox');
    expect(geometry('study-plinth').filter(p=>p.kind==='bevelBox')).toHaveLength(3);
    expect(file.views.shadows).toBe('none'); // no global central shadow blob
    expect(geometry('myna-leg').filter(p=>p.color==='scales').every(p=>p.tint==='token:lamp')).toBe(true);
    expect(geometry('myna-body').filter(p=>p.kind==='sweep'&&p.tint==='token:lamp')).toHaveLength(2);
    expect(geometry('myna-wing').filter(p=>p.tint==='token:bone')).toHaveLength(4);
  });

  it('each of twelve dorsal vertebrae supports its own rib pair along the curved back', () => {
    const centres = geometry('sk-trunk').filter(p => p.kind === 'lathe').map(p => p.at);
    const ribs = geometry('sk-ribs').filter(p => p.kind === 'sweep' && centres.some(centre => samePoint(p.at, centre)));
    expect(centres).toHaveLength(12);
    expect(new Set(centres.map(p => JSON.stringify(p))).size).toBe(12);
    expect(ribs).toHaveLength(24);
    expect(Math.max(...centres.map(p => p[1])) - Math.min(...centres.map(p => p[1]))).toBeGreaterThan(.1);
    for (const centre of centres) {
      const pair = ribs.filter(p => samePoint(p.at, centre));
      expect(pair).toHaveLength(2);
      expect(end(pair[0]!)[2]! * end(pair[1]!)[2]!).toBeLessThan(0);
      expect(pair.every(p => end(p)[1]! < p.at[1])).toBe(true);
    }
    const drops = ribs.map(p => p.at[1] - end(p)[1]!);
    expect(new Set(drops.map(v => v.toFixed(4))).size).toBeGreaterThan(8);
    expect(drops.at(-1)).toBeLessThan(drops[0]! * .7);
  });

  it('direct-record limbs have narrow bone shafts, separate articular ends and articulated digits', () => {
    const shaft = longBone([0, 1, 0], [0, 0, 0], .04, .08);
    expect(shaft.kind).toBe('sweep');
    if (shaft.kind !== 'sweep' || !Array.isArray(shaft.radius)) throw new Error('long bone must have a varying radius');
    expect(shaft.radius[1]).toBeGreaterThan(shaft.radius[3]! * 1.8);
    expect(shaft.radius.at(-2)).toBeGreaterThan(shaft.radius[3]! * 1.8);
    for (const side of [-1, 1]) {
      const arm = theropodForelimb(side * .43), leg = theropodHindlimb(side * .48);
      expect(arm.filter(isClaw)).toHaveLength(2);
      const footClaws = leg.filter(isClaw);
      expect(footClaws.filter(p => end(p)[0]! < p.at[0])).toHaveLength(3);
      const hallux = footClaws.filter(p => end(p)[0]! > p.at[0]);
      expect(hallux).toHaveLength(1);
      expect(end(hallux[0]!)[1]).toBeGreaterThan(Math.max(...footClaws.filter(p => end(p)[0]! < p.at[0]).map(p => end(p)[1]!)));
      // Every main claw joins a final phalanx; no fleshy continuous leg-to-toe tube.
      for (const claw of footClaws) expect(leg.some(p => p !== claw && samePoint(end(p), claw.at))).toBe(true);
      expect(leg.filter(p => p.kind === 'sweep' && Array.isArray(p.radius) && p.radius.length >= 8).length).toBeGreaterThanOrEqual(15);
    }
  });
});

describe('fossils rebuild: vendored museum asset', () => {
  it('decodes locally into independent evidence modules and three shared finite museum skeletons', async () => {
    expect(file.model).toMatch(/^\/models\/fossils-and-skeletons(?:\/[^/]+)?\.glb$/);
    const path = join(ROOT, `public${file.model!}`);
    expect(statSync(path).size).toBeLessThanOrEqual(2_500_000);
    await MeshoptDecoder.ready;
    const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(path);
    const root = doc.getRoot();
    expect(root.listExtensionsRequired().map(e => e.extensionName)).toContain('EXT_meshopt_compression');
    const nodes = root.listNodes();
    expect(nodes.map(n => n.getName()).sort()).toEqual(file.parts.filter(p=>p.mesh).map(p=>p.mesh).sort());
    const museum=nodes.filter(n=>n.getName().endsWith('-study'));
    expect(museum).toHaveLength(3);
    expect(root.listMeshes()).toHaveLength(13);
    expect(museum.every(n=>n.getMesh()===museum[0]!.getMesh())).toBe(true);
    // Every evidence selector still owns its own mesh and transform. Filtering
    // can reuse these immutable buffers, including when whole restores them.
    const evidence=nodes.filter(n=>n.getName().startsWith('sk-'));
    expect(evidence).toHaveLength(12);
    expect(new Set(evidence.map(n=>n.getMesh())).size).toBe(12);
    const triangles=(n:typeof nodes[number])=>n.getMesh()!.listPrimitives().reduce((a,p)=>a+p.getIndices()!.getCount()/3,0);
    expect(evidence.reduce((a,n)=>a+triangles(n),0)).toBeLessThan(100_000);
    expect(museum.reduce((a,n)=>a+triangles(n),0)).toBeLessThan(200_000); // shadows are disabled; three studies share one mesh
    for(const part of file.parts.filter(p=>p.group==='skeleton')){expect(part.primitive).toBeUndefined();expect(part.extra).toBeUndefined();expect(authored.find(p=>p.id===part.id)?.primitive).toBeDefined();} // no runtime tessellation/replacement on an evidence filter
    // Three separate ribcages, with enough depth separation to avoid their
    // silhouettes interleaving from the elevated museum camera.
    const zs=museum.map(n=>n.getTranslation()[2]).sort((a,b)=>a-b);
    expect(zs[1]!-zs[0]!).toBeGreaterThan(3);
    expect(zs[2]!-zs[1]!).toBeGreaterThan(3);
    for (const node of nodes) expect(file.parts.find(p => p.id === node.getName())?.mesh).toBe(node.getName());
    await doc.transform(dequantize());
    for (const primitive of root.listMeshes().flatMap(m=>m.listPrimitives())) {
      const positions = primitive.getAttribute('POSITION')!, normals = primitive.getAttribute('NORMAL')!;
      expect(positions.getCount()).toBeGreaterThan(100);
      expect(normals.getCount()).toBe(positions.getCount());
      expect(Array.from(positions.getArray()!).every(Number.isFinite)).toBe(true);
      expect(Array.from(normals.getArray()!).every(Number.isFinite)).toBe(true);
      const normal: number[] = [];
      let minimumLength = Infinity, maximumLength = 0;
      for (let i = 0; i < normals.getCount(); i++) {
        normals.getElement(i, normal);
        const length = Math.hypot(...normal);
        minimumLength = Math.min(minimumLength, length);
        maximumLength = Math.max(maximumLength, length);
      }
      expect(minimumLength).toBeGreaterThan(.9);
      expect(maximumLength).toBeLessThan(1.1);
    }
  });
});
