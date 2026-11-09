/** Build-time parametric lofts. Original Atlas geometry; no runtime dependencies. */
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
export type V = [number,number,number];
export function surface(n:number,m:number,at:(u:number,v:number)=>V,reverse=false):BufferGeometry {
 const p:number[]=[],ix:number[]=[];
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)p.push(...at(i/n,j/m));
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;ix.push(...(reverse?[a,a+1,b,b,a+1,b+1]:[a,b,a+1,b,b+1,a+1]));}
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3)).setIndex(ix);g.computeVertexNormals();return g;
}
export async function writeLofts(path:string,meshes:{id:string;geometry:BufferGeometry;at:V;finish?:{roughness:number;metalness:number}}[]){
 const d=new Document(),buffer=d.createBuffer(),scene=d.createScene('Atlas original procedural aircraft');
 d.getRoot().getAsset().copyright='Atlas 2026. Original procedural geometry; MIT repository licence. Reference photographs are not textures or geometry.';
 for(const {id,geometry,at,finish} of meshes){
  const g=geometry.clone().translate(-at[0],-at[1],-at[2]),p=d.createPrimitive();
  const mat=d.createMaterial(id).setBaseColorFactor([1,1,1,1]).setRoughnessFactor(finish?.roughness??.46).setMetallicFactor(finish?.metalness??.8);
  mat.setExtras({atlasSurface:true});p.setMaterial(mat);
  for(const [attr,semantic]of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0'],['color','COLOR_0']]as const){const a=g.getAttribute(attr);if(a)p.setAttribute(semantic,d.createAccessor().setBuffer(buffer).setType(attr==='uv'?'VEC2':'VEC3').setArray(new Float32Array(a.array)));}
  p.setIndices(d.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(g.index!.array)));
  scene.addChild(d.createNode(id).setTranslation(at).setMesh(d.createMesh(id).addPrimitive(p)).setExtras({closed:true}));
 }
 await MeshoptEncoder.ready;await d.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12}));
 await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder}).write(path,d);
}
/** Monotone cubic interpolation avoids the overshoots of radius Catmull-Rom. */
export function table(rows:number[][],x:number,col=1):number {
 let i=0;while(i<rows.length-2&&x>rows[i+1]![0]!)i++;
 const a=rows[i]!,b=rows[i+1]!,t=Math.max(0,Math.min(1,(x-a[0]!)/(b[0]!-a[0]!)));
 const slope=(k:number)=>{if(k===0)return (rows[1]![col]!-rows[0]![col]!)/(rows[1]![0]!-rows[0]![0]!);if(k===rows.length-1)return (rows[k]![col]!-rows[k-1]![col]!)/(rows[k]![0]!-rows[k-1]![0]!);const l=(rows[k]![col]!-rows[k-1]![col]!)/(rows[k]![0]!-rows[k-1]![0]!),r=(rows[k+1]![col]!-rows[k]![col]!)/(rows[k+1]![0]!-rows[k]![0]!);return l*r<=0?0:2*l*r/(l+r);};
 const h=b[0]!-a[0]!;return (2*t**3-3*t*t+1)*a[col]!+(t**3-2*t*t+t)*h*slope(i)+(-2*t**3+3*t*t)*b[col]!+(t**3-t*t)*h*slope(i+1);
}
export function tubePath(points:V[],r:number,n=10){
 return surface(points.length-1,n,(u,v)=>{const i=Math.min(points.length-2,Math.floor(u*(points.length-1))),t=u*(points.length-1)-i,a=new Vector3(...points[i]!),b=new Vector3(...points[i+1]!),d=b.clone().sub(a).normalize(),up=new Vector3(0,1,0);if(Math.abs(d.y)>.9)up.set(0,0,1);const q=new Vector3().crossVectors(d,up).normalize(),w=new Vector3().crossVectors(q,d);return a.lerp(b,t).addScaledVector(q,r*Math.cos(v*Math.PI*2)).addScaledVector(w,r*Math.sin(v*Math.PI*2)).toArray() as V;});
}
