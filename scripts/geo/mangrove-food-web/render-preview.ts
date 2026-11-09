/** CPU geometry previews when sandboxed Chromium cannot launch. This is a
 * normal-lit z-buffer, NOT a WebGL screenshot/material or performance test. */
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFileBase } from '../../../src/engines/space-scene/schema';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { buildParts } from './build-parts';
import { treeMeshes, meshPiece } from './tree-meshes';
const meshes=treeMeshes();
const file=partsFileBase.parse(buildParts());
const css=readFileSync(resolve('src/theme/tokens.css'),'utf8').split('[data-theme="cinema"]')[0]!;
const color=(ref:string)=>{
 const hex=ref.startsWith('token:')?css.match(new RegExp(`--${ref.slice(6)}:\\s*(#[0-9a-f]{6})`,'i'))?.[1]??'#8a8378':ref;
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
};
const W=1400,H=1050;
const shots: Record<string,{ids?:string[];eye:[number,number,number];target:[number,number,number];fov:number}>={
 hero:{eye:[2.2,1.7,2.6],target:[0,.30,0],fov:32},
 roots:{ids:['api-tree','api-lateral','api-pencil','bakau-tree','bakau-prop'],eye:[1.5,.85,1.7],target:[-.18,.27,-.1],fov:32},
 api:{ids:['api-tree'],eye:[.88,1.06,1.45],target:[-.43,.41,-.10],fov:33},
 apiBack:{ids:['api-tree'],eye:[-1.45,.93,-1.40],target:[-.43,.41,-.10],fov:33},
 bakau:{ids:['bakau-tree','bakau-prop'],eye:[1.46,1.08,1.34],target:[.18,.41,-.25],fov:33},
 bakauBack:{ids:['bakau-tree','bakau-prop'],eye:[-1.10,1.10,-1.92],target:[.18,.41,-.25],fov:33},
 rootScatter:{ids:['api-lateral','api-pencil'],eye:[-.2,.80,.45],target:[-.46,.02,-.13],fov:40},
 crabFront:{ids:['fiddler-crabs'],eye:[-.10,.15,.46],target:[-.10,.045,.18],fov:38},
 fishFin:{ids:['giant-mudskipper'],eye:[.47,.44,.44],target:[.33,.045,.175],fov:32},
 fishFront:{ids:['giant-mudskipper'],eye:[.66,.27,.44],target:[.33,.06,.145],fov:35},
 fishSide:{ids:['giant-mudskipper'],eye:[.31,.11,.58],target:[.30,.06,.145],fov:36},
 heron:{ids:['heron'],eye:[.99,.54,.84],target:[.61,.27,-.02],fov:39},
 crabs:{ids:['fiddler-crabs'],eye:[.11,.18,.42],target:[-.10,.04,.15],fov:39},
 climbing:{ids:['tree-crabs','api-trunk'],eye:[-.17,.31,.19],target:[-.445,.16,-.10],fov:36},
 mudskipper:{ids:['giant-mudskipper'],eye:[.57,.21,.55],target:[.30,.06,.145],fov:36},
};
const light=new Vector3(-.5,1,.65).normalize();
for(const [name,shot] of Object.entries(shots)) {
 const camera=new PerspectiveCamera(shot.fov,W/H,.001,20);
 camera.position.fromArray(shot.eye);camera.lookAt(new Vector3(...shot.target));camera.updateMatrixWorld();
 const pixels=new Uint8Array(W*H*3);for(let i=0;i<W*H;i++)pixels.set([237,230,216],i*3);
 const zbuffer=new Float64Array(W*H).fill(Infinity);
 const v=new Vector3(),n=new Vector3();
 for(const part of file.parts) {
  if(shot.ids&&!shot.ids.includes(part.id)||part.id==='tidal-water')continue;
  const slots=part.primitive?partMaterialSlots(part):[part.material!];
  for(const piece of part.mesh?[meshPiece(meshes.get(part.id)!)]:partPieces(part)) {
   if(piece.lines) {
    const g=piece.geometry,pos=g.getAttribute('position'),rgb=color('token:ink-2');
    for(const instance of piece.matrices??[new Matrix4()]){
     const world=new Matrix4().makeTranslation(...(part.primitive?.at??[0,0,0] as [number,number,number])).multiply(instance);
     for(let i=0;i<pos.count-1;i+=2){
      const a=new Vector3().fromBufferAttribute(pos,i).applyMatrix4(world).project(camera),b=new Vector3().fromBufferAttribute(pos,i+1).applyMatrix4(world).project(camera);
      const ax=(a.x*.5+.5)*W,ay=(.5-a.y*.5)*H,bx=(b.x*.5+.5)*W,by=(.5-b.y*.5)*H;
      const steps=Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay)));
      for(let j=0;j<=steps;j++){
       const t=j/Math.max(steps,1),x=Math.round(ax+(bx-ax)*t),y=Math.round(ay+(by-ay)*t),idx=y*W+x;
       if(x>=0&&x<W&&y>=0&&y<H&&a.z+(b.z-a.z)*t<zbuffer[idx]!+.000001)pixels.set(rgb,idx*3);
      }
     }
    }
    g.dispose();continue;
   }
   const g=piece.geometry,pos=g.getAttribute('position'),normal=g.getAttribute('normal');
   const rgb=color(slots[piece.slot??0]!.tint??'token:neutral');
   for(const instance of piece.matrices??[new Matrix4()]) {
    const world=new Matrix4().makeTranslation(...(part.primitive?.at??[0,0,0] as [number,number,number])).multiply(instance);
    const nm=new Matrix3().getNormalMatrix(world);
    const coords=new Float64Array(pos.count*4);
    for(let i=0;i<pos.count;i++) {
     v.fromBufferAttribute(pos,i).applyMatrix4(world).project(camera);
     n.fromBufferAttribute(normal,i).applyMatrix3(nm).normalize();
     coords[i*4]=(v.x*.5+.5)*W;coords[i*4+1]=(.5-v.y*.5)*H;coords[i*4+2]=v.z;coords[i*4+3]=.40+.60*Math.max(0,n.dot(light));
    }
    const count=g.index?.count??pos.count;
    for(let i=0;i<count;i+=3) {
     const a=(g.index?.getX(i)??i)*4,b=(g.index?.getX(i+1)??i+1)*4,c=(g.index?.getX(i+2)??i+2)*4;
     const ax=coords[a]!,ay=coords[a+1]!,bx=coords[b]!,by=coords[b+1]!,cx=coords[c]!,cy=coords[c+1]!;
     const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(det)<1e-7)continue;
     const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));
     const minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));
     for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++) {
      const u=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/det;
      const w=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/det,t=1-u-w;
      if(u<0||w<0||t<0)continue;
      const depth=u*coords[a+2]!+w*coords[b+2]!+t*coords[c+2]!,idx=y*W+x;
      if(depth<zbuffer[idx]!) {
       zbuffer[idx]=depth;const l=u*coords[a+3]!+w*coords[b+3]!+t*coords[c+3]!;
       for(let k=0;k<3;k++)pixels[idx*3+k]=Math.min(255,Math.round(rgb[k]!*l));
      }
     }
    }
   }
   g.dispose();
  }
 }
 const dir=resolve('shots/mangrove-food-web/cpu-preview');mkdirSync(dir,{recursive:true});
 await sharp(pixels,{raw:{width:W,height:H,channels:3}}).png().toFile(resolve(dir,`${name}.png`));
 console.log(`${name}: CPU preview saved`);
}
