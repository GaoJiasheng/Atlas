/**
 * Stage code that only some topics need, fetched before the stage mounts so the scene can call it synchronously:
 * the rigged figure's hand and equipment rules (`body`, topics with a rig), the magnetic field solver (`field`,
 * magnets and iron filings) and the strip-bending maths (`bend`, a try-it that bends a part; in the browser build
 * PartNode reaches it through lib/bend.client.ts, core/loading-build.ts). The page preloads the topic's kits
 * (space-scene/first-frame.ts), the View entry starts them (`preloadStageKits`) and Model3DStage suspends on
 * `stageKitsPending` until they have arrived.
 */
import type { PartsFile } from '../../schema';

type BodyKit = typeof import('./bodyKit');
type FieldKit = typeof import('../../lib/sim/field');
type BendKit = typeof import('../../lib/bend');
export type KitName = 'body' | 'field' | 'bend';

export const kits: { body: BodyKit | null; field: FieldKit | null; bend: BendKit | null } = { body: null, field: null, bend: null };

const loading: Partial<Record<KitName, Promise<void>>> = {};
const loaders: Record<KitName, () => Promise<void>> = {
  body: () => import('./bodyKit').then((m) => { kits.body = m; }),
  field: () => import('../../lib/sim/field').then((m) => { kits.field = m; }),
  bend: () => import('../../lib/bend').then((m) => { kits.bend = m; }),
};
/** Source file of each kit (space-scene/first-frame.ts lists the topic's kits for the build). */
export const KIT_MODULES: Readonly<Record<KitName, string>> = {
  body: 'stages/model3d/bodyKit.ts',
  field: 'lib/sim/field.ts',
  bend: 'lib/bend.ts',
};

export function needsBodyKit(data: Pick<PartsFile, 'rig'>): boolean {
  return data.rig !== undefined;
}

export function needsFieldKit(data: Pick<PartsFile, 'sim' | 'parts'>): boolean {
  return data.sim?.magnet !== undefined || data.parts.some((p) => p.primitive?.kind === 'filings' || p.extra?.some((e) => e.kind === 'filings'));
}

export function needsBendKit(data: Pick<PartsFile, 'sim'>): boolean {
  return data.sim?.bind.some((b) => 'part' in b && b.bend !== undefined) ?? false;
}

/** The kits this topic's stage renders with. */
export function stageKits(data: PartsFile): KitName[] {
  const needs: Record<KitName, boolean> = { body: needsBodyKit(data), field: needsFieldKit(data), bend: needsBendKit(data) };
  return (Object.keys(needs) as KitName[]).filter((kit) => needs[kit]);
}

function loadKit(kit: KitName): Promise<void> {
  return (loading[kit] ??= loaders[kit]());
}

/** Start the topic's kits without waiting for them (the View entry, before the stage asks for them). */
export function preloadStageKits(data: PartsFile): void {
  for (const kit of stageKits(data)) if (!kits[kit]) loadKit(kit).catch(() => {});
}

/** The load still to wait for before this topic's stage can render, or null when its kits are here. */
export function stageKitsPending(data: PartsFile): Promise<void> | null {
  const waits = stageKits(data).filter((kit) => !kits[kit]).map(loadKit);
  return waits.length ? Promise.all(waits).then(() => {}) : null;
}
