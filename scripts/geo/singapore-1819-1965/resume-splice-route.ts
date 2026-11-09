/** Internal source-coverage routing only. Every segment stays in a supplied
 * common-land or common-sea mask; this route must never define a map bank.
 */
export function maskRoute(o:{start:number[];target:number[];origin:number[];step:number;nx:number;ny:number;sampleStep:number;contains:(p:number[])=>boolean}):number[][]{
 const {start,target,origin,step,nx,ny,contains,sampleStep}=o;
 const at=(id:number)=>[origin[0]!+(id%nx)*step,origin[1]!+Math.floor(id/nx)*step];
 const segment=(a:number[],b:number[])=>{
  const n=Math.max(2,Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)/sampleStep));
  for(let i=1;i<n;i++)if(!contains([a[0]!+(b[0]!-a[0]!)*i/n,a[1]!+(b[1]!-a[1]!)*i/n]))return false;
  return true;
 };
 const valid=Uint8Array.from({length:nx*ny},(_,id)=>Number(contains(at(id))));
 const targetId=Math.round((target[1]!-origin[1]!)/step)*nx+Math.round((target[0]!-origin[0]!)/step);
 if(!valid[targetId])throw Error(`Splice destination is outside common source mask: ${target}`);
 // Begin at the known offshore component. The grid cell nearest the coastal
 // intersection can be an isolated sub-cell sliver; selecting it first can
 // falsely report no route although a nearby entry reaches the same sea.
 const previous=new Int32Array(valid.length).fill(-1),queue=[targetId];previous[targetId]=targetId;
 for(let i=0;i<queue.length;i++){
  const id=queue[i]!,x=id%nx,y=Math.floor(id/nx);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   if(!dx&&!dy)continue;
   const xx=x+dx,yy=y+dy,next=yy*nx+xx;
   if(xx<0||xx>=nx||yy<0||yy>=ny||!valid[next]||previous[next]!==-1)continue;
   if(dx&&dy&&(!valid[y*nx+xx]||!valid[yy*nx+x]))continue;
   if(!segment(at(id),at(next)))continue;
   previous[next]=id;queue.push(next);
  }
 }
 const startId=Array.from({length:valid.length},(_,id)=>id).filter(id=>previous[id]!==-1&&Math.hypot(at(id)[0]!-start[0]!,at(id)[1]!-start[1]!)<step*16)
  .sort((a,b)=>Math.hypot(at(a)[0]!-start[0]!,at(a)[1]!-start[1]!)-Math.hypot(at(b)[0]!-start[0]!,at(b)[1]!-start[1]!)).find(id=>segment(start,at(id)));
 if(startId===undefined)throw Error('No common-source-mask entry reaches the destination from the source coast intersection');
 const points:number[][]=[];
 for(let id=startId;;id=previous[id]!){points.push(at(id));if(id===targetId)break;}
 points.unshift(start);
 const route:number[][]=[];
 for(const p of points){
  while(route.length>1){const a=route.at(-2)!,b=route.at(-1)!;if(Math.abs((b[0]!-a[0]!)*(p[1]!-b[1]!)-(b[1]!-a[1]!)*(p[0]!-b[0]!))>step*step*1e-7)break;route.pop();}
  route.push(p);
 }
 for(let i=1;i<route.length;i++)if(!segment(route[i-1]!,route[i]!))throw Error('Splice simplification left the common source mask');
 return route;
}
