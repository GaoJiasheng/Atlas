/** Original Atlas CC0: spend exported triangles on curved pore lips. The dense
 * SDF samples are a build-time moving least-squares projection surface only. */
export function refineSponge(primitive,source,doc,buffer,maxTriangles=34500){
 const sp=source.position,sn=source.normal,sc=source.color,step=.00055,bins=new Map(),key=(x,y,z)=>`${x},${y},${z}`;
 for(let i=0;i<sp.length/3;i++){
  const k=key(Math.floor(sp[i*3]/step),Math.floor(sp[i*3+1]/step),Math.floor(sp[i*3+2]/step));
  let b=bins.get(k);if(!b)bins.set(k,b=[]);b.push(i);
 }
 const pp=Array.from(primitive.getAttribute('POSITION').getArray()),nn=Array.from(primitive.getAttribute('NORMAL').getArray()),cc=Array.from(primitive.getAttribute('COLOR_0').getArray()),ix=Array.from(primitive.getIndices().getArray()),edges=new Map();
 for(let t=0;t<ix.length;t+=3)for(let j=0;j<3;j++){
  const a=ix[t+j],b=ix[t+(j+1)%3],k=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(k))continue;
  const l=Math.hypot(...[0,1,2].map(j=>pp[a*3+j]-pp[b*3+j])),curve=1-Math.max(-1,Math.min(1,[0,1,2].reduce((s,j)=>s+nn[a*3+j]*nn[b*3+j],0)));
  // Mouth lips are bright-to-dark curved transitions. Deep floors receive no
  // extra triangles; relatively flat land does not compete with the lips.
  const ao=(cc[a*3]+cc[b*3])*.5,contrast=Math.abs(cc[a*3]-cc[b*3]);
  const score=l*l*curve*ao*Math.exp(-Math.pow(contrast/.18,2));if(l>.0004&&ao>.16&&ao<.90&&curve>.012)edges.set(k,{a,b,score});
 }
 const budget=Math.floor((maxTriangles-ix.length/3)/2),selected=[...edges.values()].sort((a,b)=>b.score-a.score).slice(0,budget),split=new Map();
 function closest(q){const cell=q.map(v=>Math.floor(v/step)),best=[];for(let z=-1;z<=1;z++)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)for(const i of bins.get(key(cell[0]+x,cell[1]+y,cell[2]+z))??[]){const d=[0,1,2].reduce((s,j)=>s+(sp[i*3+j]-q[j])**2,0);best.push({i,d});}return best.sort((a,b)=>a.d-b.d).slice(0,6);}
 for(const {a,b}of selected){let q=[0,1,2].map(j=>(pp[a*3+j]+pp[b*3+j])*.5),near;
  for(let iter=0;iter<3;iter++){near=closest(q);if(!near.length)break;const {i}=near[0],distance=[0,1,2].reduce((s,j)=>s+(q[j]-sp[i*3+j])*sn[i*3+j],0);q=q.map((v,j)=>v-distance*sn[i*3+j]);}
  near=closest(q);if(!near?.length)continue;const norm=[0,0,0],colour=[0,0,0];let total=0;
  for(const {i,d}of near){const w=1/(d+1e-10);total+=w;for(let j=0;j<3;j++){norm[j]+=sn[i*3+j]*w;colour[j]+=sc[i*3+j]*w;}}
  const length=Math.hypot(...norm),v=pp.length/3;pp.push(...q);nn.push(...norm.map(v=>v/length));cc.push(...colour.map(v=>v/total));split.set(a<b?`${a}:${b}`:`${b}:${a}`,v);
 }
 const output=[],mid=(a,b)=>split.get(a<b?`${a}:${b}`:`${b}:${a}`);
 for(let t=0;t<ix.length;t+=3){const a=ix[t],b=ix[t+1],c=ix[t+2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a),mask=(ab!==undefined?1:0)+(bc!==undefined?2:0)+(ca!==undefined?4:0);
  if(mask===0)output.push(a,b,c);
  if(mask===1)output.push(a,ab,c,ab,b,c);
  if(mask===2)output.push(a,b,bc,a,bc,c);
  if(mask===4)output.push(a,b,ca,ca,b,c);
  if(mask===3)output.push(a,ab,c,ab,bc,c,ab,b,bc);
  if(mask===6)output.push(a,b,ca,b,bc,ca,bc,c,ca);
  if(mask===5)output.push(a,ab,ca,ab,b,c,ab,c,ca);
  if(mask===7)output.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);
 }
 // The output topology differs from the dense SDF: transport its curvature
 // with angle-weighted normals instead of keeping normals from removed lips.
 const smooth=new Float64Array(nn.length);
 for(let t=0;t<output.length;t+=3){const ids=output.slice(t,t+3),a=ids.map(i=>pp.slice(i*3,i*3+3));const u=a[1].map((v,j)=>v-a[0][j]),v=a[2].map((v,j)=>v-a[0][j]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-15)continue;
  for(let k=0;k<3;k++){const u=a[(k+1)%3].map((v,j)=>v-a[k][j]),v=a[(k+2)%3].map((v,j)=>v-a[k][j]),angle=Math.acos(Math.max(-1,Math.min(1,u.reduce((sum,x,j)=>sum+x*v[j],0)/(Math.hypot(...u)*Math.hypot(...v)))));for(let j=0;j<3;j++)smooth[ids[k]*3+j]+=n[j]/l*angle;}
 }
 for(let i=0;i<nn.length;i+=3){const l=Math.hypot(smooth[i],smooth[i+1],smooth[i+2]);if(l)for(let j=0;j<3;j++)nn[i+j]=smooth[i+j]/l;}
 for(const [name,array]of [['POSITION',pp],['NORMAL',nn],['COLOR_0',cc]])primitive.setAttribute(name,doc.createAccessor().setType('VEC3').setArray(new Float32Array(array)).setBuffer(buffer));
 primitive.getIndices().setArray(new Uint32Array(output));console.log(`Sponge projected rim refinement: ${ix.length/3} → ${output.length/3} triangles, ${split.size} curved edges`);
}
