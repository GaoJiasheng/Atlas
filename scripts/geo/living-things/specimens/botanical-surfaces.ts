/** Build-time botanical surfaces. Organic ribbons are curved in three dimensions;
 * they are baked to the topic's static mesh, never interpreted by the renderer. */
import { BufferGeometry, Float32BufferAttribute, Color, Shape, ShapeUtils, Vector2 } from 'three';
import { gridUV } from '../uv';
import { add, cross, mul, norm, sub, type Prim, type V3, type V2 } from '../kit';

export function surface(n: number, m: number, point: (u: number, v: number) => V3, colour?: (u: number, v: number) => string): BufferGeometry {
  const p: number[] = [], c: number[] = [], index: number[] = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    const u = i / n, v = j / m;
    p.push(...point(u, v));
    if (colour) { const col = new Color(colour(u, v)); c.push(col.r, col.g, col.b); }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const a = i * (m + 1) + j, b = a + m + 1;
    index.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(p, 3));
  if (c.length) g.setAttribute('color', new Float32BufferAttribute(c, 3));
  g.setIndex(index); g.computeVertexNormals();gridUV(g,n,m);
  // Polar caps and periodic seams share positions but have separate grid vertices.
  // Average their normals so a radial seam cannot crease an otherwise soft cap.
  const pos=g.getAttribute('position'),normal=g.getAttribute('normal'),seams=new Map<string,number[]>();
  for(let i=0;i<pos.count;i++){
    const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*1e9)).join(',');
    const group=seams.get(key);if(group)group.push(i);else seams.set(key,[i]);
  }
  for(const group of seams.values())if(group.length>1){
    const sum:V3=[0,0,0];for(const i of group){sum[0]+=normal.getX(i);sum[1]+=normal.getY(i);sum[2]+=normal.getZ(i);}
    const length=Math.hypot(...sum);if(length>1e-12)for(const i of group)normal.setXYZ(i,sum[0]/length,sum[1]/length,sum[2]/length);
  }
  return g;
}

/** Reverse a one-sided patch to face the outside of the specimen. */
export function flip(g: BufferGeometry): BufferGeometry {
  const index=g.index!;
  for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}
  const normal=g.getAttribute('normal');for(let i=0;i<normal.count;i++)normal.setXYZ(i,-normal.getX(i),-normal.getY(i),-normal.getZ(i));return g;
}

/** Give a leaf or lamella a true fine edge and two independently lit faces. */
export function shell(g: BufferGeometry, thickness = 0.00012): BufferGeometry {
  const p=g.getAttribute('position'), normal=g.getAttribute('normal'), colour=g.getAttribute('color'),uv=g.getAttribute('uv');
  const positions:number[]=[], colors:number[]=[], indices:number[]=[],normals:number[]=[],uvs:number[]=[];
  for(const sign of [1,-1]) for(let i=0;i<p.count;i++) {
    if(uv)uvs.push(uv.getX(i),uv.getY(i));
    positions.push(p.getX(i)+normal.getX(i)*thickness*0.5*sign,p.getY(i)+normal.getY(i)*thickness*0.5*sign,p.getZ(i)+normal.getZ(i)*thickness*0.5*sign);
    normals.push(normal.getX(i)*sign,normal.getY(i)*sign,normal.getZ(i)*sign);
    if(colour) colors.push(colour.getX(i),colour.getY(i),colour.getZ(i));
  }
  const src=g.index!.array;
  const edges=new Map<string,[number,number,number]>();
  for(let i=0;i<src.length;i+=3){const a=src[i]!,b=src[i+1]!,c=src[i+2]!;indices.push(a,b,c,c+p.count,b+p.count,a+p.count);
    for(const [x,y] of [[a,b],[b,c],[c,a]]){const key=Math.min(x!,y!)+','+Math.max(x!,y!);const old=edges.get(key);edges.set(key,[x!,y!,(old?.[2]??0)+1]);}}
  for(const [a,b,count] of edges.values()) if(count===1) indices.push(a,b+p.count,b,a,a+p.count,b+p.count);
  const out=new BufferGeometry();out.setAttribute('position',new Float32BufferAttribute(positions,3));if(colors.length)out.setAttribute('color',new Float32BufferAttribute(colors,3));out.setIndex(indices);if(uv)out.setAttribute('uv',new Float32BufferAttribute(uvs,2));out.setAttribute('normal',new Float32BufferAttribute(normals,3));return out;
}

