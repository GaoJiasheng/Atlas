/**
 * Camera helpers. Two shapes, told apart by their keys:
 *   GeoCamera   { center: [lng, lat], zoom, pitch?, bearing? }   (MapLibre)
 *   OrbitCamera { position: [x,y,z], target: [x,y,z], fov? }      (three.js)
 * URL form (`cam=`): comma-separated numbers.
 *   geo:   lng,lat,zoom[,pitch[,bearing]]   (3-5 numbers)
 *   orbit: px,py,pz,tx,ty,tz                (6 numbers)
 */
import type { CameraState, GeoCamera, OrbitCamera } from './types';

type Vec3 = [number, number, number];

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function isVec3(v: unknown): v is Vec3 {
  return Array.isArray(v) && v.length === 3 && v.every(isNum);
}

export function isGeoCamera(cam: unknown): cam is GeoCamera {
  if (!cam || typeof cam !== 'object') return false;
  const c = cam as Record<string, unknown>;
  return Array.isArray(c.center) && c.center.length === 2 && c.center.every(isNum) && isNum(c.zoom);
}

export function isOrbitCamera(cam: unknown): cam is OrbitCamera {
  if (!cam || typeof cam !== 'object') return false;
  const c = cam as Record<string, unknown>;
  return isVec3(c.position) && (c.target === undefined || isVec3(c.target));
}

/** Accept a camera from chapter frontmatter / URL and normalise it. */
export function normalizeCamera(cam: unknown): CameraState | null {
  if (isGeoCamera(cam)) {
    const out: GeoCamera = { center: [cam.center[0], cam.center[1]], zoom: cam.zoom };
    if (isNum(cam.pitch)) out.pitch = cam.pitch;
    if (isNum(cam.bearing)) out.bearing = cam.bearing;
    return out;
  }
  if (isOrbitCamera(cam)) {
    const [px, py, pz] = cam.position;
    const [tx, ty, tz] = cam.target ?? [0, 0, 0];
    const out: OrbitCamera = { position: [px, py, pz], target: [tx, ty, tz] };
    if (isNum(cam.fov)) out.fov = cam.fov;
    return out;
  }
  return null;
}

function round(n: number, digits: number): string {
  const s = n.toFixed(digits);
  // Trim trailing zeros: 1.3500 -> 1.35, 7.00 -> 7
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function encodeCamera(cam: CameraState): string {
  if (isGeoCamera(cam)) {
    const parts = [round(cam.center[0], 4), round(cam.center[1], 4), round(cam.zoom, 2)];
    if (cam.pitch !== undefined || cam.bearing !== undefined) parts.push(round(cam.pitch ?? 0, 1));
    if (cam.bearing !== undefined) parts.push(round(cam.bearing, 1));
    return parts.join(',');
  }
  return [...cam.position, ...cam.target].map((n) => round(n, 3)).join(',');
}

export function decodeCamera(raw: string): CameraState | null {
  const nums = raw.split(',').map((s) => (s.trim() === '' ? NaN : Number(s)));
  if (!nums.every(Number.isFinite)) return null;
  if (nums.length >= 3 && nums.length <= 5) {
    const [lng = 0, lat = 0, zoom = 0, pitch, bearing] = nums;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90 || zoom < 0 || zoom > 22) return null;
    const cam: GeoCamera = { center: [lng, lat], zoom };
    if (pitch !== undefined) cam.pitch = pitch;
    if (bearing !== undefined) cam.bearing = bearing;
    return cam;
  }
  if (nums.length === 6) {
    const [px = 0, py = 0, pz = 0, tx = 0, ty = 0, tz = 0] = nums;
    return { position: [px, py, pz], target: [tx, ty, tz] };
  }
  return null;
}
