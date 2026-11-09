/** Development-only Commons references. Never copied into public/. */
import fs from 'node:fs';
import sharp from 'sharp';
const specs=[
 ['Icecube.jpg','Editor at Large','CC BY-SA 2.5'],
 ['Cleaning sponge detail.jpg','Sylenius','CC BY-SA 3.0'],
 ['Éponge type 3 (2).jpg','Lionel Allorge','CC BY-SA 3.0'],
];
const root='scripts/geo/states-of-matter',refs=JSON.parse(fs.readFileSync(`${root}/references.json`));
for(const [title,author,license]of specs){const url=`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replaceAll(' ','_'))}`,html=await (await fetch(url,{headers:{'User-Agent':'Atlas-reference-study/1.0'}})).text(),image=html.match(/class="fullImageLink"[^>]*>\s*<a href="([^"]+)"/)?.[1]?.split('?')[0];if(!image)throw new Error(`No original URL: ${title}`);
 const path=`${root}/refs/${title.replaceAll(' ','-')}`;if(!fs.existsSync(path)){const response=await fetch(image,{headers:{'User-Agent':'Atlas-reference-study/1.0'}});if(!response.ok)throw new Error(`${title}: ${response.status}`);await sharp(Buffer.from(await response.arrayBuffer())).resize({width:960,withoutEnlargement:true}).jpeg({quality:94}).toFile(path);}
 const r={title,path,url,image,author,license};if(!refs.some(r=>r.title===title))refs.push(r);console.log(title);
}
fs.writeFileSync(`${root}/references.json`,JSON.stringify(refs,null,2)+'\n');
