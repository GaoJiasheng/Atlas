/** Original Atlas CC0: cellulose kitchen sponge, 120 × 40 × 80 mm (S1).
 *
 * Two scales of one procedural open-cell structure, matching the cellulose
 * references in data/SOURCES.md (Cleaning sponge detail, Éponge type 3,
 * Sponge-viscose): pores are the voids left by packed, overlapping bubbles.
 *
 * - Fine pores, 0.2–1.7 mm: a periodic slab of overlapping spherical cells is
 *   cut by the outer surface. The depth to the first cell wall under each
 *   texel is the height field; its gradient is baked to a normal map and its
 *   depth and cavity shading to an occlusion map. Every face, the rounded cut
 *   edges and the walls of the large cavities carry it.
 * - Large cavities, 1.4–8 mm: real geometry. Clusters of overlapping cells are
 *   subtracted from a planar rounded block (straight cut edges), so mouths are irregular,
 *   undercut and open into further cells. Surface nets on a 0.28 mm grid, then
 *   meshoptimizer simplification.
 *
 * The dense mesh is cached in /private/tmp by a hash of this file.
 *
 * Metres, sponge frame (centre of the block). The caller places and ships it.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {BufferGeometry,BufferAttribute} from 'three';
import {MeshoptSimplifier} from 'meshoptimizer';

export const SPONGE_HALF=[.06,.02,.04],SPONGE_EDGE=.0035;
/** Fine-pore tile: period (m) and texels. */
export const TILE_METRES=.016,TILE_TEXELS=512;
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};

/* ---------------------------------------------------------------- tile -- */
/** Height field of the cut cell slab: 0 on the solid land of the cut face,
 * negative (metres) down to the first wall met inside an opened cell. Cells
 * are packed spherical voids of mixed size (the crystals that form a
 * cellulose sponge); where neighbouring cells overlap widely they open into
 * one another, so a mouth can lead on into a deeper cell. */
