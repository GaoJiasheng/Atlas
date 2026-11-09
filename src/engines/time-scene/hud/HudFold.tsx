import { useId, type ReactNode } from 'react';
import { useHud, useSceneContext } from '../../core/context';
import { FoldHeader } from '../../widgets/FoldHeader';

/** TimeScene panels share the host's manual, automatic and stage-only folds. */
export function HudFold({ title, children, panel, kind = 'legends', className = '', headClassName = '', closeLabel, onClose, held }: {
  title: ReactNode;
  children: ReactNode;
  panel?: string;
  kind?: 'plate' | 'legends';
  className?: string;
  headClassName?: string;
  closeLabel?: string;
  onClose?(): void;
  /** The fold's own state instead of the host's (a panel a beat depends on, which the room logic must not fold). */
  held?: { open: boolean; set(open: boolean): void };
}) {
  const hostOpen = useHud((s) => kind === 'plate' ? s.plateOpen : s.legendsOpen);
  const open = held ? held.open : hostOpen;
  const { actions } = useSceneContext();
  const bodyId = useId();
  const setOpen = held ? held.set : kind === 'plate' ? actions.setPlate : actions.setLegends;
  return <section className={`ts-fold ${className}`} data-hud-panel={panel} data-folded={!open || undefined}>
    {/* Presentation's capture listener must leave Space to these native buttons. */}
    <div className="ts-fold__header" data-keys="own">
      <FoldHeader title={title} open={open} onToggle={() => setOpen(!open)} controls={bodyId} className={headClassName} />
      {closeLabel && <button type="button" className="ts-fold__close" hidden={!open} aria-label={closeLabel} onClick={() => onClose ? onClose() : setOpen(false)}>×</button>}
    </div>
    <div id={bodyId} className="ts-fold__body" hidden={!open}>{children}</div>
  </section>;
}
