/** Exact geometry for weather beat mechanisms. No noise fills, text or cloud shell.
 * pnpm tsx scripts/figures/weather-beats.ts             verifies geometry
 * pnpm tsx scripts/figures/weather-beats.ts --render    renders the code plates
 * Final thunder plate uses the guide with the built-in graphite render recorded
 * in weather-ai-prompts.json. --render deliberately regenerates the CODE guide.
 * Drawings are explanatory magnifications, not measured particle/pressure diagrams.
 */
import assert from 'node:assert/strict';
import { mkdirSync, copyFileSync } from 'node:fs';
import { surface, pencil, line, random, save, type Point } from './round3-graphite.js';

export const particles = {
  ice: [[260,205,74],[570,170,77],[930,230,82]] as const,
  drops: [[200,510,72],[490,445,76],[800,490,78],[1030,645,72],[495,720,76]] as const,
};
const poly = (p: readonly Point[]) => `M${p.map(a=>a.join(' ')).join('L')}Z`;

export function insideCloud() {
  assert.equal(particles.ice.length,3); assert.equal(particles.drops.length,5);
  assert(particles.ice.every(([,,r])=>r*2*420/1200>=40));
  assert(particles.drops.every(([,,r])=>r*2*420/1200>=40));
  assert(particles.ice.every(([,y,r])=>y+r<365));
  assert(particles.drops.every(([,y,r])=>y-r>365));
  let b='';const r=random(4051);
  // Incomplete diffuse optical wisps: no enclosing silhouette or solid cut face.
  for(let i=0;i<270;i++) {
    const x=68+r()*1020,y=70+r()*720,l=32+r()*105;
    b+=pencil(`M${x} ${y}q${l*.5} ${-12+r()*24} ${l} ${r()*14-7}`,.4+r()*.4,.045+r()*.05);
  }
  for(const [x,y,s] of particles.ice) {
    const front=Array.from({length:6},(_,i):Point=>[x+s*Math.cos(Math.PI/6+i*Math.PI/3),y+s*.82*Math.sin(Math.PI/6+i*Math.PI/3)]);
    const offset:Point=[-26,-34];const back=front.map(([a,b]):Point=>[a+offset[0],b+offset[1]]);
    // Prism faces retain all six matching vertices; no decorative snowflake points.
    for(const i of [2,3,4]) {
      const j=(i+1)%6,ps=[front[i]!,front[j]!,back[j]!,back[i]!] as const;
      const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);
      b+=surface(poly(ps),[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],(u,v)=>.28+.33*v+.12*u,-.65,3,90+i,1.2);
    }
    b+=surface(poly(front),[x-s,y-s*.82,s*2,s*1.64],(u,v)=>.035+.14*u+.09*v,.45,3,24,1.2);
    b+=pencil(`M${front[0]!.join(' ')}L${front[3]!.join(' ')}`,.5,.18);
    b+=pencil(`M${front[1]!.join(' ')}L${front[4]!.join(' ')}`,.5,.13);
  }
  for(const [x,y,s] of particles.drops) {
    // Cloud droplets are spheres, not teardrop raindrops.
    const d=`M${x-s} ${y}a${s} ${s} 0 1 0 ${2*s} 0a${s} ${s} 0 1 0 ${-2*s} 0`;
    b+=surface(d,[x-s,y-s,s*2,s*2],(u,v)=>{
      const rr=Math.hypot(u-.5,v-.5)*2;
      return Math.max(.015,.045+.32*rr**2+.20*(u+v)/2-.25*Math.exp(-((u-.28)**2+(v-.23)**2)/.025));
    },-.65,8,54,1.2);
    b+=pencil(`M${x-s*.79} ${y-s*.3}Q${x-s*.9} ${y+s*.6} ${x+s*.13} ${y+s*.88}`,.55,.3);
  }
  return b;
}

export const lightningGeometry={channel:[[580,125],[550,251],[610,359],[570,475],[627,594],[588,747]] as const,arcs:[142,227,326] as const};
export function thunderExpansion() {
  const {channel,arcs}=lightningGeometry;
  assert.equal(channel.length,6);assert(arcs.every((a,i)=>i===0||a>arcs[i-1]!));
  assert(channel.every(([x,y])=>x>500&&x<660&&y>100&&y<800));
  let b='';const r=random(3720);
  // Thin electrically heated channel. Alternating widths are a pencil rendering,
  // not a shell: no closed tube is drawn around air.
  for(let j=0;j<4;j++) b+=line(channel,'#333',4.3-j*.9,`opacity="${.18+j*.16}" transform="translate(${j*.7} ${-j*.3})"`);
  b+=line([[581,128],[655,210],[694,220]],'#555',1.3,'opacity=".6"');
  b+=line([[609,358],[690,391],[725,451]],'#555',1.1,'opacity=".6"');
  // Four opposed arrows are precisely directed OUT from the heated channel.
  for(const y of [315,600]) for(const side of [-1,1]) {
    const a:Point=[600+side*55,y],z:Point=[600+side*220,y];
    assert((z[0]-a[0])*side>0);
    b+=line([a,z],'#515151',2.1);
    b+=line([[z[0]-side*20,y-12],z,[z[0]-side*20,y+12]],'#515151',2.1);
  }
  // Repeated open wave-front arcs, shared centre; no explosion icon or cloud collision.
  for(const side of [-1,1]) for(const [idx,rad] of arcs.entries()) {
    const x=600+side*rad;
    const d=`M${x-side*rad*.22} ${450-rad*.86}Q${x+side*rad*.35} 450 ${x-side*rad*.22} ${450+rad*.86}`;
    b+=pencil(d,1.5-idx*.18,.72-idx*.11);
    for(let j=0;j<24;j++) {
      const yy=450-rad*.75+r()*rad*1.5;
      const xx=x+side*rad*.08*(1-((yy-450)/rad)**2);
      b+=pencil(`M${xx} ${yy}l${side*(3+r()*9)} ${5+r()*8}`,.45,.12);
    }
  }
  // Independent faint background molecules indicate surrounding air, no rigid wall.
  for(let i=0;i<120;i++) {
    const x=135+r()*930,y=110+r()*680;
    if(Math.abs(x-600)<70)continue;
    b+=pencil(`M${x} ${y}q3 -2 6 0`,.8,.18);
  }
  return b;
}

const checked = [['weather-cloud-particles',insideCloud()],['weather-lightning-thunder',thunderExpansion()]] as const;
if(process.argv.includes('--render')) {
  mkdirSync('previews/beat-figures/weather',{recursive:true});
  for(const [id,body] of checked) {
    await save(id,body);
    copyFileSync(`/private/tmp/atlas-round3/svg/${id}.svg`,`previews/beat-figures/weather/${id}.svg`);
  }
}
console.log('Weather geometry: 3 ice prisms, 5 spherical droplets, 4 outward arrows, 3 wave fronts per side; assertions passed.');
