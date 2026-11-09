/** Offline CPU diagnostic of the actual shipped geometry, without a browser.
 * pnpm tsx scripts/geo/frog-and-chicken/preview.ts
 *   --input /tmp/frog-and-chicken-before.json --out /tmp/frog-chicken-before
 * Add --counts-only to audit inventory and authored visibility without images.
 * Engine studio lighting, material families, ACES and a perspective-correct
 * z-buffer. PMREM specular, finish maps, shadows and DOM layout are not simulated.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';
import { NodeIO, type Accessor } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Box3, BufferAttribute, BufferGeometry, Euler, Matrix3, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { partsFile, type SpaceChapterState } from '../../../src/engines/space-scene/schema';
import { fitCameraToAspect } from '../../../src/engines/space-scene/lib/camera';
import { fitCameraToHud, freeStageRect, type FrameRect } from '../../../src/engines/space-scene/lib/hud-framing';
import { evaluateSim } from '../../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../../src/engines/space-scene/lib/sim/bind';
import { resolveAllPartDisplays } from '../../../src/engines/space-scene/lib/visibility';
import { resolveMaterialLook, type MaterialLook } from '../../../src/engines/space-scene/lib/color';
import { studio } from './studio';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const root = resolve(import.meta.dirname, '../../..');
const args = process.argv.slice(2);
const arg = (name: string, fallback: string) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]!; };
const topic = arg('--topic', 'frog-and-chicken');
if (!['frog-and-chicken','bones-and-joints','mangrove-food-web','coral-reef'].includes(topic)) throw new Error('Preview is scoped to group A');
const input = resolve(arg('--input', resolve(root, `src/content/topics/${topic}/data/parts.json`)));
const output = resolve(arg('--out', '/tmp/frog-and-chicken-previews'));
const width = Number(arg('--width', '1200')), height = Number(arg('--height', '1000'));
if (![width, height].every(n => Number.isInteger(n) && n >= 320 && n <= 2400)) throw new Error('Preview sizes must be integers between 320 and 2400');
const decoded=(a:Accessor):Float32Array=>{
  const data=a.getArray()!;
  if(!a.getNormalized())return new Float32Array(data);
  const type=a.getComponentType(),limit=type===5120?127:type===5121?255:type===5122?32767:type===5123?65535:1;
  return Float32Array.from(data,v=>Math.max(type===5120||type===5122?-1:0,v/limit));
};
const file = partsFile.parse(JSON.parse(readFileSync(input, 'utf8')));
mkdirSync(output, { recursive: true });
const theme=arg('--theme','paper')==='cinema'?'cinema':'paper';
const lighting=studio(theme);
const tokens = new Map<string, string>();
for (const m of readFileSync(resolve(root, 'src/theme/tokens.css'), 'utf8').matchAll(/--([\w-]+):\s*([^;]+);/g)) if (!tokens.has(m[1]!)) tokens.set(m[1]!, m[2]!.trim());
if(theme==='cinema'){const block=readFileSync(resolve(root,'src/theme/tokens.css'),'utf8').split(':root[data-theme="cinema"]')[1]!.split('}')[0]!;for(const m of block.matchAll(/--([\w-]+):\s*([^;]+);/g))tokens.set(m[1]!,m[2]!.trim());}
type Shape = { geometry: BufferGeometry; matrix: Matrix4; look: MaterialLook };
const look=(material:{color:string;tint?:string})=>resolveMaterialLook(material.color,Object.fromEntries(tokens),theme,material.tint);
const geometry = new Map<string, Shape[]>();
const glb = file.model ? await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(resolve(arg("--model",resolve(root, `public${file.model}`)))) : null;
for (const part of file.parts) {
  const shapes: Shape[] = [];
  if (part.mesh) {
    const target = glb?.getRoot().listNodes().find(n => n.getName() === part.mesh);
    if (!target) throw new Error(`GLB node missing: ${part.mesh}`);
    let meshNode = target.getMesh() ? target : null;
    target.traverse(n => { if (!meshNode && n.getMesh()) meshNode = n; });
    if (!meshNode) throw new Error(`GLB mesh missing: ${part.mesh}`);
    // SpaceScene draws the first Mesh under this node, with its world matrix
    // and the part material (rather than the authored GLB materials).
    for (const primitive of meshNode.getMesh()!.listPrimitives()) {
      const position = primitive.getAttribute('POSITION')!;
      const normal = primitive.getAttribute('NORMAL');
      const vertexColor=primitive.getAttribute('COLOR_0');
      const g = new BufferGeometry().setAttribute('position', new BufferAttribute(decoded(position), 3));
      if(vertexColor)g.setAttribute('color',new BufferAttribute(decoded(vertexColor),3));
      if (normal) g.setAttribute('normal', new BufferAttribute(decoded(normal), 3));
      else g.computeVertexNormals();
      const indices = primitive.getIndices();
      if (indices) g.setIndex(new BufferAttribute(new Uint32Array(indices.getArray()!), 1));
      // Anatomy uses quantisation-adjusted inverse bind matrices. Applying
      // only the mesh node matrix piles the bones at the origin; bake the
      // actual rest skin here, just as GLTFLoader's SkinnedMesh does on stage.
      const skin=meshNode.getSkin(),joints=primitive.getAttribute('JOINTS_0'),weights=primitive.getAttribute('WEIGHTS_0');
      if(skin&&joints&&weights){
        const ibm=skin.getInverseBindMatrices()!.getArray()!,w=decoded(weights),ji=joints.getArray()!;
        const palettes=skin.listJoints().map((joint,i)=>new Matrix4().fromArray(joint.getWorldMatrix()).multiply(new Matrix4().fromArray(Array.from(ibm.slice(i*16,i*16+16)))));
        const normalPalettes=palettes.map(m=>new Matrix3().getNormalMatrix(m));
        const pos=g.getAttribute('position'),nor=g.getAttribute('normal'),v=new Vector3(),n=new Vector3(),pv=new Vector3(),nv=new Vector3();
        for(let i=0;i<pos.count;i++){
          pv.set(0,0,0);nv.set(0,0,0);
          for(let j=0;j<4;j++){const weight=w[i*4+j]!;if(!weight)continue;const k=ji[i*4+j]!;pv.addScaledVector(v.fromBufferAttribute(pos,i).applyMatrix4(palettes[k]!),weight);nv.addScaledVector(n.fromBufferAttribute(nor,i).applyMatrix3(normalPalettes[k]!),weight);}
          nv.normalize();pos.setXYZ(i,pv.x,pv.y,pv.z);nor.setXYZ(i,nv.x,nv.y,nv.z);
        }
      }
      const material = part.material ?? { color: 'tissue', tint: '#898277' };
      shapes.push({ geometry: g, matrix: skin?new Matrix4():new Matrix4().fromArray(meshNode.getWorldMatrix()), look: look(material) });
    }
  }
  if (part.primitive && !part.mesh) {
    const slots = partMaterialSlots(part);
    for (const piece of partPieces(part)) {
      if (piece.lines) { piece.geometry.dispose(); continue; }
      const slot = slots[piece.slot ?? 0]!;
      for (const instance of piece.matrices ?? [new Matrix4()]) shapes.push({ geometry: piece.geometry, matrix: new Matrix4().makeTranslation(...part.primitive.at).multiply(instance), look: look(slot) });
    }
  }
  geometry.set(part.id, shapes);
}
const triangleCounts = Object.fromEntries([...geometry].map(([id, shapes]) => [id, shapes.reduce((sum, s) => sum + (s.geometry.index?.count ?? s.geometry.getAttribute('position').count) / 3, 0)]));
const totalTriangles = Object.values(triangleCounts).reduce((a, b) => a + b, 0);
const baseline = '/tmp/frog-and-chicken-before.json';
type VisibilityState = { layers?: string[]; hide?: string[]; beats?: VisibilityState[] };
const chapterDirectory = resolve(root, `src/content/topics/${topic}/chapters`);
const visibleStates = readdirSync(chapterDirectory).filter(n => n.endsWith('.mdx')).flatMap(name => {
  const chapter = parseYaml(readFileSync(resolve(chapterDirectory, name), 'utf8').split('---')[1]!) as { state?: VisibilityState };
  const base = chapter.state ?? {};
  return [base, ...(base.beats ?? []).map(beat => ({ ...base, ...beat }))].map((state, index) => {
    const layers = state.layers ?? file.groups.map(g => g.id), hide = state.hide ?? [];
    const ids = file.parts.filter(p => (p.group === undefined || layers.includes(p.group)) && !hide.includes(p.id)).map(p => p.id);
    return { chapter: name.replace('.mdx', ''), state: index === 0 ? 'entry' : `beat-${index - 1}`, triangles: ids.reduce((n, id) => n + triangleCounts[id]!, 0), ids };
  });
});
const maxVisible = visibleStates.reduce((a, b) => b.triangles > a.triangles ? b : a);
const report = { input, totalTriangles, budget: 350000, withinBudget: maxVisible.triangles <= 350000, inventoryWithinBudget: totalTriangles <= 350000, maxAuthoredVisibleTriangles: maxVisible.triangles, maxAuthoredVisibleState: `${maxVisible.chapter}/${maxVisible.state}`, visibilityMethod: 'Conservative chapter and beat layers/hide; counts full geometry even when off-camera, occluded, transparent, or hidden by simulation. No runtime draw-pass multiplier.', authoredStates: visibleStates, perPart: triangleCounts, baselineAvailable: existsSync(baseline) };
writeFileSync(resolve(output, 'triangles.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, authoredStates: `${visibleStates.length} states (see triangles.json)` }));

type Shot = { name: string; ids: string[]; eye: [number, number, number]; crop?: [number, number, number, number, number, number]; open?: boolean; camera?: {position:[number,number,number];target:[number,number,number];fov?:number}; transforms?:Map<string,Matrix4>; panels?:FrameRect[]; ghost?:Set<string> };
const shots: Shot[] = [
  {name:'comparison-frog-row',ids:['compare-frog'],eye:[0,.7,1]},
  {name:'comparison-chicken-row',ids:['compare-chicken'],eye:[0,.35,1]},
  {name:'comparison-all',ids:['compare-frog','compare-chicken','compare-mosquito','compare-plant'],eye:[0,1,1]},
  { name: 'hen-side', ids: ['chicken-adult'], eye: [0, .20, 1] },
  { name: 'hen-quarter', ids: ['chicken-adult'], eye: [-.9, .45, 1] },
  { name: 'hen-rear', ids: ['chicken-adult'], eye: [1, .4, -.8] },
  { name: 'hen-head', ids: ['chicken-adult'], eye: [-.6, .15, 1], crop: [0, .58, 0, .43, 1, 1] },
  { name: 'hen-feet', ids: ['chicken-adult'], eye: [-.65, .8, 1], crop: [.25, 0, 0, .80, .30, 1] },
  { name: 'chick-quarter', ids: ['chicken-chick'], eye: [-.8, .35, 1] },
  { name: 'frog-quarter', ids: ['frog-adult'], eye: [-.75, .9, 1] },
  { name: 'frog-dorsal', ids: ['frog-adult'], eye: [0, 1, .02] },
  { name: 'frog-foot', ids: ['frog-adult'], eye: [0, 1, .22], crop: [.47, 0, .48, 1, .4, 1] },
  { name: 'froglet-quarter', ids: ['frog-froglet'], eye: [-.75, .9, 1] },
  { name: 'froglet-side', ids: ['frog-froglet'], eye: [0,.18,1] },
  { name: 'froglet-rear', ids: ['frog-froglet'], eye: [1,.55,.6] },
  { name: 'froglet-dorsal', ids: ['frog-froglet'], eye: [0,1,.01] },
  { name: 'gill-section', ids: ['gill-inset'], eye: [.3,.3,1] },
  { name: 'gill-rear', ids: ['gill-inset'], eye: [-.7,.5,1] },
  { name: 'tadpole-side', ids: ['frog-tadpole'], eye: [0, .08, 1] },
  { name: 'tadpole-dorsal', ids: ['frog-tadpole'], eye: [0, 1, .03] },
  { name: 'hind-leg-stage', ids: ['frog-hind-legs'], eye: [0, 1, .8] },
  { name: 'jelly-eggs', ids: ['frog-eggs'], eye: [-.4, .7, 1] },
  { name: 'egg-closed', ids: ['chicken-egg', 'egg-shell-window'], eye: [-.4, .2, 1] },
  { name: 'egg-open', ids: ['chicken-egg', 'egg-shell-window', 'egg-yolk', 'egg-white', 'egg-embryo'], eye: [.7, .55, 1], open: true },
];
// Use --topic <slug> --chapter <id> --beat <1-based> --width 624
// --height 755 for a 1024×768 viewport: 400px reader, 57px topbar.
// These HUD rectangles are explicit fixtures, never claimed as DOM measurements.
const frameReport:Record<string,unknown>={};
if(args.includes('--chapter')) {
  const chapter=readdirSync(chapterDirectory).filter(n=>n.endsWith('.mdx')).map(n=>parseYaml(readFileSync(resolve(chapterDirectory,n),'utf8').split('---')[1]!) as {id:string;state:SpaceChapterState}).find(c=>c.id===arg('--chapter',''))!;
  if(!chapter)throw new Error('Unknown chapter');
  const base=chapter.state,beat=base.beats?.[Number(arg('--beat','1'))-1];
  const state={...base,...beat},values=resolveSimValues(file.sim!,{...base.sim?.set,...beat?.sim?.set});
  const fx=simEffects(file.sim!,values,evaluateSim(file.sim!,values));
  const display=resolveAllPartDisplays(file.parts,{view:state.view!,part:state.part??null,layers:state.layers??file.groups.map(g=>g.id),hidden:[...(state.hide??[]),...fx.hidden],ghosted:state.ghost??[]});
  const ids=file.parts.filter(p=>display.get(p.id)?.visible&&(!args.includes('--only')||arg('--only','').split(',').includes(p.id))).map(p=>p.id),transforms=new Map<string,Matrix4>();
  for(const p of file.parts){
    const poseName=fx.poses.has(p.id)?fx.poses.get(p.id):state.pose;
    const pose=poseName?file.poses?.[poseName]?.parts[p.id]:undefined;
    const bounds=new Box3();for(const s of geometry.get(p.id)??[]){s.geometry.computeBoundingBox();bounds.union(s.geometry.boundingBox!.clone().applyMatrix4(s.matrix));}
    const pivot=pose?.pivot?new Vector3(...pose.pivot):bounds.getCenter(new Vector3()),offset=new Vector3(...(pose?.offset??[0,0,0])).add(new Vector3(...(fx.offset.get(p.id)??[0,0,0])));
    const scale=typeof pose?.scale==='number'?[pose.scale,pose.scale,pose.scale]:pose?.scale??[1,1,1];
    const rot=pose?.rotation??[0,0,0];
    transforms.set(p.id,new Matrix4().makeTranslation(...pivot.clone().add(offset).toArray() as [number,number,number]).multiply(new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(new Euler(rot[0]*Math.PI/180,rot[1]*Math.PI/180,rot[2]*Math.PI/180)))).multiply(new Matrix4().makeScale(scale[0]!,scale[1]!,scale[2]!)).multiply(new Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z)));
  }
  const h=height-44,present=args.includes('--present');
  const panels:FrameRect[]=present?[]:args.includes('--expanded-hud')?[{x0:12,y0:12,x1:230,y1:320},{x0:width-210,y0:12,x1:width-12,y1:300},{x0:0,y0:h-66,x1:width,y1:h}]:[{x0:0,y0:12,x1:44,y1:h-90},{x0:width-44,y0:12,x1:width,y1:180},{x0:0,y0:h-78,x1:width,y1:h}];
  const authored=typeof state.camera==='string'?file.presets!.find(p=>p.id===state.camera)!.camera:state.camera!;
  const boxes=(file.views.hudFrame?.parts??ids.filter(id=>!file.parts.find(p=>p.id===id)!.context)).filter(id=>ids.includes(id)).map(id=>{
    const b=new Box3();for(const s of geometry.get(id)??[]){s.geometry.computeBoundingBox();b.union(s.geometry.boundingBox!.clone().applyMatrix4(transforms.get(id)!.clone().multiply(s.matrix)));}
    return {center:b.getCenter(new Vector3()).toArray() as [number,number,number],half:b.getSize(new Vector3()).multiplyScalar(.5).toArray() as [number,number,number],minRadiusPx:file.views.hudFrame?.primary?.part===id?file.views.hudFrame.primary.minRadiusPx:undefined};
  });
  const camera=fitCameraToHud(fitCameraToAspect(authored,width/h),boxes,width,h,freeStageRect(width,h,panels,12,false),{panels});
  const name=`${topic}-${chapter.id}-${arg('--beat','1')}${present?'-present':args.includes('--expanded-hud')?'-expanded':'-tablet'}`;
  shots.splice(0,shots.length,{name,ids,eye:arg('--eye','0,0,1').split(',').map(Number) as [number,number,number],camera:args.includes('--close')?undefined:camera,transforms,panels:args.includes('--close')?[]:panels,ghost:new Set(ids.filter(id=>display.get(id)?.ghost))});
  frameReport[name]={authored,camera,panels,stage:[width,h],visibleTriangles:ids.reduce((n,id)=>n+triangleCounts[id]!,0),visibleParts:ids,simValues:values};
  writeFileSync(resolve(output,'framing.json'),JSON.stringify(frameReport,null,2)+'\n');
}
const point = new Vector3(), normal = new Vector3(), projected = new Vector3();
const footer = 44;
for (const shot of (args.includes('--counts-only') ? [] : shots.filter(s => !args.includes('--shot') || s.name === arg('--shot', '')))) {
  const selected = shot.ids.flatMap(id => (geometry.get(id) ?? []).map(s => ({ ...s, id, matrix:shot.transforms?.get(id)?.clone().multiply(s.matrix)??s.matrix })));
  const box = new Box3();
  for (const s of selected) {
    s.geometry.computeBoundingBox();
    const matrix = s.matrix.clone();
    if (shot.open && s.id === 'egg-shell-window') matrix.premultiply(new Matrix4().makeTranslation(.8, .25, -.41));
    box.union(s.geometry.boundingBox!.clone().applyMatrix4(matrix));
  }
  if (box.isEmpty()) continue;
  if(args.includes('--bounds')){const b=arg('--bounds','').split(',').map(Number);if(b.length!==6||!b.every(Number.isFinite))throw Error('--bounds requires six finite numbers');box.min.set(b[0]!,b[1]!,b[2]!);box.max.set(b[3]!,b[4]!,b[5]!);}
  if (shot.crop) { const min = box.min.clone(), span = box.getSize(new Vector3()); box.min.set(min.x + span.x * shot.crop[0], min.y + span.y * shot.crop[1], min.z + span.z * shot.crop[2]); box.max.set(min.x + span.x * shot.crop[3], min.y + span.y * shot.crop[4], min.z + span.z * shot.crop[5]); }
  const center = box.getCenter(new Vector3()), span = box.getSize(new Vector3());
  const radius = Math.max(span.x, span.y, span.z) * .5;
  const camera = new PerspectiveCamera(30, width / (height - footer), .001, 100);
  camera.position.copy(center).addScaledVector(new Vector3(...shot.eye).normalize(), radius / Math.tan(Math.PI / 12) * 1.32);
  if(shot.camera){camera.fov=shot.camera.fov??30;camera.position.fromArray(shot.camera.position);camera.lookAt(new Vector3(...shot.camera.target));camera.updateProjectionMatrix();}
  else camera.lookAt(center);
  camera.updateMatrixWorld();
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) pixels.set(theme==='cinema'?[31,33,36]:[233,228,216], i * 3);
  const depth = new Float32Array(width * height).fill(Infinity);
  for (const shape of selected) {
    const { geometry: g, look } = shape;
    const matrix = shape.matrix.clone();
    if (shot.open && shape.id === 'egg-shell-window') matrix.premultiply(new Matrix4().makeTranslation(.8, .25, -.41));
    if (shot.open && shape.id === 'egg-white') continue; // Transparent albumen is omitted in opaque CPU diagnostic.
    const normalMatrix = new Matrix3().getNormalMatrix(matrix), pos = g.getAttribute('position'), nor = g.getAttribute('normal');
    const coords = new Float64Array(pos.count * 6);
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i).applyMatrix4(matrix);
      normal.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize();
      projected.copy(point).applyMatrix4(camera.matrixWorldInverse);
      const q = 1 / -projected.z;
      projected.applyMatrix4(camera.projectionMatrix);
      coords[i * 6] = (projected.x * .5 + .5) * width; coords[i * 6 + 1] = (.5 - projected.y * .5) * (height - footer); coords[i * 6 + 2] = q;
      const radiance=lighting.shade(normal,point,camera.position,look);
      for(let k=0;k<3;k++)coords[i*6+3+k]=radiance[k]!*(g.hasAttribute('color')?g.getAttribute('color').getComponent(i,k):1);
    }
    const count = g.index?.count ?? pos.count;
    for (let i = 0; i < count; i += 3) {
      const a = (g.index?.getX(i) ?? i) * 6, b = (g.index?.getX(i + 1) ?? i + 1) * 6, c = (g.index?.getX(i + 2) ?? i + 2) * 6;
      if (coords[a + 2]! <= 0 || coords[b + 2]! <= 0 || coords[c + 2]! <= 0) continue;
      const ax = coords[a]!, ay = coords[a + 1]!, bx = coords[b]!, by = coords[b + 1]!, cx = coords[c]!, cy = coords[c + 1]!;
      const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(det) < 1e-7) continue;
      const xmin = Math.max(0, Math.floor(Math.min(ax, bx, cx))), xmax = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
      const ymin = Math.max(0, Math.floor(Math.min(ay, by, cy))), ymax = Math.min(height - footer - 1, Math.ceil(Math.max(ay, by, cy)));
      for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
        const u = ((by - cy) * (x + .5 - cx) + (cx - bx) * (y + .5 - cy)) / det;
        const v = ((cy - ay) * (x + .5 - cx) + (ax - cx) * (y + .5 - cy)) / det, w = 1 - u - v;
        if (u < 0 || v < 0 || w < 0) continue;
        const q = u * coords[a + 2]! + v * coords[b + 2]! + w * coords[c + 2]!, z = 1 / q, at = y * width + x;
        if (z >= depth[at]!) continue;
        const opacity=shot.ghost?.has(shape.id) ? .12 : 1;
        if(opacity===1)depth[at] = z;
        const radiance=[0,1,2].map(k=>(u*coords[a+3+k]!*coords[a+2]!+v*coords[b+3+k]!*coords[b+2]!+w*coords[c+3+k]!*coords[c+2]!)/q);
        const color=lighting.encode(radiance[0]!,radiance[1]!,radiance[2]!);
        for(let k=0;k<3;k++)pixels[at*3+k]=color[k]!*opacity+pixels[at*3+k]!*(1-opacity);
      }
    }
  }
  const label = `<svg width="${width}" height="${height}">${(shot.panels??[]).map(r=>`<rect x="${r.x0}" y="${r.y0}" width="${r.x1-r.x0}" height="${r.y1-r.y0}" fill="#ded8ca" stroke="#857d70"/>`).join('')}<text x="12" y="${height - 20}" font-family="sans-serif" font-size="12" fill="#524b41">${shot.name} · CPU studio + ACES / HUD fixture</text></svg>`;
  const path = resolve(output, `${shot.name}.png`);
  await sharp(pixels, { raw: { width, height, channels: 3 } }).composite([{ input: Buffer.from(label) }]).png().toFile(path);
  console.log(path);
}
const beforePreviews = arg('--before-previews', '/tmp/frog-and-chicken-before-previews');
if (!args.includes('--counts-only') && resolve(beforePreviews) !== output && existsSync(resolve(beforePreviews, 'triangles.json'))) {
  const before = JSON.parse(readFileSync(resolve(beforePreviews, 'triangles.json'), 'utf8')) as typeof report;
  writeFileSync(resolve(output, 'comparison-triangles.json'), JSON.stringify({ before: before.totalTriangles, after: totalTriangles, delta: totalTriangles - before.totalTriangles, perPart: Object.fromEntries(Object.keys(triangleCounts).map(id => [id, { before: before.perPart[id] ?? 0, after: triangleCounts[id] }])) }, null, 2) + '\n');
  for (const name of ['hen-quarter', 'hen-head', 'hen-feet', 'frog-quarter', 'frog-dorsal', 'frog-foot', 'tadpole-side', 'egg-closed']) {
    const left = resolve(beforePreviews, `${name}.png`), right = resolve(output, `${name}.png`);
    if (!existsSync(left) || !existsSync(right)) continue;
    const label = `<svg width="${width * 2}" height="${height + 34}"><text x="20" y="25" font-family="sans-serif" font-size="20" fill="#524b41">BEFORE</text><text x="${width + 20}" y="25" font-family="sans-serif" font-size="20" fill="#524b41">AFTER</text></svg>`;
    await sharp({ create: { width: width * 2, height: height + 34, channels: 3, background: '#ede7da' } }).composite([{ input: await sharp(left).resize(width, height).toBuffer(), left: 0, top: 34 }, { input: await sharp(right).resize(width, height).toBuffer(), left: width, top: 34 }, { input: Buffer.from(label), top: 0, left: 0 }]).png().toFile(resolve(output, `comparison-${name}.png`));
  }
}
for (const [name, reference] of [['hen-side', 'hen.png'], ['frog-foot', 'frog-foot.jpg']]) {
  const photo = resolve(import.meta.dirname, 'refs', reference!), preview = resolve(output, `${name}.png`);
  if (args.includes('--counts-only') || !existsSync(photo) || !existsSync(preview)) continue;
  const label = `<svg width="${width * 2}" height="${height + 34}"><text x="20" y="25" font-family="sans-serif" font-size="20" fill="#524b41">REFERENCE PHOTO (source recorded with topic)</text><text x="${width + 20}" y="25" font-family="sans-serif" font-size="20" fill="#524b41">ACTUAL GENERATED GEOMETRY</text></svg>`;
  let photograph = sharp(photo);
  if (name === 'hen-side') photograph = photograph.flop();
  await sharp({ create: { width: width * 2, height: height + 34, channels: 3, background: '#ede7da' } }).composite([{ input: await photograph.flatten({ background: '#ede7da' }).resize(width, height, { fit: 'contain', background: '#ede7da' }).toBuffer(), left: 0, top: 34 }, { input: await sharp(preview).resize(width, height).toBuffer(), left: width, top: 34 }, { input: Buffer.from(label), top: 0, left: 0 }]).png().toFile(resolve(output, `reference-${name}.png`));
}
for (const g of new Set([...geometry.values()].flatMap(s => s.map(p => p.geometry)))) g.dispose();
