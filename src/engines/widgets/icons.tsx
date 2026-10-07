/**
 * Inline SVG icons (no icon font, no network). 24x24 grid, `currentColor`.
 */
import type { SVGProps } from 'react';

export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-left'
  | 'paper'
  | 'film'
  | 'auto'
  | 'globe'
  | 'shield'
  | 'lock'
  | 'check'
  | 'close'
  | 'layers'
  | 'settings'
  | 'person'
  | 'ship'
  | 'plane'
  | 'square'
  | 'help';

const PATHS: Record<IconName, string> = {
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  'arrow-left': 'M19 12H5m6-6l-6 6 6 6',
  paper: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7',
  film: 'M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4',
  auto: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 0v18',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3',
  check: 'M5 12.5l4.5 4.5L19 7',
  close: 'M6 6l12 12M18 6L6 18',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  settings:
    'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 01-2 1.2L14.8 21h-4l-.3-2.4a7 7 0 01-2-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 010-2.6L4.6 9.8l2-3.4 1.9.7a7 7 0 012-1.2L10.8 3h4l.3 2.4a7 7 0 012 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 010 2.6z',
  person: 'M12 4a3 3 0 110 6 3 3 0 010-6zM6.5 20v-3.5A4.5 4.5 0 0111 12h2a4.5 4.5 0 014.5 4.5V20z',
  ship: 'M4 15l1.5 4h13l1.5-4zM6 15V10h12v5M9 10V6h6v4M12 3v3',
  plane: 'M21 12l-8-1.5V5.5L11.5 3 10 5.5v5L3 12v2l7-.5v4.5l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.5l8 .5z',
  square: 'M5 5h14v14H5z',
  help: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1.2-1.5 2.5M12 17h.01',
};

const FILLED: Partial<Record<IconName, true>> = { person: true, ship: true, plane: true, square: true };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Accessible label; omit for decorative icons. */
  label?: string;
}

export function Icon({ name, size = 20, label, ...rest }: IconProps) {
  const filled = FILLED[name] === true;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
