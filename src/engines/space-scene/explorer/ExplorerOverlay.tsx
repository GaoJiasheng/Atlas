/**
 * Stage overlay: the control panel (docs/06) — group (layer) toggles (each
 * with a ⊙ solo switch: that group alone, every other part faint), the
 * mode switches (X-RAY, EXPLODED, CUTAWAY, FLOW, REFERENCE, PRESENTATION, LABELS), the
 * glossary list (topics with data/glossary.json) and Hide HUD as tools, the
 * explode slider while EXPLODED (nothing else sits at the bottom but the
 * chapter axis), and a colour key of the groups and flows.
 */
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx, type BilingualText } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { ControlPanel, type ControlRow } from '../../widgets/ControlPanel';
import type { LegendItem } from '../../widgets/Legend';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { ExplorerBar } from './ExplorerBar';

const MODES: ControlRow[] = [
  { kind: 'mode', id: 'xray' },
  { kind: 'mode', id: 'exploded' },
  { kind: 'mode', id: 'cutaway' },
  { kind: 'mode', id: 'flow' },
  { kind: 'mode', id: 'reference' },
  { kind: 'mode', id: 'presentation' },
  { kind: 'mode', id: 'labels' },
];
const TOOLS: ControlRow[] = [...MODES, { kind: 'hud' }];
const TOOLS_GLOSSARY: ControlRow[] = [...MODES, { kind: 'glossary' }, { kind: 'hud' }];

export function ExplorerOverlay({ file, glossary = false }: { file: PartsFile; glossary?: boolean }) {
  const t = useT();
  const { locale } = useSceneContext();
  const store = useSceneStore<SpaceSceneExt>();
  const solo = useScene<SpaceSceneExt, string | null>((s) => s.solo);
  // Solo only where it means something: groups that have parts.
  const withParts = new Set(file.parts.map((p) => p.group));
  const layers: ControlRow[] = file.groups.map((g) => ({
    kind: 'layer',
    id: g.id,
    label: g.name,
    color: g.color,
    ...(withParts.has(g.id)
      ? {
          solo: {
            on: solo === g.id,
            label: t('space.solo', { name: tx(g.name, locale) }),
            toggle: () => store.getState().patch({ solo: store.getState().solo === g.id ? null : g.id }),
          },
        }
      : {}),
  }));
  // Groups with parts get a fill swatch; a flow gets an arrow once per label and colour
  // (a group with no parts, like "Current", is keyed by its flow alone).
  const legend: LegendItem[] = [];
  const seen = new Set<string>();
  const add = (item: LegendItem) => {
    const key = `${item.kind}|${tx(item.label as BilingualText, 'en')}|${resolveColorRef(item.color)}`;
    if (seen.has(key)) return;
    seen.add(key);
    legend.push(item);
  };
  for (const g of file.groups) {
    if (withParts.has(g.id)) add({ id: `group-${g.id}`, label: g.name, color: g.color, kind: 'fill' });
  }
  for (const f of file.flows) {
    const group = file.groups.find((g) => g.id === f.group);
    add({ id: `flow-${f.id}`, label: group?.name ?? f.id, color: f.color, kind: 'arrow' });
  }
  return (
    <div className="atlas-overlay-card space-overlay">
      <ControlPanel layers={layers} tools={glossary ? TOOLS_GLOSSARY : TOOLS} legend={legend} />
      <ExplorerBar label={file.views.explodeLabel} />
    </div>
  );
}