export const mesh = (geometry: BufferGeometry, color: string, tint: string, at: V3 = [0, 0, 0]): Prim => ({ kind: '__mesh', geometry, color, tint, at });

/** Interpolated botanical ribbon with a folded midrib and softly undulating edges.
 * Width is full width and can vary continuously along the frond. */
export function ribbon(points: V3[], widths: number[], seed: number, n = 28, m = 8, cup = 0.14, wave = 1): { geometry: BufferGeometry; centre: V3[]; sample: (t: number, side: number) => V3 } {
  const at = (t: number): V3 => {
    const q = Math.min(points.length - 1.000001, t * (points.length - 1)), k = Math.floor(q), u = q - k;
    const a = points[Math.max(0, k - 1)]!, b = points[k]!, c = points[k + 1]!, d = points[Math.min(points.length - 1, k + 2)]!;
    return b.map((v, axis) => 0.5 * ((2 * v) + (-a[axis]! + c[axis]!) * u + (2*a[axis]! - 5*v + 4*c[axis]! - d[axis]!) * u*u + (-a[axis]! + 3*v - 3*c[axis]! + d[axis]!) * u*u*u)) as V3;
  };
  const sample = (t: number, side: number): V3 => {
    const centre = at(t), tangent = norm(sub(at(Math.min(1, t + 0.001)), at(Math.max(0, t - 0.001))));
    let across = norm(cross(tangent, [0.05*Math.sin(seed), 1, 0.07*Math.cos(seed)]));
    if (!Number.isFinite(across[0])) across = [1,0,0];
    const normal = norm(cross(across, tangent));
    const q = Math.min(widths.length - 1.000001, t * (widths.length-1)), k = Math.floor(q), f=q-k;
    const wa=widths[Math.max(0,k-1)]!,wb=widths[k]!,wc=widths[k+1]!,wd=widths[Math.min(widths.length-1,k+2)]!;
    const w = Math.max(0.000015,0.5*(2*wb+(-wa+wc)*f+(2*wa-5*wb+4*wc-wd)*f*f+(-wa+3*wb-3*wc+wd)*f*f*f));
    const twist = 0.2*Math.sin(3.2*t+seed)*t;
    const sideWidth = w*0.5*side*(1+0.075*wave*Math.sin(t*21+seed+side)*Math.abs(side));
    const fold = w*(cup*Math.pow(Math.abs(side),0.8) + 0.065*wave*Math.sin(t*23+seed+side*0.8)*Math.pow(Math.abs(side),3));
    across = add(mul(across, Math.cos(twist)), mul(normal, Math.sin(twist)));
    return add(centre, add(mul(across, sideWidth), mul(normal, fold)));
  };
  return {geometry: shell(surface(n,m,(u,v)=>sample(u,2*v-1))), centre:Array.from({length:17},(_,i)=>at(i/16)), sample};
}

/** Uneven solid river stone / bark host, with longitudinal ridges rather than a box. */
export function barkHost(vertical = false): Prim[] {
  const furrows=(u:number,v:number)=>{
    let channel=0;const centres=[0.035,0.10,0.205,0.27,0.365,0.485,0.55,0.675,0.755,0.87,0.96];
    for(let i=0;i<centres.length;i++){const c=centres[i]!+0.013*Math.sin(u*(5+i%3)+i*1.7)+0.004*Math.sin(u*19-i),width=0.015+0.007*(1+Math.sin(i*2.3));channel+=Math.exp(-(((v-c)/width)**2))*(0.55+0.25*Math.sin(i*1.9));}
    return channel;
  };
  const p = (u: number, v: number): V3 => {
    const xx=2*u-1,zz=2*v-1;
    const x=xx*0.030*(1-0.13*Math.pow(Math.abs(zz),6))+0.0007*Math.sin(v*23)*Math.pow(Math.abs(xx),8);
    const z=zz*0.022*(1-0.14*Math.pow(Math.abs(xx),6))*(1+0.035*Math.sin(u*19));
    const grain=-0.00115*furrows(u,v)+0.00012*Math.sin(v*51+u*17);
    const y=0.006+0.004*(1-zz*zz)+0.0007*Math.sin(u*11)+grain;
    return vertical ? [z*0.88,x+0.035,y+0.004] : [x,y,z];
  };
  const tint=(u:number,v:number)=>new Color('#4b3828').lerp(new Color('#a28a65'),0.72-0.57*Math.min(1,furrows(u,v))+0.07*Math.sin(u*19+v*51)).getStyle();
  return [mesh(shell(surface(20,28,p,tint),0.0032),'wood','#ffffff')];
}

