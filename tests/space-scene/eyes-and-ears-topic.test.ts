/** The published captions, anatomy topology and activities agree with the model. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { effectiveEyeRays, longitudinalPositions } from '../../src/engines/space-scene/lib/sim/senses';
import { sensesSourceIssues } from '../../src/engines/space-scene/senses-schema';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';

const DIR = join(import.meta.dirname, '../../src/content/topics/eyes-and-ears');
const file = partsFile.parse(JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; design?: boolean }[];
const terms = JSON.parse(readFileSync(join(DIR, 'data/glossary.json'), 'utf8')).terms as { id: string }[];
const chapters = readdirSync(join(DIR, 'chapters')).filter(f => f.endsWith('.mdx')).sort().map(f => {
  const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
  const [, front, ...body] = text.split(/^---$/m);
  return { ...yaml(front!), body: body.join('---') };
});
const chapter = (id: string) => chapters.find(c => c.id === id)!;
const values = (id: string, beat: number) => resolveSimValues(sim, { ...chapter(id).state.sim.set, ...chapter(id).state.beats[beat - 1].sim?.set });
const at = (id: string, beat: number) => evaluateSim(sim, values(id, beat));
const part = (id: string) => file.parts.find(p => p.id === id)!;
const EYE = ['eye-front', 'eye-receiver'];
const EAR = ['ear-transfer', 'ear-receiver'];

describe('eyes-and-ears: anatomical and publishing contract', () => {
  it('publishes one bilingual biology topic with eight chapters and forty beats', () => {
    expect(yaml(readFileSync(join(DIR, 'topic.yaml'), 'utf8'))).toMatchObject({ id: 'eyes-and-ears', status: 'published', subject: 'biology', engine: 'space-scene' });
    expect(chapters).toHaveLength(8);
    expect(chapters.map(c => c.state.beats.length)).toEqual(Array(8).fill(5));
    expect(file.parts.filter(p => !p.context)).toHaveLength(26);
    expect(file.groups.map(g => g.id)).toEqual([...EYE, ...EAR, 'study-bench', 'nerve-signals']);
    expect(sensesSourceIssues(sim.senses!, new Set(sources.map(s => s.id)))).toEqual([]);
    expect(sources.find(s => s.id === 'S31')?.design).toBe(true);
  });

  it('has exactly three separately identifiable ossicles in contact order', () => {
    for (const [a, b] of [['eardrum', 'malleus'], ['malleus', 'incus'], ['incus', 'stapes'], ['stapes', 'oval-window']]) {
      expect(part(a!).connects?.includes(b!) || part(b!).connects?.includes(a!), `${a} to ${b}`).toBe(true);
    }
    expect(['malleus', 'incus', 'stapes'].map(id => part(id).group)).toEqual(Array(3).fill('ear-transfer'));
    const text = chapter('three-moving-bones').state.beats.map((b: any) => b.caption.en + b.caption.zh).join(' ');
    expect(text).toMatch(/three|Three/);
    expect(text).toContain('三');
  });

  it('keeps eye components in front-to-back order and separates neural signals from incoming light', () => {
    const bounds = (id: string) => partBounds(part(id))!;
    expect(bounds('cornea').max[0]).toBeLessThan(bounds('iris').min[0]!);
    expect(bounds('iris').max[0]).toBeLessThan(bounds('lens').min[0]!);
    expect(bounds('lens').max[0]).toBeLessThan(bounds('retina').max[0]!);
    expect(bounds('retina').max[0]).toBeLessThan(bounds('optic-nerve').max[0]!);
    expect(file.flows.map(f => f.id).sort()).toEqual(['auditory-signal', 'optic-signal']);
    for (const f of file.flows) expect(f.color).toBe('token:en-electrical');
    for (const f of file.flows) expect(f.group).toBe('nerve-signals');
    expect(part('signal-marker').group).toBe('ear-receiver');
  });

  it('changes only the iris opening with mutually exclusive context variants', () => {
    expect(part('iris-aperture-small').context).toBe(true);
    expect(part('iris-aperture-large').context).toBe(true);
    for (const [diameter, hidden] of [[2, 'iris-aperture-large'], [4, 'iris-aperture-small']] as const) {
      const v = resolveSimValues(sim, { 'pupil-mm': diameter });
      const fx = simEffects(sim, v, evaluateSim(sim, v));
      expect(fx.hidden.has(hidden)).toBe(true);
      expect(fx.hidden.has(diameter === 2 ? 'iris-aperture-small' : 'iris-aperture-large')).toBe(false);
      expect(fx.poses.has('iris')).toBe(false);
    }
  });

  it('confines the optical and wave overlays to the existing study layer', () => {
    expect(sim.overlays).toHaveLength(2);
    for (const o of sim.overlays) expect('group' in o ? o.group : null).toBe('study-bench');
    for (const c of chapters) {
      for (const b of c.state.beats) {
        const layers: string[] = b.layers ?? c.state.layers;
        if (['the-light-gate', 'an-image-on-the-retina', 'near-far-and-focus'].includes(c.id)) expect(layers.some(l => EAR.includes(l)), c.id).toBe(false);
        if (['three-moving-bones', 'vibration-to-signal', 'pitch-and-strength'].includes(c.id)) expect(layers.some(l => EYE.includes(l)), c.id).toBe(false);
      }
      expect(Object.keys(c.state.sim.set).sort()).toEqual(sim.controls.map(v => v.id).sort());
    }
    for (const id of ['before-you-start', 'care-and-protection']) expect(chapter(id).state.layers).not.toContain('study-bench');
  });

  it('shows mechanical reception before neural signals without displaying the air-wave study', () => {
    const c = chapter('vibration-to-signal');
    c.state.beats.forEach((b: any, i: number) => {
      const layers = b.layers ?? c.state.layers;
      expect(b.run ?? c.state.run).toBe(true);
      expect(layers).not.toContain('study-bench');
      expect(layers.includes('nerve-signals')).toBe(i >= 3);
      expect((b.hide ?? c.state.hide).includes('signal-marker')).toBe(i < 3);
    });
  });
});

describe('eyes-and-ears: captions match the displayed numbers and states', () => {
  it('doubling the pupil diameter gives four times the light proxy without shifting the image', () => {
    const small = at('the-light-gate', 3), large = at('the-light-gate', 4);
    expect(small['relative-light']).toBe(1);
    expect(large['relative-light']).toBe(4);
    expect(large['image-distance']).toBe(small['image-distance']);
    const caption = chapter('the-light-gate').state.beats[3].caption;
    expect(caption.en).toMatch(/four/);
    expect(caption.zh).toContain('四');
  });

  it('the object top forms the lower spot and rays stop at the receiver', () => {
    const eye = effectiveEyeRays(sim.senses!, values('an-image-on-the-retina', 3));
    expect(eye.points[0]!.centerY).toBeCloseTo(-.1, 12);
    expect(eye.points[1]!.centerY).toBeCloseTo(.05, 12);
    for (const p of eye.points) for (const r of p.rays) expect(r.retina[0]).toBe(eye.r);
  });

  it('near accommodation removes defocus while the receiver stays fixed', () => {
    expect([1, 2, 3, 4].map(b => at('near-far-and-focus', b)['focus-state'])).toEqual(['on-retina', 'behind-retina', 'on-retina', 'on-retina']);
    expect(at('near-far-and-focus', 2)['image-distance']).toBeCloseTo(120 / 23, 12);
    expect(at('near-far-and-focus', 2)['blur-diameter']).toBeCloseTo(7 / 150, 12);
    for (const b of [1, 2, 3, 4]) expect(effectiveEyeRays(sim.senses!, values('near-far-and-focus', b)).r).toBe(4);
  });

  it('frequency and amplitude change independently at the same slowdown', () => {
    expect([2, 3, 4].map(b => at('pitch-and-strength', b)['visual-hz'])).toEqual([1, 2, 1]);
    expect([2, 3, 4].map(b => at('pitch-and-strength', b)['amplitude-level'])).toEqual([1, 1, 2]);
    expect(sim.senses!.sound.slowFactor).toBe(250);
    expect(chapter('pitch-and-strength').state.summary.en).toMatch(/250/);
    expect(chapter('pitch-and-strength').state.summary.zh).toMatch(/250/);
    const rest = .25;
    const A = sim.senses!.sound.baseDisplacementScene;
    expect(A).toBe(.035);
    expect(longitudinalPositions(41, .05, A, 1, 0)[5]).toBeCloseTo(rest + A, 12);
    expect(longitudinalPositions(41, .05, A, 1, 1)[5]).toBeCloseTo(rest + A, 12);
    // Compressions read: at 250 Hz / amplitude 1 neighbouring spacing swings by about ±22 % (2πA/λ).
    const p = longitudinalPositions(41, .05, A, 1, 0), gaps = p.slice(1).map((x, i) => x - p[i]!);
    expect(Math.min(...gaps) / .05).toBeLessThan(.8);
    expect(Math.max(...gaps) / .05).toBeGreaterThan(1.2);
  });

  it('paces all four ear-transfer animations with the same output', () => {
    const v: SimValues = resolveSimValues(sim, { 'frequency-hz': 500 });
    const fx = simEffects(sim, v, evaluateSim(sim, v));
    for (const id of ['drum-vibrate', 'malleus-rock', 'incus-rock', 'stapes-piston']) expect(fx.animations.get(id)?.hz, id).toBe(2);
  });

  it('provides only the three intended predict-first activities', () => {
    const cards = chapters.filter(c => c.state.sim.try);
    expect(cards.map(c => c.id)).toEqual(['the-light-gate', 'near-far-and-focus', 'pitch-and-strength']);
    for (const c of cards) expect(c.state.sim.try.predict).toBeTruthy();
    expect(chapter('the-light-gate').state.sim.try.predict.observe).toBe('relative-light');
    expect(chapter('near-far-and-focus').state.sim.try.predict.observe).toBe('focus-state');
    expect(chapter('pitch-and-strength').state.sim.try.predict.observe).toBe('amplitude-level');
  });
});

describe('eyes-and-ears: bilingual text and scope', () => {
  it('uses every glossary term once in each language', () => {
    expect(terms).toHaveLength(18);
    for (const { id } of terms) for (const locale of ['en', 'zh']) {
      const text = chapters.map(c => c.body.match(new RegExp(`<Lang ${locale}>([\\s\\S]*?)</Lang>`))?.[1] ?? '').join('\n');
      expect(text.match(new RegExp(`<Term id="${id}">`, 'g'))?.length ?? 0, `${id}/${locale}`).toBe(1);
    }
  });

  it('links to the published sound lesson without audio access or unfinished copy', () => {
    const all = chapters.map(c => c.body).join('\n');
    expect(all).not.toMatch(/getUserMedia|AudioContext|TODO|placeholder|PSLE必考|PSLE core/i);
    expect(chapter('pitch-and-strength').body).toContain('slug="sound" ch="02-a-medium-to-travel"');
    expect(yaml(readFileSync(join(DIR, '../sound/topic.yaml'), 'utf8')).status).toBe('published');
    expect(chapter('care-and-protection').body).toMatch(/cotton buds/);
    expect(chapter('care-and-protection').body).toMatch(/不要直视太阳/);
    for (const c of chapters) {
      expect(c.body).toContain('<Lang en>');
      expect(c.body).toContain('<Lang zh>');
      for (const b of c.state.beats) {
        expect(b.caption.en.trim()).not.toBe('');
        expect(b.caption.zh.trim()).not.toBe('');
        expect(b.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      }
    }
  });
});
