/** Repeated manufactured detail stays engine-instanced rather than bloating
 * the compressed topic asset. Uses existing extrude, sweep, fins primitives;
 * no engine extension. All dimensions remain metres and source IDs unchanged.
 */
import {partsFile,type Part,type PartsFile} from '../../../src/engines/space-scene/schema';
type P=Record<string,unknown>;
const at=(x:number,y:number,z:number):[number,number,number]=>[x,y,z];
export function runtimeDetails(file:PartsFile,seed:PartsFile):Set<string>{
 const retained=new Set(['fan-modules','dimms','gpu-heatsinks','rack-ears','rails','midplane','gpu-dies','hbm-stacks','pcie-switches','front-controls','bluefield-dpus','boot-drives','pcie-risers','rear-io','power-distribution','network-modules','osfp-cages','gpu-baseboard','motherboard']);
 const find=(id:string)=>file.parts.find(p=>p.id===id)!;
 for(const id of retained){const part=find(id),original=structuredClone(seed.parts.find(p=>p.id===id)!);delete part.mesh;delete part.material;part.primitive=original.primitive;if(original.extra)part.extra=original.extra;else delete part.extra;if(original.repeat)part.repeat=original.repeat;else delete part.repeat;}
 const set=(id:string,pieces:P[],repeat:Part['repeat'])=>{const p=find(id);p.primitive=pieces[0] as unknown as Part['primitive'];p.extra=pieces.slice(1) as Part['extra'];if(repeat)p.repeat=repeat;else delete p.repeat;};
 const fans:P[]=[];
 for(let row=0;row<4;row++){
  const y=.3965-row*.087,outline=[[-.034,-.0415],[.034,-.0415],[.0405,-.034],[.0405,.034],[.034,.0415],[-.034,.0415],[-.0405,.034],[-.0405,-.034]];
  const hole=Array.from({length:48},(_,i)=>{const a=-Math.PI*2*i/48;return [.037*Math.cos(a),.037*Math.sin(a)];});
  fans.push({kind:'extrude',shape:outline,holes:[hole],depth:.078,at:at(0,y,.3885),color:'casing'});
  fans.push({kind:'extrude',shape:outline,holes:[hole],depth:.003,at:at(0,y,.429),color:'powder'});
  fans.push({kind:'extrude',shape:[[-.005,-.038],[.005,-.038],[.006,.023],[.012,.035],[.006,.039],[-.006,.039],[-.012,.035],[-.006,.023]],holes:[[[-.0025,-.030],[-.0025,.023],[.0025,.023],[.0025,-.030]]],depth:.005,at:at(0,y,.437),color:'powder'});
  // Four perforated quadrants share edges. Six-sided holes are actual open
  // geometry, including the bore walls, matching the service-manual guard.
  for(const sx of [-1,1])for(const sy of [-1,1]){
   const cx=sx*.0185,cy=sy*.0185,holes:number[][][]=[];
   for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const hx=(c-1.5)*.0086+(r%2)*.001,hy=(r-1.5)*.0086;
    if(Math.hypot(cx+hx,cy+hy)>.0355)continue;
    holes.push(Array.from({length:6},(_,i)=>{const a=-Math.PI*2*i/6;return [hx+.0037*Math.cos(a),hy+.0037*Math.sin(a)];}));
   }
   fans.push({kind:'extrude',shape:[[-.0185,-.0185],[.0185,-.0185],[.0185,.0185],[-.0185,.0185]],holes,depth:.0004,at:at(cx,y+cy,.4315),color:'powder'});
  }
  fans.push({kind:'bevelBox',size:[.002,.002,.001],bevel:.0003,at:at(.034,y+.034,.4325),color:'brass'});
 }
 set('fan-modules',fans,{count:5,axis:[1,0,0],spacing:.0855});
 const dimms:P[]=[];
 for(const bank of [.0304,.1801,-.0304,-.1801]){
  // FR4 edge includes an actual offset key notch. Rotate its long axis to Z.
  const L=.066675,b=-.015625,t=.015625;
  dimms.push({kind:'extrude',shape:[[-L,b],[.006,b],[.006,b+.003],[.0095,b+.003],[.0095,b],[L,b],[L,t],[-L,t]],holes:[],depth:.0015,rotation:[0,90,0],at:at(bank,.0735,-.13),color:'plastic',tint:'token:f-elastic'});
  // Discrete moulded DRAM packages on both faces; the middle controller is
  // intentionally grouped with the illustrative bank, never labelled a count.
  for(const side of [-1,1])dimms.push({kind:'fins',size:[.0012,.010,.009],count:10,gap:.003,axis:'z',at:at(bank+side*.0014,.076,-.13),color:'powder'});
  // One shaped socket includes both upright end-ejector clips, not loose blocks.
  dimms.push({kind:'extrude',shape:[[-.071,-.002],[.071,-.002],[.071,.009],[.067,.010],[.065,.004],[-.065,.004],[-.067,.010],[-.071,.009]],holes:[],depth:.004,rotation:[0,90,0],at:at(bank,.058,-.13),color:'plastic',tint:'token:neutral'});
 }
 set('dimms',dimms,{count:8,axis:[1,0,0],spacing:.0076});
 // Captive screws and round U heat pipes with buried evaporator legs in the inspection
 // windows. These repeat with each of the four paired tower stations.
 const towers=find('gpu-heatsinks');
 // The photographed low front exchanger spans each pair of towers. It is
 // carried by the tray frame, not repeated once per GPU.
 towers.extra=towers.extra!.slice(0,14);
 for(const z of [-.152,.152]){
  for(const x of [-.034,.034])for(const dz of [-.060,.060])towers.extra!.push({kind:'cylinder',size:[.0018,.0018,.0012],at:at(x,.4285,z+dz),color:'steel'});
  for(const x of [-.027,.027])towers.extra!.push({kind:'sweep',path:[[x,-.264,-.058],[x,-.006,-.058],[x,.001,-.051],[x,.001,.051],[x,-.006,.058],[x,-.264,.058]],radius:.00225,radial:24,segments:20,caps:'flat',section:'round',closed:false,at:at(0,.429,z),color:'copper'});
 }
 // Seat the thermal plates against the actual die height, not above it.
 for(const q of towers.extra!){
  if(q.kind==='bevelBox'&&q.color==='copper')q.size[1]=.0086;
  if(q.kind==='fins'&&q.color==='copper'){q.size[1]=.244;q.at[1]=.289;}
 }
 // Source fin stacks already have the correct stepped towers and formed cheeks.
 for(const id of retained){const p=find(id);for(const q of [p.primitive!,...(p.extra??[])]){if(q.tint){if(id==='rack-ears'){if(q.kind==='cylinder'){q.color='steel';delete q.tint;}else q.tint='token:ink-3';}else if(q.color==='plastic'){if(id==='dimms'&&q.kind==='extrude'&&q.depth!==.0015)q.tint='token:neutral';else{q.color='powder';delete q.tint;}}else delete q.tint;}}}
 // Keep DRAM packages distinct from the dark laminate in both studio themes.
 for(const q of [find('dimms').primitive!,...(find('dimms').extra??[])])if(q.kind==='fins')q.color='rubber';
 // Rack context: retain the open frame, but replace the two front sticks
 // with folded mounting rails and the real 42U / 3-hole EIA pattern.
 const rack=structuredClone(seed.parts.find(p=>p.id==='rack-frame')!);
 const frame:P[]=[rack.extra![0]!,...rack.extra!.slice(2)] as unknown as P[];
 for(const x of [-.263,.263]){
  frame.push({kind:'box',size:[.002,2,.040],at:at(x+(x<0?-.019:.019),1,.420),color:'powder'});
  const margin=(2-42*.04445)/2;
  for(let u=0;u<42;u+=4){
   const units=Math.min(4,42-u),h=units*.04445,holes:number[][][]=[];
   for(let k=0;k<units;k++)for(const y of [.00635,.022225,.0381]){
    const hy=k*.04445+y-h/2;
    holes.push([[-.0032,hy-.0047],[-.0032,hy+.0047],[.0032,hy+.0047],[.0032,hy-.0047]]);
   }
   frame.push({kind:'extrude',shape:[[-.020,-h/2],[.020,-h/2],[.020,h/2],[-.020,h/2]],holes,depth:.002,at:at(x,margin+u*.04445+h/2,.441),color:'powder'});
  }
  for(const y of [margin/2,2-margin/2])frame.push({kind:'box',size:[.040,margin,.002],at:at(x,y,.441),color:'powder'});
 }
 for(const q of frame)delete q.tint;
 set('rack-frame',frame,undefined);retained.add('rack-frame');
 // Validate primitive limits/defaults with the exact runtime schema.
 const normalized=partsFile.parse({...file,poses:undefined});for(const id of retained){const p=find(id),n=normalized.parts.find(p=>p.id===id)!;p.primitive=n.primitive;p.extra=n.extra;p.repeat=n.repeat;}
 return retained;
}
