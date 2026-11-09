/**
 * Orbit camera: drei OrbitControls (damped) + chapter / preset / REFERENCE
 * moves and the ORBIT turntable (docs/08 §3, master-spec K).
 *
 *  - chapter / first load / URL: the chapter's own camera (or a URL `cam=`),
 *    else `views[view].camera`, else the inherited one
 *  - preset (`applyCameraPreset`, reason `preset`): always the stored camera,
 *    so a VIEW button lands on exactly its preset even when the current
 *    chapter has no camera of its own
 *  - snap: finish any move now
 *  - moves take 1.6 s (REFERENCE 2 s, see `ui.nextTweenMs`), easeInOut, with
 *    the offset from the target interpolated spherically (never through the model)
 *  - exercise mode (docs/06 动作模式数据手册): when an exercise comes on
 *    show (a beat without its own camera, a chapter, a deep link, an
 *    exercise chip), the exercise camera frames it: from the posture's
 *    direction (or `motion.camera`), backed off until the mannequin's sweep
 *    over the keys and the held equipment (`bridge.exerciseFrame`, measured
 *    by the MotionDriver a frame later) fills ~72 % of the frame height (less
 *    when presenting: the band above the caption card) or
 *    the width between the HUD side panels (`fitExerciseCamera`); a beat's
 *    own camera wins. Under an authored camera a standing lift with a long
 *    bar (`span`) backs off until the bar's ends stay off the side panels
 *    (`fitSpan`; not for presets, the reader's own choice of view)
 *  - ORBIT: slow turntable (one turn / 40 s) around the target until the user drags
 *  - dragging cancels any move and writes the camera back (`setCamera`, debounced),
 *    which the host shows as FREE CAMERA; a transition (e.g. the next
 *    presentation beat after free look) drops a write-back still pending
 *  - every transition reports when its move is over (`bridge.settledTransition`:
 *    the move ended, was cut short, or there was none); presentation beats wait on it
 *  - transitions are handled as the store emits them (a store subscription,
 *    not a render effect), so several in one tick each take effect in order:
 *    a preset followed by a mode snap ends on the preset's camera
 *  - cover (`ui.cover`, the HUD hidden outside the presentation): 0.8 s to
 *    `views.cover`, else to the current view re-fitted so the model's
 *    bounding sphere fills ~75 % of the stage width (re-fitted again when the
 *    stage resizes); when the HUD returns, 0.8 s back to the camera it left,
 *    unless the camera was moved meanwhile (a transition or a drag)
 *  - HUD framing (docs/67 §9): every chapter / beat / preset / REFERENCE /
 *    exercise view is composed for the 1920 × 1080 HUD layout and placed in
 *    the largest rectangle the HUD blocks leave free now (`stageFraming`: a
 *    pull-back plus a projection view offset, so the orbit target stays on the
 *    subject). When the blocks move (a panel folds, the reader opens, a
 *    resize: `bridge.hudLayout`), the view re-fits in 0.6 s, unless the reader
 *    has moved the camera since the last authored view (then it stays until
 *    the next chapter, beat or preset; ORBIT keeps its pose and only shifts).
 *    Not while presenting, under the cover or with the HUD stacked (phones):
 *    the plain aspect-fitted camera. `views.hudFrame` topics fit their named
 *    subjects instead (`fitCameraToHud`, re-fitted every frame)
 */
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import type { PerspectiveCamera } from 'three';
import { useStore } from 'zustand';
import type { SceneStore } from '../../../core/store';
import type { Chapter, OrbitCamera } from '../../../core/types';
import { isOrbitCamera, normalizeCamera } from '../../../core/camera';
import type { SpaceSceneExt } from '../../index';
import type { ViewPresets } from '../../schema';
import type { SpaceUiStore } from '../../ui';
import { hudFrameReady, stageReady, type StageBridge } from '../../bridge';
import {
  CAMERA_TWEEN_MS,
  COVER_TWEEN_MS,
  DEFAULT_FOV,
  fitCameraToAspect,
  fitSphereCamera,
  exerciseFraming,
  fitExerciseCamera,
  farPlane,
  fitSpan,
  ORBIT_PERIOD_S,
  roundCamera,
  transitionCamera,
  tweenCamera,
  viewDirection,
} from '../../lib/camera';
import { keepAnimating, MAX_DT, prefersReducedMotion } from './runtime';
import { DESIGN_ASPECT, DESIGN_STAGE, fitCameraToHud, stageFraming, type FrameBox } from '../../lib/hud-framing';
import { easeInOutCubic } from '../../lib/math';
import type { PartHandle } from './PartNode';
import type { OrbitSession } from '../../lib/sim/orbit-session';

