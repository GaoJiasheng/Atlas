/** Build-time ISO dry containers and terminal equipment, in metres (Y up).
 * Reused by container-port and future logistics/trade topics. Original procedural
 * studies from BIC/CTU and crane-maker reference photographs; no image assets.
 * Repetition uses the engine's repeat/fins batching, never runtime generation.
 */
export type V = [number, number, number];
export type P = Record<string, unknown>;
export const ISO = { twenty: 6.058, forty: 12.192, width: 2.438, height: 2.591 } as const;
export const box = (size: V, at: V, color = 'steel'): P => ({ kind: 'box', size, at, color });
export const rounded = (size: V, at: V, bevel: number, color = 'steel'): P => ({ kind: 'bevelBox', size, at, bevel, color });
export const cyl = (radius: number, length: number, at: V, color = 'steel', rotation: V = [0,0,0]): P => ({kind:'cylinder',size:[radius,radius,length],at,color,rotation});
export const fins = (size: V, count: number, gap: number, axis: 'x'|'y'|'z', at: V, color='steel'): P => ({kind:'fins',size,count,gap,axis,at,color});
/** Rectangular hollow-section member with an exact endpoint-to-endpoint axis. */
export function beam(a: V, b: V, w=.6, color='steel'): P {
 const [x,y,z] = b.map((n,i)=>n-a[i]!) as V;
 return {kind:'box',size:[w,Math.hypot(x,y,z),w],at:a.map((n,i)=>(n+b[i]!)/2),rotation:[Math.atan2(z,y)*180/Math.PI,0,-Math.atan2(x,Math.hypot(y,z))*180/Math.PI],color};
}
/** Outer corrugation stays inside the ISO envelope. Hollow option is a wall,
 * not a solid cargo block; top and floor are supplied separately. */
export function isoContainer(length: number, at: V, hollow=false, color='powder', recessDoors=false): P {
 const n=length>10?36:18, shape: number[][]=[];
 const detailed=hollow || recessDoors;
 const skinLength=length - (detailed ? .16 : 0), skinWidth=ISO.width-(detailed ? .01 : 0);
 for(let i=0;i<=n*2;i++) shape.push([-skinLength/2+skinLength*i/(n*2),skinWidth/2-(i%2)*.055]);
 for(let i=n*2;i>=0;i--) shape.push([-skinLength/2+skinLength*i/(n*2),-skinWidth/2+(i%2)*.055]);
 return {kind:'extrude',shape,depth:ISO.height-(detailed ? .01 : 0),rotation:[90,0,0],at,color,...(hollow?{holes:[[[-length/2+.09,-1.1],[-length/2+.09,1.1],[length/2-.09,1.1],[length/2-.09,-1.1]]]}:{})};
}
/** Corner socket plan with a real opening, extruded in height. */
export function cornerSocket(at: V): P {
 return {kind:'extrude',shape:[[-.125,-.125],[.125,-.125],[.125,.125],[-.125,.125]],holes:[Array.from({length:48},(_,i)=>[.075*Math.cos(i*Math.PI/24),.045*Math.sin(i*Math.PI/24)])],depth:.18,rotation:[90,0,0],at,color:'steel'};
}
export function containerDetails(length: number, at: V, corners=true): P[] {
 const [x,y,z]=at, out:P[]=[];
 for(const dz of [-1.169,1.169]) for(const dy of [-1.2355,1.2355]) out.push(box([length-.12,.12,.1],[x,y+dy,z+dz]));
 for(const dx of [-length/2+.06,length/2-.06]) {
  out.push(box([.09,2.4,2.27],[x+dx,y,z],'powder'));
  // Standard dry box: a pair of doors at +X, a closed corrugated end at -X.
  if(dx>0){
   out.push(box([.1,2.34,.025],[x+dx,y,z],'rubber'));
   for(const dz of [-.85,-.35,.35,.85])out.push(box([.045,2.12,.045],[x+dx+.025,y,z+dz]));
  }else out.push(fins([.045,2.3,.08],6,.29,'z',[x+dx-.025,y,z],'powder'));
 }
 if(corners)for(const dx of [-length/2+.125,length/2-.125])for(const dy of [-1.2055,1.2055])for(const dz of [-1.094,1.094])out.push(cornerSocket([x+dx,y+dy,z+dz]));
 return out;
}
export function workingContainer(): P[] {
 const at:V=[0,11.2955,-18];
 return [isoContainer(ISO.twenty,at,true), box([6.058,.04,2.36],[0,12.54,-18],'powder'),box([6.058,.07,2.36],[0,10.035,-18],'powder'),...containerDetails(ISO.twenty,at,false)];
}
export function workingCorners(): P[] {
 const out:P[]=[];
 for(const x of [-2.9,2.9])for(const z of [-19.1,-16.9])out.push(cornerSocket([x,12.5,z]),box([.12,2.3,.12],[x,11.26,z]),cornerSocket([x,10.12,z]));
 return out;
}
/** Lofted lower half-shell: smooth longitudinal shoulders, rising sheer,
 * tapered waterline bow and flat transom. Opening faces up, away from up=-Y.
 * The separate forefoot supplies the bulb, rather than extending the deck prism. */
