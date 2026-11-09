/** Original workshop hardware. Metres in the existing forces scene coordinates.
 * Curved forged sections, sockets, jaws and tread are real mesh relief. */
import { BufferGeometry, Float32BufferAttribute, Color, Vector3, CylinderGeometry, TorusGeometry, TubeGeometry, CatmullRomCurve3, Shape, ExtrudeGeometry,  Quaternion } from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {crumpledPaper} from './crumpled-paper';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export type V=[number,number,number];
export interface Hardware {id:string;geometry:BufferGeometry;family:string}
const C={steel:'#a3a7a8',cast:'#555047',ink:'#2a2824',silver:'#c3c4c0',rubber:'#1e1f20',leather:'#8a8378',paper:'#dcd7cb',plastic:'#c9bc9f'};
class Build {
 pieces:BufferGeometry[]=[];
 add(g:BufferGeometry,color:string,at:V=[0,0,0]){let x=g.index?g.toNonIndexed():g; if(x!==g)g.dispose();x.translate(...at);const p=x.getAttribute('position');const c=new Color(color),a=new Float32Array(p.count*3);for(let i=0;i<p.count;i++)a.set(c.toArray(),i*3);x.setAttribute('color',new Float32BufferAttribute(a,3));x.deleteAttribute('uv');this.pieces.push(x);return x;}
 box(at:V,size:V,color=C.steel,bevel=.002){return this.add(new RoundedBoxGeometry(...size,3,Math.min(bevel,...size.map(x=>x*.4))),color,at);}
 cyl(a:V,b:V,r:number,color=C.steel,r2=r,n=48){const av=new Vector3(...a),bv=new Vector3(...b),d=bv.clone().sub(av);const g=new CylinderGeometry(r2,r,d.length(),n,1);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),d.normalize()));return this.add(g,color,av.add(bv).multiplyScalar(.5).toArray() as V);}
 tube(path:V[],r:number,color=C.steel,n=32){return this.add(new TubeGeometry(new CatmullRomCurve3(path.map(x=>new Vector3(...x))),n,r,12,false),color);}
 ring(at:V,r:number,t:number,color=C.steel,axis:'x'|'y'|'z'='y'){const g=new TorusGeometry(r,t,10,48);if(axis==='y')g.rotateX(Math.PI/2);if(axis==='x')g.rotateY(Math.PI/2);return this.add(g,color,at);}
 finish(){const g=mergeGeometries(this.pieces)!;this.pieces.forEach(x=>x.dispose());g.computeBoundingBox();return g;}
}
function screw(b:Build,p:V,axis:'x'|'z'='z',r=.0035){const d=axis==='x'?[.013,0,0]:[0,0,.013];b.cyl(p,p.map((v,i)=>v+d[i]!) as V,r*.55,C.steel);const end=p.map((v,i)=>v+d[i]!) as V;b.cyl(end,end.map((v,i)=>v+d[i]!*.32) as V,r,C.cast,r,32);const g=b.box(end,axis==='x'?[.004,.009,.018]:[.018,.009,.004],C.ink,.002);return g;}
function boss(b:Build,p:V,scale=1,axis:'x'|'z'='x'){
 const [x,y,z]=p,s=scale;
 const collar=(at:V,inner:number,outer:number,length:number,direction:'x'|'y'|'z')=>{const shape=new Shape(),gap=.10;shape.absarc(0,0,outer,gap,Math.PI*2-gap,false);shape.lineTo(Math.cos(gap)*inner,-Math.sin(gap)*inner);shape.absarc(0,0,inner,Math.PI*2-gap,gap,true);shape.closePath();const g=new ExtrudeGeometry(shape,{depth:length,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.0005,bevelThickness:.0005,curveSegments:32});g.translate(0,0,-length/2);if(direction==='y')g.rotateX(Math.PI/2);if(direction==='x')g.rotateY(Math.PI/2);b.add(g,C.cast,at);};
 collar(p,.0065*s,.013*s,.027*s,'y');
 const q:V=axis==='x'?[x,y,z+.023*s]:[x+.023*s,y,z];collar(q,.0054*s,.010*s,.021*s,axis);
 b.box(axis==='x'?[x,y,z+.012*s]:[x+.012*s,y,z],[.014*s,.014*s,.014*s],C.cast,.004*s);
 screw(b,[x+.009*s,y,z],'x',.004*s);screw(b,[q[0],y,q[2]+.007*s],'z',.004*s);
}
function base(b:Build,p:V,size:V){const [x,y,z]=p;b.box(p,size,C.cast,.008);for(const dx of [-1,1])for(const dz of [-1,1])b.cyl([x+dx*size[0]*.39,y-size[1]/2-.003,z+dz*size[2]*.35],[x+dx*size[0]*.39,y-size[1]/2,z+dz*size[2]*.35],.009,C.rubber);}
function retort(){const b=new Build();base(b,[.12,.0105,-.22],[.20,.015,.14]);b.cyl([.04,.015,-.25],[.04,.636,-.25],.006);b.cyl([.04,.017,-.25],[.04,.038,-.25],.011,C.cast);b.ring([.04,.038,-.25],.009,.0015);boss(b,[.04,.53,-.25]);b.cyl([.023,.53,-.227],[.31,.53,-.227],.005);for(const x of [.135,.27]){b.ring([x,.53,-.227],.0055,.001,'#a3a7a8','x');b.tube([[x,.525,-.227],[x,.519,-.237],[x,.518,-.25],[x-.002,.516,-.25]],.0012);}return {id:'retort-stand',geometry:b.finish(),family:'steel'};}
function drop(){const b=new Build();base(b,[1.17,-.74,-.17],[.24,.02,.20]);b.cyl([1.17,-.73,-.17],[1.17,.89,-.17],.008);b.cyl([1.17,-.73,-.17],[1.17,-.692,-.17],.016,C.cast);for(const y of [-.205,.295,.795])b.ring([1.17,y,-.17],.0087,.0016,C.ink);return {id:'drop-stand',geometry:b.finish(),family:'steel'};}
function releases(){const b=new Build();boss(b,[1.17,.307,-.17],1.15,'z');b.cyl([1.19645,.307,-.18],[1.19645,.307,.035],.005);b.box([1.17,.307,.035],[.3,.012,.012],C.cast,.003);for(const x of [1.07,1.27]){b.cyl([x,.307,.035],[x,.307,.10],.004);b.cyl([x-.032,.307,.10],[x+.032,.307,.10],.003);b.box([x,.315,.104],[.018,.017,.015],C.silver,.003);for(const s of [-1,1]){b.tube([[x+s*.029,.307,.10],[x+s*.03,.299,.13],[x+s*.02,.29,.153]],.0024);b.box([x+s*.019,.29,.147],[.006,.011,.018],C.rubber,.0015);}b.cyl([x,.318,.103],[x,.328,.103],.002);b.box([x,.33,.103],[.021,.004,.014],C.cast,.002);}return {id:'release-clamps',geometry:b.finish(),family:'steel'};}
function wheelStand(iteration:number){const b=new Build();base(b,[.56,.0105,-.12],[.30,.015,.16]);
 // Two separate cheeks meet opposite axle ends. Offset splayed feet clear wheel.
 for(const z of [-.165,-.075]){
  b.tube([[.46,.022,z],[.475,.10,z],[.535,.25,z],[.56,.293,z]],.007,C.cast,36);
  b.box([.56,.299,z],[.026,.032,.009],C.cast,.004);
  b.cyl([.56,.30,z-.005],[.56,.30,z+.005],.009,C.silver);b.cyl([.56,.30,z-.008],[.56,.30,z+.008],.005,C.steel,.005,6);
 }
 // Reversed fork arch carries the central mounting bolt above the tyre.
 for(const z of [-.165,-.075]) b.tube([[.56,.30,z],[.58,.37,z],[.60,.47,z],[.60,.505,z],[.582,.515,-.12]],.0065,C.cast,40);
 b.cyl([.555,.515,-.12],[.603,.515,-.12],.006,C.steel);b.ring([.60,.515,-.12],.009,.002,C.silver,'x');
 base(b,[.83,.0105,-.12],[.07,.012,.07]);b.cyl([.83,.017,-.12],[.83,.49,-.12],.008);b.cyl([.83,.5,-.205],[.83,.5,-.035],.011);b.cyl([.83,.5,-.11],[.83,.5,-.035],.0135,C.rubber);if(iteration>1)for(let i=0;i<10;i++)b.ring([.83,.5,-.041-i*.006],.0135,.0006,C.ink,'z');// The brake lever's clamp and housing stay fixed while only its handle turns.
 const collar=new Shape();collar.absarc(0,0,.0145,0,Math.PI*2,false);const hole=new Shape();hole.absarc(0,0,.0112,0,Math.PI*2,true);collar.holes.push(hole);const band=new ExtrudeGeometry(collar,{depth:.012,bevelEnabled:true,bevelSegments:2,bevelSize:.0005,bevelThickness:.0005,curveSegments:24});b.add(band,C.silver,[.83,.5,-.131]);
 b.tube([[.822,.509,-.125],[.817,.513,-.105],[.818,.513,-.083]],.005,C.silver,24);
 const housing=new Shape();housing.moveTo(-.010,-.013);housing.quadraticCurveTo(-.016,-.008,-.014,.003);housing.quadraticCurveTo(-.010,.017,.002,.016);housing.quadraticCurveTo(.012,.013,.012,.004);housing.lineTo(.009,-.009);housing.quadraticCurveTo(.002,-.016,-.010,-.013);const shell=new ExtrudeGeometry(housing,{depth:.013,bevelEnabled:true,bevelSegments:3,bevelSize:.0012,bevelThickness:.001,curveSegments:16});b.add(shell,C.silver,[.818,.512,-.0815]);
 b.cyl([.818,.512,-.084],[.818,.512,-.067],.004,C.steel);b.cyl([.815,.517,-.075],[.815,.524,-.075],.0035,C.silver);screw(b,[.827,.511,-.125],'x',.003);
 return {id:'wheel-stand',geometry:b.finish(),family:'steel'};}
