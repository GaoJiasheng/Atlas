/**
 * Details of a clicked event, shown in the InfoPanel's `inspector` slot.
 * Forces and casualties use Counter ("one icon = N", docs/02); a table with
 * exactly two sides is drawn as one two-sided Counter on a shared scale
 * (attacker left). Casualties of a `sensitive` event only show in parent mode.
 * `detail` sits in a collapsed "More" block; `sources` are superscript ids
 * that open the host's source popover (`data-source`, widgets/SourcePopover).
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import { useT } from '../core/context';
import { useParentMode } from '../../lib/prefs';
import { Counter, CounterVersus } from '../widgets/Counter';
import { SourceRefs } from '../widgets/SourcePopover';
import { Icon } from '../widgets/icons';
import type { SceneEvent } from './schema';
import type { TimeModel } from './lib/model';
import { counterPer, formatTime } from './lib/format';
import { toNumber } from './lib/time';
import { sideCssColor } from './colors';

export interface EventInspectorProps {
  event: SceneEvent;
  model: TimeModel;
  locale: Locale;
  onClose(): void;
}

function ForceTable({
  table,
  event,
  model,
  locale,
  title,
  at,
}: {
  table: Record<string, number>;
  event: SceneEvent;
  model: TimeModel;
  locale: Locale;
  title: string;
  /** Numeric event time (colours follow the bloc then). */
  at: number;
}) {
  const entries = Object.entries(table);
  const per = counterPer(Math.max(...entries.map(([, n]) => n)));
  const side = (id: string, value: number) => {
    const entity = model.entities.get(id)?.entity;
    return { value, label: entity?.name ?? id, color: sideCssColor(entity, at) };
  };
  if (entries.length === 2) {
    // Attacker on the left when the sides are known, else data order.
    const attacker = event.sides?.attacker;
    const [a, b] = attacker && entries[1]![0] === attacker ? [entries[1]!, entries[0]!] : [entries[0]!, entries[1]!];
    return (
      <section className="ts-event__block">
        <h4 className="ts-event__subhead">{title}</h4>
        <CounterVersus left={side(a[0], a[1])} right={side(b[0], b[1])} per={per} locale={locale} />
      </section>
    );
  }
  return (
    <section className="ts-event__block">
      <h4 className="ts-event__subhead">{title}</h4>
      {entries.map(([id, n]) => {
        const s = side(id, n);
        return <Counter key={id} value={n} per={per} locale={locale} label={s.label} color={s.color} />;
      })}
    </section>
  );
}

export function EventInspector({ event, model, locale, onClose }: EventInspectorProps) {
  const t = useT();
  const [parentMode] = useParentMode();
  const ref = useRef<HTMLElement>(null);
  const nameOf = (id: string) => tx(model.entities.get(id)?.entity.name ?? id, locale);
  const at = toNumber(event.t);
  const colorOf = (id: string) => sideCssColor(model.entities.get(id)?.entity, at);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [event.id]);

  const isSite = event.kind === 'site';
  const when = event.until ? `${formatTime(event.t, locale)} – ${formatTime(event.until, locale)}` : formatTime(event.t, locale);
  const index = isSite
    ? `P-${String(model.sites.findIndex((e) => e.id === event.id) + 1).padStart(2, '0')}`
    : `E-${String(model.events.findIndex((e) => e.event.id === event.id) + 1).padStart(2, '0')}`;
  const other = locale === 'zh' ? event.title.en : event.title.zh;

  return (
    <article ref={ref} className="ts-event" aria-labelledby={`ts-event-${event.id}`}>
      <header className="ts-event__header">
        <p className="ts-event__eyebrow">
          <span>{index}</span>
          <span className="ts-event__kind">{t(`time.kind.${event.kind}`)}</span>
          {!isSite && <span>{when}</span>}
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
      <p className="ts-event__summary">
        {tx(event.summary, locale)}
        {event.sources && event.sources.length > 0 && <SourceRefs ids={event.sources} locale={locale} />}
      </p>

      {(event.sides || event.result) && (
        <dl className="ts-event__facts">
          {event.sides && (
            <>
              <dt>{t('time.attacker')}</dt>
              <dd>
                <span className="ts-event__swatch" style={{ '--ts-color': colorOf(event.sides.attacker) } as CSSProperties} aria-hidden="true" />
                {nameOf(event.sides.attacker)}
              </dd>
              <dt>{t('time.defender')}</dt>
              <dd>
                <span className="ts-event__swatch" style={{ '--ts-color': colorOf(event.sides.defender) } as CSSProperties} aria-hidden="true" />
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
        <ForceTable table={event.forces} event={event} model={model} locale={locale} title={t('time.forces')} at={at} />
      )}
      {event.casualties &&
        Object.keys(event.casualties).length > 0 &&
        (event.sensitive && !parentMode ? (
          <p className="atlas-panel__notice atlas-panel__notice--guarded">
            <Icon name="shield" size={16} />
            <span>{t('time.casualtiesGuarded')}</span>
          </p>
        ) : (
          <ForceTable table={event.casualties} event={event} model={model} locale={locale} title={t('time.casualties')} at={at} />
        ))}

      {event.detail && (
        <details className="atlas-more ts-event__more" key={event.id}>
          <summary className="atlas-more__summary">
            <span className="atlas-more__tri" aria-hidden="true" />
            <span>{t('time.more')}</span>
          </summary>
          <div className="atlas-more__body">
            <p>{tx(event.detail, locale)}</p>
          </div>
        </details>
      )}
    </article>
  );
}
