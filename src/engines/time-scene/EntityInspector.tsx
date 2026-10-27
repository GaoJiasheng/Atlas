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
import { blocLabel, entityWord } from './lib/blocLabels';
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
  const areas = useMemo(() => model.timePresentation ? new Map<string, number[]>() : controlAreas(model), [model]);

  useEffect(() => {
    if (!model.timePresentation) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [entity.id, model.timePresentation]);

  const index = `N-${String([...model.entities.keys()].indexOf(entity.id) + 1).padStart(2, '0')}`;
  const other = locale === 'zh' ? entity.name.en : entity.name.zh;
  const spans = typeof entity.bloc === 'string' ? [{ bloc: entity.bloc, from: undefined, to: undefined }] : entity.bloc;
  const area = areaAt(model, areas, entity.id, now);
  const date = (p: Parameters<typeof formatTime>[0]) => formatTime(p, locale, model.datePrecision, model.mixedEra);

  return (
    <article ref={ref} className="ts-event ts-entity" aria-labelledby={`ts-entity-${entity.id}`}>
      <header className="ts-event__header">
        <p className="ts-event__eyebrow">
          <span>{index}</span>
          <span className="ts-event__kind">{model.timePresentation ? tx(model.timePresentation.entityLabel, locale) : t('time.entity.kind')}</span>
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
                  {sp.from ? date(sp.from) : '…'} – {sp.to ? date(sp.to) : '…'}
                </small>
              )}
            </span>
          ))}
        </dd>
        <dt>{entityWord(topic.strings, 'joined', locale)}</dt>
        <dd>{date(entity.joined)}</dd>
        {entity.left && (
          <>
            <dt>{entityWord(topic.strings, 'left', locale)}</dt>
            <dd>{date(entity.left)}</dd>
          </>
        )}
        {!model.timePresentation && <><dt>{t('time.entity.area')}</dt>
        <dd className="ts-entity__area">{area > 0 ? fmtArea(area) : '—'}</dd></>}
      </dl>
      {model.timePresentation && <p className="ts-event__summary">{t('time.mission.storyRange')}</p>}
    </article>
  );
}
