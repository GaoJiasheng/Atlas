/** Compile the accepted assembly plus control population as one selectable draw.
 * Original primitive assembly remains its conservative rest/anchor proxy. */
import fs from 'node:fs';
import {Color,Float32BufferAttribute,Matrix4} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {primitiveSchema} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
import {denseControl} from './dense-control.ts';
import {compile} from '../kits/residual-polish.mjs';
const path='src/content/topics/aircon/data/parts.json',file=JSON.parse(fs.readFileSync(path,'utf8')),p=file.parts.find(p=>p.id==='inverter-board');p.extra=p.extra.slice(0,32);
const css=fs.readFileSync('src/theme/tokens.css','utf8'),body=css.slice(css.indexOf(':root[data-theme="paper"] {')),tokens=Object.fromEntries([...body.slice(0,body.indexOf('\n}')).matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]])),gs=[];
for(const q of [p.primitive,...p.extra,...denseControl()]){const look=resolveMaterialLook(q.color,tokens,'paper',q.tint),color=new Color(look.color);for(const piece of partPieces({primitive:primitiveSchema.parse(q)})){if(piece.lines)continue;for(const m of piece.matrices??[new Matrix4()]){const g=piece.geometry.clone().applyMatrix4(m).translate(...q.at),ps=g.getAttribute('position');g.setAttribute('color',new Float32BufferAttribute(Array.from({length:ps.count},()=>color.toArray()).flat(),3));for(const a of Object.keys(g.attributes))if(!['position','normal','color'].includes(a))g.deleteAttribute(a);gs.push(g);}}}
await compile('public/models/aircon-inverter.glb',[{id:p.id,geometry:mergeGeometries(gs.map(g=>g.index?g.toNonIndexed():g)),material:{roughness:.58,metalness:.12}}],{ratio:.18,error:.0005,position:16});
p.mesh=p.id;p.material={color:'plastic',tint:'#ffffff'};file.model='/models/aircon-inverter.glb';fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');console.log('inverter bytes',fs.statSync('public/models/aircon-inverter.glb').size);
