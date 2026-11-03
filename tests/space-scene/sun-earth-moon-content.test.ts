import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitCameraToHud, freeStageRect } from '../../src/engines/space-scene/lib/hud-framing';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import raw from '../../src/content/topics/sun-earth-moon/data/parts.json';
import solar from '../../src/content/topics/sun-earth-moon/data/singapore-sun-2026.json';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { orbitSnapshot } from '../../src/engines/space-scene/lib/sim/orbit-rotation';
import { orbitDisplay, orbitalTiltGuide, bodyPlacement, orbitGuideLabelPoint } from '../../src/engines/space-scene/lib/sim/orbit-projection';
import { dot, unit, sub, rotate, add, type V3 } from '../../src/engines/space-scene/lib/sim/orbit-rotation';
import { isOrbitCamera } from '../../src/engines/core/camera';
import type { SpaceChapterState } from '../../src/engines/space-scene/schema';
const root = resolve('src/content/topics/sun-earth-moon');
const chapters = readdirSync(`${root}/chapters`).sort().map((file) => {
  const text = readFileSync(`${root}/chapters/${file}`, 'utf8');
  return { ...parse(text.split('---')[1]!) as { id: string; kind?: string; state: SpaceChapterState }, text };
});
const sim = simSchema.parse({ ...raw.sim, orbitRotation: { ...raw.sim.orbitRotation, solarYear: { ...raw.sim.orbitRotation.solarYear, table: solar } } });
const cfg = sim.orbitRotation!;
const snapshot = (chapter: number, beat: number) => {
  const s = chapters[chapter]!.state;
  return orbitSnapshot(cfg, resolveSimValues(sim, { ...s.sim?.set, ...s.beats?.[beat]?.sim?.set }), { timeSeconds: 0 });
};
const q = (chapter: number, beat: number) => snapshot(chapter, beat).quantities;

