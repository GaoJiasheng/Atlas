/** Topic-local diplodocid osteology. Original CC0 geometry; Hatcher (1901),
 * Osborn & Granger (1901), Wilson & Sereno (1998). Not a specimen inventory.
 * Author coordinates are kept stable so the accepted 30° view/plinths survive.
 */
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Primitive } from '../../../src/engines/space-scene/schema';
import { boneSweep, ribCage, vertebra, vertebralColumn, type Point } from '../kits/dinosaur-skeleton';
type XY = [number, number];
const add = (a:Point,b:Point):Point=>a.map((v,i)=>v+b[i]!) as Point;
/** Rounded, asymmetric articular flares with a curved, narrow diaphysis.
 * Dense sampling is spent on the shoulders of the condyles, not flat caps. */
function longBone(a:Point,b:Point,shaft:number,head=shaft*1.65,bend=.02):Primitive {
 const ts=[0,.025,.060,.105,.17,.28,.46,.66,.81,.90,.95,.98,1];
 const profile=[.52,.79,.96,1,.84,shaft/head*1.08,shaft/head,shaft/head*.91,shaft/head*1.04,.85,.98,.78,.50];
 const path=ts.map(t=>a.map((v,i)=>(b[i]!-v)*t+(i===0?Math.sin(t*Math.PI)*bend:0)) as Point);
 return boneSweep(a,path,profile.map(r=>r*head),.78,36);
}
const plate=(at:Point,shape:XY[],depth:number,holes:XY[][]=[]):Primitive=>({kind:'extrude',at,shape,depth,holes,bevel:.002,color:'plastic',tint:'token:fossil'});
const oval=(x:number,y:number,rx:number,ry:number):XY[]=>Array.from({length:24},(_,i)=>[x+rx*Math.cos(i*Math.PI/12),y+ry*Math.sin(i*Math.PI/12)]);

// Broad glenoid/coracoid end, anterior acromion step, long narrow blade.
// The scapula is carried obliquely against the ribs, not an oval shield.
export const scapulaOutline:XY[]=[[-.075,-.095],[-.092,-.064],[-.092,-.018],[-.077,.028],[-.067,.087],[-.034,.114],[-.012,.094],[.012,.115],[.089,.211],[.162,.284],[.197,.303],[.223,.291],[.233,.266],[.192,.231],[.126,.157],[.063,.063],[.041,.003],[.016,-.053],[-.026,-.083]];
// Arched dorsal rim, long preacetabular wing, shorter posterior wing and
// distinct pubic/ischial peduncles separated by an open acetabular notch.
export const iliumOutline:XY[]=[[-.249,.048],[-.234,.094],[-.191,.132],[-.119,.154],[-.041,.166],[.045,.161],[.122,.139],[.177,.103],[.187,.061],[.171,.027],[.124,.022],[.092,.028],[.087,-.042],[.062,-.058],[.040,-.031],[.022,.010],[-.004,.024],[-.029,.013],[-.052,-.027],[-.063,-.071],[-.098,-.077],[-.122,-.046],[-.130,.018],[-.190,.029]];

export function sauropodFoot(ankle:Point,side:number,hind:boolean):Primitive[]{
 const out:Primitive[]=[];
 if(!hind){
  // Five appressed, almost vertical metacarpals wrap a posteriorly open U.
  // Unequal manual ray lengths and offsets, not a radial fan of fingers.
  const plan:XY[]=[[.010,-.047],[-.031,-.033],[-.045,.002],[-.026,.039],[.014,.049]];
  const lengths=[.111,.121,.124,.117,.103];
  for(let j=0;j<5;j++){
   const [dx,dz]=plan[j]!,base=add(ankle,[dx,-lengths[j]!,side*dz]);
   out.push(longBone(add(ankle,[dx*.91,-.006,side*dz*.94]),base,.014+(j===2?.002:0),.022, .001));
   // Vestigial distal phalanges are short, blunt, under the column.
   const tip=add(base,[-.005,-.011,0]);
   out.push(longBone(base,tip,.012,.016,0));
   if(j===0)out.push(boneSweep(tip,[[0,0,0],[-.016,.003,-side*.004],[-.041,-.003,-side*.009],[-.052,-.013,-side*.014]],[.020,.018,.009,.0007],.62,12));
  }
 }else{
  // Elevated short metatarsals over a broad semi-plantigrade pes. Medial
  // digit I is stoutest; II–III carry progressively smaller unguals, IV–V none.
  const rays=[{z:-.052,x:-.044,l:.039,r:.021,c:.058,n:1},{z:-.024,x:-.061,l:.043,r:.019,c:.044,n:2},{z:.010,x:-.063,l:.039,r:.017,c:.031,n:3},{z:.044,x:-.050,l:.026,r:.014,c:0,n:2},{z:.068,x:-.021,l:.013,r:.012,c:0,n:1}];
  for(const ray of rays){
   const root=add(ankle,[.010,-.011,side*ray.z*.66]);
   const base=add(ankle,[ray.x,-.100,side*ray.z]);
   out.push(longBone(root,base,ray.r,ray.r*1.38,.003));
   let start=base;
   for(let j=0;j<ray.n;j++){
    const next=add(base,[-ray.l*(j+1)/ray.n,-.011*(j+1)/ray.n,side*.004*(j+1)/ray.n]);
    out.push(longBone(start,next,ray.r*(.78-j*.08),ray.r*(.96-j*.09),0));start=next;
   }
   if(ray.c)out.push(boneSweep(start,[[0,0,0],[-ray.c*.33,.006,-side*.003],[-ray.c*.78,.002,-side*.007],[-ray.c,-.012,-side*.010]],[ray.r*.95,ray.r*.88,ray.r*.45,.0007],.64,12));
  }
 }
 return out;
}

