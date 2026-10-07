import { useId } from 'react';
import type { Level, Locale } from '../core/types';
import { t } from '../../i18n';
import { LEVELS } from '../../lib/levels';
import { useLevel } from '../../lib/prefs';

/** The reader's school level (default P3). Chapters above it fold away. */
export function LevelPicker({ locale }: { locale: Locale }) {
  const [level, setLevel] = useLevel();
  const id = useId();
  return (
    <span className="atlas-level">
      <label htmlFor={id} className="atlas-level__label">
        {t(locale, 'level.label')}
      </label>
      <select id={id} className="atlas-control atlas-select" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
