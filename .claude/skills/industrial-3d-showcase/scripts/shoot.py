"""Playwright QA driver for technical-plate 3D showcase pages.

Serves the page's directory on localhost, drives it through the window.__showcase
test API (see assets/starter.html), and reports console errors, renderer stats,
keyboard/button sync, HUD layout collisions and frame timing.

  python3 shoot.py proj/thing.html                     # one shot per preset + per mode -> proj/shots/
  python3 shoot.py proj/thing.html hero flow           # only these shots
  python3 shoot.py proj/thing.html --size 3840x2160 --suffix _4k
  python3 shoot.py proj/thing.html --shots shots.json  # custom shot list (format below)
  python3 shoot.py proj/thing.html --keys              # every key toggles state and the matching button
  python3 shoot.py proj/thing.html --layout            # HUD overlap / overflow at several viewport sizes
  python3 shoot.py proj/thing.html --perf --size 3840x2160 --json proj/reports/perf-4k.json
  python3 shoot.py proj/thing.html --gpu               # forced-sync GPU cost per shot (benchSync)

shots.json:
  {"hero": {"preset": "hero"},
   "flow": {"preset": "section", "modes": {"flow": true}, "wait": 1500},
   "hero-clean": {"preset": "hero", "hud": false},
   "cut-40": {"preset": "hero", "js": "window.__showcase.setCutaway(40)"},
   "pres_24": {"presentation": 24.0}}
  "js" runs after preset/modes for page-specific setters (setCutaway above is an example, not part of the API contract).

Exit code 1 if any console error / page error, failed key check or layout collision is found.
"""
import argparse
import asyncio
import functools
import http.server
import json
import socketserver
import statistics
import sys
import threading
from pathlib import Path

from playwright.async_api import async_playwright

GPU_ARGS = ["--enable-gpu", "--ignore-gpu-blocklist"] + (["--use-angle=metal"] if sys.platform == "darwin" else [])
UNCAPPED_ARGS = ["--disable-gpu-vsync", "--disable-frame-rate-limit"]
LAYOUT_SIZES = [(3840, 2160), (2560, 1440), (1920, 1080), (1280, 720), (900, 1200), (390, 844)]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class Server(socketserver.ThreadingTCPServer):
    request_queue_size = 128   # default backlog (5) resets parallel ES-module loads


