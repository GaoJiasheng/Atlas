/** Published sound acceptance; main session only: CI=1 ATLAS_E2E_PORT=5452 pnpm e2e. */
import { expect, test, type Page } from '@playwright/test';
type Values=Record<string,number|string|boolean>;
type Outputs=Record<string,number|string|null>;
type Echo={elapsedVisual:number;u:number;pathPosition:number;atReturn:boolean;playing:boolean;hiddenReason:string|null;physicalEchoMs:number|null;slowFactor:number};
type Senses={profile:string;eye?:unknown;wave:{positions:number[];rests:number[];phaseCycles:number;visualHz:number;A:number;lambda:number;active:boolean;playing:boolean;hiddenReason:string|null};sourceMarkers:Record<string,{phaseCycles:number;visualHz:number;on:number}>;soundLab:{echo:Echo}};
type Anchor={x:number;y:number;shown:boolean;onScreen:boolean};
type Engine={sim():{values:Values;outputs:Outputs;table:{vary:unknown;values:Outputs;controls?:Values}[]};senses():Senses;setSim(values:Values):boolean;apply(patch:object):boolean;sensesSeek(cycles:number):boolean;sensesEchoSeek(u:number):boolean;anchor(id:string):Anchor|null;freeStage():{x0:number;y0:number;x1:number;y1:number}|null};
const C=['00-before-you-start','01-vibrating-sources','02-a-medium-to-travel','03-pitch-and-frequency','04-loudness-and-amplitude','05-returning-sound','06-musical-instruments','07-noise-and-hearing-care'];
const senses=(page:Page)=>page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).senses());
const sim=(page:Page)=>page.evaluate(()=>(window.__atlas!.engine as unknown as Engine).sim());
const set=(page:Page,values:Values)=>page.evaluate(v=>(window.__atlas!.engine as unknown as Engine).setSim(v),values);
const apply=(page:Page,patch:object)=>page.evaluate(p=>(window.__atlas!.engine as unknown as Engine).apply(p),patch);
const card=(page:Page)=>page.locator('.space-try');
const seekWave=(page:Page,cycles:number)=>page.evaluate(c=>(window.__atlas!.engine as unknown as Engine).sensesSeek(c),cycles);
const seekEcho=(page:Page,u:number)=>page.evaluate(u=>(window.__atlas!.engine as unknown as Engine).sensesEchoSeek(u),u);
async function open(page:Page,ch:number,b?:number,locale='en',theme='paper'){
  await page.goto(`/${locale}/topics/sound/?theme=${theme}&ch=${C[ch]}${b?`&b=${b}`:''}`);
  await page.waitForFunction(()=>window.__atlas?.ready,null,{timeout:60_000});
  await expect.poll(async()=>(await senses(page)).profile).toBe('sound-only');
}
async function reveal(page:Page){const button=card(page).locator('[data-sim-reveal]');if(await button.count()) await button.click();}
async function axis(page:Page,ch:number,b:number){
  await page.locator(`.atlas-axis__tick[data-beat="${C[ch]}.${b-1}"]`).click();
  await expect.poll(()=>new URL(page.url()).searchParams.get('ch')).toBe(C[ch]);
  await expect.poll(()=>new URL(page.url()).searchParams.get('b')).toBe(String(b));
}
test.beforeEach(async({page})=>{await page.setViewportSize({width:1600,height:900});});

for(const locale of ['en','zh']) for(const theme of ['paper','cinema']){
  test(`${locale}/${theme}: silent bilingual model, hearing crosslink and complete chapter axis`,async({page})=>{
    const errors:string[]=[],external:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/^https?:/.test(r.url())&&!['127.0.0.1','localhost'].includes(new URL(r.url()).hostname)) external.push(r.url());});
    await open(page,0,1,locale,theme);
    await expect(page.locator('h1,.atlas-title').first()).toContainText(locale==='zh'?'声音':'Sound');
    await expect(page.locator(`a[href*="/${locale}/topics/eyes-and-ears/"]`).first()).toHaveAttribute('href',new RegExp(`/${locale}/topics/eyes-and-ears/`));
    await expect(page.locator('.atlas-axis__seg')).toHaveCount(8);await expect(page.locator('.atlas-axis__tick')).toHaveCount(32);
    for(const chapter of C) await expect(page.locator(`.atlas-axis__seg:has([data-chapter="${chapter}"]) .atlas-axis__tick`)).toHaveCount(4);
    await expect(page.locator('.space-try')).toHaveCount(0);expect((await senses(page)).eye).toBeUndefined();
    await axis(page,7,4);await expect.poll(async()=>(await senses(page)).wave.active).toBe(false);expect((await senses(page)).soundLab.echo.hiddenReason).toBe('condition');
    await expect(page.locator(`a[href*="/${locale}/topics/eyes-and-ears/"]`).last()).toHaveAttribute('href',new RegExp(`/${locale}/topics/eyes-and-ears/`));
    expect(errors).toEqual([]);expect(external).toEqual([]);
  });
}

