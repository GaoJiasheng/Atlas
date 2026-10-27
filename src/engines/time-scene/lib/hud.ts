/** Topic-wide data availability, independent of the current date or enabled layers. */
import type { TimeModel } from './model';
import { BATTLE_KINDS } from './stats';
import type { ControlRow } from '../../widgets/ControlPanel';
import type { HudText } from '../../core/controls';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';

export function timeHudAvailability(model: TimeModel) {
  const control = model.keyframes.some((keyframe) => keyframe.keyframe.features.features.length > 0);
  return {
    control,
    participants: model.entities.size > 0,
    participation: control && model.entities.size > 0,
    events: model.events.length > 0,
    sites: model.sites.length > 0,
    movements: model.movements.length > 0,
    battles: model.events.some(({ event }) => BATTLE_KINDS.has(event.kind)),
  };
}

/** The actual LAYERS rows, shared by the view and server-rendered regression tests. */
export function timeLayerRows(
  available: ReturnType<typeof timeHudAvailability>,
  locale: Locale,
  options: { territory?: boolean; borders?: boolean; dated?: readonly ControlRow[]; labels?: { events?: HudText; participation?: HudText } } = {},
): ControlRow[] {
  return [
    ...(available.control ? [{ kind: 'layer' as const, id: 'control', label: t(locale, 'time.layer.control') }] : []),
    ...(available.control || options.territory ? [{ kind: 'mode' as const, id: 'territory', label: t(locale, 'time.layer.territory') }] : []),
    ...(options.borders === false ? [] : [{ kind: 'mode' as const, id: 'borders', label: t(locale, 'time.layer.borders') }]),
    { kind: 'mode', id: 'graticule', label: t(locale, 'time.layer.graticule') },
    ...(available.movements ? [{ kind: 'mode' as const, id: 'flow', label: t(locale, 'time.layer.movements') }] : []),
    ...(available.events ? [{ kind: 'layer' as const, id: 'battles', label: options.labels?.events ?? t(locale, 'time.layer.battles') }] : []),
    ...(available.participation ? [{ kind: 'layer' as const, id: 'participation', label: options.labels?.participation ?? t(locale, 'time.layer.participation') }] : []),
    ...(available.sites ? [{ kind: 'layer' as const, id: 'sites', label: t(locale, 'time.layer.sites') }] : []),
    ...(options.dated ?? []),
    { kind: 'mode', id: 'labels', label: t(locale, 'time.layer.labels') },
  ];
}
