import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { Icon } from '../widgets/icons';

/** Leave the map visible at tablet widths, including a 1024 px landscape screen. */
export function mapOverlayDefaultOpen(viewportWidth: number, stageWidth = viewportWidth) {
  return viewportWidth > 1024 && stageWidth >= 720;
}

/** Shared only by map views; folding never changes scene layers or map state. */
export function MapOverlay({
  label,
  stageRef,
  legend,
  children,
}: {
  label: string;
  stageRef?: RefObject<HTMLDivElement | null>;
  legend?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(mapOverlayDefaultOpen(window.innerWidth, stageRef?.current?.clientWidth));
    const tablet = window.matchMedia('(max-width: 1024px)');
    // Collapse when a desktop is narrowed, too. An explicit expansion stays open
    // while the reader uses it; changing chapters does not reset the choice.
    const collapse = () => {
      if (tablet.matches) setOpen(false);
    };
    tablet.addEventListener('change', collapse);
    return () => tablet.removeEventListener('change', collapse);
  }, [stageRef]);
  return (
    <details className="atlas-overlay-card ts-overlay" data-legend={legend} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="ts-overlay__summary" aria-label={label} aria-expanded={open}>
        <span className="ts-overlay__closed">
          <Icon name="layers" size={18} />
          <span>{label}</span>
        </span>
        <Icon name="close" size={18} className="ts-overlay__open" />
      </summary>
      {children}
    </details>
  );
}
