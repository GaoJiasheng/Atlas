/** Bidirectional sampled surface-distance audit, using the decoded rest skins.
 * The source packet stays archived unchanged; this audits the delivery codec.
 */
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Box3,Triangle,Vector3,type BufferGeometry} from 'three';
import {readModel,meshGeometry} from './read-model';
import {createHash} from 'node:crypto';import {readFileSync,writeFileSync} from 'node:fs';
const sourcePath=process.argv[2]!,targetPath=process.argv[3]!,output=process.argv[4]!;
if(!output)throw Error('Pass source GLB, delivery GLB and audit JSON');
const [source,target]=await Promise.all([readModel(sourcePath),readModel(targetPath)]);
type Cell={bounds:Box3;triangles?:Triangle[];children?:[Cell,Cell]};
function tree(triangles:Triangle[],depth=0):Cell{
 const bounds=new Box3();for(const t of triangles)for(const p of [t.a,t.b,t.c])bounds.expandByPoint(p);
 if(triangles.length<=16)return {bounds,triangles};
 const size=bounds.getSize(new Vector3()),axis=size.x>=size.y&&size.x>=size.z?'x':size.y>=size.z?'y':'z';
 triangles.sort((a,b)=>(a.a[axis]+a.b[axis]+a.c[axis])-(b.a[axis]+b.b[axis]+b.c[axis]));const mid=triangles.length>>1;
 return {bounds,children:[tree(triangles.slice(0,mid),depth+1),tree(triangles.slice(mid),depth+1)]};
}
const near=new Vector3();
function distance(cell:Cell,p:Vector3,best=Infinity):number{
 if(cell.bounds.distanceToPoint(p)>best)return best;
 if(cell.triangles){for(const t of cell.triangles){t.closestPointToPoint(p,near);const d=near.distanceTo(p);if(Number.isFinite(d))best=Math.min(best,d);}return best;}
 const [a,b]=cell.children!,first=a.bounds.distanceToPoint(p)<=b.bounds.distanceToPoint(p)?[a,b]:[b,a];
 return distance(first[1]!,p,distance(first[0]!,p,best));
}
function tris(g:BufferGeometry){const p=g.getAttribute('position'),index=g.index;return Array.from({length:(index?.count??p.count)/3},(_,i)=>new Triangle(...[0,1,2].map(k=>new Vector3().fromBufferAttribute(p,index?.getX(i*3+k)??i*3+k)) as [Vector3,Vector3,Vector3]));}
const parts=[];
for(const n of source.getRoot().listNodes().filter(n=>n.getMesh())){
 const other=target.getRoot().listNodes().find(x=>x.getName()===n.getName());if(!other?.getMesh())throw Error(`Missing ${n.getName()}`);
 const all=(node:typeof n)=>mergeGeometries(node.getMesh()!.listPrimitives().map((_,i)=>meshGeometry(node,true,i)))!;
 const a=all(n),b=all(other),ta=tris(a),tb=tris(b),at=tree([...ta]),bt=tree([...tb]);let error=0,samples=0;
 for(const [from,to]of [[ta,bt],[tb,at]] as const)for(let i=0;i<from.length;i+=Math.max(1,Math.floor(from.length/160))){const t=from[i]!;for(const p of [t.a,t.getMidpoint(new Vector3())]){error=Math.max(error,distance(to,p));samples++;}}
 parts.push({name:n.getName(),before:ta.length,after:tb.length,samples,maxSampledSurfaceErrorM:error});a.dispose();b.dispose();
}
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={sourceSha256:hash(sourcePath),deliverySha256:hash(targetPath),bytes:readFileSync(targetPath).length,method:'Bidirectional vertex/centroid samples against triangle BVHs in decoded rest space; not a Hausdorff proof.',maxSampledSurfaceErrorM:Math.max(...parts.map(p=>p.maxSampledSurfaceErrorM)),beforeTriangles:parts.reduce((s,p)=>s+p.before,0),afterTriangles:parts.reduce((s,p)=>s+p.after,0),parts};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log({bytes:report.bytes,before:report.beforeTriangles,after:report.afterTriangles,maxSampledSurfaceErrorM:report.maxSampledSurfaceErrorM});
