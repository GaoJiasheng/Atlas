/** Browser-free review of the decoded shipped GLB and engine primitives.
 * Reuses fossils' numerical RoomEnvironment/PBR/ACES renderer. Smooth vertex
 * normals, depth buffer and vertex-alpha wing membranes; no silhouette proxy.
 * pnpm tsx scripts/geo/grasshopper/studio-preview.mjs <topic> <round>
 */
import fs from 'node:fs';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry,BufferAttribute,Matrix4,Matrix3,Vector3,Color,PerspectiveCamera,Euler} from 'three';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
import {prepareStudio,studioShade,studioRigs,aces} from '../fossils-and-skeletons/studio-cpu.ts';
const topic=process.argv[2]??'grasshopper',round=process.argv[3]??'round1',baseline=round==='before';
const out=`scripts/geo/${topic}/comparisons/${round}`;fs.mkdirSync(out,{recursive:true});
const raw=JSON.parse(fs.readFileSync(baseline?`scripts/geo/${topic}/source-parts.json`:`src/content/topics/${topic}/data/parts.json`,'utf8')),file=partsFile.parse(raw),meshes=new Map();
await MeshoptDecoder.ready;
if(file.model){const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+file.model);await doc.transform(dequantize());for(const node of doc.getRoot().listNodes()){
 const p=node.getMesh()?.listPrimitives()[0];if(!p)continue;const g=new BufferGeometry();for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]){const a=p.getAttribute(semantic);if(a)g.setAttribute(name,new BufferAttribute(new Float32Array(a.getArray()),a.getElementSize()));}g.setIndex(new BufferAttribute(new Uint32Array(p.getIndices().getArray()),1));g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));g.userData.surface=p.getMaterial()?.getExtras().atlasSurface;g.userData.blend=p.getMaterial()?.getAlphaMode()==='BLEND';g.userData.roughness=p.getMaterial()?.getRoughnessFactor();meshes.set(node.getName(),g);
}}
const css=fs.readFileSync('src/theme/tokens.css','utf8'),tokens={};for(const theme of ['paper','cinema']){const s=css.slice(css.indexOf(`:root[data-theme="${theme}"] {`));tokens[theme]=Object.fromEntries([...s.slice(0,s.indexOf('\n}')).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));}
const all=file.parts;let total=0,calls=0;const counts={};
function geometry(p){return p.mesh?[{geometry:meshes.get(p.mesh),matrices:null,slot:0}]:partPieces(p);}
for(const p of all){let triangles=0,draws=0;for(const piece of geometry(p)){if(!piece.geometry)throw new Error(`No mesh ${p.mesh}`);const n=piece.geometry.index?.count??piece.geometry.getAttribute('position').count;triangles+=piece.lines?0:n/3*(piece.matrices?.length??1);draws++;}total+=triangles;calls+=draws;counts[p.id]={triangles,calls:draws};}
fs.writeFileSync(`${out}/metrics.json`,JSON.stringify({totalTriangles:total,estimatedCalls:calls,glbBytes:file.model?fs.statSync('public'+file.model).size:0,parts:counts},null,2));
prepareStudio();const W=880,H=680;
function render(parts,position,target,theme='paper',fov=32,up=[0,1,0]){
 const camera=new PerspectiveCamera(fov,W/H,.005,100);camera.position.fromArray(position);camera.up.fromArray(up);camera.lookAt(new Vector3(...target));camera.updateMatrixWorld();const pm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const bg=new Color(tokens[theme].paper),pixels=new Float32Array(W*H*3);for(let i=0;i<W*H;i++)pixels.set(bg.toArray(),i*3);const depth=new Float32Array(W*H).fill(Infinity),triangles=[],lines=[];
 for(const part of parts){const slots=partMaterialSlots(part);for(const piece of geometry(part)){if(piece.lines){const g=piece.geometry,p=g.getAttribute('position'),ix=g.index;for(const m of piece.matrices??[new Matrix4()]){const verts=[];for(let i=0;i<(ix?.count??p.count);i++){const v=new Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m).add(new Vector3(...part.primitive.at)).applyMatrix4(pm);verts.push([(v.x*.5+.5)*W,(.5-v.y*.5)*H,v.z]);}for(let i=0;i<verts.length;i+=2)lines.push([verts[i],verts[i+1]]);}continue;}const g=piece.geometry,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),cs=g.getAttribute('color'),idx=g.index;
 const slot=part.mesh?part.material:slots[piece.slot??0],look=resolveMaterialLook(slot.color,tokens[theme],theme,slot.tint),color=new Color(look.color),roughness=g.userData.surface?g.userData.roughness:look.roughness*.92;
 for(const matrix of piece.matrices??[new Matrix4()]){
 const nm=new Matrix3().getNormalMatrix(matrix),verts=[];
 for(let j=0;j<ps.count;j++){
  const p=new Vector3().fromBufferAttribute(ps,j).applyMatrix4(matrix);if(!part.mesh)p.add(new Vector3(...part.primitive.at));
  const n=new Vector3().fromBufferAttribute(ns,j).applyMatrix3(nm).normalize(),v=camera.position.clone().sub(p).normalize();if(look.doubleSided&&n.dot(v)<0)n.negate();
  const rgb=[color.r*(cs?.getX(j)??1),color.g*(cs?.getY(j)??1),color.b*(cs?.getZ(j)??1)];
  const shade=aces(studioShade(rgb,n.toArray(),v.toArray(),theme,roughness,g.userData.surface?0:look.metalness),studioRigs[theme].exposure);
  const e=pm.elements,iw=1/(e[3]*p.x+e[7]*p.y+e[11]*p.z+e[15]);p.applyMatrix4(pm);verts.push({x:(p.x*.5+.5)*W,y:(.5-p.y*.5)*H,z:p.z,iw,rgb:shade,a:look.opacity*(cs?.itemSize===4?cs.getW(j):1)});
 }
 g.computeBoundingSphere();const sortDistance=camera.position.distanceToSquared(g.boundingSphere.center.clone().add(part.mesh?new Vector3():new Vector3(...part.primitive.at)));
 for(let t=0;t<(idx?.count??ps.count);t+=3){const vs=[0,1,2].map(k=>verts[idx?idx.getX(t+k):t+k]);if(vs.some(p=>p.z< -1||p.z>1))continue;vs.blend=g.userData.blend||look.opacity<.99;vs.order=sortDistance;triangles.push(vs);}
 }} }
 // Match PartNode/GltfSource: opaque objects write depth, a BLEND source
 // never writes depth (including its opaque vertex-alpha vein fragments).
 // Keep the decoded index order inside each translucent object.
 triangles.sort((a,b)=>Number(a.blend)-Number(b.blend)||(a.blend&&b.blend?b.order-a.order:0));
 for(const tri of triangles){const [a,b,c]=tri;const d=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(d)<1e-8)continue;
 const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(W-1,Math.ceil(Math.max(a.x,b.x,c.x))),y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(H-1,Math.ceil(Math.max(a.y,b.y,c.y)));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  let u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/d,v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/d,w=1-u-v;if(u<0||v<0||w<0)continue;
  const z=u*a.z+v*b.z+w*c.z,i=y*W+x;if(z>=depth[i])continue;const sum=u*a.iw+v*b.iw+w*c.iw;u=u*a.iw/sum;v=v*b.iw/sum;w=w*c.iw/sum;
  const alpha=u*a.a+v*b.a+w*c.a;if(!tri.blend)depth[i]=z;for(let k=0;k<3;k++)pixels[i*3+k]=(1-alpha)*pixels[i*3+k]+alpha*(u*a.rgb[k]+v*b.rgb[k]+w*c.rgb[k]);
 }
 }
 // Existing wing veins use the engine's unlit ink LineBasicMaterial,
 // opacity .8, with depth test and no depth write. Include them in the baseline.
 const ink=new Color(theme==='cinema'?tokens.cinema.paper:tokens.paper['ink-2']);
 for(const [a,b] of lines){const steps=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1]));for(let j=0;j<=steps;j++){const t=j/Math.max(1,steps),x=Math.round(a[0]+(b[0]-a[0])*t),y=Math.round(a[1]+(b[1]-a[1])*t),z=a[2]+(b[2]-a[2])*t;if(x<0||y<0||x>=W||y>=H||z< -1||z>1)continue;const i=y*W+x;if(z>depth[i]+.00002)continue;for(let k=0;k<3;k++)pixels[i*3+k]=pixels[i*3+k]*.2+ink.toArray()[k]*.8;}}
 const output=new Uint8Array(W*H*3),c=new Color();for(let i=0;i<W*H;i++){c.fromArray(pixels,i*3).convertLinearToSRGB();output[i*3]=Math.round(c.r*255);output[i*3+1]=Math.round(c.g*255);output[i*3+2]=Math.round(c.b*255);}return sharp(output,{raw:{width:W,height:H,channels:3}}).png();
}
const adult=topic==='grasshopper'?all.filter(p=>['exoskeleton','legs-wings'].includes(p.group)):all.filter(p=>['head','thorax-wings','belly'].includes(p.group));
const shots=topic==='grasshopper'?[
 ['profile',adult,[0,1.05,6.4],[0,.83,0]],['three-quarter',adult,[-4,2.3,5.2],[-.1,.8,0]],['front',adult,[-5,1.15,.5],[-.2,.8,0]],
 ['tibia-close',all.filter(p=>p.id==='hind-tibiae'),[.55,.8,1.48],[.6,.62,.35],34],['foot-close',all.filter(p=>p.id==='fore-legs'),[-1.12,.16,.88],[-1.1,.04,.35],30],['antenna-close',all.filter(p=>['head-capsule','compound-eyes','antennae'].includes(p.id)),[-2.2,1.65,2],[-1.4,1.4,0],28],
 ['nymphs',all.filter(p=>p.group==='growth'&&!p.context),[1.8,3.1,9.8],[.4,.4,2]],
 ]:[['profile',adult,[-2.4,.65,3.5],[-2.5,.45,0]],['three-quarter',adult,[-4.5,1.3,2.6],[-2.55,.4,0]],['front',adult,[-5,.8,.5],[-2.55,.4,0]],
 ['wing-close',all.filter(p=>p.id==='wings'),[-2.15,1.52,.15],[-2.17,.72,.1],30],['foot-close',all.filter(p=>p.id==='hind-legs'),[-1.44,.81,.66],[-1.435,.753,.475],30],['male',all.filter(p=>p.group==='male'),[-2.2,1.1,1],[-2.15,.43,-1.25],32]];
