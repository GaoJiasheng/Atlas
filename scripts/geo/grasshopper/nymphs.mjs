/** Juvenile cuticular sculpture in the six existing growth-stage envelopes. */
import {SphereGeometry,Vector3,CatmullRomCurve3,Euler,BufferGeometry,Float32BufferAttribute,Mesh,MeshBasicMaterial,Raycaster,DoubleSide} from 'three';
import {Relief,V,arr,mix,worldPath,along,tarsus} from '../kits/insect-relief.mjs';
const tau=2*Math.PI;
function shell(m,at,size,color,shape=(p)=>p){const g=new SphereGeometry(1,48,32),p=g.getAttribute('position');for(let i=0;i<p.count;i++){const q=shape(new Vector3().fromBufferAttribute(p,i));p.setXYZ(i,q.x*size[0]+at[0],q.y*size[1]+at[1],q.z*size[2]+at[2]);}g.computeVertexNormals();return m.add(g,color);}
export function nymph(p,stage){
 const all=[p.primitive,...p.extra],m=new Relief(),H=all[0].at,scale=H[1]/.594,R=Math.max(...all[0].radius),green='f-elastic';m.specimen=true;
 // Frons, vertex and gena are one continuous asymmetric capsule, with a
 // gently flattened facial plane and a deeper posterior head vault.
 const headSkin=shell(m,H,[R*.62,R,R*.67],green,q=>{q.x=q.x*(.93+.07*q.y)-.40*q.y;const plane=-.82-.40*q.y;q.x=(q.x+plane+Math.sqrt((q.x-plane)**2+.0064))*.5;q.y+=.025*q.z*(1-q.y*q.y);return q;});
 const proxy=new Mesh(headSkin,new MeshBasicMaterial({side:DoubleSide})),ray=new Raycaster(),headSurfaces=[proxy];proxy.updateMatrixWorld();
 const onHead=(x,y,side)=>{let xx=x,yy=y;for(let i=0;i<12;i++){ray.set(new Vector3(xx,yy,H[2]+side*R*2),new Vector3(0,0,-side));const hit=ray.intersectObjects(headSurfaces,false)[0];if(hit)return hit.point;xx=H[0]+(xx-H[0])*.97;yy=H[1]+(yy-H[1])*.97;}throw Error('Nymph eye footprint missed head');};
 const front=H[0]-R*.57;
 const onFront=(y,z)=>{ray.set(new Vector3(H[0]-R*2,y,z),new Vector3(1,0,0));const hit=ray.intersectObjects(headSurfaces,false)[0];if(!hit)throw Error('Nymph frontal detail missed skin');return hit;};
 // A shallow clypeal shield follows the sloping frons, not a projecting egg.
 const platePositions=[],plateIndices=[],PN=16,PM=48;
 for(let i=0;i<=PN;i++)for(let j=0;j<=PM;j++){const u=i/PN,a=j/PM*tau,y=H[1]-.62*R+R*.20*u*Math.cos(a),z=H[2]+R*.32*u*Math.sin(a),skin=onFront(y,z).point;platePositions.push(skin.x+R*.006-R*.04*Math.sqrt(1-u*u),skin.y,skin.z);}
 for(let i=0;i<PN;i++)for(let j=0;j<PM;j++){const a=i*(PM+1)+j,b=a+PM+1;plateIndices.push(a,a+1,b,b,a+1,b+1);}
 const clypeus=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(platePositions,3)).setIndex(plateIndices);clypeus.computeVertexNormals();m.add(clypeus,green);
 const plateProxy=new Mesh(clypeus,proxy.material);plateProxy.updateMatrixWorld();headSurfaces.push(plateProxy);
 for(const s of [-1,1]){
  const eye=all[s===1?1:2],a=eye.at;
  // A convex elliptical dome seated on the actual head at every perimeter
  // point, rather than a globe whose upper edge floats clear of the skull.
  const vertices=[],indices=[],NE=18,ME=64,edge=[];
  for(let i=0;i<=NE;i++)for(let j=0;j<=ME;j++){const u=i/NE,t=j/ME*tau,x=a[0]+R*.235*u*Math.cos(t),y=a[1]+R*.40*u*Math.sin(t),skin=onHead(x,y,s),depth=R*.15*Math.pow(Math.max(0,1-u*u),.65);vertices.push(skin.x,skin.y,skin.z+s*(depth-.0002*scale));if(i===NE)edge.push([skin.x,skin.y,skin.z-s*R*.003]);}
  for(let i=0;i<NE;i++)for(let j=0;j<ME;j++){const a=i*(ME+1)+j,b=a+ME+1;indices.push(...(s>0?[a,b,a+1,b,b+1,a+1]:[a,a+1,b,b,a+1,b+1]));}
  const eyeDome=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3)).setIndex(indices);eyeDome.computeVertexNormals();m.add(eyeDome,'ink');m.loft(edge,Array(edge.length).fill(R*.010),green,{radial:10,steps:64});
  const jaw=onFront(H[1]-.66*R,H[2]+s*.22*R).point;
  m.loft([[jaw.x+R*.03,jaw.y,jaw.z],[jaw.x-R*.06,jaw.y-R*.06,jaw.z-s*R*.02],[jaw.x-R*.10,jaw.y-R*.18,jaw.z-s*R*.08],[jaw.x-R*.05,jaw.y-R*.24,jaw.z-s*R*.11]],[R*.07,R*.095,R*.07,R*.015],'en-potential',{radial:18,steps:20,flat:.65});
  const crest=new CatmullRomCurve3([[front,H[1]+R*.16,H[2]],[front-R*.02,H[1]-R*.20,H[2]],[front+R*.02,H[1]-R*.46,H[2]]].map(V));
  const seated=Array.from({length:17},(_,i)=>{const a=crest.getPoint(i/16),q=onHead(a.x,a.y,s);return [q.x,q.y,q.z-s*R*.009];});
  m.loft(seated,[R*.012,R*.013,R*.005],green,{radial:8,steps:16});
 }
 // The accepted adult's frontal triad: one median and two lateral ocelli.
 // These are shallow corneal domes seated on the actual cranial/clypeal skin.
 for(const [dy,dz]of [[-.335,0],[.503,.216],[.503,-.216]]){
  ray.set(new Vector3(H[0]-R*2,H[1]+dy*R,H[2]+dz*R),new Vector3(1,0,0));
  const hit=ray.intersectObjects(headSurfaces,false)[0];if(!hit)throw Error('Nymph ocellus missed cranial skin');
  const n=(hit.normal??hit.face.normal).clone().normalize(),u=new Vector3(0,1,0).cross(n).normalize(),v=n.clone().cross(u).normalize(),c=hit.point.clone().addScaledVector(n,-R*.002),positions=[],indices=[],rows=6,columns=24;
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){const r=i/rows,a=j/columns*tau;positions.push(...c.clone().addScaledVector(u,R*.032*r*Math.cos(a)).addScaledVector(v,R*.032*r*Math.sin(a)).addScaledVector(n,R*.012*Math.sqrt(1-r*r)).toArray());}
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){const a=i*(columns+1)+j,b=a+columns+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setIndex(indices);g.computeVertexNormals();m.add(g,'ink');
 }
 proxy.material.dispose();
 // Retain the pronotum's saddle outline, refining both carinae and sulci.
 const pr=structuredClone(all[3]);pr.radial=48;pr.segments=48;pr.tint='token:f-elastic';
 const path=worldPath(pr),pc=new CatmullRomCurve3(path.map(V));
 const pp=[],pi=[],NX=36,NA=56;
 for(let i=0;i<=NX;i++){const t=i/NX,c=pc.getPoint(t),r=pr.radius[0]*(1-t)+pr.radius[2]*t;
  for(let j=0;j<=NA;j++){const a=-1.78+j/NA*3.56,carina=.018*Math.exp(-((a/.08)**2))+.012*Math.exp(-(((Math.abs(a)-1.05)/.07)**2)),sulci=.025*(Math.exp(-(((t-.30)/.024)**2))+Math.exp(-(((t-.63)/.026)**2))),rr=r*(1+carina-sulci),y=Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.74*rr,z=Math.sin(a)*rr*(.87+.13*t);pp.push(c.x+.025*R*Math.sin(a)**2*(1-t),c.y+y,c.z+z);}
 }
 for(let i=0;i<NX;i++)for(let j=0;j<NA;j++){const a=i*(NA+1)+j,b=a+NA+1;pi.push(a,a+1,b,b,a+1,b+1);}
 const saddle=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pp,3)).setIndex(pi);saddle.computeVertexNormals();m.add(saddle,green);
 // Two thoracic pairs, just behind the anterior thoracic plates. Closed
 // spiracular valves sit partly within the cuticle, rather than float off it.
 for(const t of [.68,.92])for(const side of [-1,1]){const c=pc.getPoint(t),r=pr.radius[0]*(1-t)+pr.radius[2]*t,sulcus=.025*(Math.exp(-(((t-.30)/.024)**2))+Math.exp(-(((t-.63)/.026)**2))),z=r*(1-sulcus)*(.87+.13*t);shell(m,[c.x+.025*R*(1-t),c.y,c.z+side*(z-R*.003)],[R*.018,R*.012,R*.005],'ink-3');}

 shell(m,pc.getPoint(.5).toArray(),[(path.at(-1)[0]-path[0][0])*.58,pr.radius[1]*.86,pr.radius[1]*.86],green);
 // Tergites and sternites meet at a flexible lateral membrane. Nine overlapping
 // unequal segments replace the uniform turned abdomen, retaining its taper.
 const ap=all[4],curve=new CatmullRomCurve3(worldPath(ap).map(V));
 const radius=t=>{const x=t*(ap.radius.length-1),i=Math.min(ap.radius.length-2,Math.floor(x)),f=x-i;return ap.radius[i]*(1-f)+ap.radius[i+1]*f;};
 const rings=9,N=8,M=48;
 for(let k=0;k<rings;k++){
  const vertices=[],indices=[],start=k/rings,end=(k+1.035)/rings;
  for(let i=0;i<=N;i++){const u=i/N,t=Math.min(.9995,start+(end-start)*u),c=curve.getPoint(t),r=radius(t)*(.97+.07*Math.sin(u*Math.PI)-.025*u),tan=curve.getTangent(t).normalize(),up=new Vector3(0,0,1),vertical=up.clone().cross(tan).normalize();
   for(let j=0;j<=M;j++){const a=j/M*tau,flank=.85*(1+.016*Math.sin(k*3+j*.15));vertices.push(...c.clone().addScaledVector(up,Math.sin(a)*r*flank).addScaledVector(vertical,Math.cos(a)*r).toArray());}
  }
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,a+1,b,a+1,b+1,b);}
  const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3)).setIndex(indices);g.computeVertexNormals();m.add(g,green);
  if(k<8)for(const s of [-1,1]){const u=.35,t=(k+u)/rings,c=curve.getPoint(t),r=radius(t)*(.97+.07*Math.sin(u*Math.PI)-.025*u),a=s>0?Math.acos(.10):tau-Math.acos(.10),flank=.85*(1+.016*Math.sin(k*3+a/tau*M*.15)),vertical=new Vector3(0,0,1).cross(curve.getTangent(t).normalize()).normalize(),q=c.addScaledVector(vertical,Math.cos(a)*r).add(new Vector3(0,0,Math.sin(a)*r*flank-s*R*.004));shell(m,q.toArray(),[R*.025,R*.014,R*.008],'ink-3');}
 }
 const tip=curve.getPoint(1),tr=radius(1);m.loft([arr(tip),arr(tip.clone().add(V([tr*.75,-tr*.15,0]))),arr(tip.clone().add(V([tr*1.6,-tr*.3,0])))],[tr*.98,tr*.68,tr*.015],green,{radial:32,steps:18});
 for(const side of [-1,1])m.loft([arr(tip.clone().add(V([tr*.6,tr*.1,side*tr*.45]))),arr(tip.clone().add(V([tr*1.6,tr*.2,side*tr*.8]))),arr(tip.clone().add(V([tr*2,tr*.15,side*tr*.9])))],[tr*.10,tr*.065,tr*.005],'en-potential',{radial:10,steps:14});
 // Original six jointed legs, feet and antennal insertions remain in place.
 for(const idx of [5,6,10,11]){const s=all[idx],path=worldPath(s),r=s.radius;m.segment(path[0],path[2],r*1.35,green,.8);m.segment(path[2],path[4],r,green,.8);tarsus(m,[path[4],path[5]],3,r,green);}
 for(const idx of [7,12]){const s=all[idx],path=worldPath(s);m.loft(path,s.radius,green,{flat:.5,radial:28,steps:30});
  // Herringbone ridges seat on the enlarged jump-muscle femur, as on adult.
  const c=new CatmullRomCurve3(path.map(V)),side=idx===7?1:-1;
  const radius=t=>{const x=t*(s.radius.length-1),i=Math.min(s.radius.length-2,Math.floor(x)),f=x-i;return s.radius[i]*(1-f)+s.radius[i+1]*f;};
  const skin=(t,h,lift)=>{const q=c.getPoint(t),tan=c.getTangent(t).normalize(),u=new Vector3(0,0,1).addScaledVector(tan,-tan.z).normalize(),v=tan.clone().cross(u).normalize(),r=radius(t);return q.addScaledVector(v,h*r).addScaledVector(u,side*(.5*r*Math.sqrt(1-h*h)+lift)).toArray();};
  for(let i=0;i<11;i++)for(const sign of [-1,1]){const t=.20+i*.053+.002*Math.sin(i*2.3),w=R*.005*(1+.07*Math.sin(i*.7+side));m.loft([0,.25,.5,.75,1].map(k=>skin(t-.045*k,sign*(.03+.69*k),-w*.3)),[w*.8,w,w,w*.8,w*.25],green,{radial:8,steps:8});}
 }
 for(const idx of [8,13]){const s=all[idx],path=worldPath(s),r=s.radius;m.loft(path.slice(0,3),[r*1.3,r,r*.9],green,{radial:24,steps:32});tarsus(m,path.slice(2),3,r,green);for(let row=0;row<2;row++)for(let i=0;i<9;i++){const a=V(along(path.slice(0,3),.17+i*.087)).add(V([0,0,(row?1:-1)*r*.7])),b=a.clone().add(V([r*2.3,r*.9,(row?1:-1)*r]));m.loft([arr(a),mix(arr(a),arr(b),.6),arr(b)],[r*.3,r*.2,r*.008],'fossil',{steps:7,radial:10});}}
 for(const idx of [9,14]){const path=worldPath(all[idx]),count=14+stage*2;for(let i=0;i<count;i++){const a=along(path,i/count),b=along(path,(i+1)/count),r=all[idx].radius[0]*(1-i/40);m.loft([a,mix(a,b,.1),mix(a,b,.45),mix(a,b,.86),b],[r*.84,r,r*.97,r*.93,r*.82],'ink',{radial:16,steps:8});}}
 // Thin, attached wing pads: laterally pendent in III/IV, dorsal after the
 // original twist in V/VI. Two pairs have distinct outlines and raised veins.
 if(stage>=3)for(const side of [-1,1])for(let pair=0;pair<2;pair++){
  const source=all[side===1?15:16],center=V(source.at),length=(source.path.at(-1)[0]-source.path[0][0])*(pair?.80:1),width=(stage<=4?.048:.058)*scale;
  center.x+=(pair?.04:-.02)*scale;center.y+=(stage>=5?.010:0)*scale;center.z+=side*(pair*.011+.008)*scale;
  const vertices=[],indices=[],N=22,M=10,rot=new Euler(...(source.rotation??[0,0,0]).map(a=>a*Math.PI/180));
  const at=(u,v,back=false)=>{const w=width*Math.sin(Math.PI*(.04+.94*u))**.7,a=new Vector3((u-.35)*length,(stage<=4?-1:1)*w*v,w*Math.sqrt(Math.max(0,1-v*v))*.13-(back?.0015*scale:0));if(stage>=5){a.y=w*Math.sqrt(Math.max(0,1-v*v))*.25-(back?.0015*scale:0);a.z=w*v;}a.applyEuler(rot);return arr(a.add(center));};
  for(let back=0;back<2;back++)for(let i=0;i<=N;i++)for(let j=0;j<=M;j++)vertices.push(...at(i/N,j/M*2-1,!!back));
  const stride=(N+1)*(M+1);for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1,stride+a,stride+a+1,stride+b,stride+b,stride+a+1,stride+b+1);}
  const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3)).setIndex(indices);g.computeVertexNormals();const probe=new Vector3().fromBufferAttribute(g.getAttribute('normal'),Math.floor(N/2)*(M+1)+Math.floor(M/2)),wanted=stage>=5?new Vector3(0,1,side*.2):new Vector3(0,0,side);if(probe.dot(wanted)<0){const ix=g.index;for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}g.computeVertexNormals();}m.add(g,green);
  for(const v of [-.55,0,.55])m.loft([.03,.2,.4,.65,.9].map(u=>at(u,v*(1-u*.5))),Array(5).fill(R*.0045),'en-potential',{radial:6,steps:18});
 }
 return m;
}
