/**
 * Bottom panel 03 / STATE: live rows RUN / FLOW / ANIMATIONS / VIEW /
 * EXPLODE (mono values); run-time values carry the SIM chip (they are a
 * visual simulation, docs/08 §6).
 */
import { useStore } from 'zustand';
import { useHud, useScene, useT } from '../../core/context';
import { activePreset } from '../../core/controls';
import { t as tl, tx, type UiKey } from '../../../i18n';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { SpaceUiStore } from '../ui';
import { flowingGroups } from './common';

function Row({ label, value, sim, on }: { label: UiKey; value: string; sim?: boolean; on?: boolean }) {
  const t = useT();
  return (
    <div className="space-state__row" data-on={on || undefined}>
      <dt>
        {tl('en', label).toUpperCase()}
        <small lang="zh-Hans">{tl('zh', label)}</small>
      </dt>
      <dd>
        {value}
        {sim && <span className="atlas-chip">{t('source.simulated').toUpperCase()}</span>}
      </dd>
    </div>
  );
}

export function StatePanel({ file, ui }: { file: PartsFile; ui: SpaceUiStore }) {
  const t = useT();
  const s = useScene<SpaceSceneExt, { run: boolean; view: string; explode: number; layers: string[]; chapter: string | null }>((st) => ({
    run: st.run,
    view: st.view,
    explode: st.explode,
    layers: st.layers,
    chapter: st.chapter,
  }));
  const preset = useHud((h) => {
    const id = activePreset(h, s.chapter);
    const item = h.controls.presets?.items.find((p) => p.id === id);
    return item ? item.label : null;
  });
  const reference = useStore(ui, (u) => u.reference !== null);
  const flows = flowingGroups(file, s.run, s.layers);
  const activeFlows = file.flows.filter((f) => flows.has(f.group) && (s.run || !f.whenRun)).length;
  const moving = new Set(file.animations.filter((a) => s.run || !a.whenRun).map((a) => a.target)).size;
  const up = (x: string) => x.toLocaleUpperCase();
  const explode = s.view === 'exploded' ? Math.round(s.explode * 100) : 0;

  return (
    <dl className="space-state">
      <Row label="space.state.run" value={up(s.run ? t('space.state.on') : t('space.state.off'))} sim on={s.run} />
      <Row
        label="space.state.flow"
        value={activeFlows > 0 ? up(t('space.state.active', { n: activeFlows, total: file.flows.length })) : up(t('space.state.off'))}
        sim
        on={activeFlows > 0}
      />
      <Row label="space.state.animations" value={up(moving > 0 ? t('space.state.moving', { n: moving }) : t('space.state.still'))} sim on={moving > 0} />
      <Row
        label="space.state.view"
        value={up(reference ? t('space.mode.reference') : preset ? `${t('hud.view')} ${tx(preset, 'en')}` : t('space.state.free'))}
      />
      <Row label="space.state.explode" value={`${String(explode).padStart(2, '0')} %`} on={explode > 0} />
    </dl>
  );
}
