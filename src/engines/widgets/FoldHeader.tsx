import type { ReactNode } from 'react';

/** Shared, labelled 44px reopen control. Native button supplies Enter/Space. */
export function FoldHeader({
  title,
  open,
  onToggle,
  controls,
  panel,
  vertical = false,
  className = '',
}: {
  title: ReactNode;
  open: boolean;
  onToggle(): void;
  controls?: string;
  panel?: string;
  vertical?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`atlas-fold ${vertical ? 'atlas-fold--vertical' : ''} ${className}`}
      data-fold-control=""
      data-hud-panel={panel}
      data-fold-tab={!open ? '' : undefined}
      aria-expanded={open}
      aria-controls={controls}
      onClick={(e) => {
        onToggle();
        if (e.detail > 0) e.currentTarget.blur();
      }}
    >
      <span>{title}</span>
      <i aria-hidden="true">{vertical ? (open ? '‹' : '›') : open ? '⌃' : '⌄'}</i>
    </button>
  );
}