def serve(root):
    handler = functools.partial(QuietHandler, directory=str(root))
    httpd = Server(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


class Page:
    def __init__(self, args, port):
        self.args, self.port, self.logs = args, port, []
        self.api = "window." + args.api

    async def open(self, p, size, extra_args=()):
        w, h = size
        self.browser = await p.chromium.launch(headless=True, args=GPU_ARGS + list(extra_args))
        self.page = await self.browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        self.page.on("console", lambda m: self.logs.append((m.type, m.text)) if m.type in ("error", "warning") else None)
        self.page.on("pageerror", lambda e: self.logs.append(("pageerror", str(e))))
        await self.page.goto("http://127.0.0.1:%d/%s" % (self.port, self.args.rel))
        try:
            await self.page.wait_for_function("%s !== undefined" % self.api, timeout=60000)
        except Exception:
            self.report_logs()
            raise SystemExit("test API %s never appeared — is the page exposing it?" % self.api)
        await self.page.evaluate("%s.ready" % self.api)
        await self.page.wait_for_timeout(600)
        self.baseline = await self.ev("%s.state().modes" % self.api)
        return self

    async def ev(self, js):
        return await self.page.evaluate(js)

    async def close(self):
        await self.browser.close()

    async def apply(self, spec):
        api = self.api
        if "presentation" in spec:
            await self.ev("%s.seekPresentation(%s)" % (api, json.dumps(spec["presentation"])))
        else:
            if await self.ev("typeof %s.setMode === 'function' && %s.modes().includes('presentation')" % (api, api)):
                await self.ev("%s.setMode('presentation', false)" % api)
            for k, v in self.baseline.items():
                await self.ev("%s.setMode(%s, %s)" % (api, json.dumps(k), json.dumps(v)))
            await self.ev("%s.setHud(%s)" % (api, json.dumps(spec.get("hud", True))))
            await self.ev("%s.setPaused(false)" % api)
            if spec.get("preset"):
                await self.ev("%s.setPreset(%s, {instant: true})" % (api, json.dumps(spec["preset"])))
            for k, v in spec.get("modes", {}).items():
                await self.ev("%s.setMode(%s, %s)" % (api, json.dumps(k), json.dumps(v)))
            if spec.get("js"):                      # any extra page-specific setter (slider value, pose, part focus)
                await self.ev(spec["js"])
        await self.page.wait_for_timeout(spec.get("wait", 700))

    async def stats(self):
        return await self.ev("(() => { const s = %s.stats(); delete s.frameTimes; return s; })()" % self.api)

    def report_logs(self):
        if not self.logs:
            print("console: clean (no errors / warnings)")
        for t, m in self.logs:
            print("[%s] %s" % (t, m[:400]))
        return any(t in ("error", "pageerror") for t, _ in self.logs)


async def default_shots(pg):
    presets = await pg.ev("%s.presets()" % pg.api)
    modes = await pg.ev("%s.modes()" % pg.api)
    first = presets[0]
    shots = {name: {"preset": name} for name in presets}
    for m in modes:
        if m == "presentation":
            continue
        on = not pg.baseline.get(m, False)
        shots[m if on else m + "-off"] = {"preset": first, "modes": {m: on}, "wait": 2400 if m in ("exploded", "reference") else 900}
    shots[first + "-clean"] = {"preset": first, "hud": False, "wait": 900}
    return shots


async def run_shots(args, port):
    async with async_playwright() as p:
        pg = await Page(args, port).open(p, args.size)
        shots = json.loads(Path(args.shots).read_text()) if args.shots else await default_shots(pg)
        names = args.names or list(shots)
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        for n in names:
            await pg.apply(shots[n])
            await pg.page.screenshot(path=str(out / ("%s%s.png" % (n, args.suffix))))
            st = await pg.stats()
            print("%-16s calls=%4d tris=%9d geo=%d tex=%d buf=%s" % (n, st["calls"], st["triangles"], st["geometries"], st["textures"], st["buffer"]))
        print("GPU:", (await pg.stats())["gpu"])
        print("shots ->", out)
        bad = pg.report_logs()
        await pg.close()
        return 1 if bad else 0


async def run_keys(args, port):
    async with async_playwright() as p:
        pg = await Page(args, port).open(p, args.size)
        api, fails = pg.api, []
        st = lambda: pg.ev("%s.state()" % api)
        btn_on = lambda attr, name: pg.ev("(() => { const b = document.querySelector('[data-%s=\"%s\"]'); return b ? b.classList.contains('on') : null; })()" % (attr, name))
        keymap = await pg.ev("%s.keymap()" % api)

        def press_name(k):
            return "Space" if k == " " else k

        for item in keymap:
            k, kind, name = item["key"], item["type"], item["name"]
            if kind == "preset":
                await pg.page.keyboard.press(press_name(k))
                await pg.page.wait_for_timeout(250)
                s, on = await st(), await btn_on("preset", name)
                ok = s["camera"] == name and on is True
                await pg.page.wait_for_timeout(1700)
            elif kind == "mode":
                before = (await st())["modes"][name]
                await pg.page.keyboard.press(press_name(k))
                await pg.page.wait_for_timeout(250)
                s, on = await st(), await btn_on("mode", name)
                ok = s["modes"][name] == (not before) and on == s["modes"][name]
                await pg.page.keyboard.press(press_name(k))
                await pg.page.wait_for_timeout(name in ("reference", "exploded") and 2200 or 300)
                ok = ok and (await st())["modes"][name] == before
            elif kind == "pause":
                before = (await st())["paused"]
                await pg.page.keyboard.press("Space")
                await pg.page.wait_for_timeout(200)
                ok = (await st())["paused"] != before
                await pg.page.keyboard.press("Space")
            elif kind == "hud":
                before = (await st())["hud"]
                await pg.page.keyboard.press(press_name(k))
                await pg.page.wait_for_timeout(200)
                ok = (await st())["hud"] != before
                await pg.page.keyboard.press(press_name(k))
            else:
                continue
            print("key %-6s %-8s %-14s %s" % (repr(k), kind, name, "OK" if ok else "FAIL"))
            if not ok:
                fails.append("%s:%s" % (kind, name))

        # drag on the canvas -> FREE camera, no preset button lit; then a preset reclaims control
        vw, vh = args.size
        await pg.page.mouse.move(vw * 0.5, vh * 0.45)
        await pg.page.mouse.down()
        await pg.page.mouse.move(vw * 0.5 + 120, vh * 0.45 + 20, steps=8)
        await pg.page.mouse.up()
        await pg.page.wait_for_timeout(250)
        s = await st()
        lit = await pg.ev("document.querySelectorAll('[data-preset].on').length")
        ok = s["camera"] == "free" and lit == 0
        print("drag -> camera=%s lit-presets=%d %s" % (s["camera"], lit, "OK" if ok else "FAIL"))
        if not ok:
            fails.append("drag")
        first = keymap[0]
        await pg.page.keyboard.press(first["key"])
        await pg.page.wait_for_timeout(1900)
        s = await st()
        ok = s["camera"] == first["name"]
        print("preset after free -> camera=%s %s" % (s["camera"], "OK" if ok else "FAIL"))
        if not ok:
            fails.append("reclaim")
        bad = pg.report_logs()
        print("FAILURES:", fails or "none")
        await pg.close()
        return 1 if (fails or bad) else 0


LAYOUT_JS = r"""
(() => {
  const W = innerWidth, H = innerHeight, out = [];
  const shown = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    for (let e = el; e; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) < 0.05) return false; return true; };
  const panels = [...document.querySelectorAll('[data-hud-panel]')].filter(shown).map(el => ({ id: el.id || el.className || el.tagName, r: el.getBoundingClientRect(), el }));
  const hit = (a, b, pad = 0) => a.left < b.right - pad && b.left < a.right - pad && a.top < b.bottom - pad && b.top < a.bottom - pad;
  for (const p of panels) {
    const r = p.r;
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.push(`off-screen: ${p.id} [${r.left|0},${r.top|0},${r.right|0},${r.bottom|0}]`);
  }
  for (let i = 0; i < panels.length; i++) for (let j = i + 1; j < panels.length; j++) {
    const a = panels[i], b = panels[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    if (hit(a.r, b.r, 1)) out.push(`overlap: ${a.id} × ${b.id}`);
  }
  const labels = [...document.querySelectorAll('.co')].filter(el => shown(el) && parseFloat(getComputedStyle(el).opacity) > 0.5);
  for (const l of labels) {
    const r = l.getBoundingClientRect();
    for (const p of panels) if (hit(r, p.r, 1)) out.push(`label over panel: "${l.textContent.trim().slice(0, 28)}" × ${p.id}`);
  }
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++)
    if (hit(labels[i].getBoundingClientRect(), labels[j].getBoundingClientRect(), 1)) out.push(`label × label: "${labels[i].textContent.trim().slice(0, 20)}" × "${labels[j].textContent.trim().slice(0, 20)}"`);
  if (document.documentElement.scrollWidth > W + 1) out.push(`horizontal overflow: ${document.documentElement.scrollWidth} > ${W}`);
  return out;
})()
"""


async def run_layout(args, port):
    async with async_playwright() as p:
        pg = await Page(args, port).open(p, LAYOUT_SIZES[0])
        presets = await pg.ev("%s.presets()" % pg.api)
        total = 0
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        for w, h in LAYOUT_SIZES:
            await pg.page.set_viewport_size({"width": w, "height": h})
            await pg.page.wait_for_timeout(500)
            for name in presets:
                await pg.apply({"preset": name, "wait": 1000})
                issues = await pg.ev(LAYOUT_JS)
                total += len(issues)
                print("%5dx%-5d %-12s %s" % (w, h, name, "OK" if not issues else ""))
                for i in issues:
                    print("    ", i)
            await pg.apply({"preset": presets[0], "wait": 900})
            await pg.page.screenshot(path=str(out / ("layout_%dx%d.png" % (w, h))))
        bad = pg.report_logs()
        print("LAYOUT ISSUES:", total)
        await pg.close()
        return 1 if (total or bad) else 0


async def run_perf(args, port):
    async with async_playwright() as p:
        results = {}
        for label, extra in (("vsync", ()), ("uncapped", UNCAPPED_ARGS)):
            pg = await Page(args, port).open(p, args.size, extra)
            shots = json.loads(Path(args.shots).read_text()) if args.shots else await default_shots(pg)
            for n in args.names or list(shots)[:3]:
                await pg.apply(shots[n])
                await pg.page.wait_for_timeout(2500 + int(args.seconds * 1000))
                st = await pg.ev("%s.stats()" % pg.api)
                ft = sorted(t for t in st.pop("frameTimes")[-int(args.seconds * 120):] if t > 0)
                mean = statistics.mean(ft)
                p99 = ft[max(0, int(len(ft) * 0.99) - 1)]
                results["%s/%s" % (label, n)] = dict(frames=len(ft), mean_ms=round(mean, 2), avg_fps=round(1000 / mean, 1),
                                                    p99_ms=round(p99, 2), low1_fps=round(1000 / p99, 1), **st)
                print(label, n, json.dumps(results["%s/%s" % (label, n)]))
            pg.report_logs()
            await pg.close()
        print("NOTE: vsync caps at the display rate; uncapped is noisy. Quote GPU FPS only if the renderer string is a real GPU.")
        if args.json:
            Path(args.json).parent.mkdir(parents=True, exist_ok=True)
            Path(args.json).write_text(json.dumps(results, indent=2))
        return 0


async def run_gpu(args, port):
    async with async_playwright() as p:
        pg = await Page(args, port).open(p, args.size)
        shots = json.loads(Path(args.shots).read_text()) if args.shots else await default_shots(pg)
        out = {}
        for n in args.names or list(shots):
            await pg.apply(shots[n])
            ms = await pg.ev("%s.benchSync(40)" % pg.api)
            st = await pg.stats()
            out[n] = {"sync_ms": round(ms, 2), "calls": st["calls"], "triangles": st["triangles"], "buffer": st["buffer"]}
            print("%-16s sync %6.2f ms (~%5.1f fps ceiling) calls=%d tris=%d" % (n, ms, 1000 / ms, st["calls"], st["triangles"]))
        print("GPU:", (await pg.stats())["gpu"])
        pg.report_logs()
        if args.json:
            Path(args.json).parent.mkdir(parents=True, exist_ok=True)
            Path(args.json).write_text(json.dumps(out, indent=2))
        await pg.close()
        return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html", help="path to the showcase HTML page")
    ap.add_argument("names", nargs="*", help="subset of shot names")
    ap.add_argument("--root", help="directory to serve (default: the HTML's directory)")
    ap.add_argument("--api", default="__showcase", help="name of the window test API object")
    ap.add_argument("--size", default="1920x1080")
    ap.add_argument("--outdir", help="screenshot directory (default: <root>/shots)")
    ap.add_argument("--suffix", default="")
    ap.add_argument("--shots", help="JSON file with custom shot specs")
    ap.add_argument("--keys", action="store_true")
    ap.add_argument("--layout", action="store_true")
    ap.add_argument("--perf", action="store_true")
    ap.add_argument("--gpu", action="store_true")
    ap.add_argument("--seconds", type=float, default=6.0)
    ap.add_argument("--json")
    args = ap.parse_args()
    html = Path(args.html).resolve()
    if not html.exists():
        raise SystemExit("no such file: %s" % html)
    root = Path(args.root).resolve() if args.root else html.parent
    args.rel = html.relative_to(root).as_posix()
    args.outdir = args.outdir or str(root / "shots")
    args.size = tuple(int(v) for v in args.size.lower().split("x"))
    httpd, port = serve(root)
    try:
        fn = run_keys if args.keys else run_layout if args.layout else run_perf if args.perf else run_gpu if args.gpu else run_shots
        return asyncio.run(fn(args, port))
    finally:
        httpd.shutdown()


if __name__ == "__main__":
    sys.exit(main())