function forged(b:Build,path:V[],width:number,thickness:number){
 const curve=new CatmullRomCurve3(path.map(p=>new Vector3(...p))),P:number[]=[],I:number[]=[];const N=40,rad=10;
 for(let i=0;i<=N;i++){const p=curve.getPoint(i/N),t=curve.getTangent(i/N),w=new Vector3(0,t.z,-t.y).normalize();for(let k=0;k<rad;k++){const a=k/rad*Math.PI*2;P.push(p.x+Math.cos(a)*thickness/2,p.y+w.y*Math.sin(a)*width/2,p.z+w.z*Math.sin(a)*width/2);}}
 for(let i=0;i<N;i++)for(let k=0;k<rad;k++){const a=i*rad+k,c=i*rad+(k+1)%rad,d=a+rad,e=c+rad;I.push(a,c,d,c,e,d);}const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();b.add(g,C.silver);}
function brake(iteration:number){const b=new Build();
 b.cyl([.548,.515,-.12],[.572,.515,-.12],.0065,C.silver);b.cyl([.546,.515,-.12],[.549,.515,-.12],.004,C.steel,.004,6);
 forged(b,[[.553,.515,-.12],[.553,.507,-.148],[.553,.485,-.15],[.553,.467,-.144]],.012,.006);
 forged(b,[[.561,.515,-.12],[.561,.506,-.092],[.561,.485,-.09],[.561,.467,-.096]],.012,.006);
 forged(b,[[.561,.515,-.12],[.561,.526,-.14],[.561,.53,-.154]],.009,.005);
 forged(b,[[.553,.515,-.12],[.553,.503,-.14],[.553,.501,-.154]],.008,.005);
 b.cyl([.561,.526,-.154],[.561,.544,-.154],.0035,C.steel);for(let k=0;k<5;k++)b.ring([.561,.532+k*.0018,-.154],.0037,.0005,C.ink);
 b.cyl([.561,.528,-.154],[.553,.501,-.154],.0007,C.steel);b.cyl([.549,.501,-.154],[.559,.501,-.154],.003,C.steel,.003,6);
 for(const s of [-1,1]){const z=-.12+s*.0185;
  b.cyl([.56,.465,z-s*.007],[.56,.465,z+s*.007],.0028,C.steel,.0028,6);
  b.box([.56,.463,z],[.042,.012,.004],C.silver,.0015);b.box([.56,.463,z-s*.0035],[.038,.009,.006],C.rubber,.0012);
  if(iteration>1)for(const dx of [-.009,0,.009])b.box([.56+dx,.463,z-s*.0068],[.0014,.008,.0007],C.ink,.0003);
 }
 b.ring([.57,.515,-.12],.0078,.0008,C.steel,'x');b.tube([[.57,.523,-.12],[.57,.52,-.143],[.56,.505,-.145]],.0008);b.tube([[.57,.507,-.12],[.57,.504,-.099]],.0008);
 return {id:'brake-caliper',geometry:b.finish(),family:'casing'};}
