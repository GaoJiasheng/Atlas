/**
 * Bloc names. A topic may rename the engine's fixed blocs in `topic.yaml`
 * (`blocLabels`: the First World War calls `allied` the Entente and `axis` the
 * Central Powers); every bloc name on screen goes through here, falling back to
 * the site-wide `time.bloc.*` strings. Pure.
 */
import type { BlocLabels, EntityStrings } from '../../../content/schema/topic';
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

/** Entity wording a topic may override (`topic.strings`); the UI strings otherwise. */
export type EntityWordKey = 'joined' | 'left' | 'notYet';
const ENTITY_WORD_UI = { joined: 'time.entity.joined', left: 'time.entity.left', notYet: 'time.bloc.notYet' } as const;

/** The entity card's heading for a date (`Joined` / `加入`), or the topic's own word (`appears` / `出现`). */
export function entityWord(strings: EntityStrings | undefined, key: EntityWordKey, locale: Locale): string {
  const own = strings?.[key];
  return own ? tx(own, locale) : t(locale, ENTITY_WORD_UI[key]);
}

/**
 * The dated half of an entity's leader note: `joined 1941` / `1941 加入` from
 * the UI string, or the topic's word with the date (`appears 770 BCE` /
 * `公元前770年出现`).
 */
export function entityDated(strings: EntityStrings | undefined, key: 'joined' | 'left', date: string, locale: Locale): string | null {
  const own = strings?.[key];
  if (!own) return key === 'joined' ? t(locale, 'time.joinedOn', { date }) : null;
  const word = tx(own, locale);
  return locale === 'zh' ? `${date}${word}` : `${word} ${date}`;
}
