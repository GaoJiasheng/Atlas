/**
 * Selected part details (InfoPanel "inspector" slot), in the plate's hairline
 * grammar: part number + name (中文 beneath), summary, detail behind "more"
 * (blank lines = paragraphs; `[S3]` markers = source superscripts that open
 * the host's source popover), group swatch, "left / right" chips for a
 * bilateral pair (select the other side), "connected to" chips that select
 * the connected part. A part that links a shared muscle shows SOLO (that
 * part, what it connects to and the shells; the rest faint; Esc ends it) and
 * the four-tab muscle sheet (MuscleSheet) instead of detail and connects. In
 * exercise mode the exercise card comes first.
 */
import { useId, useState } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { Icon } from '../../widgets/icons';
import { SourceRefs } from '../../widgets/SourcePopover';
import { detailParagraphs } from '../lib/detail';
import { partNumber } from '../hud/common';
import type { SpaceSceneExt } from '../index';
import type { Part, PartsFile } from '../schema';
import type { FitnessBundle, TrainingFile } from '../../../content/schema/fitness';
import { MuscleSheet } from './MuscleSheet';
import { ExerciseCard } from './ExerciseCard';

function PartDetails({ part, file, fitness, training }: { part: Part; file: PartsFile; fitness: FitnessBundle | undefined; training: TrainingFile | undefined }) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const solo = useScene<SpaceSceneExt, string | null>((s) => s.solo);
  const [open, setOpen] = useState(false);
  const sheet = part.muscle ? fitness?.muscles.find((m) => m.id === part.muscle) : undefined;
  const soloOn = solo === part.id;
  const detailId = useId();
  const group = part.group !== undefined ? file.groups.find((g) => g.id === part.group) : undefined;
  const connects = part.connects
    .map((id) => file.parts.find((p) => p.id === id))
    .filter((p): p is Part => p !== undefined);
  const detail = detailParagraphs(tx(part.detail, locale));

  return (
    <section className="space-inspector" aria-label={tx(part.name, locale)}>
      <header className="space-inspector__header">
        <span className="space-inspector__no" aria-hidden="true">
          {partNumber(file, part.id)}
        </span>
        <h3 className="space-inspector__title">
          {tx(part.name, locale)}
          {locale === 'en' && part.name.zh && (
            <small lang="zh-Hans">{part.name.zh}</small>
          )}
        </h3>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon space-inspector__close"
          aria-label={t('space.deselect')}
          onClick={() => store.getState().patch({ part: null })}
        >
          <Icon name="close" size={18} />
        </button>
      </header>

      <p className="space-inspector__summary">{tx(part.summary, locale)}</p>

      {sheet && (
      <div className="space-inspector__row">
        <button
          type="button"
          className="atlas-control space-chip"
          aria-pressed={soloOn}
          title={soloOn ? t('space.soloPartOff') : t('space.soloPart')}
          onClick={() => store.getState().patch({ solo: soloOn ? null : part.id })}
        >
          {t('space.soloShort')}
        </button>
      </div>
      )}

      {sheet && fitness && <MuscleSheet part={part} sheet={sheet} file={file} fitness={fitness} training={training} />}

      {!sheet && detail.length > 0 && (
        <>
          <div id={detailId} className="space-inspector__detail" hidden={!open}>
            {detail.map((runs, i) => (
              <p key={i}>
                {runs.map((run, j) => ('text' in run ? run.text : <SourceRefs key={j} ids={run.sources} locale={locale} />))}
              </p>
            ))}
          </div>
          <button
            type="button"
            className="atlas-control atlas-control--ghost space-inspector__more"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? t('space.less') : t('space.more')}
          </button>
        </>
      )}

      {part.pair && part.side && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.side')}</span>
          <ul className="space-chips">
            {(['left', 'right'] as const).map((side) => (
              <li key={side}>
                <button
                  type="button"
                  className="atlas-control space-chip"
                  aria-pressed={part.side === side}
                  data-side={side}
                  onClick={() => {
                    if (part.side !== side) store.getState().patch({ part: part.pair! });
                  }}
                >
                  {t(side === 'left' ? 'space.side.left' : 'space.side.right')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {group && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.group')}</span>
          <span className="space-chip space-chip--static">
            <span className="atlas-legend__fill" style={{ background: resolveColorRef(group.color) }} aria-hidden="true" />
            {tx(group.name, locale)}
          </span>
        </div>
      )}

      {!sheet && connects.length > 0 && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.connects')}</span>
          <ul className="space-chips">
            {connects.map((p) => (
              <li key={p.id}>
                <button type="button" className="atlas-control space-chip" onClick={() => store.getState().patch({ part: p.id })}>
                  {tx(p.name, locale)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function Inspector({ file, fitness, training }: { file: PartsFile; fitness?: FitnessBundle | undefined; training?: TrainingFile | undefined }) {
  const t = useT();
  const partId = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const exerciseId = useScene<SpaceSceneExt, string | null>((s) => s.exercise?.id ?? null);
  const part = partId ? file.parts.find((p) => p.id === partId && !p.context) : undefined;
  const exercise = exerciseId && fitness ? fitness.exercises.find((e) => e.id === exerciseId) : undefined;
  return (
    <>
      {exercise && fitness && (
        <ExerciseCard key={exercise.id} exercise={exercise} file={file} fitness={fitness} playable={training?.exercises.includes(exercise.id) ?? false} />
      )}
      {/* Keyed so "more" collapses again when the selection changes. */}
      {part ? (
        <PartDetails key={part.id} part={part} file={file} fitness={fitness} training={training} />
      ) : (
        !exercise && <p className="space-hint">{t('space.hint')}</p>
      )}
    </>
  );
}
