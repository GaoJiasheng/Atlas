/**
 * The try-it card (docs/22 §4.3 S3, S6, S7; docs/08 §2 HUD 铁律 d): in the
 * reading panel after the beat line and before the inspector, for a chapter
 * with `state.sim.try`. Three rows of chips (change / keep the same /
 * observe), the controls (toggle = a switch button, step = ‹ value ›,
 * choice = a group of option buttons; all ≥ 44 px) for the varied control and
 * any `also`, the observed outputs in large type (SIM, "in this model"; a
 * table model's `typical` outputs TYPICAL with their row's sources), then
 * optionally predict-then-observe (pick an outcome; the change is applied and
 * the card says what was observed, never right or wrong; "back to before"
 * undoes it) and the data table ("record a row": one row per value of the
 * varied control, a yes / no column with `judge`; in memory only). Below
 * 1024 px, where the top-right card is hidden, the circuit diagram (the
 * energy chain, the life-cycle ring, the flowchart) folds in
 * here. Buttons, `[` `]` / `T` and the diagram's switches write the same
 * store value (lib/sim/controls.ts), so the URL (`sim`) follows.
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useScene, useSceneContext, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { Icon } from '../../widgets/icons';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SimControl, SimData, SimOutput, SimTry, SimValue } from '../sim-schema';
import type { SpaceUiStore } from '../ui';
import { stepValue } from '../lib/sim/controls';
import { outputText, outputWords, valueText, valueWords } from '../lib/sim/text';
import { cardTimelines } from '../lib/sim/replay';
import { isTimeline } from '../lib/sim/timeline';
import { revealCurrentResult, setSim, usePredictionHidden, useSimStore, useSimView } from '../hud/sim';
import type { StageBridge } from '../bridge';
import { SourceRefs } from '../../widgets/SourcePopover';
import { tableSources } from '../lib/sim/table';

// Each sim's own diagram is fetched only for the topics that have it (the top-right card usually has it loaded already).
const MicroscopeField = lazy(() => import('../hud/MicroscopeField').then((m) => ({ default: m.MicroscopeField })));
const CircuitDiagram = lazy(() => import('../hud/CircuitCard').then((m) => ({ default: m.CircuitDiagram })));
const EnergyDiagram = lazy(() => import('../hud/EnergyCard').then((m) => ({ default: m.EnergyDiagram })));
const CycleDiagram = lazy(() => import('../hud/CycleCard').then((m) => ({ default: m.CycleDiagram })));
const KeyDiagram = lazy(() => import('../hud/KeyCard').then((m) => ({ default: m.KeyDiagram })));
const AirfoilPlot = lazy(() => import('./AirfoilPlot').then((m) => ({ default: m.AirfoilPlot })));
const AirfoilPressure = lazy(() => import('./AirfoilPressure').then((m) => ({ default: m.AirfoilPressure })));
const TryCurve = lazy(() => import('./TryCurve').then((m) => ({ default: m.TryCurve })));
const Lazy = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>;

// Predict-then-observe and the data table: only the chapters that have them fetch them. Once in, they render at once.
let record: typeof import('./TryRecord') | null = null;
export const loadTryRecord = () => import('./TryRecord').then((m) => (record = m));
const LazyPredict = lazy(() => loadTryRecord().then((m) => ({ default: m.Predict })));
const LazyTable = lazy(() => loadTryRecord().then((m) => ({ default: m.Table })));
type RecordProps = { file: PartsFile; sim: SimData; card: SimTry; ui: SpaceUiStore; chapter: string };
const Predict = (p: RecordProps) => (record ? <record.Predict {...p} /> : <Lazy><LazyPredict {...p} /></Lazy>);
const Table = (p: RecordProps) => (record ? <record.Table {...p} /> : <Lazy><LazyTable {...p} /></Lazy>);

function Control({ c, value, onSet, primary }: { c: SimControl; value: SimValue | undefined; onSet(v: SimValue): void; primary: boolean }) {
  const t = useT();
  const { locale } = useSceneContext();
  const label = tx(c.label, locale);
  if (c.kind === 'toggle') {
    return (
      <div className="space-try__ctl" data-sim-control={c.id} data-primary={primary || undefined}>
        <button type="button" role="switch" aria-checked={value === true} className="space-try__switch" onClick={() => onSet(!(value === true))}>
          <span className="space-try__name">{label}</span>
          <span className="space-try__toggle" aria-hidden="true">
            <i />
          </span>
          <b>{valueText(c, value, locale)}</b>
        </button>
      </div>
    );
  }
  if (c.kind === 'step') {
    const i = c.values.indexOf(value as number);
    return (
      <div className="space-try__ctl" data-sim-control={c.id} data-primary={primary || undefined} role="group" aria-label={label}>
        <span className="space-try__name">{label}</span>
        <span className="space-try__step">
          <button type="button" className="space-try__btn" aria-label={`${label}: ${t('space.try.prev')}`} disabled={i <= 0} onClick={() => onSet(stepValue(c, value!, -1))}>
            <Icon name="chevron-left" size={16} />
          </button>
          <output className="space-try__value" aria-live="polite" aria-label={valueWords(c, value, locale)}>
            {valueText(c, value, locale)}
          </output>
          <button
            type="button"
            className="space-try__btn"
            aria-label={`${label}: ${t('space.try.next')}`}
            disabled={i >= c.values.length - 1}
            onClick={() => onSet(stepValue(c, value!, 1))}
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </span>
      </div>
    );
  }
  return (
    <div className="space-try__ctl" data-sim-control={c.id} data-primary={primary || undefined}>
      <span className="space-try__name" id={`space-try-${c.id}`}>
        {label}
      </span>
      <span className="space-try__options" role="radiogroup" aria-labelledby={`space-try-${c.id}`}>
        {c.options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className="space-try__opt" data-sim-value={o.id} onClick={() => onSet(o.id)}>
            {tx(o.label, locale)}
          </button>
        ))}
      </span>
    </div>
  );
}

function Chips({ title, items, tone }: { title: string; items: string[]; tone: 'signal' | 'cold' | 'ink' }) {
  if (items.length === 0) return null;
  return (
    <p className="space-try__chips" data-tone={tone}>
      <span className="space-try__chiptitle">{title}</span>
      {items.map((x, i) => (
        <span key={i} className="space-try__chip">
          {x}
        </span>
      ))}
    </p>
  );
}

/** "Run again" (and key G: the same store count) and, for a run shown slowed down, how much. */
function Replay({ ids, slow, ui }: { ids: readonly string[]; slow: number; ui: SpaceUiStore }) {
  const t = useT();
  if (ids.length === 0) return null;
  return (
    <p className="space-try__replay">
      <button type="button" className="space-try__opt space-try__run" data-sim-replay="" onClick={() => replay(ui, ids)}>
        {t('space.try.replay')}
      </button>
      {slow > 1 && <span className="atlas-chip space-try__slow">{t('space.try.slow', { n: String(slow) })}</span>}
    </p>
  );
}

