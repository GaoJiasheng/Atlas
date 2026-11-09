/** Additional whole-topic audit: curved petals, cellular section, seed hilum.
 * The established stems, root branching, flower counts and specimen pivots stay authored. */
import {primitiveSchema} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {Matrix4,Color,Float32BufferAttribute,CatmullRomCurve3,Vector3,Shape,Path,ShapeGeometry} from 'three';
import {colour,surface,ellipsoid,tube,merge,place,TAU,leaf,tokens} from './sculpt.mjs';
export function leafSection(){
 const gs=[];
 // Epidermis: a cut, gently undulating skin, with relief of pavement-cell margins.
 for(const sign of [1,-1])gs.push(colour(surface(48,20,(u,v)=>[.52+u*.36,.126+sign*.002+.0013*Math.sin(u*12+v*9),-.4136+v*.1872],{reverse:sign>0}),'seedling-pale'));
 // The underside retains the actual pore beneath the guard cells, including its
 // clearance in the open/closed animation. It cannot be covered by a solid skin.
 const outline=new Shape();outline.moveTo(.52,.2264);outline.lineTo(.88,.2264);outline.lineTo(.88,.4136);outline.lineTo(.52,.4136);outline.closePath();const pore=new Path();pore.absellipse(.7864,.2631,.0105,.034,0,TAU,true,0);outline.holes.push(pore);
 for(const sign of [1,-1]){const g=new ShapeGeometry(outline,64).rotateX(-Math.PI/2).translate(0,.0065+sign*.002,0);if(sign<0){const ix=g.index;for(let i=0;i<ix.count;i+=3){const v=ix.getX(i);ix.setX(i,ix.getX(i+1));ix.setX(i+1,v);}g.computeVertexNormals();}gs.push(colour(g,'seedling-pale'));}
 const node=(i,j)=>{const x=.52+i*.04+(i>0&&i<9?.002*Math.sin(i*7+j*9):0),z=-.4136+j*.0468+(j>0&&j<4?.002*Math.cos(i*6-j*4):0);return [x,.1293+.0013*Math.sin((x-.52)/.36*12+(z+.4136)/.1872*9),z];};
 for(let i=0;i<=9;i++)for(let j=0;j<=4;j++)for(const [di,dj] of [[1,0],[0,1]]){if(i+di>9||j+dj>4)continue;const a=node(i,j),b=node(i+di,j+dj),mid=a.map((v,k)=>(v+b[k])/2);mid[di?2:0]+=.0014*Math.sin(i*3+j*5);gs.push(colour(tube([a,mid,b],[.00042,.00048,.00042],5,8),'seedling'));}
 // 16 columns retained, with rounded, non-identical cross sections instead of fins.
 for(let i=0;i<16;i++){const x=.532+i*.0223,high=.025*(1+.08*Math.sin(i*5)),z=-.32;
  gs.push(ellipsoid([x,.092,z],[.0098,high,.087],'face-2',24,20,(u,v)=>1+.055*Math.sin(v*TAU*4+i)*Math.sin(Math.PI*u)));
 }
 // Branched spongy cell profiles, real interconnected spaces; no punched slab.
 for(let i=0;i<34;i++){const x=.535+(i%9)*.039+.004*Math.sin(i*8),y=.030+(i%3)*.011,z=-.392+Math.floor(i/9)*.047;
  gs.push(ellipsoid([x,y,z],[.021,.012,.025],'f-elastic',28,20,(u,v)=>1+.20*Math.sin(v*TAU*3+i)*Math.sin(Math.PI*u)));
 }
 return merge(gs);
}
function palette(p){if(p.color==='steel')return 'ink-3';if(p.color==='plastic')return 'en-potential';if(!p.tint)return 'neutral';
 // The engine draws a tissue part at its authored tint (resolveMaterialLook); keep that albedo instead of snapping to the nearest token.
 if(p.color==='tissue')return p.tint;const c=new Color(p.tint),keys=['paper','bone','fossil','ink','ink-2','ink-3','cut','en-potential','face-2','f-elastic','seedling','seedling-pale','pole-n','cold','f-push'];return keys.map(t=>[t,new Color(tokens[t]).distanceTo?.(c)??Math.hypot(...new Color(tokens[t]).toArray().map((v,i)=>v-c.toArray()[i]))]).sort((a,b)=>a[1]-b[1])[0][0];}
