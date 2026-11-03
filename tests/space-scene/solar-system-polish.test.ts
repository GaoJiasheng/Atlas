import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NodeIO, type Document, type Primitive } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import sharp from 'sharp';
import { BufferGeometry, Color, Mesh, MeshStandardMaterial, ShaderLib, Texture, UniformsUtils, type WebGLRenderer } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { createPartMaterial, fadePartMaterial, stylePartMaterial, type PartStyle } from '../../src/engines/space-scene/stages/model3d/materials';
import { gltfSurface } from '../../src/engines/space-scene/stages/model3d/GltfSource';
import { cataloguePointSize, createCataloguePointMaterial } from '../../src/engines/space-scene/stages/model3d/CatalogueSky';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const baseline = partsFile.parse(json('scripts/geo/solar-system/baseline-parts.json'));
const live = partsFile.parse(json('src/content/topics/solar-system/data/parts.json'));
let model: Document;
const primitive = (id: string): Primitive => {
  const node = model.getRoot().listNodes().find(node => node.getName() === id);
  if (!node?.getMesh()) throw new Error(`Missing baked mesh ${id}`);
  return node.getMesh()!.listPrimitives()[0]!;
};

/** Connected components of referenced triangle vertices, excluding unused UV poles. */
function components(mesh: Primitive): number[][] {
  const indices = mesh.getIndices()!.getArray()!, count = mesh.getAttribute('POSITION')!.getCount();
  const parent = Array.from({ length: count }, (_, i) => i), used = new Set<number>();
  const root = (i: number): number => {
    while (parent[i] !== i) { parent[i] = parent[parent[i]!]!; i = parent[i]!; }
    return i;
  };
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i]!, b = indices[i + 1]!, c = indices[i + 2]!;
    parent[root(b)] = root(a); parent[root(c)] = root(a);
    used.add(a); used.add(b); used.add(c);
  }
  const groups = new Map<number, number[]>();
  for (const i of used) { const r = root(i); if (!groups.has(r)) groups.set(r, []); groups.get(r)!.push(i); }
  return [...groups.values()];
}

