/** Minimal binary FBX control-point reader for an independent native-bbox check.
 * Polygon triangulation/render geometry remains Three's FBXLoader responsibility.
 * Original implementation: CC BY-SA 4.0. */
import {inflateSync} from 'node:zlib';
export function controlPoints(buffer){
  let offset=23;const version=buffer.readUInt32LE(offset);offset+=4;
  const uint=()=>{const v=version>=7500?Number(buffer.readBigUInt64LE(offset)):buffer.readUInt32LE(offset);offset+=version>=7500?8:4;return v;};
  function property(){
    const type=String.fromCharCode(buffer[offset++]);
    const scalar={Y:['readInt16LE',2],C:['readUInt8',1],I:['readInt32LE',4],F:['readFloatLE',4],D:['readDoubleLE',8],L:['readBigInt64LE',8]}[type];
    if(scalar){const v=Number(buffer[scalar[0]](offset));offset+=scalar[1];return v;}
    if(type==='S'||type==='R'){const n=buffer.readUInt32LE(offset);offset+=4;const value=buffer.subarray(offset,offset+n);offset+=n;return type==='S'?value.toString('utf8'):null;}
    const count=buffer.readUInt32LE(offset),encoding=buffer.readUInt32LE(offset+4),bytes=buffer.readUInt32LE(offset+8);offset+=12;
    const raw=buffer.subarray(offset,offset+bytes);offset+=bytes;
    if(!['f','d'].includes(type))return null;
    const decoded=encoding?inflateSync(raw):raw,step=type==='d'?8:4,method=type==='d'?'readDoubleLE':'readFloatLE';
    return Array.from({length:count},(_,i)=>decoded[method](i*step));
  }
  const vertices=new Map(),models=new Map(),connections=[];
  function node(parent){
    const end=uint(),count=uint();uint();const len=buffer[offset++],name=buffer.toString('utf8',offset,offset+len);offset+=len;
    if(!end)return;
    const props=Array.from({length:count},property);
    const context=name==='Geometry'?props[0]:parent;
    if(name==='Model')models.set(props[0],props[1]?.split('\0')[0]);
    if(name==='C')connections.push([props[1],props[2]]);
    if(name==='Vertices'&&context)vertices.set(context,props[0]);
    while(offset<end)node(context);
  }
  while(offset<buffer.length-176)node(null);
  const result=new Map();
  for(const[child,parent]of connections)if(vertices.has(child)&&models.has(parent))result.set(models.get(parent),vertices.get(child));
  return result;
}
