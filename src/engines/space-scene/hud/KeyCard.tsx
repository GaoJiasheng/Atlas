/**
 * The flowchart card (docs/38 §4.4 E-LT3): the top-right card of a topic
 * whose try-it model is `sort` (in place of the part chain), and inside the
 * try-it card below 1024 px where the card is hidden (in the reading panel
 * on its own in a chapter without a card). It draws the key of the tray on
 * show (lib/sim/keycard.ts): question boxes with YES lines to their groups
 * and NO lines down to the next question, or a classmate's groups with a ✗
 * and "n wrong" where a specimen is in the wrong one. Every count comes
 * from the model (SIM, "in this model") and fades in over 0.3 s when it
 * changes. With a specimen selected, its way down is drawn in signal, its
 * answers in bold and its group filled (and, put in the wrong group, where
 * it belongs). A group is a button (44 px hit areas, Enter / Space) that
 * selects its pad. The card does not change the questions (that is the
 * try-it card's job: one way in). Screen readers get the key as words.
 */
import { type KeyboardEvent } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SimData } from '../sim-schema';
import { KEY_W, keyLayout, keyModel, keySummary, type KeyWords } from '../lib/sim/keycard';
import { useSimStore, useSimView } from './sim';

const LINE_H = 14;

export function KeyDiagram({ file, sim }: { file: PartsFile; sim: SimData }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSimStore();
  const view = useSimView(file);
  const selected = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const sort = sim.sort;
  if (!sort || !view) return null;
  const words: KeyWords = {
    yes: t('space.key.yes'),
    no: t('space.key.no'),
    neither: t('space.key.neither'),
    pick: t('space.key.pick'),
    yesTo: t('space.key.yesTo'),
    group: t('space.key.group'),
    wrong: t('space.key.wrong'),
    belongs: t('space.key.belongs'),
    inCase: t('space.key.inCase'),
    leaf: t('space.key.leaf'),
    summary: t('space.key.summary'),
    wholeCase: t('space.key.wholeCase'),
    colon: t('space.key.colon'),
    comma: t('space.key.comma'),
    semicolon: t('space.key.semicolon'),
    stop: t('space.key.stop'),
  };
  const model = keyModel(sort, view.values, selected, words, locale);
  const lay = keyLayout(model, words);
  const summary = keySummary(model, words);
  const parts = new Set(file.parts.map((p) => p.id));
  const trail = model.trail;
  const pick = (part: string | undefined) => {
    if (part && parts.has(part)) store.getState().patch({ part });
  };
  const onKey = (part: string | undefined) => (ev: KeyboardEvent<SVGGElement>) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    pick(part);
  };
  const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  return (
    <svg className="space-key" viewBox={`0 0 ${KEY_W} ${lay.height}`} role="group" aria-label={summary} data-kind={model.key}>
      {lay.text.map((line, i) => (
        <text key={`t-${i}`} className="space-key__case" x={6} y={18 + i * LINE_H}>
          {line}
        </text>
      ))}
      {lay.lines.map((l) => {
        const on = trail !== null && trail.boxes.includes(l.from) && trail.answers[trail.boxes.indexOf(l.from)] === l.kind;
        return (
          <g key={`${l.kind}-${l.from}`} className="space-key__link" data-line={`${l.kind}-${l.from}`} data-pending={l.pending || undefined} data-on={on || undefined}>
            <path className="space-key__line" d={l.d} />
            <text className="space-key__answer" x={l.label.x} y={l.label.y} textAnchor={l.label.anchor}>
              {(l.kind === 'yes' ? words.yes : words.no).toUpperCase()}
            </text>
          </g>
        );
      })}
      {lay.boxes.map((b) => (
        <g key={b.index} className="space-key__node" data-node={b.index} data-pending={b.pending || undefined} data-on={(trail?.boxes.includes(b.index) ?? false) || undefined}>
          <rect className="space-key__box" x={b.x} y={b.y} width={b.w} height={b.h} rx={4} />
          {b.lines.map((line, i) => (
            <text key={i} className="space-key__q" x={b.x + 8} y={b.y + 5 + LINE_H * (i + 1) - 3}>
              {line}
            </text>
          ))}
        </g>
      ))}
      {lay.leaves.map((l, i) => {
        const m = model.leaves[i]!;
        const on = trail?.leaf === l.group;
        const interactive = m.pad !== undefined && parts.has(m.pad);
        const letter = l.group.toUpperCase();
        const belongs = on && trail?.belongs ? fill(words.belongs, { group: trail.belongs }) : null;
        const aria = [fill(words.leaf, { g: letter, n: m.count }), m.name, ...(m.wrong > 0 ? [fill(words.wrong, { n: m.wrong })] : []), ...(belongs ? [belongs] : [])].join(words.comma);
        const arrangement = model.kind === 'arrangement';
        const nameX = arrangement ? l.x + 30 : l.x + 8;
        const nameY0 = arrangement ? l.y + 18 : l.y + 8 + LINE_H + LINE_H - 2;
        let row = l.lines.length;
        return (
          <g
            key={l.group}
            className="space-key__leaf"
            data-leaf={l.group}
            data-count={m.count}
            data-on={on || undefined}
            data-pending={m.pending || undefined}
            data-wrong={m.wrong > 0 ? m.wrong : undefined}
            {...(interactive ? { role: 'button', tabIndex: 0, 'aria-label': aria, 'aria-current': on ? ('true' as const) : undefined, onClick: () => pick(m.pad), onKeyDown: onKey(m.pad) } : { 'aria-label': aria })}
          >
            <rect className="space-key__target" x={l.hit.x} y={l.hit.y} width={l.hit.w} height={l.hit.h} />
            <rect className="space-key__card" x={l.x} y={l.y} width={l.w} height={l.h} rx={3} />
            <text className="space-key__letter" x={l.x + 8} y={arrangement ? l.y + 18 : l.y + 8 + 11}>
              {letter}
            </text>
            <text key={`n-${m.count}`} className="space-key__count" x={l.x + l.w - 8} y={arrangement ? l.y + 18 : l.y + 8 + 11} textAnchor="end">
              {m.count}
            </text>
            {l.lines.map((line, k) => (
              <text key={k} className="space-key__name" x={nameX} y={nameY0 + k * LINE_H}>
                {line}
              </text>
            ))}
            {m.wrong > 0 && (
              <text key={`w-${m.wrong}`} className="space-key__wrong" x={nameX} y={nameY0 + row++ * LINE_H}>
                {`✗ ${fill(words.wrong, { n: m.wrong })}`}
              </text>
            )}
            {belongs && (
              <text className="space-key__belongs" x={nameX} y={nameY0 + row++ * LINE_H}>
                {belongs}
              </text>
            )}
          </g>
        );
      })}
      {model.kind === 'questions' && (
        <text key={`c-${model.inCase}`} className="space-key__incase" x={KEY_W - 6} y={lay.foot} textAnchor="end">
          {`${words.inCase.toUpperCase()} · ${model.inCase}`}
        </text>
      )}
      <text className="space-key__sim" x={6} y={lay.foot}>
        <tspan className="space-key__chip">SIM</tspan>
        {` ${t('space.try.model')}`}
      </text>
    </svg>
  );
}

/** The top-right card (slot `card`) of a sort topic. */
export function KeyCard({ file }: { file: PartsFile }) {
  if (!file.sim?.sort) return null;
  return (
    <div className="space-key-card">
      <KeyDiagram file={file} sim={file.sim} />
    </div>
  );
}