describe('solar-system polish: baked geometry and unchanged teaching contract', () => {
  beforeAll(async () => {
    await MeshoptDecoder.ready;
    model = await new NodeIO().registerExtensions([EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization])
      .registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read('public/models/solar-system.glb');
  });

  it('retains all 49 selections and the exact physical input bodies', () => {
    expect(live.parts.map(part => part.id)).toEqual(baseline.parts.map(part => part.id));
    expect(live.parts).toHaveLength(49);
    expect(live.sim!.solarSystem!.bodies).toEqual(baseline.sim!.solarSystem!.bodies);
    expect(live.sim!.solarSystem!.bodies).toHaveLength(9);
    expect(live.groups).toEqual(baseline.groups);
    for (const id of ['sun', 'asteroid-specimen', 'asteroid-belt', 'comet-nucleus', 'saturn-rings']) {
      expect(live.parts.find(part => part.id === id)?.mesh).toBe(id);
    }
  });

  it('exports finite, usable indexed surfaces with unit normals', () => {
    for (const mesh of model.getRoot().listMeshes()) for (const surface of mesh.listPrimitives()) {
      const positions = surface.getAttribute('POSITION')!, normals = surface.getAttribute('NORMAL')!;
      expect(positions.getCount(), mesh.getName()).toBeGreaterThan(3);
      expect(normals.getCount()).toBe(positions.getCount());
      expect(positions.getArray()!.every(Number.isFinite), mesh.getName()).toBe(true);
      expect(normals.getArray()!.every(Number.isFinite), mesh.getName()).toBe(true);
      const ns = Array.from({length:normals.getCount()},(_,i)=>normals.getElement(i,[])).flat();
      let maximumError = 0;
      for (let i = 0; i < ns.length; i += 3) maximumError = Math.max(maximumError, Math.abs(Math.hypot(ns[i]!, ns[i + 1]!, ns[i + 2]!) - 1));
      expect(maximumError, mesh.getName()).toBeLessThan(.005);
      const indices = surface.getIndices()!.getArray()!;
      expect(indices.length % 3).toBe(0);
      expect(indices.every(index => index >= 0 && index < positions.getCount())).toBe(true);
    }
  });

  it('preserves 36 separate belt bodies and gives the specimen a non-ellipsoidal surface', () => {
    const expected = baseline.parts.find(part => part.id === 'asteroid-belt')!.repeat!.count;
    const bodies = components(primitive('asteroid-belt'));
    expect(expected).toBe(36);
    expect(bodies).toHaveLength(expected);
    expect(bodies.every(vertices => vertices.length > 100)).toBe(true);
    const points = primitive('asteroid-specimen').getAttribute('POSITION')!.getArray()!;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < points.length; i++) { const axis = i % 3; lo[axis] = Math.min(lo[axis]!, points[i]!); hi[axis] = Math.max(hi[axis]!, points[i]!); }
    const center = lo.map((value, axis) => (value + hi[axis]!) / 2);
    const half = lo.map((value, axis) => (hi[axis]! - value) / 2);
    const radii: number[] = [];
    for (let i = 0; i < points.length; i += 3) radii.push(Math.hypot(
      (points[i]! - center[0]!) / half[0]!, (points[i + 1]! - center[1]!) / half[1]!, (points[i + 2]! - center[2]!) / half[2]!,
    ));
    const mean = radii.reduce((sum, value) => sum + value, 0) / radii.length;
    const deviation = Math.sqrt(radii.reduce((sum, value) => sum + (value - mean) ** 2, 0) / radii.length);
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(.15);
    expect(deviation).toBeGreaterThan(.03);
    expect(components(primitive('comet-nucleus'))).toHaveLength(1);
  });

  it('leaves an opening in the lunar orbit guide around the textured body', () => {
    const mesh=primitive('moon-demo'),groups=components(mesh),positions=mesh.getAttribute('POSITION')!.getArray()!;
    expect(groups).toHaveLength(2);
    const minimumRadii=groups.map(g=>Math.min(...g.map(i=>Math.hypot(positions[i*3]!,positions[i*3+1]!,positions[i*3+2]!)))).sort((a,b)=>a-b);
    expect(minimumRadii[0]).toBeCloseTo(.18,5);
    expect(minimumRadii[1]).toBeGreaterThan(.22);
  });

  it('leaves the Cassini division empty without triangles bridging its two edges', () => {
    const mesh = primitive('saturn-rings'), points = mesh.getAttribute('POSITION')!.getArray()!, indices = mesh.getIndices()!.getArray()!;
    const radii: number[] = [];
    for (let i = 0; i < points.length; i += 3) radii.push(Math.hypot(points[i]!, points[i + 2]!));
    expect(radii.some(radius => Math.abs(radius - 2.018) < .00001)).toBe(true);
    expect(radii.some(radius => Math.abs(radius - 2.096) < .00001)).toBe(true);
    expect(radii.some(radius => radius > 2.01801 && radius < 2.09599)).toBe(false);
    let bridges = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const triangle = [radii[indices[i]!]!, radii[indices[i + 1]!]!, radii[indices[i + 2]!]!];
      if (Math.min(...triangle) < 2.028 && Math.max(...triangle) > 2.086) bridges++;
    }
    expect(bridges).toBe(0);
  });

  it('separates opaque emissive photospheres from translucent corona shells', () => {
    for (const id of ['sun', 'comet-sun']) {
      const mesh = primitive(id), emission = mesh.getAttribute('_EMISSION')!.getArray()!, color = mesh.getAttribute('COLOR_0')!;
      const modes = new Set(emission);
      expect([...modes].sort()).toEqual([1, 2]);
      let photosphere = 0, corona = 0, invalidAlpha = 0;
      for (let i = 0; i < emission.length; i++) {
        const alpha = color.getElement(i,[])[3]!;
        if (emission[i] === 1) { photosphere++; if (alpha !== 1) invalidAlpha++; }
        if (emission[i] === 2) { corona++; if (!(alpha > 0 && alpha <= .21)) invalidAlpha++; }
      }
      expect(photosphere).toBeGreaterThan(1000); expect(corona).toBeGreaterThan(1000);
      expect(invalidAlpha).toBe(0);
      expect(live.parts.find(part => part.id === id)!.material!.color).toBe('membrane');
    }
  }, 20_000);
});

