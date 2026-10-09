import type { Locale, Theme } from '../core/types';
import { t, type UiKey } from '../../i18n';
import { useThemeOverride } from '../../lib/prefs';
import { Dropdown } from './Dropdown';

const OPTIONS: { id: string; value: Theme | null; key: UiKey }[] = [
  { id: 'auto', value: null, key: 'theme.auto' },
  { id: 'paper', value: 'paper', key: 'theme.paper' },
  { id: 'cinema', value: 'cinema', key: 'theme.cinema' },
];

/**
 * Global look override as a "LOOK ▾" menu: Auto (topic / chapter decides),
 * Paper, Cinema. Stored per device; applied by the host's theme effect.
 */
export function ThemeToggle({ locale, variant = 'site' }: { locale: Locale; variant?: 'site' | 'hud' }) {
  const [override, setOverride] = useThemeOverride();
  const selected = OPTIONS.find((o) => o.value === override) ?? OPTIONS[0]!;
  return (
    <Dropdown
      variant={variant}
      label={t(locale, 'theme.label')}
      text={t(locale, 'hud.theme')}
      items={OPTIONS.map((o) => ({ id: o.id, label: t(locale, o.key) }))}
      selectedId={selected.id}
      onPick={(item) => setOverride(OPTIONS.find((o) => o.id === item.id)?.value ?? null)}
    />
  );
}
