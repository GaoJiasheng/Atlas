/**
 * Orbit camera: drei OrbitControls (damped) + chapter/view camera moves.
 *
 *  - on `transition.id` change: go to the target camera (explicit chapter/URL
 *    camera, else `views[view].camera`, else inherited), tweened over ~800 ms
 *    unless `transition.instant`
 *  - on a user view switch (no transition): tween to that view's preset if any
 *  - user orbiting writes the camera back with `setCamera` (debounced)
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
import { CAMERA_TWEEN_MS, fitCameraToAspect, resolveTargetCamera, roundCamera, tweenCamera } from '../../lib/camera';
import { keepAnimating, prefersReducedMotion } from './runtime';

type Controls = ComponentRef<typeof OrbitControls>;

const close = (a: readonly number[], b: readonly number[]) => a.every((v, i) => Math.abs(v - (b[i] ?? 0)) < 1e-3);

function sameCamera(a: OrbitCamera | null, b: OrbitCamera | null): boolean {
  if (!a || !b) return a === b;
  return close(a.position, b.position) && close(a.target, b.target);
}

function asOrbit(cam: unknown): OrbitCamera | null {
  const n = normalizeCamera(cam);
  return n && isOrbitCamera(n) ? n : null;
}

export function CameraRig({
  store,
  chapters,
  views,
}: {
  store: SceneStore<SpaceSceneExt>;
  chapters: readonly Chapter[];
  views: ViewPresets;
}) {
  const controls = useRef<Controls>(null);
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const transitionId = useStore(store, (s) => s.transition.id);
  const view = useStore(store, (s) => s.view);

  const tween = useRef<{ from: OrbitCamera; to: OrbitCamera; start: number } | null>(null);
  const last = useRef<{ transitionId: number; view: string } | null>(null);
  const user = useRef({ active: false, dragging: false, timer: null as ReturnType<typeof setTimeout> | null });

  const current = (): OrbitCamera => {
    const c = controls.current;
    const t = c ? c.target : { x: 0, y: 0, z: 0 };
    return { position: [camera.position.x, camera.position.y, camera.position.z], target: [t.x, t.y, t.z], fov: camera.fov };
  };

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

  useEffect(() => {
    const state = store.getState();
    const prev = last.current;
    last.current = { transitionId, view };
    const isTransition = !prev || prev.transitionId !== transitionId;

    if (!isTransition) {
      // User switched the view: frame that view's preset if it has one.
      if (prev.view === view) return;
      const preset = views[view]?.camera;
      if (!preset) return;
      if (prefersReducedMotion()) {
        apply(fitCameraToAspect({ ...preset }, camera.aspect));
        invalidate();
        return;
      }
      tween.current = { from: current(), to: fitCameraToAspect({ ...preset }, camera.aspect), start: performance.now() };
      invalidate();
      return;
    }

    const chapter = chapters.find((c) => c.id === state.chapter) ?? null;
    const stored = asOrbit(state.camera);
    const baseline = asOrbit(state.chapterTarget(state.chapter).camera);
    const own = asOrbit(chapter?.state.camera);
    const explicit = !sameCamera(stored, baseline) ? stored : own ? stored : null;
    const target = fitCameraToAspect(
      resolveTargetCamera({ explicit, view: state.view, views, inherited: stored }),
      camera.aspect,
    );

    if (!prev || state.transition.instant || prefersReducedMotion()) {
      tween.current = null;
      apply(target);
    } else {
      tween.current = { from: current(), to: target, start: performance.now() };
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionId, view]);

  useFrame((state) => {
    const tw = tween.current;
    if (!tw) return;
    const k = Math.min(1, (performance.now() - tw.start) / CAMERA_TWEEN_MS);
    apply(tweenCamera(tw.from, tw.to, k));
    if (k >= 1) tween.current = null;
    else keepAnimating(state.invalidate);
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
      minDistance={1.2}
      maxDistance={24}
      zoomSpeed={0.8}
      maxPolarAngle={Math.PI * 0.82}
      onStart={() => {
        tween.current = null;
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
