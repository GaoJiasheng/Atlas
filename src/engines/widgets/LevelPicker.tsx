import { useId } from 'react';
import type { Level, Locale } from '../core/types';
import { t } from '../../i18n';
import { LEVELS } from '../../lib/levels';
import { useLevel } from '../../lib/prefs';

/** The reader's school level (default P3). Chapters above it fold away. */
export function LevelPicker({ locale, variant = 'site' }: { locale: Locale; variant?: 'site' | 'hud' }) {
  const [level, setLevel] = useLevel();
  const id = useId();
  const hud = variant === 'hud';
  return (
    <span className={hud ? 'hud-group atlas-level' : 'atlas-level'}>
      <label htmlFor={id} className={hud ? 'hud-group__label' : 'atlas-level__label'}>
        {hud ? t(locale, 'hud.level') : t(locale, 'level.label')}
      </label>
      <select
        id={id}
        className={hud ? 'hud-btn hud-select' : 'atlas-control atlas-select'}
        aria-label={t(locale, 'level.label')}
        value={level}
        onChange={(e) => setLevel(e.target.value as Level)}
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
