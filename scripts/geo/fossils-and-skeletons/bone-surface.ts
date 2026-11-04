/** Original CC0 mineral cortex: local ray-baked cavity occlusion, restrained
 * convex wear and continuous mottling. Linear RGB multipliers, never sRGB
 * bytes: the engine multiplies COLOR_0 with the theme's fossil tint. */
type V=[number,number,number];
type Tree={lo:V;hi:V;left?:Tree;right?:Tree;tri?:number[]};
export const BONE_ALBEDO=.44;
export const BONE_ROUGHNESS=.92;
export function boneSurface(positions:Float32Array,normals:Float32Array,indices:Uint32Array){
 const p=(i:number):V=>[positions[i*3]!,positions[i*3+1]!,positions[i*3+2]!];
 const tri=Array.from({length:indices.length/3},(_,i)=>i),centres=tri.map(t=>[0,1,2].map(k=>(positions[indices[t*3]!*3+k]!+positions[indices[t*3+1]!*3+k]!+positions[indices[t*3+2]!*3+k]!)/3) as V);
 function build(ts:number[]):Tree{
  const lo:V=[Infinity,Infinity,Infinity],hi:V=[-Infinity,-Infinity,-Infinity];
  for(const t of ts)for(let j=0;j<3;j++)for(let k=0;k<3;k++){const v=positions[indices[t*3+j]!*3+k]!;lo[k]=Math.min(lo[k]!,v);hi[k]=Math.max(hi[k]!,v);}
  if(ts.length<12)return {lo,hi,tri:ts};
  const spans=hi.map((v,i)=>v-lo[i]!),axis=spans.indexOf(Math.max(...spans));ts.sort((a,b)=>centres[a]![axis]!-centres[b]![axis]!);
  const mid=Math.floor(ts.length/2);return {lo,hi,left:build(ts.slice(0,mid)),right:build(ts.slice(mid))};
 }
 const root=build(tri);
 function hit(tree:Tree,o:V,d:V,limit:number):boolean{
  let near=0,far=limit;
  for(let k=0;k<3;k++){let a=(tree.lo[k]!-o[k]!)/d[k]!,b=(tree.hi[k]!-o[k]!)/d[k]!;if(a>b)[a,b]=[b,a];near=Math.max(near,a);far=Math.min(far,b);if(far<near)return false;}
  if(tree.left)return hit(tree.left,o,d,limit)||hit(tree.right!,o,d,limit);
  for(const t of tree.tri!){
   const a=p(indices[t*3]!),b=p(indices[t*3+1]!),c=p(indices[t*3+2]!),e1=b.map((v,k)=>v-a[k]!) as V,e2=c.map((v,k)=>v-a[k]!) as V;
   const h:V=[d[1]*e2[2]-d[2]*e2[1],d[2]*e2[0]-d[0]*e2[2],d[0]*e2[1]-d[1]*e2[0]],det=e1[0]*h[0]+e1[1]*h[1]+e1[2]*h[2];if(Math.abs(det)<1e-10)continue;
   const s=o.map((v,k)=>v-a[k]!) as V,u=(s[0]*h[0]+s[1]*h[1]+s[2]*h[2])/det;if(u<0||u>1)continue;
   const q:V=[s[1]*e1[2]-s[2]*e1[1],s[2]*e1[0]-s[0]*e1[2],s[0]*e1[1]-s[1]*e1[0]],v=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])/det;if(v<0||u+v>1)continue;
   const distance=(e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])/det;if(distance>.0001&&distance<limit)return true;
  }
  return false;
 }
 const colors=new Float32Array(positions.length),neighbours=Array.from({length:positions.length/3},()=>new Set<number>());
 for(let t=0;t<indices.length;t+=3)for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j)neighbours[indices[t+i]!]!.add(indices[t+j]!);
 const aoValues:number[]=[],wearValues:number[]=[];
 for(let i=0;i<positions.length/3;i++){
  if(neighbours[i]!.size===0){colors.set([1,1,1],i*3);continue;}
  const q=p(i),n:V=[normals[i*3]!,normals[i*3+1]!,normals[i*3+2]!],l=Math.hypot(...n);for(let k=0;k<3;k++)n[k]!/=l;
  const axis:V=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u:V=[n[1]*axis[2]-n[2]*axis[1],n[2]*axis[0]-n[0]*axis[2],n[0]*axis[1]-n[1]*axis[0]],ul=Math.hypot(...u);for(let k=0;k<3;k++)u[k]!/=ul;
  const v:V=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],o=q.map((x,k)=>x+n[k]!*.0008) as V;
  let blocked=0,convex=0;
  for(let r=0;r<24;r++){const radius=Math.sqrt((r+.5)/24),a=r*2.399963229728653,z=Math.sqrt(1-radius*radius),d=n.map((x,k)=>x*z+u[k]!*radius*Math.cos(a)+v[k]!*radius*Math.sin(a)) as V;if(hit(root,o,d,.115))blocked++;}
  for(const j of neighbours[i]!){const a=p(j),d=q.map((x,k)=>x-a[k]!) as V;convex+=(d[0]*n[0]+d[1]*n[1]+d[2]*n[2])/(Math.hypot(...d)||1);}
  const wear=Math.max(0,Math.min(1,convex/Math.max(1,neighbours[i]!.size)*4));
  const ao=1-blocked/24,mottle=Math.sin(q[0]*19+Math.sin(q[2]*31))*Math.sin(q[1]*23-q[2]*17);
  const value=(.72+.28*ao)*(1+.055*mottle+.10*wear);
  // Tiny warm drift on abraded ridges; most cortex remains neutral umber.
  colors.set([value*(1+.018*wear),value,value*(1-.022*wear)].map(x=>Math.min(1,x)),i*3);aoValues.push(ao);wearValues.push(wear);
 }
 return {colors,stats:{vertices:positions.length/3,aoMin:Math.min(...aoValues),aoMean:aoValues.reduce((a,b)=>a+b,0)/aoValues.length,wearMax:Math.max(...wearValues)}};
}