test('vacuum leaves source enabled, hides the air strip and records null with its medium and state',async({page})=>{
  await open(page,2,1);await reveal(page);
  for(const [medium,speed,time] of [['air',340,100],['water',1500,68/3],['solid-example',5000,6.8]] as const){
    await set(page,{medium});await reveal(page);
    expect((await sim(page)).outputs['speed-mps']).toBe(speed);expect((await sim(page)).outputs['one-way-ms']).toBeCloseTo(time,9);
    if(medium!=='air') await expect.poll(async()=>(await senses(page)).wave.active).toBe(false);
    await card(page).locator('[data-sim-record]').click();
  }
  await set(page,{medium:'vacuum'});await reveal(page);
  expect((await sim(page)).outputs).toMatchObject({'speed-mps':null,'one-way-ms':null,'echo-ms':null,'source-drive':'amplitude-one','propagation-state':'no-medium'});
  expect((await sim(page)).values['sound-active']).toBe(true);
  await expect(card(page).locator('[data-sim-output="one-way-ms"] dd')).toHaveText('No transmission');
  await expect(card(page).locator('[data-sim-output="one-way-ms"] dd small')).toHaveCount(0);
  await expect(page.locator('.space-plate__reading').filter({hasText:'No transmission'}).first()).toBeVisible();
  await card(page).locator('[data-sim-record]').click();
  const rows=(await sim(page)).table;expect(rows).toHaveLength(4);
  expect(rows[3]!.values).toMatchObject({'one-way-ms':null,'propagation-state':'no-medium'});expect(rows[3]!.controls?.medium).toBe('vacuum');
  expect(await card(page).locator('svg').evaluateAll(nodes=>nodes.every(n=>!/NaN|Infinity/.test(n.outerHTML)))).toBe(true);
  await set(page,{medium:'air'});await card(page).locator('[data-sim-control="sound-active"] [role="switch"]').click();await reveal(page);
  expect((await sim(page)).outputs).toMatchObject({'speed-mps':340,'one-way-ms':null,'echo-ms':null,'source-drive':'off','propagation-state':'source-off'});
  await expect(card(page).locator('[data-sim-output="one-way-ms"] dd')).toHaveText('No transmission');
  await axis(page,3,1);expect((await sim(page)).values.medium).toBe('air');
  expect((await sim(page)).outputs['one-way-ms']).toBe(100);
});

test('source and wave share one phase; changing frequency preserves displacement and changing amplitude preserves pace',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await open(page,0,2);
  await apply(page,{run:false});
  // A seek before the first frame's clock sync is overwritten by it; seek again until it holds.
  await expect.poll(async()=>{await seekWave(page,.25);return (await senses(page)).wave.phaseCycles;}).toBe(.25);
  const local=await senses(page),markers=Object.values(local.sourceMarkers).filter(m=>m.on);
  expect(markers.length).toBeGreaterThan(0);
  for(const marker of markers){expect(marker.phaseCycles).toBe(local.wave.phaseCycles);expect(marker.visualHz).toBe(1);}
  await axis(page,3,1);await set(page,{'frequency-hz':500});
  await expect.poll(async()=>(await senses(page)).wave.phaseCycles).toBe(0);
  expect((await sim(page)).outputs).toMatchObject({'visual-hz':2,'displacement-max':.035,'wavelength-scene':.5,'speed-mps':340});
  await seekWave(page,.25);await expect.poll(async()=>(await senses(page)).wave.positions[0]).toBeCloseTo(-.035,9);
  await axis(page,4,2);expect((await sim(page)).outputs).toMatchObject({'visual-hz':1,'displacement-max':.07,'amplitude-level':2});
  await set(page,{'sound-active':false});
  await expect.poll(async()=>(await senses(page)).wave.positions[5]).toBe(.25);
  expect((await sim(page)).outputs['source-drive']).toBe('off');expect((await senses(page)).wave.playing).toBe(false);
});

test('authored wave snapshots survive reload and axis navigation discards the previous snapshot',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await open(page,1,4);
  await expect.poll(async()=>(await senses(page)).wave.phaseCycles).toBe(.25);
  await page.reload();await page.waitForFunction(()=>window.__atlas?.ready);
  await expect.poll(async()=>(await senses(page)).wave.phaseCycles).toBe(.25);
  await axis(page,3,3);await expect.poll(async()=>(await senses(page)).wave.phaseCycles).toBe(.25);
  expect((await sim(page)).values['frequency-hz']).toBe(500);
  await page.keyboard.press('.');await expect.poll(()=>new URL(page.url()).searchParams.get('b')).toBe('4');
  await expect.poll(async()=>(await senses(page)).wave.phaseCycles).toBe(0);
});

