/** Graphite plate derived from saved engine-studio source frames. */
import sharp from 'sharp';
const dir='scripts/anatomy/rebuild-illustrations';
const topics=process.argv[2]?[process.argv[2]]:['arms','back','chest','core','legs','shoulders'];const iteration=Number(process.argv[3]??18);
function bg(a:Uint8Array,i:number){return a[i]===233&&a[i+1]===228&&a[i+2]===216;}
for(const topic of topics){const source=Number(process.argv[4]??iteration);
const {data:a,info}=await sharp(`${dir}/review/muscles-${topic}-studio-r${source}.png`).raw().toBuffer({resolveWithObject:true}),b=await sharp(`${dir}/review/muscles-${topic}-skin-r${source}.png`).raw().toBuffer();const W=info.width,H=info.height;
const coveredAlpha=new Float32Array(W*H),d=new Float32Array(W*H),mask=new Uint8Array(W*H),muscle=new Uint8Array(W*H),out=Buffer.alloc(W*H*4);
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,k=i*3,sourceY=(topic==='legs'?.86:1.045)+(H/2-y)*(topic==='legs'?1.94:1.56)/H;if(bg(b,k))continue;mask[i]=1;muscle[i]=Number(!bg(a,k));
const headTone=smooth(1.43,1.51,sourceY),nativeSkinShade=Math.max(0,Math.min(.10,(245-b[k]!)/320));const skinShade=nativeSkinShade*(1-headTone)+.028*headTone;let value=muscle[i]?Math.max(skinShade,Math.min(1,Math.max(0,(252-a[k]!)/255))):skinShade;
if(iteration>2){
// A covered head/upper neck, with a continuous blend instead of a severed muscle edge.
const head=smooth(1.43,1.50,sourceY);value=value*(1-head)+skinShade*head;coveredAlpha[i]=head;
// Covered hands and feet share the covered-head language; tendon-only digits
// would mix an undissected outline with a bone-like dissection inside it.
const bodyX=Math.abs((x-W/2)*(topic==='legs'?1.94:1.56)/W);
const hand=(1-smooth(.74,.82,sourceY))*smooth(.21,.27,bodyX),foot=topic==='legs'?1-smooth(.09,.15,sourceY):0,covered=Math.max(hand,foot);
value=value*(1-covered)+skinShade*covered;coveredAlpha[i]=Math.max(head,covered);
if(topic==='back')value*=.65+.35*smooth(.78,.98,sourceY);
}
d[i]=value;}
// Native paired sheets leave a few subpixel medial slits. Finish the posterior
// raphe from adjacent native tissue tones, not with a fabricated vertebral row.
if(iteration>2&&['back','shoulders'].includes(topic)){const copy=d.slice(),span=topic==='legs'?1.94:1.56;for(let y=0;y<H;y++){const sourceY=1.045+(H/2-y)*span/H;if(sourceY<.90||sourceY>1.445)continue;const cx=Math.floor(W/2),base=(copy[y*W+cx-14]!+copy[y*W+cx+14]!)*.5;for(let x=cx-9;x<=cx+9;x++){const sourceX=(x-W/2)*span/W,w=1-smooth(.0025,.008,Math.abs(sourceX));d[y*W+x]=copy[y*W+x]!*(1-w)+(base+.012)*w;}}}
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x,k=i*4;if(!mask[i])continue;
let shade=d[i]!;const sourceY=(topic==='legs'?.86:1.045)+(H/2-y)*(topic==='legs'?1.94:1.56)/H,fade=topic==='legs'?1:Math.max(0,Math.min(1,(sourceY-.40)/.18));if(!fade)continue;
const edge=!mask[i-1]||!mask[i+1]||!mask[i-W]||!mask[i+W],gradient=Math.max(Math.abs(shade-d[i-1]!),Math.abs(shade-d[i+1]!),Math.abs(shade-d[i-W]!),Math.abs(shade-d[i+W]!));
const jitter=Math.sin(y*.021)*1.2+Math.sin(x*.031)*.6;
// Do not lay generic diagonal hatch over rectus: its genuine vertical relief and
// three native transverse grooves carry the teaching anatomy.
const rectusZone=!['back','shoulders'].includes(topic)&&sourceY>.845&&sourceY<1.255&&Math.abs((x-W/2)*(topic==='legs'?1.94:1.56)/W)<(.026+.055*Math.min(1,Math.max(0,(sourceY-.86)/.085))); 
const hatch=!rectusZone&&muscle[i]&&(((x+y*1.72+jitter)%12<1.1&&shade>.18)||((x*1.9-y+jitter+5000)%19<1&&shade>.49));
const grain=((x*73+y*193)%47)/47;
const ink=edge?.76:Math.min(.83,shade*(iteration>5?.78:iteration>3?.56:iteration>2?.36:.39)+gradient*(iteration>2?.95:.65)+(hatch?(iteration>3?.055:iteration>2?.12:.17):0)+(shade>.12?(grain-.5)*.02:0));const v=Math.round(255*(1-ink));out[k]=out[k+1]=out[k+2]=v;out[k+3]=Math.round((edge?220:muscle[i]?238-123*coveredAlpha[i]!:115)*fade);
}
const file=`${dir}/sources/muscles-${topic}-r${iteration}.png`;await sharp(out,{raw:{width:W,height:H,channels:4}}).png().toFile(file);await sharp(file).flatten({background:'#e9e4d8'}).png().toFile(`${dir}/review/muscles-${topic}-paper-r${iteration}.png`);console.log(file);}
