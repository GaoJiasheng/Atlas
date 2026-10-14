import {spawnSync} from 'node:child_process';
import {readFile, mkdir, rm, stat, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import sharp from 'sharp';

const [name = 'home-landscape', path = '/', orientation = 'landscape'] = process.argv.slice(2);
const udid = process.env.ATLAS_SIMULATOR ?? 'ED7AC183-F9B7-4784-9DF3-C5394AB51952';
const out = resolve('scripts/anatomy/cache/ipad');
await mkdir(out, {recursive: true});
function simctl(args, env = process.env) {
  const r = spawnSync('xcrun', ['simctl', ...args], {encoding: 'utf8', env});
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return r.stdout.trim();
}
const container = simctl(['get_app_container', udid, 'pub.gavin.atlas', 'data']);
const report = `${container}/Documents/ipad-qa.json`;
await rm(report, {force: true});
let script = await readFile('scripts/ipad/inspect.js', 'utf8');
if (process.env.ATLAS_SPEECH_PROBE === '1') script = 'window.__ipadSpeechProbe = true;\n' + script;
simctl(['launch', '--terminate-running-process', udid, 'pub.gavin.atlas'], {...process.env,
  SIMCTL_CHILD_ATLAS_QA_PATH: path, SIMCTL_CHILD_ATLAS_QA_SCRIPT: script,
});
let found = false;
for (let i = 0; i < 55; i++) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (await stat(report).catch(() => null)) { found = true; break; }
}
if (!found) throw new Error('Simulator did not return inspection results in 55 seconds');
const result = JSON.parse(await readFile(report, 'utf8'));
await writeFile(`${out}/${name}.json`, JSON.stringify(result, null, 2) + '\n');
// simctl captures the fixed portrait framebuffer even after XCUIDevice rotation.
const raw = `${out}/${name}-raw.png`;
simctl(['io', udid, 'screenshot', raw]);
if (orientation === 'landscape') await sharp(raw).rotate(result.nativeOrientation === 4 ? 90 : -90).png().toFile(`${out}/${name}.png`);
else await sharp(raw).png().toFile(`${out}/${name}.png`);
console.log(JSON.stringify({name, url: result.url, viewport: result.viewport, ready: result.ready, errors: result.errors, images: result.images, remoteResources: result.remoteResources, blocked: result.blocked, speech: result.speech}));
const badAssets = Object.entries(result.assets ?? {}).filter(([, a]) => a.error || a.status !== 200 || a.bytes <= 0);
const wrongOrientation = orientation === 'landscape' ? result.viewport.width <= result.viewport.height : result.viewport.width >= result.viewport.height;
const wrongPath = path === '/' ? !/\/(en|zh)\/$/.test(new URL(result.url).pathname) : new URL(result.url).pathname + new URL(result.url).search !== path;
const fontErrors = result.fonts?.filter(f => f.status === 'error') ?? [];
const wrongDeviceOrientation = orientation === 'landscape' ? ![3, 4].includes(result.nativeOrientation) : result.nativeOrientation !== 1;
const query = new URL(result.url).searchParams;
const wrongSceneState = (query.has('ch') && result.state?.chapter !== query.get('ch')) || (query.has('b') && result.state?.beat !== Number(query.get('b')) - 1);
const speechFailed = process.env.ATLAS_SPEECH_PROBE === '1' && (result.speech?.length !== 2 || result.speech.some(s => !s.started || s.result !== 'end'));
if (!result.ready || result.errors.length || result.images.length || result.remoteResources.length || !result.blocked || !result.nativeHTTPBlocked || badAssets.length || wrongOrientation || wrongPath || fontErrors.length || wrongDeviceOrientation || wrongSceneState || speechFailed) {
  console.error(JSON.stringify({badAssets, wrongOrientation, wrongPath, fontErrors, wrongDeviceOrientation, wrongSceneState, speechFailed, nativeHTTPBlocked: result.nativeHTTPBlocked}));
  process.exitCode = 1;
}
