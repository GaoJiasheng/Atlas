/**
 * A beat's scene (docs/06 「SpaceScene · 节拍」): what the chapter axis, the
 * `,` / `.` keys, the presentation and a deep link with `b` put on the stage
 * for one beat, and the URL baseline at that beat. Pure; the view (View.tsx)
 * supplies the chapter target and the cameras.
 */
import type { OrbitCamera, SceneSnapshot } from '../../core/types';
import type { Beat, SpaceBeatSpec } from '../../core/presentation';
import { exerciseOf, highlightOf, type SpaceSceneExt } from '../index';
import type { SpaceView } from '../schema';

export type SpaceSnapshot = SceneSnapshot<SpaceSceneExt>;

/**
 * Put the stage in a beat's state: its chapter's target plus the beat's
 * view / part / explode / run / cutaway / layers / hide / pose / ghost /
 * exercise / highlight / sites / try-it values and its camera (an orbit
 * camera, a named preset's camera, else `chapterCamera(view)`).
 */
export function beatScene(
  b: Beat<SpaceBeatSpec>,
  target: SpaceSnapshot,
  presets: readonly { id: string; camera?: OrbitCamera }[],
  chapterCamera: (view: SpaceView) => OrbitCamera,
): SpaceSnapshot {
  const spec: SpaceBeatSpec | undefined = b.spec;
  const view = spec?.view ?? target.view;
  const preset = typeof spec?.camera === 'string' ? presets.find((p) => p.id === spec.camera)?.camera : undefined;
  const own = typeof spec?.camera === 'object' ? spec.camera : undefined;
  return {
    ...target,
    ...(target.orbitTime !== undefined ? { orbitTime: null } : {}),
    view,
    ...(spec?.part !== undefined ? { part: spec.part } : {}),
    ...(spec?.explode !== undefined ? { explode: spec.explode } : {}),
    ...(spec?.run !== undefined ? { run: spec.run } : {}),
    ...(spec?.cutaway !== undefined ? { cutaway: spec.cutaway } : {}),
    ...(spec?.layers ? { layers: [...spec.layers] } : {}),
    hidden: spec?.hide ? [...spec.hide] : target.hidden,
    pose: spec?.pose !== undefined ? spec.pose : target.pose,
    ghosted: spec?.ghost ? [...spec.ghost] : target.ghosted,
    exercise: spec?.exercise !== undefined ? exerciseOf(spec.exercise) : target.exercise,
    tints: spec?.highlight !== undefined ? highlightOf(spec.highlight) : target.tints,
    sites: spec?.sites ? [...spec.sites] : target.sites,
    demo: null,
    beat: b.index,
    // Try-it values: the chapter's, then the beat's (not cumulative across beats).
    sim: { ...target.sim, ...(spec?.sim?.set ?? {}) },
    camera: own ?? preset ?? chapterCamera(view),
  };
}

/**
 * A deep link with `b`: the beat's fields the link did not set itself
 * (`linked`: the store fields of `transition.fields`). The link wins field by
 * field: an explicit `sim=` keeps its values, a `cam=` its camera; everything
 * else (try-it values, view, layers, camera, hide, ghost …) is the beat's, as
 * the chapter axis would show it.
 */
export function linkedBeatPatch(scene: SpaceSnapshot, linked: Iterable<string>): Partial<SpaceSnapshot> {
  const skip = new Set<string>(['chapter', 'beat', ...linked]);
  return Object.fromEntries(Object.entries(scene).filter(([key]) => !skip.has(key))) as Partial<SpaceSnapshot>;
}

/**
 * The URL baseline at a beat: the beat's scene, so a link drops only what
 * opening `?ch=<chapter>&b=<n>` brings back; `beat` stays the chapter
 * target's, so `b` itself stays in the link.
 */
export function beatBaseline(scene: SpaceSnapshot, target: SpaceSnapshot): SpaceSnapshot {
  return { ...scene, beat: target.beat };
}