function cable(){const b=new Build();b.tube([[.815,.52,-.075],[.80,.586,-.08],[.72,.62,-.1],[.60,.608,-.145],[.561,.544,-.154]],.0024,C.rubber,64);for(const p of [[.815,.52,-.075],[.561,.544,-.154]] as V[])b.cyl([p[0],p[1]-.004,p[2]],[p[0],p[1]+.004,p[2]],.0034,C.silver);return {id:'brake-cable',geometry:b.finish(),family:'rubber'};}
function sole(b:Build,at:V,rubber:boolean,iteration:number){
 // Asymmetric child's last: broad toe, narrow waist, rounded heel. A longitudinal
 // loft gives continuous heel step, sprung toe and concave shank, not a slab.
 const outline=[[-.11,0],[-.106,-.018],[-.092,-.026],[-.065,-.027],[-.036,-.022],[-.012,-.021],[.012,-.030],[.04,-.037],[.073,-.037],[.099,-.028],[.11,-.009],[.108,.010],[.092,.028],[.067,.037],[.036,.036],[.009,.027],[-.02,.019],[-.05,.023],[-.085,.025],[-.103,.018]];
 const stations=[[-.111,0,0],[-.102,.016,.020],[-.085,.025,.027],[-.065,.025,.027],[-.04,.020,.023],[-.02,.018,.024],[0,.025,.033],[.03,.035,.039],[.06,.038,.039],[.085,.033,.035],[.102,.020,.026],[.111,0,0]];
 const width=(x:number,k:number)=>{let j=0;while(j<stations.length-2&&x>stations[j+1]![0]!)j++;const a=stations[j]!,d=stations[j+1]!,t=(x-a[0]!)/(d[0]!-a[0]!),u=t*t*(3-2*t);return a[k]!*(1-u)+d[k]!*u;};
 const vertices:number[]=[],indices:number[]=[],NX=64,NZ=12;
 const height=(x:number)=>.011-.005*Math.exp(-(((x+.025)/.031)**2))-.008*Math.max(0,(x-.072)/.039)**2;
 for(let side=0;side<2;side++)for(let i=0;i<=NX;i++){const x=-.111+i/NX*.222;for(let j=0;j<=NZ;j++){const t=j/NZ,z=-width(x,1)*(1-t)+width(x,2)*t;vertices.push(x,height(x)-(side?.006:0)+.0006*Math.sin(t*Math.PI),z);}}
 const stride=(NX+1)*(NZ+1),off=(i:number,j:number)=>i*(NZ+1)+j;
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const a=off(i,j),c=off(i+1,j),d=a+1,e=c+1;indices.push(a,d,c,d,e,c,stride+a,stride+c,stride+d,stride+d,stride+c,stride+e);}
 for(let i=0;i<NX;i++)for(const j of [0,NZ]){const a=off(i,j),c=off(i+1,j);if(j===0)indices.push(a,c,stride+a,c,stride+c,stride+a);else indices.push(a,stride+a,c,c,stride+a,stride+c);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();b.add(g,rubber?C.rubber:C.leather,at);
 // Separate heel block has a vertical breast and undercut arch.
 const heel=new Shape();heel.moveTo(-.103,-.018);heel.quadraticCurveTo(-.113,0,-.103,.018);heel.quadraticCurveTo(-.083,.027,-.058,.024);heel.lineTo(-.052,-.023);heel.quadraticCurveTo(-.085,-.028,-.103,-.018);
 const h=new ExtrudeGeometry(heel,{depth:.008,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:3,curveSegments:16});h.rotateX(-Math.PI/2);b.add(h,rubber?C.rubber:C.leather,[at[0],at[1]+.009,at[2]]);
 if(rubber){
  for(let row=0;row<10;row++){const x=-.097+row*.020;if(x>-.052&&x<.006)continue;const width=x<-.052?.043:x>.08?.046:.058;for(const s of [-1,1]){const lug=b.box([at[0]+x,at[1]+(x<-.052?.019:.011),at[2]+s*width*.23],[.013,.004,width*.40],C.rubber,.001);lug.translate(-at[0]-x,-at[1]-(x<-.052?.019:.011),-at[2]-s*width*.23);lug.rotateY(s*(row<3?.18:-.30));lug.translate(at[0]+x,at[1]+(x<-.052?.019:.011),at[2]+s*width*.23);}}
  if(iteration>1){for(let row=0;row<7;row++){const x=.008+row*.013;for(const s of [-1,1])b.box([at[0]+x,at[1]+.011,at[2]+s*(x>.08?.021:.03)],[.009,.003,.009],C.rubber,.001);}}
 }
}
function soles(iteration:number){const b=new Build();sole(b,[.33,.001,.012],false,iteration);sole(b,[.6,.001,.012],true,iteration);return {id:'shoe-soles',geometry:b.finish(),family:'plastic'};}
function paper(){return {id:'paper-crumpled',geometry:crumpledPaper(),family:'enamel'};}
export function hardwareModels(iteration=2):Hardware[]{return [retort(),drop(),releases(),wheelStand(iteration),brake(iteration),cable(),soles(iteration),paper()];}
