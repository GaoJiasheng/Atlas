/** Longitudinal coconut specimen. Original coir, nested cut walls and shallow eye scars. */
import { BufferGeometry, Float32BufferAttribute, Vector3, Color } from 'three';
import { surface, type P } from '../living-things/sculpture';
import { rng, type Model } from '../living-things/kit';
import { Sculpt } from './sculpt';

const TAU=Math.PI*2, centre=.087;
const palette={husk:'#6e5a44',fibre:'#857d70',shell:'#51351f',meat:'#e9e4d8'};
const mix=(a:P,b:P,t:number):P=>a.map((x,k)=>x+(b[k]!-x)*t) as P;
function reverse(g:BufferGeometry) {
  const ix=g.index!,n=g.getAttribute('normal');
  for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}
  for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));
  return g;
}
function coirUV(g:BufferGeometry,n:number,m:number) {
  const uv:number[]=[];
  for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)uv.push((8+i/n*496)/512,(8+j/m*240)/256);
  g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.userData.textureUV=true;
}
/** Separate neutral-swatch UV islands retain the genuine cut contour as a
 * topological border through the weld/simplify pipeline. All islands sample
 * the same white/flat guard texels, so flesh still has no coir or normal map. */
function neutralIsland(g:BufferGeometry,island:number) {
  const uv:number[]=[];
  for(let i=0;i<g.getAttribute('position').count;i++)uv.push(.001+island*.002,.001);
  g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.userData.textureUV=true;
}
function shape(u:number,a:number,R:number,L:number,outer=false):P {
  const t=u*Math.PI;
  let r=R*Math.sin(t)*(1-.1*Math.cos(t)),x=-L*Math.cos(t);
  const peel=outer?Math.max(0,Math.min(1,(u-.72)/.2)):0;
  if(peel){r=r*(1-peel)+.056*Math.sin(t)*(1-.1*Math.cos(t))*peel;x=x*(1-peel)-.077*Math.cos(t)*peel;}
  if(!outer&&R===.056)r+=.000018*Math.sin(t)*(Math.sin(a*19+u*4.7)+.5*Math.sin(a*23-u*3));
  const tri=1+(outer?.105:.035)*Math.cos(a*3+.25)*Math.sin(t)**2;
  const coir=outer?1+.002*Math.sin(a*173+t*29)+.002*Math.sin(a*97-t*71):1;
  return [x,centre-Math.sin(a)*r*tri*coir,Math.cos(a)*r*tri*coir];
}
const opening=(u:number)=>{const q=Math.max(0,Math.min(1,(u-.07)/.12,(.9-u)/.12));return q*q*(3-2*q);};
const angle=(u:number,v:number)=>-.08*Math.PI+v*(TAU-opening(u)*.84*Math.PI);
const scars=Array.from({length:3},(_,i)=>{const a=.3+i*TAU/3;return {y:Math.cos(a)*.008,z:Math.sin(a)*.008,ry:.0043*(i===0?1.06:.96),rz:.0035*(i===1?1.05:.98),phase:i*1.9};});
function scarMetric(y:number,z:number) {
  let best=Infinity;
  for(const c of scars){const dy=(y-c.y)/c.ry,dz=(z-c.z)/c.rz,a=Math.atan2(dz,dy),edge=1+.06*Math.sin(a*5+c.phase)+.035*Math.sin(a*9-c.phase);best=Math.min(best,Math.hypot(dy,dz)/edge);}
  return best;
}
/** Positive cap x on the actual mildly trilobed shell, not an ellipsoid proxy. */
function shellX(y:number,z:number) {
  const a=Math.atan2(-y,z),r=Math.hypot(y,z);
  let lo=.5,hi=1;
  for(let i=0;i<28;i++){const u=(lo+hi)/2,p=shape(u,a,.056,.077);if(Math.hypot(p[1]-centre,p[2])>r)lo=u;else hi=u;}
  return shape((lo+hi)/2,a,.056,.077)[0];
}
const depression=(q:number)=>q<1?.0002*(1-q*q)**2:0;

