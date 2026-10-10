/**
 * Stage overlay (docs/15 §4.5): the control panel's TOOLS — S symbol, E
 * equivalent names, N number line, L labels, P presentation, the glossary,
 * Hide HUD — and the KEY of the marks (yours, given, a second amount, taken
 * away, the right answer). In the practice the assists are switched off.
 */
import { useState } from 'react';
import { ControlPanel, type ControlRow } from '../../widgets/ControlPanel';
import type { LegendItem } from '../../widgets/Legend';
import { Icon } from '../../widgets/icons';
import { useSceneContext } from '../../core/context';
import { t } from '../../../i18n';

const both = (key: Parameters<typeof t>[1]) => ({ en: t('en', key), zh: t('zh', key) });

/** `compact` (phones): the panel is folded behind one 44 px button, so the model keeps the stage. */
export function MathOverlay({ glossary, compact = false }: { glossary: boolean; compact?: boolean }) {
  const { locale } = useSceneContext();
  const [open, setOpen] = useState(false);
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
    <div className="atlas-overlay-card ms-overlay">
      <ControlPanel layers={[]} tools={tools} legend={legend} />
    </div>
  );
  if (!compact) return panel;
  return (
    <>
      <button type="button" className="ms-overlay__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'layers'} size={18} />
        <span>{t(locale, 'math.toolsAndKey')}</span>
      </button>
      {open && panel}
    </>
  );
}
