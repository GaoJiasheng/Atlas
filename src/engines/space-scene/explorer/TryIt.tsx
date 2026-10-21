/**
 * The try-it card (docs/22 §4.3 S3, S6, S7; docs/08 §2 HUD 铁律 d): in the
 * reading panel after the beat line and before the inspector, for a chapter
 * with `state.sim.try`. Three rows of chips (change / keep the same /
 * observe), the controls (toggle = a switch button, step = ‹ value ›,
 * choice = a group of option buttons; all ≥ 44 px) for the varied control and
 * any `also`, the observed outputs in large type (SIM, "in this model"), then
 * optionally predict-then-observe (pick an outcome; the change is applied and
 * the card says what was observed, never right or wrong; "back to before"
 * undoes it) and the data table ("record a row": one row per value of the
 * varied control, a yes / no column with `judge`; in memory only). Below
 * 1024 px, where the top-right card is hidden, the circuit diagram (the
 * energy chain, the life-cycle ring, the flowchart) folds in
 * here. Buttons, `[` `]` / `T` and the diagram's switches write the same
 * store value (lib/sim/controls.ts), so the URL (`sim`) follows.
 */
import { useStore } from 'zustand';
import { useScene, useSceneContext, useT } from '../../core/context';
import { tx, type UiKey } from '../../../i18n';
import { Icon } from '../../widgets/icons';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SimControl, SimData, SimOutput, SimTry, SimValue } from '../sim-schema';
import type { SpaceUiStore } from '../ui';
import { numberOf, type SimOutputValue } from '../lib/sim';
import { evaluateSimOnStage } from '../lib/sim/carrier';
import { resolveSimValues, stepValue } from '../lib/sim/controls';
import { outcomeOf, recordRow } from '../lib/sim/trial';
import { outputText, outputWords, valueText, valueWords } from '../lib/sim/text';
import { cardTimelines } from '../lib/sim/replay';
import { isTimeline } from '../lib/sim/timeline';
import { setSim, useSimStore, useSimView } from '../hud/sim';
import { CircuitDiagram } from '../hud/CircuitCard';
import { EnergyDiagram } from '../hud/EnergyCard';
import { CycleDiagram } from '../hud/CycleCard';
import { KeyDiagram } from '../hud/KeyCard';
import { TryChart } from './TryChart';

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

function Predict({ file, sim, card, ui, chapter }: { file: PartsFile; sim: SimData; card: SimTry; ui: SpaceUiStore; chapter: string }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file)!;
  const answer = useStore(ui, (u) => (u.simPredict?.chapter === chapter ? u.simPredict : null));
  const p = card.predict!;
  const observed = sim.outputs.find((o) => o.id === p.observe);
  const isState = observed?.kind === 'state';
  const pick = (id: string) => {
    const before = { ...store.getState().sim };
    // From the prediction's starting point (the switch closed …): read the observed output there, then make the change.
    for (const [k, v] of Object.entries(p.start ?? {})) setSim(store, sim, k, v);
    const st = store.getState();
    const out = evaluateSimOnStage(sim, file, resolveSimValues(sim, st.sim), st.pose, card.observe).outputs[p.observe];
    const value = isState ? String(out ?? '') : numberOf(out);
    ui.setState({ simPredict: { chapter, guess: id, before, value } });
    for (const [k, v] of Object.entries(p.change)) setSim(store, sim, k, v);
  };
  const back = () => {
    if (answer) store.getState().patch({ sim: { ...answer.before } });
    ui.setState({ simPredict: null });
  };
  if (!answer) {
    return (
      <div className="space-try__predict">
        <p className="space-try__prompt">
          <b>{t('space.try.predict')}</b> {tx(p.prompt, locale)}
        </p>
        <span className="space-try__options">
          {p.options.map((o) => (
            <button key={o.id} type="button" className="space-try__opt" data-predict={o.id} onClick={() => pick(o.id)}>
              {tx(o.label, locale)}
            </button>
          ))}
        </span>
      </div>
    );
  }
  const guess = p.options.find((o) => o.id === answer.guess);
  // A state is revealed by its label (the car turns); a number by how it changed, in the options' words where one matches.
  const now = view.outputs[p.observe];
  const outcome = isState ? String(now ?? '') : outcomeOf(typeof answer.value === 'number' ? answer.value : 0, numberOf(now));
  const match = isState ? undefined : p.options.find((o) => o.means === outcome);
  const seen = isState && observed ? outputText(observed, now, locale) : match ? tx(match.label, locale) : t(`space.try.outcome.${outcome}` as UiKey);
  return (
    <div className="space-try__predict" data-answered="">
      <p className="space-try__prompt">{tx(p.prompt, locale)}</p>
      <p className="space-try__reveal" aria-live="polite" data-outcome={outcome}>
        <span>{t('space.try.predicted', { guess: guess ? tx(guess.label, locale) : '' })}</span>
        <span>{t('space.try.observed', { seen })}</span>
      </p>
      <button type="button" className="space-try__opt" onClick={back}>
        {t('space.try.again')}
      </button>
    </div>
  );
}

