/** Senses model disclosures live with the existing secondary PLATE readings. */
import { useScene, useSceneContext } from '../../core/context';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import { sensesExperiment, solveSenses } from '../lib/sim/senses';
import { useSimView } from './sim';
export function SensesNotes({ file }: { file: PartsFile }) {
  const { locale } = useSceneContext();
  const view = useSimView(file);
  const { exploded, layers } = useScene<SpaceSceneExt, { exploded: boolean; layers: string[] }>((s) => ({ exploded: s.view === 'exploded', layers: s.layers }));
  if (!view?.sim.senses) return null;
  const zh = locale === 'zh', s = view.sim.senses.sound;
  const quantities = solveSenses(view.sim.senses, view.values);
  const shown = (kind: 'paraxial-eye' | 'longitudinal-wave') => view.sim.overlays.some(o => o.kind === kind && (!o.group || layers.includes(o.group)) && (!o.when || (o.when.control ? view.values[o.when.control] : view.outputs[o.when.output!]) === o.when.is));
  const observingEye = view.card?.observe.some(id => {
    const output = view.sim.outputs.find(o => o.id === id);
    const experiment = sensesExperiment(output?.from ?? id);
    return experiment === 'eye-light' || experiment === 'eye-focus';
  }) ?? false;
  const eyeStudy = view.sim.overlays.some(o => o.kind === 'paraxial-eye' && (!o.group || layers.includes(o.group)));
  // A dark eye card still reports predicted geometry, so its disclosure must survive the light visibility condition.
  const eye = shown('paraxial-eye') || (observingEye && eyeStudy), wave = shown('longitudinal-wave');
  if (!eye && !wave) return null;
  const bench = view.sim.overlays.find(o => o.kind === 'paraxial-eye');
  const yScale = bench?.kind === 'paraxial-eye' ? bench.yScale : 1;
  return <div className="space-plate__sim" data-senses-notes="">
    {eye && <p>{zh ? '角膜与晶状体合并为有效透镜；接收面表示视网膜。课堂近轴示意，非活眼精确追迹。' : 'Effective cornea + lens; receiver = retina. Paraxial classroom model, not precise living-eye ray tracing.'}</p>}
    {eye && yScale > 1 && <p>{zh ? `高度竖向放大 ×${yScale}，示意；距离不放大。` : `Heights drawn ×${yScale} vertically, schematic; distances unscaled.`}</p>}
    {wave && <p>{zh ? `设定 ${view.values[s.frequencyHz]} Hz · 显示 ${quantities['visual-hz']} Hz · ${s.slowFactor} 倍慢放；振幅表示相对位移。` : `Set ${view.values[s.frequencyHz]} Hz · displayed ${quantities['visual-hz']} Hz · ${s.slowFactor}× slower; amplitude means relative displacement.`}</p>}
    {eye && quantities['eye-state'] === 'dark' && <p>{zh ? '暗处：焦点读数仅为几何预测，没有光线或实际光像。' : 'Dark: focus readings are geometry predictions; no light rays or actual light image.'}</p>}
    {exploded && <p>{zh ? '拆开时隐藏光路和纵波示意。' : 'Optics and wave overlays are hidden while exploded.'}</p>}
  </div>;
}
