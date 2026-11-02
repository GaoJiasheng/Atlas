import { useStore } from 'zustand';
import { buildKeymap, allModes, type HudStore, type HudActions, type KeyBinding } from './controls';
import { t, tx, type UiKey } from '../../i18n';
import type { Locale } from './types';

/** Real stage gestures; SVG lessons deliberately advertise no camera gestures. */
export const ENGINE_GESTURES: Record<string, readonly { device: 'touch' | 'pointer'; text: UiKey }[]> = {
  'space-scene': [
    { device: 'pointer', text: 'guide.space.pointer' },
    { device: 'touch', text: 'guide.space.touch' },
  ],
  'time-scene': [
    { device: 'pointer', text: 'guide.time.pointer' },
    { device: 'touch', text: 'guide.time.touch' },
  ],
  'math-scene': [
    { device: 'pointer', text: 'guide.math.pointer' },
    { device: 'touch', text: 'guide.math.touch' },
  ],
};
export function ControlsGuide({ hud, actions, engine, locale }: { hud: HudStore; actions: HudActions; engine: string; locale: Locale }) {
  const open = useStore(hud, (s) => s.guide);
  const controls = useStore(hud, (s) => s.controls);
  if (!open) return null;
  const label = (b: KeyBinding) => {
    if (b.type === 'preset') {
      const p = controls.presets?.items.find((p) => p.id === b.name);
      return p ? tx(p.title ?? p.label, locale) : b.name;
    }
    if (b.type === 'mode') return tx(allModes(controls, true, t(locale, 'hud.mode.labels')).find((m) => m.id === b.name)?.label, locale);
    if (b.type === 'command') return tx(controls.commands?.find((c) => c.id === b.name)?.label, locale);
    return t(locale, `guide.key.${b.type}${b.type === 'chapter' || b.type === 'beat' ? `.${b.name}` : ''}` as UiKey);
  };
  return (
    <section
      id="atlas-controls-guide"
      className="atlas-guide"
      role="dialog"
      aria-modal="false"
      aria-labelledby="atlas-guide-title"
      data-hud-panel="guide"
    >
      <div className="atlas-guide__head">
        <h2 id="atlas-guide-title">{t(locale, 'guide.title')}</h2>
        <button className="atlas-fold" type="button" aria-label={t(locale, 'guide.close')} onClick={() => actions.setGuide(false)}>
          ×
        </button>
      </div>
      <div className="atlas-guide__gestures">
        {(ENGINE_GESTURES[engine] ?? []).map((row) => (
          <p key={row.device} data-device={row.device}>
            <b>{t(locale, `guide.device.${row.device}`)}</b> {t(locale, row.text)}
          </p>
        ))}
      </div>
      <p>{t(locale, engine === 'math-scene' ? 'guide.math.return' : 'guide.camera.return')}</p>
      <h3>{t(locale, 'guide.keyboard')}</h3>
      <dl>
        {buildKeymap(controls).map((b) => (
          <div key={`${b.type}-${b.key}`}>
            <dt>
              <kbd>{b.key === ' ' ? 'SPACE' : b.key.toUpperCase()}</kbd>
            </dt>
            <dd>{label(b)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
