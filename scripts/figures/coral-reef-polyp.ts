/** A 90-degree oblique wedge, continuous through oral disc, column and skeleton. */
import assert from 'node:assert/strict';
import{main}from'./redo-cd-utils.js';
import{surface,pencil,ellipse,random,tentacle,cubic,save,type Point}from'./round3-graphite.js';
const rad=(a:number)=>a*Math.PI/180;
const ring=(a:number,z:number,rx=265,ry=102):Point=>[600+rx*Math.cos(rad(a)),z+ry*Math.sin(rad(a))];
const arc=(a:number,b:number,z:number,rx=265,ry=102):Point[]=>Array.from({length:61},(_,i)=>ring(a+(b-a)*i/60,z,rx,ry));
const closed=(p:readonly Point[])=>'M'+p.map(p=>p.join(',')).join('L')+'Z';
function wall(a:number,b:number,z1:number,z2:number,rx1:number,ry1:number,rx2:number,ry2:number,tone:number){const d=closed([...arc(a,b,z1,rx1,ry1),...arc(b,a,z2,rx2,ry2)]);return surface(d,[330,z1-115,540,z2-z1+220],(u,v)=>tone+.35*Math.abs(u-.32)+.15*v,-.75,4,72,.8);}
export function polyp(){
 const cut=[35,125] as const;assert.equal(cut[1]-cut[0],90);
 const tentacles=Array.from({length:12},(_,i)=>{const a=cut[1]+8+i*23,root=ring(a,313,240,88),dx=Math.cos(rad(a))*55,tip:Point=[root[0]+dx,root[1]-145-i%3*15];return{a,root,tip,points:cubic(root,[root[0]+dx*.15+(i%2?8:-8),root[1]-50],[tip[0]-dx*.15,tip[1]+47],tip)};});
 assert.equal(tentacles.length,12);assert(tentacles.every(t=>t.a>cut[1]&&t.a<360+cut[0]&&t.tip[1]<t.root[1]-140));
 const septa=[180,215,250,285,320,355];assert.equal(septa.length,6);
 let b='';
 // Back and inner skeletal wall are a curved shell; front-right quadrant is absent.
 b+=wall(180,360,455,755,265,102,231,86,.36);
 b+=surface(closed([...arc(cut[1],cut[0]+360,755,231,86),[600,755]]),[365,665,470,180],(_u,v)=>.22+.3*v,.5,1,19,.8);
 // Fine internal growth lines and pores mark stone, never a smooth plastic cylinder.
 for(let a=183;a<358;a+=5){const p=ring(a,455,260,98),q=ring(a,753,227,83);b+=pencil(`M${p}Q${(p[0]+q[0])/2-5} 586 ${q}`,.6,.55);}
 // Six independent thin septa: radial blades with a gap to the small columella.
 for(const a of septa){const ot=ring(a,501,249,96),ob=ring(a,754,220,82),it=ring(a,660,49,18),ib=ring(a,755,43,16);const d=closed([ot,it,ib,ob]);
  const xs=[ot[0],ob[0],it[0],ib[0]],ys=[ot[1],ob[1],it[1],ib[1]];
  b+=surface(d,[Math.min(...xs)-2,Math.min(...ys)-2,Math.max(...xs)-Math.min(...xs)+4,Math.max(...ys)-Math.min(...ys)+4],(_u,v)=>.14+.28*v,.8,1,a,.7);
  b+=pencil(`M${ot}L${it}`,1.35,.85);
  b+=pencil(`M${ot[0]+3} ${ot[1]+1}L${it[0]+3} ${it[1]+1}`,.45,.55);
 }
 b+=surface('M581 757L583 711Q585 684 599 681Q617 687 618 711L621 757Q600 768 581 757Z',[578,680,46,90],u=>.18+.7*Math.abs(u-.28),1,1,92,.8);
 // The exterior surviving front shell follows the same quarter removal.
 b+=wall(cut[1],180,455,755,265,102,231,86,.2);
 b+=wall(360,cut[0]+360,455,755,265,102,231,86,.52);
 // Actual cut faces expose the thickness of the skeleton along two radial planes.
 for(const a of cut){const o=ring(a,455),i=ring(a,455,248,94),ob=ring(a,755,231,86),ib=ring(a,755,214,78);b+=surface(closed([o,i,ib,ob]),[Math.min(o[0],i[0],ob[0],ib[0])-2,440,65,410],()=>.26,.7,1,44,.8);}
 const r=random(124);
 for(let a=cut[1]+1;a<180;a+=4){const p=ring(a,455),q=ring(a,755,231,86);b+=pencil(`M${p}C${p[0]-4} 574 ${q[0]-6} 718 ${q}`,1.05,.67);}
 for(let i=0;i<480;i++){const a=cut[1]+1+r()*(179-cut[1]),z=463+r()*285,p=ring(a,z,265-(z-455)*.113,102-(z-455)*.053);b+=ellipse(p[0],p[1],.75+r()*1.2,.55+r()*.8,'none','#666',.6,'opacity=".65"');}
 // Irregular growth ridges and short transverse accretion marks retain the
 // corallite's granular stone character at reading size.
 for(let a=cut[1]+3;a<179;a+=5){
  for(let z=475;z<737;z+=21){const p=ring(a,z+r()*6,265-(z-455)*.113,102-(z-455)*.053);b+=pencil(`M${p[0]-3} ${p[1]-1}q${3+r()*3} ${2+r()*2} ${6+r()*4} ${1+r()*2}`,.55,.55);}
 }
 // Porous costae continue over the surviving right side of the corallite.
 for(let a=361;a<cut[0]+359;a+=4){const p=ring(a,455),q=ring(a,755,231,86);b+=pencil(`M${p}Q${q[0]+8} 624 ${q}`,1,.65);}
 for(let i=0;i<240;i++){const a=361+r()*(cut[0]-2),z=465+r()*278,p=ring(a,z,265-(z-455)*.113,102-(z-455)*.053);b+=ellipse(p[0],p[1],.8+r()*1.4,.6+r()*.8,'none','#666',.6,'opacity=".65"');}
 // Living column has exactly the same oblique wedge. It descends into the cup.
 b+=wall(180,360,313,510,240,88,210,73,.13);
 b+=wall(cut[1],180,313,510,240,88,210,73,.13);
 b+=wall(360,cut[0]+360,313,510,240,88,210,73,.33);
 // Mouth connects to a short internal tube visible at the cut, not a central skeletal post.
 b+=surface('M551 321Q568 331 586 322L581 440Q565 455 552 441Z',[549,320,40,140],u=>.12+.55*Math.abs(u-.3),1,1,23,.7);
 const disc=closed([...arc(cut[1],cut[0]+360,313,240,88),[600,313]]);
 b+=surface(disc,[355,221,490,190],(u,v)=>.04+.22*v+.1*Math.abs(u-.3),-.3,2,22,.7);
 // Radial fine folds merge into the tissue rather than forming a furry rim.
 for(let a=cut[1]+5;a<cut[0]+357;a+=11){const p=ring(a,313,233,84),q=ring(a,313,70,25);b+=pencil(`M${p}Q${(p[0]+q[0])/2} ${(p[1]+q[1])/2-2} ${q}`,.5,.32);}
 b+=surface('M521 305a48 15 0 1 0 96 0a48 15 0 1 0 -96 0',[520,289,98,32],()=>.85,.7,1,88,.65);
 // Narrow cut tissue edges are continuous all the way to the skeletal floor.
 for(const a of cut){const ot=ring(a,313,240,88),it=ring(a,313,229,81),ob=ring(a,730,197,67),ib=ring(a,730,182,60);b+=surface(closed([ot,it,ib,ob]),[Math.min(ot[0],it[0],ob[0],ib[0])-2,310,100,460],(_u,v)=>.17+.25*v,1,1,62,.7);}
 for(const t of tentacles.sort((a,b)=>a.root[1]-b.root[1]))b+=tentacle(t.points,14);
 return `<g transform="translate(-156 0) scale(1.26 1)">${b}</g>`;
}
if(main(import.meta.url))await save('coral-reef-polyp',polyp());
