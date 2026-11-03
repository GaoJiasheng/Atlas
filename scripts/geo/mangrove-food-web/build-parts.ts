/** Original procedural teaching habitat (docs/53 §3). Dimensions are DESIGN,
 * never specimen measurements. External photos were read only for morphology;
 * no image, texture, traced outline or third-party mesh is used here.
 * Imported by build-topic.ts; invoking this script alone writes geometry only.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { partSchema, partsFileBase } from '../../../src/engines/space-scene/schema';
import { CatmullRomCurve3, Vector3 } from 'three';
import { ellipticLeaf } from '../kits/tree';
import { add, blade, box, ellipsoid, r3, sweep, wing, type Prim, type V3 } from '../living-things/kit';

const bi = (en: string, zh: string) => ({ en, zh });
const ink = 'token:ink-2';
const bark = { color: 'wood', tint: 'token:neutral' };
const foliage = { color: 'tissue', tint: 'token:seedling' };
const hard = { color: 'chitin', tint: 'token:neutral' };
const fish = { color: 'tissue', tint: 'token:ink-3' };
const line = (path: V3[], radius: number | number[], material = bark): Prim => sweep(path, radius, material.color, { tint: material.tint, radial: 10, segments: 14, caps: 'flat' });
const oval = (at: V3, radius: number, scale: V3, material = hard): Prim => ellipsoid(at, radius, scale, material.color, { tint: material.tint, segments: 28, profile: Array.from({length:13},(_,i)=>[i===0||i===12?0:radius*Math.sin(i*Math.PI/12),-radius*Math.cos(i*Math.PI/12)]) });
const camera = (position: V3, target: V3, fov = 32) => ({ position, target, fov });

/** Four walking pairs, two chelipeds, two eyes. +Z is the crab's front.
 * Smooth asymmetric shell loft and flattened, jointed limb sweeps. The climbing
 * specimen keeps its feet against the trunk in both existing tide poses.
 */
function crab(at: V3, male: boolean, vertical = false) {
  const map = ([x,y,z]: V3): V3 => r3(add(at,vertical ? [x,z,y] : [x,y,z]));
  const extra: Prim[]=[];
  for (const side of [-1,1]) for (const z of [-.027,-.010,.009,.026]) {
    const bend=z*1.8;
    const joints: V3[]=[[side*.032,.028,z],[side*.058,.042,bend],[side*.076,.040,bend+.008],[side*(vertical?.035:.094),.017,bend+.018],[side*(vertical?.024:.104),.002,bend+.026]];
    const radii=[.0038,.0048,.0036,.0023,.0006];
    const path:V3[]=[],sizes:number[]=[];
    joints.forEach((joint,j)=>{
      if(j>0&&j<joints.length-1) {
        path.push(map(joint.map((v,k)=>v*.88+joints[j-1]![k]!*.12) as V3));sizes.push(radii[j]!*.78);
      }
      path.push(map(joint));sizes.push(radii[j]!);
      if(j>0&&j<joints.length-1) {
        path.push(map(joint.map((v,k)=>v*.88+joints[j+1]![k]!*.12) as V3));sizes.push(radii[j]!*.78);
      }
    });
    extra.push({...line(path,sizes,hard),section:{flat:.55},up:vertical?[0,0,1]:[0,1,0],segments:20,radial:16});
  }
  for (const [i,side] of [-1,1].entries()) {
    const big=male && i===0;
    if(big) {
      // Enlarged LEFT cheliped, carried transversely in front of the mouth.
      // Separate merus, short knuckled carpus, broad palm and opposing fingers.
      extra.push({...line([map([-.029,.027,.026]),map([-.045,.035,.044]),map([-.059,.046,.060])],[.0055,.010,.0075],hard),section:{flat:.65},radial:24,segments:20});
      extra.push({...line([map([-.059,.046,.060]),map([-.057,.056,.074]),map([-.046,.060,.081])],[.007,.011,.009],hard),section:{flat:.77},radial:24,segments:18});
      extra.push({...line([map([-.050,.059,.081]),map([-.041,.063,.085]),map([-.024,.063,.088]),map([-.010,.060,.089]),map([.000,.056,.089])],[.006,.017,.018,.009,.0003],hard),section:{flat:.65},up:[0,0,1],radial:32,segments:28});
      // Fixed finger continues the lower propodal margin; no closed C/ring.
      extra.push({...line([map([-.035,.059,.088]),map([-.022,.049,.088]),map([-.003,.046,.090]),map([.017,.049,.091]),map([.039,.058,.091])],[.010,.008,.0055,.0036,.0006],hard),section:{flat:.66},up:[0,0,1],radial:24,segments:26});
      // Dactyl pivots at the dorsal distal corner of the palm.
      extra.push({...line([map([-.025,.069,.088]),map([-.014,.074,.088]),map([.002,.080,.090]),map([.020,.077,.091]),map([.041,.064,.091])],[.008,.007,.0058,.0033,.0005],hard),section:{flat:.62},up:[0,0,1],radial:24,segments:26});
      extra.push(oval(map([-.014,.074,.094]),.003,[1,1,.45],hard));
      // Small granular tubercles on the palm and the cutting edges.
      for(let j=0;j<6;j++) {
        const x=-.043+j*.006;
        extra.push(oval(map([x,.065+Math.sin(j*1.2)*.005,.098]),.0010+(j%3)*.00025,[1,.85,.5],hard));
      }
      for(let j=0;j<3;j++)extra.push({...line([map([-.004+j*.012,.049+j*.001,.091]),map([-.003+j*.012,.053+j*.001,.091])],[.0019,.0003],hard),radial:10,segments:7});
    } else {
      extra.push({...line([map([side*.027,.026,.027]),map([side*.045,.031,.044]),map([side*.045,.035,.064])],[.0045,.006,.0035],hard),section:{flat:.70},radial:20});
      extra.push({...line([map([side*.045,.035,.064]),map([side*.041,.038,.072]),map([side*.035,.037,.081]),map([side*.030,.035,.090])],[.003,.007,.005,.0013],hard),section:{flat:.66},radial:24});
      extra.push({...line([map([side*.035,.041,.079]),map([side*.030,.043,.086]),map([side*.028,.038,.092])],[.003,.002,.0004],hard),radial:20,segments:18});
    }
    extra.push(line([map([side*.018,.041,.027]),map([side*.022,.062,.035]),map([side*.026,.079,.039])],[.0032,.0027,.0022],hard));
    extra.push(oval(map([side*.026,.081,.039]),.0045,[1,1.25,1],{color:'eye',tint:'token:ink'}));
  }
  const primitive={...line([map([0,.025,-.035]),map([0,.030,-.023]),map([0,.032,-.002]),map([0,.030,.018]),map([0,.026,.032]),map([0,.025,.035])],[.007,.029,.043,.045,.033,.010],hard),section:{flat:.35},up:vertical?[0,0,1]:[0,1,0],segments:40,radial:48};
  return {primitive,extra};
}

