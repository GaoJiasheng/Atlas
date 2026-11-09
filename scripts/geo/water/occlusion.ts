/** Remove fully buried architectural faces. All tested solids are axis-aligned
 * boxes. Four face samples must lie strictly inside another solid; openings,
 * reveals, panel joints and exposed edge faces are retained. */
import { Box3, Vector3, type BufferGeometry } from 'three';
import { Sculpture, type V } from './scenery';
export class Architecture extends Sculpture {
 boxes:Box3[]=[];
 override box(at:V,size:V,token='paper',bevel=0,gain=1){
  this.boxes.push(new Box3(new Vector3(...at).addScaledVector(new Vector3(...size),-.5),new Vector3(...at).addScaledVector(new Vector3(...size),.5)));
  return super.box(at,size,token,bevel,gain);
 }
 override finish():BufferGeometry{
  const grid=new Map<string,Box3[]>(),key=(x:number,y:number,z:number)=>`${x},${y},${z}`,cell=.025;
  for(const box of this.boxes)for(let x=Math.floor(box.min.x/cell);x<=Math.floor(box.max.x/cell);x++)for(let y=Math.floor(box.min.y/cell);y<=Math.floor(box.max.y/cell);y++)for(let z=Math.floor(box.min.z/cell);z<=Math.floor(box.max.z/cell);z++){
   const k=key(x,y,z),bucket=grid.get(k)??[];bucket.push(box);grid.set(k,bucket);
  }
  for(const g of this.pieces){
   const p=g.getAttribute('position'),n=g.getAttribute('normal'),idx=g.index!;
   if(!idx)continue;const keep:number[]=[],point=new Vector3();
   for(let i=0;i<idx.count;i+=3){
    const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],normal=new Vector3().fromBufferAttribute(n,ids[0]!).normalize(),samples=ids.map(j=>new Vector3().fromBufferAttribute(p,j));samples.push(samples[0]!.clone().add(samples[1]!).add(samples[2]!).multiplyScalar(1/3));
    // Pull corners slightly toward their face centre, then move outside the
    // face: coplanar adjacent slabs are buried too, without eating reveals.
    for(let j=0;j<3;j++)samples[j]!.lerp(samples[3]!,.002);
    const hidden=samples.every(v=>{
     point.copy(v).addScaledVector(normal,.0000002);
     return (grid.get(key(Math.floor(point.x/cell),Math.floor(point.y/cell),Math.floor(point.z/cell)))??[]).some(box=>{
     return point.x>box.min.x+1e-8&&point.x<box.max.x-1e-8&&point.y>box.min.y+1e-8&&point.y<box.max.y-1e-8&&point.z>box.min.z+1e-8&&point.z<box.max.z-1e-8;
    });});
    if(!hidden)keep.push(...ids);
   }
   g.setIndex(keep);
  }
  return super.finish();
 }
}
