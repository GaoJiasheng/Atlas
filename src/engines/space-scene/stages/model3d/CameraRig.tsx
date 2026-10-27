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
import type { StageBridge } from '../../bridge';
import {
  CAMERA_TWEEN_MS,
  cameraFar,
  COVER_TWEEN_MS,
  DEFAULT_FOV,
  fitCameraToAspect,
  fitSphereCamera,
  exerciseFraming,
  fitExerciseCamera,
  fitSpan,
  MAX_DISTANCE_SHARE,
  ORBIT_PERIOD_S,
  roundCamera,
  transitionCamera,
  tweenCamera,
  viewDirection,
} from '../../lib/camera';
import { keepAnimating, MAX_DT, prefersReducedMotion } from './runtime';

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
}: {
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
  const stageSize = useRef(size);
  stageSize.current = size;
  const orbit = useStore(ui, (s) => s.orbit);
  // Latest props for the store subscriptions.
  const props = useRef({ chapters, views, sphere, span, exerciseView });
  props.current = { chapters, views, sphere, span, exerciseView };
  /** An exercise camera waiting for the exercise's sweep: the transition, the exercise, jump or fly, where to go if no sweep comes. */
  const pending = useRef<{ id: number; exercise: string; instant: boolean; fallback: OrbitCamera | null; t0: number } | null>(null);
  /** The exercise on show at the last transition. */
  const shownExercise = useRef<string | null>(null);
  /** The exercise the exercise camera framed last, and the stored camera then (unchanged since: keep framing it). */
  const framed = useRef<{ exercise: string; stored: unknown } | null>(null);

  const tween = useRef<{ from: OrbitCamera; to: OrbitCamera; start: number; ms: number; id: number; cover?: boolean } | null>(null);
  const last = useRef<number | null>(null);
  /** While the cover camera is on: the camera to go back to, and the transition it belongs to. */
  const coverSave = useRef<{ camera: OrbitCamera; transition: number } | null>(null);
  const user = useRef({ active: false, dragging: false, timer: null as ReturnType<typeof setTimeout> | null });
  const spin = useRef(0);

  const current = (): OrbitCamera => {
    const c = controls.current;
    const t = c ? c.target : { x: 0, y: 0, z: 0 };
    return { position: [camera.position.x, camera.position.y, camera.position.z], target: [t.x, t.y, t.z], fov: camera.fov };
  };

  // A large model (111 m) must not be clipped by the default far plane at its farthest zoom.
  useEffect(() => {
    const far = cameraFar(minDistance, sphere.radius);
    if (camera.far !== far) {
      camera.far = far;
      camera.updateProjectionMatrix();
      invalidate();
    }
  }, [camera, invalidate, minDistance, sphere.radius]);

  useEffect(() => {
    bridge.liveCamera = current;
    return () => {
      bridge.liveCamera = () => null;
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

  const moveTo = (target: OrbitCamera, instant: boolean, id: number) => {
    relax(target);
    const hint = ui.getState().nextTweenMs;
    if (hint !== null) ui.setState({ nextTweenMs: null });
    if (instant || prefersReducedMotion()) {
      tween.current = null;
      apply(target);
      settle(id);
    } else {
      tween.current = { from: current(), to: target, start: performance.now(), ms: hint ?? CAMERA_TWEEN_MS, id };
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
    // A snap makes an exercise camera still waiting for its sweep jump; any other transition replaces it.
    if (pending.current) {
      if (reason === 'snap') {
        pending.current.instant = true;
        settle(transitionId);
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
    const fitted = target ? fitCameraToAspect(withFov(target), camera.aspect) : null;
    // The exercise camera: an exercise came on show, or a beat without its own camera shows one.
    // (Also when the exercise camera framed this exercise and the stored camera has not changed since: a phase change, a selection.)
    const kept = exercise !== null && framed.current?.exercise === exercise && framed.current.stored === state.camera;
    if (exercise && reason !== 'preset' && beat !== 'authored' && (exerciseChanged || beat === 'auto' || kept)) {
      if (frameExercise(exercise, transitionId, first || instant, fitted, state.camera)) return;
    }
    framed.current = null;
    if (fitted) {
      const bar = reason !== 'preset' && state.exercise ? props.current.span(state.exercise.id) : null;
      moveTo(bar ? fitSpan(fitted, bar, camera.aspect) : fitted, first || instant, transitionId);
    } else settle(transitionId);
  };

  /** Wait for the exercise's sweep, then frame it (false: the exercise cannot play here). */
  const frameExercise = (exercise: string, id: number, instant: boolean, fallback: OrbitCamera | null, stored: unknown): boolean => {
    if (!props.current.exerciseView(exercise)) return false;
    pending.current = { id, exercise, instant, fallback, t0: performance.now() };
    framed.current = { exercise, stored };
    invalidate();
    return true;
  };

  /** The exercise camera for `exercise` once its sweep is measured, else null. */
  const exerciseCamera = (exercise: string): OrbitCamera | null => {
    const sweep = bridge.exerciseFrame;
    const view = props.current.exerciseView(exercise);
    if (!sweep || sweep.id !== exercise || !view) return null;
    // The stage's own aspect (the camera's may lag a resize by a frame).
    const { width, height } = stageSize.current;
    const aspect = width > 0 && height > 0 ? width / height : camera.aspect;
    // Presenting: the caption card covers the bottom of the stage, so the figure goes up by its height.
    const card = ui.getState().presenting ? document.querySelector('[data-hud-panel="present"]')?.getBoundingClientRect().height ?? 0 : 0;
    return fitExerciseCamera(sweep.points, viewDirection(view.azimuth, view.elevation, view.yaw), aspect, exerciseFraming(card, height, view.fill));
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
      coverSave.current = { camera: back, transition: id };
      moveCover(coverCamera(back));
      return;
    }
    const save = coverSave.current;
    coverSave.current = null;
    if (!save || save.transition !== id) return;
    moveCover(save.camera);
  };

  const moveCover = (to: OrbitCamera) => {
    relax(to);
    const id = store.getState().transition.id;
    if (prefersReducedMotion()) {
      tween.current = null;
      apply(to);
    } else {
      tween.current = { from: current(), to, start: performance.now(), ms: COVER_TWEEN_MS, id, cover: true };
    }
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
        if (s.exercise && !pending.current) frameExercise(s.exercise.id, s.transition.id, false, null, s.camera);
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
    else moveCover(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // The stage changes size (the HUD hides for the presentation): re-fit an exercise camera that is still on show.
  useEffect(() => {
    const f = framed.current;
    if (!f || pending.current || user.current.active || ui.getState().cover || ui.getState().orbit || f.stored !== store.getState().camera || store.getState().exercise?.id !== f.exercise) return;
    const to = exerciseCamera(f.exercise);
    if (!to) return;
    const tw = tween.current;
    if (tw && !tw.cover) tw.to = to;
    else if (!tw) {
      apply(to);
      invalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useEffect(() => {
    if (orbit) {
      spin.current = 0;
      invalidate();
    }
  }, [orbit, invalidate]);

  useFrame((state, delta) => {
    const wait = pending.current;
    if (wait) {
      const cam = exerciseCamera(wait.exercise);
      if (cam || performance.now() - wait.t0 > EXERCISE_SWEEP_WAIT_MS) {
        pending.current = null;
        const to = cam ?? wait.fallback;
        if (to) moveTo(to, wait.instant, wait.id);
        else settle(wait.id);
      } else keepAnimating(state.invalidate);
    }
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
    store.getState().setCamera(roundCamera(fitCameraToAspect(current(), camera.aspect, true)));
    if (!u.dragging) u.active = false;
  };

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.09}
      minDistance={floor}
      maxDistance={minDistance * MAX_DISTANCE_SHARE}
      zoomSpeed={0.8}
      maxPolarAngle={Math.PI * 0.82}
      onStart={() => {
        if (tween.current) settle(tween.current.id);
        tween.current = null;
        coverSave.current = null;
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
