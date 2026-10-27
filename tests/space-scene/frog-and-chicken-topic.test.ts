/** Content contract for docs/56: ordinal observations, never a development clock. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { PerspectiveCamera, Vector3 } from 'three';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';
import { createSceneStore } from '../../src/engines/core/store';
import type { Chapter, OrbitCamera, TopicMeta } from '../../src/engines/core/types';
import type { Beat, SpaceBeatSpec } from '../../src/engines/core/presentation';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene';
import { beatScene } from '../../src/engines/space-scene/lib/beat-scene';
import { partsFile, spaceChapterState } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues, stepValue } from '../../src/engines/space-scene/lib/sim/controls';

const DIR = join(import.meta.dirname, '../../src/content/topics/frog-and-chicken');
const raw = JSON.parse(readFileSync(join(DIR, 'data/parts.json'), 'utf8'));
const file = partsFile.parse(raw);
const sim = file.sim!;
const chapters = readdirSync(join(DIR, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(join(DIR, 'chapters', f), 'utf8');
  const [, front, ...rest] = text.split(/^---$/m);
  const fm = parseYaml(front!);
  return { ...fm, state: spaceChapterState.parse(fm.state), body: rest.join('---') } as Chapter & { body: string; state: ReturnType<typeof spaceChapterState.parse> };
});
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const evaluate = (set: Record<string, unknown>) => {
  const values = resolveSimValues(sim, set);
  const outputs = evaluateSim(sim, values);
  return { values, outputs, effects: simEffects(sim, values, outputs) };
};
const at = (id: string, n: number) => {
  const c = chapter(id);
  return evaluate({ ...c.state.sim?.set, ...c.state.beats![n - 1]!.sim?.set });
};
const FROG = ['egg', 'tadpole', 'hind-legs', 'froglet', 'adult'];
const CHICKEN = ['egg', 'chick', 'adult'];
const COMPARE = ['frog', 'chicken', 'mosquito', 'plant'];
const combinations = FROG.flatMap((frog) => CHICKEN.flatMap((chicken) => [false, true].flatMap((open) => [false, true].flatMap((fertilised) => COMPARE.map((compare) => ({
  'frog-view': frog, 'chicken-view': chicken, 'egg-open': open, fertilised, 'compare-view': compare,
}))))));

describe('frog-and-chicken: complete original observation model', () => {
  it('has 21 selectable specimens/markers, three context parts, and no timed biology model', () => {
    expect(file.parts.filter((p) => !p.context)).toHaveLength(21);
    expect(file.parts.filter((p) => p.context)).toHaveLength(3);
    expect(sim.kind).toBe('table');
    expect(sim.controls).toHaveLength(5);
    expect(sim.outputs).toHaveLength(6);
    expect(sim.outputs.every((o) => o.kind === 'state')).toBe(true);
    expect(Object.values(sim.table!.experiments).map((e) => e.rows.length)).toEqual([5, 3, 4, 4]);
    expect(sim.controls.every((c) => c.kind === 'choice' || c.kind === 'toggle')).toBe(true);
  });

  it('defaults to closed fertilised egg examples and five/three independently drawn main observations', () => {
    expect(evaluate({}).outputs).toMatchObject({ 'frog-form': 'egg', 'chicken-form': 'egg', 'egg-view': 'closed', 'embryo-view': 'hidden', 'egg-condition': 'fertilised', comparison: 'frog' });
    const mainFrog = file.parts.filter((p) => p.group === 'frog-cycle' && !p.context && !['frog-marker', 'frog-next-generation'].includes(p.id));
    expect(mainFrog.map((p) => p.id)).toEqual(['frog-eggs', 'frog-tadpole', 'frog-hind-legs', 'frog-froglet', 'frog-adult']);
    expect(['chicken-egg', 'chicken-chick', 'chicken-adult'].every((id) => file.parts.some((p) => p.id === id && p.primitive))).toBe(true);
    expect(file.parts.some((p) => p.id.startsWith('frog-') && p.id.includes('pupa'))).toBe(false);
  });

  it('has six bilingual chapters of five beats and indexes every named specimen', () => {
    expect(chapters.map((c) => c.id)).toEqual(['before-you-start', 'eggs-and-tadpoles', 'the-changing-frog', 'inside-the-egg', 'chick-to-adult', 'cycles-compared']);
    const ids = new Set(file.parts.filter((p) => !p.context).map((p) => p.id));
    for (const c of chapters) {
      expect(c.state.beats, c.id).toHaveLength(5);
      expect(Object.keys(c.state.sim!.set!).sort(), c.id).toEqual(sim.controls.map((x) => x.id).sort());
      expect(c.body, c.id).toContain('<Lang en>');
      expect(c.body, c.id).toContain('<Lang zh>');
      for (const id of c.state.index!.parts!) expect(ids.has(id), `${c.id}: ${id}`).toBe(true);
      for (const b of c.state.beats!) {
        expect(b.caption.en.trim().length).toBeGreaterThan(20);
        expect(b.caption.zh).toMatch(/[\u3400-\u9fff]/);
        expect(b.labels!.length).toBeLessThanOrEqual(6);
        for (const id of b.labels!) expect(c.state.index!.parts, `${c.id}: ${id}`).toContain(id);
      }
    }
  });

  it('uses only existing sources and bilingual state labels', () => {
    const sources = JSON.parse(readFileSync(join(DIR, 'data/sources.json'), 'utf8')).sources as { id: string; design?: boolean }[];
    expect(sources.find((s) => s.id === 'S22')?.design).toBe(true);
    for (const experiment of Object.values(sim.table!.experiments)) for (const row of experiment.rows) {
      for (const id of row.source) expect(sources.map((s) => s.id)).toContain(id);
    }
    for (const o of sim.outputs) {
      if (o.kind !== 'state') continue;
      for (const text of Object.values(o.states!)) {
        expect(text.en.trim()).not.toBe('');
        expect(text.zh).toMatch(/[\u3400-\u9fff]/);
      }
    }
  });
});

describe('frog-and-chicken: 240 independent, deterministic combinations', () => {
  it.each(combinations)('%j', (set) => {
    const { outputs, effects } = evaluate(set);
    expect(outputs).toEqual(evaluate(set).outputs);
    expect(outputs).toMatchObject({
      'frog-form': set['frog-view'], 'chicken-form': set['chicken-view'], comparison: set['compare-view'],
      'egg-view': set['egg-open'] ? 'open' : 'closed',
      'embryo-view': set['egg-open'] && set.fertilised ? 'shown' : 'hidden',
      'egg-condition': set.fertilised ? 'fertilised' : 'unfertilised',
    });
    for (const o of sim.outputs) {
      expect(o.kind).toBe('state');
      if (o.kind === 'state') expect(Object.keys(o.states!)).toContain(outputs[o.id]);
    }
    expect(effects.poses.get('frog-marker')).toBe(`frog-at-${set['frog-view']}`);
    expect(effects.poses.get('chicken-marker')).toBe(`chicken-at-${set['chicken-view']}`);
    expect(effects.poses.get('comparison-marker')).toBe(`compare-at-${set['compare-view']}`);
    expect(effects.hidden.has('egg-embryo')).toBe(!(set['egg-open'] && set.fertilised));
  });
});

const MARKERS: [string, string, number[]][] = [
  ['frog-marker', 'frog-at-egg', [-2.8, 0.18, -1.4]],
  ['frog-marker', 'frog-at-tadpole', [-1.468521, 0.18, -0.432624]],
  ['frog-marker', 'frog-at-hind-legs', [-1.977101, 0.18, 1.132624]],
  ['frog-marker', 'frog-at-froglet', [-3.622899, 0.18, 1.132624]],
  ['frog-marker', 'frog-at-adult', [-4.131479, 0.18, -0.432624]],
  ['chicken-marker', 'chicken-at-egg', [2.8, 0.18, -1.4]],
  ['chicken-marker', 'chicken-at-chick', [4.012436, 0.18, 0.7]],
  ['chicken-marker', 'chicken-at-adult', [1.587564, 0.18, 0.7]],
  ['comparison-marker', 'compare-at-frog', [-3, 0.2, 3.5]],
  ['comparison-marker', 'compare-at-chicken', [-1, 0.2, 3.5]],
  ['comparison-marker', 'compare-at-mosquito', [1, 0.2, 3.5]],
  ['comparison-marker', 'compare-at-plant', [3, 0.2, 3.5]],
];
describe('frog-and-chicken: drawings agree with the selected observations', () => {
  it.each(MARKERS)('%s at %s has the documented display coordinates', (id, pose, expected) => {
    const part = file.parts.find((p) => p.id === id)!;
    const offset = file.poses![pose]!.parts[id]!.offset!;
    const actual = part.primitive!.at.map((x, i) => x + offset[i]!);
    actual.forEach((x, i) => expect(x).toBeCloseTo(expected[i]!, 6));
  });

  it('all thirty beats frame their visible label anchors, including the displaced open shell', () => {
    // Static projection catches bad camera/pose coordinates. Browser QA still checks
    // HUD occlusion, leader packing and the camera's responsive fit.
    for (const c of chapters) for (const [i, b] of c.state.beats!.entries()) {
      const cameraData = typeof b.camera === 'object' ? b.camera
        : file.presets?.find((p) => p.id === b.camera)?.camera ?? c.state.camera!;
      const camera = new PerspectiveCamera(cameraData.fov ?? 32, 1600 / 900, 0.01, 1000);
      camera.position.fromArray(cameraData.position);
      camera.lookAt(new Vector3(...cameraData.target));
      camera.updateMatrixWorld();
      const { effects } = at(c.id, i + 1);
      for (const id of b.labels!) {
        const p = file.parts.find((p) => p.id === id)!;
        const hidden = b.hide ?? c.state.hide ?? [];
        const ghost = b.ghost ?? c.state.ghost ?? [];
        expect(hidden, `${c.id}.${i + 1} ${id}`).not.toContain(id);
        expect(hidden, `${c.id}.${i + 1} ${id} group`).not.toContain(p.group);
        expect(ghost).not.toContain(id);
        expect(ghost).not.toContain(p.group);
        expect(effects.hidden.has(id), `${c.id}.${i + 1} ${id} table visibility`).toBe(false);
        const pose = effects.poses.get(id) ?? b.pose ?? c.state.pose;
        const offset = pose ? file.poses![pose]?.parts[id]?.offset : undefined;
        const point = new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p)));
        if (offset) point.add(new Vector3(...offset));
        point.project(camera);
        expect(Math.abs(point.x), `${c.id}.${i + 1} ${id} x`).toBeLessThan(1);
        expect(Math.abs(point.y), `${c.id}.${i + 1} ${id} y`).toBeLessThan(1);
        expect(point.z, `${c.id}.${i + 1} ${id} depth`).toBeGreaterThan(-1);
        expect(point.z).toBeLessThan(1);
      }
    }
  });

  it.each(['frog-hind-legs', 'frog-froglet', 'frog-adult'])('%s has physically distinct digits branching from each foot', (id) => {
    const p = file.parts.find((p) => p.id === id)!;
    const digits = [p.primitive!, ...(p.extra ?? [])].filter((q) =>
      q.kind === 'sweep' && Array.isArray(q.radius) && q.radius[0]! <= 0.021,
    );
    const feet = new Map<string, number[][]>();
    for (const digit of digits) {
      if (digit.kind !== 'sweep') continue;
      const origin = digit.path[0]!;
      const key = JSON.stringify(origin);
      const ends = feet.get(key) ?? [];
      const end = digit.path.at(-1)!;
      expect(end).not.toEqual(origin);
      ends.push(end);
      feet.set(key, ends);
    }
    const counts = [...feet.values()].map((ends) => {
      expect(new Set(ends.map((p) => JSON.stringify(p))).size).toBe(ends.length);
      return ends.length;
    }).sort();
    expect(counts).toEqual(id === 'frog-hind-legs' ? [5, 5] : [4, 4, 5, 5]);
    // Each digit cluster joins a drawn limb at the same ankle/wrist.
    for (const origin of feet.keys()) {
      expect([p.primitive!, ...(p.extra ?? [])].some((q) =>
        q.kind === 'sweep' && JSON.stringify(q.path.at(-1)) === origin,
      )).toBe(true);
    }
  });

  it('uses a separate removable shell piece and embryo, without moving the yolk', () => {
    expect(file.poses!['egg-window-open']!.parts['egg-shell-window']!.offset).toEqual([0.8, 0.25, -0.41]);
    expect(file.parts.find((p) => p.id === 'egg-embryo')!.primitive!.at).not.toEqual(file.parts.find((p) => p.id === 'egg-yolk')!.primitive!.at);
    const moved = sim.bind.filter((b) => 'part' in b && b.part === 'egg-yolk');
    expect(moved).toHaveLength(0);
  });

  it('holds adult at the final control option instead of travelling across the reproduction link', () => {
    for (const id of ['frog-view', 'chicken-view']) {
      const control = sim.controls.find((c) => c.id === id)!;
      expect(stepValue(control, 'adult', 1)).toBe('adult');
      expect(evaluate({ [id]: stepValue(control, 'adult', 1) }).outputs[id === 'frog-view' ? 'frog-form' : 'chicken-form']).toBe('adult');
    }
  });

  it('captions describing stages follow the chosen marker and the actual egg visibility', () => {
    expect([1, 2, 3, 4, 5].map((n) => at('eggs-and-tadpoles', n).outputs['frog-form'])).toEqual(['egg', 'tadpole', 'tadpole', 'adult', 'tadpole']);
    expect([1, 2, 3, 4, 5].map((n) => at('the-changing-frog', n).outputs['frog-form'])).toEqual(['hind-legs', 'froglet', 'froglet', 'adult', 'adult']);
    expect([1, 2, 3, 4, 5].map((n) => at('chick-to-adult', n).outputs['chicken-form'])).toEqual(['egg', 'chick', 'adult', 'adult', 'adult']);
    expect([1, 2, 3, 4, 5].map((n) => at('inside-the-egg', n).outputs['embryo-view'])).toEqual(['hidden', 'shown', 'shown', 'hidden', 'shown']);
    expect([1, 2, 3, 4, 5].map((n) => at('cycles-compared', n).outputs.comparison)).toEqual(['frog', 'mosquito', 'plant', 'chicken', 'frog']);
    const change = chapter('the-changing-frog').state.beats!;
    expect(change[0]!.caption.en).toMatch(/hind legs.*visible|visible.*hind legs/i);
    expect(change[1]!.caption.en).toMatch(/four limbs/i);
    expect(change[2]!.caption.en).toMatch(/absorbed/i);
    expect(change[4]!.caption.en).toMatch(/five selected views/i);
    expect(chapter('cycles-compared').state.beats![1]!.caption.en).toMatch(/pupa/);
    expect(chapter('cycles-compared').state.beats![2]!.caption.en).toMatch(/seed, young plant and adult plant/);
  });
});

describe('frog-and-chicken: chapter and beat baselines do not accumulate', () => {
  function store() {
    const defaults = { ...(spaceSceneEngine.defaults({} as TopicMeta, undefined) as SpaceSceneExt), chapter: null, layers: file.groups.map((g) => g.id), camera: null, theme: undefined };
    return createSceneStore<SpaceSceneExt>({ chapters, defaults, fromChapterState: spaceSceneEngine.fromChapterState });
  }
  function scene(s: ReturnType<typeof store>, id: string, n: number) {
    const c = chapter(id);
    const spec = c.state.beats![n - 1]!;
    const b: Beat<SpaceBeatSpec> = { chapter: id, index: n - 1, caption: spec.caption, chapterIndex: chapters.indexOf(c), count: 5, spec };
    const target = s.getState().chapterTarget(id);
    return beatScene(b, target, file.presets ?? [], () => target.camera as OrbitCamera);
  }
  it('moving from unfertilised beat four to beat five restores the chapter fertilisation baseline', () => {
    const s = store();
    s.getState().goToChapter('inside-the-egg', { instant: true });
    s.getState().applyState(scene(s, 'inside-the-egg', 4), { instant: true });
    expect(evaluate(s.getState().sim).outputs['embryo-view']).toBe('hidden');
    s.getState().applyState(scene(s, 'inside-the-egg', 5), { instant: true });
    expect(evaluate(s.getState().sim).outputs['embryo-view']).toBe('shown');
    s.getState().applyState(scene(s, 'inside-the-egg', 1), { instant: true });
    expect(evaluate(s.getState().sim).outputs['egg-view']).toBe('closed');
  });
  it('every chapter restores its own controls, hide, ghost and pose after manual changes', () => {
    for (const c of chapters) {
      const s = store();
      s.getState().goToChapter('inside-the-egg', { instant: true });
      s.getState().applyState({ sim: { 'egg-open': true, fertilised: false, 'frog-view': 'froglet' }, hidden: ['egg-embryo'], ghosted: ['frog-cycle'], pose: 'egg-window-open' }, { instant: true });
      s.getState().goToChapter(c.id, { instant: true });
      const actual = s.getState().snapshot();
      expect(actual.sim, c.id).toEqual(c.state.sim!.set);
      expect(actual.hidden, c.id).toEqual(c.state.hide ?? []);
      expect(actual.ghosted, c.id).toEqual(c.state.ghost ?? []);
      expect(actual.pose, c.id).toBe(c.state.pose ?? null);
    }
  });
});
