/**
 * Leader-label points for glb parts whose bounds centre is hidden inside another part
 * (`extras.labelPoint`, node-local, read by glbAnchor.ts). The roof-tank mesh includes its
 * downpipe, so its bounds centre sits inside the HDB block and the label would always be occluded.
 * Edits the JSON chunk only; geometry streams stay byte-identical.
 * Usage: pnpm tsx scripts/geo/water/label-points.ts  (rewrites public/models/water.glb in place)
 */
import fs from 'node:fs';

/** World-space label points: the top of the first roof tank. */
const LABEL_POINTS: Record<string, readonly [number, number, number]> = {
  'roof-tank': [0.24, 0.47, 0.549],
};

export function withLabelPoints(glb: Uint8Array): Buffer {
  const b = Buffer.from(glb);
  const jsonLength = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLength).toString().trimEnd());
  const bin = b.subarray(20 + jsonLength);
  for (const [name, world] of Object.entries(LABEL_POINTS)) {
    const node = json.nodes.find((n: { name?: string }) => n.name === name);
    if (!node) throw Error(`No glb node ${name}`);
    if (node.matrix || node.rotation) throw Error(`${name}: label points expect a translate + uniform scale node`);
    const t = node.translation ?? [0, 0, 0];
    const s = node.scale ?? [1, 1, 1];
    node.extras = { ...node.extras, labelPoint: world.map((v, i) => Number(((v - t[i]) / s[i]).toFixed(6))) };
  }
  let text = Buffer.from(JSON.stringify(json));
  text = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + text.length + bin.length, 8);
  header.writeUInt32LE(text.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  return Buffer.concat([header, text, bin]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = withLabelPoints(fs.readFileSync('public/models/water.glb'));
  if (out.length > 1_500_000) throw Error('GLB budget: ' + out.length);
  fs.writeFileSync('public/models/water.glb', out);
  console.log({ bytes: out.length });
}
