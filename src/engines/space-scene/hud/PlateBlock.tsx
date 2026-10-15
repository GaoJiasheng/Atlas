/**
 * The left column's compact PLATE / 图版 block (slot `plate`, docs/08 §2 HUD
 * 铁律 b): what the three bottom panels used to spread out, in one place.
 *
 *  - an elevation thumbnail drawn from the part data (rest bounds of every
 *    part on the section plane, default front XY; glb parts from their
 *    measured rest bounds once loaded): parts in their group colour, the
 *    selected one outlined in signal, parts put aside dashed, context scenery
 *    hatched; a ground line and the scale step in real units (`units`) or U;
 *    under the block a one-line key of the group colours (names shortened to fit)
 *  - beside it tiny label–value rows: RUN / FLOW / ANIM / VIEW / EXPLODE (or
 *    the topic's `explodeLabel`); with `parts.json` `telemetry` the simulated
 *    readings follow (SIM chip), easing toward their `run` value while the
 *    scene runs (first-order lag, τ = `lag` s; 4 Hz; jumps on instant
 *    transitions so screenshots are reproducible); a reading that `follow`s
 *    a try-it output eases to each new value (τ 0.3 s), the chapter's
 *    observed outputs in bold, and a `SIM <STATE> · <try-it values>` line
 *  - one line for the selection (number + short name); a click shows the
 *    inspector in the reading panel (opening a folded reader)
 *  - the quiet perf readout
 *
 * The header folds the block (sessionStorage `atlas:plate`, never in the
 * URL). Hidden on phones with the rest of the left column's extras.
 */
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useHud, useScene, useSceneContext, useT } from '../../core/context';
import { activePreset } from '../../core/controls';
import { t as tl, tx, type BilingualText, type UiKey } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { getPlateExpanded, setPlateExpanded } from '../../../lib/prefs';
import { elevation, numberedParts } from '../lib/schematic';
import { realLength, scaleBar } from '../lib/units';
import { FOLLOW_LAG, formatReading, lagValue, readingDecimals, readingTarget } from '../lib/telemetry';
import { numberOf, outputDecimals } from '../lib/sim';
import type { SimControl, SimData, SimValue } from '../sim-schema';
import { useSimView } from './sim';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, TelemetryRow } from '../schema';
import type { SpaceUiStore } from '../ui';
import type { StageBridge } from '../bridge';
import { flowingGroups, keyGroups, partNumber } from './common';
import { PerfReadout } from './PerfReadout';

const REFRESH_MS = 250;
const VW = 160;
const VH = 104;
const PAD = { l: 4, r: 4, t: 6, b: 22 };
const f2 = (n: number) => Number(n.toFixed(2));
const bi = (key: UiKey): BilingualText => ({ en: tl('en', key), zh: tl('zh', key) });

