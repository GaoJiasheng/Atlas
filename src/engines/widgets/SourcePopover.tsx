/**
 * Numbered sources (`data/sources.json`, docs/09 §6) on the page.
 *
 * Anything with `data-source="S3"` inside the scene opens a small popover with
 * that source's text, note and link: the superscripts of `<Num s="S3">` in the
 * static chapter bodies and the ones `SourceRefs` draws (event inspector).
 * The host mounts one `SourcePopover` per scene with a delegated click
 * listener, so static HTML needs no hydration. Nothing is fetched: the link
 * is only a link.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '../core/types';
import { t, tx } from '../../i18n';
import type { SourceEntry } from '../../content/schema/sources';
import { Icon } from './icons';

/** Superscript source ids after a text, each a button opening the popover. */
export function SourceRefs({ ids, locale }: { ids: readonly string[]; locale: Locale }) {
  return (
    <sup className="atlas-src-refs">
      {ids.map((id) => (
        <button key={id} type="button" className="atlas-src" data-source={id} aria-label={t(locale, 'source.open', { id })}>
          {id}
        </button>
      ))}
    </sup>
  );
}

/** Sources of a topic from its parsed engine data (any engine; empty when the topic has none). */
export function topicSources(data: unknown): readonly SourceEntry[] {
  if (!data || typeof data !== 'object' || !('sources' in data)) return [];
  const file = (data as { sources?: { sources?: SourceEntry[] } }).sources;
  return file?.sources ?? [];
}

const GAP = 6;
const MARGIN = 8;

interface Open {
  id: string;
  trigger: HTMLElement;
}

export function SourcePopover({
  root,
  sources,
  locale,
}: {
  /** Scene element; clicks on `[data-source]` inside it open the popover. */
  root: RefObject<HTMLElement | null>;
  sources: readonly SourceEntry[];
  locale: Locale;
}) {
  const [open, setOpen] = useState<Open | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openRef = useRef<Open | null>(null);
  openRef.current = open;

  const close = useCallback((restoreFocus: boolean) => {
    if (restoreFocus) openRef.current?.trigger.focus({ preventScroll: true });
    setOpen(null);
    setPos(null);
  }, []);

  // Delegated: works for static MDX bodies and React-drawn refs alike.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-source]') : null;
      if (!target || !el.contains(target)) return;
      e.preventDefault();
      const id = target.dataset.source ?? '';
      setOpen((current) => (current && current.id === id && current.trigger === target ? null : { id, trigger: target }));
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [root]);

  // Place under the trigger (above when there is no room), inside the viewport.
  const place = useCallback(() => {
    const box = boxRef.current;
    if (!open || !box) return;
    const r = open.trigger.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) {
      close(false);
      return;
    }
    const w = box.offsetWidth;
    const h = box.offsetHeight;
    const left = Math.min(Math.max(MARGIN, r.left + r.width / 2 - w / 2), window.innerWidth - w - MARGIN);
    const below = r.bottom + GAP;
    const top = below + h + MARGIN <= window.innerHeight ? below : Math.max(MARGIN, r.top - GAP - h);
    setPos((p) => (p && p.left === left && p.top === top ? p : { left, top }));
  }, [open, close]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    closeRef.current?.focus({ preventScroll: true });
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Handled here: the scene keymap ignores prevented keys.
      e.preventDefault();
      close(true);
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target instanceof Node ? e.target : null;
      if (target && (boxRef.current?.contains(target) || open.trigger.contains(target))) return;
      close(false);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [open, place, close]);

  if (!open) return null;
  const source = sources.find((s) => s.id === open.id);
  const headingId = `atlas-source-${open.id}`;
  return createPortal(
    <div
      ref={boxRef}
      className="atlas-source-pop"
      role="dialog"
      aria-labelledby={headingId}
      style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: 'hidden' }}
    >
      <header className="atlas-source-pop__head">
        <span id={headingId}>{t(locale, 'source.heading', { id: open.id })}</span>
        <button
          ref={closeRef}
          type="button"
          className="atlas-source-pop__close"
          aria-label={t(locale, 'source.close')}
          onClick={() => close(true)}
        >
          <Icon name="close" size={14} />
        </button>
      </header>
      {source ? (
        <>
          <p className="atlas-source-pop__text">{tx(source.text, locale)}</p>
          {source.note && <p className="atlas-source-pop__note">{tx(source.note, locale)}</p>}
          {source.url && (
            <a className="atlas-source-pop__url" href={source.url} target="_blank" rel="noopener noreferrer">
              {source.url}
            </a>
          )}
        </>
      ) : (
        <p className="atlas-source-pop__note">{t(locale, 'source.missing')}</p>
      )}
    </div>,
    document.body,
  );
}
