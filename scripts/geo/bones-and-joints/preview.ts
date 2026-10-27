/** Offline CPU geometry diagnostic. No browser, WebGL or desktop automation.
 * Uses the SAME partPieces builder as SpaceScene, then paints depth-sorted
 * triangles. It cannot certify runtime materials, transparency or labels. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import sharp from 'sharp';
import { parse } from 'yaml';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';

const root = resolve(import.meta.dirname, '../../..');
const out = resolve(root, 'scripts/anatomy/cache/bones-joints/previews');
mkdirSync(out, { recursive: true });
const file = partsFile.parse(JSON.parse(readFileSync(resolve(root,'src/content/topics/bones-and-joints/data/parts.json'),'utf8')));
const colors: Record<string, number[]> = { bone:[209,195,163],cold:[79,127,140],neutral:[138,131,120],xray:[58,154,160],
  'muscle-3':[143,71,64],cut:[184,151,60],'blood-rich':[200,34,45],'ink-2':[85,80,71],ink:[42,40,36],signal:[204,99,40] };
const w=1200,h=900;
const views = [
  {id:'bone',chapter:'02-living-bone',beat:1,ids:['bone-cortex','bone-lattice','bone-marrow','bone-vessel']},
  {id:'joint',chapter:'03-joint-connections',beat:2,ids:['joint-cartilage-a','joint-cartilage-b','joint-capsule','joint-ligament']},
  {id:'repair',chapter:'06-growth-and-repair',beat:3,ids:['repair-stage-clot','repair-stage-soft','repair-stage-hard','repair-stage-remodelled']},
];
for(const view of views) {
  const chapter = parse(readFileSync(resolve(root,`src/content/topics/bones-and-joints/chapters/${view.chapter}.mdx`),'utf8').split('---')[1]!);
  const cam = chapter.state.beats[view.beat].camera;
  const camera = new PerspectiveCamera(cam.fov,w/h,.001,20);
  camera.position.fromArray(cam.position);camera.lookAt(new Vector3(...cam.target));camera.updateMatrixWorld(true);
  const tris:{z:number;svg:string}[]=[];
  const light=new Vector3(-.4,.65,.8).normalize();
  let triangles=0,draws=0;
  for(const id of view.ids) {
    const part=file.parts.find(p=>p.id===id)!;
    const slots=partMaterialSlots(part);
    const pieces=partPieces(part);draws+=pieces.length;
    for(const piece of pieces) {
      const g=piece.geometry,position=g.getAttribute('position'),index=g.index;
      const slot=slots[piece.slot??0]!;
      const color=colors[slot.tint?.replace('token:','')??'bone']??colors.bone!;
      const alpha=slot.color==='membrane'?.30:1;
      for(const matrix of piece.matrices??[new Matrix4()]) {
        const toWorld=new Matrix4().makeTranslation(...part.primitive!.at).multiply(matrix);
        const count=index?.count??position.count;triangles+=count/3;
        for(let i=0;i<count;i+=3) {
          const points=[0,1,2].map(k=>new Vector3().fromBufferAttribute(position,index?index.getX(i+k):i+k).applyMatrix4(toWorld));
          const normal=new Vector3().crossVectors(points[1]!.clone().sub(points[0]!),points[2]!.clone().sub(points[0]!)).normalize();
          if(normal.dot(camera.position.clone().sub(points[0]!))<=0) continue;
          const shade=.55+.43*Math.max(0,normal.dot(light));
          const fill=`rgb(${color.map(v=>Math.round(v*shade)).join(',')})`;
          const z=points.reduce((sum,p)=>sum+p.clone().applyMatrix4(camera.matrixWorldInverse).z,0)/3;
          const screen=points.map(p=>p.project(camera));
          const d=screen.map(p=>`${((p.x+1)*w/2).toFixed(1)},${((1-p.y)*h/2).toFixed(1)}`).join(' ');
          tris.push({z,svg:`<polygon points="${d}" fill="${fill}" opacity="${alpha}"/>`});
        }
      }
      g.dispose();
    }
  }
  tris.sort((a,b)=>a.z-b.z);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#e9e4d8"/>${tris.map(t=>t.svg).join('')}<text x="24" y="30" font-size="16" fill="#2a2824">${view.id.toUpperCase()} · CPU GEOMETRY DIAGNOSTIC · ${draws} merged pieces · ${triangles} triangles</text><text x="24" y="875" font-size="14" fill="#555047">Authored camera, no browser. Runtime materials / labels / transparency require main-session review.</text></svg>`;
  writeFileSync(resolve(out,`rework-${view.id}.svg`),svg);
  await sharp(Buffer.from(svg)).png().toFile(resolve(out,`rework-${view.id}.png`));
  console.log(JSON.stringify({view:view.id,draws,triangles,path:resolve(out,`rework-${view.id}.png`)}));
}