type Controls = ComponentRef<typeof OrbitControls>;

function asOrbit(cam: unknown): OrbitCamera | null {
  const n = normalizeCamera(cam);
  return n && isOrbitCamera(n) ? n : null;
}

/** How long an exercise camera waits for the exercise's sweep (the glb may still be loading) before it takes the transition's own camera. */
const EXERCISE_SWEEP_WAIT_MS = 4000;
/** An authored camera closer than the default zoom floor lowers the floor to this share of its distance. */
const NEAR_SHARE = 0.7;

/** Every move ends on a defined field of view (REFERENCE narrows it). */
const withFov = (cam: OrbitCamera): OrbitCamera => ({ ...cam, fov: cam.fov ?? DEFAULT_FOV });
/** HUD re-fit (a panel folds, the stage resizes): docs/67 §2-4 "smooth", ~0.6 s. */
const REFIT_MS = 600;
const distanceOf = (c: OrbitCamera) => Math.hypot(c.position[0] - c.target[0], c.position[1] - c.target[1], c.position[2] - c.target[2]);
/** Move the camera along its view direction: `k` times the distance to the target. */
const dolly = (c: OrbitCamera, k: number): OrbitCamera =>
  k === 1 ? c : { ...c, position: [0, 1, 2].map((i) => c.target[i]! + (c.position[i]! - c.target[i]!) * k) as [number, number, number] };
/**
 * A view to place on the stage, recomputed whenever the HUD moves:
 * `design` = the camera for the design HUD layout (`DESIGN_ASPECT`),
 * `plain` = the aspect-fitted camera for this stage without HUD framing
 * (presenting, cover, phones, and `views.hudFrame` topics fit this one).
 */
type ViewSource = () => { design: OrbitCamera; plain: OrbitCamera } | null;
type PendingView = { id: number; instant: boolean } & (
  { source: ViewSource } | { exercise: string; fallback: ViewSource | null; t0: number }
);
type Shift = [number, number];

