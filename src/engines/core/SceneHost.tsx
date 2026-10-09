/**
 * SceneHost: the React island mounted by every topic page.
 *
 * - builds the scene store from the engine descriptor + chapters, and the HUD
 *   store engines register their controls with (controls.ts)
 * - applies deep links (URL -> store) and keeps the URL in sync (store -> URL)
 * - applies the theme (user override > scene > topic)
 * - renders the technical-plate layout (docs/08 §2): the stage fills the
 *   page, the HUD floats over it (top bar, title block + chapter rail, card +
 *   overlay column, bottom dock with panels and the engine bar), the reading
 *   InfoPanel is a docked column >= 1024px (collapsible to a 28 px strip,
 *   kept per tab in sessionStorage) and a bottom sheet below
 * - the reading panel's collapse is the user's choice and sticky: a chapter
 *   change never re-expands it, it only flashes the handle / strip (`data-flash`)
 * - owns the keyboard (keys.ts), HUD scaling (`--k`) and `window.__atlas`
 * - handles the static chapter-body controls by delegation: `<FlyTo>`
 *   (`data-flyto` -> the engine's camera preset, same action as the VIEW
 *   buttons) and source superscripts (`data-source` -> SourcePopover)
 * - fetches the topic's engine data (`dataUrl`, a build-time static file, so it
 *   is not embedded in the page HTML) and only then mounts the lazily loaded
 *   engine view on the client (engines may touch window / WebGL freely; the
 *   server renders a stage placeholder). `__atlas.ready` waits for both.
 */
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';
import type { Chapter, SceneProps, SceneSnapshot, UrlEngineFields } from './types';
import { createSceneStore } from './store';
import { SceneContext, type SceneContextValue, type SlotName } from './context';
import { decodeSceneState, startUrlSync, type UrlState } from './url-state';
import { createHudActions, createHudStore, trackCamera } from './controls';
import { useSceneKeys } from './keys';
import { installTestApi } from './test-api';
import { BottomPanels, CardFrame, TitleBlock, TopBar } from './Hud';
import { getEngine, getEngineView } from '../registry';
import { t, tx, type BilingualText } from '../../i18n';
import { applyTheme, resolveTheme } from '../../theme/theme';
import { getReaderExpanded, setReaderExpanded, setThemeOverride, useThemeOverride } from '../../lib/prefs';
import { ChapterRail } from '../widgets/ChapterRail';
import { InfoPanel } from '../widgets/InfoPanel';
import { ChapterBodies } from '../widgets/ChapterBodies';
import { QuizCard } from '../widgets/QuizCard';
import { SourcePopover, topicSources } from '../widgets/SourcePopover';

export interface SceneHostProps extends SceneProps {
  /**
   * All chapter bodies (Astro default slot): one `<article data-chapter-body=id>`
   * per chapter, MDX already rendered for this locale. See ChapterBodies.
   */
  children?: ReactNode;
  /** Pathname of this page including the base (for the language link). */
  path: string;
  /** Href of the topic index for this locale. */
  indexHref: string;
}

/** Below this width the HUD is not scaled (phone layout, docs/08 §2). */
const PHONE_MAX = 759;

/** HUD type never drops below this share of its 1080p size (`--kt`, legibility floor). */
const HUD_TYPE_FLOOR = 0.8;

/** How long the collapsed reader's handle flashes after a chapter change (two pulses). */
const READER_FLASH_MS = 900;

/** `--k = clamp(min(W/1920, H/1080), .6, 1.6)`; 1 on phones. */
export function hudScale(width: number, height: number): number {
  if (width <= PHONE_MAX) return 1;
  return Math.min(1.6, Math.max(0.6, Math.min(width / 1920, height / 1080)));
}

class StageErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[atlas] engine failed to render', error, info.componentStack);
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function StagePlaceholder({ label }: { label: string }) {
  return (
    <div className="atlas-stage__placeholder" role="status">
      <span className="atlas-stage__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

const isBilingual = (v: unknown): v is BilingualText =>
  typeof v === 'object' && v !== null && typeof (v as { en?: unknown }).en === 'string';

/** The reading panel's header sentence: the chapter's `summary`, else its `question`. */
function chapterSummary(chapter: Chapter | null): BilingualText | null {
  const state = (chapter?.state ?? {}) as { summary?: unknown; question?: unknown };
  if (isBilingual(state.summary)) return state.summary;
  if (isBilingual(state.question)) return state.question;
  return null;
}

/** Resolves the host's `mounted` promise once the engine view has committed. */
function MountSignal({ onMount }: { onMount(): void }) {
  useEffect(() => onMount(), [onMount]);
  return null;
}

type DataState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: unknown };

/** One fetch per URL per page load (StrictMode / remounts reuse it; a failure is retried). */
const dataRequests = new Map<string, Promise<unknown>>();
function loadEngineData(url: string): Promise<unknown> {
  let request = dataRequests.get(url);
  if (!request) {
    request = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json() as Promise<unknown>;
    });
    request.catch(() => dataRequests.delete(url));
    dataRequests.set(url, request);
  }
  return request;
}

