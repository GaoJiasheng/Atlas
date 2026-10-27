/** Shared chapter-body FlyTo action, called by the host's native click delegation. */
import type { SceneControls } from './controls';

export function activateFlyTo(
  dataset: { flyto?: string; timeTarget?: string },
  controls: Pick<SceneControls, 'selectEvent'>,
  setPreset: (id: string) => boolean,
  foldSheet: () => void,
): boolean {
  // Select first: the engine opens the reader and applies the event date/layer.
  // A subsequent camera preset preserves that selection and its authored framing.
  if (dataset.timeTarget !== undefined) {
    if (!controls.selectEvent?.(dataset.timeTarget)) return false;
    setPreset(dataset.flyto ?? '');
    return true;
  }
  if (!setPreset(dataset.flyto ?? '')) return false;
  foldSheet();
  return true;
}
