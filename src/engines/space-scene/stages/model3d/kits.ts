/**
 * Stage code that only some topics need, fetched before the stage mounts so the scene can call it synchronously:
 * the rigged figure's hand and equipment rules (`body`, topics with a rig) and the magnetic field solver (`field`,
 * magnets and iron filings). Model3DStage suspends on `stageKitsPending` until the topic's kits have arrived.
 */
import type { PartsFile } from '../../schema';

type BodyKit = typeof import('./bodyKit');
type FieldKit = typeof import('../../lib/sim/field');

export const kits: { body: BodyKit | null; field: FieldKit | null } = { body: null, field: null };

const loading: { body?: Promise<void>; field?: Promise<void> } = {};

export function needsBodyKit(data: Pick<PartsFile, 'rig'>): boolean {
  return data.rig !== undefined;
}

export function needsFieldKit(data: Pick<PartsFile, 'sim' | 'parts'>): boolean {
  return data.sim?.magnet !== undefined || data.parts.some((p) => p.primitive?.kind === 'filings' || p.extra?.some((e) => e.kind === 'filings'));
}

/** The load still to wait for before this topic's stage can render, or null when its kits are here. */
export function stageKitsPending(data: PartsFile): Promise<void> | null {
  const waits: Promise<void>[] = [];
  if (needsBodyKit(data) && !kits.body) waits.push((loading.body ??= import('./bodyKit').then((m) => { kits.body = m; })));
  if (needsFieldKit(data) && !kits.field) waits.push((loading.field ??= import('../../lib/sim/field').then((m) => { kits.field = m; })));
  return waits.length ? Promise.all(waits).then(() => {}) : null;
}
