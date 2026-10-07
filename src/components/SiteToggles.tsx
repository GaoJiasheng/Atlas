/**
 * Global toggles island for non-scene pages (index). Applies the theme
 * override (site default `paper`) the same way SceneHost does for topics.
 */
import { useEffect } from 'react';
import type { Locale } from '../i18n';
import { GlobalToggles } from '../engines/widgets/GlobalToggles';
import { useThemeOverride } from '../lib/prefs';
import { applyTheme, resolveTheme } from '../theme/theme';

export default function SiteToggles({ locale, path }: { locale: Locale; path: string }) {
  const [override] = useThemeOverride();
  useEffect(() => applyTheme(resolveTheme({ override })), [override]);
  return <GlobalToggles locale={locale} path={path} />;
}
