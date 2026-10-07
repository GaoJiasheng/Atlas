import type { Locale, Theme } from '../core/types';
import { t, type UiKey } from '../../i18n';
import { useThemeOverride } from '../../lib/prefs';
import { Icon, type IconName } from './icons';

const OPTIONS: { value: Theme | null; key: UiKey; icon: IconName }[] = [
  { value: null, key: 'theme.auto', icon: 'auto' },
  { value: 'paper', key: 'theme.paper', icon: 'paper' },
  { value: 'cinema', key: 'theme.cinema', icon: 'film' },
];

/**
 * Global look override: Auto (topic / chapter decides), Paper, Cinema.
 * Stored per device; applied by the host's theme effect.
 */
export function ThemeToggle({ locale }: { locale: Locale }) {
  const [override, setOverride] = useThemeOverride();
  return (
    <div role="radiogroup" aria-label={t(locale, 'theme.label')} className="atlas-segmented">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="radio"
          aria-checked={override === opt.value}
          className="atlas-control atlas-control--icon"
          title={t(locale, opt.key)}
          aria-label={t(locale, opt.key)}
          onClick={() => setOverride(opt.value)}
        >
          <Icon name={opt.icon} />
        </button>
      ))}
    </div>
  );
}
