/** Forty independently pivoted DGX fan rotors in one rigidly skinned draw.
 * Seven swept, twisted, cambered blades per rotor; blade count is illustrative.
 * All coordinates are metres. No engine changes or runtime GLTF clips needed.
 */
import { Document, type Buffer, type Scene } from '@gltf-transform/core';
import { BufferGeometry, BufferAttribute, Color, Matrix4, Vector3 } from 'three';
import { axialBladePoint, type Blades } from '../../../src/engines/space-scene/lib/shaped';
import { MATERIAL_FAMILIES } from '../../../src/engines/space-scene/lib/color';
import type { Rig, PartAnimation } from '../../../src/engines/space-scene/schema';

type V = [number, number, number];
const blade: Blades = { kind:'blades', layout:'axial', count:7, radius:.0355, hub:.0125,
  chord:.028, twist:10, sweep:20, pitch:32, thickness:.0018, at:[0,0,0], color:'powder', discs:2 };
const SPAN = 3, CHORD = 3, RADIAL = 24;

/** World-space centres shared with the source fan module layout. */
export function fanRotorCentres(): V[] {
  const out: V[] = [];
  for (let row=0;row<4;row++) for(let col=0;col<5;col++)
    for(const z of [.416,.366]) out.push([(col-2)*.0855,.3965-row*.087,z]);
  return out;
}

/** Build one closed blade shell, retaining smooth normals on its curved faces.
 * Three radial by three chord intervals resolves its sweep/camber at 71mm size;
 * perimeter vertices are split so the thin edge wall cannot flatten the face.
 */
function rotorGeometry(): BufferGeometry {
  const positions:number[]=[], normals:number[]=[], indices:number[]=[];
  const point=(s:number,c:number)=>new Vector3(...axialBladePoint(blade,s,c));
  const normal=(s:number,c:number)=>{
    const ds=point(Math.min(1,s+.0001),c).sub(point(Math.max(0,s-.0001),c));
    const dc=point(s,Math.min(.5,c+.0001)).sub(point(s,Math.max(-.5,c-.0001)));
    const n=dc.cross(ds).normalize();return n.y<0?n.negate():n;
  };
  const add=(p:Vector3,n:Vector3,angle:number)=>{
    // Engine source rotor was rotated +90 degrees about X, placing shaft on Z.
    p.applyAxisAngle(new Vector3(0,1,0),angle);n.applyAxisAngle(new Vector3(0,1,0),angle);
    const i=positions.length/3;positions.push(p.x,-p.z,p.y);normals.push(n.x,-n.z,n.y);return i;
  };
  for(let b=0;b<7;b++){
    const angle=b*Math.PI*2/7;
    const surfaces:number[][]=[];
    const facePoints:Vector3[][]=[];
    for(const sign of [1,-1]){
      const ids:number[]=[],points:Vector3[]=[];
      for(let i=0;i<=SPAN;i++)for(let j=0;j<=CHORD;j++){
        const s=i/SPAN,c=j/CHORD-.5,n=normal(s,c);
        const thick=blade.thickness/2*(.35+.65*Math.sqrt(Math.max(0,1-4*c*c)))*(1-.4*s);
        const p=point(s,c).addScaledVector(n,sign*thick);points.push(p.clone());ids.push(add(p,n.multiplyScalar(sign),angle));
      }
      surfaces.push(ids);facePoints.push(points);
    }
    for(let i=0;i<SPAN;i++)for(let j=0;j<CHORD;j++){
      const a=i*(CHORD+1)+j,b=a+1,d=(i+1)*(CHORD+1)+j,c=d+1;
      const top=surfaces[0]!,bot=surfaces[1]!;
      indices.push(top[a]!,top[b]!,top[c]!,top[a]!,top[c]!,top[d]!);
      indices.push(bot[a]!,bot[c]!,bot[b]!,bot[a]!,bot[d]!,bot[c]!);
    }
    const rim:number[]=[];
    for(let j=0;j<=CHORD;j++)rim.push(j);
    for(let i=1;i<=SPAN;i++)rim.push(i*(CHORD+1)+CHORD);
    for(let j=CHORD-1;j>=0;j--)rim.push(SPAN*(CHORD+1)+j);
    for(let i=SPAN-1;i>0;i--)rim.push(i*(CHORD+1));
    for(let k=0;k<rim.length;k++){
      const a=rim[k]!,b=rim[(k+1)%rim.length]!;
      const q=[facePoints[0]![a]!,facePoints[1]![a]!,facePoints[1]![b]!,facePoints[0]![b]!];
      const n=q[1]!.clone().sub(q[0]!).cross(q[2]!.clone().sub(q[0]!)).normalize();
      const ids=q.map(p=>add(p.clone(),n.clone(),angle));indices.push(ids[0]!,ids[1]!,ids[2]!,ids[0]!,ids[2]!,ids[3]!);
    }
  }
  // Closed lathed hub: rounded front dome, cylindrical motor skirt, rear cap.
  // No sphere poles/degenerate triangles; a 24-sided ring uses radial normals.
  const profile:[number,number][]=[[.0035,-.0068],[.0114,-.0060],[.0131,-.003], [.0131,.0025],[.0108,.0062],[.0035,.0083]];
  const hub:number[][]=[];
  for(let j=0;j<profile.length;j++){
    const [r,z]=profile[j]!,prev=profile[Math.max(0,j-1)]!,next=profile[Math.min(profile.length-1,j+1)]!;
    const dr=next[0]-prev[0],dz=next[1]-prev[1],row:number[]=[];
    for(let k=0;k<RADIAL;k++){
      const a=k*Math.PI*2/RADIAL,i=positions.length/3,n=new Vector3(dz*Math.cos(a),dz*Math.sin(a),-dr).normalize();
      positions.push(r*Math.cos(a),r*Math.sin(a),z);normals.push(n.x,n.y,n.z);row.push(i);
    }hub.push(row);
  }
  for(let j=0;j<hub.length-1;j++)for(let k=0;k<RADIAL;k++){
    const n=(k+1)%RADIAL,a=hub[j]![k]!,b=hub[j]![n]!,c=hub[j+1]![n]!,d=hub[j+1]![k]!;
    indices.push(a,b,c,a,c,d);
  }
  for(const side of [0,profile.length-1]){
    const sign=side===0?-1:1,z=profile[side]![1],center=positions.length/3;
    positions.push(0,0,z);normals.push(0,0,sign);
    const ring:number[]=[];
    for(let k=0;k<RADIAL;k++){
      const a=k*Math.PI*2/RADIAL,r=profile[side]![0];ring.push(positions.length/3);
      positions.push(r*Math.cos(a),r*Math.sin(a),z);normals.push(0,0,sign);
    }
    for(let k=0;k<RADIAL;k++){const a=ring[k]!,b=ring[(k+1)%RADIAL]!;indices.push(center,sign>0?a:b,sign>0?b:a);}
  }
  return new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(positions),3))
    .setAttribute('normal',new BufferAttribute(new Float32Array(normals),3)).setIndex(indices);
}

