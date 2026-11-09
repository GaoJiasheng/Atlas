/** Original smooth teaching reliefs, generated locally; no imported asset. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Matrix4, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const V=(x,y,z=0)=>new Vector3(x,y,z);
const tau=Math.PI*2;
// A flattened epithelial outline: broad uneven edges, shallow indentations, no circle.
const controls=[[-.53,-.84],[-.95,-.48],[-.88,.08],[-.96,.58],[-.48,.96],[.05,.80],[.52,.95],[.91,.47],[.83,.05],[.99,-.45],[.49,-.91],[.02,-.77]];
function animalOutline(){
 const c=new CatmullRomCurve3(controls.map(([x,y])=>V(x,y)),true,'centripetal');
 const a=Array.from({length:128},(_,i)=>c.getPoint(i/128));
 const lo=[Math.min(...a.map(p=>p.x)),Math.min(...a.map(p=>p.y))],hi=[Math.max(...a.map(p=>p.x)),Math.max(...a.map(p=>p.y))];
 return a.map(p=>[(p.x-lo[0])/(hi[0]-lo[0])*.12-.06,(p.y-lo[1])/(hi[1]-lo[1])*.09-.045]).reverse();
}
const plantOutline=()=>Array.from({length:128},(_,i)=>{
 const a=i*tau/128,c=Math.cos(a),s=Math.sin(a);
 return [.08*Math.sign(c)*Math.abs(c)**.33,.04*Math.sign(s)*Math.abs(s)**.33];
});
const shrink=(a,k)=>a.map(([x,y])=>[x*k,y*k]);
function boundary(outline,profile,at){
 const positions=[],indices=[],n=outline.length;
 for(const [s,z] of profile)for(let j=0;j<n;j++){
  const [x,y]=outline[j]; positions.push(x*s+at[0],y*s+at[1],z+at[2]);
 }
 for(let k=0;k<profile.length-1;k++)for(let j=0;j<n;j++){
  const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const ellipse=(rx,ry,x=0,y=0)=>Array.from({length:64},(_,i)=>[x+rx*Math.cos(tau*i/64),y+ry*Math.sin(tau*i/64)]);
function mitochondrion(x,y,angle,scale=1,z=.002){
 const outline=Array.from({length:48},(_,i)=>{const t=i*tau/48;return [.008*Math.cos(t),.0035*Math.sin(t)*(1+.12*Math.cos(t))+.0012*Math.cos(t)**2];});
 const inner=shrink(outline,.77), rotation=[0,0,angle*180/Math.PI];
 const gs=[relief(outline,.00264,[x,y,z+.0009],'token:hot',[inner],.00022),relief(inner,.0009,[x,y,z-.0003],'token:en-heat',undefined,.00015)];
 const cristae=[],roots=[];
 for(let k=0;k<7;k++){
  const u=-.006+k*.0019+.00012*Math.sin(k*2.1),c=u/(.008*.77),mid=.0012*c*c*.77,half=.0035*Math.sqrt(1-c*c)*(1+.12*c)*.77;
  // Membrane lamellae rise from a continuous inner-membrane strip. Sample
  // the rounded crests explicitly; uniform tube sampling undersamples these
  // small tips, making them angular in a true close-up.
  const bottom=mid-half+.00008,reach=.68+.10*Math.sin(k*1.7);
  const r=.00025*(1+.12*Math.sin(k*2.3)),tip=bottom+half*2*reach-r;
  const bend=t=>.00018*Math.sin(k*1.6)*Math.sin(Math.PI*t)+.00013*Math.cos(k)*t;
  for(let j=0;j<=4;j++){const t=j/4;cristae.push([u-r+bend(t),bottom+(tip-bottom)*t]);}
  for(let j=1;j<=8;j++){const a=Math.PI-j*Math.PI/8;cristae.push([u+bend(1)+r*Math.cos(a),tip+r*Math.sin(a)]);}
  for(let j=3;j>=0;j--){const t=j/4;cristae.push([u+r+bend(t),bottom+(tip-bottom)*t]);}
  roots.push([u,bottom-.00023]);
 }
 // The basal strip is only 0.23 mm wide at this illustrative scale; keep
 // the bevel below half that width so concave roots cannot bridge pockets.
 gs.push(relief([...cristae,...roots.reverse()],.0016,[x,y,z+.00145],'token:hot',undefined,.00003));
 return gs.map(g=>({...g,at:[x,y,z+(g.at[2]-z)*scale],scale:[scale,scale,scale],rotation}));
}
const relief=(shape,depth,at,tint,holes,bevel=0)=>({kind:'extrude',shape,depth,at,color:'tissue',tint,bevel,...(holes?{holes}:{})});
// Divide actual gel regions, without overlapping caps or a false label proxy.
// The first region's bounds centre is clear cytoplasm; all share one material
// and are merged into one draw. The shared un-bevelled seam is coplanar.
function clipX(outline,x,keepLeft){
 const out=[];
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length],ina=keepLeft?a[0]<=x:a[0]>=x,inb=keepLeft?b[0]<=x:b[0]>=x;
  if(ina)out.push(a);
  if(ina!==inb){const t=(x-a[0])/(b[0]-a[0]);out.push([x,a[1]+(b[1]-a[1])*t]);}
 }
 return out;
}
function cytoplasm(parts,id,regions,organelles){
 const p=parts.find(p=>p.id===id);delete p.mesh;delete p.material;
 p.primitive=regions[0];p.extra=[...regions.slice(1),...organelles];
}
// A boundary's leader ends on its visible front rim (glb `extras.labelPoint`),
// not at its bounds centre, which falls on the nucleus or vacuole: the outline
// sample nearest `angle` (radians about the cell centre), at one profile row.
function rim(outline,at,scale,z,angle){
 const along=([x,y])=>(x*Math.cos(angle)+y*Math.sin(angle))/Math.hypot(x,y);
 const [x,y]=outline.reduce((best,p)=>along(p)>along(best)?p:best);
 return [x*scale+at[0],y*scale+at[1],z+at[2]];
}
function meshGeometry(parts){
 const list=parts.map(g=>{const b=g.index?g.toNonIndexed():g;b.deleteAttribute('uv');b.clearGroups();return b;});
 const merged=mergeGeometries(list,false);for(const g of list)g.dispose();return merged;
}
export async function buildOrganelles(parts){
 const doc=new Document();const buffer=doc.createBuffer();const scene=doc.createScene('cells-relief');
 doc.getRoot().getAsset().copyright='Atlas original meshes, CC BY-NC-SA 4.0. Generated by scripts/geo/cells/build-organelles.mjs; scientific references S4, S17, S18; no third-party geometry.';
 const metrics={},labelPoints=new Map();
 const add=(id,geometries,color,tint,labelPoint)=>{
  const g=meshGeometry(geometries),p=g.getAttribute('position'),n=g.getAttribute('normal');
  const accessor=(a)=>doc.createAccessor().setType('VEC3').setArray(new Float32Array(a)).setBuffer(buffer);
  const primitive=doc.createPrimitive().setAttribute('POSITION',accessor(p.array)).setAttribute('NORMAL',accessor(n.array));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(primitive)).setExtras({closed:false}));
  if(labelPoint)labelPoints.set(id,labelPoint);
  const part=parts.find(p=>p.id===id);delete part.primitive;delete part.extra;delete part.repeat;part.mesh=id;part.material={color,tint};metrics[id]=p.count/3;g.dispose();
 };
 const animal=animalOutline(),plant=plantOutline();
 // The front lid is deliberately absent in this permanently exposed illustration,
 // so the nodes are marked open: a cutaway must not cap them with a hatched face.
 // Roll continuously from the basal membrane to the thickened visible edge.
 add('animal-membrane',[boundary(animal,[[.963,-.008],[.986,-.0071],[1,-.005],[1,.0045],[.993,.007],[.978,.008],[.963,.007],[.957,.0045],[.957,-.005],[.963,-.008]],[.1,.1,0])],'tissue','token:neutral',
  rim(animal,[.1,.1,0],.978,.008,0));
 const gel=shrink(animal,.953),animalRegions=[relief(clipX(gel,-.004,true),.0042,[.1,.1,-.0037],'token:seedling-pale'),relief(clipX(gel,-.004,false),.0042,[.1,.1,-.0037],'token:seedling-pale',[ellipse(.0124,.0104,.015,0)]),relief(ellipse(.0124,.0104,.015,0),.0004,[.1,.1,-.0065],'token:seedling-pale')];
 const animalRelief=[];
 for(const [x,y,a,s] of [[.065,.119,.7,.9],[.135,.123,-.8,1],[.073,.076,-.5,.85],[.126,.072,.2,1.1],[.105,.133,-.2,.75]])animalRelief.push(...mitochondrion(x,y,a,s));
 // Curved cisternae near the nucleus: flattened membranes with unequal lengths.
 const cisterna=path=>({kind:'sweep',path,radius:[.00005,.00055,.00055,.00005],segments:24,radial:10,caps:'round',section:{flat:.32},up:[0,0,1],at:[0,0,0],color:'tissue',tint:'token:bone'});
 for(let k=0;k<4;k++)animalRelief.push(cisterna([[.130+k*.002,.087,.0003],[.139+k*.001,.094,.0009],[.141+k*.001,.104,.0007],[.135+k*.002,.112,.0002]]));
 for(let k=0;k<4;k++)animalRelief.push(cisterna([[.086,.091-k*.0018,.0005],[.083,.096-k*.0016,.001],[.087,.100-k*.0016,.001],[.096,.101-k*.0016,.0005]]));
 // Sparse illustrative granules: seven clear, varied surface profiles rather
 // than a dense collection of individually baked sub-pixel beads.
 for(let k=0;k<7;k++){
  const a=k*2.39996,r=.012+.021*((k*17%37)/37),x=.1+Math.cos(a)*r,y=.1+Math.sin(a)*r*.8;
  if(((x-.115)/.014)**2+((y-.1)/.012)**2<1.2)continue;
  animalRelief.push({kind:'lathe',profile:Array.from({length:9},(_,i)=>[(.00038+(k%3)*.00009)*Math.sin(i*Math.PI/8),-.00035*Math.cos(i*Math.PI/8)]),segments:10,scale:[1,1,.00035/(.00038+(k%3)*.00009)],at:[x,y,-.0004],color:'tissue',tint:'token:bone'});
 }
 cytoplasm(parts,'animal-cytoplasm',animalRegions,animalRelief);
 const wallProfile=[[.965,-.025],[.990,-.024],[1,-.021],[1,.020],[.997,.023],[.981,.025],[.955,.025],[.941,.023],[.938,.020],[.938,-.021],[.944,-.024],[.965,-.025]];
 // Leaders end on the outer sides of the side-by-side pair (plant left, animal right), so labels
 // never cross the other cell: the wall's flat front band upper left, the membrane's crest lower left.
 add('plant-cell-wall',[boundary(plant,wallProfile,[-.1,.12,0])],'tissue','token:food',rim(plant,[-.1,.12,0],.968,.025,Math.PI-.35));
 add('plant-membrane',[boundary(plant,[[.933,-.022],[.933,.0185],[.931,.021],[.923,.022],[.916,.021],[.916,.0185],[.916,-.022],[.933,-.022]],[-.1,.12,0])],'tissue','token:neutral',rim(plant,[-.1,.12,0],.923,.022,Math.PI+.3));
 // Central liquid body: an asymmetric pillow with soft shoulders, never a box.
 const vacOutline=Array.from({length:128},(_,i)=>{const a=i*tau/128,c=Math.cos(a),s=Math.sin(a);return [.06*Math.sign(c)*Math.abs(c)**.55*(c<0?.8+.2*Math.abs(s)**.4:1),.03*Math.sign(s)*Math.abs(s)**.6];});
 const minVac=Math.min(...vacOutline.map(p=>p[0]));for(const p of vacOutline)if(p[0]<0)p[0]*=-.06/minVac;
 const vac=boundary(vacOutline,[[0,-.020],[.4,-.019],[.8,-.017],[.96,-.012],[1,-.003],[.98,.007],[.86,.014],[.60,.018],[.27,.0195],[0,.020]],[-.1,.12,0]);
 add('plant-vacuole',[vac],'tissue','token:cold');
 // Basal cytoplasm has a true opening for the nucleus and an empty vacuole lumen.
 const pg=shrink(plant,.911),plantRegions=[relief(clipX(pg,.066,false),.0362,[-.1,.12,-.0018],'token:seedling-pale'),relief(clipX(pg,.066,true),.0362,[-.1,.12,-.0018],'token:seedling-pale',[shrink(vacOutline,1.025),ellipse(.0073,.0063,-.0645,0)]),relief(ellipse(.0073,.0063,-.0645,0),.0259,[-.1,.12,-.0072],'token:seedling-pale')];
 const plantCyt=[];
 // These mitochondria inhabit peripheral cytoplasm, independent of chloroplasts.
 for(const [x,y,a,s] of [[-.151,.14,1.2,.65],[-.05,.136,-1,.6],[-.121,.086,.1,.55]]){
  plantCyt.push(...mitochondrion(x,y,a,s,.018));
 }
 cytoplasm(parts,'plant-cytoplasm',plantRegions,plantCyt);
 const out=new URL('../../../public/models/',import.meta.url);mkdirSync(out,{recursive:true});
 await MeshoptEncoder.ready;
 // Preserve the authored contours; compress without mesh simplification.
 await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16}));
 // Quantisation moves each node into a dequantising frame; label points are node-local.
 for(const node of doc.getRoot().listNodes()){
  const p=labelPoints.get(node.getName());
  if(p)node.setExtras({...node.getExtras(),labelPoint:new Vector3(...p).applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()).invert()).toArray()});
 }
 const bytes=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);
 if(bytes.length>1_500_000)throw new Error(`Cells asset exceeds 1.5 MB: ${bytes.length}`);
 writeFileSync(new URL('cells.glb',out),bytes);
 return {model:'/models/cells.glb',metrics,bytes:bytes.length};
}

export function polishCellParts(parts){
 const get=id=>parts.find(p=>p.id===id);
 const sphere=(size,at,tint,segments=40,rings=24)=>({kind:'lathe',profile:Array.from({length:rings+1},(_,i)=>[i===0||i===rings?0:size[0]*Math.sin(i*Math.PI/rings),-size[1]*Math.cos(i*Math.PI/rings)]),segments,scale:[1,1,size[2]/size[0]],at,color:'tissue',tint});
 const granule=(size,at,tint)=>({kind:'lathe',profile:Array.from({length:13},(_,i)=>[i===0||i===12?0:size[0]*Math.sin(i*Math.PI/12),-size[1]*Math.cos(i*Math.PI/12)]),segments:16,scale:[1,1,size[2]/size[0]],at,color:'tissue',tint});
 for(const [id,centre,size] of [['animal-nucleus',[.115,.1,0],[.0115,.0095,.006]],['plant-nucleus',[-.1645,.12,.012],[.007,.006,.006]]]){
  const p=get(id);p.primitive=sphere(size,centre,'token:f-push');
  p.extra=[sphere(size.map(v=>v*.3),[centre[0]+size[0]*.17,centre[1]-size[1]*.13,centre[2]+size[2]*.88],'token:ink-2',24,16)];
  // Nucleolus and irregular clumps of condensed chromatin distinguish a nucleus from a bare ball.
  for(let k=0;k<8;k++){
   const a=k*2.39996,r=.48+.16*Math.sin(k*3.8),z=Math.sqrt(1-r*r);
   p.extra.push(granule([.00045,.00035,.00018].map(v=>v*(id==='plant-nucleus'?.65:1)),[centre[0]+size[0]*r*Math.cos(a),centre[1]+size[1]*r*Math.sin(a),centre[2]+size[2]*z],'token:neutral'));
  }
 }
 const chl=get('plant-chloroplasts');delete chl.repeat;
 const shells=[],folds=[];
 const spots=[[-.151,.149,-.25],[-.101,.152,.15],[-.05,.147,-.4],[-.148,.091,.3],[-.098,.089,-.22],[-.047,.094,.45]];
 for(const [i,[x,y,a]] of spots.entries()){
  const s=1+(i%3-1)*.06;
  shells.push({...sphere([.010*s,.0048,.0031],[x,y,.0185],'token:seedling',32,20),rotation:[0,0,a*180/Math.PI]});
  // Four grana stacks per chloroplast; attached lamellae cross between them.
  for(let k=0;k<4;k++){
   const u=(k-1.5)*.0035*s;
   folds.push({kind:'lathe',profile:[[0,-.00075],[.0012,-.00075],[.0013,-.00065],[.0013,-.0004],[.00105,-.00032],[.00105,-.0002],[.0013,-.00012],[.0013,.00012],[.00105,.0002],[.00105,.00032],[.0013,.0004],[.0013,.00065],[.0012,.00075],[0,.00075]],segments:16,rotation:[90,0,a*180/Math.PI],at:[x+u*Math.cos(a),y+u*Math.sin(a),.022],color:'tissue',tint:'token:food'});
  }
 }
 chl.primitive=shells.shift();chl.extra=[...shells,...folds];
 const update=(id,en,zh)=>{const p=get(id);p.detail.en=p.detail.en.split('\n\n')[0]+'\n\n'+en;p.detail.zh=p.detail.zh.split('\n\n')[0]+'\n\n'+zh;};
 update('animal-membrane','The smooth irregular boundary surrounds a slightly flattened epithelial example. The illustration has an exposed front face and an exaggerated rolled membrane edge, so its contents are readable in the assembled view; a real membrane is far thinner [S20].','平滑而不规则的边界围住一个略扁的上皮细胞。图示敞开正面，并把膜的边缘加厚，让完整视图中的内部结构也能辨认；真实细胞膜远薄于此 [S20]。');
 update('animal-cytoplasm','The opaque warm surface is an exposed illustration of cytoplasm, with mitochondria and their folded inner membranes, curved membrane sacs and small granules. These details belong to the same cytoplasm selection; colours and sizes are explanatory choices, not an unstained microscope view [S4, S20].','暖色不透明表面表示敞开的细胞质图示，其中有线粒体及其折叠内膜、弯曲膜囊和小颗粒。这些细节随细胞质一起选中；颜色和尺寸用于说明，不代表未经染色的显微视野 [S4, S20]。');
 update('animal-nucleus','This flattened epithelial example contains one nucleus with a visible nucleolus and scattered chromatin detail. Its position and explanatory colour do not imply that all animal cells have identical shapes or centrally placed nuclei; small vesicles remain omitted [S4, S20].','这个扁平上皮细胞有一个核，图中可见核仁和分散的染色质细节。核的位置与说明用色不表示所有动物细胞形状相同或核总在中央；小囊泡仍省略 [S4, S20]。');
 update('plant-cytoplasm','A thickened peripheral layer with organelle relief surrounds a real central opening for the large vacuole. There is also a separate opening around the side nucleus. Mitochondria remain distinct from the six green chloroplasts; colours and thickness are illustrative [S4, S20].','加厚的周边细胞质与细胞器围住大液泡的中央空位，侧面另为细胞核留孔。线粒体与六个绿色叶绿体不同；颜色及厚度均作了说明性处理 [S4, S20]。');
 update('plant-chloroplasts','Six varied lens-shaped chloroplasts sit around the large vacuole. Each shows a few internal membrane stacks as an illustrative relief. Six is a design count, not a biological rule. Onion bulb epidermis normally lacks chloroplasts [S4, S20, S23, S24].','六个大小及方向略有差异的透镜形叶绿体围绕大液泡，每个都以浮雕方式示意少量内部膜堆。六个是设计数量，不是生物规律。洋葱鳞茎表皮通常没有叶绿体 [S4, S20, S23, S24]。');
 update('plant-vacuole','The blue-green central pillow represents cell sap, not air or an empty hole. Its softly rounded design envelope remains 0.12 × 0.06 × 0.04 m in the enlarged model. Animal cells can have smaller vesicles, which are omitted here [S20, S4].','蓝绿色的柔软中央体表示细胞液，不是空气或空洞。它的圆润设计包络在放大模型中仍为 0.12 × 0.06 × 0.04 米。动物细胞可有较小囊泡，此处省略 [S20, S4]。');
}