export function shipHull(at: V=[0,9.7,-18], length=174, width=28): P[] {
 const half=length/2, w=width/2, vertical=length>120?1.7:1.3;
 return [{kind:'sweep',path:[[-half,1/vertical,0],[-half+5,.3/vertical,0],[-half+17,0,0],[0,0,0],[half-28,.15/vertical,0],[half-15,.8/vertical,0],[half-6,1.7/vertical,0],[half,2.4/vertical,0]],radius:[w*.72,w*.9,w,w,w*.96,w*.72,w*.32,.13],section:{u:180,flat:.94},hollow:.1,up:[0,-1,0],caps:'flat',radial:48,segments:160,scale:[1,vertical,1],at,color:'powder'},
 {kind:'sweep',path:[[-6,0,0],[-2,0,0],[1,.2,0],[4,.6,0]],radius:[1.1,1.65,1.35,.12],section:{flat:.7},caps:'round',up:[0,1,0],radial:48,segments:48,at:[at[0]+half-4,at[1]-11,at[2]],color:'powder'},
 {kind:'extrude',shape:[[half-23,-10.9],[half-7,-11.1],[half-2,-10.3],[half-1,-9],[half-2,-7],[half-1.5,-4],[half-.8,-1],[half,2.4],[half-7,1.7],[half-17,.6],[half-23,0]],depth:width*.085,bevel:.15,at,color:'powder'},
 {kind:'extrude',shape:[[-half,-w*.72],[-half+5,-w*.9],[-half+17,-w],[half-28,-w*.96],[half-15,-w*.72],[half-6,-w*.32],[half,0],[half-6,w*.32],[half-15,w*.72],[half-28,w*.96],[-half+17,w],[-half+5,w*.9],[-half,w*.72]],depth:.42,rotation:[90,0,0],at:[at[0],at[1]-.21,at[2]],color:'powder'}];
}
export function shipDeck(): P[] {
 const out:P[]=[box([12.3,.3,25],[0,9.85,-18])];
 // Outer lanes carry 40-ft stacks. The central two lanes carry 20-ft
 // stacks, so their fittings must move with the shorter bay ends.
 out.push(...stackFittings(10.09));
 for(const z of [-24.3,-11.7])out.push(box([.4,1,7],[6.2,10.5,z]),box([.13,.13,7],[6.2,11.1,z]));
 return out;
}
/** Ten populated bays × eight rows × four tiers. The two centre rows use
 * 20-ft boxes in alternating half-bays, leaving the active 20-ft lift cell clear. */
/** Deck-level corner-fitting rows. None sit at stack-top height: those would
 * float over the deck whenever a beat hides the cargo layer. */
