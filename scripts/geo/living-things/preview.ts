/** Offline smooth-normal CPU raster of the exact authored meshes. No browser.
 * Run pnpm tsx scripts/geo/living-things/preview.ts [specimen ids...]
 * then python3 scripts/geo/living-things/render-preview.py . */
import {mkdirSync,writeFileSync} from 'node:fs';
import {specimen,MODELS} from './models';
import {modelGeometry} from './bake';
const ids=process.argv.slice(2);const data:Record<string,unknown>={};let total=0;
for(const id of ids.length?ids:Object.keys(MODELS).slice(3)){
 const g=modelGeometry(specimen(id)),p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),ix=g.index!;
 const triangles:number[][]=[],colours:number[][]=[],normals:number[][]=[];
 for(let i=0;i<ix.count;i+=3){const pp:number[]=[],cc:number[]=[],nn:number[]=[];for(let j=0;j<3;j++){const k=ix.getX(i+j);pp.push(p.getX(k),p.getY(k),p.getZ(k));cc.push(c.getX(k),c.getY(k),c.getZ(k));nn.push(n.getX(k),n.getY(k),n.getZ(k));}triangles.push(pp);colours.push(cc);normals.push(nn);}
 data[id]={triangles,colours,normals};console.log(`${id}: ${ix.count/3} triangles`);total+=ix.count/3;g.dispose();
}
console.log('specimen total',total);mkdirSync('/tmp/atlas-living-polish',{recursive:true});writeFileSync('/tmp/atlas-living-polish/geometry.json',JSON.stringify(data));
