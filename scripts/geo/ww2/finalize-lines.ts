/** Topic-local source-coverage masks after lib/lines.ts. All rectangles are selectors, not borders. */
import { mapshaper, readJson, writeJson, toFc } from '../lib/common';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
const file = 'scripts/geo/ww2/work/svg-lines.geojson';
const fc = readJson<FeatureCollection>(file);
const select=(name:string)=>toFc(fc.features.filter(f=>f.properties?.class===name));
const main=select('east-1944-dec');const pocket=select('courland-german');
if(main.features.length!==1||pocket.features.length!==1)throw new Error('Run lib/lines.ts first');
const replacements = new Map<string, FeatureCollection>();
replacements.set('east-1944-dec',await mapshaper('-i main.json pocket.json combine-files -erase target=main pocket',{main,pocket}));
// Map 27a covers the central/southern front. Its closure must not repaint Finnish Karelia.
// North of 60 N the dated monthly-map / Finnish-state steps supply the geometry instead.
const coverage=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[-15,42.5],[85,42.5],[85,60],[-15,60],[-15,42.5]]]}} as Feature<Polygon>]);
for(const cls of ['east-1943','east-1944-apr'])replacements.set(cls,await mapshaper('-i front.json coverage.json combine-files -clip target=front coverage',{front:select(cls),coverage}));
// CMH Greece must not colour the neighbouring Italian/Bulgarian occupation zones in Yugoslavia.
const provinces=readJson<FeatureCollection>('scripts/geo/ww2/raw/ne_10m_admin_1_states_provinces.geojson');
const greek=toFc(provinces.features.filter(f=>f.properties?.admin==='Greece'));
const greece=await mapshaper('-i greek.json -dissolve2',{greek});
replacements.set('greece-italian',await mapshaper('-i front.json greece.json combine-files -clip target=front greece',{front:select('greece-italian'),greece}));
writeJson(file,toFc([...fc.features.filter(f=>!replacements.has(String(f.properties?.class))),...Array.from(replacements).flatMap(([cls,value])=>value.features.map(f=>({...f,properties:{class:cls}})))]));