export function polishPart(part){
 const gs=[];
 for(const original of [part.primitive,...part.extra??[]]){
  const p=structuredClone(original),at=p.at,rotation=p.rotation;delete p.rotation;p.at=[0,0,0];
  // A sampled profile removes the axial polygon steps as well as circumferential facets.
  if(p.kind==='lathe'){
   p.segments=Math.max(part.id==='pollen-grains'?64:48,p.segments??48);const curve=new CatmullRomCurve3(p.profile.map(([r,y])=>new Vector3(r,y,0)),false,'centripetal');
   const sharpProfile=['bean-seed','flower-bud','root-tip','ovules','pollen-grains','pistil','fruit-red-section'].includes(part.id);
   if(sharpProfile)p.profile=Array.from({length:(p.profile.length-1)*4+1},(_,i)=>{const v=curve.getPoint(i/((p.profile.length-1)*4));return [Math.max(0,v.x),v.y];});
  }
  if(p.kind==='sweep'){p.radial=Math.max(12,p.radial??12);p.segments=Math.max(18,p.segments??18);}
  if(p.kind==='sphere'){
   const r=p.size[0],g=ellipsoid([0,0,0],[r,r,r],palette(p),40,28,(u,v)=>1-.075*Math.exp(-((v-.5)**2+(u-.5)**2)*95));
   if(p.scale)g.scale(...p.scale);gs.push(place(g,at,rotation));continue;
  }
  if(p.kind==='extrude'&&['bean-seedling','chilli-seedling','dry-pot'].includes(part.id)){
   // Keep exact leaf-outline extents and petiole origin; fold the authored surface.
   for(const piece of partPieces({primitive:primitiveSchema.parse(p)})){
    const g=piece.geometry,ps=g.getAttribute('position');let low=Infinity,high=-Infinity;for(let j=0;j<ps.count;j++){low=Math.min(low,ps.getX(j));high=Math.max(high,ps.getX(j));}const L=high-low;
    for(let j=0;j<ps.count;j++){const u=(ps.getX(j)-low)/(L||1);ps.setZ(j,ps.getZ(j)+L*.06*Math.sin(u*Math.PI)+Math.abs(ps.getY(j))*.14);}g.computeVertexNormals();gs.push(place(colour(g,palette(p)),at,rotation));
   }continue;
  }
  for(const piece of partPieces({primitive:primitiveSchema.parse(p)})){
   if(piece.lines)continue;
   for(const m of piece.matrices??[new Matrix4()]){
    const g=piece.geometry.clone().applyMatrix4(m),ps=g.getAttribute('position');
    if(p.kind==='extrude'&&['flower','flower-section'].includes(part.id)){
     g.computeBoundingBox();const b=g.boundingBox,h=b.max.y-b.min.y;
     for(let j=0;j<ps.count;j++){const t=(ps.getY(j)-b.min.y)/(h||1);ps.setZ(j,ps.getZ(j)+h*.13*Math.sin(t*Math.PI)+Math.abs(ps.getX(j))*.15);}g.computeVertexNormals();
    }
    if(part.id==='pollen-grains'){
     // Tricolporate Capsicum grain: three meridional furrows that stop short of the poles, slightly prolate.
     for(let j=0;j<ps.count;j++){const v=new Vector3().fromBufferAttribute(ps,j),r=v.length(),a=Math.atan2(v.z,v.x),t=Math.acos(v.y/r);const d=Math.min(...[0,1,2].map(k=>{const x=Math.abs(((a-k*2*Math.PI/3)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);return x;})),win=Math.pow(Math.sin(t),2.5);v.multiplyScalar(1-.085*Math.exp(-((d/.17)**2))*win);v.y*=1.12;ps.setXYZ(j,...v.toArray());}g.computeVertexNormals();
    }
    gs.push(place(colour(g,palette(p)),at,rotation));
   }
  }
 }
 // A real inset hilum along the split coat, not a painted mark.
 if(part.id==='bean-sprouting')gs.push(colour(tube([[-.113,.024,.537],[-.111,.027,.539],[-.106,.029,.537]],[.0012,.0010,.0003],8,18),'bone'));
 return merge(gs);
}
