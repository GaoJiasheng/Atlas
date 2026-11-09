/** Offline counterpart of Model3DStage's studio (Lighting.tsx).
 * Same light colours/directions/intensities, material families, exposure and
 * Three r180 ACES transform. The actual RoomEnvironment is sampled into SH
 * diffuse irradiance on the CPU. Direct specular uses GGX; PMREM specular,
 * procedural finish maps, shadows and screen-space selection are not simulated.
 */
import { Color, Matrix3, Mesh, PointLight, Raycaster, SphericalHarmonics3, Vector3, type MeshStandardMaterial } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MaterialLook } from '../../../src/engines/space-scene/lib/color';
export type RGB=[number,number,number];
const linear=(hex:string)=>new Color(hex).toArray() as RGB;
const dirs=[[.55,1,.7],[-1,.35,.45],[-1,.45,-.7]].map(v=>new Vector3(...v).normalize());
const rigs={paper:{hemi:['#fff6e8','#c9bea6',.75] as const,lights:[['#fff0dc',2.6],['#e9edf0',.55],['#ffffff',.9]] as const,env:.7,exposure:1.05},cinema:{hemi:['#aab4be','#17181a',.35] as const,lights:[['#e9eff5',2.4],['#c9d1d9',.28],['#f2f2f2',1.15]] as const,env:.8,exposure:1}};
function roomDiffuse(){
 const room=new RoomEnvironment();room.updateMatrixWorld(true);
 const meshes=room.children.filter(x=>x instanceof Mesh),source=room.children.find(x=>x instanceof PointLight) as PointLight;
 const sh=new SphericalHarmonics3(),basis=new Array<number>(9),ray=new Raycaster(),n=new Vector3(),toLight=new Vector3();
 const normalMatrix=new Matrix3();
 // Fibonacci quadrature over the whole sphere. Emission panels are sampled
 // directly; white room/boxes receive the same inverse-square point source.
 const samples=16384;
 for(let i=0;i<samples;i++){
  const y=1-2*(i+.5)/samples,r=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));
  ray.set(new Vector3(),new Vector3(r*Math.cos(a),y,r*Math.sin(a)));
  const hit=ray.intersectObjects(meshes,false)[0];if(!hit)continue;
  const object=hit.object as Mesh,material=(Array.isArray(object.material)?object.material[hit.face!.materialIndex]:object.material) as MeshStandardMaterial;
  normalMatrix.getNormalMatrix(object.matrixWorld);n.copy(hit.face!.normal).applyMatrix3(normalMatrix).normalize();if(n.dot(ray.ray.direction)>0)n.negate();
  toLight.copy(source.position).sub(hit.point);const distance=toLight.length();toLight.normalize();
  const cutoff=Math.pow(Math.max(0,1-Math.pow(distance/source.distance,4)),2);
  const irradiance=source.intensity/Math.max(distance*distance,.01)*cutoff*Math.max(0,n.dot(toLight))/Math.PI;
  const c=material.color.clone().multiplyScalar(irradiance);
  if(material.emissive)c.add(material.emissive.clone().multiplyScalar(material.emissiveIntensity));
  SphericalHarmonics3.getBasisAt(ray.ray.direction,basis);
  for(let k=0;k<9;k++)sh.coefficients[k]!.addScaledVector(new Vector3(c.r,c.g,c.b),basis[k]!*4*Math.PI/samples);
 }
 room.dispose();return sh;
}
const environment=roomDiffuse(),irradiance=new Vector3(),view=new Vector3(),half=new Vector3();
export function studio(theme:'paper'|'cinema'){
 const rig=rigs[theme],sky=linear(rig.hemi[0]),ground=linear(rig.hemi[1]),lights=rig.lights.map(([c,p])=>linear(c).map(v=>v*p) as RGB);
 return {
  shade(normal:Vector3,point:Vector3,eye:Vector3,look:MaterialLook):RGB{
   const c=linear(look.color),result:RGB=[0,0,0],hemi=normal.y*.5+.5;
   environment.getIrradianceAt(normal,irradiance);
   view.copy(eye).sub(point).normalize();const nv=Math.max(.001,normal.dot(view)),alpha=look.roughness**2,a2=alpha*alpha;
   for(let k=0;k<3;k++)result[k]=c[k]!*(1-look.metalness)*((ground[k]!*(1-hemi)+sky[k]!*hemi)*rig.hemi[2]+Math.max(0,irradiance.getComponent(k))*rig.env*look.envIntensity)/Math.PI+c[k]!*look.glow;
   for(let i=0;i<3;i++){
    const light=dirs[i]!,nl=Math.max(0,normal.dot(light));if(!nl)continue;
    half.copy(light).add(view).normalize();const nh=Math.max(0,normal.dot(half)),vh=Math.max(0,view.dot(half));
    const d=a2/(Math.PI*(nh*nh*(a2-1)+1)**2),g=.5/Math.max(.00001,nl*Math.sqrt(nv*nv*(1-a2)+a2)+nv*Math.sqrt(nl*nl*(1-a2)+a2));
    for(let k=0;k<3;k++){const f0=.04*(1-look.metalness)+c[k]!*look.metalness,f=f0+(1-f0)*(1-vh)**5;result[k]!+=lights[i]![k]!*nl*(c[k]!*(1-look.metalness)/Math.PI+f*d*g);}
   }
   return result;
  },
  encode(r:number,g:number,b:number):RGB{
   // Exact column-major ACESInputMat / ACESOutputMat from Three r180.
   const e=rig.exposure/.6;r*=e;g*=e;b*=e;
   const fit=(v:number)=>(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);
   const x=fit(.59719*r+.35458*g+.04823*b),y=fit(.076*r+.90834*g+.01566*b),z=fit(.0284*r+.13383*g+.83777*b);
   const srgb=(v:number)=>{v=Math.max(0,Math.min(1,v));return Math.round(255*(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055));};
   return [srgb(1.60475*x-.53108*y-.07367*z),srgb(-.10208*x+1.10813*y-.00605*z),srgb(-.00327*x-.07276*y+1.07602*z)];
  }
 };
}
