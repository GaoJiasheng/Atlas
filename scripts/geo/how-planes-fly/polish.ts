/** Ogive/cockpit, aerodynamic junctions and twisted turbomachinery lofts. */
import { mkdirSync } from 'node:fs';
import { BufferGeometry, Float32BufferAttribute, Shape, Path, ShapeGeometry, Vector3 } from 'three';
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
const stations=[[-2,0,-.035],[-1.985,.037,-.034],[-1.95,.069,-.030],[-1.9,.100,-.021],[-1.8,.145,-.009],[-1.67,.176,-.002],[-1.48,.195,0],[-1.25,.2,0],[.8,.2,0],[1.2,.19,.03],[1.5,.16,.07],[1.75,.11,.10],[1.95,.055,.12],[2.04,0,.125]];
export function hullPoint(x:number,theta:number,inset=0):V {const noseT=Math.max(0,Math.min(1,(x+2)/.05)),radius=x< -1.95?.069*Math.sqrt(noseT)*(1-.061*noseT)/.939:table(stations,x),r=Math.max(0,radius-inset),dy=table(stations,x,2),b=x>-.78&&x<.74?Math.sin(Math.PI*(x+.78)/1.52)**1.5:0,lower=Math.max(0,-Math.cos(theta))**3;return [x,CG[1]+dy+(r+.035*b*lower)*Math.cos(theta),(r+.045*b*lower)*Math.sin(theta)];}
// Three distinct panes each side, specified in the unwrapped curved skin.
const panes=[
 [[-1.83,.035],[-1.67,.80],[-1.765,1.10],[-1.89,.05]],
 [[-1.65,.83],[-1.55,.92],[-1.57,1.17],[-1.75,1.10]],
 [[-1.53,.94],[-1.41,.97],[-1.43,1.17],[-1.55,1.17]],
];
/** Subdivide in skin coordinates before mapping, so glazing and apertures
 * follow identical curvature. Boundary subdivision is shared, avoiding cracks. */
function mapped(shape:Shape,side:number,inset:number){
 const source=new ShapeGeometry(shape),p=source.getAttribute('position'),ix=source.index!,pos:number[]=[],indices:number[]=[];
 const add=(a:number[],b:number[],c:number[],level:number)=>{
  if(level){const ab=a.map((x,i)=>(x+b[i]!)/2),bc=b.map((x,i)=>(x+c[i]!)/2),ca=c.map((x,i)=>(x+a[i]!)/2);add(a,ab,ca,level-1);add(ab,b,bc,level-1);add(ca,bc,c,level-1);add(ab,bc,ca,level-1);return;}
  const offset=pos.length/3;for(const q of [a,b,c]){const v=hullPoint(q[0]!,q[1]!,inset);v[2]*=side;pos.push(...v);}indices.push(...(side===1?[offset,offset+2,offset+1]:[offset,offset+1,offset+2]));
 };
 for(let i=0;i<ix.count;i+=3)add(...[0,1,2].map(k=>[p.getX(ix.getX(i+k)),p.getY(ix.getX(i+k))]) as [number[],number[],number[]],4);
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pos,3)).setIndex(indices);g.computeVertexNormals();
 // Analytic hull normals remove triangulation seams across the shaped apertures.
 const normal:number[]=[];for(let i=0;i<pos.length;i+=3){const x=pos[i]!,y=pos[i+1]!-CG[1]-table(stations,x,2),z=pos[i+2]!,theta=Math.atan2(z,y),a=new Vector3(...hullPoint(Math.min(2.039,x+.00001),theta)),b=new Vector3(...hullPoint(Math.max(-1.99999,x-.00001),theta)),t=new Vector3(0,-Math.sin(theta),Math.cos(theta));normal.push(...(x< -1.9999?[-1,0,0]:x>2.0399?[1,0,0]:t.cross(a.sub(b)).normalize().toArray()));}g.setAttribute('normal',new Float32BufferAttribute(normal,3));return g;
}
function nose(){const skin:BufferGeometry[]=[],glass:BufferGeometry[]=[],frames:BufferGeometry[]=[];
 for(const side of [1,-1]){
  const shape=new Shape();shape.moveTo(-2,0);for(const [x]of stations.slice(1))shape.lineTo(x!,0);shape.lineTo(2.04,Math.PI);for(const [x]of [...stations].reverse().slice(1))shape.lineTo(x!,Math.PI);shape.closePath();
  for(const poly of panes){const hole=new Path();hole.moveTo(...poly[0] as [number,number]);for(const q of poly.slice(1))hole.lineTo(...q as [number,number]);hole.closePath();shape.holes.push(hole);
   const pane=new Shape();pane.moveTo(...poly[0] as [number,number]);for(const q of poly.slice(1))pane.lineTo(...q as [number,number]);pane.closePath();glass.push(mapped(pane,side,.0012));
   // Close each recessed pocket behind its separate dark glass. This keeps
   // the opaque fuselage a closed volume for the existing stencil cutaway.
   skin.push(mapped(pane,side,.0024));
   const pocket:number[]=[],pi:number[]=[],mean=poly.reduce((sum,q)=>[sum[0]!+q[0]!,sum[1]!+q[1]!],[0,0]).map(x=>x/poly.length),target=new Vector3(...hullPoint(mean[0]!,mean[1]!,.0012));target.z*=side;
   for(let k=0;k<poly.length;k++)for(let j=0;j<16;j++){
    const a=poly[k]!,b=poly[(k+1)%poly.length]!,point=(t:number,d:number)=>{const q=hullPoint(a[0]!*(1-t)+b[0]!*t,a[1]!*(1-t)+b[1]!*t,d);q[2]*=side;return new Vector3(...q);},points=[point(j/16,0),point((j+1)/16,0),point((j+1)/16,.0024),point(j/16,.0024)],off=pocket.length/3;
    for(const v of points)pocket.push(...v.toArray());
    const toward=target.clone().sub(points[0]!),normal=points[1]!.clone().sub(points[0]!).cross(points[2]!.clone().sub(points[0]!));pi.push(...(normal.dot(toward)>0?[off,off+1,off+2,off,off+2,off+3]:[off,off+2,off+1,off,off+3,off+2]));
   }
   const reveal=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pocket,3)).setIndex(pi);reveal.computeVertexNormals();skin.push(reveal);
   const edge:V[]=[];for(let k=0;k<poly.length;k++)for(let j=0;j<12;j++){const a=poly[k]!,b=poly[(k+1)%poly.length]!,t=j/12,v=hullPoint(a[0]!*(1-t)+b[0]!*t,a[1]!*(1-t)+b[1]!*t,-.0004);v[2]*=side;edge.push(v);}edge.push(edge[0]!);frames.push(tubePath(edge,.0011,8));
  }skin.push(mapped(shape,side,0));
 }

 return {hull:joined([...skin,...frames]),glass:joined(glass)};
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
 meshes[0]!.geometry=mergeGeometries([skin,...win],false)!;
 replace('cockpit-glazing',n.glass,[-1.68,1.2,0],{color:'powder'},{roughness:.14,metalness:.08});
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
