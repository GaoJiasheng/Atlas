import {writeFileSync} from 'node:fs';
import {manifest,references} from './provenance';
for(const k of manifest.keyframes) for(const st of k.steps) st.src=references({from:st.from,clip:st.clip,minus:st.minus});
writeFileSync('scripts/geo/ww2/sources.json',JSON.stringify(manifest,null,2)+'\n');