export function foamHeight(N=TILE_TEXELS,L=TILE_METRES){
 const random=rng(40213),depthMax=.0019,cells=[],size=()=>.00011*Math.pow(.00085/.00011,Math.pow(random(),1.35));
 // Cells cut by the face until their mouths cover about 0.55 of it (with
 // overlaps), then a sparser population of buried cells for the windows.
 let mouths=0;
 while(mouths<1.05*L*L){const r=size(),w=r*(-.55+1.2*random());cells.push([random()*L,random()*L,w,r]);mouths+=Math.PI*(r*r-Math.min(w*w,r*r));}
 let volume=0;
 while(volume<.30*L*L*depthMax){const r=size();cells.push([random()*L,random()*L,r*.4+random()*depthMax,r]);volume+=4/3*Math.PI*r**3;}
 const px=L/N,grid=new Map(),G=16,cell=L/G;
 for(const c of cells){const [x,y,,r]=c;for(let gx=Math.floor((x-r)/cell);gx<=Math.floor((x+r)/cell);gx++)for(let gy=Math.floor((y-r)/cell);gy<=Math.floor((y+r)/cell);gy++){const k=((gx%G)+G)%G+G*(((gy%G)+G)%G);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(c);}}
 const height=new Float32Array(N*N),spans=[];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const u=(i+.5)*px,v=(j+.5)*px;spans.length=0;
  for(const [x,y,w,r]of grid.get(Math.floor(u/cell)+G*Math.floor(v/cell))??[]){
   let dx=Math.abs(u-x),dy=Math.abs(v-y);dx=Math.min(dx,L-dx);dy=Math.min(dy,L-dy);const q=r*r-dx*dx-dy*dy;
   if(q>0){const s=Math.sqrt(q);spans.push([w-s,w+s]);}
  }
  // From the face, through a cell, and on only through a wide window.
  spans.sort((a,b)=>a[0]-b[0]);let reach=0,open=false;
  for(const [a,b]of spans){if(a<=(open?reach-.00009:0)){reach=Math.max(reach,b);open=true;}else if(open)break;}
  height[j*N+i]=-Math.min(reach,depthMax);
 }
 return {height,cells:cells.length,N,L};
}
function blur(src,N,sigma){
 const k=Math.ceil(sigma*3),w=[];for(let i=-k;i<=k;i++)w.push(Math.exp(-i*i/(2*sigma*sigma)));const s=w.reduce((a,b)=>a+b,0);
 const tmp=new Float32Array(N*N),out=new Float32Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){let v=0;for(let t=-k;t<=k;t++)v+=src[j*N+((i+t)%N+N)%N]*w[t+k];tmp[j*N+i]=v/s;}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){let v=0;for(let t=-k;t<=k;t++)v+=tmp[((j+t)%N+N)%N*N+i]*w[t+k];out[j*N+i]=v/s;}
 return out;
}
const srgb=x=>x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
/** Normal and occlusion maps of the fine pores, as JPEG bytes. */
export async function foamMaps(){
 const {height,N,L}=foamHeight(),px=L/N,h=blur(height,N,.9),wide=blur(height,N,6);
 const normal=Buffer.alloc(N*N*3),occlusion=Buffer.alloc(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const at=(a,b)=>h[((b%N)+N)%N*N+((a%N)+N)%N],dx=(at(i+1,j)-at(i-1,j))/(2*px),dy=(at(i,j+1)-at(i,j-1))/(2*px);
  // Glancing walls are steep; cap the slope so the map stays readable after mips.
  // glTF tangent space: +X towards +u, +Y towards the top of the image (-v).
  const nx=-clamp(dx,-3,3),ny=clamp(dy,-3,3),l=Math.hypot(nx,ny,1);
  normal[(j*N+i)*3]=Math.round((nx/l*.5+.5)*255);normal[(j*N+i)*3+1]=Math.round((ny/l*.5+.5)*255);normal[(j*N+i)*3+2]=Math.round((1/l*.5+.5)*255);
  const depth=-h[j*N+i],cavity=clamp((wide[j*N+i]-h[j*N+i])/.0006);
  const ao=(.72+.28*Math.exp(-depth/.00040))*(1-.08*cavity);
  occlusion[j*N+i]=Math.round(srgb(clamp(ao))*255);
 }
 // Occlusion keeps every texel; the normal map, whose detail the eye reads
 // less sharply than the dark cell mouths, ships at half resolution.
 const normalJpg=await sharp(normal,{raw:{width:N,height:N,channels:3}}).resize(N/2,N/2,{kernel:'lanczos3'}).jpeg({quality:76,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
 const occlusionJpg=await sharp(occlusion,{raw:{width:N,height:N,channels:1}}).toColourspace('b-w').jpeg({quality:74,mozjpeg:true}).toBuffer();
 return {normalJpg,occlusionJpg,N,L};
}

/* --------------------------------------------------------------- block -- */
function roundedBox(x,y,z){
 const [hx,hy,hz]=SPONGE_HALF,r=SPONGE_EDGE,a=Math.abs(x)-hx+r,b=Math.abs(y)-hy+r,c=Math.abs(z)-hz+r;
 return Math.hypot(Math.max(a,0),Math.max(b,0),Math.max(c,0))+Math.min(Math.max(a,b,c),0)-r;
}
function boxNormal(x,y,z){const e=1e-5,n=[roundedBox(x+e,y,z)-roundedBox(x-e,y,z),roundedBox(x,y+e,z)-roundedBox(x,y-e,z),roundedBox(x,y,z+e)-roundedBox(x,y,z-e)],l=Math.hypot(...n)||1;return n.map(v=>v/l);}
/** Inward relief of the cut faces beyond the pores and cavities: none. A
 * factory-cut cellulose block keeps planar faces and straight edges. */
function unevenness(){return 0;}
/** Large cavities: clusters of overlapping cells under every face and edge. */
function cavityCells(){
 const random=rng(51787),[hx,hy,hz]=SPONGE_HALF,faces=[[hy*2*hz*2,0],[hx*2*hz*2,1],[hx*2*hy*2,2]],cells=[],mouths=[];
 const area=2*(faces[0][0]+faces[1][0]+faces[2][0]);
 const count=900;
 // A cell must not reach within 0.8 mm of any face but its own.
 const breaches=(c,rr,own)=>[0,1,2].some(k=>k!==own&&Math.abs(c[k])+rr>SPONGE_HALF[k]-.0008);
 for(let n=0;n<count;n++){
  // Area-weighted point on the block, projected onto the rounded surface.
  let pick=random()*area,axis=0,sign=1;
  for(const [a,ax]of faces){if(pick<2*a){axis=ax;sign=pick<a?-1:1;break;}pick-=2*a;}
  const q=[(random()*2-1)*hx,(random()*2-1)*hy,(random()*2-1)*hz];q[axis]=sign*SPONGE_HALF[axis];
  // Fewer on the underside, and fewer on the top so it does not read as cratered.
  if(axis===1&&random()<(sign<0?.55:.35))continue;
  const r=.0010*Math.pow(3.9,Math.pow(random(),1.7)),t=.05+.35*random(),mouthR=r*Math.sqrt(1-t*t);
  // Cut faces keep straight edges: a mouth sits wholly on its face, except a
  // few small ones that may notch an edge.
  const notch=mouthR<.0014&&random()<.08;
  if(!notch&&[0,1,2].some(k=>k!==axis&&Math.abs(q[k])>SPONGE_HALF[k]-SPONGE_EDGE-1.9*mouthR-.0008))continue;
  const inner=q.map((v,k)=>clamp(v,-(SPONGE_HALF[k]-SPONGE_EDGE),SPONGE_HALF[k]-SPONGE_EDGE)),d=q.map((v,k)=>v-inner[k]),dl=Math.hypot(...d)||1;
  const surface=inner.map((v,k)=>v+d[k]/dl*SPONGE_EDGE),normal=boxNormal(...surface);
  const centre=surface.map((v,k)=>v-normal[k]*r*t);
  const ok=cells.every(c=>Math.hypot(...c.c.map((v,k)=>v-centre[k]))>(c.r+r)*.55);
  if(!ok)continue;
  const first=cells.length;cells.push({c:centre,r});
  const mouth={axis:Math.abs(normal[0])>.7?0:Math.abs(normal[1])>.7?1:Math.abs(normal[2])>.7?2:-1,normal,point:surface,radius:r*Math.sqrt(1-t*t),centre,r,t};mouths.push(mouth);
  // Oblong and lobed mouths: neighbouring cells along the surface.
  const tangent=[normal[1]-normal[2],normal[2]-normal[0],normal[0]-normal[1]],tl=Math.hypot(...tangent)||1,a=random()*Math.PI*2;
  const t1=tangent.map(v=>v/tl),t2=[normal[1]*t1[2]-normal[2]*t1[1],normal[2]*t1[0]-normal[0]*t1[2],normal[0]*t1[1]-normal[1]*t1[0]];
  const lobes=random()<.55?1+Math.floor(random()*2):0;
  for(let k=0;k<lobes;k++){const rr=r*(.55+.35*random()),off=r*(.75+.3*random()),b=a+k*2.3,c=centre.map((v,i)=>v+(t1[i]*Math.cos(b)+t2[i]*Math.sin(b))*off-normal[i]*rr*(.2+.5*random()));if(notch||!breaches(c,rr,axis))cells.push({c,r:rr});}
  // Deeper cells opening off the floor: the cavity continues into the block.
  if(random()<.85){const rr=r*(.6+.4*random()),c=centre.map((v,i)=>v-normal[i]*(r*.85+rr*.55)+(t1[i]*Math.cos(a+1)+t2[i]*Math.sin(a+1))*r*.35);if(notch||!breaches(c,rr,axis))cells.push({c,r:rr});}
  mouth.cells=cells.slice(first);
 }
 return {cells,mouths};
}

/** Signed field: positive outside the sponge material. */
function makeField(){
 const {cells,mouths}=cavityCells(),STEP=.004,bins=new Map(),key=(i,j,k)=>(i+64)+128*((j+64)+128*(k+64));
 for(const c of cells){const lo=c.c.map(v=>Math.floor((v-c.r)/STEP)),hi=c.c.map(v=>Math.floor((v+c.r)/STEP));for(let i=lo[0];i<=hi[0];i++)for(let j=lo[1];j<=hi[1];j++)for(let k=lo[2];k<=hi[2];k++){const s=key(i,j,k);if(!bins.has(s))bins.set(s,[]);bins.get(s).push(c);}}
 const field=(x,y,z)=>{
  let d=roundedBox(x,y,z);if(d>.0012)return d;d+=unevenness(x,y,z);
  if(d<-.010)return d;
  let hole=Infinity;for(const c of bins.get(key(Math.floor(x/STEP),Math.floor(y/STEP),Math.floor(z/STEP)))??[]){const v=Math.hypot(x-c.c[0],y-c.c[1],z-c.c[2])-c.r;if(v<hole)hole=v;}
  if(hole===Infinity)return d;
  // Rounded rims: a small smooth subtraction.
  const k=.00022,hh=clamp(.5+.5*(d+hole)/k);return d*hh+(-hole)*(1-hh)+k*hh*(1-hh);
 };
 return {field,cells,mouths};
}

/** Naive surface nets over a regular grid. */
function surfaceNets(field,lo,hi,h){
 const n=lo.map((v,k)=>Math.ceil((hi[k]-v)/h)+1),[nx,ny,nz]=n,values=new Float32Array(nx*ny*nz);
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)values[i+nx*(j+ny*k)]=field(lo[0]+i*h,lo[1]+j*h,lo[2]+k*h);
 const index=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1),positions=[],cornerOffsets=[];
 for(let c=0;c<8;c++)cornerOffsets.push([c&1,(c>>1)&1,(c>>2)&1]);
 const edges=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
 for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
  let mask=0;const v=cornerOffsets.map(([a,b,c],m)=>{const value=values[(i+a)+nx*((j+b)+ny*(k+c))];if(value<0)mask|=1<<m;return value;});
  if(mask===0||mask===255)continue;
  let sx=0,sy=0,sz=0,count=0;
  for(const [a,b]of edges){if((v[a]<0)===(v[b]<0))continue;const t=v[a]/(v[a]-v[b]),pa=cornerOffsets[a],pb=cornerOffsets[b];sx+=pa[0]+(pb[0]-pa[0])*t;sy+=pa[1]+(pb[1]-pa[1])*t;sz+=pa[2]+(pb[2]-pa[2])*t;count++;}
  index[i+(nx-1)*(j+(ny-1)*k)]=positions.length/3;positions.push(lo[0]+(i+sx/count)*h,lo[1]+(j+sy/count)*h,lo[2]+(k+sz/count)*h);
 }
 const cellAt=(i,j,k)=>index[i+(nx-1)*(j+(ny-1)*k)],tris=[];
 const quad=(a,b,c,d,flip)=>{if([a,b,c,d].some(v=>v<0))return;if(flip)tris.push(a,c,b,a,d,c);else tris.push(a,b,c,a,c,d);};
 for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){
  const v0=values[i+nx*(j+ny*k)]<0;
  if(i<nx-1&&(values[(i+1)+nx*(j+ny*k)]<0)!==v0)quad(cellAt(i,j-1,k-1),cellAt(i,j,k-1),cellAt(i,j,k),cellAt(i,j-1,k),!v0);
  if(j<ny-1&&(values[i+nx*((j+1)+ny*k)]<0)!==v0)quad(cellAt(i-1,j,k-1),cellAt(i-1,j,k),cellAt(i,j,k),cellAt(i,j,k-1),!v0);
  if(k<nz-1&&(values[i+nx*(j+ny*(k+1))]<0)!==v0)quad(cellAt(i-1,j-1,k),cellAt(i,j-1,k),cellAt(i,j,k),cellAt(i-1,j,k),!v0);
 }
 return {positions:new Float32Array(positions),indices:new Uint32Array(tris)};
}

