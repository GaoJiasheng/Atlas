import { describe, expect, it } from 'vitest';
import { loadLabelStudy, projectBeat } from '../../scripts/geo/eyes-and-ears/audit-labels';

const study=await loadLabelStudy();
const sizes=[[1024,768],[1366,1024],[1440,900]] as const;
const overlaps=(a:{x0:number;y0:number;x1:number;y1:number},b:{x0:number;y0:number;x1:number;y1:number})=>
  Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));

describe('eyes-and-ears: tablet callout geometry',()=>{
  it.each(sizes)('keeps the cell-study callouts clear at %i × %i, including motion extrema', (w,h)=>{
    for(const present of [false,true])for(const phase of [0,.25,.75])for(const [chapter,beat]of [
      ['vibration-to-signal',2],['vibration-to-signal',3],['vibration-to-signal',4],['vibration-to-signal',5],['care-and-protection',3],
    ] as const) {
      const r=projectBeat(study,chapter,beat,w,h,present,phase),tag=`${chapter}.${beat}, present=${present}, phase=${phase}`;
      expect(r.anchors.every(a=>a.onScreen),tag).toBe(true);
      expect(r.places.map(p=>p.id),tag).toEqual([r.part]);
      expect(r.inset!.w,tag).toBeGreaterThan(190);
      const bodies=r.allAnchors.filter(a=>['basilar-strip','hair-patch','signal-marker'].includes(a.id));
      for(const p of r.places)for(const obstacle of [...bodies,r.insetTitle!])expect(overlaps(p,obstacle),tag).toBe(0);
    }
  });
  it.each(sizes)('makes the three distinct bones readable at %i × %i', (w,h)=>{
    for(const present of [false,true]) {
      const r=projectBeat(study,'three-moving-bones',3,w,h,present);
      expect(Math.min(...r.pairs.map(p=>p.distance))).toBeGreaterThan(79);
      expect(r.anchors.every(a=>a.onScreen)).toBe(true);
      if(present)expect(r.places).toHaveLength(3);
    }
  });
  it('retains every beat label and selected part in its chapter index',()=>{
    for(const c of study.chapters)for(const b of c.state.beats!) {
      const index=c.state.index!.parts!;
      for(const id of [...(b.labels??c.state.labels??[]),...(b.part?[b.part]:[])])expect(index,`${c.id}: ${id}`).toContain(id);
    }
  });
  it('puts the hair leader at the outer bundle tip, within the unchanged study envelope',()=>{
    const g=study.geometry.get('hair-patch')!;
    expect(g.point[0]).toBeGreaterThan(3.48);
    expect(g.point[1]).toBeGreaterThan(-.93);
    for(let i=0;i<3;i++)expect(Math.abs(g.point[i]!-g.center[i]!)).toBeLessThanOrEqual(g.half[i]!+1e-7);
    expect(study.file.animations.find(a=>a.id==='bundle-bend')).toMatchObject({target:'hair-patch',pivot:[3.15,-1.155,.35]});
  });
});
