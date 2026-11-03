/** Asian toad skin: irregular embedded dermal tubercles, black keratin tips,
 * and paired elongate kidney-shaped parotoid glands behind the eyes. */
import { BufferGeometry,Color,Float32BufferAttribute,Vector3 } from 'three';
import { modelGeometry } from '../bake';
import { surface,mesh,type P } from '../sculpture';
import { rng,type Model,type Prim } from '../kit';
export function wartyToad(model:Model):Model {
 const random=rng(86503),pieces:Prim[]=[],base=new Color('#796849'),tip=new Color('#302d22');
 const bumpsP:number[]=[],bumpsN:number[]=[],bumpsC:number[]=[],bumpsUV:number[]=[],bumpsIX:number[]=[];
 const append=(g:BufferGeometry)=>{
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),uv=g.getAttribute('uv'),off=bumpsP.length/3;
  for(let i=0;i<p.count;i++){bumpsP.push(p.getX(i),p.getY(i),p.getZ(i));bumpsN.push(n.getX(i),n.getY(i),n.getZ(i));bumpsC.push(c.getX(i),c.getY(i),c.getZ(i));bumpsUV.push(uv.getX(i),uv.getY(i));}
  for(const i of g.index!.array)bumpsIX.push(off+i);g.dispose();
 };
 const bodyParts=[model.primitive,...model.extra];
 for(let part=0;part<bodyParts.length;part++){
  let prim=bodyParts[part]!;
  // Remove the ten old sparse, oversized "wart balls" and two small glands.
  if(part>=2&&part<=11)continue;
  if(prim.kind==='lathe'&&prim.color==='abrasive'&&Math.abs(prim.at[0]-.008)<.0001)continue;
  const isSkin=prim.color==='abrasive'||prim.tint==='#6b5c3e';
  if(!isSkin){
   if(prim.color==='eye'||prim.color==='enamel'){const g=modelGeometry({primitive:prim,extra:[]}),uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,.5,.5);pieces.push(mesh(g,'tissue','#ffffff'));}
   else pieces.push(prim);continue;
  }
  let g=modelGeometry({primitive:prim,extra:[]});
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),ix=g.index!;
  // Fine irregular mottling stays in the skin rather than flat discs.
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),m=.5+.5*Math.sin(x*1480+Math.sin(z*1900))*Math.sin(z*1200+y*800);
   const col=base.clone().lerp(new Color('#4d4934'),m*.12).lerp(new Color('#b5a782'),Math.max(0,-n.getY(i))*.5);c.setXYZ(i,col.r,col.g,col.b);
  }
  const a=new Vector3(),b=new Vector3(),d=new Vector3();
  for(let i=0;i<ix.count;i+=3){
   const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)];
   a.fromBufferAttribute(p,ids[0]!);b.fromBufferAttribute(p,ids[1]!);d.fromBufferAttribute(p,ids[2]!);
   const area=b.clone().sub(a).cross(d.clone().sub(a)).length()*.5;
   let number=area/0.0000040;number=Math.floor(number)+(random()<number%1?1:0);
   for(let k=0;k<number;k++){
    const u=Math.sqrt(random()),v=random(),weights=[1-u,u*(1-v),u*v],q=new Vector3(),normal=new Vector3();
    ids.forEach((id,j)=>{q.addScaledVector(new Vector3().fromBufferAttribute(p,id),weights[j]!);normal.addScaledVector(new Vector3().fromBufferAttribute(n,id),weights[j]!);});normal.normalize();
    if(normal.y<-.18||q.y<.003)continue;
    const U=new Vector3(1,0,0).addScaledVector(normal,-normal.x).normalize(),V=new Vector3().crossVectors(normal,U);
    const r=.00023+Math.pow(random(),2)*.00057,height=r*(.35+random()*.5),stretch=.75+random()*.55,black=random()<.70;
    const colors:number[]=[];
    const bump=surface(3,8,(s,t)=>{
     const angle=t*Math.PI*2,rad=s*r*(1+.09*Math.sin(angle*3+k));
     const h=height*Math.pow(1-s*s,2)-rad*rad/(part===0?.028:.014)+.000025;
     const col=base.clone().lerp(tip,black?(1-Math.min(1,s*2.8))*.92:.08);colors.push(col.r,col.g,col.b);
     return q.clone().addScaledVector(U,Math.cos(angle)*rad).addScaledVector(V,Math.sin(angle)*rad*stretch).addScaledVector(normal,h).toArray() as P;
    },true);
    // Polar patch tangent orientation faces outward.
    bump.setAttribute('color',new Float32BufferAttribute(colors,3));append(bump);
   }
  }
  prim=mesh(g,'tissue','#ffffff');pieces.push(prim);
 }
 for(const side of [-1,1]){
  const colors:number[]=[];
  const gland=surface(26,24,(u,v)=>{
   const a=v*Math.PI*2,r=Math.pow(Math.sin(Math.PI*u),.6),x=.0015+u*.0105;
   const c=base.clone().lerp(tip,.30+.10*Math.sin(u*39+v*60));colors.push(c.r,c.g,c.b);
   return [x,.0188+Math.sin(a)*r*.0015,side*(.0086+Math.cos(a)*r*.0024+.0005*Math.sin(u*Math.PI*2))];
  },true);
  if(side<0){const ix=gland.index!;for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}gland.computeVertexNormals();}
  gland.setAttribute('color',new Float32BufferAttribute(colors,3));pieces.push(mesh(gland,'tissue','#ffffff'));
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(bumpsP,3));g.setAttribute('normal',new Float32BufferAttribute(bumpsN,3));g.setAttribute('color',new Float32BufferAttribute(bumpsC,3));g.setAttribute('uv',new Float32BufferAttribute(bumpsUV,2));g.setIndex(bumpsIX);pieces.push(mesh(g,'tissue','#ffffff'));
 return {primitive:pieces[0]!,extra:pieces.slice(1)};
}
