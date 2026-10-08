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
  DEFAULT_FOV,
  fitCameraToAspect,
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
  minDistance,
}: {
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  bridge: StageBridge;
  chapters: readonly Chapter[];
  views: ViewPresets;
  minDistance: number;
}) {
  const controls = useRef<Controls>(null);
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const transitionId = useStore(store, (s) => s.transition.id);
  const orbit = useStore(ui, (s) => s.orbit);

  const tween = useRef<{ from: OrbitCamera; to: OrbitCamera; start: number; ms: number } | null>(null);
  const last = useRef<number | null>(null);
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

  const moveTo = (target: OrbitCamera, instant: boolean) => {
    const hint = ui.getState().nextTweenMs;
    if (hint !== null) ui.setState({ nextTweenMs: null });
    if (instant || prefersReducedMotion()) {
      tween.current = null;
      apply(target);
    } else {
      tween.current = { from: current(), to: target, start: performance.now(), ms: hint ?? CAMERA_TWEEN_MS };
    }
    invalidate();
  };

  useEffect(() => {
    const state = store.getState();
    const first = last.current === null;
    if (last.current === transitionId) return;
    last.current = transitionId;
    const { reason, instant } = state.transition;

    if (reason === 'snap') {
      if (tween.current) {
        apply(tween.current.to);
        tween.current = null;
        invalidate();
      }
      return;
    }
    if (reason === 'chapter' || reason === 'url') ui.setState({ orbit: false, reference: null });
    const chapter = chapters.find((c) => c.id === state.chapter) ?? null;
    const target = transitionCamera({
      reason,
      stored: asOrbit(state.camera),
      baseline: asOrbit(state.chapterTarget(state.chapter).camera),
      own: asOrbit(chapter?.state.camera),
      view: state.view,
      views,
    });
    if (target) moveTo(fitCameraToAspect(withFov(target), camera.aspect), first || instant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionId]);

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
      if (k >= 1) tween.current = null;
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
        tween.current = null;
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
