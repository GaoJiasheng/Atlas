/** Monthly reading slots: beats, mutually exclusive selection, then the site index. */
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Chapter, Locale } from '../core/types';
import { tx, type BilingualText } from '../../i18n';
import { SourceRefs } from '../widgets/SourcePopover';
import { Icon } from '../widgets/icons';
import { defaultCaption } from '../core/presentation/beats';
import { exploringText } from './lib/climatology-state';
import './climatology-reader.css';

export interface StaticSite {
  id: string;
  title: BilingualText;
  summary: BilingualText;
  detail?: BilingualText;
  sources?: string[];
}

export function ClimatologyReaderTop({
  chapter,
  beat,
  month,
  authoredMonth,
  onStep,
  selectedSite,
  sites,
  onClose,
  cellDetail,
  selectionKey,
  locale,
  canPrev = true,
  canNext = true,
}: {
  chapter: Chapter;
  beat: number | null;
  month: number;
  authoredMonth: number;
  onStep(delta: -1 | 1): void;
  selectedSite?: StaticSite | null;
  sites: readonly StaticSite[];
  onClose(): void;
  cellDetail?: ReactNode;
  selectionKey?: string;
  locale: Locale;
  canPrev?: boolean;
  canNext?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const beats = (chapter.state.beats ?? []) as { caption: BilingualText }[];
  const caption = beats[beat ?? 0]?.caption ?? defaultCaption(chapter);
  useLayoutEffect(() => {
    ref.current?.closest('.atlas-panel__scroll')?.scrollTo({ top: 0 });
  }, [chapter.id, beat, selectedSite?.id, selectionKey, cellDetail !== undefined]);
  return (
    <div ref={ref} className="clim-reader-top">
      <div className="clim-beatline" aria-live="polite">
        <p>
          <b>
            {locale === 'zh' ? '节拍' : 'BEAT'} {(beat ?? 0) + 1}/{beats.length || 1}
          </b>
          {caption && <span>{tx(caption, locale)}</span>}
        </p>
        <span className="clim-beatline__nav">
          <button type="button" aria-label={locale === 'zh' ? '上一拍' : 'Previous beat'} disabled={!canPrev} onClick={() => onStep(-1)}>
            <Icon name="chevron-left" size={16} />
          </button>
          <button type="button" aria-label={locale === 'zh' ? '下一拍' : 'Next beat'} disabled={!canNext} onClick={() => onStep(1)}>
            <Icon name="chevron-right" size={16} />
          </button>
        </span>
      </div>
      {month !== authoredMonth && (
        <p className="clim-exploring" role="status">
          {exploringText(month, authoredMonth, locale)}
        </p>
      )}
      {selectedSite && (
        <article className="ts-event clim-site-detail" data-climate-site={selectedSite.id} aria-labelledby="clim-site-title">
          <header className="ts-event__header">
            <p className="ts-event__eyebrow">
              P-
              {String(sites.findIndex((s) => s.id === selectedSite.id) + 1).padStart(2, '0')} · {locale === 'zh' ? '地点' : 'SITE'}
            </p>
            <button
              type="button"
              className="atlas-control atlas-control--ghost atlas-control--icon"
              aria-label={locale === 'zh' ? '关闭详情' : 'Close details'}
              onClick={onClose}
            >
              <Icon name="close" />
            </button>
          </header>
          <h3 id="clim-site-title" className="ts-event__title">
            {tx(selectedSite.title, locale)}
            <small lang={locale === 'zh' ? 'en' : 'zh-Hans'}>{locale === 'zh' ? selectedSite.title.en : selectedSite.title.zh}</small>
          </h3>
          <p className="ts-event__summary">
            {tx(selectedSite.summary, locale)}
            {selectedSite.sources?.length ? <SourceRefs ids={selectedSite.sources} locale={locale} /> : null}
          </p>
          {selectedSite.detail && (
            <details className="clim-site-more">
              <summary>{locale === 'zh' ? '细看' : 'More'}</summary>
              <p>{tx(selectedSite.detail, locale)}</p>
            </details>
          )}
        </article>
      )}
      {!selectedSite && cellDetail}
    </div>
  );
}

export function ClimatologyIndex({
  ids,
  sites,
  onSelect,
  locale,
  selected = null,
}: {
  ids: readonly string[];
  sites: readonly StaticSite[];
  onSelect(id: string): void;
  locale: Locale;
  selected?: string | null;
}) {
  if (!ids.length) return null;
  return (
    <section className="clim-index" aria-labelledby="clim-index-title">
      <h3 id="clim-index-title">{locale === 'zh' ? '本章地点' : 'Places in this chapter'}</h3>
      <ul>
        {ids.map((id) => {
          const site = sites.find((s) => s.id === id);
          return site ? (
            <li key={id}>
              <button type="button" data-climate-index={id} aria-pressed={selected === id} onClick={() => onSelect(id)}>
                <b>{tx(site.title, locale)}</b>
                <span>{tx(site.summary, locale)}</span>
              </button>
            </li>
          ) : null;
        })}
      </ul>
    </section>
  );
}
