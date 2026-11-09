/** Offline raster atlas: every delivered keyframe in both existing themes. */
import{readFileSync,writeFileSync}from'node:fs';import{feature}from'topojson-client';import sharp from'sharp';
const d=import.meta.dirname,root=`${d}/../../..`,read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const control=read(`${root}/src/content/topics/singapore-1819-1965/data/control.json`),land=read(`${root}/public/geo/land-sg-history.json`),manifest=read(`${d}/sources.json`);
const coasts=(feature(land,land.objects['land-sg-history'])as any).features;
const css=readFileSync(`${root}/src/theme/tokens.css`,'utf8');
const polys=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
for(const theme of ['paper','cinema']){
 const block=css.slice(css.indexOf(`:root[data-theme="${theme}"]`)).split('\n}')[0]!;
 const colors=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2]!.trim()]));
 const token=(name:string):string=>colors[name]!.startsWith('var(')?token(colors[name]!.slice(6,-1)):colors[name]!;
 const w=2400,h=3300,bits:string[]=[];
 for(const [i,k]of control.keyframes.entries()){
  const x=30+(i%4)*590,y=105+Math.floor(i/4)*520;
  const span=.46,scale=550/span,bounds=[103.585,1.225,104.045,1.49];
  const path=(f:any)=>polys(f).flatMap(p=>p.map(r=>r.map((p,j)=>`${j?'L':'M'}${(x+15+(p[0]!-bounds[0]!)*scale).toFixed(2)},${(y+105+(bounds[3]!-p[1]!)*scale).toFixed(2)}`).join(' ')+'Z')).join(' ');
  const era=manifest.pipeline.localLand.eras.find((e:any)=>(!e.from||k.t>=e.from)&&(!e.to||k.t<e.to));
  const coast=coasts.find((f:any)=>f.properties.id===era.id);
  const fc:any=feature(control.topology,control.topology.objects[k.object]);
  bits.push(`<text x="${x+15}" y="${y+28}" font-size="21">${k.object} · ${k.t} · ${era.id}</text><defs><clipPath id="v${i}"><rect x="${x}" y="${y+45}" width="575" height="440"/></clipPath></defs><g clip-path="url(#v${i})"><rect x="${x}" y="${y+45}" width="575" height="440" fill="${token('water')}"/><path d="${path(coast)}" fill="${token('land')}" fill-rule="evenodd" stroke="${token('ink')}" stroke-width=".85"/>`);
  for(const f of fc.features)bits.push(`<path d="${path(f)}" fill="${token('signal')}" fill-opacity=".10" fill-rule="evenodd" stroke="${token('ink')}" stroke-opacity=".45" stroke-width=".6"/>`);
  bits.push('</g>');
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${token('paper')}"/><g font-family="sans-serif" fill="${token('ink')}"><text x="45" y="52" font-size="29">ATLAS · 23 delivered keyframes · ${theme.toUpperCase()}</text><text x="45" y="88" font-size="18">Dated source coasts + actual control geometry · offline CPU raster · positions approximate / 位置为近似值</text>${bits.join('')}</g></svg>`;
 writeFileSync(`${d}/previews/${theme}-all-keyframes.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`${d}/previews/${theme}-all-keyframes.png`);
}
