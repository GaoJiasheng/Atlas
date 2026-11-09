/** Reproducible school laboratory apparatus, dimensions remain the authored study. */
import fs from 'node:fs';
const path='src/content/topics/magnets/data/parts.json';
const data=JSON.parse(fs.readFileSync('scripts/geo/magnets/evidence/baseline-parts.json','utf8'));
const part=(id:string)=>data.parts.find((p:any)=>p.id===id);
const lathe=(profile:number[][],at:number[],color='steel',rotation=[0,0,0],tint?:string)=>({kind:'lathe',profile,segments:64,at,color,rotation,...(tint?{tint}:{})});
const box=(size:number[],at:number[],color='steel',bevel=.0007,tint?:string)=>({kind:'bevelBox',size,bevel,at,color,...(tint?{tint}:{})});
const sweep=(path:number[][],radius:number,at:number[],color='steel')=>({kind:'sweep',path,radius,at,color});
const rod=(r:number,l:number,at:number[],rotation=[0,0,0],color='steel')=>lathe([[0,-l/2],[r,-l/2],[r,l/2],[0,l/2]],at,color,rotation);
const stand=part('suspension-stand');
// Cast base with clipped corners and round edge fillets, not a bent rod foot.
stand.primitive={kind:'extrude',shape:[[-.034,-.026],[.038,-.026],[.044,-.020],[.044,.020],[.038,.026],[-.034,.026],[-.039,.021],[-.039,-.021]],depth:.009,bevel:.0015,at:[.026,.006,-.18],rotation:[90,0,0],color:'powder',tint:'token:ink-2'};
stand.extra=[
 lathe([[0,-.127],[.003,-.127],[.003,.125],[.0025,.127],[0,.127]],[.015,.138,-.18]),
 // Rod socket and bored boss sleeve have physically open bores.
 lathe([[.0031,-.006],[.006,-.006],[.007,-.004],[.007,.004],[.006,.006],[.0031,.006],[.0031,-.006]],[.015,.244,-.18],'casing'),
 box([.015,.013,.012],[.024,.244,-.18],'casing',.0015),
 rod(.0015,.011,[.015,.244,-.169],[90,0,0],'brass'),
 {kind:'extrude',shape:[[-.006,-.002],[-.005,-.004],[.005,-.004],[.006,-.002],[.006,.002],[.005,.004],[-.005,.004],[-.006,.002]],depth:.0025,bevel:.0005,at:[.015,.244,-.162],color:'brass'},
 rod(.002,.051,[.055,.244,-.18],[0,0,90]),
 lathe([[.0021,-.005],[.005,-.005],[.005,.005],[.0021,.005],[.0021,-.005]],[.079,.244,-.18],'casing',[0,0,90]),
 // Three distinct rounded jaw prongs close around the suspension pin.
 sweep([[0,0,0],[.008,.006,-.006],[.014,.007,-.005],[.016,.004,-.002]],.0014,[.079,.244,-.18]),
 sweep([[0,0,0],[.008,.006,.006],[.014,.007,.005],[.016,.004,.002]],.0014,[.079,.244,-.18]),
 sweep([[0,0,0],[.009,-.003,0],[.015,-.002,0],[.016,.001,0]],.0014,[.079,.244,-.18]),
 rod(.0012,.012,[.095,.248,-.18]),
 sweep([[0,0,0],[0,-.003,.002],[0,-.006,0],[0,-.003,-.002],[0,0,0]],.0006,[.095,.25,-.18]),
 // Keep the established thread endpoint / magnet suspension pivot exactly.
 sweep([[0,0,0],[0,-.09,0]],.0003,[.095,.244,-.18],'plastic'),
 {kind:'extrude',shape:[[-.011,0],[-.011,.012],[-.010,.012],[-.010,.001],[.010,.001],[.010,.012],[.011,.012],[.011,0]],depth:.025,bevel:.00015,at:[.095,.153,-.18],color:'enamel'},
 lathe([[.003,-.003],[.006,-.003],[.006,.003],[.003,.003],[.003,-.003]],[.015,.013,-.18],'casing'),
 lathe([[0,-.005],[.0014,-.005],[.0014,.003],[.004,.003],[.004,.005],[0,.005]],[.079,.244,-.169],'brass',[90,0,0]),
];
stand.detail.en=stand.detail.en.replace('A stand with a thin thread','A retort stand with a cast-metal base, an adjustable holder and a three-pronged clamp. A thin thread').replace(' and a paper cradle for the bar magnet.',' and a paper cradle carry the bar magnet.');
stand.detail.zh=stand.detail.zh.replace('支架上挂着','铸造底座的铁架台带有可调夹头和三爪夹，上面挂着');
// The sweep also exposed two auxiliary bent-rod supports. Their attachments
// stay with the existing parent parts, so chapter and exploded behavior stays.
const tray=part('test-tray');tray.extra=tray.extra.slice(0,4).concat([
 box([.074,.010,.060],[-.188,.006,-.17],'powder',.002,'token:ink-2'),
 rod(.003,.303,[-.2,.157,-.17]),
 lathe([[.0031,-.006],[.006,-.006],[.006,.006],[.0031,.006],[.0031,-.006]],[-.2,.294,-.17],'casing'),
 rod(.002,.050,[-.175,.294,-.17],[0,0,90]),
 lathe([[0,-.005],[.0014,-.005],[.0014,.003],[.0038,.003],[.0038,.005],[0,.005]],[-.2,.294,-.159],'brass',[90,0,0]),
 box([.018,.003,.026],[-.15,.294,-.17],'casing',.0005),
 box([.018,.003,.026],[-.15,.283,-.17],'casing',.0005),
 box([.004,.010,.026],[-.157,.288,-.17],'casing',.0007),
 rod(.0012,.012,[-.15,.289,-.17]),
]);
const leads=part('em-leads');leads.extra=leads.extra.filter((_:unknown,i:number)=>i!==6&&i!==7).concat([
 box([.047,.008,.041],[.32,.004,-.05],'powder',.0015,'token:ink-2'),
 rod(.002,.17,[.32,.09,-.05]),
 lathe([[.0021,-.004],[.0045,-.004],[.0045,.004],[.0021,.004],[.0021,-.004]],[.32,.142,-.05],'casing'),
 rod(.0014,.030,[.305,.142,-.05],[0,0,90]),
 lathe([[0,-.003],[.001,-.003],[.001,.002],[.003,.002],[.003,.004],[0,.004]],[.32,.142,-.042],'brass',[90,0,0]),
 sweep([[.004,0,-.004],[0,0,-.006],[-.004,0,-.003],[-.004,0,.003],[0,0,.006],[.004,0,.004]],.001,[.29,.14,-.05]),
 box([.004,.007,.011],[.294,.142,-.05],'casing',.0005),
]);
const can=part('steel-can');
const prof:[number,number][]=[[0,-.0252],[.021,-.0252],[.0238,-.0252],[.0245,-.026],[.026,-.026],[.0268,-.0254],[.0268,-.0243],[.026,-.0237],[.0254,-.0237],[.0254,-.021]];
// Six shallow strengthening beads, continuous smooth revolution.
for(let i=0;i<6;i++){const y=-.0175+i*.006;prof.push([.0254,y-.0013],[.02565,y-.0009],[.02595,y-.0004],[.02605,y],[.02595,y+.0004],[.02565,y+.0009],[.0254,y+.0013]);}
prof.push([.0254,.0226],[.026,.0233],[.0268,.0238],[.0268,.0253],[.026,.026],[.0245,.026],[.024,.0253],[.024,.0247],[.0228,.0245],[.0223,.0241],[.0218,.0239],[.0213,.0241],[.0208,.0245],[.018,.0245],[.0175,.0241],[.017,.024],[.0165,.0241],[.016,.0245],[0,.0245]);
can.primitive=lathe(prof,[.25,.026,.16]);
can.extra=[sweep(prof.filter(([r,y])=>r>.025&&y>-.022&&y<.023).map(([r,y])=>[0,y,r+.0001]),.00018,[.25,.026,.16])];
const cells=part('em-cells');
cells.primitive=lathe([[0,-.02525],[.0058,-.02525],[.0066,-.0251],[.007,-.0246],[.00715,-.024],[.00715,.023],[.0068,.0238],[.0056,.024],[.0026,.024],[.0026,.02525],[.0023,.026],[0,.026]],[.37,.012,-.005],'casing',[90,0,0]);
cells.extra=[
 lathe([[.0071,-.0218],[.00725,-.0216],[.00725,.0175],[.0071,.0178]],[.37,.012,-.005],'powder',[90,0,0],'token:ink-2'),
 lathe([[.00265,-.0002],[.0056,-.0002],[.0056,.0002],[.00265,.0002],[.00265,-.0002]],[.37,.012,.019],'rubber',[90,0,0]),
 lathe([[0,-.0002],[.0053,-.0002],[.0053,.0002],[0,.0002]],[.37,.012,-.0304],'steel',[90,0,0]),
 lathe([[.00715,-.0003],[.0073,0],[.00715,.0003]],[.37,.012,.0125],'casing',[90,0,0]),
 // Each battery repeats together with its fitted open holder and contacts.
 {kind:'extrude',shape:[[-.009,0],[.009,0],[.009,.010],[.0078,.010],[.0078,.002],[-.0078,.002],[-.0078,.010],[-.009,.010]],depth:.059,bevel:.0004,at:[.37,.002,-.005],color:'powder',tint:'token:ink-2'},
 {kind:'extrude',shape:[[-.0085,-.006],[.0085,-.006],[.0085,.007],[.005,.007],[.004,.001],[-.004,.001],[-.005,.007],[-.0085,.007]],depth:.0013,bevel:.00025,at:[.37,.009,-.035],color:'powder',tint:'token:ink-2'},
 {kind:'extrude',shape:[[-.0085,-.006],[.0085,-.006],[.0085,.007],[.005,.007],[.004,.001],[-.004,.001],[-.005,.007],[-.0085,.007]],depth:.0013,bevel:.00025,at:[.37,.009,.025],color:'powder',tint:'token:ink-2'},
 {kind:'coil',radius:[.0034,.0017],wire:.00035,turns:3.5,length:.0045,segments:24,radial:8,at:[.37,.012,-.0325],rotation:[90,0,0],color:'steel'},
 {kind:'extrude',shape:[[-.002,.002],[-.0015,.002],[-.0015,-.0015],[.0025,-.0015],[.0025,-.002],[-.002,-.002]],depth:.002,bevel:.0001,at:[.37,.0105,.023],rotation:[0,-90,0],color:'brass'},
 box([.0038,.00015,.0007],[.37,.0193,.007],'enamel',.00004),
 box([.0007,.00015,.0038],[.37,.0193,.007],'enamel',.00004),
];
// Count bindings require no extras. Compile both complete cells contiguously;
// nonindexed triangles keep first-N draw ranges aligned with cell boundaries.
for(const p of data.parts)for(const prim of [p.primitive,...(p.extra??[])])if(prim?.kind==='sweep'&&prim.radius===.00045)Object.assign(prim,{segments:192,radial:10,caps:'flat'});
const {partPieces}=await import('../../../src/engines/space-scene/stages/model3d/geometry');
const {primitiveSchema}=await import('../../../src/engines/space-scene/schema');
const {Matrix4,Vector3,Matrix3,Color}=await import('three');
const {Document,NodeIO}=await import('@gltf-transform/core');
const {ALL_EXTENSIONS,EXTMeshoptCompression}=await import('@gltf-transform/extensions');
const {MeshoptEncoder}=await import('meshoptimizer');
const {quantize}=await import('@gltf-transform/functions');

