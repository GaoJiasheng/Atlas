/**
 * Stage overlay (docs/15 §4.5): the control panel's TOOLS — S symbol, E
 * equivalent names, N number line, L labels, P presentation, the glossary,
 * Hide HUD — and the KEY of the marks (yours, given, a second amount, taken
 * away, the right answer). In the practice the assists are switched off.
 */
import { ControlPanel, type ControlRow } from '../../widgets/ControlPanel';
import type { LegendItem } from '../../widgets/Legend';
import { t } from '../../../i18n';

const both = (key: Parameters<typeof t>[1]) => ({ en: t('en', key), zh: t('zh', key) });

export function MathOverlay({ glossary }: { glossary: boolean }) {
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
  return (
    <div className="atlas-overlay-card ms-overlay">
      <ControlPanel layers={[]} tools={tools} legend={legend} />
    </div>
  );
}
