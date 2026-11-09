/** Offline depth-raster preview of the actual digestive parts and decoded meshopt
 * asset. Reuses the fossil studio's GGX, ACES and sampled RoomEnvironment.
 * This numerical CPU study is NOT GPU/browser acceptance: PMREM filtering,
 * shadows and procedural micro-normal maps are approximate/omitted.
 *
 * pnpm tsx scripts/geo/digestive-system/preview.ts --out /tmp/atlas-digestive-rebuild/round1 --round round1
 * pnpm tsx scripts/geo/digestive-system/preview.ts --input /tmp/atlas-digestive-rebuild/before/parts.json --model /tmp/atlas-digestive-rebuild/before/model.glb --out /tmp/atlas-digestive-rebuild/before --round before
 * Options: --width 1000 --height 800 --theme paper,cinema --shot tooth-front,villi-detail --metrics-only
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder as RuntimeMeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Box3, BufferAttribute, BufferGeometry, Color, Matrix3, Matrix4, Mesh, PerspectiveCamera, Vector3 } from 'three';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces, type ShapePiece } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { aces, prepareStudio, studioRigs, studioShade } from '../fossils-and-skeletons/studio-cpu';

type V = [number, number, number];
type Theme = 'paper' | 'cinema';
const args = process.argv.slice(2);
const option = (key: string, fallback: string) => { const i = args.indexOf(`--${key}`); return i < 0 ? fallback : args[i + 1] ?? fallback; };
const out = option('out', '/tmp/atlas-digestive-rebuild/preview');
const round = option('round', 'preview');
const input = option('input', 'src/content/topics/digestive-system/data/parts.json');
const file = partsFile.parse(JSON.parse(fs.readFileSync(input, 'utf8')));
const model = option('model', `public${file.model}`);
const W = Number(option('width', '1000')), H = Number(option('height', '800'));
assert(W >= 100 && H >= 100 && W <= 4096 && H <= 4096, 'Preview dimensions must be 100–4096 px.');
const themes = option('theme', 'paper,cinema').split(',') as Theme[];
assert(themes.every(t => t === 'paper' || t === 'cinema'));
fs.mkdirSync(out, { recursive: true });

/** Guard the VALUES used by CPU shading against the actual runtime source.
 * A changed engine rig must fail before rendering, rather than silently check a token file. */
