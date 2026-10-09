import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  /** Renders a link (works as a plain navigation without JS handlers). */
  href?: string;
  lang?: string;
}

export interface DropdownProps {
  /** `hud`: 18 px hairline buttons in the scene top bar; `site`: same grammar, scaled up, on the index. */
  variant?: 'site' | 'hud';
  /** Accessible name of the menu button and the list. */
  label: string;
  /** Visible trigger text; a `▾` is appended. */
  text: string;
  items: readonly DropdownItem[];
  selectedId: string;
  onPick(item: DropdownItem, event: MouseEvent<HTMLElement>): void;
}

/**
 * Hairline dropdown in the `hud-btn` grammar (same family as the VIEW menu).
 * Keyboard: Enter / Space / ↓ opens on the selected item, ↑ ↓ Home End move,
 * Esc closes and returns focus to the button, moving focus elsewhere closes.
 * Closes on outside press. Hit areas are 44 px (touch and the site variant).
 */
export function Dropdown({ variant = 'site', label, text, items, selectedId, onPick }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const focusOnOpen = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    if (focusOnOpen.current) {
      const list = rootRef.current?.querySelector<HTMLElement>('.atlas-dd__list');
      (list?.querySelector<HTMLElement>('[aria-checked="true"]') ?? list?.querySelector<HTMLElement>('[role^="menuitem"]'))?.focus();
      focusOnOpen.current = false;
    }
    const inside = (target: EventTarget | null) => !!rootRef.current && target instanceof Node && rootRef.current.contains(target);
    const onDown = (e: PointerEvent) => {
      if (!inside(e.target)) setOpen(false);
    };
    const onFocusIn = (e: FocusEvent) => {
      if (!inside(e.target)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      focusOnOpen.current = true;
      setOpen(true);
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    // The scene's window-level shortcuts (← → digits, letters) must not fire from inside the menu.
    if (e.key !== 'Tab') e.stopPropagation();
    const nodes = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
    const at = nodes.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = (at + 1) % nodes.length;
    else if (e.key === 'ArrowUp') next = (at - 1 + nodes.length) % nodes.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = nodes.length - 1;
    if (next >= 0) {
      e.preventDefault();
      nodes[next]?.focus();
    }
  };

  return (
    <div ref={rootRef} className={`atlas-dd atlas-dd--${variant}`} data-open={open}>
      <button
        ref={buttonRef}
        type="button"
        className="hud-btn atlas-dd__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onKeyDown={onButtonKey}
        onClick={(e) => {
          if (!open && e.detail === 0) focusOnOpen.current = true;
          setOpen((o) => !o);
        }}
      >
        {text}
        <i aria-hidden="true">▾</i>
      </button>
      {open && (
        <ul id={listId} className="atlas-dd__list" role="menu" aria-label={label} onKeyDown={onListKey}>
          {items.map((item) => {
            const selected = item.id === selectedId;
            const common = {
              role: 'menuitemradio' as const,
              'aria-checked': selected,
              className: selected ? 'hud-btn atlas-dd__item on' : 'hud-btn atlas-dd__item',
              'data-dd-item': item.id,
              onClick: (e: MouseEvent<HTMLElement>) => {
                onPick(item, e);
                setOpen(false);
                buttonRef.current?.focus();
              },
            };
            return (
              <li key={item.id} role="none">
                {item.href ? (
                  <a {...common} href={item.href} hrefLang={item.lang} lang={item.lang}>
                    {item.label}
                  </a>
                ) : (
                  <button type="button" {...common}>
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
