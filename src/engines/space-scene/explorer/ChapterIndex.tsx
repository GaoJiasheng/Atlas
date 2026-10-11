/**
 * The chapter index (slot `readerEnd`, after the chapter body; docs/08 §2 HUD
 * 铁律 e): every object the chapter talks about, reachable from the reading
 * panel, from the chapter's `state.index`.
 *
 *  - `exercises`: grouped by equipment (barbell, dumbbell, bodyweight, cable,
 *    machine, then the rest; the list's order inside a group). A row = the
 *    two-panel sketch thumbnail, the name (the other language beneath), the
 *    equipment and the prime movers' short names; pressing it puts the model
 *    into that exercise (exercise mode, like the muscle sheet's chips) and the
 *    card appears at the top of the panel. Then `training.json`'s example
 *    session: its title, each block (exercise, pressable the same way, and
 *    note), its note and sources.
 *  - `parts`: number, short name, one line of what it does; pressing selects
 *    the part (the inspector at the top of the panel).
 *
 * Rows are 44 px+ buttons with `aria-pressed` for the exercise / part on show.
 */
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx, withBase, type UiKey } from '../../../i18n';
import { SourceRefs } from '../../widgets/SourcePopover';
import { EXERCISE_EQUIPMENT, type ExerciseSheet, type FitnessBundle, type TrainingFile } from '../../../content/schema/fitness';
import { clip, partNumber } from '../hud/common';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, SpaceChapterIndex } from '../schema';

/** Equipment order of the exercise index (docs/16 decision 11: free weights, body weight, then cable and machine). */
export const INDEX_EQUIPMENT_ORDER = ['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine', 'band', 'kettlebell'] as const satisfies readonly (typeof EXERCISE_EQUIPMENT)[number][];

/** Exercises grouped by equipment in `INDEX_EQUIPMENT_ORDER`, each group in the list's order (pure). */
export function groupByEquipment<E extends Pick<ExerciseSheet, 'equipment'>>(exercises: readonly E[]): { equipment: E['equipment']; items: E[] }[] {
  return INDEX_EQUIPMENT_ORDER.map((equipment) => ({ equipment, items: exercises.filter((e) => e.equipment === equipment) })).filter((g) => g.items.length > 0);
}

function ExerciseIndex({ ids, fitness, training }: { ids: readonly string[]; fitness: FitnessBundle; training: TrainingFile | undefined }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const on = useScene<SpaceSceneExt, string | null>((s) => s.exercise?.id ?? null);
  const exercises = ids.map((id) => fitness.exercises.find((e) => e.id === id)).filter((e): e is ExerciseSheet => e !== undefined);
  const muscleName = (id: string) => {
    const m = fitness.muscles.find((x) => x.id === id);
    return m ? tx(m.short ?? m.name, locale) : id;
  };
  const play = (id: string) => store.getState().patch({ exercise: { id, phase: 'loop' }, demo: null, part: null });
  const nameOf = (id: string) => {
    const e = fitness.exercises.find((x) => x.id === id);
    return e ? tx(e.name, locale) : id;
  };
  const session = training?.session;
  return (
    <>
      <section className="space-index" aria-labelledby="space-index-ex">
        <h3 id="space-index-ex" className="space-index__title">
          {t('space.index.exercises')}
        </h3>
        {groupByEquipment(exercises).map((g) => (
          <div key={g.equipment} className="space-index__group">
            <h4 className="space-index__eq">{t(`space.exercise.equipment.${g.equipment}` as UiKey)}</h4>
            <ul className="space-index__list">
              {g.items.map((e) => {
                const name = tx(e.name, locale);
                const other = locale === 'zh' ? e.name.en : e.name.zh;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="space-index__row space-index__row--ex"
                      data-exercise={e.id}
                      aria-pressed={on === e.id}
                      title={t('space.index.try', { name })}
                      onClick={() => play(e.id)}
                    >
                      {e.sketch ? (
                        <img
                          className="space-index__thumb"
                          src={withBase(`/illustrations/exercises/${e.sketch}.webp`)}
                          width={1200}
                          height={800}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="space-index__thumb" aria-hidden="true" />
                      )}
                      <span className="space-index__text">
                        <span className="space-index__name">
                          {name}
                          {other && other !== name && <small lang={locale === 'zh' ? 'en' : 'zh-Hans'}>{other}</small>}
                        </span>
                        <span className="space-index__meta">
                          {t(`space.exercise.equipment.${e.equipment}` as UiKey)} · {e.primary.map(muscleName).join(' · ')}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
      {session && (
        <section className="space-index space-index--session" aria-labelledby="space-index-session">
          <h3 id="space-index-session" className="space-index__title">
            {tx(session.title, locale)}
          </h3>
          <ol className="space-index__session">
            {session.blocks.map((b, i) => (
              <li key={`${b.exercise}-${i}`}>
                <button type="button" className="space-index__step" aria-pressed={on === b.exercise} onClick={() => play(b.exercise)}>
                  {nameOf(b.exercise)}
                </button>
                {b.note && <p>{tx(b.note, locale)}</p>}
              </li>
            ))}
          </ol>
          {session.note && (
            <p className="space-index__note">
              {tx(session.note, locale)}
              {session.s.length > 0 && <SourceRefs ids={session.s} locale={locale} />}
            </p>
          )}
        </section>
      )}
    </>
  );
}

function PartIndex({ ids, file }: { ids: readonly string[]; file: PartsFile }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const parts = ids.map((id) => file.parts.find((p) => p.id === id && !p.context)).filter((p) => p !== undefined);
  return (
    <section className="space-index" aria-labelledby="space-index-parts">
      <h3 id="space-index-parts" className="space-index__title">
        {t('space.index.parts')}
      </h3>
      <ul className="space-index__list">
        {parts.map((p) => {
          const name = tx(p.short ?? p.name, locale);
          return (
            <li key={p.id}>
              <button
                type="button"
                className="space-index__row"
                data-part={p.id}
                aria-pressed={selected === p.id}
                title={t('space.index.select', { name })}
                onClick={() => store.getState().patch({ part: p.id })}
              >
                <span className="space-index__no">{partNumber(file, p.id)}</span>
                <span className="space-index__text">
                  <span className="space-index__name">{name}</span>
                  <span className="space-index__meta">{clip(tx(p.summary, locale), locale === 'zh' ? 40 : 96)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ChapterIndex({
  index,
  file,
  fitness,
  training,
}: {
  index: SpaceChapterIndex | undefined;
  file: PartsFile;
  fitness: FitnessBundle | undefined;
  training: TrainingFile | undefined;
}) {
  if (!index) return null;
  return (
    <>
      {index.exercises && fitness && <ExerciseIndex ids={index.exercises} fitness={fitness} training={training} />}
      {index.parts && <PartIndex ids={index.parts} file={file} />}
    </>
  );
}
