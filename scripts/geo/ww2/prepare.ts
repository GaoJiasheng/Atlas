/** Build-time input cache only. No app dependencies or runtime requests. */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,renameSync,unlinkSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {manifest} from './provenance';
mkdirSync('scripts/geo/ww2/raw',{recursive:true});
const inputs: any[]=[];
for(const [id,ds] of Object.entries(manifest.datasets) as [string,any][]){
 const path='scripts/geo/ww2/raw/'+ds.file;
 if(!existsSync(path)){
  const partial=path+'.part';
  execFileSync('curl',['--fail','--location','--retry','2','--max-time','180','--user-agent','AtlasMapProvenance/1.0',ds.url,'--output',partial],{stdio:'inherit'});
  if(/^pd-\d+\.png$/.test(ds.file)){
   const meta=await sharp(partial).metadata();if(meta.width!==1400)throw new Error(id+': expected registered 1400-pixel USMA rendition');
   await sharp(partial).png().toFile(path);unlinkSync(partial);
  }else renameSync(partial,path);
 }
 if(/\.(png|jpg|svg)$/i.test(ds.file)){const meta=await sharp(path,{limitInputPixels:false}).metadata();if(!meta.width||!meta.height)throw new Error('Invalid image '+id);}
 const bytes=readFileSync(path);if(ds.file.endsWith('.pdf')&&bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Invalid PDF '+id);inputs.push({id,ref:ds.ref,url:ds.url,file:ds.file,license:ds.license,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
writeFileSync('scripts/geo/ww2/input-checksums.json',JSON.stringify({date:'2026-11-09',normalization:'USMA w=1400 server renditions decoded to PNG, no cropping or redrawing; all registration coordinates refer to these images',inputs},null,2)+'\n');
console.log(`${inputs.length} source files verified; input-checksums.json written.`);
