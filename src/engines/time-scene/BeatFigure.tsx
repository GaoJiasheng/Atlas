/**
 * The drawing of the active beat. With the HUD showing it sits in the reading
 * panel, after any selection detail and before the chapter body, so the map
 * stays clear. With the HUD hidden (presentation, H) it is a plate on the
 * stage: top right, or docked above the caption card on phones. The plate's
 * `data-hud-panel` counts it as an obstacle for the map framing and labels.
 *
 * View.tsx and ClimatologyView.tsx load this chunk only for a beat with a figure.
 */
import { useLayoutEffect, useRef } from 'react';
import { SceneSlot, useHud } from '../core/context';
import { tx, withBase, type Locale } from '../../i18n';
import type { BeatFigure as BeatFigureSpec } from './schema';
import './beat-figure.css';

interface Props {
  figure: BeatFigureSpec;
  locale: Locale;
  presenting: boolean;
  onLayout(): void;
}

function Drawing({ figure, locale }: Pick<Props, 'figure' | 'locale'>) {
  return (
    <>
      <img
        key={figure.src}
        className="atlas-drawing ts-beat-figure__img"
        data-invert={figure.invert === false ? 'false' : undefined}
        src={withBase(`/illustrations/${figure.src}.webp`)}
        width={1200}
        height={900}
        alt={tx(figure.alt, locale)}
        decoding="async"
        draggable={false}
      />
      <figcaption className="ts-beat-figure__caption">{tx(figure.caption, locale)}</figcaption>
    </>
  );
}

function StagePlate({ figure, locale, presenting, onLayout }: Props) {
  const panel = useRef<HTMLElement>(null);
  const layout = useRef(onLayout);
  layout.current = onLayout;
  useLayoutEffect(() => {
    const el = panel.current!;
    const stage = el.parentElement!;
    const scene = el.closest('.atlas-scene');
    const card = presenting ? scene?.querySelector('[data-hud-panel="present"]') : null;
    // Another presentation block in the same corner (a climate key, deep-time evidence): the plate goes under it.
    const above = presenting ? [...(scene?.querySelectorAll('[data-hud-panel^="present-"]') ?? [])].filter((b) => b !== el && b.getAttribute('data-hud-panel') !== 'present-title') : [];
    const restore = scene?.querySelector('.atlas-hud-restore');
    const fit = () => {
      const box = stage.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(el).right) || 0;
      const bottom = card ? card.getBoundingClientRect().top : box.bottom;
      el.style.setProperty('--caption-top', `${Math.round(box.bottom - bottom)}px`);
      const top = [...above, ...(restore ? [restore] : [])].reduce((y, b) => {
        const r = b.getBoundingClientRect();
        return r.width && r.height && r.left + r.width / 2 > box.left + box.width / 2 && r.top < box.top + box.height / 2 ? Math.max(y, r.bottom - box.top + 8) : y;
      }, gap);
      el.style.setProperty('--plate-top', `${Math.round(top)}px`);
      el.style.setProperty('--plate-room', `${Math.max(0, Math.round(bottom - box.top - top - gap))}px`);
      layout.current();
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    observer.observe(stage);
    for (const b of [card, restore, ...above]) if (b) observer.observe(b);
    return () => {
      observer.disconnect();
      queueMicrotask(() => layout.current());
    };
  }, [figure, presenting]);
  return (
    <figure ref={panel} className="ts-beat-plate" data-hud-panel="present-figure" data-beat-figure="stage">
      <Drawing figure={figure} locale={locale} />
    </figure>
  );
}

export default function BeatFigure(props: Props) {
  const hudOn = useHud((h) => h.hud);
  return (
    <>
      <SceneSlot name="readerTop">
        <figure className="ts-beat-figure" data-beat-figure="reader">
          <Drawing figure={props.figure} locale={props.locale} />
        </figure>
      </SceneSlot>
      {!hudOn && <StagePlate {...props} />}
    </>
  );
}
