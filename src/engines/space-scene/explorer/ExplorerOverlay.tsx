/** Stage overlay: group (layer) toggles and a colour key of the groups. */
import { useSceneContext } from '../../core/context';
import { SceneLayerToggles, type LayerItem } from '../../widgets/LayerToggles';
import { Legend, type LegendItem } from '../../widgets/Legend';
import type { PartsFile } from '../schema';

export function ExplorerOverlay({ file }: { file: PartsFile }) {
  const { locale } = useSceneContext();
  if (file.groups.length === 0) return null;
  const layers: LayerItem[] = file.groups.map((g) => ({ id: g.id, label: g.name, color: g.color }));
  const legend: LegendItem[] = [
    ...file.groups.map((g) => ({ id: `group-${g.id}`, label: g.name, color: g.color, kind: 'fill' as const })),
    ...file.flows.map((f) => {
      const group = file.groups.find((g) => g.id === f.group);
      return { id: `flow-${f.id}`, label: group?.name ?? f.id, color: f.color, kind: 'arrow' as const };
    }),
  ];
  return (
    <div className="atlas-overlay-card space-overlay">
      <SceneLayerToggles items={layers} />
      <Legend items={legend} locale={locale} />
    </div>
  );
}
