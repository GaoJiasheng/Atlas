/** Original embedded coir microstructure; macroscopic fibres remain curved meshes. */
import sharp from 'sharp';
import { rng } from '../living-things/kit';
export async function coirMaps() {
  const W=512,H=256,G=8,w=W-G*2,h=H-G*2, random=rng(11709);
  const field=new Float32Array(w*h);
  for(let i=0;i<19000;i++) {
    const x=random()*w,y=random()*h,L=5+random()*27,bend=(random()-.5)*5;
    for(let j=0;j<=L*2;j++){
      const t=j/(L*2),xx=Math.round(x-L*t),yy=Math.round(y+bend*Math.sin(t*Math.PI));
      if(xx>=0&&xx<w)field[((yy+h)%h)*w+xx]=Math.max(field[((yy+h)%h)*w+xx]!,Math.sin(t*Math.PI)*(.3+random()*.7));
    }
  }
  const at=(x:number,y:number)=>field[((y+h)%h)*w+Math.max(0,Math.min(w-1,x))]!;
  const color=Buffer.alloc(W*H*3,255),normal=Buffer.alloc(W*H*3);
  for(let i=0;i<W*H;i++)normal.set([128,128,255],i*3);
  for(let y=G-3;y<=H-G+3;y++)for(let x=G-3;x<=W-G+3;x++){
    const a=Math.max(0,Math.min(w-1,x-G)),b=(y-G+h)%h,k=(y*W+x)*3;
    const c=Math.round(185+69*at(a,b));color.set([c,c,c],k);
    const dx=(at(a+1,b)-at(a-1,b))*.65,dy=(at(a,b+1)-at(a,b-1))*.65,L=Math.hypot(dx,dy,1);
    normal.set([.5-dx/L*.5,.5-dy/L*.5,.5+.5/L].map(v=>Math.round(v*255)),k);
  }
  return {
    color:await sharp(color,{raw:{width:W,height:H,channels:3}}).jpeg({quality:53,chromaSubsampling:'4:4:4'}).toBuffer(),
    normal:await sharp(normal,{raw:{width:W,height:H,channels:3}}).jpeg({quality:58,chromaSubsampling:'4:4:4'}).toBuffer(),
  };
}
