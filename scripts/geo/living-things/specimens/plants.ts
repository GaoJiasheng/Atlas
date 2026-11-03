/** Botanical specimen models: curved, creased leaves and naturally irregular growth. */
import { Color } from 'three';
import { add, cross, DEG, ellipsoid, lathe, mul, norm, rng, sweep, type Model, type Prim, type V3 } from '../kit';
import { barkHost, flip, forkedFrond, mesh, organicStone, ribbon, shell, surface } from './botanical-surfaces';

const POT='#b4683f';
const pot=(r:number,h:number):Prim=>lathe([0,0,0],[[0,0],[r*0.76,0],[r*0.81,0.001],[r,h-0.004],[r*1.065,h-0.0038],[r*1.07,h+0.0006],[r*1.03,h+0.0015],[r*0.93,h+0.0015],[r*0.90,h-0.002],[0,h-0.002]],'enamel',{tint:POT,segments:48});

function leaf(at:V3,dir:V3,l:number,w:number,tint:string,seed:number):Prim[]{
  const d=norm(dir), across=norm(cross(d,[0,1,0]));
  const points:V3[]=[at,add(at,add(mul(d,l*0.3),[0,l*0.1,0])),add(at,add(mul(d,l*0.66),mul(across,l*0.025*Math.sin(seed)))),add(at,add(mul(d,l),[0,-l*0.14,0]))];
  const r=ribbon(points,[0.00025,w*0.78,w,0.00002],seed,14,4,0.09,0.10);
  return [mesh(r.geometry,'tissue',tint),sweep(r.centre,[0.00018,0.00022,0.00023,0.00024,0.00025,0.00024,0.00023,0.00021,0.00019,0.00018,0.00016,0.00014,0.00012,0.0001,0.00008,0.00006,0.00002],'tissue',{tint:'#819654',caps:'flat',radial:6,segments:10})];
}

/** Each ixora floret has exactly four softly cupped petals on a narrow tube. */
function ixoraFlower(at:V3,n:V3,seed:number):Prim[]{
  const x=norm(cross(n,[0.1,0,1])),y=cross(n,x), extra:Prim[]=[];
  extra.push(sweep([add(at,mul(n,-0.004)),add(at,mul(n,-0.001)),at],[0.00026,0.00030,0.00035],'tissue',{tint:'#cb542b',caps:'flat',radial:6,segments:5}));
  for(let k=0;k<4;k++){
    const a=k*Math.PI/2+0.1*Math.sin(seed), d=add(mul(x,Math.cos(a)),mul(y,Math.sin(a))),ac=add(mul(x,-Math.sin(a)),mul(y,Math.cos(a)));
    const l=0.0034*(1+0.06*Math.sin(seed+k));
    extra.push(mesh(shell(surface(3,2,(u,v)=>{
      const s=2*v-1,w=0.0011*Math.pow(Math.sin(Math.PI*u),0.58);
      return add(at,add(mul(d,l*u),add(mul(ac,w*s),mul(n,0.0005*Math.sin(Math.PI*u)-0.00025*u*u))));
    }),0.00009),'tissue',k%2?'#e05a32':'#d84b26'));
  }
  return extra;
}

