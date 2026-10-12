/**
 * The muscle sheet (docs/16 §8, M9): for a part that links a shared `muscle`,
 * the inspector shows four tabs (also in the phone's bottom drawer, which is
 * the same reading panel):
 *
 *   FEATURES   layer, origin and insertion (bone chips select the bone),
 *              fibres, where to find it on yourself, "tell me more"
 *   ACTIONS    joint · movement · role, each with a demo button that swings
 *              the joint through the movement (when the rig can) while the
 *              muscle contracts
 *   TRAINING   common mistakes, the topic's principle line, injuries
 *   EXERCISES  chips: enter exercise mode with that exercise's card
 *
 * Tabs are a WAI-ARIA tablist (← → between tabs, 44 px targets).
 */
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx, type UiKey } from '../../../i18n';
import { SourceRefs } from '../../widgets/SourcePopover';
import type { FitnessBundle, MuscleSheet as Sheet, TrainingFile } from '../../../content/schema/fitness';
import type { Movement } from '../../../lib/anatomy';
import { detailParagraphs } from '../lib/detail';
import { canMove, jointCandidates } from '../lib/rig';
import type { SpaceSceneExt } from '../index';
import type { Part, PartsFile } from '../schema';

const TABS = ['features', 'actions', 'training', 'exercises'] as const;
type Tab = (typeof TABS)[number];

function Paragraphs({ text }: { text: string }) {
  const { locale } = useSceneContext();
  return (
    <>
      {detailParagraphs(text).map((runs, i) => (
        <p key={i}>{runs.map((run, j) => ('text' in run ? run.text : <SourceRefs key={j} ids={run.sources} locale={locale} />))}</p>
      ))}
    </>
  );
}