/** Generic heron: contoured body, kinked S-neck, layered folded remiges,
 * two tibia/ankle/tarsus chains and three forward toes plus a hallux per foot.
 */
function heronModel() {
  const plumage={color:'feathers',tint:'token:ink-3'};
  const wingMaterial={color:'feathers',tint:'token:ink-2'};
  const extra: Prim[]=[
    line([[.59,.32,-.02],[.612,.367,-.02],[.577,.410,-.02],[.552,.469,-.02],[.608,.516,-.02],[.661,.483,-.02]],[.023,.018,.012,.011,.015,.017],plumage),
    oval([.679,.482,-.02],.027,[1.43,.78,.82],plumage),
    {...line([[.703,.479,-.02],[.726,.475,-.02],[.766,.467,-.02],[.817,.453,-.02]],[.011,.009,.005,.0003],hard),section:{flat:.64}},
  ];
  for(const side of [-1,1]) {
    const z=-.02+side*.043;
    extra.push({...line([[.598,.350,z],[.561,.346,z],[.513,.320,z],[.467,.293,z]],[.009,.032,.027,.001],wingMaterial),section:{flat:.30},up:[0,0,1]});
    for(let i=0;i<5;i++) extra.push({...line([[.590-i*.010,.364-i*.008,z+side*(.023+i*.002)],[.535-i*.012,.334-i*.006,z+side*(.026+i*.002)],[.470-i*.009,.289-i*.001,z+side*(.019+i*.002)]],[.005,.007,.0003],wingMaterial),section:{flat:.18},up:[0,0,1],segments:16});
    const footX=side<0?.595:.565;
    extra.push({...line([[.563,.295,z],[.567,.243,z],[.547,.158,z],[.549,.148,z],[footX,.025,z],[footX,.006,z]],[.008,.0051,.006,.0047,.0028,.0024],hard),rings:{every:.008,depth:.08}});
    for(const spread of [-1,0,1]) extra.push(line([[footX,.006,z],[footX+.020,.004,z+spread*.012],[footX+.047-(Math.abs(spread)*.010),.002,z+spread*.023]],[.0025,.0018,.00045],hard));
    extra.push(line([[footX,.006,z],[footX-.019,.003,z+side*.006],[footX-.031,.002,z+side*.010]],[.0023,.0015,.0004],hard));
    extra.push(oval([.687,.490,-.02+side*.021],.0045,[1,1,1],{color:'eye',tint:'token:ink'}));
  }
  for(let i=-1;i<=1;i++) extra.push({...line([[.485,.31,-.02+i*.006],[.449,.298,-.02+i*.009],[.424+Math.abs(i)*.006,.284,-.02+i*.012]],[.008,.010,.0004],plumage),section:{flat:.17},up:[0,1,0],segments:12});
  return {primitive:{...line([[.449,.307,-.02],[.489,.331,-.02],[.551,.340,-.02],[.597,.326,-.02],[.614,.304,-.02]],[.005,.034,.052,.038,.007],plumage),section:{flat:.91},segments:36,radial:24},extra};
}

