/** Narrow external JSON and indexed arrays before the topic scripts use them. */
import { readFileSync } from 'node:fs';
import type { ControlPoint } from '../lib/manifest';
export function readJson(path: string): unknown { return JSON.parse(readFileSync(path, 'utf8')) as unknown; }
export function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Expected a JSON object');
  return value as Record<string, unknown>;
}
export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Expected a JSON array');
  return value as unknown[];
}
export function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Expected a string');
  return value;
}
export function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Expected a finite number');
  return value;
}
export function pair(value: unknown): [number, number] {
  const values = array(value);
  if (values.length !== 2) throw new Error('Expected a coordinate pair');
  return [number(values[0]), number(values[1])];
}
export function required<T>(value: T | undefined, context: string): T {
  if (value === undefined) throw new Error(`Missing ${context}`);
  return value;
}
export function controlPoints(value: unknown): ControlPoint[] {
  return array(value).map((value) => {
    const point = object(value);
    return { name: string(point.name), lnglat: pair(point.lnglat), svg: pair(point.svg) };
  });
}

/** Narrow the geometry forms this topic actually supplies to the map pipeline. */
export function polygons(value: unknown): [number, number][][][] {
  const geometry = object(value);
  const polygon = (value: unknown) => array(value).map((ring) => array(ring).map(pair));
  if (geometry.type === 'Polygon') return [polygon(geometry.coordinates)];
  if (geometry.type === 'MultiPolygon') return array(geometry.coordinates).map(polygon);
  return [];
}
export function features(value: unknown): Record<string, unknown>[] {
  return array(object(value).features).map(object);
}

/** Guard the topology envelope and the polygon collections decoded by this topic. */
export function topology(value: unknown): Parameters<typeof import('topojson-client').feature>[0] {
  function isTopology(value: unknown): value is Parameters<typeof import('topojson-client').feature>[0] {
    const input = object(value);
    if (input.type !== 'Topology') return false;
    array(input.arcs).forEach((arc) => array(arc).forEach(pair));
    const geometry = (value: unknown): void => {
      const item = object(value);
      if (item.type === 'GeometryCollection') array(item.geometries).forEach(geometry);
      else if (item.type === 'Polygon') array(item.arcs).forEach((ring) => array(ring).forEach(number));
      else if (item.type === 'MultiPolygon') array(item.arcs).forEach((polygon) => array(polygon).forEach((ring) => array(ring).forEach(number)));
      else if (item.type === 'LineString') array(item.arcs).forEach(number);
      else if (item.type === 'MultiLineString') array(item.arcs).forEach((line) => array(line).forEach(number));
      else throw new Error(`Unsupported topic topology geometry ${String(item.type)}`);
    };
    Object.values(object(input.objects)).forEach(geometry);
    if (input.transform !== undefined) {
      const transform = object(input.transform);
      pair(transform.scale); pair(transform.translate);
    }
    return true;
  }
  if (!isTopology(value)) throw new Error('Expected a Topology');
  return value;
}