describe('solar-system polish: local image budgets', () => {
  it('vendors nine complete planet/moon textures below 60 KB each', async () => {
    const directory = 'scripts/geo/solar-system/textures';
    expect(existsSync('public/models/solar-system')).toBe(false);
    const names = readdirSync(directory).filter(name => name.endsWith('.webp')).sort();
    expect(names).toEqual(['earth', 'jupiter', 'mars', 'mercury', 'moon', 'neptune', 'saturn', 'uranus', 'venus'].map(id => `${id}.webp`));
    for (const name of names) {
      const embedded = model.getRoot().listTextures().find(texture => texture.getName() === name.replace('.webp', ''))!;
      expect(Buffer.from(embedded.getImage()!).equals(readFileSync(`${directory}/${name}`)), name).toBe(true);
      expect(statSync(`${directory}/${name}`).size, name).toBeLessThanOrEqual(60_000);
      const image = await sharp(`${directory}/${name}`).metadata();
      expect([image.width, image.height], name).toEqual([1024, 512]);
    }
  });

  it('keeps both chapter illustrations below 120 KB with high-density dimensions', async () => {
    for (const id of ['comet-tails', 'milky-way']) {
      const path = `public/illustrations/figures/solar-system-${id}.webp`;
      expect(statSync(path).size).toBeLessThanOrEqual(120_000);
      const image = await sharp(path).metadata();
      expect(image.width).toBeGreaterThanOrEqual(840);
      expect(image.height).toBeGreaterThanOrEqual(500);
    }
  });
});

describe('solar emission remains opt-in for existing topics', () => {
  it('guards the lighting replacement and retains the ordinary PBR shader path', () => {
    const { material, uniforms } = createPartMaterial();
    const shader = { uniforms: UniformsUtils.clone(ShaderLib.standard.uniforms), vertexShader: ShaderLib.standard.vertexShader, fragmentShader: ShaderLib.standard.fragmentShader } as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    expect(shader.vertexShader).toContain('vEmission = _emission;');
    expect(shader.fragmentShader).toMatch(/if\s*\(vEmission\s*>\s*0\.5\s*&&\s*vEmission\s*<\s*3\.5\)/);
    expect(shader.fragmentShader).toContain('outgoingLight = diffuseColor.rgb');
    expect(shader.fragmentShader).toContain('outgoingLight = diffuseColor.rgb * gain + totalEmissiveRadiance;');
    expect(shader.fragmentShader).toContain('#include <lights_physical_fragment>');
    expect(shader.fragmentShader).toContain('#include <opaque_fragment>');
    expect(uniforms.uOrbitLight.value).toBe(0);
    expect(uniforms.uGlow.value.toArray()).toEqual([0, 0, 0]);
    material.dispose();
  });

  for (const topic of ['aircon']) it(`${topic} has no geometry opting into solar emission`, () => {
    const file = partsFile.parse(json(`src/content/topics/${topic}/data/parts.json`));
    let vertices = 0;
    for (const part of file.parts) {
      const pieces = partPieces(part);
      for (const piece of pieces) {
        expect(Object.keys(piece.geometry.attributes).some(name => name.toLowerCase() === '_emission'), `${topic}/${part.id}`).toBe(false);
        vertices += piece.geometry.getAttribute('position').count;
        piece.geometry.dispose();
      }
    }
    expect(vertices).toBeGreaterThan(1000);
  }, 20_000);
});

/** GLB JSON is always readable even when mesh buffers are compressed. */
function glbJson(path: string) {
  const bytes = readFileSync(path);
  return JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString('utf8'));
}

const kitTexture = new Texture();
const partStyle = (theme: 'paper' | 'cinema'): PartStyle => ({
  look: resolveMaterialLook('matte', {}, theme, '#ffffff'),
  kit: { roughness: () => kitTexture, normal: () => kitTexture, albedo: () => null, dispose() {} },
  signal: '#cc6328', cold: '#4f7f8c', cut: '#b8973c', ink: '#2a2824', rim: .35, tint: .05, hatchPx: 7,
});

