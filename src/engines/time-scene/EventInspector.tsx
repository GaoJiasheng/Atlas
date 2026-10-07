/**
 * Details of a clicked event, shown in the InfoPanel's `inspector` slot.
 * Forces and casualties use Counter ("one icon = N", docs/02). Casualties of
 * a `sensitive` event only show in parent mode.
 */
import { useEffect, useRef } from 'react';
import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import { useT } from '../core/context';
import { useParentMode } from '../../lib/prefs';
import { Counter } from '../widgets/Counter';
import { Icon } from '../widgets/icons';
import type { SceneEvent } from './schema';
import type { TimeModel } from './lib/model';
import { formatTime, nicePer } from './lib/format';
import { entityCssColor } from './colors';

export interface EventInspectorProps {
  event: SceneEvent;
  model: TimeModel;
  locale: Locale;
  onClose(): void;
}

function ForceTable({
  table,
  model,
  locale,
  title,
}: {
  table: Record<string, number>;
  model: TimeModel;
  locale: Locale;
  title: string;
}) {
  const entries = Object.entries(table);
  const per = nicePer(Math.max(...entries.map(([, n]) => n)));
  return (
    <section className="ts-event__block">
      <h4 className="ts-event__subhead">{title}</h4>
      {entries.map(([id, n]) => {
        const entity = model.entities.get(id)?.entity;
        return (
          <Counter
            key={id}
            value={n}
            per={per}
            locale={locale}
            label={entity?.name ?? id}
            color={entityCssColor(entity)}
          />
        );
      })}
    </section>
  );
}

export function EventInspector({ event, model, locale, onClose }: EventInspectorProps) {
  const t = useT();
  const [parentMode] = useParentMode();
  const ref = useRef<HTMLElement>(null);
  const nameOf = (id: string) => tx(model.entities.get(id)?.entity.name ?? id, locale);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [event.id]);

  const when = event.until ? `${formatTime(event.t, locale)} – ${formatTime(event.until, locale)}` : formatTime(event.t, locale);

  return (
    <article ref={ref} className="ts-event" aria-labelledby={`ts-event-${event.id}`}>
      <header className="ts-event__header">
        <p className="ts-event__eyebrow">
          <span className="atlas-badge">{t(`time.kind.${event.kind}`)}</span>
          <span>{when}</span>
        </p>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon"
          aria-label={t('time.close')}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <h3 id={`ts-event-${event.id}`} className="ts-event__title">
        {tx(event.title, locale)}
      </h3>
      <p className="ts-event__summary">{tx(event.summary, locale)}</p>

      {event.sides && (
        <p className="ts-event__sides">
          <span className="ts-event__side">
            <span className="atlas-legend__fill" style={{ background: entityCssColor(model.entities.get(event.sides.attacker)?.entity) }} aria-hidden="true" />
            <span>
              <small>{t('time.attacker')}</small> {nameOf(event.sides.attacker)}
            </span>
          </span>
          <span className="ts-event__vs">{t('time.versus')}</span>
          <span className="ts-event__side">
            <span className="atlas-legend__fill" style={{ background: entityCssColor(model.entities.get(event.sides.defender)?.entity) }} aria-hidden="true" />
            <span>
              <small>{t('time.defender')}</small> {nameOf(event.sides.defender)}
            </span>
          </span>
        </p>
      )}
      {event.result && <p className="ts-event__result">{t(`time.result.${event.result}`)}</p>}

      {event.forces && Object.keys(event.forces).length > 0 && (
        <ForceTable table={event.forces} model={model} locale={locale} title={t('time.forces')} />
      )}
      {event.casualties &&
        Object.keys(event.casualties).length > 0 &&
        (event.sensitive && !parentMode ? (
          <p className="atlas-panel__notice atlas-panel__notice--guarded">
            <Icon name="shield" size={16} />
            <span>{t('time.casualtiesGuarded')}</span>
          </p>
        ) : (
          <ForceTable table={event.casualties} model={model} locale={locale} title={t('time.casualties')} />
        ))}
    </article>
  );
}
