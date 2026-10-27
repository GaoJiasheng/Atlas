/**
 * Shared layout of how-planes-fly (docs/45 §2.0.1, §3.1, §3.4): the four
 * stations' part sets, their anchor points and the named cameras. Both
 * build-parts.ts and build-chapters.ts read it.
 */
export type Vec3 = [number, number, number];
export interface Cam {
  position: Vec3;
  target: Vec3;
  fov: number;
}

/** W: the whole generic airliner (23 parts). */
export const W = [
  'fuselage-shell',
  'cockpit-glazing',
  'wing-left',
  'wing-right',
  'wing-tip-left',
  'wing-tip-right',
  'aileron-left',
  'aileron-right',
  'spoiler-left',
  'flap-left',
  'flap-right',
  'slat-left',
  'slat-right',
  'tailplane-left',
  'tailplane-right',
  'elevator-left',
  'elevator-right',
  'fin',
  'rudder',
  'nacelle-left',
  'nacelle-right',
  'fan-left',
  'fan-right',
];
/** B: the separate wing-box station (4 parts). */
export const B = ['wing-box-skin', 'front-spar', 'rear-spar', 'wing-ribs'];
/** E: the separate two-spool turbofan section (13 parts). */
export const E = [
  'engine-shell',
  'fan-disc',
  'bypass-duct',
  'compressor-bank',
  'compressor-rotor',
  'combustor-ring',
  'turbine-bank',
  'hp-turbine-rotor',
  'lp-turbine-rotor',
  'lp-shaft',
  'hp-shaft',
  'core-nozzle',
  'bypass-nozzle',
];
/** A: the airfoil experiment (4 parts); its context stand shows with it. */
export const A = ['foil-sample', 'chord-marker', 'inflow-reference', 'angle-marker'];
export const PLINTH = 'display-plinth';
export const ALL = [...W, ...B, ...E, ...A, PLINTH];

/** A visible set as the hide list a chapter or beat writes: everything else, in part order. */
export function hideExcept(show: readonly string[]): string[] {
  const unknown = show.filter((id) => !ALL.includes(id));
  if (unknown.length) throw new Error(`hideExcept: unknown parts ${unknown.join(', ')}`);
  return ALL.filter((id) => !show.includes(id));
}
/** The experiment as shown: its four parts and the stand. */
export const A_SHOWN = [...A, PLINTH];

/** Stations (scene units; Y up, nose −X, left wing +Z). */
export const CG: Vec3 = [0, 1.1, 0];
export const BOX: Vec3 = [0, 1.1, 2.4];
export const ENGINE: Vec3 = [0, 0.8, -2.8];
/** Unrotated leading edge of the airfoil sample and its quarter-chord pivot (chord 1, along +X). */
export const ORIGIN: Vec3 = [-0.5, 2.2, 2.7];
export const PIVOT: Vec3 = [-0.25, 2.2, 2.7];

export const PRESETS: Record<string, { label: { en: string; zh: string }; camera: Cam }> = {
  'aircraft-overview': { label: { en: 'Aircraft', zh: '整机' }, camera: { position: [-5, 4.5, 6], target: [0, 1.1, 0], fov: 30 } },
  'wing-structure-view': { label: { en: 'Wing box', zh: '翼盒' }, camera: { position: [-1.45, 1.85, 4.85], target: [0.02, 1.1, 2.4], fov: 30 } },
  'section-view': { label: { en: 'Airfoil', zh: '翼型' }, camera: { position: [0, 2.2, 7.5], target: [0, 2.2, 2.7], fov: 30 } },
  'controls-view': { label: { en: 'Controls', zh: '操纵面' }, camera: { position: [6.1, 2.5, 1.15], target: [0.35, 1.15, 0], fov: 30 } },
  'engine-section-view': { label: { en: 'Engine', zh: '发动机' }, camera: { position: [-0.12, 1.45, 1.6], target: [-0.12, 0.8, -2.8], fov: 30 } },
  'cruise-view': { label: { en: 'Cruise', zh: '巡航' }, camera: { position: [-4.5, 4, 6], target: [0, 1.1, 0], fov: 30 } },
};
export const cam = (id: keyof typeof PRESETS | string): Cam => {
  const p = PRESETS[id];
  if (!p) throw new Error(`unknown preset ${id}`);
  return p.camera;
};
