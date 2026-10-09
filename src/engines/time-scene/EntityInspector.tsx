/**
 * Details of an entity picked in the participation card (BandCard row), shown
 * in the InfoPanel's `inspector` slot: name (both languages), bloc spans,
 * joined / left, and the approximate controlled area at the playhead time.
 */
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import { useSceneContext, useT } from '../core/context';
import { Icon } from '../widgets/icons';
import type { Entity } from './schema';
import type { TimeModel } from './lib/model';
import type { Playhead } from './lib/playhead';
import { formatTime } from './lib/format';
import { areaAt, controlAreas } from './lib/stats';
import { BLOC_CSS, entityCssColor } from './colors';
import { blocLabel } from './lib/blocLabels';
import { usePlayheadT } from './hud/shared';
import { fmtArea } from './hud/HudPanels';

export interface EntityInspectorProps {
  entity: Entity;
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  onClose(): void;
}

export function EntityInspector({ entity, model, playhead, locale, onClose }: EntityInspectorProps) {
  const t = useT();
  const { topic } = useSceneContext();
  const ref = useRef<HTMLElement>(null);
  const now = usePlayheadT(playhead);
  const areas = useMemo(() => controlAreas(model), [model]);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [entity.id]);

  const index = `N-${String([...model.entities.keys()].indexOf(entity.id) + 1).padStart(2, '0')}`;
  const other = locale === 'zh' ? entity.name.en : entity.name.zh;
  const spans = typeof entity.bloc === 'string' ? [{ bloc: entity.bloc, from: undefined, to: undefined }] : entity.bloc;
  const area = areaAt(model, areas, entity.id, now);

  return (
    <article ref={ref} className="ts-event ts-entity" aria-labelledby={`ts-entity-${entity.id}`}>
      <header className="ts-event__header">
        <p className="ts-event__eyebrow">
          <span>{index}</span>
          <span className="ts-event__kind">{t('time.entity.kind')}</span>
        </p>
        <button type="button" className="atlas-control atlas-control--ghost atlas-control--icon" aria-label={t('time.close')} onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>
      <h3 id={`ts-entity-${entity.id}`} className="ts-event__title">
        <span className="ts-event__swatch" style={{ '--ts-color': entityCssColor(entity, now) } as CSSProperties} aria-hidden="true" />{' '}
        {tx(entity.name, locale)}
        {other && other !== tx(entity.name, locale) && <small lang={locale === 'zh' ? 'en' : 'zh-Hans'}>{other}</small>}
      </h3>
      <dl className="ts-event__facts">
        <dt>{t('time.entity.blocs')}</dt>
        <dd className="ts-entity__spans">
          {spans.map((sp, i) => (
            <span key={i}>
              <span className="ts-event__swatch" style={{ '--ts-color': BLOC_CSS[sp.bloc] } as CSSProperties} aria-hidden="true" />
              {blocLabel(topic.blocLabels, sp.bloc, locale)}
              {(sp.from || sp.to) && (
                <small>
                  {sp.from ? formatTime(sp.from, locale) : '…'} – {sp.to ? formatTime(sp.to, locale) : '…'}
                </small>
              )}
            </span>
          ))}
        </dd>
        <dt>{t('time.entity.joined')}</dt>
        <dd>{formatTime(entity.joined, locale)}</dd>
        {entity.left && (
          <>
            <dt>{t('time.entity.left')}</dt>
            <dd>{formatTime(entity.left, locale)}</dd>
          </>
        )}
        <dt>{t('time.entity.area')}</dt>
        <dd className="ts-entity__area">{area > 0 ? fmtArea(area) : '—'}</dd>
      </dl>
    </article>
  );
}