export function MuscleSheet({
  part,
  sheet,
  file,
  fitness,
  training,
}: {
  part: Part;
  sheet: Sheet;
  file: PartsFile;
  fitness: FitnessBundle;
  training: TrainingFile | undefined;
}) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const demo = useScene<SpaceSceneExt, SpaceSceneExt['demo']>((s) => s.demo);
  const [tab, setTab] = useState<Tab>('features');
  const [more, setMore] = useState(false);
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (id: string) => store.getState().patch({ part: id });
  const side = part.side === 'right' ? '.r' : '.l';
  const bonePart = (bone: string) => {
    const twin = part.side === 'right' ? file.parts.find((p) => p.twinOf === bone) : undefined;
    return twin ?? file.parts.find((p) => p.id === bone && !p.context);
  };
  const onKey = (e: KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i + TABS.length - 1) % TABS.length : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next]!);
    tabRefs.current[next]?.focus();
  };
  const exercises = sheet.exercises.map((id) => fitness.exercises.find((e) => e.id === id)).filter((e) => e !== undefined);

  const attachment = (label: UiKey, a: Sheet['origin']) => (
    <div className="space-sheet__block">
      <span className="space-inspector__label">{t(label)}</span>
      <p>
        {tx(a.text, locale)}
        {a.s.length > 0 && <SourceRefs ids={a.s} locale={locale} />}
      </p>
      <ul className="space-chips">
        {a.bones.map((bone) => {
          const p = bonePart(bone);
          return p ? (
            <li key={bone}>
              <button type="button" className="atlas-control space-chip" onClick={() => select(p.id)}>
                {tx(p.short ?? p.name, locale)}
              </button>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );

  return (
    <div className="space-sheet">
      <div className="space-sheet__tabs" role="tablist" aria-label={t('space.muscle.tabs')} onKeyDown={onKey}>
        {TABS.map((id, i) => (
          <button
            key={id}
            ref={(el) => void (tabRefs.current[i] = el)}
            type="button"
            role="tab"
            id={`${base}-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`${base}-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className="atlas-control space-sheet__tab"
            onClick={() => setTab(id)}
          >
            {t(`space.muscle.tab.${id}` as UiKey)}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel-${tab}`} aria-labelledby={`${base}-tab-${tab}`} className="space-sheet__panel">
        {tab === 'features' && (
          <>
            <div className="space-inspector__row">
              <span className="space-inspector__label">{t('space.muscle.layer')}</span>
              <span>{t(`space.muscle.layer.${sheet.layer}` as UiKey)}</span>
            </div>
            {attachment('space.muscle.origin', sheet.origin)}
            {attachment('space.muscle.insertion', sheet.insertion)}
            <div className="space-sheet__block">
              <span className="space-inspector__label">{t('space.muscle.fibres')}</span>
              <p>
                <b>{t(`space.muscle.fibre.${sheet.fibres.arrangement}` as UiKey)}</b> · {tx(sheet.fibres.direction, locale)}
              </p>
            </div>
            <div className="space-sheet__block">
              <span className="space-inspector__label">{t('space.muscle.feel')}</span>
              <p>{tx(sheet.feel, locale)}</p>
            </div>
            <div className="space-inspector__detail" id={`${base}-more`} hidden={!more}>
              <Paragraphs text={tx(part.detail, locale)} />
            </div>
            <button
              type="button"
              className="atlas-control atlas-control--ghost space-inspector__more"
              aria-expanded={more}
              aria-controls={`${base}-more`}
              onClick={() => setMore((o) => !o)}
            >
              {more ? t('space.less') : t('space.more')}
            </button>
          </>
        )}
        {tab === 'actions' &&
          (sheet.actions.length === 0 ? (
            <p className="space-sheet__empty">{t('space.muscle.noActions')}</p>
          ) : (
            <ul className="space-sheet__actions">
              {sheet.actions.map((a, i) => {
                const joint = jointCandidates(a.joint, a.movement, side === '.r' ? 'r' : 'l')
                  .map((n) => file.rig?.joints[n])
                  .find((j) => j !== undefined && canMove(j.axes, a.movement as Movement));
                const can = joint !== undefined && canMove(joint.axes, a.movement as Movement);
                const on = demo?.part === part.id && demo.joint === a.joint && demo.movement === a.movement;
                const movement = t(`anatomy.movement.${a.movement}` as UiKey);
                return (
                  <li key={i}>
                    <span className="space-sheet__action">
                      <b>{t(`anatomy.joint.${a.joint}` as UiKey)}</b> · {movement}
                      <small>
                        {t(`space.muscle.role.${a.role}` as UiKey)}
                        {a.s.length > 0 && <SourceRefs ids={a.s} locale={locale} />}
                      </small>
                    </span>
                    {can && (
                      <button
                        type="button"
                        className="atlas-control space-chip"
                        aria-pressed={on}
                        aria-label={on ? t('space.muscle.demoStop') : t('space.muscle.demo', { movement })}
                        onClick={() => store.getState().patch({ demo: on ? null : { part: part.id, joint: a.joint, movement: a.movement }, exercise: null })}
                      >
                        {on ? t('space.muscle.demoStop') : t('space.muscle.demoShort')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        {tab === 'training' && (
          <>
            {sheet.mistakes.length > 0 && (
              <div className="space-sheet__block">
                <span className="space-inspector__label">{t('space.muscle.mistakes')}</span>
                <ul className="space-sheet__list">
                  {sheet.mistakes.map((m, i) => (
                    <li key={i}>{tx(m, locale)}</li>
                  ))}
                </ul>
              </div>
            )}
            {training?.note && <p>{tx(training.note, locale)}</p>}
            {sheet.injury && (
              <div className="space-sheet__block">
                <span className="space-inspector__label">{t('space.muscle.injury')}</span>
                <Paragraphs text={tx(sheet.injury, locale)} />
              </div>
            )}
          </>
        )}
        {tab === 'exercises' && (
          <ul className="space-chips space-sheet__exercises">
            {exercises.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="atlas-control space-chip"
                  onClick={() => store.getState().patch({ exercise: { id: e.id, phase: 'loop' }, demo: null })}
                >
                  {tx(e.short ?? e.name, locale)}
                  <small>{t(`space.exercise.equipment.${e.equipment}` as UiKey)}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
