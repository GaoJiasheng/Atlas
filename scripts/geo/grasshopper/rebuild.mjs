/** pnpm tsx scripts/geo/grasshopper/rebuild.mjs */
import fs from 'node:fs';
import {CatmullRomCurve3} from 'three';
import {Relief,V,arr,mix,worldPath,along,tarsus,publish,otherSide} from '../kits/insect-relief.mjs';
const data=JSON.parse(fs.readFileSync('scripts/geo/grasshopper/source-parts.json','utf8')),meshes={};
const part=id=>data.parts.find(p=>p.id===id);
// Consistency sweep: retain the accepted head and thorax silhouettes, but
// interpolate the head vault and remove the coarse longitudinal thorax facets.
const head=part('head-capsule').primitive;
const smooth=pts=>new CatmullRomCurve3(pts.map(p=>V([p[0],p[1],0]))).getPoints(31).map(p=>[Math.max(.012,p.x),p.y]);
head.profile=[...smooth(head.profile.slice(0,10)),...smooth(head.profile.slice(10))];head.segments=64;
part('pterothorax').primitive.segments=32;part('pterothorax').primitive.radial=40;

function paired(id,build){const m=new Relief();build(m,part(id));meshes[id]=m;const twin=otherSide(m); // subtle unequal cuticular growth, fixed attachment ends
 for(const g of twin.pieces){const p=g.getAttribute('position');for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)+.0025*Math.sin(y*8));}}meshes[id+'-other']=twin;}
