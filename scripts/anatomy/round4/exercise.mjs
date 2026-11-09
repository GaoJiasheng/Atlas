import {Matrix4,Vector3} from 'three';
/** Weight correction confined to the exercise skin. Elbow flexion and forearm
 * pronation no longer enter through the same broad upper-arm blend. */
export function correctForearmWeights(doc){
 const body=doc.getRoot().listNodes().find(n=>n.getName()==='skin-outline'),p=body.getMesh().listPrimitives()[0],skin=body.getSkin(),joints=skin.listJoints(),pa=p.getAttribute('POSITION'),ja=p.getAttribute('JOINTS_0'),wa=p.getAttribute('WEIGHTS_0'),ibm=skin.getInverseBindMatrices(),matrices=joints.map((j,i)=>new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm.getElement(i,[]))))
 ,smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)},outJ=new Uint8Array(pa.getCount()*4),outW=new Uint8Array(outJ.length);let changed=0;
 for(let i=0;i<pa.getCount();i++){
  const js=ja.getElement(i,[]),ws=wa.getElement(i,[]),point=new Vector3(),v=new Vector3().fromArray(pa.getElement(i,[]));for(let k=0;k<4;k++)if(ws[k])point.addScaledVector(v.clone().applyMatrix4(matrices[js[k]]),ws[k]);const weights=new Map();for(let k=0;k<4;k++)weights.set(js[k],(weights.get(js[k])??0)+ws[k]);
  for(const side of['l','r']){const f=joints.findIndex(j=>j.getName()==='joint.forearm.'+side),e=joints.findIndex(j=>j.getName()==='joint.elbow.'+side),h=joints.findIndex(j=>j.getName()==='joint.hand.'+side),w=weights.get(f)??0;if(!w)continue;const a=new Vector3().setFromMatrixPosition(new Matrix4().fromArray(joints[e].getWorldMatrix())),b=new Vector3().setFromMatrixPosition(new Matrix4().fromArray(joints[h].getWorldMatrix())),axis=b.sub(a),t=point.clone().sub(a).dot(axis)/axis.lengthSq(),twist=smooth((t-.10)/.75);weights.set(f,w*twist);weights.set(e,(weights.get(e)??0)+w*(1-twist));changed++;}
  const top=[...weights].filter(([,w])=>w>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((n,[,w])=>n+w,0);let used=0;for(let k=0;k<top.length;k++){outJ[i*4+k]=top[k][0];outW[i*4+k]=Math.floor(top[k][1]/sum*255);used+=outW[i*4+k];}outW[i*4]+=255-used;
 }
 ja.setArray(outJ);wa.setArray(outW).setNormalized(true);return changed;
}
/** A continuous vertex field, with a zero-alpha triangle collar outside its
 * support. The field crosses face interiors instead of following whole faces. */