const manifest=JSON.parse(fs.readFileSync(`scripts/geo/${topic}/refs/manifest.json`));
const wingSource=raw.parts.find(p=>p.id==='wings')?.primitive??JSON.parse(fs.readFileSync('scripts/geo/mosquito/source-parts.json')).parts.find(p=>p.id==='wings').primitive;
if(topic==='mosquito'){
 const r=new Matrix4().makeRotationFromEuler(new Euler(...wingSource.rotation.map(x=>x*Math.PI/180))),center=new Vector3(.296,0,0).applyMatrix4(r).add(new Vector3(...wingSource.at)),normal=new Vector3(0,0,1).transformDirection(r),up=new Vector3(0,1,0).transformDirection(r),s=shots.find(s=>s[0]==='wing-close');s[2]=center.clone().addScaledVector(normal,.97).toArray();s[3]=center.toArray();s[4]=32;s[5]=up.toArray();
}
for(const [name,parts,pos,target,fov,up] of shots){
 if(process.env.SHOT&&!process.env.SHOT.split(',').includes(name))continue;
 const image=await render(parts,pos,target,'paper',fov,up).toBuffer();await sharp(image).toFile(`${out}/${name}.png`);
 let ref=manifest[name==='profile'?0:Math.min(topic==='grasshopper'?2:1,manifest.length-1)];let reference=sharp(ref.file);
 if(topic==='mosquito'&&name==='profile'){ref=manifest[1];reference=sharp(ref.file).flop();}
 if(topic==='mosquito'&&name==='three-quarter'){ref=manifest[0];reference=sharp(ref.file);}
 if(topic==='grasshopper'&&['tibia-close','foot-close','antenna-close'].includes(name)){
  if(name==='tibia-close'){reference=sharp(await reference.extract({left:240,top:1050,width:600,height:260}).png().toBuffer()).rotate(-39,{background:'#e9e4d8'});}
  if(name==='antenna-close'){reference=reference.extract({left:110,top:40,width:520,height:620});}
  if(name==='foot-close'){ref=manifest[0];reference=sharp(ref.file).extract({left:800,top:1710,width:720,height:390});}
 }
 if(topic==='mosquito'&&name==='wing-close'){ref=manifest.find(r=>r.file.includes('micrograph'))??ref;reference=sharp(ref.file).extract({left:0,top:0,width:2667,height:990});}
 const referenceBuffer=await reference.resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer();
 const label=Buffer.from(`<svg width="1760" height="70"><rect width="1760" height="70" fill="#e9e4d8"/><text x="20" y="27" font-size="18" font-family="sans-serif">${topic} / ${round} / ${name} — decoded shipped geometry, engine studio + ACES</text><text x="900" y="27" font-size="17" font-family="sans-serif">Reference photograph / detail crop</text><text x="900" y="53" font-size="11" font-family="sans-serif">${ref.page.replaceAll('&','&amp;')}</text></svg>`);
 await sharp({create:{width:W*2,height:H+70,channels:3,background:'#e9e4d8'}}).composite([{input:image,left:0,top:70},{input:referenceBuffer,left:W,top:70},{input:label,left:0,top:0}]).png().toFile(`${out}/${name}-comparison.png`);console.log(topic,round,name);
}
if(!process.env.SHOT)await render(adult,shots[1][2],shots[1][3],'cinema').toFile(`${out}/cinema.png`);
console.log({total,calls});