/** Play these timelines from the start (the stage watches the count). */
export { replay } from '../lib/sim/replay-ui';
import { replay } from '../lib/sim/replay-ui';

function LifeCycleFold({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  return (
    <details className="space-try__diagram" open>
      <summary>{t('space.try.cycle')}</summary>
      <Lazy><CycleDiagram file={file} sim={sim} /></Lazy>
    </details>
  );
}

function SortFold({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  return (
    <details className="space-try__diagram" open>
      <summary>{t('space.try.key')}</summary>
      <Lazy><KeyDiagram file={file} sim={sim} /></Lazy>
    </details>
  );
}

export function TryIt({ file, ui, bridge }: { file: PartsFile; ui: SpaceUiStore; bridge:StageBridge }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const chapter = useScene<SpaceSceneExt, string | null>((s) => s.chapter);
  const view = useSimView(file);
  const hidden = usePredictionHidden(ui, view);
  const notice = useStore(ui, (state) => chapter !== null && state.simTableNotices[chapter] === true);
  if (!view || !chapter) return null;
  if (!view.card) return view.sim.lifeCycle ? <LifeCycleFold file={file} sim={view.sim} /> : view.sim.sort ? <SortFold file={file} sim={view.sim} /> : null;
  const { sim, card, values, outputs } = view;
  const controls = [card.vary, ...(card.also ?? [])].map((id) => sim.controls.find((c) => c.id === id)).filter((c): c is SimControl => c !== undefined);
  const keep = (card.keep ?? []).map((k) => {
    if (typeof k !== 'string') return tx(k, locale);
    const c = sim.controls.find((x) => x.id === k);
    return c ? `${tx(c.label, locale)}: ${valueText(c, values[k], locale)}` : k;
  });
  const observed = card.observe.map((id) => sim.outputs.find((o) => o.id === id)).filter((o): o is SimOutput => o !== undefined && o.kind !== 'vector' && o.kind !== 'timeline');
  // A table's typical outputs (docs/40 §4.2): their own chip, with the sources of the rows they come from now.
  const typical = observed.filter((o) => o.tag === 'typical');
  const simmed = observed.filter((o) => o.tag !== 'typical');
  const mixed = typical.length > 0 && simmed.length > 0;
  const rowSources = sim.table && typical.length > 0 ? tableSources(sim.table, values) : {};
  const typicalRefs = [...new Set(typical.flatMap((o) => rowSources[o.id] ?? []))];
  const runs = cardTimelines(sim, values, card);
  const slow = Math.max(1, ...runs.map((id) => {
    const run = outputs[id];
    return isTimeline(run) ? run.slow : 1;
  }));
  return (
    <section className="space-try" aria-label={t('space.try.title')} data-chapter={chapter}>
      <header className="space-try__head">
        <h3>
          {t('space.try.title')}
          <small lang={locale === 'en' ? 'zh-Hans' : 'en'}>{tx({ en: '试一试', zh: 'Try it' }, locale)}</small>
        </h3>
        <kbd className="space-try__keys">
          {t('space.try.keys')}
          {runs.length > 0 && ` · ${t('space.try.keysReplay')}`}
        </kbd>
      </header>
      <Chips title={t('space.try.vary')} items={controls.slice(0, 1).map((c) => tx(c.label, locale))} tone="signal" />
      <Chips title={t('space.try.keep')} items={keep} tone="cold" />
      <Chips title={t('space.try.observe')} items={observed.map((o) => tx(o.label, locale))} tone="ink" />
      <div className="space-try__controls">
        {controls.map((c, i) => (
          <Control key={c.id} c={c} value={values[c.id]} primary={i === 0} onSet={(v) => setSim(store, sim, c.id, v)} />
        ))}
      </div>
      {!hidden && <dl className="space-try__readouts">
        {observed.map((o) => (
          <div key={o.id} className="space-try__readout" data-sim-output={o.id} data-state={o.kind === 'state' ? String(outputs[o.id]) : undefined} data-tag={o.tag ?? 'sim'}>
            <dt>
              {tx(o.label, locale)}
              {mixed && <small className="atlas-chip space-try__tag">{(o.tag === 'typical' ? t('source.typical') : t('source.simulated')).toUpperCase()}</small>}
            </dt>
            <dd>
              <b aria-label={outputWords(o, outputs[o.id], locale)}>{outputText(o, outputs[o.id], locale)}</b>
              {o.kind === 'number' && outputs[o.id] !== null && o.unit && o.format !== 'time' && <small> {o.unit}</small>}
            </dd>
          </div>
        ))}
        {(simmed.length > 0 || typical.length === 0) && (
          <p className="space-try__sim" data-tag="sim">
            <span className="atlas-chip">{t('source.simulated').toUpperCase()}</span> {t('space.try.model')}
          </p>
        )}
        {typical.length > 0 && (
          <p className="space-try__sim" data-tag="typical">
            <span className="atlas-chip">{t('source.typical').toUpperCase()}</span> {t('space.try.typical')}
            {typicalRefs.length > 0 && <SourceRefs ids={typicalRefs} locale={locale} />}
          </p>
        )}
      </dl>}
      {sim.airfoil && card.vary === sim.airfoil.angle && <Lazy><AirfoilPlot sim={sim} values={values} ui={ui} chapter={chapter} /></Lazy>}
      {sim.airfoil && <Lazy><AirfoilPressure file={file} values={values} ui={ui} bridge={bridge} /></Lazy>}
      <Replay ids={runs} slow={slow} ui={ui} />
      {hidden && <button type="button" className="space-try__opt" data-sim-reveal="" onClick={() => revealCurrentResult(ui, chapter, values)}>{t('space.try.showCurrent')}</button>}
      {hidden && notice && <p className="space-try__notice" role="status">{t('space.try.conditionsChanged')}</p>}
      {card.predict && <Predict file={file} sim={sim} card={card} ui={ui} chapter={chapter} />}
      {!hidden && card.curve && <Lazy><TryCurve sim={sim} values={values} curve={card.curve} /></Lazy>}
      {!hidden && card.record && <Table file={file} sim={sim} card={card} ui={ui} chapter={chapter} />}
      {sim.circuit?.diagram && (
        <details className="space-try__diagram" open>
          <summary>{t('space.try.diagram')}</summary>
          <Lazy><CircuitDiagram file={file} sim={sim} /></Lazy>
        </details>
      )}
      {sim.energy && (
        <details className="space-try__diagram" open>
          <summary>{t('space.try.energy')}</summary>
          <Lazy><EnergyDiagram file={file} sim={sim} /></Lazy>
        </details>
      )}
      {sim.lifeCycle && <LifeCycleFold file={file} sim={sim} />}
      {sim.microscope && <Lazy><MicroscopeField file={file} location="mobile" /></Lazy>}
      {sim.sort && <SortFold file={file} sim={sim} />}
    </section>
  );
}