describe('sun-earth-moon · published content and scientific captions', () => {
  it('ships eight chapters, 39 beats, five experiments and thirteen real selectable objects', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map(c => c.state.beats?.length)).toEqual([4, 5, 5, 5, 5, 5, 5, 5]);
    expect(chapters.filter(c => c.state.sim?.try)).toHaveLength(5);
    expect(raw.parts).toHaveLength(13);
    expect(raw.groups).toHaveLength(4);
    expect(raw.sim.controls).toHaveLength(13);
    expect(raw.sim.outputs).toHaveLength(23);
    expect(parse(readFileSync(`${root}/topic.yaml`, 'utf8')).status).toBe('published');
    for (const c of chapters) {
      expect(c.state.run).toBe(false);
      for (const beat of c.state.beats ?? []) {
        expect(Object.keys(beat.sim?.set ?? {}).sort()).toEqual(raw.sim.controls.map(c => c.id).sort());
        expect(beat.caption?.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      }
    }
  });
  it('retains bilingual caption facts while allowing simpler wording', () => {
    for (const c of chapters) for (const beat of c.state.beats ?? []) {
      expect(beat.caption?.en.trim(), c.id).toBeTruthy();
      expect(beat.caption?.zh.trim(), c.id).toBeTruthy();
    }
    // Check the quantities and essential distinctions, rather than entire sentences.
    const facts: [number, number, RegExp[], RegExp[]][] = [
      [0, 2, [/ten millimetres|10\s*mm/i, /three hundred and two|302/i, /centr/i, /surface/i], [/十毫米|10\s*毫米/, /三百零二|302/, /中心/, /表面/]],
      [2, 0, [/twenty-three point four|23\.4/i, /perpendicular/i], [/二十三点四|23\.4/, /垂线/]],
      [2, 1, [/forty-five|45/i, /fifteen hours|15 hours/i, /twenty-six|26/i], [/四十五|45/, /十五小时|15\s*小时/, /二十六|26/]],
      [2, 2, [/eight hours|8 hours/i, /thirty-four|34/i], [/八小时|8\s*小时/, /三十四|34/]],
      [3, 1, [/twelve hours|12 hours/i, /twelve minutes|12 minutes/i], [/十二小时|12\s*小时/, /十二分钟|12\s*分钟/]],
      [3, 2, [/twelve hours|12 hours/i, /three minutes|3 minutes/i], [/十二小时|12\s*小时/, /三分钟|3\s*分钟/]],
      [3, 3, [/six forty-seven|6:47/i, /twelve forty-nine|12:49/i, /six fifty-one|6:51|18:51/i, /estimat/i], [/六点四十七|6:47/, /十二点四十九|12:49/, /六点五十一|6:51|18:51/, /估计/]],
      [4, 2, [/flat|coplanar/i, /lunar eclipse/i], [/共面/, /月食/]],
      [6, 0, [/twenty-six December twenty-nineteen|26 December 2019/i, /annular/i], [/二〇一九年十二月二十六日|2019年12月26日/, /日环食/]],
    ];
    for (const [chapter, beat, en, zh] of facts) {
      const caption = chapters[chapter]!.state.beats![beat]!.caption!;
      for (const fact of en) expect(caption.en, `${chapter}.${beat} en`).toMatch(fact);
      for (const fact of zh) expect(caption.zh, `${chapter}.${beat} zh`).toMatch(fact);
    }
  });
  it('day captions match night, boundary, overhead light and return while orbit is frozen', () => {
    expect([0,1,2,3,4].map(i => q(1,i)['observer-day'])).toEqual(['night','boundary','day','boundary','night']);
    expect(q(1,2)['observer-altitude-deg']).toBeCloseTo(90,6);
    expect(snapshot(1,0).bodies.earth.position).toEqual(snapshot(1,4).bodies.earth.position);
  });
  it('season captions match rounded daylight, parallel axes, swapped hemispheres and zero tilt', () => {
    expect(Math.round((q(2,1)['geometric-daylight-hours'] as number)*60)).toBe(926);
    expect(Math.round((q(2,2)['geometric-daylight-hours'] as number)*60)).toBe(514);
    expect(snapshot(2,1).axis).toEqual(snapshot(2,2).axis);
    expect(q(2,3)['geometric-daylight-hours']).toBe(q(2,2)['geometric-daylight-hours']);
    expect(q(2,4)['geometric-daylight-hours']).toBe(12);
  });
  it('local captions read original minute estimates, not rounded sunset minus sunrise', () => {
    expect(Math.round(q(3,1)['local-daylight-minutes'] as number)).toBe(732);
    expect(Math.round(q(3,2)['local-daylight-minutes'] as number)).toBe(723);
    expect(q(3,3)['local-daylight-minutes']).toBe(724.417);
    expect(q(3,3)['local-sunrise']).toBeCloseTo(6 + 47/60,8);
    expect(q(3,3)['local-noon']).toBeCloseTo(12 + 49/60,8);
    expect(q(3,3)['local-sunset']).toBeCloseTo(18 + 51/60,8);
    expect(solar.days).toHaveLength(365);
    expect(JSON.stringify(solar.meta)).not.toContain('cross_check');
  });
  it('quarter captions match half-lit discs independent of Earth’s shadow', () => {
    expect([0,1,2,3].map(i => q(4,i)['moon-phase'])).toEqual(['new','first-quarter','full','last-quarter']);
    for (const i of [1,3]) {
      expect(q(4,i)['moon-lit-percent']).toBeCloseTo(50.1284773403,8);
      expect(q(4,i)['lunar-eclipse']).toBe('none');
    }
    expect(q(4,2)['moon-lit-percent']).toBe(100);
    expect(q(4,2)['lunar-eclipse']).toBe('total');
    expect(snapshot(4,4).bodies.moon.quaternion).not.toEqual(snapshot(4,1).bodies.moon.quaternion);
  });
  it('eclipse captions match off-node, node, lunar, total and annular geometries', () => {
    expect(q(5,0)['solar-eclipse']).toBe('none');
    expect(q(5,1)['solar-eclipse']).not.toBe('none');
    expect(q(5,2)['lunar-eclipse']).toBe('total');
    expect(q(5,3)['solar-eclipse']).toBe('total');
    expect(q(5,4)['solar-eclipse']).toBe('annular');
    expect(q(6,0)['solar-eclipse']).toBe('annular');
    expect(q(6,2)['solar-eclipse']).toBe('partial');
  });
  it('true-scale caption distinguishes centre distance from surface gap without changing physics', () => {
    const s = snapshot(0,2);
    const t = orbitDisplay(cfg,s,'true-scale'), d = orbitDisplay(cfg,s,'schematic');
    expect(t.radii.earth*2).toBeCloseTo(.01,12);
    const centreDistance = Math.hypot(...t.centres.moon.map((v,i) => v - t.centres.earth[i]!));
    expect(centreDistance*1000).toBeCloseTo(301.679485167,8);
    expect((centreDistance-t.radii.earth-t.radii.moon)*1000).toBeCloseTo(295.315963,6);
    expect(d.multipliers.size.earth).not.toBe(t.multipliers.size.earth);
    expect(q(0,2)['earth-moon-km']).toBeCloseTo(384400,6);
  });
  it('tilt guide measures from the orbital normal, follows the fixed axis, and closes to zero', () => {
    for (const tilt of [0,23.44]) {
      const s = snapshot(2, tilt === 0 ? 4 : 1);
      const d = orbitDisplay(cfg,s,'schematic');
      const points = orbitalTiltGuide(d.centres.earth,s.axis,d.radii.earth,.84);
      const normal = points[7]!.map((v,i) => v-d.centres.earth[i]!);
      expect(normal).toEqual([0,d.radii.earth*1.7,0]);
      const arc = points.slice(9).map(p => p.map((v,i) => v-d.centres.earth[i]!));
      for (const p of arc) expect(Math.hypot(...p)).toBeCloseTo(d.radii.earth*1.55,12);
      const end = arc.at(-1)!;
      for(let i=0;i<3;i++) expect(end[i]!/(d.radii.earth*1.55)).toBeCloseTo(s.axis[i]!,12);
      if(tilt===0) expect(arc[0]).toEqual(end);
    }
  });
  it('opts only this topic into the new framing, guide weight, stroke anchors and shadow note', () => {
    const fixture=JSON.parse(readFileSync(resolve('src/content/topics/sample-orbit/data/parts.json'),'utf8'));
    const old=simSchema.parse(fixture.sim);
    expect(fixture.views.hudFrame).toBeUndefined();
    expect(old.orbitRotation?.panel.shadowNote).toBeUndefined();
    const oldGuide=old.overlays.find(o => o.kind === 'orbit-guides');
    if (oldGuide?.kind !== 'orbit-guides') throw new Error('fixture guide missing');
    expect(oldGuide.radius).toBeUndefined(); expect(oldGuide.labelAnchors).toBeUndefined();
    expect(raw.views.hudFrame.parts).toEqual(['sun-body','earth-body','moon-body']);
    expect(raw.views.hudFrame.primary).toEqual({part:'earth-body',minRadiusPx:24});
    const guide=sim.overlays.find(o => o.kind === 'orbit-guides');
    if (guide?.kind !== 'orbit-guides') throw new Error('guide missing');
    expect(guide.radius).toBe(.006); expect(guide.labelAnchors).toBe('strokes');
    expect(cfg.panel.shadowNote?.en).toContain('too thin'); expect(cfg.panel.shadowNote?.zh).toContain('太细');
  });
  it('axis and plane labels point beyond Earth’s surface, and the yearly track anchor lies on the track', () => {
    const b = sim.bind.find(b => 'part' in b && b.part === 'earth-axis')!;
    if (!('bodyTransform' in b) || !b.bodyTransform) throw new Error('axis binding missing');
    for (const scale of ['schematic','true-scale']) for (const beat of [0,1,2,3,4]) {
      const s=snapshot(2,beat), d=orbitDisplay(cfg,s,scale);
      const t=bodyPlacement(s,d,b.bodyTransform);
      expect(t.labelOffset).toBeDefined();
      expect(Math.hypot(...t.labelOffset!)).toBeCloseTo(d.radii.earth*1.35,12);
      expect(dot(unit(t.labelOffset!),s.axis)).toBeCloseTo(1,12);
      const plane=orbitGuideLabelPoint('plane',d)!;
      expect(plane).toEqual(orbitalTiltGuide(d.centres.earth,s.axis,d.radii.earth,.84)[7]);
      const track=orbitGuideLabelPoint('earthTrack',d)!;
      expect(Math.hypot(...sub(track,d.centres.sun))).toBeCloseTo(Math.hypot(...sub(d.centres.earth,d.centres.sun)),10);
      expect(Math.hypot(...sub(track,d.centres.earth))).toBeGreaterThan(d.radii.earth*2);
    }
  });
  it('observer and near-side label anchors are on the visible hemisphere in every authored labelled beat', () => {
    chapters.forEach((c,ci) => c.state.beats?.forEach((b,bi) => {
      const cam=b.camera ?? c.state.camera;
      if (!cam || typeof cam === 'string' || !isOrbitCamera(cam)) throw new Error('authored camera missing');
      const s=snapshot(ci,bi), d=orbitDisplay(cfg,s,'schematic');
      for (const id of b.labels ?? c.state.labels ?? []) {
        if (id !== 'observer-marker' && id !== 'near-side-mark') continue;
        const body=id === 'observer-marker' ? 'earth' : 'moon';
        const n=id === 'observer-marker' ? unit(sub(s.bodies.observer.position,s.bodies.earth.position)) : rotate(s.bodies.moon.quaternion,[1,0,0]);
        const toCam=sub(cam.position as V3,d.centres[body]);
        // Perspective tangent: a positive dot alone is insufficient near a sphere’s limb.
        expect(dot(n,unit(toCam)),`${c.id}.${bi+1} ${id}`).toBeGreaterThan(d.radii[body]/Math.hypot(...toCam));
      }
    }));
  });
  it('04.5 exposes a sunlit patch on the lunar far hemisphere while keeping the orientation mark visible', () => {
    const s=snapshot(4,4), d=orbitDisplay(cfg,s,'schematic'), cam=chapters[4]!.state.beats![4]!.camera!;
    if (typeof cam === 'string' || !isOrbitCamera(cam)) throw new Error('camera missing');
    const far=unit(sub(s.bodies.moon.position,s.bodies.earth.position));
    const patch=unit(add(far,s.solarDirections.moon));
    expect(dot(patch,far)).toBeGreaterThan(.5);
    expect(dot(patch,s.solarDirections.moon)).toBeGreaterThan(.5);
    expect(dot(patch,unit(sub(cam.position as V3,d.centres.moon)))).toBeGreaterThan(.3);
    // The previous wide view left this as a tiny crescent. Give the Moon
    // a substantial disc while retaining the unchanged physical snapshot.
    const distance = Math.hypot(...sub(cam.position as V3,d.centres.moon));
    const radiusAt900 = d.radii.moon * 900 / (2 * Math.tan((cam.fov ?? 34) * Math.PI / 360) * distance);
    expect(radiusAt900).toBeGreaterThan(100);

  });
  it('calendar beats retain continuous phases without imposing a full Moon on day fifteen', () => {
    expect(chapters[7]!.state.sim?.set?.['lunar-tilt']).toBe(5.145);
    expect(chapters[7]!.state.sim?.set?.['node-angle']).toBe(90);
    expect(q(7,3)['moon-lit-percent']).toBeLessThan(100);
    expect(q(7,4)['moon-lit-percent']).toBeLessThan(100);
    expect(chapters[7]!.text).not.toMatch(/"day-index":\s*15\b/);
  });
});


