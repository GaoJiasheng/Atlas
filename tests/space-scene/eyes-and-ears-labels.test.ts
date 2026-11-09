import { describe, expect, it } from 'vitest';
import { leaderClearOfInsets } from '../../src/engines/space-scene/lib/insets';
import { layoutLeaders } from '../../src/engines/space-scene/lib/leader-layout';
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
      // The legacy offline audit predates inset barriers. Re-run its measured
      // placards through the new layout contract without editing topic scripts.
      const insets = r.inset ? [{x0:r.inset.x,y0:r.inset.y,x1:r.inset.x+r.inset.w,y1:r.inset.y+r.inset.h}] : [];
      const items = r.places.map(p => {
        const a = r.anchors.find(a=>a.id===p.id)!;
        return {id:p.id,ax:a.x,ay:a.y,w:p.x1-p.x0,h:p.y1-p.y0,lead:p.sy-p.y0,bounds:a,prev:null};
      });
      const bodies=r.allAnchors.filter(a=>['basilar-strip','hair-patch','signal-marker'].includes(a.id));
      const places = layoutLeaders(items,{...r.frame,accept:(p,i)=>leaderClearOfInsets(p,i.ax,i.ay,insets),obstacles:[...r.frame.obstacles,...bodies]});
      expect(r.places.map(p=>p.id),tag).toEqual([r.part]);
      // The focus label stays: inside the magnified window, or outside it with a
      // leader that enters the window once; the dashed frame never crosses it.
      expect(places.map(p=>p.id),tag).toEqual([r.part]);
      for (const p of places) {
        const a = items.find(a=>a.id===p.id)!;
        expect(leaderClearOfInsets(p,a.ax,a.ay,insets),tag).toBe(true);
      }
      expect(r.inset!.w,tag).toBeGreaterThan(190);
      for(const p of places)for(const obstacle of [...bodies,r.insetTitle!])expect(overlaps(p,obstacle),tag).toBe(0);
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