const positions:number[]=[],normals:number[]=[],colors:number[]=[];
const {resolveMaterialLook}=await import('../../../src/engines/space-scene/lib/color');
const css=fs.readFileSync('src/theme/tokens.css','utf8'),start=css.indexOf(':root[data-theme="paper"] {'),body=css.slice(start,css.indexOf('\n}',start));
const tokens=Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
for(const prim of cells.extra)if(prim.color==='powder')prim.tint='token:ink';
for(let copy=0;copy<2;copy++)for(const prim of [cells.primitive,...cells.extra]){
 const parsed=primitiveSchema.parse(prim),pieces=partPieces({primitive:parsed});
 for(const piece of pieces)for(const matrix of piece.matrices??[new Matrix4()]){
  const g=piece.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),idx=g.index,nm=new Matrix3().getNormalMatrix(matrix);
  const rgb=new Color(resolveMaterialLook(prim.color,tokens,'paper',prim.tint).color),v=new Vector3(),nv=new Vector3();
  for(let i=0;i<(idx?.count??p.count);i++){
   const j=idx?idx.getX(i):i;v.fromBufferAttribute(p,j).applyMatrix4(matrix).add(new Vector3(...prim.at)).sub(new Vector3(.37,.012,-.005));v.x+=(copy-.5)*.018;
   nv.fromBufferAttribute(n,j).applyMatrix3(nm).normalize();positions.push(...v.toArray());normals.push(...nv.toArray());colors.push(...rgb.toArray());
  }
 }
}
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('magnets');
doc.getRoot().getAsset().copyright='Original Atlas procedural school AA cells and holders. MIT repository license. No third-party meshes or textures.';
const primitive=doc.createPrimitive();
for(const [semantic,array]of [['POSITION',positions],['NORMAL',normals],['COLOR_0',colors]]as const)primitive.setAttribute(semantic,doc.createAccessor().setType('VEC3').setArray(new Float32Array(array)).setBuffer(buffer));

