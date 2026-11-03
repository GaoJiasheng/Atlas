/** Lossless reader for NASA SVS's uncompressed, little-endian uint16 LOLA
 * TIFF. Avoids image colour-management converting elevations to 8-bit sRGB. */
export function readLolaTiff(bytes:Buffer):{data:Buffer;width:number;height:number;channels:1}{
  if(bytes.toString('ascii',0,2)!=='II'||bytes.readUInt16LE(2)!==42)throw new Error('Expected little-endian TIFF');
  const offset=bytes.readUInt32LE(4),count=bytes.readUInt16LE(offset),tags=new Map<number,number[]>();
  for(let i=0;i<count;i++){
    const p=offset+2+i*12,tag=bytes.readUInt16LE(p),type=bytes.readUInt16LE(p+2),n=bytes.readUInt32LE(p+4);
    if(type!==3&&type!==4)continue;
    const stride=type===3?2:4,at=n*stride<=4?p+8:bytes.readUInt32LE(p+8);
    tags.set(tag,Array.from({length:n},(_,j)=>stride===2?bytes.readUInt16LE(at+j*stride):bytes.readUInt32LE(at+j*stride)));
  }
  const value=(tag:number)=>tags.get(tag)?.[0];
  const width=value(256)!,height=value(257)!;
  if(value(258)!==16||value(259)!==1||(value(277)??1)!==1||!width||!height)throw new Error('Expected uncompressed single-channel uint16 LOLA TIFF');
  const offsets=tags.get(273)!,lengths=tags.get(279)!;
  const data=Buffer.concat(offsets.map((o,i)=>bytes.subarray(o,o+lengths[i]!)));
  if(data.length!==width*height*2)throw new Error('Incomplete LOLA strips');
  return {data,width,height,channels:1};
}