export function sauropodTail(cx=0,z=0):Primitive[]{
 const curve=new CatmullRomCurve3([[.62,1.04,0],[.95,.97,0],[1.48,.88,0],[2.12,.89,0],[2.75,1.03,0]].map(p=>new Vector3(...p as Point)),false,'centripetal');
 const length=curve.getLength(),out:Primitive[]=[];
 for(let i=0;i<80;i++){
  const t=(i+.5)/80,p=curve.getPointAt(t),d=curve.getTangentAt(t),angle=Math.atan2(d.y,d.x)*180/Math.PI;
  const r=.041*Math.pow(1-t,1.55)+.003;
  const spine=.106*Math.pow(Math.max(0,1-i/29),1.65);
  const chevron=.061*Math.pow(Math.max(0,1-i/36),1.35);
  const bones=vertebra([p.x+cx,p.y,p.z+z],length/80,r,spine,angle,0);
  out.push(bones[0]!);
  if(i<30)out.push(bones[1]!);
  if(i<16)for(const s of [-1,1])out.push(boneSweep([p.x+cx,p.y,p.z+z],[[0,-r*.1,s*r*.5],[.003,-r*.04,s*(r+.060*Math.pow(1-i/17,1.4))]],[r*.3,r*.16],.65,5));
  if(i<36){
   // Paired haemal branches meet below the intercentrum joint; proximal
   // chevrons are deep, middle ones low sleds, distal ones disappear.
   for(const s of [-1,1])out.push(boneSweep([p.x+cx+length/160,p.y,p.z+z],[[0,-r*.45,s*r*.5],[-.003,-r-chevron*.45,s*r*.34],[-.006,-r-chevron,0]],[r*.22,r*.19,r*.12],.7,6));
  }
 }
 return out;
}

export function diplodocidStudy(cx:number,z:number):Primitive[]{
 const P=(x:number,y:number,dz=0):Point=>[cx+x,y,z+dz],out:Primitive[]=[];
 out.push(...vertebralColumn([P(-1.58,1.6),P(-1.27,1.57),P(-.92,1.42),P(-.56,1.13),P(-.38,1.07)],15,.027,.049,.055,{fork:true}));
 const dorsals=Array.from({length:10},(_,i)=>P(-.35+i*.075,1.08+.055*Math.sin(i/9*Math.PI)));
 for(const p of dorsals)out.push(...vertebra(p,.075,.047,.125));
 out.push(...ribCage(dorsals,.25,.48,.012));
 out.push(...vertebralColumn([P(.36,1.08),P(.62,1.04)],5,.055,.05,.12),...sauropodTail(cx,z));
 for(const s of [-1,1]){
  out.push(plate(P(-1.69,1.59,s*.035),[[-.16,-.025],[-.16,.035],[-.04,.09],[.095,.05],[.09,-.035],[-.07,-.04]],.018,[oval(-.015,.03,.026,.032),oval(-.095,.025,.035,.017)]));
  out.push(boneSweep(P(-1.69,1.54,s*.032),[[-.15,0,0],[-.07,-.02,0],[.085,.02,0]],[.014,.013,.019],.65,10));
  out.push(plate(P(.43,1.04,s*.16),iliumOutline,.045));
  out.push(longBone(P(.34,.99,s*.16),P(.38,.73,s*.10),.018,.032));
  out.push(longBone(P(.50,.99,s*.16),P(.62,.78,s*.10),.016,.029));
  out.push(plate(P(-.28,.93,s*.19),scapulaOutline,.033));
 }
 for(const x of [-.29,.46])for(const s of [-1,1]){
  const hind=x>0,dz=s*(hind?.16:.19),hip=P(x,.91,dz),knee=P(x+(hind?.055:-.015),.56,dz+s*.025),ankle=P(x+(hind?.035:.015),.22,dz+s*.04);
  out.push(longBone(hip,knee,.030,.058),longBone(knee,ankle,.023,.042));
  out.push(longBone(add(knee,[.025,0,s*.035]),add(ankle,[.035,.018,s*.03]),.012,.023));
  out.push(...sauropodFoot(ankle,s,hind));
 }
 for(const p of out){
  if(p.kind==='lathe'){const r=Math.max(...p.profile.map(v=>v[0]));p.segments=r<.012?12:r<.035?20:24;}
  if(p.kind==='sweep')p.radial=Math.max(...[p.radius].flat())<.008?10:Math.max(...[p.radius].flat())<.025?16:24;
 }
 return out;
}
