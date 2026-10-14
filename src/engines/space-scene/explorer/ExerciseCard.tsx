/**
 * The exercise card (docs/16 §6.5, M8) in the reading panel's inspector slot
 * (the phone's bottom drawer too): the two-panel drawing, equipment and
 * level, prime movers / helpers / steadiers (chips select the part that shows
 * the muscle), set-up, steps, cues, common mistakes, the dose in words,
 * cautions, what research shows (with sources), the safety line every card
 * carries, and START / END / LOOP for the stage when the topic can play it.
 */
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx, withBase, type UiKey } from '../../../i18n';
import { Icon } from '../../widgets/icons';
import { SourceRefs } from '../../widgets/SourcePopover';
import { EXERCISE_PHASES, type ExercisePhase } from '../../../lib/anatomy';
import type { ExerciseSheet, FitnessBundle } from '../../../content/schema/fitness';
import type { Bilingual } from '../../../content/schema/common';
import { musclePartIds } from '../lib/rig';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';

function List({ label, items, ordered = false }: { label: UiKey; items: readonly Bilingual[]; ordered?: boolean }) {
  const { locale } = useSceneContext();
  const t = useT();
  if (items.length === 0) return null;
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <div className="space-sheet__block">
      <span className="space-inspector__label">{t(label)}</span>
      <Tag className="space-sheet__list">
        {items.map((it, i) => (
          <li key={i}>{tx(it, locale)}</li>
        ))}
      </Tag>
    </div>
  );
}

export function ExerciseCard({ exercise, file, fitness, playable }: { exercise: ExerciseSheet; file: PartsFile; fitness: FitnessBundle; playable: boolean }) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const phase = useScene<SpaceSceneExt, ExercisePhase | null>((s) => s.exercise?.phase ?? null);
  const parentOf = new Map(fitness.muscles.map((m) => [m.id, m.parent]));
  const name = tx(exercise.name, locale);
  const chips = (label: UiKey, ids: readonly string[]) =>
    ids.length > 0 && (
      <div className="space-inspector__row">
        <span className="space-inspector__label">{t(label)}</span>
        <ul className="space-chips">
          {ids.map((id) => {
            const muscle = fitness.muscles.find((m) => m.id === id);
            const target = musclePartIds(file.parts, id, parentOf)[0];
            const text = muscle ? tx(muscle.short ?? muscle.name, locale) : id;
            return (
              <li key={id}>
                {target ? (
                  <button type="button" className="atlas-control space-chip" onClick={() => store.getState().patch({ part: target })}>
                    {text}
                  </button>
                ) : (
                  <span className="space-chip space-chip--static">{text}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  const cited = (items: readonly { text: Bilingual; s: readonly string[] }[], label: UiKey) =>
    items.length > 0 && (
      <div className="space-sheet__block">
        <span className="space-inspector__label">{t(label)}</span>
        {items.map((d, i) => (
          <p key={i}>
            {tx(d.text, locale)}
            <SourceRefs ids={d.s} locale={locale} />
          </p>
        ))}
      </div>
    );

  return (
    <section className="space-inspector space-exercise" aria-label={`${t('space.exercise.card')}: ${name}`}>
      <header className="space-inspector__header">
        <span className="space-inspector__no" aria-hidden="true">
          {t(`space.exercise.equipment.${exercise.equipment}` as UiKey).toUpperCase()}
        </span>
        <h3 className="space-inspector__title">
          {name}
          {locale === 'en' && exercise.name.zh && <small lang="zh-Hans">{exercise.name.zh}</small>}
          {locale === 'zh' && exercise.name.zh && <small lang="en">{exercise.name.en}</small>}
        </h3>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon space-inspector__close"
          aria-label={t('space.exercise.leave')}
          onClick={() => store.getState().patch({ exercise: null })}
        >
          <Icon name="close" size={18} />
        </button>
      </header>
      <p className="space-exercise__meta">{t(`space.exercise.level.${exercise.level}` as UiKey)}</p>
      {playable && exercise.motion && (
        <div className="space-sheet__tabs" role="group" aria-label={t('space.exercise.phase')}>
          {EXERCISE_PHASES.map((p) => (
            <button
              key={p}
              type="button"
              className="atlas-control space-sheet__tab"
              aria-pressed={phase === p}
              onClick={() => {
                const cur = store.getState().exercise;
                store.getState().patch({ exercise: { ...(cur?.id === exercise.id ? cur : {}), id: exercise.id, phase: p } });
              }}
            >
              {t(`space.exercise.phase.${p}` as UiKey)}
            </button>
          ))}
        </div>
      )}
      {exercise.sketch && (
        <img
          className="space-exercise__sketch"
          src={withBase(`/illustrations/exercises/${exercise.sketch}.webp`)}
          width={1200}
          height={800}
          alt={t('space.exercise.sketch', { name })}
          loading="lazy"
          decoding="async"
        />
      )}
      {chips('space.exercise.primary', exercise.primary)}
      {chips('space.exercise.secondary', exercise.secondary)}
      {chips('space.exercise.stabilisers', exercise.stabilisers)}
      <div className="space-sheet__block">
        <span className="space-inspector__label">{t('space.exercise.setup')}</span>
        <p>{tx(exercise.setup, locale)}</p>
      </div>
      <List label="space.exercise.steps" items={exercise.steps} ordered />
      <List label="space.exercise.cues" items={exercise.cues} />
      <List label="space.exercise.mistakes" items={exercise.mistakes} />
      {cited(exercise.dose, 'space.exercise.dose')}
      <List label="space.exercise.cautions" items={exercise.cautions} />
      {cited(exercise.evidence, 'space.exercise.evidence')}
      <p className="space-exercise__safety">
        {t('space.exercise.safety')}
        {exercise.sources.length > 0 && <SourceRefs ids={exercise.sources} locale={locale} />}
      </p>
    </section>
  );
}