for(const id of ['fore-legs','mid-legs'])paired(id,(m,p)=>{
 const prim=[p.primitive,...p.extra];
 const f=worldPath(prim[0]);m.loft(f,[.028,.043,.04,.033,.028,.024],'fossil',{flat:.74,steps:42,radial:28});
 m.loft(worldPath(prim[1]),[.037,.049,.041],'fossil',{steps:16,radial:28});
 const tib=worldPath(prim[2]);m.loft(tib,[.024,.025,.021,.018,.017,.02],'fossil',{flat:.82,steps:42,radial:28});
 tarsus(m,worldPath(prim[3]),3,.022,'fossil');
 // Sparse sensory setae on the tibial cuticle, individually curved and tapered.
 for(let i=0;i<9;i++){const a=along(tib,.12+i*.085),b=arr(V(a).add(V([-.007,.008,.022])));m.loft([a,mix(a,b,.65),b],[.0022,.0014,.00008],'ink',{radial:8,steps:5});}
});
paired('hind-tibiae',(m,p)=>{
 const path=worldPath(p.primitive);m.loft(path,[.038,.037,.032,.03,.027],'fossil',{flat:.8,steps:64,radial:32});
 const tan=V(path.at(-1)).sub(V(path[0])).normalize(),out=V([tan.y,-tan.x,0]).normalize();
 for(let row=0;row<2;row++)for(let i=0;i<10;i++){
  const t=.18+i*.075+(row?.012:0),c=V(along(path,t)),r=.039-.012*t;
  const root=c.addScaledVector(out,r*.65).add(V([0,0,(row?1:-1)*r*.58]));
  const length=.049+.018*Math.sin(i*.73+row*.8);const tip=root.clone().addScaledVector(out,length).addScaledVector(tan,.018).add(V([0,0,(row?1:-1)*.011]));
  const mid=root.clone().lerp(tip,.57).addScaledVector(out,.004);
  m.loft([arr(root),arr(mid),arr(tip)],[.010,.006,.00045],'en-potential',{steps:14,radial:20});
  m.loft([arr(mid.clone().lerp(tip,.5)),arr(tip)],[.0032,.00015],'ink',{steps:6,radial:16});m.feature('tibial-spine',arr(root),{row,index:i+1});
 }
 for(const s of [-1,1])for(let i=0;i<2;i++){const a=V(path.at(-1)).add(V([0,0,s*.023]));const b=a.clone().addScaledVector(tan,.055+i*.019).addScaledVector(out,.018+i*.014).add(V([0,0,s*.014]));m.loft([arr(a),mix(arr(a),arr(b),.55),arr(b)],[.010,.006,.00015],'en-potential',{steps:14,radial:20});m.feature('apical-spur',arr(a));}
 tarsus(m,worldPath(p.extra[4]),3,.027,'fossil');
});
paired('antennae',(m,p)=>{
 const path=[...worldPath(p.primitive),...worldPath(p.extra[0]).slice(1)];
 for(let i=0;i<27;i++){const a=along(path,i/27),b=along(path,(i+1)/27),r=.018*(1-.59*i/27);m.loft([a,mix(a,b,.1),mix(a,b,.45),mix(a,b,.86),b],[r*.86,r,r*.98,r*.95,r*.85],i<7?'fossil':'ink',{radial:24,steps:10});m.feature('antennomere',mix(a,b,.5),{index:i+1});}
});
// The review accepts the hind-femur silhouette; keep it and add its diagnostic
// herringbone sculpture, with ribs seated on the existing lateral cuticle.
// Each chevron is a pair of oblique ridges running from the dorsal and ventral
// carinae to the median line, sampled on the femur's own elliptical section
// (flattened along z) so the whole ridge stands proud of the cuticle. Same
// cuticle pigment as the femur: the pattern reads as relief, not paint.
paired('hind-femora',(m,p)=>{
 m.bake(p);const prim=p.primitive,path=worldPath(prim),rs=prim.radius,flat=prim.section.flat;
 const curve=new CatmullRomCurve3(path.map(V)),radius=t=>{const x=t*(rs.length-1),i=Math.min(rs.length-2,Math.floor(x)),f=x-i;return rs[i]*(1-f)+rs[i+1]*f;};
 const surface=(t,h,lift)=>{const c=curve.getPoint(t),tan=curve.getTangent(t).normalize(),u=V([0,0,1]).addScaledVector(tan,-tan.z).normalize(),v=tan.clone().cross(u).normalize(),r=radius(t),y=h*r;return arr(c.addScaledVector(v,y).addScaledVector(u,flat*Math.sqrt(Math.max(0,r*r-y*y))+lift));};
 m.loft([.12,.3,.5,.7,.88].map(t=>surface(t,0,-.0012)),[.002,.0042,.0046,.0038,.0018],prim.tint,{radial:10,steps:40});
 const n=21;for(let i=0;i<n;i++){const t=.17+i*.66/(n-1)+.003*Math.sin(i*2.3),r=radius(t),w=.0024+.0034*r/.13,pitch=.06*r/.13;
  for(const s of [-1,1]){const pts=[0,.25,.5,.75,1].map(k=>surface(Math.max(.02,t-pitch*k),s*(.02+.72*k),-w*.3));m.loft(pts,[w*.8,w,w,w*.8,w*.35],prim.tint,{radial:10,steps:12});}
 }
});
// Growth specimens retain their body proportions and wing-bud progression.
// Replace their stick appendages with scaled articulated versions.
for(let stage=1;stage<=6;stage++){
 const p=part('nymph-'+stage),all=[p.primitive,...p.extra],m=new Relief();m.specimen=true;m.bake({...p,primitive:all[0],extra:all.filter((_,i)=>i!==0&&![5,6,7,8,9,10,11,12,13,14].includes(i))});
 for(const idx of [5,6,10,11]){const s=all[idx],path=worldPath(s),r=s.radius;m.segment(path[0],path[2],r*1.35,'f-elastic',.8);m.segment(path[2],path[4],r,'f-elastic',.8);tarsus(m,[path[4],path[5]],3,r,'f-elastic');}
 for(const idx of [7,12]){const s=all[idx];m.loft(worldPath(s),s.radius,'f-elastic',{flat:.5,radial:28,steps:30});}
 for(const idx of [8,13]){const s=all[idx],path=worldPath(s),r=s.radius;m.loft(path.slice(0,3),[r*1.3,r,r*.9],'f-elastic',{radial:24,steps:32});tarsus(m,path.slice(2),3,r,'f-elastic');for(let row=0;row<2;row++)for(let i=0;i<9;i++){const a=V(along(path.slice(0,3),.17+i*.087)).add(V([0,0,(row?1:-1)*r*.7])),b=a.clone().add(V([r*2.3,r*.9,(row?1:-1)*r]));m.loft([arr(a),mix(arr(a),arr(b),.6),arr(b)],[r*.3,r*.2,r*.008],'fossil',{steps:7,radial:10});}}
 for(const idx of [9,14]){const path=worldPath(all[idx]);const count=14+stage*2;for(let i=0;i<count;i++){const a=along(path,i/count),b=along(path,(i+1)/count),r=(all[idx].radius[0])*(1-i/40);m.loft([a,mix(a,b,.1),mix(a,b,.45),mix(a,b,.86),b],[r*.84,r,r*.97,r*.93,r*.82],'ink',{radial:16,steps:8});}}
 meshes[p.id]=m;
}
await publish('grasshopper',data,meshes);
