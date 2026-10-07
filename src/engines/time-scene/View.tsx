/**
 * Phase 1 TimeScene stub. Shows the contract in use:
 *  - reads scene state with useScene / writes with the store actions
 *  - renders layer toggles + legend into `stageOverlay`
 *  - renders time controls into `bottomBar`
 *  - renders selected-event details (with a Counter) into `inspector`
 * The SVG sketch is equirectangular and deliberately crude. Phase 2 replaces
 * this file with GeoStage (MapLibre) + Timeline.
 */
import { useMemo, useState } from 'react';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useScene, useSceneStore } from '../core/context';
import { StubStage } from '../core/StubStage';
import { SceneLayerToggles, type LayerItem } from '../widgets/LayerToggles';
import { Legend, type LegendItem } from '../widgets/Legend';
import { Counter } from '../widgets/Counter';
import { tx, type BilingualText } from '../../i18n';
import { compareTime, formatTimeParam } from '../../lib/time';
import type { TimeSceneExt } from './index';
import type { Bloc, TimeSceneGeoData } from './schema';

const BLOC_COLOR: Record<Bloc, string> = {
  axis: 'var(--accent-axis)',
  allied: 'var(--accent-allied)',
  neutral: 'var(--accent-neutral)',
};

const BLOC_LABEL: Record<Bloc, BilingualText> = {
  axis: { en: 'Axis', zh: '轴心国' },
  allied: { en: 'Allies', zh: '同盟国' },
  neutral: { en: 'Neutral', zh: '中立' },
};

const LAYER_ITEMS: LayerItem[] = [
  { id: 'control', label: { en: 'Who controls where', zh: '控制区' } },
  { id: 'movements', label: { en: 'Movements', zh: '行军路线' } },
  { id: 'battles', label: { en: 'Events', zh: '事件' } },
];

type Ring = number[][];

export default function TimeSceneView({ data, locale }: EngineViewProps) {
  const geo = data as TimeSceneGeoData;
  const store = useSceneStore<TimeSceneExt>();
  const { t, layers, highlight } = useScene<TimeSceneExt, Pick<TimeSceneExt, 't' | 'highlight'> & { layers: string[] }>(
    (s) => ({ t: s.t, layers: s.layers, highlight: s.highlight }),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const entityById = useMemo(() => new Map(geo.entities.map((e) => [e.id, e])), [geo.entities]);

  // Latest keyframe at or before t (first one if t is earlier / unset).
  const keyframe = useMemo(() => {
    const frames = geo.control.keyframes;
    if (!t) return frames[0];
    let current = frames[0];
    for (const kf of frames) if ((compareTime(kf.t, t) ?? 1) <= 0) current = kf;
    return current;
  }, [geo.control.keyframes, t]);

  // Fit all geometry into the sketch.
  const view = useMemo(() => {
    const pts: number[][] = [];
    for (const kf of geo.control.keyframes)
      for (const f of kf.features.features) {
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        for (const poly of polys) for (const ring of poly) pts.push(...ring);
      }
    for (const m of geo.movements) pts.push(...m.path.coordinates);
    for (const e of geo.events) pts.push(e.at);
    const xs = pts.map((p) => p[0] ?? 0);
    const ys = pts.map((p) => p[1] ?? 0);
    const pad = 1;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { minX, minY, w: maxX - minX, h: maxY - minY, maxY };
  }, [geo]);

  const toPath = (ring: Ring) =>
    ring.map((p, i) => `${i ? 'L' : 'M'}${(p[0] ?? 0) - view.minX},${view.maxY - (p[1] ?? 0)}`).join('') + 'Z';
  const toLine = (coords: number[][]) =>
    coords.map((p, i) => `${i ? 'L' : 'M'}${(p[0] ?? 0) - view.minX},${view.maxY - (p[1] ?? 0)}`).join('');

  const blocOf = (id: string): Bloc => entityById.get(id)?.bloc ?? 'neutral';
  const legend: LegendItem[] = (['axis', 'allied', 'neutral'] as const)
    .filter((b) => geo.entities.some((e) => e.bloc === b))
    .map((b) => ({ id: b, label: BLOC_LABEL[b], color: BLOC_COLOR[b] }));

  const event = geo.events.find((e) => e.id === selected) ?? null;
  const stroke = Math.max(view.w, view.h) / 200;

  return (
    <>
      <StubStage engineLabel="TimeScene · GeoStage">
        <svg
          viewBox={`0 0 ${view.w} ${view.h}`}
          className="atlas-stub__svg"
          role="img"
          aria-label={keyframe ? `${formatTimeParam(keyframe.t)}` : undefined}
        >
          <rect width={view.w} height={view.h} fill="var(--water)" />
          {layers.includes('control') &&
            keyframe?.features.features.map((f, i) => {
              const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
              return polys.map((poly, j) => (
                <path
                  key={`${i}-${j}`}
                  d={poly.map(toPath).join('')}
                  fill={BLOC_COLOR[blocOf(f.properties.holder)]}
                  fillOpacity={0.45}
                  stroke="var(--land-edge)"
                  strokeWidth={stroke}
                />
              ));
            })}
          {layers.includes('movements') &&
            geo.movements.map((m) => (
              <path
                key={m.id}
                d={toLine(m.path.coordinates)}
                fill="none"
                stroke={BLOC_COLOR[blocOf(m.holder)]}
                strokeWidth={stroke * (highlight.includes(m.id) ? 4 : 2)}
                strokeDasharray={`${stroke * 6} ${stroke * 3}`}
                strokeLinecap="round"
              />
            ))}
          {layers.includes('battles') &&
            geo.events.map((e) => (
              <circle
                key={e.id}
                cx={e.at[0] - view.minX}
                cy={view.maxY - e.at[1]}
                r={stroke * (highlight.includes(e.id) || selected === e.id ? 6 : 4)}
                fill="var(--ink)"
                stroke="var(--bg)"
                strokeWidth={stroke}
              />
            ))}
        </svg>
      </StubStage>

      <SceneSlot name="stageOverlay">
        <div className="atlas-overlay-card">
          <SceneLayerToggles items={LAYER_ITEMS} />
          <Legend items={legend} locale={locale} />
        </div>
      </SceneSlot>

      <SceneSlot name="bottomBar">
        <span className="atlas-bottombar__readout">{t ? formatTimeParam(t) : '—'}</span>
        <div className="atlas-segmented" role="radiogroup" aria-label={tx({ en: "Keyframes", zh: "关键帧" }, locale)}>
          {geo.control.keyframes.map((kf) => {
            const value = formatTimeParam(kf.t);
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={t !== null && formatTimeParam(t) === value}
                className="atlas-control"
                onClick={() => store.getState().patch({ t: kf.t })}
              >
                {value}
              </button>
            );
          })}
        </div>
      </SceneSlot>

      <SceneSlot name="inspector">
        <ul className="atlas-stub__list">
          {geo.events.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="atlas-control atlas-control--ghost"
                aria-pressed={selected === e.id}
                onClick={() => setSelected(selected === e.id ? null : e.id)}
              >
                {formatTimeParam(e.t)} · {tx(e.title, locale)}
              </button>
            </li>
          ))}
        </ul>
        {event && (
          <div className="atlas-stub__detail">
            <p>{tx(event.summary, locale)}</p>
            {Object.entries(event.forces ?? {}).map(([id, n]) => (
              <Counter
                key={id}
                value={n}
                per={1000}
                locale={locale}
                label={entityById.get(id)?.name ?? id}
                color={BLOC_COLOR[blocOf(id)]}
              />
            ))}
          </div>
        )}
      </SceneSlot>
    </>
  );
}