export function addFanRotors(doc:Document,buffer:Buffer,scene:Scene): {rig:Rig;animations:PartAnimation[];triangles:number} {
  const source=rotorGeometry(),p=source.getAttribute('position'),n=source.getAttribute('normal'),centres=fanRotorCentres();
  const positions:number[]=[],normals:number[]=[],joints:number[]=[],weights:number[]=[],indices:number[]=[],inverse:number[]=[];
  const skeleton=doc.createNode('fan-rotor-rig');scene.addChild(skeleton);
  const skin=doc.createSkin('fan-rotor-skin').setSkeleton(skeleton),rig:Rig={joints:{}},animations:PartAnimation[]=[];
  for(let r=0;r<centres.length;r++){
    const center=centres[r]!,name=`fan-rotor-${r.toString().padStart(2,'0')}`,offset=positions.length/3;
    const joint=doc.createNode(name).setTranslation(center);skeleton.addChild(joint);skin.addJoint(joint);
    inverse.push(...new Matrix4().makeTranslation(-center[0],-center[1],-center[2]).elements);
    // Match source motion: positive 40RPM about -Z, including rear rotors.
    rig.joints[name]={node:name,axes:{rotation:[0,0,-1]}};
    // Joint schema is bounded to +/-180deg; endpoints are the same orientation.
    // The existing MotionDriver smoothsteps keys. 31 intervals bound deviation
    // from constant 40RPM to 1.12deg, instead of its two-key 34.6deg deviation.
    animations.push({id:`${name}-spin`,target:`joint:${name}`,kind:'sequence',whenRun:true,loop:true,
      keys:Array.from({length:32},(_,k)=>({t:k*1.5/31,angles:{rotation:-180+k*360/31}}))});
    for(let i=0;i<p.count;i++){
      positions.push(p.getX(i)+center[0],p.getY(i)+center[1],p.getZ(i)+center[2]);normals.push(n.getX(i),n.getY(i),n.getZ(i));
      joints.push(r,0,0,0);weights.push(1,0,0,0);
    }
    for(const i of source.index!.array)indices.push(i+offset);
  }
  const attr=(name:string,type:'VEC3'|'VEC4'|'MAT4'|'SCALAR',array:Float32Array<ArrayBuffer>|Uint16Array<ArrayBuffer>|Uint32Array<ArrayBuffer>)=>doc.createAccessor(name).setType(type).setArray(array).setBuffer(buffer);
  skin.setInverseBindMatrices(attr('fan-inverse-bind','MAT4',new Float32Array(inverse)));
  const casing=new Color(MATERIAL_FAMILIES.casing.color.paper),powder=new Color(MATERIAL_FAMILIES.powder.color.paper);
  const material=doc.createMaterial('fan-rotor-powder').setBaseColorFactor([powder.r/casing.r,powder.g/casing.g,powder.b/casing.b,1])
    .setRoughnessFactor(.7).setMetallicFactor(.2).setExtras({atlasSurface:true});
  const primitive=doc.createPrimitive().setAttribute('POSITION',attr('fan-positions','VEC3',new Float32Array(positions)))
    .setAttribute('NORMAL',attr('fan-normals','VEC3',new Float32Array(normals)))
    .setAttribute('JOINTS_0',attr('fan-joints','VEC4',new Uint16Array(joints)))
    .setAttribute('WEIGHTS_0',attr('fan-weights','VEC4',new Float32Array(weights)))
    .setIndices(attr('fan-indices','SCALAR',new Uint32Array(indices))).setMaterial(material);
  scene.addChild(doc.createNode('fan-rotors').setMesh(doc.createMesh('fan-rotors').addPrimitive(primitive)).setSkin(skin).setExtras({closed:true}));
  source.dispose();return {rig,animations,triangles:indices.length/3};
}
