import { primitiveSchema } from '../../../src/engines/space-scene/schema';
import { sweepStations } from '../../../src/engines/space-scene/lib/sweep';
/** Topic-owned anatomical studies. No shared bird-kit dependency.
 * Compound sweeps join repeated vanes with subpixel capillaries routed inside
 * the plumage. This retains the engine's material batching and part identity.
 */
export type V = [number, number, number];
export type P = Record<string, unknown> & { kind: string; at: V };
const O: V = [0, 0, 0];
const ink = '#373a32', feather = '#a38a70', gold = '#ad9164', red = '#a45548';
const sw = (path: V[], radius: number | number[], tint: string, more = {}): P => ({kind:'sweep',at:O,path,radius,tint,color:'tissue',radial:20,segments:32,...more});
const ell = (at: V, size: V, tint: string, radial=24): P => {
  const path:V[]=Array.from({length:9},(_,i)=>[at[0],at[1]-size[1]*Math.cos(i*Math.PI/8),at[2]]);
  return sw(path,path.map((_,i)=>i===0||i===8?.00001:size[0]*Math.sin(i*Math.PI/8)),tint,{radial:Math.min(16,radial),segments:32,section:{flat:size[2]/size[0]},up:[0,0,1],caps:'flat'});
};
const mix = (a: V,b: V,t:number):V => a.map((v,i)=>v+(b[i]!-v)*t) as V;
interface Strand { path: V[]; r: number[] }
/** Joined only through almost-zero radii; intervening paths stay below skin. */
function bundle(strands: Strand[], tint:string, flat=1, up:V=[0,1,0], radial=12):P {
  const path:V[]=[], r:number[]=[];
  for(const strand of strands) {
    if(path.length) { const last=path.at(-1)!; path.push(mix(last,strand.path[0]!, .5));r.push(.00001); }
    path.push(...strand.path);r.push(...strand.r);
  }
  if(path.length>128) throw new Error(`bundle has ${path.length} points`);
  return sw(path,r,tint,{section:{flat},up,radial,segments:Math.min(512,Math.max(48,strands.length*10)),caps:'flat'});
}
function vane(root:V, tip:V, width:number, bulge:number, side=1):Strand {
  const p=(t:number,lift:number):V=>{const q=mix(root,tip,t);q[2]+=side*lift;return q;};
  // Rounded asymmetrical vanes, a convex shoulder and a turned distal tip.
  const cap=tip.map((v,i)=>v+(tip[i]!-root[i]!)*.012) as V;
  return {path:[root,p(.20,bulge*.55),p(.50,bulge),p(.80,bulge*.7),p(.96,bulge*.25),tip,cap],r:[.00001,width*.72,width,width*.86,width*.44,.00001,.00001]};
}
function toes(ankle:V, ends:V[], tint:string, thickness:number, ring=false): P {
  const strands=ends.map((end):Strand=>({path:[ankle,mix(ankle,end,.22),[...mix(ankle,end,.57).slice(0,1),end[1]+.005,...mix(ankle,end,.57).slice(2)] as V,mix(ankle,end,.91),end],r:[.00001,thickness,thickness*.76,thickness*.46,.00001]}));
  return {...bundle(strands,tint,.7,[0,1,0],16),...(ring?{rings:{every:.024,depth:.13}}:{})};
}
export function bird(adult:boolean, detailed=true):P[] {
  const p:P[]=[];
  const isolated=new Set<P>();
  const scutes:Strand[]=[];
  // Continuous breast, shoulder, nape and head: the neck has no separate
  // cap or collar seam. The narrow shoulder turn avoids a pinched inside bend.
  p.push(sw(adult?[[.41,.54,0],[.31,.54,0],[.18,.54,0],[-.02,.55,0],[-.19,.63,0],[-.28,.79,0],[-.30,.98,0],[-.39,1.055,0],[-.48,1.025,0]]:
    [[.31,.47,0],[.18,.46,0],[-.04,.48,0],[-.18,.62,0],[-.26,.79,0],[-.34,.87,0],[-.44,.85,0]],
    adult?[.006,.13,.245,.30,.27,.18,.108,.135,.018]:[.01,.24,.29,.23,.19,.185,.022],adult?feather:'#cdbd8f',
    {section:{flat:adult?.80:.90},up:[0,0,1],radial:48,segments:80,color:'feathers'}));
  const hx=adult?-.39:-.34, hy=adult?1.055:.87, hz=adult?.112:.16;
  for(const side of [-1,1]) {
    p.push(ell([hx-.026,hy+.023,side*hz],[.031,.034,.009],adult?red:'#b6a26f',24));
    p.push(ell([hx-.030,hy+.024,side*(hz+.009)],[.022,.024,.009],'#9e814c',24));
    p.push(ell([hx-.033,hy+.025,side*(hz+.017)],[.012,.016,.006],ink,24));
    if(!adult) p.push(ell([hx-.039,hy+.033,side*(hz+.022)],[.003,.004,.002],'#e1d8bc',16));
    if(adult) {
      // Paired free-hanging wattles, a distinct earlobe below the covered ear.
      p.push(sw([[-.47,1.005,side*.047],[-.46,.96,side*.057],[-.443,.917,side*.065],[-.428,.902,side*.062]],[.009,.028,.032,.001],red,{section:{flat:.25},up:[0,0,1],segments:36,radial:24}));
      p.push(ell([-.322,1.002,side*.105],[.028,.043,.009],'#bc9f88',24));
    }
  }
  const by=adult?1.016:.837, bx=adult?-.479:-.472, bl=adult?.11:.075;
  p.push(sw([[bx,by+.015,0],[bx-bl*.36,by+.012,0],[bx-bl*.78,by-.006,0],[bx-bl,by-.026,0]],[.046,.035,.017,.0015],gold,{section:{flat:.72},up:[0,1,0],radial:24,segments:32}));
  p.push(sw([[bx,by-.029,0],[bx-bl*.45,by-.030,0],[bx-bl*.94,by-.027,0]],[.031,.024,.001],gold,{section:{flat:.36},up:[0,1,0],radial:20,segments:24}));
  // Gape and nostrils join across the bill interior, invisible connectors.
  const face:Strand[]=[];
  for(const s of [-1,1]) face.push({path:[[bx+.003,by-.013,s*.038],[bx-bl*.45,by-.018,s*.023],[bx-bl*.9,by-.024,s*.004]],r:[.00001,.002,.00001]}, {path:[[bx-.024,by+.023,s*.030],[bx-.041,by+.022,s*.027],[bx-.051,by+.020,s*.023]],r:[.00001,.004,.00001]});
  p.push(bundle(face,ink,1,[0,1,0],8));
  if(adult) {
    // Rounded five-point single comb, with a swept-back posterior blade.
    const shape:[number,number][]=[[-.51,1.12],[-.49,1.18],[-.476,1.145],[-.451,1.218],[-.435,1.165],[-.408,1.238],[-.390,1.177],[-.355,1.225],[-.340,1.165],[-.306,1.194],[-.30,1.14],[-.265,1.13],[-.295,1.102],[-.37,1.116],[-.45,1.115]];
    const soft=shape.flatMap((b,i)=>{const a=shape[(i+shape.length-1)%shape.length]!,c=shape[(i+1)%shape.length]!;return Array.from({length:5},(_,j):[number,number]=>{const t=j/4, u=.16,ax=b[0]+(a[0]-b[0])*u,ay=b[1]+(a[1]-b[1])*u,cx=b[0]+(c[0]-b[0])*u,cy=b[1]+(c[1]-b[1])*u;return [(1-t)**2*ax+2*(1-t)*t*b[0]+t*t*cx,(1-t)**2*ay+2*(1-t)*t*b[1]+t*t*cy];});});
    p.push({kind:'extrude',at:O,shape:soft,depth:.020,bevel:.006,color:'tissue',tint:red});
  }
  for(const side of [-1,1]) {
    const vanes:Strand[]=[],coverts:Strand[]=[];
    const bodyZ=adult?.229:.245;
    for(let i=0;i<10;i++) {
      const t=i/9, k=adult?1:.60;
      const root:V=[-.19+t*.20,.68-t*.045,side*bodyZ];
      const tip:V=[root[0]+k*(.43+.05*Math.sin(i*1.7)),root[1]-k*(.27-t*.12),side*(bodyZ+.006+.015*Math.sin(i*.7))];
      vanes.push(vane(root,tip,k*(.037+.004*Math.sin(i*2.2)),.028,side));
    }
    p.push({...bundle(vanes,adult?'#8c735d':'#bba879',.10,[0,0,1],12),segments:adult?240:180,color:'feathers'});
    for(let i=0;i<12;i++) {
      const row=Math.floor(i/6),t=(i%6)/5;
      const root:V=[-.22+t*.30,.735-row*.080,side*(bodyZ+.021+row*.021)];
      coverts.push(vane(root,[root[0]+.22+.025*Math.sin(i*2.3),root[1]-.11-.018*Math.sin(i*1.8),root[2]+side*.012],adult?.034:.025,.020,side));
    }
    p.push({...bundle(coverts,adult?'#b09a7c':'#d3c292',.08,[0,0,1],12),segments:adult?288:216,color:'feathers'});
    // Shank passes through a fleshy feather cuff; hock bends backward.
    const legX=side===1?.035:.080;
    p.push(sw([[legX,.39,side*.14],[legX+.035,.25,side*.16],[legX+.035,.17,side*.17]],[.065,.050,.028],adult?feather:'#cdbd8f',{radial:16,segments:24,color:'feathers'}));
    const shank=sw([[legX+.035,.23,side*.17],[legX+.054,.17,side*.174],[legX-.008,.052,side*.18],[legX-.012,.030,side*.18]],[.029,.031,.021,.024],gold,{radial:16,segments:160,rings:{every:.019,depth:adult?.04:.10}});
    p.push(shank);
    if(adult){
      const parsed=primitiveSchema.parse(shank);
      if(parsed.kind!=='sweep')throw new Error('shank must be a sweep');
      const stations=sweepStations(parsed).stations;
      for(let row=0;row<10;row++){
        const st=stations[Math.round((.18+row*.071)*(stations.length-1))]!;
        const forward=st.n[0]>0?-1:1;
        const path:V[]=[-1.0,-.34,.34,1.0].map(angle=>[0,1,2].map(i=>st.p[i]!+(forward*st.n[i]!*Math.cos(angle)+st.b[i]!*Math.sin(angle))*(st.r+.0008)) as V);
        scutes.push({path,r:[.00001,.007,.007,.00001]});
      }
    }

    const a:V=[legX-.012,.025,side*.18];
    const ends:V[]=[[-.155+legX,.014,side*.18-.085],[-.225+legX,.012,side*.18+.005],[-.176+legX,.014,side*.18+.089],[.13+legX,.017,side*.18+side*.033]];
    p.push(toes(a,ends,gold,adult?.017:.014,true));
    p.push(bundle(ends.map((e,i):Strand=>({path:[mix(a,e,.83),e,[e[0]+(i===3?.025:-.031),.006,e[2]+(i===3?side*.006:0)]],r:[.00001,.009,.00001]})),'#5d5343',.7,[0,1,0],10));
  }
  if(adult){
    // Seven bilateral pairs of rectrices; keep each pair's sampling local.
    // Outer feathers are shorter and lower, with modest unequal tip curls.
    for(let pair=0;pair<7;pair++){
      const f:Strand[]=[];
      for(const side of [-1,1]){
        const u=(pair+.5)/7,root:V=[.235,.615,side*(.012+pair*.012)];
        const tip:V=[.235+.46-.085*u+side*.005*Math.sin(pair*2.1),.615+.28-.13*u+.012*Math.sin(pair*1.9+side),side*(.018+pair*.023)];
        const strand=vane(root,tip,.038+.003*Math.sin(pair*2),.014,side);
        strand.path[2]![1]+=.043;strand.path[3]![1]+=.027;
        f.push(strand);
      }
      const feathers={...bundle(f,'#766550',.08,[0,0,1],12),segments:128,color:'feathers'};
      isolated.add(feathers);p.push(feathers);
    }
  }else{
    const tail:Strand[]=[];
    for(let i=0;i<5;i++){
      const u=(i-2)/2,root:V=[.23,.61,u*.025],tip:V=[.39-.02*Math.abs(u),.70-.03*Math.abs(u),u*.07];
      tail.push(vane(root,tip,.024,.008,u>=0?1:-1));
    }
    p.push({...bundle(tail,'#bead7e',.08,[0,0,1],12),segments:160,color:'feathers'});
  }
  // Feather tracts follow the actual body surface, including the neck bend.
  // Each small rounded vane is lifted only a fraction above its neighbours.
  const primitive=primitiveSchema.parse(p[0]);
  if(primitive.kind!=='sweep')throw new Error('plumage body must be a sweep');
  const stations=sweepStations(primitive).stations;
  const flat=typeof primitive.section==='object'&&'flat' in primitive.section?primitive.section.flat!:1;
  for(let tract=0;tract<(detailed?(adult?7:8):0);tract++) {
    const feathers:Strand[]=[],group=tract;
    const point=(u:number,theta:number,lift=0):V=>{
      const st=stations[Math.min(stations.length-1,Math.max(0,Math.round(u*(stations.length-1))))]!;
      return [0,1,2].map(i=>st.p[i]!+st.b[i]!*Math.cos(theta)*(st.r+lift)+st.n[i]!*Math.sin(theta)*(st.r*flat+lift)) as V;
    };
    const rows=2,count=adult?9:4;
    for(let row=0;row<rows;row++)for(let j=0;j<count;j++){
      const theta=(group*rows+row)*Math.PI/(adult?7:8)+.035*Math.sin(j*3.7+row);
      const u=.25+j*(adult?.07:.09)+row*.014;
      // The back carries a continuous flush feather surface; raised contour
      // feathers are concentrated along the flanks and narrow neck tracts.
      if(adult&&Math.cos(theta)>.78&&u<.65)continue;
      const st=stations[Math.round(u*(stations.length-1))]!,len=.12;
      feathers.push({path:[point(u,theta,-.018),point(u-len*.25,theta,-.006),point(u-len*.60,theta+.013,-.001),point(u-len*.87,theta+.02,.0005),point(u-len,theta+.028,.0001)],r:[.00001,st.r*.055,st.r*.075,st.r*.045,.00001]});
    }
    const th=(group*rows+(rows-1)*.5)*Math.PI/(adult?7:8),st=stations[Math.round(.40*(stations.length-1))]!;
    const up:V=[0,1,2].map(i=>st.b[i]!*Math.cos(th)+st.n[i]!*Math.sin(th)) as V;
    p.push({...bundle(feathers,adult?['#a48b70','#a68d72','#a58c71'][tract%3]!:'#cdbd8f',.05,up,8),segments:adult?240:144,color:'feathers'});
  }
  if(scutes.length)p.push({...bundle(scutes,'#b49a71',.6,[0,1,0],6),segments:192});
  // Pair compatible anatomical details without adding selectable part IDs.
  const packed:P[]=[];const bins=new Map<string,P>();
  for(const item of p){
    if(item.kind!=='sweep'||item.at!==O||isolated.has(item)){packed.push(item);continue;}
    const r0=typeof item.radius==='number'?(item.path as V[]).map(()=>item.radius as number):[...(item.radius as number[])];
    const v=item.path as V[];
    if(r0.at(-1)!>.001){const end=v.at(-1)!,before=v.at(-2)!,len=Math.hypot(...end.map((x,i)=>x-before[i]!));const r=r0.at(-1)!;for(const t of [.5,.85,1]){v.push(end.map((x,i)=>x+(x-before[i]!)/len*r*t) as V);r0.push(r*Math.sqrt(Math.max(.000001,1-t*t)));}}
    item.radius=r0;
    const key=JSON.stringify([item.tint,item.color,item.section,item.up,item.rings]);
    const prior=bins.get(key), path=item.path as V[];
    if(prior && (prior.path as V[]).length+path.length+1<=128){
      const a=prior.path as V[],b=prior.radius as number[];
      a.push(mix(a.at(-1)!,path[0]!,.5),...path);
      b.push(.00001,...(typeof item.radius==='number'?path.map(()=>item.radius as number):item.radius as number[]));
      prior.segments=Math.min(512,Number(prior.segments)+Number(item.segments));
    }else{if(typeof item.radius==='number')item.radius=path.map(()=>item.radius as number);packed.push(item);bins.set(key,item);}
  }
  return packed;
}

