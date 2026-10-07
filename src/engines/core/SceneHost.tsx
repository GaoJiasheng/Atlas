/**
 * SceneHost: the React island mounted by every topic page.
 *
 * - builds the scene store from the engine descriptor + chapters
 * - applies deep links (URL -> store) and keeps the URL in sync (store -> URL)
 * - applies the theme (user override > scene > topic)
 * - renders the shared layout: top bar, ChapterRail, stage, InfoPanel,
 *   bottom bar, and exposes slots engines portal into (<SceneSlot>)
 * - lazy-loads the engine view on the client only (engines may touch
 *   window / WebGL freely; the server renders a stage placeholder)
 */
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';
import type { Chapter, SceneProps, UrlEngineFields } from './types';
import { createSceneStore } from './store';
import { SceneContext, type SceneContextValue, type SlotName } from './context';
import { decodeSceneState, startUrlSync, type UrlState } from './url-state';
import { getEngine, getEngineView } from '../registry';
import { t, tx } from '../../i18n';
import { applyTheme, resolveTheme } from '../../theme/theme';
import { useLevel, useParentMode, useThemeOverride } from '../../lib/prefs';
import { isAboveLevel } from '../../lib/levels';
import { ChapterRail, isChapterCollapsed } from '../widgets/ChapterRail';
import { InfoPanel } from '../widgets/InfoPanel';
import { ChapterBodies } from '../widgets/ChapterBodies';
import { QuizCard } from '../widgets/QuizCard';
import { GlobalToggles } from '../widgets/GlobalToggles';
import { Icon } from '../widgets/icons';

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

/** Elements that use ← / → themselves; chapter navigation keys are ignored inside them. */
const OWN_ARROW_KEYS =
  'input, select, textarea, [contenteditable="true"], [role="slider"], [role="radiogroup"], [role="tablist"], [data-keys="own"]';

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

  /* ---------------- client-only bits ---------------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Deep link in, then keep the URL in sync.
  useEffect(() => {
    const decoded = decodeSceneState(window.location.search);
    const { t: time, part, view, explode, run, ...common } = decoded;
    const engineFields: UrlEngineFields = { t: time, part, view, explode, run };
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

  const canEnter = useCallback(
    (c: Chapter) => !isChapterCollapsed(c, readerLevel, parentMode),
    [readerLevel, parentMode],
  );
  const hasPrev = chapters.slice(0, Math.max(0, index)).some(canEnter);
  const hasNext = chapters.slice(index + 1).some(canEnter);
  const step = useCallback((delta: 1 | -1) => store.getState().stepChapter(delta, canEnter), [store, canEnter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(OWN_ARROW_KEYS)) return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  /* ---------------- slots ---------------- */
  const [slots, setSlots] = useState<Partial<Record<SlotName, HTMLElement | null>>>({});
  const slotRefs = useMemo(() => {
    const make = (name: SlotName) => (el: HTMLElement | null) =>
      setSlots((prev) => (prev[name] === el ? prev : { ...prev, [name]: el }));
    return { bottomBar: make('bottomBar'), stageOverlay: make('stageOverlay'), inspector: make('inspector') };
  }, []);

  const context = useMemo<SceneContextValue>(
    () => ({ store, topic, chapters, locale, slots }),
    [store, topic, chapters, locale, slots],
  );

  const tooYoung = chapter ? !parentMode && isAboveLevel(chapter.level, readerLevel) : false;

  return (
    <SceneContext.Provider value={context}>
      <div className="atlas-scene" data-engine={topic.engine} data-stage={topic.stage}>
        <header className="atlas-topbar">
          <a className="atlas-control atlas-control--ghost atlas-topbar__back" href={indexHref}>
            <Icon name="arrow-left" />
            <span className="atlas-control__label">{t(locale, 'nav.topics')}</span>
          </a>
          <div className="atlas-topbar__title">
            <h1>{tx(topic.title, locale)}</h1>
            <p>{tx(topic.subtitle, locale)}</p>
          </div>
          <GlobalToggles locale={locale} path={path} />
        </header>

        <aside className="atlas-scene__rail">
          <ChapterRail
            chapters={chapters}
            currentId={currentId}
            locale={locale}
            readerLevel={readerLevel}
            parentMode={parentMode}
            onSelect={(id) => store.getState().goToChapter(id)}
          />
        </aside>

        <main id="atlas-main" className="atlas-scene__main">
          <div className="atlas-stage" aria-label={t(locale, 'scene.stage')} role="region">
            {mounted ? (
              <StageErrorBoundary fallback={<StagePlaceholder label={t(locale, 'scene.error')} />}>
                <Suspense fallback={<StagePlaceholder label={t(locale, 'scene.loading')} />}>
                  <EngineView topic={topic} chapters={chapters} data={data} locale={locale} />
                </Suspense>
              </StageErrorBoundary>
            ) : (
              <StagePlaceholder label={t(locale, 'scene.loading')} />
            )}
            <div ref={slotRefs.stageOverlay} className="atlas-stage__overlay" />
          </div>
          <div ref={slotRefs.bottomBar} className="atlas-bottombar" role="toolbar" aria-label={t(locale, 'scene.controls')} />
        </main>

        <aside className="atlas-scene__panel">
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
          >
            <div ref={slotRefs.inspector} className="atlas-inspector" aria-label={t(locale, 'scene.details')} />
            {chapter?.quiz.map((item, i) => <QuizCard key={`${chapter.id}-${i}`} item={item} locale={locale} />)}
          </InfoPanel>
        </aside>
      </div>
    </SceneContext.Provider>
  );
}
