/**
 * React context for a scene island: the store, topic metadata, locale, and the
 * layout slots engines render into.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SceneStore, SceneStoreState } from './store';
import type { Chapter, EngineExtension, Locale, TopicMeta } from './types';
import { translator, type UiKey, type TemplateVars } from '../../i18n';

/**
 * Layout regions an engine can render into with `<SceneSlot name=…>`:
 *  - `bottomBar`    engine controls under the stage (timeline, explorer)
 *  - `stageOverlay` floating UI over the stage, top-right (layer toggles, legend)
 *  - `inspector`    details of the selected object, inside the InfoPanel
 */
export type SlotName = 'bottomBar' | 'stageOverlay' | 'inspector';

export interface SceneContextValue {
  /**
   * The store, typed with an open extension. Engines narrow it with
   * `useSceneStore<MyExt>()`; this is the engine-extension boundary.
   */
  store: SceneStore<EngineExtension>;
  topic: TopicMeta;
  chapters: readonly Chapter[];
  locale: Locale;
  slots: Partial<Record<SlotName, HTMLElement | null>>;
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
