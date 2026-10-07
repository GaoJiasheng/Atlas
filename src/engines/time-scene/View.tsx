/**
 * TimeScene view: GeoStage (MapLibre) + Timeline + legend / layer toggles +
 * event inspector. See docs/06 "TimeScene".
 *
 * Time flows through two layers:
 *  - the store's `t` (TimePoint, in the URL, set by chapters and deep links)
 *  - the playhead (continuous number the map renders at; lib/playhead.ts)
 * Chapter changes tween the playhead to the chapter's time; scrubbing and
 * playback move the playhead and write a rounded `t` back with `patch()`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Chapter, EngineViewProps } from '../core/types';
import { SceneSlot, useScene, useSceneStore } from '../core/context';
import { SceneLayerToggles, type LayerItem } from '../widgets/LayerToggles';
import { Legend, type LegendItem } from '../widgets/Legend';
import { isChapterCollapsed } from '../widgets/ChapterRail';
import { Icon } from '../widgets/icons';
import { tx } from '../../i18n';
import { formatTimeParam } from '../../lib/time';
import { useLevel, useParentMode } from '../../lib/prefs';
import type { TimeSceneExt } from './index';
import type { TimeSceneGeoData } from './schema';
import { buildTimeModel, type ChapterNode } from './lib/model';
import { createPlayhead } from './lib/playhead';
import { clamp, fromNumber, stepFor, toNumber } from './lib/time';
import { GeoStage } from './stages/geo/GeoStage';
import { Timeline, formatNumber } from './timeline/Timeline';
import { usePlayback } from './timeline/usePlayback';
import { EventInspector } from './EventInspector';
import { BLOC_CSS, entityCssColor } from './colors';
import { BLOC_LABELS, LAYER_LABELS, S, fill } from './strings';
import './time-scene.css';

const CHAPTER_TWEEN_MS = 1600;
const TOGGLE_LAYERS = ['control', 'borders', 'movements', 'battles', 'participation'] as const;
/** Up to this many entities, the legend names each one; above, it groups by bloc. */
const LEGEND_ENTITY_LIMIT = 6;
const OVERLAY_OPEN_MIN_WIDTH = 720;
const TEXT_INPUTS = 'input, select, textarea, [contenteditable="true"], [data-keys="own"], [role="slider"]';