function guardStudio() {
  const source = fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx', 'utf8');
  for (const theme of ['paper', 'cinema'] as const) {
    const body = source.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))?.[1];
    assert(body, `Missing ${theme} runtime rig`);
    const actual = studioRigs[theme];
    for (const [i, key] of ['key', 'fill', 'rim'].entries()) {
      const values: string = body.match(new RegExp(`${key}: \\[([^\\]]+)`))![1]!;
      const hex: string = values.match(/'([^']+)'/)![1]!;
      const intensity: number = Number(values.split(',')[1]);
      assert.equal(hex, actual.lights[i]![0], `${theme} ${key} color drift`);
      assert.equal(intensity, actual.lights[i]![1], `${theme} ${key} intensity drift`);
      const direction = source.match(new RegExp(`const ${key.toUpperCase()}_DIR: Vec3 = normalize3\\(\\[([^\\]]+)`))![1]!.split(',').map(Number);
      assert.deepEqual(direction, [...actual.lights[i]![2]], `${theme} ${key} direction drift`);
    }
    const hemi = body.match(/hemi: \[([^\]]+)/)![1]!;
    const colors = [...hemi.matchAll(/'([^']+)'/g)].map(m => new Color(m[1]!).toArray());
    assert.deepEqual(colors, [actual.hemi[0], actual.hemi[1]], `${theme} hemisphere colors drift`);
    assert.equal(Number(hemi.split(',')[2]), actual.hemi[2]);
    assert.equal(Number(body.match(/env: ([\d.]+)/)![1]), actual.env);
    assert.equal(Number(body.match(/exposure: ([\d.]+)/)![1]), actual.exposure);
  }
  const gltf = fs.readFileSync('src/engines/space-scene/stages/model3d/GltfSource.tsx', 'utf8');
  for (const required of ['source.userData.atlasSurface !== true', 'target.color.multiply(source.color)', 'target.roughness = source.roughness', 'target.metalness = source.metalness', 'target.vertexColors = source.vertexColors']) assert(gltf.includes(required), `Runtime GLB material contract changed: ${required}`);
  const materials = fs.readFileSync('src/engines/space-scene/stages/model3d/materials.ts', 'utf8');
  assert(materials.includes('material.envMapIntensity = look.envIntensity'));
  assert(materials.includes('material.vertexColors ? 0 : look.glow'));
  const stage = fs.readFileSync('src/engines/space-scene/stages/model3d/Model3DStage.tsx', 'utf8');
  assert(!/\bflat\s*:\s*true|\btoneMapping\s*:/.test(stage), 'Stage overrides the R3F ACES default');
  const r3fDirectory = 'node_modules/@react-three/fiber/dist';
  const renderer = fs.readdirSync(r3fDirectory).filter(name => /^events-.*\.esm\.js$/.test(name)).map(name => fs.readFileSync(path.join(r3fDirectory, name), 'utf8')).join('\n');
  assert(renderer.includes('gl.toneMapping = flat ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping'), 'Installed R3F default ACES changed');
  return { runtimeLighting: 'src/engines/space-scene/stages/model3d/Lighting.tsx', valuesCheckedAgainstRuntime: true, materialContractChecked: true, actualRendererACESChecked: true };
}
const guard = guardStudio();
const css = fs.readFileSync('src/theme/tokens.css', 'utf8');
const tokens = (theme: Theme): Record<string, string> => {
  const at = css.indexOf(`:root[data-theme="${theme}"] {`);
  assert(at >= 0, `Missing ${theme} theme`);
  return Object.fromEntries([...css.slice(at, css.indexOf('\n}', at)).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1]!, m[2]!]));
};

