import type { SpaceUiStore } from '../../ui';
export function replay(ui: SpaceUiStore, ids: readonly string[]): void {
  ui.setState({ simReplay: { n: ui.getState().simReplay.n + 1, ids: [...ids] } });
}
