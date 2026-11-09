/** A single contiguous tooth volume, cut geometrically and partitioned along
 * shared enamel/dentine/pulp interfaces. No independently rounded MC caps and
 * no added front-facing cover: this cap seals the clipped volume itself. */
import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2, Vector3 } from 'three';
type Field = (x:number,y:number,z:number)=>number;
type V = [number,number,number];
type Vertex = {p:Vector3;n:Vector3};
const lerp=(a:Vertex,b:Vertex,t:number):Vertex=>({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize()});
function clip(poly:Vertex[],f:Field,positive:boolean):Vertex[]{
 const out:Vertex[]=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i]!,b=poly[(i+1)%poly.length]!,fa=f(...a.p.toArray() as V),fb=f(...b.p.toArray() as V),ia=positive?fa>=0:fa<=0,ib=positive?fb>=0:fb<=0;
  if(ia)out.push(a);
  if(ia!==ib){let lo=0,hi=1;for(let k=0;k<24;k++){const t=(lo+hi)*.5,p=a.p.clone().lerp(b.p,t),v=f(p.x,p.y,p.z);if((v>=0)===(fa>=0))lo=t;else hi=t;}out.push(lerp(a,b,(lo+hi)*.5));}
 }
 return out;
}
export function finishTooth(source:BufferGeometry,outer:Field,enamel:Field,pulp:Field,colors:{enamel:V;dentine:V;pulp:V}):BufferGeometry {
 const ps=source.getAttribute('position'),edges:[Vector3,Vector3][]=[],shell:Vertex[][]=[];
 const gradient=(p:Vector3)=>{const e=.000006;return new Vector3(outer(p.x+e,p.y,p.z)-outer(p.x-e,p.y,p.z),outer(p.x,p.y+e,p.z)-outer(p.x,p.y-e,p.z),outer(p.x,p.y,p.z+e)-outer(p.x,p.y,p.z-e)).normalize();};
 for(let i=0;i<ps.count;i+=3){
  const tri=Array.from({length:3},(_,k)=>{const p=new Vector3().fromBufferAttribute(ps,i+k);return{p,n:gradient(p)};});
  const cut:Vector3[]=[];
  for(let j=0;j<3;j++){const a=tri[j]!,b=tri[(j+1)%3]!;if((a.p.z<0)!==(b.p.z<0)){const p=a.p.clone().lerp(b.p,a.p.z/(a.p.z-b.p.z));p.z=0;cut.push(p);}}
  if(cut.length===2&&cut[0]!.distanceToSquared(cut[1]!)>1e-20)edges.push([cut[0]!,cut[1]!]);
  const clipped=clip(tri,(_x,_y,z)=>z,false);if(clipped.length>=3)shell.push(clipped);
 }
 // Join the exact clip-edge contour. At this section the molar is one solid
 // outline; the two roots are connected through the crown, with no islands.
 const key=(p:Vector3)=>`${Math.round(p.x*1e8)},${Math.round(p.y*1e8)}`;
 const adjacency=new Map<string,{p:Vector3;next:string[]}>();
 for(const [a,b]of edges){const ka=key(a),kb=key(b);if(ka===kb)continue;for(const [k,p,n]of [[ka,a,kb],[kb,b,ka]] as [string,Vector3,string][]){if(!adjacency.has(k))adjacency.set(k,{p,next:[]});adjacency.get(k)!.next.push(n);}}
 const loops:Vector3[][]=[],used=new Set<string>();
 for(const start of adjacency.keys()){
  if(used.has(start))continue;const loop:Vector3[]=[],seen=new Set<string>();let current:string=start,previous:string='';
  while(!seen.has(current)){seen.add(current);used.add(current);const entry:{p:Vector3;next:string[]}|undefined=adjacency.get(current);if(!entry)throw new Error('Tooth cut contour is open');loop.push(entry.p);const next:string|undefined=entry.next.find(n=>n!==previous);if(!next)throw new Error('Tooth cut contour has an unmatched edge');previous=current;current=next;}
  if(current!==start)throw new Error('Tooth cut contour self-joins');if(loop.length>3)loops.push(loop);
 }
 if(loops.length!==1)throw new Error(`Expected one connected tooth section, got ${loops.length}`);
 const loop=loops[0]!,cap:Vertex[][]=[];
 const faces=ShapeUtils.triangulateShape(loop.map(p=>new Vector2(p.x,p.y)),[]);
 const refine=(a:Vector3,b:Vector3,c:Vector3,depth=0):void=>{
  const lengths=[a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a)],largest=Math.max(...lengths);
  if(largest>.0018**2&&depth<24){const edge=lengths.indexOf(largest);if(edge===0){const m=a.clone().add(b).multiplyScalar(.5);refine(a,m,c,depth+1);refine(m,b,c,depth+1);}else if(edge===1){const m=b.clone().add(c).multiplyScalar(.5);refine(a,b,m,depth+1);refine(a,m,c,depth+1);}else{const m=c.clone().add(a).multiplyScalar(.5);refine(a,b,m,depth+1);refine(m,b,c,depth+1);}return;}
  if(new Vector3().subVectors(b,a).cross(new Vector3().subVectors(c,a)).z<0)[b,c]=[c,b];
  cap.push([a,b,c].map(p=>({p:p.clone(),n:new Vector3(0,0,1)})));
 };
 for(const face of faces)refine(loop[face[0]!]!,loop[face[1]!]!,loop[face[2]!]!);
 const positions:number[]=[],normals:number[]=[],rgb:number[]=[];
 const write=(poly:Vertex[],color:V)=>{for(let i=1;i<poly.length-1;i++){const tri=[poly[0]!,poly[i]!,poly[i+1]!];if(tri[1]!.p.clone().sub(tri[0]!.p).cross(tri[2]!.p.clone().sub(tri[0]!.p)).lengthSq()<1e-22)continue;for(const v of tri){positions.push(...v.p.toArray());normals.push(...v.n.toArray());rgb.push(...color);}}};
 for(const poly of [...shell,...cap]){
  const e=clip(poly,enamel,true),d=clip(poly,enamel,false);write(e,colors.enamel);
  write(clip(d,pulp,true),colors.pulp);write(clip(d,pulp,false),colors.dentine);
 }
 const result=new BufferGeometry();result.setAttribute('position',new Float32BufferAttribute(positions,3));result.setAttribute('normal',new Float32BufferAttribute(normals,3));result.setAttribute('color',new Float32BufferAttribute(rgb,3));source.dispose();return result;
}
