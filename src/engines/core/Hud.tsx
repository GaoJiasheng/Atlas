/**
 * Technical-plate HUD pieces drawn by SceneHost (docs/08 §2): top bar (left:
 * brand + chapter number chips; centre: the VIEW group of camera presets and
 * the PRESENT button; right: LOOK and language), status line (doc id first)
 * and key hint; the title block pressed onto the stage; the card /
 * bottom-panel frames engines fill through slots (the three panels fold into
 * one 28 px bar). Mode switches are not in the top bar, except PRESENT: engines
 * place the others in their control panel (`widgets/ControlPanel.tsx`, stage
 * overlay). Sizes are in design pixels scaled by `--u` (see scene.css).
 */
import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { useStore } from 'zustand';
import type { Chapter, Locale, TopicMeta } from './types';
import { chapterNumbers, isBackground } from './chapters';
import {
  activePreset,
  allModes,
  docId,
  PANEL_SLOTS,
  presetDigit,
  presetKeyHint,
  type HudActions,
  type HudStore,
  type HudText,
  type ModeTone,
  type PanelSlot,
  type SpecRow,
} from './controls';
import type { SlotName } from './context';
import { t, tx, type BilingualText, type UiKey } from '../../i18n';
import { GlobalToggles } from '../widgets/GlobalToggles';

const upper = (s: string) => s.toLocaleUpperCase('en');

/** Keep focus off HUD buttons after a pointer click, so SPACE / keys go to the scene. */
function blurAfterPointer(e: MouseEvent<HTMLElement>) {
  if (e.detail > 0) e.currentTarget.blur();
}

export function HudButton({
  on,
  tone,
  disabled,
  title,
  children,
  onClick,
  ...data
}: {
  on?: boolean;
  tone?: ModeTone;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  onClick(): void;
  'data-preset'?: string;
}) {
  return (
    <button
      type="button"
      className={on ? 'hud-btn on' : 'hud-btn'}
      data-tone={tone && tone !== 'ink' ? tone : undefined}
      aria-pressed={on === undefined ? undefined : on}
      disabled={disabled}
      title={title}
      aria-label={title}
      onClick={(e) => {
        onClick();
        blurAfterPointer(e);
      }}
      {...data}
    >
      {children}
    </button>
  );
}