function Elevation({ file, ui }: { file: PartsFile; ui: SpaceUiStore }) {
  const t = useT();
  const hatchId = `space-hatch-${useId().replace(/:/g, '')}`;
  const s = useScene<SpaceSceneExt, { part: string | null; hidden: string[] }>((st) => ({ part: st.part, hidden: st.hidden }));
  const plane = file.views.section?.plane ?? 'xy';
  const meshBounds = useStore(ui, (u) => u.meshBounds);
  const el = useMemo(() => elevation(file.parts, plane, 0, meshBounds), [file.parts, plane, meshBounds]);
  const spanU = el.u1 - el.u0;
  const spanV = el.v1 - el.v0;
  const k = Math.min((VW - PAD.l - PAD.r) / Math.max(spanU, 1e-6), (VH - PAD.t - PAD.b) / Math.max(spanV, 1e-6));
  const ox = PAD.l + (VW - PAD.l - PAD.r - spanU * k) / 2;
  const oy = PAD.t + (VH - PAD.t - PAD.b - spanV * k) / 2;
  const plan = plane === 'xz';
  const x = (u: number) => f2(ox + (u - el.u0) * k);
  // Elevations: v up. Plan: +z towards the viewer = down the sheet.
  const y = (v: number) => f2(plan ? oy + (v - el.v0) * k : oy + (el.v1 - v) * k);
  const groundY = y(plan ? el.v1 : el.v0);
  const groupColor = new Map(file.groups.map((g) => [g.id, g.color]));
  const hidden = new Set(s.hidden);
  const bar = scaleBar(spanU, file.units);
  const count = numberedParts(file.parts).length;
  // The model's span along the drawing, in real units (only with `units`; context scenery left out).
  const own = el.rects.filter((r) => !r.context);
  const span = own.length ? realLength(Math.max(...own.map((r) => r.u1)) - Math.min(...own.map((r) => r.u0)), file.units) : null;
  return (
    <svg
      className="space-plate__elev"
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${t('space.panel.architecture')} · ${plane.toUpperCase()} · ${count} ${t('space.spec.parts')}${span ? ` · ${span}` : ''}`}
    >
      <defs>
        <pattern id={hatchId} width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={4} className="space-elev__hatch" />
        </pattern>
      </defs>
      <line x1={PAD.l} x2={VW - PAD.r} y1={groundY} y2={groundY} className="space-elev__ground" />
      {el.rects.map((r) => {
        const box = {
          x: x(r.u0),
          y: Math.min(y(r.v0), y(r.v1)),
          width: Math.max(0.5, f2((r.u1 - r.u0) * k)),
          height: Math.max(0.5, f2((r.v1 - r.v0) * k)),
        };
        if (r.context) return <rect key={r.id} {...box} className="space-elev__context" style={{ fill: `url(#${hatchId})` }} />;
        const on = r.id === s.part;
        const aside = hidden.has(r.id);
        return (
          <rect
            key={r.id}
            {...box}
            className="space-elev__part"
            data-on={on || undefined}
            data-hidden={aside || undefined}
            style={on || aside ? undefined : { fill: resolveColorRef(groupColor.get(r.group) ?? 'token:ink') }}
          />
        );
      })}
      <g className="space-elev__scale">
        <path d={`M${PAD.l} ${VH - 5}h${f2(bar.step * k)}M${PAD.l} ${VH - 8}v6M${f2(PAD.l + bar.step * k)} ${VH - 8}v6`} />
        <text x={f2(PAD.l + bar.step * k + 5)} y={VH - 3}>
          {plane.toUpperCase()} · {bar.label}
        </text>
      </g>
    </svg>
  );
}

/** Lagged readings: each eases to its target (`run` / `idle`, or the followed try-it output) with its time constant. */
function useReadings(rows: readonly TelemetryRow[], targets: readonly number[], snapId: number): number[] {
  const lag = useRef<{ from: number[]; to: number[]; t0: number } | null>(null);
  const [, setTick] = useState(0);
  const now = () => performance.now();
  const lagOf = (r: TelemetryRow) => r.lag ?? FOLLOW_LAG;
  const valueAt = (i: number, at: number) => {
    const l = lag.current;
    if (!l) return targets[i]!;
    return lagValue(l.from[i]!, l.to[i]!, (at - l.t0) / 1000, lagOf(rows[i]!));
  };
  // A target changed (RUN, a try-it control): start easing from where the readings are now.
  const key = targets.join(',');
  const seen = useRef<{ key: string; rows: readonly TelemetryRow[]; snap: number } | null>(null);
  if (!seen.current || seen.current.rows !== rows || seen.current.snap !== snapId) {
    lag.current = { from: [...targets], to: [...targets], t0: now() };
  } else if (seen.current.key !== key) {
    const at = now();
    lag.current = { from: rows.map((_, i) => valueAt(i, at)), to: [...targets], t0: at };
  }
  seen.current = { key, rows, snap: snapId };
  const values = rows.map((_, i) => valueAt(i, now()));
  const settled = rows.every((r, i) => Math.abs(values[i]! - targets[i]!) < 0.5 * 10 ** -readingDecimals(r));
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [settled]);
  return settled ? [...targets] : values;
}

