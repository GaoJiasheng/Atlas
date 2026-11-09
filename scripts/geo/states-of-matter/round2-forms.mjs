/** Original Atlas ice sculpture. RGBA MeshStandardMaterial only; no optics hook. */
import {BufferGeometry,BufferAttribute,Vector3,BoxGeometry,SphereGeometry,LatheGeometry,Vector2} from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
function rgba(g,color,alpha,layer){const p=g.getAttribute('position'),c=new Float32Array(p.count*4);for(let i=0;i<p.count;i++)c.set([...color.toArray(),typeof alpha==='function'?alpha(p,i):alpha],i*4);g.setAttribute('color',new BufferAttribute(c,4));g.deleteAttribute('uv');g.userData.iceLayer=layer;return g;}
export function clearIce(p,P){
 const base=[-1.48,0,.14],gs=[],dish=new LatheGeometry([[0,0],[.033,0],[.035,.001],[.042,.002],[.048,.004],[.05,.0055],[.05,.0065],[.049,.007],[.047,.0065],[.041,.0048],[.035,.004],[0,.004]].map(x=>new Vector2(...x)),80);dish.translate(...base);gs.push(rgba(dish,P.paper.clone().lerp(P.bone,.12),1,0));
 // Uneven 0.18 mm meltwater film with a raised meniscus around its perimeter.
 const pp=[],ii=[],N=80,RINGS=3;
 for(let r=0;r<=RINGS;r++)for(let k=0;k<=N;k++){const a=k*Math.PI*2/N,t=r/RINGS,rad=.037*t*(1+.045*Math.sin(a*3)+.026*Math.sin(a*7+.8));pp.push(base[0]+rad*Math.cos(a),.00418+.00013*t**12+.000025*Math.sin(rad*1600+a),base[2]+rad*.79*Math.sin(a));}
 for(let r=0;r<RINGS;r++)for(let k=0;k<N;k++){const a=r*(N+1)+k,b=a+N+1;ii.push(a,a+1,b,b,a+1,b+1);}
 const film=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pp),3));film.setIndex(ii);film.computeVertexNormals();gs.push(rgba(film,P.paper.clone().lerp(P.cold,.08),.25,1));
 for(const [j,x,z,angle] of [[0,-.014,0,18],[1,.016,.006,-25]]){
  const local=[],at=[base[0]+x,.0167,base[2]+z],half=j?.0118:.0125,radius=j?.0032:.0038;
  // Thirty unequal bubbles in five irregular rising strings per cube.
  for(let k=0;k<30;k++){
   const string=Math.floor(k/6),level=k%6,a=string*2.39996+j,r=.00010+.00030*(.5+.5*Math.sin(k*8.9+j)),s=new SphereGeometry(1,r>.00028?8:6,r>.00028?4:3).scale(r,r*(1.1+.7*Math.sin(k+2)**2),r*.86);
   s.translate(.005*Math.cos(a)+.00045*Math.sin(level*1.7+a),-.007+level*.0026,.0045*Math.sin(a)+.0004*Math.sin(level*1.1));local.push(rgba(s,P.paper,.63,2));
  }
  // Three wavy, feathered fracture ribbons. A bright 0.15–0.25 mm seam
  // fades through a 1 mm scattering film; double-wound indices show both sides.
  for(let f=0;f<3;f++){
   const pp=[],cc=[],ix=[],N=9,vs=[-1,-.55,-.12,0,.12,.55,1];
   for(let i=0;i<=N;i++)for(const v of vs){
    const u=i/N,y=-.008+.017*u,w=.0011*(.75+.25*Math.sin(u*5+f)),centre=-.004+f*.0037+.0018*Math.sin(u*4+f+j);
    pp.push(centre+v*w,y,.001*(f-1)+.003*Math.sin(u*3+f)+v*w*.8);
    cc.push(...P.paper.clone().lerp(P.cold.clone().multiplyScalar(.3),Math.min(1,Math.abs(v)*2.5)).toArray(),(.10+.53*Math.exp(-Math.pow(v/.30,2)))*Math.min(1,Math.sin(Math.PI*u)*5));
   }
   for(let i=0;i<N;i++)for(let k=0;k<vs.length-1;k++){const a=i*vs.length+k,b=a+vs.length;ix.push(a,b,a+1,a+1,b,b+1,a+1,b,a,b+1,b,a+1);}
   const g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pp),3)).setAttribute('color',new BufferAttribute(new Float32Array(cc),4));g.setIndex(ix);const twoSided=g.toNonIndexed();twoSided.computeVertexNormals();twoSided.rotateZ([-.25,.4,-.75][f]);twoSided.userData.iceLayer=3;local.push(twoSided);g.dispose();
  }
  // Dense face sampling is necessary: the old rounded-box had unsampled flat
  // faces, so adding a sine displacement there produced only a plastic sheen.
  let shell=new BoxGeometry(half*2,half*2,half*2,18,18,18),ps=shell.getAttribute('position');
  const alphas=[];
  for(let i=0;i<ps.count;i++){
   const q=new Vector3().fromBufferAttribute(ps,i),c=q.clone().clampScalar(-half+radius,half-radius),n=q.clone().sub(c).normalize(),rounded=c.addScaledVector(n,radius),x=rounded.x,y=rounded.y,z=rounded.z,dist=[half-Math.abs(x),half-Math.abs(y),half-Math.abs(z)].sort((a,b)=>a-b)[1];
   // View-independent rounded edge band. Across each adjacent face its
   // opacity rises from .22 to .62 over the last 1.8 mm before the fillet.
   const edge=1-Math.min(1,Math.max(0,(dist-radius*(1-Math.SQRT1_2))/.0018)),melt=.00022*Math.sin(1250*x+310*z+j)*Math.sin(1120*y+210*z)+.00010*Math.sin(1460*z-620*y+j);
   ps.setXYZ(i,x+n.x*melt,y+n.y*melt,z+n.z*melt);alphas.push(.22+.40*edge*edge*(3-2*edge));
  }
  shell.deleteAttribute('normal');shell.deleteAttribute('uv');shell.setAttribute('edgeAlpha',new BufferAttribute(new Float32Array(alphas),1));shell=mergeVertices(shell,.0000001);shell.computeVertexNormals();rgba(shell,P.paper.clone().lerp(P.cold,.42),(_p,i)=>shell.getAttribute('edgeAlpha').getX(i),4);
  const co=shell.getAttribute('color');for(let i=0;i<co.count;i++){const edge=(co.getW(i)-.22)/.4,c=P.paper.clone().lerp(P.cold.clone().multiplyScalar(.35),1-edge);co.setXYZ(i,...c.toArray());}shell.deleteAttribute('edgeAlpha');local.push(shell);
  for(const g of local){g.rotateY(angle*Math.PI/180);g.translate(...at);gs.push(g);}
 }
 return gs;
}