function HudGroup({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className ? `hud-group ${className}` : 'hud-group'} role="group" aria-label={label}>
      <span className="hud-group__label" aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

export interface TopBarProps {
  topic: TopicMeta;
  chapters: readonly Chapter[];
  chapter: string | null;
  chapterNumber: number;
  locale: Locale;
  path: string;
  indexHref: string;
  hud: HudStore;
  actions: HudActions;
  /** A chapter chip was pressed (same path as the rail: fly there, and in TimeScene run the time). */
  onChapter(id: string): void;
}

export function TopBar({ topic, chapters, chapter, chapterNumber, locale, path, indexHref, hud, actions, onChapter }: TopBarProps) {
  const tr = (key: UiKey, vars?: Record<string, string | number>) => t(locale, key, vars);
  const controls = useStore(hud, (s) => s.controls);
  const labels = useStore(hud, (s) => s.labels);
  const free = useStore(hud, (s) => s.cameraFree);
  const active = useStore(hud, (s) => activePreset(s, chapter));
  const presets = controls.presets?.items ?? [];
  const modes = allModes(controls, labels, tr('hud.mode.labels'));
  const pause = controls.pause;
  const present = modes.find((m) => m.id === 'presentation');
  const numbers = chapterNumbers(chapters);

  const presetIndex = presets.findIndex((p) => p.id === active);
  const view =
    presetIndex >= 0
      ? tr('hud.viewN', { n: tx(presets[presetIndex]!.label, locale) })
      : free || !chapter
        ? tr('hud.free')
        : tr('hud.chapterView', { n: String(chapterNumber).padStart(2, '0') });
  const status = [
    view,
    ...(pause ? [pause.paused ? tr('hud.paused') : tr('hud.running')] : []),
    ...modes.filter((m) => m.on && m.id !== 'labels').map((m) => m.status ?? tx(m.label, locale)),
    ...(controls.status ?? []),
  ].map(upper);

  const modeKeys = modes.map((m) => m.key).filter((k): k is string => !!k);
  const presetTitle = (i: number, title?: HudText) =>
    title ? tx(title, locale) : tr('hud.presetTitle', { n: i + 1, title: tx(chapters[i]?.title, locale) });
  // A digit beside the label (1–9, then 0 for the tenth; none after), unless the label already is the number (`01`).
  const digit = (i: number, label: HudText) => (/^\d+$/.test(tx(label, 'en')) ? null : presetDigit(i));

  return (
    <header className="atlas-topbar" data-hud-panel="topbar">
      <div className="atlas-topbar__row">
        <div className="atlas-topbar__left">
          <a className="atlas-brand" href={indexHref} aria-label={tr('nav.backToTopics')}>
            <b aria-hidden="true" />
            <span>
              ATLAS · {upper(tr(`subject.${topic.subject}` as UiKey))}
            </span>
          </a>
          {chapters.length > 1 && (
            <nav className="atlas-chips" aria-label={tr('hud.chapterNav')}>
              {chapters.map((c) => {
                const bg = isBackground(c);
                const current = c.id === chapter;
                const title = tx(c.title, locale);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={current ? 'hud-btn atlas-chip-btn on' : 'hud-btn atlas-chip-btn'}
                    data-chapter={c.id}
                    aria-current={current ? 'step' : undefined}
                    aria-label={bg ? `${tr('chapter.background')}: ${title}` : `${pad2(numbers.get(c.id) ?? 0)}: ${title}`}
                    title={title}
                    onClick={(e) => {
                      onChapter(c.id);
                      blurAfterPointer(e);
                    }}
                  >
                    {bg ? tr('chapter.backgroundShort') : pad2(numbers.get(c.id) ?? 0)}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
        {(presets.length > 0 || present) && (
          <div className="atlas-topbar__ctl">
            {presets.length > 0 && (
              <HudGroup label={upper(tr('hud.view'))} className="hud-group--view">
                {presets.map((p, i) => {
                  const d = digit(i, p.label);
                  return (
                    <HudButton
                      key={p.id}
                      data-preset={p.id}
                      on={p.id === active}
                      title={presetTitle(i, p.title) + (d ? ` (${d})` : '')}
                      onClick={() => actions.setPreset(p.id)}
                    >
                      {tx(p.label, locale)}
                      {d && <small aria-hidden="true">{d}</small>}
                    </HudButton>
                  );
                })}
              </HudGroup>
            )}
            {present && (
              <button
                type="button"
                className="hud-btn hud-btn--present"
                data-mode="presentation"
                aria-pressed={present.on}
                disabled={present.disabled && !present.on}
                title={`${tr('present.hint')} (${upper(present.key ?? 'P')})`}
                onClick={(e) => {
                  actions.setMode('presentation', !present.on);
                  blurAfterPointer(e);
                }}
              >
                <i aria-hidden="true">▶</i> {upper(t('en', 'present.button'))}
                <small lang="zh-Hans">{t('zh', 'present.button')}</small>
              </button>
            )}
          </div>
        )}
        <GlobalToggles locale={locale} path={path} variant="hud" />
      </div>
      <div className="atlas-topbar__sub">
        <p className="atlas-status" role="status">
          <span className="atlas-docid">{docId(topic.id, chapterNumber)} · </span>
          {status.join(' · ')}
        </p>
        <p className="atlas-hint" aria-hidden="true">
          {presets.length > 0 && (
            <span>
              <kbd>{presetKeyHint(presets.length)}</kbd> {tr('hud.keys.views')}
            </span>
          )}
          {modeKeys.length > 0 && (
            <span>
              <kbd>{modeKeys.map(upper).join(' ')}</kbd> {tr('hud.keys.modes')}
            </span>
          )}
          {pause && (
            <span>
              <kbd>SPACE</kbd> {tr('hud.keys.pause')}
            </span>
          )}
          <span>
            <kbd>H</kbd> {tr('hud.keys.hud')}
          </span>
          <span>
            <kbd>← →</kbd> {tr('hud.keys.chapter')}
          </span>
        </p>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Title block                                                         */
/* ------------------------------------------------------------------ */

function Bi({ text }: { text: BilingualText }) {
  return (
    <>
      {text.en}
      {text.zh && text.zh !== text.en && <small lang="zh-Hans">{text.zh}</small>}
    </>
  );
}

const bi = (key: UiKey): BilingualText => ({ en: t('en', key), zh: t('zh', key) });

export function defaultSpecRows(topic: TopicMeta, chapterCount: number, locale: Locale): SpecRow[] {
  return [
    { id: 'subject', label: bi('spec.subject'), value: t(locale, `subject.${topic.subject}` as UiKey) },
    { id: 'chapters', label: bi('spec.chapters'), value: String(chapterCount).padStart(2, '0'), mono: true },
    { id: 'syllabus', label: bi('spec.syllabus'), value: String(topic.moe.length), mono: true },
  ];
}

const MAX_SPEC_ROWS = 8;

export function TitleBlock({
  topic,
  chapter,
  chapterNumber,
  chapterCount,
  locale,
  hud,
}: {
  topic: TopicMeta;
  chapter: Chapter | null;
  chapterNumber: number;
  chapterCount: number;
  locale: Locale;
  hud: HudStore;
}) {
  const extra = useStore(hud, (s) => s.controls.specRows);
  const rows = [...defaultSpecRows(topic, chapterCount, locale), ...(extra ?? [])].slice(0, MAX_SPEC_ROWS);
  const words = topic.title.en.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const zhLine = [topic.title.zh, topic.subtitle.zh].filter((s) => s && s.trim()).join(' · ');
  // Kicker: chapter title in the page language, the other language small beside it.
  const other = chapter ? (locale === 'zh' ? chapter.title.en : chapter.title.zh) : undefined;

  return (
    <section className="atlas-title" data-hud-panel="title" aria-label={tx(topic.title, locale)}>
      <p className="atlas-title__kick">
        {upper(t(locale, 'hud.plate'))} {String(chapterNumber).padStart(2, '0')}
        {chapter && (
          <>
            {' · '}
            {upper(tx(chapter.title, locale))}
            {other && <small lang={locale === 'zh' ? 'en' : 'zh-Hans'}>{upper(other)}</small>}
          </>
        )}
      </p>
      <h1 className="atlas-title__h" lang="en">
        {words.length > 0 && `${words.join(' ')} `}
        <span>{last}</span>
      </h1>
      <p className="atlas-title__sub">
        <span lang="en">{topic.subtitle.en}</span>
        {zhLine && <small lang="zh-Hans">{zhLine}</small>}
      </p>
      <dl className="atlas-spec">
        {rows.map((row) => (
          <div key={row.id} className="atlas-spec__row">
            <dt>
              <Bi text={row.label} />
            </dt>
            <dd data-mono={row.mono || undefined}>
              {tx(row.value, locale)}
              {row.source && <span className="atlas-chip">{upper(t(locale, `source.${row.source}` as UiKey))}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="atlas-title__note">
        {upper(topic.note?.en ?? t('en', 'hud.note'))}
        {(topic.note ? topic.note.zh : t('zh', 'hud.note')) && (
          <>
            {' · '}
            <span lang="zh-Hans">{topic.note ? topic.note.zh : t('zh', 'hud.note')}</span>
          </>
        )}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Card + bottom panels (frames; engines fill the bodies via slots)    */
/* ------------------------------------------------------------------ */

function PanelHeader({ n, title }: { n: string; title: BilingualText }) {
  return (
    <h2 className="hud-ph">
      <i>{n}</i>
      {upper(title.en)}
      {title.zh && <em lang="zh-Hans">{title.zh}</em>}
    </h2>
  );
}

type SlotRef = (name: SlotName) => (el: Element | null) => void;

export function CardFrame({ hud, slotRef, locale }: { hud: HudStore; slotRef: SlotRef; locale: Locale }) {
  const title = useStore(hud, (s) => s.controls.card);
  const toggle = useStore(hud, (s) => s.controls.cardToggle);
  if (!title) return null;
  return (
    <section className="hud-panel atlas-card" data-hud-panel="card" data-expanded={toggle ? toggle.expanded : undefined}>
      {toggle ? (
        <button
          type="button"
          className="atlas-card__toggle"
          aria-expanded={toggle.expanded}
          title={t(locale, toggle.expanded ? 'hud.card.collapse' : 'hud.card.expand')}
          onClick={(e) => {
            toggle.set(!toggle.expanded);
            blurAfterPointer(e);
          }}
        >
          <PanelHeader n="A" title={title} />
          <i className="atlas-card__chev" aria-hidden="true" />
        </button>
      ) : (
        <PanelHeader n="A" title={title} />
      )}
      <div ref={slotRef('card')} className="hud-panel__body" />
    </section>
  );
}

/** How far the stage's bottom edge sits above the stage area's: the stage ends where the panel strip starts (`--stage-inset`). */
function useStageInset(strip: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    const el = strip.current;
    const scene = el?.closest<HTMLElement>('.atlas-scene');
    const area = scene?.querySelector<HTMLElement>('.atlas-stage-area');
    if (!el || !scene || !area || !active) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      const inset = r.height > 0 ? Math.max(0, Math.round(area.getBoundingClientRect().bottom - r.top)) : 0;
      scene.style.setProperty('--stage-inset', `${inset}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    ro.observe(area);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      scene.style.removeProperty('--stage-inset');
    };
  }, [strip, active]);
}

export function BottomPanels({
  hud,
  slotRef,
  locale,
  actions,
}: {
  hud: HudStore;
  slotRef: SlotRef;
  locale: Locale;
  actions: HudActions;
}) {
  const panels = useStore(hud, (s) => s.controls.panels);
  const expanded = useStore(hud, (s) => s.panelsOpen);
  const [tab, setTab] = useState<PanelSlot | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const filled = PANEL_SLOTS.filter((id) => panels?.[id]);
  useStageInset(strip, !!panels && filled.length > 0);
  if (!panels || filled.length === 0) return null;
  const current = tab && filled.includes(tab) ? tab : null;
  const fold = (open: boolean) => (e: MouseEvent<HTMLElement>) => {
    actions.setPanels(open);
    blurAfterPointer(e);
  };
  return (
    <div ref={strip} className="atlas-panels" data-tab={current ?? undefined} data-collapsed={expanded ? undefined : ''}>
      <button
        type="button"
        className="atlas-panels__fold"
        aria-expanded={true}
        aria-controls="atlas-panels-body"
        aria-label={t(locale, 'hud.panels.collapse')}
        title={t(locale, 'hud.panels.collapse')}
        onClick={fold(false)}
      >
        <i aria-hidden="true" />
      </button>
      <button
        type="button"
        className="atlas-panels__bar"
        data-hud-panel="panels-bar"
        aria-expanded={false}
        aria-controls="atlas-panels-body"
        aria-label={t(locale, 'hud.panels.expand')}
        title={t(locale, 'hud.panels.expand')}
        onClick={fold(true)}
      >
        <i aria-hidden="true" />
        {filled.map((id) => (
          <span key={id} className="atlas-panels__name">
            <b>{id.slice(-2)}</b>
            {upper(panels[id]!.en)}
            {panels[id]!.zh && <em lang="zh-Hans">{panels[id]!.zh}</em>}
          </span>
        ))}
      </button>
      <div id="atlas-panels-body" className="atlas-panels__body">
        <div className="atlas-panels__tabs" role="tablist" aria-label={t(locale, 'hud.panels')}>
          {filled.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              className="hud-btn"
              aria-selected={current === id}
              onClick={() => setTab(current === id ? null : id)}
            >
              <i>{id.slice(-2)}</i> {upper(panels[id]!.en)}
            </button>
          ))}
        </div>
        <div className="atlas-panels__grid">
          {filled.map((id) => (
            <section key={id} className="hud-panel atlas-panels__panel" data-hud-panel={id} data-active={current === id || undefined}>
              <PanelHeader n={id.slice(-2)} title={panels[id]!} />
              <div ref={slotRef(id)} className="hud-panel__body" />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
