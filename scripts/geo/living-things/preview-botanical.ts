/** Offline geometry export for botanical visual QA (no WebGL or browser). */
import {writeFileSync,mkdirSync} from 'node:fs';
import {BufferGeometry, Color} from 'three';
import {primitiveSchema} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import * as plants from './specimens/plants';
import * as fungi from './specimens/fungi-bacteria';
import type {Model} from './kit';
const rows:Record<string,unknown>={};
for(const [name,fn]of Object.entries({...plants,...fungi})){
  if(typeof fn!=='function')continue;
  const model=(fn as ()=>Model)(),tris:number[][]=[],cols:number[][]=[],normals:number[][]=[];
  for(const prim of [model.primitive,...model.extra]){
    // The covered culture's glass lid is omitted in its inspection plate so
    // colony margins can be checked without a full optical glass simulation.
    if(name==='bacteriaDish'&&prim!==model.primitive&&prim.color==='glass')continue;
    const pieces=prim.kind==='__mesh'?[{geometry:prim.geometry as BufferGeometry,matrices:null}]:partPieces({primitive:primitiveSchema.parse(prim)});
    for(const piece of pieces){if('lines'in piece&&piece.lines)continue;
      const gs=piece.matrices?piece.matrices.map(m=>piece.geometry.clone().applyMatrix4(m)):[piece.geometry];
      for(const g0 of gs){const g=(g0.index?g0.toNonIndexed():g0.clone()).translate(...prim.at),p=g.getAttribute('position'),c=g.getAttribute('color'),nor=g.getAttribute('normal'),tint=new Color((prim.tint as string)||'#8c8170');
        for(let i=0;i<p.count;i+=3){const positions:number[]=[],colour:number[]=[],nn:number[]=[];for(let j=0;j<3;j++){positions.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));nn.push(nor.getX(i+j),nor.getY(i+j),nor.getZ(i+j));const cc=c?new Color(c.getX(i+j),c.getY(i+j),c.getZ(i+j)):tint;colour.push(cc.r,cc.g,cc.b);}tris.push(positions);cols.push(colour);normals.push(nn);}
      }
    }
  }
  rows[name]={triangles:tris,colours:cols,normals};console.log(`${name}: ${tris.length} triangles`);
}
mkdirSync('/tmp/atlas-living-botanical',{recursive:true});writeFileSync('/tmp/atlas-living-botanical/geometry.json',JSON.stringify(rows));
