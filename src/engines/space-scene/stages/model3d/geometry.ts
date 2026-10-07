/**
 * Build three.js geometry for `primitive` parts (docs/03 "搭积木").
 * `size` follows the schema (see PRIMITIVE_KINDS in ../../schema.ts).
 */
import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
} from 'three';
import type { Primitive } from '../../schema';

export function primitiveGeometry(p: Primitive): BufferGeometry {
  const [a = 1, b = a, c = b] = p.size;
  switch (p.kind) {
    case 'box':
      return new BoxGeometry(a, b, c);
    case 'cylinder':
      return new CylinderGeometry(a, b, c, 48, 1);
    case 'cone':
      return new ConeGeometry(a, b, 48, 1);
    case 'sphere':
      return new SphereGeometry(a, 48, 32);
    case 'torus':
      return new TorusGeometry(a, b, 24, 72);
    case 'capsule':
      return new CapsuleGeometry(a, b, 8, 32);
    case 'plane':
      return new PlaneGeometry(a, b);
  }
}
