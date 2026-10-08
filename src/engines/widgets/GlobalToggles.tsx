import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../core/types';
import { t } from '../../i18n';
import { Icon } from './icons';
import { LangToggle } from './LangToggle';
import { ParentModeToggle } from './ParentModeToggle';
import { ThemeToggle } from './ThemeToggle';

export interface GlobalTogglesProps {
  locale: Locale;
  /** Current pathname (incl. base), for the language link. */
  path: string;
  /** `hud`: 18px hairline buttons for the scene top bar; `site`: 44px controls. */
  variant?: 'site' | 'hud';
}

/**
 * Parent mode, look and language. Inline on wide screens; behind a
 * settings button (tap to open, tap outside / Esc to close) on narrow ones
 * (< 900px for `site`, < 760px for `hud`).
 */
export function GlobalToggles({ locale, path, variant = 'site' }: GlobalTogglesProps) {
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
    <div ref={rootRef} className={`atlas-toggles atlas-toggles--${variant}`} data-open={open}>
      <button
        type="button"
        className={variant === 'hud' ? 'hud-btn atlas-toggles__trigger' : 'atlas-control atlas-control--icon atlas-toggles__trigger'}
        aria-expanded={open}
        aria-label={t(locale, 'settings.label')}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="settings" size={variant === 'hud' ? 14 : 20} />
      </button>
      <div className="atlas-toggles__panel">
        <ParentModeToggle locale={locale} variant={variant} />
        <ThemeToggle locale={locale} variant={variant} />
        <LangToggle locale={locale} path={path} variant={variant} />
      </div>
    </div>
  );
}