export function CameraRig({
  store,
  ui,
  bridge,
  chapters,
  views,
  sphere,
  minDistance,
  span,
  exerciseView,
  orbitSession,
  handles,
}: {
  handles: Map<string, PartHandle>;
  orbitSession?: OrbitSession | null;
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  bridge: StageBridge;
  chapters: readonly Chapter[];
  views: ViewPresets;
  /** The assembled model's bounding sphere (default cover camera). */
  sphere: { center: readonly number[]; radius: number; half?: readonly number[] };
  minDistance: number;
  /** The held bar's reach in the exercise with this id (standing lifts), or null. */
  span: (exercise: string) => { half: number; yaw: number } | null;
  /** The exercise camera's direction for this exercise (degrees; `yaw` the body's turn), or null (it cannot play). */
  exerciseView: (exercise: string) => { azimuth: number; elevation: number; fill: number | undefined; yaw: number } | null;
}) {
  const controls = useRef<Controls>(null);
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  // The live store: a frame drawn right after a stage resize runs before this component re-renders with the new size.
  const live = useThree((s) => s.get);
  const orbit = useStore(ui, (s) => s.orbit);
  // Orbit sims: the display scale and frame sizes the camera was last framed for (a scale change remaps the camera about the frame's centre).
  const orbitFrame = useRef({
    scale: orbitSession?.values[orbitSession.config.display.scale],
    radius: orbitSession?.display.radii.earth ?? 1,
    earthMoon: orbitSession ? Math.hypot(...orbitSession.display.centres.moon.map((v, i) => v - orbitSession.display.centres.earth[i]!)) : 1,
    earthSun: orbitSession ? Math.hypot(...orbitSession.display.origin) || orbitSession.config.display.schematic.earthOrbitM : 1,
    transition: store.getState().transition.id,
  });
  // Latest props for the store subscriptions.
  const props = useRef({ chapters, views, sphere, span, exerciseView });
  props.current = { chapters, views, sphere, span, exerciseView };
  /** An exercise camera waiting for the exercise's sweep: the transition, the exercise, jump or fly, where to go if no sweep comes. */
  const pending = useRef<PendingView | null>(null);
  /** The exercise on show at the last transition. */
  const shownExercise = useRef<string | null>(null);
  /** The exercise the exercise camera framed last, and the stored camera then (unchanged since: keep framing it). */
  const framed = useRef<{ exercise: string; stored: unknown } | null>(null);

  const tween = useRef<{ from: OrbitCamera; to: OrbitCamera; start: number; ms: number; id: number; cover?: boolean } | null>(null);
  const last = useRef<number | null>(null);
  /** While the cover camera is on: the camera to go back to, and the transition it belongs to. */
  const coverSave = useRef<{ camera: OrbitCamera; transition: number; shift: Shift } | null>(null);
  const user = useRef({ active: false, dragging: false, timer: null as ReturnType<typeof setTimeout> | null });
  const spin = useRef(0);
  // Always re-fit from the authored camera, never from the last adjusted pose.
  const hudCamera = useRef<OrbitCamera | null>(null);
  const hudFit = useRef<{ input: string; camera: OrbitCamera } | undefined>(undefined);
  const fitHud = (cam: OrbitCamera): OrbitCamera => {
    if (!views.hudFrame || !stageReady(bridge) || !bridge.freeStage || ui.getState().cover || user.current.active) return cam;
    // Fit to the stage as it is now (the HUD → presentation resize), not as of the last React render.
    const { width, height } = live().size;
    cam = fitCameraToAspect(cam, width / height);
    const boxes: FrameBox[] = views.hudFrame.parts.flatMap(id => {
      const h = handles.get(id);
      return h?.visible ? [{ center: [h.object.position.x + h.offset[0], h.object.position.y + h.offset[1], h.object.position.z + h.offset[2]] as [number,number,number], half: h.half, minRadiusPx: views.hudFrame?.primary?.part === id ? views.hudFrame.primary.minRadiusPx : undefined }] : [];
    });
    const input = JSON.stringify([cam,width,height,bridge.freeStage,bridge.hudPanels,boxes]);
    if (input !== hudFit.current?.input) hudFit.current = {
      input,
      camera: fitCameraToHud(cam, boxes, width, height, bridge.freeStage, { panels: bridge.hudPanels ?? [], previous: hudFit.current?.camera }),
    };
    return hudFit.current.camera;
  };

  /** The authored view on show (null: none yet, or the reader moved the camera since). */
  const source = useRef<ViewSource | null>(null);
  /** The reader has moved the camera since the last authored view: HUD changes leave it alone. */
  const free = useRef(false);
  /** The projection's view-offset shift now (shares of the stage, + right / up), and its move. */
  const shift = useRef<Shift>([0, 0]);
  const shiftMove = useRef<{ from: Shift; to: Shift; start: number; ms: number } | null>(null);
  /** The HUD framing's pull-back beyond the plain camera at the last placement (undone on write-back). */
  const extra = useRef(1);
  /** The HUD layout and stage size the view was last placed for ('' = not yet). */
  const seenLayout = useRef('');

  /** Where a view goes on the stage as it is now: the camera and the view-offset shift. */
  const place = (src: { design: OrbitCamera; plain: OrbitCamera }): { cam: OrbitCamera; shift: Shift } => {
    if (views.hudFrame) {
      extra.current = 1;
      bridge.framing = null;
      return { cam: fitHud(src.plain), shift: [0, 0] };
    }
    const s = ui.getState();
    // The stage as measured with the panels (R3F's size can lag a resize by a frame); the shift is a share of it.
    const [width, height] = bridge.hudStage ?? [live().size.width, live().size.height];
    const f = s.presenting || s.cover || bridge.hudStacked !== false || !bridge.hudPanels ? null
      : stageFraming(width, height, bridge.hudPanels, distanceOf(src.design) / distanceOf(src.plain));
    bridge.framing = f;
    const cam = f ? dolly(src.design, 1 / f.scale) : src.plain;
    extra.current = distanceOf(cam) / distanceOf(src.plain);
    return { cam, shift: f ? f.shift : [0, 0] };
  };

  /** Move the view offset to `to` over `ms` (0: now). */
  const moveShift = (to: Shift, ms: number) => {
    if (ms <= 0 || prefersReducedMotion()) {
      shiftMove.current = null;
      shift.current = to;
    } else shiftMove.current = { from: [...shift.current], to, start: performance.now(), ms };
  };

  /** Put the current shift on the projection (stage size from the live store: it may have just changed). */
  const applyShift = () => {
    const { width: w, height: h } = live().size;
    const [sx, sy] = shift.current;
    const v = camera.view;
    if (Math.abs(sx) < 1e-5 && Math.abs(sy) < 1e-5) {
      if (v?.enabled) camera.clearViewOffset();
    } else if (!v?.enabled || v.fullWidth !== w || v.fullHeight !== h || Math.abs(v.offsetX + sx * w) > 1e-3 || Math.abs(v.offsetY - sy * h) > 1e-3) {
      camera.setViewOffset(w, h, -sx * w, sy * h, w, h);
    }
  };

  /** The HUD moved: re-fit the authored view on show (0.6 s), unless the reader has moved the camera. */
  const refit = (instant: boolean) => {
    if (free.current || pending.current || user.current.active || ui.getState().cover) return;
    const src = source.current?.();
    if (!src) return;
    const placed = place(src);
    if (views.hudFrame) hudCamera.current = src.plain;
    const ms = instant ? 0 : REFIT_MS;
    if (ui.getState().orbit) {
      moveShift(placed.shift, ms);
      invalidate();
      return;
    }
    relax(placed.cam);
    const tw = tween.current;
    if (tw && !tw.cover) {
      tw.to = placed.cam;
      if (shiftMove.current) shiftMove.current.to = placed.shift;
      else moveShift(placed.shift, Math.max(0, tw.start + tw.ms - performance.now()));
    } else if (instant || prefersReducedMotion()) {
      tween.current = null;
      apply(placed.cam);
      moveShift(placed.shift, 0);
    } else {
      tween.current = { from: current(), to: placed.cam, start: performance.now(), ms: REFIT_MS, id: store.getState().transition.id };
      moveShift(placed.shift, REFIT_MS);
    }
    invalidate();
  };

  const current = (): OrbitCamera => {
    const c = controls.current;
    const t = c ? c.target : { x: 0, y: 0, z: 0 };
    return { position: [camera.position.x, camera.position.y, camera.position.z], target: [t.x, t.y, t.z], fov: camera.fov };
  };

  useEffect(() => {
    const far = farPlane(minDistance / 0.9);
    if (camera.far !== far) {
      camera.far = far;
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, invalidate, minDistance]);

  useEffect(() => {
    bridge.liveCamera = current;
    bridge.viewCamera = () => ({ ...fitCameraToAspect(dolly(current(), 1 / extra.current), camera.aspect, true), fov: camera.fov });
    return () => {
      bridge.liveCamera = () => null;
      bridge.viewCamera = () => null;
      bridge.framing = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, camera]);

  const apply = (cam: OrbitCamera) => {
    camera.position.set(...cam.position);
    if (cam.fov !== undefined && Math.abs(camera.fov - cam.fov) > 1e-3) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
    const c = controls.current;
    if (c) {
      c.target.set(...cam.target);
      c.update();
    } else {
      camera.lookAt(...cam.target);
    }
  };

  /** Transition `id`'s camera move is over (or it had none). */
  const settle = (id: number) => {
    if (id <= bridge.settledTransition) return;
    bridge.settledTransition = id;
    for (const listener of [...bridge.settleListeners]) listener();
  };

  /**
   * The zoom floor: 0.9 × the model radius by default, lowered to 70 % of an
   * authored camera's distance when one comes closer (a chapter, beat or
   * preset framing a magnified group or a small exhibit), so OrbitControls
   * does not push it back out; a wider camera restores the default.
   */
  const [floor, setFloor] = useState(minDistance);
  const relax = (cam: OrbitCamera) => {
    const d = Math.hypot(cam.position[0] - cam.target[0], cam.position[1] - cam.target[1], cam.position[2] - cam.target[2]);
    const next = Math.min(minDistance, d * NEAR_SHARE);
    if (controls.current) controls.current.minDistance = next;
    setFloor(next);
  };

  /** Fly (or jump) to an authored view, placed for the HUD as it is now; it stays the view to re-fit until the next one or a drag. */
  const moveTo = (src: ViewSource, instant: boolean, id: number) => {
    // Mesh stand-ins and first-frame part positions must never choose the shot.
    // StageMark wakes the demand loop after its GPU fence; ready stays false
    // until this queued transition has actually been framed.
    if (views.hudFrame && !hudFrameReady(bridge)) {
      pending.current = { source: src, instant, id };
      bridge.hudSettled = false;
      invalidate();
      return;
    }
    hudFit.current = undefined;
    const s = src();
    if (!s) {
      settle(id);
      return;
    }
    source.current = src;
    free.current = false;
    hudCamera.current = views.hudFrame ? s.plain : null;
    const { cam: target, shift: to } = place(s);
    relax(target);
    const hint = ui.getState().nextTweenMs;
    if (hint !== null) ui.setState({ nextTweenMs: null });
    if (instant || prefersReducedMotion()) {
      tween.current = null;
      apply(target);
      moveShift(to, 0);
      settle(id);
    } else {
      const ms = hint ?? CAMERA_TWEEN_MS;
      tween.current = { from: current(), to: target, start: performance.now(), ms, id };
      moveShift(to, ms);
    }
    invalidate();
  };

  const onTransition = () => {
    const state = store.getState();
    const transitionId = state.transition.id;
    const first = last.current === null;
    if (last.current === transitionId) return;
    last.current = transitionId;
    const { reason, instant } = state.transition;
    // A snap makes the waiting view jump; any other transition replaces it.
    if (pending.current) {
      if (reason === 'snap') {
        pending.current.instant = true;
        if ('source' in pending.current) pending.current.id = transitionId;
        else settle(transitionId);
        return;
      }
      settle(pending.current.id);
      pending.current = null;
    }
    const beat = ui.getState().beatCamera;
    if (beat !== null) ui.setState({ beatCamera: null });
    const exercise = state.exercise?.id ?? null;
    const exerciseChanged = exercise !== shownExercise.current;
    shownExercise.current = exercise;

    if (reason === 'snap') {
      if (tween.current) {
        apply(tween.current.to);
        const id = tween.current.id;
        tween.current = null;
        settle(id);
        invalidate();
      }
      settle(transitionId);
      return;
    }
    // Any other transition places the camera itself: nothing to go back to after the cover, no drag to write back.
    coverSave.current = null;
    const u = user.current;
    if (u.timer && !u.dragging) {
      clearTimeout(u.timer);
      u.timer = null;
      u.active = false;
    }
    if (reason === 'chapter' || reason === 'url') ui.setState({ orbit: false, reference: null });
    const { chapters: list, views: presets } = props.current;
    const chapter = list.find((c) => c.id === state.chapter) ?? null;
    const target = transitionCamera({
      reason,
      stored: asOrbit(state.camera),
      baseline: asOrbit(state.chapterTarget(state.chapter).camera),
      own: asOrbit(chapter?.state.camera),
      view: state.view,
      views: presets,
    });
    const authored = target ? withFov(target) : null;
    const bar = authored && reason !== 'preset' && state.exercise ? props.current.span(state.exercise.id) : null;
    // The authored view: plain = aspect-fitted for this stage (hudFrame topics: as authored, fitHud fits it), design = for the design HUD layout.
    const fitted: ViewSource | null = authored && (() => {
      const aspect = liveAspect();
      const plain = views.hudFrame ? authored : fitCameraToAspect(authored, aspect);
      const design = fitCameraToAspect(authored, DESIGN_ASPECT);
      return { plain: bar ? fitSpan(plain, bar, aspect) : plain, design: bar ? fitSpan(design, bar, DESIGN_ASPECT) : design };
    });
    // The exercise camera: an exercise came on show, or a beat without its own camera shows one.
    // (Also when the exercise camera framed this exercise and the stored camera has not changed since: a phase change, a selection.)
    const kept = exercise !== null && framed.current?.exercise === exercise && framed.current.stored === state.camera;
    if (exercise && reason !== 'preset' && beat !== 'authored' && (exerciseChanged || beat === 'auto' || kept)) {
      if (frameExercise(exercise, transitionId, first || instant, fitted, state.camera)) return;
    }
    framed.current = null;
    if (fitted) moveTo(fitted, first || instant, transitionId);
    else settle(transitionId);
  };

  /** Wait for the exercise's sweep, then frame it (false: the exercise cannot play here). */
  const frameExercise = (exercise: string, id: number, instant: boolean, fallback: ViewSource | null, stored: unknown): boolean => {
    if (!props.current.exerciseView(exercise)) return false;
    pending.current = { id, exercise, instant, fallback, t0: performance.now() };
    framed.current = { exercise, stored };
    invalidate();
    return true;
  };

  /** The stage's own aspect (the camera's may lag a resize by a frame). */
  const liveAspect = () => {
    const { width, height } = live().size;
    return width > 0 && height > 0 ? width / height : camera.aspect;
  };

  /** The exercise camera for `exercise` once its sweep is measured (for this stage, and for the design HUD layout), else null. */
  const exerciseCamera: (exercise: string) => ReturnType<ViewSource> = (exercise) => {
    const sweep = bridge.exerciseFrame;
    const view = props.current.exerciseView(exercise);
    if (!sweep || sweep.id !== exercise || !view) return null;
    const { height } = live().size;
    const dir = viewDirection(view.azimuth, view.elevation, view.yaw);
    // Presenting: the caption card covers the bottom of the stage, so the figure goes up by its height.
    const card = ui.getState().presenting ? document.querySelector('[data-hud-panel="present"]')?.getBoundingClientRect().height ?? 0 : 0;
    const plain = fitExerciseCamera(sweep.points, dir, liveAspect(), exerciseFraming(card, height, view.fill));
    const design = fitExerciseCamera(sweep.points, dir, DESIGN_ASPECT, exerciseFraming(0, DESIGN_STAGE.height, view.fill));
    return plain && design ? { plain, design } : null;
  };

  /** Where the cover camera is for the current stage. */
  const coverCamera = (from: OrbitCamera): OrbitCamera => {
    const { views: presets, sphere: s } = props.current;
    return presets.cover ? fitCameraToAspect(withFov(presets.cover), camera.aspect) : fitSphereCamera(withFov(from), s.center, s.radius, camera.aspect, undefined, s.half);
  };

  const onCover = (on: boolean) => {
    const id = store.getState().transition.id;
    if (on) {
      // Go back to where the camera was heading, not where a running move happens to be.
      const back = tween.current && !tween.current.cover ? tween.current.to : current();
      coverSave.current = { camera: back, transition: id, shift: shiftMove.current ? shiftMove.current.to : shift.current };
      moveCover(coverCamera(back), [0, 0]);
      return;
    }
    const save = coverSave.current;
    coverSave.current = null;
    if (!save || save.transition !== id) return;
    moveCover(save.camera, save.shift);
  };

  const moveCover = (to: OrbitCamera, toShift: Shift) => {
    relax(to);
    const id = store.getState().transition.id;
    if (prefersReducedMotion()) {
      tween.current = null;
      apply(to);
    } else {
      tween.current = { from: current(), to, start: performance.now(), ms: COVER_TWEEN_MS, id, cover: true };
    }
    moveShift(toShift, COVER_TWEEN_MS);
    invalidate();
  };

  // Transitions as the store emits them (in order, even several in one tick); the first one on mount is instant.
  useEffect(() => {
    onTransition();
    const offStore = store.subscribe((s, prev) => {
      if (s.transition.id !== prev.transition.id) onTransition();
      else if (s.exercise?.id !== prev.exercise?.id) {
        // An exercise chip (a patch, no transition): frame the new exercise.
        shownExercise.current = s.exercise?.id ?? null;
        if (s.exercise && (!pending.current || 'source' in pending.current)) frameExercise(s.exercise.id, s.transition.id, false, null, s.camera);
      }
    });
    if (ui.getState().cover) onCover(true);
    const offUi = ui.subscribe((s, prev) => {
      if (s.cover !== prev.cover) onCover(s.cover);
    });
    return () => {
      offStore();
      offUi();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, ui]);

  // The stage changes size as the HUD hides or shows: re-fit the cover camera to it.
  useEffect(() => {
    const save = coverSave.current;
    if (!save || !ui.getState().cover || save.transition !== store.getState().transition.id) return;
    const to = coverCamera(save.camera);
    const tw = tween.current;
    if (tw?.cover) tw.to = to;
    else moveCover(to, [0, 0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useEffect(() => {
    if (orbit) {
      spin.current = 0;
      invalidate();
    }
  }, [orbit, invalidate]);

  useFrame((state, delta) => {
    const waitingHud = pending.current;
    if (waitingHud && 'source' in waitingHud && !ui.getState().cover && hudFrameReady(bridge)) {
      pending.current = null;
      moveTo(waitingHud.source, waitingHud.instant, waitingHud.id);
    }
    // The HUD moved (measured by Model3DStage) or the stage resized: re-fit; the first measurement places the view at once.
    const layout = bridge.hudLayout ? `${bridge.hudLayout}:${live().size.width}x${live().size.height}` : '';
    if (layout !== seenLayout.current) {
      // Until the HUD has settled after loading, the view is placed at once, not flown.
      const first = seenLayout.current === '' || !bridge.hudSettled;
      seenLayout.current = layout;
      refit(first);
    }
    // Settled: the measured HUD is current and the view is placed for it (`__atlas.ready` waits for this).
    if (!bridge.hudSettled && layout !== '' && !bridge.hudPending && !pending.current && (!views.hudFrame || stageReady(bridge))) bridge.hudSettled = true;
    // Part writers have now applied this snapshot, including the first frame of a direct link.
    if (hudCamera.current && !pending.current && stageReady(bridge) && !ui.getState().cover && !user.current.active && !free.current && !orbit) {
      const fitted = fitHud(hudCamera.current);
      if (tween.current && !tween.current.cover) tween.current.to = fitted;
      else if (!tween.current) apply(fitted);
    }
    const wait = pending.current;
    if (wait && 'exercise' in wait) {
      const cam = exerciseCamera(wait.exercise);
      if (cam || performance.now() - wait.t0 > EXERCISE_SWEEP_WAIT_MS) {
        pending.current = null;
        const exercise = wait.exercise;
        const to: ViewSource | null = cam ? () => exerciseCamera(exercise) : wait.fallback;
        if (to) moveTo(to, wait.instant, wait.id);
        else settle(wait.id);
      } else keepAnimating(state.invalidate);
    }
    const sm = shiftMove.current;
    if (sm) {
      const k = Math.min(1, (performance.now() - sm.start) / sm.ms);
      const e = easeInOutCubic(k);
      shift.current = [sm.from[0] + (sm.to[0] - sm.from[0]) * e, sm.from[1] + (sm.to[1] - sm.from[1]) * e];
      if (k >= 1) shiftMove.current = null;
      keepAnimating(state.invalidate);
    }
    applyShift();
    const tw = tween.current;
    if (tw) {
      const k = Math.min(1, (performance.now() - tw.start) / tw.ms);
      apply(tweenCamera(tw.from, tw.to, k));
      if (k >= 1) {
        tween.current = null;
        settle(tw.id);
      }
      keepAnimating(state.invalidate);
    } else if (orbit && !user.current.dragging) {
      // Ease the turntable in over ~1 s; rotate about the vertical through the target.
      const dt = Math.min(delta, MAX_DT);
      spin.current = Math.min(1, spin.current + dt);
      const c = controls.current;
      if (c) {
        const a = ((Math.PI * 2) / ORBIT_PERIOD_S) * dt * spin.current;
        const x = camera.position.x - c.target.x;
        const z = camera.position.z - c.target.z;
        camera.position.x = c.target.x + x * Math.cos(a) + z * Math.sin(a);
        camera.position.z = c.target.z - x * Math.sin(a) + z * Math.cos(a);
        c.update();
      }
      keepAnimating(state.invalidate);
    }
    if (orbitSession) {
      const frame = orbitFrame.current,
        scale = orbitSession.values[orbitSession.config.display.scale],
        id = store.getState().transition.id;
      const earthMoon = Math.hypot(...orbitSession.display.centres.moon.map((v, i) => v - orbitSession.display.centres.earth[i]!));
      const earthSun = Math.hypot(...orbitSession.display.centres.sun.map((v, i) => v - orbitSession.display.centres.earth[i]!));
      if (frame.scale !== scale && frame.transition === id) {
        const lab = orbitSession.snapshot.lab,
          ratio =
            lab === 'day' || lab === 'local-year'
              ? orbitSession.display.radii.earth / frame.radius
              : lab === 'coupled' || lab === 'year'
                ? earthSun / frame.earthSun
                : earthMoon / frame.earthMoon;
        const cam = hudCamera.current ?? current();
        const centre = lab === 'coupled' || lab === 'year' ? orbitSession.display.centres.sun : orbitSession.display.centres.earth;
        const mapped: OrbitCamera = {
          ...cam,
          position: cam.position.map((v, i) => centre[i]! + (v - centre[i]!) * ratio) as [number, number, number],
          target: cam.target.map((v, i) => centre[i]! + (v - centre[i]!) * ratio) as [number, number, number],
        };
        relax(mapped);
        if (controls.current) controls.current.maxDistance = Math.max(minDistance * 20, Math.hypot(...mapped.position) * 4);
        hudFit.current = undefined;
        apply(hudCamera.current ? fitHud(mapped) : mapped);
        if (hudCamera.current) hudCamera.current = mapped;
        // The view to re-fit scales with the display about the same centre.
        const prev = source.current;
        const remap = (c: OrbitCamera): OrbitCamera => ({
          ...c,
          position: c.position.map((v, i) => centre[i]! + (v - centre[i]!) * ratio) as [number, number, number],
          target: c.target.map((v, i) => centre[i]! + (v - centre[i]!) * ratio) as [number, number, number],
        });
        if (prev) source.current = () => {
          const s = prev();
          return s && { design: remap(s.design), plain: remap(s.plain) };
        };
      }
      frame.scale = scale;
      frame.radius = orbitSession.display.radii.earth;
      frame.earthMoon = earthMoon;
      frame.earthSun = earthSun;
      frame.transition = id;
      const near = Math.min(0.01, orbitSession.display.radii.earth * 0.02),
        far = Math.max(1000, earthSun * 4);
      if (camera.near !== near || camera.far !== far) {
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
    }
    const t = controls.current?.target;
    if (t) bridge.cameraDistance = camera.position.distanceTo(t);
  });

  useEffect(
    () => () => {
      if (user.current.timer) clearTimeout(user.current.timer);
    },
    [],
  );

  const writeBack = () => {
    const u = user.current;
    u.timer = null;
    store.getState().setCamera(roundCamera(fitCameraToAspect(dolly(current(), 1 / extra.current), camera.aspect, true)));
    if (!u.dragging) u.active = false;
  };

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.09}
      minDistance={floor}
      maxDistance={orbitSession ? 1000 : minDistance * 20}
      zoomSpeed={0.8}
      maxPolarAngle={Math.PI * 0.82}
      onStart={() => {
        if (pending.current && 'source' in pending.current) {
          settle(pending.current.id);
          pending.current = null;
        }
        if (tween.current) settle(tween.current.id);
        tween.current = null;
        coverSave.current = null;
        hudCamera.current = null;
        free.current = true;
        if (ui.getState().orbit) ui.setState({ orbit: false });
        user.current.active = true;
        user.current.dragging = true;
      }}
      onEnd={() => {
        user.current.dragging = false;
      }}
      onChange={() => {
        const u = user.current;
        if (!u.active) return;
        if (u.timer) clearTimeout(u.timer);
        u.timer = setTimeout(writeBack, 400);
      }}
    />
  );
}