export default function TimeSceneView({ data, chapters, locale }: EngineViewProps) {
  const geo = data as TimeSceneGeoData;
  const store = useSceneStore<TimeSceneExt>();
  const currentChapter = useScene<TimeSceneExt, string | null>((s) => s.chapter);
  const layers = useScene<TimeSceneExt, string[]>((s) => s.layers);
  const [readerLevel] = useLevel();
  const [parentMode] = useParentMode();

  /* ---------- model + playhead ---------- */
  const model = useMemo(
    () =>
      buildTimeModel(
        geo,
        chapters.map((c) => ({ id: c.id, t: store.getState().chapterTarget(c.id).t })),
      ),
    [geo, chapters, store],
  );
  const [playhead] = useState(() => {
    const t0 = store.getState().t;
    const n = t0 !== null ? toNumber(t0) : Number.NaN;
    return createPlayhead(Number.isFinite(n) ? n : model.min);
  });
  useEffect(() => () => playhead.destroy(), [playhead]);

  /** Last `t` this view wrote, so the store echo is not treated as a jump. */
  const lastWritten = useRef<string | null>(null);

  const commit = useCallback(
    (n: number) => {
      const v = clamp(n, model.min, model.max);
      playhead.set(v);
      const tp = fromNumber(v, model.scale);
      const key = formatTimeParam(tp);
      if (key !== lastWritten.current) {
        lastWritten.current = key;
        store.getState().patch({ t: tp });
      }
    },
    [playhead, model, store],
  );

  const isLocked = useCallback(
    (c: Chapter) => isChapterCollapsed(c, readerLevel, parentMode),
    [readerLevel, parentMode],
  );
  const canStopAt = useCallback(
    (node: ChapterNode) => {
      const c = chapters.find((x) => x.id === node.id);
      return !!c && !isLocked(c);
    },
    [chapters, isLocked],
  );
  const playback = usePlayback(playhead, model, commit, canStopAt);
  const { setPlaying } = playback;

  /* ---------- selected event (inspector) ---------- */
  const [selected, setSelected] = useState<string | null>(null);
  const selectEvent = useCallback(
    (id: string) => {
      setSelected(id);
      store.getState().patch({ highlight: [id] });
    },
    [store],
  );
  const closeEvent = useCallback(() => {
    setSelected(null);
    const s = store.getState();
    s.patch({ highlight: s.chapterTarget(s.chapter).highlight });
  }, [store]);

  /* ---------- store -> playhead ---------- */
  useEffect(
    () =>
      store.subscribe((s, prev) => {
        const transitioned = s.transition.id !== prev.transition.id;
        if (transitioned) {
          setPlaying(false);
          setSelected(null);
        }
        if (!transitioned && s.t === prev.t) return;
        if (s.t === null) return;
        const key = formatTimeParam(s.t);
        if (!transitioned && key === lastWritten.current) return;
        lastWritten.current = key;
        const target = clamp(toNumber(s.t), model.min, model.max);
        if (!Number.isFinite(target)) return;
        if (transitioned && !s.transition.instant) playhead.tweenTo(target, CHAPTER_TWEEN_MS);
        else playhead.set(target);
      }),
    [store, playhead, model, setPlaying],
  );

  /* ---------- user time controls ---------- */
  const step = stepFor(model.span, model.scale);
  const nudge = useCallback(
    (dir: 1 | -1, big = false) => {
      setPlaying(false);
      commit(playhead.get() + dir * step * (big ? 10 : 1));
    },
    [commit, playhead, step, setPlaying],
  );
  const scrubStart = useCallback(() => {
    setPlaying(false);
    playhead.cancelTween();
  }, [playhead, setPlaying]);
  const stepChapter = useCallback(
    (dir: 1 | -1) => store.getState().stepChapter(dir, (c) => !isLocked(c)),
    [store, isLocked],
  );

  // Shift+←/→ anywhere (outside text fields, the map and the timeline itself) nudges time.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_INPUTS)) return;
      e.preventDefault();
      nudge(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nudge]);

  /* ---------- legend ---------- */
  const legend = useMemo<LegendItem[]>(() => {
    const items: LegendItem[] = [];
    if (layers.includes('control') || layers.includes('participation')) {
      if (geo.entities.length <= LEGEND_ENTITY_LIMIT) {
        for (const e of geo.entities) items.push({ id: `entity-${e.id}`, label: e.name, color: entityCssColor(e) });
      } else {
        for (const b of ['axis', 'allied', 'neutral'] as const)
          if (geo.entities.some((e) => e.bloc === b)) items.push({ id: `bloc-${b}`, label: BLOC_LABELS[b], color: BLOC_CSS[b] });
      }
    }
    if (layers.includes('movements') && geo.movements.length)
      items.push({ id: 'movement', label: S.movement, color: 'var(--ink-muted)', kind: 'arrow' });
    if (layers.includes('battles') && geo.events.length)
      items.push({ id: 'event', label: S.event, color: 'var(--ink-muted)', kind: 'point' });
    return items;
  }, [geo, layers]);

  const layerItems = useMemo<LayerItem[]>(
    () => TOGGLE_LAYERS.map((id) => ({ id, label: LAYER_LABELS[id] })),
    [],
  );

  /* ---------- overlay: open by default only when the stage is roomy ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    setOverlayOpen((stageRef.current?.clientWidth ?? 0) >= OVERLAY_OPEN_MIN_WIDTH);
  }, []);

  const selectedEvent = selected ? geo.events.find((e) => e.id === selected) ?? null : null;
  const stopChapter = playback.stop ? chapters.find((c) => c.id === playback.stop?.id) : undefined;

  return (
    <div className="ts-stage" ref={stageRef}>
      <GeoStage store={store} playhead={playhead} model={model} locale={locale} onSelectEvent={selectEvent} />

      <div className="ts-stop" role="status" aria-live="polite">
        {stopChapter && playback.stop && (
          <div className="ts-stop__card">
            <span className="ts-stop__eyebrow">
              {fill(tx(S.chapterShort, locale), { n: chapters.indexOf(stopChapter) + 1 })} ·{' '}
              {formatNumber(playback.stop.t, model, locale)}
            </span>
            <span className="ts-stop__title">{tx(stopChapter.title, locale)}</span>
          </div>
        )}
      </div>

      <SceneSlot name="stageOverlay">
        <details className="atlas-overlay-card ts-overlay" open={overlayOpen} onToggle={(e) => setOverlayOpen(e.currentTarget.open)}>
          <summary className="ts-overlay__summary" aria-label={tx(S.layersAndKey, locale)}>
            <span className="ts-overlay__closed">
              <Icon name="layers" size={18} />
              <span>{tx(S.layersAndKey, locale)}</span>
            </span>
            <Icon name="close" size={18} className="ts-overlay__open" />
          </summary>
          <SceneLayerToggles items={layerItems} />
          <Legend items={legend} locale={locale} />
        </details>
      </SceneSlot>

      <SceneSlot name="bottomBar">
        <Timeline
          model={model}
          playhead={playhead}
          locale={locale}
          chapters={chapters}
          currentChapter={currentChapter}
          isLocked={isLocked}
          playing={playback.playing}
          speed={playback.speed}
          onTogglePlay={() => setPlaying(!playback.playing)}
          onSpeed={playback.setSpeed}
          onScrub={commit}
          onScrubStart={scrubStart}
          onNudge={nudge}
          onChapter={(id) => store.getState().goToChapter(id)}
          onStepChapter={stepChapter}
        />
      </SceneSlot>

      {selectedEvent && (
        <SceneSlot name="inspector">
          <EventInspector event={selectedEvent} model={model} locale={locale} onClose={closeEvent} />
        </SceneSlot>
      )}
    </div>
  );
}