function stackFittings(y:number): P[] {
 const out:P[]=[];
 for(const x of [-5.971,5.971])for(const dz of [-1.094,1.094])for(const z of [-24.5,-11.5])
  out.push(fins([.25,.18,.25],3,2.35,'z',[x,y,z+dz]));
 for(const x of [-2.904,2.904])for(const dz of [-1.094,1.094])
  out.push(fins([.25,.18,.25],2,2.35,'z',[x,y,-18+dz]));
 return out;
}
export function shipCargo(): P[] {
 const out:P[]=[];
 const tones=['token:cold','token:hot'];
 for(let tier=0;tier<4;tier++)for(let row=0;row<8;row++) {
  const length=row===3||row===4?ISO.twenty:ISO.forty;
  out.push({...isoContainer(length,[0,11.2955+tier*ISO.height,-27.1+row*2.6]),tint:row===3||row===4?tones[tier%2]:'token:neutral'});
 }
 return out;
}
export function shipBridge(x=-73,y=10,z=-18): P[] {
 const out:P[]=[rounded([15,16,19],[x,y+8,z],.25,'enamel')];
 out.push(fins([15.4,19.4,.13],7,2.25,'y',[x,y+8.2,z]));
 // Continuous window bands on the deckhouse faces, with white mullions.
 for(const side of [-1,1])out.push(fins([13.7,1,.08],6,1.38,'y',[x,y+8,z+side*9.55],'powder'));
 out.push(rounded([18,2.8,23],[x+1,y+17.5,z],.18,'enamel'),box([18.1,1.35,23.1],[x+1,y+17.9,z],'powder'),box([18.4,.25,23.4],[x+1,y+19.05,z],'steel'));
 for(const side of [-1,1])out.push(fins([.12,15,.18],8,1.95,'x',[x,y+8,z+side*9.62],'enamel'));
 out.push(rounded([4.2,6,4.8],[x-5,y+21,z-3],.45,'powder'),box([4.25,.6,4.85],[x-5,y+23.8,z-3],'steel'),cyl(.16,5,[x+2,y+21.5,z]),beam([x-1,y+22,z],[x+5,y+22,z],.12));
 return out;
}
export function agvBody(): P[] {
 const out:P[]=[rounded([8.3,.65,3.2],[0,1.675,10],.27),rounded([6.9,.65,2.8],[0,1.04,10],.25,'powder')];
 for(const x of [-3.95,3.95])out.push(rounded([.3,.45,3.05],[x,1.15,10],.12,'rubber'));
 for(const x of [-2.85,2.85])for(const z of [8.67,11.33])out.push(box([.15,.48,.18],[x,2.04,z]),box([.6,.14,.35],[x,1.93,z]));
 out.push(box([5.5,.14,2.7],[0,1.93,10],'powder'));
 return out;
}
export function agvWheels(): P[] {
 const out:P[]=[];
 for(const x of [-2.7,0,2.7])for(const z of [8.4,11.6]) {
  out.push({kind:'lathe',profile:[[0,-.25],[.45,-.25],[.65,-.2],[.72,-.1],[.72,.1],[.65,.2],[.45,.25],[0,.25]],segments:48,rotation:[90,0,0],at:[x,.72,z],color:'rubber'},cyl(.32,.51,[x,.72,z],'steel',[90,0,0]));
 }
 return out;
}
export function yardBlock(): P[] {
 // Five rows × four tiers. The background block belongs to the yard layer,
 // so the independent TEU counting lesson can hide it along with the RTG.
 // It stands beside the RTG's landside leg (x < 10), off every sight line
 // from the yard and hero cameras to the target and its parking slots.
 const cx=4.5, out:P[]=[];
 for(let tier=0;tier<4;tier++) {
  out.push({...fins([6.058,2.591,2.438],5,.16,'z',[cx,1.2955+tier*2.591,48],'powder'),tint:tier%2?'token:neutral':'token:cold'});
  for(const z of [41.585,54.415])out.push({...fins([.09,2.43,.1],18,.23,'x',[cx,1.2955+tier*2.591,z],'powder'),tint:tier%2?'token:neutral':'token:cold'});
 }
 for(const x of [cx-2.904,cx+2.904])for(const dz of [-1.094,1.094])out.push(fins([.25,.18,.25],5,2.348,'z',[x,10.274,48+dz]));
 return out;
}

