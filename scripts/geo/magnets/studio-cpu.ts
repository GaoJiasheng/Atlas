/** Topic-local copy of fossils-and-skeletons/studio-cpu.ts with the runtime
 * per-family envMapIntensity multiplier added. No shared kit is modified.
 * Offline CPU counterpart of Lighting.tsx + three's MeshStandardMaterial.
 * The three direct lights, hemisphere, exposure, linear working space, GGX,
 * multiscattering and ACES matrices match the installed renderer. The actual
 * RoomEnvironment is ray sampled and spherically Gaussian filtered (PMREM's
 * sigma table); finite sampling replaces GPU cubeUV filtering, so this is a
 * lighting-matched numerical preview, not a claim of GPU pixel identity.
 */
import { Color, Matrix4, Raycaster, Vector3, Mesh, MeshStandardMaterial } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import fs from 'node:fs';
type V=[number,number,number];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=(a:V):V=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l) as V;};
const c=(s:string):V=>new Color(s).toArray() as V;
export const studioRigs={
 paper:{hemi:[c('#fff6e8'),c('#c9bea6'),.75] as const,lights:[['#fff0dc',2.6,[.55,1,.7]],['#e9edf0',.55,[-1,.35,.45]],['#ffffff',.9,[-1,.45,-.7]]] as const,env:.7,exposure:1.05},
 cinema:{hemi:[c('#aab4be'),c('#17181a'),.35] as const,lights:[['#e9eff5',2.4,[.55,1,.7]],['#c9d1d9',.28,[-1,.35,.45]],['#f2f2f2',1.15,[-1,.45,-.7]]] as const,env:.8,exposure:1},
};
const dirs=Object.fromEntries(Object.entries(studioRigs).map(([k,r])=>[k,r.lights.map(([hex,p,d])=>({d:norm([...d]),c:c(hex).map(v=>v*p) as V}))]));
const cache='/private/tmp/fossils-fix-2026-11-04/room-radiance-v2.json';
const W=96,H=48;
let maps:number[][]=[];
/** Capture the installed RoomEnvironment, including boxes and luminous panels.
 * Its white room has no map or normal map; evaluate the point-light GGX once
 * per sampled ray. PMREM.fromScene uses no tone mapping on this capture. */
