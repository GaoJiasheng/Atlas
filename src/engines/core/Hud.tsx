/**
 * Technical-plate HUD pieces drawn by SceneHost (docs/08 §2): top bar with
 * the VIEW group (camera presets, wrapping onto more rows when needed),
 * status line and key hint; the title block pressed onto the stage; the
 * card / bottom-panel frames engines fill through slots. Mode switches are
 * not in the top bar: engines place them in their control panel
 * (`widgets/ControlPanel.tsx`, stage overlay).
 * Sizes are in design pixels scaled by `--u` (see scene.css).
 */
import { useState, type MouseEvent, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { Chapter, Locale, TopicMeta } from './types';
import {
  activePreset,
  allModes,
  docId,
  PANEL_SLOTS,
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
}

export function TopBar({ topic, chapters, chapter, chapterNumber, locale, path, indexHref, hud, actions }: TopBarProps) {
  const tr = (key: UiKey, vars?: Record<string, string | number>) => t(locale, key, vars);
  const controls = useStore(hud, (s) => s.controls);
  const labels = useStore(hud, (s) => s.labels);
  const free = useStore(hud, (s) => s.cameraFree);
  const active = useStore(hud, (s) => activePreset(s, chapter));
  const presets = controls.presets?.items ?? [];
  const modes = allModes(controls, labels, tr('hud.mode.labels'));
  const pause = controls.pause;

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
  // A digit beside the label, unless the label already is the number (`01`).
  const digit = (i: number, label: HudText) => (i < 9 && !/^\d+$/.test(tx(label, 'en')) ? String(i + 1) : null);

  return (
    <header className="atlas-topbar" data-hud-panel="topbar">
      <div className="atlas-topbar__row">
        <a className="atlas-brand" href={indexHref} aria-label={tr('nav.backToTopics')}>
          <b aria-hidden="true" />
          <span>
            ATLAS · {upper(tr(`subject.${topic.subject}` as UiKey))}
          </span>
        </a>
        <span className="atlas-docid">{docId(topic.id, chapterNumber)}</span>
        {presets.length > 0 && (
          <div className="atlas-topbar__ctl">
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
          </div>
        )}
        <GlobalToggles locale={locale} path={path} variant="hud" />
      </div>
      <div className="atlas-topbar__sub">
        <p className="atlas-status" role="status">
          {status.join(' · ')}
        </p>
        <p className="atlas-hint" aria-hidden="true">
          {presets.length > 0 && (
            <span>
              <kbd>{presets.length > 1 ? `1–${Math.min(9, presets.length)}` : '1'}</kbd> {tr('hud.keys.views')}
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
        {upper(t('en', 'hud.note'))} · <span lang="zh-Hans">{t('zh', 'hud.note')}</span>
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

export function BottomPanels({ hud, slotRef, locale }: { hud: HudStore; slotRef: SlotRef; locale: Locale }) {
  const panels = useStore(hud, (s) => s.controls.panels);
  const [tab, setTab] = useState<PanelSlot | null>(null);
  const filled = PANEL_SLOTS.filter((id) => panels?.[id]);
  if (!panels || filled.length === 0) return null;
  const current = tab && filled.includes(tab) ? tab : null;
  return (
    <div className="atlas-panels" data-tab={current ?? undefined}>
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
  );
}
