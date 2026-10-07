import { useId, useState } from 'react';
import type { Locale, QuizItem } from '../core/types';
import { t, tx } from '../../i18n';
import { Icon } from './icons';

export interface QuizCardProps {
  item: QuizItem;
  locale: Locale;
}

type Answer = { index: number; correct: boolean } | null;

/**
 * One question, 2–4 options. A wrong answer shows the explanation and lets the
 * reader try again; nothing is scored or stored. Can be hidden.
 */
export function QuizCard({ item, locale }: QuizCardProps) {
  const [open, setOpen] = useState(true);
  const [answer, setAnswer] = useState<Answer>(null);
  const headingId = useId();

  if (!open) {
    return (
      <div className="atlas-quiz atlas-quiz--closed">
        <button type="button" className="atlas-control atlas-control--ghost" onClick={() => setOpen(true)}>
          <Icon name="help" />
          <span>{t(locale, 'quiz.show')}</span>
        </button>
      </div>
    );
  }

  const solved = answer?.correct === true;

  return (
    <section className="atlas-quiz" aria-labelledby={headingId}>
      <header className="atlas-quiz__header">
        <h3 id={headingId} className="atlas-quiz__heading">
          <Icon name="help" size={18} /> {t(locale, 'quiz.heading')}
        </h3>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon"
          aria-label={t(locale, 'quiz.close')}
          onClick={() => setOpen(false)}
        >
          <Icon name="close" />
        </button>
      </header>
      <p className="atlas-quiz__question">{tx(item.q, locale)}</p>
      <ul className="atlas-quiz__options">
        {item.options.map((option, index) => {
          const chosen = answer?.index === index;
          const state = chosen ? (answer?.correct ? 'correct' : 'wrong') : solved && index === item.answer ? 'correct' : undefined;
          return (
            <li key={index}>
              <button
                type="button"
                className="atlas-quiz__option"
                data-state={state}
                aria-pressed={chosen}
                disabled={solved && !chosen}
                onClick={() => setAnswer({ index, correct: index === item.answer })}
              >
                <span className="atlas-quiz__letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{tx(option, locale)}</span>
                {state === 'correct' && <Icon name="check" className="atlas-quiz__mark" />}
                {state === 'wrong' && <Icon name="close" className="atlas-quiz__mark" />}
              </button>
            </li>
          );
        })}
      </ul>
      <div role="status" className="atlas-quiz__feedback">
        {answer?.correct && <p className="atlas-quiz__correct">{t(locale, 'quiz.correct')}</p>}
        {answer && !answer.correct && (
          <div className="atlas-quiz__wrong">
            <p>
              <strong>{t(locale, 'quiz.wrong')}</strong> {item.explain ? tx(item.explain, locale) : ''}
            </p>
            <button type="button" className="atlas-control" onClick={() => setAnswer(null)}>
              {t(locale, 'quiz.tryAgain')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
