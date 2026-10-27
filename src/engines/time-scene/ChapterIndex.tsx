/**
 * The chapter index (slot `readerEnd`, after the chapter body; docs/08 §2 HUD
 * 铁律 e): the places and events of the chapter's `state.index`, in order.
 * Pressing a row selects it (its detail appears at the top of the panel).
 * Rows are 44 px+ buttons with `aria-pressed` for the event on show.
 */
import { useT } from '../core/context';
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
  const t = useT();
  const rows = ids.map((id) => events.find((e) => e.id === id)).filter((e) => e !== undefined);
  if (rows.length === 0) return null;
  return (
    <section className="ts-index" aria-labelledby="ts-index-title">
      <h3 id="ts-index-title" className="ts-index__title">{t('time.index.title')}</h3>
      <ul className="ts-index__list">
        {rows.map((event) => (
          <li key={event.id}>
            <button type="button" className="ts-index__row" data-time-target={event.id} data-map-visibility={event.mapVisibility === 'timeline-only' ? 'timeline-only' : undefined} aria-pressed={selected === event.id} disabled={disabled} onClick={() => onSelect(event.id)}>
              {tx(event.title, locale)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
