/**
 * Bottom panel 03 / STATE. Default: live rows RUN / FLOW / ANIMATIONS / VIEW /
 * EXPLODE (mono values). With `parts.json` `telemetry`: RUN plus the topic's
 * simulated readings, each easing toward its `run` value while the scene runs
 * and back to `idle` when it stops (first-order lag, τ = `lag` s; refreshed
 * at 4 Hz, jumps on instant transitions so screenshots are reproducible).
 * Run-time values carry the SIM chip (a visual simulation, docs/08 §6).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useHud, useScene, useT } from '../../core/context';
import { activePreset } from '../../core/controls';
import { t as tl, tx, type BilingualText, type UiKey } from '../../../i18n';
import { formatReading, lagValue, readingDecimals } from '../lib/telemetry';
import type { SpaceSceneExt } from '../index';
import type { PartsFile, TelemetryRow } from '../schema';
import type { SpaceUiStore } from '../ui';
import { flowingGroups } from './common';

const REFRESH_MS = 250;

function Row({ label, value, sim, on }: { label: UiKey | BilingualText; value: ReactNode; sim?: boolean; on?: boolean }) {
  const t = useT();
  const text = typeof label === 'string' ? { en: tl('en', label), zh: tl('zh', label) } : label;
  return (
    <div className="space-state__row" data-on={on || undefined}>
      <dt>
        {text.en.toUpperCase()}
        {text.zh && <small lang="zh-Hans">{text.zh}</small>}
      </dt>
      <dd>
        {value}
        {sim && <span className="atlas-chip">{t('source.simulated').toUpperCase()}</span>}
      </dd>
    </div>
  );
}

/** Lagged readings: values follow `run` with each row's time constant. */
function useReadings(rows: readonly TelemetryRow[], run: boolean, snapId: number): number[] {
  const target = (r: TelemetryRow) => (run ? r.run : r.idle);
  const lag = useRef<{ from: number[]; to: number[]; t0: number } | null>(null);
  const [, setTick] = useState(0);
  const now = () => performance.now();
  const valueAt = (i: number, at: number) => {
    const l = lag.current;
    if (!l) return target(rows[i]!);
    return lagValue(l.from[i]!, l.to[i]!, (at - l.t0) / 1000, rows[i]!.lag);
  };

  // The run switch (or the data) changed: start easing from where the readings are now.
  const key = `${run}`;
  const seen = useRef<{ key: string; rows: readonly TelemetryRow[]; snap: number } | null>(null);
  if (!seen.current || seen.current.rows !== rows) {
    lag.current = { from: rows.map(target), to: rows.map(target), t0: now() };
  } else if (seen.current.snap !== snapId) {
    lag.current = { from: rows.map(target), to: rows.map(target), t0: now() };
  } else if (seen.current.key !== key) {
    const at = now();
    lag.current = { from: rows.map((_, i) => valueAt(i, at)), to: rows.map(target), t0: at };
  }
  seen.current = { key, rows, snap: snapId };

  const values = rows.map((_, i) => valueAt(i, now()));
  const settled = rows.every((r, i) => Math.abs(values[i]! - target(r)) < 0.5 * 10 ** -readingDecimals(r));
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [settled]);
  return settled ? rows.map(target) : values;
}

function Telemetry({ rows, run }: { rows: readonly TelemetryRow[]; run: boolean }) {
  const t = useT();
  // Instant transitions (deep links, snaps for tests / screenshots) jump to the end values.
  const snapId = useScene<SpaceSceneExt, number>((st) => (st.transition.instant ? st.transition.id : -1));
  const snap = useRef(0);
  if (snapId >= 0) snap.current = snapId;
  const values = useReadings(rows, run, snap.current);
  return (
    <dl className="space-state" data-telemetry="" data-dense={rows.length > 4 || undefined}>
      <Row label="space.state.run" value={(run ? t('space.state.on') : t('space.state.off')).toLocaleUpperCase()} sim on={run} />
      {rows.map((r, i) => (
        <Row
          key={i}
          label={r.key}
          value={
            <>
              {formatReading(values[i]!, readingDecimals(r))}
              {r.unit && <span className="space-state__unit"> {r.unit}</span>}
            </>
          }
          sim
          on={run}
        />
      ))}
    </dl>
  );
}

export function StatePanel({ file, ui }: { file: PartsFile; ui: SpaceUiStore }) {
  const t = useT();
  const s = useScene<SpaceSceneExt, { run: boolean; view: string; explode: number; layers: string[]; chapter: string | null }>((st) => ({
    run: st.run,
    view: st.view,
    explode: st.explode,
    layers: st.layers,
    chapter: st.chapter,
  }));
  const preset = useHud((h) => {
    const id = activePreset(h, s.chapter);
    const item = h.controls.presets?.items.find((p) => p.id === id);
    return item ? item.label : null;
  });
  const reference = useStore(ui, (u) => u.reference !== null);
  if (file.telemetry) return <Telemetry rows={file.telemetry} run={s.run} />;

  const flows = flowingGroups(file, s.run, s.layers);
  const activeFlows = file.flows.filter((f) => flows.has(f.group) && (s.run || !f.whenRun)).length;
  const moving = new Set(file.animations.filter((a) => s.run || !a.whenRun).map((a) => a.target)).size;
  const up = (x: string) => x.toLocaleUpperCase();
  const explode = s.view === 'exploded' ? Math.round(s.explode * 100) : 0;

  return (
    <dl className="space-state">
      <Row label="space.state.run" value={up(s.run ? t('space.state.on') : t('space.state.off'))} sim on={s.run} />
      <Row
        label="space.state.flow"
        value={activeFlows > 0 ? up(t('space.state.active', { n: activeFlows, total: file.flows.length })) : up(t('space.state.off'))}
        sim
        on={activeFlows > 0}
      />
      <Row label="space.state.animations" value={up(moving > 0 ? t('space.state.moving', { n: moving }) : t('space.state.still'))} sim on={moving > 0} />
      <Row
        label="space.state.view"
        value={up(reference ? t('space.mode.reference') : preset ? `${t('hud.view')} ${tx(preset, 'en')}` : t('space.state.free'))}
      />
      <Row label="space.state.explode" value={`${String(explode).padStart(2, '0')} %`} on={explode > 0} />
    </dl>
  );
}
