/** Pure event-index navigation. A place is timeless; an event jumps to its authored date. */
import type { GeoCamera, SceneSnapshot } from '../../core/types';
import type { TimeSceneExt } from '../index';
import type { SceneEvent } from '../schema';

export interface ReaderBeat { chapter: string; index: number; highlight: string[] }

/** Closing a detail returns the applied beat's emphasis, rather than its chapter's first view. */
export function readerHighlight(chapter: string | null, beat: ReaderBeat | null, fallback: readonly string[]): string[] {
  return [...(beat?.chapter === chapter ? beat.highlight : fallback)];
}

export function eventSelectionPatch(
  state: SceneSnapshot<TimeSceneExt>,
  events: readonly SceneEvent[],
  id: string,
  presenting = false,
): Partial<SceneSnapshot<TimeSceneExt>> | null {
  if (presenting) return null;
  const event = events.find((e) => e.id === id);
  if (!event) return null;
  const layer = event.kind === 'site' ? 'sites' : 'battles';
  const camera: GeoCamera = state.camera && 'center' in state.camera ? state.camera : { center: [20, 10], zoom: 1.4 };
  return {
    ...(event.kind === 'site' ? {} : { t: event.t }),
    camera: { ...camera, center: [...event.at] },
    layers: state.layers.includes(layer) ? [...state.layers] : [...state.layers, layer],
    highlight: [id],
  };
}