export function featherMasks(doc){
 const nodes=doc.getRoot().listNodes(),bp=nodes.find(n=>n.getName()==='skin-outline').getMesh().listPrimitives()[0],count=bp.getAttribute('POSITION').getCount(),indices=bp.getIndices().getArray(),adj=Array.from({length:count},()=>new Set()),faces=[];
 for(let i=0;i<indices.length;i+=3){const f=Array.from(indices.subarray(i,i+3));faces.push(f);for(let k=0;k<3;k++){adj[f[k]].add(f[(k+1)%3]);adj[f[(k+1)%3]].add(f[k]);}}
 const stats=[];
 const rectusFaces=new Set(nodes.filter(n=>n.getName().startsWith('exercise-rectus-abdominis')).flatMap(n=>{const a=n.getMesh().listPrimitives()[0].getIndices().getArray();return Array.from({length:a.length/3},(_,i)=>Array.from(a.slice(i*3,i*3+3)).sort((a,b)=>a-b).join(','));}));
 for(const n of [...nodes].sort((a,b)=>Number(b.getName().startsWith('exercise-rectus-abdominis'))-Number(a.getName().startsWith('exercise-rectus-abdominis')))){if(!n.getName().startsWith('exercise-'))continue;const p=n.getMesh().listPrimitives()[0],old=p.getIndices().getArray(),selected=new Set(old),visited=new Set(),components=[];
  for(const v of selected){if(visited.has(v))continue;const component=[],queue=[v];visited.add(v);while(queue.length){const a=queue.pop();component.push(a);for(const b of adj[a])if(selected.has(b)&&!visited.has(b)){visited.add(b);queue.push(b);}}components.push(component);}
  const largest=Math.max(...components.map(c=>c.length)),kept=new Set(components.filter(c=>c.length>=Math.max(3,largest*.04)).flat());
  let weight=new Float32Array(count);for(const v of kept)weight[v]=1;
  for(let pass=0;pass<8;pass++){const next=new Float32Array(count);for(let i=0;i<count;i++){let sum=0;for(const b of adj[i])sum+=weight[b];next[i]=weight[i]*.45+sum/Math.max(1,adj[i].size)*.55;}weight=next;}
  const peak=Math.max(...weight);if(peak>0&&peak<.5)for(let i=0;i<count;i++)weight[i]/=peak;
  const alpha=new Uint8Array(count*4);for(let i=0;i<count;i++){let t=Math.min(1,Math.max(0,(weight[i]-.18)/.64));t=t*t*(3-2*t);alpha.set([255,255,255,Math.round(t*255)],i*4);}
  const isOblique=/oblique/.test(n.getName()),result=[];for(const f of faces){if(!f.some(v=>alpha[v*4+3]>0))continue;if(isOblique&&rectusFaces.has([...f].sort((a,b)=>a-b).join(',')))continue;result.push(...f);}
  if(n.getName().startsWith('exercise-rectus-abdominis'))for(let i=0;i<result.length;i+=3)rectusFaces.add(result.slice(i,i+3).sort((a,b)=>a-b).join(','));
  p.setIndices(doc.createAccessor(n.getName()+'-feather-faces').setType('SCALAR').setArray(Uint16Array.from(result)).setBuffer(bp.getIndices().getBuffer()));p.setAttribute('COLOR_0',doc.createAccessor(n.getName()+'-feather').setType('VEC4').setArray(alpha).setNormalized(true).setBuffer(bp.getIndices().getBuffer()));
  // Exercise normalScale is zero in the accepted PartNode path. Its unused
  // shared UV buffer can fund anatomy precision without changing the body.
  p.setAttribute('TEXCOORD_0',null);
  stats.push({node:n.getName(),before:old.length/3,after:result.length/3,removedIslands:components.filter(c=>!kept.has(c[0])).length,intermediateAlpha:Array.from(alpha).filter((v,i)=>i%4===3&&v>0&&v<255).length});
 }
 return stats;
}
/** Only the rebuilt exercise figure is simplified; native muscle/bone topology
 * and the complete original rectus are excluded. */
export async function simplifyExerciseBody(doc,topic){
 if(!['core','chest','back'].includes(topic))return null;
 const {MeshoptSimplifier}=await import('meshoptimizer');await MeshoptSimplifier.ready;
 const p=doc.getRoot().listNodes().find(n=>n.getName()==='skin-outline').getMesh().listPrimitives()[0],a=p.getAttribute('POSITION'),skin=doc.getRoot().listNodes().find(n=>n.getName()==='skin-outline').getSkin(),j=skin.listJoints()[0],m=new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(skin.getInverseBindMatrices().getElement(0,[]))),pa=new Float32Array(a.getCount()*3);for(let i=0;i<a.getCount();i++)new Vector3().fromArray(a.getElement(i,[])).applyMatrix4(m).toArray(pa,i*3);
 const before=p.getIndices().getCount()/3,[idx,error]=MeshoptSimplifier.simplify(Uint32Array.from(p.getIndices().getArray()),pa,3,27000*3,.00030,['LockBorder','ErrorAbsolute']);p.setIndices(doc.createAccessor('exercise-figure-budget').setType('SCALAR').setArray(idx).setBuffer(a.getBuffer()));return{before,after:idx.length/3,maxErrorM:error};
}
export async function compactExerciseBody(doc){
 const {MeshoptSimplifier}=await import('meshoptimizer'),{compactPrimitive}=await import('@gltf-transform/functions');await MeshoptSimplifier.ready;
 const nodes=doc.getRoot().listNodes(),bp=nodes.find(n=>n.getName()==='skin-outline').getMesh().listPrimitives()[0],[remap,count]=MeshoptSimplifier.compactMesh(Uint32Array.from(bp.getIndices().getArray())),original=new Map(bp.listSemantics().map(s=>[s,bp.getAttribute(s)]));
 compactPrimitive(bp,remap,count);
 for(const n of nodes){if(!n.getName().startsWith('exercise-'))continue;const p=n.getMesh().listPrimitives()[0],index=p.getIndices();index.setArray(Uint16Array.from(index.getArray(),i=>remap[i]));const alpha=p.getAttribute('COLOR_0'),old=alpha.getArray(),next=new Uint8Array(count*4);for(let i=0;i<remap.length;i++)if(remap[i]<count)next.set(old.subarray(i*4,i*4+4),remap[i]*4);alpha.setArray(next);for(const [s,a]of original)if(p.getAttribute(s)===a)p.setAttribute(s,bp.getAttribute(s));}
}