/** The sponge mesh: position, normal, occlusion colour and face-projected UV
 * (tile units, so the fine-pore maps repeat every TILE_METRES). */
export function celluloseSponge({grid=.00028,triangles=25000}={}){
 const key=createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).update(JSON.stringify({grid,triangles})).digest('hex').slice(0,20);
 const cache=`/private/tmp/states-of-matter-cellulose-${key}.json`;
 let built;
 if(fs.existsSync(cache))built=JSON.parse(fs.readFileSync(cache,'utf8'));
 else{
  const {field,cells,mouths}=makeField(),pad=.0012,lo=SPONGE_HALF.map(v=>-v-pad),hi=SPONGE_HALF.map(v=>v+pad);
  const dense=surfaceNets(field,lo,hi,grid);
  const gradient=(x,y,z)=>{const e=.00004,n=[field(x+e,y,z)-field(x-e,y,z),field(x,y+e,z)-field(x,y-e,z),field(x,y,z+e)-field(x,y,z-e)],l=Math.hypot(...n)||1;return n.map(v=>v/l);};
  const P=dense.positions,normals=new Float32Array(P.length);
  for(let i=0;i<P.length;i+=3)normals.set(gradient(P[i],P[i+1],P[i+2]),i);
  // Depth below the uneven face rides along as an attribute: collapses across
  // a cavity wall cost more than collapses on the open faces, so the budget
  // goes to the cavity mouths and walls.
  const attributes=new Float32Array(P.length/3*4);
  for(let i=0;i<P.length/3;i++){attributes.set(normals.subarray(i*3,i*3+3),i*4);attributes[i*4+3]=Math.min(.004,Math.max(0,-(roundedBox(P[i*3],P[i*3+1],P[i*3+2])+unevenness(P[i*3],P[i*3+1],P[i*3+2]))))/.004;}
  const [ix,error]=MeshoptSimplifier.simplifyWithAttributes(dense.indices,P,3,attributes,4,[.0006,.0006,.0006,.02],null,triangles*3,.0003,['ErrorAbsolute']);
  built={positions:Array.from(P),normals:Array.from(normals),indices:Array.from(ix),dense:dense.indices.length/3,error,cells:cells.length,mouths};
  fs.writeFileSync(cache,JSON.stringify(built));
 }
 // A cavity's walls and floor are unrolled about its first cell like an
 // equidistant map of a bowl: the deepest point at the centre, the rim on its
 // own place in the face projection. One continuous chart per cavity, so the
 // cells inside are neither stretched nor seamed.
 const MB=.008,mouthBins=new Map(),mk=(i,j,k)=>(i+32)+64*((j+32)+64*(k+32));
 for(const m of built.mouths){const g=m.centre.map(v=>Math.floor(v/MB));for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){const s=mk(g[0]+i,g[1]+j,g[2]+k);if(!mouthBins.has(s))mouthBins.set(s,[]);mouthBins.get(s).push(m);}}
 function unrolled(p,axis,sign){
  const [iu,iv]=axis===0?[2,1]:axis===1?[0,2]:[0,1];let best,score=Infinity;
  for(const m of mouthBins.get(mk(...p.map(v=>Math.floor(v/MB))))??[])for(const c of m.cells){const d=Math.abs(Math.hypot(p[0]-c.c[0],p[1]-c.c[1],p[2]-c.c[2])-c.r);if(d<score){score=d;best=m;}}
  if(!best||score>.0012)return [p[iu],p[iv]];
  const a=[0,0,0];a[axis]=sign;const q=p.map((v,k)=>v-best.centre[k]),ql=Math.hypot(...q)||1e-9,theta=Math.acos(clamp(-(q[axis]*sign)/ql,-1,1));
  const rim=Math.PI-Math.acos(clamp(best.t,-1,1)),k=Math.sqrt(Math.max(0,1-best.t*best.t))/rim,dl=Math.hypot(q[iu],q[iv])||1e-9;
  return [best.centre[iu]+q[iu]/dl*ql*theta*k,best.centre[iv]+q[iv]/dl*ql*theta*k];
 }
 // Compact, then split along the face-projection seams.
 const used=new Map(),pos=[],nor=[],col=[],uv=[],out=[];
 const offsets=[[.31,.07],[.63,.41],[.17,.83],[.52,.29],[.88,.61],[.04,.47]];
 for(let t=0;t<built.indices.length;t+=3){
  // Each face projects along its own axis; the seams fall on the rounded edges.
  const ids=[0,1,2].map(k=>built.indices[t+k]),c=[0,1,2].map(a=>ids.reduce((s,i)=>s+built.positions[i*3+a],0)/3),bn=boxNormal(...c);
  const axis=[0,1,2].reduce((m,a)=>Math.abs(bn[a])>Math.abs(bn[m])?a:m,0),face=axis*2+(bn[axis]>0?1:0);
  for(const i of ids){
   const k=i*6+face;let v=used.get(k);
   if(v===undefined){
    v=pos.length/3;used.set(k,v);const p=[0,1,2].map(a=>built.positions[i*3+a]);pos.push(...p);
    // On the open faces the shading normal is the block's own, so long faces
    // triangles that reach a rim do not carry its tilt across the face.
    const own=[0,1,2].map(a=>built.normals[i*3+a]),flat=boxNormal(...p),dLand=Math.max(0,-roundedBox(...p)),wf=1-smooth(dLand/.00025),mixed=own.map((v,a)=>v*(1-wf)+flat[a]*wf),ml=Math.hypot(...mixed)||1;nor.push(...mixed.map(v=>v/ml));
    // Occlusion inside the large cavities, from depth below the uneven face.
    const depth=Math.max(0,-(roundedBox(...p)+unevenness(...p)));const ao=1-.74*smooth((depth-.0003)/.0019);col.push(ao,ao,ao);
    const [iu,iv]=axis===0?[2,1]:axis===1?[0,2]:[0,1],planar=[p[iu],p[iv]],at=depth>0?unrolled(p,axis,bn[axis]>0?1:-1):planar;
    // Blend from the face's own projection at the rim to the unrolled cavity.
    const w=smooth(depth/.0008);uv.push((planar[0]+w*(at[0]-planar[0]))/TILE_METRES+offsets[face][0],(planar[1]+w*(at[1]-planar[1]))/TILE_METRES+offsets[face][1]);
   }
   out.push(v);
  }
 }
 const g=new BufferGeometry();
 g.setAttribute('position',new BufferAttribute(new Float32Array(pos),3));g.setAttribute('normal',new BufferAttribute(new Float32Array(nor),3));
 g.setAttribute('color',new BufferAttribute(new Float32Array(col),3));g.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));g.setIndex(out);
 g.userData.spongeStructure={cavityCells:built.cells,mouths:built.mouths.length,denseTriangles:built.dense,triangles:out.length/3,simplifyErrorMetres:built.error,tileMetres:TILE_METRES,tileTexels:TILE_TEXELS};
 g.userData.mouths=built.mouths;
 return g;
}
