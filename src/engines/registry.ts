/**
 * Client-side engine registry. Descriptors are tiny and synchronous; each
 * engine's view (stage + controls) is code-split and loaded with React.lazy.
 *
 * To add an engine: create `src/engines/<id>/index.ts` exporting a descriptor
 * via `defineEngine` (core/engine.ts), add it here, add its schemas to `schemas.ts`.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { EngineId, EngineViewProps } from './core/types';
import type { AnyEngineDescriptor } from './core/engine';
import { timeSceneEngine } from './time-scene';
import { spaceSceneEngine } from './space-scene';
import { simulationEngine } from './simulation';
import { mathSceneEngine } from './math-scene';

const ENGINES: Record<EngineId, AnyEngineDescriptor> = {
  'time-scene': timeSceneEngine,
  'space-scene': spaceSceneEngine,
  simulation: simulationEngine,
  'math-scene': mathSceneEngine,
};

export function getEngine(id: EngineId): AnyEngineDescriptor {
  return ENGINES[id];
}

const views = new Map<EngineId, LazyExoticComponent<ComponentType<EngineViewProps>>>();

/** Lazily-loaded view component for an engine (memoised per engine). */
export function getEngineView(id: EngineId): LazyExoticComponent<ComponentType<EngineViewProps>> {
  let view = views.get(id);
  if (!view) {
    view = lazy(() => ENGINES[id].load());
    views.set(id, view);
  }
  return view;
}
