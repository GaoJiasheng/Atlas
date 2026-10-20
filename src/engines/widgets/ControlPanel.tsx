/**
 * Control panel (stage overlay, docs/06 "HUD 控件注册"): the one place for
 * every on / off switch of a scene. Two sections and an optional key:
 *
 *   LAYERS  what is drawn: store layers and drawing modes (borders, grid,
 *           movements, labels …)
 *   TOOLS   ways of looking: REFERENCE, PRESENTATION, X-RAY …, Hide HUD
 *   KEY     the Legend
 *
 * Rows are toggle buttons (`aria-pressed`) with their key letter on the
 * right. A `layer` row toggles the store's `layers`; a `mode` row calls the
 * HUD actions (the same path as its letter key) and carries `data-mode`, so
 * the registry stays the single source of state; the `hud` row hides the HUD
 * (H); the `glossary` row lists the topic's terms in the reader (HUD store
 * `glossary`, no key). Rows of modes flagged `phone: false` are not drawn below 760 px.
 * A `layer` row may carry a `solo` switch (SpaceScene: show this group alone,
 * the rest faint), drawn as a ⊙ button at the row's end.
 */
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import { useScene, useSceneContext } from '../core/context';
import { allModes, GLOSSARY_ALL, type HudText, type ModeTone } from '../core/controls';
import { t, tx } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';
import { Legend, type LegendItem } from './Legend';
import { Icon } from './icons';

/** A layer row's solo switch: on / off, its accessible name, and the toggle. */
export interface LayerSolo {
  on: boolean;
  label: string;
  toggle(): void;
}

export type ControlRow =
  | { kind: 'layer'; id: string; label: HudText; color?: string; solo?: LayerSolo }
  /** A registered mode; the label defaults to the mode's own. */
  | { kind: 'mode'; id: string; label?: HudText }
  | { kind: 'hud' }
  /** "Glossary": the list of every term in the reader's inspector (only for topics with data/glossary.json). */
  | { kind: 'glossary' };

export interface ControlPanelProps {
  layers: readonly ControlRow[];
  tools: readonly ControlRow[];
  legend?: readonly LegendItem[];
}

/** Keep focus off the row after a pointer click, so SPACE / letter keys reach the scene. */
const blurAfterPointer = (e: { detail: number; currentTarget: HTMLElement }) => {
  if (e.detail > 0) e.currentTarget.blur();
};

function Row({
  on,
  label,
  keyHint,
  color,
  tone,
  disabled,
  phoneOff,
  onClick,
  data,
}: {
  on: boolean;
  label: string;
  keyHint?: string;
  color?: string;
  tone?: ModeTone;
  disabled?: boolean;
  phoneOff?: boolean;
  onClick(): void;
  data?: Record<string, string>;
}) {
  return (
    <button
      type="button"
      className="atlas-ctl__row"
      aria-pressed={on}
      disabled={disabled}
      data-tone={tone && tone !== 'ink' ? tone : undefined}
      data-phone={phoneOff ? 'off' : undefined}
      title={keyHint ? `${label} (${keyHint})` : label}
      onClick={(e) => {
        onClick();
        blurAfterPointer(e);
      }}
      {...data}
    >
      <span className="atlas-ctl__box" aria-hidden="true">
        {on && <Icon name="check" size={12} />}
      </span>
      {color && <span className="atlas-legend__fill" style={{ background: resolveColorRef(color) }} aria-hidden="true" />}
      <span className="atlas-ctl__label">{label}</span>
      {keyHint && (
        <kbd className="atlas-ctl__key" aria-hidden="true">
          {keyHint}
        </kbd>
      )}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="atlas-ctl__section" aria-label={title}>
      <h3 className="atlas-overlay__heading">{title}</h3>
      <div className="atlas-ctl__rows">{children}</div>
    </section>
  );
}

export function ControlPanel({ layers, tools, legend }: ControlPanelProps) {
  const { locale, store, hud, actions } = useSceneContext();
  const active = useScene((s) => s.layers);
  const controls = useStore(hud, (s) => s.controls);
  const labelsOn = useStore(hud, (s) => s.labels);
  const hudOn = useStore(hud, (s) => s.hud);
  const glossaryOpen = useStore(hud, (s) => s.glossary);
  const modes = allModes(controls, labelsOn, t(locale, 'hud.mode.labels'));

  const row = (r: ControlRow) => {
    if (r.kind === 'layer') {
      const on = active.includes(r.id);
      const layer = (
        <Row
          key={`layer-${r.id}`}
          on={on}
          label={tx(r.label, locale)}
          color={r.color}
          onClick={() => store.getState().toggleLayer(r.id)}
          data={{ 'data-layer': r.id }}
        />
      );
      if (!r.solo) return layer;
      const solo = r.solo;
      return (
        <div key={`layer-${r.id}`} className="atlas-ctl__pair">
          {layer}
          <button
            type="button"
            className="atlas-ctl__solo"
            aria-pressed={solo.on}
            aria-label={solo.label}
            title={solo.label}
            data-solo={r.id}
            onClick={(e) => {
              solo.toggle();
              blurAfterPointer(e);
            }}
          >
            <span aria-hidden="true">⊙</span>
          </button>
        </div>
      );
    }
    if (r.kind === 'hud') {
      return (
        <Row
          key="hud"
          on={!hudOn}
          label={t(locale, 'hud.hide')}
          keyHint="H"
          onClick={() => actions.setHud(!hudOn)}
          data={{ 'data-hud-toggle': '' }}
        />
      );
    }
    if (r.kind === 'glossary') {
      return (
        <Row
          key="glossary"
          on={glossaryOpen !== null}
          label={t(locale, 'controls.glossary')}
          onClick={() => actions.setGlossary(glossaryOpen === null ? GLOSSARY_ALL : null)}
          data={{ 'data-glossary-toggle': '' }}
        />
      );
    }
    const mode = modes.find((m) => m.id === r.id);
    if (!mode) return null;
    return (
      <Row
        key={`mode-${mode.id}`}
        on={mode.on}
        label={tx(r.label ?? mode.label, locale)}
        keyHint={mode.key?.toLocaleUpperCase('en')}
        tone={mode.tone}
        disabled={mode.disabled && !mode.on}
        phoneOff={mode.phone === false}
        onClick={() => actions.setMode(mode.id, !mode.on)}
        data={{ 'data-mode': mode.id }}
      />
    );
  };

  return (
    <div className="atlas-ctl">
      {layers.length > 0 && <Section title={t(locale, 'layers.heading')}>{layers.map(row)}</Section>}
      {tools.length > 0 && <Section title={t(locale, 'controls.tools')}>{tools.map(row)}</Section>}
      {legend && legend.length > 0 && <Legend items={legend} locale={locale} />}
    </div>
  );
}
