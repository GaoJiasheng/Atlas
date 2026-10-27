/** Missions-only reader controls: the same beat action as map ticks, with phone-sized targets. */
import { useLayoutEffect, useRef } from 'react';
import { useT } from '../../core/context';
import { Icon } from '../../widgets/icons';

export function MissionBeatLine({ captions, beat, focus, onBeat }: { captions: readonly string[]; beat: number | null; focus: string; onBeat(index: number): void }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.closest('.atlas-panel__scroll')?.scrollTo({ top: 0 });
  }, [beat, focus]);
  if (captions.length === 0) return null;
  const previous = beat === null ? null : beat - 1;
  const next = beat === null ? 0 : beat + 1;
  return <div className="ts-beatline" ref={ref}>
    <p className="ts-beatline__text" aria-live="polite">
      <b>{t('space.beat.label')} {beat === null ? '–' : beat + 1}/{captions.length}</b>
      {beat !== null && <span>{captions[beat]}</span>}
    </p>
    <nav className="ts-beatline__nav" aria-label={t('space.beat.label')}>
      <button type="button" data-time-beat="prev" aria-label={t('space.beat.prev')} disabled={previous === null || previous < 0} onClick={() => { if (previous !== null && previous >= 0) onBeat(previous); }}><Icon name="chevron-left" size={16} /></button>
      <button type="button" data-time-beat="next" aria-label={t('space.beat.next')} disabled={next >= captions.length} onClick={() => onBeat(next)}><Icon name="chevron-right" size={16} /></button>
    </nav>
  </div>;
}
