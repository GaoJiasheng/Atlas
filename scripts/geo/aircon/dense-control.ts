/** Illustrative control-side population, not a manufacturer netlist. All
 * footprints avoid the accepted power assembly, mounting holes and connectors. */
type J=Record<string,any>;
export function denseControl():J[]{
 const out:J[]=[],top=.4818;
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string,tint?:string)=>({kind:'bevelBox',at:[x,y,z],size:[w,h,d],bevel:Math.min(w,h,d)*.12,color,...(tint?{tint}:{})});
 const trace=(path:number[][])=>out.push({kind:'tube',at:[0,top+.000045,0],path:path.map(([x,z])=>[x,0,z]),radius:.000105,bendRadius:.0005,color:'copper'});
 // Two control IC packages, with formed gull-wing leads at both sides.
 for(const [x,z,n]of [[.820,.020,8],[.949,.055,7]]){
  out.push(box(x!,top+.0019,z!,.009,.0038,.00254*n!,'powder'));
  for(const sign of [-1,1])for(let i=0;i<n!;i++){
   const zz=z!+(i-(n!-1)/2)*.00254;
   out.push({kind:'sweep',at:[x!,top,zz],path:[[sign*.0041,.0014,0],[sign*.0051,.0014,0],[sign*.0058,.0003,0],[sign*.0066,.00015,0]],radius:.00025,section:{flat:.45},up:[0,1,0],segments:9,radial:12,caps:'flat',color:'steel'});
  }
 }
 // A smaller regulator, rectifier and two shielded moulded inductors.
 for(const [x,z]of [[.820,.069],[.962,-.036]]){
  out.push(box(x!,top+.00165,z!,.010,.0033,.009,'powder'));
  for(const sign of [-1,1])out.push({kind:'fins',at:[x!+sign*.006,top+.00035,z!],size:[.0017,.0007,.001],count:3,gap:.0025,axis:'z',color:'steel'});
 }
 for(const [x,z]of [[.941,-.007],[.968,.060]]){
  out.push(box(x!,top+.0039,z!,.009,.0078,.009,'powder'));
  out.push({kind:'lathe',at:[x!,top+.0073,z!],profile:[[0,0],[.0028,0],[.0035,.0004],[.0032,.0010],[0,.0010]],segments:40,color:'powder'});
  for(const sign of [-1,1])out.push(box(x!+sign*.0047,top+.00025,z!,.0018,.0005,.005,'steel'));
 }
 // Individual chip resistors/MLCCs with metal terminations, seated at 0603-like
 // proportions. Unequal banks follow functional regions, never cover cans.
 const banks=[{x:.815,z:-.011,n:8,dx:.0043,dz:0},{x:.874,z:.017,n:6,dx:.0038,dz:0},{x:.881,z:.047,n:5,dx:0,dz:.005},{x:.950,z:.017,n:6,dx:.0042,dz:0},{x:.813,z:.090,n:9,dx:.005,dz:0},{x:.961,z:-.061,n:5,dx:0,dz:.005}];
 for(const [bank,b]of banks.entries())for(let i=0;i<b.n;i++){
  const x=b.x+i*b.dx,z=b.z+i*b.dz,w=.0032,d=.0017;
  out.push(box(x,top+.00065,z,w,.0013,d,bank%2?'plastic':'powder',bank%2?'token:bone':undefined));
  for(const sign of [-1,1])out.push(box(x+sign*.00135,top+.00070,z,.00065,.0014,d+.0001,'steel'));
 }
 // Routed copper relief enters actual lead/pad positions. These are geometric
 // design-study connections, not asserted real power or control nets.
 for(let i=0;i<8;i++){
  const z=.020+(i-3.5)*.00254,x=.815+i*.0043;
  trace([[.8134,z],[.810-i*.00045,z],[.810-i*.00045,-.016-i*.0007],[x-.0014,-.016-i*.0007],[x-.0014,-.011]]);
 }
 for(let i=0;i<7;i++){
  const z=.055+(i-3)*.00254,x=.881;
  trace([[.9424,z],[.937-i*.0004,z],[.937-i*.0004,.079+i*.00065],[x-.004-i*.0006,.079+i*.00065],[x-.004-i*.0006,.047+(i%5)*.005],[x-.0014,.047+(i%5)*.005]]);
 }
 for(let i=0;i<6;i++)trace([[.9556,.055+(i-3)*.00254],[.958+i*.0005,.055+(i-3)*.00254],[.958+i*.0005,.017-.003-i*.0005],[.950+i*.0042,.017-.003-i*.0005],[.950+i*.0042,.017]]);
 // A two-row low-voltage header: insulating saddle and discrete pins.
 out.push(box(.970,top+.0025,.083,.013,.005,.009,'plastic','token:bone'));
 for(const z of [.081,.085])out.push({kind:'fins',at:[.970,top+.0055,z],size:[.0006,.003,.0006],count:5,gap:.00254,axis:'x',color:'steel'});
 return out;
}
