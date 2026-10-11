/**
 * The explode slider, in the control panel under the mode rows while
 * EXPLODED is on (44 px thumb, keyboard operable; named by
 * `views.explodeLabel` when the topic gives one, e.g. PEEL). Renders nothing
 * otherwise.
 */
import { useId } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx } from '../../../i18n';
import type { Bilingual } from '../../../content/schema/common';
import type { SpaceSceneExt } from '../index';

/** Explode amount used when EXPLODED is switched on from (almost) 0. */
export const DEFAULT_EXPLODE = 0.7;

export function ExplorerBar({ label }: { label?: Bilingual | undefined }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const s = useScene<SpaceSceneExt, Pick<SpaceSceneExt, 'view' | 'explode'>>((st) => ({ view: st.view, explode: st.explode }));
  const sliderId = useId();
  if (s.view !== 'exploded') return null;
  return (
    <div className="space-bar">
      <label className="space-range" htmlFor={sliderId}>
        <span>{label ? tx(label, locale) : t('space.explode')}</span>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={s.explode}
          onChange={(e) => store.getState().patch({ explode: Number(e.target.value) })}
        />
        <output htmlFor={sliderId} className="space-range__value">
          {String(Math.round(s.explode * 100)).padStart(2, '0')}
        </output>
      </label>
    </div>
  );
}
