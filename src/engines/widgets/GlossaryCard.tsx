/**
 * Glossary card in the reading panel's inspector area (docs/06 "名词表"):
 * one term (definition, related terms as links, "All terms") or the list of
 * every term. Opened by a `<Term>` in a chapter body (SceneHost delegates
 * `[data-term]` clicks) or by "Glossary" in the control panel's TOOLS; the
 * open term lives in the HUD store (`glossary`), ESC closes it. The terms come
 * from the topic's `data/glossary.json`; nothing is fetched.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { Locale } from '../core/types';
import { GLOSSARY_ALL } from '../core/controls';
import type { GlossaryTerm } from '../../content/schema/glossary';
import { t, tx } from '../../i18n';
import { Icon } from './icons';

/** The topic's glossary terms from the loaded engine data (`[]` when it has none). */
export function topicGlossary(data: unknown): readonly GlossaryTerm[] {
  if (!data || typeof data !== 'object' || !('glossary' in data)) return [];
  const file = (data as { glossary?: { terms?: GlossaryTerm[] } }).glossary;
  return file?.terms ?? [];
}

export interface GlossaryCardProps {
  terms: readonly GlossaryTerm[];
  /** A term id or `GLOSSARY_ALL`. */
  open: string;
  locale: Locale;
  onOpen(id: string | null): void;
}

const otherLang = (locale: Locale) => (locale === 'zh' ? 'en' : 'zh-Hans');

export function GlossaryCard({ terms, open, locale, onOpen }: GlossaryCardProps) {
  const ref = useRef<HTMLElement>(null);
  const byId = useMemo(() => new Map(terms.map((term) => [term.id, term])), [terms]);
  const sorted = useMemo(
    () => [...terms].sort((a, b) => tx(a.term, locale).localeCompare(tx(b.term, locale), locale === 'zh' ? 'zh-Hans-CN' : 'en')),
    [terms, locale],
  );

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open]);

  const go = (id: string | null) => (e: { detail: number; currentTarget: HTMLElement }) => {
    onOpen(id);
    if (e.detail > 0) e.currentTarget.blur();
  };
  const term = open === GLOSSARY_ALL ? null : byId.get(open);
  const other = (text: { en: string; zh: string }) => {
    const value = locale === 'zh' ? text.en : text.zh;
    return value && value !== tx(text, locale) ? value : null;
  };

  return (
    <article ref={ref} className="atlas-gloss" aria-labelledby="atlas-gloss-title" data-glossary={open}>
      <header className="atlas-gloss__head">
        <p className="atlas-gloss__eyebrow">{t(locale, 'glossary.heading')}</p>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon"
          aria-label={t(locale, 'glossary.close')}
          title={t(locale, 'glossary.close')}
          onClick={go(null)}
        >
          <Icon name="close" />
        </button>
      </header>
      {term ? (
        <>
          <h3 id="atlas-gloss-title" className="atlas-gloss__term">
            {tx(term.term, locale)}
            {other(term.term) && <small lang={otherLang(locale)}>{other(term.term)}</small>}
          </h3>
          <p className="atlas-gloss__def">{tx(term.definition, locale)}</p>
          {(term.see ?? []).some((id) => byId.has(id)) && (
            <p className="atlas-gloss__see">
              <span>{t(locale, 'glossary.see')}</span>
              {(term.see ?? []).map((id) => {
                const related = byId.get(id);
                if (!related) return null;
                return (
                  <button key={id} type="button" className="atlas-gloss__link" data-term-link={id} onClick={go(id)}>
                    {tx(related.term, locale)}
                  </button>
                );
              })}
            </p>
          )}
          <button type="button" className="hud-btn atlas-gloss__all" onClick={go(GLOSSARY_ALL)}>
            {t(locale, 'glossary.all')}
          </button>
        </>
      ) : open === GLOSSARY_ALL ? (
        <>
          <h3 id="atlas-gloss-title" className="atlas-gloss__term">
            {t(locale, 'glossary.all')}
          </h3>
          <ul className="atlas-gloss__list">
            {sorted.map((item) => (
              <li key={item.id}>
                <button type="button" className="atlas-gloss__item" data-term-link={item.id} onClick={go(item.id)}>
                  <b>{tx(item.term, locale)}</b>
                  {other(item.term) && <small lang={otherLang(locale)}>{other(item.term)}</small>}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p id="atlas-gloss-title" className="atlas-gloss__def">
          {t(locale, 'glossary.missing')}
        </p>
      )}
    </article>
  );
}
