/** Original build-time botanical surfaces. Colours sampled only from Atlas tokens.
 * Periodic surfaces share seam normals; no photo textures or runtime sculpting. */
import fs from 'node:fs';
import {BufferGeometry,Float32BufferAttribute,Vector3,CatmullRomCurve3,Color,Matrix4,Euler} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const body=css.slice(css.indexOf(':root[data-theme="paper"]'),css.indexOf('/* cinema'));
export const tokens=Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]]));
export const TAU=Math.PI*2;
export const mix=(a,b,t)=>a+(b-a)*t;
export function colour(g,token,shade=()=>1){
 const c=new Color(tokens[token]??token),p=g.getAttribute('position'),cs=[];
 for(let i=0;i<p.count;i++){const s=shade(p.getX(i),p.getY(i),p.getZ(i),i);cs.push(c.r*s,c.g*s,c.b*s);}
 g.setAttribute('color',new Float32BufferAttribute(cs,3));return g;
}
export function flip(g){const ix=g.index;for(let i=0;i<ix.count;i+=3){let a=ix.getX(i);ix.setX(i,ix.getX(i+1));ix.setX(i+1,a);}g.computeVertexNormals();return g;}
export function surface(n,m,fn,{periodic=false,reverse=false}={}){
 const ps=[],ix=[];for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)ps.push(...fn(i/n,j/m));
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;ix.push(a,b,a+1,b,b+1,a+1);}
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(ps,3));g.setIndex(ix);g.computeVertexNormals();if(reverse)flip(g);
 if(periodic){const ns=g.getAttribute('normal');for(let i=0;i<=n;i++){const a=i*(m+1),b=a+m,v=new Vector3().fromBufferAttribute(ns,a).add(new Vector3().fromBufferAttribute(ns,b)).normalize();ns.setXYZ(a,...v.toArray());ns.setXYZ(b,...v.toArray());}}
 return g;
}
export function tube(points,radii,radial=10,segments=24){
 const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p))),frame=curve.computeFrenetFrames(segments,false);
 return surface(segments,radial,(u,v)=>{let q=u*(radii.length-1),i=Math.min(radii.length-2,Math.floor(q)),r=mix(radii[i],radii[i+1],q-i),k=Math.round(u*segments),a=TAU*v;return curve.getPoint(u).addScaledVector(frame.normals[k],r*Math.cos(a)).addScaledVector(frame.binormals[k],r*Math.sin(a)).toArray();},{periodic:true,reverse:true});
}
export function ellipsoid(at,size,token,n=40,m=24,variation=()=>1){return colour(surface(m,n,(u,v)=>{const t=Math.PI*u,a=TAU*v,s=1+(variation(u,v)-1)*Math.sin(t),r=Math.sin(t)*s;return [at[0]+size[0]*r*Math.cos(a),at[1]+size[1]*Math.cos(t)*s,at[2]+size[2]*r*Math.sin(a)];},{periodic:true,reverse:true}),token);}
export function merge(gs){for(const g of gs){if(!g.index)g.setIndex(Array.from({length:g.getAttribute("position").count},(_,i)=>i));for(const a of Object.keys(g.attributes))if(!["position","normal","color"].includes(a))g.deleteAttribute(a);}const g=mergeGeometries(gs);gs.forEach(s=>s.dispose());return g;}
export function place(g,at,rotation=[0,0,0]){return g.applyMatrix4(new Matrix4().makeRotationFromEuler(new Euler(...rotation.map(x=>x*Math.PI/180)))).translate(...at);}
const noise=(x,y,z)=>.95+.035*Math.sin(x*2311+y*973+z*1783)+.015*Math.sin(x*927+y*6391-z*1739);
export function coconut(round=1){
 const gs=[],at=[-.68,.065,-.26];
 const edge=a=>1+.075*Math.cos(3*a+.3)+.025*Math.sin(5*a+1.1);
 // Fibrous husk, triangular-ovoid equatorial cut; no solid cap hiding the cavity.
 gs.push(colour(surface(28,112,(u,v)=>{const t=u*Math.PI/2,a=TAU*v,r=Math.sin(t)*edge(a)*(1+.016*Math.sin(53*a+7*t)+.006*Math.sin(137*a+t*12));return [.098*r*Math.cos(a),-.064*Math.cos(t),.080*r*Math.sin(a)];},{periodic:true}),'fossil',(x,y,z)=>noise(x,y,z)*.67));
 // Annular cut: real individual coir bundles supplement the rough cross-section.
 gs.push(colour(surface(10,112,(u,v)=>{const a=TAU*v,r=mix(.066,.098*edge(a),u);return [r*Math.cos(a),.0003+.0004*Math.sin(a*79)*u,r*.816*Math.sin(a)];},{periodic:true,reverse:true}),'fossil',(x,y,z)=>noise(x,y,z)*1.3));
 gs.push(colour(surface(3,112,(u,v)=>{const a=TAU*v,r=mix(.061,.066,u);return [r*Math.cos(a),.001,r*.816*Math.sin(a)];},{periodic:true,reverse:true}),'ink'));
 gs.push(colour(surface(6,112,(u,v)=>{const a=TAU*v,r=mix(.049,.061,u);return [r*Math.cos(a),.0015+.0004*Math.cos(17*a),r*.816*Math.sin(a)];},{periodic:true,reverse:true}),'paper'));
 gs.push(colour(surface(26,112,(u,v)=>{const t=u*Math.PI/2,a=TAU*v,r=.049*Math.sin(t);return [r*Math.cos(a),.0015-.043*Math.cos(t),.816*r*Math.sin(a)];},{periodic:true,reverse:true}),'paper',(x,y,z)=>(.55+.43*Math.max(0,(y+.043)/.045))*(.98+.02*Math.sin(x*218+z*135))));
 for(let i=0;i<(round>1?270:140);i++){
  const a=i*2.39996,r=.067+(.024+.005*Math.sin(i*7))*(.5+.5*Math.sin(i*17.31)),rr=r+.003+Math.sin(i)*.002;
  gs.push(colour(tube([[r*Math.cos(a),.0006,r*.816*Math.sin(a)],[rr*Math.cos(a+.01),.0015,rr*.816*Math.sin(a+.01)],[(rr+.003)*Math.cos(a+.019),.0007,(rr+.003)*.816*Math.sin(a+.019)]],[.00022,.00019,.00003],5,5),'f-drag'));
 }
 for(let i=0;i<(round>1?210:90);i++){
  const a=i*2.39996,t=.18+(i%23)/23*1.31,pts=[];for(let j=0;j<5;j++){const q=t+j*.055,r=Math.sin(q)*edge(a),aa=a+.008*Math.sin(j+i);pts.push([.098*r*Math.cos(aa),-.064*Math.cos(q),.080*r*Math.sin(aa)]);}
  gs.push(colour(tube(pts,[.00024,.0003,.00028,.00016,.00001],5,6),'en-potential'));
 }
 const half=merge(gs).translate(...at),back=[],b=[-.7055,.011,-.43];
 // Reverse half with peeled shell crown and fibrous lower shoulder.
 const pores=[[.012,.007,.004],[-.012,.009,.004],[0,-.012,.0055]];
 back.push(colour(surface(36,112,(u,v)=>{const t=u*Math.PI/2,a=v*TAU,r=.082*Math.sin(t),x=1.15*r*Math.cos(a),z=r*Math.sin(a);let y=.115*Math.cos(t)+.00055*Math.sin(71*a+t*13)*Math.sin(t);for(const [px,pz,rad] of pores)y-=.005*Math.exp(-((x-px)**2+(z-pz)**2)/(rad*rad));return [x,y,z];},{periodic:true,reverse:true}),'fossil',(x,y,z)=>noise(x,y,z)*.66));
 for(const [x,z,r] of pores){const yy=.115*Math.sqrt(1-(x/.094)**2-(z/.082)**2)-.0045;back.push(colour(surface(10,32,(u,v)=>{const a=v*TAU,rr=r*u;return [x+rr*Math.cos(a),yy+.002*u*u,z+rr*.8*Math.sin(a)];},{periodic:true,reverse:true}),'ink'));}
 for(let i=0;i<(round>1?300:120);i++){
  const a=i*2.39996,t=.23+(i%37)/37*1.31,pts=[];for(let j=0;j<5;j++){const q=t+j*.04,aa=a+.012*Math.sin(i+j),r=.082*Math.sin(q);pts.push([1.15*r*Math.cos(aa),.115*Math.cos(q),r*Math.sin(aa)]);}
  back.push(colour(tube(pts,[.00023,.0003,.00022,.00015,.00001],5,7),'fossil'));
 }
 return merge([half,merge(back).translate(...b)]);
}
export function angsana(round=1){
 const gs=[];const edge=a=>.062*(1+.055*Math.sin(3*a+.3)+.024*Math.cos(7*a+.9)+.008*Math.sin(19*a));
 const pt=(r,a,side=1)=>{const R=edge(a),u=r/R;return [r*Math.cos(a),side*(.00055+.0085*Math.exp(-((r/(.020*(1+.08*Math.cos(3*a))))**3)))+.0022*u*u*Math.sin(3*a+.6)+.00055*Math.sin(39*a+u*8)*u,r*.91*Math.sin(a)];};
 for(const side of [1,-1])gs.push(colour(surface(44,144,(u,v)=>pt(edge(v*TAU)*u,v*TAU,side),{periodic:true,reverse:side>0}),'en-potential',(x,y,z)=>noise(x,y,z)*(.50+.26*(1-Math.exp(-((Math.hypot(x,z)/.027)**4))))));
 const rim=[];for(let i=0;i<=144;i++)rim.push(pt(edge(TAU*i/144),TAU*i/144));gs.push(colour(tube(rim,Array(rim.length).fill(.00055),6,144),'f-drag'));
 for(let i=0;i<(round>1?38:24);i++){
  const a=i*2.39996,pts=[];for(let j=0;j<=10;j++){const r=mix(.017,edge(a)*.985,j/10),aa=a+.06*Math.sin(j/10*2+i);const p=pt(r,aa);p[1]+=.00025;pts.push(p);}
  gs.push(colour(tube(pts,pts.map((_,j)=>mix(.00018,.000035,j/10)),5,18),'f-drag'));
  if(round>1)for(const sign of [-1,1]){const sub=[];for(let j=0;j<5;j++){const r=.032+j*.006,aa=a+sign*j*.016;const p=pt(r,aa);p[1]+=.0002;sub.push(p);}gs.push(colour(tube(sub,[.00011,.00010,.00008,.00006,.00002],5,8),'f-drag'));}
 }
 gs.push(colour(tube([[.057,.001,0],[.070,.003,.003],[.079,.005,.007]],[.0017,.0013,.00045],9,14),'fossil'));
 return merge(gs).rotateY(.21).translate(-.84,.009,.42);
}
export function bur(round=1){
 const gs=[];gs.push(colour(ellipsoid([0,0,0],[.049,.023,.024],'fossil',72,40,(u,v)=>1+.04*Math.sin(8*TAU*v+u*7)+.022*Math.cos(29*TAU*v-u*19)),'fossil',(x,y,z)=>noise(x,y,z)*.52));
 for(let i=0;i<(round>1?138:82);i++){
  const x=-.043+.084*(i+.5)/(round>1?138:82),a=i*2.39996,rr=Math.sqrt(1-(x/.050)**2),base=new Vector3(x,.023*rr*Math.cos(a),.024*rr*Math.sin(a)),n=new Vector3(x/.049**2,base.y/.023**2,base.z/.024**2).normalize();
  const side=new Vector3(1,.23*Math.cos(i),.14*Math.sin(i)).addScaledVector(n,-n.x).normalize();const len=.0085+.004*(.5+.5*Math.sin(i*9.71)),pts=[];
  for(let j=0;j<7;j++){const t=j/6,dist=len*Math.sin(t*Math.PI*.75),hook=len*.32*Math.pow(t,3);pts.push(base.clone().addScaledVector(n,dist).addScaledVector(side,hook).toArray());}
  gs.push(colour(tube(pts,[.00095,.0008,.00062,.00048,.00033,.00017,.000025],7,14),'fossil'));
 }
 for(const sign of [-1,1])gs.push(colour(tube([[.041,sign*.009,0],[.054,sign*.010,.002],[.063,sign*.014,.002],[.060,sign*.020,.003]],[.0032,.0024,.0012,.00005],12,22),'fossil'));
 for(let i=0;i<220;i++){const x=-.042+.084*(i+.5)/220,a=i*2.39996,r=Math.sqrt(1-(x/.049)**2),p=[x,.023*r*Math.cos(a),.024*r*Math.sin(a)];gs.push(colour(tube([p,[x-.0005,p[1]*1.06,p[2]*1.06],[x-.001,p[1]*1.1,p[2]*1.1]],[.0001,.00007,.00001],4,4),'ink-2'));}
 return merge(gs).translate(-.58,.039,.42);
}
export function pod(round=1){
 const gs=[];
 // One thin, curved valve, mirrored by the existing engine bilateral mechanism.
 const pt=(u,v,inner=false)=>{const w=.019*Math.pow(Math.sin(Math.PI*u),.68)*(1+.10*Math.sin(u*13)),a=v*Math.PI;return [-.277*u,.002+Math.sin(Math.PI*u)*.005+w*Math.cos(a),w*.69*Math.sin(a)+(inner?-.0009:0)];};
 for(const inner of [false,true]){const skin=colour(surface(76,28,(u,v)=>pt(u,v,inner),{reverse:inner}),inner?'bone':'en-potential',noise);gs.push(skin);gs.push(flip(skin.clone()));}
 for(const v of [0,1]){const pts=Array.from({length:49},(_,i)=>pt(i/48,v));gs.push(colour(tube(pts,pts.map((_,i)=>.0008*Math.sin(Math.PI*i/48)+.0001),7,64),'f-drag'));}
 for(let i=0;i<5;i++){
  const x=-.277*(.27+i*.115); // keep every seed inside the valve, whose half-width shrinks towards the tipsgs.push(ellipsoid([x,.0018,.0035],[.011,.0077,.0064],'fossil',36,22,(u,v)=>1-.10*Math.exp(-((u-.5)**2+(v-.5)**2)*70)));
  gs.push(ellipsoid([x+.001,.0083,.004],[.0036,.0007,.0014],'bone',20,12));
 }
 for(let k=0;k<(round>1?16:8);k++){const pts=Array.from({length:25},(_,i)=>{const p=pt(.03+i*.94/24,(k+.5)/(round>1?16:8));p[2]+=.0002;return p;});gs.push(colour(tube(pts,pts.map((_,i)=>.00018*Math.sin(Math.PI*i/24)+.00002),5,32),'f-drag'));}
 return merge(gs).translate(-.565,.027,0);
}
export function leaf(p,i,round=1){
 const outline=p.outline??p.shape,L=Math.max(...outline.map(q=>q[0])),w=Math.max(...outline.map(q=>q[1])),gs=[];
 const pt=(u,v,side=1)=>{const s=v*2-1,W=w*Math.pow(Math.sin(Math.PI*u),.9)*(1+.045*Math.sin(i+u*7)*s);return [L*u,W*s,.0027*Math.sin(u*Math.PI)+.006*Math.abs(s)*Math.sin(Math.PI*u)+.004*Math.sin(u*2.9+i)*Math.sin(Math.PI*u)+side*.00035*Math.sin(Math.PI*u)];};
 for(const side of [1,-1])gs.push(colour(surface(32,12,(u,v)=>pt(u,v,side),{reverse:side<0}),i<10?'face-2':'f-elastic',(x,y,z)=>noise(x,y,z)*.63));
 const mid=Array.from({length:25},(_,j)=>{const p=pt(j/24,.5);p[2]+=.0004;return p;});gs.push(colour(tube(mid,mid.map((_,j)=>mix(.00065,.00005,j/24)),6,32),'seedling'));
 for(let k=1;k<6;k++)for(const side of [-1,1]){const points=Array.from({length:7},(_,j)=>{const p=pt(k*.12+j*.017,.5+side*j*.070);p[2]+=.0005;return p;});gs.push(colour(tube(points,points.map((_,j)=>mix(.00024,.00002,j/6)),5,10),'seedling'));}
 return place(merge(gs),p.at,p.rotation);
}
export function chilli(p,i,round=1){
 const gs=[],L=Math.abs(Math.min(...p.profile.map(q=>q[1]))),R=Math.max(...p.profile.map(q=>q[0])),sign=i%2?-1:1;
 const centre=u=>[sign*.021*u*u,-L*u,.009*Math.sin(u*Math.PI*.7)*u];
 const radius=u=>R*Math.pow(Math.sin(Math.PI*Math.pow(u,.50)),.82)*(1-.35*u);
 gs.push(colour(surface(72,56,(u,v)=>{const a=v*TAU,r=radius(u)*(1+.055*Math.cos(3*a+u*5)+.015*Math.sin(u*29+a*4)),c=centre(u);return [c[0]+r*Math.cos(a),c[1],c[2]+r*Math.sin(a)];},{periodic:true,reverse:true}),p.tint==='#962c22'?'pole-n':'face-2',(x,y,z)=>noise(x,y,z)*.57));
 gs.push(colour(surface(15,60,(u,v)=>{const a=v*TAU,r=R*(1.05+.23*Math.cos(5*a))*Math.sin(u*Math.PI/2);return [r*Math.cos(a),.002-u*.007,r*Math.sin(a)];},{periodic:true,reverse:true}),'f-elastic'));
 return place(merge(gs),p.at,p.rotation);
}
export function bee(round=1){
 const gs=[];
 gs.push(ellipsoid([-.0036,0,0],[.0054,.0028,.0027],'ink',48,28));
 // Abdominal plates have sculpted overlapping posterior rims, not decal stripes.
 for(let i=0;i<5;i++){const x=-.007+i*.00165,r=.0028*Math.sqrt(1-((x+.0036)/.006)**2);gs.push(colour(surface(12,36,(u,v)=>{const a=TAU*v,rr=r*(1-.14*u);return [x+u*.0015,rr*Math.cos(a),rr*Math.sin(a)];},{periodic:true,reverse:true}),i%2?'ink-2':'en-potential'));}
 gs.push(ellipsoid([.0031,0,0],[.0034,.0030,.0028],'en-potential'));
 gs.push(ellipsoid([.0071,-.0005,0],[.0024,.0026,.0024],'ink-2'));
 for(const side of [-1,1]){
  gs.push(ellipsoid([.0074,.0000,side*.002],[.0014,.0020,.00085],'ink',32,24));
  gs.push(colour(tube([[.0085,.001,side*.0008],[.0104,.002,side*.0014],[.0115,.001,side*.002]],[.00030,.00024,.00012],8,20),'ink'));
  for(let k=0;k<3;k++){
   const x=.002-k*.0018,pts=[[x,-.0018,side*.0018],[x-.001,-.0042,side*.0032],[x+.001,-.0058,side*.0043],[x+.002,-.0062,side*.0054]];
   gs.push(colour(tube(pts,[.0006,.00055,.00035,.00012],8,22),'ink-2'));
   gs.push(ellipsoid(pts[1],[.0006,.00065,.0006],'ink-2',16,12));
   if(k===2)gs.push(ellipsoid([x-.0003,-.0045,side*.0037],[.0012,.0015,.0008],'cut',24,16));
  }
  for(let k=0;k<2;k++){
   const length=k?.0075:.0105,pts=[];
   const wing=surface(30,12,(u,v)=>{const w=.0025*Math.pow(Math.sin(Math.PI*u),.7),s=v*2-1;return [.002-length*u,.0028+.002*u+side*.0003*s,side*(.0018+u*.006+w*s)];},{reverse:side>0});gs.push(colour(wing,'neutral'));
   // Duplicate underside with opposing normals; engraved cells use actual fine relief.
   gs.push(colour(flip(wing.clone()),'neutral'));
   for(const vv of [.12,.5,.88]){const path=Array.from({length:15},(_,j)=>{const u=j/14,w=.0025*Math.pow(Math.sin(Math.PI*u),.7);return [.002-length*u,.0029+.002*u,side*(.0018+u*.006+w*(vv*2-1))];});gs.push(colour(tube(path,path.map(()=>.000065),5,20),'ink-3'));}
  }
 }
 for(let i=0;i<(round>1?290:120);i++){
  const a=i*2.39996,x=.0003+(i%23)/23*.0056,r=.0028*Math.sqrt(Math.max(.1,1-((x-.0031)/.0034)**2)),b=[x,r*Math.cos(a),r*Math.sin(a)];gs.push(colour(tube([b,[x-.0001,b[1]*1.14,b[2]*1.14],[x-.0003,b[1]*1.20,b[2]*1.20]],[.000045,.00003,.000005],4,4),'en-potential'));
 }
 return place(merge(gs),[-.1383,.951,.1692],[0,-17,0]);
}
