/** Server descriptors stay synchronous; hydration fetches only the selected engine. */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { getEngine as serverEngine } from '../registry';
import { geographyUrlBaseline, geographyUrlPatch } from '../time-scene/lib/geography';
import { monthlyUrlBaseline, monthlyUrlPatch } from '../time-scene/lib/climatology-state';
import type { EngineId, EngineViewProps, SceneSnapshot } from './types';
import type { TimeSceneExt } from '../time-scene';
import type { AnyEngineDescriptor } from './engine';
import { createUiLoader } from '../../i18n/ui-loader';

export const engineLoaders: Record<EngineId, () => Promise<AnyEngineDescriptor>> = {
  'space-scene': () => import('../space-scene').then(m => m.spaceSceneEngine),
  'time-scene': () => import('../time-scene').then(m => m.timeSceneEngine),
  'math-scene': () => import('../math-scene').then(m => m.mathSceneEngine),
  simulation: () => import('../simulation').then(m => m.simulationEngine),
};
const engines = createUiLoader(engineLoaders);
type UrlAdapter = {
  patch: typeof geographyUrlPatch;
  baseline: (...args: Parameters<typeof geographyUrlBaseline>) => SceneSnapshot<TimeSceneExt> | null;
};
const adapters = createUiLoader<'geography' | 'climatology', UrlAdapter>({
  geography: () => import('../time-scene/lib/geography').then(m => ({ patch: m.geographyUrlPatch, baseline: m.geographyUrlBaseline })),
  climatology: () => import('../time-scene/lib/climatology-state').then(m => ({ patch: m.monthlyUrlPatch, baseline: m.monthlyUrlBaseline })),
});
const server = import.meta.env?.SSR !== false ? {
  engine: serverEngine,
  geography: { patch: geographyUrlPatch, baseline: geographyUrlBaseline },
  climatology: { patch: monthlyUrlPatch, baseline: monthlyUrlBaseline },
} : null;

export function readEngine(id: EngineId): AnyEngineDescriptor {
  return server?.engine(id) ?? engines.read(id);
}

export function readUrlAdapter(mode?: string) {
  if (mode !== 'geography' && mode !== 'climatology') return null;
  return server?.[mode] ?? adapters.read(mode);
}

const views = new Map<string, LazyExoticComponent<ComponentType<EngineViewProps>>>();
export function engineView(engine: AnyEngineDescriptor, mode?: string) {
  const special = engine.id === 'time-scene' && (mode === 'geography' || mode === 'climatology');
  const key = special ? `${engine.id}:${mode}` : engine.id;
  let view = views.get(key);
  if (!view) {
    view = lazy<ComponentType<EngineViewProps>>(() => special
      ? mode === 'geography' ? import('../time-scene/GeographyView') : import('../time-scene/ClimatologyView')
      : engine.load());
    views.set(key, view);
  }
  return view;
}