export function ixora():Model{
  const extra:Prim[]=[ellipsoid([0,0.0201,0],0.0152,[1,0.08,1],'abrasive',{tint:'#4f402a',segments:32})], base:V3=[0,0.020,0];
  const tops:V3[]=[[0.013,0.083,0.006],[-0.014,0.077,0.004],[0.001,0.09,-0.014]];
  for(const [i,top] of tops.entries()){
    const mid=add(mul(add(base,top),0.5),[top[0]*0.2,0,top[2]*0.2]);
    extra.push(sweep([base,mid,top],[0.0015,0.0011,0.00055],'tissue',{tint:'#455b29',caps:'flat',radial:10,segments:16}));
    const out=norm([top[0],0,top[2]]),side=norm(cross([0,1,0],out));
    for(const sign of [1,-1]){
      extra.push(...leaf(add(mul(add(base,mid),0.5),[0,0.008,0]),add(mul(side,sign),[0,0.18,0]),0.025*(1+sign*0.04),0.011,'#315d2d',i*7+sign));
      extra.push(...leaf(add(mul(add(mid,top),0.5),[0,-0.005,0]),add(mul(out,sign),[0,0.3,0]),0.021,0.009,'#3c6b32',i*8+sign));
    }
    // Spiral packing with a raised central flower: a cluster, never a coloured ball.
    for(let k=0;k<7;k++){
      const a=k*2.39996+i*0.37,d=0.008*Math.sqrt(k/6),n=norm([Math.cos(a)*d*40,0.9,Math.sin(a)*d*40]);
      const at=add(top,[Math.cos(a)*d,0.004+0.003*(1-d/0.009),Math.sin(a)*d]);
      extra.push(sweep([top,add(at,mul(n,-0.004))],[0.00020,0.00008],'tissue',{tint:'#6b783b',caps:'flat',radial:6,segments:4}));
      extra.push(...ixoraFlower(at,n,i*11+k));
    }
  }
  return {primitive:pot(0.017,0.022),extra};
}

export function chilliSeedling():Model{
  const extra:Prim[]=[ellipsoid([0,0.0181,0],0.0134,[1,0.08,1],'abrasive',{tint:'#51442e',segments:32}),sweep([[0,0.018,0],[0.0014,0.04,0],[0.0007,0.063,0.001]],[0.0013,0.001,0.0006],'tissue',{tint:'#66893d',caps:'flat',radial:10,segments:20})];
  for(const sign of [1,-1]){
    extra.push(...leaf([0.0012,0.041,0],[sign,0.28,sign*0.15],0.017*(1+0.05*sign),0.0043,'#7a9b45',sign));
    extra.push(...leaf([0.0013,0.052,0.0005],[0.25*sign,0.35,sign],0.022*(1-0.05*sign),0.0095,'#5a9136',sign+4));
    extra.push(...leaf([0.0008,0.061,0.001],[sign,0.56,-0.2*sign],0.015*(1+0.06*sign),0.0064,'#77a448',sign+7));
  }
  extra.push(...leaf([0.0007,0.063,0.001],[0.1,0.95,0.2],0.005,0.0022,'#8daf52',11));
  return {primitive:pot(0.015,0.020),extra};
}

export function rhuSapling():Model{
  const extra:Prim[]=[ellipsoid([0,0.0191,0],0.0143,[1,0.08,1],'abrasive',{tint:'#55452e',segments:32})], random=rng(604), trunk=(y:number):V3=>[0.0015*Math.sin(y*40),y,0.0008*Math.cos(y*30)];
  extra.push(sweep([trunk(0.020),trunk(0.044),trunk(0.074),trunk(0.101),trunk(0.113)],[0.0021,0.0017,0.0012,0.0007,0.00015],'wood',{tint:'#72573e',caps:'flat',radial:12,segments:24}));
  // Casuarina's foliage is jointed green branchlets, not pine needles or radial sticks.
  for(let level=0;level<6;level++){
    const y=0.042+level*0.012;
    for(let k=0;k<3;k++){
      const a=k*2.14+level*1.18+random()*0.28,reach=(0.029-level*0.0036)*(0.86+random()*0.22),o:V3=[Math.cos(a),0,Math.sin(a)],start=trunk(y);
      const branch=[start,add(start,add(mul(o,reach*0.42),[0,0.005,0])),add(start,add(mul(o,reach*0.82),[0,-0.0005,0])),add(start,add(mul(o,reach),[0,-0.011,0]))];
      extra.push(sweep(branch,[0.00055,0.00046,0.00028,0.00003],'tissue',{tint:'#617949',caps:'flat',radial:6,segments:10,rings:{every:0.0025,depth:0.11}}));
      for(let j=1;j<=2;j++){
        const t=j/4,attach=add(start,add(mul(o,reach*t),[0,0.004*Math.sin(t*Math.PI),0])),side=a+(j%2?1:-1)*(0.42+random()*0.35),l=(0.013+random()*0.008)*(1-level*0.1);
        extra.push(sweep([attach,add(attach,[Math.cos(side)*l*0.4,-0.002,Math.sin(side)*l*0.4]),add(attach,[Math.cos(side)*l*0.7,-0.011,Math.sin(side)*l*0.7]),add(attach,[Math.cos(side)*l*0.8,-0.019*(1-level*0.09),Math.sin(side)*l*0.8])],[0.00032,0.00028,0.00018,0.00002],'tissue',{tint:j===2?'#7d925c':'#6e8750',caps:'flat',radial:6,segments:5,rings:{every:0.0022,depth:0.16}}));
      }
    }
  }
  // Three persistent woody fruit clusters with visibly open scales, as stated in the part text.
  for(const [k,y] of [0.056,0.069,0.081].entries()){
    const a=(k*130+20)*DEG,at=add(trunk(y),[Math.cos(a)*0.008,-0.003,Math.sin(a)*0.008]);
    extra.push(sweep([trunk(y),at],[0.0005,0.0003],'wood',{tint:'#72573e',caps:'flat',radial:6,segments:6}));
    extra.push(ellipsoid(at,0.0023,[1,1.22,1],'wood',{tint:'#6f4d32',segments:20}));
    for(let row=0;row<4;row++)for(let j=0;j<5;j++){
      const angle=j*Math.PI/3+row*0.4,rr=0.0022*Math.sin((row+0.7)/4.6*Math.PI),p=add(at,[Math.cos(angle)*rr,(row-1.5)*0.00115,Math.sin(angle)*rr]);
      extra.push(mesh(surface(3,4,(u,v)=>{const aa=(v-0.5)*Math.PI,rr=0.00065*Math.sin(Math.PI*u);return add(p,[Math.cos(angle)*rr*Math.cos(aa),0.0009*(u-0.5),Math.sin(angle)*rr*Math.cos(aa)]);}), 'wood','#a08055'));
    }
  }
  return {primitive:pot(0.016,0.021),extra};
}

