/** Ogive/cockpit, aerodynamic junctions and twisted turbomachinery lofts. */
import { mkdirSync } from 'node:fs';
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { surface, table, tubePath, writeLofts, type V } from '../kits/aircraft-polish';
import { CG, ENGINE } from './layout';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partsFile } from '../../../src/engines/space-scene/schema';
type J=Record<string,any>;
const tau=2*Math.PI,rad=Math.PI/180;
const joined=(gs:BufferGeometry[])=>{for(const g of gs){g.deleteAttribute('uv');g.deleteAttribute('color');if(!g.index)g.setIndex(Array.from({length:g.getAttribute('position').count},(_,i)=>i));}return mergeGeometries(gs,false)!;};
function capLoft(g:BufferGeometry,n:number,m:number){
 const p=g.getAttribute('position'),caps:BufferGeometry[]=[],centres=[0,n].map(row=>{const c=new Vector3();for(let j=0;j<m;j++)c.add(new Vector3().fromBufferAttribute(p,row*(m+1)+j));return c.divideScalar(m);});
 for(const row of [0,n]){const positions:number[]=[],ix:number[]=[],center=centres[row===0?0:1]!,want=centres[1]!.clone().sub(centres[0]!).multiplyScalar(row?1:-1);
  for(let j=0;j<m;j++)positions.push(p.getX(row*(m+1)+j),p.getY(row*(m+1)+j),p.getZ(row*(m+1)+j));positions.push(...center.toArray());
  for(let j=0;j<m;j++){let a=j,b=(j+1)%m;const va=new Vector3().fromArray(positions,a*3).sub(center),vb=new Vector3().fromArray(positions,b*3).sub(center);if(va.cross(vb).dot(want)<0)[a,b]=[b,a];ix.push(m,a,b);}
  const cap=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setIndex(ix);cap.computeVertexNormals();caps.push(cap);
 }return joined([g,...caps]);
}
// Nose rows [x, side-view radius, centre drop, plan/side width ratio], read from the side
// and top views of the A330-300 three-view (refs/drawing), scaled to the 0.4 m model diameter.
const noseRows=[[-2,0,-.0345,.95],[-1.993,.0184,-.0347,.95],[-1.978,.0361,-.0357,.95],[-1.964,.0477,-.0379,.94],[-1.949,.0588,-.039,.93],[-1.935,.0668,-.0397,.91],[-1.921,.0745,-.0405,.895],[-1.906,.082,-.0405,.875],[-1.892,.0885,-.038,.855],[-1.877,.0985,-.0335,.84],[-1.848,.117,-.0264,.83],[-1.791,.1408,-.0199,.845],[-1.704,.1675,-.0148,.875],[-1.603,.1863,-.0105,.911],[-1.502,.1986,-.0054,.942],[-1.4,.1996,-.0036,.983],[-1.3,.2,-.002,1],[-1.25,.2,0,1]];
// Least-squares fit of those rows in u = sqrt(distance from tip): smooth to second derivative, so the
// skin carries no reflection creases, round at the tip, and flush with the cabin barrel at x = -1.25.
// Centre drop and plan/side width ratio interpolate the same rows directly in x (monotone cubic):
// a fit in u gives them an infinite slope at the tip, which shows as a nub on the cap.
const noseDropRows=[[-2,-.0345],[-1.95,-.039],[-1.906,-.0405],[-1.877,-.0335],[-1.848,-.0264],[-1.791,-.0199],[-1.704,-.0148],[-1.603,-.0105],[-1.502,-.0054],[-1.4,-.0036],[-1.3,-.002],[-1.25,0]];
const noseWidthRows=[[-2,.95],[-1.95,.93],[-1.892,.855],[-1.848,.83],[-1.791,.845],[-1.704,.875],[-1.603,.911],[-1.502,.942],[-1.4,.983],[-1.3,1],[-1.25,1]];
const noseFit=(c:number[],x:number)=>{const u=Math.sqrt(Math.max(0,x+2)/.75);return (1-u)**3*c.reduce((s,k,i)=>s+k*u**i,0);};
const noseRadius=[0.20000,0.40954,1.12440,-7.00872,32.22504,-55.78215,30.60436];
const stations=[[-1.25,.2,0],[.8,.2,0],[1.2,.19,.03],[1.5,.16,.07],[1.75,.11,.10],[1.95,.055,.12],[2.04,0,.125]];
const radiusAt=(x:number)=>x< -1.25?.2-noseFit(noseRadius,x):table(stations,x);
const dropAt=(x:number)=>x< -1.25?table(noseDropRows,x):table(stations,x,2);
const widthAt=(x:number)=>x< -1.25?table(noseWidthRows,x):1;
export function hullPoint(x:number,theta:number,inset=0):V {const r=Math.max(0,radiusAt(x)-inset),b=x>-.78&&x<.74?Math.sin(Math.PI*(x+.78)/1.52)**1.5:0,lower=Math.max(0,-Math.cos(theta))**3;return [x,CG[1]+dropAt(x)+(r+.035*b*lower)*Math.cos(theta),widthAt(x)*(r+.045*b*lower)*Math.sin(theta)];}
function hullNormal(x:number,theta:number):Vector3 {
 if(x<=-2+1e-9)return new Vector3(-1,0,0);if(x>=2.04-1e-9)return new Vector3(1,0,0);
 const h=1e-4,hx=Math.max(1e-8,Math.min(1e-4,(x+2)/2,(2.04-x)/2)),a=new Vector3(...hullPoint(x+hx,theta)),b=new Vector3(...hullPoint(x-hx,theta)),c=new Vector3(...hullPoint(x,theta+h)),d=new Vector3(...hullPoint(x,theta-h));
 return c.sub(d).cross(a.sub(b)).normalize();
}
type P2=[number,number];
type Pane={view:'side'|'front';corners:P2[];radius:number};
// One side of the A330's six-pane layout, sized against the three-view: a sill at 0.046 and a head
// line at 0.088 above the cabin axis, from 0.24 to 0.72 fuselage diameters aft of the tip. Front
// panes are authored as seen from ahead ([z, height]); their top edge is level, so it follows the
// crown. The sliding and aft windows are authored from the side ([x, height]) as near-rectangles:
// the sliding window's front edge runs parallel to the windscreen's rear edge across a thin post,
// and the aft window has one cut top-rear corner. Posts are POST wide between frames.
const SILL=.046,HEAD=.088,POST=.005;
const frontCorners:P2[]=[[.005,HEAD],[.057,HEAD],[.061,SILL],[.005,SILL]];
const sideOfFront=(q:P2):P2=>[frontToHull(q[0],q[1])[0],q[1]];
const slideTop=sideOfFront(frontCorners[1]!)[0]+POST,slideSill=sideOfFront(frontCorners[2]!)[0]+POST,slideAft=-1.777,aftEnd=-1.712;
const paneLayout:Pane[]=[
 {view:'front',corners:frontCorners,radius:.0025},
 {view:'side',corners:[[slideTop,HEAD],[slideAft,HEAD],[slideAft,SILL],[slideSill,SILL]],radius:.0025},
 {view:'side',corners:[[slideAft+POST,HEAD],[aftEnd-.017,HEAD],[aftEnd,HEAD-.017],[aftEnd,SILL],[slideAft+POST,SILL]],radius:.0025},
];
/** A front-view point lies on the hull where the elliptical section reaches it. */
function frontToHull(z:number,y:number):P2 {let lo=-2,hi=-1.4;for(let i=0;i<48;i++){const x=(lo+hi)/2,r=radiusAt(x),h=y-dropAt(x),w=z/widthAt(x);if(h*h+w*w>r*r)lo=x;else hi=x;}const x=(lo+hi)/2;return [x,Math.atan2(z/widthAt(x),y-dropAt(x))];}
const sideToHull=(x:number,y:number):P2=>[x,Math.acos(Math.max(-1,Math.min(1,(y-dropAt(x))/radiusAt(x))))];
const toHull=(view:Pane['view'],q:P2):P2=>view==='front'?frontToHull(q[0],q[1]):sideToHull(q[0],q[1]);
/** Straight edges with small radiused corners, sampled finely enough to follow the skin. */
function outline({corners,radius}:Pane):P2[] {
 const out:P2[]=[],n=corners.length,along=(a:P2,b:P2,d:number):P2=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1]);return [a[0]+(b[0]-a[0])*d/l,a[1]+(b[1]-a[1])*d/l];};
 for(let i=0;i<n;i++){
  const p=corners[(i+n-1)%n]!,c=corners[i]!,q=corners[(i+1)%n]!,lp=Math.hypot(c[0]-p[0],c[1]-p[1]),lq=Math.hypot(q[0]-c[0],q[1]-c[1]),d=Math.min(radius,lp*.45,lq*.45),a=along(c,p,d),b=along(c,q,d);
  for(let k=0;k<=5;k++){const t=k/5,u=1-t;out.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);}
  const end=along(q,c,Math.min(radius,lq*.45,Math.hypot(corners[(i+2)%n]![0]-q[0],corners[(i+2)%n]![1]-q[1])*.45)),steps=Math.max(1,Math.ceil(Math.hypot(end[0]-b[0],end[1]-b[1])/.004));
  for(let k=1;k<steps;k++)out.push([b[0]+(end[0]-b[0])*k/steps,b[1]+(end[1]-b[1])*k/steps]);
 }
 return out;
}
const onHull=(view:Pane['view'],q:P2,side:number,inset:number):V=>{const [x,t]=toHull(view,q),v=hullPoint(x,t,inset);v[2]*=side;return v;};
/** Concentric rings over a convex pane. Shading normals lean to one direction per pane so it reads as a flat sheet, as the real panes are, tipped down so the glass mirrors the dark lower hemisphere rather than the key light. */
function glassPane(pane:Pane,side:number):BufferGeometry {
 const edge=outline(pane),rings=4,n=edge.length,centre=edge.reduce((s,q)=>[s[0]+q[0]/n,s[1]+q[1]/n] as P2,[0,0] as P2),points:P2[]=[centre];
 for(let r=1;r<=rings;r++)for(const q of edge)points.push([centre[0]+(q[0]-centre[0])*r/rings,centre[1]+(q[1]-centre[1])*r/rings]);
 const normalOf=(q:P2)=>{const [x,t]=toHull(pane.view,q),v=hullNormal(x,t);v.z*=side;return v;},mean=points.reduce((s,q)=>s.add(normalOf(q)),new Vector3()).normalize();
 const pos=points.flatMap(q=>onHull(pane.view,q,side,-.0009)),facing=mean.clone().add(new Vector3(0,pane.view==='front'?-1:-.6,0)).normalize(),nor=points.flatMap(()=>facing.toArray()),ix:number[]=[];
 const at=(r:number,j:number)=>1+(r-1)*n+((j%n+n)%n);
 for(let j=0;j<n;j++){ix.push(0,at(1,j),at(1,j+1));for(let r=1;r<rings;r++)ix.push(at(r,j),at(r+1,j),at(r+1,j+1),at(r,j),at(r+1,j+1),at(r,j+1));}
 const a=new Vector3().fromArray(pos,ix[0]!*3),b=new Vector3().fromArray(pos,ix[1]!*3),c=new Vector3().fromArray(pos,ix[2]!*3);
 if(b.sub(a).cross(c.sub(a)).dot(mean)<0)for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2]!,ix[i+1]!];
 return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pos,3)).setAttribute('normal',new Float32BufferAttribute(nor,3)).setIndex(ix);
}
/** A wiper parks along the sill of each front pane: blade, arm and a pivot boss just below the glass. */
function wiper(side:number):BufferGeometry[] {
 const path=(a:P2,b:P2,proud:number,n=14):V[]=>Array.from({length:n+1},(_,i)=>onHull('front',[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n],side,-proud));
 const pivot:P2=[.0115,SILL-.0085],blade=path([.012,SILL+.0032],[.054,SILL+.0032],.0024),arm=path(pivot,[.033,SILL+.0032],.0031);
 const base=new Vector3(...onHull('front',pivot,side,0)),[x,t]=frontToHull(pivot[0],pivot[1]),up=hullNormal(x,t);up.z*=side;
 const axisA=new Vector3().crossVectors(up,new Vector3(1,0,0)).normalize(),axisB=new Vector3().crossVectors(up,axisA);
 const boss=surface(4,12,(u,v)=>{const r=.0013*Math.min(1,(1-u)*2.2),h=.0027*Math.min(1,u*2),a=v*tau;return base.clone().addScaledVector(up,h).addScaledVector(axisA,r*Math.cos(a)).addScaledVector(axisB,r*Math.sin(a)).toArray() as V;},true);
 return [tubePath(blade,.0007,6),tubePath(arm,.0009,6),boss];
}
function nose(){
 const front=96,rear=52,around=96,rowX=(i:number)=>i<=front?-2+.75*(i/front)**2:-1.25+3.29*(i-front)/rear;
 const hull=surface(front+rear,around,(u,v)=>hullPoint(rowX(Math.round(u*(front+rear))),v*tau),true),normal:number[]=[];
 for(let i=0;i<=front+rear;i++)for(let j=0;j<=around;j++)normal.push(...hullNormal(rowX(i),j/around*tau).toArray());
 hull.setAttribute('normal',new Float32BufferAttribute(normal,3));
 const frames:BufferGeometry[]=[],glass:BufferGeometry[]=[],wipers:BufferGeometry[]=[];
 for(const side of [1,-1]){
  for(const pane of paneLayout){
   glass.push(glassPane(pane,side));
   const edge=outline(pane).map(q=>onHull(pane.view,q,side,-.0005));edge.push(edge[0]!);frames.push(tubePath(edge,.0008,6));
  }
  wipers.push(...wiper(side));
 }
 return {hull:joined([hull,...frames]),glass:joined(glass),wipers};
}
/** Closed wing section with finite leading radius and a sharp trailing edge. */
function aero(span0:number,span1:number,side:number,leading:(s:number)=>number,chord:(s:number)=>number,base:(s:number)=>number,ratio:(s:number)=>number,vertical=false,from=0,to=1,samples=16){
 const n=samples,m=64;const g=surface(n,m,(u,v)=>{const s=span0+(span1-span0)*u,a=v*tau,q=(1-Math.cos(a))/2,xc=from+(to-from)*q,c=chord(s);
 const yt=5*ratio(s)*(.2969*Math.sqrt(xc)-.126*xc-.3516*xc*xc+.2843*xc**3-.1036*xc**4)*c;
 const y=(v<=.5?1:-1)*yt;
 return vertical?[leading(s)+xc*c,s,side*y]:[leading(s)+xc*c,base(s)+y,side*s];
 },vertical?side>0:side<0);
 const p=g.getAttribute('position'),caps:BufferGeometry[]=[];
 for(const row of [0,n]){
  const points:number[]=[],ix:number[]=[],center=new Vector3();
  for(let j=0;j<m;j++){const v=new Vector3().fromBufferAttribute(p,row*(m+1)+j);points.push(...v.toArray());center.add(v);}
  center.divideScalar(m);points.push(...center.toArray());
  for(let j=0;j<m;j++){let a=j,b=(j+1)%m;const va=new Vector3().fromArray(points,a*3).sub(center),vb=new Vector3().fromArray(points,b*3).sub(center),want=vertical?new Vector3(0,row?1:-1,0):new Vector3(0,0,(row?1:-1)*side);if(va.cross(vb).dot(want)<0)[a,b]=[b,a];ix.push(m,a,b);}
  const cap=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(points,3)).setIndex(ix);cap.computeVertexNormals();caps.push(cap);
 }
 if(from>0){
  const wall:number[]=[],indices:number[]=[];
  for(let row=0;row<=n;row++)for(const col of [0,m])wall.push(p.getX(row*(m+1)+col),p.getY(row*(m+1)+col),p.getZ(row*(m+1)+col));
  for(let row=0;row<n;row++){const a=row*2,b=a+2;const tri=[a,b,a+1,b,b+1,a+1];for(let j=0;j<6;j+=3){let x=tri[j]!,y=tri[j+1]!,z=tri[j+2]!;const va=new Vector3().fromArray(wall,x*3),vb=new Vector3().fromArray(wall,y*3),vc=new Vector3().fromArray(wall,z*3);if(vb.sub(va).cross(vc.sub(va)).x>0)[y,z]=[z,y];indices.push(x,y,z);}}
  const edge=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(wall,3)).setIndex(indices);edge.computeVertexNormals();caps.push(edge);
 }
 return joined([g,...caps]);
}
export async function polishAircraft(file:J){
 const meshes:{id:string;geometry:BufferGeometry;at:V;finish?:{roughness:number;metalness:number}}[]=[];
 const replace=(id:string,g:BufferGeometry,at:V,material:J,finish?:{roughness:number;metalness:number})=>{
  const part=file.parts.find((p:J)=>p.id===id);delete part.primitive;delete part.extra;delete part.repeat;part.mesh=id;part.material=material;meshes.push({id,geometry:g,at,finish:finish??(material.color==='steel'?{roughness:.3,metalness:.9}:{roughness:.46,metalness:.8})});
 };
 const n=nose();
 replace('fuselage-shell',n.hull,CG,{color:'casing'});
 // Keep the two original 36-window rows, now rounded and seated on the tube.
 // Windows are baked into the shell mesh with dark vertex colour below.
 const win:BufferGeometry[]=[];
 for(const side of [1,-1])for(let k=0;k<36;k++){
  const x=-1.16+k*.064,theta=side*1.394,points:V[]=[];
  for(let j=0;j<=32;j++){const a=j*tau/32,dx=.009*Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.65,dt=.062*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.65;points.push(hullPoint(x+dx,theta+side*dt,-.0008));}
  const positions=points.flat(),idx:number[]=[];const center=hullPoint(x,theta,-.001);positions.push(...center);for(let j=0;j<32;j++)idx.push(...(side===1?[33,j+1,j]:[33,j,j+1]));const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setIndex(idx);g.computeVertexNormals();win.push(g);
 }
 // A separate material slot is unavailable for a named GLB mesh: vertex colour
 // keeps rounded cabin window relief on the selectable fuselage (no decals).
 const paint=(g:BufferGeometry,c:number)=>{g.setAttribute('color',new Float32BufferAttribute(Array.from({length:g.getAttribute('position').count},()=>[c,c,c]).flat(),3));return g;};
 const skin=paint(meshes[0]!.geometry,1);for(const g of win)paint(g,.012);
 for(const g of n.wipers)paint(g,.3);
 meshes[0]!.geometry=mergeGeometries([skin,...win,...n.wipers],false)!;
 replace('cockpit-glazing',n.glass,[-1.83,1.16,0],{color:'powder'},{roughness:.2,metalness:.08});
 const le=(z:number)=>-.62+.53*z,te=(z:number)=>z<=.62?.24:.24+(z-.62)*.32/1.16,cy=(z:number)=>.99+(z-.12)*Math.tan(6*rad);
 for(const side of [1,-1]){
  const id=side===1?'left':'right';
  const c=(z:number)=>te(z)-le(z),ratio=(z:number)=>.12-.035*z;
  const wing=joined([aero(.12,.3,side,le,c,cy,ratio,false,0,.78,4),aero(.3,1.62,side,le,c,cy,ratio,false,.075,.78),aero(1.62,1.7,side,le,c,cy,ratio,false,0,.78,3)]);
  replace('slat-'+id,aero(.3,1.62,side,le,c,cy,ratio,false,0,.071),[-.1,1.05,side*.96],{color:'casing',tint:'token:neutral'});
  // Gently rounded wing-root cuff overlaps only the intentional skin seam.
  const fillet=surface(44,22,(u,v)=>{const z=.13+v*.18,c=te(z)-le(z),x=le(z)+u*.78*c,q=u*.78,h=5*(.12-.035*z)*(.2969*Math.sqrt(q)-.126*q-.3516*q*q+.2843*q**3-.1036*q**4)*c,w=(1-v)**3*Math.sin(Math.PI*u)**1.5;return[x,cy(z)+Math.max(0,h)+.018*w,side*z];},side===1);
  const fairings=[.36,.65,.90].map(z=>capLoft(surface(16,32,(u,v)=>{const a=v*tau,r=Math.sin(Math.PI*u)**.6;return[le(z)+.78*(te(z)-le(z))-.06+u*((te(z)-le(z))*.22+.16),cy(z)-.018+.018*r*Math.cos(a),side*z+.013*r*Math.sin(a)];},true),16,32));
  replace('wing-'+id,joined([wing,fillet,...fairings]),[0,1,side*.8],{color:'casing'});
  // Match the airfoil thickness at the retained 78% hinge. The flap/aileron
  // IDs and world-space pose pivots remain exactly as authored.
  for(const [prefix,z0,z1]of [['aileron',1,1.7],['flap',.22,.98]] as const){
   replace(prefix+'-'+id,aero(z0,z1,side,le,z=>te(z)-le(z),cy,z=>.12-.035*z,false,.788,1),[0,1,side*(z0+z1)/2],{color:'casing',tint:'token:neutral'});
  }
  const tip=surface(32,64,(u,v)=>{const a=v*tau,q=(1-Math.cos(a))/2,z=1.68+.12*Math.sin(u*Math.PI/2),y=cy(1.68)+.18*(1-Math.cos(u*Math.PI/2)),c=.20*(1-u)+.068*u,x=.31+.145*u+q*c,t=.011*(1-.65*u)*Math.sin(Math.PI*q)*(v<.5?1:-1);return[x,y+t*Math.cos(u*Math.PI/2),side*(z-t*Math.sin(u*Math.PI/2))];},side<0);
  replace('wing-tip-'+id,capLoft(tip,32,64),[.42,1.22,side*1.74],{color:'casing'});
  const tLE=(z:number)=>1.42+.649*z,tC=(z:number)=>.42-.26/.7*z,tY=(z:number)=>1.155+z*Math.tan(6*rad);
  replace('tailplane-'+id,aero(.04,.7,side,tLE,tC,tY,z=>.1-.04*z/.7,false,0,.72),[1.65,1.18,side*.35],{color:'casing'});
  replace('elevator-'+id,aero(.09,.68,side,tLE,tC,tY,z=>.1-.04*z/.7,false,.727,1),[1.85,1.18,side*.35],{color:'casing',tint:'token:neutral'});
 }
 const fLE=(y:number)=>1.3+(y-1.25)*Math.tan(38*rad),fC=(y:number)=>.66+(y-1.25)/.63*(.25-.66);
 replace('fin',aero(1.25,1.88,1,fLE,fC,()=>0,y=>.11-.04*(y-1.25)/.63,true,0,.7),[1.6,1.5,0],{color:'casing'});
 replace('rudder',aero(1.31,1.85,1,fLE,fC,()=>0,y=>.11-.04*(y-1.25)/.63,true,.707,1),[1.8,1.6,0],{color:'casing',tint:'token:neutral'});
 // Blade-only OGVs: a fan primitive's solid hub would plug the core path.
 // Six annular guide vanes join the core cowl to the fan case instead.
 const engineShell=file.parts.find((p:J)=>p.id==='engine-shell'),shellAt=engineShell.primitive.at as V;
 const shellPart=partsFile.parse({parts:[{...engineShell,group:undefined,context:true,connects:undefined}],groups:[],flows:[],animations:[]}).parts[0]!;
 const shellGeometry=partPieces(shellPart).flatMap(q=>(q.matrices??[null]).map(m=>{const g=q.geometry.clone();if(m)g.applyMatrix4(m);return g.translate(...shellAt);}));
 const guides=Array.from({length:6},(_,k)=>capLoft(surface(12,24,(u,v)=>{
  const a=v*tau,q=(1-Math.cos(a))/2,r=.202+(.3404-.202)*u,stagger=(22-12*u)*rad,ch=.05*(.8+.2*u),along=(q-.5)*ch,camber=.004*Math.sin(Math.PI*q),thick=.0024*Math.sin(Math.PI*q)*(v<.5?1:-1),x=-.42+along*Math.cos(stagger)-(camber+thick)*Math.sin(stagger),t=along*Math.sin(stagger)+(camber+thick)*Math.cos(stagger),angle=k*tau/6+.08*u*u;
  return[x,ENGINE[1]+r*Math.cos(angle)-t*Math.sin(angle),ENGINE[2]+r*Math.sin(angle)+t*Math.cos(angle)];
 },true),12,24));
 replace('engine-shell',joined([...shellGeometry,...guides]),shellAt,{color:'casing'});
 // Replace rectangular stage plates with curved airfoils. Stage count, 24
 // blades per row and axial centre are inherited from authored teaching data.
 for(const id of ['compressor-bank','compressor-rotor','turbine-bank','hp-turbine-rotor','lp-turbine-rotor']){
  const part=file.parts.find((p:J)=>p.id===id),rows=part.extra,blades:BufferGeometry[]=[],at=part.primitive.at as V;
  for(const row of rows){const chord=row.size[0],height=row.size[1],mid=row.at[1]-ENGINE[1],r0=mid-height/2,r1=mid+height/2,hot=id.includes('turbine');
   for(let k=0;k<24;k++){
    const blade=surface(8,24,(u,v)=>{const a=v*tau,q=(1-Math.cos(a))/2,r=r0+(r1-r0)*u,stagger=(row.rotation[1]+(hot?8:14)*(u-.5))*rad,c=chord*(1-.18*u),camber=(hot?.13:.065)*Math.sin(Math.PI*q)*c,thick=.085*c*Math.sin(Math.PI*q)*(v<.5?1:-1),t=(q-.5)*c,tx=t*Math.cos(stagger)-(camber+thick)*Math.sin(stagger),tz=t*Math.sin(stagger)+(camber+thick)*Math.cos(stagger),angle=k*tau/24+(hot?.08:.04)*u*u;return[row.at[0]+tx,ENGINE[1]+r*Math.cos(angle)-tz*Math.sin(angle),ENGINE[2]+r*Math.sin(angle)+tz*Math.cos(angle)];},true);
    blades.push(capLoft(blade,8,24));
   }
  }
  replace(id,joined(blades),at,{color:id.endsWith('bank')?'casing':'steel'});
 }
 // Smooth cross-section profiles in existing nacelles and hot/cold nozzles.
 for(const p of file.parts){if(!p.id.startsWith('nacelle-'))continue;
  p.primitive.segments=96;p.extra[1].segments=64;
  const side=p.primitive.at[2]>0?1:-1,at=p.primitive.at as V;
  p.extra.shift();
  p.extra.push({kind:'lathe',profile:[[.092,-.219],[.098,-.222],[.103,-.215],[.097,-.208],[.092,-.219]],segments:96,at,rotation:[0,0,-90],color:'steel'});
  const parsed=partsFile.parse({parts:[{...p,group:undefined,context:true,connects:undefined}],groups:[],flows:[],animations:[]}).parts[0]!;
  const casings=partPieces(parsed).flatMap(q=>(q.matrices??[null]).map(m=>{const g=q.geometry.clone();if(m)g.applyMatrix4(m);g.translate(...at);return g;}));
  const pylon=aero(.935,1.025,1,y=>-.65+.30*(y-.935)/.09,y=>.32+.11*(y-.935)/.09,()=>0,()=>.10,true).translate(0,0,side*.6);
  replace(p.id,joined([...casings,pylon]),at,{color:'casing'});

 }
 mkdirSync('public/models',{recursive:true});await writeLofts('public/models/how-planes-fly-polish.glb',meshes);file.model='/models/how-planes-fly-polish.glb';
}