describe('full-Moon authored HUD framing regression', () => {
  it.each([[4,2],[5,2],[7,2],[7,4]])('keeps Earth readable and Moon visible for %i.%i in the narrow tablet stage', (chapter,beat) => {
    const camera = chapters[chapter]!.state.beats![beat]!.camera;
    if (!isOrbitCamera(camera)) throw new Error('full-Moon beat needs an explicit camera');
    const d = orbitDisplay(cfg,snapshot(chapter,beat),'schematic');
    const boxes = (['earth','moon','sun'] as const).map(body => ({
      center:d.centres[body], half:[d.radii[body],d.radii[body],d.radii[body]] as V3,
      minRadiusPx:body === 'earth' ? raw.views.hudFrame.primary.minRadiusPx : undefined,
    }));
    // 1024px viewport minus the docked reader; the remaining legacy band is only 76px.
    const w=624,h=670,panels=[{x0:12,y0:20,x1:250,y1:350},{x0:350,y0:20,x1:612,y1:400},
      {x0:12,y0:430,x1:250,y1:580},{x0:0,y0:610,x1:624,y1:670}];
    const fitted = fitCameraToHud(fitCameraToAspect(camera,w/h),boxes,w,h,freeStageRect(w,h,panels),{panels});
    const c = new PerspectiveCamera(fitted.fov,w/h,.001,1000);
    c.position.fromArray(fitted.position); c.lookAt(...fitted.target); c.updateMatrixWorld();
    boxes.forEach((box,i) => {
      const corners = Array.from({length:8}, (_,k) => new Vector3(...box.center.map((v,j) => v+(k & 1<<j ? 1 : -1)*box.half[j]!) as V3).project(c));
      const x0=Math.min(...corners.map(p => (p.x+1)*w/2)),x1=Math.max(...corners.map(p => (p.x+1)*w/2));
      const y0=Math.min(...corners.map(p => (1-p.y)*h/2)),y1=Math.max(...corners.map(p => (1-p.y)*h/2));
      if (i<2) {
        expect(x0).toBeGreaterThanOrEqual(12-1e-6); expect(x1).toBeLessThanOrEqual(w-12+1e-6);
        expect(y0).toBeGreaterThanOrEqual(12-1e-6); expect(y1).toBeLessThanOrEqual(h-12+1e-6);
      }
      for (const p of panels) expect(x1 <= p.x0-12+1e-6 || x0 >= p.x1+12-1e-6 || y1 <= p.y0-12+1e-6 || y0 >= p.y1+12-1e-6).toBe(true);
    });
    const forward = new Vector3(...fitted.position).sub(new Vector3(...fitted.target)).normalize();
    const depth = new Vector3(...fitted.position).sub(new Vector3(...d.centres.earth)).dot(forward);
    expect(d.radii.earth*h/(2*Math.tan(fitted.fov!*Math.PI/360)*depth)).toBeGreaterThanOrEqual(24-1e-6);
  });
});
