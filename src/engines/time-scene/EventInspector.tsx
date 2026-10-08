/**
 * Details of a clicked event, shown in the InfoPanel's `inspector` slot.
 * Forces and casualties use Counter ("one icon = N", docs/02). Casualties of
 * a `sensitive` event only show in parent mode.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
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
  const index = model.events.findIndex((e) => e.event.id === event.id) + 1;
  const other = locale === 'zh' ? event.title.en : event.title.zh;

  return (
    <article ref={ref} className="ts-event" aria-labelledby={`ts-event-${event.id}`}>
      <header className="ts-event__header">
        <p className="ts-event__eyebrow">
          <span>E-{String(index).padStart(2, '0')}</span>
          <span className="ts-event__kind">{t(`time.kind.${event.kind}`)}</span>
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
        {other && other !== tx(event.title, locale) && <small lang={locale === 'zh' ? 'en' : 'zh-Hans'}>{other}</small>}
      </h3>
      <p className="ts-event__summary">{tx(event.summary, locale)}</p>

      {(event.sides || event.result) && (
        <dl className="ts-event__facts">
          {event.sides && (
            <>
              <dt>{t('time.attacker')}</dt>
              <dd>
                <span className="ts-event__swatch" style={{ '--ts-color': entityCssColor(model.entities.get(event.sides.attacker)?.entity) } as CSSProperties} aria-hidden="true" />
                {nameOf(event.sides.attacker)}
              </dd>
              <dt>{t('time.defender')}</dt>
              <dd>
                <span className="ts-event__swatch" style={{ '--ts-color': entityCssColor(model.entities.get(event.sides.defender)?.entity) } as CSSProperties} aria-hidden="true" />
                {nameOf(event.sides.defender)}
              </dd>
            </>
          )}
          {event.result && (
            <>
              <dt>{t('time.resultLabel')}</dt>
              <dd>{t(`time.result.${event.result}`)}</dd>
            </>
          )}
        </dl>
      )}

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
