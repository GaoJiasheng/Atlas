/**
 * Explorer controls in the bottom bar: view (segmented), explode slider
 * (exploded view only), run toggle, cutaway toggle. Pointer + keyboard; every
 * target is >= 44px; nothing depends on hover.
 */
import { useId, type KeyboardEvent } from 'react';
import { useScene, useSceneStore, useT } from '../../core/context';
import type { UiKey } from '../../../i18n';
import { SPACE_VIEW_IDS, type SpaceSceneExt } from '../index';
import type { SpaceView } from '../schema';

const VIEW_KEY: Record<SpaceView, UiKey> = {
  assembled: 'space.view.assembled',
  xray: 'space.view.xray',
  exploded: 'space.view.exploded',
  isolate: 'space.view.isolate',
};

/** Explode amount used when switching to the exploded view from (almost) 0. */
const DEFAULT_EXPLODE = 0.7;

export function ExplorerBar() {
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const s = useScene<SpaceSceneExt, Pick<SpaceSceneExt, 'view' | 'explode' | 'run' | 'cutaway'>>((st) => ({
    view: st.view,
    explode: st.explode,
    run: st.run,
    cutaway: st.cutaway,
  }));
  const sliderId = useId();

  const setView = (view: SpaceView) => {
    const patch: Partial<SpaceSceneExt> = { view };
    if (view === 'exploded' && s.explode < 0.05) patch.explode = DEFAULT_EXPLODE;
    store.getState().patch(patch);
  };

  const onRadioKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = SPACE_VIEW_IDS.indexOf(s.view);
    const n = SPACE_VIEW_IDS.length;
    const next = SPACE_VIEW_IDS[(i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n]!;
    setView(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
  };

  return (
    <div className="space-bar">
      <div className="atlas-segmented" role="radiogroup" aria-label={t('space.view')} onKeyDown={onRadioKey}>
        {SPACE_VIEW_IDS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={s.view === v}
            tabIndex={s.view === v ? 0 : -1}
            data-view={v}
            className="atlas-control"
            onClick={() => setView(v)}
          >
            {t(VIEW_KEY[v])}
          </button>
        ))}
      </div>

      {s.view === 'exploded' && (
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
        </label>
      )}

      <button
        type="button"
        className="atlas-control space-toggle"
        aria-pressed={s.run}
        onClick={() => store.getState().patch({ run: !s.run })}
      >
        <span className="space-toggle__icon" aria-hidden="true">
          {s.run ? '■' : '▶'}
        </span>
        {t('space.run')}
      </button>

      <button
        type="button"
        className="atlas-control space-toggle"
        aria-pressed={s.cutaway === 'half'}
        onClick={() => store.getState().patch({ cutaway: s.cutaway === 'half' ? 'none' : 'half' })}
      >
        <svg className="space-toggle__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 100 18z" fill="currentColor" />
          <path d="M12 3a9 9 0 110 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
        </svg>
        {t('space.cutaway')}
      </button>
    </div>
  );
}
