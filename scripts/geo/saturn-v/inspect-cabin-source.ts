import {sourceIO} from './source';
import {dequantize} from '@gltf-transform/functions';
import {BufferGeometry,Float32BufferAttribute,Matrix4} from 'three';
const doc=await (await sourceIO()).read('scripts/geo/saturn-v/nasa-lm-source.glb');await doc.transform(dequantize());
for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()??[]){const a=p.getAttribute('POSITION')!,g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(a.getArray()!,3));g.applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()));g.computeBoundingBox();console.log(n.getName(),p.getMaterial()?.getName(),p.getIndices()?.getCount(),g.boundingBox!.min.toArray().map(x=>+x.toFixed(2)),g.boundingBox!.max.toArray().map(x=>+x.toFixed(2)));}
