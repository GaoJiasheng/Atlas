/** Compact glTF-Transform's replicated Int16 position bits before meshopt.
 * This retains the existing quantization grid: it does not quantize again.
 * Mesh node scales compensate the smaller normalized integer range. Call
 * after the encoder/decoder ready promises, on the separate-stream GLB bake.
 */
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

interface Accessor {
  bufferView: number; byteOffset?: number; componentType: number; type: string;
  count: number; normalized?: boolean; min?: number[]; max?: number[];
}
interface Compression {
  buffer: number; byteOffset?: number; byteLength: number; byteStride: number;
  count: number; mode: string; filter?: string;
}
interface BufferView {
  buffer: number; byteOffset?: number; byteLength: number; byteStride?: number;
  extensions?: { EXT_meshopt_compression?: Compression };
}
interface MeshNode {
  mesh?: number; children?: number[]; scale?: number[]; matrix?: number[];
}
interface Gltf {
  accessors: Accessor[]; bufferViews: BufferView[]; buffers: { byteLength: number }[];
  meshes: { primitives: { attributes: Record<string, number> }[] }[]; nodes: MeshNode[];
}

export function compressPosition(binary: Uint8Array, bits = 13): Uint8Array {
  if (!Number.isInteger(bits) || bits < 9 || bits > 16) throw new Error('Position bits must be an integer from 9 to 16');
  const source = Buffer.from(binary), jsonLength = source.readUInt32LE(12);
  if (source.readUInt32LE(0) !== 0x46546c67 || source.readUInt32LE(4) !== 2) throw new Error('Expected a glTF 2 binary');
  const json = JSON.parse(source.subarray(20, 20 + jsonLength).toString()) as Gltf;
  const bin = source.subarray(28 + jsonLength);
  const shift = 16 - bits, magnitudeBits = bits - 1, maxInteger = 2 ** magnitudeBits - 1;
  const compensation = 32767 / maxInteger;
  const positionViews = new Map<number, Accessor>();
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) {
    const accessor = json.accessors[primitive.attributes.POSITION!]!;
    const view = json.bufferViews[accessor.bufferView]!, extension = view.extensions?.EXT_meshopt_compression;
    if (accessor.componentType !== 5122 || !accessor.normalized || accessor.type !== 'VEC3'
      || (accessor.byteOffset ?? 0) !== 0 || !extension || extension.mode !== 'ATTRIBUTES'
      || extension.byteStride !== 8 || extension.count !== accessor.count || (extension.filter && extension.filter !== 'NONE')) {
      throw new Error('Position compaction requires a separate, normalized Int16 VEC3 meshopt stream');
    }
    const previous = positionViews.get(accessor.bufferView);
    if (previous && previous !== accessor) throw new Error('Position compaction requires one accessor per position bufferView');
    positionViews.set(accessor.bufferView, accessor);
  }
  // Scaling a node also scales its children. The authored bake has leaf mesh
  // nodes; reject a different hierarchy rather than silently moving children.
  for (const node of json.nodes) if (node.mesh !== undefined && node.children?.length) {
    throw new Error('Position compaction requires leaf mesh nodes');
  }
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (const [index, view] of json.bufferViews.entries()) {
    const extension = view.extensions?.EXT_meshopt_compression;
    let data: Uint8Array;
    if (extension) {
      if (extension.buffer !== 0) throw new Error('Position compaction requires embedded meshopt data in buffer 0');
      data = bin.subarray(extension.byteOffset ?? 0, (extension.byteOffset ?? 0) + extension.byteLength);
      const accessor = positionViews.get(index);
      if (accessor) {
        const decoded = new Uint8Array(extension.count * extension.byteStride);
        MeshoptDecoder.decodeGltfBuffer(decoded, extension.count, extension.byteStride, data, extension.mode, extension.filter);
        const values = new DataView(decoded.buffer);
        const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        for (let vertex = 0; vertex < extension.count; vertex++) for (let axis = 0; axis < 3; axis++) {
          const offset = vertex * extension.byteStride + axis * 2, original = values.getInt16(offset, true);
          const magnitude = Math.abs(original), compact = magnitude >> shift;
          // glTF-Transform fills unused low bits by replicating high bits.
          // Verify the caller supplied the actual existing precision so this
          // step cannot accidentally discard significant source bits.
          const replicated = shift ? (compact << shift) | (compact >> (magnitudeBits - shift)) : compact;
          if (magnitude !== replicated) throw new Error(`Position stream is not quantized to ${bits} replicated bits`);
          const value = Math.sign(original) * compact;
          values.setInt16(offset, value, true);
          min[axis] = Math.min(min[axis]!, value); max[axis] = Math.max(max[axis]!, value);
        }
        accessor.min = min; accessor.max = max;
        data = MeshoptEncoder.encodeGltfBuffer(decoded, extension.count, extension.byteStride, 'ATTRIBUTES');
      }
      extension.byteOffset = length; extension.byteLength = data.byteLength; extension.buffer = 0;
    } else {
      if (view.buffer !== 0) throw new Error('Position compaction requires embedded uncompressed data in buffer 0');
      data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
      view.byteOffset = length; view.buffer = 0;
    }
    chunks.push(data); length += data.byteLength;
    const padding = (4 - length % 4) % 4;
    if (padding) { chunks.push(new Uint8Array(padding)); length += padding; }
  }
  for (const node of json.nodes) if (node.mesh !== undefined) {
    if (node.matrix) {
      for (let i = 0; i < 12; i++) node.matrix[i] = node.matrix[i]! * compensation;
    } else node.scale = (node.scale ?? [1, 1, 1]).map(value => value * compensation);
  }
  json.buffers[0]!.byteLength = length;
  const jsonBytes = Buffer.from(JSON.stringify(json)), jsonPadding = (4 - jsonBytes.length % 4) % 4;
  const encodedJson = Buffer.concat([jsonBytes, Buffer.alloc(jsonPadding, 0x20)]);
  const result = Buffer.alloc(28 + encodedJson.length + length);
  result.writeUInt32LE(0x46546c67, 0); result.writeUInt32LE(2, 4); result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(encodedJson.length, 12); result.writeUInt32LE(0x4e4f534a, 16); encodedJson.copy(result, 20);
  result.writeUInt32LE(length, 20 + encodedJson.length); result.writeUInt32LE(0x004e4942, 24 + encodedJson.length);
  let offset = 28 + encodedJson.length;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