/** Smooth fin perimeter plus a small internal ray-bearing membrane. This
 * avoids the wing mesher subdividing the entire curved contour 256 times.
 * Both surfaces share the fin frame and material; vein lines cover the fan. */
function rayedFin(at:V3,outline:[number,number][],x:V3,y:V3,veins:[number,number][][]):Prim[] {
  const base=wing(at,outline,x,y,fish.color,{tint:fish.tint});
  const support:[number,number][]=[outline[0]!,outline[Math.floor(outline.length/3)]!,outline[Math.floor(outline.length*2/3)]!];
  return [base,wing(at,support,x,y,fish.color,{tint:fish.tint,thickness:.00075,veins})];
}

function fishModel(at: V3, small = false) {
  const s=small?.58:1;
  const pt=(p:V3)=>r3(add(at,p.map(v=>v*s)));
  const extra:Prim[]=[];
  for(const side of [-1,1]) {
    const eye:V3=small?[.092,.027,side*.025]:[.095,.054,side*.018];
    extra.push(oval(pt(eye),.012*s,[1.12,1.20,.92],fish));
    extra.push(oval(pt([eye[0]+.004,eye[1]+.007,eye[2]+side*.006]),.0062*s,[1,1,.75],{color:'eye',tint:'token:ink'}));
    if(!small) {
      // Shoulder-to-elbow muscular lobe, then a short wrist. The rays arise
      // from a narrow distal joint, rather than a flat blade at the shoulder.
      extra.push({...line([pt([.054,.012,side*.018]),pt([.043,.005,side*.040]),pt([.051,-.010,side*.051]),pt([.038,-.015,side*.055])],[.013,.012,.0085,.005],fish),section:{flat:.80},radial:24,segments:26});
      const fanControls:[number,number][]=[[0,0],[.016,.010],[.024,.024],[.019,.036],[.004,.043],[-.014,.042],[-.030,.032],[-.036,.018],[-.026,.004],[-.012,-.002]];
      const fanCurve=new CatmullRomCurve3(fanControls.map(([a,b])=>new Vector3(a,b,0)),true,'centripetal');
      const outline=fanCurve.getPoints(64).slice(0,-1).map(p=>[p.x,p.y] as [number,number]);
      const rays=Array.from({length:12},(_,i):[number,number][]=>{
        const p=fanCurve.getPoint((1+i*7.7/11)/10);
        const tip:[number,number]=[p.x,p.y];
        return [[-.006,0],[-.006+(tip[0]+.006)*.5,tip[1]*.55],tip];
      });
      extra.push(...rayedFin(pt([.038,-.015,side*.055]),outline.map(([x,y])=>[x*s,y*s]),[1,.10,0],[0,.50,side],rays.map(ray=>ray.map(([x,y])=>[x*s,y*s]))));
    } else extra.push(wing(pt([.047,.005,side*.024]),blade(.051*s,.034*s,.55,14),[-.55,.06,side*.65],[0,1,0],fish.color,{tint:fish.tint}));
  }
  if(small) extra.push(wing(pt([-.121,.005,0]),[[0,0],[-.02*s,.025*s],[-.047*s,.034*s],[-.035*s,0],[-.047*s,-.034*s],[-.02*s,-.025*s]],[1,0,0],[0,1,0],fish.color,{tint:fish.tint}));
  else {
    const tailControls:V3[]=[[0,0,0],[-.015,.018,0],[-.036,.028,0],[-.050,.020,0],[-.054,0,0],[-.050,-.020,0],[-.036,-.028,0],[-.015,-.018,0]];
    const tailCurve=new CatmullRomCurve3(tailControls.map(p=>new Vector3(...p)),true,'centripetal');
    const outline=tailCurve.getPoints(56).slice(0,-1).map(p=>[p.x,p.y] as [number,number]);
    const rays=Array.from({length:10},(_,i):[number,number][]=>{const p=tailCurve.getPoint((1+i*6/9)/8);return [[-.002,0],[p.x,p.y]];});
    extra.push(...rayedFin(pt([-.121,.005,0]),outline,[1,0,0],[0,1,0],rays));
  }
  // Two separate dorsal membranes on the mudskipper; a taller anterior sail.
  const fins=small?[[-.055,.035,.075,.025]]:[[-.073,.028,.069,.032],[.006,.044,.054,.058]];
  for(const [x,y,len,height] of fins as [number,number,number,number][]) {
    const finControls:[[number,number],...[number,number][]]=[[0,0],[len*.08*s,height*.30*s],[len*.14*s,height*.60*s],[len*.23*s,height*.82*s],[len*.34*s,height*.95*s],[len*.46*s,height*s],[len*.58*s,height*.91*s],[len*.72*s,height*.74*s],[len*.84*s,height*.49*s],[len*.94*s,height*.18*s],[len*s,0]];
    const outline=new CatmullRomCurve3(finControls.map(([a,b])=>new Vector3(a,b,0)),false,'centripetal').getPoints(56).map(p=>[p.x,p.y] as [number,number]);
    extra.push(...rayedFin(pt([x,y,0]),outline,[1,0,0],[0,1,0],Array.from({length:9},(_,i)=>[[len*(i+.6)/10*s,0],[len*(i+.4)/10*s,height*Math.sin((i+1)*Math.PI/11)*s*.88]])));
  }
  extra.push(line([pt([.119,.021,-.018]),pt([.130,.018,0]),pt([.119,.021,.018])],.0012*s,{color:'tissue',tint:'token:ink-2'}));
  return {primitive:{...line([pt([-.135,0,0]),pt([-.100,.004,0]),pt([-.056,.011,0]),pt([0,.016,0]),pt([.057,.021,0]),pt([.097,.024,0]),pt([.119,.022,0]),pt([.132,.020,0])],[.003*s,.011*s,.019*s,.025*s,.032*s,.032*s,.023*s,.0015*s],fish),section:{flat:small?1:.91},segments:60,radial:48},extra};
}

