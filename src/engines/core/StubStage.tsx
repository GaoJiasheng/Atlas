/**
 * Placeholder stage used by Phase 1 engine stubs: a notice plus the live scene
 * state as JSON, so chapter flow and URL sync can be exercised end to end.
 * Phase 2 engines drop this.
 */
import type { ReactNode } from 'react';
import { useSceneContext, useSceneStore } from './context';
import { useStore } from 'zustand';
import { t } from '../../i18n';

export function StubStage({ engineLabel, children }: { engineLabel: string; children?: ReactNode }) {
  const { locale } = useSceneContext();
  const store = useSceneStore();
  // Re-render on any change; snapshot() is cheap and this is a debug view.
  useStore(store, (s) => s);
  const snapshot = { ...store.getState().snapshot(), transition: store.getState().transition };

  return (
    <div className="atlas-stub">
      {children && <div className="atlas-stub__canvas">{children}</div>}
      <p className="atlas-stub__notice">{t(locale, 'stub.notice', { engine: engineLabel })}</p>
      <details className="atlas-stub__state" open>
        <summary>{t(locale, 'stub.state')}</summary>
        <pre>{JSON.stringify(snapshot, null, 2)}</pre>
      </details>
    </div>
  );
}
