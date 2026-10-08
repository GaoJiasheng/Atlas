/**
 * GeoStage: the MapLibre stage. A thin React shell that lazy-loads the map
 * controller (and MapLibre with it) and hands it the store, the playhead and
 * the DOM it draws into (leader placards, scale bar, the host `leaders` svg).
 */
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../../core/types';
import type { SceneStore } from '../../../core/store';
import { useSceneContext, useT } from '../../../core/context';
import type { TimeSceneExt } from '../../index';
import type { TimeModel } from '../../lib/model';
import type { Playhead } from '../../lib/playhead';
import type { GeoController } from './controller';

export interface GeoStageProps {
  store: SceneStore<TimeSceneExt>;
  playhead: Playhead;
  model: TimeModel;
  locale: Locale;
  onSelectEvent(id: string): void;
  /** The controller once the map chunk has loaded (null on unmount). */
  onController(controller: GeoController | null): void;
}

export function GeoStage({ store, playhead, model, locale, onSelectEvent, onController }: GeoStageProps) {
  const t = useT();
  const leadersSvg = useSceneContext().slots.leaders;
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GeoController | null>(null);
  const selectRef = useRef(onSelectEvent);
  selectRef.current = onSelectEvent;
  const controllerCb = useRef(onController);
  controllerCb.current = onController;
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const svgRef = useRef<SVGSVGElement | null>(null);
  svgRef.current = leadersSvg instanceof SVGSVGElement ? leadersSvg : null;
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    const labelRoot = labelsRef.current;
    const scaleRoot = scaleRef.current;
    if (!container || !labelRoot || !scaleRoot) return;
    let cancelled = false;
    import('./controller')
      .then(({ createGeoController }) => {
        if (cancelled) return;
        const controller = createGeoController({
          container,
          labelRoot,
          scaleRoot,
          store,
          playhead,
          model,
          locale: localeRef.current,
          onSelectEvent: (id) => selectRef.current(id),
        });
        controller.setLeadersSvg(svgRef.current);
        controllerRef.current = controller;
        controllerCb.current(controller);
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
      controllerCb.current(null);
    };
  }, [store, playhead, model]);

  useEffect(() => {
    controllerRef.current?.setLocale(locale);
  }, [locale]);

  useEffect(() => {
    controllerRef.current?.setLeadersSvg(svgRef.current);
  }, [leadersSvg]);

  return (
    <div className="ts-geo" data-keys="own" data-status={status}>
      <div ref={containerRef} className="ts-geo__map" />
      <div ref={labelsRef} className="ts-callouts" />
      <div ref={scaleRef} className="ts-scale" role="img" aria-label={t('time.scale')}>
        <svg height="8" aria-hidden="true" />
        <span />
      </div>
      {status === 'failed' && (
        <p className="ts-geo__notice" role="status">
          {t('time.mapFailed')}
        </p>
      )}
    </div>
  );
}
