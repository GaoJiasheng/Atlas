/**
 * Stage → HUD bridge. The WebGL stage runs in its own React root (and its own
 * lazily loaded chunk with three.js); the HUD (leader labels, perf readout)
 * lives in the View. The stage writes plain numbers here every rendered
 * frame and calls the frame listeners; the HUD reads them and writes the DOM.
 * Nothing here allocates per frame and the View side never imports three.js.
 */
import type { OrbitCamera } from '../core/types';

/** Projected leader-label anchor of a part, in stage CSS pixels. */
export interface ScreenAnchor {
  x: number;
  y: number;
  /** In front of the camera and inside the viewport. */
  onScreen: boolean;
  /** Hidden behind another part (throttled raycast). */
  occluded: boolean;
  /** Part currently drawn (layers, isolate, fade). */
  shown: boolean;
  /** Distance camera → anchor, scene units. */
  depth: number;
  /** Rough on-screen radius of the part, stage pixels (labels keep clear of it). */
  r: number;
}

export interface StageStats {
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  fps: number | undefined;
  gpu: string | undefined;
  /** Drawing-buffer size, device pixels. */
  buffer: [number, number];
  /** `performance.now()` of the last rendered frame (idle detection). */
  lastFrame: number;
}

export interface StageBridge {
  /** Stage size in CSS pixels. */
  width: number;
  height: number;
  /** Resolution governor scale on top of the clamped pixel ratio (0.5..1). */
  resolution: number;
  /** Camera distance to its target and the model's bounding radius (label budget). */
  cameraDistance: number;
  modelRadius: number;
  anchors: Map<string, ScreenAnchor>;
  stats: StageStats;
  /** Called after each rendered frame's projection (labels). */
  listeners: Set<() => void>;
  /** Request one more frame (demand frameloop). */
  invalidate(): void;
  /** Live camera pose (REFERENCE saves it). */
  liveCamera(): OrbitCamera | null;
  /** Scene transition id whose camera move has finished (or that needed none); the presentation waits on it. */
  settledTransition: number;
  /** Called when `settledTransition` changes. */
  settleListeners: Set<() => void>;
}

/** Resolves once the stage has finished the camera move of transition `id` (or after `timeoutMs`, e.g. before the stage has loaded). */
export function cameraSettled(bridge: StageBridge, id: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      bridge.settleListeners.delete(check);
      window.clearTimeout(timer);
      resolve();
    };
    const check = () => {
      if (bridge.settledTransition >= id) done();
    };
    const timer = window.setTimeout(done, timeoutMs);
    bridge.settleListeners.add(check);
    check();
  });
}

export function createBridge(): StageBridge {
  return {
    width: 0,
    height: 0,
    resolution: 1,
    cameraDistance: 0,
    modelRadius: 1,
    anchors: new Map(),
    stats: { calls: 0, triangles: 0, geometries: 0, textures: 0, fps: undefined, gpu: undefined, buffer: [0, 0], lastFrame: 0 },
    listeners: new Set(),
    invalidate: () => {},
    liveCamera: () => null,
    settledTransition: -1,
    settleListeners: new Set(),
  };
}