export function prepareStudio(){
 if(maps.length)return;
 if(fs.existsSync(cache)){maps=JSON.parse(fs.readFileSync(cache,'utf8'));return;}
 const room=new RoomEnvironment();room.updateMatrixWorld(true);
 const caster=new Raycaster(),origin=new Vector3(),direction=new Vector3();
 const samples:{d:V;l:number}[]=[];
 for(let i=0;i<24000;i++){
  const y=1-2*(i+.5)/24000,phi=i*Math.PI*(3-Math.sqrt(5)),r=Math.sqrt(1-y*y),d:V=[Math.cos(phi)*r,y,Math.sin(phi)*r];
  direction.fromArray(d);caster.set(origin,direction);
  const hit=caster.intersectObjects(room.children,false)[0];if(!hit)continue;
  const mat=(hit.object as Mesh).material as MeshStandardMaterial;
  let radiance=(mat.emissive?.r??0)*(mat.emissiveIntensity??0);
  if(radiance===0){
   const p=hit.point,n=hit.normal!.clone(); // Raycaster's normal is in local space.
   if(hit.instanceId!==undefined){const m=(hit.object as any);m.getMatrixAt(hit.instanceId,matrix);n.transformDirection(matrix);}
   n.transformDirection(hit.object.matrixWorld);if(n.dot(direction)>0)n.negate();
   const toLight=new Vector3(.418,16.199,.300).sub(p),distance=toLight.length();toLight.normalize();
   const cutoff=Math.max(0,1-(distance/28)**4)**2;
   const attenuation=900/Math.max(distance*distance,.01)*cutoff;
   radiance=attenuation*Math.max(0,n.dot(toLight))*(1/Math.PI+ggx(n.toArray() as V,norm(d.map(v=>-v) as V),toLight.toArray() as V,1,.04));
  }
  samples.push({d,l:radiance});
 }
 // PMREM's final roughness=1 mip uses sigma=.582 radians. Integrate an
 // isotropic spherical Gaussian rather than approximate the room as ambient.
 for(const sigma of [.582,.35,.215,.125]){
  const map:number[]=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const t=Math.PI*(y+.5)/H,p=2*Math.PI*(x+.5)/W,d:V=[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];
   let sum=0,weight=0;
   for(const s of samples){const a=Math.acos(Math.max(-1,Math.min(1,dot(d,s.d)))),w=Math.exp(-a*a/(2*sigma*sigma));sum+=w*s.l;weight+=w;}
   map.push(sum/weight);
  }
  maps.push(map);
 }
 fs.mkdirSync('/private/tmp/fossils-fix-2026-11-04',{recursive:true});fs.writeFileSync(cache,JSON.stringify(maps));room.dispose();
}
const matrix=new Matrix4();
function env(d:V,roughness:number){
 const lod=roughness>=.85?0:roughness>=.65?1:roughness>=.45?2:3;
 const x=((Math.atan2(d[2],d[0])/(2*Math.PI)+1)%1)*W-.5,y=Math.acos(Math.max(-1,Math.min(1,d[1])))/Math.PI*H-.5;
 const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,map=maps[lod]!;
 const at=(a:number,b:number)=>map[Math.max(0,Math.min(H-1,b))*W+((a%W+W)%W)]!;
 return (at(ix,iy)*(1-u)+at(ix+1,iy)*u)*(1-v)+(at(ix,iy+1)*(1-u)+at(ix+1,iy+1)*u)*v;
}
function ggx(n:V,v:V,l:V,r:number,f0:number){
 const h=norm(v.map((x,i)=>x+l[i]!) as V),nl=clamp(dot(n,l)),nv=clamp(dot(n,v)),nh=clamp(dot(n,h)),vh=clamp(dot(v,h));
 const a2=r**4,visibility=.5/Math.max(1e-6,nl*Math.sqrt(a2+(1-a2)*nv*nv)+nv*Math.sqrt(a2+(1-a2)*nl*nl));
 const distribution=a2/(Math.PI*(nh*nh*(a2-1)+1)**2),fresnel=f0+(1-f0)*2**((-5.55473*vh-6.98316)*vh);
 return fresnel*visibility*distribution;
}
export function aces(rgb:V,exposure:number):V{
 const v=rgb.map(x=>x*exposure/.6) as V;
 const m:V=[.59719*v[0]+.35458*v[1]+.04823*v[2],.076*v[0]+.90834*v[1]+.01566*v[2],.0284*v[0]+.13383*v[1]+.83777*v[2]];
 const f=m.map(x=>(x*(x+.0245786)-.000090537)/(x*(.983729*x+.432951)+.238081));
 return [clamp(1.60475*f[0]!-.53108*f[1]!-.07367*f[2]!),clamp(-.10208*f[0]!+1.10813*f[1]!-.00605*f[2]!),clamp(-.00327*f[0]!-.07276*f[1]!+1.07602*f[2]!)];
}
/** Linear outgoing radiance, prior to ACES/output conversion. Roughness map's
 * mean is .92 for the old family; atlasSurface removes it for the new bone. */
export function studioShade(albedo:V,n:V,v:V,theme:'paper'|'cinema',roughness:number,metalness=0,environment=env,environmentScale=1):V{
 const rig=studioRigs[theme],hemi=rig.hemi,w=n[1]*.5+.5,nv=clamp(dot(n,v));
 const radiance:V=[0,0,0];
 const reflection=norm(n.map((x,i)=>(2*dot(n,v)*x-v[i]!)*(1-roughness*roughness)+x*roughness*roughness) as V);
 const diffuseEnv=environment(n,1)*rig.env*environmentScale,specularEnv=environment(reflection,roughness)*rig.env*environmentScale;
 const rx=1-roughness,ry=.0425-.0275*roughness,rz=1.04-.572*roughness,rw=.022*roughness-.04;
 const a004=Math.min(rx*rx,2**(-9.28*nv))*rx+ry,fab0=-1.04*a004+rz,fab1=1.04*a004+rw,ems=1-fab0-fab1;
 const f0=albedo.map(x=>.04*(1-metalness)+x*metalness),single=f0.map(x=>x*fab0+fab1),multi=f0.map((x,i)=>single[i]!*(x+(1-x)/21)/(1-ems*(x+(1-x)/21))*ems);
 const diffuseScale=1-Math.max(...single.map((x,i)=>x+multi[i]!));
 for(let i=0;i<3;i++)radiance[i]=((hemi[1][i]!*(1-w)+hemi[0][i]!*w)*hemi[2]/Math.PI+diffuseEnv*diffuseScale)*albedo[i]!*(1-metalness)+specularEnv*single[i]!+multi[i]!*diffuseEnv;
 for(const l of dirs[theme]!){const nl=clamp(dot(n,l.d));for(let i=0;i<3;i++)radiance[i]!+=l.c[i]!*nl*(albedo[i]!*(1-metalness)/Math.PI+ggx(n,v,l.d,roughness,f0[i]!));}
 return radiance;
}
