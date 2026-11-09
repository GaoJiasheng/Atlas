/** Offline QA of the DECODED shipped mesh (not sculpt inputs). Reuses the
 * numerical engine studio PBR / RoomEnvironment / ACES evaluator. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {parse} from 'yaml';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Matrix3,Vector3,PerspectiveCamera,Color,Mesh,MeshStandardMaterial,PropertyBinding} from 'three';
import {parseShippingGLB} from '../states-of-matter/node-gltf';
import {gltfSurface} from '../../../src/engines/space-scene/stages/model3d/GltfSource';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {roomRadiance} from './studio-room';
import {prepareStudio,studioShade,studioRigs,aces} from '../fossils-and-skeletons/studio-cpu';
const round=process.argv[2]??'1',out=`/tmp/atlas-heart-round4/round${round}`;fs.mkdirSync(out,{recursive:true});
const rigSource=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
// Assert the imported CPU constants against the actual active engine rig.
for(const [theme,rig] of Object.entries(studioRigs)){
 const text=rigSource.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))?.[1];if(!text)throw new Error('Engine rig changed');
 for(const [key,value] of [['exposure',rig.exposure],['env',rig.env]] as const)if(!text.includes(`${key}: ${value}`))throw new Error(`CPU ${theme} ${key} drift`);
 for(const [i,key] of ['key','fill','rim'].entries()){const [hex,intensity]=rig.lights[i]!;if(!text.includes(`${key}: ['${hex}', ${intensity}]`))throw new Error(`CPU ${theme} ${key} drift`);}
 const hm=text.match(/hemi:\s*\['(#[a-f0-9]+)',\s*'(#[a-f0-9]+)',\s*([\d.]+)\]/i);
 if(!hm||Number(hm[3])!==rig.hemi[2])throw new Error(`CPU ${theme} hemisphere drift`);
 for(let i=0;i<2;i++){
  const actual=new Color(hm[i+1]!).toArray(),expected=rig.hemi[i] as readonly number[];
  if(actual.some((v,j)=>Math.abs(v-expected[j]!)>1e-7))throw new Error(`CPU ${theme} hemisphere colour drift`);
 }
 for(const [i,name] of ['KEY_DIR','FILL_DIR','RIM_DIR'].entries()){
  const m=rigSource.match(new RegExp(`const ${name}: Vec3 = normalize3\\(\\[([^\\]]+)\\]\\)`));
  if(!m||m[1]!.split(',').map(Number).some((v,j)=>v!==rig.lights[i]![2][j]))throw new Error(`CPU ${name} drift`);
 }

}
prepareStudio();await MeshoptDecoder.ready;
const baseline=process.argv.includes('--baseline');
const activeParts=JSON.parse(fs.readFileSync(baseline?'/tmp/atlas-heart-round4/before/parts.json':'src/content/topics/heart-and-lungs/data/parts.json','utf8'));
const modelPath=baseline?'/tmp/atlas-heart-round4/before/heart-and-lungs-bench.glb':'public'+activeParts.model;
const assetSha256=createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex');
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(modelPath);await doc.transform(dequantize());
const fileData=baseline?activeParts:JSON.parse(fs.readFileSync(`${out}/parts.json`,'utf8')),parts=fileData.parts;
if(JSON.stringify(fileData)!==JSON.stringify(activeParts))throw new Error('Preview snapshot does not match runtime parts.json');
const runtimeBytes=fs.readFileSync(modelPath),runtimeModel=await parseShippingGLB(Uint8Array.from(runtimeBytes));
const surfaceProbes:Record<string,unknown>={};
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const tokens=(theme:string)=>{const at=css.indexOf(`:root[data-theme="${theme}"] {`);return Object.fromEntries([...css.slice(at,css.indexOf('\n}',at)).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));};
type P=[number,number,number];type Tri={p:number[];n:number[];c:number[];r:number;e:number;uv:number[];alpha:number[];texture:any;cutoff:number;transparent:boolean;double:boolean;sort:number};
const nodes=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n]));
function geometry(ids:string[],theme:string,open=false){const tris:Tri[]=[],palette=tokens(theme);for(const id of ids){const node=nodes.get(id)!;for(const [primitiveIndex,p] of node.getMesh()!.listPrimitives().entries()){const w=new Matrix4().fromArray(node.getWorldMatrix()),part=parts.find((p:any)=>p.id===id),base=new Color(palette[part.material.tint.slice(6)]),pos=p.getAttribute('POSITION')!,norm=p.getAttribute('NORMAL')!,col=p.getAttribute('COLOR_0'),ix=p.getIndices()!,r=p.getMaterial()!.getRoughnessFactor(),env=resolveMaterialLook(part.material.color,palette,theme as 'paper'|'cinema',part.material.tint).envIntensity;
 if(open&&id==='gill-cover'){const pose=fileData.poses['gills-open']['gill-cover'],pivot=new Vector3(...pose.pivot as P);w.premultiply(new Matrix4().makeTranslation(...pivot.toArray() as P).multiply(new Matrix4().makeRotationY(pose.rotation[1]*Math.PI/180)).multiply(new Matrix4().makeTranslation(...pivot.clone().negate().toArray() as P)));}
 const root=runtimeModel.scene.getObjectByName(PropertyBinding.sanitizeNodeName(id))!,loadedMeshes:Mesh[]=[];root.traverse(o=>{if(o instanceof Mesh)loadedMeshes.push(o);});const loaded=loadedMeshes[primitiveIndex]!;
 if(!loaded||loadedMeshes.length!==node.getMesh()!.listPrimitives().length)throw new Error('Missing loader surface');
 const target=new MeshStandardMaterial({color:base,roughness:r,envMapIntensity:env});const surface=gltfSurface(loaded);surface?.style(target);surface?.fade(target,1,false);
 const source=loaded.material as MeshStandardMaterial;
 surfaceProbes[id+'-'+primitiveIndex]={pendingGroupPatch:loadedMeshes.length>1,roughness:target.roughness,vertexColors:target.vertexColors,requestedAlphaHash:source.userData.atlasAlphaHash===true,rendererAlphaHash:target.alphaHash,alphaTest:target.alphaTest,alphaToCoverage:target.alphaToCoverage,transparent:target.transparent,depthWrite:target.depthWrite};
 if(target.alphaHash)throw new Error('Engine now enables alpha hashing: extend the offline coverage renderer before claiming parity');
 const runtimeColor=target.color.toArray(),texture=source.map?.image,cutoff=target.alphaTest;target.dispose();
 const nm=new Matrix3().getNormalMatrix(w);
 for(let k=0;k<ix.getCount();k+=3){const t:Tri={p:[],n:[],c:[],r,e:env,uv:[],alpha:[],texture,cutoff,transparent:source.transparent,double:source.side===2,sort:primitiveIndex};for(let j=0;j<3;j++){const i=ix.getScalar(k+j);t.uv.push(...(p.getAttribute('TEXCOORD_0')?.getElement(i,[0,0])??[0,0]));t.alpha.push(col?.getElementSize()===4?col.getElement(i,[0,0,0,0])[3]!:1);t.p.push(...new Vector3(...pos.getElement(i,[0,0,0]) as P).applyMatrix4(w).toArray());t.n.push(...new Vector3(...norm.getElement(i,[0,0,0]) as P).applyMatrix3(nm).normalize().toArray());t.c.push(...(col?col.getElement(i,[0,0,0]).slice(0,3):[1,1,1]).map((x,i)=>x*runtimeColor[i]!));}tris.push(t);}
 }}return tris;}
// The engine uses FXAA. Supersampling avoids claiming pixel identity while
// preventing subpixel vein/ray alias dots from being mistaken for mesh holes.

async function render(ids:string[],position:P,target:P,name:string,theme:'paper'|'cinema'='paper',fov=29,open=false){
 const wide=name.startsWith('fish-beat'),W=wide?1920:1280,H=wide?1080:960;
 const cam=new PerspectiveCamera(fov,W/H,.0001,20);cam.position.fromArray(position);cam.lookAt(new Vector3(...target));cam.updateMatrixWorld();const cm=new Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse),N=W*H;
 const depth=new Float32Array(N).fill(Infinity),norm=new Float32Array(N*3),base=new Float32Array(N*3),world=new Float32Array(N*3),rough=new Float32Array(N),env=new Float32Array(N),v=new Vector3();
 const triangles=geometry(ids,theme,open),sorting=new Map<number,number>(),bounds=new Map<number,{min:P;max:P}>();
 for(const t of triangles)if(t.transparent){const box=bounds.get(t.sort)??{min:[Infinity,Infinity,Infinity] as P,max:[-Infinity,-Infinity,-Infinity] as P};for(let k=0;k<9;k++){const j=k%3;box.min[j]=Math.min(box.min[j]!,t.p[k]!);box.max[j]=Math.max(box.max[j]!,t.p[k]!);}bounds.set(t.sort,box);}
 for(const [key,box]of bounds)sorting.set(key,new Vector3(...box.min.map((x,j)=>(x+box.max[j]!)/2) as P).applyMatrix4(cm).z);
 // Separate web render items sort back-to-front; triangles retain asset order.
 triangles.sort((a,b)=>Number(a.transparent)-Number(b.transparent)||(a.transparent?(sorting.get(b.sort)??0)-(sorting.get(a.sort)??0):0));
 const display=new Float32Array(N*3),ready=new Uint8Array(N),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124').convertLinearToSRGB();
 const shade=(b:P,n:P,p:P,r:number,e:number)=>new Color().fromArray(aces(studioShade(b,new Vector3(...n).normalize().toArray() as P,cam.position.clone().sub(new Vector3(...p)).normalize().toArray() as P,theme,r,0,(d,r)=>roomRadiance(d,r)*e),studioRigs[theme].exposure)).convertLinearToSRGB().toArray();
 function opaque(i:number){return depth[i]===Infinity?bg.toArray():shade(Array.from(base.slice(i*3,i*3+3)) as P,Array.from(norm.slice(i*3,i*3+3)) as P,Array.from(world.slice(i*3,i*3+3)) as P,rough[i]!,env[i]!);}
 for(const tri of triangles){
  const q:number[]=[],inv:number[]=[];for(let j=0;j<3;j++){v.fromArray(tri.p,j*3);const e=cm.elements;inv[j]=1/(e[3]!*v.x+e[7]!*v.y+e[11]!*v.z+e[15]!);v.applyMatrix4(cm);q.push((v.x*.5+.5)*W,(-v.y*.5+.5)*H,v.z);}
  if([q[2],q[5],q[8]].some(z=>z! < -1||z! > 1))continue;
  const [ax,ay,az,bx,by,bz,cx,cy,cz]=q as number[],d=(by!-cy!)*(ax!-cx!)+(cx!-bx!)*(ay!-cy!);// WebGL FrontSide culls by projected triangle winding, never by the
  // interpolated shading normal. Normal-based culling invented mouth holes.
  if(Math.abs(d)<1e-8||(!tri.double&&d>=0))continue;
  const x0=Math.max(0,Math.floor(Math.min(ax!,bx!,cx!))),x1=Math.min(W-1,Math.ceil(Math.max(ax!,bx!,cx!))),y0=Math.max(0,Math.floor(Math.min(ay!,by!,cy!))),y1=Math.min(H-1,Math.ceil(Math.max(ay!,by!,cy!)));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   let a=((by!-cy!)*(x+.5-cx!)+(cx!-bx!)*(y+.5-cy!))/d,b=((cy!-ay!)*(x+.5-cx!)+(ax!-cx!)*(y+.5-cy!))/d,c=1-a-b;if(a<0||b<0||c<0)continue;const i=y*W+x,z=a*az!+b*bz!+c*cz!;if(z>=depth[i]!)continue;
   const sum=a*inv[0]!+b*inv[1]!+c*inv[2]!;a=a*inv[0]!/sum;b=b*inv[1]!/sum;c=c*inv[2]!/sum;
   if(tri.texture){const im=tri.texture,u=a*tri.uv[0]!+b*tri.uv[2]!+c*tri.uv[4]!,v=a*tri.uv[1]!+b*tri.uv[3]!+c*tri.uv[5]!,tx=(u-Math.floor(u))*im.width-.5,ty=(v-Math.floor(v))*im.height-.5,xx=Math.floor(tx),yy=Math.floor(ty),fx=tx-xx,fy=ty-yy;let alpha=0;
    for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)alpha+=im.data[((yy+dy+im.height)%im.height*im.width+(xx+dx+im.width)%im.width)*4+3]/255*(dx?fx:1-fx)*(dy?fy:1-fy);
    if(alpha*(a*tri.alpha[0]!+b*tri.alpha[1]!+c*tri.alpha[2]!)<tri.cutoff)continue;
   }
   const n=tri.n.slice(0,3).map((n,j)=>a*n+b*tri.n[j+3]!+c*tri.n[j+6]!) as P,p=tri.p.slice(0,3).map((p,j)=>a*p+b*tri.p[j+3]!+c*tri.p[j+6]!) as P;

   if(tri.double&&d>0)for(let k=0;k<3;k++)n[k]=-n[k]!;
   if(tri.transparent){if(!ready[i]){display.set(opaque(i),i*3);ready[i]=1;}const tone=shade(tri.c.slice(0,3).map((v,j)=>a*v+b*tri.c[j+3]!+c*tri.c[j+6]!) as P,n,p,tri.r,tri.e),alpha=a*tri.alpha[0]!+b*tri.alpha[1]!+c*tri.alpha[2]!;for(let j=0;j<3;j++)display[i*3+j]=display[i*3+j]!*(1-alpha)+tone[j]!*alpha;continue;}
   depth[i]=z;norm.set(n,i*3);world.set(p,i*3);base.set(tri.c.slice(0,3).map((v,j)=>a*v+b*tri.c[j+3]!+c*tri.c[j+6]!),i*3);rough[i]=tri.r;env[i]=tri.e;
  }
 }
 const pixels=new Uint8Array(N*3);
 for(let i=0;i<N;i++)pixels.set((ready[i]?Array.from(display.slice(i*3,i*3+3)):opaque(i)).map(v=>Math.max(0,Math.min(255,Math.round(v*255)))),i*3);
 await sharp(pixels,{raw:{width:W,height:H,channels:3}}).resize(wide?960:640,wide?540:480,{kernel:'lanczos3'}).png().toFile(`${out}/${name}.png`);
}
const hero=process.argv[3]??'all';
const chapter=parse(fs.readFileSync('src/content/topics/heart-and-lungs/chapters/06-plants-fish-humans.mdx','utf8').split('---')[1]!);
const beat3=chapter.state.beats[2].camera,beat2=chapter.state.beats[1].camera;
const F:P=[1.07,.2,-.07],P0:P=[1.29,.31,-.07],G:P=[1.016,.2,-.048];
if(hero==='all'||hero==='fish'||hero==='fish-front-only')await render(['fish-body','gills','gill-cover'],add(F,[-.22,-.045,.031]),add(F,[-.065,.007,0]),'fish-front');
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],add(F,[-.095,.040,.40]),add(F,[0,.008,0]),'fish-three-quarter');
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],add(F,[0,.018,.41]),add(F,[0,.008,0]),'fish-profile');
if(hero==='all'||hero==='fish'||hero==='fish-close-only')await render(['fish-body','gills','gill-cover'],add(F,[-.065,.012,.20]),add(F,[-.065,.006,.01]),'fish-close', 'paper',29);
if(hero==='all'||hero==='fish'||hero==='fish-scales-only')await render(['fish-body'],add(F,[.005,.015,.13]),add(F,[.005,.015,.018]),'fish-scales','paper',29);
if(hero==='all'||hero==='fish'||hero==='fish-fin-only')await render(['fish-body'],add(F,[-.015,.055,.16]),add(F,[-.015,.047,0]),'fish-fin-close','paper',29);
if(hero==='fish')await render(['fish-body','gills','gill-cover'],beat2.position,beat2.target,'fish-beat2','paper',beat2.fov,true);
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],beat3.position,beat3.target,'fish-beat3','paper',beat3.fov,true);
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],beat3.position,beat3.target,'fish-beat3-closed','paper',beat3.fov,false);
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],add(F,[.16,.07,.31]),add(F,[-.06,.005,.01]),'fish-open','paper',29,true);
if(hero==='all'||hero==='gills')for(const [name,offset] of [['gills-front',[-.10,0,0]],['gills-three-quarter',[-.07,.04,.12]],['gills-profile',[0,0,.14]],['gills-close',[.005,.003,.12]]] as [string,P][])await render(['gills'],add(G,offset),G,name);
if(hero==='all'||hero==='plant')for(const [name,offset] of [['plant-front',[0,.015,.72]],['plant-three-quarter',[-.38,.22,.60]],['plant-profile',[.70,.015,0]],['plant-close',[.08,.13,.25]]] as [string,P][])await render(['plant-specimen'],add(P0,offset),name==='plant-close'?add(P0,[.01,.02,.03]):P0,name);
if(hero==='all'||hero==='fish')await render(['fish-body','gills','gill-cover'],add(F,[-.12,.045,.50]),F,'fish-cinema','cinema');
if(hero==='all'||hero==='plant')await render(['plant-specimen'],add(P0,[-.38,.22,.60]),P0,'plant-cinema','cinema');
fs.writeFileSync(`${out}/preview-rig.json`,JSON.stringify({assetSha256,studioRigs,surfaceProbes,materialEnvironment:parts.filter((p:any)=>['fish-body','gills','gill-cover'].includes(p.id)).map((p:any)=>({id:p.id,paper:resolveMaterialLook(p.material.color,tokens('paper'),'paper',p.material.tint).envIntensity})),method:'Decoded deployed GLB + pending transparent-fins.patch multi-surface contract; CPU depth raster; numerical GGX, RoomEnvironment integration, actual engine studio rig and ACES; not GPU acceptance.'},null,2));
function add(a:P,b:P):P{return a.map((x,i)=>x+b[i]!) as P;}
runtimeModel.scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});
console.log(`Wrote studio previews: ${out}`);
