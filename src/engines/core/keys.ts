/**
 * Scene keyboard (docs/08 §3), one window listener per scene:
 *   ← →  chapter            1–9, 0  camera presets (0 = the tenth)   letters  registered modes (L = labels)
 *   SPACE pause / run        H    hide / show HUD      ESC      show HUD, else engine escape
 * Ignored with Ctrl / Cmd / Alt, when an event was already handled, inside
 * text fields and selects, and inside `[data-keys="own"]` regions. Arrows also
 * yield to sliders, radio groups and tab lists; SPACE yields to focused buttons.
 */
import { useEffect } from 'react';
import { allModes, presetIndexOfKey, type HudActions, type HudStore } from './controls';

const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"], [data-keys="own"]';
const OWN_ARROW_KEYS = '[role="slider"], [role="radiogroup"], [role="tablist"]';
const OWN_SPACE = 'button, a[href], summary, [role="button"], [role="radio"], [role="checkbox"], [role="tab"], [role="switch"]';

export function useSceneKeys(hud: HudStore, actions: HudActions, step: (delta: 1 | -1) => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_FIELDS)) return;
      const key = e.key;

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        if (e.shiftKey || target?.closest(OWN_ARROW_KEYS)) return;
        e.preventDefault();
        step(key === 'ArrowRight' ? 1 : -1);
        return;
      }
      if (e.shiftKey) return;

      const { controls, labels } = hud.getState();
      if (key === 'Escape') {
        actions.escape();
        return;
      }
      if (key === ' ') {
        if (!controls.pause || target?.closest(OWN_SPACE)) return;
        e.preventDefault();
        actions.togglePaused();
        return;
      }
      const index = presetIndexOfKey(key);
      if (index !== null) {
        const preset = controls.presets?.items[index];
        if (preset) actions.setPreset(preset.id);
        return;
      }
      const k = key.toLowerCase();
      if (k === 'h') {
        actions.setHud(!hud.getState().hud);
        return;
      }
      const mode = allModes(controls, labels, '').find((m) => m.key?.toLowerCase() === k);
      if (mode && (!mode.disabled || mode.on)) actions.setMode(mode.id, !mode.on);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hud, actions, step]);
}
