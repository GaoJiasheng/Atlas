/** Export the installed compressed model (or --staging candidate) for CPU QA. */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix3,Matrix4,Vector3} from 'three';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {partSchema} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
await MeshoptDecoder.ready;
const staged=process.argv.includes('--staging'),before=process.argv.includes('--before');
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(before?'/tmp/living-round3-before.glb':staged?'/tmp/atlas-living-polish/living-things.glb':'public/models/living-things.glb');
await doc.transform(dequantize());
const requested=process.argv.slice(2).filter(a=>a!=='--staging'&&a!=='--before'),output:Record<string,unknown>={};
const data=JSON.parse(readFileSync(before?'/tmp/living-round3-before.json':staged?'/tmp/atlas-living-polish/parts.json':'src/content/topics/living-things/data/parts.json','utf8'));
const root=doc.getRoot();
for(const node of root.listNodes()){
 const id=node.getName();if(requested.length&&!requested.includes(id))continue;
 const g=node.getMesh()!.listPrimitives()[0]!,p=g.getAttribute('POSITION')!,n=g.getAttribute('NORMAL')!,c=g.getAttribute('COLOR_0')!,ix=g.getIndices()!;
 const world=new Matrix4().fromArray(node.getWorldMatrix()),nm=new Matrix3().getNormalMatrix(world);
 const triangles:number[][]=[],colours:number[][]=[],normals:number[][]=[],uvs:number[][]=[];
 const uv=g.getAttribute('TEXCOORD_0');
 for(let i=0;i<ix.getCount();i+=3){const pp:number[]=[],cc:number[]=[],nn:number[]=[],uu:number[]=[];for(let j=0;j<3;j++){
  const k=ix.getScalar(i+j),a=p.getElement(k,[0,0,0]),b=n.getElement(k,[0,0,0]),rgb=c.getElement(k,[0,0,0]);
  const pos=new Vector3(a[0],a[1],a[2]).applyMatrix4(world),nor=new Vector3(b[0],b[1],b[2]).applyMatrix3(nm).normalize();
  pp.push(...pos.toArray());nn.push(...nor.toArray());cc.push(...rgb);uu.push(...(uv?.getElement(k,[0,0])??[0,0]));
 }triangles.push(pp);colours.push(cc);normals.push(nn);uvs.push(uu);}
 const family=data.parts.find((p:{id:string})=>p.id===id)!.primitive.color;
 output[id]={triangles,colours,normals,uvs,family};
}
// Dedicated close-ups use the actual decoded surface, with no replacement geometry.
for(const [id,name,low,high]of [
 ['javan-myna','myna-feet',0,.35],['penguin','penguin-feet',0,.20],
 ['fruit-bat','bat-head',.70,1],['fruit-bat','bat-coat',.24,.76],['python','python-belly',0,1],['asian-toad','toad-head',.5,1],['mushroom','mushroom-gills',.48,.80],
]as const){
 const source=output[id] as {triangles:number[][];colours:number[][];normals:number[][];uvs:number[][];family:string}|undefined;if(!source)continue;
 let min=Infinity,max=-Infinity;for(const t of source.triangles)for(const i of [1,4,7]){min=Math.min(min,t[i]!);max=Math.max(max,t[i]!);}
 const chosen={triangles:[]as number[][],colours:[]as number[][],normals:[]as number[][],uvs:[]as number[][],family:source.family};
 source.triangles.forEach((t,i)=>{const y=(t[1]!+t[4]!+t[7]!)/3;if(y>=min+(max-min)*low&&y<=min+(max-min)*high)for(const key of ['triangles','colours','normals','uvs']as const)chosen[key].push(source[key][i]!);});
 output[name]=chosen;
}
// Before/after source for the unchanged counters and optional full-scene framing.
const scene={triangles:[]as number[][],colours:[]as number[][],normals:[]as number[][]};
for(const raw of data.parts){
 if(raw.group==='magnified'||raw.id==='cell-plinth')continue;
 if(raw.mesh){const found=output[raw.id]as typeof scene|undefined;if(found)for(const k of ['triangles','colours','normals']as const)scene[k].push(...found[k]);continue;}
 if(requested.length)continue;
 const part=partSchema.parse(raw),slots=partMaterialSlots(part);
 for(const piece of partPieces(part)){if(piece.lines)continue;const g=piece.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index;const col=(slots[piece.slot??0]?.tint??'#858574');
 // Native scenery is a neutral geometry view; no transparent glass is rasterized.
 if(slots[piece.slot??0]?.color==='glass')continue;
 const rgb=col.startsWith('#')?[1,3,5].map(i=>parseInt(col.slice(i,i+2),16)/255):[.45,.42,.37];
 for(const m of piece.matrices??[new Matrix4()]){
  const world=new Matrix4().makeTranslation(...part.primitive!.at).multiply(m),nm=new Matrix3().getNormalMatrix(world);
  for(let i=0;i<(ix?.count??p.count);i+=3){const pp:number[]=[],nn:number[]=[],cc:number[]=[];for(let j=0;j<3;j++){const k=ix?.getX(i+j)??i+j;pp.push(...new Vector3().fromBufferAttribute(p,k).applyMatrix4(world).toArray());nn.push(...new Vector3().fromBufferAttribute(n,k).applyMatrix3(nm).normalize().toArray());cc.push(...rgb);}scene.triangles.push(pp);scene.normals.push(nn);scene.colours.push(cc);}
 }
 }
}
if(!requested.length)output['case-overview']=scene;
mkdirSync('/tmp/atlas-living-polish',{recursive:true});writeFileSync('/tmp/atlas-living-polish/geometry.json',JSON.stringify(output));
console.log(`Exported ${Object.keys(output).length} decoded mesh studies for CPU raster`);
