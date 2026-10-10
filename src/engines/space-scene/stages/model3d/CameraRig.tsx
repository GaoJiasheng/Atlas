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
 *  - ORBIT: slow turntable (one turn / 40 s) around the target until the user drags
 *  - dragging cancels any move and writes the camera back (`setCamera`, debounced),
 *    which the host shows as FREE CAMERA
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
import { useEffect, useRef, type ComponentRef } from 'react';
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
  COVER_TWEEN_MS,
  DEFAULT_FOV,
  fitCameraToAspect,
  fitSphereCamera,
  ORBIT_PERIOD_S,
  roundCamera,
  transitionCamera,
  tweenCamera,
} from '../../lib/camera';
import { keepAnimating, MAX_DT, prefersReducedMotion } from './runtime';

type Controls = ComponentRef<typeof OrbitControls>;

function asOrbit(cam: unknown): OrbitCamera | null {
  const n = normalizeCamera(cam);
  return n && isOrbitCamera(n) ? n : null;
}

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
}: {
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  bridge: StageBridge;
  chapters: readonly Chapter[];
  views: ViewPresets;
  /** The assembled model's bounding sphere (default cover camera). */
  sphere: { center: readonly number[]; radius: number };
  minDistance: number;
}) {
  const controls = useRef<Controls>(null);
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const orbit = useStore(ui, (s) => s.orbit);
  // Latest props for the store subscriptions.
  const props = useRef({ chapters, views, sphere });
  props.current = { chapters, views, sphere };

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

  const moveTo = (target: OrbitCamera, instant: boolean, id: number) => {
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
    // Any other transition places the camera itself: nothing to go back to after the cover.
    coverSave.current = null;
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
    if (target) moveTo(fitCameraToAspect(withFov(target), camera.aspect), first || instant, transitionId);
    else settle(transitionId);
  };

  /** Where the cover camera is for the current stage. */
  const coverCamera = (from: OrbitCamera): OrbitCamera => {
    const { views: presets, sphere: s } = props.current;
    return presets.cover ? fitCameraToAspect(withFov(presets.cover), camera.aspect) : fitSphereCamera(withFov(from), s.center, s.radius, camera.aspect);
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

  useEffect(() => {
    if (orbit) {
      spin.current = 0;
      invalidate();
    }
  }, [orbit, invalidate]);

  useFrame((state, delta) => {
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
      minDistance={minDistance}
      maxDistance={minDistance * 20}
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
