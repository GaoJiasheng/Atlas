/** pnpm tsx scripts/geo/mosquito/rebuild.mjs — originals in source-parts.json. */
import fs from 'node:fs';
import {BufferGeometry,BufferAttribute,Matrix4,Euler} from 'three';
import {Relief,V,arr,mix,worldPath,along,tarsus,publish,otherSide} from '../kits/insect-relief.mjs';
const data=JSON.parse(fs.readFileSync('scripts/geo/mosquito/source-parts.json','utf8')),meshes={};
const part=id=>data.parts.find(p=>p.id===id);
function leg(m,path,kind){
 // Keep the coxal attachments fixed; small unequal distal flexion prevents a
 // living specimen from being a mathematically mirrored mounting diagram.
 if(path[0][2]<0)path=path.map((p,i)=>{const t=i/(path.length-1);return [p[0]+.0014*t*t*Math.sin(i*1.7),p[1]+.0009*t*t*Math.sin(i*1.3),p[2]-.0008*t*t*Math.cos(i)];});
 m.segment(path[0],path[1],.014,'ink');m.loft(path.slice(1,4),[.012,.015,.0105],'ink',{steps:32,radial:24});
 m.loft(path.slice(3,6),[.009,.0105,.0078],'ink',{steps:32,radial:24});
 tarsus(m,path.slice(5),5,.0085,'ink',kind==='hind'?4:2,kind==='hind');
 m.loft([mix(path[2],path[3],.94),path[3],mix(path[3],path[4],.025)],[.0107,.012,.008],'bone',{steps:12,radial:24});
 for(let i=0;i<13;i++){const a=along(path.slice(1,6),.05+i*.068),d=[.004*Math.sin(i*2.3),.008,.007*(i%2?1:-1)],b=arr(V(a).add(V(d)));m.loft([a,mix(a,b,.6),b],[.00075,.0005,.00002],'ink',{steps:5,radial:8});}
}
for(const kind of ['fore','mid','hind']){
 const p=part(kind+'-legs'),m=new Relief(),ps=[p.primitive,...p.extra].filter(p=>p.kind==='sweep'&&p.path.length===9);for(const s of ps)leg(m,worldPath(s),kind);meshes[p.id]=m;
}
// Culicid longitudinal forks + cross-veins: all become actual rounded relief.
const veins=[
 [[.004,.001],[.1,.029],[.29,.05],[.48,.052],[.57,.035]],
 [[.006,.002],[.15,.047],[.31,.059]],
 [[.012,0],[.17,.017],[.275,.023],[.35,.03],[.585,.017]],
 [[.275,.023],[.285,.012],[.405,.002],[.588,-.002]],
 [[.35,.03],[.45,.041],[.58,.027]],
 [[.285,.012],[.42,-.005],[.567,-.021]],
 [[.014,-.004],[.13,-.012],[.25,-.014],[.34,-.025],[.54,-.034]],
 [[.34,-.025],[.44,-.041],[.51,-.04]],
 [[.01,-.009],[.13,-.031],[.25,-.037],[.42,-.053]],
 [[.008,-.013],[.085,-.037],[.19,-.052]],
 [[.25,-.014],[.252,-.035]],
 [[.25,-.014],[.253,-.002],[.282,-.002],[.285,.012]]
];
function wing(m,s){
 const rotation=new Matrix4().makeRotationFromEuler(new Euler(...(s.rotation??[0,0,0]).map(x=>x*Math.PI/180))),transform=p=>arr(V(p).applyMatrix4(rotation).add(V(s.at)));
 const outline=s.outline,scale=Math.max(...outline.map(p=>p[0]))/.592;
 const top=outline.slice(0,8),bottom=[outline[0],...outline.slice(8).reverse()];
 const sample=(list,x)=>{for(let i=0;i<list.length-1;i++){const a=list[i],b=list[i+1];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return .01*scale;};
 const camber=(x,y)=>.0017*scale*Math.sin(Math.PI*x/(.592*scale))*(1-(y/(.07*scale))**2);
 const pos=[],ix=[],N=96,K=10;
 for(let i=0;i<=N;i++){const x=i/N*.592*scale,lo=sample(bottom,x),hi=sample(top,x);for(let j=0;j<=K;j++){const y=lo+(hi-lo)*j/K;pos.push(...transform([x,y,camber(x,y)]));}}
 for(let i=0;i<N;i++)for(let j=0;j<K;j++){const a=i*(K+1)+j,b=a+1,c=a+K+1,d=c+1;ix.push(a,c,b,b,c,d);}
 const g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pos),3));g.setIndex(ix);g.computeVertexNormals();m.add(g,'neutral',.28);
 // The costal boundary and vein scale tufts remain fully opaque.
 const rim=outline.map(([x,y])=>transform([x,y,camber(x,y)+.0004]));rim.push(rim[0]);m.loft(rim,rim.map(()=>.00105*scale),'ink',{steps:140,radial:12});
 for(let v=0;v<veins.length;v++){
  const path=veins[v].map(([x,y])=>transform([x*scale,y*scale,camber(x*scale,y*scale)+.00055]));
  m.loft(path,path.map((_,i)=>scale*(v===0?.00145:.0010)*(1-.25*i/(path.length-1))),'ink',{steps:42,radial:12});m.feature('wing-vein',path[0],{branch:v});
  // Narrow lanceolate scales, rooted on both sides of each raised vein.
  for(let i=0;i<32;i++){
   const u=(i+.3)/32,c=along(veins[v].map(([x,y])=>[x*scale,y*scale,0]),u),side=i%2?1:-1;
   const a=transform([c[0],c[1],camber(c[0],c[1])+.0011*scale]);const b=transform([c[0]+.0014*scale,c[1]+side*.0031*scale,camber(c[0],c[1])+.0015*scale]);
   m.loft([a,mix(a,b,.5),b],[.00045*scale,.00075*scale,.00005*scale],'ink',{flat:.32,steps:4,radial:8});
  }
 }
 // Trailing fringe follows the irregular hind margin, never a radial fan.
 const trailing=outline.slice(7).map(([x,y])=>[x,y,0]);
 for(let i=0;i<99;i++){
  const c=along(trailing,(i+.5)/99),a=transform([c[0],c[1],camber(c[0],c[1])]),l=(.006+.002*Math.sin(i*1.77))*scale;
  const b=transform([c[0]+l*.37,c[1]-l,camber(c[0],c[1])+.001*scale]);m.loft([a,mix(a,b,.57),b],[.0005*scale,.00033*scale,.000025*scale],'ink',{steps:5,radial:8});
 }
 m.feature('wing-fringe',s.at,{hairs:99});
}
for(const id of ['wings','male-wings']){
 const p=part(id),m=new Relief();for(const s of [p.primitive,...p.extra??[]])wing(m,s);meshes[id]=m;if(p.bilateral){const other=otherSide(m);for(const g of other.pieces){const a=g.getAttribute('position');for(let i=0;i<a.count;i++){const x=a.getX(i);a.setX(i,x+.0008*Math.sin((x+2.47)*Math.PI/.592));}}meshes[id+'-other']=other;}
}
// Male body geometry is retained exactly; replace only its six 9-point leg
// sweeps and their old band overlays, retaining the sex-specific body marks.
{
 const p=part('male-body'),all=[p.primitive,...p.extra],legs=all.filter(s=>s.kind==='sweep'&&s.path.length===9),m=new Relief();
 const oldBand=s=>s.kind==='sweep'&&s.radial===8&&s.segments<=6&&s.tint==='#ebe6da';
 const keep=all.filter(s=>!legs.includes(s)&&!oldBand(s));m.bake({...p,primitive:keep[0],extra:keep.slice(1)});
 for(let i=0;i<legs.length;i++)leg(m,worldPath(legs[i]),['fore','mid','hind'][Math.floor(i/2)]??'hind');meshes[p.id]=m;
}
await publish('mosquito',data,meshes);
