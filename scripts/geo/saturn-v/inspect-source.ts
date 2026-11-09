import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Box3,Vector3,Matrix4} from 'three';
await MeshoptDecoder.ready;
const io=await (await import('./source')).sourceIO();
for(const slug of ['lm','stack']){
 const doc=await io.read(`scripts/geo/saturn-v/refs/${slug}-nasa.glb`);await doc.transform(dequantize());
 const all=new Box3(); console.log(slug);
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){const b=new Box3(),a=p.getAttribute('POSITION')!,m=new Matrix4().fromArray(n.getWorldMatrix());for(let i=0;i<a.getCount();i++)b.expandByPoint(new Vector3(...a.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(m));all.union(b);console.log(n.getName(),p.getMaterial()?.getName(),b.min.toArray().map(v=>+v.toFixed(3)),b.max.toArray().map(v=>+v.toFixed(3)));}
 console.log('ALL',all.min.toArray(),all.max.toArray());
}
