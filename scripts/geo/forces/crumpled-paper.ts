/** A continuous compacted A4 sheet with finite thickness. The deterministic
 * build-time PBD solve includes structural/bending springs and sheet contact. */
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {BufferGeometry,Float32BufferAttribute,Vector3,Color} from 'three';
export function crumpledPaper():BufferGeometry{
 const script='scripts/geo/forces/crumple-sheet.py',frozen='scripts/geo/forces/crumple-sheet.json',digest=createHash('sha256').update(fs.readFileSync(script)).digest('hex');
 // The solved sheet is a portable build input. Python/NumPy/Numba are only
 // needed when changing the solver, never for a clean checkout's test run.
 let path='/tmp/atlas-residual-polish-2026-11-05/paper-sheet.json';
 if(fs.existsSync(frozen)&&JSON.parse(fs.readFileSync(frozen,'utf8')).sourceSHA256===digest)path=frozen;
 fs.mkdirSync('/tmp/atlas-residual-polish-2026-11-05',{recursive:true});
 if(!fs.existsSync(path)||JSON.parse(fs.readFileSync(path,'utf8')).sourceSHA256!==digest){const run=spawnSync('python3',[script,path],{stdio:'inherit',env:{...process.env,NUMBA_CACHE_DIR:'/tmp/atlas-residual-polish-2026-11-05/numba'}});if(run.status!==0)throw Error('Paper compaction failed');}
 const data=JSON.parse(fs.readFileSync(path,'utf8')) as {positions:number[][];triangles:number[][]};
 // One restrained Loop subdivision rounds finite fold radii without
 // replacing irregular pressure folds by the old triangular hull panels.
 const source=data.positions.map(p=>new Vector3(...p as [number,number,number])),adj=source.map(()=>new Set<number>()),edgeFaces=new Map<string,{a:number;b:number;op:number[]}>();
 for(const [a,b,c]of data.triangles as [number,number,number][]){for(const [i,j,k]of [[a,b,c],[b,c,a],[c,a,b]]){adj[i!]!.add(j!);adj[j!]!.add(i!);const key=[i,j].sort((a,b)=>a!-b!).join(':'),e=edgeFaces.get(key);if(e)e.op.push(k!);else edgeFaces.set(key,{a:i!,b:j!,op:[k!]});}}
 const refined=source.map((p,i)=>{const ns=[...adj[i]!],beta=ns.length===3?3/16:3/(8*ns.length),q=p.clone().multiplyScalar(1-ns.length*beta);for(const j of ns)q.addScaledVector(source[j]!,beta);return p.clone().lerp(q,.22);}),edgeIDs=new Map<string,number>();
 for(const [key,{a,b,op}]of edgeFaces){const midpoint=source[a]!.clone().add(source[b]!).multiplyScalar(.5),q=op.length===2?source[a]!.clone().add(source[b]!).multiplyScalar(.375).addScaledVector(source[op[0]!]!,.125).addScaledVector(source[op[1]!]!,.125):midpoint;edgeIDs.set(key,refined.length);refined.push(midpoint.lerp(q,.30));}
 // Refine the 750 most visible bends, leaving flat panels unrefined. This
 // gives soft crease radii within the complete forces-scene triangle budget.
 const scores=[...edgeFaces].filter(([,e])=>e.op.length===2).map(([key,e])=>{const A=source[e.a]!,B=source[e.b]!,n=B.clone().sub(A).cross(source[e.op[0]!]!.clone().sub(A)).normalize(),q=A.clone().sub(B).cross(source[e.op[1]!]!.clone().sub(B)).normalize(),angle=Math.acos(Math.max(-1,Math.min(1,n.dot(q))));return {key,score:angle>.22&&angle<2.7?angle*A.distanceTo(B):0};}).sort((a,b)=>b.score-a.score),selected=new Set(scores.filter(e=>e.score>0).slice(0,750).map(e=>e.key)),triangles:number[][]=[];
 const edge=(a:number,b:number)=>[a,b].sort((a,b)=>a-b).join(':');
 for(const old of data.triangles as [number,number,number][]){const marked=old.map((a,i)=>selected.has(edge(a,old[(i+1)%3]!))),count=marked.filter(Boolean).length;
  if(!count){triangles.push(old);continue;}
  if(count===3){const [a,b,c]=old,ab=edgeIDs.get(edge(a,b))!,bc=edgeIDs.get(edge(b,c))!,ca=edgeIDs.get(edge(c,a))!;triangles.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);continue;}
  const r=count===1?marked.indexOf(true):(marked.indexOf(false)+1)%3,a=old[r]!,b=old[(r+1)%3]!,c=old[(r+2)%3]!,ab=edgeIDs.get(edge(a,b))!;
  if(count===1)triangles.push([a,ab,c],[ab,b,c]);else{const bc=edgeIDs.get(edge(b,c))!;triangles.push([b,bc,ab],[a,ab,c],[ab,bc,c]);}
 }
 const used=[...new Set(triangles.flat())],remap=new Map(used.map((id,i)=>[id,i]));data.positions=used.map(id=>refined[id]!.toArray());data.triangles=triangles.map(t=>t.map(i=>remap.get(i)!));
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(data.positions.flat(),3)).setIndex(data.triangles.flat());g.computeVertexNormals();
 const p=g.getAttribute('position'),normal=g.getAttribute('normal'),positions:number[]=[],indices:number[]=[],colors:number[]=[],white=new Color('#dcd7cb'),count=p.count;
 for(const side of [-1,1])for(let i=0;i<count;i++){const q=new Vector3().fromBufferAttribute(p,i).addScaledVector(new Vector3().fromBufferAttribute(normal,i),side*.00006);positions.push(q.x+1.07,q.y+.319,q.z+.14);colors.push(white.r,white.g,white.b);}
 // Geometric ambient occlusion from neighbouring sheet panels. This is
 // baked into the token-derived paper albedo, so the installed engine and
 // offline studio show the same darkening inside real folded pockets.
 const faces=data.triangles.map(t=>{const [a,b,c]=t.map(i=>data.positions[i]!) as [number[],number[],number[]],ab=new Vector3(...b as [number,number,number]).sub(new Vector3(...a as [number,number,number])),ac=new Vector3(...c as [number,number,number]).sub(new Vector3(...a as [number,number,number])),cross=ab.cross(ac),area=cross.length()/2,n=cross.normalize();return {ids:t,c:[(a[0]!+b[0]!+c[0]!)/3,(a[1]!+b[1]!+c[1]!)/3,(a[2]!+b[2]!+c[2]!)/3],n:n.toArray(),area};});
 for(let side=0;side<2;side++)for(let i=0;i<count;i++){const sign=side?1:-1;let occlusion=0;for(const f of faces){if(f.ids.includes(i))continue;const dx=f.c[0]!-p.getX(i),dy=f.c[1]!-p.getY(i),dz=f.c[2]!-p.getZ(i),d2=dx*dx+dy*dy+dz*dz;if(d2<2e-8||d2>.000064)continue;const len=Math.sqrt(d2),cos=sign*(normal.getX(i)*dx+normal.getY(i)*dy+normal.getZ(i)*dz)/len;if(cos<=0)continue;const face=Math.abs(f.n[0]!*dx+f.n[1]!*dy+f.n[2]!*dz)/len;occlusion+=Math.min(2,f.area/d2*face)*cos*Math.exp(-len/.008);}const shade=.62+.38*Math.exp(-occlusion/(Math.PI*1.5));for(let k=0;k<3;k++)colors[(side*count+i)*3+k]!*=shade;}
 const edges=new Map<string,{a:number;b:number;n:number}>();
 for(const t of data.triangles){const [a,b,c]=t as [number,number,number];indices.push(a,c,b,a+count,b+count,c+count);for(const [i,j]of [[a,b],[b,c],[c,a]]){const key=[i,j].sort((a,b)=>a!-b!).join(':'),e=edges.get(key);if(e)e.n++;else edges.set(key,{a:i!,b:j!,n:1});}}
 for(const {a,b,n}of edges.values())if(n===1)indices.push(a,b,a+count,b,b+count,a+count);
 const out=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setAttribute('color',new Float32BufferAttribute(colors,3)).setIndex(indices);out.computeVertexNormals();return out;
}
