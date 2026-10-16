/** Colour the union of within-frame adjacency graphs using the engine's holder tokens. */
import{readFileSync}from'node:fs';import{neighbors}from'topojson-client';import{writeJson}from'../lib/common';
const d='scripts/geo/warring-states',p='src/content/topics/warring-states/data';
const control=JSON.parse(readFileSync(`${p}/control.json`,'utf8')),entities=JSON.parse(readFileSync(`${p}/entities.json`,'utf8'));
const adj=new Map<string,Set<string>>(entities.map((e:any)=>[e.id,new Set<string>()]));
for(const obj of Object.values(control.topology.objects)as any[]){const gs=obj.geometries;const ns=neighbors(gs);ns.forEach((ls,i)=>ls.forEach(j=>{const a=gs[i].properties.holder,b=gs[j].properties.holder;if(a!==b){adj.get(a)?.add(b);adj.get(b)?.add(a);}}));}
const colors=new Map<string,number>();
while(colors.size<adj.size){const left=[...adj.keys()].filter(k=>!colors.has(k)).sort((a,b)=>{const sat=(k:string)=>new Set([...adj.get(k)!].map(x=>colors.get(x)).filter(x=>x!==undefined)).size;return sat(b)-sat(a)||adj.get(b)!.size-adj.get(a)!.size||a.localeCompare(b)});const id=left[0]!,used=new Set([...adj.get(id)!].map(x=>colors.get(x)));let c=1;while(used.has(c))c++;if(c>8)throw new Error(`more than8 holdercolors needed at ${id}`);colors.set(id,c);}
let conflicts=0;for(const[a,bs]of adj)for(const b of bs)if(colors.get(a)===colors.get(b))conflicts++;
if(conflicts)throw new Error(`${conflicts} adjacency conflicts`);
const css=readFileSync('src/theme/tokens.css','utf8'),palette:Record<string,string>={};for(const e of entities){const c=colors.get(e.id)!;e.color=`token:holder-${c}`;palette[e.id]=new RegExp(`--holder-${c}:\\s*(#[0-9a-fA-F]+)`).exec(css)![1]!;}
writeJson(`${p}/entities.json`,entities,true);writeJson(`${d}/check-colors.json`,palette,true);
writeJson(`${d}/color-audit.json`,{method:'DSATUR greedy colouring of within-frame shared-arc adjacency, union across all11frames',conflicts,colors:Object.fromEntries(colors),adjacency:Object.fromEntries([...adj].map(([k,v])=>[k,[...v].sort()]))},true);
console.log(`${entities.length} entities; ${new Set(colors.values()).size} holder tokens; adjacency conflicts ${conflicts}`);
