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
  };
}
