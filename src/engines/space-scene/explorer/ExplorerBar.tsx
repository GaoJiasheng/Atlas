/**
 * The engine's bottom bar holds only what the top bar lacks: the explode
 * slider, while EXPLODED is on (44 px thumb, keyboard operable). Views, run
 * and cutaway are MODE buttons in the host's top bar (docs/08 §3). Renders
 * nothing otherwise, so the host hides the empty bar.
 */
import { useId } from 'react';
import { useScene, useSceneStore, useT } from '../../core/context';
import type { SpaceSceneExt } from '../index';

/** Explode amount used when EXPLODED is switched on from (almost) 0. */
export const DEFAULT_EXPLODE = 0.7;

export function ExplorerBar() {
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const s = useScene<SpaceSceneExt, Pick<SpaceSceneExt, 'view' | 'explode'>>((st) => ({ view: st.view, explode: st.explode }));
  const sliderId = useId();
  if (s.view !== 'exploded') return null;
  return (
    <div className="space-bar">
      <label className="space-range" htmlFor={sliderId}>
        <span>{t('space.explode')}</span>
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
