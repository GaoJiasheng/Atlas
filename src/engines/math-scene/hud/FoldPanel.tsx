import { useId, type CSSProperties, type ReactNode } from 'react';
import { useHud, useSceneContext } from '../../core/context';
import { FoldHeader } from '../../widgets/FoldHeader';

/** Math's stage readouts share the KEY fold policy and retain a labelled reopen row. */
export function FoldPanel({ panel, title, className, style, children, compact = false }: {
  panel: string;
  title: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Presentation equations stay outside the HUD folds. */
  compact?: boolean;
}) {
  const open = useHud((h) => h.legendsOpen);
  const { actions } = useSceneContext();
  const bodyId = useId();
  return (
    <div className={className} data-hud-panel={compact ? undefined : panel} data-folded={!compact && !open ? '' : undefined} style={style}>
      {!compact && <FoldHeader title={title} open={open} controls={bodyId} onToggle={() => actions.setLegends(!open)} />}
      <div id={bodyId} hidden={!compact && !open}>{children}</div>
    </div>
  );
}
