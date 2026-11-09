/** pnpm tsx scripts/geo/water/build.ts [round=12] */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { BufferGeometry, Matrix4, Float32BufferAttribute } from 'three';
import { Document, NodeIO, Logger, VertexLayout } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, meshopt, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { compressPosition } from '../living-things/compress-position';
import { Sculpture, cloud, catchmentTerrain, forest, city, hdb, barrage, gates, pumpHouse, gatePivot, type V } from './scenery';
const round=Number(process.argv[2]??12),path='src/content/topics/water/data/parts.json';
const baseline=JSON.parse(fs.readFileSync('scripts/geo/water/baseline-parts.json','utf8'));
const file=structuredClone(baseline);
// Straight drain runs need no hundreds of identical longitudinal rings.
// Keep the original U section, path, endpoints, material and flow geometry.
const drains=file.parts.find((p:any)=>p.id==='drains');
drains.primitive.segments=48;for(const p of drains.extra)p.segments=4;
function terrain(){return catchmentTerrain(baseline.parts.find((x:any)=>x.id==='forest-hill').primitive.shape);}
const house=new Sculpture();hdb(house,[.21,0,.55],.452,.420,.1,12,7,true,round);
const tank=new Sculpture();
for(const x of [.242,.296]){
 tank.box([x,.42975,.55],[.047,.0185,.065],'neutral',.001);
 tank.box([x,.454,.55],[.044,.036,.060],'paper',.0015);
 // Moulded sectional panel faces, raised seams and corner frames. These
 // sit outside the case rather than leaving its front as an undecorated box.
 for(const axis of ['x','z'])for(const sign of [-1,1]){
  const w=axis==='z'?.044:.060,at=(u:number,y:number,d:number):V=>axis==='z'?[x+u,y,.55+sign*(.0304+d)]:[x+sign*(.0224+d),y,.55+u];
  const rail=(u:number,y:number,width:number,height:number)=>tank.box(at(u,y,-.0003),axis==='z'?[width,height,.0008]:[.0008,height,width],'neutral');
  for(const u of [-w/2,0,w/2])rail(u,.454,.0008,.036);
  for(const y of [.436,.454,.472])for(const u of [-w/4,w/4])rail(u,y,w/2-.0008,.0008);
  for(const u0 of [-w/4,w/4])for(const y0 of [.445,.463]){
   const p:number[]=[],ix:number[]=[],N=4;
   for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
    const u=i/N,v=j/N,d=.0015*Math.sin(Math.PI*u)**2*Math.sin(Math.PI*v)**2;
    p.push(...at(u0+(u-.5)*(w/2-.002),y0+(v-.5)*.0155,d));
   }
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,b,a+1,a+1,b,b+1);}
   const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();tank.add(g,'paper',.93);
  }
 }

 tank.box([x,.473,.55],[.045,.003,.061],'neutral',.0005);
 tank.box([x,.476,.55],[.012,.003,.014],'ink-3',.0004);
}
// Join both preserved teaching pipe endpoints to real tank bodies.
tank.tube([[.33,.435,.535],[.324,.443,.537],[.313,.445,.55]],.0055,.0055,'ink-3',8,16);
tank.tube([[.27,.432,.55],[.27,.444,.55],[.254,.444,.55]],.0045,.0045,'ink-3',6,16);
tank.tube([[.257,.441,.55],[.276,.441,.55]],.003,.003,'ink-3',2,12);
// Original supply riser and downfeed retain their exact teaching endpoints.
const oldTank=baseline.parts.find((p:any)=>p.id==='roof-tank');
for(const prim of oldTank.extra.filter((p:any)=>p.kind==='tube')){for(const piece of partPieces({primitive:prim})){for(const m of piece.matrices??[new Matrix4()])tank.add(piece.geometry.clone().applyMatrix4(m).translate(...prim.at as V),'ink-3');}}
const sculptures=new Map<string,BufferGeometry>([['cumulus',cloud(false,round)],['rain-cloud',cloud(true,round)],['forest-hill',forest(terrain(),round)],['city-blocks',city(round)],['hdb-block',house.finish()],['roof-tank',tank.finish()],['barrage',barrage(round)],['crest-gates',gates(round)],['pump-house',pumpHouse(round)]]);
const doc=new Document().setLogger(new Logger(Logger.Verbosity.ERROR)),buffer=doc.createBuffer(),scene=doc.createScene('water');
doc.getRoot().getAsset().copyright='Original procedural Atlas water scenery, 2026. MIT (repository LICENSE). No third-party mesh or image textures.';
const matte=doc.createMaterial('token-coloured-scenery').setBaseColorFactor([1,1,1,1]).setDoubleSided(true).setRoughnessFactor(.86).setMetallicFactor(0).setExtras({atlasSurface:true});
const steel=doc.createMaterial('steel-crest-gates').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.38).setMetallicFactor(.72).setExtras({atlasSurface:true});
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
for(const [id,g]of sculptures){
 const p=doc.createPrimitive().setMaterial(id==='crest-gates'?steel:matte);
 for(const [a,s]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']] as const)p.setAttribute(s,doc.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array(g.getAttribute(a).array)));
 p.setIndices(doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(g.index!.array)));
 scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(p)).setExtras({closed:!['forest-hill','city-blocks','pump-house'].includes(id)}));
 const part=file.parts.find((x:any)=>x.id===id);delete part.primitive;delete part.extra;delete part.repeat;part.mesh=id;part.material={color:'plastic',tint:'#ffffff'};part.castShadow=false;
}
await doc.transform(weld());
for(const m of doc.getRoot().listMeshes())if(['forest-hill','city-blocks','roof-tank','pump-house'].includes(m.getName()))simplifyPrimitive(m.listPrimitives()[0]!,{simplifier:MeshoptSimplifier,ratio:m.getName()==='roof-tank'?.16:m.getName()==='city-blocks'?.42:m.getName()==='forest-hill'?.40:.50,error:.00065,lockBorder:false});
for(const m of doc.getRoot().listMeshes())if(['cumulus','rain-cloud'].includes(m.getName()))simplifyPrimitive(m.listPrimitives()[0]!,{simplifier:MeshoptSimplifier,ratio:.43,error:.0009});
// Use a compact tonal palette, retaining natural unequal leaf tones.
for(const mesh of doc.getRoot().listMeshes()){
 const a=mesh.listPrimitives()[0]!.getAttribute('COLOR_0')!.getArray()!;
 for(let i=0;i<a.length;i++)a[i]=Math.round(a[i]!*127)/127;
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:11,quantizeNormal:8,quantizeColor:8}));
const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
console.log(doc.getRoot().listMeshes().map(m=>[m.getName(),m.listPrimitives()[0]!.getIndices()!.getCount()/3]));
const binary=compressPosition(await io.writeBinary(doc),11);if(round>=3&&binary.byteLength>1_500_000)throw new Error(`Budget: ${binary.byteLength} bytes`);
fs.mkdirSync('public/models',{recursive:true});fs.writeFileSync('public/models/water.glb',binary);
file.model='/models/water.glb';file.poses['gates-open']['crest-gates'].pivot=gatePivot;
// Minimal EN/ZH corrections where previous prose described the discarded shapes.
const patch=(id:string,en:string,zh:string,oldEn:string,oldZh:string)=>{const p=file.parts.find((p:any)=>p.id===id);p.detail.en=p.detail.en.replace(oldEn,en);p.detail.zh=p.detail.zh.replace(oldZh,zh);};
patch('forest-hill','The model makes the hills look higher than they really are. Its trees have branches and overlapping tops of different sizes.','模型把山的高度夸大，树木则呈现分枝和高低不齐、交叠的树冠。','The model raises the hills far above their real height and draws the trees as round crowns.','模型把山画得比实际高得多，树也画成一个个圆圆的树冠。');
patch('city-blocks','The model shows long blocks and tower blocks of flats, with open void decks, windows set back into the walls and trees along the streets.','模型用长条形和塔形的组屋、架空底层、凹进墙里的窗户和街边的树木来表示城市。','The model draws the city as a grid of plain blocks.','模型把城市画成一格格简单的楼块。');
patch('hdb-block','The model shows a twelve-storey long block of flats with an open void deck, windows set back into the walls, shared corridors and a lift shaft.','模型画了一栋十二层的长条形组屋，设有架空底层、凹进墙里的窗户、公共走廊和电梯井。','The model draws one slab block of twelve storeys with a grid of floors and columns.','模型画了一栋十二层的板式组屋，楼层和柱子排成格子。');
patch('crest-gates','The model shows the barrage shorter than it really is, but keeps the gates wide and low. When the gates are open, they tip towards the sea.','模型把堤坝画得比实际短，但闸门仍然又宽又低；开闸时，闸门向大海的一侧倒下。','The model draws the gates far shorter than they are; in the gates-open pose they tip towards the sea.','模型把闸门画得短得多；在"开闸"姿态下，闸门向海的一侧倒下。');
patch('pump-house','The model shows a low curved green roof around an open courtyard and seven outlet pipes facing the sea. The building takes up less ground than the real one, so that it fits in this slice of the model.','模型画出围绕露天庭院的低矮弧形绿屋顶，以及七根朝向大海的排水管。建筑占地比实际小，这样才放得进这一段模型。','The model draws the pump house as a block with a green roof and seven outlet pipes facing the sea.','模型把泵房画成一个带绿色屋顶的方块，七根排水管朝向大海。');
fs.writeFileSync(path,JSON.stringify(file,null,1)+'\n');
const counts=(data:any)=>Object.fromEntries(partsFile.parse(data).parts.map(p=>[p.id,partPieces(p).reduce((a,x)=>a+(x.lines?0:(x.geometry.index?.count??x.geometry.getAttribute('position').count)/3*(x.matrices?.length??1)),0)]));
const before=counts(baseline),after=counts(file);for(const m of doc.getRoot().listMeshes())after[m.getName()]=m.listPrimitives()[0]!.getIndices()!.getCount()/3;
const sum=(x:Record<string,number>)=>Object.values(x).reduce((a,b)=>a+b,0);
const calls=(data:any)=>partsFile.parse(data).parts.reduce((n,p)=>n+(p.mesh?1:partPieces(p).filter(x=>!x.lines).length),0);
const metrics={round,before,after,trianglesBefore:sum(before),trianglesAfter:sum(after),drawCallsBefore:calls(baseline),drawCallsAfter:calls(file),glbBytesBefore:0,glbBytesAfter:binary.byteLength};
fs.writeFileSync(`scripts/geo/water/comparisons/round${round}-metrics.json`,JSON.stringify(metrics,null,2));console.log(metrics);

fs.writeFileSync('scripts/geo/water/comparisons/final-asset.json',JSON.stringify({glb:'public/models/water.glb',sha256:createHash('sha256').update(binary).digest('hex'),bytes:binary.byteLength,trianglesOnScreen:sum(after),drawCallsEstimate:calls(file),geometryCode:'scripts/geo/water/scenery.ts',method:'decoded meshopt GLB; CPU studio PBR + sampled RoomEnvironment; ACES and production material adapter checked',GPUAcceptance:'pending, browser prohibited'},null,2)+'\n');