export default function SceneHost(props: SceneHostProps) {
  const { topic, chapters, dataUrl, locale, path, indexHref } = props;
  const engine = getEngine(topic.engine);
  const EngineView = getEngineView(topic.engine);

  const defaultsFor = useCallback(
    (data: unknown): SceneSnapshot => ({
      chapter: null,
      layers: [],
      camera: null,
      theme: undefined,
      ...engine.defaults(topic, data),
    }),
    [engine, topic],
  );

  const [store] = useState(() =>
    createSceneStore({
      chapters,
      // Data-dependent defaults are filled in by `rebase` once the data file has loaded.
      defaults: defaultsFor(undefined),
      fromChapterState: engine.fromChapterState,
      initialChapter: props.initialState?.chapter ?? null,
    }),
  );
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' });
  const data = dataState.status === 'ready' ? dataState.data : undefined;
  const [hud] = useState(createHudStore);

  /* ---------------- client-only bits ---------------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Engine data: fetched on the client, then the store is rebased onto data-dependent defaults.
  useEffect(() => {
    let cancelled = false;
    loadEngineData(dataUrl).then(
      (loaded) => {
        if (cancelled) return;
        store.getState().rebase(defaultsFor(loaded) as SceneSnapshot);
        setDataState({ status: 'ready', data: loaded });
      },
      (error: unknown) => {
        console.error('[atlas] engine data failed to load', error);
        if (!cancelled) setDataState({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [dataUrl, store, defaultsFor]);
  const dataReady = dataState.status === 'ready';

  // Camera preset tracking (FREE CAMERA after user moves). Subscribes before the deep link below.
  const [camera] = useState(() => {
    let tracker: ReturnType<typeof trackCamera> | null = null;
    return {
      start: () => {
        tracker = trackCamera(hud, store, (ch) => store.getState().chapterTarget(ch).camera);
        return () => tracker?.dispose();
      },
      suppress: (fn: () => void) => (tracker ? tracker.suppress(fn) : fn()),
    };
  });
  useEffect(() => camera.start(), [camera]);
  const actions = useMemo(() => createHudActions(hud, camera), [hud, camera]);

  // Deep link in (after the data-dependent defaults are in place), then keep the URL in sync.
  useEffect(() => {
    if (!dataReady) return;
    const decoded = decodeSceneState(window.location.search);
    const { t: time, highlight, part, view, explode, run, cutaway, ...common } = decoded;
    const engineFields: UrlEngineFields = { t: time, highlight, part, view, explode, run, cutaway };
    const patch = { ...common, ...engine.fromUrl(engineFields) };
    if (Object.keys(patch).length > 0) store.getState().hydrate(patch);
    return startUrlSync({
      read: () => store.getState().snapshot() as UrlState,
      baseline: (state) => store.getState().chapterTarget(state.chapter ?? null) as UrlState,
      subscribe: (listener) => store.subscribe(listener),
    });
  }, [store, engine, dataReady]);

  // Theme: user override > scene (URL / chapter) > topic default.
  const sceneTheme = useStore(store, (s) => s.theme);
  const [themeOverride] = useThemeOverride();
  useEffect(() => {
    applyTheme(resolveTheme({ override: themeOverride, scene: sceneTheme, topic: topic.theme }));
  }, [themeOverride, sceneTheme, topic.theme]);

  /* ---------------- chapters ---------------- */
  const currentId = useStore(store, (s) => s.chapter);
  const index = chapters.findIndex((c) => c.id === currentId);
  const chapter: Chapter | null = chapters[index] ?? null;
  const chapterNumber = Math.max(0, index) + 1;

  const hasPrev = index > 0;
  const hasNext = index < chapters.length - 1;
  const step = useCallback(
    (delta: 1 | -1) => {
      store.getState().stepChapter(delta);
    },
    [store],
  );

  useSceneKeys(hud, actions, step);

  /* ---------------- HUD: visibility, labels, scale ---------------- */
  const hudOn = useStore(hud, (s) => s.hud);
  const labelsOn = useStore(hud, (s) => s.labels);
  const readerOpen = useStore(hud, (s) => s.reader);
  // Docked reading panel: expanded unless this tab collapsed it (sessionStorage, not the URL).
  useEffect(() => {
    hud.setState({ reader: getReaderExpanded() });
    return hud.subscribe((s, prev) => {
      if (s.reader !== prev.reader) setReaderExpanded(s.reader);
    });
  }, [hud]);
  // A collapsed reader stays collapsed when the chapter changes; its handle flashes to say new text is there.
  const readerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let timer = 0;
    const flash = () => {
      const el = readerRef.current;
      if (!el) return;
      el.removeAttribute('data-flash');
      void el.offsetWidth; // restart the animation
      el.setAttribute('data-flash', '');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.removeAttribute('data-flash'), READER_FLASH_MS);
    };
    const unsubscribe = store.subscribe((s, prev) => {
      if (s.transition.id !== prev.transition.id && s.transition.reason === 'chapter' && s.chapter !== prev.chapter && !hud.getState().reader) flash();
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [store, hud]);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const update = () => setK(hudScale(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const scaleStyle = {
    '--k': String(k),
    '--kt': String(Math.max(HUD_TYPE_FLOOR, k)),
    '--kb': String(Math.max(1, k)),
  } as CSSProperties;

  const [sheetOpen, setSheetOpen] = useState(false);

  /* ---------------- chapter-body controls (static HTML, delegated) ---------------- */
  const sceneRef = useRef<HTMLDivElement>(null);
  const sources = useMemo(() => topicSources(data), [data]);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const button = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-flyto]') : null;
      if (!button || !el.contains(button)) return;
      e.preventDefault();
      // Same path as the VIEW buttons and digit keys; on phones fold the sheet so the map shows.
      if (actions.setPreset(button.dataset.flyto ?? '')) setSheetOpen(false);
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [actions]);

  /* ---------------- slots ---------------- */
  const [slots, setSlots] = useState<Partial<Record<SlotName, Element | null>>>({});
  const slotRef = useMemo(() => {
    const cache = new Map<SlotName, (el: Element | null) => void>();
    return (name: SlotName) => {
      let ref = cache.get(name);
      if (!ref) {
        ref = (el: Element | null) => setSlots((prev) => (prev[name] === el ? prev : { ...prev, [name]: el }));
        cache.set(name, ref);
      }
      return ref;
    };
  }, []);

  const context = useMemo<SceneContextValue>(
    () => ({ store, hud, actions, topic, chapters, locale, slots }),
    [store, hud, actions, topic, chapters, locale, slots],
  );

  /* ---------------- window.__atlas ---------------- */
  const [viewMounted] = useState(() => {
    let resolve: () => void = () => {};
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
  });
  // A failed data load never mounts the view; let `__atlas.ready` settle (it resolves false) instead of hanging.
  useEffect(() => {
    if (dataState.status === 'error') viewMounted.resolve();
  }, [dataState.status, viewMounted]);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      installTestApi({
        store,
        hud,
        actions,
        chapterIds: chapters.map((c) => c.id),
        mounted: viewMounted.promise,
        stage: () => stageRef.current,
        setTheme: (theme) => setThemeOverride(theme),
      }),
    [store, hud, actions, chapters, viewMounted],
  );

  return (
    <SceneContext.Provider value={context}>
      <div
        ref={sceneRef}
        className="atlas-scene"
        data-engine={topic.engine}
        data-stage={topic.stage}
        data-hud={hudOn ? 'on' : 'off'}
        data-labels={labelsOn ? 'on' : 'off'}
        data-sheet={sheetOpen ? 'open' : 'closed'}
        data-reader={readerOpen ? 'open' : 'collapsed'}
        style={scaleStyle}
      >
        <main id="atlas-main" className="atlas-stage-area">
          <div ref={stageRef} className="atlas-stage" aria-label={t(locale, 'scene.stage')} role="region">
            {dataState.status === 'error' ? (
              <StagePlaceholder label={t(locale, 'scene.error')} />
            ) : mounted && dataReady ? (
              <StageErrorBoundary fallback={<StagePlaceholder label={t(locale, 'scene.error')} />}>
                <Suspense fallback={<StagePlaceholder label={t(locale, 'scene.loading')} />}>
                  <EngineView topic={topic} chapters={chapters} data={data} locale={locale} />
                  <MountSignal onMount={viewMounted.resolve} />
                </Suspense>
              </StageErrorBoundary>
            ) : (
              <StagePlaceholder label={t(locale, 'scene.loading')} />
            )}
          </div>
          <svg ref={slotRef('leaders')} className="atlas-leaders hud-fade" aria-hidden="true" />
          <div className="atlas-grain" aria-hidden="true" />
        </main>

        <TopBar
          topic={topic}
          chapters={chapters}
          chapter={currentId}
          chapterNumber={chapterNumber}
          locale={locale}
          path={path}
          indexHref={indexHref}
          hud={hud}
          actions={actions}
        />

        <div className="atlas-hud hud-fade">
          <div className="atlas-hud__left">
            <TitleBlock
              topic={topic}
              chapter={chapter}
              chapterNumber={chapterNumber}
              chapterCount={chapters.length}
              locale={locale}
              hud={hud}
            />
            <ChapterRail
              chapters={chapters}
              currentId={currentId}
              locale={locale}
              onSelect={(id) => store.getState().goToChapter(id)}
            />
          </div>
          <div className="atlas-hud__right">
            <CardFrame hud={hud} slotRef={slotRef} locale={locale} />
            <div ref={slotRef('stageOverlay')} className="atlas-stage__overlay" data-hud-panel="overlay" />
          </div>
          <div className="atlas-hud__dock">
            <div ref={slotRef('perf')} className="atlas-perf" data-hud-panel="perf" />
            <BottomPanels hud={hud} slotRef={slotRef} locale={locale} />
            <div
              ref={slotRef('bottomBar')}
              className="atlas-bottombar"
              role="toolbar"
              aria-label={t(locale, 'scene.controls')}
              data-hud-panel="bar"
            />
          </div>
        </div>

        <aside ref={readerRef} className="atlas-reader hud-fade" data-hud-panel="reader">
          <button
            type="button"
            className="atlas-reader__handle"
            aria-expanded={true}
            aria-controls="atlas-panel-scroll"
            aria-label={t(locale, 'hud.reader.collapse')}
            title={t(locale, 'hud.reader.collapse')}
            onClick={(e) => {
              actions.setReader(false);
              if (e.detail > 0) e.currentTarget.blur();
            }}
          >
            <i aria-hidden="true" />
          </button>
          <button
            type="button"
            className="atlas-reader__strip"
            aria-expanded={false}
            aria-label={t(locale, 'hud.reader.expand')}
            title={t(locale, 'hud.reader.expand')}
            onClick={(e) => {
              actions.setReader(true);
              if (e.detail > 0) e.currentTarget.blur();
            }}
          >
            <i aria-hidden="true" />
            <b>{String(chapterNumber).padStart(2, '0')}</b>
            {chapter && <span>{tx(chapter.title, locale)}</span>}
          </button>
          <InfoPanel
            chapter={chapter}
            index={Math.max(0, index)}
            total={chapters.length}
            locale={locale}
            summary={chapterSummary(chapter)}
            body={props.children ? <ChapterBodies currentId={currentId}>{props.children}</ChapterBodies> : undefined}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            expanded={sheetOpen}
            onToggleExpanded={() => setSheetOpen((v) => !v)}
          >
            <div ref={slotRef('inspector')} className="atlas-inspector" aria-label={t(locale, 'scene.details')} />
            {chapter?.quiz.map((item, i) => <QuizCard key={`${chapter.id}-${i}`} item={item} locale={locale} />)}
          </InfoPanel>
        </aside>

        <button type="button" className="atlas-hud-restore" onClick={() => actions.setHud(true)} tabIndex={hudOn ? -1 : 0}>
          <kbd>H</kbd> {t(locale, 'hud.show')}
        </button>
        {mounted && <SourcePopover root={sceneRef} sources={sources} locale={locale} />}
      </div>
    </SceneContext.Provider>
  );
}
