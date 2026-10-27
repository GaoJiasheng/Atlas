/** Explicit monthly branch: calendar-month fields and authored beat order, without a time model. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EngineViewProps, SceneSnapshot } from '../core/types';
import { SceneSlot, useHud, useScene, useSceneContext, useSceneControls, useSceneStore } from '../core/context';
import type { SceneControls } from '../core/controls';
import { ChapterAxis } from '../core/axis/ChapterAxis';
import { flatIndex, stepBeat } from '../core/axis/axis';
import { chapterNumbers, isBackground } from '../core/chapters';
import { usePresentation } from '../core/presentation';
import { t as tl, tx } from '../../i18n';
import { ControlPanel, type ControlRow } from '../widgets/ControlPanel';
import { ClimatologyReaderTop, ClimatologyIndex } from './ClimatologyReader';
import type { ClimatologyBeat, ClimatologyChapterState, ClimatologyGeoData } from './schema';
import { cycleMonth, exploringText, monthlyBeatScene, monthText, ownMonthlyBeats, setClimatologyMonth, monthlyUrlBaseline, type ClimatologyExt } from './lib/climatology-state';
import { ClimatologyStage, type ClimateGeoController, type ClimateSnapshot } from './stages/geo/ClimatologyStage';
import { ClimateCellControls } from './ClimateCellControls';
import { ClimateKey } from './ClimateKey';
import { ClimateCellDetail } from './ClimateCellDetail';
import { Icon } from '../widgets/icons';
import './climatology.css';
import './time-scene.css';

export default function ClimatologyView({ topic, data, chapters, locale }: EngineViewProps) {
  const geo = data as ClimatologyGeoData;
  const store = useSceneStore<ClimatologyExt>();
  const { hud, revealReader } = useSceneContext();
  const state = useScene<ClimatologyExt, SceneSnapshot<ClimatologyExt>>((s) => ({
    chapter: s.chapter,
    month: s.month,
    beat: s.beat,
    t: s.t,
    camera: s.camera,
    layers: s.layers,
    highlight: s.highlight,
    theme: s.theme,
  }));
  const open = useHud((h) => h.panelsOpen);
  // The rain key is needed to read the map: open on wider screens, a chip on phones (it would cover half the map).
  const [overlayOpen, setOverlayOpen] = useState(() => window.matchMedia('(min-width: 760px)').matches);
  const [controller, setController] = useState<ClimateGeoController | null>(null);
  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  const [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const chapter = chapters.find((c) => c.id === state.chapter) ?? chapters[0]!;
  const own = ownMonthlyBeats(chapter);
  const authoredMonth = own[state.beat ?? 0]?.month ?? (chapter.state as ClimatologyChapterState).month;
  const authoredRef = useRef(authoredMonth);
  authoredRef.current = authoredMonth;
  const selectionRef = useRef(false);
  selectionRef.current = selectedSite !== null || selectedCell !== null;
  const dropSelection = useCallback(() => {
    setSelectedSite(null);
    setSelectedCell(null);
    selectionRef.current = false;
  }, []);
  const clearSelection = useCallback(() => {
    setSelectedSite(null);
    setSelectedCell(null);
    const s = store.getState();
    if (selectionRef.current && s.chapter)
      s.patch({
        highlight: monthlyBeatScene(store, chapters, s.chapter, s.beat ?? 0).highlight,
      });
    selectionRef.current = false;
  }, [store, chapters]);
  const selectSite = useCallback(
    (id: string | null) => {
      if (id !== null && !geo.events.some((site) => site.id === id)) return false;
      setSelectedSite(id);
      setSelectedCell(null);
      selectionRef.current = id !== null;
      if (id) {
        const current = store.getState();
        if (!current.layers.includes('sites')) current.toggleLayer('sites');
        current.patch({ highlight: [id] });
        revealReader();
        hud.setState({ reader: true });
      }
      return true;
    },
    [geo, hud, store, revealReader],
  );
  const selectCell = useCallback(
    (lon: number, lat: number) => {
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
      if (selectedSite) {
        const s = store.getState();
        if (s.chapter) s.patch({ highlight: monthlyBeatScene(store, chapters, s.chapter, s.beat ?? 0).highlight });
      }
      setSelectedCell([lon, lat]);
      setSelectedSite(null);
      selectionRef.current = true;
      revealReader();
      hud.setState({ reader: true });
      return true;
    },
    [hud, revealReader, selectedSite, store, chapters],
  );
  const applyBeat = useCallback(
    (id: string, index: number, instant = false) => {
      if (
        !chapters.some((c) => c.id === id) ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= Math.max(1, ownMonthlyBeats(chapters.find((c) => c.id === id)).length)
      )
        return false;
      store.getState().applyState(monthlyBeatScene(store, chapters, id, index), { instant });
      return true;
    },
    [store, chapters],
  );
  const presentation = usePresentation<ClimatologyBeat, SceneSnapshot<ClimatologyExt>>({
    beatsOf: (c) => ownMonthlyBeats(c),
    captionOf: (b, lang) => tx(b.caption, lang),
    applyBeat: (b, options) => {
      applyBeat(b.chapter, b.index, options.instant);
    },
    saveState: () => store.getState().snapshot(),
    restoreState: (saved) => {
      store.getState().applyState(saved);
      clearSelection();
    },
    onEnter: clearSelection,
    readout: (
      <span>
        {monthText(state.month, locale)} · {topic.climatology!.startYear}–{topic.climatology!.endYear}
        {exploringText(state.month, authoredMonth, locale) && <> · {exploringText(state.month, authoredMonth, locale)}</>}
      </span>
    ),
  });
  useEffect(() => controller?.setPresentation(presentation.presenting), [controller, presentation.presenting]);
  useEffect(() => {
    controller?.setSelected(selectedSite ? { kind: 'site', id: selectedSite } : selectedCell ? { kind: 'cell', at: selectedCell } : null);
  }, [controller, selectedSite, selectedCell]);
  const beatsRef = useRef(presentation.beats);
  beatsRef.current = presentation.beats;
  const step = useCallback(
    (delta: -1 | 1) => {
      const s = store.getState();
      const i = stepBeat(beatsRef.current, s.chapter, s.beat, true, delta);
      if (i === null) return;
      if (presentation.isPresenting()) presentation.controls.go(i, { instant: false });
      else {
        const b = beatsRef.current[i]!;
        applyBeat(b.chapter, b.index);
      }
    },
    [store, presentation.isPresenting, presentation.controls, applyBeat],
  );
  const monthStep = useCallback(
    (delta: -1 | 1) => {
      setClimatologyMonth(store, cycleMonth(store.getState().month, delta));
    },
    [store],
  );
  const toggleLayer = useCallback(
    (id: string, on: boolean) => {
      if (!(topic.monthlyLayers ?? []).some((l) => l.id === id) && id !== 'sites') return false;
      const s = store.getState();
      if (s.layers.includes(id) !== on) s.toggleLayer(id);
      return true;
    },
    [store, topic.monthlyLayers],
  );
  // Monthly chapter targets already contain their first beat; preserve atomic chapter actions.
  useEffect(
    () =>
      store.subscribe((s, prev) => {
        if (s.chapter !== prev.chapter || s.beat !== prev.beat) dropSelection();
      }),
    [store, dropSelection],
  );
  const numbers = useMemo(() => chapterNumbers(chapters), [chapters]);
  const axisChapters = useMemo(
    () =>
      // docs/08 §2: every chapter is a segment, the background chapter as `BG`.
      chapters.map((c) => ({
        id: c.id,
        number: isBackground(c) ? tl(locale, 'chapter.backgroundShort') : String(numbers.get(c.id) ?? 0).padStart(2, '0'),
        title: tx(c.title, locale),
        beats: presentation.beats.filter((b) => b.chapter === c.id).map((b) => tx(b.caption, locale)),
      })),
    [chapters, numbers, locale, presentation.beats],
  );
  const resources = [...(controller?.layerStates().values() ?? [])].flatMap((s) => (s.status === 'ready' ? [s.data.resource] : []));
  const wind = resources.find((r) => r.kind === 'monthly-wind');
  const rain = resources.find((r) => r.kind === 'monthly-rain');
  const grid = wind?.grid ?? rain?.grid;
  const controls = useMemo<SceneControls>(
    () => ({
      presets: {
        items: [
          { id: 'world', label: { en: 'World', zh: '世界' } },
          { id: 'theatre', label: { en: 'Whole area', zh: '全区域' } },
          ...(geo.presets?.presets ?? []).map((p) => ({ id: p.id, label: p.label })),
        ],
        set: (id, opts) => {
          if (id === 'world') {
            store.getState().applyCameraPreset({ center: [20, 10], zoom: 1.4 }, opts);
            return;
          }
          if (id === 'theatre') {
            const camera = controllerRef.current?.fitCamera();
            if (camera) store.getState().applyCameraPreset(camera, opts);
            return;
          }
          const p = geo.presets?.presets.find((p) => p.id === id);
          if (p) store.getState().applyCameraPreset(p.camera, opts);
        },
      },
      modes: {
        items: [
          {
            id: 'presentation',
            key: 'p',
            label: { en: 'Present', zh: '演示' },
            on: presentation.presenting,
            status: presentation.status,
          },
        ],
        set: (id, on, opts) => {
          if (id !== 'presentation') return;
          if (on) {
            const s = store.getState();
            const i = flatIndex(beatsRef.current, s.chapter, s.beat);
            presentation.start(Math.max(0, i), opts.instant);
          } else presentation.stop(true);
        },
      },
      beats: presentation.controls,
      beatStep: step,
      monthStep,
      urlBaseline: (raw) => monthlyUrlBaseline(store, chapters, raw as SceneSnapshot<ClimatologyExt>),
      status: [`${monthText(state.month, locale)} · ${topic.climatology!.startYear}–${topic.climatology!.endYear}`],
      labels: true,
      specRows: [
        {
          id: 'baseline',
          label: { en: 'Baseline', zh: '基准期' },
          value: `${topic.climatology!.startYear}–${topic.climatology!.endYear}`,
          mono: true,
          source: 'ref',
        },
        ...((topic.monthlyLayers ?? []).some((l) => l.quantity === 'wind')
          ? [
              {
                id: 'wind-level',
                label: { en: 'Wind level', zh: '风气压层' },
                value: wind?.kind === 'monthly-wind' ? `${wind.pressureHpa} hPa` : '—',
                mono: true,
                source: 'ref' as const,
              },
            ]
          : []),
        {
          id: 'native-spacing',
          label: { en: 'Native spacing', zh: '原生格距' },
          value: grid ? `${grid.dlon}° × ${grid.dlat}°` : '—',
          mono: true,
          source: 'ref',
        },
        ...((topic.monthlyLayers ?? []).some((l) => l.quantity === 'rain')
          ? [
              {
                id: 'rain-unit',
                label: { en: 'Rain unit', zh: '降水单位' },
                value: 'mm/day',
                mono: true,
                source: 'ref' as const,
              },
            ]
          : []),
      ],
      ready: () => controllerRef.current?.ready() ?? false,
      stats: () => ({
        ...(controllerRef.current?.stats() ?? {}),
        climatology: controllerRef.current?.snapshot(),
      }),
      escape: () => {
        if (presentation.isPresenting()) {
          presentation.stop(true);
          return true;
        }
        if (selectedSite || selectedCell) {
          clearSelection();
          return true;
        }
        return false;
      },
      test: {
        setClimatologyMonth: ((n: number) => setClimatologyMonth(store, n)) as never,
        sampleClimate: ((lon: number, lat: number, month?: number) =>
          controllerRef.current?.sampleClimate(lon, lat, month) ?? null) as never,
        climatology: (() => ({
          ...(controllerRef.current?.snapshot() ?? {}),
          month: store.getState().month,
          authoredMonth: authoredRef.current,
          exploring: store.getState().month !== authoredRef.current,
          selected: selectedSite ? { kind: 'site', id: selectedSite } : selectedCell ? { kind: 'cell', at: selectedCell } : null,
        })) as never,
        toggleMonthlyLayer: toggleLayer as never,
        inspectClimateCell: selectCell as never,
        selectClimatologySite: selectSite as never,
        retryClimateLayer: ((id: string) => controllerRef.current?.retryClimateLayer(id)) as never,
        goToClimatologyBeat: ((id: string, index: number) => applyBeat(id, index, true)) as never,
      },
    }),
    [
      geo,
      store,
      chapters,
      locale,
      state.month,
      topic.climatology,
      snapshot,
      presentation.controls,
      presentation.presenting,
      presentation.status,
      presentation.start,
      presentation.stop,
      presentation.isPresenting,
      step,
      monthStep,
      selectedSite,
      selectedCell,
      clearSelection,
      toggleLayer,
      selectCell,
      selectSite,
      applyBeat,
    ],
  );
  useSceneControls(controls);
  const layers = useMemo<ControlRow[]>(
    () => [
      { kind: 'layer', id: 'sites', label: { en: 'Places', zh: '地点' } },
      ...(topic.monthlyLayers ?? []).map((l) => ({
        kind: 'layer' as const,
        id: l.id,
        label: l.label,
      })),
      { kind: 'mode' as const, id: 'labels' },
    ],
    [topic.monthlyLayers],
  );
  const tools = useMemo<ControlRow[]>(
    () => [
      {
        kind: 'mode',
        id: 'presentation',
        label: { en: 'Present', zh: '演示' },
      },
      { kind: 'hud' },
    ],
    [],
  );
  const monthControl = (
    <section className="clim-month" aria-label={locale === 'zh' ? '月气候平均' : 'Climatology'}>
      <h3>
        CLIMATOLOGY <small>月气候平均</small>
      </h3>
      <p>
        {topic.climatology!.startYear}–{topic.climatology!.endYear} · {monthText(state.month, locale)}
      </p>
      <div className="clim-month__controls">
        <button
          type="button"
          data-climatology-prev
          aria-label={locale === 'zh' ? '上个月' : 'Previous month'}
          onClick={() => monthStep(-1)}
        >
          ‹
        </button>
        <input
          data-climatology-month
          aria-label={locale === 'zh' ? '月份' : 'Month'}
          type="range"
          min="1"
          max="12"
          step="1"
          value={state.month}
          onChange={(e) => setClimatologyMonth(store, Number(e.currentTarget.value))}
        />
        <button type="button" data-climatology-next aria-label={locale === 'zh' ? '下个月' : 'Next month'} onClick={() => monthStep(1)}>
          ›
        </button>
      </div>
      <p className="clim-month__note">{locale === 'zh' ? '多年各月平均，不是预报' : 'Calendar-month means, not a forecast'}</p>
    </section>
  );
  const activeWindId = topic.monthlyLayers?.find((layer) => layer.quantity === 'wind' && state.layers.includes(layer.id))?.id ?? null;
  const cellDetail =
    selectedCell && controller ? (
      <>
        <ClimateCellDetail
          sample={controller.sampleClimate(...selectedCell, snapshot?.renderedMonth || state.month)}
          locale={locale}
          onClose={clearSelection}
          visible={[...new Set((topic.monthlyLayers ?? []).filter((l) => state.layers.includes(l.id)).map((l) => l.quantity))]}
        />
        <ClimateCellControls
          windLayerId={activeWindId}
          controller={controller}
          selected={selectedCell}
          locale={locale}
          onInspect={selectCell}
        />
      </>
    ) : undefined;
  const at = flatIndex(presentation.beats, state.chapter, state.beat);
  return (
    <div className="ts-stage clim-stage" data-temporal-mode="climatology" data-presenting={presentation.presenting ? '' : undefined}>
      <ClimatologyStage
        store={store}
        data={geo}
        topic={topic}
        locale={locale}
        month={state.month}
        layers={state.layers}
        isPresenting={presentation.isPresenting}
        onSelectSite={selectSite}
        onSelectCell={selectCell}
        onController={setController}
        onSnapshot={setSnapshot}
      />
      {presentation.element}
      <SceneSlot name="plate">
        {monthControl}
        <ClimateCellControls
          windLayerId={activeWindId}
          controller={controller}
          selected={selectedCell}
          locale={locale}
          onInspect={selectCell}
          compact
        />
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <details className="atlas-overlay-card ts-overlay" open={overlayOpen} onToggle={(e) => setOverlayOpen(e.currentTarget.open)}>
          <summary className="ts-overlay__summary" aria-label={tl(locale, 'time.layersAndKey')}>
            <span className="ts-overlay__closed">
              <Icon name="layers" size={18} />
              <span>{tl(locale, 'time.layersAndKey')}</span>
            </span>
            <Icon name="close" size={18} className="ts-overlay__open" />
          </summary>
          <ControlPanel layers={layers} tools={tools} />
          <ClimateKey topic={topic} locale={locale} layers={state.layers} snapshot={snapshot} controller={controller} />
        </details>
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <ChapterAxis
          chapters={axisChapters}
          chapter={state.chapter}
          beat={state.beat}
          open={open}
          onOpen={(panelsOpen) => hud.setState({ panelsOpen })}
          onChapter={(id) => store.getState().goToChapter(id)}
          onBeat={(id, index) => applyBeat(id, index)}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="readerTop">
        <details className="clim-phone-month" data-climatology-phone>
          <summary>CLIMATOLOGY · {monthText(state.month, locale)}</summary>
          {monthControl}
          <ClimateCellControls
            windLayerId={activeWindId}
            controller={controller}
            selected={selectedCell}
            locale={locale}
            onInspect={selectCell}
            compact
          />
        </details>
        <ClimatologyReaderTop
          chapter={chapter}
          beat={state.beat}
          month={state.month}
          authoredMonth={authoredMonth}
          onStep={step}
          canPrev={at > 0}
          canNext={at >= 0 && at < presentation.beats.length - 1}
          selectedSite={geo.events.find((s) => s.id === selectedSite)}
          sites={geo.events}
          onClose={clearSelection}
          cellDetail={cellDetail}
          selectionKey={selectedCell?.join(',')}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="readerEnd">
        <ClimatologyIndex
          ids={(chapter.state as ClimatologyChapterState).index ?? []}
          sites={geo.events}
          onSelect={selectSite}
          selected={selectedSite}
          locale={locale}
        />
      </SceneSlot>
    </div>
  );
}
