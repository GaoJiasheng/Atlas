/** CPU PBR QA, decoded shipping GLB + actual engine primitives; no browser.
 * Reuses the fossils studio GGX/RoomEnvironment/ACES implementation. The rig
 * assertion below compares every value against Lighting.tsx before rendering.
 * Usage: pnpm tsx scripts/geo/states-of-matter/preview-studio.mjs round1 [id,...]
 */
import fs from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry,BufferAttribute,Matrix4,Vector3,Color,Box3,PerspectiveCamera} from 'three';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
import {prepareStudio,studioShade,studioRigs,aces,studioEnvironment} from './studio-cpu.ts';
const round=process.argv[2]??'round1',sel=process.argv[3]?.split(','),out=`scripts/geo/states-of-matter/evidence/${round}`;fs.mkdirSync(out,{recursive:true});
const before=round==='before',file=partsFile.parse(JSON.parse(fs.readFileSync(before?'scripts/geo/states-of-matter/evidence/before-parts.json':process.env.ATLAS_CANDIDATE?'scripts/geo/states-of-matter/evidence/candidate-parts.json':'src/content/topics/states-of-matter/data/parts.json','utf8')));
const lighting=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
for(const theme of ['paper','cinema']){
 const body=lighting.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))[1],rig=studioRigs[theme];
 for(const [key,value] of [['env',rig.env],['exposure',rig.exposure]])if(Number(body.match(new RegExp(`${key}: ([\\d.]+)`))[1])!==value)throw new Error(`Studio ${key} drift`);
 const rgb=s=>new Color(s).toArray();const hemi=[...body.matchAll(/hemi: \['([^']+)', '([^']+)', ([\d.]+)/g)][0];if(JSON.stringify([rgb(hemi[1]),rgb(hemi[2]),Number(hemi[3])])!==JSON.stringify(rig.hemi))throw new Error('Hemi drift');
 for(let i=0;i<3;i++){const name=['key','fill','rim'][i],m=body.match(new RegExp(`${name}: \\['([^']+)', ([\\d.]+)`));if(m[1]!==rig.lights[i][0]||Number(m[2])!==rig.lights[i][1])throw new Error('Light drift');}
}
for(const [i,name] of ['KEY','FILL','RIM'].entries()){const d=lighting.match(new RegExp(`const ${name}_DIR: Vec3 = normalize3\\(\\[([^\\]]+)`))[1].split(',').map(Number);if(JSON.stringify(d)!==JSON.stringify(studioRigs.paper.lights[i][2]))throw new Error('Direction drift');}
const tokens={};for(const m of fs.readFileSync('src/theme/tokens.css','utf8').matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi))if(!tokens[m[1]])tokens[m[1]]=m[2];
const meshes=new Map();if(file.model){await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(process.env.ATLAS_PREVIEW_MODEL??(process.env.ATLAS_CANDIDATE?'/private/tmp/states-of-matter-candidate.glb':`public${file.model}`));await doc.transform(dequantize());for(const node of doc.getRoot().listNodes()){
 const p=node.getMesh()?.listPrimitives()[0];if(!p)continue;const g=new BufferGeometry();for(const [a,s] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0'],['uv','TEXCOORD_0']]){const x=p.getAttribute(s);if(x)g.setAttribute(a,new BufferAttribute(new Float32Array(x.getArray()),x.getElementSize()));}const ix=p.getIndices();g.setIndex(new BufferAttribute(new Uint32Array(ix.getArray()),1));g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));const m=p.getMaterial(),image=m.getBaseColorTexture()?.getImage(),texture=image?await sharp(image).removeAlpha().raw().toBuffer({resolveWithObject:true}):null;g.userData={texture,textureScale:m.getBaseColorTextureInfo()?.getExtension('KHR_texture_transform')?.getScale()??[1,1],textureOffset:m.getBaseColorTextureInfo()?.getExtension('KHR_texture_transform')?.getOffset()??[0,0],factor:m.getBaseColorFactor().slice(0,3),roughness:m.getRoughnessFactor(),metalness:m.getMetallicFactor(),opacity:m.getBaseColorFactor()[3],transparent:m.getAlphaMode()==='BLEND',double:m.getDoubleSided()};meshes.set(node.getName(),g);
}}
function shapes(part,pose='full'){
 const pieces=part.mesh?[{geometry:meshes.get(part.mesh),matrices:null,slot:0}]:partPieces(part),slots=partMaterialSlots(part),result=[];
 for(const piece of pieces){const source=piece.geometry,slot=part.mesh?part.material:slots[piece.slot??0],look=resolveMaterialLook(slot?.color??'plastic',tokens,'paper',slot?.tint);for(const matrix of piece.matrices??[new Matrix4()]){
 const g=source.clone().applyMatrix4(matrix);if(!part.mesh)g.translate(...part.primitive.at);
 if(pose==='full'&&part.id.startsWith('balloon-')&&!part.id.includes('pump')){const p=file.poses['balloons-full'].parts[part.id];g.translate(...p.pivot.map(x=>-x));g.scale(...p.scale);g.translate(...p.pivot);if(p.offset)g.translate(...p.offset);}
 if(pose==='exploded'&&part.explode)g.translate(...part.explode.dir.map(x=>x*part.explode.dist));
 result.push({g,texture:source.userData.texture,textureScale:source.userData.textureScale,textureOffset:source.userData.textureOffset,rgb:new Color(look.color).multiply(new Color().setRGB(...(source.userData.factor??[1,1,1]))),envIntensity:look.envIntensity,roughness:source.userData.roughness??look.roughness*.92,metalness:source.userData.metalness??look.metalness,opacity:source.userData.opacity??look.opacity,transparent:source.userData.transparent??look.opacity<1,double:source.userData.double??look.doubleSided});
 }}return result;
}
prepareStudio();
const W=Number(process.env.ATLAS_PREVIEW_WIDTH??1024),H=Math.round(W*0.875);
async function render(surfaces,dir,target,extent,path,theme='paper'){
 const cam=new PerspectiveCamera(30,W/H,.0001,30);cam.position.copy(target).addScaledVector(new Vector3(...dir).normalize(),extent*2.2);cam.lookAt(target);cam.updateMatrixWorld();cam.updateProjectionMatrix();const cm=new Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse),depth=new Float32Array(W*H).fill(Infinity),albedo=new Float32Array(W*H*3),normals=new Float32Array(W*H*3),rough=new Float32Array(W*H),metal=new Float32Array(W*H),environment=new Float32Array(W*H),alpha=new Float32Array(W*H),covered=new Uint8Array(W*H),view=cam.position.clone().sub(target).normalize().toArray();
 // Normal-direction cache keeps the full GGX/Room/ACES path. For dielectrics
 // studioShade is affine in albedo, so a black/white transport pair is exact.
 // Only the normal lookup is quantised (1/256 component, <0.4 degree).
 const lightCache=new Map();
 function shade(rgb,n,roughness,metalness,envIntensity=1){
  const q=n.map(x=>Math.round(x*256)/256),key=`${q.join(',')}/${roughness}/${metalness}/${envIntensity}`;
  if(metalness===0){let pair=lightCache.get(key);if(!pair){const spec=studioShade([0,0,0],q,view,theme,roughness,0,(d,r)=>studioEnvironment(d,r)*envIntensity),white=studioShade([1,1,1],q,view,theme,roughness,0,(d,r)=>studioEnvironment(d,r)*envIntensity);pair=[spec,white.map((x,i)=>x-spec[i])];lightCache.set(key,pair);}return rgb.map((x,i)=>pair[0][i]+pair[1][i]*x);}
  const k=key+'/'+rgb.map(x=>Math.round(x*1024)).join(',');let light=lightCache.get(k);if(!light){light=studioShade(rgb,q,view,theme,roughness,metalness,(d,r)=>studioEnvironment(d,r)*envIntensity);lightCache.set(k,light);}return light;
 }
 const triangles=[];
 for(const s of surfaces){const {g}=s,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),co=g.getAttribute('color'),uv=g.getAttribute('uv'),ix=g.index,n=ix?.count??ps.count;
  for(let t=0;t<n;t+=3){const vs=[],nn=[],cc=[],aa=[],uvs=[];for(let k=0;k<3;k++){const i=ix?ix.getX(t+k):t+k;vs.push(new Vector3().fromBufferAttribute(ps,i));nn.push(new Vector3().fromBufferAttribute(ns,i));cc.push(co?[co.getX(i)*s.rgb.r,co.getY(i)*s.rgb.g,co.getZ(i)*s.rgb.b]:s.rgb.toArray());aa.push((co?.itemSize===4?co.getW(i):1)*s.opacity);uvs.push(uv?[uv.getX(i),uv.getY(i)]:[0,0]);}
   const facing=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])).dot(cam.position.clone().sub(vs[0]));if(!s.double&&facing<=0)continue;const inv=vs.map(v=>{const e=cm.elements;return 1/(e[3]*v.x+e[7]*v.y+e[11]*v.z+e[15]);}),q=vs.map(v=>v.clone().applyMatrix4(cm));if(q.some(v=>v.z< -1||v.z>1))continue;triangles.push({q,inv,nn,cc,aa,uvs,s,facing,z:q.reduce((a,v)=>a+v.z,0)/3});
  }
 }
 // Opaque batches write depth; transparent batches keep their decoded index
 // order, exactly as the engine does within each draw. No triangle-sort repair.
 triangles.sort((a,b)=>Number(a.s.transparent)-Number(b.s.transparent));
 // WebGLRenderer uses direct ACES + sRGB shader output before framebuffer
 // blending (there is no OutputPass). Blend mapped fragments in that space,
 // rather than applying ACES again to an already composited transparent draw.
 const encode=x=>x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
 const display=rgb=>aces(rgb,studioRigs[theme].exposure).map(encode);
 const bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),linear=new Float32Array(W*H*3);for(let i=0;i<W*H;i++)linear.set(bg.toArray().map(encode),i*3);
 for(const t of triangles){const q=t.q.map(v=>[(v.x*.5+.5)*W,(-v.y*.5+.5)*H,v.z]),[A,B,C]=q,d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-8)continue;const x0=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0]))),x1=Math.min(W-1,Math.ceil(Math.max(A[0],B[0],C[0]))),y0=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1]))),y1=Math.min(H-1,Math.ceil(Math.max(A[1],B[1],C[1])));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let a=((B[1]-C[1])*(x+.5-C[0])+(C[0]-B[0])*(y+.5-C[1]))/d,b=((C[1]-A[1])*(x+.5-C[0])+(A[0]-C[0])*(y+.5-C[1]))/d,c=1-a-b;if(a<0||b<0||c<0)continue;const z=a*A[2]+b*B[2]+c*C[2],i=y*W+x,k=i*3;if(z>=depth[i])continue;const denom=a*t.inv[0]+b*t.inv[1]+c*t.inv[2];a=a*t.inv[0]/denom;b=b*t.inv[1]/denom;c=c*t.inv[2]/denom;const rgb=t.cc[0].map((v,j)=>a*v+b*t.cc[1][j]+c*t.cc[2][j]),normal=t.nn[0].clone().multiplyScalar(a).addScaledVector(t.nn[1],b).addScaledVector(t.nn[2],c).normalize();if(t.facing<0)normal.negate();const op=a*t.aa[0]+b*t.aa[1]+c*t.aa[2];
   if(t.s.texture){const {data,info}=t.s.texture,u=(a*t.uvs[0][0]+b*t.uvs[1][0]+c*t.uvs[2][0])*t.s.textureScale[0]+t.s.textureOffset[0],v=(a*t.uvs[0][1]+b*t.uvs[1][1]+c*t.uvs[2][1])*t.s.textureScale[1]+t.s.textureOffset[1],tx=(u-Math.floor(u))*info.width-.5,ty=(v-Math.floor(v))*info.height-.5,xx=Math.floor(tx),yy=Math.floor(ty),fx=tx-xx,fy=ty-yy;let ao=0;
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const pixel=((yy+dy+info.height)%info.height*info.width+(xx+dx+info.width)%info.width)*info.channels,encoded=data[pixel]/255,linear=encoded<=.04045?encoded/12.92:((encoded+.055)/1.055)**2.4;ao+=linear*(dx?fx:1-fx)*(dy?fy:1-fy);}for(let j=0;j<3;j++)rgb[j]*=ao;
   }
   if(t.s.transparent){if(alpha[i]){linear.set(display(shade([...albedo.slice(k,k+3)],new Vector3(...normals.slice(k,k+3)).normalize().toArray(),rough[i],metal[i],environment[i])),k);alpha[i]=0;}const light=shade(rgb,normal.toArray(),t.s.roughness,t.s.metalness,t.s.envIntensity);const tone=display(light);covered[i]=1;for(let j=0;j<3;j++)linear[k+j]=linear[k+j]*(1-op)+tone[j]*op;alpha[i]=0;}
   else{depth[i]=z;albedo.set(rgb,k);normals.set(normal.toArray(),k);rough[i]=t.s.roughness;metal[i]=t.s.metalness;environment[i]=t.s.envIntensity;alpha[i]=1;}
  }
 }
 const pixels=Buffer.alloc(W*H*3);for(let i=0;i<W*H;i++){const k=i*3;if(alpha[i]){const n=new Vector3(...normals.slice(k,k+3)).normalize().toArray();linear.set(display(shade([...albedo.slice(k,k+3)],n,rough[i],metal[i],environment[i])),k);}for(let j=0;j<3;j++)pixels[k+j]=Math.round(255*linear[k+j]);}
 await sharp(pixels,{raw:{width:W,height:H,channels:3}}).png().toFile(path);
}
const ids=sel??['bicycle-wheel','floor-pump','basketball','ball-pump','balloon-pump','balloon-round','balloon-long','ice-cube','torch','bench','side-table','sand-grains','sponge','tissue'];
const details={'bicycle-wheel':[-1.45,.345,-.15,.15],'floor-pump':[-1.15,.074,-.209,.12],basketball:[.22,.24,-.1,.11],'ball-pump':[.057,.017,-.04,.13],'balloon-pump':[.36,.137,-.26,.06],'balloon-round':[.36,.168,-.26,.04],'balloon-long':[.41,.01,-.31,.04],'ice-cube':[-1.494,.0185,.14,.035],torch:[-1.652,.05,.255,.052],bench:[.84,-.10,.3,.30],'side-table':[-1.09,-.10,.26,.25],'sand-grains':[-.05,.022,-1.7,.09],sponge:[-.45,.052,.158,.030],tissue:[.19,.2965,.12,.07]};
for(const id of ids){const p=file.parts.find(p=>p.id===id),ss=shapes(p),bb=new Box3();for(const s of ss){s.g.computeBoundingBox();bb.union(s.g.boundingBox);}const size=bb.getSize(new Vector3()),target=bb.getCenter(new Vector3()),extent=Math.max(size.x,size.y,size.z)*1.12;
 const dir=id==='torch'?[1,.35,-1]:[0,.05,1],ds=[['front',dir],['three-quarter',id==='torch'?[.7,.35,-1]:id==='sponge'?[.14,.7,1]:[.7,.75,1]],['profile',id==='torch'?[0,.1,-1]:id==='sponge'?[1,.8,.8]:[1,.1,.04]],['detail',id==='torch'?[1,.2,-.6]:id==='sponge'?[.35,.8,1]:[.35,.25,1]]];
 for(const [name,d] of ds){let tar=target,ex=extent;if(name==='detail'&&details[id]){const [x,y,z,e]=details[id];tar=new Vector3(x,y,z);ex=e;}await render(ss,d,tar,ex,`${out}/${id}-${name}.png`);}
 if(['ice-cube','sponge'].includes(id)){const width=id==='ice-cube'?130:150;await render(ss,id==='sponge'?[.14,.7,1]:[.7,.75,1],target,extent*(H*.76/width),`${out}/${id}-beat-scale.png`);await render(ss,id==='sponge'?[.14,.7,1]:[.7,.75,1],target,extent*(H*.76/width),`${out}/${id}-beat-scale-cinema.png`,'cinema');}
 if(!before)await render(ss,[.7,.35,1],target,extent,`${out}/${id}-cinema.png`,'cinema');
 for(const s of ss)s.g.dispose();console.log(`${round} ${id}`);
}

const modelPath=process.env.ATLAS_PREVIEW_MODEL??(process.env.ATLAS_CANDIDATE?'/private/tmp/states-of-matter-candidate.glb':`public${file.model}`);
fs.writeFileSync(`${out}/preview-rig.json`,JSON.stringify({modelPath,sha256:createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'),studioRigs,method:'Decoded shipping GLB; perspective-correct CPU PBR + RoomEnvironment approximation + engine studio + direct ACES/sRGB before alpha blending. Native triangle/material order; not GPU acceptance.'},null,2));