await MeshoptDecoder.ready;
const document = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(model);
await document.transform(dequantize());
type SourceSurface = { factor: number[]; roughness: number; metalness: number; opacity: number; doubleSided: boolean };
const meshes = new Map<string, { geometry: BufferGeometry; surface?: SourceSurface }>();
for (const node of document.getRoot().listNodes()) {
  const primitive = node.getMesh()?.listPrimitives()[0];
  if (!primitive) continue;
  assert.equal(node.getMesh()!.listPrimitives().length, 1, `Runtime accepts first mesh primitive for ${node.getName()}`);
  const geometry = new BufferGeometry();
  for (const [name, semantic] of [['position', 'POSITION'], ['normal', 'NORMAL'], ['color', 'COLOR_0']] as const) {
    const attr = primitive.getAttribute(semantic);
    if (attr) geometry.setAttribute(name, new BufferAttribute(new Float32Array(attr.getArray()!), attr.getElementSize()));
  }
  const index = primitive.getIndices();
  if (index) geometry.setIndex(new BufferAttribute(new Uint32Array(index.getArray()!), 1));
  geometry.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
  if (!geometry.hasAttribute('normal')) geometry.computeVertexNormals();
  const material = primitive.getMaterial();
  const surface = material?.getExtras().atlasSurface === true ? { factor: material.getBaseColorFactor().slice(0, 3), roughness: material.getRoughnessFactor(), metalness: material.getMetallicFactor(), opacity: material.getBaseColorFactor()[3], doubleSided: material.getDoubleSided() } : undefined;
  meshes.set(node.getName(), { geometry, surface });
}
const pieceCache = new Map<string, ShapePiece[]>();
function pieces(part: Part): ShapePiece[] {
  if (!pieceCache.has(part.id)) {
    if (part.mesh) { assert(meshes.has(part.mesh), `Missing ${part.mesh}`); pieceCache.set(part.id, [{ geometry: meshes.get(part.mesh)!.geometry, matrices: null }]); }
    else pieceCache.set(part.id, partPieces(part));
  }
  return pieceCache.get(part.id)!;
}
const metrics = Object.fromEntries(file.parts.map(part => {
  const ps = pieces(part).filter(p => !p.lines);
  const bounds = new Box3();
  for (const piece of ps) {
    const local = new Box3().setFromBufferAttribute(piece.geometry.getAttribute('position') as BufferAttribute);
    for (const matrix of piece.matrices ?? [new Matrix4()]) {
      const box = local.clone().applyMatrix4(matrix);
      if (!part.mesh) box.translate(new Vector3(...part.primitive!.at));
      bounds.union(box);
    }
  }
  return [part.id, { triangles: ps.reduce((n, p) => n + (p.geometry.index?.count ?? p.geometry.getAttribute('position').count) / 3 * (p.matrices?.length ?? 1), 0), estimatedDrawCalls: ps.length, source: part.mesh ? 'glb' : 'primitive', bounds }];
}));
const total = { triangles: Object.values(metrics).reduce((n, m) => n + m.triangles, 0), estimatedDrawCalls: Object.values(metrics).reduce((n, m) => n + m.estimatedDrawCalls, 0), glbBytes: fs.statSync(model).size };
if (args.includes('--loader-check')) {
  // Same loader and inline decoder module used by GltfSource, without WebGL.
  // Besides document decoding this exercises the normalized COLOR_0 and
  // quantized node transform that three will actually hand to the renderer.
  const bytes = fs.readFileSync(model);
  const loader = new GLTFLoader().setMeshoptDecoder(RuntimeMeshoptDecoder);
  const loaded = await loader.parseAsync(new Uint8Array(bytes).buffer, '');
  loaded.scene.updateMatrixWorld(true);
  const checked: string[] = [];
  for (const id of ['tooth-section', 'stomach-wall', 'villi-block', 'villi-field']) {
    const part = file.parts.find(p => p.id === id)!;
    if (!part.mesh) continue;
    const mesh = loaded.scene.getObjectByName(part.mesh) as Mesh | undefined;
    assert(mesh?.isMesh, `Production GLTFLoader missing mesh ${part.mesh}`);
    const geometry = mesh.geometry, runtimeBounds = new Box3(), point = new Vector3();
    const position = geometry.getAttribute('position');
    // Do not mutate a normalized integer BufferAttribute with applyMatrix4:
    // its setters would quantize the world positions back into the integers.
    for (let i = 0; i < position.count; i++) runtimeBounds.expandByPoint(point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
    const expected = metrics[id]!.bounds;
    assert(runtimeBounds.min.distanceTo(expected.min) < 1e-5 && runtimeBounds.max.distanceTo(expected.max) < 1e-5, `Runtime/NodeIO world-bounds mismatch for ${id}: runtime=${JSON.stringify(runtimeBounds)} CPU=${JSON.stringify(expected)}`);
    assert.equal(geometry.getAttribute('color')?.count, geometry.getAttribute('position').count, `Missing runtime COLOR_0 for ${id}`);
    checked.push(id);
  }
  fs.writeFileSync(path.join(out, 'production-loader.json'), JSON.stringify({ loader: 'three/examples/jsm/loaders/GLTFLoader.js', decoder: 'three/examples/jsm/libs/meshopt_decoder.module.js', checked, checks: ['world-space quantized bounds', 'COLOR_0 vertex count'], browserOrWebGLUsed: false }, null, 2));
}
fs.writeFileSync(path.join(out, 'metrics.json'), JSON.stringify({ round, input, model, guard, perPart: metrics, allAuthoredParts: total, note: 'All authored parts summed; normal chapter visibility is lower. Draw estimates exclude shadows and overlays. CPU preview omits GPU shadowing and procedural normal maps; finite RoomEnvironment sampling approximates PMREM.' }, null, 2));
if (args.includes('--metrics-only')) process.exit(0);

type Surface = { id: string; positions: Float32Array; normals: Float32Array; colors: Float32Array; color: V; roughness: number; metalness: number; opacity: number; doubleSided: boolean; envIntensity: number; emissive: V };
function surfaces(ids: string[], theme: Theme) {
  const result: Surface[] = [];
  for (const id of ids) {
    const part = file.parts.find(p => p.id === id)!;
    assert(part, `Missing part ${id}`);
    const slots = partMaterialSlots(part), source = part.mesh ? meshes.get(part.mesh)!.surface : undefined;
    const offset = part.mesh ? new Vector3() : new Vector3(...part.primitive!.at);
    for (const piece of pieces(part)) {
      if (piece.lines) continue;
      const slot = part.mesh ? part.material! : slots[piece.slot ?? 0]!;
      const look = resolveMaterialLook(slot.color, tokens(theme), theme, slot.tint);
      const geometry = piece.geometry, ps = geometry.getAttribute('position'), ns = geometry.getAttribute('normal'), cs = geometry.getAttribute('color'), index = geometry.index;
      const color = new Color(look.color), emissive = color.clone().multiplyScalar(cs ? 0 : look.glow);
      if (source) color.multiply(new Color().fromArray(source.factor));
      for (const matrix of piece.matrices ?? [new Matrix4()]) {
        const n = index?.count ?? ps.count;
        const positions = new Float32Array(n * 3), normals = new Float32Array(n * 3), colors = new Float32Array(n * 3);
        const nm = new Matrix3().getNormalMatrix(matrix), vertex = new Vector3(), normal = new Vector3();
        for (let i = 0; i < n; i++) {
          const j = index ? index.getX(i) : i;
          vertex.fromBufferAttribute(ps, j).applyMatrix4(matrix).add(offset);
          normal.fromBufferAttribute(ns, j).applyMatrix3(nm).normalize();
          positions.set(vertex.toArray(), i * 3); normals.set(normal.toArray(), i * 3);
          colors.set(cs ? [cs.getX(j), cs.getY(j), cs.getZ(j)] : [1, 1, 1], i * 3);
        }
        result.push({ id, positions, normals, colors, color: color.toArray() as V, roughness: source?.roughness ?? look.roughness * .92, metalness: source?.metalness ?? look.metalness, opacity: look.opacity * (source?.opacity ?? 1), doubleSided: source?.doubleSided ?? look.doubleSided, envIntensity: look.envIntensity, emissive: emissive.toArray() as V });
      }
    }
  }
  return result;
}
prepareStudio();
// Same sampled room as studio-cpu. Supplying this callback additionally applies
// the FAMILY envMapIntensity actually retained by GltfSource's atlasSurface.
const roomMaps = JSON.parse(fs.readFileSync('/private/tmp/fossils-fix-2026-11-04/room-radiance-v2.json', 'utf8')) as number[][];
function environment(direction: V, roughness: number) {
  const lod = roughness >= .85 ? 0 : roughness >= .65 ? 1 : roughness >= .45 ? 2 : 3, map = roomMaps[lod]!;
  const x = ((Math.atan2(direction[2], direction[0]) / (2 * Math.PI) + 1) % 1) * 96 - .5;
  const y = Math.acos(Math.max(-1, Math.min(1, direction[1]))) / Math.PI * 48 - .5;
  const ix = Math.floor(x), iy = Math.floor(y), u = x - ix, v = y - iy;
  const at = (a: number, b: number) => map[Math.max(0, Math.min(47, b)) * 96 + ((a % 96 + 96) % 96)]!;
  return (at(ix, iy) * (1 - u) + at(ix + 1, iy) * u) * (1 - v) + (at(ix, iy + 1) * (1 - u) + at(ix + 1, iy + 1) * u) * v;
}
function render(shapes: Surface[], camera: PerspectiveCamera, theme: Theme) {
  const depth = new Float32Array(W * H).fill(Infinity), image = new Float32Array(W * H * 3), ids = new Array<string>(W * H).fill('');
  const bg = new Color(tokens(theme).paper ?? (theme === 'paper' ? '#e9e4d8' : '#1f2124')).toArray();
  const matrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), e = matrix.elements;
  const q = new Float64Array(9), invW = new Float64Array(3);
  for (const s of shapes) {
    const ps = s.positions, ns = s.normals;
    for (let t = 0; t < ps.length; t += 9) {
      const ab: V = [ps[t + 3]! - ps[t]!, ps[t + 4]! - ps[t + 1]!, ps[t + 5]! - ps[t + 2]!], ac: V = [ps[t + 6]! - ps[t]!, ps[t + 7]! - ps[t + 1]!, ps[t + 8]! - ps[t + 2]!];
      const facing = (ab[1] * ac[2] - ab[2] * ac[1]) * (camera.position.x - ps[t]!) + (ab[2] * ac[0] - ab[0] * ac[2]) * (camera.position.y - ps[t + 1]!) + (ab[0] * ac[1] - ab[1] * ac[0]) * (camera.position.z - ps[t + 2]!);
      if (facing <= 0 && !s.doubleSided) continue;
      for (let k = 0; k < 3; k++) {
        const x = ps[t + k * 3]!, y = ps[t + k * 3 + 1]!, z = ps[t + k * 3 + 2]!;
        const iw = 1 / (e[3]! * x + e[7]! * y + e[11]! * z + e[15]!); invW[k] = iw;
        q[k * 3] = ((e[0]! * x + e[4]! * y + e[8]! * z + e[12]!) * iw * .5 + .5) * W;
        q[k * 3 + 1] = (-(e[1]! * x + e[5]! * y + e[9]! * z + e[13]!) * iw * .5 + .5) * H;
        q[k * 3 + 2] = (e[2]! * x + e[6]! * y + e[10]! * z + e[14]!) * iw;
      }
      if ([q[2]!, q[5]!, q[8]!].some(z => z < -1 || z > 1)) continue;
      const ax = q[0]!, ay = q[1]!, bx = q[3]!, by = q[4]!, cx = q[6]!, cy = q[7]!;
      const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(d) < 1e-9) continue;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let a = ((by - cy) * (x + .5 - cx) + (cx - bx) * (y + .5 - cy)) / d, b = ((cy - ay) * (x + .5 - cx) + (ax - cx) * (y + .5 - cy)) / d, c = 1 - a - b;
        if (a < 0 || b < 0 || c < 0) continue;
        const z = a * q[2]! + b * q[5]! + c * q[8]!, pixel = y * W + x;
        if (z >= depth[pixel]!) continue;
        depth[pixel] = z; ids[pixel] = s.id;
        const total = a * invW[0]! + b * invW[1]! + c * invW[2]!;
        a = a * invW[0]! / total; b = b * invW[1]! / total; c = c * invW[2]! / total;
        const flip = facing <= 0 ? -1 : 1;
        const normal: V = [flip * (a * ns[t]! + b * ns[t + 3]! + c * ns[t + 6]!), flip * (a * ns[t + 1]! + b * ns[t + 4]! + c * ns[t + 7]!), flip * (a * ns[t + 2]! + b * ns[t + 5]! + c * ns[t + 8]!)];
        const length = Math.hypot(...normal) || 1; for (let i = 0; i < 3; i++) normal[i]! /= length;
        const view: V = [camera.position.x - a * ps[t]! - b * ps[t + 3]! - c * ps[t + 6]!, camera.position.y - a * ps[t + 1]! - b * ps[t + 4]! - c * ps[t + 7]!, camera.position.z - a * ps[t + 2]! - b * ps[t + 5]! - c * ps[t + 8]!];
        const vl = Math.hypot(...view); for (let i = 0; i < 3; i++) view[i]! /= vl;
        const base = s.color.map((v, i) => v * (a * s.colors[t + i]! + b * s.colors[t + 3 + i]! + c * s.colors[t + 6 + i]!)) as V;
        const lit = studioShade(base, normal, view, theme, Math.max(.0525, s.roughness), s.metalness, (direction, roughness) => environment(direction, roughness) * s.envIntensity);
        for (let i = 0; i < 3; i++) image[pixel * 3 + i] = (lit[i]! + s.emissive[i]!) * s.opacity + bg[i]! * (1 - s.opacity);
      }
    }
  }
  const rgb = new Uint8Array(W * H * 3), color = new Color();
  for (let i = 0; i < W * H; i++) {
    if (!ids[i]) color.fromArray(bg); else color.fromArray(aces([image[i * 3]!, image[i * 3 + 1]!, image[i * 3 + 2]!], studioRigs[theme].exposure));
    color.convertLinearToSRGB(); for (let j = 0; j < 3; j++) rgb[i * 3 + j] = Math.round(color.toArray()[j]! * 255);
  }
  return sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).png();
}

