/** Build-time fused anatomical grip sculptures. Original Atlas code, CC BY-SA 4.0. */
import fs from 'node:fs';
import {BufferGeometry,BufferAttribute,CatmullRomCurve3,Vector3,MeshBasicMaterial} from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import {NodeIO,Document} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {weld,quantize,reorder,prune,compactPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
type V=[number,number,number];type Field=(x:number,y:number,z:number)=>number;
const add=(a:V,b:V):V=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a:V,t:number):V=>[a[0]*t,a[1]*t,a[2]*t],unit=(a:V)=>mul(a,1/Math.hypot(...a));
function ellipsoid(c:V,r:V):Field{return(x,y,z)=>{const p=[x-c[0],y-c[1],z-c[2]],k0=Math.hypot(p[0]!/r[0],p[1]!/r[1],p[2]!/r[2]),k1=Math.hypot(p[0]!/r[0]**2,p[1]!/r[1]**2,p[2]!/r[2]**2);return k1?k0*(k0-1)/k1:-Math.min(...r);};}
const smin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
function digit(points:V[],radius:number):{field:Field;nail:Field;groove:Field}{
 const path=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal').getPoints(24).map(p=>p.toArray()as V);
 const radii=path.map((_,i)=>{const t=i/(path.length-1);return radius*(1-.27*t+.10*Math.exp(-(((t-.12)/.1)**2))+.11*Math.exp(-(((t-.47)/.065)**2))+.075*Math.exp(-(((t-.76)/.055)**2)));});
 const segments=path.slice(0,-1).map((a,i)=>{const b=path[i+1]!,dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];return{a,dx,dy,dz,den:dx*dx+dy*dy+dz*dz,r0:radii[i]!,r1:radii[i+1]!};});
 const field:Field=(x,y,z)=>{let d=1;for(const s of segments){const h=Math.max(0,Math.min(1,((x-s.a[0])*s.dx+(y-s.a[1])*s.dy+(z-s.a[2])*s.dz)/s.den));const qx=s.a[0]+s.dx*h,qy=s.a[1]+s.dy*h,qz=s.a[2]+s.dz*h,r=s.r0+(s.r1-s.r0)*h;d=smin(d,Math.hypot(x-qx,y-qy,z-qz)-r,.0012);}return d;};
 const a=path[20]!,b=path[23]!,t=unit(sub(b,a)),n=unit([0,t[2],-t[1]]),c=add(path[22]!,mul(n,radius*.79)),u:V=[1,0,0],len=radius*.72,w=radius*.62;
 // True raised curved nail plate, fused into the distal phalanx's dorsal surface.
 const nail:Field=(x,y,z)=>{const q=sub([x,y,z],c),local:V=[dot(q,u),dot(q,t),dot(q,n)];return ellipsoid([0,0,0],[w,len,.0012])(...local);};const groove:Field=(x,y,z)=>{const q=sub([x,y,z],c),a=dot(q,u),b=dot(q,t),h=dot(q,n);if(Math.abs(a)>w*1.4||Math.abs(b)>len*1.4)return 1;return Math.max(Math.abs(Math.hypot(a/w,b/len)-1)*Math.min(w,len)-.00055,Math.abs(h+.0003)-.0011);};return{field,nail,groove};
}
function sculpt(kind:'fist'|'palm'|'relaxed',grip=.015):BufferGeometry{
 const cy=kind==='fist'?-.0385:.0425,cz=kind==='fist'?-(grip+.0155):kind==='palm'?-.014:0;
 const grooves:Field[]=[];const fields:Field[]=[ellipsoid([-.001,cy+.008,cz],[.041,.038,.013]),ellipsoid([.022,cy-.015,cz+.002],[.021,.032,.017]),ellipsoid([-.024,cy-.008,cz],[.017,.035,.013]),ellipsoid([0,cy-.037,cz],[.026,.016,.013])];
 const fingers=[{x:.029,r:.0085,len:.072},{x:.0095,r:.0088,len:.080},{x:-.0095,r:.0084,len:.075},{x:-.0285,r:.0074,len:.060}];
 for(const f of fingers){let p:V[];if(kind==='fist'){const R=grip+f.r+.001;const end=-8+f.len/R*180/Math.PI;const phis=[-8,24,end*.46,end*.76,end];p=phis.map((deg,i)=>[f.x,Math.sin(deg*Math.PI/180)*R-(i===0?.008:0),-Math.cos(deg*Math.PI/180)*R]as V);}else{const z=kind==='palm'?-.0085:0,curl=kind==='palm'?.002:.028;p=[[f.x,.076,z],[f.x,.083,z],[f.x,.083+f.len*.46,z+curl*.15],[f.x,.083+f.len*.76,z+curl*.53],[f.x,.083+f.len,z+curl]];}const d=digit(p,f.r);fields.push(d.field,d.nail);grooves.push(d.groove);if(kind!=='fist')fields.push(ellipsoid([f.x,.080,cz-.010],[f.r*1.02,.010,.0058]));}
 const thumb=digit(kind==='fist'?[[.030,-.068,cz],[.047,-.048,cz+.002],[.053,-.021,.014],[.030,-.016,.030],[.016,-.027,.030]]:[[.026,.018,cz],[.043,.026,cz+.002],[.059,.045,cz+.008],[.070,.063,cz+.011]],.010);fields.push(thumb.field,thumb.nail);grooves.push(thumb.groove);
 const field:Field=(x,y,z)=>{let d=fields.reduce((v,f,i)=>smin(v,f(x,y,z),i<4?.007:.0028),1);for(const g of grooves)d=Math.max(d,-g(x,y,z));return d;};
 const lo:V=[-.064,kind==='fist'?-.100:-.018,kind==='fist'?-.068:-.042],hi:V=[.092,kind==='fist'?.065:.185,kind==='fist'?.067:.070],n=128;
 const mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,180000);mc.isolation=0;
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++)mc.field[z*n*n+y*n+x]=-field(lo[0]+(hi[0]-lo[0])*x/n,lo[1]+(hi[1]-lo[1])*y/n,lo[2]+(hi[2]-lo[2])*z/n);
 mc.update();const count=mc.geometry.drawRange.count,pa=mc.geometry.getAttribute('position'),na=mc.geometry.getAttribute('normal'),pos=new Float32Array(count*3),normal=new Float32Array(count*3);
 for(let i=0;i<count;i++)for(let j=0;j<3;j++){pos[i*3+j]=lo[j]!+(pa.array[i*3+j]!+1)*.5*(hi[j]!-lo[j]!);normal[i*3+j]=na.array[i*3+j]!/(hi[j]!-lo[j]!);}
 if(kind==='palm'){let top=-Infinity;for(let i=2;i<pos.length;i+=3)top=Math.max(top,pos[i]!);for(let i=2;i<pos.length;i+=3)pos[i]!-=top;}
 const g=new BufferGeometry().setAttribute('position',new BufferAttribute(pos,3)).setAttribute('normal',new BufferAttribute(normal,3));g.normalizeNormals();mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();return g;
}
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder}),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene(),baked:Record<string,{p:string;n:string;i:string}>= {};
const mat=doc.createMaterial('technical-plate-mannequin').setBaseColorFactor([.65,.64,.6,1]).setRoughnessFactor(.85);
for(const[kind,grip]of[['relaxed',.015],['palm',.015],['fist-12',.012],['fist-15',.015],['fist-18',.018],['fist-25',.025]]as const){
 const g=sculpt(kind.startsWith('fist')?'fist':kind as 'relaxed'|'palm',grip),p=doc.createPrimitive(),accessor=(name:string,type:'VEC3'|'SCALAR',a:Float32Array|Uint32Array)=>doc.createAccessor(name).setType(type).setArray(a instanceof Float32Array ? new Float32Array(a) : new Uint32Array(a)).setBuffer(buffer);p.setAttribute('POSITION',accessor(kind+'-p','VEC3',g.getAttribute('position').array as Float32Array)).setAttribute('NORMAL',accessor(kind+'-n','VEC3',g.getAttribute('normal').array as Float32Array)).setMaterial(mat);const mesh=doc.createMesh(kind).addPrimitive(p);scene.addChild(doc.createNode(kind).setMesh(mesh));await doc.transform(weld());const positions=p.getAttribute('POSITION')!,indices=p.getIndices()!;const [ix,error]=MeshoptSimplifier.simplify(new Uint32Array(indices.getArray()!),new Float32Array(positions.getArray()!),3,9000*3,.00020,['LockBorder','ErrorAbsolute']);p.setIndices(accessor(kind+'-i','SCALAR',ix));compactPrimitive(p);baked[kind]={p:Buffer.from(p.getAttribute('POSITION')!.getArray()!.buffer).toString('base64'),n:Buffer.from(p.getAttribute('NORMAL')!.getArray()!.buffer).toString('base64'),i:Buffer.from(p.getIndices()!.getArray()!.buffer).toString('base64')};console.log(kind,ix.length/3,error);
}
doc.getRoot().getAsset().copyright='Atlas original fused anatomical grip sculptures; CC BY-SA 4.0. Five digits; fingers MCP/PIP/DIP, thumb MCP/IP; raised nail plates and joint contours. Geometry is a display reconstruction, not an individual measurement.';
await doc.transform(reorder({encoder:MeshoptEncoder}),quantize({quantizePosition:16,quantizeNormal:10}),prune());doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});await io.write('public/models/muscles-arms-hands.glb',doc);fs.writeFileSync('scripts/anatomy/cache/rebuild-hand-baked.json',JSON.stringify(baked));
