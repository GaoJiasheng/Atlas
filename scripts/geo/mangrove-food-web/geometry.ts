/** CPU inspection of the exact authored surfaces. Mesh parts use the same
 * buffers exported to the local GLB; primitives use the engine tessellator. */
import { Box3 } from 'three';
import type { Part } from '../../../src/engines/space-scene/schema';
import { partBounds, partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { treeMeshes, meshPiece } from './tree-meshes';
const meshes=treeMeshes();
type GeometryPart=Pick<Part,'id'|'mesh'|'primitive'|'extra'|'repeat'|'material'>;
export function geometryPieces(part:GeometryPart){return part.mesh?[meshPiece(meshes.get(part.id)!.clone())]:partPieces(part);}
export function geometryBounds(part:GeometryPart){
 if(!part.mesh)return partBounds(part)!;
 const b=new Box3().setFromBufferAttribute(meshes.get(part.id)!.getAttribute('position') as import('three').BufferAttribute);
 return {min:b.min.toArray(),max:b.max.toArray()};
}
export function geometrySlots(part:GeometryPart){return part.primitive?partMaterialSlots(part):[part.material!];}
