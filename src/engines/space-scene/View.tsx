/**
 * Phase 1 SpaceScene stub. A flat front view (x, y) of the primitive parts
 * that already honours the Explorer state: selection, x-ray, isolate, explode
 * and group layers. Phase 2 replaces it with Model3DStage (R3F) + Explorer.
 */
import { useId } from 'react';
import type { EngineViewProps } from '../core/types';
import { SceneSlot, useScene, useSceneStore } from '../core/context';
import { StubStage } from '../core/StubStage';
import { SceneLayerToggles, type LayerItem } from '../widgets/LayerToggles';
import { tx, type BilingualText } from '../../i18n';
import { resolveColorRef } from '../../theme/theme';
import { SPACE_VIEW_IDS, type SpaceSceneExt } from './index';
import type { Part, SpaceSceneData, SpaceView } from './schema';

const VIEW_LABEL: Record<SpaceView, BilingualText> = {
  assembled: { en: 'Whole', zh: '整体' },
  xray: { en: 'X-ray', zh: 'X 光' },
  exploded: { en: 'Exploded', zh: '拆开' },
  isolate: { en: 'Isolate', zh: '单独看' },
};

const UI: Record<'explode' | 'run' | 'view', BilingualText> = {
  explode: { en: 'Pull apart', zh: '拆开程度' },
  run: { en: 'Switch on', zh: '通电' },
  view: { en: 'View', zh: '视图' },
};

/** Half-extents in the x/y plane for the sketch. */
function extent(part: Part): [number, number] {
  const p = part.primitive;
  if (!p) return [0.3, 0.3];
  const [a = 0.3, b = a, c = b] = p.size;
  switch (p.kind) {
    case 'box':
    case 'plane':
      return [a / 2, b / 2];
    case 'cylinder':
      return [Math.max(a, b), c / 2];
    case 'cone':
    case 'capsule':
      return [a, b / 2 + (p.kind === 'capsule' ? a : 0)];
    case 'torus':
      return [a + b, a + b];
    case 'sphere':
      return [a, a];
  }
}

export default function SpaceSceneView({ data, locale }: EngineViewProps) {
  const { parts: file } = data as SpaceSceneData;
  const store = useSceneStore<SpaceSceneExt>();
  const s = useScene<SpaceSceneExt, Pick<SpaceSceneExt, 'part' | 'view' | 'explode' | 'run'> & { layers: string[] }>(
    (st) => ({ part: st.part, view: st.view, explode: st.explode, run: st.run, layers: st.layers }),
  );
  const explodeId = useId();

  const selected = file.parts.find((p) => p.id === s.part) ?? null;
  const groupColor = new Map(file.groups.map((g) => [g.id, g.color]));
  const layerItems: LayerItem[] = file.groups.map((g) => ({ id: g.id, label: g.name, color: g.color }));

  const explodeAmount = s.view === 'exploded' ? Math.max(s.explode, 0.0001) : s.explode;
  const placed = file.parts.map((part) => {
    const at = part.primitive?.at ?? [0, 0, 0];
    const k = explodeAmount * part.explode.dist;
    const x = at[0] + part.explode.dir[0] * k;
    const y = at[1] + part.explode.dir[1] * k;
    const [hw, hh] = extent(part);
    return { part, x, y, hw, hh };
  });
  const xs = placed.flatMap((p) => [p.x - p.hw, p.x + p.hw]);
  const ys = placed.flatMap((p) => [p.y - p.hh, p.y + p.hh]);
  const pad = 0.4;
  const minX = Math.min(...xs) - pad;
  const maxY = Math.max(...ys) + pad;
  const w = Math.max(...xs) + pad - minX;
  const h = maxY - (Math.min(...ys) - pad);

  const visible = (part: Part) => {
    if (!s.layers.includes(part.group)) return false;
    if (s.view === 'isolate' && selected) return part.id === selected.id || part.group === selected.group;
    return true;
  };
  const opacity = (part: Part) => (s.view === 'xray' && selected && part.id !== selected.id ? 0.15 : 1);

  return (
    <>
      <StubStage engineLabel="SpaceScene · Model3DStage">
        <svg viewBox={`0 0 ${w} ${h}`} className="atlas-stub__svg" role="group" aria-label={tx(VIEW_LABEL[s.view], locale)}>
          {placed.filter(({ part }) => visible(part)).map(({ part, x, y, hw, hh }) => {
            const isSel = part.id === s.part;
            const fill = resolveColorRef(groupColor.get(part.group) ?? 'token:accent-1');
            return (
              <g
                key={part.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={tx(part.name, locale)}
                style={{ cursor: 'pointer', opacity: opacity(part), transition: 'opacity 200ms' }}
                onClick={() => store.getState().patch({ part: isSel ? null : part.id })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    store.getState().patch({ part: isSel ? null : part.id });
                  }
                }}
              >
                <rect
                  x={x - hw - minX}
                  y={maxY - (y + hh)}
                  width={hw * 2}
                  height={hh * 2}
                  rx={Math.min(hw, hh) * 0.2}
                  fill={fill}
                  fillOpacity={0.35}
                  stroke={isSel ? 'var(--ink)' : fill}
                  strokeWidth={isSel ? 0.05 : 0.025}
                  className={s.run ? 'atlas-stub__pulse' : undefined}
                />
                <text
                  x={x - minX}
                  y={maxY - y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={0.16}
                  fill="var(--ink)"
                >
                  {tx(part.name, locale)}
                </text>
              </g>
            );
          })}
        </svg>
      </StubStage>

      <SceneSlot name="stageOverlay">
        <div className="atlas-overlay-card">
          <SceneLayerToggles items={layerItems} />
        </div>
      </SceneSlot>

      <SceneSlot name="bottomBar">
        <div className="atlas-segmented" role="radiogroup" aria-label={tx(UI.view, locale)}>
          {SPACE_VIEW_IDS.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={s.view === v}
              className="atlas-control"
              onClick={() => store.getState().patch({ view: v })}
            >
              {tx(VIEW_LABEL[v], locale)}
            </button>
          ))}
        </div>
        <label className="atlas-range" htmlFor={explodeId}>
          <span>{tx(UI.explode, locale)}</span>
          <input
            id={explodeId}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.explode}
            onChange={(e) => store.getState().patch({ explode: Number(e.target.value) })}
          />
        </label>
        <button
          type="button"
          className="atlas-control"
          aria-pressed={s.run}
          onClick={() => store.getState().patch({ run: !s.run })}
        >
          {tx(UI.run, locale)}
        </button>
      </SceneSlot>

      <SceneSlot name="inspector">
        {selected && (
          <div className="atlas-stub__detail">
            <h3>{tx(selected.name, locale)}</h3>
            <p>{tx(selected.summary, locale)}</p>
            <p className="atlas-stub__muted">{tx(selected.detail, locale)}</p>
            {selected.connects.length > 0 && (
              <p className="atlas-stub__muted">
                →{' '}
                {selected.connects
                  .map((id) => file.parts.find((p) => p.id === id))
                  .filter((p): p is Part => !!p)
                  .map((p) => tx(p.name, locale))
                  .join(' · ')}
              </p>
            )}
          </div>
        )}
      </SceneSlot>
    </>
  );
}