export function organicStone(): Prim {
  return mesh(flip(surface(20,32,(u,v)=>{
    const a=v*Math.PI*2, th=u*Math.PI, r=Math.sin(th)*(1+0.045*Math.sin(a*5+th*3)+0.03*Math.cos(a*9-th*4));
    return [0.030*r*Math.cos(a), 0.008+0.009*Math.cos(th)*(1+0.08*Math.sin(3*a)), 0.023*r*Math.sin(a)];
  },(u,v)=>new Color('#74736a').lerp(new Color('#99978a'),0.35+0.25*Math.sin(v*27+u*14)).getStyle())),'abrasive','#ffffff');
}

/** A continuous twice-bifurcating fern blade, with rounded Y crotches.
 * Its interior is adaptively tessellated before gravity and curl warp it in 3D. */
export function forkedFrond(origin:V3,seed:number):BufferGeometry{
  const left: [number,number][]=[[-0.0015,0],[-0.0027,0.010],[-0.0058,0.019],[-0.0093,0.029],[-0.0138,0.047],[-0.0134,0.050],[-0.0122,0.0503],[-0.0115,0.047],[-0.0073,0.032],[-0.0062,0.029],[-0.0051,0.033],[-0.0043,0.047],[-0.0032,0.049],[-0.0022,0.047],[-0.0031,0.032],[-0.0033,0.027],[-0.0008,0.020],[0,0.0175]];
  const outline=[...left,...left.slice(0,-1).reverse().map(([x,y]):[number,number]=>[-x,y])];
  const shape=new Shape();
  for(let i=0;i<outline.length;i++){
    const prev=outline[(i+outline.length-1)%outline.length]!,p=outline[i]!,next=outline[(i+1)%outline.length]!;
    const before=new Vector2(p[0]+(prev[0]-p[0])*0.18,p[1]+(prev[1]-p[1])*0.18),after=new Vector2(p[0]+(next[0]-p[0])*0.18,p[1]+(next[1]-p[1])*0.18);
    if(i===0)shape.moveTo(before.x,before.y);else shape.lineTo(before.x,before.y);
    shape.quadraticCurveTo(p[0],p[1],after.x,after.y);
  }
  shape.closePath();
  const points=shape.getPoints(3),faces=ShapeUtils.triangulateShape(points,[]),verts:V2[]=points.map(p=>[p.x,p.y]),indices:number[]=[],cache=new Map<string,number>();
  const midpoint=(a:number,b:number)=>{const key=Math.min(a,b)+','+Math.max(a,b);let id=cache.get(key);if(id===undefined){id=verts.length;verts.push([(verts[a]![0]+verts[b]![0])*0.5,(verts[a]![1]+verts[b]![1])*0.5]);cache.set(key,id);}return id;};
  const divide=(a:number,b:number,c:number,depth:number)=>{
    const pairs:[[number,number,number],[number,number,number],[number,number,number]]=[[a,b,c],[b,c,a],[c,a,b]];
    const lengths=pairs.map(([i,j])=>(verts[i]![0]-verts[j]![0])**2+(verts[i]![1]-verts[j]![1])**2),longest=lengths.indexOf(Math.max(...lengths));
    if(lengths[longest]!<0.005**2||depth>12){indices.push(a,b,c);return;}
    const [i,j,k]=pairs[longest]!,m=midpoint(i,j);divide(i,m,k,depth+1);divide(m,j,k,depth+1);
  };
  for(const f of faces)divide(f[0]!,f[1]!,f[2]!,0);
  const positions:number[]=[];
  for(const [x,y]of verts){const t=y/0.0503;
    const yaw=0.36*Math.sin(seed),dx=x*(0.87+0.07*Math.sin(seed))+0.0012*Math.sin(t*4+seed)*t,dz=0.012*Math.sin(t*Math.PI*0.85)+0.004*t*t+0.00065*Math.sin(x*230+t*4+seed)*Math.sin(t*Math.PI);
    positions.push(origin[0]+dx*Math.cos(yaw)+dz*Math.sin(yaw),origin[1]-y*(0.72+0.05*Math.sin(seed*2))+0.0017*Math.sin(t*Math.PI),origin[2]-dx*Math.sin(yaw)+dz*Math.cos(yaw));
  }
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return shell(geometry,0.00014);
}