function Table({ file, sim, card, ui, chapter }: { file: PartsFile; sim: SimData; card: SimTry; ui: SpaceUiStore; chapter: string }) {
  const t = useT();
  const { locale } = useSceneContext();
  const view = useSimView(file)!;
  const rows = useStore(ui, (u) => u.simTables[chapter]) ?? [];
  const vary = sim.controls.find((c) => c.id === card.vary)!;
  const outs = card.observe.map((id) => sim.outputs.find((o) => o.id === id)!).filter((o) => o.kind !== 'vector' && o.kind !== 'timeline');
  const rec = card.record !== true && card.record ? card.record : null;
  const judge = rec?.judge ?? null;
  // The graph's y: the outputs `chart.y` names, else the first number the card observes.
  const chart = rec?.chart;
  const ys = chart
    ? (chart === true ? outs.filter((o) => o.kind === 'number').slice(0, 1) : (Array.isArray(chart.y) ? chart.y : [chart.y]).map((id) => sim.outputs.find((o) => o.id === id)!))
    : [];
  const record = () => {
    const values: Record<string, SimOutputValue> = {};
    for (const o of outs) values[o.id] = view.outputs[o.id]!;
    for (const o of ys) values[o.id] = view.outputs[o.id]!;
    if (judge) values[judge.output] = view.outputs[judge.output]!;
    const tables = ui.getState().simTables;
    ui.setState({ simTables: { ...tables, [chapter]: recordRow(tables[chapter] ?? [], { vary: view.values[card.vary]!, values }) } });
  };
  const clear = () => ui.setState({ simTables: { ...ui.getState().simTables, [chapter]: [] } });
  const head = (o: SimOutput) => `${tx(o.label, locale)}${o.unit && o.format !== 'time' ? ` (${o.unit})` : ''}`;
  return (
    <div className="space-try__record">
      <span className="space-try__actions">
        <button type="button" className="space-try__opt space-try__rec" data-sim-record="" onClick={record}>
          {t('space.try.record')}
        </button>
        <button type="button" className="space-try__opt" onClick={clear} disabled={rows.length === 0}>
          {t('space.try.clear')}
        </button>
      </span>
      <table className="space-try__table">
        <caption>{t('space.try.table')}</caption>
        <thead>
          <tr>
            <th scope="col">{tx(vary.label, locale)}</th>
            {outs.map((o) => (
              <th key={o.id} scope="col">
                {head(o)}
              </th>
            ))}
            {judge && <th scope="col">{tx(judge.label, locale)}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={outs.length + 1 + (judge ? 1 : 0)} className="space-try__none">
                {t('space.try.empty')}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={String(r.vary)}>
                <th scope="row">{valueText(vary, r.vary, locale)}</th>
                {outs.map((o) => (
                  <td key={o.id} aria-label={outputWords(o, r.values[o.id], locale)}>{outputText(o, r.values[o.id], locale)}</td>
                ))}
                {judge && <td>{t(numberOf(r.values[judge.output]) > judge.gt ? 'space.try.yes' : 'space.try.no')}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {ys.length > 0 && <TryChart rows={rows} vary={vary} ys={ys} current={view.values[card.vary]} />}
    </div>
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
export function replay(ui: SpaceUiStore, ids: readonly string[]): void {
  ui.setState({ simReplay: { n: ui.getState().simReplay.n + 1, ids: [...ids] } });
}

function LifeCycleFold({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  return (
    <details className="space-try__diagram" open>
      <summary>{t('space.try.cycle')}</summary>
      <CycleDiagram file={file} sim={sim} />
    </details>
  );
}

function SortFold({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  return (
    <details className="space-try__diagram" open>
      <summary>{t('space.try.key')}</summary>
      <KeyDiagram file={file} sim={sim} />
    </details>
  );
}

export function TryIt({ file, ui }: { file: PartsFile; ui: SpaceUiStore }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const chapter = useScene<SpaceSceneExt, string | null>((s) => s.chapter);
  const view = useSimView(file);
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
      <dl className="space-try__readouts">
        {observed.map((o) => (
          <div key={o.id} className="space-try__readout" data-sim-output={o.id} data-state={o.kind === 'state' ? String(outputs[o.id]) : undefined}>
            <dt>{tx(o.label, locale)}</dt>
            <dd>
              <b aria-label={outputWords(o, outputs[o.id], locale)}>{outputText(o, outputs[o.id], locale)}</b>
              {o.kind === 'number' && o.unit && o.format !== 'time' && <small> {o.unit}</small>}
            </dd>
          </div>
        ))}
        <p className="space-try__sim">
          <span className="atlas-chip">{t('source.simulated').toUpperCase()}</span> {t('space.try.model')}
        </p>
      </dl>
      <Replay ids={runs} slow={slow} ui={ui} />
      {card.predict && <Predict file={file} sim={sim} card={card} ui={ui} chapter={chapter} />}
      {card.record && <Table file={file} sim={sim} card={card} ui={ui} chapter={chapter} />}
      {sim.circuit?.diagram && (
        <details className="space-try__diagram" open>
          <summary>{t('space.try.diagram')}</summary>
          <CircuitDiagram file={file} sim={sim} />
        </details>
      )}
      {sim.energy && (
        <details className="space-try__diagram" open>
          <summary>{t('space.try.energy')}</summary>
          <EnergyDiagram file={file} sim={sim} />
        </details>
      )}
      {sim.lifeCycle && <LifeCycleFold file={file} sim={sim} />}
      {sim.sort && <SortFold file={file} sim={sim} />}
    </section>
  );
}
