import { useEffect } from 'react';
import type { PartsFile, SpaceChapterState } from '../schema';
import type { SpaceUiStore } from '../ui';
import type { SpaceSceneExt } from '../index';
import type { SceneStore } from '../../core/store';
import type { Chapter } from '../../core/types';
import { resolveSimValues } from '../lib/sim/controls';
import { airfoilRecordSignature } from '../lib/sim/airfoil';
import { AirfoilCache, airfoilInputKey } from '../lib/sim/airfoil-cache';
type AirfoilSession = {
  file: PartsFile;
  store: SceneStore<SpaceSceneExt>;
  ui: SpaceUiStore;
  chapters: readonly Chapter[];
};
/** Subscribe once per topic; this same guard is used by buttons, keys, beats and URL hydration. */
export function watchAirfoil({
  file,
  store,
  ui,
  chapters,
}: AirfoilSession): (() => void) | undefined {
  const sim = file.sim,
    d = sim?.airfoil;
  if (!sim || !d) return;
  const cache = new AirfoilCache();
  let key = '',
    transition = -1;
  const update = () => {
    const st = store.getState(),
      values = resolveSimValues(sim, st.sim),
      input = airfoilInputKey(d, values);
    if (input !== key) {
      key = input;
      void cache.request(d, values, (airfoil) => ui.setState({ airfoil }));
    }
    if (transition !== st.transition.id) {
      transition = st.transition.id;
      if (['chapter', 'state', 'url', 'init'].includes(st.transition.reason))
        ui.setState({ airfoilLaunch: ui.getState().airfoilLaunch + 1 });
    }
    const card = (
      chapters.find((c) => c.id === st.chapter)?.state as
        SpaceChapterState | undefined
    )?.sim?.try;
    if (card && st.chapter) {
      const signature = airfoilRecordSignature(d, values, card.vary),
        u = ui.getState(),
        previous = u.airfoilSignatures[st.chapter];
      if (signature !== previous)
        ui.setState({
          airfoilSignatures: {
            ...u.airfoilSignatures,
            [st.chapter]: signature,
          },
          ...(previous
            ? {
                simTables: { ...u.simTables, [st.chapter]: [] },
                simPredict:
                  u.simPredict?.chapter === st.chapter ? null : u.simPredict,
                airfoilReset: u.airfoilReset + 1,
              }
            : {}),
        });
    }
  };
  update();
  const unsub = store.subscribe(update);
  return () => {
    unsub();
    cache.dispose();
    ui.setState({ airfoil: null });
  };
}
/** Topic-owned async lifecycle, shared across the HUD and WebGL React roots. */
export function AirfoilDriver(props: AirfoilSession) {
  useEffect(
    () => watchAirfoil(props),
    [props.file, props.store, props.ui, props.chapters],
  );
  return null;
}
