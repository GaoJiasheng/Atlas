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
 *   InfoPanel is a docked column >= 1024px and a bottom sheet below
 * - owns the keyboard (keys.ts), HUD scaling (`--k`) and `window.__atlas`
 * - lazy-loads the engine view on the client only (engines may touch
 *   window / WebGL freely; the server renders a stage placeholder)
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
import type { Chapter, SceneProps, UrlEngineFields } from './types';
import { createSceneStore } from './store';
import { SceneContext, type SceneContextValue, type SlotName } from './context';
import { decodeSceneState, startUrlSync, type UrlState } from './url-state';
import { createHudActions, createHudStore, trackCamera } from './controls';
import { useSceneKeys } from './keys';
import { installTestApi } from './test-api';
import { BottomPanels, CardFrame, TitleBlock, TopBar } from './Hud';
import { getEngine, getEngineView } from '../registry';
import { t } from '../../i18n';
import { applyTheme, resolveTheme } from '../../theme/theme';
import { setThemeOverride, useLevel, useParentMode, useThemeOverride } from '../../lib/prefs';
import { isAboveLevel } from '../../lib/levels';
import { ChapterRail, isChapterCollapsed } from '../widgets/ChapterRail';
import { InfoPanel } from '../widgets/InfoPanel';
import { ChapterBodies } from '../widgets/ChapterBodies';
import { QuizCard } from '../widgets/QuizCard';

export interface SceneHostProps extends SceneProps<unknown> {
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

/** Resolves the host's `mounted` promise once the engine view has committed. */
function MountSignal({ onMount }: { onMount(): void }) {
  useEffect(() => onMount(), [onMount]);
  return null;
}

export default function SceneHost(props: SceneHostProps) {
  const { topic, chapters, data, locale, path, indexHref } = props;
  const engine = getEngine(topic.engine);
  const EngineView = getEngineView(topic.engine);

  const [store] = useState(() =>
    createSceneStore({
      chapters,
      defaults: {
        chapter: null,
        layers: [],
        camera: null,
        theme: undefined,
        ...engine.defaults(topic, data),
      },
      fromChapterState: engine.fromChapterState,
      initialChapter: props.initialState?.chapter ?? null,
    }),
  );
  const [hud] = useState(createHudStore);

  /* ---------------- client-only bits ---------------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  // Deep link in, then keep the URL in sync.
  useEffect(() => {
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
  }, [store, engine]);

  // Theme: user override > scene (URL / chapter) > topic default.
  const sceneTheme = useStore(store, (s) => s.theme);
  const [themeOverride] = useThemeOverride();
  useEffect(() => {
    applyTheme(resolveTheme({ override: themeOverride, scene: sceneTheme, topic: topic.theme }));
  }, [themeOverride, sceneTheme, topic.theme]);

  /* ---------------- chapters ---------------- */
  const [readerLevel] = useLevel();
  const [parentMode] = useParentMode();
  const currentId = useStore(store, (s) => s.chapter);
  const index = chapters.findIndex((c) => c.id === currentId);
  const chapter: Chapter | null = chapters[index] ?? null;
  const chapterNumber = Math.max(0, index) + 1;

  const canEnter = useCallback(
    (c: Chapter) => !isChapterCollapsed(c, readerLevel, parentMode),
    [readerLevel, parentMode],
  );
  const hasPrev = chapters.slice(0, Math.max(0, index)).some(canEnter);
  const hasNext = chapters.slice(index + 1).some(canEnter);
  const step = useCallback(
    (delta: 1 | -1) => {
      store.getState().stepChapter(delta, canEnter);
    },
    [store, canEnter],
  );

  useSceneKeys(hud, actions, step);

  /* ---------------- HUD: visibility, labels, scale ---------------- */
  const hudOn = useStore(hud, (s) => s.hud);
  const labelsOn = useStore(hud, (s) => s.labels);
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
    () => ({ store, hud, topic, chapters, locale, slots }),
    [store, hud, topic, chapters, locale, slots],
  );

  /* ---------------- window.__atlas ---------------- */
  const [viewMounted] = useState(() => {
    let resolve: () => void = () => {};
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
  });
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

  const tooYoung = chapter ? !parentMode && isAboveLevel(chapter.level, readerLevel) : false;

  return (
    <SceneContext.Provider value={context}>
      <div
        className="atlas-scene"
        data-engine={topic.engine}
        data-stage={topic.stage}
        data-hud={hudOn ? 'on' : 'off'}
        data-labels={labelsOn ? 'on' : 'off'}
        data-sheet={sheetOpen ? 'open' : 'closed'}
        style={scaleStyle}
      >
        <main id="atlas-main" className="atlas-stage-area">
          <div ref={stageRef} className="atlas-stage" aria-label={t(locale, 'scene.stage')} role="region">
            {mounted ? (
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
              readerLevel={readerLevel}
              parentMode={parentMode}
              onSelect={(id) => store.getState().goToChapter(id)}
            />
          </div>
          <div className="atlas-hud__right">
            <CardFrame hud={hud} slotRef={slotRef} />
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

        <aside className="atlas-reader hud-fade" data-hud-panel="reader">
          <InfoPanel
            chapter={chapter}
            index={Math.max(0, index)}
            total={chapters.length}
            locale={locale}
            body={props.children ? <ChapterBodies currentId={currentId}>{props.children}</ChapterBodies> : undefined}
            tooYoung={tooYoung}
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
      </div>
    </SceneContext.Provider>
  );
}
