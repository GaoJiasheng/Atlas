/** Fungal and bacterial specimens with continuous sculpted surfaces. */
import { Color } from 'three';
import { add, lathe, rng, sweep, type Model, type Prim, type V3 } from '../kit';
import { flip, mesh, shell, surface } from './botanical-surfaces';

const CREAM='#e6dac2',GILLS='#886251';

export function mushroom():Model{
  const extra:Prim[]=[],capY=0.040;
  const centre=(t:number):V3=>[0.0008*(1-t),0,0.0004*(1-t)];
  const cap=(t:number,a:number,under=false):V3=>{
    const r=0.029*t*(1+0.022*Math.sin(a*3)+0.012*Math.cos(a*7+1));
    const y=under?capY+0.0025+0.0017*(1-t):capY+0.003+0.0205*Math.pow(Math.max(0,1-t*t),0.71);
    const c=centre(t);return [c[0]+r*Math.cos(a),y+0.0005*t*Math.sin(a*3+0.7),c[2]+r*Math.sin(a)];
  };
  extra.push(mesh(flip(surface(18,48,(u,v)=>cap(u,v*Math.PI*2),(u,v)=>new Color('#e4d9c2').lerp(new Color('#f0e8d5'),0.4+0.10*u*Math.sin(v*Math.PI*6+u*9)).getStyle())),'tissue','#ffffff'));
  extra.push(mesh(surface(8,48,(u,v)=>cap(0.18+u*0.82,v*Math.PI*2,true)),'tissue','#b6a28b'));
  // Twenty-six primary lamellae retain the original count, with shorter
  // intercalated lamellulae making the crowded underside. Their lower edges
  // follow the cap curvature and taper to nothing at the free inner attachment.
  for(let k=0;k<78;k++){
    const primary=k%3===0, start=primary?0.0062:(k%3===1?0.011:0.018);
    const a=k*Math.PI*2/78+0.004*Math.sin(k*3.7);
    extra.push(mesh(shell(surface(primary?6:5,1,(u,v)=>{
      const outer=0.0275*(1+0.022*Math.sin(a*3)+0.012*Math.cos(a*7+1));
      const r=start+u*(outer-start),bend=a+0.018*Math.sin(u*Math.PI+k),depth=0.0048*Math.pow(Math.sin(Math.PI*u),0.6);
      return [r*Math.cos(bend)+0.0004,capY+0.00255+0.0017*(1-r/0.029)-v*depth+0.0005*Math.sin(a*3+0.7),r*Math.sin(bend)];
    }),0.00018),'tissue',k%3===0?'#a17a66':GILLS));
  }
  // Soft, uneven membranous ring with a scalloped lower edge.
  extra.push(mesh(shell(surface(4,36,(u,v)=>{
    const a=v*Math.PI*2,r=0.0053+u*0.0041*(1+0.08*Math.sin(a*7)),y=0.0315-u*0.004+0.00035*u*Math.sin(a*9);
    return [0.0003+r*Math.cos(a),y,0.0004+r*Math.sin(a)];
  }),0.00016),'tissue','#e7ddc9'));
  const primitive=sweep([[0,0,0],[0.0002,0.006,0.0002],[-0.0008,0.020,0.0003],[0.0007,0.033,0.0005],[0.0006,0.045,0.0004]],[0.0063,0.0064,0.0053,0.0049,0.0044],'tissue',{tint:CREAM,caps:'flat',radial:20,segments:20,rings:{every:0.0016,depth:0.018}});
  // Fine longitudinal fibres are tapered and gently wandering, following the stipe.
  for(let k=0;k<6;k++){
    const a=k*2.39996;
    extra.push(sweep([[Math.cos(a)*0.0063,0.004,Math.sin(a)*0.0063],[Math.cos(a+0.04)*0.0056-0.0005,0.017,Math.sin(a+0.04)*0.0056],[Math.cos(a+0.08)*0.005+0.0004,0.026,Math.sin(a+0.08)*0.005]],[0.00009,0.00011,0.00002],'tissue',{tint:'#cec1a7',caps:'flat',radial:6,segments:10}));
  }
  return {primitive,extra};
}

