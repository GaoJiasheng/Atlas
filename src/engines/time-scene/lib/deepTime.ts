/** Client-safe deep-time selection: no schema, filesystem or data-source imports. */
import type { ModernPoint, ReferenceCard, ReconstructionManifest, FossilCollection, FossilMode } from '../deep-time';
export type { DeepTimeBundle, ModernPoint, ReferenceCard, ReconstructionManifest, ReconstructionFrame, FossilCollection, FossilMode, InsetView, ModernInsetConfig, ModernInsetManifest } from '../deep-time';

function finiteMa(n: number): number {
  if (!Number.isFinite(n) || n < 0 || !Number.isFinite(n * 1e6)) throw new Error('Ma must be finite, nonnegative and fit the time axis');
  return n;
}

export function frameAt(manifest: ReconstructionManifest, requestedMa: number) {
  if (!Number.isFinite(requestedMa) || !Number.isFinite(requestedMa * 1e6)) throw new Error('Ma must be finite and fit the time axis');
  const oldest = manifest.frames[0]; const youngest = manifest.frames.at(-1);
  if (!oldest || !youngest) return null;
  const selectedMa = Math.min(oldest.t.ma, Math.max(youngest.t.ma, requestedMa));
  let frame = oldest;
  for (const f of manifest.frames) { if (f.t.ma >= selectedMa) frame = f; else break; }
  return { selectedMa, frameId: frame.id, frameMa: frame.t.ma, deltaMa: frame.t.ma - selectedMa, modelId: manifest.modelId, geometryMeaning: manifest.geometryMeaning };
}

export function fossilQueryWindow(selectedMa: number, halfWidthMa = 5): [number, number] {
  finiteMa(selectedMa); finiteMa(halfWidthMa);
  if (!Number.isFinite(selectedMa + halfWidthMa)) throw new Error('query window overflows');
  return [Math.max(0, selectedMa - halfWidthMa), selectedMa + halfWidthMa];
}
export function collectionOverlaps(point: Pick<FossilCollection, 'occurrenceAges'>, window: readonly [number, number]): boolean {
  return point.occurrenceAges.some((a) => a.olderMa >= window[0] && a.youngerMa <= window[1]);
}

/** counts describe records; references and cards never contribute to fossil totals. */
export function filterModernPoints(points: readonly ModernPoint[], options: {
  selectedMa: number; halfWidthMa?: number; fossilMode?: FossilMode; fossilsEnabled?: boolean;
  insetVisible?: boolean; bounds?: readonly [number, number, number, number]; cards?: readonly ReferenceCard[];
}) {
  const ageWindow = fossilQueryWindow(options.selectedMa, options.halfWidthMa);
  const queryWindowMa = options.fossilMode === 'all-mesozoic' ? null : ageWindow;
  const fossils = points.filter((p): p is FossilCollection => p.kind === 'fossil-collection');
  const ageOverlapping = fossils.filter((p) => collectionOverlaps(p, ageWindow));
  const overlapping = queryWindowMa ? ageOverlapping : fossils;
  // Hiding the panel preserves its internally computed symbol counts.
  const symbolsVisible = options.fossilsEnabled !== false;
  const visibleFossils = symbolsVisible ? overlapping : [];
  const within = (p: ModernPoint) => !options.bounds || (p.at[0] >= options.bounds[0] && p.at[0] <= options.bounds[2] && p.at[1] >= options.bounds[1] && p.at[1] <= options.bounds[3]);
  const references = points.filter((p) => p.kind === 'reference');
  return {
    queryWindowMa, fossilsTotal: fossils.length, fossilsVisible: visibleFossils.length,
    fossilsInView: visibleFossils.filter(within).length, ageOverlapCount: ageOverlapping.length,
    referencePointsTotal: references.length, referenceCardsTotal: options.cards?.length ?? 0,
    visiblePoints: options.insetVisible === false ? [] : [...visibleFossils, ...references],
    visibleFossils,
  };
}

/** Normalized rows from fixed PBDB CSV snapshots; precision policy is applied before publication. */
export interface PbdbOccurrence {
  occurrenceId: string; collectionId: string; countryCode: string; at: [number, number] | null;
  olderMa: number; youngerMa: number;
}
export interface PbdbCollection {
  collectionId: string; countryCode: string; at: [number, number]; occurrences: PbdbOccurrence[];
}
export function derivePbdbCollections(rows: readonly PbdbOccurrence[]) {
  const unique = new Map<string, PbdbOccurrence>();
  for (const row of rows) {
    if (!row.occurrenceId || !row.collectionId || !/^[A-Z]{2}$/.test(row.countryCode)) throw new Error('PBDB identifiers and country code are required');
    finiteMa(row.olderMa); finiteMa(row.youngerMa);
    if (row.olderMa < row.youngerMa) throw new Error(`invalid age interval for occurrence ${row.occurrenceId}`);
    if (row.at && (!Number.isFinite(row.at[0]) || !Number.isFinite(row.at[1]) || Math.abs(row.at[0]) > 180 || Math.abs(row.at[1]) > 90)) throw new Error(`invalid coordinate for occurrence ${row.occurrenceId}`);
    const prior = unique.get(row.occurrenceId);
    if (prior) {
      if (prior.collectionId !== row.collectionId || prior.countryCode !== row.countryCode || prior.olderMa !== row.olderMa || prior.youngerMa !== row.youngerMa || JSON.stringify(prior.at) !== JSON.stringify(row.at)) throw new Error(`conflicting duplicate occurrence ${row.occurrenceId}`);
    } else unique.set(row.occurrenceId, row);
  }
  const suppressed = [...unique.values()].filter((r) => r.countryCode === 'MY');
  const collections = new Map<string, PbdbCollection>();
  let missingCoordinates = 0;
  for (const row of unique.values()) {
    if (row.countryCode === 'MY') continue;
    if (!row.at) { missingCoordinates++; continue; }
    let collection = collections.get(row.collectionId);
    if (!collection) { collection = { collectionId: row.collectionId, countryCode: row.countryCode, at: [...row.at], occurrences: [] }; collections.set(row.collectionId, collection); }
    if (collection.countryCode !== row.countryCode || collection.at[0] !== row.at[0] || collection.at[1] !== row.at[1]) throw new Error(`conflicting coordinates or country for collection ${row.collectionId}`);
    collection.occurrences.push({ ...row, at: [...row.at] });
  }
  return {
    collections: [...collections.values()], unionOccurrences: unique.size,
    publicOccurrences: [...collections.values()].reduce((sum, c) => sum + c.occurrences.length, 0),
    suppressedCollections: new Set(suppressed.map((r) => r.collectionId)).size,
    suppressedOccurrences: suppressed.length, missingCoordinates,
  };
}

/** A new highlight must change the inspector too; only an explicit out-of-window index pick stays unhighlighted. */
export function nextModernSelection(previous: string | null, eligibleHighlights: readonly string[], outsideIndexSelection: string | null): string | null {
  if (previous !== null && previous === outsideIndexSelection && eligibleHighlights.length === 0) return previous;
  return previous !== null && eligibleHighlights.includes(previous) ? previous : eligibleHighlights[0] ?? null;
}

/** Original PBDB reference identifiers are part of the published age basis, never a guessed citation. */
export function snapshotReferenceId(basis: { en: string }): string | null {
  return /\b(?:PBDB ref|reference)\s+([1-9]\d*)\b/.exec(basis.en)?.[1] ?? null;
}
