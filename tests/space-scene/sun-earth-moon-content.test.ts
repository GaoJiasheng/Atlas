import { describe, expect, it } from 'vitest';
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
  it('uses all exact final captions from the signed content specification', () => {
    const spec = readFileSync(resolve('docs/44-sun-earth-moon-content-spec.md'), 'utf8');
    const rows = spec.split('\n').filter(line => /^\| (?:BG|0[1-7])\.[1-5] \|/.test(line));
    expect(rows).toHaveLength(39);
    const beats = chapters.flatMap(c => c.state.beats ?? []);
    rows.forEach((row, i) => {
      const columns = row.split('|').map(s => s.trim());
      expect(beats[i]!.caption).toEqual({ en: columns[3], zh: columns[4] });
    });
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
  });
  it('calendar beats retain continuous phases without imposing a full Moon on day fifteen', () => {
    expect(chapters[7]!.state.sim?.set?.['lunar-tilt']).toBe(5.145);
    expect(chapters[7]!.state.sim?.set?.['node-angle']).toBe(90);
    expect(q(7,3)['moon-lit-percent']).toBeLessThan(100);
    expect(q(7,4)['moon-lit-percent']).toBeLessThan(100);
    expect(chapters[7]!.text).not.toMatch(/"day-index":\s*15\b/);
  });
});