/** A decaying log with corrugated bark, broken end grain and four zoned conks. */
export function bracketFungus():Model{
  const extra:Prim[]=[];
  const radius=(u:number,a:number)=>0.014*(1+0.075*Math.sin(a*11+u*5)+0.055*Math.sin(a*23-u*8))*(0.96+0.04*Math.sin(u*9));
  const log=flip(surface(24,36,(u,v)=>{
    const a=v*Math.PI*2,r=radius(u,a),x=(u-0.5)*0.061+0.0008*Math.sin(a*7)*Math.pow(Math.abs(2*u-1),8);
    return [x,0.014+r*Math.cos(a),r*Math.sin(a)];
  },(u,v)=>new Color('#503c2c').lerp(new Color('#987855'),0.5+0.25*Math.sin(v*Math.PI*22+u*5)).getStyle()));
  for(const sign of [-1,1]){const end=surface(6,32,(u,v)=>{
    const a=v*Math.PI*2,r=radius(sign<0?0:1,a)*u;
    return [sign*0.0305+0.0007*Math.sin(a*7)*Math.pow(u,6),0.014+r*Math.cos(a),r*Math.sin(a)];
  },(u)=>new Color('#735537').lerp(new Color('#c1a375'),0.5+0.22*Math.sin(u*45)).getStyle());extra.push(mesh(sign<0?flip(end):end,'wood','#ffffff'));}
  const shelves:[number,number,number,number][]=[[-0.012,0.014,0.017,0.2],[0.006,0.022,0.019,-0.1],[-0.004,0.030,0.014,0.1],[0.018,0.011,0.012,-0.3]];
  for(const [k,[x,y,r,phase]] of shelves.entries()){
    const shelf=(u:number,v:number):V3=>{
      const a=(v-0.5)*Math.PI*1.1+phase,reach=r*u*(1+0.035*Math.sin(v*31+k)+0.025*Math.sin(v*47-k));
      return [x+Math.sin(a)*reach,y+0.002*(1-u*u)+0.00045*Math.sin(v*23+k)*u*u,0.004+Math.cos(a)*reach];
    };
    extra.push(mesh(shell(surface(8,28,shelf,(u)=>{
      if(u>0.93)return '#d8c6a0';
      const c=['#8b6039','#a77d49','#65472e','#bd965d','#967047','#c4a475'];
      return c[Math.min(c.length-1,Math.floor(u*c.length))]!;
    }),0.0015*(1-k*0.08)),'tissue','#ffffff'));
  }
  return {primitive:mesh(log,'wood','#ffffff'),extra};
}

const sliceOutline=():[number,number][]=>{
  const shape:[number,number][]=[[-0.026,-0.026],[0.026,-0.026],[0.027,0.004]];
  for(let i=0;i<=20;i++){const a=i/20*Math.PI;shape.push([0.027*Math.cos(a)*(1+0.06*Math.sin(a)),0.006+0.019*Math.sin(a)]);}
  shape.push([-0.026,0.004]);return shape;
};

export function mouldyBread():Model{
  const extra:Prim[]=[],random=rng(1201),outline=sliceOutline();
  const bread=(scale:number,depth:number,y:number,tint:string):Prim=>({kind:'extrude',shape:outline.map(([x,z])=>[x*scale,z*scale]),depth,bevel:Math.min(0.0008,depth*0.3),at:[0,y,0],rotation:[-90,0,0],color:'enamel',tint});
  extra.push(bread(0.949,0.0014,0.0112,'#e3c89c'));
  // Shallow concave crumb pores with pale lips, rather than black dots on a slab.
  for(let i=0;i<18;i++){
    const x=(random()-0.5)*0.045,z=(random()-0.5)*0.038,r=0.0004+random()*0.0007;
    extra.push(mesh(flip(surface(3,10,(u,v)=>{const a=v*Math.PI*2;return[x+Math.cos(a)*r*u,0.01204-0.00009*(1-u*u),z+Math.sin(a)*r*u*0.65];})),'tissue','#ad8755'));
  }
  const patches:[number,number,number][]=[[-0.010,-0.008,0.007],[0.011,0.006,0.0055],[0.004,-0.014,0.004],[-0.012,0.012,0.0045]];
  for(const [k,[x,z,r]] of patches.entries()){
    extra.push(mesh(flip(surface(5,28,(u,v)=>{
      const a=v*Math.PI*2,rr=r*1.4*u*(1+0.10*Math.sin(a*7+k)+0.07*Math.sin(a*11-k));
      return[x+rr*Math.cos(a),0.0121+0.0008*Math.pow(Math.max(0,1-u*u),0.6),z+rr*Math.sin(a)];
    },(u)=>u>0.76?'#ececdf':u>0.58?'#a8b9a2':'#638879')),'fabric','#ffffff'));
    for(let j=0;j<18;j++){
      const a=random()*Math.PI*2,d=Math.sqrt(random())*r*1.35,at:V3=[x+Math.cos(a)*d,0.0124,z+Math.sin(a)*d],h=0.0004+random()*0.0013;
      extra.push(sweep([at,add(at,[0.00012,h*0.55,0]),add(at,[0.00025,h,0.00008])],[0.000055,0.000043,0.00002],'tissue',{tint:d>r?'#e7e9db':'#8fa28e',caps:'flat',radial:6,segments:4}));
      if(d<r*0.9&&j%2===0)extra.push(mesh(flip(surface(4,6,(u,v)=>{const th=u*Math.PI,aa=v*Math.PI*2;return add(at,[0.00025+0.00016*Math.sin(th)*Math.cos(aa),h+0.00014*Math.cos(th),0.00008+0.00016*Math.sin(th)*Math.sin(aa)]);})), 'tissue','#4b7467'));
    }
  }
  return {primitive:bread(1,0.011,0.0055,'#b88145'),extra};
}

