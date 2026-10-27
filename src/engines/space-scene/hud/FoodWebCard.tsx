/** A directed food→consumer plate. Picking a node only selects its first part. */
import { useId } from 'react';
import { useScene, useSceneContext } from '../../core/context';
import { SourceRefs } from '../../widgets/SourcePopover';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { tx } from '../../../i18n';
import { foodEdgePath, foodWebModel } from '../lib/sim/food-web';
import { useSimStore, useSimView } from './sim';

const words = {
  title: { en: 'Food web', zh: '食物网' },
  direction: { en: 'Food → consumer', zh: '食物 → 消费者' },
  inspect: { en: 'Inspecting', zh: '正在观察' },
  selected: { en: 'Selected', zh: '已选中' },
  links: { en: 'Relations and evidence', zh: '关系与证据' },
  active: { en: 'Active relation', zh: '有效关系' },
  inactive: { en: 'Disconnected relation', zh: '断开的关系' },
  producer: { en: 'Producer', zh: '生产者' },
  consumer: { en: 'Consumer', zh: '消费者' },
  general: { en: 'General · medium evidence', zh: '一般资料 · 中等证据' },
  'local-observation': { en: 'Local observation', zh: '当地观察' },
  'reported-observation': { en: 'Reported observation · medium evidence', zh: '文献报告的观察 · 中等证据' },
  'indexed-only': { en: 'Indexed account · medium evidence', zh: '索引资料 · 中等证据' },
};

export function FoodWebCard({ file, reader = false }: { file: PartsFile; reader?: boolean }) {
  const { locale } = useSceneContext();
  const view = useSimView(file);
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const store = useSimStore();
  const marker = useId().replace(/:/g, '');
  if (!view?.sim.foodWeb) return null;
  const web = view.sim.foodWeb;
  const model = foodWebModel(web, view.outputs, view.values, selected);
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  return (
    <section className={`space-food-web ${reader ? 'space-food-web--reader' : 'space-food-web--card'}`} aria-label={tx(words.title, locale)}>
      <header><b>{tx(words.title, locale)}</b><span>{tx(words.direction, locale)}</span></header>
      <div className="space-food-web__diagram">
        <svg viewBox="0 0 320 380" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs><marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
          {model.edges.map((e) => <path key={e.id} className="space-food-web__edge" data-food-edge={e.id} data-active={e.active} data-evidence={e.evidence} d={foodEdgePath(byId.get(e.from)!.d, byId.get(e.to)!.d)} markerEnd={`url(#${marker})`} />)}
        </svg>
        <ul className="space-food-web__nodes">
          {model.nodes.map((n) => {
            const output = view.sim.outputs.find((o) => o.id === n.output)!;
            const status = output.states?.[n.status];
            return <li key={n.id} style={{ left: `${n.d[0] * 100}%`, top: `${n.d[1] * 100}%` }}>
              <button type="button" data-food-node={n.id} data-present={n.present} data-supported={n.supported} data-inspect={n.inspect} data-selected={n.selected} data-status={n.status} aria-pressed={n.selected} onClick={() => store.getState().patch({ part: n.parts[0]! })}>
                <b>{tx(n.label, locale)}</b><span>{tx(words[n.role], locale)} · {status ? tx(status, locale) : n.status}</span>
                {n.inspect && <small>{tx(words.inspect, locale)}</small>}{n.selected && <small>{tx(words.selected, locale)}</small>}
              </button>
            </li>;
          })}
        </ul>
      </div>
      <p className="space-food-web__note"><span className="atlas-chip">SIM</span> {tx(web.note, locale)}</p>
      <details className="space-food-web__evidence" open={reader}>
        <summary>{tx(words.links, locale)}</summary>
        <ul>{model.nodes.map((n) => <li key={n.id}><b>{tx(n.label, locale)}</b> <SourceRefs ids={n.sources} locale={locale} /></li>)}</ul>
        <ul>{model.edges.map((e) => <li key={e.id} data-food-relation={e.id}>
          <b>{tx(byId.get(e.from)!.label, locale)} → {tx(byId.get(e.to)!.label, locale)}</b>
          <span>{tx(e.active ? words.active : words.inactive, locale)} · {tx(words[e.evidence], locale)}</span>
          <SourceRefs ids={e.sources} locale={locale} /><p>{tx(e.note, locale)}</p>
        </li>)}</ul>
      </details>
    </section>
  );
}
