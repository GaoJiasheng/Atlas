/** Original Atlas ice sculpture. RGBA MeshStandardMaterial only; no optics hook. */
import {BufferGeometry,BufferAttribute,Vector3,BoxGeometry,SphereGeometry,LatheGeometry,Vector2,CatmullRomCurve3} from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
function rgba(g,color,alpha,layer){const p=g.getAttribute('position'),c=new Float32Array(p.count*4);for(let i=0;i<p.count;i++)c.set([...color.toArray(),typeof alpha==='function'?alpha(p,i):alpha],i*4);g.setAttribute('color',new BufferAttribute(c,4));g.deleteAttribute('uv');g.userData.iceLayer=layer;return g;}
export function clearIce(_p,P){
 const base=[-1.48,0,.14],gs=[],dish=new LatheGeometry([[0,0],[.033,0],[.035,.001],[.042,.002],[.048,.004],[.05,.0055],[.05,.0065],[.049,.007],[.047,.0065],[.041,.0048],[.035,.004],[0,.004]].map(x=>new Vector2(...x)),80);dish.translate(...base);gs.push(rgba(dish,P.paper.clone().lerp(P.bone,.12),1,0));
 // Planar meltwater film, 0.3 mm over the dish's flat floor and wholly inside
 // it (the floor is flat to r = 35 mm). One pole vertex and exact plane
 // normals: no centre fan of repeated points, no rim crossing the rising wall.
 const pp=[base[0],.0043,base[2]],ii=[],N=40,RINGS=2;
 for(let r=1;r<=RINGS;r++)for(let k=0;k<N;k++){const a=k*Math.PI*2/N,rad=.0312*(r/RINGS)*(1+.04*Math.sin(a*3)+.025*Math.sin(a*7+.8));pp.push(base[0]+rad*Math.cos(a),.0043,base[2]+rad*.79*Math.sin(a));}
 for(let k=0;k<N;k++)ii.push(0,1+(k+1)%N,1+k);
 for(let r=0;r<RINGS-1;r++)for(let k=0;k<N;k++){const a=1+r*N+k,a2=1+r*N+(k+1)%N,b=a+N,b2=a2+N;ii.push(a,a2,b,b,a2,b2);}
 const film=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pp),3)).setAttribute('normal',new BufferAttribute(new Float32Array(pp.length).map((_,i)=>i%3===1?1:0),3));film.setIndex(ii);gs.push(rgba(film,P.paper.clone().lerp(P.cold,.08),.25,1));
 for(const [j,x,z,angle] of [[0,-.014,0,18],[1,.016,.006,-25]]){
  const local=[],half=j?.0118:.0125,radius=j?.0032:.0038,at=[base[0]+x,.00418+half,base[2]+z];
  // Trapped air in two irregular strings, large enough to read at beat size.
  let seed=419+j*1789;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(const [count,from,to] of j?[[8,[-.006,-.008,.004],[.005,.007,.005]],[6,[.007,-.005,-.003],[-.002,-.009,-.006]]]:[[8,[.006,-.008,.004],[-.005,.008,.005]],[6,[-.007,-.006,-.004],[.003,-.009,-.006]]])for(let k=0;k<count;k++){
   const u=(k+rand()*.6)/count,r=.00024+.00032*rand()**2,g=new SphereGeometry(1,6,4).scale(r,r*(1+.7*rand()),r*.85);
   g.translate(from[0]+(to[0]-from[0])*u+(rand()-.5)*.0016,from[1]+(to[1]-from[1])*u+(rand()-.5)*.0016,from[2]+(to[2]-from[2])*u+(rand()-.5)*.0016);local.push(rgba(g,P.paper,.38,2));
  }
  // Ragged white fracture sheets, turned to face the authored cameras: a
  // jittered centre line, uneven width and breaks along the length. Sheet
  // normals near the view axis are what make a crack read at about 100 px.
  const fractures=j?[
   [[-.0065,-.0095,-.003],[-.0045,-.004,-.0035],[.0005,.0005,-.002],[.0015,.006,.0005],[.0075,.0105,.001]],
   [[.0005,.0005,-.002],[.0055,.0025,.001],[.0095,.0015,.003]],
   [[-.0045,-.004,-.0035],[-.0085,-.0015,-.001]],
  ]:[
   [[-.0095,.0065,.003],[-.006,.004,.002],[-.002,.0005,.003],[.0005,-.0045,.001],[.0035,-.0095,-.002]],
   [[-.002,.0005,.003],[.0015,.0045,.002],[.0065,.0055,-.001]],
   [[.0065,-.0065,-.0055],[.0075,-.001,-.005],[.0055,.0025,-.004]],
   [[.0005,-.0045,.001],[.0055,-.0045,.0025]],
  ];
  const view=new Vector3(.05,.48,.87).normalize().applyAxisAngle(new Vector3(0,1,0),-angle*Math.PI/180);
  for(const [f,path]of fractures.entries()){
   const curve=new CatmullRomCurve3(path.map(p=>new Vector3(...p)),false,'catmullrom',.15),pp=[],cc=[],ix=[],N=12,vs=[-1,-.5,0,.5,1];
   let walk=419+f*83+j*5171;const jitter=()=>((walk=(Math.imul(walk,1664525)+1013904223)>>>0)/4294967296)-.5;
   for(let i=0;i<=N;i++){
    const u=i/N,taper=Math.sin(Math.PI*u)**.6,tangent=curve.getTangent(u),across=tangent.clone().cross(view).normalize(),centre=curve.getPoint(u).addScaledVector(across,jitter()*.0006*taper),width=(.00062+.00095*Math.abs(jitter())*2)*taper,strength=.5+.5*Math.abs(Math.sin(u*9.4+f*1.7+j));
    // A white core between thin cool shadow flanks: white alone vanishes against pale ice on a white dish.
    for(const v of vs){pp.push(...centre.clone().addScaledVector(across,v*width).toArray());const flank=Math.abs(v)===.5;cc.push(...(flank?P.cold.clone().multiplyScalar(.42):P.paper.clone().lerp(P.cold,.04)).toArray(),v===0?.03+.79*strength*Math.min(1,taper*2):flank?.34*Math.min(1,taper*2):.03);}
   }
   for(let i=0;i<N;i++)for(let k=0;k<vs.length-1;k++){const a=i*vs.length+k,b=a+vs.length;ix.push(a,b,a+1,a+1,b,b+1,a+1,b,a,b+1,b,a+1);}
   const g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pp),3)).setAttribute('color',new BufferAttribute(new Float32Array(cc),4));// Both windings share these vertices, so derived normals would cancel to zero and shade the crack dark.
   g.setAttribute('normal',new BufferAttribute(new Float32Array(pp.length/3*3).map((_,i)=>view.getComponent(i%3)),3));g.setIndex(ix);g.userData.iceLayer=3;local.push(g);
  }
  // Dense face sampling is necessary: the old rounded-box had unsampled flat
  // faces, so adding a sine displacement there produced only a plastic sheen.
  let shell=new BoxGeometry(half*2,half*2,half*2,18,18,18),ps=shell.getAttribute('position');
  const alphas=[];
  for(let i=0;i<ps.count;i++){
   const q=new Vector3().fromBufferAttribute(ps,i),c=q.clone().clampScalar(-half+radius,half-radius),n=q.clone().sub(c).normalize(),rounded=c.addScaledVector(n,radius),x=rounded.x,y=rounded.y,z=rounded.z,dist=[half-Math.abs(x),half-Math.abs(y),half-Math.abs(z)].sort((a,b)=>a-b)[1];
   // View-independent rounded edge band. Across each adjacent face its
   // opacity rises from .22 to .62 over the last 1.8 mm before the fillet.
   const edge=1-Math.min(1,Math.max(0,(dist-radius*(1-Math.SQRT1_2))/.00055)),melt=.00006*Math.sin(1250*x+310*z+j)*Math.sin(1120*y+210*z)+.00003*Math.sin(1460*z-620*y+j);
   ps.setXYZ(i,x+n.x*melt,y+n.y*melt,z+n.z*melt);alphas.push(.16+.035*edge*edge*(3-2*edge));
  }
  shell.deleteAttribute('normal');shell.deleteAttribute('uv');shell.setAttribute('edgeAlpha',new BufferAttribute(new Float32Array(alphas),1));shell=mergeVertices(shell,.0000001);shell.computeVertexNormals();rgba(shell,P.paper.clone().lerp(P.cold,.42),(_p,i)=>shell.getAttribute('edgeAlpha').getX(i),4);
  const co=shell.getAttribute('color');for(let i=0;i<co.count;i++){const c=P.cold.clone().multiplyScalar(.22);co.setXYZ(i,...c.toArray());}shell.deleteAttribute('edgeAlpha');local.push(shell);
  for(const g of local){g.rotateY(angle*Math.PI/180);g.translate(...at);gs.push(g);}
 }
 return gs;
}
