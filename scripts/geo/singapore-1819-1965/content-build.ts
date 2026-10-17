import fs from 'node:fs';
import path from 'node:path';
import { chapters } from './content-chapters';
import { rows } from './content-events';
import { routes } from './content-routes';
const root = process.cwd(), local = path.join(root,'scripts/geo/singapore-1819-1965'), topic=path.join(root,'src/content/topics/singapore-1819-1965');
const bi = (en:string) => ({en,zh:`【待译】${en}`});
const read = (p:string) => JSON.parse(fs.readFileSync(p,'utf8'));
const write = (p:string,data:any) => {fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');};
const sources:any[]=[];
for(const s of read(path.join(local,'content-source-read.json'))) sources.push({id:s.id,text:bi(`National Library Board, BiblioAsia: ${s.title}`),url:s.url,note:bi(`Read accessible article text on 17 October 2026 (HTTP ${s.status}); local evidence text content-${s.id}.txt. Only the passages used in the English draft were relied upon; the article's bibliography is not represented as separately read.`)});
const keyId:Record<string,string> = {'census-nlb':'S4','landing-nlb':'S6',buckley:'S7','town-letter':'S8','ri-1823':'S9','mutiny-nlb':'S57','1854-nlb':'S58','convicts-2015':'S50','convicts-2021':'S59','hertogh-nlb':'S151','hertogh-sg101':'S152','hock-lee-nlb':'S153','schools-nlb':'S154','schools-roots':'S155','riots1964-nlb':'S156','macdonald-nlb':'S157','cabinet1959-iseas':'S158','sarawak-limbang':'S60','borneo-dfat':'S159',leyden:'S10','gold-nlb':'S11','stone-nhb':'S12','proclamation-nas':'S160'};
const evidence=read(path.join(local,'research/evidence.json'));
let next=175;
const reserved=new Set(['S161','S165','S190','S191','S192','S193','S194','S195','S200','S201','S202',...read(path.join(local,'content-extra-sources.json')).map((s:any)=>s.id)]);
for(const e of evidence.sources.filter((e:any)=>!e.key.startsWith('ww2-')&&!e.key.startsWith('content-')&&e.key!=='horsburgh')) {
 let id=keyId[e.key];
 if(!id){while(sources.some(s=>s.id===`S${next}`)||reserved.has(`S${next}`))next++;id=keyId[e.key]=`S${next++}`;}
 const entry={id,text:bi(e.title),url:e.url,note:bi(`Read: ${e.read}${e.quote?` Short evidence quotation: “${e.quote}”.`:''} Scope and unresolved differences are recorded in RESEARCH.md.`)};
 const i=sources.findIndex(s=>s.id===id);if(i>=0)sources[i]=entry;else sources.push(entry);
}
sources.push({id:'S200',text:bi('Approved Singapore 1819–1965 content specification, docs/28, sections 1–2'),note:bi('Read the supplied specification in full. This entry identifies an authorised draft event or map anchor, not independent historical corroboration. Rows relying only on this source are individually listed in content-gaps.json and must not be treated as verified evidence. No unresolved casualty quantity is supplied from memory.')});
sources.push({id:'S201',text:bi('James Horsburgh, The India Directory, fifth edition, volume I (1841)'),url:'https://archive.org/details/indiadirectoryor01hors',note:bi('Read public-domain OCR of sailing directions and named port/cape descriptions: printed pp. 38–78, 105–155 (Atlantic/Cape/Indian Ocean), 280–291 (Hoogly), 300–389 (Red Sea, Aden and Maculla), 541–547 (Ceylon/Galle), 586–596 (Coromandel/Madras). Corridors interpret sailing directions and offshore berths, not individual vessel tracks; exact page groups per route in content-route-sources.md. Public domain by author death 1836 and publication date.')});
sources.push({id:'S202',text:bi('James Horsburgh, The India Directory, fifth edition, volume II (1843)'),url:'https://archive.org/details/indiadirectoryor02hors',note:bi('Read public-domain OCR: pp. 62–65 (Achen/Great Channel), 90–113 (Sumatra/Marlborough), 145–177 (Sunda/Banca), 201–204 (Rhio), 218–281 (Malacca and Singapore straits, St John’s and Pedra Branca), 334–340 (Cochin-China/Condore), 349–352 (Hainan), 390–394 (Hong Kong approaches), 413–429 (China coast/Amoy), 473–477 (Canton–Pulo Aor passages), 539–550 (Macassar), 588–590 (Lubeck/Babian/Bawean). Paths are schematic corridors following named passages; positions between named marks interpret the printed bearings and berths. Not sailing advice. Public domain.')});
for(const e of read(path.join(local,'content-extra-sources.json')))sources.push({id:e.id,text:bi(e.title),url:e.url,note:bi(e.read)});
const tok:Record<string,string> = {sevenhundred:'S1',farquhar:'S2',headcount:'S4',convicts:'S50',police:'S51','middle-road':'S52',onpaper:'S53',laws:'S150',hertogh:'S151',hocklee:'S153',schoolriots:'S155',julyriots:'S156',septriots:'S156',macdonald:'S157',riots1854:'S58',mutiny:'S57',emergency:'S166',election1959:'S190',referendum:'S193',merger:'S191',konfrontasi:'S191',yusof:'S194',election1948:'S195',election1955:'S195',selfgovernment:'S195'};
for(const [k,v] of Object.entries(keyId))tok[k]=v;
// Match subsequent research additions without falsely treating an absent source as read.
const aliases:Record<string,string[]> = {'election1959':['election1959','election-1959','elections-1959'],'referendum':['referendum1962','referendum-nlb','referendum-1962'],'selfgovernment':['self-government','selfgovernment','self-rule'],'yusof':['yusof','yusof-president','yusof-nlb'],'malaysia-agreement':['malaysia-1963','malaysia-agreement','malaysia-unts'],'coldstore':['coldstore-hansard','coldstore','coldstore-nlb'],'postwar':['law-nas','law-land-nas','law-land','postwar'],'cabinet1965':['cabinet1965','cabinet1965-nas']};
for(const [k,keys] of Object.entries(aliases)){const found=keys.find(k=>keyId[k]);if(found)tok[k]=keyId[found]!;}
Object.assign(tok,{'sri-mariamman':'S70',jamae:'S71','thian-hock-keng':'S72',ttsh:'S73',armenian:'S74',causeway:'S75',reclamation:'S76',fms:'S77',postwar:'S198',pangkor:'S81',perak:'S83',johor1885:'S82',labuan:'S80',dindings:'S79',kreta:keyId['kreta-hansard'],'four-states':'S121','allied-raids':'S120',endau:'S101',hongkong:'S85',suez:'S86',docks:'S87',naning:'S84',malacca1825:'S84',marshall:keyId['marshall-nlb'],bahau:keyId['bahau-nlb']});
const resolve = (s:string) => s.replace(/@([a-zA-Z0-9-]+)/g,(_,key)=>tok[key]??'S200');
const ww=path.join(root,'src/content/topics/ww2/data');
const required=new Set(['singapore-naval-base','kota-bharu','singapore-air-raid-1941','johor-crossing','bukit-timah','bukit-chandu','alexandra-hospital','surrender-ford','sook-ching','double-tenth','singapore-ceremony','sook-ching-trial-1947']);
const copied=read(path.join(ww,'events.json')).filter((e:any)=>required.has(e.id)||(e.kind==='site'&&e.at[0]>103.5&&e.at[0]<104.2&&e.at[1]>1.1&&e.at[1]<1.6));
const copiedMoves=read(path.join(ww,'movements.json')).filter((m:any)=>['japan-malaya','japan-malaya-east','japan-malaya-patani'].includes(m.id));
const needed=new Set<string>(copied.flatMap((e:any)=>e.sources??[]));
for(const m of ['S95','S96','S97','S98','S99','S100','S101','S102','S103','S104','S107','S109','S166','S167'])needed.add(m);
for(const c of chapters)for(const m of c.body.matchAll(/s="(S\d+)"/g))if(!sources.some(s=>s.id===m[1]))needed.add(m[1]!);
for(const s of read(path.join(ww,'sources.json')).sources.filter((s:any)=>needed.has(s.id))) {
 if(sources.some(x=>x.id===s.id))throw new Error(`WW2 source collision ${s.id}`);
 // Preserve the original source's text, URL and any existing note exactly.
 sources.push({...s,...(!s.note?{note:bi(`Copied without changing source text from ww2 ${s.id}; read the corresponding local ww2 source record and chapters 07, 08 and 11. Upstream works are inherited citations, not claimed as freshly read in this session.`)}:{})});
}
const dateGaps:Record<string,string>=read(path.join(local,'content-date-gaps.json'));
const gapEvents:any[]=[];
const events=rows.map(([id,t,at,kind,title,key,description,until])=>{
 const sourceOverride:Record<string,string | undefined>={'site-sri-mariamman':'S70','site-masjid-jamae':'S71','site-thian-hock-keng':'S72','site-tan-tock-seng-1844':'S73','site-armenian-church':'S74','fms-1896':'S77','chinese-protectorate':keyId['protectorate-nlb'],'anglo-siamese-treaty':keyId.treaty1909,'first-president-1965':'S194','straits-settlements-1826':keyId['law-nas'],'capital-to-singapore':keyId['law-nas'],'crown-colony-1867':keyId['law-nas'],'merdeka-1957':'S191','independence-agreement-1965':keyId['separation-agreement'],'first-cabinet-1965':keyId['cabinet1965-st'],'census-1931':keyId['sit-census']};
 const src=sourceOverride[id]??tok[key]??'S200',unverified=src==='S200',dateGap=dateGaps[id];
 const anchor='Map anchor approximate; original site/precise location unverified. The coordinate is a draft orientation anchor, not a newly verified historical position.';
 gapEvents.push({id,sourceKey:key,sourceId:src,historicalClaim:unverified?'approved-spec draft only; independent corroboration not read':'source read; precise scope/date may still be disputed',anchorStatus:anchor,datePrecision:t.length===10?'day':t.length===7?'month':'year',date:t,dateVerification:dateGap??'Read-source chronology; consult RESEARCH.md for scope and conflicting accounts'});
 const e:any={id,t,at,kind,importance:kind==='site'?1:3,title:bi(title),summary:bi(description),detail:bi(`${description} ${anchor}${dateGap?` Date evidence gap: ${dateGap}`:''}${unverified?' Independent historical corroboration for this draft entry remains unverified.':''}`),sources:id==='hussein-brought-from-riau'?['S6','S7']:id==='riots-1854'?['S58',keyId['buckley-II']]:[src]};
 if(dateGap&&!e.sources.includes('S200'))e.sources.push('S200');
 if(until)e.until=until;
 if(kind==='bombing')e.sides=id==='macdonald-house-1965'?{attacker:'indonesia',defender:'malaysia'}:{attacker:'usa',defender:'japan'};
 return e;
});
events.push(...copied);
const routeCheck=read(path.join(local,'content-route-check.json')).results;
const activeRoutes=routes.filter(r=>!r.draftOnly&&routeCheck.find((c:any)=>c.id===r.id)?.shoreCrossings===0&&routeCheck.find((c:any)=>c.id===r.id)?.landSamples.length===0);
const movements=activeRoutes.map(r=>({id:r.id,from:r.from,to:r.to,linger:r.linger,holder:r.holder,kind:'sea',label:bi(r.label),path:{type:'LineString',coordinates:r.points}}));
movements.push(...copiedMoves);
const names: [string, string, string][]=[['eic','East India Company','1819-01-28'],['johor','Johor','1819-01-28'],['netherlands','Netherlands','1819-01-28'],['european-town','European Town (1822 plan)','1823-06-09'],['chinese-kampong','Chinese Kampong (1822 plan)','1823-06-09'],['chulia-kampong','Chulia Kampong (1822 plan)','1823-06-09'],['bugis-kampong','Bugis Kampong (1822 plan)','1823-06-09'],['arab-kampong','Arab Kampong (1822 plan)','1823-06-09'],['kampong-glam','Sultan’s Kampong (1822 plan)','1823-06-09'],['government-hill','Government Hill (1822 plan)','1823-06-09'],['cantonment','Cantonment (1822 plan)','1823-06-09'],['straits-settlements','Straits Settlements','1826'],['fms','Federated Malay States','1896-07-01'],['kedah','Kedah','1896-07-01'],['perlis','Perlis','1896-07-01'],['kelantan','Kelantan','1896-07-01'],['terengganu','Terengganu','1896-07-01'],['siam','Siam / Thailand','1896-07-01'],['sarawak','Sarawak','1896-07-01'],['north-borneo','North Borneo','1896-07-01'],['brunei','Brunei','1896-07-01'],['japan','Japan','1941-12-08'],['bma','British Military Administration','1945-09-12'],['malayan-union-government','Malayan Union','1946-04-01'],['federation-of-malaya','Federation of Malaya','1948-02-01'],['singapore','Singapore','1946-04-01'],['malaysia','Malaysia','1963-09-16'],['indonesia','Indonesia','1963'],['uk','United Kingdom','1819-01-28'],['usa','United States','1944'],['australia','Australia','1941-12-08']];
const entities=names.map(([id,name,joined],i)=>({id,name:bi(name),joined,bloc:'neutral',color:`token:holder-${i%8+1}`}));
const termRows: [string, string, string, string][]=[
 ['orang-laut','Orang Laut','Maritime communities of the Malay world living along coasts and on boats; some served Malay rulers as navigators, rowers and patrol forces.','temenggong'],
 ['temenggong','Temenggong','A senior office in the Johor Sultanate concerned with security and maritime communities. Abdul Rahman held the office in Singapore in 1819.','orang-laut'],
 ['free-trade-port','Free port','A port without ordinary import or export duties. Colonial Singapore raised revenue through other means, including monopolies.','revenue-farm'],
 ['revenue-farm','Revenue farm','A concession auctioned by a government, allowing a merchant to collect income from a specified monopoly or tax. In Singapore these included opium, alcohol and gambling.','free-trade-port'],
 ['straits-settlements-colony','Straits Settlements','The British administrative grouping formed in 1826 from Penang, Malacca and Singapore; later additions included Dindings and Labuan. It ended in 1946.','crown-colony'],
 ['crown-colony','Crown Colony','A colony administered directly by the British government rather than by the East India Company or British India. The Straits Settlements acquired this status in 1867.','straits-settlements-colony'],
 ['kampong','Kampong','Malay for a village or settlement. Colonial town plans also used the word for areas assigned to particular communities.',''],
 ['coolie','“Coolie”','A historical and now derogatory term for Asian manual workers, often recruited through labour agents. This topic uses the term only with historical explanation.','credit-ticket'],
 ['credit-ticket','Credit-ticket system','An arrangement in which an agent advanced a migrant’s travel costs and expected repayment through work after arrival. Debt could restrict the worker’s choices.','coolie'],
 ['kangany','Kangany system','A system in which an Indian foreman recruited workers through connections in India for employment, notably on plantations.',''],
 ['kongsi','Kongsi','A Chinese association that might organise mutual help, business or secret-society loyalties. Clan associations and secret societies were not identical organisations.',''],
 ['peranakan','Peranakan','Locally born communities whose family histories and cultures developed in the Malay world, often combining inherited and local languages and practices. The term is not limited to Chinese descendants.',''],
 ['resident','British Resident','An official appointed beside a Malay ruler whose advice was generally to be followed in administration, with exceptions for Malay religion and custom.','crown-colony'],
 ['self-rule','Self-government','Responsibility for domestic government exercised by Singapore’s elected ministry from 1959, while Britain retained responsibilities including defence and external relations.','merger-1963'],
 ['merger-1963','Merger','Singapore’s entry into Malaysia in 1963 with Malaya, Sabah and Sarawak. The terms were politically disputed.','self-rule'],
 ['konfrontasi','Confrontation (Konfrontasi)','Indonesia’s political and military campaign against the formation of Malaysia, beginning in 1963 and ending in 1966.','merger-1963'],
];
const glossary={terms:termRows.map(([id,term,definition,see])=>({id,term:bi(term),definition:bi(definition),...(see?{see:[see]}:{})}))};
const presets={presets:[['indian-ocean','Indian Ocean',[88,9],3.1],['straits','Straits',[102.5,2.5],6],['malaya','Malaya',[102.4,4.2],5.6],['malaysia-1963','Malaysia 1963',[109,4],4.8],['island','Singapore island',[103.82,1.36],10.2],['town','Town',[103.852,1.291],13.8]].map(([id,label,center,zoom])=>({id,label:bi(label as string),camera:{center,zoom}}))};
const beats=read(path.join(local,'content-spec-extract.json'));
const tables=read(path.join(local,'research/tables.json'));
const staged=path.join(local,'work/content-draft');
for(const [file,data] of Object.entries({entities,events,movements,presets,glossary,sources:{sources:sources.sort((a,b)=>+a.id.slice(1)-+b.id.slice(1))}}))write(path.join(staged,'data',`${file}.json`),data);
for(const c of chapters){
 const n=chapters.indexOf(c),b=beats.find((x:any)=>x.id===c.id).beats;
 // Keep the approved EN captions, except research-corrected chronology and the unavailable rail path.
 if(c.id==='separation') {b[1].t='1964-09-02';b[1].caption=bi(b[1].caption.en.replace('September 1964:','2 September 1964:'));b[4].caption=bi('22 December 1965: Parliament changes the head of state’s title to President; the law recognises Yusof Ishak retrospectively from independence.');}
 if(c.id==='british-malaya') b[4].highlight=['causeway-1924'];
 if(c.id==='town-life')b[3].caption=bi('By 1887: reclamation has changed the Telok Ayer waterfront; work on the wider scheme continues into the following decade.');
 if(c.id==='founding-1819') b[3].t='1819';
 const ids=new Set([...events.map(e=>e.id),...movements.map(m=>m.id),...entities.map(e=>e.id)]);
 for(const beat of b)if(beat.highlight)beat.highlight=beat.highlight.filter((id:string)=>ids.has(id));
 const state:any={time:c.time,camera:{center:c.camera.slice(0,2),zoom:c.camera[2]},layers:['base','control','movements','battles','sites'],highlight:b[0]?.highlight??[],summary:bi(c.summary),beats:b};
 if(c.id==='war-and-occupation')state.highlight=['bukit-chandu','surrender-ford'];
 if(n===0)state.note=bi('This draft follows Malay rulers, maritime communities, migrants, colonial officials, political organisations and both governments. Source records distinguish materials actually read from inherited ww2 citations and unverified draft entries. Conflicting quantities remain attributed. Map documentation records historical-coast methods and unresolved geometry; a plan division is not a map of every resident’s identity. Legends are identified as legends. English drafts await historian review; Chinese fields await independent authoring.');
 const fm={id:c.id,order:n,...(n===0?{kind:'background'}:{}),title:bi(c.title),sensitive:false,state};
 const more=c.more.map(([title,body])=>{
  if(c.id==='self-government'&&title==='The first ministry')body+='\n\n| Minister | Portfolio, June 1959 |\n|---|---|\n'+tables.cabinet1959.map((r:any)=>`| ${r.name} | ${r.portfolio} |`).join('\n')+'\n\nSource: the archival finding aid for the original ministry list (S158), rather than later appointments.';
  if(c.id==='separation'&&title==='Cabinet and citizenship')body+='\n\nThe Straits Times front page of 10 August reports the Cabinet reshuffle announced on 9 August. The ministerial list below preserves its contemporary portfolio names; later transfers must not be projected backwards.\n\n| Minister | Portfolio announced on 9 August |\n|---|---|\n'+tables.cabinet1965.map((r:any)=>`| ${r.name} | ${r.portfolio9AugustConfirmed} |`).join('\n')+'\n\nSources: the contemporary front-page report (@cabinet1965-st), checked against Lee’s noon press conference (@cabinet1965-noon), which explicitly names Goh’s defence and security portfolio. The original gazette appointment instruments and the date of the later transfer of Culture remain unverified.';
  return `<More title={${JSON.stringify(bi(title))}}>\n\n${resolve(body)}\n\n</More>`;}).join('\n\n');
 const figure=(id:string,alt:string)=>`<Figure src="figures/singapore-1819-1965-${id}" alt={${JSON.stringify(bi(alt))}} caption={${JSON.stringify(bi('Illustrative drawing made for this topic, based on the objects or building types discussed in this chapter; not a photograph or measured reconstruction.'))}} />`;
 const fig=c.figure?`\n\n${figure(c.figure,c.figureAlt!)}`:'';
 const extra=c.extraFigure?`\n\n${figure(c.extraFigure,'Interpretive elevations of a temple, mosque, Chinese temple hall and church; details are schematic.')}`:'';
 const english=`${resolve(c.body)}${fig}${extra}\n\n${more}`;
 const zh=english.replace(/(^|\n\n)(?!<)([^\n]+)/g,'$1【待译】$2').replace(/(^|\n\n)(?=<(?:TopicLink|Num|Term)\b)/g,'$1【待译】');
 fs.mkdirSync(path.join(staged,'chapters'),{recursive:true});
 fs.writeFileSync(path.join(staged,'chapters',`${String(n).padStart(2,'0')}-${c.id}.mdx`),`---\n${JSON.stringify(fm,null,2)}\n---\n\n<Lang en>\n\n${english}\n\n</Lang>\n\n<Lang zh>\n\n${zh}\n\n</Lang>\n`);
}
write(path.join(local,'content-gaps.json'),{note:'Draft anchors are copied from the approved spec where supplied; otherwise they are town-level orientation anchors explicitly marked approximate. No anchor is claimed as a newly verified site. All non-WW2 event coordinates await Wikidata or georeferenced-map audit.',events:gapEvents,unresolvedSources:Object.entries(tok).filter(([,v])=>v==='S200'),rowsWithOnlySpecSource:gapEvents.filter(e=>e.sourceId==='S200').map(e=>e.id),unverifiedEventDates:dateGaps,withheldRoutes:routes.filter(r=>!activeRoutes.includes(r)).map(r=>({id:r.id,reason:r.draftOnly?'Later steamship service not corroborated by the earlier guide':'Route land check not yet passing',pages:r.pages})),missingRoutes:[{id:'causeway-rail',reason:'Requires georeferenced G11 railway trace; no OSM or guessed railway geometry substituted.'}],sourceKeys:keyId,copiedWW2Events:copied.map((e:any)=>e.id),copiedWW2Movements:copiedMoves.map((e:any)=>e.id),namespaceResolution:'Malayan Union holder renamed malayan-union-government so the exact required event id malayan-union remains unique.'});
fs.writeFileSync(path.join(local,'content-route-sources.md'),'# Movement routes\n\nNew sea lines are source-derived schematic sailing corridors, not individual vessel tracks. Recurring-corridor dates are editorial display windows. Company expedition dates come from the landing chronology. Offshore endpoints deliberately avoid implying a modern reclaimed waterfront. No strength is supplied for new corridors.\n\n| id | Status | Named waypoints | Read source |\n|---|---|---|---|\n'+routes.map(r=>`| ${r.id} | ${activeRoutes.includes(r)?'NE land check passed':'withheld'} | ${r.via} | Horsburgh ${r.pages} |`).join('\n')+'\n\nThe three Japanese campaign movements are exact local ww2 copies. Causeway railway is withheld until G11 is georeferenced and traced. The Suez route represents the maritime segment south of Suez; the 1841/1843 guide predates the canal and does not establish the London–Port Said service. No canal geometry is invented.\n');
if(process.argv.includes('--publish')){
 for(const file of ['entities','events','movements','presets','glossary','sources'])fs.copyFileSync(path.join(staged,'data',`${file}.json`),path.join(topic,'data',`${file}.json`));
 for(const file of fs.readdirSync(path.join(topic,'chapters')))if(file.endsWith('.mdx'))fs.unlinkSync(path.join(topic,'chapters',file));
 for(const file of fs.readdirSync(path.join(staged,'chapters')))fs.copyFileSync(path.join(staged,'chapters',file),path.join(topic,'chapters',file));
}
console.log(JSON.stringify({entities:entities.length,events:events.length,routes:movements.length,sources:sources.length,glossary:glossary.terms.length,chapters:chapters.length,published:process.argv.includes('--publish'),specOnlyEvents:gapEvents.filter(e=>e.sourceId==='S200').length}));
