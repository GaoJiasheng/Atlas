/** Topic data only; preserve existing prose, aliases and bilingual quoting. */
import fs from 'node:fs';
const root='src/content/topics/frog-and-chicken/chapters/';
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.mdx'))){
  let text=fs.readFileSync(root+file,'utf8');
  text=text.replace(/( +)position:\n\1- 0\n\1- 5\n\1- 6/g,'$1position:\n$1- -2.8\n$1- 5.5\n$1- 7.5');
  if(file==='02-the-changing-frog.mdx'){
    const pieces=text.split(/(?=^  - view:)/m);
    for(let i=0;i<pieces.length;i++)if(pieces[i]!.includes('The tail does not fall off.')){
      let beat=pieces[i]!;
      if(!beat.includes('    - frog-tray\n'))beat=beat.replace('    ghost: []','    - frog-eggs\n    - frog-tadpole\n    - frog-hind-legs\n    - frog-adult\n    - frog-marker\n    - frog-next-generation\n    - frog-tray\n    ghost: []');
      beat=beat.replace(/    camera:\n[\s\S]*?(?=    highlight:)/,'    camera:\n      position:\n      - -2.62\n      - 1.22\n      - 2.23\n      target:\n      - -3.46\n      - 0.49\n      - 1.132624\n      fov: 30\n');
      pieces[i]=beat;
    }
    text=pieces.join('');
  }
  fs.writeFileSync(root+file,text);
}
const file='scripts/geo/frog-and-chicken/editorial.json',d=JSON.parse(fs.readFileSync(file,'utf8'));
d.presets.find((p:{id:string})=>p.id==='frog-overview').camera.position=[-2.8,5.5,7.5];
fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