primitive.setMaterial(doc.createMaterial('school-cell-satin').setBaseColorFactor([1,1,1,1]).setMetallicFactor(.35).setRoughnessFactor(.4).setExtras({atlasSurface:true}));
scene.addChild(doc.createNode('em-cells').setMesh(doc.createMesh('em-cells').addPrimitive(primitive)).setTranslation([.37,.012,-.005]).setExtras({closed:true}));
// A 32 mm wire clip does not need the old 512 longitudinal rings; 64 and 128 showed kinked bends on the GPU (acceptance 2026-11-09); 192 keeps them round within the triangle budget.
// Retain the authored curve; ten radial sides read round at this 0.9 mm wire size; flat cut wire ends.
for(const id of ['steel-paper-clips','clip-chain','stroke-paper-clips','em-paper-clips']){
 const p=part(id);Object.assign(p.primitive,{segments:192,radial:10,caps:'flat'});
}
await MeshoptEncoder.ready;
await doc.transform(quantize({quantizePosition:14,quantizeNormal:10,quantizeColor:8}));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
const bytes=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);
if(bytes.length>1_500_000)throw new Error('magnets GLB exceeds size budget');
fs.mkdirSync('public/models',{recursive:true});fs.writeFileSync('public/models/magnets.glb',bytes);
data.model='/models/magnets.glb';cells.mesh='em-cells';cells.material={color:'plastic',tint:'#ffffff'};delete cells.primitive;delete cells.extra;
fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
console.log(`Rebuilt suspension-stand, steel-can, em-cells; ${bytes.length} GLB bytes.`);