/** Low lip of excavated mud pellets around the front of the burrow mouth:
 * a flattened, unevenly thick arc on the hole's rim (not a free-lying tube). */
function burrowLip():Prim {
  const n=9,path:V3[]=[],radius:number[]=[];
  for(let i=0;i<n;i++){
    const t=i/(n-1),a=(-15+t*210)*Math.PI/180,r=.0300+Math.sin(i*2.3)*.0012;
    path.push([+(r*Math.cos(a)).toFixed(5),+(.0012*Math.sin(t*Math.PI)).toFixed(5),+(r*Math.sin(a)-.025).toFixed(5)]);
    radius.push(+((.0026+.0042*Math.sin(t*Math.PI))*(1+.18*Math.sin(i*1.7))).toFixed(5));
  }
  return {kind:'sweep',at:[-.26,.0050,.145],path,radius,section:{flat:.45},radial:16,segments:40,caps:'flat',color:'abrasive',tint:'token:neutral'} as Prim;
}

export function buildParts() {
  const parts: unknown[] = [];
  // A gently eroded bank edge; rear and specimen-cut faces remain planar.
  const shore=new CatmullRomCurve3([[.8,.17],[.64,.20],[.44,.17],[.22,.24],[.03,.19],[-.2,.24],[-.42,.18],[-.8,.24]].map(([x,z])=>new Vector3(x,0,z)),false,'centripetal').getPoints(72).map(p=>[+p.x.toFixed(5),+p.z.toFixed(5)]);
  const addPart = (id: string, name: ReturnType<typeof bi>, group: string | undefined, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>, geometry: {primitive?: Prim; extra?: Prim[]; repeat?: unknown; mesh?:string; material?:{color:string;tint:string}}, options: Record<string, unknown> = {}) => {
    if ((geometry.extra?.length ?? 0) > 32) throw new Error(`${id}: exceeds 32 extras`);
    if (summary.en.length > 60 || summary.zh.length > 60) throw new Error(`${id}: long summary`);
    parts.push({id,name,...(group ? {group} : {}),summary,detail,...geometry,explode:{dir:[0,1,0],dist:0},clip:false,castShadow:false,...options});
  };
  addPart('mud-bank',bi('Mud bank','泥岸'),'habitat',bi("Supports roots beside the tidal channel.","承托潮沟旁的树根。"),bi("The mudbank supports the roots, with a lower channel along its front. Rising tide covers more of its surface. [S27, S30]","泥岸承托树根，前缘有较低的潮沟。潮水升高时，会盖住更多泥面。[S27, S30]"),{primitive:{kind:'extrude',shape:[[-.8,-.5],[.8,-.5],...shore],depth:.24,bevel:.008,at:[0,-.12,0],rotation:[90,0,0],color:'abrasive',tint:'token:neutral'},extra:[box([0,-.21,.35],[1.6,.06,.3],'abrasive',{tint:'token:neutral'})]},{shell:true,clip:true,castShadow:true});
  addPart('tidal-water',bi('Tidal water','潮水'),'habitat',bi("Covers and exposes mud as the tide changes.","随潮水涨退，覆盖或露出泥面。"),bi("Tides change conditions around the mudbank. Switch between low and high water to compare the exposed mud. Both views keep the same food links. [S27, S30]","潮水涨退会改变泥岸周围的条件。切换低水位和高水位，比较露出的泥面。两种画面保留相同的食物关系。[S27, S30]"),{primitive:box([0,-.04,0],[1.58,.008,.99],'glass',{tint:'token:cold'})});
  addPart('burrow-mouth',bi('Burrow opening','洞口'),'habitat',bi("Provides a hiding place for fiddler crabs.","为招潮蟹提供藏身处。"),bi("Fiddler crabs retreat into burrows at high tide. The crab can be hidden while its burrow opening remains visible. [S5]\n\nOnly the opening is shown here. [S30]","高潮时，招潮蟹会退入洞中。蟹藏起来时，画面仍保留洞口。[S5]\n\n这里只显示洞口。[S30]"),{primitive:burrowLip(),extra:[{kind:'sweep',at:[-.26,.008,.12],path:[[0,0,0],[0,-.04,0]],radius:.026,hollow:.007,radial:48,segments:8,color:'abrasive',tint:'token:ink-2'}]});
  addPart('api-tree',bi('Api-api Putih tree','Api-api Putih 红树'),'mangroves',bi("Makes food and releases salt through its leaves.","制造食物，并通过叶片排盐。"),bi("Api-api Putih (Avicennia alba) has salt glands in its leaves. These help it excrete salt. Different mangrove kinds handle salt in different ways. [S3]\n\nShallow side roots join its upright, pencil-shaped breathing roots. [S2, S3]","Api-api Putih（Avicennia alba）的叶片有盐腺，帮助它排出盐分。不同红树处理盐的方式不同。[S3]\n\n浅层侧根与直立的铅笔状呼吸根相连。[S2, S3]"),{mesh:'api-tree',material:foliage},{connects:['api-lateral'],castShadow:true});

  addPart('api-lateral',bi('Shallow lateral roots','浅侧根'),'mangroves',bi("Joins the tree to its breathing roots.","连接树体与呼吸根。"),bi("Avicennia alba has shallow side roots beneath the mud. Upright breathing roots grow from them. [S3]\n\nThe cutaway shows how these roots join. [S30]","Avicennia alba 的浅层侧根在泥下延伸，直立的呼吸根从侧根长出。[S3]\n\n剖面显示这些根怎样连接。[S30]"),{mesh:'api-lateral',material:bark},{connects:['api-tree','api-pencil'],explode:{dir:[-.5,0,.5],dist:.13}});
  addPart('api-pencil',bi('Pencil breathing roots','铅笔状呼吸根'),'mangroves',bi("Takes in oxygen above the mud.","在泥面上方吸收氧气。"),bi("Pencil-shaped breathing roots grow upright from shallow side roots. They reach above the mud and take in oxygen. [S2, S3]\n\nFollow each root down to see its connection beneath the mud. [S30]","铅笔状呼吸根从浅层侧根向上长出，伸出泥面吸收氧气。[S2, S3]\n\n沿着每根呼吸根往下看，可以找到它在泥下的连接。[S30]"),{mesh:'api-pencil',material:bark},{connects:['api-lateral'],explode:{dir:[-.5,.5,.5],dist:.13}});
  addPart('bakau-tree',bi('Bakau Minyak tree','Bakau Minyak 红树'),'mangroves',bi("Makes food and supplies leaves.","制造食物并供应叶片。"),bi("Bakau Minyak has prop roots reaching down from its trunk. Mangrove trees provide shelter and leaves that can become food. [S2, S6, S8]\n\nIts food-web node supplies new leaf material. Removing it leaves old fallen leaves in the scene. [S30]","Bakau Minyak 的支柱根从树干向下伸出。红树提供庇护，叶片也能成为食物。[S2, S6, S8]\n\n它的食物网节点供应新的叶片物质。移走节点后，画面仍保留旧落叶。[S30]"),{mesh:'bakau-tree',material:foliage},{connects:['bakau-prop'],castShadow:true});
  addPart('bakau-prop',bi('Prop roots','支柱根'),'mangroves',bi("Anchors the tree and shelters young animals.","固定树体，并庇护幼小动物。"),bi("Bakau prop roots reach from the trunk towards the mud and anchor the tree. Spaces between the roots shelter young animals. [S2]\n\nCompare them with the pencil-shaped roots of the neighbouring Api-api. [S30]","Bakau 的支柱根从树干伸向泥地，固定树体。根之间的空隙能庇护幼小动物。[S2]\n\n可以与旁边 Api-api 的铅笔状根比较。[S30]"),{mesh:'bakau-prop',material:bark},{connects:['bakau-tree']});
  const fallen = [[-.13,.008,.11],[-.075,.009,.08],[-.16,.012,.06]] as V3[];
  const deadLeaves=fallen.map((p,i)=>({...ellipticLeaf(p,.10,.04,[0,i%2?-28:28,0]),tint:'token:neutral'}));
  addPart('fallen-leaves',bi('Fallen leaf material','落叶物质'),'mangroves',bi("Provides food after leaves fall.","叶片掉落后仍能提供食物。"),bi("Some mangrove crabs eat fallen leaves and break them into smaller pieces. Dead leaves still contain food energy. [S6, S24]\n\nOld leaves remain when you remove the continuing leaf supply. The calculation leaves out their decay rate. [S30]","有些红树林蟹吃落叶，把叶弄成较小的碎片。死叶仍含有食物中的能量。[S6, S24]\n\n移走持续的叶片供应后，旧落叶仍会保留。计算没有包括它们的分解速率。[S30]"),{primitive:deadLeaves[0]!,extra:deadLeaves.slice(1)});
  addPart('algae-patch',bi('Surface algae','泥面藻类'),'closeups',bi('Makes food using sunlight.','利用阳光制造食物。'),bi("Algae use sunlight to make food. Some fiddler crabs and climbing crabs eat algae, as recorded in different observations. [S7, S18, S24]\n\nThe patch represents algae on the mud surface. [S30]","藻类利用阳光制造食物。不同观察记录到，一些招潮蟹和攀爬蟹类会吃藻类。[S7, S18, S24]\n\n这个斑块代表泥面上的藻类。[S30]"),{primitive:oval([.055,.008,.13],.08,[1.5,.04,.65],foliage)});
  addPart('fiddler-crabs',bi('Fiddler crabs','招潮蟹'),'animals',bi("Feeds with a small claw; the male displays a large claw.","用小螯取食；雄蟹用大螯展示。"),bi("A male fiddler crab has one enlarged claw and a smaller feeding claw. It also has eye stalks and four pairs of walking legs. [S5, S32]\n\nAt high tide, it hides in its burrow. The single crab shape represents the group. [S5, S30]","雄招潮蟹有一只大螯和一只取食小螯，还有眼柄和四对步足。[S5, S32]\n\n高潮时，它藏进洞里。图中用一只蟹代表这一组生物。[S5, S30]"),crab([-.10,0,.13],true));
  addPart('tree-crabs',bi('Climbing crabs','攀爬蟹类'),'animals',bi("Eats leaf material and climbs above rising water.","吃叶片，也会爬到涨水水面上方。"),bi("This group brings together several climbing-crab kinds. Some eat leaves; others graze on algae. The leaf-feeding record comes from Sungei Buloh. These records do not give one Episesarma species a fixed diet of both foods. [S6, S7]\n\nThe crab has four pairs of walking legs and two claws. At high water, it moves up the Bakau trunk. [S32, S30]","这一组包含几类攀爬蟹。有些吃叶片，有些刮食藻类。叶片取食的记录来自双溪布洛。这些记录不表示同一种 Episesarma 固定吃这两种食物。[S6, S7]\n\n蟹有四对步足和一对螯。高水位时，它沿 Bakau 树干向上移。[S32, S30]"),crab([.19,.12,-.226],false,true));
  addPart('giant-mudskipper',bi('Giant mudskipper','弹涂鱼'),'animals',bi("Moves across mud with fleshy pectoral fins.","用肉质胸鳍在泥面移动。"),bi("Giant mudskippers are fish. Their modified gill chambers and skin help them breathe out of water. Fleshy pectoral fins help them move over mud. [S4]\n\nGeneral guides list crabs as food. Local diet samples differ, so the crab-to-fish arrows show possible feeding relationships. [S4, S13, S31]","弹涂鱼是鱼。特化的鳃腔和皮肤帮助它离水呼吸，肉质胸鳍帮助它在泥面移动。[S4]\n\n一般指南把蟹列为食物，当地食物样本却有差异。因此，蟹到鱼的箭头表示可能的取食关系。[S4, S13, S31]"),fishModel([.30,.031,.145]));
  addPart('heron',bi('Heron','鹭'),'animals',bi("Catches food with a long neck and bill.","借助长颈和长喙捕食。"),bi("Herons have long necks and bills. They eat fish and crustaceans. NParks lists herons among the giant mudskipper’s predators. [S4, S29]\n\nThe two-legged bird represents herons as a group. [S30]","鹭有长颈和长喙，吃鱼和甲壳类。NParks 把鹭列为弹涂鱼的捕食者。[S4, S29]\n\n图中这只两腿的鸟代表鹭类。[S30]"),heronModel());
  addPart('small-fish',bi('Other small fish','其他小鱼'),'animals',bi("Provides another possible food for larger animals.","为较大的动物提供另一种可能的食物。"),bi("Herons and giant mudskippers can eat small fish. Real animals may have more food choices than a short food web shows. [S4, S29]\n\nThis small fish lies outside the food-web calculation. [S30]","鹭和弹涂鱼都可能吃小鱼。真实动物的食物选择可能比简短食物网上显示的更多。[S4, S29]\n\n这条小鱼没有加入食物网计算。[S30]"),fishModel([.32,-.074,.34],true));
  addPart('bacteria-inset',bi('Bacteria schematic','细菌示意'),'closeups',bi("Breaks down leaf material and obtains energy.","分解叶片物质并获得能量。"),bi("Bacteria help break down mangrove leaf litter. They obtain energy from the organic material as it decomposes. [S10]\n\nThis close-up uses enlarged shapes to make them visible. [S30]","细菌参与红树林落叶的分解，从分解中的有机物获得能量。[S10]\n\n近景把它们放大，方便观察。[S30]"),{primitive:oval([1.02,.21,-.06],.026,[1.8,.75,.75],{color:'tissue',tint:ink}),extra:[oval([1.07,.25,-.05],.024,[.8,1.7,.8],{color:'tissue',tint:ink}),oval([.98,.27,-.04],.022,[1.7,.8,.8],{color:'tissue',tint:ink})]});
  const fungalModels: Prim[]=[];
  const hypha=(start:V3,angle:number,length:number,depth:number)=>{
    const end:V3=[start[0]+Math.cos(angle)*length,start[1]+Math.sin(angle)*length,start[2]-.002];
    fungalModels.push({...line([start,[(start[0]+end[0])*.5+.005,(start[1]+end[1])*.5,start[2]+.003],end],depth*.00042+.00055,{color:'tissue',tint:ink}),segments:10});
    if(depth) for(const turn of [-.53,.62]) hypha(end,angle+turn,length*.64,depth-1);
  };
  hypha([1.04,.12,.09],Math.PI/2,.059,3);
  addPart('fungi-inset',bi('Fungal threads schematic','真菌丝体示意'),'closeups',bi('Breaks down dead organic material.','分解死亡的有机物质。'),bi("Fungi help break down mangrove leaf litter. They obtain energy from organic material, without using photosynthesis to make food. [S10]\n\nThe branching threads are an enlarged diagram. [S30]","真菌参与红树林落叶的分解。它们从有机物获得能量，不通过光合作用制造食物。[S10]\n\n分枝的丝体是放大示意图。[S30]"),{primitive:fungalModels[0]!,extra:fungalModels.slice(1)});
  addPart('gill-inset',bi('Gill-chamber schematic','鳃腔示意'),'closeups',bi("Retains water to help the fish breathe out of water.","保留水分，帮助鱼离水呼吸。"),bi("The giant mudskipper’s modified gill chambers and gas exchange through its skin help it breathe out of water. It is a fish. [S4]\n\nThis enlarged diagram shows a cavity, without the detailed gill anatomy. [S30]","弹涂鱼特化的鳃腔和皮肤气体交换，帮助它离水呼吸。它是鱼。[S4]\n\n这个放大的空腔是示意，没有显示详细鳃部结构。[S30]"),{primitive:{kind:'sweep',at:[1.04,.13,.27],path:[[0,0,0],[.02,.04,0],[0,.09,0]],radius:[.044,.055,.04],section:'u',hollow:.006,radial:48,segments:24,up:[0,0,1],color:'tissue',tint:'token:ink-3'},extra:[oval([1.04,.145,.275],.028,[1,.35,.8],{color:'glass',tint:'token:cold'})]});
  addPart('boardwalk-edge',bi('Observation edge','观察边界'),undefined,bi("Marks a place to observe the habitat.","标示观察生境的位置。"),bi("The boardwalk edge suggests observing without collecting animals. It is part of the display setting. [S30]","步道边缘提示观察时把动物留在原处。它是展示场景的一部分。[S30]"),{primitive:box([0,.025,-.54],[1.7,.045,.095],'wood',{tint:'token:ink-3'})},{context:true});
  addPart('specimen-base',bi('Teaching specimen base','教学标本底座'),undefined,bi("Supports the habitat and enlarged close-ups.","承托生境和放大近景。"),bi("This display stand supports the habitat and the separate enlarged diagrams. [S30]","展示台承托生境和旁边独立的放大示意图。[S30]"),{primitive:box([.18,-.29,0],[2.02,.04,1.12],'plastic',{tint:'token:ink-3'}),extra:[box([1.04,.065,.08],[.29,.015,.55],'plastic',{tint:'token:neutral'})]},{context:true});
  // Bark trunks and limbs are their own glb nodes so they keep a bark finish
  // beside the foliage crowns (one material per glb part). Scenery of the
  // selectable tree parts: they hide with them and are never labelled.
  addPart('api-trunk',bi('Api-api Putih trunk and branches','Api-api Putih 树干与枝条'),undefined,bi("Carries the Api-api crown.","支撑 Api-api 的树冠。"),bi("The trunk and branches carry the leaves of the Api-api Putih tree. [S30]","树干和枝条支撑 Api-api Putih 的叶片。[S30]"),{mesh:'api-trunk',material:bark},{context:true,castShadow:true});
  addPart('bakau-trunk',bi('Bakau Minyak trunk and branches','Bakau Minyak 树干与枝条'),undefined,bi("Carries the Bakau crown.","支撑 Bakau 的树冠。"),bi("The trunk and branches carry the leaves of the Bakau Minyak tree. [S30]","树干和枝条支撑 Bakau Minyak 的叶片。[S30]"),{mesh:'bakau-trunk',material:bark},{context:true,castShadow:true});
  const parsed=parts.map(p=>partSchema.parse(p));
  if(parsed.filter(p=>!p.context).length!==18 || parsed.filter(p=>p.context).length!==4) throw new Error('18 selectable + 4 context required');
  return {
    model:'/models/mangrove-food-web.glb',parts,groups:[{id:'habitat',name:bi('Habitat','生境'),color:'token:neutral'},{id:'mangroves',name:bi('Mangrove trees and roots','红树与树根'),color:'token:seedling'},{id:'animals',name:bi('Animals','动物'),color:'token:ink-2'},{id:'closeups',name:bi("Enlarged close-ups","放大近景"),color:'token:ink-3'},{id:'food-paths',name:bi("Food pathways","食物路径"),color:'token:en-light'}],
    views:{assembled:{camera:camera([2.2,1.7,2.6],[0,.35,0])},exploded:{camera:camera([2.2,1.7,2.6],[0,.35,0])},cutaway:{normal:[0,0,-1],offset:.045},cuts:{mud:{normal:[0,0,-1],offset:.045,label:bi('Mud section','泥层剖面')}},section:{plane:'xy'},cover:camera([2.5,1.8,3],[.13,.29,0]),shadows:'contact'},
    presets:[['hero',"Whole habitat","生境全景",[2.2,1.7,2.6],[0,.35,0],32],['habitat-view','Habitat','生境',[1.8,1.1,2.2],[0,.2,0],32],['roots-view','Root connections','根系连接',[-1.1,.45,1.2],[-.35,.02,0],30],['tide-view',"Low and high tide","低潮与高潮",[1.6,.5,1.6],[.1,.05,.1],32],['animal-view','Animal features','动物结构',[1.2,.45,1.3],[.2,.08,.2],28],['web-view','Food relationships','食物关系',[1.9,1.4,2.1],[.05,.25,.05],32]].map(([id,en,zh,position,target,fov])=>({id,label:bi(en as string,zh as string),camera:camera(position as V3,target as V3,fov as number)})),
    spec:[{key:bi('Model','模型'),value:bi("Mangrove habitat","红树林生境"),tag:'design'},{key:bi('Web','食物网'),value:bi('6 nodes · 6 links','6 节点 · 6 连线'),tag:'design'},{key:bi('Tide','潮位'),value:bi('Diagrammatic','示意'),tag:'design'},{key:bi('Sources','来源'),value:bi("Feeding observations","取食观察"),tag:'design'}],flows:[],animations:[],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {writeTreeMeshes}=await import('./tree-meshes');
  const {geometryBounds,geometrySlots}=await import('./geometry');
  await writeTreeMeshes();
  const data=buildParts(); const parsed=partsFileBase.parse(data);
  const out=join(import.meta.dirname,'../../../src/content/topics/mangrove-food-web/data/parts.json');
  mkdirSync(join(out,'..'),{recursive:true}); writeFileSync(out,JSON.stringify(data,null,1)+'\n');
  let slots=0;
  for(const p of parsed.parts) { const b=geometryBounds(p)!; const n=geometrySlots(p).length; slots+=n; console.log(`${p.id}: ${n} slots; bbox ${JSON.stringify(b)}`); }
  console.log(`${parsed.parts.length} parts; ${slots} base material-slot calls (before contact shadow/engine passes; no GPU measurement)`);
}
