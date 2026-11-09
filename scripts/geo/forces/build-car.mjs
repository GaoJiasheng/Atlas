/** 9 cm teaching toy: lofted hatchback shell, actual arch openings and inset panes.
 * Original geometry; references are development-only, never textures. */
import fs from 'node:fs';
import {BufferGeometry,Float32BufferAttribute,Color,Vector3,CatmullRomCurve3,TubeGeometry,LatheGeometry,Vector2,Quaternion} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,mergeDocuments,unpartition} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
const round=Number(process.argv[2]??5),pieces=[],L=.96;
const palette={paint:'#4f7f8c',glass:'#2a2824',trim:'#555047',metal:'#bfc1c0',lamp:'#e9e4d8',tail:'#b8602e'};
function add(g,colour){if(g.index)g=g.toNonIndexed();g.deleteAttribute('uv');const c=new Color(palette[colour]??colour),a=new Float32Array(g.getAttribute('position').count*3);for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);g.setAttribute('color',new Float32BufferAttribute(a,3));pieces.push(g);}
function patch(fn,U,V,colour,flip=false){const p=[],ix=[];for(let i=0;i<=U;i++)for(let j=0;j<=V;j++)p.push(...fn(i/U,j/V));for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*(V+1)+j,b=a+V+1;ix.push(...(flip?[a,b,a+1,b,b+1,a+1]:[a,a+1,b,b,a+1,b+1]));}let g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(ix);g=mergeVertices(g,1e-7);g.computeVertexNormals();add(g,colour);}
function tube(points,r,colour,closed=false){add(new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p)),closed,'centripetal'),Math.max(12,points.length*7),r,r<.0003?6:10,closed),colour);}
function box(at,size,r,colour){const g=new RoundedBoxGeometry(...size,3,r);g.translate(...at);add(g,colour);}
function rail(a,b,width,depth,colour){const A=new Vector3(...a),B=new Vector3(...b),D=B.clone().sub(A);const g=new RoundedBoxGeometry(width,D.length(),depth,3,.00022);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),D.normalize()));g.translate(...A.add(B).multiplyScalar(.5).toArray());add(g,colour);}
function lathe(at,profile,colour,axis='x'){const g=new LatheGeometry(profile.map(p=>new Vector2(...p)),64);if(axis==='x')g.rotateZ(-Math.PI/2);else g.rotateX(Math.PI/2);g.translate(...at);add(g,colour);}
// Body panels. Two real wheel openings on each side, with flared arch return lips.
const halfWidth=x=>.0204-.0022*(Math.abs(x)/.045)**4;
const shoulder=x=>.0029+.0008*Math.cos(x/.045*Math.PI/2)-.0015*(Math.abs(x)/.0445)**10;
const bottom=x=>Math.max(-.013,...[-.028/L,.028/L].map(cx=>Math.abs(x-cx)<.0117?-.011+Math.sqrt(.0117**2-(x-cx)**2):-.013));
for(const s of [-1,1]){
 patch((u,v)=>{const x=-.0445+.089*u,b=bottom(x),y=b+(shoulder(x)-b)*v;return [x,y,s*(halfWidth(x)+.0007*Math.sin(v*Math.PI)-.0013*(1-v)**3)];},160,10,'paint',s===1);
 for(const cx of [-.028/L,.028/L]){
  patch((u,v)=>{const a=.0+Math.PI*u,r=.01175+.0012*v,x=cx+Math.cos(a)*r,y=-.011+Math.sin(a)*r;return [x,y,s*(halfWidth(x)+.0002+.00065*Math.sin(v*Math.PI))];},64,6,'paint',s===-1);
 }
 patch((u,v)=>{const x=-.0445+.089*u,b=bottom(x),y=b+(shoulder(x)-b)*v;return [x,y,s*(halfWidth(x)+.0007*Math.sin(v*Math.PI)-.0013*(1-v)**3-.00065)];},160,8,'paint',s===-1);
 patch((u,v)=>{const x=-.0445+.089*u;return [x,bottom(x),s*(halfWidth(x)-.0013-.00065*v)];},160,2,'paint',s===-1);
 // Physical swage and door shut gap, recessed below panel skin; side moulding above.
 // Moulding runs between the arch lips only (the lip reaches x = ±.0216 at this height); it must not cross the wheel openings.
 tube([[-.0205,-.0004,s*.0211],[-.010,-.0003,s*.02115],[.010,-.0003,s*.02115],[.0205,-.0004,s*.0211]],.00038,'trim');
 tube([[-.012,-.012,s*.0205],[-.012,-.005,s*.0211],[-.012,.003,s*.0209]],.00013,'trim');
 box([-.015,.001,s*.0212],[.004,.0009,.00065],.0002,'metal');
}
// Bonnet, rear deck, underside. Crown changes continuously across actual width.
for(const [lo,hi] of [[.019,.0445],[-.0445,-.037]])patch((u,v)=>{const x=lo+(hi-lo)*u,z=(2*v-1)*halfWidth(x);return [x,shoulder(x)+.0011*(1-(2*v-1)**2),z];},32,36,'paint');
patch((u,v)=>[-.0445+.089*u,-.0125,(2*v-1)*.0178],48,12,'trim',true);
// Roof and inward-sloping greenhouse (panes terminate inside their raised frames).
const roofY=round===1?.019:.0168;
patch((u,v)=>{const x=-.030+.037*u,z=(2*v-1)*.0165;return [x,roofY+.0009*(1-(2*v-1)**2)+.00035*Math.sin(u*Math.PI),z];},32,24,'paint');
function pane(corners,colour='glass',flip=false){patch((u,v)=>{const p=corners[0].map((x,i)=>x*(1-u)*(1-v)+corners[1][i]*u*(1-v)+corners[2][i]*u*v+corners[3][i]*(1-u)*v);p[1]+=.00022*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);return p;},16,10,colour,flip);}
for(const s of [-1,1]){
 const A=[.020,.0042,s*.0195],B=[.0065,roofY,s*.0166],C=[-.0295,roofY,s*.0166],D=[-.039,.0042,s*.0195];
 const paneSide=c=>pane(s===1?c:[...c].reverse(),'glass',true);
 paneSide([[.0175,.0052,s*.0193],[.0055,roofY-.0012,s*.0166],[-.012,roofY-.0012,s*.0166],[-.012,.0052,s*.0193]]);
 paneSide([[-.0145,.0052,s*.0193],[-.0145,roofY-.0012,s*.0166],[-.0283,roofY-.0012,s*.0166],[-.0365,.0052,s*.0193]]);
 for(const [a,b] of [[A,B],[B,C],[C,D],[D,A],[[-.0132,.0042,s*.0195],[-.0132,roofY,s*.0166]]])rail(a,b,.0015,.0011,'paint');
 // sill and structural door panel immediately behind the frame, no floating decals.
 patch((u,v)=>{const x=-.038+.058*u;return [x,.0033+v*.0015,s*.0197];},24,3,'paint',s===1);
}
const front=[[.019,.0045,-.0186],[.019,.0045,.0186],[.007,roofY,.0165],[.007,roofY,-.0165]];
pane(front);for(let i=0;i<4;i++)rail(front[i],front[(i+1)%4],.0012,.0011,'paint');
const back=[[-.0385,.0045,.0185],[-.0385,.0045,-.0185],[-.030,roofY,-.0165],[-.030,roofY,.0165]];
pane(back);for(let i=0;i<4;i++)rail(back[i],back[(i+1)%4],.0012,.0011,'paint');
// Front and rear valances are rounded end panels; lamps and grille have depth.
for(const end of [-1,1]){
 box([end*.0445,-.0055,0],[.0018,.014,.0364],.00065,'paint');
 patch((u,v)=>[end*.04455,.0008+(shoulder(.0445)+.0011*(1-(2*u-1)**2)-.0008)*v,(2*u-1)*halfWidth(.0445)],36,4,'paint',end===-1);
 box([end*.0451,-.0103,0],[.0024,.0037,.0415],.0008,'trim');
}
box([.0455,-.0034,0],[.0013,.007,.032],.0004,'trim');
for(const z of [-.013,.013]){
 lathe([.0462,-.0032,z],[[0,-.0004],[.0034,-.0004],[.0037,0],[.0034,.00065],[0,.001]],'metal');
 lathe([.0468,-.0032,z],[[0,-.00005],[.003,0],[.0028,.00035],[.002,.00055],[0,.00065]],'lamp');
 for(let i=-3;i<=3;i++){const dz=i*.00065,h=Math.sqrt(.0027**2-dz**2);tube([[.0473,-.0032-h,z+dz],[.04745,-.0032,z+dz],[.0473,-.0032+h,z+dz]],.000065,'metal');}
 box([-.0456,-.004,z],[.0008,.0032,.007],.0003,'tail');
}
for(let y=-.0057;y<-.0007;y+=.001)box([.0462,y,0],[.00055,.00026,.0185],.0001,'metal');
for(const z of [-.010,.010])tube([[.019,.0052,z-.004],[.016,.0063,z],[.014,.007,z+.003]],.00022,'trim');
// Actual through axles meet the separately rotating wheel centres.
for(const x of [-.028/L,.028/L])lathe([x,-.011,0],[[0,-.0185],[.001,-.0185],[.001,.0185],[0,.0185]],'metal','z');
let g=mergeGeometries(pieces);g=mergeVertices(g,1e-7);g.scale(L,1,1);g.translate(-.47,.034,.2);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene();
doc.getRoot().getAsset().copyright='Original Atlas toy-car geometry (2026), CC0-1.0; apparatus geometry, MIT repository licence. No third-party meshes or reference photographs embedded.';
const mat=doc.createMaterial('paint-and-inset-glazing').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.34).setMetallicFactor(.18).setExtras({atlasSurface:true});
const prim=doc.createPrimitive().setMaterial(mat);
for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']])prim.setAttribute(semantic,doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute(name).array)).setBuffer(buffer));
prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index.array)).setBuffer(buffer));
scene.addChild(doc.createNode('toy-car').setMesh(doc.createMesh('toy-car').addPrimitive(prim)).setExtras({closed:false}));
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder,MeshoptDecoder});
if(fs.existsSync('scripts/geo/forces/evidence/forces-hardware.glb')){const hardware=await io.read('scripts/geo/forces/evidence/forces-hardware.glb');const mapping=mergeDocuments(doc,hardware);for(const hscene of hardware.getRoot().listScenes()){const copy=mapping.get(hscene);for(const node of [...copy.listChildren()])scene.addChild(node);copy.dispose();}}
await doc.transform(unpartition(),meshopt({encoder:MeshoptEncoder,level:'high'}));
fs.mkdirSync('public/models',{recursive:true});await io.write('public/models/forces.glb',doc);
const file='src/content/topics/forces/data/parts.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
const car=data.parts.find(p=>p.id==='toy-car');delete car.primitive;delete car.extra;car.mesh='toy-car';car.material={color:'enamel'};data.model='/models/forces.glb';
const magnet=data.parts.find(p=>p.id==='car-magnet');magnet.primitive.at[0]=-.5235;magnet.extra[0].at[0]=-.5175;
const wh=data.parts.find(p=>p.id==='car-wheels'),ws=[];
for(const x of [-.498,-.442])for(const z of [.1815,.2185]){
 ws.push({kind:'lathe',profile:[[.0065,-.004],[.0094,-.004],[.0106,-.0033],[.011,-.0018],[.011,.0018],[.0106,.0033],[.0094,.004],[.0065,.004],[.0065,-.004]],segments:64,at:[x,.023,z],rotation:[90,0,0],color:'rubber'});
 const circle=(r,cx=0,cy=0,n=48)=>Array.from({length:n},(_,i)=>[cx+r*Math.cos(i/n*Math.PI*2),cy+r*Math.sin(i/n*Math.PI*2)]);
 ws.push({kind:'extrude',shape:circle(.0068),holes:[circle(.0024),...Array.from({length:8},(_,i)=>circle(.00075,.0048*Math.cos(i/8*Math.PI*2),.0048*Math.sin(i/8*Math.PI*2),12))],depth:.0066,bevel:.00015,at:[x,.023,z],color:'casing'});
 ws.push({kind:'lathe',profile:[[0,-.0037],[.002,-.0037],[.0024,-.0032],[.0024,.0032],[.002,.0037],[0,.0037]],segments:48,at:[x,.023,z],rotation:[90,0,0],color:'steel'});
}
wh.primitive=ws.shift();wh.extra=ws;
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
fs.mkdirSync(`scripts/geo/forces/evidence/round${round}`,{recursive:true});fs.copyFileSync(file,`scripts/geo/forces/evidence/round${round}/parts.json`);fs.copyFileSync('public/models/forces.glb',`scripts/geo/forces/evidence/round${round}/forces.glb`);
console.log(JSON.stringify({round,carTriangles:g.index.count/3,bytes:fs.statSync('public/models/forces.glb').size}));
