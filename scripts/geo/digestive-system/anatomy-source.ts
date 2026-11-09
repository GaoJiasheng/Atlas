/** Reconstruct the immutable anatomy input from its runtime BIN prefix.
 * Metadata is checked in once; the 2 MB anatomy is never duplicated in public.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {unpackGlb} from './append-glb';
export function anatomySource(){
 const manifest=JSON.parse(fs.readFileSync('scripts/geo/digestive-system/anatomy-source.json','utf8'));
 const runtime=unpackGlb(fs.readFileSync('public/models/digestive-system.glb'));
 const bin=runtime.bin.subarray(0,manifest.binBytes);
 if(createHash('sha256').update(bin).digest('hex')!==manifest.binSha256)throw new Error('Digestive source anatomy BIN changed');
 const raw=Buffer.from(JSON.stringify(manifest.json)),j=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(j);
 const out=Buffer.alloc(28+j.length+bin.length);
 out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(j.length,12);out.writeUInt32LE(0x4e4f534a,16);j.copy(out,20);out.writeUInt32LE(bin.length,20+j.length);out.writeUInt32LE(0x004e4942,24+j.length);bin.copy(out,28+j.length);return out;
}
