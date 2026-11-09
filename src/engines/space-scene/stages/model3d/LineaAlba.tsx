/** Generated source-profile fascia. Z-Anatomy / BodyParts3D, CC BY-SA 4.0.
 * https://github.com/LluisV/Z-Anatomy . Kept separate from repository code licence. */
import {useEffect,useMemo,useRef} from 'react';
import {createPortal,useFrame,useLoader} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,Matrix4,MeshStandardMaterial,Vector3,type Plane,type Mesh} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {withBase} from '../../../../i18n';
import type {GltfRig} from './GltfSource';
import {useRuntime} from './runtime';

const FRAMES:Record<string,{centre:number[];inverse:number[]}>={"/models/muscles-arms.glb":{"centre":[0,1.2483623027801514,-0.030789900571107864],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},"/models/muscles-back.glb":{"centre":[0,1.1982355117797852,-0.04927174001932144],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},"/models/muscles-chest.glb":{"centre":[-0.000016483021681779064,1.3499360084533691,0.055000342428684235],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},"/models/muscles-core.glb":{"centre":[0,1.0404850244522095,-0.03147326037287712],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},"/models/muscles-legs.glb":{"centre":[0,0.9112197160720825,-0.04269799590110779],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},"/models/muscles-shoulders.glb":{"centre":[0,1.410085678100586,0.0012775821378454566],"inverse":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}};
/** Context fascia: follows the trunk and rectus visibility/opacity, never selectable.
 * Hidden while peeling layers, so it cannot float between separated muscle sheets. */
export function LineaAlba({rig,model,color,opacity,clipping}:{rig:GltfRig;model:string;color:string;opacity:number;clipping:Plane[]|null}){
 const trunk=rig.node('joint.trunk'),frame=FRAMES[model],runtime=useRuntime(),mesh=useRef<Mesh>(null);
 const source=useLoader(GLTFLoader,withBase('/models/muscles-core-linea.glb'),loader=>loader.setMeshoptDecoder(MeshoptDecoder));
 const geometry=useMemo(()=>{
  if(!frame)return null;
  const mesh=source.scene.getObjectByName('linea-alba') as Mesh;mesh.updateWorldMatrix(true,false);
  const decoded=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),positions=decoded.getAttribute('position');
  const inverse=new Matrix4().fromArray(frame.inverse),centre=new Vector3(...frame.centre as [number,number,number]),v=new Vector3(),p:number[]=[];
  for(let i=0;i<positions.count;i++){v.fromBufferAttribute(positions,i).sub(centre).applyMatrix4(inverse);p.push(v.x,v.y,v.z);}
  const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(decoded.index!.clone());g.computeVertexNormals();decoded.dispose();return g;
 },[frame,source]);
 useEffect(()=>()=>geometry?.dispose(),[geometry]);
 // The stage registers only a few THREE classes as JSX (extend.ts), so the material is built here.
 const material=useMemo(()=>new MeshStandardMaterial({roughness:.86,metalness:0,envMapIntensity:.35}),[]);
 useEffect(()=>()=>material.dispose(),[material]);
 useEffect(()=>{material.color.set(color);material.opacity=opacity;material.transparent=opacity<.999;material.depthWrite=opacity>.6;material.clippingPlanes=clipping;material.needsUpdate=true;},[material,color,opacity,clipping]);
 useFrame(()=>{if(mesh.current)mesh.current.visible=opacity>.004&&runtime.explode<.001;});
 if(!trunk||!geometry)return null;
 return createPortal(<mesh ref={mesh} geometry={geometry} visible={false} raycast={()=>{}} castShadow={false} material={material}/>,trunk);
}
