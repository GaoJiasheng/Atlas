/** Discrete reconstructed land frames. No geographic source is shared with the modern map. */
import type { FeatureCollection } from 'geojson';
import type { ReconstructionFrame, ReconstructionManifest } from '../deep-time';
import { frameAt } from './deepTime';

export interface ReconstructionStats {
  selectedMa: number;
  frameId: string | null;
  frameMa: number | null;
  deltaMa: number | null;
  modelId: string;
  geometryMeaning: 'exposed-land';
  status: 'loading' | 'ready' | 'unavailable';
  geometryUpdates: number;
}

/** Hold the nearest older sample; Ma grows towards the past. */
export function reconstructionFrameAt(manifest: ReconstructionManifest, queryMa: number): ReconstructionFrame | null {
  if (!Number.isFinite(queryMa) || !manifest.frames.length) return null;
  const hit = frameAt(manifest, Math.max(0, Math.min(manifest.frames[0]!.t.ma, queryMa)));
  return manifest.frames.find((frame) => frame.id === hit?.frameId) ?? null;
}

export const RECONSTRUCTION_EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export interface ReconstructionFramesOptions {
  manifest: ReconstructionManifest;
  load(frame: ReconstructionFrame, signal: AbortSignal): Promise<FeatureCollection>;
  /** One static GeoJSON source replacement; an empty collection clears stale land. */
  apply(collection: FeatureCollection): void | Promise<void>;
  onChange?(stats: ReconstructionStats): void;
}

/**
 * Only the current sample and its nearest neighbours may remain decoded.
 * Aborted / late responses are discarded before committing geometry or cache.
 * Same-sample scrubbing only changes the selected-age readout.
 */
export function createReconstructionFrames({ manifest, load, apply, onChange }: ReconstructionFramesOptions) {
  const cache = new Map<string, FeatureCollection>();
  let requestedId: string | null = null;
  let generation = 0;
  let abort: AbortController | null = null;
  let destroyed = false;
  let drawnId: string | null = null;
  let applying: number | null = null;
  let state: ReconstructionStats = {
    selectedMa: manifest.frames[0]?.t.ma ?? 0,
    frameId: null, frameMa: null, deltaMa: null,
    modelId: manifest.modelId, geometryMeaning: manifest.geometryMeaning,
    status: 'loading', geometryUpdates: 0,
  };
  const emit = () => onChange?.({ ...state });
  const clear = () => {
    if (drawnId !== null || applying !== null) void Promise.resolve(apply(RECONSTRUCTION_EMPTY)).catch(() => {});
    drawnId = null;
    applying = null;
    state = { ...state, frameId: null, frameMa: null, deltaMa: null };
  };
  const commit = async (frame: ReconstructionFrame, data: FeatureCollection, current: number) => {
    if (drawnId !== frame.id) {
      applying = current;
      await apply(data);
      if (destroyed || current !== generation) return;
      applying = null;
      state.geometryUpdates++;
      drawnId = frame.id;
    }
    state = { ...state, frameId: frame.id, frameMa: frame.t.ma,
      deltaMa: frame.t.ma - state.selectedMa, status: 'ready' };
    emit();
  };
  const trim = (frame: ReconstructionFrame) => {
    const index = manifest.frames.indexOf(frame);
    // At either endpoint retain the closest two interior neighbours.
    const start = Math.max(0, Math.min(index - 1, manifest.frames.length - 3));
    const retained = new Set(manifest.frames.slice(start, start + 3).map((f) => f.id));
    for (const id of cache.keys()) if (!retained.has(id)) cache.delete(id);
  };
  return {
    async select(queryMa: number): Promise<void> {
      if (destroyed) return;
      const frame = reconstructionFrameAt(manifest, queryMa);
      if (!frame) {
        generation++;
        abort?.abort();
        requestedId = null;
        clear();
        state.status = 'unavailable';
        emit();
        return;
      }
      state.selectedMa = Math.max(manifest.frames.at(-1)!.t.ma, Math.min(manifest.frames[0]!.t.ma, queryMa));
      if (requestedId === frame.id) {
        if (state.frameMa !== null) state.deltaMa = state.frameMa - state.selectedMa;
        emit();
        return;
      }
      requestedId = frame.id;
      const current = ++generation;
      abort?.abort();
      abort = new AbortController();
      trim(frame);
      const cached = cache.get(frame.id);
      clear();
      state.status = 'loading';
      emit();
      try {
        const data = cached ?? await load(frame, abort.signal);
        if (destroyed || current !== generation) return;
        cache.set(frame.id, data);
        trim(frame);
        await commit(frame, data, current);
      } catch {
        if (destroyed || current !== generation) return;
        clear();
        state.status = 'unavailable';
        emit();
      }
    },
    stats: (): ReconstructionStats => ({ ...state }),
    cachedIds: () => [...cache.keys()],
    destroy() {
      destroyed = true;
      generation++;
      abort?.abort();
      cache.clear();
    },
  };
}
