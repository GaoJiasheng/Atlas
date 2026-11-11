/** Node-only PNG / JPEG decoding adapter. Geometry, material assignment, meshopt and
 * KHR_texture_transform remain the production GLTFLoader implementation. */
import sharp from 'sharp';
import { DataTexture, RGBAFormat, UnsignedByteType, RepeatWrapping, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
export async function parseShippingGLB(bytes: Uint8Array) {
  await MeshoptDecoder.ready;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.register(parser => ({
    name: 'ATLAS_node_image_decode',
    async loadTexture(index: number) {
      const definition = parser.json.textures[index], source = parser.json.images[definition.source];
      if (source.uri || source.bufferView === undefined || !['image/png', 'image/jpeg'].includes(source.mimeType)) throw new Error('Audit only accepts embedded PNG or JPEG images');
      const image = await parser.getDependency('bufferView', source.bufferView);
      const { data, info } = await sharp(Buffer.from(image)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const texture = new DataTexture(new Uint8Array(data), info.width, info.height, RGBAFormat, UnsignedByteType);
      texture.flipY = false; texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.magFilter = LinearFilter; texture.minFilter = LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true;
      parser.associations.set(texture, { textures: index });
      return texture;
    },
  }));
  return loader.parseAsync(bytes.slice().buffer as ArrayBuffer, '');
}
