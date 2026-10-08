import { useEffect, useState } from 'react';
import type { Locale } from '../core/types';
import { t } from '../../i18n';
import { useParentMode } from '../../lib/prefs';
import { Icon } from './icons';

const CONFIRM_WINDOW_MS = 3000;

/**
 * Parent mode unlocks full versions of sensitive passages. Turning it on needs a second tap within 3 s (a small
 * guard against accidental taps; no hover, no long-press). Off is one tap.
 */
export function ParentModeToggle({ locale, variant = 'site' }: { locale: Locale; variant?: 'site' | 'hud' }) {
  const [on, setOn] = useParentMode();
  const [arming, setArming] = useState(false);

  useEffect(() => {
    if (!arming) return;
    const timer = setTimeout(() => setArming(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [arming]);

  const onClick = () => {
    if (on) {
      setOn(false);
    } else if (arming) {
      setArming(false);
      setOn(true);
    } else {
      setArming(true);
    }
  };

  const label = arming ? t(locale, 'parent.confirm') : on ? t(locale, 'parent.on') : t(locale, 'parent.off');

  if (variant === 'hud') {
    return (
      <button
        type="button"
        className={on ? 'hud-btn on' : 'hud-btn'}
        aria-pressed={on}
        data-arming={arming || undefined}
        aria-label={label}
        title={label}
        onClick={onClick}
      >
        {arming ? t(locale, 'parent.confirm') : t(locale, 'hud.parent')}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="atlas-control"
      aria-pressed={on}
      data-arming={arming || undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon name={on ? 'shield' : 'lock'} />
      <span className="atlas-control__label">{arming ? t(locale, 'parent.confirm') : t(locale, 'parent.label')}</span>
    </button>
  );
}
