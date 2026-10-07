import type { EngineDescriptor, EngineExtension } from './types';

/**
 * Engine-extension boundary: descriptors are generic over their own extension
 * `E` and data `D`; the registry erases both so the host can treat engines
 * uniformly. This is safe because the host only ever feeds an engine its own
 * defaults and its own (build-time parsed) data.
 */
export type AnyEngineDescriptor = EngineDescriptor<EngineExtension, unknown>;

export function defineEngine<E extends EngineExtension, D>(descriptor: EngineDescriptor<E, D>): AnyEngineDescriptor {
  return descriptor as unknown as AnyEngineDescriptor;
}
