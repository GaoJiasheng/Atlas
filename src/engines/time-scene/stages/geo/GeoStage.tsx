/**
 * GeoStage: the MapLibre stage. A thin React shell that lazy-loads the map
 * controller (and MapLibre with it) and hands it the store and playhead.
 */
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../../core/types';
import type { SceneStore } from '../../../core/store';
import { tx } from '../../../../i18n';
import type { TimeSceneExt } from '../../index';
import type { TimeModel } from '../../lib/model';
import type { Playhead } from '../../lib/playhead';
import type { GeoController } from './controller';
import { S } from '../../strings';

export interface GeoStageProps {
  store: SceneStore<TimeSceneExt>;
  playhead: Playhead;
  model: TimeModel;
  locale: Locale;
  onSelectEvent(id: string): void;
}

export function GeoStage({ store, playhead, model, locale, onSelectEvent }: GeoStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GeoController | null>(null);
  const selectRef = useRef(onSelectEvent);
  selectRef.current = onSelectEvent;
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    import('./controller')
      .then(({ createGeoController }) => {
        if (cancelled) return;
        controllerRef.current = createGeoController({
          container,
          store,
          playhead,
          model,
          locale: localeRef.current,
          onSelectEvent: (id) => selectRef.current(id),
        });
        setStatus('ready');
      })
      .catch((err: unknown) => {
        console.warn('[atlas] map unavailable:', err);
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [store, playhead, model]);

  useEffect(() => {
    controllerRef.current?.setLocale(locale);
  }, [locale]);

  return (
    <div className="ts-geo" data-keys="own" data-status={status}>
      <div ref={containerRef} className="ts-geo__map" />
      {status === 'failed' && (
        <p className="ts-geo__notice" role="status">
          {tx(S.mapFailed, locale)}
        </p>
      )}
    </div>
  );
}
