/**
 * Bloc names. A topic may rename the engine's fixed blocs in `topic.yaml`
 * (`blocLabels`: the First World War calls `allied` the Entente and `axis` the
 * Central Powers); every bloc name on screen goes through here, falling back to
 * the site-wide `time.bloc.*` strings. Pure.
 */
import type { BlocLabels } from '../../../content/schema/topic';
import { t, tx, type BilingualText, type Locale } from '../../../i18n';

/** `out` = "no longer at war" (the legend row for entities past their `left` date). */
export type BlocLabelKey = 'axis' | 'allied' | 'neutral' | 'out';

/** The bloc name in `locale`: the topic's label when it has one, else the UI string. */
export function blocLabel(labels: BlocLabels | undefined, key: BlocLabelKey, locale: Locale): string {
  const own = labels?.[key];
  return own ? tx(own, locale) : t(locale, `time.bloc.${key}`);
}

/** Both languages at once (legend items are bilingual). */
export function blocLabelText(labels: BlocLabels | undefined, key: BlocLabelKey): BilingualText {
  return { en: blocLabel(labels, key, 'en'), zh: blocLabel(labels, key, 'zh') };
}