export function birdsNestFern():Model{
  const extra:Prim[]=barkHost(), random=rng(701);
  for(let k=0;k<10;k++){
    const a=k*2.39996+random()*0.17,reach=0.026+random()*0.006,height=0.032+random()*0.012,o:V3=[Math.cos(a),0,Math.sin(a)],base:V3=[o[0]*0.003,0.016,o[2]*0.003];
    const points:V3[]=[base,add(base,add(mul(o,reach*0.20),[0,height*0.38,0])),add(base,add(mul(o,reach*0.59),[0,height*0.79,0])),add(base,add(mul(o,reach),[0,height*(0.6+random()*0.13),0]))];
    const r=ribbon(points,[0.0006,0.004,0.0083,0.0103,0.0102,0.0088,0.00006],k*1.19,28,4,0.12);
    const green=new Color('#4f842d').lerp(new Color('#74a73b'),random()*0.8).getHexString();
    extra.push(mesh(r.geometry,'tissue',`#${green}`));
    extra.push(sweep(r.centre,r.centre.map((_,i)=>0.00035*(1-i/18)),'tissue',{tint:'#394a20',caps:'flat',radial:6,segments:20}));
    if(k===3||k===8)for(let j=0;j<10;j++)for(const side of [-1,1]){
      const t=0.46+j*0.041,p0=r.sample(t,side*0.15),p1=r.sample(t+0.026,side*0.77),p2=r.sample(t+0.037,side*0.91);
      const offset:V3=[0,-0.00018,0];
      extra.push(sweep([add(p0,offset),add(p1,offset),add(p2,offset)],[0.00012,0.00014,0.00004],'tissue',{tint:'#765133',caps:'flat',radial:6,segments:4}));
    }
  }
  // Short, tangled roots and old stipe bases leave the nest centre hollow.
  for(let k=0;k<16;k++){
    const a=k*2.4,d=0.003+random()*0.003;
    extra.push(sweep([[Math.cos(a)*d,0.015,Math.sin(a)*d],[Math.cos(a+0.35)*d*1.3,0.013,Math.sin(a+0.35)*d*1.3],[Math.cos(a+0.7)*d*1.6,0.011,Math.sin(a+0.7)*d*1.6]],[0.00035,0.00025,0.00003],'wood',{tint:k%2?'#806443':'#5d4d31',caps:'flat',radial:6,segments:5}));
  }
  const primitive=extra.shift()!;
  return {primitive,extra};
}

