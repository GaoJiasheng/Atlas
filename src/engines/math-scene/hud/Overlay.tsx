/**
 * Stage overlay (docs/15 §4.5): the control panel's TOOLS — S symbol, E
 * equivalent names, N number line, L labels, P presentation, the glossary,
 * Hide HUD — and the KEY of the marks (yours, given, a second amount, taken
 * away, the right answer). In the practice the assists are switched off.
 */
import { useId } from 'react';
import { ControlPanel, type ControlRow } from '../../widgets/ControlPanel';
import type { LegendItem } from '../../widgets/Legend';
import { FoldHeader } from '../../widgets/FoldHeader';
import { useHud, useSceneContext } from '../../core/context';
import { t } from '../../../i18n';

const both = (key: Parameters<typeof t>[1]) => ({ en: t('en', key), zh: t('zh', key) });

/** `compact` (phones): the panel is folded behind one 44 px button, so the model keeps the stage. */
export function MathOverlay({ glossary, compact = false }: { glossary: boolean; compact?: boolean }) {
  const { locale, actions } = useSceneContext();
  const open = useHud((h) => h.legendsOpen);
  const bodyId = useId();
  const tools: ControlRow[] = [
    { kind: 'mode', id: 'symbol' },
    { kind: 'mode', id: 'equivalent' },
    { kind: 'mode', id: 'numberline' },
    { kind: 'mode', id: 'labels' },
    { kind: 'mode', id: 'presentation' },
    ...(glossary ? [{ kind: 'glossary' } as ControlRow] : []),
    { kind: 'hud' },
  ];
  const legend: LegendItem[] = [
    { id: 'mine', label: both('math.key.mine'), color: 'var(--signal)', kind: 'fill' },
    { id: 'given', label: both('math.key.given'), color: 'var(--cold)', kind: 'fill' },
    { id: 'second', label: both('math.key.second'), color: 'var(--hot)', kind: 'fill' },
    { id: 'taken', label: both('math.key.taken'), color: 'var(--ink)', kind: 'hatch' },
    { id: 'answer', label: both('math.key.answer'), color: 'var(--ink)', kind: 'dashed' },
  ];
  const panel = (
    <div id={bodyId} className="atlas-overlay-card ms-overlay" hidden={compact && !open}>
      <ControlPanel layers={[]} tools={tools} legend={legend} />
    </div>
  );
  return (
    // The host's `overlay` slot is the HUD block (stage layout, layout checks): a second block here would count twice.
    <div className="ms-overlay-panel" data-folded={open ? undefined : ''}>
      {compact && <FoldHeader className="ms-overlay__toggle" title={t(locale, 'math.toolsAndKey')} open={open} controls={bodyId} onToggle={() => actions.setLegends(!open)} />}
      {panel}
    </div>
  );
}
