/** Event-only chapter index, after the prose. Titles remain in the event data. */
import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import type { SceneEvent } from './schema';

export function ChapterIndex({ ids, events, selected, locale, disabled, onSelect }: {
  ids: readonly string[];
  events: readonly SceneEvent[];
  selected: string | null;
  locale: Locale;
  disabled: boolean;
  onSelect(id: string): boolean;
}) {
  if (ids.length === 0) return null;
  return (
    <section className="ts-index" aria-labelledby="ts-index-title">
      <h3 id="ts-index-title" className="ts-index__title">{tx({ en: 'In this chapter', zh: '本章索引' }, locale)}</h3>
      <ul className="ts-index__list">
        {ids.map((id) => {
          const event = events.find((e) => e.id === id);
          return event ? <li key={id}>
            <button type="button" className="ts-index__row" data-time-target={id} aria-pressed={selected === id}
              title={tx(event.title, locale)} disabled={disabled} onClick={() => onSelect(id)}>
              {tx(event.title, locale)}
            </button>
          </li> : null;
        })}
      </ul>
    </section>
  );
}