export function staghornFern():Model{
   const extra:Prim[]=barkHost(true);
  // Sterile shields wrap the host in a shallow crown, their upper margins lobed.
  for(let layer=0;layer<2;layer++){
    const phase=layer*1.9,half=0.016+layer*0.0015;
    extra.push(mesh(shell(surface(layer===0?8:18,layer===0?18:24,(u,v)=>{
      const angle=(v-0.5)*Math.PI*1.25+phase*0.12,spread=half*Math.sin(Math.PI*u*0.77),lobes=0.0013*Math.sin(v*Math.PI*7+phase+0.17*Math.sin(v*14))*u*u;
      return [Math.sin(angle)*spread,0.032+u*((layer===0?0.018:0.031)+lobes*4)-0.003*layer,0.012+Math.cos(angle)*spread*0.42+0.003*Math.sin(Math.PI*u)];
    }),0.00018),'tissue',layer===0?'#9b8a5b':'#8da85a'));
  }
  // Each blade is one continuous surface with two rounded bifurcations.
  for(let k=0;k<5;k++)extra.push(mesh(forkedFrond([(k-2)*0.0043,0.040,0.017],k*1.7),'tissue',k%2?'#819d58':'#77934d'));
  const primitive=extra.shift()!;return {primitive,extra};
}

export function moss():Model{
  const extra:Prim[]=[],random=rng(901);
  const patches:[number,number,number][]=[[-0.012,0.004,0.011],[0.008,-0.006,0.012],[0.014,0.010,0.008],[-0.004,-0.012,0.008],[-0.020,-0.006,0.006]];
  // Interlocking leafy mats below the visible shoots form five soft cushions.
  // Their low, irregular surfaces have many tiny tuft summits, never ball silhouettes.
  for(const [k,[x,z,r]] of patches.entries())extra.push(mesh(flip(surface(8,20,(u,v)=>{
    const a=v*Math.PI*2,rr=r*u*(1+0.09*Math.sin(a*5+k)+0.05*Math.sin(a*11));
    const tuft=0.00018*(Math.sin(u*25+a*6)+Math.cos(u*17-a*9));
    const xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr,ground=0.008+0.009*Math.sqrt(Math.max(0,1-(xx/0.030)**2-(zz/0.023)**2))-0.0004;
    return [xx,ground+0.0037*Math.pow(Math.max(0,1-u*u),0.65)+tuft*Math.sin(Math.PI*u),zz];
  },(u,v)=>new Color('#3e6024').lerp(new Color('#73953b'),0.4+0.25*Math.sin(u*47+v*36)).getStyle())),'tissue','#ffffff'));
  for(let i=0;i<55;i++){
    const [px,pz,r]=patches[i%patches.length]!,a=i*2.39996+random()*0.4,d=Math.sqrt(random())*r*0.88,x=px+Math.cos(a)*d,z=pz+Math.sin(a)*d,y=0.008+0.009*Math.sqrt(Math.max(0,1-(x/0.030)**2-(z/0.023)**2))-0.0004+0.0037*Math.pow(Math.max(0,1-(d/r)**2),0.65),h=0.0018+random()*0.0028;
    extra.push(sweep([[x,y,z],[x+0.0003,y+h*0.6,z],[x-0.0002,y+h,z+0.0003]],[0.00012,0.00009,0.00002],'tissue',{tint:'#516d29',caps:'flat',radial:6,segments:4}));
    for(let j=0;j<5;j++){
      const aa=j*2.4+i*0.7,at:V3=[x,y+h*(0.12+j*0.13),z],l=0.0020*(0.8+random()*0.5),dx=Math.cos(aa)*l,dz=Math.sin(aa)*l;
      const r=ribbon([at,add(at,[dx*0.75,l*0.28,dz*0.75]),add(at,[dx,l*0.6,dz])],[0.0001,0.00065,0.00002],i+j,3,1,0.10,0.15);
      extra.push(mesh(r.geometry,'tissue',j>3?'#86a440':i%3?'#668934':'#557d2b'));
    }
  }
  return {primitive:organicStone(),extra};
}
