/** Deterministic build-time cloth compression; only baked geometry ships. */
import {BufferGeometry,BufferAttribute} from 'three';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export function crumpledCloth(part,P){
 const N=36,S=N+1,count=S*S,xyz=new Float64Array(count*3),old=new Float64Array(count*3),links=[];
 let seed=1234;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){
  const k=(i*S+j)*3,u=i/N,v=j/N,rag=.00012*(random()-.5);
  xyz[k]=(u-.5)*.105+rag;xyz[k+1]=.004*Math.sin(u*11+v*7)+.002*Math.sin(v*19-u*5);xyz[k+2]=(v-.5)*.105+rag;
  for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1],[2,0],[0,2]])if(i+di<=N&&j+dj<=N&&j+dj>=0)links.push([(i*S+j),((i+di)*S+j+dj),.105/N*Math.hypot(di,dj),di+Math.abs(dj)>1?.25:1]);
 }
 const cache='/private/tmp/states-of-matter-cloth-'+createHash('sha256').update(crumpledCloth.toString()).digest('hex').slice(0,16)+'.json';
 const cached=fs.existsSync(cache);if(cached)xyz.set(JSON.parse(fs.readFileSync(cache,'utf8')));
 old.set(xyz);
 // Gradual container compression creates folds without scaling their rest
 // lengths. Weak bending permits soft sharp creases instead of rigid origami.
 for(let step=0;!cached&&step<220;step++){
  const t=Math.min(1,step/170),rx=.078*(1-t)+.0315*t,rz=.078*(1-t)+.028*t,hy=.045*(1-t)+.009*t;
  for(let i=0;i<count;i++){const k=i*3;for(let c=0;c<3;c++){const x=xyz[k+c],speed=(x-old[k+c])*.55;old[k+c]=x;xyz[k+c]=x+speed;}xyz[k+1]+=.000001;}
  for(let iter=0;iter<12;iter++){
   for(const [a,b,l,w] of links){const A=a*3,B=b*3,dx=xyz[B]-xyz[A],dy=xyz[B+1]-xyz[A+1],dz=xyz[B+2]-xyz[A+2],d=Math.hypot(dx,dy,dz)||1,stiff=w===1?.48:.014,f=(d-l)/d*stiff;xyz[A]+=dx*f;xyz[A+1]+=dy*f;xyz[A+2]+=dz*f;xyz[B]-=dx*f;xyz[B+1]-=dy*f;xyz[B+2]-=dz*f;}
   for(let i=0;i<count;i++){const k=i*3,r=Math.hypot(xyz[k]/rx,xyz[k+2]/rz);if(r>1){xyz[k]/=r;xyz[k+2]/=r;}const cap=hy*(.5+.5*Math.sqrt(Math.max(0,1-Math.min(1,r)**2)));xyz[k+1]=Math.max(-cap,Math.min(cap,xyz[k+1]));}
   // Finite sheet separation, spatially hashed. Neighbouring mesh vertices
   // stay linked; distant patches cannot collapse onto the same free fold.
   const cells=new Map(),h=.0011;
   for(let i=0;i<count;i++){const k=i*3,c=[Math.floor(xyz[k]/h),Math.floor(xyz[k+1]/h),Math.floor(xyz[k+2]/h)];
    for(let z=-1;z<=1;z++)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)for(const j of cells.get([c[0]+x,c[1]+y,c[2]+z].join(','))??[]){if(Math.abs(Math.floor(i/S)-Math.floor(j/S))<=1&&Math.abs(i%S-j%S)<=1)continue;const b=j*3,dx=xyz[k]-xyz[b],dy=xyz[k+1]-xyz[b+1],dz=xyz[k+2]-xyz[b+2],d=Math.hypot(dx,dy,dz);if(d<h&&d>1e-8){const f=(h-d)/d*.5;xyz[k]+=dx*f;xyz[k+1]+=dy*f;xyz[k+2]+=dz*f;xyz[b]-=dx*f;xyz[b+1]-=dy*f;xyz[b+2]-=dz*f;}}
    const key=c.join(',');if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);
   }
  }
 }
 if(!cached)fs.writeFileSync(cache,JSON.stringify(Array.from(xyz)));
 // Subdivide the settled sheet with a smooth interpolant. This is a baked
 // displaced cloth surface, with a genuine unclosed free square perimeter.
 const R=N*3,pp=[],idx=[],color=[];
 const at=(i,j,c)=>xyz[(Math.max(0,Math.min(N,i))*S+Math.max(0,Math.min(N,j)))*3+c];
 const cubic=(a,b,c,d,t)=>b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));
 for(let i=0;i<=R;i++)for(let j=0;j<=R;j++){
  const u=i/3,v=j/3,ii=Math.floor(u),jj=Math.floor(v),fu=u-ii,fv=v-jj;
  for(let c=0;c<3;c++){const rows=[];for(let k=-1;k<=2;k++)rows.push(cubic(at(ii-1,jj+k,c),at(ii,jj+k,c),at(ii+1,jj+k,c),at(ii+2,jj+k,c),fu));pp.push(cubic(...rows,fv));}if(i===0||i===R||j===0||j===R){const k=pp.length-3,rag=.00011*Math.sin(i*2.73+j*4.17)+.000055*Math.sin(i*8.43+j*7.13);pp[k]+=rag;pp[k+2]-=rag*.8;}color.push(...P.paper.toArray());
 }
 for(let i=0;i<R;i++)for(let j=0;j<R;j++){const a=i*(R+1)+j,b=a+R+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(pp),3)).setAttribute('color',new BufferAttribute(new Float32Array(color),3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingBox();
 g.translate(0,.0083-g.boundingBox.max.y,0);g.translate(...part.primitive.at);return [g];
}