test('echo snapshots show a physical 200ms round trip and reset farther distance to the source',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await open(page,5,3);
  await expect.poll(async()=>(await senses(page)).soundLab.echo.u).toBe(1);
  const returned=(await senses(page)).soundLab.echo;
  expect(returned).toMatchObject({elapsedVisual:2,pathPosition:0,atReturn:true,playing:false,physicalEchoMs:200,slowFactor:10});
  await page.reload();await page.waitForFunction(()=>window.__atlas?.ready);
  await expect.poll(async()=>(await senses(page)).soundLab.echo.atReturn).toBe(true);
  await axis(page,5,4);await expect.poll(async()=>(await senses(page)).soundLab.echo.u).toBe(0);
  expect((await sim(page)).values['distance-m']).toBe(68);expect((await senses(page)).soundLab.echo.physicalEchoMs).toBe(400);
});

test('echo uses every outward and return endpoint and hides under water, vacuum, layer and exploded states',async({page})=>{
  await open(page,5,1);
  for(const [u,position] of [[0,0],[.25,.7],[.5,1.4],[.75,.7],[1,0]] as const){
    await seekEcho(page,u);await expect.poll(async()=>(await senses(page)).soundLab.echo.u).toBe(u);
    expect((await senses(page)).soundLab.echo.pathPosition).toBeCloseTo(position,9);
    expect((await senses(page)).soundLab.echo.elapsedVisual).toBeCloseTo(2*u,9);
  }
  for(const [distance,duration,wall] of [[17,1,1],[34,2,1.4],[68,4,2.2]] as const){
    // A new distance restarts the echo clock on the next frame; seek again until the seek outlives that restart.
    await set(page,{'distance-m':distance});
    await expect.poll(async()=>{await seekEcho(page,.5);return (await senses(page)).soundLab.echo.pathPosition;}).toBeCloseTo(wall,9);
    expect((await senses(page)).soundLab.echo.elapsedVisual).toBe(duration/2);
  }
  await set(page,{medium:'water'});await expect.poll(async()=>(await senses(page)).soundLab.echo.hiddenReason).toBe('medium');
  await set(page,{medium:'vacuum'});await expect.poll(async()=>(await senses(page)).soundLab.echo.hiddenReason).toBe('no-medium');
  expect((await sim(page)).outputs['echo-ms']).toBeNull();
  await set(page,{medium:'air'});await apply(page,{layers:[]});await expect.poll(async()=>(await senses(page)).soundLab.echo.hiddenReason).toBe('layer');
  await apply(page,{layers:['reflection'],view:'exploded',explode:1});
  await expect.poll(async()=>(await senses(page)).soundLab.echo.hiddenReason).toBe('exploded');
  const held=(await senses(page)).soundLab.echo.u;
  await page.waitForTimeout(120);expect((await senses(page)).soundLab.echo.u).toBe(held);
});

test('pause resumes one round trip; a completed RUN starts again with the continuous wave hidden',async({page})=>{
  await open(page,5,1);await apply(page,{run:true});
  await expect.poll(async()=>(await senses(page)).soundLab.echo.u).toBeGreaterThan(.05);
  await apply(page,{run:false});await expect.poll(async()=>(await senses(page)).soundLab.echo.playing).toBe(false);
  const paused=(await senses(page)).soundLab.echo.u;await page.waitForTimeout(120);
  expect((await senses(page)).soundLab.echo.u).toBe(paused);
  await apply(page,{run:true});await expect.poll(async()=>(await senses(page)).soundLab.echo.u).toBeGreaterThan(paused);
  await seekEcho(page,1);await expect.poll(async()=>(await senses(page)).soundLab.echo.atReturn).toBe(true);
  await apply(page,{run:false});await apply(page,{run:true});
  await expect.poll(async()=>(await senses(page)).soundLab.echo.atReturn).toBe(false);
  await expect.poll(async()=>(await senses(page)).wave.playing).toBe(false);
});

test('phone reduced motion keeps snapshots still, supports touch controls and preserves a single chapter axis',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,5,3,'zh','cinema');
  const echo=(await senses(page)).soundLab.echo;expect(echo.u).toBe(1);expect(echo.playing).toBe(false);
  await page.waitForTimeout(120);expect((await senses(page)).soundLab.echo.u).toBe(echo.u);
  await page.getByRole('button',{name:'阅读',exact:true}).click();await reveal(page);
  const button=card(page).locator('[data-sim-control="distance-m"] button').last();
  await button.scrollIntoViewIfNeeded();const box=(await button.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
  await button.click();expect((await sim(page)).values['distance-m']).toBe(68);
  await expect(page.locator('.atlas-axis')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('focused wave and far echo references remain inside the free stage band',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [chapter,beat,ids] of [[3,3,['wave-reference','receiver']],[5,4,['reflector-far','echo-receiver']]] as const){
    await open(page,chapter,beat);
    await expect.poll(async()=>page.evaluate(ids=>{
      const e=window.__atlas!.engine as unknown as Engine,f=e.freeStage();
      return !!f&&ids.every(id=>{const a=e.anchor(id);return !!a&&a.shown&&a.onScreen&&a.x>=f.x0&&a.x<=f.x1&&a.y>=f.y0&&a.y<=f.y1;});
    },[...ids]),{timeout:15_000}).toBe(true);
  }
});
