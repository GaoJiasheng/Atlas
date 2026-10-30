import { describe, expect, it } from 'vitest';
import { createSoundMotion, echoDuration, echoPosition, echoVisualDistance, resetSoundMotion, syncSoundMotion, seekSoundPhase } from '../../src/engines/space-scene/lib/sim/sound-motion';
import { sensesFrameSchema } from '../../src/engines/space-scene/schema';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene';
import { beatScene, linkedBeatPatch, type SpaceSnapshot } from '../../src/engines/space-scene/lib/beat-scene';
import type { Beat, SpaceBeatSpec } from '../../src/engines/core/presentation';
import type { TopicMeta } from '../../src/engines/core/types';

describe('sound display clocks', () => {
  it.each([[0, 0], [.5, .7], [1, 1.4], [1.5, .7], [2, 0]])('34 m echo at %s visual seconds is %s scene units', (elapsed, position) => {
    expect(echoDuration(200)).toBe(2);
    expect(echoPosition(elapsed, 2, echoVisualDistance(34)).pathPosition).toBeCloseTo(position, 14);
  });
  it('holds after exactly one return and reaches the far wall at two visual seconds', () => {
    expect(echoPosition(5, 2, 1.4)).toEqual({ u: 1, pathPosition: 0, atReturn: true });
    expect(echoPosition(2, echoDuration(400), echoVisualDistance(68))).toEqual({ u: .5, pathPosition: 2.2, atReturn: false });
    expect(echoVisualDistance(17)).toBe(1);
    expect(() => echoVisualDistance(0)).toThrow();
    expect(echoDuration(null)).toBe(0);
    expect(echoPosition(1, 0, 1.4)).toEqual({ u: 0, pathPosition: 0, atReturn: false });
  });
  it('applies an author snapshot and discards it when input changes reset the clock', () => {
    const clock = createSoundMotion();
    resetSoundMotion(clock, { waveCycles: .25, echoProgress: .5 }, 2);
    expect(clock.phaseCycles).toBe(.25);
    expect(clock.elapsedVisual).toBe(1);
    clock.waveHold = clock.echoHold = true;
    resetSoundMotion(clock, null, 2);
    expect(clock).toEqual(createSoundMotion());
  });
  it('keeps frequency and propagation input changes isolated', () => {
    const clock = createSoundMotion();
    const seen = { snapshot: null as number | null, wave: '', echo: '' };
    syncSoundMotion(clock, seen, { snapshot: 1, wave: '250/1/on', echo: 'air/34/on' }, { waveCycles: .25, echoProgress: .5 }, 2);
    syncSoundMotion(clock, seen, { snapshot: 1, wave: '500/2/on', echo: 'air/34/on' }, { waveCycles: .25, echoProgress: .5 }, 2);
    expect(clock.phaseCycles).toBe(0); expect(clock.elapsedVisual).toBe(1);
    clock.phaseCycles = .75;
    syncSoundMotion(clock, seen, { snapshot: 1, wave: '500/2/on', echo: 'air/68/on' }, { waveCycles: .25, echoProgress: .5 }, 4);
    expect(clock.phaseCycles).toBe(.75); expect(clock.elapsedVisual).toBe(0);
    syncSoundMotion(clock, seen, { snapshot: 2, wave: '500/2/on', echo: 'air/68/on' }, null, 4);
    expect(clock.phaseCycles).toBe(0); expect(clock.elapsedVisual).toBe(0);
  });
  it.each([NaN, Infinity, -1, 1.1])('rejects invalid seeks %s', v => expect(seekSoundPhase(v)).toBe(false));
  it.each([0, .25, .5, 1])('accepts finite phase %s', v => expect(seekSoundPhase(v)).toBe(true));
});

describe('author acoustic snapshots', () => {
  it.each([{}, { bad: 0 }, { waveCycles: -.1 }, { echoProgress: 1.1 }, { waveCycles: NaN }, { echoProgress: Infinity }])('rejects malformed snapshot %j', frame => expect(sensesFrameSchema.safeParse(frame).success).toBe(false));
  it('resolves every beat from its chapter baseline, including deep links', () => {
    const chapter = spaceSceneEngine.fromChapterState({ sensesFrame: { waveCycles: .25 }, sim: { set: { amplitude: 2 } } });
    const target = { ...spaceSceneEngine.defaults({} as TopicMeta, undefined), ...chapter, chapter: 'sound', camera: null, theme: undefined } as SpaceSnapshot;
    const beat = (index: number, spec: SpaceBeatSpec): Beat<SpaceBeatSpec> => ({ chapter: 'sound', chapterIndex: 0, index, count: 2, caption: spec.caption, spec });
    const cam = { position: [1, 2, 3], target: [0, 0, 0], fov: 35 } as const;
    const camera = () => ({ position: [...cam.position], target: [...cam.target], fov: cam.fov }) as SpaceSnapshot['camera'] & { position: [number, number, number]; target: [number, number, number]; fov: number };
    const a = beatScene(beat(0, { caption: { en: 'a', zh: '甲' }, sensesFrame: { waveCycles: .5, echoProgress: 1 } }), target, [], camera);
    const b = beatScene(beat(1, { caption: { en: 'b', zh: '乙' } }), target, [], camera);
    expect(a.sensesFrame).toEqual({ waveCycles: .5, echoProgress: 1 });
    expect(b.sensesFrame).toEqual({ waveCycles: .25 });
    expect(linkedBeatPatch(b, ['sim']).sensesFrame).toEqual({ waveCycles: .25 });
    expect((spaceSceneEngine.fromChapterState({}) as Partial<SpaceSceneExt>).sensesFrame).toBeNull();
    expect((spaceSceneEngine.fromUrl({}) as SpaceSceneExt).sensesFrame).toBeUndefined();
  });
});
