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
  /** Rough on-screen radius of the part, stage pixels. */
  r: number;
  /** On-screen box of the part's bounds (the projected corners), stage pixels: placards keep off labelled parts. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A projected attachment point (lib/sites.ts keys), stage CSS pixels. */
export interface SitePoint {
  x: number;
  y: number;
  /** In front of the camera, on the stage and not cut away. */
  shown: boolean;
}

/** One energy-bars overlay on screen (docs/31 E-EN6): the values drawn and where its label block goes (below the bars), stage CSS pixels. */
export interface EnergyBarsOnScreen {
  potential: number;
  kinetic: number;
  lost: number;
  heat: number;
  sound: number;
  x: number;
  y: number;
  /** Drawn now (its part on show, `when` holds, not exploded, in front of the camera). */
  shown: boolean;
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
  /** Requested main-light shadow-map renders (zero in contact/none mode). */
  shadowMapUpdates: number;
}

export interface ShadowOnScreen {
  /** Each caster's shadow on the receiver and its darkness (1 opaque; a transmitting sheet less). */
  casters: Record<string, { min: [number, number]; max: [number, number]; dark: number }>;
  spot?: { radius: number };
  trail: [number, number][];
  rays: number;
}

export interface FillReading {
  /** Drawn volume (scene units cubed) and local surface y. */
  volume: number;
  level: number;
  shown: boolean;
}

/** A bent strip on the stage now (lib/bend.ts): the drawn sag / drop, its middle and free end (model coordinates) and its centre line's length. */
export interface BendReading {
  value: number;
  mid: [number, number, number];
  tip: [number, number, number];
  length: number;
  shown: boolean;
}

/** A shifted part now (docs/38 §4.3): its drawn offset and target (scene units) and whether it is drawn. */
export interface ShiftReading {
  offset: [number, number, number];
  target: [number, number, number];
  shown: boolean;
  /** Seconds the current move waited for its turn (the stagger; 0 for a jump). */
  delay: number;
}

/** An animation now (docs/40 §4.3): its frequency (Hz), cycle phase (0–1) and how far it is switched on. */
export interface AnimationReading {
  hz: number;
  phase: number;
  on: number;
}

/** Physical points precede display explode; part matrices map rest world metres to the actual displayed world metres. */
export interface MechanismReading {
  thetaRad: number;
  phaseDeg: number;
  cycles: number;
  pistonDirection: 'up' | 'down' | 'switch';
  points: Record<string, [number, number, number]>;
  planetAngleRad: number;
  sunAngleRad: number;
  shaftTurns: number;
  ports: Record<string, boolean>;
  linkResidualM: number;
  clearanceMarginM: number;
  parts: Record<string, { matrix: number[]; endpoints?: number[][] }>;
  gates: Record<string, boolean>;
}

export type MechanismSave = Record<string, { thetaRad: number; qaHold: boolean }>;

export interface StageBridge {
  /** Measured free stage band for opt-in camera framing. */
  freeStage?: import('./lib/hud-framing').FrameRect;
  /** Orbit sims (docs/44 §4.10): what OrbitDriver really drew for the snapshot `snapshotId` (world position / quaternion / scale, Sun uniforms). */
  orbitRendered?: { snapshotId: number; parts: Record<string, { position: number[]; quaternion: number[]; scale: number[]; visible: boolean }>; solarDirections: Record<string, number[]> };
  mechanisms: Map<string, MechanismReading>;
  seekMechanism(id: string, deg: number): boolean;
  resetMechanisms(): void;
  saveMechanisms(): MechanismSave;
  restoreMechanisms(saved: MechanismSave): void;
  fills: Map<string, FillReading>;
  /** Copies a `count` binding draws, per part (QA `copies(id)`). */
  copies: Map<string, number>;
  /** A try-it `tint` binding's colour (sRGB hex) and the blend drawn now, per part (QA `tint(id)`, docs/41 E-S1). */
  tints: Map<string, { color: string; level: number }>;
  /** Per animation id (stages/model3d/AnimClocks.tsx; QA `animation(id)`). */
  animations: Map<string, AnimationReading>;
  bends: Map<string, BendReading>;
  shifts: Map<string, ShiftReading>;
  fillBenchmarks: Map<string, () => number>;
  flowPaths: Map<string, Record<string, { visible: boolean }>>;
  /** Flows a number `intensity` paces (docs/40 §4.3): the factor every path runs at (QA `flow(id).pace`). */
  flowPace: Map<string, number>;
  /** Stage size in CSS pixels. */
  width: number;
  height: number;
  /** Resolution governor scale on top of the clamped pixel ratio (0.5..1). */
  resolution: number;
  /** Camera distance to its target and the subject's bounding radius (non-context parts; label budget). */
  cameraDistance: number;
  /** Stage pixels per scene unit at depth 1 (height ÷ 2 ÷ tan(fov ÷ 2)): a length at depth d spans length × focal ÷ d pixels. */
  focal: number;
  modelRadius: number;
  anchors: Map<string, ScreenAnchor>;
  /** Attachment markers on show, projected (keys from lib/sites.ts `siteKey`). */
  sites: Map<string, SitePoint>;
  /** Ids the HUD may label now (`null`: any): the stage checks occlusion for these only. */
  labelled: ReadonlySet<string> | null;
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
  /** Standing exercise on show: how far the weight-bearing feet still slide from where they stood (metres), else null (QA). */
  footSlip: number | null;
  /** The points (x, y, z, scene) the mannequin and the held equipment sweep over an exercise's keys: the exercise camera frames them. */
  exerciseFrame: { id: string; points: Float32Array } | null;
  /** Try-it timelines on the stage (lib/sim/timeline.ts): per output id, the model time on show and whether it plays (QA, `sim().timeline`). */
  playback: ReadonlyMap<string, { readonly t: number; readonly playing: boolean; readonly timeline: { readonly duration: number; readonly slow: number } }>;
  /** Energy bars on the stage, by overlay index (QA `energyBars()`, their HUD labels). */
  energyBars: Map<number, EnergyBarsOnScreen & { timeline: string }>;
  /** Projected mesh bounds and construction geometry, receiver centimetres (QA). */
  shadows: Map<number, ShadowOnScreen>;
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
    mechanisms: new Map(),
    seekMechanism: () => false,
    resetMechanisms: () => {},
    saveMechanisms: () => ({}),
    restoreMechanisms: () => {},
    width: 0,
    height: 0,
    resolution: 1,
    cameraDistance: 0,
    focal: 0,
    modelRadius: 1,
    anchors: new Map(),
    fills: new Map(),
    animations: new Map(),
    copies: new Map(),
    tints: new Map(),
    bends: new Map(),
    shifts: new Map(),
    fillBenchmarks: new Map(),
    flowPaths: new Map(),
    flowPace: new Map(),
    sites: new Map(),
    labelled: null,
    stats: { calls: 0, triangles: 0, geometries: 0, textures: 0, fps: undefined, gpu: undefined, buffer: [0, 0], lastFrame: 0, shadowMapUpdates: 0 },
    listeners: new Set(),
    invalidate: () => {},
    liveCamera: () => null,
    settledTransition: -1,
    settleListeners: new Set(),
    footSlip: null,
    exerciseFrame: null,
    playback: new Map(),
    energyBars: new Map(),
    shadows: new Map(),
  };
}
