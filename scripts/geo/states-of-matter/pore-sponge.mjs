/** Original Atlas CC0: explicit curved cellulose pore lips, not a decimated
 * marching-cube contour. Open throats lead into a shared interior air volume.
 * All faces are perforated, including the vertical walls. Metres. */
import {BufferGeometry,Float32BufferAttribute,ShapeUtils,Vector2,Vector3} from 'three';
export function poreSponge(){
 const pos=[],colour=[],indices=[],authoredNormals=new Map(),half=[.06,.02,.04],r=.006,at=[-.45,.035,.14],proof=[];
 let seed=91731;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 function vertex(q,ao=1,normal){const id=pos.length/3;pos.push(...q);colour.push(ao,ao,ao);if(normal)authoredNormals.set(id,normal);return id;}
 function tri(a,b,c){indices.push(a,b,c);}
 function face(axis,sign){
  const u=(axis+1)%3,v=(axis+2)%3,U=half[u]-r,V=half[v]-r,holes=[],cells=[],target=axis===1?(sign>0?120:4):axis===0?28:66;
  for(let i=0;i<target;i++){
   const big=rand()<.12,rad=big?.0022+.0017*rand():.00048+.00165*rand()**1.7,aspect=.67+.66*rand(),angle=rand()*Math.PI,phase=rand()*6.28;
   let x,z,ok=false;
   for(let k=0;k<150;k++){x=(rand()*2-1)*(U-rad*1.55);z=(rand()*2-1)*(V-rad*1.55);if(cells.every(h=>Math.hypot(x-h.x,z-h.z)>rad*1.4+h.rad*1.4+.00014)){ok=true;break;}}
   if(!ok)continue;
   const N=rad>.0022?32:rad>.0011?20:12,ring=[];
   // Low-order unequal lobes are actual outline geometry, never angular stars.
   for(let k=0;k<N;k++){const a=k*2*Math.PI/N,rr=rad*(1+.12*Math.sin(a*2+phase)+.075*Math.sin(a*3-phase));const xx=rr*Math.cos(a)*aspect,zz=rr*Math.sin(a)/Math.sqrt(aspect);ring.push(new Vector2(x+xx*Math.cos(angle)-zz*Math.sin(angle),z+xx*Math.sin(angle)+zz*Math.cos(angle)));}
   cells.push({x,z,rad,ring,N});holes.push(ring);
  }
  const rect=[new Vector2(-U,-V),new Vector2(U,-V),new Vector2(U,V),new Vector2(-U,V)],all=[rect,...holes].flat(),ids=all.map(p=>{const q=[0,0,0];q[axis]=sign*half[axis];q[u]=p.x;q[v]=p.y;const n=[0,0,0];n[axis]=sign;return vertex(q,1,n);});
  for(const t of ShapeUtils.triangulateShape(rect,holes)){const [a,b,c]=t.map(i=>ids[i]);if(sign>0)tri(a,b,c);else tri(a,c,b);}
  let offset=4;
  for(const h of cells){const rings=[ids.slice(offset,offset+h.N)];offset+=h.N;const depth=.0016+.0016*rand();
   for(const [scale,d]of [[.89,.00055],[.77,depth]]){
    rings.push(h.ring.map(p=>{const q=[0,0,0];q[axis]=sign*(half[axis]-d);q[u]=h.x+(p.x-h.x)*scale;q[v]=h.z+(p.y-h.z)*scale;const normal=[0,0,0],dx=p.x-h.x,dz=p.y-h.z,l=Math.hypot(dx,dz);normal[axis]=sign*(d<.001?.70:.15);normal[u]=-dx/l*(d<.001?.72:.99);normal[v]=-dz/l*(d<.001?.72:.99);return vertex(q,d<.001?.85:.30,normal);}));
   }
   for(let j=0;j<rings.length-1;j++)for(let k=0;k<h.N;k++){const a=rings[j][k],b=rings[j][(k+1)%h.N],c=rings[j+1][k],d=rings[j+1][(k+1)%h.N];if(sign>0){tri(a,c,b);tri(b,c,d);}else{tri(a,b,c);tri(b,d,c);}}
   // Recessed, partly open cell septum: deep shade with a genuine throat
   // into the adjoining air space, rather than a bright opposite outside face.
   const q=[0,0,0];q[axis]=sign*(half[axis]-depth-.0005);q[u]=h.x;q[v]=h.z;const centreNormal=[0,0,0];centreNormal[axis]=sign;const centreId=vertex(q,.10,centreNormal),inner=rings[2];
   for(let k=0;k<Math.floor(h.N*.74);k++){if(sign>0)tri(inner[k],centreId,inner[(k+1)%h.N]);else tri(inner[k],inner[(k+1)%h.N],centreId);}
   const centre=[0,0,0];centre[axis]=sign*half[axis];centre[u]=h.x;centre[v]=h.z;proof.push({axis,sign,radius:h.rad,point:centre.map((x,k)=>x+at[k]),segments:h.N});
  }
 }
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1])face(axis,sign);
 // Twelve quarter-cylinder edges, continuous with the planar lands.
 for(let along=0;along<3;along++){const a=(along+1)%3,b=(along+2)%3;for(const sa of [-1,1])for(const sb of [-1,1]){
  const rows=[];for(let i=0;i<=4;i++){const row=[];for(let k=0;k<=12;k++){const t=k*Math.PI/24,q=[0,0,0];q[along]=(i/4*2-1)*(half[along]-r);q[a]=sa*(half[a]-r+r*Math.cos(t));q[b]=sb*(half[b]-r+r*Math.sin(t));row.push(vertex(q));}rows.push(row);}
  for(let i=0;i<4;i++)for(let k=0;k<12;k++){const A=rows[i][k],B=rows[i+1][k],C=rows[i][k+1],D=rows[i+1][k+1];if(sa*sb>0){tri(A,C,B);tri(B,C,D);}else{tri(A,B,C);tri(B,D,C);}}
 }}
 for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){
  const rows=[];for(let i=0;i<=10;i++){const row=[];for(let k=0;k<=10;k++){const a=i*Math.PI/20,b=k*Math.PI/20;row.push(vertex([sx*(half[0]-r+r*Math.sin(a)*Math.cos(b)),sy*(half[1]-r+r*Math.cos(a)),sz*(half[2]-r+r*Math.sin(a)*Math.sin(b))]));}rows.push(row);}
  for(let i=0;i<10;i++)for(let k=0;k<10;k++){const A=rows[i][k],B=rows[i+1][k],C=rows[i][k+1],D=rows[i+1][k+1];if(sx*sy*sz>0){tri(A,C,B);tri(B,C,D);}else{tri(A,B,C);tri(B,D,C);}}
 }
 // Keep the planar lands planar: a nonlinear displacement of long
 // triangulation bridges created visible bands in the rejected second look.
 for(let i=0;i<pos.length;i++)pos[i]+=at[i%3];
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(pos,3)).setAttribute('color',new Float32BufferAttribute(colour,3));g.setIndex(indices);g.computeVertexNormals();const normal=g.getAttribute('normal');for(const [i,n]of authoredNormals){const v=new Vector3(...n).normalize();normal.setXYZ(i,v.x,v.y,v.z);}g.userData.poreProof=proof;return g;
}
