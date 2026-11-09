/** The try-it card's predict-then-observe block and data table (docs/22 §4.3 S6, S7), fetched by the chapters that have them. */
import { useStore } from 'zustand';
import { useSceneContext, useT } from '../../core/context';
import { tx, type UiKey } from '../../../i18n';
import type { PartsFile } from '../schema';
import type { SimData, SimOutput, SimTry } from '../sim-schema';
import type { SpaceUiStore } from '../ui';
import { numberOf, type SimOutputValue } from '../lib/sim';
import { evaluateSimOnStage } from '../lib/sim/carrier';
import { resolveSimValues } from '../lib/sim/controls';
import { displayOnlyControls, outcomeOf, predictionIsCurrent, recordRow, tableContextKey } from '../lib/sim/trial';
import { outputText, outputWords, valueText } from '../lib/sim/text';
import { setSim, useSimStore, useSimView } from '../hud/sim';
import { TryChart } from './TryChart';

export function Predict({ file, sim, card, ui, chapter }: { file: PartsFile; sim: SimData; card: SimTry; ui: SpaceUiStore; chapter: string }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file)!;
  const saved = useStore(ui, (u) => u.simPredict);
  const answer = predictionIsCurrent(saved, chapter, view.values) ? saved : null;
  const p = card.predict!;
  const observed = sim.outputs.find((o) => o.id === p.observe);
  const isState = observed?.kind === 'state';
  const pick = (id: string) => {
    const restore = resolveSimValues(sim, store.getState().sim);
    // From the prediction's starting point (the switch closed …): read the observed output there, then make the change.
    for (const [k, v] of Object.entries(p.start ?? {})) setSim(store, sim, k, v);
    const st = store.getState();
    const before = resolveSimValues(sim, st.sim);
    const out = evaluateSimOnStage(sim, file, resolveSimValues(sim, st.sim), st.pose, card.observe).outputs[p.observe];
    const value = out === null ? null : isState ? String(out ?? '') : numberOf(out);
    for (const [k, v] of Object.entries(p.change)) setSim(store, sim, k, v);
    const after = resolveSimValues(sim, store.getState().sim);
    ui.setState({ simPredict: { chapter, guess: id, before, after, restore, value } });
  };
  const back = () => {
    if (answer) store.getState().patch({ sim: { ...(answer.restore ?? answer.before) } });
    ui.setState({ simPredict: null, simReveal: null });
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
  const noTransmission = now === null || answer.value === null;
  const outcome = noTransmission ? 'no-transmission' : isState ? String(now ?? '') : outcomeOf(typeof answer.value === 'number' ? answer.value : 0, numberOf(now));
  const match = isState ? undefined : p.options.find((o) => o.means === outcome);
  const seen = noTransmission ? (locale === 'zh' ? '无传播' : 'No transmission') : isState && observed ? outputText(observed, now, locale) : match ? tx(match.label, locale) : t(`space.try.outcome.${outcome}` as UiKey);
  return (
    <div className="space-try__predict" data-answered="">
      <p className="space-try__prompt">{tx(p.prompt, locale)}</p>
      <p className="space-try__reveal" aria-live="polite" data-outcome={outcome}>
        <span>{t('space.try.predicted', { guess: guess ? tx(guess.label, locale) : '' })}</span>
        <span>{t('space.try.observed', { seen })}</span>
      </p>
      <details className="space-curve__values">
        <summary>{t('space.try.comparedConditions')}</summary>
        <table className="space-try__table">
          <thead><tr><th scope="col">{t('space.try.conditions')}</th><th scope="col">{t('space.try.before')}</th><th scope="col">{t('space.try.after')}</th></tr></thead>
          <tbody>{sim.controls.map((c) => <tr key={c.id}><th scope="row">{tx(c.label, locale)}</th><td>{valueText(c, answer.before[c.id], locale)}</td><td>{valueText(c, answer.after[c.id], locale)}</td></tr>)}</tbody>
        </table>
      </details>
      <button type="button" className="space-try__opt" onClick={back}>
        {t('space.try.again')}
      </button>
    </div>
  );
}

export function Table({ file, sim, card, ui, chapter }: { file: PartsFile; sim: SimData; card: SimTry; ui: SpaceUiStore; chapter: string }) {
  const t = useT();
  const { locale } = useSceneContext();
  const view = useSimView(file)!;
  const rows = useStore(ui, (u) => u.simTables[chapter]) ?? [];
  const notice = useStore(ui, (u) => u.simTableNotices[chapter] ?? false);
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
    if(sim.airfoil) values[sim.airfoil.plot.y] = view.outputs[sim.airfoil.plot.y]!;
    if (judge) values[judge.output] = view.outputs[judge.output]!;
    const tables = ui.getState().simTables;
    const context = tableContextKey(chapter, view.values, card.vary, displayOnlyControls(sim));
    const previous = ui.getState().simTableContexts[chapter] === context ? tables[chapter] ?? [] : [];
    ui.setState({ simTables: { ...tables, [chapter]: recordRow(previous, { vary: view.values[card.vary]!, values, controls: { ...view.values } }) },
      simTableContexts: { ...ui.getState().simTableContexts, [chapter]: context },
      simTableNotices: { ...ui.getState().simTableNotices, [chapter]: false },
    });
  };
  const clear = () => ui.setState({ simTables: { ...ui.getState().simTables, [chapter]: [] } });
  const head = (o: SimOutput) => `${tx(o.label, locale)}${o.unit && o.format !== 'time' ? ` (${o.unit})` : ''}`;
  return (
    <div className="space-try__record">
      {notice && <p className="space-try__notice" role="status">{t('space.try.conditionsChanged')}</p>}
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
      {ys.length > 0 && !(sim.airfoil && card.vary === sim.airfoil.angle) && <TryChart rows={rows} vary={vary} ys={ys} current={view.values[card.vary]} />}
    </div>
  );
}
