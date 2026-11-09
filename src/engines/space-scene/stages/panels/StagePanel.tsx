/**
 * The try-it picture on the stage, for when the HUD (and the card that holds
 * it) is hidden: the presentation, or H. One paper plate, top right; on phones
 * it docks above the caption card. It shows the microscope's field while the
 * field is on, the try-it curve of a heat chapter (kept back like the reading
 * panel's until the beat reveals it) and the computed solar year of the local
 * lab. View.tsx mounts this chunk only with the HUD hidden and only for models
 * that can have one, so nothing here reaches the first frame.
 *
 * Redraws: no frame loop. The canvas and the chart draw when the values on
 * show change; layout is read from ResizeObserver callbacks only.
 */
import { useLayoutEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useSceneContext, useT } from '../../../core/context';
import { tx, type BilingualText } from '../../../../i18n';
import type { PartsFile } from '../../schema';
import type { SpaceUiStore } from '../../ui';
import { getOrbitSession } from '../../lib/sim/orbit-resource';
import { usePredictionHidden, useSimStore, useSimView } from '../../hud/sim';
import { MicroscopeField } from '../../hud/MicroscopeField';
import { StageChart } from './StageChart';
import { daylightChart, heatChart } from './stage-chart';

const PHONE = '(max-width: 759px)';
const subscribePhone = (fn: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener('change', fn);
  return () => m.removeEventListener('change', fn);
};
const isPhone = () => window.matchMedia(PHONE).matches;
const SOLAR_YEAR: BilingualText = { en: 'Computed solar year', zh: '计算太阳年表' };

/** The leader labels measure their obstacles (this panel is one) on the end of a HUD fade; the panel comes and goes with no fade. */
function remeasureLeaders(scene: Element | null) {
  scene?.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'visibility' }));
}

/** The panel's frame: above the caption card, an obstacle for the leader labels. */
function Plate({ ui, kind, children }: { ui: SpaceUiStore; kind: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const presenting = useStore(ui, (u) => u.presenting);
  useLayoutEffect(() => {
    const el = panel.current;
    const scene = el?.closest('.atlas-scene') ?? null;
    const card = presenting ? scene?.querySelector('[data-hud-panel="present"]') : null;
    if (!el) return;
    const fit = () => {
      if (card) el.style.setProperty('--caption-top', `${Math.round(el.parentElement!.getBoundingClientRect().bottom - card.getBoundingClientRect().top)}px`);
      else el.style.removeProperty('--caption-top');
      remeasureLeaders(scene);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (card) ro.observe(card);
    return () => {
      ro.disconnect();
      queueMicrotask(() => remeasureLeaders(scene));
    };
  }, [presenting]);
  return (
    <div ref={panel} className="space-stage-panel" data-hud-panel="present-panel" data-stage-panel={kind}>
      {children}
    </div>
  );
}

export default function StagePanel({ file, ui }: { file: PartsFile; ui: SpaceUiStore }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file);
  const hidden = usePredictionHidden(ui, view);
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const orbit = file.sim?.orbitRotation ? getOrbitSession(store, file.sim) : null;
  // Only the day on show re-renders this: a running orbit clock does not.
  const day = useSyncExternalStore(
    orbit?.subscribe ?? (() => () => {}),
    () => (orbit && orbit.config.panel.byLab[orbit.snapshot.lab as keyof typeof orbit.config.panel.byLab] === 'solar-year' ? orbit.snapshot.dayIndex : 0),
    () => 0,
  );
  const days = orbit?.config.solarYear.table?.days;
  const curve = view?.card?.curve && !hidden ? view.card.curve : null;
  const elapsed = t('space.try.elapsed');
  const chart = useMemo(() => {
    if (view && curve) return heatChart(view.sim, view.values, curve, locale, elapsed);
    if (days && day > 0) return daylightChart(days, day, locale);
    return null;
  }, [view, curve, days, day, locale, elapsed]);
  const microscope = view?.sim.microscope && view.values[view.sim.microscope.controls.enabled] === true;
  if (microscope)
    return (
      <Plate ui={ui} kind="microscope">
        <MicroscopeField file={file} location="stage" />
      </Plate>
    );
  if (!chart) return null;
  return (
    <Plate ui={ui} kind={chart.id}>
      <StageChart spec={chart} title={chart.id === 'solar-year' ? tx(SOLAR_YEAR, locale) : t('space.try.curve')} compact={phone} />
    </Plate>
  );
}
