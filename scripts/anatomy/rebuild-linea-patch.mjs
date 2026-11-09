/** Source-profile fascia reconstruction for scoped, unapplied engine integration.
 * Z-Anatomy derivative, CC BY-SA 4.0; teaching parts and counts are unchanged.
 */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {NodeIO} from '@gltf-transform/core';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3,CatmullRomCurve3} from 'three';
const req=createRequire(import.meta.url);
const {ALL_EXTENSIONS}=await import(pathToFileURL(req.resolve('@gltf-transform/extensions',{paths:[dirname(req.resolve('@gltf-transform/functions'))]})));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const native=JSON.parse(await fs.readFile('scripts/anatomy/cache/rebuild-source.json','utf8')).meshes['Linea alba'];
const points=[];
for(let i=0;i<native.positions.length;i+=3)points.push(native.positions.slice(i,i+3));
const lo=Math.min(...points.map(p=>p[1])),hi=Math.max(...points.map(p=>p[1]));
// Derive centre, anterior depth and width from native sections. A smoothed
// envelope removes jagged source tessellation without making a segmented ladder.
let profile=Array.from({length:19},(_,i)=>{
 const y=lo+(hi-lo)*i/18,q=points.filter(p=>Math.abs(p[1]-y)<.025);
 const xs=q.map(p=>p[0]),zs=q.map(p=>p[2]).sort((a,b)=>a-b);
 return [(Math.min(...xs)+Math.max(...xs))/2,y,zs[Math.floor((zs.length-1)*.9)],(Math.max(...xs)-Math.min(...xs))/2];
});
for(let pass=0;pass<3;pass++)profile=profile.map((p,i)=>p.map((v,k)=>k===1||i===0||i===profile.length-1?v:(profile[i-1][k]+2*v+profile[i+1][k])/4));
const curve=new CatmullRomCurve3(profile.map(p=>new Vector3(...p.slice(0,3)))),positions=[],indices=[],N=96,R=12;
for(let i=0;i<=N;i++){
 const t=i/N,p=curve.getPoint(t),u=t*(profile.length-1),j=Math.min(profile.length-2,Math.floor(u)),f=u-j;
 const width=profile[j][3]*(1-f)+profile[j+1][3]*f;
 for(let r=0;r<R;r++){
  const a=2*Math.PI*r/R,edge=Math.min(1,.35+Math.min(t,1-t)*22);
  positions.push(...[p.x+Math.cos(a)*width*edge,p.y,p.z+Math.sin(a)*.0012].map(x=>Math.round(x*1e6)/1e6));
 }
}
for(let i=0;i<N;i++)for(let r=0;r<R;r++){
 const a=i*R+r,b=i*R+(r+1)%R,c=b+R,d=a+R;indices.push(a,d,b,b,d,c);
}
for(let r=1;r<R-1;r++){indices.push(0,r,r+1);const a=N*R;indices.push(a,a+r+1,a+r);}
const fascia={license:'CC BY-SA 4.0',source:'https://github.com/LluisV/Z-Anatomy',positions,indices,sourceTriangles:native.indices.length/3,triangles:indices.length/3,profile,method:'Native-section anterior envelope, three profile smoothing passes, continuous 96 by 12 closed relief loft; source-scale width and asymmetry retained.'};
await fs.writeFile('scripts/anatomy/rebuild-evidence/linea-geometry.json',JSON.stringify(fascia)+'\n');
const frames={};
for(const topic of ['arms','back','chest','core','legs','shoulders']){
 const doc=await io.read(`public/models/muscles-${topic}.glb`),j=doc.getRoot().listNodes().find(n=>n.getName()==='joint.trunk');
 const rig=JSON.parse(await fs.readFile(`scripts/anatomy/${topic}/rig.json`,'utf8')),c=rig.sourceCentre??rig.sourceChestCentre;
 frames[`/models/muscles-${topic}.glb`]={centre:[c[0],c[2],-c[1]],inverse:new Matrix4().fromArray(j.getWorldMatrix()).invert().toArray()};
}
const module=`/** Generated source-profile fascia. Z-Anatomy / BodyParts3D, CC BY-SA 4.0.
 * https://github.com/LluisV/Z-Anatomy . Kept separate from repository code licence. */
import {useEffect,useMemo,useRef} from 'react';
import {createPortal,useFrame} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,Matrix4,Vector3,type Plane,type Mesh} from 'three';
import type {GltfRig} from './GltfSource';
import {useRuntime} from './runtime';
const SOURCE=${JSON.stringify({positions,indices})};
const FRAMES:Record<string,{centre:number[];inverse:number[]}>=${JSON.stringify(frames)};
/** Context fascia: follows the trunk and rectus visibility/opacity, never selectable.
 * Hidden while peeling layers, so it cannot float between separated muscle sheets. */
export function LineaAlba({rig,model,color,opacity,clipping}:{rig:GltfRig;model:string;color:string;opacity:number;clipping:Plane[]|null}){
 const trunk=rig.node('joint.trunk'),frame=FRAMES[model],runtime=useRuntime(),mesh=useRef<Mesh>(null);
 const geometry=useMemo(()=>{if(!frame)return null;const inverse=new Matrix4().fromArray(frame.inverse),v=new Vector3(),p:number[]=[];for(let i=0;i<SOURCE.positions.length;i+=3){v.set(SOURCE.positions[i]!-frame.centre[0]!,SOURCE.positions[i+1]!-frame.centre[1]!,SOURCE.positions[i+2]!-frame.centre[2]!).applyMatrix4(inverse);p.push(v.x,v.y,v.z);}const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(SOURCE.indices);g.computeVertexNormals();return g;},[frame]);
 useEffect(()=>()=>geometry?.dispose(),[geometry]);
 useFrame(()=>{if(mesh.current)mesh.current.visible=opacity>.004&&runtime.explode<.001;});
 if(!trunk||!geometry)return null;
 return createPortal(<mesh ref={mesh} geometry={geometry} visible={false} raycast={()=>{}} castShadow={false}><meshStandardMaterial color={color} roughness={.86} metalness={0} envMapIntensity={.35} opacity={opacity} transparent={opacity<.999} depthWrite={opacity>.6} clippingPlanes={clipping}/></mesh>,trunk);
}
`;
await fs.writeFile('scripts/anatomy/cache/LineaAlba.tsx',module);
let scene=await fs.readFile('src/engines/space-scene/stages/model3d/SceneRoot.tsx','utf8');
scene=scene.replace("import { resolveDataColor, resolveMaterialLook }", "import { LineaAlba } from './LineaAlba';\nimport { resolveDataColor, resolveMaterialLook }");
scene=scene.replace('{rig && <primitive object={rig.root} />}',`{rig && <primitive object={rig.root} />}\n      {rig && <LineaAlba rig={rig} model={data.model ?? ''} color={resolveDataColor('token:bone',look.tokens,look.theme,'#d7d0c3')} clipping={clipping} opacity={mannequin ? 0 : Math.max(0,...data.parts.filter(p=>p.muscle==='rectus-abdominis').map(p=>{const d=displays.get(p.id);return d?.visible ? d.opacity : 0;}))} />}`);
await fs.writeFile('scripts/anatomy/cache/SceneRoot-linea.tsx',scene);
execFileSync('python3',['-c',`import difflib,pathlib
p=pathlib.Path('src/engines/space-scene/stages/model3d/SceneRoot.tsx');a=p.read_text();b=pathlib.Path('scripts/anatomy/cache/SceneRoot-linea.tsx').read_text();module=pathlib.Path('scripts/anatomy/cache/LineaAlba.tsx').read_text();out=''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='a/'+str(p),tofile='b/'+str(p)));out+=''.join(difflib.unified_diff([],module.splitlines(True),fromfile='/dev/null',tofile='b/src/engines/space-scene/stages/model3d/LineaAlba.tsx'));pathlib.Path('scripts/geo/muscles-core/linea-alba.patch').write_text(out)`]);
console.log('linea-alba.patch:',fascia.sourceTriangles,'native →',fascia.triangles,'continuous relief triangles; no engine write');