describe('opted-in GLB surfaces reach the real part material', () => {
  let gltf: GLTF;
  beforeAll(async () => {
    // Decode the real embedded images without a browser/GPU. GLTFLoader still owns
    // all material, colour-space, UV, alpha-mode and meshopt interpretation.
    vi.stubGlobal('self', globalThis);
    vi.stubGlobal('createImageBitmap', async (blob: Blob) => {
      const image = await sharp(Buffer.from(await blob.arrayBuffer())).metadata();
      return { width: image.width, height: image.height, close() {} };
    });
    await MeshoptDecoder.ready;
    const bytes = readFileSync('public/models/solar-system.glb');
    gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '',
    );
  });
  afterAll(() => { vi.unstubAllGlobals(); kitTexture.dispose(); });

  it.each(['paper', 'cinema'] as const)('keeps base-colour textures, sRGB and UV orientation on %s', theme => {
    const material = createPartMaterial();
    for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon-demo']) {
      const mesh = gltf.scene.getObjectByName(id) as Mesh;
      const surface = gltfSurface(mesh)!, source = surface.source;
      expect(source, id).toBeDefined();
      expect(source.map?.colorSpace, id).toBe('srgb');
      expect(source.map?.flipY, id).toBe(false);
      expect(mesh.geometry.getAttribute('uv').count, id).toBe(mesh.geometry.getAttribute('position').count);
      stylePartMaterial(material, partStyle(theme));
      surface.style(material.material);
      surface.fade(material.material, 1, false);
      expect(material.material.map, id).toBe(source.map);
      expect(material.material.color.toArray(), id).toEqual(source.color.toArray());
      expect(material.material.normalMap, id).toBeNull();
      expect(material.material.roughness, id).toBe(1);
      expect(material.material.transparent, id).toBe(false);
      expect(material.material.depthWrite, id).toBe(true);
      expect(source.map?.image.width, id).toBe(1024);
    }
    material.material.dispose();
  });

  it('preserves RGBA and soft-shell alpha through fades, ghosting and selection/clipping uniforms', () => {
    const pm = createPartMaterial();
    pm.uniforms.uSel.value = .7;
    pm.uniforms.uCut.value = 1;
    for (const id of ['sun', 'comet-sun', 'saturn-rings', 'comet-coma', 'ion-tail', 'dust-tail']) {
      const mesh = gltf.scene.getObjectByName(id) as Mesh, surface = gltfSurface(mesh)!, source = surface.source;
      expect(source.transparent, id).toBe(true);
      expect(source.vertexColors, id).toBe(true);
      expect(mesh.geometry.getAttribute('color').itemSize, id).toBe(4);
      stylePartMaterial(pm, partStyle('paper'));
      surface.style(pm.material);
      for (const fade of [1, .5, 0]) {
        surface.fade(pm.material, fade, false);
        expect(pm.material.opacity, id).toBe(fade * source.opacity);
        expect(pm.material.transparent, id).toBe(true);
        expect(pm.material.depthWrite, id).toBe(false);
      }
      expect(pm.uniforms.uSel.value).toBe(.7);
      expect(pm.uniforms.uCut.value).toBe(1);
    }
    const source = new MeshStandardMaterial({ opacity: .4, transparent: true, alphaTest: .1 });
    source.userData.atlasSurface = true;
    const mesh = new Mesh(new BufferGeometry(), source), surface = gltfSurface(mesh)!;
    stylePartMaterial(pm, partStyle('paper'));
    surface.style(pm.material);
    surface.fade(pm.material, .5, true);
    expect(pm.material.opacity).toBe(.2);
    expect(pm.material.alphaTest).toBe(.1);
    const ordinary = createPartMaterial();
    stylePartMaterial(ordinary, partStyle('paper'));
    fadePartMaterial(ordinary.material, 1, false);
    expect(ordinary.material.alphaTest).toBe(0);
    expect(ordinary.material.vertexColors).toBe(false);
    expect(ordinary.material.transparent).toBe(false);
    expect(ordinary.material.depthWrite).toBe(true);
    source.dispose(); mesh.geometry.dispose(); pm.material.dispose(); ordinary.material.dispose();
  });

  it('embeds every texture, opts in only authored materials, and connects the complete asset', () => {
    const asset = glbJson('public/models/solar-system.glb');
    expect(asset.images).toHaveLength(9);
    for (const image of asset.images) {
      expect(image.uri).toBeUndefined();
      expect(image.bufferView).toBeTypeOf('number');
      expect(image.mimeType).toBe('image/webp');
    }
    for (const node of asset.nodes) if (node.mesh !== undefined) {
      expect(live.parts.find(p => p.mesh === node.name), node.name).toBeDefined();
      const primitive = asset.meshes[node.mesh].primitives[0];
      expect(asset.materials[primitive.material].extras.atlasSurface).toBe(true);
    }
    expect(json('scripts/geo/solar-system/triangle-audit.json').max.live).toBeLessThan(350_000);
    expect(statSync('public/models/solar-system.glb').size).toBeLessThanOrEqual(1_500_000);
  });

  it.each(['bones-and-joints', 'heart-and-lungs', 'digestive-system', 'muscles-core', 'muscles-back', 'muscles-shoulders', 'muscles-chest', 'muscles-arms', 'muscles-legs', 'sample-solar'])('%s retains its existing material path and has no new surface opt-in', topic => {
    const file = json(`src/content/topics/${topic}/data/parts.json`);
    if (file.model) {
      const asset = glbJson(`public${file.model}`);
      for (const material of asset.materials ?? []) {
        const source = new MeshStandardMaterial();
        source.userData = material.extras ?? {};
        const mesh = new Mesh(new BufferGeometry(), source);
        expect(gltfSurface(mesh)).toBeUndefined();
        source.dispose(); mesh.geometry.dispose();
      }
    }
    for (const theme of ['paper', 'cinema'] as const) {
      const pm = createPartMaterial(), style = partStyle(theme);
      stylePartMaterial(pm, style);
      expect(pm.material.color.getHex()).toBe(new Color(style.look.color).getHex());
      expect(pm.material.roughnessMap).toBe(kitTexture);
      expect(pm.material.normalMap).toBe(kitTexture);
      for (const fade of [1, .8, .55, 0]) for (const ghost of [false, true]) {
        fadePartMaterial(pm.material, fade, ghost);
        expect(pm.material.opacity).toBe(fade);
        expect(pm.material.transparent).toBe(fade < .999);
        expect(pm.material.depthWrite).toBe(!ghost && fade > .6);
      }
      pm.material.dispose();
    }
  });
});