export function coconutRound3():Model {
  const s=new Sculpt(),rand=rng(117);
  function cutPoint(u:number,v:number,side:number):P {
    const p=mix(shape(u,angle(u,side),.092,.118,true),shape(u,angle(u,side),.056,.077),v);
    // Tiny irregular longitudinal grain; no concentric corrugations or growth rings.
    const h=.000045*(Math.sin(v*193+Math.sin(u*31)*.3)+.45*Math.sin(v*337+u*7));
    p[1]+=h*Math.sin(Math.PI*v);return p;
  }
  function layer(R:number,L:number,ri:number,li:number,c:string,outer=false) {
    const n=outer?72:96,m=48,U=(u:number)=>outer?u*.84:u;
    const g=reverse(surface(n,m,(u,v)=>shape(U(u),angle(U(u),v),R,L,outer)));
    if(c===palette.shell){
      const p=g.getAttribute('position'),colors:number[]=[],uv:number[]=[];
      for(let j=0;j<p.count;j++){
        const x=p.getX(j),y=p.getY(j)-centre,z=p.getZ(j),q=x>.065?scarMetric(y,z):Infinity;
        p.setX(j,x-depression(q));
        const pigment=new Color(c).lerp(new Color('#382c23'),Math.max(0,Math.min(1,(1.12-q)*7)));
        colors.push(pigment.r,pigment.g,pigment.b);
        uv.push(.5+z/(.056*2)*.88,.5+y/(.056*2)*.88);
      }
      g.setAttribute('color',new Float32BufferAttribute(colors,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.userData.textureUV=true;g.computeVertexNormals();
    }
    if(outer)coirUV(g,n,m);
    if(c===palette.meat)neutralIsland(g,1);
    s.put(g,c,.025);
    if(c===palette.meat){
      const inner=surface(96,64,(u,v)=>shape(u,angle(u,v),ri,li));
      const p=inner.getAttribute('position'),colors:number[]=[];
      for(let i=0;i<p.count;i++){const C=new Color(c).multiplyScalar(.80+.20*Math.max(0,Math.min(1,(p.getY(i)-centre+ri)/ri)));colors.push(C.r,C.g,C.b);}
      inner.setAttribute('color',new Float32BufferAttribute(colors,3));neutralIsland(inner,2);s.put(inner,c);
    }
    for(const side of [0,1]){
      const cut=surface(96,outer?12:4,(u,v)=>outer?cutPoint(U(u),v,side):mix(shape(u,angle(u,side),R,L),shape(u,angle(u,side),ri,li),v));
      if(outer){
        const p=cut.getAttribute('position'),colors:number[]=[];
        for(let i=0;i<p.count;i++){const u=Math.floor(i/13)/96,v=i%13/12,C=new Color('#857d70').lerp(new Color('#6e5a44'),.46+.11*Math.sin(v*193+u*3)+.05*Math.sin(v*337+u*11));colors.push(C.r,C.g,C.b);}
        cut.setAttribute('color',new Float32BufferAttribute(colors,3));coirUV(cut,96,12);
      }
      if(c===palette.meat)neutralIsland(cut,3+side);
      s.put(cut,c,.018);
    }
    if(outer){
      // The husk stops before the exposed eye-bearing cap. Its transverse cut
      // annulus must bridge OUTER husk to shell; otherwise two triangular holes remain.
      const end=surface(48,6,(v,t)=>mix(shape(.84,angle(.84,v),R,L,true),shape(.84,angle(.84,v),ri,li),t));
      coirUV(end,48,6);s.put(end,palette.husk,.035);
    }
  }
  layer(.092,.118,.056,.077,palette.husk,true);
  layer(.056,.077,.0525,.0735,palette.shell);
  layer(.0525,.0735,.0415,.0625,palette.meat);

  // Closed, dark fibrous scar floors follow the actual cap. Depth is only
  // 0.2 mm, with an irregular oval perimeter and no hole or raised circular rim.
  for(const c of scars){
    const floor=surface(6,32,(u,v)=>{
      const a=v*TAU,edge=1+.06*Math.sin(a*5+c.phase)+.035*Math.sin(a*9-c.phase),y=c.y+Math.cos(a)*c.ry*u*edge,z=c.z+Math.sin(a)*c.rz*u*edge;
      return [shellX(y,z)-depression(u)+.000018,y+centre,z];
    },true);
    const p=floor.getAttribute('position'),colors:number[]=[];
    for(let j=0;j<p.count;j++){const C=new Color('#382c23').multiplyScalar(.95+.08*Math.sin(p.getY(j)*11000+p.getZ(j)*2700));colors.push(C.r,C.g,C.b);}
    floor.setAttribute('color',new Float32BufferAttribute(colors,3));s.put(floor,'#382c23');
  }

  // Surface-bound, long curved strands: each strip follows the parametrised
  // skin and tapers to its roots, rather than floating as a straight stick.
  function skinFibre(u0:number,du:number,v:number,width:number,outer:boolean,c:string) {
    const path=(t:number)=>{const u=Math.min(outer?.839:.996,u0+du*t),a=angle(u,v+.0018*Math.sin(t*3+u0*20));return shape(u,a,outer?.092:.056,outer?.118:.077,outer);};
    if(!outer)for(let j=0;j<=10;j++){const p=path(j/10);if(p[0]>.065&&scarMetric(p[1]-centre,p[2])<1.16)return;}
    const g=surface(6,1,(u,v)=>{
      const p=new Vector3(...path(u)),a=new Vector3(...path(Math.max(0,u-.003))),b=new Vector3(...path(Math.min(1,u+.003))),N=new Vector3(0,p.y-centre,p.z).normalize(),S=new Vector3().crossVectors(b.sub(a),N).normalize();
      return p.addScaledVector(N,.000065).addScaledVector(S,(v-.5)*width*Math.sin(Math.PI*u)).toArray() as P;
    });s.put(g,c);
  }
  for(let i=0;i<70;i++){
    // Bias the reduced silhouette fibres toward side contours and window edges;
    // the denser embedded chart supplies the short fibres over broad surfaces.
    const edge=i%3===0, v=edge?(i%2?.018:.982):.015+rand()*.97;
    skinFibre(.035+rand()*.58,.10+rand()*.20,v,.00012+rand()*.00009,true,i%4?'#6e5a44':'#796552');
  }
  for(let i=0;i<80;i++)skinFibre(.72+rand()*.22,.035+rand()*.075,rand(),.00011+rand()*.00006,false,i%4?'#66432a':'#78583a');

  for(const side of [0,1])for(let i=0;i<60;i++){
    const u0=.035+rand()*.68,du=.035+rand()*.12,v0=.035+rand()*.93,drift=(rand()-.5)*.018,width=.00010+rand()*.00013;
    const g=surface(5,1,(t,q)=>{
      const u=Math.min(.839,u0+t*du),v=v0+drift*Math.sin(t*Math.PI),P0=new Vector3(...cutPoint(u,v,side)),V=new Vector3(...cutPoint(u,Math.min(.999,v+.001),side)).sub(P0).normalize(),U=new Vector3(...cutPoint(Math.min(.84,u+.0001),v,side)).sub(P0).normalize(),N=new Vector3().crossVectors(U,V).normalize();if(N.y<0)N.negate();
      return P0.addScaledVector(V,(q-.5)*width*Math.sin(Math.PI*t)).addScaledVector(N,.000055).toArray() as P;
    });
    s.put(g,i%4===0?'#85705b':palette.husk);
  }
  // A tapered strip has two coincident vertices at each tip; one can receive
  // only a degenerate triangle. Give it the limiting normal of its neighbour.
  for(const g of s.pieces){
    const n=g.getAttribute('normal');
    for(let i=0;i<n.count;i++)if(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))<.5){
      for(let d=1;d<n.count;d++){
        const j=i+d<n.count?i+d:i-d;
        if(j>=0&&Math.hypot(n.getX(j),n.getY(j),n.getZ(j))>.5){n.setXYZ(i,n.getX(j),n.getY(j),n.getZ(j));break;}
      }
    }
  }
  return s.finish();
}