/** Box-girder STS portal with twin A-frames and load-carrying stays. */
export function stsPortal(): P[] {
 const p:P[]=[];
 for(const x of [-9,9])for(const z of [2,22])p.push(box([1.65,47.5,1.65],[x,25.25,z]));
 for(const z of [2,22]) {
  p.push(box([19.6,1.7,1.5],[0,18,z]),box([19.6,1.6,1.6],[0,48.5,z]));
  p.push(beam([-9,33,z],[9,47.7,z],.65),beam([9,33,z],[-9,47.7,z],.65));
 }
 for(const x of [-9,9])p.push(box([1.4,1.7,21.6],[x,19,12]),box([1.5,1.6,21.6],[x,48.5,12]));
 for(const x of [-4,4]){
  p.push(beam([x,52,2],[x,72,12],1.1),beam([x,72,12],[x,52,25],1.1));
  for(const end of [[x,53,-45],[x,53,30]] as V[]) p.push({kind:'sweep',path:[[0,0,0],[end[0]-x,end[1]-72,end[2]-12]],radius:.135,radial:48,segments:4,caps:'flat',at:[x,72,12],color:'steel'});
 }
 p.push(box([9.2,.8,1.1],[0,72,12]),box([10,4.6,9.5],[0,55.5,22],'enamel'),box([10.7,.45,10.2],[0,58,22]));
 // Closed walkways: open grille details belong to the machinery, not structural support.
 p.push(box([1.2,.3,23],[-10.1,49,12]),fins([3.2,.8,.12],8,.31,'z',[5.07,55.5,22]));
 return p;
}

/** Two perforated side webs make a deep three-dimensional lattice, with paired rails. */
export function stsBoom(): P[] {
 const p:P[]=[];
 for(const x of [-4,4]){
  p.push(box([.8,.7,78],[x,49,-9]),box([.65,.65,78],[x,53,-9]));
  const holes:number[][][]=[];
  for(let i=0;i<8;i++){
   const a=-39+i*9.75+.32,b=a+9.11;
   // Two triangular openings leave a diagonal web and a post at every station.
   holes.push([[a,-1.6],[b-.55,-1.6],[a,1.15]],[[a+.55,1.6],[b,1.6],[b,-1.15]]);
  }
  p.push({kind:'extrude',shape:[[-39,-2],[39,-2],[39,2],[-39,2]],holes,depth:.25,at:[x,51,-9],rotation:[0,90,0],color:'steel'});
  p.push(box([.2,.2,78],[x,49.5,-9],'stainless'));
 }
 p.push(fins([8,.35,.35],14,5.65,'z',[0,49,-9]),fins([8,.3,.3],14,5.7,'z',[0,53,-9]));
 for(const x of [-4,4])p.push(cyl(.72,1.5,[x,51,2],'steel',[0,0,90]));
 p.push(box([9,.6,1.1],[0,50.8,-48]),box([9,.6,1.1],[0,50.8,30]));
 return p;
}

/** Eight running wheels per corner, arranged as four double-wheel axle sets. */
export function stsBogies(): P[] {
 const p:P[]=[];
 for(const x of [-9,9])for(const z of [2,22]){
  p.push(box([6.6,.8,1.9],[x,1.45,z]));
  for(const dx of [-1.65,1.65])p.push(box([3,.35,1.3],[x+dx,.95,z]));
  for(const dx of [-2.7,-.9,.9,2.7])p.push({kind:'lathe',profile:[[0,-1.02],[.51,-1.02],[.57,-.92],[.57,-.67],[.22,-.67],[.22,.67],[.57,.67],[.57,.92],[.51,1.02],[0,1.02]],segments:48,at:[x+dx,.73,z],rotation:[90,0,0],color:'steel'});
 }
 return p;
}

/** Trolley chassis, four flanged wheels, hoist drums and suspended operator cab. */
export function stsTrolley(): P[] {
 const p:P[]=[box([6.4,.9,3],[0,50,-18])];
 for(const x of [-4,4])for(const z of [-19,-17])p.push(cyl(.48,.45,[x,50.08,z],'steel',[0,0,90]));
 p.push(cyl(.65,3.2,[0,51.3,-18],'steel',[0,0,90]),cyl(.4,1.1,[2.4,51.3,-18],'steel',[0,0,90]));
 p.push(rounded([2.2,2.5,2.1],[6,47.9,-18],.12,'enamel'),box([2.24,1.25,.06],[6,48.1,-19.07],'glass'),box([.06,1.25,1.6],[7.13,48.1,-18],'glass'));
 p.push(box([2.5,.18,2.3],[6,49.23,-18]),box([.25,1.8,.25],[6,49.25,-18]));
 p.push(beam([3,50,-18],[6,50,-18],.3));
 return p;
}

