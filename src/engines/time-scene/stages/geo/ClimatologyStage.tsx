/** Static month map. This branch never constructs a date model or playhead. */
import { useEffect, useRef } from 'react';
import { useSceneContext } from '../../../core/context';
import type { Locale, TopicMeta } from '../../../core/types';
import type { SceneStore } from '../../../core/store';
import type { TimeSceneExt } from '../../index';
import type { ClimatologyGeoData } from '../../schema';
import type { ClimateLoadState, ClimateSample } from '../../lib/climate';
import type { GeoController } from './controller';
export interface ClimateSnapshot {
  month: number;
  renderedMonth: number;
  periodId: string;
  selected: null | { kind: 'site'; id: string } | { kind: 'cell'; at: [number, number] };
  wind: { nativeValid: number; drawnVectors: number };
  rain: { nativeValid: number; cells: number };
  loads: Record<string, number>;
  geometryBuilds: Record<string, number>;
  commits: number;
  layers: Record<
    string,
    {
      status: 'loading' | 'ready' | 'error';
      error?: string;
      nativeValid: number;
      drawnVectors: number;
      cells: number;
    }
  >;
}
export interface ClimateGeoController extends GeoController {
  sampleClimate(lon: number, lat: number, month?: number): ClimateSample;
  retryClimateLayer(id: string): void;
  snapshot(): ClimateSnapshot;
  ready(): boolean;
  layerStates(): ReadonlyMap<string, ClimateLoadState>;
  setSelected(selection: ClimateSnapshot['selected']): void;
}
export interface ClimatologyStageProps {
  store: SceneStore<TimeSceneExt>;
  data: ClimatologyGeoData;
  topic: TopicMeta;
  locale: Locale;
  month?: number;
  geography?: import('../../geography-schema').GeographyFile;
  onSelectGeography?(id:string):void;
  layers?: string[];
  isPresenting?(): boolean;
  onSelectSite(id: string | null): void;
  onSelectCell(lon: number, lat: number): void;
  onController(controller: ClimateGeoController | null): void;
  onSnapshot?(snapshot: ClimateSnapshot): void;
}
export function ClimatologyStage(props: ClimatologyStageProps) {
  const { slots } = useSceneContext();
  const leadersRef = useRef(slots.leaders);
  leadersRef.current = slots.leaders;
  const root = useRef<HTMLDivElement>(null),
    controller = useRef<ClimateGeoController | null>(null),
    latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    let cancelled = false;
    import('./climatologyController').then(({ createClimatologyController }) => {
      if (cancelled || !root.current) return;
      controller.current = createClimatologyController({
        ...latest.current,
        container: root.current,
        onSelectSite: (id) => latest.current.onSelectSite(id),
        onSelectCell: (x, y) => latest.current.onSelectCell(x, y),
        onSnapshot: (s) => latest.current.onSnapshot?.(s),
      });
      controller.current.setLeadersSvg(leadersRef.current instanceof SVGSVGElement ? leadersRef.current : null);
      latest.current.onController(controller.current);
    });
    return () => {
      cancelled = true;
      controller.current?.destroy();
      controller.current = null;
      latest.current.onController(null);
    };
  }, [props.store, props.data, props.topic]);
  useEffect(() => controller.current?.setLeadersSvg(slots.leaders instanceof SVGSVGElement ? slots.leaders : null), [slots.leaders]);
  useEffect(() => controller.current?.setLocale(props.locale), [props.locale]);
  return (
    <div className="ts-geo" data-keys="own">
      <div ref={root} className="ts-geo__map" />
    </div>
  );
}
