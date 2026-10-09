/**
 * React context for a scene island: the store, topic metadata, locale, and the
 * layout slots engines render into.
 */
import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SceneStore, SceneStoreState } from './store';
import { registerSceneControls, type HudActions, type HudState, type HudStore, type SceneControls } from './controls';
import type { Chapter, EngineExtension, Locale, TopicMeta } from './types';
import { translator, type UiKey, type TemplateVars } from '../../i18n';

/**
 * Layout regions an engine can render into with `<SceneSlot name=…>`
 * (docs/06 "布局插槽"). Empty slots render nothing.
 *  - `bottomBar`    engine controls at the bottom of the stage (timeline, explorer)
 *  - `stageOverlay` floating UI, right column under the card (control panel: layers, tools, key)
 *  - `inspector`    details of the selected object, inside the InfoPanel
 *  - `card`         body of the top-right schematic card (title via `controls.card`)
 *  - `panel01..03`  bodies of the three bottom panels (titles via `controls.panels`)
 *  - `perf`         quiet bottom-right readout (FPS · DRAW CALLS … / FEATURES · ZOOM)
 *  - `leaders`      an `<svg>` covering the stage, for leader lines (portal SVG elements)
 */
export type SlotName =
  | 'bottomBar'
  | 'stageOverlay'
  | 'inspector'
  | 'card'
  | 'panel01'
  | 'panel02'
  | 'panel03'
  | 'perf'
  | 'leaders';

export interface SceneContextValue {
  /**
   * The store, typed with an open extension. Engines narrow it with
   * `useSceneStore<MyExt>()`; this is the engine-extension boundary.
   */
  store: SceneStore<EngineExtension>;
  /** HUD registration + host UI state (hud, labels, active preset, reader). */
  hud: HudStore;
  /** The actions behind the HUD buttons and keys (modes, presets, HUD, reader). */
  actions: HudActions;
  topic: TopicMeta;
  chapters: readonly Chapter[];
  locale: Locale;
  slots: Partial<Record<SlotName, Element | null>>;
}

export const SceneContext = createContext<SceneContextValue | null>(null);

export function useSceneContext(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useSceneContext must be used inside <SceneHost>');
  return ctx;
}

/**
 * The scene store narrowed to an engine's extension fields. The cast is the
 * single, intentional engine-extension boundary: the host builds the store
 * from the engine's own `defaults()`, so the fields are present at runtime.
 */
export function useSceneStore<E extends EngineExtension = EngineExtension>(): SceneStore<E> {
  return useSceneContext().store as unknown as SceneStore<E>;
}

/** Select from scene state; re-renders only when the selection changes (shallow). */
export function useScene<E extends EngineExtension = EngineExtension, T = unknown>(
  selector: (state: SceneStoreState<E>) => T,
): T {
  const store = useSceneStore<E>();
  return useStore(store, useShallow(selector));
}

/** `t()` bound to the scene locale. */
export function useT(): (key: UiKey, vars?: TemplateVars) => string {
  const { locale } = useSceneContext();
  return translator(locale);
}

/** Render children into a named layout slot of the host (portal). */
export function SceneSlot({ name, children }: { name: SlotName; children: ReactNode }) {
  const target = useSceneContext().slots[name];
  return target ? createPortal(children, target) : null;
}

/**
 * Register the engine's HUD controls (presets, modes, pause, stats, spec
 * rows, status, card / panel titles) for as long as the calling component is
 * mounted. Pass a memoized object; a new identity re-registers.
 */
export function useSceneControls(controls: SceneControls): void {
  const { hud } = useSceneContext();
  useLayoutEffect(() => registerSceneControls(hud, controls), [hud, controls]);
}

/** Select from the host HUD state (`hud`, `labels`, ...). */
export function useHud<T>(selector: (state: HudState) => T): T {
  const { hud } = useSceneContext();
  return useStore(hud, useShallow(selector));
}
