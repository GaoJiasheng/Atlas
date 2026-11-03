/** Original epiphyseal cartilage and cortical renewal surfaces, CC BY-SA 4.0.
 * Qualitative enlarged histological relief; no scan or borrowed geometry. */
import {BufferAttribute,BufferGeometry} from 'three';
const make=()=>({p:[],i:[]});
function surface(g,nu,nv,point,reverse=false){
 const start=g.p.length/3;
 for(let u=0;u<=nu;u++)for(let v=0;v<=nv;v++)g.p.push(...point(u/nu,v/nv));
 for(let u=0;u<nu;u++)for(let v=0;v<nv;v++){
  const a=start+u*(nv+1)+v,b=a+nv+1;
  g.i.push(...(reverse?[a,b+1,b,a,a+1,b+1]:[a,b,b+1,a,b+1,a+1]));
 }
}
function finish(g){const b=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(g.p),3)).setIndex(g.i);b.computeVertexNormals();return b;}
const sq=x=>x*x;
export function growthDisc(){
 const g=make(),root=Math.SQRT1_2,front=.0018,h=.0037;
 const xyz=(a,n,z)=>[-.040+root*(a-n),.202+root*(a+n),z];
 // Find the actual neck boundary on each cartilage-zone plane. This trims
 // the disc to the femoral envelope, including its asymmetric posterior rim.
 const ranges=new Map();
 function range(n){
  if(ranges.has(n))return ranges.get(n);
  const inside=a=>outerDistance(...xyz(a,n,front))<.00010;
  const bisect=(lo,hi,left)=>{for(let i=0;i<30;i++){const m=(lo+hi)/2;if(inside(m)===left)hi=m;else lo=m;}return (lo+hi)/2;};
  const result=[bisect(-.055,0,true),bisect(0,.055,false)];ranges.set(n,result);return result;
 }
 function position(u,n,v){
  const [l,r]=range(n),a=l+(r-l)*u;
  let lo=-.065,hi=front;
  for(let i=0;i<28;i++){const m=(lo+hi)/2;if(outerDistance(...xyz(a,n,m))>.00010)lo=m;else hi=m;}
  const back=(lo+hi)/2,z=front+(back-front)*v;
  return xyz(a,n,z);
 }
 for(const side of [-1,1])surface(g,56,16,(u,v)=>{
  const p=position(u,side*h,v),dome=.0005*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  p[0]-=root*side*dome;p[1]+=root*side*dome;return p;
 },side===-1);
 // Staggered proliferative cell columns enlarge towards the metaphysis.
 // Cells are relief in a continuous cartilage matrix, not detached balls.
 surface(g,96,16,(u,v)=>{
  const p=position(u,(2*v-1)*h,0);let relief=0;
  for(let j=0;j<27;j++){
   const c=(j+.5)/27+.003*Math.sin(j*2.31),du=u-c;
   for(let row=0;row<4;row++){
    const vv=.15+row*.225+.025*Math.sin(j*1.71+row);
    relief+=.00038*Math.exp(-sq(du/(.010+(3-row)*.002))-sq((v-vv)/(.063+(3-row)*.009)));
   }
  }
  p[2]+=relief*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);return p;
 });
 surface(g,56,4,(u,v)=>position(u,(2*v-1)*h,1),true);
 for(const u of [0,1])surface(g,4,16,(v,w)=>position(u,(2*v-1)*h,w),u===1);
 return finish(g);
}
// Exact not-a-knot spline coefficients from cortex-mesh.py (SciPy CubicSpline).
const knots=[-0.202, -0.15, -0.07, 0.02, 0.1, 0.16, 0.181];
const coefficients=[[[1.885535872056826, 1.8855358720568056, -0.21661856359147663, 6.064154094054322, -21.129028522820736, -21.129028522820484], [-0.2813791598990153, 0.012764436141850438, 0.46529304543548433, 0.4068060332657859, 1.8622030158388292, -1.9410221182689034], [-0.08662061883713898, -0.1005885844725116, -0.062343985946324856, 0.016144931136789453, 0.1976656550651582, 0.19293650891935374], [0.002, -0.003, -0.01, -0.012, -0.005, 0.009]], [[0.4453701241138548, 0.44537012411384963, 2.262473586181738, -0.5279949433218182, -10.77986911442215, -10.779869114422134], [-0.16936069024953682, -0.09988295088777514, 0.007005878899548318, 0.6178737471686178, 0.4911549607713823, -1.4492214798246037], [-0.030859063384166396, -0.044859732723306636, -0.052289898482364754, 0.0039492678637702, 0.09267156449897014, 0.035187573355776824], [0.0, -0.002, -0.006, -0.009, -0.005, 0.0]], [[-4.12933994125702, -4.1293399412570215, -0.13052084469093006, 6.254135458373086, -20.652987864636568, -20.652987864636565], [1.6412088056015484, 0.9970317747654523, 0.005990188863767649, -0.029250439202783474, 1.471742070806759, -2.2457957448278227], [-0.22802327653627535, -0.09083476635719125, -0.010593009266853675, -0.012686431797365099, 0.10271289873095281, 0.05626967828968898], [0.032, 0.024, 0.021, 0.02, 0.022, 0.029]]];
function shaft(y){let i=0;while(i<knots.length-2&&y>knots[i+1])i++;const t=y-knots[i];return coefficients.map(c=>((c[0][i]*t+c[1][i])*t+c[2][i])*t+c[3][i]);}
function outerDistance(x,y,z){
 const yc=Math.max(-.202,Math.min(.181,y)),[cx,cz,r]=shaft(yc);
 let value=(Math.sqrt(sq((x-cx)/r)+sq((z-cz)/(r*.84))+sq((y-yc)/r))-1)*r;
 const ellipsoids=[[[ -.005,.174,0],[.026,.026,.020]],[[-.027,.196,-.002],[.023,.022,.019]],
 [[-.054,.218,-.003],[.032,.031,.028]],[[.030,.187,-.004],[.027,.032,.023]],
 [[-.013,.135,-.013],[.014,.018,.013]],[[-.023,-.226,-.002],[.031,.031,.027]],[[.024,-.225,-.002],[.029,.030,.027]]];
 for(const [c,r] of ellipsoids){const q=[x,y,z].map((v,i)=>(v-c[i])/r[i]);const k0=Math.hypot(...q),k1=Math.hypot(...q.map((v,i)=>v/r[i]));
  const b=k0*(k0-1)/Math.max(k1,1e-10),h=Math.max(.005-Math.abs(value-b),0)/.005;value=Math.min(value,b)-h*h*.005*.25;
 }return value;
}
export function remodelRegion(){
 const g=make();
 const point=(u,v,bottom=false)=>{
  const y=-.020+.092*u,[cx,cz,r]=shaft(y);
  const edge=Math.pow(Math.sin(Math.PI*u),.68)*(1+.10*Math.sin(19*u)+.055*Math.sin(41*u));
  const width=.006*edge,t=v/.43;
  let x,z;
  if(v<=.43){x=cx+r-width*(1-t);z=cz+.001;}
  else {const angle=(v-.43)/.57*.98*edge;x=cx+r*Math.cos(angle);z=cz-r*.84*Math.sin(angle)+.001;}
  // Irregular overlapping woven-bone islands, shallow resorption pits and
  // deposition ridges fade smoothly into the existing cortex at the border.
  // Round 3: about 1.7x the round-2 relief so the coarse new bone reads at
  // its beat camera against the smooth lamellar cortex (still qualitative).
  let texture=.00009*Math.sin(1730*y+4*Math.sin(v*13))+.00012*Math.sin(71*v+233*y);
  for(let j=0;j<11;j++){
   const a=.075+j*.082+.016*Math.sin(j*3),b=.21+.52*(.5+.5*Math.sin(j*2.3));
   const q=Math.sqrt(sq((u-a)/(.039+.009*Math.sin(j)))+sq((v-b)/(.12+.02*Math.cos(j))));
   texture+=.00098*Math.exp(-sq((q-.75)/.17))-.00048*Math.exp(-sq(q/.28));
  }
  const blend=Math.pow(Math.sin(Math.PI*u)*Math.sin(Math.PI*v),.7);
  const angle=v>.43?(v-.43)/.57*.98*edge:0;
  // Round 3: on the curved outer cortex the relief rises along the outward
  // normal (it was tangential, leaving the region inside the cortex mesh),
  // turning from the cut-face normal over the lip; a small extra lift keeps
  // the new bone proud of the cortex surface, which the spline undershoots.
  const w=Math.min(1,angle/.12),lift=bottom?0:.0011*w*Math.pow(Math.sin(Math.PI*u),.5);
  const height=bottom?-.00022:(.00075+texture)*blend+.00025+lift;
  let nx=w*Math.cos(angle),nz=(1-w)-w*Math.sin(angle)/.84;const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
  x+=height*nx;z+=height*nz;
  return [x,y,z];
 };
 surface(g,96,28,(u,v)=>point(u,v),true);
 surface(g,56,16,(u,v)=>point(u,v,true));
 for(const v of [0,1])surface(g,112,1,(u,t)=>{const a=point(u,v),b=point(u,v,true);return a.map((x,k)=>x+(b[k]-x)*t);},v===0);
 for(const u of [0,1])surface(g,32,1,(v,t)=>{const a=point(u,v),b=point(u,v,true);return a.map((x,k)=>x+(b[k]-x)*t);},u===1);
 return finish(g);
}
export function appendRound2(owned,append){
 for(const [id,name,geometry,tint] of [['growth-plate','polished-growth-disc',growthDisc(),'token:cold'],['remodel-patch','polished-remodel-region',remodelRegion(),'token:hot']]){
  append(name,geometry,[2,0,0]);const p=owned.parts.find(p=>p.id===id);
  p.mesh=name;p.material={color:'tissue',tint};delete p.primitive;delete p.extra;
 }
 for(const id of ['clot','soft'])owned.parts.find(p=>p.id===`repair-${id}-skin`).displayWith=`repair-stage-${id}`;
}
