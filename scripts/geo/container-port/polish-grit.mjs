/** Metric UVs make the engine's existing sand finish true fine asphalt grit. */
import fs from 'node:fs';
import {Color,Float32BufferAttribute,Matrix4} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {compile} from '../kits/residual-polish.mjs';
import {primitiveSchema} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
const path='src/content/topics/container-port/data/parts.json',file=JSON.parse(fs.readFileSync(path,'utf8')),p=file.parts.find(p=>p.id==='quay-context');
// Retain the accepted paving dimensions and expansion-joint locations.
const primitives=[{kind:'box',size:[200,1,64],at:[0,-.5,32],color:'abrasive',tint:'token:mannequin'},{kind:'box',size:[200,.024,40],at:[0,.012,44],color:'abrasive'}];
for(let x=-90;x<=90;x+=10)primitives.push({kind:'box',size:[.045,.006,24],at:[x,.003,12],color:'abrasive'});
for(const z of [8,16])primitives.push({kind:'box',size:[200,.006,.045],at:[0,.003,z],color:'abrasive'});
const css=fs.readFileSync('src/theme/tokens.css','utf8'),body=css.slice(css.indexOf(':root[data-theme="paper"] {')),tokens=Object.fromEntries([...body.slice(0,body.indexOf('\n}')).matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]])),base=new Color(resolveMaterialLook('abrasive',tokens,'paper','token:mannequin').color),gs=[];
for(const q of primitives){const pieces=partPieces({primitive:primitiveSchema.parse(q)}),color=new Color(resolveMaterialLook(q.color,tokens,'paper',q.tint).color);color.setRGB(color.r/base.r,color.g/base.g,color.b/base.b);
 for(const piece of pieces)for(const m of piece.matrices??[new Matrix4()]){const g=piece.geometry.clone().applyMatrix4(m).translate(...q.at),ps=g.getAttribute('position'),ns=g.getAttribute('normal'),uv=[],colors=[];
  for(let i=0;i<ps.count;i++){const axis=Math.abs(ns.getY(i))>.9?1:Math.abs(ns.getX(i))>.9?0:2;uv.push(ps.getComponent(i,axis===0?2:0)/1.08,ps.getComponent(i,axis===1?2:1)/1.08);colors.push(...color.toArray());}
  g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setAttribute('color',new Float32BufferAttribute(colors,3));gs.push(g);
 }
}
const g=mergeGeometries(gs);await compile('public/models/container-port-grit.glb',[{id:'quay-context',geometry:g,material:{roughness:.93,metalness:0,extras:{}}}],{position:16});
p.mesh='quay-context';p.material={color:'abrasive',tint:'token:mannequin'};delete p.primitive;delete p.extra;file.model='/models/container-port-grit.glb';fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
console.log('metric paving',fs.statSync('public/models/container-port-grit.glb').size,'bytes');