export function yeast():Model{
  const random=rng(13),extra:Prim[]=[];
  // The shallow pile consists of distinct irregular cylindrical dry granules.
  // Sixteen large grains remain identifiable, with fine grains filling beneath.
  for(let i=0;i<58;i++){
    const a=random()*Math.PI*2,d=Math.sqrt(random())*0.021,large=i<16,r=large?0.00105:0.00052+random()*0.00028,y=0.0023+r+0.0002;
    const mid=large?0.0017:0.0007+random()*0.0006;
    extra.push(lathe([Math.cos(a)*d,y,Math.sin(a)*d],[[0,-mid/2-r],[r*0.7,-mid/2-r*0.7],[r,-mid/2],[r,mid/2],[r*0.7,mid/2+r*0.7],[0,mid/2+r]],'abrasive',{tint:i%4===0?'#bba174':i%3===0?'#ead5a9':'#d6bd8b',rotation:[random()*25,random()*180,80+random()*20],segments:10}));
  }
  return {primitive:lathe([0,0,0],[[0,0],[0.024,0],[0.029,0.006],[0.030,0.0075],[0.0298,0.0085],[0.0286,0.0087],[0.0275,0.006],[0.0232,0.0023],[0,0.0023]],'enamel',{tint:'#efebe2',segments:48}),extra};
}

export function bacteriaDish():Model{
  const random=rng(14),colonies:Prim[]=[],placed:[number,number,number][]=[];let guard=0;
  while(placed.length<13&&guard++<400){
    const rad=0.0012+random()*random()*0.0032,a=random()*Math.PI*2,d=Math.sqrt(random())*(0.022-rad),x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(placed.some(([px,pz,pr])=>Math.hypot(px-x,pz-z)<pr+rad+0.0012))continue;
    placed.push([x,z,rad]);const k=placed.length;
    const profile:[number,number][]=[];
    for(let j=0;j<=7;j++){const th=j/7*Math.PI/2;profile.push([rad*Math.sin(th),rad*0.24*Math.cos(th)]);}
    profile.push([0,0]);
    colonies.push(lathe([x,0.0047,z],profile,'enamel',{tint:k%4?'#efe5cc':'#e2d5af',segments:rad<0.0026?24:32,scale:[1,1,1+0.035*Math.sin(k*2.1)],rotation:[0,k*137.5,0]}));
  }
  return {primitive:lathe([0,0,0],[[0,0],[0.0275,0],[0.028,0.0005],[0.028,0.0072],[0.0272,0.0072],[0.0272,0.0008],[0,0.0008]],'glass',{segments:48}),extra:[lathe([0,0,0],[[0.0296,0.0042],[0.0296,0.0098],[0,0.0098],[0,0.0092],[0.029,0.0092],[0.029,0.0042]],'glass',{segments:48}),lathe([0,0.0008,0],[[0,0],[0.0271,0],[0.0271,0.0038],[0,0.0038]],'tissue',{tint:'#e2d197',segments:48}),...colonies]};
}
