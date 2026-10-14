// Executed by the Debug-only simulator inspection hook in AtlasViewController.
const api = window.__atlas;
const ready = api ? await api.ready : document.querySelector('.home') !== null;
const errors = window.__ipadErrors || [];
const urls = performance.getEntriesByType('resource').map(r => r.name);
const assets = {};
for (const path of ['/topics/aircon/data.json', '/topics/ww2/data.json', '/topics/fractions/data.json', '/topics/muscles-chest/data.json', '/models/muscles-chest.glb', '/geo/land-50m.json', '/geo/land-10m-sea.json', '/geo/countries-50m.json', '/geo/borders-50m.json', '/illustrations/aircon.webp', '/illustrations/exercises/barbell-bench-press.webp']) {
  try {
    const r = await fetch(path);
    const bytes = (await r.arrayBuffer()).byteLength;
    assets[path] = {status: r.status, bytes, type: r.headers.get('content-type')};
  } catch (e) { assets[path] = {error: String(e)}; }
}
if ('speechSynthesis' in window) {
  for (let i = 0; i < 16 && speechSynthesis.getVoices().length === 0; i++) await new Promise(resolve => setTimeout(resolve, 500));
}
const voices = ('speechSynthesis' in window) ? speechSynthesis.getVoices().map(v => ({name: v.name, lang: v.lang, local: v.localService})) : [];
const observedErrors = [...errors];
const nativeHTTPBlocked = await window.Capacitor?.Plugins?.CapacitorHttp?.get({url: 'https://example.com/atlas-native-probe'}).then(() => false, () => true);
const blocked = await fetch('https://example.com/atlas-offline-probe').then(() => false, () => true);
const result = {
  nativeOrientation, url: location.href, title: document.title, ready, errors: observedErrors,
  viewport: {width: innerWidth, height: innerHeight, dpr: devicePixelRatio},
  safe: Object.fromEntries(['top', 'right', 'bottom', 'left'].map(k => [k, getComputedStyle(document.documentElement).getPropertyValue('--safe-' + k).trim()])),
  native: window.Capacitor?.isNativePlatform(), serviceWorkerAPI: 'serviceWorker' in navigator,
  state: api?.state(), stats: api?.stats(), assets,
  images: [...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && (!i.complete || i.naturalWidth === 0); }).map(i => i.currentSrc),
  fonts: [...document.fonts].map(f => ({family: f.family, status: f.status})),
  nativeHTTPBlocked,
  remoteResources: urls.filter(u => /^https?:/.test(u)), blocked, voices,
};
// Explicitly requested speech probe; requires a voice installed in the simulator OS.
if (window.__ipadSpeechProbe) {
  result.speech = [];
  for (const [lang, text] of [['en', 'Atlas is ready.'], ['zh', '图册已经准备好了。']]) {
    const voice = speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith(lang));
    if (!voice) { result.speech.push({lang, result: 'no-local-voice'}); continue; }
    result.speech.push(await new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text); u.voice = voice; u.lang = voice.lang;
      let started = false;
      const timer = setTimeout(() => { speechSynthesis.cancel(); resolve({lang, started, result: 'timeout'}); }, 8000);
      u.onstart = () => { started = true; };
      u.onend = () => { clearTimeout(timer); resolve({lang, started, result: 'end'}); };
      u.onerror = e => { clearTimeout(timer); resolve({lang, started, result: e.error}); };
      speechSynthesis.speak(u);
    }));
  }
}
return JSON.stringify(result);