function Row({ label, value, on }: { label: BilingualText; value: ReactNode; on?: boolean }) {
  return (
    <div className="space-plate__row" data-on={on || undefined} title={`${label.en} / ${label.zh}`}>
      <dt>{label.en.toUpperCase()}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** A try-it control's value in the status line: `2 BATTERIES`, `SERIES`, `SWITCH ON`. */
function controlStatus(c: SimControl, v: SimValue | undefined): string {
  const label = c.label.en.toUpperCase();
  if (c.kind === 'toggle') return `${label}: ${v ? 'ON' : 'OFF'}`;
  if (c.kind === 'step') return `${v}${c.unit ? ` ${c.unit.toUpperCase()}` : ''} ${label}`;
  return tx(c.options.find((o) => o.id === v)?.label ?? { en: String(v), zh: String(v) }, 'en').toUpperCase();
}

function Telemetry({ rows, run, sim }: { rows: readonly TelemetryRow[]; run: boolean; sim: SimData | undefined }) {
  const t = useT();
  const view = useSimView(sim);
  // Instant transitions (deep links, snaps for tests / screenshots) jump to the end values.
  const snapId = useScene<SpaceSceneExt, number>((st) => (st.transition.instant ? st.transition.id : -1));
  const snap = useRef(0);
  if (snapId >= 0) snap.current = snapId;
  const outputs = new Map((sim?.outputs ?? []).map((o) => [o.id, o]));
  // A followed output that does not apply here (NaN: the clips the card does not observe) reads `—`.
  const followed = rows.map((r) => (r.follow !== undefined ? numberOf(view?.outputs[r.follow]) : undefined));
  const na = followed.map((v) => v !== undefined && !Number.isFinite(v));
  const targets = rows.map((r, i) => readingTarget(r, run, na[i] ? 0 : followed[i]));
  const values = useReadings(rows, targets, snap.current);
  const observed = new Set(view?.card?.observe ?? []);
  const decimals = (r: TelemetryRow) => (r.follow !== undefined ? (r.decimals ?? outputDecimals(outputs.get(r.follow) ?? {})) : readingDecimals(r));
  // `SIM CLOSED · 2 BATTERIES`: the model's state, then the try-it card's controls.
  const state = sim?.outputs.find((o) => o.kind === 'state' && o.states);
  const stateValue = state && view ? String(view.outputs[state.id] ?? '') : '';
  const card = view?.card;
  const tried = card && view ? [card.vary, ...(card.also ?? [])].map((id) => sim!.controls.find((c) => c.id === id)).filter((c): c is SimControl => c !== undefined) : [];
  return (
    <>
      <p className="space-plate__sim">
        <span className="atlas-chip">{t('source.simulated').toUpperCase()}</span>
        {rows.map((r, i) => (
          <span
            key={i}
            className="space-plate__reading"
            data-on={(r.follow !== undefined ? !na[i] && followed[i] !== 0 : run) || undefined}
            data-observe={r.follow !== undefined && (observed.has(r.follow) || (sim?.kind === 'magnet' && (outputs.get(r.follow)?.from ?? r.follow) === 'clips' && !na[i])) ? '' : undefined}
            title={`${r.key.en} / ${r.key.zh}`}
          >
            {r.key.en.toUpperCase()} <b>{na[i] ? '—' : formatReading(values[i]!, decimals(r))}</b>
            {r.unit && !na[i] && <small> {r.unit}</small>}
          </span>
        ))}
      </p>
      {state && view && (
        <p className="space-plate__simstate" data-state={stateValue}>
          SIM {tx(state.states?.[stateValue] ?? { en: stateValue, zh: stateValue }, 'en').toUpperCase()}
          {tried.map((c) => ` · ${controlStatus(c, view.values[c.id])}`).join('')}
        </p>
      )}
    </>
  );
}

export function PlateBlock({ file, ui, bridge }: { file: PartsFile; ui: SpaceUiStore; bridge: StageBridge }) {
  const t = useT();
  const { locale, actions, chapters } = useSceneContext();
  const [open, setOpen] = useState(true);
  useEffect(() => setOpen(getPlateExpanded()), []);
  const s = useScene<
    SpaceSceneExt,
    { run: boolean; view: string; explode: number; layers: string[]; chapter: string | null; part: string | null }
  >((st) => ({ run: st.run, view: st.view, explode: st.explode, layers: st.layers, chapter: st.chapter, part: st.part }));
  const preset = useHud((h) => {
    const id = activePreset(h, s.chapter);
    const item = h.controls.presets?.items.find((p) => p.id === id);
    return item ? item.label : null;
  });
  const reference = useStore(ui, (u) => u.reference !== null);
  const free = useHud((h) => h.cameraFree);
  const chapterNo = String(Math.max(1, chapters.findIndex((c) => c.id === s.chapter) + 1)).padStart(2, '0');
  const up = (x: string) => x.toLocaleUpperCase();
  const flows = flowingGroups(file, s.run, s.layers);
  const activeFlows = file.flows.filter((f) => flows.has(f.group) && (s.run || !f.whenRun)).length;
  const moving = new Set(file.animations.filter((a) => s.run || !a.whenRun).map((a) => a.target)).size;
  const explode = s.view === 'exploded' ? Math.round(s.explode * 100) : 0;
  const picked = s.part ? file.parts.find((p) => p.id === s.part && !p.context) : undefined;
  const side = picked?.side ? ` · ${picked.side === 'left' ? 'L' : 'R'}` : '';
  const fold = (e: MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    setPlateExpanded(!open);
    if (e.detail > 0) e.currentTarget.blur();
  };
  const showInspector = (e: MouseEvent<HTMLButtonElement>) => {
    actions.setReader(true);
    const scene = e.currentTarget.closest('.atlas-scene');
    window.requestAnimationFrame(() => scene?.querySelector('.space-inspector')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    if (e.detail > 0) e.currentTarget.blur();
  };
  const bodyId = useId();
  const legend = useMemo(() => keyGroups(file), [file]);

  return (
    <section className="space-plate" data-hud-panel="plate" data-folded={open ? undefined : ''} aria-label={t('space.plate')}>
      <button type="button" className="space-plate__head" aria-expanded={open} aria-controls={bodyId} title={t(open ? 'space.plate.fold' : 'space.plate.unfold')} onClick={fold}>
        <span>
          {up(tl('en', 'space.plate'))}
          <small lang="zh-Hans">{tl('zh', 'space.plate')}</small>
        </span>
        <i aria-hidden="true" />
      </button>
      <div id={bodyId} className="space-plate__body" hidden={!open}>
        <div className="space-plate__grid">
          <figure className="space-plate__fig">
            <Elevation file={file} ui={ui} />
          </figure>
          <dl className="space-plate__rows">
            <Row label={bi('space.state.run')} value={up(s.run ? t('space.state.on') : t('space.state.off'))} on={s.run} />
            {file.flows.length > 0 && (
              <Row label={bi('space.state.flow')} value={activeFlows > 0 ? `${activeFlows}/${file.flows.length}` : up(t('space.state.off'))} on={activeFlows > 0} />
            )}
            <Row label={bi('space.state.anim')} value={moving > 0 ? String(moving) : up(t('space.state.still'))} on={moving > 0} />
            <Row label={bi('space.state.view')} value={up(reference ? t('space.mode.reference') : preset ? tx(preset, 'en') : free ? t('space.state.free') : `CH ${chapterNo}`)} />
            <Row
              label={file.views.explodeLabel ?? bi('space.state.explode')}
              value={`${String(explode).padStart(2, '0')} %`}
              on={explode > 0}
            />
          </dl>
        </div>
        <p className="space-plate__key">
          {legend.map((g) => (
            <span key={g.id} title={tx(g.name, locale)}>
              <i style={{ background: resolveColorRef(g.color) }} aria-hidden="true" />
              <em>{up(tx(g.name, 'en'))}</em>
            </span>
          ))}
        </p>
        {file.telemetry && <Telemetry rows={file.telemetry} run={s.run} sim={file.sim} />}
        {picked ? (
          <button type="button" className="space-plate__sel" title={t('space.plate.show', { name: tx(picked.name, locale) })} onClick={showInspector}>
            <b>{partNumber(file, picked.id)}</b>
            {up(tx(picked.short ?? picked.name, 'en'))}
            {side}
          </button>
        ) : (
          <p className="space-plate__sel" data-none="">
            {up(t('space.plate.none'))}
          </p>
        )}
        <PerfReadout bridge={bridge} />
      </div>
    </section>
  );
}
