import { z } from 'zod';
import { lngLat, vec3 } from './common';

/** Map camera (TimeScene / GeoStage, MapLibre semantics). */
export const geoCamera = z
  .object({
    center: lngLat,
    zoom: z.number().min(0).max(22),
    pitch: z.number().min(0).max(85).optional(),
    bearing: z.number().min(-360).max(360).optional(),
  })
  .strict();
export type GeoCamera = z.infer<typeof geoCamera>;

/** Orbit camera (SpaceScene / Model3DStage, three.js semantics, scene units). */
export const orbitCamera = z
  .object({
    position: vec3,
    target: vec3.default([0, 0, 0]),
    fov: z.number().min(10).max(120).optional(),
  })
  .strict();
export type OrbitCamera = z.output<typeof orbitCamera>;

export const cameraState = z.union([geoCamera, orbitCamera]);
export type CameraState = GeoCamera | OrbitCamera;