/** Telescopic headblock, sliding end beams and four hinged guide flippers. */
export function telescopicSpreader(at:V,length=6.058): P[] {
 const [x,y,z]=at, half=length/2;
 const p:P[]=[{kind:'extrude',shape:[[-half,-1.219],[half,-1.219],[half,1.219],[-half,1.219]],holes:[[[-half+.34,-.88],[-half+.34,.88],[half-.34,.88],[half-.34,-.88]]],depth:.6,rotation:[90,0,0],at,color:'steel'}];
 p.push(box([length*.68,.55,.72],[x,y+.46,z]),box([2,.27,1.5],[x,y+.86,z]));
 for(const sx of [-1,1]){
  p.push(box([length*.35,.25,.52],[x+sx*length*.25,y+.38,z],'stainless'));
  p.push(box([.38,.27,2.25],[x+sx*(half-.13),y+.36,z]));
  for(const sz of [-1,1]){
   // Flippers hinge outward; all lower edges stay above the existing lock plane.
   const f=box([.42,.4,.2],[x+sx*(half+.1),y+.15,z+sz*1.2]);f.rotation=[0,0,sz*22];p.push(f);
  }
 }
 return p;
}

/** Four-legged RTG: eight rubber tyres, hubcaps, side sills, paired trolley girders. */
export function rtgFrame(): P[] {
 const p:P[]=[];
 for(const x of [10,43])for(const z of [35,55])p.push(box([1.1,11.7,1.25],[x,6.85,z]));
 for(const z of [35,55])p.push(box([34.3,1.35,1.2],[26.5,13,z]));
 for(const x of [10,43]) {
  // A perforated side web unites the sill, top tie and diagonal brace.
  p.push({kind:'extrude',shape:[[-11.5,1.025],[11.5,1.025],[11.5,2.175],[10.6,2.175],[10.6,12.175],[-10.6,12.175],[-10.6,2.175],[-11.5,2.175]],holes:[[[-9.3,2.3],[8.5,2.3],[-9.3,11.4]],[[-8.5,11.4],[9.3,11.4],[9.3,3.1]]],depth:.65,rotation:[0,90,0],at:[x,0,45],color:'steel'});
  for(const z of [34,36,54,56])p.push({kind:'lathe',profile:[[0,-.36],[.3,-.36],[.3,-.32],[.68,-.32],[.8,-.25],[.85,-.15],[.85,.15],[.8,.25],[.68,.32],[.3,.32],[.3,.36],[0,.36]],segments:48,rotation:[0,0,90],at:[x,.85,z],color:'rubber'});
 }
 p.push(rounded([3.1,3,4.8],[44.5,4,45],.15,'enamel'));
 return [...p,...yardBlock()];
}

/** Yard trolley, four-part reeving and a telescopic spreader above the teaching stack. */
export function rtgTrolley(): P[] {
 const p:P[]=[box([6.4,.7,2.8],[18,13.3,40])];
 for(const x of [15.2,20.8])p.push(box([.7,.8,21.2],[x,13.3,45]));
 for(const z of [35,55]){p.push(box([6.4,.8,.7],[18,13.3,z]));for(const x of [15.7,20.3])p.push(cyl(.35,.35,[x,13.75,z],'steel',[90,0,0]));}
 for(const x of [15.4,20.6])for(const z of [39,41])p.push(cyl(.05,3.45,[x,11.2,z]));
 p.push(cyl(.45,2.5,[18,14,40],'steel',[90,0,0]),cyl(.33,1,[20,14,40],'steel',[0,0,90]));
 p.push(rounded([1.65,2.1,1.8],[18,11.85,42],.1,'enamel'),box([1.5,1.15,.04],[18,11.95,42.92],'glass'));
 p.push(...telescopicSpreader([18,9.15,40]));
 return p;
}
