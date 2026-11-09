/** Heat-only Gravesande apparatus and flask demonstration, original design reconstruction. */
import type {Primitive} from '../../../src/engines/space-scene/schema';
type V=[number,number,number];
type P=Record<string,any>;
const lat=(at:V,profile:number[][],color:string,rotation?:V,segments=96):Primitive=>({kind:'lathe',at,profile,color,segments,...(rotation?{rotation}:{})}) as Primitive;
const bar=(at:V,size:V,color:string,bevel=.001):Primitive=>({kind:'bevelBox',at,size,color,bevel:Math.min(bevel,Math.min(...size)*.3)}) as Primitive;
const path=(points:V[],radius:number,color:string,closed=false):Primitive=>({kind:'sweep',at:[0,0,0],path:points,radius,color,closed,caps:closed?'none':'round',radial:closed?10:12,segments:closed?32:64}) as Primitive;
function handle(at:V,rotation?:V):Primitive[]{
 const p:number[][]=[[0,-.036],[.003,-.036],[.006,-.035],[.008,-.032],[.009,-.027],[.0087,-.017],[.0078,0],[.0068,.018],[.0076,.028],[.007,.032],[.005,.035],[0,.036]];
 return [lat(at,p,'wood',rotation),lat(at,[[.003,-.037],[.006,-.037],[.006,-.030],[.003,-.030],[.003,-.037]],'brass',rotation)];
}
function annulus(at:V,ri:number,ro:number,h:number,color:string):Primitive{
 const r=.00065;
 return lat(at,[[ri+r,-h/2],[ro-r,-h/2],[ro,-h/2+r],[ro,h/2-r],[ro-r,h/2],[ri+r,h/2],[ri,h/2-r],[ri,-h/2+r],[ri+r,-h/2]],color);
}
export function rebuildExpansion(parts:P[],poses:P){
 const get=(id:string)=>parts.find(p=>p.id===id)!;
 const set=(id:string,p:Primitive[])=>{get(id).primitive=p[0];if(p.length>1)get(id).extra=p.slice(1);else delete get(id).extra;};
 const bench=get('bench');
 // Remove the old bulb/block and straight glass sleeve from context, retaining the bench.
 bench.extra=bench.extra.filter((p:P)=>Math.abs(p.at[0]-.4)>.00001);
 // A precision brass sphere really is spherical; the eye, linked chain and turned wood are separate forms.
 const sphere:number[][]=[];
 for(let i=0;i<=48;i++){const a=-Math.PI/2+i*Math.PI/48;sphere.push([i===0||i===48?0:.020*Math.cos(a),.020*Math.sin(a)]);}
 set('expansion-ball',[lat([.24,.865,-.22],sphere,'brass')]);
 // Hold the suspension point fixed while the sphere expands below it; links never sink into the sphere.
 poses['ball-ring-start']['expansion-ball']={scale:1,pivot:[.24,.885,-.22]};
 poses['ball-ring-warm']['expansion-ball']={scale:1.2,pivot:[.24,.885,-.22]};
 get('expansion-ball').detail={en:'The brass ball hangs on a chain from a wooden handle. The ball-and-ring picture enlarges the size change to make it visible. It is a separate comparison from the rod and uses neither the rod’s dimensions nor its expansion coefficient. It gives no numerical ball temperature or expansion. [S27]',zh:'黄铜球用链条挂在木柄下。球环图放大尺寸变化，方便观察。它与杆是不同的比较，不采用杆的尺寸或膨胀系数，也没有给出球的温度或膨胀量数值。[S27]'};
 const suspensionStart=bench.extra.length;
 bench.extra.push({kind:'torus',at:[.24,.8866,-.22],size:[.0018,.00065],color:'brass'} as Primitive);
 for(let j=0;j<10;j++){
  const points:V[]=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2;points.push([.24+(j%2?.0018*Math.sin(a):0),.891+j*.0057+.0035*Math.cos(a),-.22+(j%2?0:.0018*Math.sin(a))]);}
  bench.extra.push(path(points,.00055,'brass',true));
 }
 bench.extra.push(...handle([.24,.982,-.22]));
 // Lower ferrule eye connects the final link to the wooden handle.
 bench.extra.push({kind:'torus',at:[.24,.946,-.22],size:[.0019,.00065],color:'brass'} as Primitive);
 // A hooked exhibition support carries the handle; it is not part of the heated brass sphere.
 bench.extra.push(bar([.295,.756,-.29],[.055,.012,.060],'powder',.003),lat([.295,.891,-.29],[[0,-.13],[.003,-.13],[.003,.13],[0,.13]],'steel'),path([[.295,1.019,-.29],[.292,1.035,-.285],[.245,1.035,-.23],[.24,1.022,-.22]],.002,'steel'));
 bench.extra.push({kind:'torus',at:[.24,1.019,-.22],size:[.0028,.0008],color:'brass'} as Primitive);
 const suspension=bench.extra.splice(suspensionStart);
 // The actual 44 mm bore is retained; chamfered ring with a tangential rod and a turned handle.
 // Two narrow padded saddles hold the display handle horizontally, clear of the sphere's path.
 // They belong to the ring part, so they hide and explode with it instead of standing orphaned on the bench.
 const rests:Primitive[]=[];
 for(const z of [-.13,-.09]){
  const r=z<-.11?.0087:.0072,outer=r+.003;
  const saddle:number[][]=[[-outer,.003],[-r,.003]];
  for(let i=0;i<=24;i++){const a=Math.PI+i*Math.PI/24;saddle.push([r*Math.cos(a),r*Math.sin(a)]);}
  saddle.push([r,.003],[outer,.003]);
  for(let i=24;i>=0;i--){const a=Math.PI+i*Math.PI/24;saddle.push([outer*Math.cos(a),outer*Math.sin(a)]);}
  rests.push(lat([.24,.75,z],[[0,0],[.013,0],[.014,.002],[.013,.005],[.005,.006],[.003,.009],[.003,.058],[0,.058]],'steel',undefined,48),{kind:'extrude',at:[.24,.818,z],shape:saddle,depth:.008,bevel:.0003,color:'token:neutral'} as Primitive);
 }
 // Support the heavy brass head as well as the grip; an open grip saddle cannot resist a cantilever moment.
 rests.push(lat([.24,.750,-.248],[[0,0],[.012,0],[.014,.002],[.013,.005],[.004,.006],[.0025,.009],[.0025,.060],[.004,.061],[.004,.064],[0,.064]],'steel',undefined,48));
 set('expansion-ring',[annulus([.24,.818,-.22],.022,.033,.008,'brass'),lat([.24,.818,-.170],[[0,-.022],[.0026,-.022],[.0026,.022],[0,.022]],'brass',[90,0,0]),...handle([.24,.818,-.112],[90,0,0]),...suspension,...rests]);
 get('expansion-ring').detail={en:'The brass ring has an open hole, 44 mm wide in this model, and a wooden handle. It stays unchanged while the ball warms. If the ring were heated too, it would expand. [S27]',zh:'黄铜圆环中间有通孔，模型孔宽 44 mm，并装有木柄。球受热时，环保持原状。如果环也受热，它也会膨胀。[S27]'};
 // One continuous round-bottom shell: sphere blends tangentially into shoulder, long neck and flared lip.
 const shell:number[][]=[];
 for(let i=0;i<=36;i++){const a=-Math.PI/2+i*(Math.PI/2+1.10)/36;shell.push([i===0?0:.032*Math.cos(a),.032*Math.sin(a)]);}
 shell.push([.012,.032],[.0095,.037],[.009,.043],[.009,.086],[.009,.093],[.010,.095],[.0108,.096],[.0108,.097],[.0098,.0977],[.008,.0977],[.0078,.0965],[.0075,.094],[.0075,.043],[.008,.037],[.0108,.031]);
 for(let i=36;i>=0;i--){const a=-Math.PI/2+i*(Math.PI/2+1.10)/36;shell.push([i===0?0:.0305*Math.cos(a),.0305*Math.sin(a)]);}
 bench.extra.push(lat([.4,.787,-.24],shell,'glass',undefined,96));
 // Liquid fills the flask and neck up to the stopper. No unphysical air pocket under a rising column.
 const liquid:number[][]=[];for(let i=0;i<=48;i++){const a=-Math.PI/2+i*(Math.PI/2+1.10)/48;liquid.push([i===0?0:.0301*Math.cos(a),.0301*Math.sin(a)]);}
 liquid.push([.0105,.031],[.0072,.037],[.0071,.080],[0,.080]);
 bench.extra.push(lat([.4,.787,-.24],liquid,'token:en-heat',undefined,96));
 // Tapered bored rubber stopper, with the glass tube passing through its real hole.
 bench.extra.push(lat([.4,.876,-.24],[[.0021,-.009],[.0072,-.009],[.0087,.009],[.0086,.010],[.0021,.010],[.0021,-.009]],'rubber'));
 bench.extra.push(lat([.4,.858,-.24],[[.00145,0],[.0021,0],[.0021,.180],[.00145,.180],[.00145,0]],'glass'));
 // Cork-coloured ring rest contacts the round bottom, replacing the grey block.
 bench.extra.push(lat([.4,.750,-.24],[[.0193,0],[.025,0],[.025,.010],[.023,.012],[.0193,.012],[.0193,0]],'token:neutral'));
 // Backing strip and physical scale marks are qualitative divisions, not temperatures.
 bench.extra.push(bar([.407,.960,-.243],[.018,.155,.0015],'enamel',.0004));
 bench.extra.push({kind:'fins',at:[.410,.960,-.2418],size:[.006,.0003,.00045],count:29,gap:.00455,axis:'y',color:'token:ink-2'} as Primitive,{kind:'fins',at:[.4085,.960,-.2418],size:[.009,.0003,.00045],count:8,gap:.01955,axis:'y',color:'token:ink-2'} as Primitive);
 // Closed meniscus and upper column move together, anchored inside the stopper.
 set('expansion-thermometer',[lat([.4,.858,-.24],[[0,0],[.0013,0],[.0013,.0795],[.00115,.080],[.0007,.0803],[0,.0804]],'token:en-heat',undefined,64)]);
 poses['liquid-column-start']['expansion-thermometer']={scale:[1,1,1],pivot:[.4,.858,-.24]};
 poses['liquid-column-warm']['expansion-thermometer']={scale:[1,1.9,1],pivot:[.4,.858,-.24]};
 get('expansion-thermometer').summary={en:'Shows a longer liquid column in a glass tube above a flask.',zh:'在烧瓶上方的玻璃管中显示变长的液柱。'};
 get('expansion-thermometer').detail={en:'The coloured liquid column in the tube lengthens while the flask, stopper, tube and scale stay fixed. This picture shows liquid expansion without calculating a volume or temperature. [S27]',zh:'管中的有色液柱变长，烧瓶、塞子、玻璃管和刻度保持固定。画面说明液体膨胀，不计算体积或温度。[S27]'};
 bench.detail={en:'The model bench is 1.8 × 0.7 m, with its top at 0.75 m. It holds separate experiments whose energy transfers are not connected. In the liquid-column picture, the flask and glass tube stay fixed while only the coloured column lengthens. [S27]',zh:'模型台面为 1.8 × 0.7 m，高 0.75 m。它承托独立实验，各自的能量传递互不相连。液柱图中的烧瓶和玻璃管保持固定，只有有色液柱变长。[S27]'};
}
