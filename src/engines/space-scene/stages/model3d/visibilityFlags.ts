/** Constant work per draw piece, independent of its vertices/materials.
 * Keep simulation visibility a gate over the unchanged opaque/fade state.
 */
export interface VisibilityObject { visible: boolean; castShadow: boolean; isLineSegments?: boolean }
export function applyVisibilityFlags(
 objects: Iterable<VisibilityObject>, handle: { visible: boolean }, shown: boolean, labelled: boolean, cast: boolean,
): boolean {
 let changed=handle.visible!==(shown&&labelled);
 for(const object of objects){
  const shadow=cast&&!object.isLineSegments;
  if(object.visible!==shown){object.visible=shown;changed=true;}
  if(object.castShadow!==shadow)object.castShadow=shadow;
 }
 handle.visible=shown&&labelled;
 return changed;
}

/** Preserve the layer/isolate/aside decision underneath a simulation filter. */
export function gateSimulationVisibility(
 displays: Map<string, import('../../lib/visibility').PartDisplay>, hidden: ReadonlySet<string>, instantMode=false,
): Set<string> {
 const instant = new Set<string>();
 for (const id of hidden) {
  const display=displays.get(id);
  if (!display) continue;
  if (instantMode && display.visible) instant.add(id);
  displays.set(id,{...display,visible:false,selectable:false,selected:false});
 }
 return instant;
}

/** A binary filter never fades the retained material or compiles transparency. */
export function visibilityBaseOpacity(display: {visible:boolean;hidden:boolean;opacity:number}, instantHidden=false): number {
 return display.visible || display.hidden || instantHidden ? display.opacity : 0;
}
