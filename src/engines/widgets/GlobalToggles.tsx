import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../core/types';
import { t } from '../../i18n';
import { Icon } from './icons';
import { LangToggle } from './LangToggle';
import { LevelPicker } from './LevelPicker';
import { ParentModeToggle } from './ParentModeToggle';
import { ThemeToggle } from './ThemeToggle';

export interface GlobalTogglesProps {
  locale: Locale;
  /** Current pathname (incl. base), for the language link. */
  path: string;
}

/**
 * Level, parent mode, look and language. Inline on wide screens; behind a
 * settings button (tap to open, tap outside / Esc to close) on narrow ones.
 */
export function GlobalToggles({ locale, path }: GlobalTogglesProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="atlas-toggles" data-open={open}>
      <button
        type="button"
        className="atlas-control atlas-control--icon atlas-toggles__trigger"
        aria-expanded={open}
        aria-label={t(locale, 'settings.label')}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="settings" />
      </button>
      <div className="atlas-toggles__panel">
        <LevelPicker locale={locale} />
        <ParentModeToggle locale={locale} />
        <ThemeToggle locale={locale} />
        <LangToggle locale={locale} path={path} />
      </div>
    </div>
  );
}