describe('catalogue stars use restrained CSS-pixel discs', () => {
  it.each(['#2a2824', '#e7e5df'])('keeps theme ink %s and a round antialiased point', color => {
    const material = createCataloguePointMaterial(color, 3.2);
    expect(material.color.getHexString()).toBe(color.slice(1));
    expect(material.size).toBe(3.2);
    expect(material.sizeAttenuation).toBe(false);
    expect(material.depthWrite).toBe(false);
    expect(material.toneMapped).toBe(false);
    const shader = { uniforms: {}, vertexShader: ShaderLib.points.vertexShader, fragmentShader: ShaderLib.points.fragmentShader } as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    expect(shader.fragmentShader).toContain('length(gl_PointCoord - vec2(0.5))');
    expect(shader.fragmentShader).toContain('#include <opaque_fragment>');
    material.dispose();
  });

  it('leaves sample-solar on its exact legacy point material and preserves every HYG row', () => {
    const original=json('public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json');
    const readable=json('public/catalogues/solar-system/stars-hyg-v41-readable-cc-by-sa.json');
    expect(readable.stars).toEqual(original.stars);
    const {pointSizeCssPx,...meta}=readable.meta;
    expect(meta).toEqual(original.meta);
    expect(pointSizeCssPx).toBe(5);
    const fixture=json('src/content/topics/sample-solar/data/parts.json');
    expect(fixture.sim.overlays.find((o:{kind:string})=>o.kind==='catalogue-sky').catalogue).toBe('stars-hyg-v41-cc-by-sa.json');
    expect(cataloguePointSize(original)).toBeUndefined();
    expect(cataloguePointSize(readable)).toBe(5);
    const material=createCataloguePointMaterial('#2a2824',cataloguePointSize(original));
    expect(material.size).toBe(.12);
    expect(material.sizeAttenuation).toBe(true);
    expect(material.onBeforeCompile).toBe(new MeshStandardMaterial().onBeforeCompile);
    material.dispose();
  });

  it('scales to renderer DPR exactly once at 1×, 1.5×, 2× and 3×', async () => {
    // Exercise Three's actual uniform uploader without constructing a WebGL context.
    const modulePath = 'three/src/renderers/webgl/WebGLMaterials.js';
    const { WebGLMaterials } = await import(modulePath);
    const uploader = WebGLMaterials({}, {}), material = createCataloguePointMaterial('#2a2824', 3.2);
    for (const dpr of [1, 1.5, 2, 3]) {
      const uniforms = UniformsUtils.clone(ShaderLib.points.uniforms);
      uploader.refreshMaterialUniforms(uniforms, material, dpr, 1080, null);
      expect(uniforms.size!.value / dpr).toBeCloseTo(3.2, 12);
    }
    material.dispose();
  });
});
