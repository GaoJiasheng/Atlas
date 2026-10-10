/**
 * Stage overlay: the control panel (docs/06) — group (layer) toggles, the
 * mode switches (X-RAY, EXPLODED, CUTAWAY, FLOW, REFERENCE, LABELS), the
 * glossary list (topics with data/glossary.json) and Hide HUD as tools, and a
 * colour key of the groups and flows.
 */
import { ControlPanel, type ControlRow } from '../../widgets/ControlPanel';
import type { LegendItem } from '../../widgets/Legend';
import type { PartsFile } from '../schema';

const MODES: ControlRow[] = [
  { kind: 'mode', id: 'xray' },
  { kind: 'mode', id: 'exploded' },
  { kind: 'mode', id: 'cutaway' },
  { kind: 'mode', id: 'flow' },
  { kind: 'mode', id: 'reference' },
  { kind: 'mode', id: 'labels' },
];
const TOOLS: ControlRow[] = [...MODES, { kind: 'hud' }];
const TOOLS_GLOSSARY: ControlRow[] = [...MODES, { kind: 'glossary' }, { kind: 'hud' }];

export function ExplorerOverlay({ file, glossary = false }: { file: PartsFile; glossary?: boolean }) {
  const layers: ControlRow[] = file.groups.map((g) => ({ kind: 'layer', id: g.id, label: g.name, color: g.color }));
  const legend: LegendItem[] = [
    ...file.groups.map((g) => ({ id: `group-${g.id}`, label: g.name, color: g.color, kind: 'fill' as const })),
    ...file.flows.map((f) => {
      const group = file.groups.find((g) => g.id === f.group);
      return { id: `flow-${f.id}`, label: group?.name ?? f.id, color: f.color, kind: 'arrow' as const };
    }),
  ];
  return (
    <div className="atlas-overlay-card space-overlay">
      <ControlPanel layers={layers} tools={glossary ? TOOLS_GLOSSARY : TOOLS} legend={legend} />
    </div>
  );
}
