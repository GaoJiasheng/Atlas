import type { Locale } from '../core/types';
import { LangToggle } from './LangToggle';
import { ThemeToggle } from './ThemeToggle';

export interface GlobalTogglesProps {
  locale: Locale;
  /** Current pathname (incl. base), for the language links. */
  path: string;
  /** `hud`: hairline buttons for the scene top bar; `site`: the same grammar scaled up for the index. */
  variant?: 'site' | 'hud';
}

/** Look and language menus: two hairline dropdowns, inline at every width. */
export function GlobalToggles({ locale, path, variant = 'site' }: GlobalTogglesProps) {
  return (
    <div className={`atlas-toggles atlas-toggles--${variant}`}>
      <ThemeToggle locale={locale} variant={variant} />
      <LangToggle locale={locale} path={path} variant={variant} />
    </div>
  );
}
