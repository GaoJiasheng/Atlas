/** Original design-study inverter. Reuses the authored board envelope and ID.
 * Component layout is illustrative, not a manufacturer's PCB or wiring guide.
 */
import fs from 'node:fs';
const path='src/content/topics/aircon/data/parts.json';
const file=JSON.parse(fs.readFileSync(path,'utf8'));
const part=file.parts.find((p:{id:string})=>p.id==='inverter-board');
type J=Record<string,unknown>;
const extra:J[]=[];
const box=(at:number[],size:number[],color:string,tint?:string)=>({kind:'bevelBox',at,size,bevel:Math.min(...size)*.18,color,...(tint?{tint}:{})});
const lathe=(at:number[],profile:number[][],color:string,segments=48)=>({kind:'lathe',at,profile,segments,color});
const y=.481;
const holes=[[.768,-.064],[.976,-.064],[.768,.104],[.976,.104]].map(([x,z])=>Array.from({length:32},(_,i)=>[x!+.0034*Math.cos(i*Math.PI/16),z!+.0034*Math.sin(i*Math.PI/16)]));
holes.push([[.770,-.035],[.806,-.035],[.806,.059],[.770,.059]]);
part.primitive={kind:'extrude',shape:[[.752,-.08],[.984,-.08],[.992,-.072],[.992,.112],[.984,.12],[.752,.12]],holes,depth:.0016,bevel:0,rotation:[90,0,0],at:[0,y,0],color:'plastic',tint:'token:loop'};
// Continuous aluminium base bridges the compressor-side power module to fins
// over the airflow side of the partition (x=.742). Fins point along Z flow.
extra.push(box([.7605,.47485,.018],[.099,.0107,.128],'casing'));
extra.push({kind:'fins',at:[.728,.455,.018],size:[.126,.029,.0012],count:11,gap:.0028,axis:'x',color:'casing'});
extra.push(box([.788,.4847,.012],[.032,.009,.09],'powder'));
// Three rolled-sleeve electrolytics: stepped crimp, separate aluminium lid,
// and a physically recessed cross score (four lid sectors, not a decal).
for(const [x,z,r,h]of [[.846,-.045,.014,.045],[.883,-.045,.014,.045],[.92,-.045,.011,.034]]){
 extra.push(lathe([x!,y!+.0008,z!],[[0,0],[r!*.82,0],[r!,.0015],[r!,.004],[r!*.96,.005],[r!*.96,h!-.002],[r!*.88,h!],[0,h!]],'powder'));
 const rr=r!*.83,w=.00022,l=rr*.72;
 const circle=Array.from({length:48},(_,i)=>[rr*Math.cos(i*Math.PI/24),rr*Math.sin(i*Math.PI/24)]);
 const cross=[[-w,-l],[w,-l],[w,-w],[l,-w],[l,w],[w,w],[w,l],[-w,l],[-w,w],[-l,w],[-l,-w],[-w,-w]];
 extra.push({kind:'extrude',shape:circle,holes:[cross],depth:.0006,bevel:0,at:[x!,y!+h!+.0007,z!],rotation:[90,0,0],color:'casing'});
}
// Four mounting posts support the board, with actual central mounting holes.
for(const [x,z]of [[.768,-.064],[.976,-.064],[.768,.104],[.976,.104]])extra.push(lathe([x!,y-.012,z!],[[.0028,0],[.005,0],[.005,.0112],[.0028,.0112],[.0028,0]],'brass',32));
// Screw terminal strip, individual recessed screw slots and five wire exits.
extra.push({kind:'extrude',at:[.918,.4908,.099],shape:[[-.035,-.009],[.035,-.009],[.035,.009],[-.035,.009]],holes:Array.from({length:5},(_,i)=>Array.from({length:24},(_,j)=>[-.028+i*.014+.0035*Math.cos(j*Math.PI/12),-.001+.0035*Math.sin(j*Math.PI/12)])),depth:.024,bevel:.0005,color:'plastic',tint:'token:bone'});
for(let i=0;i<5;i++)extra.push({kind:'extrude',at:[.89+i*.014,.4998,.099],shape:Array.from({length:32},(_,j)=>[.0038*Math.cos(j*Math.PI/16),.0038*Math.sin(j*Math.PI/16)]),holes:[[[-.0028,-.00045],[.0028,-.00045],[.0028,.00045],[-.0028,.00045]]],depth:.001,bevel:0,rotation:[90,0,0],color:'steel'});
// Transformer bobbin/core, a visible copper winding and control IC lead rows.
extra.push({kind:'extrude',at:[.849,.4988,.044],shape:[[-.018,-.017],[.018,-.017],[.018,.017],[-.018,.017]],holes:[[[-.013,.004],[.013,.004],[.013,.0125],[-.013,.0125]],[[-.013,-.0125],[.013,-.0125],[.013,-.004],[-.013,-.004]]],depth:.016,bevel:.0004,color:'powder'});
extra.push({kind:'coil',at:[.849,.4988,.044],radius:.011,wire:.0008,turns:12,length:.023,rotation:[0,0,90],color:'copper'});
extra.push({kind:'lathe',at:[.849,.4988,.044],profile:[[.0093,-.0135],[.0123,-.0135],[.0123,-.0125],[.0102,-.0125],[.0102,.0125],[.0123,.0125],[.0123,.0135],[.0093,.0135],[.0093,-.0135]],segments:48,rotation:[0,0,-90],color:'plastic',tint:'token:bone'});
extra.push(box([.916,.486,.034],[.026,.007,.026],'powder'));
for(const side of [-1,1])extra.push({kind:'fins',at:[.916,.48275,.034+side*.015],size:[.007,.001,.0011],count:12,gap:.002,axis:'x',rotation:[side*10,0,0],color:'steel'});
extra.push({kind:'fins',at:[.962,.4873,.006],size:[.016,.011,.007],count:3,gap:.018,axis:'z',color:'plastic',tint:'token:bone'});
for(const [x,z]of [[.89,.005],[.93,.064]])extra.push({kind:'fins',at:[x!,.4828,z!],size:[.006,.002,.003],count:5,gap:.0065,axis:'x',color:'plastic',tint:'token:neutral'});
// Wired plugs terminate in the board connectors; no unattached cable ends.
extra.push({kind:'tube',at:[.962,.492,.024],path:[[0,0,0],[.013,.015,0],[.016,.013,-.03],[0,0,-.036]],radius:.0018,bendRadius:.006,color:'rubber'});
// Dense control-area passives seated directly on their solder-mask footprint. Regular spacing
// is manufactured PCB placement, not invented organic surface noise.
for(const z of [-.005,.067]){
 extra.push({kind:'fins',at:[.871,.48255,z],size:[.004,.0015,.0018],count:13,gap:.0055,axis:'x',color:'powder'});
}
extra.push({kind:'extrude',at:[0,.467,0],shape:[[.745,-.08],[1.0,-.08],[1.0,.12],[.745,.12],[.745,.088],[.752,.088],[.752,-.05],[.745,-.05]],depth:.004,bevel:.0005,rotation:[90,0,0],color:'steel'});
part.extra=extra;
// Preserve the accepted folded partition; only open the local passage the
// new cold plate and final fin need. The carrier ears meet the intact margins.
const partition=file.parts.find((p:{id:string})=>p.id==='partition');
partition.primitive={kind:'extrude',at:[.7435,.29,0],shape:[[-.133,-.25],[.07,-.25],[.07,.25],[-.133,.25]],holes:[[[-.084,.1495],[.048,.1495],[.048,.1912],[-.084,.1912]]],depth:.003,bevel:0,rotation:[0,90,0],color:'steel'};
partition.extra=[{kind:'extrude',shape:[[.003,-.07],[0,-.098],[-.003,-.098],[0,-.07]],depth:.5,at:[.742,.29,0],rotation:[90,0,0],color:'steel'}];
fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
console.log(`inverter-board: ${extra.length} detailed subassemblies`);