// Fixed specimen camera anchors let before/after images share framing. Mesh
// positions remain in runtime world space, including quantization transforms.
const heroes = [
  { name: 'tooth', ids: ['tooth-section'], target: [.5, -.016, .05] as V, span: .175, detail: [.5, .025, .054] as V, detailSpan: .080 },
  { name: 'stomach', ids: ['stomach-wall'], target: [.72, .026, .05] as V, span: .185, detail: [.72, .048, .067] as V, detailSpan: .090 },
  { name: 'villi', ids: ['villi-block', 'villi-field'], target: [.94, .029, .05] as V, span: .195, detail: [.94, .050, .10] as V, detailSpan: .090 },
];
type View = { name: string; direction: V; camera?: { position: V; target: V; fov: number } };
const views: View[] = [{ name: 'front', direction: [0, .08, 1] as V }, { name: 'three-quarter', direction: [.8, .55, 1] as V }, { name: 'profile', direction: [1, .18, .02] as V }, { name: 'detail', direction: [.10, .55, 1] as V }];
// Optional acceptance view reads the actual chapter camera. This stays tied to
// what beat 5-4 passes to the renderer, rather than a separately copied preset.
if (option('shot', '').split(',').includes('villi-beat5-4')) {
  const chapter = fs.readFileSync('src/content/topics/digestive-system/chapters/05-small-intestine-chapter.mdx', 'utf8');
  const state = parseYaml(chapter.split('---')[1]!).state;
  const camera = state.beats[3].camera;
  assert(Array.isArray(camera.position) && Array.isArray(camera.target) && Number.isFinite(camera.fov), 'Beat 5-4 must supply an explicit camera');
  views.push({ name: 'beat5-4', direction: [0, 0, 1], camera });
}
const manifest: object[] = [];
for (const hero of heroes) for (const view of views) {
  const shot = `${hero.name}-${view.name}`, selection = option('shot', '').split(',');
  if (selection[0] && !selection.includes(shot)) continue;
  const target = view.name === 'detail' ? hero.detail : hero.target, span = view.name === 'detail' ? hero.detailSpan : hero.span;
  const camera = new PerspectiveCamera(view.camera?.fov ?? 30, W / H, .05, 200);
  if (view.camera) camera.position.fromArray(view.camera.position);
  else camera.position.fromArray(target).add(new Vector3(...view.direction).normalize().multiplyScalar(span / (2 * Math.tan(Math.PI / 12))));
  camera.lookAt(new Vector3(...(view.camera?.target ?? target))); camera.updateMatrixWorld();
  for (const theme of themes) {
    const filename = `${round}-${shot}-${theme}.png`;
    await render(surfaces(hero.ids, theme), camera, theme).toFile(path.join(out, filename));
    manifest.push({ filename, hero: hero.name, view: view.name, theme, ids: hero.ids, camera: { position: camera.position.toArray(), target, fov: camera.fov }, width: W, height: H });
    process.stdout.write(`${filename}\n`);
  }
}
fs.writeFileSync(path.join(out, 'views.json'), JSON.stringify(manifest, null, 2));
