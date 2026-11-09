/** Verify the built endpoint, including schema defaults, and copied GLB. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
const source=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/states-of-matter/data/parts.json')));
const built=JSON.parse(fs.readFileSync('dist/topics/states-of-matter/data.json')).parts;
assert.deepEqual(built,source,'Exported endpoint must match the production schema, including defaults');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash('public/models/states-of-matter.glb'),hash('dist/models/states-of-matter.glb'));
console.log('Built endpoint matches parsed source; copied GLB SHA-256 matches shipping asset');
