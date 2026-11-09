/** Exact generated patch geometry under the shared studio, no engine mutations. */
import fs from 'node:fs';
import {BufferGeometry,Float32BufferAttribute,Color,Vector3} from 'three';
import {loadTopic,render,compare,tokens,type Surface} from './studio';
const dir='scripts/anatomy/rebuild-evidence/comparisons/fascia';
fs.mkdirSync(dir,{recursive:true});
const rig=JSON.parse(fs.readFileSync('scripts/anatomy/core/rig.json','utf8'));
const centre=rig.sourceCentre??rig.sourceChestCentre,c=[centre[0],centre[2],-centre[1]];
const native=JSON.parse(fs.readFileSync('scripts/anatomy/cache/rebuild-source.json','utf8')).meshes['Linea alba'];
const final=JSON.parse(fs.readFileSync('scripts/anatomy/rebuild-evidence/linea-geometry.json','utf8'));
const base=await loadTopic('core');
function surface(data:{positions:number[];indices:number[]}):Surface{
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(data.positions,3));g.setIndex(data.indices);g.computeVertexNormals();
 const p=g.getAttribute('position'),n=g.getAttribute('normal'),pos=new Float32Array(data.indices.length*3),norm=new Float32Array(pos.length);
 for(let i=0;i<data.indices.length;i++){const k=data.indices[i]!;pos.set([p.getX(k)-c[0],p.getY(k)-c[1],p.getZ(k)-c[2]],i*3);new Vector3().fromBufferAttribute(n,k).toArray(norm,i*3);}
 g.dispose();return{id:'linea-alba-context',positions:pos,normals:norm,rgb:new Color(tokens('paper').bone!),roughness:.86,metalness:0,envIntensity:.35};
}
for(const [pass,data]of [['native',native],['smooth',final]]as const){
 const fascia=surface(data),shapes=[...base,fascia];
 for(const [view,angle]of [['front',0],['three-quarter',35],['profile',90]]as const){
  const file=`${dir}/${pass}-${view}.png`;await render(shapes,file,{angle});await compare(file,'scripts/anatomy/rebuild-evidence/refs/Gray392.png',`${dir}/${pass}-${view}-sheet.png`,`${pass} fascia patch / ${view}: source dissection differs from plate`);
 }
 await render(shapes,`${dir}/${pass}-detail.png`,{angle:0,target:[.001,1.04-c[1],.1-c[2]],size:.46});
 await compare(`${dir}/${pass}-detail.png`,'scripts/anatomy/rebuild-evidence/refs/Gray392.png',`${dir}/${pass}-detail-sheet.png`,`${pass} fascia patch detail: smooth midline tendon, not vertebrae`);
}
console.log('Native and smooth fascia candidate sheets:',dir);
